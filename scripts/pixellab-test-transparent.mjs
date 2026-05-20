#!/usr/bin/env node
// Quick test: generate a single crowd reaction at 256x256 with no_background:true
// to confirm transparent output works (no chroma green removal needed).

import fs from 'node:fs';
import path from 'node:path';

const API_KEY = process.env.PIXELLAB_API_KEY || '8a33c429-1ea4-489b-aa2d-0587bbfdd885';
const BASE = 'https://api.pixellab.ai/v2';
const STYLE_REF = 'raw images/crowd/image_1764197014144.png';
const OUT = 'ai-battlerap/public/sprites/samples/crowd-transparent-test.png';

function getPngDimensions(buf) {
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const styleBuf = fs.readFileSync(STYLE_REF);
const styleDims = getPngDimensions(styleBuf);

const body = {
  description:
    'battle rap crowd member portrait, cheering hype reaction, both arms up, mouth wide open yelling, urban hip-hop diversity, pixel art bust',
  image_size: { width: 256, height: 256 },
  no_background: true, // NEW
  style_image: {
    image: { type: 'base64', base64: styleBuf.toString('base64'), format: 'png' },
    size: styleDims,
  },
  style_options: { color_palette: true, outline: true, detail: true, shading: true },
};

console.log('Submitting transparent-bg crowd test (256x256)...');
const start = Date.now();

const res = await fetch(`${BASE}/generate-image-v2`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
if (!res.ok) {
  console.error(`HTTP ${res.status}:`, (await res.text()).slice(0, 400));
  process.exit(1);
}
const data = await res.json();
const jobId = data.job_id ?? data.id ?? data.background_job_id;
if (!jobId) {
  console.error('No job id:', JSON.stringify(data).slice(0, 400));
  process.exit(1);
}
console.log(`Job ${jobId}, polling...`);

let b64 = null;
for (let i = 0; i < 90; i++) {
  await new Promise((r) => setTimeout(r, 2000));
  const p = await fetch(`${BASE}/background-jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!p.ok) continue;
  const j = await p.json();
  process.stdout.write('.');
  if (j.status === 'completed') {
    b64 = j.last_response?.images?.[0]?.base64 ?? null;
    break;
  }
  if (j.status === 'failed') {
    console.error('\nfailed:', JSON.stringify(j).slice(0, 400));
    process.exit(1);
  }
}
console.log('');
if (!b64) {
  console.error('no image in result');
  process.exit(1);
}
const buf = Buffer.from(b64, 'base64');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, buf);
const dims = getPngDimensions(buf);
console.log(`Saved ${OUT} (${buf.length} bytes, ${dims?.width}x${dims?.height}) in ${((Date.now() - start) / 1000).toFixed(1)}s`);
