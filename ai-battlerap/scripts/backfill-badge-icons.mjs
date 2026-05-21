// Backfill icon_url for all rows in badge_costs by mapping sorted badges to sprite files.
//
// Strategy:
//   1. List all 120 sprites across the 3 folders, sorted by their numeric suffix.
//   2. Fetch all badges, sort by (category, badge_name).
//   3. Pair them sequentially — first badge gets badge_001.png, etc.
//   4. UPDATE icon_url per row.
//
// Why: every badge currently has icon_url=null, so the UI falls back to a generic
// 🏅 emoji. We have 120 sprites and 76 badges — sequential pairing gives every
// badge a unique sprite without picking favorites.

import { createClient } from '@supabase/supabase-js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SPRITES_ROOT = 'public/sprites/badges';
const FOLDERS = [
  'image_1764193680087', // badge_001 - badge_040
  'image_1764193677602', // badge_041 - badge_080
  'image_1764193675435', // badge_081 - badge_120
];

// Collect every sprite with its numeric index so we can sort globally.
const sprites = [];
for (const folder of FOLDERS) {
  const files = readdirSync(join(SPRITES_ROOT, folder));
  for (const f of files) {
    const m = f.match(/badge_(\d+)\.png/);
    if (!m) continue;
    sprites.push({
      num: parseInt(m[1], 10),
      path: `/sprites/badges/${folder}/${f}`,
    });
  }
}
sprites.sort((a, b) => a.num - b.num);

console.log(`Found ${sprites.length} sprites`);

const { data: badges, error } = await supabase
  .from('badge_costs')
  .select('badge_code, badge_name, category')
  .order('category', { ascending: true })
  .order('badge_name', { ascending: true });

if (error) {
  console.error('Failed to fetch badges:', error);
  process.exit(1);
}

console.log(`Found ${badges.length} badges`);

if (badges.length > sprites.length) {
  console.error(`Not enough sprites: ${badges.length} badges vs ${sprites.length} sprites`);
  process.exit(1);
}

let updated = 0;
let failed = 0;

for (let i = 0; i < badges.length; i++) {
  const badge = badges[i];
  const sprite = sprites[i];

  const { error: updateError } = await supabase
    .from('badge_costs')
    .update({ icon_url: sprite.path })
    .eq('badge_code', badge.badge_code);

  if (updateError) {
    console.error(`✗ ${badge.badge_code}: ${updateError.message}`);
    failed++;
  } else {
    updated++;
  }
}

console.log(`\n✓ Updated ${updated} badges`);
if (failed > 0) console.log(`✗ ${failed} failures`);

// Verify a sample
const { data: sample } = await supabase
  .from('badge_costs')
  .select('badge_code, badge_name, icon_url')
  .order('badge_name')
  .limit(5);

console.log('\nSample after update:');
console.table(sample);
