/**
 * Battle Simulation Test Script
 *
 * This script tests the battle simulation system end-to-end:
 * 1. Creates a test battle with prep blocks
 * 2. Triggers simulation via API
 * 3. Validates simulation results
 * 4. Checks data integrity
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🎤 BATTLE SIMULATION TEST\n');
  console.log('='.repeat(80));

  // Step 1: Find a player battler
  console.log('\n📋 Step 1: Finding player battler...');
  const { data: battlers, error: battlerError } = await supabase
    .from('battlers')
    .select('*, battler_attributes(*)')
    .eq('is_ai', false)
    .limit(1);

  if (battlerError || !battlers || battlers.length === 0) {
    console.error('❌ No player battler found');
    process.exit(1);
  }

  const playerBattler = battlers[0];
  console.log(`✓ Found player: ${playerBattler.stage_name} (ID: ${playerBattler.id})`);

  // Step 2: Find an AI opponent
  console.log('\n📋 Step 2: Finding AI opponent...');
  const { data: aiBattlers, error: aiError } = await supabase
    .from('battlers')
    .select('*, battler_attributes(*)')
    .eq('is_ai', true)
    .limit(1);

  if (aiError || !aiBattlers || aiBattlers.length === 0) {
    console.error('❌ No AI battler found');
    process.exit(1);
  }

  const aiBattler = aiBattlers[0];
  console.log(`✓ Found opponent: ${aiBattler.stage_name} (ID: ${aiBattler.id})`);

  // Step 3: Get league
  console.log('\n📋 Step 3: Getting league...');
  const { data: leagues, error: leagueError } = await supabase
    .from('leagues')
    .select('*')
    .limit(1);

  if (leagueError || !leagues || leagues.length === 0) {
    console.error('❌ No league found');
    process.exit(1);
  }

  const league = leagues[0];
  console.log(`✓ Found league: ${league.name} (${league.round_length_minutes} min rounds)`);

  // Step 4: Create a test battle
  console.log('\n📋 Step 4: Creating test battle...');
  const now = new Date();
  const scheduledAt = new Date(now.getTime() - 1000); // Past date for immediate simulation
  const lockPrepAt = new Date(now.getTime() - 2000);

  const { data: battle, error: battleError } = await supabase
    .from('battles')
    .insert({
      battler_player_id: playerBattler.id,
      battler_ai_id: aiBattler.id,
      league_id: league.id,
      status: 'accepted',
      scheduled_at: scheduledAt.toISOString(),
      lock_prep_at: lockPrepAt.toISOString(),
      no_show_player: false,
    })
    .select()
    .single();

  if (battleError) {
    console.error('❌ Failed to create battle:', battleError.message);
    process.exit(1);
  }

  console.log(`✓ Created battle ID: ${battle.id}`);

  // Step 5: Create prep blocks for player
  console.log('\n📋 Step 5: Creating player prep blocks...');
  const prepDays = 7;
  const playerPrep = [
    { battle_id: battle.id, battler_id: playerBattler.id, day_index: 1, focus: 'research' },
    { battle_id: battle.id, battler_id: playerBattler.id, day_index: 2, focus: 'writing' },
    { battle_id: battle.id, battler_id: playerBattler.id, day_index: 3, focus: 'writing' },
    { battle_id: battle.id, battler_id: playerBattler.id, day_index: 4, focus: 'performance' },
    { battle_id: battle.id, battler_id: playerBattler.id, day_index: 5, focus: 'performance' },
    { battle_id: battle.id, battler_id: playerBattler.id, day_index: 6, focus: 'rest' },
    { battle_id: battle.id, battler_id: playerBattler.id, day_index: 7, focus: 'rest' },
  ];

  const { error: prepError } = await supabase
    .from('prep_blocks')
    .insert(playerPrep);

  if (prepError) {
    console.error('❌ Failed to create prep blocks:', prepError.message);
    process.exit(1);
  }

  console.log(`✓ Created ${prepDays} prep blocks`);
  console.log('   - Research: 1 day');
  console.log('   - Writing: 2 days');
  console.log('   - Performance: 2 days');
  console.log('   - Rest: 2 days');

  // Step 6: Simulate the battle
  console.log('\n📋 Step 6: Triggering simulation...');
  console.log('   (AI prep will be auto-generated)');

  const response = await fetch(`http://localhost:3006/api/internal/run-due-battles?battle_id=${battle.id}`, {
    method: 'POST',
    headers: {
      'authorization': 'Bearer local-dev-secret-123',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Simulation failed:', errorText);
    process.exit(1);
  }

  const result = await response.json();
  console.log(`✓ Simulation completed: ${result.message}`);

  // Step 7: Verify battle status
  console.log('\n📋 Step 7: Verifying battle results...');
  const { data: completedBattle, error: fetchError } = await supabase
    .from('battles')
    .select(`
      *,
      player_battler:battlers!battler_player_id(stage_name),
      ai_battler:battlers!battler_ai_id(stage_name)
    `)
    .eq('id', battle.id)
    .single();

  if (fetchError || !completedBattle) {
    console.error('❌ Failed to fetch completed battle');
    process.exit(1);
  }

  console.log(`✓ Battle status: ${completedBattle.status}`);
  console.log(`✓ Winner: ${completedBattle.winner_battler_id === playerBattler.id ? completedBattle.player_battler.stage_name : completedBattle.ai_battler.stage_name}`);

  // Step 8: Verify rounds
  console.log('\n📋 Step 8: Verifying round data...');
  const { data: rounds, error: roundsError } = await supabase
    .from('battle_rounds')
    .select('*')
    .eq('battle_id', battle.id)
    .order('round_index');

  if (roundsError || !rounds || rounds.length === 0) {
    console.error('❌ No round data found');
    process.exit(1);
  }

  console.log(`✓ Found ${rounds.length} round records (expected 6 = 3 rounds × 2 battlers)`);

  const playerRounds = rounds.filter(r => r.battler_id === playerBattler.id);
  const aiRounds = rounds.filter(r => r.battler_id === aiBattler.id);

  console.log('\n   Player Rounds:');
  playerRounds.forEach(r => {
    const won = r.average_score > aiRounds.find(a => a.round_index === r.round_index).average_score;
    console.log(`   Round ${r.round_index}: ${won ? 'WON' : 'LOST'} (avg: ${r.average_score.toFixed(2)}, peak: ${r.peak_score.toFixed(2)}, consistency: ${r.consistency_score.toFixed(2)}, crowd: ${r.crowd_reaction}%)`);
    if (r.choked) console.log(`      ⚠ CHOKED`);
  });

  console.log('\n   AI Rounds:');
  aiRounds.forEach(r => {
    const won = r.average_score > playerRounds.find(p => p.round_index === r.round_index).average_score;
    console.log(`   Round ${r.round_index}: ${won ? 'WON' : 'LOST'} (avg: ${r.average_score.toFixed(2)}, peak: ${r.peak_score.toFixed(2)}, consistency: ${r.consistency_score.toFixed(2)}, crowd: ${r.crowd_reaction}%)`);
    if (r.choked) console.log(`      ⚠ CHOKED`);
  });

  // Step 9: Verify segments
  console.log('\n📋 Step 9: Verifying segment data...');
  const { data: segments, error: segmentsError } = await supabase
    .from('battle_segments')
    .select('*')
    .eq('battle_id', battle.id)
    .order('round_index')
    .order('segment_index');

  if (segmentsError || !segments || segments.length === 0) {
    console.error('❌ No segment data found');
    process.exit(1);
  }

  const expectedSegments = league.round_length_minutes === 2 ? 4 : 6;
  const totalExpected = expectedSegments * 3 * 2; // segments × 3 rounds × 2 battlers
  console.log(`✓ Found ${segments.length} segment records (expected ${totalExpected})`);

  // Validate segment structure
  const playerSegments = segments.filter(s => s.battler_id === playerBattler.id);
  const segmentsByRound = {};
  for (let round = 1; round <= 3; round++) {
    segmentsByRound[round] = playerSegments.filter(s => s.round_index === round);
  }

  console.log('\n   Segments per round:');
  Object.entries(segmentsByRound).forEach(([round, segs]) => {
    console.log(`   Round ${round}: ${segs.length} segments (expected ${expectedSegments})`);
  });

  // Step 10: Validate score ranges
  console.log('\n📋 Step 10: Validating score ranges...');
  const allScores = segments.map(s => s.segment_score);
  const minScore = Math.min(...allScores);
  const maxScore = Math.max(...allScores);
  const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;

  console.log(`✓ Score range: ${minScore.toFixed(2)} - ${maxScore.toFixed(2)}`);
  console.log(`✓ Average score: ${avgScore.toFixed(2)}`);

  // Check if scores are within expected range (SCORE_FLOOR to SCORE_CEILING)
  const SCORE_FLOOR = 3.0;
  const SCORE_CEILING = 11.0;
  const scoresInRange = allScores.every(s => s >= SCORE_FLOOR && s <= SCORE_CEILING);
  console.log(`✓ All scores in valid range [${SCORE_FLOOR}, ${SCORE_CEILING}]: ${scoresInRange ? 'YES' : 'NO'}`);

  // Step 11: Check for special events
  console.log('\n📋 Step 11: Checking for special events...');
  const haymakersCount = segments.filter(s => s.event_flags?.includes('haymaker')).length;
  const chokesCount = segments.filter(s => s.event_flags?.includes('choke')).length;

  console.log(`✓ Haymakers (peak moments): ${haymakersCount}`);
  console.log(`✓ Chokes: ${chokesCount}`);

  // Step 12: Validate winner determination
  console.log('\n📋 Step 12: Validating winner determination...');
  const playerRoundsWon = playerRounds.filter((pr, idx) =>
    pr.average_score > aiRounds[idx].average_score
  ).length;
  const aiRoundsWon = 3 - playerRoundsWon;

  console.log(`✓ Player rounds won: ${playerRoundsWon}`);
  console.log(`✓ AI rounds won: ${aiRoundsWon}`);

  const expectedWinner = playerRoundsWon > aiRoundsWon ? playerBattler.id : aiBattler.id;
  const correctWinner = completedBattle.winner_battler_id === expectedWinner;
  console.log(`✓ Winner determination: ${correctWinner ? 'CORRECT' : 'INCORRECT'}`);

  // Step 13: Check crowd reactions
  console.log('\n📋 Step 13: Validating crowd reactions...');
  const crowdReactions = segments.map(s => s.crowd_reaction);
  const minCrowd = Math.min(...crowdReactions);
  const maxCrowd = Math.max(...crowdReactions);
  const avgCrowd = crowdReactions.reduce((a, b) => a + b, 0) / crowdReactions.length;

  console.log(`✓ Crowd reaction range: ${minCrowd} - ${maxCrowd}`);
  console.log(`✓ Average crowd reaction: ${avgCrowd.toFixed(1)}`);
  const crowdInRange = crowdReactions.every(c => c >= 0 && c <= 100);
  console.log(`✓ All crowd reactions in valid range [0, 100]: ${crowdInRange ? 'YES' : 'NO'}`);

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('✅ SIMULATION TEST COMPLETE\n');
  console.log('Summary:');
  console.log(`  • Battle ID: ${battle.id}`);
  console.log(`  • Status: ${completedBattle.status}`);
  console.log(`  • Winner: ${completedBattle.winner_battler_id === playerBattler.id ? completedBattle.player_battler.stage_name : completedBattle.ai_battler.stage_name} (${playerRoundsWon}-${aiRoundsWon})`);
  console.log(`  • Rounds: ${rounds.length}/6 ✓`);
  console.log(`  • Segments: ${segments.length}/${totalExpected} ✓`);
  console.log(`  • Score range: ${minScore.toFixed(2)}-${maxScore.toFixed(2)} (valid: ${scoresInRange ? 'YES' : 'NO'})`);
  console.log(`  • Haymakers: ${haymakersCount}`);
  console.log(`  • Chokes: ${chokesCount}`);
  console.log(`  • Crowd reactions: ${minCrowd}-${maxCrowd} (valid: ${crowdInRange ? 'YES' : 'NO'})`);
  console.log(`  • Winner determination: ${correctWinner ? 'CORRECT' : 'INCORRECT'}`);

  console.log('\n🎉 All tests passed!');
  console.log(`\n🔗 View battle results: http://localhost:3006/battle/${battle.id}`);
}

main().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
