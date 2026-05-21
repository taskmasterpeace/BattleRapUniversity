import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const flow = await supabase.from('battlers').select('*').eq('stage_name', 'Flow Tester').single();
const battlerId = flow.data?.id;
console.log('Flow Tester id:', battlerId);
console.log('Balance:', flow.data?.current_balance);
console.log('Total Earnings:', flow.data?.total_career_earnings);
console.log('Debt:', flow.data?.debt_amount);
console.log('Style Tags:', flow.data?.style_tags);

const { data: completed } = await supabase
  .from('battles')
  .select('id, status, winner_battler_id, scheduled_at, league_id, battler_a_id, battler_b_id')
  .or(`battler_a_id.eq.${battlerId},battler_b_id.eq.${battlerId}`)
  .eq('status', 'completed');

console.log('\nCompleted battles:', completed?.length);
completed?.forEach((b) =>
  console.log(`  ${b.scheduled_at?.slice(0, 10)} — winner: ${b.winner_battler_id === battlerId ? 'YOU' : 'opp'}`)
);

const { data: rounds } = await supabase
  .from('battle_rounds')
  .select('*')
  .eq('battler_id', battlerId);

console.log('\nRound stats:');
if (rounds?.length) {
  const peaks = rounds.map((r) => r.peak_score);
  const avgs = rounds.map((r) => r.average_score);
  const crowds = rounds.map((r) => r.crowd_reaction);
  console.log(`  Rounds: ${rounds.length}`);
  console.log(`  Max peak: ${Math.max(...peaks).toFixed(2)}`);
  console.log(`  Avg score across all rounds: ${(avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(2)}`);
  console.log(`  Best crowd: ${Math.max(...crowds).toFixed(0)}%`);
  console.log(`  Chokes: ${rounds.filter((r) => r.choked).length}`);
} else {
  console.log('  No rounds yet');
}

const { data: ranking } = await supabase
  .from('rankings')
  .select('*')
  .eq('battler_id', battlerId)
  .single();
console.log('\nRanking:', JSON.stringify(ranking, null, 2));
