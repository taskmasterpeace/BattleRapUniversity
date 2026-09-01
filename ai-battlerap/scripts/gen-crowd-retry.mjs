#!/usr/bin/env node
// Patient resubmitter for gen-crowd-thin-moods.mjs: the account allows 8
// concurrent renders, so push the remaining WAVE through slowly — retry 429s
// every 30s until every body is submitted, then poll all to completion and
// stamp results into the manifest.
import fs from 'node:fs';
import path from 'node:path';

const API_KEY = process.env.PIXELLAB_API_KEY || '8a33c429-1ea4-489b-aa2d-0587bbfdd885';
const BASE = 'https://api.pixellab.ai/v2';
const STYLE_REF = path.resolve(import.meta.dirname, '../../raw images/crowd/image_1764197014144.png');
const MANIFEST = path.resolve(import.meta.dirname, '../.crowd-thin-jobs.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
const styleBuf = fs.readFileSync(STYLE_REF);
const styleImage = {
  image: { type: 'base64', base64: styleBuf.toString('base64'), format: 'png' },
  size: pngSize(styleBuf),
};

async function submit(item) {
  const description = `zoomed-out pixel art of ONE battle rap crowd member from the waist up, whole head fully visible with empty space above it, torso and both arms in frame, ${item.desc}, hard black outlines, vibrant colors, flat bright green chroma key background, no text, no purple clothing`;
  const res = await fetch(`${BASE}/generate-image-v2`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description,
      image_size: { width: 224, height: 256 },
      style_image: styleImage,
      style_options: { color_palette: true, outline: true, detail: true, shading: true },
    }),
  });
  if (res.status === 429) return { retry: true };
  if (!res.ok) return { error: `HTTP ${res.status}: ${(await res.text()).slice(0, 160)}` };
  const data = await res.json();
  const jobId = data.job_id ?? data.id ?? data.background_job_id;
  return jobId ? { jobId } : { error: 'no job id' };
}

// Phase 1: push every unsubmitted body through, 2 at a time, 30s between tries.
for (let pass = 0; pass < 60; pass++) {
  const pending = manifest.filter((m) => !m.jobId && !m.gaveUp);
  if (pending.length === 0) break;
  for (const item of pending.slice(0, 2)) {
    const r = await submit(item);
    if (r.jobId) {
      item.jobId = r.jobId;
      delete item.error;
      console.log(`submitted ${item.file} -> ${r.jobId}`);
    } else if (r.error) {
      item.error = r.error;
      item.gaveUp = true;
      console.log(`GAVE UP ${item.file}: ${r.error}`);
    } // 429 -> stay pending
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  if (manifest.some((m) => !m.jobId && !m.gaveUp)) await new Promise((r) => setTimeout(r, 30000));
}

// Phase 2: wait for every submitted job to finish (results downloaded by the installer).
async function status(jobId) {
  const res = await fetch(`${BASE}/background-jobs/${jobId}`, { headers: { Authorization: `Bearer ${API_KEY}` } });
  if (!res.ok) return 'poll-error';
  return (await res.json()).status;
}
for (let i = 0; i < 120; i++) {
  const states = await Promise.all(manifest.filter((m) => m.jobId).map(async (m) => ({ m, s: await status(m.jobId) })));
  for (const { m, s } of states) m.status = s;
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  const open = states.filter(({ s }) => s !== 'completed' && s !== 'failed' && s !== 'error').length;
  console.log(`jobs still rendering: ${open}`);
  if (open === 0) break;
  await new Promise((r) => setTimeout(r, 20000));
}
const done = manifest.filter((m) => m.status === 'completed').length;
console.log(`DONE: ${done}/${manifest.length} completed — run install-crowd-thin-moods next`);
