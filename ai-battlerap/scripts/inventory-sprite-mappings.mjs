// Inventory what entities are mapped to which sprite paths today,
// so we can build a remapping plan.
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function tableHasColumn(table, col) {
  const { error } = await supabase.from(table).select(col).limit(1);
  return !error;
}

console.log('=== badge_costs ===');
const { data: badges } = await supabase
  .from('badge_costs')
  .select('badge_code, badge_name, category, icon_url')
  .order('badge_name');
console.log(`Total: ${badges?.length}, with icon_url: ${badges?.filter(b => b.icon_url).length}`);
console.log('Sample:');
console.table(badges?.slice(0, 5));

console.log('\n=== leagues ===');
const { data: leagues, error: lerr } = await supabase
  .from('leagues')
  .select('*')
  .order('name');
if (lerr) console.error(lerr);
console.log(`Total: ${leagues?.length}, with logo_url: ${leagues?.filter(l => l.logo_url).length}`);
console.log('Columns:', Object.keys(leagues?.[0] || {}));
console.log('All league names + logo:');
console.table(leagues?.map(l => ({ name: l.name, short_code: l.short_code, logo: l.logo_url?.split('/').pop() })));

console.log('\n=== cities ===');
const hasImg = await tableHasColumn('cities', 'image_url');
const hasIcon = await tableHasColumn('cities', 'icon_url');
const { data: cities } = await supabase.from('cities').select('*').order('name');
console.log(`Total: ${cities?.length}, has image_url col: ${hasImg}, has icon_url col: ${hasIcon}`);
console.log('Columns:', Object.keys(cities?.[0] || {}));
console.log('All cities:');
console.table(cities?.map(c => ({ name: c.name, bg: c.background_url?.split('/').pop(), sky: c.skyline_url?.split('/').pop() })));
