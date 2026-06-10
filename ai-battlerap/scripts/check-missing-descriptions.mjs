import { createClient } from '@supabase/supabase-js';
import { BADGE_DESCRIPTIONS } from '../lib/game/badgeDescriptions.ts';

const supabase = createClient(
  'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UtZGVtbyIsImlhdCI6MTY0MTc2OTIwMCwiZXhwIjoxNzk5NTM1NjAwfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q'
);

const { data: badges } = await supabase.from('badge_costs').select('badge_code, badge_name');
const codes = badges.map(b => b.badge_code);
const missingDesc = badges.filter(b => !BADGE_DESCRIPTIONS[b.badge_code]);
console.log('Total badges in DB:', badges.length);
console.log('Total in BADGE_DESCRIPTIONS:', Object.keys(BADGE_DESCRIPTIONS).length);
console.log('Missing descriptions:', missingDesc.length);
missingDesc.forEach(b => console.log('  -', b.badge_code, '|', b.badge_name));
