#!/usr/bin/env node
// PixelLab v2 generator with style-reference matching.
// Uses /generate-with-style-v2 to match the look of existing sprites.
// Usage: node scripts/pixellab-gen.mjs "<description>" <out-path> [width] [height] [style-ref-path]

import fs from 'node:fs';
import path from 'node:path';

const API_KEY = process.env.PIXELLAB_API_KEY || '8a33c429-1ea4-489b-aa2d-0587bbfdd885';
const BASE = 'https://api.pixellab.ai/v2';

const [,, description, outPath, widthArg, heightArg, styleRefPath] = process.argv;
if (!description || !outPath) {
  console.error('Usage: node pixellab-gen.mjs "<description>" <out-path> [width=64] [height=64] [style-ref-path]');
  process.exit(1);
}
const width = parseInt(widthArg ?? '64', 10);
const height = parseInt(heightArg ?? '64', 10);

function getPngDimensions(buf) {
  // PNG IHDR: bytes 16-19 width, 20-23 height (big-endian)
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { width: w, height: h };
}

function loadStyleImage(p) {
  if (!p) return null;
  const buf = fs.readFileSync(p);
  const ext = path.extname(p).slice(1).toLowerCase();
  const format = ext === 'jpg' ? 'jpeg' : ext;
  const dims = getPngDimensions(buf) ?? { width: 256, height: 256 };
  return {
    image: { type: 'base64', base64: buf.toString('base64'), format },
    size: dims,
  };
}

function safeError(text) {
  // Strip base64 payloads from error logs (anything > 200 char alphanumeric chunk)
  return text.replace(/"base64":"[^"]+"/g, '"base64":"<stripped>"');
}

const styleImage = loadStyleImage(styleRefPath);

const useStyleEndpoint = !!styleImage;
const endpoint = useStyleEndpoint ? '/generate-image-v2' : '/create-image-pixflux';
const body = useStyleEndpoint
  ? {
      description,
      image_size: { width, height },
      style_image: styleImage,
      style_options: {
        color_palette: true,
        outline: true,
        detail: true,
        shading: true,
      },
    }
  : {
      description,
      image_size: { width, height },
      text_guidance_scale: 8,
      outline: 'single color black outline',
      shading: 'basic shading',
      detail: 'low detail',
      no_background: false,
    };

console.log(`[${endpoint}] ${width}x${height}: ${description.slice(0, 70)}...`);
const start = Date.now();

const res = await fetch(`${BASE}${endpoint}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error(`HTTP ${res.status}: ${safeError(await res.text())}`);
  process.exit(1);
}

const data = await res.json();

// Sync path (pixflux returns base64 directly)
if (data.image?.base64) {
  const buf = Buffer.from(data.image.base64, 'base64');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
  const seconds = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Saved ${outPath} (${buf.length} bytes) in ${seconds}s [sync]`);
  process.exit(0);
}

// Async path: poll background job
const jobId = data.job_id ?? data.id ?? data.background_job_id;
if (!jobId) {
  console.error('No job_id and no inline image:', JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log(`Polling job ${jobId}...`);
let result = null;
for (let i = 0; i < 180; i++) {
  await new Promise(r => setTimeout(r, 2000));
  const poll = await fetch(`${BASE}/background-jobs/${jobId}`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
  });
  if (!poll.ok) {
    console.error(`Poll HTTP ${poll.status}: ${await poll.text()}`);
    continue;
  }
  const job = await poll.json();
  const status = job.status ?? job.state;
  process.stdout.write(`.`);
  if (status === 'completed' || status === 'succeeded' || status === 'done') {
    result = job;
    break;
  }
  if (status === 'failed' || status === 'error') {
    console.error(`\nJob failed: ${JSON.stringify(job, null, 2)}`);
    process.exit(1);
  }
}
console.log('');

if (!result) {
  console.error('Timed out polling job');
  process.exit(1);
}

// Result image: try many paths (PixelLab v2 returns last_response.images[0].base64)
const b64 =
  result.last_response?.images?.[0]?.base64 ??
  result.last_response?.image?.base64 ??
  result.images?.[0]?.base64 ??
  result.image?.base64 ??
  result.result?.image?.base64 ??
  result.data?.image?.base64 ??
  result.output?.image?.base64;

if (!b64) {
  console.error('Result has no image:', JSON.stringify(result, null, 2).slice(0, 1500));
  process.exit(1);
}

const buf = Buffer.from(b64, 'base64');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buf);
const seconds = ((Date.now() - start) / 1000).toFixed(1);
console.log(`Saved ${outPath} (${buf.length} bytes) in ${seconds}s [async]`);
