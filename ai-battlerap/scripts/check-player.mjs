import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const flow = await supabase.from('battlers').select('*').eq('stage_name', 'Flow Tester').single();
console.log('Flow Tester:', JSON.stringify({
  style_tags: flow.data?.style_tags,
  badges_at_creation: flow.data?.badges_at_creation,
}, null, 2));

const bb = await supabase.from('battler_badges').select('*').eq('battler_id', flow.data?.id);
console.log('\nbattler_badges for Flow Tester:');
console.log('  error:', bb.error);
console.log('  data:', JSON.stringify(bb.data, null, 2));

const bbCols = await supabase.from('battler_badges').select('*').limit(3);
console.log('\nbattler_badges sample (any):');
console.log('  error:', bbCols.error);
console.log('  count:', bbCols.data?.length);
if (bbCols.data?.[0]) console.log('  columns:', Object.keys(bbCols.data[0]).join(', '));
console.log('  data:', JSON.stringify(bbCols.data, null, 2));
