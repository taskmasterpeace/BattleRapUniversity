/**
 * End-to-End Test for Round Content Selection System
 *
 * Tests the full battle flow with both Locked In and Auto modes.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const API_BASE = 'http://localhost:3006/api';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TestBattle {
  id: string;
  battler_player_id: string;
  battler_ai_id: string;
  league_id: string;
  status: string;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function createTestBattle(): Promise<TestBattle | null> {
  console.log('\n🔧 Creating test battle...');

  // Get first league
  const { data: leagues } = await supabase
    .from('leagues')
    .select('*')
    .limit(1)
    .single();

  if (!leagues) {
    console.error('❌ No leagues found');
    return null;
  }

  // Get two battlers
  const { data: battlers } = await supabase
    .from('battlers')
    .select('*')
    .limit(2);

  if (!battlers || battlers.length < 2) {
    console.error('❌ Not enough battlers found');
    return null;
  }

  // Create battle
  const { data: battle, error} = await supabase
    .from('battles')
    .insert({
      battler_player_id: battlers[0].id,
      battler_ai_id: battlers[1].id,
      league_id: leagues.id,
      status: 'locked',
      lock_prep_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create battle:', error);
    return null;
  }

  console.log(`✅ Battle created: ${battle.id}`);
  console.log(`   Player: ${battlers[0].battle_rap_name}`);
  console.log(`   AI: ${battlers[1].battle_rap_name}`);
  console.log(`   League: ${leagues.name}`);

  return battle as TestBattle;
}

async function testLockedInMode(battleId: string): Promise<boolean> {
  console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          TESTING: LOCKED IN MODE                             ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;

  // STEP 1: Choose Locked In mode
  console.log('📍 Step 1: Choosing Locked In mode...');
  const lockInResponse = await fetch(`${API_BASE}/battles/${battleId}/lock-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lockedIn: true,
      context: 'ppv'
    }),
  });

  if (!lockInResponse.ok) {
    console.log(`❌ Lock-in failed: ${lockInResponse.status}`);
    failed++;
    return false;
  }

  const lockInData = await lockInResponse.json();
  console.log(`✅ Lock-in successful`);
  console.log(`   Status: ${lockInData.battle.status}`);
  console.log(`   Context: ${lockInData.battle.context}`);
  console.log(`   Current Round: ${lockInData.battle.current_round_index}`);
  passed++;

  if (lockInData.battle.status !== 'awaiting_r1_content') {
    console.log(`❌ Expected status 'awaiting_r1_content', got '${lockInData.battle.status}'`);
    failed++;
    return false;
  }

  // STEP 2: Select content for Round 1
  console.log('\n📍 Step 2: Selecting content for Round 1...');
  const r1ContentResponse = await fetch(`${API_BASE}/battles/${battleId}/rounds/1/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentTypes: ['wordplay', 'schemes', 'punchlines'],
      deliveryTypes: ['smooth_flow'],
      performanceTypes: ['stage_presence'],
    }),
  });

  if (!r1ContentResponse.ok) {
    console.log(`❌ Round 1 content selection failed: ${r1ContentResponse.status}`);
    const errorText = await r1ContentResponse.text();
    console.log(`   Error: ${errorText}`);
    failed++;
    return false;
  }

  const r1ContentData = await r1ContentResponse.json();
  console.log(`✅ Round 1 content selected`);
  console.log(`   Content: ${r1ContentData.selection.contentTypes.join(', ')}`);
  console.log(`   Delivery: ${r1ContentData.selection.deliveryTypes.join(', ')}`);
  console.log(`   Performance: ${r1ContentData.selection.performanceTypes.join(', ')}`);
  console.log(`\n   Forecast:`);
  console.log(`     Effectiveness: ${r1ContentData.forecast.averageEffectiveness.toFixed(2)}x`);
  console.log(`     Crowd: ${r1ContentData.forecast.crowdPreference.toFixed(2)}x`);
  console.log(`     Context: ${r1ContentData.forecast.contextModifier.toFixed(2)}x`);
  console.log(`     Final Multiplier: ${r1ContentData.forecast.finalMultiplier.toFixed(2)}x`);
  passed++;

  // STEP 3: Simulate Round 1
  console.log('\n📍 Step 3: Simulating Round 1...');
  const r1SimResponse = await fetch(`${API_BASE}/battles/${battleId}/rounds/1/simulate`, {
    method: 'POST',
  });

  if (!r1SimResponse.ok) {
    console.log(`❌ Round 1 simulation failed: ${r1SimResponse.status}`);
    const errorText = await r1SimResponse.text();
    console.log(`   Error: ${errorText}`);
    failed++;
    return false;
  }

  const r1SimData = await r1SimResponse.json();
  console.log(`✅ Round 1 simulated`);
  console.log(`   Player Score: ${r1SimData.round.player_score}`);
  console.log(`   AI Score: ${r1SimData.round.ai_score}`);
  console.log(`   Winner: ${r1SimData.round.winner}`);
  console.log(`   Effectiveness: ${r1SimData.round.effectiveness_multiplier?.toFixed(2) || 'N/A'}x`);
  console.log(`   Final Multiplier: ${r1SimData.round.final_multiplier?.toFixed(2) || 'N/A'}x`);
  passed++;

  // Verify battle status updated
  const { data: battle } = await supabase
    .from('battles')
    .select('status, current_round_index')
    .eq('id', battleId)
    .single();

  console.log(`\n   Battle Status: ${battle?.status}`);
  console.log(`   Current Round: ${battle?.current_round_index}`);

  if (battle?.status !== 'awaiting_r2_content') {
    console.log(`❌ Expected status 'awaiting_r2_content', got '${battle?.status}'`);
    failed++;
  } else {
    passed++;
  }

  // STEP 4: Select content for Round 2
  console.log('\n📍 Step 4: Selecting content for Round 2...');
  const r2ContentResponse = await fetch(`${API_BASE}/battles/${battleId}/rounds/2/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentTypes: ['wordplay', 'schemes', 'personals', 'rebuttals'],
      deliveryTypes: ['smooth_flow'],
      performanceTypes: ['stage_presence', 'strategic_pauses'],
    }),
  });

  if (!r2ContentResponse.ok) {
    console.log(`❌ Round 2 content selection failed: ${r2ContentResponse.status}`);
    failed++;
    return false;
  }

  const r2ContentData = await r2ContentResponse.json();
  console.log(`✅ Round 2 content selected (4 content, 1 delivery, 2 performance)`);
  console.log(`   Final Multiplier: ${r2ContentData.forecast.finalMultiplier.toFixed(2)}x`);
  passed++;

  // STEP 5: Simulate Round 2
  console.log('\n📍 Step 5: Simulating Round 2...');
  const r2SimResponse = await fetch(`${API_BASE}/battles/${battleId}/rounds/2/simulate`, {
    method: 'POST',
  });

  if (!r2SimResponse.ok) {
    console.log(`❌ Round 2 simulation failed: ${r2SimResponse.status}`);
    failed++;
    return false;
  }

  const r2SimData = await r2SimResponse.json();
  console.log(`✅ Round 2 simulated`);
  console.log(`   Winner: ${r2SimData.round.winner}`);
  passed++;

  // STEP 6: Select content for Round 3
  console.log('\n📍 Step 6: Selecting content for Round 3...');
  const r3ContentResponse = await fetch(`${API_BASE}/battles/${battleId}/rounds/3/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentTypes: ['wordplay', 'schemes', 'punchlines'],
      deliveryTypes: ['smooth_flow', 'passionate'],
      performanceTypes: ['stage_presence', 'charismatic'],
    }),
  });

  if (!r3ContentResponse.ok) {
    console.log(`❌ Round 3 content selection failed: ${r3ContentResponse.status}`);
    failed++;
    return false;
  }

  const r3ContentData = await r3ContentResponse.json();
  console.log(`✅ Round 3 content selected (3 content, 2 delivery, 2 performance)`);
  console.log(`   Final Multiplier: ${r3ContentData.forecast.finalMultiplier.toFixed(2)}x`);
  passed++;

  // STEP 7: Simulate Round 3
  console.log('\n📍 Step 7: Simulating Round 3 (final round)...');
  const r3SimResponse = await fetch(`${API_BASE}/battles/${battleId}/rounds/3/simulate`, {
    method: 'POST',
  });

  if (!r3SimResponse.ok) {
    console.log(`❌ Round 3 simulation failed: ${r3SimResponse.status}`);
    failed++;
    return false;
  }

  const r3SimData = await r3SimResponse.json();
  console.log(`✅ Round 3 simulated`);
  console.log(`   Winner: ${r3SimData.round.winner}`);
  passed++;

  // Verify battle completed
  const { data: finalBattle } = await supabase
    .from('battles')
    .select('status, winner_battler_id')
    .eq('id', battleId)
    .single();

  console.log(`\n📊 Final Battle Status:`);
  console.log(`   Status: ${finalBattle?.status}`);
  console.log(`   Winner: ${finalBattle?.winner_battler_id ? 'Determined' : 'Unknown'}`);

  if (finalBattle?.status !== 'completed' && finalBattle?.status !== 'simulated') {
    console.log(`❌ Expected battle to be completed or simulated`);
    failed++;
  } else {
    passed++;
  }

  // Verify round content selections were stored
  const { data: selections } = await supabase
    .from('round_content_selections')
    .select('*')
    .eq('battle_id', battleId)
    .order('round_index');

  console.log(`\n📋 Content Selections Stored: ${selections?.length || 0}/6 (3 rounds × 2 battlers)`);
  if (selections && selections.length === 6) {
    console.log(`✅ All content selections stored correctly`);
    passed++;
  } else {
    console.log(`❌ Expected 6 content selections, got ${selections?.length || 0}`);
    failed++;
  }

  // Summary
  console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║           LOCKED IN MODE TEST RESULTS                        ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ❌`);
  console.log(`   Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  return failed === 0;
}

async function testAutoMode(battleId: string): Promise<boolean> {
  console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║              TESTING: AUTO MODE                              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;

  // STEP 1: Choose Auto mode
  console.log('📍 Step 1: Choosing Auto mode...');
  const autoResponse = await fetch(`${API_BASE}/battles/${battleId}/lock-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lockedIn: false,
      context: 'on_cam'
    }),
  });

  if (!autoResponse.ok) {
    console.log(`❌ Auto mode selection failed: ${autoResponse.status}`);
    failed++;
    return false;
  }

  const autoData = await autoResponse.json();
  console.log(`✅ Auto mode activated`);
  console.log(`   Status: ${autoData.battle.status}`);
  console.log(`   Context: ${autoData.battle.context}`);
  passed++;

  // STEP 2: Verify all rounds were auto-selected and simulated
  console.log('\n📍 Step 2: Verifying auto-simulation...');

  const { data: battle } = await supabase
    .from('battles')
    .select('status, winner_battler_id')
    .eq('id', battleId)
    .single();

  console.log(`   Battle Status: ${battle?.status}`);

  if (battle?.status !== 'completed' && battle?.status !== 'simulated') {
    console.log(`❌ Expected battle to be completed/simulated, got '${battle?.status}'`);
    failed++;
  } else {
    console.log(`✅ Battle auto-simulated successfully`);
    passed++;
  }

  // STEP 3: Verify content selections were stored
  const { data: selections } = await supabase
    .from('round_content_selections')
    .select('*')
    .eq('battle_id', battleId)
    .order('round_index');

  console.log(`\n📍 Step 3: Verifying content selections...`);
  console.log(`   Selections Stored: ${selections?.length || 0}/6`);

  if (selections && selections.length === 6) {
    console.log(`✅ All content auto-selected correctly`);

    // Verify all are marked as auto_selected
    const allAuto = selections.every(s => s.auto_selected === true);
    if (allAuto) {
      console.log(`✅ All selections marked as auto_selected`);
      passed += 2;
    } else {
      console.log(`❌ Some selections not marked as auto_selected`);
      failed++;
    }
  } else {
    console.log(`❌ Expected 6 selections, got ${selections?.length || 0}`);
    failed++;
  }

  // STEP 4: Verify rounds were simulated
  const { data: rounds } = await supabase
    .from('battle_rounds')
    .select('*')
    .eq('battle_id', battleId)
    .order('round_index');

  console.log(`\n📍 Step 4: Verifying round results...`);
  console.log(`   Rounds Completed: ${rounds?.length || 0}/3`);

  if (rounds && rounds.length === 3) {
    console.log(`✅ All rounds simulated`);

    // Display round winners
    rounds.forEach((round, i) => {
      console.log(`   Round ${i + 1}: ${round.winner} (${round.player_score} vs ${round.ai_score})`);
      console.log(`     Multipliers - Effectiveness: ${round.effectiveness_multiplier?.toFixed(2) || 'N/A'}x, Final: ${round.final_multiplier?.toFixed(2) || 'N/A'}x`);
    });
    passed++;
  } else {
    console.log(`❌ Expected 3 rounds, got ${rounds?.length || 0}`);
    failed++;
  }

  // Summary
  console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║             AUTO MODE TEST RESULTS                           ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ❌`);
  console.log(`   Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  return failed === 0;
}

// =====================================================
// MAIN TEST RUNNER
// =====================================================

async function runE2ETests() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║     ROUND CONTENT SELECTION - END-TO-END TESTS                ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  try {
    // Test 1: Locked In Mode
    const battle1 = await createTestBattle();
    if (!battle1) {
      console.error('\n❌ Failed to create test battle for Locked In mode');
      return;
    }

    const lockedInSuccess = await testLockedInMode(battle1.id);

    // Test 2: Auto Mode
    const battle2 = await createTestBattle();
    if (!battle2) {
      console.error('\n❌ Failed to create test battle for Auto mode');
      return;
    }

    const autoSuccess = await testAutoMode(battle2.id);

    // Final Summary
    console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                 FINAL E2E TEST SUMMARY                       ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log(`\n   Locked In Mode: ${lockedInSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Auto Mode:      ${autoSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`\n   Overall:        ${lockedInSuccess && autoSuccess ? '🎉 ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}`);

  } catch (error) {
    console.error('\n❌ E2E Test Error:', error);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runE2ETests();
}

export { runE2ETests, testLockedInMode, testAutoMode };
