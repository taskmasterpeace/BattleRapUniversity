// Install the first house-style venue interiors (2026-08-31): download the
// PixelLab renders into public/sprites/venues/<slug>.png and stamp
// venue_types.sprite_key so the whole app can resolve room art.
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const VENUES = [
  ['basement', '644272d6-31b8-4f2a-bf47-431db3d4c429'],
  ['barbershop', '4d96096d-9ee9-48b7-8a5f-42351adf01fd'],
  ['small-bar', 'cc504966-899e-4f07-9931-4b02ab9a85cc'],
  ['boxing-gym', 'd2705839-752d-490d-acb8-9033545cc264'],
  ['grand-theater', '8ad9b112-17cd-44e1-afda-9553f5a3042b'],
  ['home-studio', '3b056b36-f430-4bbb-b1de-d20f32f0c8c5'],
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

fs.mkdirSync('public/sprites/venues', { recursive: true });

for (const [slug, job] of VENUES) {
  const res = await fetch(`https://api.pixellab.ai/mcp/images/${job}/download?index=0`);
  if (!res.ok) {
    console.error(`FAIL ${slug}: ${res.status}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const rel = `/sprites/venues/${slug}.png`;
  fs.writeFileSync(`public${rel}`, buf);
  const { error } = await supabase.from('venue_types').update({ sprite_key: rel }).eq('slug', slug);
  console.log(`${slug}: ${buf.length}b installed${error ? ' (sprite_key ERR ' + error.message + ')' : ' + sprite_key set'}`);
}
