#!/usr/bin/env node
// Generate a batch of crowd-reaction sprites using style reference.
// Fires all requests in parallel, polls each job until done.

import fs from 'node:fs';
import path from 'node:path';

const API_KEY = process.env.PIXELLAB_API_KEY || '8a33c429-1ea4-489b-aa2d-0587bbfdd885';
const BASE = 'https://api.pixellab.ai/v2';
const STYLE_REF = 'raw images/crowd/image_1764197014144.png';
const OUT_DIR = 'ai-battlerap/public/sprites/samples/crowd-styled';

const REACTIONS = [
  { name: 'shocked-hand-mouth', desc: 'shocked oh-shit reaction, hand to mouth, eyes wide, mouth open' },
  { name: 'cheering-hype', desc: 'cheering hype reaction, both arms up, mouth wide open yelling, excited' },
  { name: 'laughing-pointing', desc: 'laughing while pointing, head tilted back, big grin, mocking opponent' },
  { name: 'disappointed-headshake', desc: 'disappointed reaction, head shaking, hand on forehead, that was bad' },
  { name: 'cringing-face-palm', desc: 'cringing face palm, hand covering eyes, painful reaction, embarrassed for him' },
  { name: 'wow-impressed', desc: 'impressed wow face, raised eyebrows, mouth slightly open, that was hard' },
  { name: 'thinking-stroking-chin', desc: 'thinking hard, hand stroking chin, considering the bar, contemplative' },
  { name: 'clapping-respect', desc: 'clapping with respect, slow nodding clap, appreciative face' },
  { name: 'arguing-with-friend', desc: 'arguing with friend in crowd, pointing at them, animated debate about who won' },
  { name: 'filming-phone', desc: 'filming with phone held up, focused on the action, ready to post' },
];

function getPngDimensions(buf) {
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const styleBuf = fs.readFileSync(STYLE_REF);
const styleDims = getPngDimensions(styleBuf);
const styleImage = {
  image: { type: 'base64', base64: styleBuf.toString('base64'), format: 'png' },
  size: styleDims,
};

fs.mkdirSync(OUT_DIR, { recursive: true });

async function generate(reaction) {
  const description = `battle rap crowd member portrait, ${reaction.desc}, urban hip-hop diversity, vibrant colors, bright green chroma background, pixel art bust`;
  const res = await fetch(`${BASE}/generate-image-v2`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description,
      image_size: { width: 64, height: 64 },
      style_image: styleImage,
      style_options: { color_palette: true, outline: true, detail: true, shading: true },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    return { reaction, error: `HTTP ${res.status}: ${t.slice(0, 200)}` };
  }
  const data = await res.json();
  const jobId = data.job_id ?? data.id ?? data.background_job_id;
  if (!jobId) return { reaction, error: 'no job id' };
  return { reaction, jobId };
}

async function pollAndSave(reaction, jobId) {
  for (let i = 0; i < 180; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const poll = await fetch(`${BASE}/background-jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });
    if (!poll.ok) continue;
    const job = await poll.json();
    if (job.status === 'completed') {
      const b64 = job.last_response?.images?.[0]?.base64;
      if (!b64) return { reaction, error: 'no image in result' };
      const buf = Buffer.from(b64, 'base64');
      const out = path.join(OUT_DIR, `${reaction.name}.png`);
      fs.writeFileSync(out, buf);
      return { reaction, out, bytes: buf.length };
    }
    if (job.status === 'failed' || job.status === 'error') {
      return { reaction, error: `job failed: ${JSON.stringify(job).slice(0, 200)}` };
    }
  }
  return { reaction, error: 'timeout' };
}

console.log(`Submitting ${REACTIONS.length} jobs in parallel...`);
const submissions = await Promise.all(REACTIONS.map(generate));
const valid = submissions.filter(s => s.jobId);
const failed = submissions.filter(s => s.error);
console.log(`Submitted: ${valid.length}, failed at submit: ${failed.length}`);
failed.forEach(f => console.log(`  FAIL ${f.reaction.name}: ${f.error}`));

console.log('Polling all jobs...');
const results = await Promise.all(valid.map(s => pollAndSave(s.reaction, s.jobId)));
const ok = results.filter(r => r.out);
const bad = results.filter(r => r.error);
console.log(`\n=== Results ===`);
ok.forEach(r => console.log(`  OK   ${r.reaction.name} → ${r.out} (${r.bytes}b)`));
bad.forEach(r => console.log(`  FAIL ${r.reaction.name}: ${r.error}`));
console.log(`\nTotal: ${ok.length} saved, ${bad.length} failed`);
