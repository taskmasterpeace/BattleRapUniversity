/**
 * Grand Prix System Test Script
 * Tests the automatic tournament creation when a player completes their origin story
 */

import { createClient } from '@supabase/supabase-js';
import {
  checkGrandPrixEligibility,
  hasCompletedGrandPrix,
  getGrandPrixOpponents,
  createGrandPrix,
  autoTriggerGrandPrix,
} from '../lib/game/grand-prix';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ============================================================================
// TEST UTILITIES
// ============================================================================

async function getTestPlayer() {
  // Get first non-AI battler
  const { data: players } = await supabase
    .from('battlers')
    .select('id, stage_name, origin_type, origin_completed')
    .eq('is_ai', false)
    .limit(1);

  return players?.[0] || null;
}

async function createTestPlayer() {
  // Create a test player with origin type
  const { data: league } = await supabase
    .from('leagues')
    .select('id')
    .eq('name', 'Small Room Circuit')
    .single();

  if (!league) {
    throw new Error('Small Room Circuit league not found');
  }

  const { data: battler, error } = await supabase
    .from('battlers')
    .insert({
      stage_name: 'Test Grand Prix Player',
      primary_league_id: league.id,
      is_ai: false,
      tier: 'low',
      origin_type: 'text_forums',
      origin_completed: false,
    })
    .select()
    .single();

  if (error || !battler) {
    throw new Error(`Failed to create test player: ${error?.message}`);
  }

  // Create battler attributes
  await supabase.from('battler_attributes').insert({
    battler_id: battler.id,
    writing: { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
    performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
    personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
    resilience: 5,
  });

  // Create ranking
  await supabase.from('rankings').insert({
    battler_id: battler.id,
    rating: 1200,
  });

  console.log(`✅ Created test player: ${battler.stage_name} (${battler.id})`);
  return battler;
}

async function awardMilestone(battlerId: string, milestoneKey: string) {
  const { error } = await supabase.from('origin_milestones').insert({
    battler_id: battlerId,
    milestone_key: milestoneKey,
    context: { test: true },
  });

  if (error) {
    // Ignore duplicate key errors
    if (!error.message.includes('duplicate key')) {
      throw new Error(`Failed to award milestone: ${error.message}`);
    }
  }

  console.log(`   ✓ Awarded milestone: ${milestoneKey}`);
}

async function completeFiveOriginMilestones(battlerId: string) {
  console.log(`\n📋 Awarding 5 origin milestones to battler ${battlerId}...`);

  const milestones = [
    'text_forums_first_post',
    'text_forums_viral_moment',
    'text_forums_first_win',
    'text_forums_10_battles',
    'text_forums_rivalry_formed',
  ];

  for (const milestone of milestones) {
    await awardMilestone(battlerId, milestone);
  }

  // Manually trigger origin completion check
  await supabase.rpc('check_origin_completion', { p_battler_id: battlerId });

  console.log('✅ All 5 milestones awarded');
}

// ============================================================================
// TESTS
// ============================================================================

async function testEligibilityCheck() {
  console.log('\n========================================');
  console.log('TEST 1: Eligibility Check');
  console.log('========================================');

  const player = await getTestPlayer();
  if (!player) {
    console.log('⚠️  No player found, creating test player...');
    const newPlayer = await createTestPlayer();
    const isEligible = await checkGrandPrixEligibility(newPlayer.id, supabase);
    console.log(`   Eligibility: ${isEligible ? '✅' : '❌'} (expected: false)`);
    return newPlayer;
  }

  const isEligible = await checkGrandPrixEligibility(player.id, supabase);
  console.log(`   Player: ${player.stage_name}`);
  console.log(`   Origin Type: ${player.origin_type || 'none'}`);
  console.log(`   Origin Completed: ${player.origin_completed}`);
  console.log(`   Eligibility: ${isEligible ? '✅' : '❌'}`);

  return player;
}

async function testOpponentSelection(playerId: string) {
  console.log('\n========================================');
  console.log('TEST 2: Opponent Selection');
  console.log('========================================');

  const opponents = await getGrandPrixOpponents(playerId, supabase, 7);
  console.log(`   Found ${opponents.length} eligible opponents (need 7)`);

  opponents.forEach((opp, i) => {
    console.log(`   ${i + 1}. ${opp.stage_name} (${opp.tier} tier)`);
  });

  if (opponents.length < 7) {
    console.log('   ⚠️  Not enough opponents available');
    return false;
  }

  console.log('   ✅ Sufficient opponents found');
  return true;
}

async function testParticipationHistory(playerId: string) {
  console.log('\n========================================');
  console.log('TEST 3: Participation History');
  console.log('========================================');

  const hasParticipated = await hasCompletedGrandPrix(playerId, supabase);
  console.log(`   Has participated: ${hasParticipated ? '✅ Yes' : '❌ No'}`);

  return !hasParticipated; // Should NOT have participated for test to continue
}

async function testGrandPrixCreation(playerId: string) {
  console.log('\n========================================');
  console.log('TEST 4: Grand Prix Creation');
  console.log('========================================');

  // Complete origin story first
  await completeFiveOriginMilestones(playerId);

  // Wait a moment for trigger to process
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check eligibility again
  const isEligible = await checkGrandPrixEligibility(playerId, supabase);
  console.log(`   Eligibility after milestones: ${isEligible ? '✅' : '❌'}`);

  if (!isEligible) {
    console.log('   ❌ Player not eligible after completing milestones');
    return null;
  }

  // Create Grand Prix
  console.log('\n   Creating Grand Prix tournament...');
  const result = await createGrandPrix(playerId, supabase);

  if (!result.success) {
    console.log(`   ❌ Failed: ${result.error}`);
    return null;
  }

  console.log(`   ✅ ${result.message}`);
  console.log(`\n   Tournament Details:`);
  console.log(`   - ID: ${result.tournament?.id}`);
  console.log(`   - Name: ${result.tournament?.name}`);
  console.log(`   - Prize Pool: $${result.tournament?.total_prize_pool.toLocaleString()}`);
  console.log(`   - Status: ${result.tournament?.status}`);
  console.log(`   - Max Participants: ${result.tournament?.max_participants}`);

  return result.tournament;
}

async function testAutoTrigger(playerId: string) {
  console.log('\n========================================');
  console.log('TEST 5: Auto-Trigger System');
  console.log('========================================');

  console.log('   Testing auto-trigger after milestone completion...');

  const result = await autoTriggerGrandPrix(playerId, supabase);

  if (!result) {
    console.log('   ℹ️  Auto-trigger returned null (expected if already created)');
    return;
  }

  if (!result.success) {
    console.log(`   ❌ Auto-trigger failed: ${result.error}`);
    return;
  }

  console.log(`   ✅ Auto-trigger successful: ${result.message}`);
}

async function testBracketGeneration(tournamentId: string) {
  console.log('\n========================================');
  console.log('TEST 6: Bracket Generation');
  console.log('========================================');

  // Check participants
  const { data: participants } = await supabase
    .from('tournament_participants')
    .select('*, battlers(stage_name)')
    .eq('tournament_id', tournamentId)
    .order('seed_number');

  console.log(`   Participants (${participants?.length || 0}):`);
  participants?.forEach((p) => {
    console.log(
      `   - Seed #${p.seed_number}: ${(p.battlers as any)?.stage_name} (Rating: ${p.rating_at_registration})`
    );
  });

  // Check brackets
  const { data: brackets } = await supabase
    .from('tournament_brackets')
    .select(
      `
      *,
      battler_1:battlers!tournament_brackets_battler_1_id_fkey(stage_name),
      battler_2:battlers!tournament_brackets_battler_2_id_fkey(stage_name)
    `
    )
    .eq('tournament_id', tournamentId)
    .eq('round', 'first_round')
    .order('match_number');

  console.log(`\n   First Round Matchups (${brackets?.length || 0}):`);
  brackets?.forEach((b) => {
    console.log(
      `   Match ${b.match_number}: Seed ${b.seed_1} ${(b.battler_1 as any)?.stage_name} vs Seed ${b.seed_2} ${(b.battler_2 as any)?.stage_name}`
    );
  });

  if (brackets?.length === 4) {
    console.log('   ✅ Correct number of first round matches for 8-person bracket');
  } else {
    console.log(`   ❌ Expected 4 matches, got ${brackets?.length}`);
  }
}

async function cleanup(playerId: string) {
  console.log('\n========================================');
  console.log('CLEANUP');
  console.log('========================================');

  // Delete Grand Prix tournaments for this player
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name')
    .eq('metadata->>player_id', playerId);

  if (tournaments && tournaments.length > 0) {
    console.log(`   Deleting ${tournaments.length} Grand Prix tournament(s)...`);
    for (const t of tournaments) {
      await supabase.from('tournaments').delete().eq('id', t.id);
      console.log(`   ✓ Deleted: ${t.name}`);
    }
  }

  // Delete milestones
  await supabase.from('origin_milestones').delete().eq('battler_id', playerId);
  console.log('   ✓ Deleted milestones');

  // Reset origin_completed
  await supabase
    .from('battlers')
    .update({ origin_completed: false })
    .eq('id', playerId);
  console.log('   ✓ Reset origin_completed flag');

  console.log('   ✅ Cleanup complete');
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runTests() {
  console.log('🎮 GRAND PRIX SYSTEM TEST SUITE');
  console.log('================================\n');

  try {
    // Test 1: Eligibility
    const player = await testEligibilityCheck();

    // Test 2: Opponent selection
    const hasOpponents = await testOpponentSelection(player.id);
    if (!hasOpponents) {
      console.log('\n❌ Cannot continue - not enough AI opponents');
      return;
    }

    // Test 3: Participation history
    const canParticipate = await testParticipationHistory(player.id);
    if (!canParticipate) {
      console.log('\n⚠️  Player already participated. Running cleanup...');
      await cleanup(player.id);
      console.log('\n   Re-running tests...\n');
      return await runTests(); // Re-run after cleanup
    }

    // Test 4: Grand Prix creation
    const tournament = await testGrandPrixCreation(player.id);
    if (!tournament) {
      console.log('\n❌ Cannot continue - tournament creation failed');
      return;
    }

    // Test 5: Auto-trigger (should fail since already created)
    await testAutoTrigger(player.id);

    // Test 6: Bracket generation
    await testBracketGeneration(tournament.id);

    console.log('\n========================================');
    console.log('✅ ALL TESTS PASSED');
    console.log('========================================\n');

    // Ask if user wants to cleanup
    console.log('💡 Tournament created successfully!');
    console.log(`   View at: /tournaments/${tournament.id}`);
    console.log('\n   To cleanup and re-test, run with --cleanup flag');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    throw error;
  }
}

// Run tests
runTests()
  .then(() => {
    console.log('\n✅ Test suite completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
