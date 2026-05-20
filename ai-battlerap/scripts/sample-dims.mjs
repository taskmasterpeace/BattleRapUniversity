import fs from 'node:fs';
import path from 'node:path';

function readPngDims(p) {
  const fd = fs.openSync(p, 'r');
  const buf = Buffer.alloc(24);
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  // PNG: bytes 16-23 = width + height (big-endian uint32)
  if (buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const dirs = [
  'D:/git/battlerapuniversity/raw images/venue',
  'D:/git/battlerapuniversity/raw images/crowdbackdrop',
  'D:/git/battlerapuniversity/raw images/life',
  'D:/git/battlerapuniversity/raw images/secrets',
  'D:/git/battlerapuniversity/raw images/mockups',
  'D:/git/battlerapuniversity/raw images/leagues',
  'D:/git/battlerapuniversity/raw images/battlers',
];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  console.log(`\n=== ${dir.split('/').slice(-2).join('/')} ===`);
  const files = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isFile() && /\.png$/i.test(e.name))
    .map(e => path.join(dir, e.name));
  for (const f of files.slice(0, 5)) {
    try {
      const d = readPngDims(f);
      if (d) console.log(`  ${path.basename(f).padEnd(40)}  ${d.w}x${d.h}  aspect ${(d.w / d.h).toFixed(3)}`);
    } catch (e) {
      console.log(`  ${path.basename(f)}  (read error)`);
    }
  }
  console.log(`  (${files.length} total PNGs)`);
}
