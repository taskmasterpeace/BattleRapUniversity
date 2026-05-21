#!/usr/bin/env node
// Style-match test: generate one sample of each asset type using the canonical
// style references from CANVAS_SIZES.md. Runs all jobs in parallel.
// Output: ai-battlerap/public/sprites/samples/style-match-test/<type>.png

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

// One representative test per asset type from CANVAS_SIZES.md
const TESTS = [
  {
    type: 'battler',
    description:
      'battle rap battler portrait, mid-twenties male, intense focused expression, hoodie, fitted cap, urban hip-hop style, pixel art bust',
    width: 512,
    height: 512,
    no_background: true,
    styleRef: 'raw images/battlers/image_1764146494580.png',
  },
  {
    type: 'badge',
    description:
      'battle rap achievement badge icon, golden microphone with crown above it, dark navy background ring, pixel art emblem',
    width: 512,
    height: 512,
    no_background: true,
    styleRef: 'raw images/badges/image_1764193675435.png',
  },
  {
    type: 'league-logo',
    description:
      'battle rap league logo, bold modern emblem, stylized lettering, red and black color scheme, pixel art logo',
    width: 512,
    height: 512,
    no_background: true,
    styleRef: 'raw images/leagues/image_1764195526092.png',
  },
  {
    type: 'crowd',
    description:
      'battle rap crowd member portrait, shocked oh-shit reaction, hand to mouth, urban hip-hop diversity, pixel art bust',
    width: 256,
    height: 256,
    no_background: true,
    styleRef: 'raw images/crowd/image_1764197014144.png',
  },
  {
    type: 'city-background',
    description:
      'gritty urban battle rap venue exterior, night, neon signs, brick wall, alley dumpster, atmospheric, pixel art scene',
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
  if (!res.ok) {
    const text = (await res.text()).slice(0, 400);
    return { ...test, ok: false, error: `HTTP ${res.status}: ${text}` };
  }
  const data = await res.json();
  const jobId = data.job_id ?? data.id ?? data.background_job_id;
  if (!jobId) return { ...test, ok: false, error: 'no job id' };

  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const p = await fetch(`${BASE}/background-jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!p.ok) continue;
    const j = await p.json();
    if (j.status === 'completed') {
      const b64 = j.last_response?.images?.[0]?.base64;
      if (!b64) return { ...test, ok: false, error: 'no image in result' };
      const buf = Buffer.from(b64, 'base64');
      const outPath = path.join(OUT_DIR, `${test.type}.png`);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, buf);
      const dims = getPngDimensions(buf);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      return {
        ...test,
        ok: true,
        outPath,
        bytes: buf.length,
        actualW: dims?.width,
        actualH: dims?.height,
        elapsed,
      };
    }
    if (j.status === 'failed') {
      return { ...test, ok: false, error: `job failed: ${JSON.stringify(j).slice(0, 200)}` };
    }
  }
  return { ...test, ok: false, error: 'timed out polling' };
}

console.log(`Style-match test: ${TESTS.length} parallel jobs\n`);
TESTS.forEach((t) => console.log(`  • ${t.type.padEnd(18)} ${t.width}x${t.height}  ref=${path.basename(t.styleRef)}`));
console.log('');

const totalStart = Date.now();
const results = await Promise.all(TESTS.map(runJob));
const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(1);

console.log(`\nResults (total ${totalElapsed}s):\n`);
for (const r of results) {
  if (r.ok) {
    const sizeMatch = r.actualW === r.width && r.actualH === r.height ? '✓' : '✗ MISMATCH';
    console.log(
      `  ✓ ${r.type.padEnd(18)} ${r.actualW}x${r.actualH} ${sizeMatch}  ${r.elapsed}s  ${(r.bytes / 1024).toFixed(0)}kb  → ${r.outPath}`
    );
  } else {
    console.log(`  ✗ ${r.type.padEnd(18)} FAILED: ${r.error}`);
  }
}

const ok = results.filter((r) => r.ok).length;
console.log(`\n${ok}/${results.length} succeeded`);
process.exit(ok === results.length ? 0 : 1);
