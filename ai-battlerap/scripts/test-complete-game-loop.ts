/**
 * Complete Game Loop Test - Two Battle Cycle
 *
 * Tests the full gameplay loop:
 * 1. Create fresh battler
 * 2. Generate and accept first battle
 * 3. Complete prep
 * 4. Simulate battle
 * 5. View results
 * 6. Generate and accept second battle
 * 7. Repeat
 *
 * Validates:
 * - Can play multiple battles consecutively
 * - Rating changes after battles
 * - Recent battles shown
 * - Game state consistency
 * - Progression tracking (wins/losses)
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

let TEST_USER_ID = ''; // Will be set when creating auth user

interface TestResults {
  characterCreation: boolean;
  firstBattleOffer: boolean;
  firstBattlePrep: boolean;
  firstBattleSim: boolean;
  firstBattleRatingChange: number;
  secondBattleOffer: boolean;
  secondBattlePrep: boolean;
  secondBattleSim: boolean;
  secondBattleRatingChange: number;
  finalRecord: { wins: number; losses: number };
  recentBattlesCount: number;
  stateConsistent: boolean;
  errors: string[];
}

const results: TestResults = {
  characterCreation: false,
  firstBattleOffer: false,
  firstBattlePrep: false,
  firstBattleSim: false,
  firstBattleRatingChange: 0,
  secondBattleOffer: false,
  secondBattlePrep: false,
  secondBattleSim: false,
  secondBattleRatingChange: 0,
  finalRecord: { wins: 0, losses: 0 },
  recentBattlesCount: 0,
  stateConsistent: true,
  errors: [],
};

let battlerId: string;
let leagueId: string;
let firstBattleId: string;
let secondBattleId: string;
let initialRating = 1200;
let afterFirstBattleRating = 0;

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  if (battlerId) {
    await supabase.from('battles').delete().or(`battler_player_id.eq.${battlerId},battler_ai_id.eq.${battlerId}`);
    await supabase.from('battlers').delete().eq('id', battlerId);
  }

  if (TEST_USER_ID) {
    await supabase.from('profiles').delete().eq('id', TEST_USER_ID);
    // Delete auth user (will cascade delete profile)
    await supabase.auth.admin.deleteUser(TEST_USER_ID);
  }
}

async function createCharacter() {
  console.log('\n📝 STEP 1: Creating new battler...');

  try {
    // Create auth user first using admin API
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'test-password-123',
      email_confirm: true,
      user_metadata: {
        display_name: 'Loop Test Player'
      }
    });

    if (authError) throw new Error(`Auth user creation failed: ${authError.message}`);

    // Store the user ID from auth
    TEST_USER_ID = authUser.user.id;

    // Create profile (should be auto-created by trigger, but let's ensure it exists)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: TEST_USER_ID, display_name: 'Loop Test Player' })
      .select()
      .single();

    if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);

    // Get league
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('short_code', 'SRC')
      .single();

    if (leagueError) throw new Error(`League fetch failed: ${leagueError.message}`);
    leagueId = league.id;

    // Create battler
    const { data: battler, error: battlerError } = await supabase
      .from('battlers')
      .insert({
        user_id: TEST_USER_ID,
        stage_name: 'Loop Test Battler',
        region: 'Test City',
        primary_league_id: leagueId,
        style_tags: ['technical_writer'],
        tier: 'low',
        is_ai: false,
      })
      .select()
      .single();

    if (battlerError) throw new Error(`Battler creation failed: ${battlerError.message}`);
    battlerId = battler.id;

    // Create attributes
    await supabase.from('battler_attributes').insert({
      battler_id: battlerId,
      writing: { lyricism: 7, wordplay: 6, creativity: 6, flow: 5 },
      performance: { stage_presence: 3, crowd_control: 3, delivery: 4 },
      personal: { financial_stability: 5, reputation: 5, family_bond: 6, preparation: 6 },
      resilience: 6,
      public_knowledge: 0,
    });

    // Create ranking
    await supabase.from('rankings').insert({
      battler_id: battlerId,
      rating: initialRating,
      wins: 0,
      losses: 0,
      streak: 0,
    });

    console.log(`✅ Character created: ${battler.stage_name} (${battlerId})`);
    console.log(`   Initial rating: ${initialRating}`);
    results.characterCreation = true;

  } catch (error: any) {
    console.error('❌ Character creation failed:', error.message);
    results.errors.push(`Character creation: ${error.message}`);
    throw error;
  }
}

async function generateAndAcceptBattle(battleNumber: number): Promise<string> {
  console.log(`\n📧 STEP ${battleNumber === 1 ? '2' : '5'}: Generating battle offer #${battleNumber}...`);

  try {
    // Find AI opponent
    const { data: aiOpponents, error: opponentError } = await supabase
      .from('battlers')
      .select('*, rankings(*)')
      .eq('is_ai', true)
      .eq('primary_league_id', leagueId)
      .eq('tier', 'low')
      .limit(5);

    if (opponentError || !aiOpponents || aiOpponents.length === 0) {
      throw new Error('No AI opponents found');
    }

    const opponent = aiOpponents[0];
    console.log(`   Found opponent: ${opponent.stage_name} (Rating: ${opponent.rankings?.rating || 'N/A'})`);

    // Create battle
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 14);
    const lockDate = new Date(scheduledDate);
    lockDate.setDate(lockDate.getDate() - 7);

    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .insert({
        league_id: leagueId,
        battler_player_id: battlerId,
        battler_ai_id: opponent.id,
        scheduled_at: scheduledDate.toISOString(),
        lock_prep_at: lockDate.toISOString(),
        status: 'offered',
        no_show_player: false,
      })
      .select()
      .single();

    if (battleError) throw new Error(`Battle creation failed: ${battleError.message}`);

    // Accept battle
    await supabase
      .from('battles')
      .update({ status: 'accepted' })
      .eq('id', battle.id);

    console.log(`✅ Battle #${battleNumber} created and accepted`);
    console.log(`   Opponent: ${opponent.stage_name}`);
    console.log(`   Battle ID: ${battle.id}`);

    if (battleNumber === 1) {
      results.firstBattleOffer = true;
      firstBattleId = battle.id;
    } else {
      results.secondBattleOffer = true;
      secondBattleId = battle.id;
    }

    return battle.id;

  } catch (error: any) {
    console.error(`❌ Battle #${battleNumber} offer failed:`, error.message);
    results.errors.push(`Battle ${battleNumber} offer: ${error.message}`);
    throw error;
  }
}

async function completePrep(battleId: string, battleNumber: number) {
  console.log(`\n📅 STEP ${battleNumber === 1 ? '3' : '6'}: Completing prep for battle #${battleNumber}...`);

  try {
    // Get battle info
    const { data: battle } = await supabase
      .from('battles')
      .select('battler_ai_id')
      .eq('id', battleId)
      .single();

    // Player prep schedule (focused strategy)
    const playerPrep = [
      { day_index: 0, focus: 'research' },
      { day_index: 1, focus: 'writing' },
      { day_index: 2, focus: 'writing' },
      { day_index: 3, focus: 'writing' },
      { day_index: 4, focus: 'performance' },
      { day_index: 5, focus: 'performance' },
      { day_index: 6, focus: 'rest' },
    ];

    const playerBlocks = playerPrep.map(p => ({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: p.day_index,
      focus: p.focus,
      auto_generated: false,
    }));

    await supabase.from('prep_blocks').insert(playerBlocks);

    // AI prep schedule (balanced)
    const aiPrep = [
      { day_index: 0, focus: 'writing' },
      { day_index: 1, focus: 'writing' },
      { day_index: 2, focus: 'performance' },
      { day_index: 3, focus: 'performance' },
      { day_index: 4, focus: 'rest' },
      { day_index: 5, focus: 'life' },
      { day_index: 6, focus: 'rest' },
    ];

    const aiBlocks = aiPrep.map(p => ({
      battle_id: battleId,
      battler_id: battle!.battler_ai_id,
      day_index: p.day_index,
      focus: p.focus,
      auto_generated: true,
    }));

    await supabase.from('prep_blocks').insert(aiBlocks);

    // Lock battle
    await supabase
      .from('battles')
      .update({ status: 'locked' })
      .eq('id', battleId);

    console.log(`✅ Prep completed for battle #${battleNumber}`);
    console.log('   Player: 1 Research, 3 Writing, 2 Performance, 1 Rest');
    console.log('   AI: 2 Writing, 2 Performance, 2 Rest, 1 Life');

    if (battleNumber === 1) {
      results.firstBattlePrep = true;
    } else {
      results.secondBattlePrep = true;
    }

  } catch (error: any) {
    console.error(`❌ Prep for battle #${battleNumber} failed:`, error.message);
    results.errors.push(`Battle ${battleNumber} prep: ${error.message}`);
    throw error;
  }
}

async function simulateBattle(battleId: string, battleNumber: number) {
  console.log(`\n⚔️  STEP ${battleNumber === 1 ? '4' : '7'}: Simulating battle #${battleNumber}...`);

  try {
    const { simulateBattle } = require('../lib/game/simulation');

    const startTime = Date.now();
    await simulateBattle(battleId, supabase);
    const duration = Date.now() - startTime;

    // Get battle results
    const { data: battle } = await supabase
      .from('battles')
      .select('*, player:battlers!battles_battler_player_id_fkey(stage_name), opponent:battlers!battles_battler_ai_id_fkey(stage_name)')
      .eq('id', battleId)
      .single();

    const isPlayerWinner = battle!.winner_battler_id === battlerId;

    // Get updated ranking
    const { data: ranking } = await supabase
      .from('rankings')
      .select('*')
      .eq('battler_id', battlerId)
      .single();

    const newRating = ranking!.rating;
    const ratingChange = battleNumber === 1
      ? newRating - initialRating
      : newRating - afterFirstBattleRating;

    if (battleNumber === 1) {
      afterFirstBattleRating = newRating;
      results.firstBattleRatingChange = ratingChange;
    } else {
      results.secondBattleRatingChange = ratingChange;
    }

    console.log(`✅ Battle #${battleNumber} simulation completed in ${duration}ms`);
    console.log(`   Winner: ${isPlayerWinner ? 'PLAYER ⭐' : 'AI OPPONENT'}`);
    console.log(`   Rating: ${battleNumber === 1 ? initialRating : afterFirstBattleRating} → ${newRating} (${ratingChange > 0 ? '+' : ''}${ratingChange})`);
    console.log(`   Record: ${ranking!.wins}W - ${ranking!.losses}L`);

    if (battleNumber === 1) {
      results.firstBattleSim = true;
    } else {
      results.secondBattleSim = true;
      results.finalRecord = { wins: ranking!.wins, losses: ranking!.losses };
    }

  } catch (error: any) {
    console.error(`❌ Battle #${battleNumber} simulation failed:`, error.message);
    results.errors.push(`Battle ${battleNumber} simulation: ${error.message}`);
    throw error;
  }
}

async function verifyDashboard() {
  console.log('\n📊 STEP 8: Verifying dashboard data...');

  try {
    // Get recent battles
    const { data: battles } = await supabase
      .from('battles')
      .select('*, opponent:battlers!battles_battler_ai_id_fkey(stage_name)')
      .eq('battler_player_id', battlerId)
      .order('created_at', { ascending: false });

    results.recentBattlesCount = battles?.length || 0;

    console.log(`✅ Dashboard verified`);
    console.log(`   Recent battles: ${results.recentBattlesCount}`);

    if (battles && battles.length > 0) {
      console.log('\n   Battle History:');
      battles.forEach((b, i) => {
        const isWin = b.winner_battler_id === battlerId;
        console.log(`   ${i + 1}. vs ${b.opponent.stage_name} - ${isWin ? 'WIN ✅' : 'LOSS ❌'}`);
      });
    }

    // Verify state consistency
    const { data: ranking } = await supabase
      .from('rankings')
      .select('*')
      .eq('battler_id', battlerId)
      .single();

    const totalBattles = ranking!.wins + ranking!.losses;
    results.stateConsistent = totalBattles === results.recentBattlesCount;

    if (!results.stateConsistent) {
      console.log(`⚠️  State inconsistency: ${totalBattles} battles in ranking, ${results.recentBattlesCount} in history`);
      results.errors.push('State inconsistency detected');
    }

  } catch (error: any) {
    console.error('❌ Dashboard verification failed:', error.message);
    results.errors.push(`Dashboard verification: ${error.message}`);
  }
}

async function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 COMPLETE GAME LOOP TEST REPORT');
  console.log('='.repeat(80));

  console.log('\n✅ TEST RESULTS:');
  console.log(`   Character Creation: ${results.characterCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   First Battle Offer: ${results.firstBattleOffer ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   First Battle Prep:  ${results.firstBattlePrep ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   First Battle Sim:   ${results.firstBattleSim ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Second Battle Offer: ${results.secondBattleOffer ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Second Battle Prep:  ${results.secondBattlePrep ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Second Battle Sim:   ${results.secondBattleSim ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   State Consistency:   ${results.stateConsistent ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\n📈 PROGRESSION TRACKING:');
  console.log(`   Initial Rating: ${initialRating}`);
  console.log(`   After Battle 1: ${afterFirstBattleRating} (${results.firstBattleRatingChange > 0 ? '+' : ''}${results.firstBattleRatingChange})`);
  console.log(`   After Battle 2: ${afterFirstBattleRating + results.secondBattleRatingChange} (${results.secondBattleRatingChange > 0 ? '+' : ''}${results.secondBattleRatingChange})`);
  console.log(`   Final Record: ${results.finalRecord.wins}W - ${results.finalRecord.losses}L`);
  console.log(`   Battles in History: ${results.recentBattlesCount}`);

  console.log('\n🎯 KEY VALIDATIONS:');
  console.log(`   ✔ Can play multiple battles consecutively: ${results.secondBattleSim ? 'YES' : 'NO'}`);
  console.log(`   ✔ Rating changes after battles: ${results.firstBattleRatingChange !== 0 || results.secondBattleRatingChange !== 0 ? 'YES' : 'NO'}`);
  console.log(`   ✔ Recent battles shown: ${results.recentBattlesCount === 2 ? 'YES' : 'NO'}`);
  console.log(`   ✔ State remains consistent: ${results.stateConsistent ? 'YES' : 'NO'}`);
  console.log(`   ✔ Progression tracked: ${results.finalRecord.wins + results.finalRecord.losses === 2 ? 'YES' : 'NO'}`);

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS ENCOUNTERED:');
    results.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err}`);
    });
  }

  const allTestsPassed =
    results.characterCreation &&
    results.firstBattleOffer &&
    results.firstBattlePrep &&
    results.firstBattleSim &&
    results.secondBattleOffer &&
    results.secondBattlePrep &&
    results.secondBattleSim &&
    results.stateConsistent &&
    results.errors.length === 0;

  console.log('\n' + '='.repeat(80));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED - GAME LOOP WORKS SMOOTHLY');
  } else {
    console.log('⚠️  SOME TESTS FAILED - SEE DETAILS ABOVE');
  }
  console.log('='.repeat(80) + '\n');
}

async function main() {
  console.log('🎮 Starting Complete Game Loop Test');
  console.log('Testing full two-battle cycle...\n');

  try {
    // Clean up any previous test data
    await cleanup();

    // Run the complete flow
    await createCharacter();

    // First battle
    await generateAndAcceptBattle(1);
    await completePrep(firstBattleId, 1);
    await simulateBattle(firstBattleId, 1);

    // Second battle
    await generateAndAcceptBattle(2);
    await completePrep(secondBattleId, 2);
    await simulateBattle(secondBattleId, 2);

    // Verify everything
    await verifyDashboard();

    // Print final report
    await printReport();

  } catch (error: any) {
    console.error('\n❌ Test suite failed:', error.message);
    await printReport();
    process.exit(1);
  } finally {
    // Optional: Comment out to inspect data
    // await cleanup();
  }
}

main();
