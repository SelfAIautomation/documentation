import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

// ---- Configuration ----
const COEIROINK_URL = process.env.COEIROINK_URL || 'http://localhost:50032';

// Speaker A (解説者) and Speaker B (アシスタント)
// Run with --list-speakers to see available speakers and their UUIDs
// Then set these environment variables to your preferred speakers
const SPEAKER_A_UUID =
  process.env.SPEAKER_A_UUID || '3c37646f-3881-5374-2a83-149267990abc'; // つくよみちゃん
const SPEAKER_A_STYLE = parseInt(process.env.SPEAKER_A_STYLE || '0', 10);
const SPEAKER_B_UUID =
  process.env.SPEAKER_B_UUID || '3c37646f-3881-5374-2a83-149267990abc'; // つくよみちゃん (別スタイル)
const SPEAKER_B_STYLE = parseInt(process.env.SPEAKER_B_STYLE || '6', 10);

const SPEED_SCALE = parseFloat(process.env.SPEED_SCALE || '1.0');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');

// ---- HTTP helpers ----
function httpGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function httpPost(url: string, body: object): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const jsonBody = JSON.stringify(body);
    const urlObj = new URL(url);
    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(jsonBody),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      },
    );
    req.on('error', reject);
    req.write(jsonBody);
    req.end();
  });
}

// ---- Load scenes data ----
function loadScenes() {
  const scenesPath = path.join(__dirname, '..', 'src', 'data', 'scenes.ts');
  const content = fs.readFileSync(scenesPath, 'utf8');

  const slides: Array<{
    id: string;
    narration: Array<{speaker: string; text: string}>;
  }> = [];

  const slideRegex =
    /id:\s*'([^']+)'[\s\S]*?narration:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
  let match;
  while ((match = slideRegex.exec(content)) !== null) {
    const id = match[1];
    const narrationBlock = match[2];
    const lines: Array<{speaker: string; text: string}> = [];

    const lineRegex =
      /\{speaker:\s*'([AB])',\s*text:\s*'([^']*(?:\\.[^']*)*)'\}/g;
    let lineMatch;
    while ((lineMatch = lineRegex.exec(narrationBlock)) !== null) {
      lines.push({speaker: lineMatch[1], text: lineMatch[2]});
    }

    if (lines.length > 0) {
      slides.push({id, narration: lines});
    }
  }

  return slides;
}

// ---- Synthesize one line with COEIROINK ----
async function synthesizeLine(
  speaker: string,
  text: string,
): Promise<Buffer> {
  const speakerUuid = speaker === 'A' ? SPEAKER_A_UUID : SPEAKER_B_UUID;
  const styleId = speaker === 'A' ? SPEAKER_A_STYLE : SPEAKER_B_STYLE;

  const body = {
    speakerUuid,
    styleId,
    text,
    speedScale: SPEED_SCALE,
    volumeScale: 1.0,
    pitchScale: 0.0,
    intonationScale: 1.0,
    prePhonemeLength: 0.1,
    postPhonemeLength: 0.2,
    outputSamplingRate: 44100,
  };

  return httpPost(`${COEIROINK_URL}/v1/synthesis`, body);
}

// ---- Concatenate WAV buffers ----
function concatWavBuffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) return Buffer.alloc(0);
  if (buffers.length === 1) return buffers[0];

  // WAV format: 44-byte header + PCM data
  // All buffers should have same sample rate, channels, bit depth
  const headerSize = 44;
  const pcmChunks = buffers.map((buf) => buf.subarray(headerSize));

  // Add 0.3s silence (44100Hz * 2bytes * 1ch * 0.3s = 26460 bytes) between lines
  const silenceBytes = Math.floor(44100 * 2 * 0.3);
  const silence = Buffer.alloc(silenceBytes, 0);

  const parts: Buffer[] = [];
  for (let i = 0; i < pcmChunks.length; i++) {
    parts.push(pcmChunks[i]);
    if (i < pcmChunks.length - 1) {
      parts.push(silence);
    }
  }
  const totalPcm = Buffer.concat(parts);

  // Build new WAV header
  const header = Buffer.from(buffers[0].subarray(0, headerSize));
  const fileSize = headerSize - 8 + totalPcm.length;
  header.writeUInt32LE(fileSize, 4); // RIFF chunk size
  header.writeUInt32LE(totalPcm.length, 40); // data chunk size

  return Buffer.concat([header, totalPcm]);
}

// ---- Generate audio for a single slide ----
async function generateSlideAudio(
  slideId: string,
  narration: Array<{speaker: string; text: string}>,
) {
  const outputPath = path.join(OUTPUT_DIR, `${slideId}.wav`);

  if (fs.existsSync(outputPath) && !process.argv.includes('--force')) {
    console.log(`  [skip] ${slideId}.wav already exists`);
    return;
  }

  try {
    // Generate each line separately for proper speaker switching
    const wavBuffers: Buffer[] = [];
    for (const line of narration) {
      console.log(`    [${line.speaker}] ${line.text.substring(0, 40)}...`);
      const wav = await synthesizeLine(line.speaker, line.text);
      wavBuffers.push(wav);
    }

    // Concatenate all lines with short silence between speakers
    const combined = concatWavBuffers(wavBuffers);
    fs.writeFileSync(outputPath, combined);

    const durationSec = (combined.length - 44) / (44100 * 2);
    console.log(
      `  [done] ${slideId}.wav (${(combined.length / 1024).toFixed(0)} KB, ${durationSec.toFixed(1)}s)`,
    );
  } catch (error: any) {
    console.error(`  [error] ${slideId}: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.error(
        '\n  COEIROINKが起動していません。先にCOEIROINKアプリを起動してください。',
      );
      process.exit(1);
    }
  }
}

// ---- List speakers ----
async function listSpeakers() {
  console.log('=== COEIROINK Available Speakers ===\n');
  const data = await httpGet(`${COEIROINK_URL}/v1/speakers`);
  const speakers = JSON.parse(data);
  for (const speaker of speakers) {
    console.log(`${speaker.speakerName} (UUID: ${speaker.speakerUuid})`);
    for (const style of speaker.styles) {
      console.log(`  Style ${style.styleId}: ${style.styleName}`);
    }
    console.log('');
  }
  console.log('Usage:');
  console.log(
    '  SPEAKER_A_UUID=<uuid> SPEAKER_A_STYLE=<id> SPEAKER_B_UUID=<uuid> SPEAKER_B_STYLE=<id> npx tsx scripts/generate-audio.ts',
  );
}

// ---- Main ----
async function main() {
  console.log('=== COEIROINK Audio Generator ===');
  console.log(`API: ${COEIROINK_URL}`);
  console.log(`Speaker A: ${SPEAKER_A_UUID} (style ${SPEAKER_A_STYLE})`);
  console.log(`Speaker B: ${SPEAKER_B_UUID} (style ${SPEAKER_B_STYLE})`);
  console.log(`Speed: ${SPEED_SCALE}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  fs.mkdirSync(OUTPUT_DIR, {recursive: true});

  if (process.argv.includes('--list-speakers')) {
    await listSpeakers();
    return;
  }

  // Check COEIROINK is running
  try {
    await httpGet(`${COEIROINK_URL}/v1/speakers`);
  } catch {
    console.error(
      'Error: COEIROINKに接続できません。COEIROINKアプリを起動してください。',
    );
    console.error(`URL: ${COEIROINK_URL}`);
    process.exit(1);
  }

  const slides = loadScenes();
  console.log(`Found ${slides.length} slides with narration\n`);

  for (const slide of slides) {
    console.log(`Processing: ${slide.id}`);
    await generateSlideAudio(slide.id, slide.narration);
  }

  console.log('\n=== Done! ===');
  console.log(`Generated audio files in: ${OUTPUT_DIR}`);
  console.log('Next: npm run render');
}

main().catch(console.error);
