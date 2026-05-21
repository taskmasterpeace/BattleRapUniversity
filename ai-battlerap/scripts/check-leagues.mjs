import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data: leagues } = await supabase
  .from('leagues')
  .select('name, short_code, prestige_level, base_payout, base_crowd_factor, writing_weight, performance_weight, round_length_minutes')
  .order('prestige_level');

console.log('PRESTIGE | NAME | SHORT | PAYOUT | WRITE/PERF/CROWD | MIN');
console.log('-'.repeat(100));
leagues?.forEach(l =>
  console.log(`${String(l.prestige_level).padStart(2)} | ${l.name.padEnd(30)} | ${String(l.short_code).padEnd(6)} | $${String(l.base_payout).padStart(6)} | ${l.writing_weight}/${l.performance_weight}/${l.base_crowd_factor} | ${l.round_length_minutes}`)
);
