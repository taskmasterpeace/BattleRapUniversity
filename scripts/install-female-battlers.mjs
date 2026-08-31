// Install the first four female battlers (2026-08-31 identity-schema groundwork).
// Downloads the picked PixelLab candidate sets, integer-upscales 4x (112 -> 448),
// pads onto the 512 canvas, registers crop-map entries, and inserts battler +
// attributes + rankings rows into the LOCAL DB with gender + identity locks.
// Prod rows are applied separately via the Supabase MCP (same values).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const OUT_DIR = 'public/sprites/characters/generated';
const CROPS = 'lib/sprite-crops.json';
const SCALE = 4; // 112 * 4 = 448, integer only (pixel law)
const CANVAS = 512;

const BATTLERS = [
  {
    slug: 'nia-nightmare',
    stage_name: 'Nia Nightmare',
    job: '63bc71eb-b3af-4f23-a4ef-7bd90d83540a',
    order: [0, 3, 1, 2], // primary, battle face, alts
    gender: 'female',
    identity: {
      ethnicity: 'Black', age_range: 'late 20s', build: 'athletic',
      skin_tone: 'deep brown', hair: 'long black box braids', facial_hair: '',
      signature_look: 'black bomber jacket over white tee, gold hoop earrings',
      distinguishing: 'confident mean mug',
    },
    city: 'New York', league: 'Street Cipher', tier: 'mid', region: 'east',
    rating: 1540,
    attrs: {
      writing: { lyricism: 7, wordplay: 8, creativity: 6 },
      performance: { stage_presence: 6, crowd_control: 5, delivery: 7 },
      personal: { financial_stability: 5, reputation: 6, family_bond: 5, preparation: 5 },
      resilience: 6,
    },
    style_tags: ['Punchline Queen', 'Battle Tested'],
    bio: 'Brooklyn puncher. Back-to-back haymakers, no filler — they call the losers her nightmares.',
  },
  {
    slug: 'ink-empress',
    stage_name: 'Ink Empress',
    job: '98e7178b-3585-4968-b9e5-cbd6876e49b3',
    order: [0, 2, 1, 3],
    gender: 'female',
    identity: {
      ethnicity: 'Black', age_range: '30s', build: 'average',
      skin_tone: 'brown', hair: 'short natural afro dyed burgundy', facial_hair: '',
      signature_look: 'denim jacket with enamel pins, thin gold chain, round glasses',
      distinguishing: 'calm knowing smirk',
    },
    city: 'Detroit', league: 'Respect The Craft', tier: 'mid', region: 'midwest',
    rating: 1560,
    attrs: {
      writing: { lyricism: 8, wordplay: 7, creativity: 8 },
      performance: { stage_presence: 4, crowd_control: 4, delivery: 5 },
      personal: { financial_stability: 6, reputation: 5, family_bond: 6, preparation: 7 },
      resilience: 7,
    },
    style_tags: ['Schemes Master', 'Technical'],
    bio: 'Detroit pen. Third-listen schemes that read better every rewind — the tape always finds her.',
  },
  {
    slug: 'peach-fire',
    stage_name: 'Peach Fire',
    job: '6194fd38-37ce-4a5d-8088-9b855cf6a54a',
    order: [0, 2, 1, 3],
    gender: 'female',
    identity: {
      ethnicity: 'Black', age_range: 'early 20s', build: 'slim',
      skin_tone: 'tan brown', hair: 'long straight dark hair with bright orange streak', facial_hair: '',
      signature_look: 'orange puffer vest over black hoodie, thin silver chain',
      distinguishing: 'big expressive grin',
    },
    city: 'Atlanta', league: 'Slap', tier: 'low', region: 'south',
    rating: 1470,
    attrs: {
      writing: { lyricism: 4, wordplay: 4, creativity: 6 },
      performance: { stage_presence: 8, crowd_control: 7, delivery: 7 },
      personal: { financial_stability: 4, reputation: 4, family_bond: 6, preparation: 4 },
      resilience: 5,
    },
    style_tags: ['Crowd Favorite', 'Entertaining'],
    bio: 'Atlanta showwoman. Wins the room before the first punchline lands.',
  },
  {
    slug: 'trigger-rose',
    stage_name: 'Trigger Rose',
    job: '243dba82-0c88-4c5c-9889-f33a9dbea651',
    order: [0, 2, 1, 3],
    gender: 'female',
    identity: {
      ethnicity: 'Latina', age_range: 'late 20s', build: 'solid',
      skin_tone: 'tan', hair: 'dark hair in a tight slicked bun', facial_hair: '',
      signature_look: 'open red flannel over white tee, large gold hoop earrings',
      distinguishing: 'small rose tattoo on neck, hard unbothered stare',
    },
    city: 'Oakland', league: 'Gunbarz Assembly', tier: 'mid', region: 'west',
    rating: 1520,
    attrs: {
      writing: { lyricism: 6, wordplay: 5, creativity: 5 },
      performance: { stage_presence: 7, crowd_control: 6, delivery: 7 },
      personal: { financial_stability: 4, reputation: 6, family_bond: 5, preparation: 5 },
      resilience: 7,
    },
    style_tags: ['Aggressive', 'Street'],
    bio: 'Town business. Every rose got triggers — Bay-coded pressure from the first bar.',
  },
];

async function fetchFrame(job, index) {
  const res = await fetch(`https://api.pixellab.ai/mcp/images/${job}/download?index=${index}`);
  if (!res.ok) throw new Error(`download ${job}#${index}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function installImage(buf, outPath) {
  const up = await sharp(buf).resize(112 * SCALE, 112 * SCALE, { kernel: 'nearest' }).png().toBuffer();
  const pad = Math.floor((CANVAS - 112 * SCALE) / 2);
  await sharp({
    create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: up, left: pad, top: CANVAS - 112 * SCALE }]) // anchor content toward the bottom
    .png()
    .toFile(outPath);
}

async function contentBox(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return { x: 0, y: 0, w: 1, h: 1 };
  return {
    x: +(minX / info.width).toFixed(4),
    y: +(minY / info.height).toFixed(4),
    w: +((maxX - minX + 1) / info.width).toFixed(4),
    h: +((maxY - minY + 1) / info.height).toFixed(4),
  };
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

fs.mkdirSync(OUT_DIR, { recursive: true });
const crops = JSON.parse(fs.readFileSync(CROPS, 'utf8'));

for (const b of BATTLERS) {
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
  }

  const { data: existing } = await supabase.from('battlers').select('id').eq('stage_name', b.stage_name).maybeSingle();
  if (existing) {
    console.log(`${b.stage_name}: row exists (${existing.id}), updating portraits/identity only`);
    await supabase.from('battlers').update({
      avatar_url: spriteSet[0], sprite_set: spriteSet, gender: b.gender, identity: b.identity,
    }).eq('id', existing.id);
    continue;
  }

  const { data: city } = await supabase.from('cities').select('id, name').ilike('name', `%${b.city}%`).limit(1).maybeSingle();
  const { data: league } = await supabase.from('leagues').select('id, name').ilike('name', `%${b.league}%`).limit(1).maybeSingle();
  if (!league) { console.log(`${b.stage_name}: LEAGUE NOT FOUND (${b.league}) — skipping insert`); continue; }

  const { data: row, error } = await supabase.from('battlers').insert({
    stage_name: b.stage_name, is_ai: true, tier: b.tier, region: b.region,
    primary_league_id: league.id, style_tags: b.style_tags,
    avatar_url: spriteSet[0], sprite_set: spriteSet,
    gender: b.gender, identity: b.identity, bio: b.bio,
    hometown_city_id: city?.id ?? null, current_city_id: city?.id ?? null,
  }).select('id').single();
  if (error) { console.log(`${b.stage_name}: INSERT ERR ${error.message}`); continue; }

  const { error: e2 } = await supabase.from('battler_attributes').insert({
    battler_id: row.id, writing: b.attrs.writing, performance: b.attrs.performance,
    personal: b.attrs.personal, resilience: b.attrs.resilience,
    public_knowledge: 10, stress: 0,
  });
  const { error: e3 } = await supabase.from('rankings').insert({
    battler_id: row.id, rating: b.rating, wins: 0, losses: 0, streak: 0,
  });
  console.log(`${b.stage_name}: installed -> ${row.id} (${league.name}${city ? ', ' + city.name : ''})${e2 ? ' ATTR ERR ' + e2.message : ''}${e3 ? ' RANK ERR ' + e3.message : ''}`);
}

fs.writeFileSync(CROPS, JSON.stringify(crops, null, 0));
console.log('crop map updated:', Object.keys(crops).length, 'entries');
