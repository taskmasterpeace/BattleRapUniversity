// Backfill background_url and skyline_url on cities by matching city.name to
// sprite filenames in public/sprites/cities/{region}/{slug}-{time}.png.
//
// background_url = {slug}-dusk.png  (cinematic, used as general backdrop)
// skyline_url    = {slug}-night.png (used as skyline view)
// Falls back to day variant if the preferred variant is missing.
import { createClient } from '@supabase/supabase-js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ROOT = 'public/sprites/cities';
const REGIONS = ['canada', 'east-coast', 'midwest', 'south', 'west-coast'];

// Build a flat index { slug: { region, day, dusk, night } }
const index = {};
for (const region of REGIONS) {
  const files = readdirSync(join(ROOT, region));
  for (const f of files) {
    const m = f.match(/^(.+)-(day|dusk|night)\.png$/);
    if (!m) continue;
    const [, slug, time] = m;
    if (!index[slug]) index[slug] = { region };
    index[slug][time] = `/sprites/cities/${region}/${f}`;
  }
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function pick(variants, preference) {
  for (const t of preference) if (variants[t]) return variants[t];
  return null;
}

const { data: cities } = await supabase.from('cities').select('id, name').order('name');
console.log(`Found ${cities.length} cities. Available sprite slugs: ${Object.keys(index).length}`);

let updated = 0, unmatched = [];
for (const city of cities) {
  const slug = slugify(city.name);
  const variants = index[slug];
  if (!variants) {
    unmatched.push(city.name);
    continue;
  }
  const background = pick(variants, ['dusk', 'day', 'night']);
  const skyline = pick(variants, ['night', 'dusk', 'day']);
  const { error } = await supabase
    .from('cities')
    .update({ background_url: background, skyline_url: skyline })
    .eq('id', city.id);
  if (error) {
    console.error(`✗ ${city.name}: ${error.message}`);
  } else {
    updated++;
    console.log(`✓ ${city.name} -> bg=${background.split('/').pop()}, sky=${skyline.split('/').pop()}`);
  }
}

console.log(`\nUpdated ${updated}/${cities.length}.`);
if (unmatched.length) console.log(`No sprite found for: ${unmatched.join(', ')}`);
