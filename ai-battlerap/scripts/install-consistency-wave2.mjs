// Consistency Wave 2 (2026-08-31): the next 12 legacy battlers by rating redrawn
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
  { slug: 'crown-calvin', stage_name: 'Crown Calvin', job: '57ff3b40-c79a-4177-b4a3-632d3e64f886', order: [0, 1, 3, 2], gender: 'female',
    identity: { ethnicity: 'Black', age_range: 'late 20s', build: 'average', skin_tone: 'brown', hair: 'big round natural afro, gold hoop earrings', facial_hair: '', signature_look: 'light blue denim jacket over white tee', distinguishing: 'composed steady stare' } },
  { slug: 'pavement-poet', stage_name: 'Pavement Poet', job: '535e81f2-6340-4fdf-a054-90d69b6eff4c', order: [2, 3, 0, 1], gender: 'male',
    identity: { ethnicity: 'White', age_range: 'late 30s', build: 'stocky', skin_tone: 'fair', hair: 'bald', facial_hair: 'gray stubble goatee', signature_look: 'blue denim vest over white tee', distinguishing: 'wide-eyed aggressive shout' } },
  { slug: 'hustle-hayes', stage_name: 'Hustle Hayes', job: 'f8357030-2470-48b1-975d-e14070ebc494', order: [0, 2, 1, 3], gender: 'male',
    identity: { ethnicity: 'Black', age_range: 'late 20s', build: 'solid', skin_tone: 'brown', hair: 'short dark fade haircut', facial_hair: 'full dark beard', signature_look: 'forest green hoodie with drawstrings', distinguishing: 'hard scowl' } },
  { slug: 'cream-city-killer', stage_name: 'Cream City Killer', job: 'fbef1909-8994-45c4-8a04-422be3c7469a', order: [0, 3, 1, 2], gender: 'male',
    identity: { ethnicity: 'Black', age_range: 'mid 20s', build: 'slim', skin_tone: 'brown', hair: 'cornrow braids going straight back', facial_hair: 'chin goatee', signature_look: 'navy and cream varsity letterman jacket over cream tee', distinguishing: 'gritted-teeth snarl' } },
  { slug: 'frontline-fury', stage_name: 'Frontline Fury', job: '0a0e3bc9-c84c-4f75-a959-626b7502217c', order: [0, 2, 1, 3], gender: 'male',
    identity: { ethnicity: 'Black', age_range: 'mid 20s', build: 'wiry', skin_tone: 'brown', hair: 'wild crinkly freeform locs', facial_hair: '', signature_look: 'black graphic tee with thin gold chain', distinguishing: 'furious open-mouth yell' } },
  { slug: 'grind-mode', stage_name: 'Grind Mode', job: '79ce860c-203d-45f8-9539-92ad36da0b03', order: [0, 1, 2, 3], gender: 'male',
    identity: { ethnicity: 'Black', age_range: '30s', build: 'solid', skin_tone: 'deep brown', hair: 'short dark locs on top', facial_hair: 'full dark beard', signature_look: 'black crewneck sweatshirt with gold chain', distinguishing: 'calm hard stare' } },
  { slug: 'smoke-out', stage_name: 'Smoke Out', job: '1d89f697-0a63-4fe3-bf1a-9df9ec1699ff', order: [0, 2, 1, 3], gender: 'male',
    identity: { ethnicity: 'Black', age_range: '30s', build: 'heavy', skin_tone: 'deep brown', hair: 'bald', facial_hair: '', signature_look: 'gold yellow basketball jersey over dark tee', distinguishing: 'mean mug frown' } },
  { slug: 'spotlight-sage', stage_name: 'Spotlight Sage', job: '01b4f6e8-04fa-4461-93db-f7477d25d2ec', order: [0, 3, 1, 2], gender: 'male',
    identity: { ethnicity: 'Black', age_range: '30s', build: 'solid', skin_tone: 'deep brown', hair: 'bald', facial_hair: 'dark goatee', signature_look: 'white hoodie with drawstrings', distinguishing: 'focused frown' } },
  { slug: 'scheme-genius', stage_name: 'Scheme Genius', job: '5b45388b-97eb-406b-9191-2df18bf46bca', order: [0, 2, 1, 3], gender: 'male',
    identity: { ethnicity: 'Black', age_range: 'early 20s', build: 'athletic', skin_tone: 'brown', hair: 'short buzz cut', facial_hair: '', signature_look: 'green camouflage tee shirt', distinguishing: 'cocky smirk' } },
  { slug: 'crowd-conductor', stage_name: 'Crowd Conductor', job: '6fcac893-e274-4d5e-824c-21dc609b4433', order: [0, 1, 2, 3], gender: 'male',
    identity: { ethnicity: 'Black', age_range: '30s', build: 'solid', skin_tone: 'brown', hair: 'black NY fitted cap', facial_hair: 'full dark beard', signature_look: 'orange-brown camo patterned shirt with gold chain', distinguishing: 'deadpan stare' } },
  { slug: 'bag-em-up', stage_name: 'Bag Em Up', job: '2082dde6-8dde-403e-9ac3-007ed8a2e059', order: [0, 1, 3, 2], gender: 'male',
    identity: { ethnicity: 'Black', age_range: 'early 20s', build: 'slim', skin_tone: 'brown', hair: 'short twists hanging over the forehead', facial_hair: 'thin mustache and soft goatee', signature_look: 'navy varsity jacket over cream tee', distinguishing: 'icy stare' } },
  { slug: 'velocity-vinny', stage_name: 'Velocity Vinny', job: '3d8071ee-a8b6-4c2a-a228-d78f4605aabe', order: [2, 1, 0, 3], gender: 'male',
    identity: { ethnicity: 'Black', age_range: 'mid 20s', build: 'average', skin_tone: 'brown', hair: 'long braids pulled back with a green band', facial_hair: 'full beard with chin point', signature_look: 'navy varsity jacket over cream tee', distinguishing: 'side-eye smirk' } },
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
