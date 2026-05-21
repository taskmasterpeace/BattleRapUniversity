import { createClient } from '@supabase/supabase-js';
import { existsSync } from 'node:fs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data: badges } = await supabase
  .from('badge_costs')
  .select('badge_code, icon_url');

const nulls = badges.filter((b) => !b.icon_url);
const missingFiles = badges.filter(
  (b) => b.icon_url && !existsSync('public' + b.icon_url)
);

console.log(`Total badges:    ${badges.length}`);
console.log(`Null icon_url:   ${nulls.length}`);
console.log(`Missing files:   ${missingFiles.length}`);

if (nulls.length) console.log('Nulls:', nulls.map((b) => b.badge_code));
if (missingFiles.length)
  console.log('Missing:', missingFiles.map((b) => `${b.badge_code} -> ${b.icon_url}`));
