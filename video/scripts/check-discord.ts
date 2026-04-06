/**
 * check-discord.ts
 *
 * Reads Discord reactions on slide review messages and outputs approval status.
 * ✅ reaction = slide approved (OK)
 * ❌ reaction = slide needs revision
 *
 * Required env:
 *   DISCORD_BOT_TOKEN  - Discord bot token with VIEW_CHANNEL + READ_MESSAGE_HISTORY permissions
 *
 * Reads:  .discord-review.json  (created by notify-discord.ts)
 * Writes: .discord-approved.json (list of approved/rejected slide IDs)
 *
 * Usage:
 *   DISCORD_BOT_TOKEN=Bot xxx npx tsx scripts/check-discord.ts
 *   DISCORD_BOT_TOKEN=Bot xxx npx tsx scripts/check-discord.ts --interactive
 *
 * If --interactive is passed, it prompts you to mark slides manually
 * (useful if you don't have a bot token).
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ---- Config ----
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const STATE_FILE = path.join(__dirname, '..', '.discord-review.json');
const RESULT_FILE = path.join(__dirname, '..', '.discord-approved.json');
const DISCORD_API = 'https://discord.com/api/v10';

const interactive = process.argv.includes('--interactive');

// ---- Discord API helpers ----
async function getReactions(
  channelId: string,
  messageId: string,
  emoji: string,
): Promise<number> {
  const url = `${DISCORD_API}/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}?limit=25`;
  const response = await fetch(url, {
    headers: {Authorization: `Bot ${BOT_TOKEN}`},
  });
  if (response.status === 404) return 0;
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Discord API error ${response.status}: ${err.substring(0, 200)}`);
  }
  const users = await response.json() as unknown[];
  // Subtract 1 if the bot itself reacted (not applicable here since we use webhook)
  return users.length;
}

// ---- Interactive mode ----
function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function interactiveReview(
  state: Record<string, {messageId: string; channelId: string; slideTitle: string}>,
): Promise<{approved: string[]; rejected: string[]; pending: string[]}> {
  const rl = readline.createInterface({input: process.stdin, output: process.stdout});

  console.log('\n=== Interactive Review Mode ===');
  console.log('For each slide, enter:  o = OK (approve)  n = needs revision  s = skip\n');

  const approved: string[] = [];
  const rejected: string[] = [];
  const pending: string[] = [];

  for (const [slideId, info] of Object.entries(state)) {
    const answer = await prompt(rl, `[${slideId}] "${info.slideTitle}" > `);
    const ch = answer.trim().toLowerCase();
    if (ch === 'o' || ch === 'ok' || ch === 'y') {
      approved.push(slideId);
      console.log('  → Approved ✅');
    } else if (ch === 'n' || ch === 'ng') {
      rejected.push(slideId);
      console.log('  → Needs revision ❌');
    } else {
      pending.push(slideId);
      console.log('  → Skipped (pending)');
    }
  }

  rl.close();
  return {approved, rejected, pending};
}

// ---- Bot-based review ----
async function botReview(
  state: Record<string, {messageId: string; channelId: string; slideTitle: string}>,
): Promise<{approved: string[]; rejected: string[]; pending: string[]}> {
  const approved: string[] = [];
  const rejected: string[] = [];
  const pending: string[] = [];

  const entries = Object.entries(state);
  console.log(`Checking reactions on ${entries.length} messages...\n`);

  for (const [slideId, info] of entries) {
    process.stdout.write(`  ${slideId}... `);
    try {
      const okCount = await getReactions(info.channelId, info.messageId, '✅');
      const ngCount = await getReactions(info.channelId, info.messageId, '❌');

      if (okCount > 0 && ngCount === 0) {
        approved.push(slideId);
        console.log(`✅ OK (${okCount} reaction${okCount > 1 ? 's' : ''})`);
      } else if (ngCount > 0) {
        rejected.push(slideId);
        console.log(`❌ Needs revision (✅:${okCount} ❌:${ngCount})`);
      } else {
        pending.push(slideId);
        console.log(`⏳ No reaction yet`);
      }

      // Rate limit: 50 req/s per bot
      await new Promise((r) => setTimeout(r, 100));
    } catch (err: any) {
      console.log(`[error] ${err.message}`);
      pending.push(slideId);
    }
  }

  return {approved, rejected, pending};
}

// ---- Main ----
async function main() {
  console.log('=== Discord Review Checker ===\n');

  if (!fs.existsSync(STATE_FILE)) {
    console.error(`State file not found: ${STATE_FILE}`);
    console.error('Run notify-discord.ts first to post slides to Discord.');
    process.exit(1);
  }

  const state = JSON.parse(
    fs.readFileSync(STATE_FILE, 'utf8'),
  ) as Record<string, {messageId: string; channelId: string; slideTitle: string}>;

  console.log(`Found ${Object.keys(state).length} slides in review state\n`);

  let result: {approved: string[]; rejected: string[]; pending: string[]};

  if (interactive || !BOT_TOKEN) {
    if (!interactive) {
      console.log('DISCORD_BOT_TOKEN not set — falling back to interactive mode.');
      console.log('To use bot token: DISCORD_BOT_TOKEN="Bot xxx" npx tsx scripts/check-discord.ts\n');
    }
    result = await interactiveReview(state);
  } else {
    result = await botReview(state);
  }

  // ---- Summary ----
  console.log('\n=== Review Summary ===');
  console.log(`✅ Approved  : ${result.approved.length} slides`);
  if (result.approved.length > 0) {
    result.approved.forEach((id) => console.log(`   - ${id}`));
  }
  console.log(`❌ Needs fix : ${result.rejected.length} slides`);
  if (result.rejected.length > 0) {
    result.rejected.forEach((id) => console.log(`   - ${id}`));
  }
  console.log(`⏳ Pending   : ${result.pending.length} slides`);
  if (result.pending.length > 0) {
    result.pending.forEach((id) => console.log(`   - ${id}`));
  }

  // ---- Save result ----
  fs.writeFileSync(RESULT_FILE, JSON.stringify(result, null, 2));
  console.log(`\nResult saved to: ${RESULT_FILE}`);

  // ---- Next steps ----
  if (result.rejected.length > 0) {
    console.log('\n=== Action Required ===');
    console.log('The following slides need revision in video/src/data/scenes.ts:');
    result.rejected.forEach((id) => {
      const info = state[id];
      console.log(`  ❌ ${id}: "${info?.slideTitle ?? ''}"`);
    });
    console.log('\nAfter editing, re-generate images and re-check:');
    console.log('  npm run step:2-images');
    console.log('  DISCORD_WEBHOOK_URL=... npx tsx scripts/notify-discord.ts --only-missing');
    console.log('  DISCORD_BOT_TOKEN=... npx tsx scripts/check-discord.ts');
  } else if (result.pending.length === 0) {
    console.log('\nAll slides approved! You can proceed to audio generation:');
    console.log('  npm run step:3-audio');
  } else {
    console.log('\nSome slides are still pending review. Re-run this script after reacting in Discord.');
  }
}

main().catch(console.error);
