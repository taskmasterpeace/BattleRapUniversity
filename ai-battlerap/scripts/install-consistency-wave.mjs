// Consistency Wave 1 (2026-08-31): the 12 most-visible legacy battlers redrawn
// through the canonical 112px pipeline (likeness-anchored to their old sprite).
// Installs 4-variant sets, updates rows (avatar/sprite_set/gender/identity),
// registers crop-map entries, and drops RAW 112s + captions into training/.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const OUT_DIR = 'public/sprites/characters/generated';
const CROPS = 'lib/sprite-crops.json';
const TRAIN = '../training/house-style-portraits';
const SCALE = 4;
const CANVAS = 512;
const T = 'brustyle pixel art bust portrait of a battle rapper, ';
const E = ', clear well-defined eyes with dark irises and visible pupils, transparent background';

const WAVE = [
  { slug: 'throne-talker', stage_name: 'Throne Talker', job: '611105ce-497e-4948-ac28-7625e1b58a8c', order: [2, 1, 0, 3], gender: 'male',
    identity: { ethnicity: 'White', age_range: 'late 20s', build: 'athletic', skin_tone: 'fair', hair: 'short blond hair', facial_hair: 'light stubble', signature_look: 'orange basketball tank top', distinguishing: 'smug hard stare' } },
  { slug: 'the-architect', stage_name: 'The Architect', job: '9f329978-98ae-4e97-b034-e33760ea4cb4', order: [0, 2, 1, 3], gender: 'male',
    identity: { ethnicity: 'Black', age_range: 'late 20s', build: 'average', skin_tone: 'deep brown', hair: 'wild shoulder-length loc twists', facial_hair: 'chinstrap beard', signature_look: 'black tee with thin gold chain', distinguishing: 'big confident grin' } },
  { slug: 'tsunami-wave', stage_name: 'Tsunami Wave', job: '22086127-8164-4c42-9450-a8716995787e', order: [0, 1, 2, 3], gender: 'male',
    identity: { ethnicity: 'Black', age_range: '30s', build: 'solid', skin_tone: 'brown', hair: 'dark gray beanie', facial_hair: 'short beard', signature_look: 'blue hoodie with white drawstrings', distinguishing: 'intense snarl' } },
  { slug: 'bar-god-bishop', stage_name: 'Bar God Bishop', job: '071ad7f7-2df9-4ffe-9fa9-af0e0315f065', order: [0, 1, 2, 3], gender: 'male',
    identity: { ethnicity: 'Latino', age_range: 'late 20s', build: 'athletic', skin_tone: 'light brown', hair: 'blond mohawk with shaved fade sides', facial_hair: 'dark chin goatee', signature_look: 'gray hoodie', distinguishing: 'stern glare' } },
  { slug: 'king-karver', stage_name: 'King Karver', job: '239a600c-98b4-44c7-836f-102dc8930a70', order: [0, 2, 1, 3], gender: 'male',
    identity: { ethnicity: 'White', age_range: '30s', build: 'solid', skin_tone: 'tan', hair: 'short brown buzz cut', facial_hair: 'light stubble', signature_look: 'gray hoodie with drawstrings', distinguishing: 'serious frown' } },
  { slug: 'compton-kingpin', stage_name: 'Compton Kingpin', job: 'a7c90751-e37a-4969-a952-b6591c7ae615', order: [0, 2, 3, 1], gender: 'female',
    identity: { ethnicity: 'Black', age_range: 'late 20s', build: 'slim', skin_tone: 'brown', hair: 'long thin braids past the shoulders', facial_hair: '', signature_look: 'black blazer over white tee with gold chain, small stud earring', distinguishing: 'serene composed expression' } },
  { slug: 'the-comedian', stage_name: 'The Comedian', job: '45e4541d-97f3-4ab3-8319-0b7c186e5dfe', order: [1, 0, 2, 3], gender: 'male',
    identity: { ethnicity: 'Latino', age_range: '30s', build: 'solid', skin_tone: 'light brown', hair: 'big curly dark hair', facial_hair: 'full beard', signature_look: 'blue and red basketball jersey over white long-sleeve', distinguishing: 'mid-laugh open mouth' } },
  { slug: 'the-nitro-puncher', stage_name: 'The Nitro Puncher', job: '7b49a351-f05a-40d9-bdf2-7841cba6f11d', order: [0, 1, 2, 3], gender: 'male',
    identity: { ethnicity: 'Black', age_range: 'late 20s', build: 'solid', skin_tone: 'brown', hair: 'black beanie', facial_hair: 'stubble beard', signature_look: 'colorful geometric patterned knit sweater', distinguishing: 'mouth wide open shouting' } },
  { slug: 'immortal-ink', stage_name: 'Immortal Ink', job: '08c66223-33d4-46c3-90f0-a16c51bbabce', order: [0, 2, 3, 1], gender: 'male',
    identity: { ethnicity: 'Black', age_range: '30s', build: 'athletic', skin_tone: 'deep brown', hair: 'bald', facial_hair: 'light stubble', signature_look: 'navy blue hoodie with white drawstrings', distinguishing: 'angry intense glare' } },
  { slug: 'baltimore-rocker', stage_name: 'Baltimore Rocker', job: '422119c7-d740-44b2-8ab1-f280006b5691', order: [1, 3, 0, 2], gender: 'male',
    identity: { ethnicity: 'Black', age_range: '30s', build: 'solid', skin_tone: 'deep brown', hair: 'red durag with tails', facial_hair: 'full dark beard', signature_look: 'colorful patterned shirt with green collar band', distinguishing: 'hard unbothered stare' } },
  { slug: 'forever-foe', stage_name: 'Forever Foe', job: '9d074d9d-14d4-422e-b6f0-0b7a165b67b2', order: [0, 2, 1, 3], gender: 'male',
    identity: { ethnicity: 'Black', age_range: 'mid 20s', build: 'slim', skin_tone: 'brown', hair: 'short cornrow braids, small earring', facial_hair: 'thin mustache', signature_look: 'dark maroon jacket over white tee', distinguishing: 'hard sideways stare' } },
  { slug: 'royal-rage', stage_name: 'Royal Rage', job: '7c33da52-82bb-44c0-bfb4-2d5f221e35e1', order: [0, 2, 1, 3], gender: 'male',
    identity: { ethnicity: 'Latino', age_range: 'late 20s', build: 'average', skin_tone: 'light brown', hair: 'short dark textured hair', facial_hair: 'trimmed beard and goatee', signature_look: 'black crewneck with gold chain', distinguishing: 'stern serious look' } },
];

function captionOf(b, variantIdx) {
  const i = b.identity;
  const core = [
    `${i.ethnicity} ${b.gender === 'female' ? 'woman' : 'man'}, ${i.age_range}, ${i.build} build, ${i.skin_tone} skin`,
    i.hair, i.facial_hair, i.signature_look, i.distinguishing,
  ].filter(Boolean).join(', ');
  const note = variantIdx === 0 ? '' : variantIdx === 1 ? ', alternate expression (battle face)' : ', alternate expression';
  return T + core + note + E;
}

async function fetchFrame(job, index) {
  const res = await fetch(`https://api.pixellab.ai/mcp/images/${job}/download?index=${index}`);
  if (!res.ok) throw new Error(`download ${job}#${index}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function installImage(buf, outPath) {
  const up = await sharp(buf).resize(112 * SCALE, 112 * SCALE, { kernel: 'nearest' }).png().toBuffer();
  const pad = Math.floor((CANVAS - 112 * SCALE) / 2);
  await sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: up, left: pad, top: CANVAS - 112 * SCALE }])
    .png()
    .toFile(outPath);
}

async function contentBox(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 8) {
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { x: 0, y: 0, w: 1, h: 1 };
  return {
    x: +(minX / info.width).toFixed(4), y: +(minY / info.height).toFixed(4),
    w: +((maxX - minX + 1) / info.width).toFixed(4), h: +((maxY - minY + 1) / info.height).toFixed(4),
  };
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TRAIN, { recursive: true });
const crops = JSON.parse(fs.readFileSync(CROPS, 'utf8'));

for (const b of WAVE) {
  const spriteSet = [];
  for (let i = 0; i < b.order.length; i++) {
    const frame = b.order[i];
    const suffix = i === 0 ? '' : `-${i + 1}`;
    const rel = `/sprites/characters/generated/${b.slug}${suffix}.png`;
    const out = path.join(OUT_DIR, `${b.slug}${suffix}.png`);
    const buf = await fetchFrame(b.job, frame);
    await installImage(buf, out);
    crops[rel] = await contentBox(out);
    spriteSet.push(rel);
    // Feed the training set: raw 112 + caption
    fs.writeFileSync(path.join(TRAIN, `${b.slug}${suffix}.png`), buf);
    fs.writeFileSync(path.join(TRAIN, `${b.slug}${suffix}.txt`), captionOf(b, i));
  }

  const { data: row, error } = await supabase
    .from('battlers')
    .update({ avatar_url: spriteSet[0], sprite_set: spriteSet, gender: b.gender, identity: b.identity })
    .eq('stage_name', b.stage_name)
    .select('id')
    .maybeSingle();
  console.log(`${b.stage_name}: ${error ? 'ERR ' + error.message : row ? 'updated ' + row.id : 'NO ROW FOUND'}`);
}

fs.writeFileSync(CROPS, JSON.stringify(crops, null, 0));
console.log('crop map:', Object.keys(crops).length, 'entries');
