/**
 * notify-discord.ts
 *
 * Sends slide images (and metadata) to a Discord channel via webhook for human review.
 * After posting, saves message IDs to .discord-review.json for check-discord.ts to read.
 *
 * Required env:
 *   DISCORD_WEBHOOK_URL  - Discord webhook URL (from Server Settings > Integrations)
 *
 * Optional env:
 *   DISCORD_NOTIFY_DELAY_MS - ms to wait between posts (default: 1500, min 1000 for rate limit)
 *
 * Usage:
 *   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... npx tsx scripts/notify-discord.ts
 *   DISCORD_WEBHOOK_URL=... npx tsx scripts/notify-discord.ts --only-missing
 *   DISCORD_WEBHOOK_URL=... npx tsx scripts/notify-discord.ts --slide sec1-header
 */

import * as fs from 'fs';
import * as path from 'path';

// ---- Config ----
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
if (!WEBHOOK_URL) {
  console.error('Error: DISCORD_WEBHOOK_URL environment variable is required.');
  console.error('Get it from: Discord Server Settings > Integrations > Webhooks');
  console.error('Usage: DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... npx tsx scripts/notify-discord.ts');
  process.exit(1);
}

const DELAY_MS = parseInt(process.env.DISCORD_NOTIFY_DELAY_MS || '1500', 10);
const IMAGE_DIR = path.join(__dirname, '..', 'public', 'images');
const STATE_FILE = path.join(__dirname, '..', '.discord-review.json');
const SCENES_PATH = path.join(__dirname, '..', 'src', 'data', 'scenes.ts');

// ---- Argument parsing ----
const onlyMissing = process.argv.includes('--only-missing');
const slideArg = process.argv.indexOf('--slide');
const targetSlide = slideArg !== -1 ? process.argv[slideArg + 1] : null;

// ---- Parse scenes.ts ----
interface SlideInfo {
  id: string;
  type: string;
  section: number;
  title: string;
  narrationPreview: string;
}

function loadSlides(): SlideInfo[] {
  const content = fs.readFileSync(SCENES_PATH, 'utf8');
  const slides: SlideInfo[] = [];

  const slideRegex =
    /id:\s*'([^']+)'[\s\S]*?type:\s*'([^']+)'[\s\S]*?section:\s*(\d+)[\s\S]*?title:\s*'([^']*(?:\\.[^']*)*)'/g;
  let match;
  while ((match = slideRegex.exec(content)) !== null) {
    slides.push({
      id: match[1],
      type: match[2],
      section: parseInt(match[3]),
      title: match[4].replace(/\\n/g, ' '),
      narrationPreview: '',
    });
  }

  // Extract first narration line per slide
  const narrationRegex =
    /id:\s*'([^']+)'[\s\S]*?narration:\s*\[[\s\S]*?\{speaker:\s*'([AB])',\s*text:\s*'([^']*(?:\\.[^']*)*)'\}/g;
  while ((match = narrationRegex.exec(content)) !== null) {
    const slide = slides.find((s) => s.id === match[1]);
    if (slide && !slide.narrationPreview) {
      slide.narrationPreview = match[3].substring(0, 120);
    }
  }

  return slides;
}

// ---- Section colors for Discord embeds ----
const SECTION_COLORS: Record<number, number> = {
  0: 0x3b82f6,
  1: 0x3b82f6,
  2: 0x8b5cf6,
  3: 0x10b981,
  4: 0xf59e0b,
  5: 0xef4444,
  6: 0x06b6d4,
  7: 0xa855f7,
  8: 0xec4899,
  9: 0x3b82f6,
};

// ---- Post one slide to Discord ----
async function postSlide(
  slide: SlideInfo,
  index: number,
  total: number,
): Promise<{messageId: string; channelId: string} | null> {
  const imagePath = path.join(IMAGE_DIR, `${slide.id}.png`);
  const hasImage = fs.existsSync(imagePath);

  const embed = {
    title: `[${index + 1}/${total}] ${slide.title}`,
    description:
      `**ID**: \`${slide.id}\`\n` +
      `**Type**: ${slide.type} | **Section**: ${slide.section}\n\n` +
      (slide.narrationPreview ? `*${slide.narrationPreview}${slide.narrationPreview.length >= 120 ? '…' : ''}*` : ''),
    color: SECTION_COLORS[slide.section] ?? 0x3b82f6,
    footer: {
      text: '✅ = OK　❌ = 修正が必要　📝 = コメントをスレッドに書く',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    let response: Response;

    if (hasImage) {
      const imageData = fs.readFileSync(imagePath);
      const formData = new FormData();
      formData.append(
        'payload_json',
        JSON.stringify({
          content: `**スライド ${index + 1}/${total}**: \`${slide.id}\`\n> ✅ でOK　❌ で修正必要　をリアクションしてください`,
          embeds: [embed],
        }),
      );
      formData.append(
        'files[0]',
        new Blob([imageData], {type: 'image/png'}),
        `${slide.id}.png`,
      );
      response = await fetch(`${WEBHOOK_URL}?wait=true`, {
        method: 'POST',
        body: formData,
      });
    } else {
      // No image: post text-only
      response = await fetch(`${WEBHOOK_URL}?wait=true`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          content: `**スライド ${index + 1}/${total}**: \`${slide.id}\`  *(画像なし)*\n> ✅ でOK　❌ で修正必要　をリアクションしてください`,
          embeds: [embed],
        }),
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(`  [error] HTTP ${response.status}: ${errText.substring(0, 200)}`);
      return null;
    }

    const msg = await response.json() as {id: string; channel_id: string};
    return {messageId: msg.id, channelId: msg.channel_id};
  } catch (err: any) {
    console.error(`  [error] ${err.message}`);
    return null;
  }
}

// ---- Main ----
async function main() {
  console.log('=== Discord Slide Review Notifier ===\n');

  const slides = loadSlides();
  console.log(`Loaded ${slides.length} slides from scenes.ts`);

  // Load existing state (to support --only-missing)
  let state: Record<string, {messageId: string; channelId: string; slideTitle: string}> = {};
  if (fs.existsSync(STATE_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      console.log(`Existing review state: ${Object.keys(state).length} slides already posted\n`);
    } catch {
      state = {};
    }
  }

  // Filter slides
  let toPost = slides;
  if (targetSlide) {
    toPost = slides.filter((s) => s.id === targetSlide);
    if (toPost.length === 0) {
      console.error(`Slide not found: ${targetSlide}`);
      process.exit(1);
    }
  } else if (onlyMissing) {
    toPost = slides.filter((s) => !state[s.id]);
    console.log(`Posting ${toPost.length} slides not yet in Discord\n`);
  }

  let posted = 0;
  let failed = 0;

  for (let i = 0; i < toPost.length; i++) {
    const slide = toPost[i];
    const globalIndex = slides.indexOf(slide);
    const hasImage = fs.existsSync(path.join(IMAGE_DIR, `${slide.id}.png`));

    console.log(`[${i + 1}/${toPost.length}] ${slide.id} (${slide.type})${hasImage ? '' : ' [no image]'}`);

    const result = await postSlide(slide, globalIndex, slides.length);
    if (result) {
      state[slide.id] = {
        messageId: result.messageId,
        channelId: result.channelId,
        slideTitle: slide.title,
      };
      posted++;
      console.log(`  [sent] message ${result.messageId}`);
      // Save state after each successful post
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } else {
      failed++;
    }

    // Rate limit: wait between requests
    if (i < toPost.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Posted: ${posted} | Failed: ${failed}`);
  console.log(`State saved to: ${STATE_FILE}`);
  console.log('\nNext steps:');
  console.log('  1. Go to Discord and react to each slide with ✅ (OK) or ❌ (needs revision)');
  console.log('  2. Run: DISCORD_BOT_TOKEN=... npx tsx scripts/check-discord.ts');
}

main().catch(console.error);
