#!/usr/bin/env node
// Re-test badge + city with tighter prompts to better match reference sheets.

import fs from 'node:fs';
import path from 'node:path';

const API_KEY = process.env.PIXELLAB_API_KEY || '8a33c429-1ea4-489b-aa2d-0587bbfdd885';
const BASE = 'https://api.pixellab.ai/v2';
const OUT_DIR = 'ai-battlerap/public/sprites/samples/style-match-test';

function getPngDimensions(buf) {
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
function loadStyle(p) {
  const buf = fs.readFileSync(p);
  return {
    image: { type: 'base64', base64: buf.toString('base64'), format: 'png' },
    size: getPngDimensions(buf) ?? { width: 2752, height: 1536 },
  };
}

const TESTS = [
  {
    // Tighter: explicit "single circular sticker icon, small subject area, thick outline ring"
    type: 'badge-v2',
    description:
      'single small circular sticker icon centered on canvas, thick black outline ring, simple bold symbol of an angry shouting face with shouting lines, flat vibrant pixel art, label text below reading TRASH TALK, sticker badge tile',
    width: 512,
    height: 512,
    no_background: true,
    styleRef: 'raw images/badges/image_1764193675435.png',
  },
  {
    // Tighter: moodier, painterly, atmospheric to match venue sheet vibe
    type: 'city-background-v2',
    description:
      'moody atmospheric battle rap venue exterior at night, painterly pixel art scene, dramatic lighting, gritty urban alley, brick warehouse with neon RAP BATTLE sign, fog, cinematic wide shot',
    width: 640,
    height: 360,
    no_background: false,
    styleRef: 'raw images/venue/image_1764378969538.png',
  },
];

async function runJob(test) {
  const start = Date.now();
  const style = loadStyle(test.styleRef);
  const body = {
    description: test.description,
    image_size: { width: test.width, height: test.height },
    no_background: test.no_background,
    style_image: style,
    style_options: { color_palette: true, outline: true, detail: true, shading: true },
  };
  const res = await fetch(`${BASE}/generate-image-v2`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { ...test, ok: false, error: `HTTP ${res.status}` };
  const data = await res.json();
  const jobId = data.job_id ?? data.id ?? data.background_job_id;
  if (!jobId) return { ...test, ok: false, error: 'no job id' };

  for (let i = 0; i < 360; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const p = await fetch(`${BASE}/background-jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!p.ok) continue;
    const j = await p.json();
    if (j.status === 'completed') {
      const b64 = j.last_response?.images?.[0]?.base64;
      if (!b64) return { ...test, ok: false, error: 'no image' };
      const buf = Buffer.from(b64, 'base64');
      const outPath = path.join(OUT_DIR, `${test.type}.png`);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, buf);
      const dims = getPngDimensions(buf);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      return { ...test, ok: true, outPath, actualW: dims?.width, actualH: dims?.height, elapsed, bytes: buf.length };
    }
    if (j.status === 'failed') return { ...test, ok: false, error: 'job failed' };
  }
  return { ...test, ok: false, error: 'timeout' };
}

console.log(`Re-test: ${TESTS.length} parallel jobs with tightened prompts\n`);
const results = await Promise.all(TESTS.map(runJob));
console.log('');
for (const r of results) {
  if (r.ok) {
    console.log(`  ✓ ${r.type.padEnd(22)} ${r.actualW}x${r.actualH}  ${r.elapsed}s  → ${r.outPath}`);
  } else {
    console.log(`  ✗ ${r.type.padEnd(22)} ${r.error}`);
  }
}
process.exit(results.every((r) => r.ok) ? 0 : 1);
