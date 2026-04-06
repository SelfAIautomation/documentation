import * as fs from 'fs';
import * as path from 'path';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is required.');
  console.error('Get your key at: https://aistudio.google.com');
  console.error('Usage: GEMINI_API_KEY=xxx npx tsx scripts/generate-images.ts');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images');
const MODEL = 'gemini-2.0-flash-exp';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// ---- Load slide data ----
function loadSlides(): Array<{id: string; title: string; type: string; section: number; imagePrompt?: string}> {
  const scenesPath = path.join(__dirname, '..', 'src', 'data', 'scenes.ts');
  const content = fs.readFileSync(scenesPath, 'utf8');

  const slides: Array<{id: string; title: string; type: string; section: number; imagePrompt?: string}> = [];
  const regex = /id:\s*'([^']+)'[\s\S]*?type:\s*'([^']+)'[\s\S]*?section:\s*(\d+)[\s\S]*?title:\s*'([^']*(?:\\.[^']*)*)'/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    slides.push({
      id: match[1],
      type: match[2],
      section: parseInt(match[3]),
      title: match[4].replace(/\\n/g, ' '),
    });
  }

  // Extract imagePrompt fields using a separate pass
  const imagePromptRegex = /id:\s*'([^']+)'[\s\S]*?imagePrompt:\s*`([^`]+)`/g;
  let ipMatch;
  while ((ipMatch = imagePromptRegex.exec(content)) !== null) {
    const slide = slides.find((s) => s.id === ipMatch[1]);
    if (slide) {
      slide.imagePrompt = ipMatch[2].trim();
    }
  }

  return slides;
}

// ---- Section themes for image prompts ----
const SECTION_THEMES: Record<number, string> = {
  0: 'futuristic AI workspace with holographic displays and neural networks',
  1: 'layered document architecture with glowing markdown files in a hierarchy',
  2: 'blueprint-style technical design with code annotations and guidelines',
  3: 'modular skill blocks connecting like puzzle pieces in a digital space',
  4: 'automated pipeline with hooks and quality gates, assembly line aesthetic',
  5: 'React components as film frames, video rendering with frame-by-frame animation',
  6: 'multiple AI agents collaborating in a network, team orchestration visualization',
  7: 'information flow diagram with write, isolate, select, compress stages',
  8: 'shield and verification checkmarks, AI reliability and trust system',
  9: 'human and AI hands shaking, future of collaborative development',
};

function buildPrompt(slide: {id: string; title: string; type: string; section: number; imagePrompt?: string}): string {
  const BASE_STYLE =
    'Style: dark gradient background (deep navy/slate), subtle and elegant, no text, no UI elements, suitable as a background for overlaid text. 16:9 aspect ratio, 1920x1080 resolution. Modern, clean, minimalist design.';

  if (slide.imagePrompt) {
    return `Generate a professional presentation slide background image. Theme: ${slide.imagePrompt}. ${BASE_STYLE}`;
  }

  const theme = SECTION_THEMES[slide.section] || 'abstract technology background';
  return `Generate a professional presentation slide background image. Theme: ${theme}. ${BASE_STYLE}`;
}

// ---- Generate image via Gemini API ----
async function generateImage(prompt: string): Promise<Buffer | null> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        contents: [{parts: [{text: prompt}]}],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  API error: ${response.status} ${error.substring(0, 200)}`);
      return null;
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return Buffer.from(part.inlineData.data, 'base64');
      }
    }
    console.error('  No image in response');
    return null;
  } catch (error: any) {
    console.error(`  Error: ${error.message}`);
    return null;
  }
}

// ---- Main ----
async function main() {
  console.log('=== Gemini Image Generator ===');
  console.log(`Model: ${MODEL}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  fs.mkdirSync(OUTPUT_DIR, {recursive: true});

  const slides = loadSlides();
  console.log(`Found ${slides.length} slides\n`);

  // Only generate for specific slide (--slide <id>) or all
  const slideArg = process.argv.indexOf('--slide');
  const targetSlide = slideArg !== -1 ? process.argv[slideArg + 1] : null;

  for (const slide of slides) {
    if (targetSlide && slide.id !== targetSlide) continue;

    const outputPath = path.join(OUTPUT_DIR, `${slide.id}.png`);

    if (fs.existsSync(outputPath) && !process.argv.includes('--force')) {
      console.log(`[skip] ${slide.id}.png already exists`);
      continue;
    }

    const prompt = buildPrompt(slide);
    console.log(`[gen] ${slide.id} (section ${slide.section})`);
    console.log(`  Prompt: ${prompt.substring(0, 80)}...`);

    const imageBuffer = await generateImage(prompt);
    if (imageBuffer) {
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`  [done] ${slide.id}.png (${(imageBuffer.length / 1024).toFixed(0)} KB)\n`);
    } else {
      console.log(`  [failed] ${slide.id}\n`);
    }

    // Rate limit: wait 2s between requests
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log('=== Done! ===');
  console.log('Review images in: ' + OUTPUT_DIR);
  console.log('Then run: npm run step:3-audio');
}

main().catch(console.error);
