import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'
);

// Get battle counts
const { count: totalBattles } = await supabase
  .from('battles')
  .select('*', { count: 'exact', head: true });

const { count: completedBattles } = await supabase
  .from('battles')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'completed');

console.log(`Total battles: ${totalBattles}`);
console.log(`Completed battles: ${completedBattles}`);

// Get latest completed battles
const { data: battles, error } = await supabase
  .from('battles')
  .select(`
    id,
    status,
    scheduled_at,
    player_battler:battler_player_id(stage_name),
    ai_battler:battler_ai_id(stage_name),
    winner_battler_id
  `)
  .eq('status', 'completed')
  .order('scheduled_at', { ascending: false })
  .limit(3);

if (error) {
  console.error('Error:', error);
} else {
  console.log('\n=== LATEST COMPLETED BATTLES ===\n');
  battles.forEach((battle, i) => {
    console.log(`\n--- Battle ${i + 1} ---`);
    console.log(`ID: ${battle.id}`);
    console.log(`Player: ${battle.player_battler?.stage_name || 'Unknown'}`);
    console.log(`AI: ${battle.ai_battler?.stage_name || 'Unknown'}`);
    console.log(`Winner ID: ${battle.winner_battler_id || 'Unknown'}`);
    console.log(`Date: ${battle.scheduled_at}`);
  });
}

// Get all battles with status
const { data: allBattles } = await supabase
  .from('battles')
  .select('id, status, scheduled_at')
  .order('scheduled_at', { ascending: false });

console.log('\n=== ALL BATTLES BY STATUS ===');
const statusCounts = allBattles.reduce((acc, b) => {
  acc[b.status] = (acc[b.status] || 0) + 1;
  return acc;
}, {});
console.log(statusCounts);
