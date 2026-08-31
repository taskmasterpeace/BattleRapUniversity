/**
 * Comprehensive System Validation with Diverse Battler Profiles
 *
 * This script tests the updated choke/stumble system with 10-15 diverse battler profiles
 * representing different build strategies, attribute ranges, and badge combinations.
 *
 * VALIDATION TARGETS:
 * - Average battler (5 prep): ~7% choke rate
 * - Known Choker (5 prep): ~46% choke rate
 * - Stumble rate: ~40% of battles
 * - System responds to prep variation (0, 2, 5, 10 days)
 * - System responds to resilience variation (3, 5, 7, 9)
 * - Badge effects are meaningful
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { simulateBattle } from './simulation';
import type { League } from '@/lib/models';

// ============================================================================
// DIVERSE BATTLER PROFILES
// ============================================================================

interface TestProfile {
  name: string;
  archetype: string;
  attributes: {
    writing: { lyricism: number; wordplay: number; creativity: number; flow: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { financial_stability: number; reputation: number; family_bond: number; preparation: number };
    resilience: number;
  };
  badges: string[];
  expectedChokeRate: { min: number; max: number; target: number };
  description: string;
}

const TEST_PROFILES: TestProfile[] = [
  {
    name: 'Known Choker (Average Stats)',
    archetype: 'Choker',
    attributes: {
      writing: { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
      performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
      personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
      resilience: 5,
    },
    badges: ['Known Choker'],
    expectedChokeRate: { min: 0.40, max: 0.52, target: 0.46 },
    description: 'Classic choker with average attributes - primary test case',
  },
  {
    name: 'Average Battler (Balanced)',
    archetype: 'Balanced',
    attributes: {
      writing: { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
      performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
      personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
      resilience: 5,
    },
    badges: [],
    expectedChokeRate: { min: 0.05, max: 0.09, target: 0.07 },
    description: 'Baseline battler with no special badges',
  },
  {
    name: 'Clutch Performer (High Resilience)',
    archetype: 'Clutch',
    attributes: {
      writing: { lyricism: 6, wordplay: 6, creativity: 6, flow: 6 },
      performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
      personal: { financial_stability: 6, reputation: 6, family_bond: 6, preparation: 6 },
      resilience: 8,
    },
    badges: ['Clutch Performer'],
    expectedChokeRate: { min: 0.02, max: 0.05, target: 0.03 },
    description: 'Anti-choker with high resilience and clutch badge',
  },
  {
    name: 'Pure Writer (Low Performance)',
    archetype: 'Writing Build',
    attributes: {
      writing: { lyricism: 8, wordplay: 7, creativity: 8, flow: 6 },
      performance: { stage_presence: 3, crowd_control: 3, delivery: 4 },
      personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
      resilience: 5,
    },
    badges: ['Technical Writer', 'Scheme Specialist'],
    expectedChokeRate: { min: 0.05, max: 0.10, target: 0.07 },
    description: 'Writing-focused build - should excel in Small Room',
  },
  {
    name: 'Pure Performer (Low Writing)',
    archetype: 'Performance Build',
    attributes: {
      writing: { lyricism: 3, wordplay: 3, creativity: 4, flow: 4 },
      performance: { stage_presence: 8, crowd_control: 8, delivery: 7 },
      personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
      resilience: 5,
    },
    badges: ['Stage Domination', 'Crowd Favorite'],
    expectedChokeRate: { min: 0.05, max: 0.10, target: 0.07 },
    description: 'Performance-focused build - should excel in Main Stage',
  },
  {
    name: 'Freestyle Genius (Low Prep Bonus)',
    archetype: 'Freestyler',
    attributes: {
      writing: { lyricism: 5, wordplay: 6, creativity: 7, flow: 6 },
      performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
      personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
      resilience: 6,
    },
    badges: ['Freestyle Genius'],
    expectedChokeRate: { min: 0.03, max: 0.06, target: 0.04 },
    description: 'Thrives on minimal prep - should have low choke rate with low prep',
  },
  {
    name: 'Low Resilience Grinder',
    archetype: 'Low Resilience',
    attributes: {
      writing: { lyricism: 6, wordplay: 6, creativity: 6, flow: 5 },
      performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
      personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
      resilience: 3,
    },
    badges: ['Consistent Writer'],
    expectedChokeRate: { min: 0.10, max: 0.18, target: 0.14 },
    description: 'Low resilience should increase choke risk despite consistency',
  },
  {
    name: 'High Resilience Veteran',
    archetype: 'High Resilience',
    attributes: {
      writing: { lyricism: 6, wordplay: 6, creativity: 6, flow: 6 },
      performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
      personal: { financial_stability: 7, reputation: 7, family_bond: 7, preparation: 6 },
      resilience: 9,
    },
    badges: ['Respected Veteran', 'Resilient Battler'],
    expectedChokeRate: { min: 0.01, max: 0.04, target: 0.02 },
    description: 'Very high resilience with supporting badges',
  },
  {
    name: 'Financial Struggles (Low Money)',
    archetype: 'Financial Pressure',
    attributes: {
      writing: { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
      performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
      personal: { financial_stability: 2, reputation: 5, family_bond: 5, preparation: 5 },
      resilience: 5,
    },
    badges: ['Financial Struggles'],
    expectedChokeRate: { min: 0.08, max: 0.14, target: 0.11 },
    description: 'Financial pressure should increase choke risk with low prep',
  },
  {
    name: 'Glass Cannon (High Peaks)',
    archetype: 'Inconsistent',
    attributes: {
      writing: { lyricism: 8, wordplay: 8, creativity: 7, flow: 6 },
      performance: { stage_presence: 7, crowd_control: 6, delivery: 7 },
      personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
      resilience: 4,
    },
    badges: ['Punchline King/Queen', 'Inconsistent Performer'],
    expectedChokeRate: { min: 0.12, max: 0.20, target: 0.16 },
    description: 'High variance, lower resilience - should have higher choke rate',
  },
  {
    name: 'Substance Issues (Multiple Pressures)',
    archetype: 'Multiple Issues',
    attributes: {
      writing: { lyricism: 6, wordplay: 5, creativity: 6, flow: 5 },
      performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
      personal: { financial_stability: 3, reputation: 4, family_bond: 4, preparation: 4 },
      resilience: 4,
    },
    badges: ['Substance Issues'],
    expectedChokeRate: { min: 0.15, max: 0.25, target: 0.20 },
    description: 'Multiple negative factors should compound choke risk',
  },
  {
    name: 'Consummate Professional',
    archetype: 'Elite Professional',
    attributes: {
      writing: { lyricism: 7, wordplay: 7, creativity: 7, flow: 7 },
      performance: { stage_presence: 7, crowd_control: 7, delivery: 7 },
      personal: { financial_stability: 8, reputation: 8, family_bond: 7, preparation: 7 },
      resilience: 8,
    },
    badges: ['Consummate Professional', 'Battle Technician'],
    expectedChokeRate: { min: 0.01, max: 0.03, target: 0.02 },
    description: 'Top-tier battler with excellent prep efficiency',
  },
  {
    name: 'Comedy Specialist',
    archetype: 'Comedy Build',
    attributes: {
      writing: { lyricism: 5, wordplay: 7, creativity: 7, flow: 6 },
      performance: { stage_presence: 7, crowd_control: 8, delivery: 6 },
      personal: { financial_stability: 5, reputation: 6, family_bond: 6, preparation: 5 },
      resilience: 6,
    },
    badges: ['Comedy', 'Charismatic'],
    expectedChokeRate: { min: 0.04, max: 0.08, target: 0.06 },
    description: 'Crowd-oriented build with good rest efficiency',
  },
  {
    name: 'Angle Master (Research Heavy)',
    archetype: 'Angle Specialist',
    attributes: {
      writing: { lyricism: 6, wordplay: 5, creativity: 7, flow: 5 },
      performance: { stage_presence: 5, crowd_control: 5, delivery: 6 },
      personal: { financial_stability: 6, reputation: 6, family_bond: 5, preparation: 6 },
      resilience: 6,
    },
    badges: ['Angle Master', 'Battle Technician'],
    expectedChokeRate: { min: 0.04, max: 0.08, target: 0.06 },
    description: 'Research-focused with good prep bonuses',
  },
  {
    name: 'Underprepared Choker',
    archetype: 'Worst Case',
    attributes: {
      writing: { lyricism: 4, wordplay: 4, creativity: 4, flow: 4 },
      performance: { stage_presence: 4, crowd_control: 4, delivery: 4 },
      personal: { financial_stability: 3, reputation: 4, family_bond: 4, preparation: 3 },
      resilience: 3,
    },
    badges: ['Known Choker', 'Underprepared'],
    expectedChokeRate: { min: 0.50, max: 0.70, target: 0.60 },
    description: 'Worst-case scenario with compounding negative factors',
  },
];

// Prep variation levels to test
const PREP_LEVELS = [
  { days: 0, name: 'No Prep' },
  { days: 2, name: 'Low Prep' },
  { days: 5, name: 'Moderate Prep' },
  { days: 10, name: 'High Prep' },
];

// ============================================================================
// TEST RUNNER
// ============================================================================

interface ProfileTestResult {
  profile: TestProfile;
  prepLevel: { days: number; name: string };
  battlesRun: number;
  chokeCount: number;
  stumbleCount: number;
  chokeRate: number;
  stumbleRate: number;
  passed: boolean;
}

export async function runComprehensiveSystemValidation(
  battlesPerProfile: number = 30,
  testAllPrepLevels: boolean = false
): Promise<void> {
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE SYSTEM VALIDATION WITH DIVERSE BATTLER PROFILES');
  console.log('='.repeat(80));
  console.log();
  console.log(`Testing ${TEST_PROFILES.length} diverse battler profiles`);
  console.log(`Battles per profile/prep level: ${battlesPerProfile}`);
  console.log(`Testing prep variation: ${testAllPrepLevels ? 'YES (0, 2, 5, 10 days)' : 'NO (5 days only)'}`);
  console.log();
  console.log('TARGET VALIDATION:');
  console.log('  - Average battler (5 prep): ~7% choke rate');
  console.log('  - Known Choker (5 prep): ~46% choke rate');
  console.log('  - Stumble rate: ~40% of battles');
  console.log('='.repeat(80));
  console.log();

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

  // Load leagues
  const { data: leagues } = await supabase.from('leagues').select('*');
  if (!leagues || leagues.length === 0) {
    throw new Error('No leagues found in database');
  }

  const smallRoom = leagues.find((l) => l.short_code === 'SRC') || leagues[0];

  const results: ProfileTestResult[] = [];

  // Determine which prep levels to test
  const prepLevelsToTest = testAllPrepLevels
    ? PREP_LEVELS
    : [PREP_LEVELS[2]]; // Just moderate prep (5 days)

  // Run tests for each profile at each prep level
  for (let profileIdx = 0; profileIdx < TEST_PROFILES.length; profileIdx++) {
    const profile = TEST_PROFILES[profileIdx];

    for (const prepLevel of prepLevelsToTest) {
      console.log(`\n[${ profileIdx + 1}/${TEST_PROFILES.length}] ${profile.name} - ${prepLevel.name} (${prepLevel.days} days)`);
      console.log(`  Archetype: ${profile.archetype}`);
      console.log(`  Resilience: ${profile.attributes.resilience}`);
      console.log(`  Badges: ${profile.badges.length > 0 ? profile.badges.join(', ') : 'None'}`);
      console.log(`  Expected choke: ${(profile.expectedChokeRate.target * 100).toFixed(0)}% (${(profile.expectedChokeRate.min * 100).toFixed(0)}-${(profile.expectedChokeRate.max * 100).toFixed(0)}%)`);
      console.log(`  Description: ${profile.description}`);
      console.log('  ' + '-'.repeat(76));

      const result = await runProfileTest(
        supabase,
        profile,
        prepLevel,
        smallRoom,
        battlesPerProfile
      );

      results.push(result);
      printProfileResult(result);
    }
  }

  // Print comprehensive summary
  printComprehensiveSummary(results, testAllPrepLevels);

  console.log('\nValidation complete!');
}

async function runProfileTest(
  supabase: any,
  profile: TestProfile,
  prepLevel: { days: number; name: string },
  league: League,
  battleCount: number
): Promise<ProfileTestResult> {
  let chokeCount = 0;
  let stumbleCount = 0;

  // Create test battler
  const battlerId = await createProfileBattler(supabase, profile, league.id);

  for (let i = 0; i < battleCount; i++) {
    process.stdout.write(`  Battle ${i + 1}/${battleCount}...`);

    try {
      // Create opponent (average battler)
      const opponentId = await createOpponent(supabase, league.id);

      // Create battle
      const battle = await createTestBattle(supabase, battlerId, opponentId, league.id);

      // Create prep blocks
      await createPrepBlocks(supabase, battle.id, battlerId, prepLevel.days);
      await createPrepBlocks(supabase, battle.id, opponentId, 5); // Opponent gets moderate prep

      // Run simulation
      await simulateBattle(battle.id, supabase);

      // Collect segment-level data
      const { data: segments } = await supabase
        .from('battle_segments')
        .select('*')
        .eq('battle_id', battle.id)
        .eq('battler_id', battlerId);

      if (segments) {
        const hasStumble = segments.some(
          (s: any) => s.event_flags && s.event_flags.includes('stumble')
        );
        const hasChoke = segments.some(
          (s: any) => s.event_flags && s.event_flags.includes('choke')
        );

        if (hasStumble) stumbleCount++;
        if (hasChoke) chokeCount++;

        console.log(` ✓ (S:${hasStumble ? 'Y' : 'N'}, C:${hasChoke ? 'Y' : 'N'})`);
      }

      // Cleanup battle data
      await supabase.from('battle_segments').delete().eq('battle_id', battle.id);
      await supabase.from('battle_rounds').delete().eq('battle_id', battle.id);
      await supabase.from('prep_blocks').delete().eq('battle_id', battle.id);
      await supabase.from('battles').delete().eq('id', battle.id);

      // Cleanup opponent
      await supabase.from('rankings').delete().eq('battler_id', opponentId);
      await supabase.from('battler_attributes').delete().eq('battler_id', opponentId);
      await supabase.from('battlers').delete().eq('id', opponentId);
    } catch (error: any) {
      console.log(` ✗ Error: ${error.message}`);
    }
  }

  // Cleanup test battler
  await supabase.from('rankings').delete().eq('battler_id', battlerId);
  await supabase.from('battler_attributes').delete().eq('battler_id', battlerId);
  await supabase.from('battlers').delete().eq('id', battlerId);

  const chokeRate = chokeCount / battleCount;
  const stumbleRate = stumbleCount / battleCount;
  const passed = chokeRate >= profile.expectedChokeRate.min && chokeRate <= profile.expectedChokeRate.max;

  return {
    profile,
    prepLevel,
    battlesRun: battleCount,
    chokeCount,
    stumbleCount,
    chokeRate,
    stumbleRate,
    passed,
  };
}

async function createProfileBattler(
  supabase: any,
  profile: TestProfile,
  leagueId: string
): Promise<string> {
  const { data: battler } = await supabase
    .from('battlers')
    .insert({
      stage_name: `Test_${profile.name.replace(/\s+/g, '_')}_${Date.now()}_${Math.random()}`,
      primary_league_id: leagueId,
      is_ai: true,
      tier: 'mid',
      style_tags: profile.badges,
    })
    .select()
    .single();

  await supabase.from('battler_attributes').insert({
    battler_id: battler.id,
    writing: profile.attributes.writing,
    performance: profile.attributes.performance,
    personal: profile.attributes.personal,
    resilience: profile.attributes.resilience,
    public_knowledge: 50,
    xp: {},
  });

  await supabase.from('rankings').insert({
    battler_id: battler.id,
    rating: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
  });

  return battler.id;
}

async function createOpponent(
  supabase: any,
  leagueId: string
): Promise<string> {
  const { data: battler } = await supabase
    .from('battlers')
    .insert({
      stage_name: `Opponent_${Date.now()}_${Math.random()}`,
      primary_league_id: leagueId,
      is_ai: true,
      tier: 'mid',
      style_tags: [],
    })
    .select()
    .single();

  await supabase.from('battler_attributes').insert({
    battler_id: battler.id,
    writing: { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
    performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
    personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
    resilience: 5,
    public_knowledge: 50,
    xp: {},
  });

  await supabase.from('rankings').insert({
    battler_id: battler.id,
    rating: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
  });

  return battler.id;
}

async function createTestBattle(
  supabase: any,
  battler1Id: string,
  battler2Id: string,
  leagueId: string
): Promise<any> {
  const now = new Date();
  const scheduled = new Date(now.getTime() - 1000 * 60 * 60);
  const lockPrep = new Date(now.getTime() - 1000 * 60 * 5);

  const { data: battle } = await supabase
    .from('battles')
    .insert({
      league_id: leagueId,
      battler_player_id: battler1Id,
      battler_ai_id: battler2Id,
      scheduled_at: scheduled.toISOString(),
      lock_prep_at: lockPrep.toISOString(),
      status: 'accepted',
      no_show_player: false,
    })
    .select()
    .single();

  return battle;
}

async function createPrepBlocks(
  supabase: any,
  battleId: string,
  battlerId: string,
  totalDays: number
): Promise<void> {
  const blocks: any[] = [];

  if (totalDays === 0) {
    // For 0 prep, add one rest day to avoid forfeit
    blocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: 1,
      focus: 'rest',
      auto_generated: true,
    });
  } else {
    // Split evenly between writing and performance
    const writingDays = Math.ceil(totalDays / 2);
    const performanceDays = totalDays - writingDays;

    let dayIndex = 1;

    for (let i = 0; i < writingDays; i++) {
      blocks.push({
        battle_id: battleId,
        battler_id: battlerId,
        day_index: dayIndex++,
        focus: 'writing',
        auto_generated: true,
      });
    }

    for (let i = 0; i < performanceDays; i++) {
      blocks.push({
        battle_id: battleId,
        battler_id: battlerId,
        day_index: dayIndex++,
        focus: 'performance',
        auto_generated: true,
      });
    }
  }

  await supabase.from('prep_blocks').insert(blocks);
}

function printProfileResult(result: ProfileTestResult): void {
  const statusIcon = result.passed ? '✓' : '✗';
  const statusColor = result.passed ? 'PASSED' : 'FAILED';

  console.log();
  console.log(`  RESULTS: ${statusIcon} ${statusColor}`);
  console.log(`    Stumbles: ${result.stumbleCount}/${result.battlesRun} (${(result.stumbleRate * 100).toFixed(1)}%)`);
  console.log(`    Chokes: ${result.chokeCount}/${result.battlesRun} (${(result.chokeRate * 100).toFixed(1)}%)`);
  console.log(`    Expected: ${(result.profile.expectedChokeRate.target * 100).toFixed(0)}% (${(result.profile.expectedChokeRate.min * 100).toFixed(0)}-${(result.profile.expectedChokeRate.max * 100).toFixed(0)}%)`);
  console.log();
}

function printComprehensiveSummary(results: ProfileTestResult[], testedAllPrepLevels: boolean): void {
  console.log();
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE VALIDATION SUMMARY');
  console.log('='.repeat(80));
  console.log();

  // Critical tests
  const knownChoker5Prep = results.find(
    r => r.profile.archetype === 'Choker' && r.prepLevel.days === 5
  );
  const average5Prep = results.find(
    r => r.profile.archetype === 'Balanced' && r.prepLevel.days === 5
  );

  console.log('CRITICAL TESTS (5 days prep):');
  console.log('-'.repeat(80));
  if (knownChoker5Prep) {
    console.log(`Known Choker: ${(knownChoker5Prep.chokeRate * 100).toFixed(1)}%`);
    console.log(`  Target: 46% (range: 40-52%)`);
    console.log(`  Status: ${knownChoker5Prep.passed ? '✓ PASSED' : '✗ FAILED'}`);
  }
  if (average5Prep) {
    console.log(`Average Battler: ${(average5Prep.chokeRate * 100).toFixed(1)}%`);
    console.log(`  Target: 7% (range: 5-9%)`);
    console.log(`  Status: ${average5Prep.passed ? '✓ PASSED' : '✗ FAILED'}`);
  }
  console.log('-'.repeat(80));
  console.log();

  // Overall pass/fail
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const passRate = passedTests / totalTests;

  console.log('OVERALL RESULTS:');
  console.log('-'.repeat(80));
  console.log(`Tests passed: ${passedTests}/${totalTests} (${(passRate * 100).toFixed(1)}%)`);
  console.log(`Overall status: ${passRate >= 0.70 ? '✓ PASSED (≥70%)' : '✗ FAILED (<70%)'}`);
  console.log('-'.repeat(80));
  console.log();

  // Detailed results table
  console.log('DETAILED RESULTS:');
  console.log('='.repeat(80));
  console.log('Profile                          | Prep | Stumble% | Choke%  | Expected | Status');
  console.log('-'.repeat(80));

  results.forEach(r => {
    const name = r.profile.name.length > 30
      ? r.profile.name.substring(0, 27) + '...'
      : r.profile.name.padEnd(30);
    const prep = `${r.prepLevel.days}d`.padEnd(4);
    const stumble = `${(r.stumbleRate * 100).toFixed(1)}%`.padEnd(8);
    const choke = `${(r.chokeRate * 100).toFixed(1)}%`.padEnd(7);
    const expected = `${(r.profile.expectedChokeRate.target * 100).toFixed(0)}%`.padEnd(8);
    const status = r.passed ? '✓ PASS' : '✗ FAIL';

    console.log(`${name} | ${prep} | ${stumble} | ${choke} | ${expected} | ${status}`);
  });
  console.log('='.repeat(80));
  console.log();

  // Archetype analysis
  console.log('ARCHETYPE ANALYSIS:');
  console.log('-'.repeat(80));
  const archetypes = [...new Set(results.map(r => r.profile.archetype))];
  archetypes.forEach(archetype => {
    const archetypeResults = results.filter(r => r.profile.archetype === archetype && r.prepLevel.days === 5);
    if (archetypeResults.length > 0) {
      const avgChoke = archetypeResults.reduce((sum, r) => sum + r.chokeRate, 0) / archetypeResults.length;
      const avgStumble = archetypeResults.reduce((sum, r) => sum + r.stumbleRate, 0) / archetypeResults.length;
      console.log(`${archetype.padEnd(20)} | Choke: ${(avgChoke * 100).toFixed(1)}% | Stumble: ${(avgStumble * 100).toFixed(1)}%`);
    }
  });
  console.log('-'.repeat(80));
  console.log();

  // Prep variation analysis (if tested)
  if (testedAllPrepLevels) {
    console.log('PREP VARIATION ANALYSIS (Known Choker):');
    console.log('-'.repeat(80));
    const chokerResults = results.filter(r => r.profile.archetype === 'Choker');
    chokerResults.sort((a, b) => a.prepLevel.days - b.prepLevel.days);
    chokerResults.forEach(r => {
      console.log(`${r.prepLevel.name.padEnd(15)} (${r.prepLevel.days}d): ${(r.chokeRate * 100).toFixed(1)}%`);
    });
    console.log('-'.repeat(80));
    console.log();
  }

  // Key findings
  console.log('KEY FINDINGS:');
  console.log('-'.repeat(80));

  if (knownChoker5Prep && average5Prep) {
    const badgeDifference = knownChoker5Prep.chokeRate - average5Prep.chokeRate;
    console.log(`1. Badge Impact:`);
    console.log(`   Known Choker vs Average: ${(badgeDifference * 100).toFixed(1)}% difference`);
    console.log(`   ${badgeDifference > 0.30 ? '✓ Meaningful badge effect' : '✗ Badge effect too weak'}`);
  }

  const resilience3 = results.find(r => r.profile.archetype === 'Low Resilience' && r.prepLevel.days === 5);
  const resilience9 = results.find(r => r.profile.archetype === 'High Resilience' && r.prepLevel.days === 5);
  if (resilience3 && resilience9) {
    const resilienceDiff = resilience3.chokeRate - resilience9.chokeRate;
    console.log(`\n2. Resilience Impact:`);
    console.log(`   Low Res (3) vs High Res (9): ${(resilienceDiff * 100).toFixed(1)}% difference`);
    console.log(`   ${resilienceDiff > 0.08 ? '✓ Resilience matters' : '✗ Resilience effect too weak'}`);
  }

  const avgStumbleRate = results.reduce((sum, r) => sum + r.stumbleRate, 0) / results.length;
  console.log(`\n3. Stumble System:`);
  console.log(`   Average stumble rate: ${(avgStumbleRate * 100).toFixed(1)}%`);
  console.log(`   Target: ~40% (reasonable variance expected)`);
  console.log(`   ${avgStumbleRate >= 0.30 && avgStumbleRate <= 0.50 ? '✓ Within target range' : '⚠ Outside target range'}`);

  console.log('-'.repeat(80));
  console.log();
}

// CLI entry point
if (require.main === module) {
  const battlesPerProfile = parseInt(process.argv[2]) || 30;
  const testAllPrepLevels = process.argv[3] === 'true';

  const cleanup = async () => {
    const { cleanupValidationResidue } = await import('./validationCleanup');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    await cleanupValidationResidue(supabase).catch((e) =>
      console.error('cleanup failed:', e)
    );
  };

  runComprehensiveSystemValidation(battlesPerProfile, testAllPrepLevels)
    .then(async () => {
      await cleanup();
      console.log('\nValidation complete!');
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Validation failed:', error);
      await cleanup();
      process.exit(1);
    });
}
