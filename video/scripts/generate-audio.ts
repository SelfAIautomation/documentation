import {ElevenLabsClient} from 'elevenlabs';
import * as fs from 'fs';
import * as path from 'path';

// ---- Configuration ----
const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Error: ELEVENLABS_API_KEY environment variable is required.');
  console.error('Usage: ELEVENLABS_API_KEY=sk_xxx npx tsx scripts/generate-audio.ts');
  process.exit(1);
}

// Two voices for dialogue: Speaker A (narrator) and Speaker B (assistant)
// You can change these to any ElevenLabs voice IDs
const VOICE_A = process.env.VOICE_A || 'pNInz6obpgDQGcFmaJgB'; // Adam (default)
const VOICE_B = process.env.VOICE_B || 'EXAVITQu4vr4xnSDxMaL'; // Bella (default)

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');
const MODEL_ID = 'eleven_multilingual_v2'; // Japanese support

// ---- Load scenes data ----
async function loadScenes() {
  // Read and parse scenes.ts to extract narration data
  const scenesPath = path.join(__dirname, '..', 'src', 'data', 'scenes.ts');
  const content = fs.readFileSync(scenesPath, 'utf8');

  // Extract slide objects with narration
  const slides: Array<{
    id: string;
    narration: Array<{speaker: string; text: string}>;
  }> = [];

  // Parse each slide's id and narration using regex
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

// ---- Generate audio for a single slide ----
async function generateSlideAudio(
  client: ElevenLabsClient,
  slideId: string,
  narration: Array<{speaker: string; text: string}>,
) {
  const outputPath = path.join(OUTPUT_DIR, `${slideId}.mp3`);

  // Skip if already exists (use --force to regenerate)
  if (fs.existsSync(outputPath) && !process.argv.includes('--force')) {
    console.log(`  [skip] ${slideId}.mp3 already exists`);
    return;
  }

  // Combine all narration lines into one text per slide
  // with speaker markers for natural flow
  const fullText = narration.map((line) => line.text).join(' ');

  // Use the first speaker's voice (primary speaker for this slide)
  const primarySpeaker = narration[0].speaker;
  const voiceId = primarySpeaker === 'A' ? VOICE_A : VOICE_B;

  try {
    const audio = await client.textToSpeech.convert(voiceId, {
      text: fullText,
      model_id: MODEL_ID,
      output_format: 'mp3_44100_128',
    });

    // Collect audio chunks
    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    fs.writeFileSync(outputPath, buffer);
    console.log(
      `  [done] ${slideId}.mp3 (${(buffer.length / 1024).toFixed(0)} KB)`,
    );
  } catch (error: any) {
    console.error(`  [error] ${slideId}: ${error.message}`);
  }
}

// ---- Main ----
async function main() {
  console.log('=== ElevenLabs Audio Generator ===');
  console.log(`Voice A (narrator): ${VOICE_A}`);
  console.log(`Voice B (assistant): ${VOICE_B}`);
  console.log(`Model: ${MODEL_ID}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, {recursive: true});

  const client = new ElevenLabsClient({apiKey: API_KEY});

  // List available voices if --list-voices flag
  if (process.argv.includes('--list-voices')) {
    console.log('Available voices:');
    const voices = await client.voices.getAll();
    for (const voice of voices.voices) {
      console.log(`  ${voice.voice_id} - ${voice.name}`);
    }
    return;
  }

  const slides = await loadScenes();
  console.log(`Found ${slides.length} slides with narration\n`);

  // Generate sequentially to avoid rate limits
  for (const slide of slides) {
    console.log(`Processing: ${slide.id}`);
    await generateSlideAudio(client, slide.id, slide.narration);

    // Small delay between requests to be respectful of rate limits
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('\n=== Done! ===');
  console.log(
    `Generated audio files in: ${OUTPUT_DIR}`,
  );
  console.log(
    'Next: npx remotion render src/index.ts MainVideo out/video.mp4',
  );
}

main().catch(console.error);
