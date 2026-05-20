import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:/git/battlerapuniversity/ai-battlerap/public/sprites';

function readPngDims(p) {
  const fd = fs.openSync(p, 'r');
  const buf = Buffer.alloc(24);
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { w, h };
}

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.name.toLowerCase().endsWith('.png')) yield full;
  }
}

function summarize(category, dir) {
  if (!fs.existsSync(dir)) {
    console.log(`\n=== ${category} ===  (NOT FOUND)`);
    return;
  }
  const buckets = new Map(); // "WxH" -> { count, samples: [] }
  let total = 0;
  let bytes = 0;
  for (const f of walk(dir)) {
    total++;
    const stat = fs.statSync(f);
    bytes += stat.size;
    try {
      const { w, h } = readPngDims(f);
      const key = `${w}x${h}`;
      if (!buckets.has(key)) buckets.set(key, { count: 0, samples: [] });
      const b = buckets.get(key);
      b.count++;
      if (b.samples.length < 2) b.samples.push(path.relative(ROOT, f).replaceAll('\\', '/'));
    } catch (e) {
      // ignore
    }
  }
  const sorted = [...buckets.entries()].sort((a, b) => b[1].count - a[1].count);
  console.log(`\n=== ${category} ===  ${total} files, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
  for (const [size, info] of sorted) {
    const [w, h] = size.split('x').map(Number);
    const aspect = (w / h).toFixed(3);
    console.log(`  ${size.padEnd(11)}  aspect ${aspect.padStart(5)}  count ${String(info.count).padStart(4)}   e.g. ${info.samples[0]}`);
  }
}

const categories = [
  ['characters', `${ROOT}/characters`],
  ['badges', `${ROOT}/badges`],
  ['leagues', `${ROOT}/leagues`],
  ['cities/canada', `${ROOT}/cities/canada`],
  ['cities/east-coast', `${ROOT}/cities/east-coast`],
  ['cities/midwest', `${ROOT}/cities/midwest`],
  ['cities/south', `${ROOT}/cities/south`],
  ['cities/west-coast', `${ROOT}/cities/west-coast`],
  ['crowd/original', `${ROOT}/crowd/original`],
  ['crowd/organized/black', `${ROOT}/crowd/organized/black`],
  ['crowd/organized/mixed', `${ROOT}/crowd/organized/mixed`],
  ['crowd/organized/white', `${ROOT}/crowd/organized/white`],
];

for (const [name, p] of categories) summarize(name, p);
