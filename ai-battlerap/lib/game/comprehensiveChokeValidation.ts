/**
 * Round 7: Comprehensive Choke/Stumble Validation
 *
 * This script validates that the choke system responds correctly to:
 * - Different prep levels (0, 2, 5, 10 days)
 * - Different resilience levels (3, 5, 7)
 * - Different badge combinations (Known Choker vs Average)
 *
 * TARGET VALIDATION:
 * - Known Choker with 5 prep days, res 5: ~46% choke
 * - Average battler with 5 prep days, res 5: ~7% choke
 * - System should show VARIATION based on prep and resilience
 *
 * This addresses the concern that previous tests only used ONE prep level.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { simulateBattle } from './simulation';
import type { League } from '@/lib/models';

// ============================================================================
// TEST SCENARIOS
// ============================================================================

interface TestScenario {
  name: string;
  resilience: number;
  prepDays: { writing: number; performance: number }; // Total prep = writing + performance
  badges: string[];
  expectedChokeRate: number; // For validation
  minChokeRate: number;
  maxChokeRate: number;
}

const TEST_SCENARIOS: TestScenario[] = [
  // ========== KNOWN CHOKER SCENARIOS ==========
  {
    name: 'Known Choker - No Prep - Res 3',
    resilience: 3,
    prepDays: { writing: 0, performance: 0 },
    badges: ['Known Choker'],
    expectedChokeRate: 0.75, // Very high
    minChokeRate: 0.65,
    maxChokeRate: 0.85,
  },
  {
    name: 'Known Choker - No Prep - Res 5',
    resilience: 5,
    prepDays: { writing: 0, performance: 0 },
    badges: ['Known Choker'],
    expectedChokeRate: 0.65, // High
    minChokeRate: 0.55,
    maxChokeRate: 0.75,
  },
  {
    name: 'Known Choker - No Prep - Res 7',
    resilience: 7,
    prepDays: { writing: 0, performance: 0 },
    badges: ['Known Choker'],
    expectedChokeRate: 0.55, // Moderate-high
    minChokeRate: 0.45,
    maxChokeRate: 0.65,
  },

  {
    name: 'Known Choker - Low Prep (2 days) - Res 3',
    resilience: 3,
    prepDays: { writing: 1, performance: 1 },
    badges: ['Known Choker'],
    expectedChokeRate: 0.60,
    minChokeRate: 0.50,
    maxChokeRate: 0.70,
  },
  {
    name: 'Known Choker - Low Prep (2 days) - Res 5',
    resilience: 5,
    prepDays: { writing: 1, performance: 1 },
    badges: ['Known Choker'],
    expectedChokeRate: 0.52,
    minChokeRate: 0.42,
    maxChokeRate: 0.62,
  },
  {
    name: 'Known Choker - Low Prep (2 days) - Res 7',
    resilience: 7,
    prepDays: { writing: 1, performance: 1 },
    badges: ['Known Choker'],
    expectedChokeRate: 0.45,
    minChokeRate: 0.35,
    maxChokeRate: 0.55,
  },

  {
    name: 'Known Choker - Moderate Prep (5 days) - Res 3',
    resilience: 3,
    prepDays: { writing: 2, performance: 3 },
    badges: ['Known Choker'],
    expectedChokeRate: 0.52,
    minChokeRate: 0.42,
    maxChokeRate: 0.62,
  },
  {
    name: 'Known Choker - Moderate Prep (5 days) - Res 5',
    resilience: 5,
    prepDays: { writing: 2, performance: 3 },
    badges: ['Known Choker'],
    expectedChokeRate: 0.46, // CRITICAL TEST - User confirmed satisfied with 46%
    minChokeRate: 0.40,
    maxChokeRate: 0.52,
  },
  {
    name: 'Known Choker - Moderate Prep (5 days) - Res 7',
    resilience: 7,
    prepDays: { writing: 2, performance: 3 },
    badges: ['Known Choker'],
    expectedChokeRate: 0.38,
    minChokeRate: 0.32,
    maxChokeRate: 0.44,
  },

  {
    name: 'Known Choker - High Prep (10 days) - Res 3',
    resilience: 3,
    prepDays: { writing: 5, performance: 5 },
    badges: ['Known Choker'],
    expectedChokeRate: 0.40,
    minChokeRate: 0.32,
    maxChokeRate: 0.48,
  },
  {
    name: 'Known Choker - High Prep (10 days) - Res 5',
    resilience: 5,
    prepDays: { writing: 5, performance: 5 },
    badges: ['Known Choker'],
    expectedChokeRate: 0.35,
    minChokeRate: 0.27,
    maxChokeRate: 0.43,
  },
  {
    name: 'Known Choker - High Prep (10 days) - Res 7',
    resilience: 7,
    prepDays: { writing: 5, performance: 5 },
    badges: ['Known Choker'],
    expectedChokeRate: 0.28,
    minChokeRate: 0.22,
    maxChokeRate: 0.34,
  },

  // ========== AVERAGE BATTLER SCENARIOS ==========
  {
    name: 'Average Battler - No Prep - Res 3',
    resilience: 3,
    prepDays: { writing: 0, performance: 0 },
    badges: [],
    expectedChokeRate: 0.22,
    minChokeRate: 0.16,
    maxChokeRate: 0.28,
  },
  {
    name: 'Average Battler - No Prep - Res 5',
    resilience: 5,
    prepDays: { writing: 0, performance: 0 },
    badges: [],
    expectedChokeRate: 0.15,
    minChokeRate: 0.10,
    maxChokeRate: 0.20,
  },
  {
    name: 'Average Battler - No Prep - Res 7',
    resilience: 7,
    prepDays: { writing: 0, performance: 0 },
    badges: [],
    expectedChokeRate: 0.10,
    minChokeRate: 0.06,
    maxChokeRate: 0.14,
  },

  {
    name: 'Average Battler - Low Prep (2 days) - Res 3',
    resilience: 3,
    prepDays: { writing: 1, performance: 1 },
    badges: [],
    expectedChokeRate: 0.12,
    minChokeRate: 0.08,
    maxChokeRate: 0.16,
  },
  {
    name: 'Average Battler - Low Prep (2 days) - Res 5',
    resilience: 5,
    prepDays: { writing: 1, performance: 1 },
    badges: [],
    expectedChokeRate: 0.10,
    minChokeRate: 0.06,
    maxChokeRate: 0.14,
  },
  {
    name: 'Average Battler - Low Prep (2 days) - Res 7',
    resilience: 7,
    prepDays: { writing: 1, performance: 1 },
    badges: [],
    expectedChokeRate: 0.08,
    minChokeRate: 0.04,
    maxChokeRate: 0.12,
  },

  {
    name: 'Average Battler - Moderate Prep (5 days) - Res 3',
    resilience: 3,
    prepDays: { writing: 2, performance: 3 },
    badges: [],
    expectedChokeRate: 0.10,
    minChokeRate: 0.06,
    maxChokeRate: 0.14,
  },
  {
    name: 'Average Battler - Moderate Prep (5 days) - Res 5',
    resilience: 5,
    prepDays: { writing: 2, performance: 3 },
    badges: [],
    expectedChokeRate: 0.07, // CRITICAL TEST - Target baseline
    minChokeRate: 0.05,
    maxChokeRate: 0.09,
  },
  {
    name: 'Average Battler - Moderate Prep (5 days) - Res 7',
    resilience: 7,
    prepDays: { writing: 2, performance: 3 },
    badges: [],
    expectedChokeRate: 0.05,
    minChokeRate: 0.03,
    maxChokeRate: 0.07,
  },

  {
    name: 'Average Battler - High Prep (10 days) - Res 3',
    resilience: 3,
    prepDays: { writing: 5, performance: 5 },
    badges: [],
    expectedChokeRate: 0.08,
    minChokeRate: 0.05,
    maxChokeRate: 0.11,
  },
  {
    name: 'Average Battler - High Prep (10 days) - Res 5',
    resilience: 5,
    prepDays: { writing: 5, performance: 5 },
    badges: [],
    expectedChokeRate: 0.07,
    minChokeRate: 0.05,
    maxChokeRate: 0.09,
  },
  {
    name: 'Average Battler - High Prep (10 days) - Res 7',
    resilience: 7,
    prepDays: { writing: 5, performance: 5 },
    badges: [],
    expectedChokeRate: 0.07,
    minChokeRate: 0.05,
    maxChokeRate: 0.09,
  },
];

// ============================================================================
// TEST RUNNER
// ============================================================================

interface ScenarioResult {
  scenario: TestScenario;
  battlesRun: number;
  battlesWithStumbles: number;
  battlesWithChokes: number;
  stumbleRate: number;
  chokeRate: number;
  passed: boolean;
}

export async function runComprehensiveChokeValidation(
  battlesPerScenario: number = 30
): Promise<void> {
  console.log('='.repeat(80));
  console.log('ROUND 7: COMPREHENSIVE CHOKE/STUMBLE VALIDATION');
  console.log('='.repeat(80));
  console.log();
  console.log('Testing choke system response to:');
  console.log('  - Different prep levels (0, 2, 5, 10 days)');
  console.log('  - Different resilience levels (3, 5, 7)');
  console.log('  - Different badge combinations (Known Choker vs Average)');
  console.log();
  console.log(`Running ${battlesPerScenario} battles per scenario...`);
  console.log(`Total scenarios: ${TEST_SCENARIOS.length}`);
  console.log(`Total battles: ${battlesPerScenario * TEST_SCENARIOS.length}`);
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

  const results: ScenarioResult[] = [];

  // Run each scenario
  for (let i = 0; i < TEST_SCENARIOS.length; i++) {
    const scenario = TEST_SCENARIOS[i];
    console.log(`\n[${i + 1}/${TEST_SCENARIOS.length}] ${scenario.name}`);
    console.log(`  Resilience: ${scenario.resilience} | Prep: ${scenario.prepDays.writing}W + ${scenario.prepDays.performance}P = ${scenario.prepDays.writing + scenario.prepDays.performance} total`);
    console.log(`  Badges: ${scenario.badges.length > 0 ? scenario.badges.join(', ') : 'None'}`);
    console.log(`  Expected choke rate: ${(scenario.expectedChokeRate * 100).toFixed(0)}% (${(scenario.minChokeRate * 100).toFixed(0)}-${(scenario.maxChokeRate * 100).toFixed(0)}%)`);
    console.log('  ' + '-'.repeat(76));

    const result = await runScenarioTests(
      supabase,
      scenario,
      smallRoom,
      battlesPerScenario
    );

    results.push(result);
    printScenarioResult(result);
  }

  // Print comprehensive summary
  printComprehensiveSummary(results);

  console.log('\nValidation complete!');
}

async function runScenarioTests(
  supabase: any,
  scenario: TestScenario,
  league: League,
  battleCount: number
): Promise<ScenarioResult> {
  let battlesWithStumbles = 0;
  let battlesWithChokes = 0;

  // Create test battlers for this scenario
  const battler1Id = await createScenarioBattler(supabase, scenario, league.id, '1');
  const battler2Id = await createScenarioBattler(supabase, scenario, league.id, '2');

  for (let i = 0; i < battleCount; i++) {
    process.stdout.write(`  Battle ${i + 1}/${battleCount}...`);

    try {
      // Create battle
      const battle = await createTestBattle(supabase, battler1Id, battler2Id, league.id);

      // Create prep blocks
      await createPrepBlocks(
        supabase,
        battle.id,
        battler1Id,
        scenario.prepDays.writing,
        scenario.prepDays.performance
      );
      // Give opponent same prep
      await createPrepBlocks(
        supabase,
        battle.id,
        battler2Id,
        scenario.prepDays.writing,
        scenario.prepDays.performance
      );

      // Run simulation
      await simulateBattle(battle.id, supabase);

      // Collect segment-level data for battler1 only
      const { data: segments } = await supabase
        .from('battle_segments')
        .select('*')
        .eq('battle_id', battle.id)
        .eq('battler_id', battler1Id);

      if (segments) {
        const hasStumble = segments.some(
          (s: any) => s.event_flags && s.event_flags.includes('stumble')
        );
        const hasChoke = segments.some(
          (s: any) => s.event_flags && s.event_flags.includes('choke')
        );

        if (hasStumble) battlesWithStumbles++;
        if (hasChoke) battlesWithChokes++;

        console.log(
          ` ✓ (S:${hasStumble ? 'Y' : 'N'}, C:${hasChoke ? 'Y' : 'N'})`
        );
      }

      // Cleanup battle data
      await supabase.from('battle_segments').delete().eq('battle_id', battle.id);
      await supabase.from('battle_rounds').delete().eq('battle_id', battle.id);
      await supabase.from('prep_blocks').delete().eq('battle_id', battle.id);
      await supabase.from('battles').delete().eq('id', battle.id);
    } catch (error: any) {
      console.log(` ✗ Error: ${error.message}`);
    }
  }

  // Cleanup test battlers
  await supabase.from('rankings').delete().eq('battler_id', battler1Id);
  await supabase.from('battler_attributes').delete().eq('battler_id', battler1Id);
  await supabase.from('battlers').delete().eq('id', battler1Id);
  await supabase.from('rankings').delete().eq('battler_id', battler2Id);
  await supabase.from('battler_attributes').delete().eq('battler_id', battler2Id);
  await supabase.from('battlers').delete().eq('id', battler2Id);

  const stumbleRate = battlesWithStumbles / battleCount;
  const chokeRate = battlesWithChokes / battleCount;
  const passed =
    chokeRate >= scenario.minChokeRate && chokeRate <= scenario.maxChokeRate;

  return {
    scenario,
    battlesRun: battleCount,
    battlesWithStumbles,
    battlesWithChokes,
    stumbleRate,
    chokeRate,
    passed,
  };
}

async function createScenarioBattler(
  supabase: any,
  scenario: TestScenario,
  leagueId: string,
  suffix: string
): Promise<string> {
  const { data: battler } = await supabase
    .from('battlers')
    .insert({
      stage_name: `Test_${scenario.name.replace(/\s+/g, '_')}_${suffix}_${Date.now()}_${Math.random()}`,
      primary_league_id: leagueId,
      is_ai: true,
      tier: 'mid',
      style_tags: scenario.badges,
    })
    .select()
    .single();

  await supabase.from('battler_attributes').insert({
    battler_id: battler.id,
    writing: { lyricism: 5, wordplay: 5, creativity: 5 },
    performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
    personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
    resilience: scenario.resilience,
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
  writingDays: number,
  performanceDays: number
): Promise<void> {
  const blocks: any[] = [];
  let dayIndex = 1;

  // Add writing days
  for (let i = 0; i < writingDays; i++) {
    blocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: dayIndex++,
      focus: 'writing',
      auto_generated: true,
    });
  }

  // Add performance days
  for (let i = 0; i < performanceDays; i++) {
    blocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: dayIndex++,
      focus: 'performance',
      auto_generated: true,
    });
  }

  // If no prep blocks (0 writing + 0 performance), add one "rest" day
  // to avoid forfeit (simulation treats 0 prep blocks as no-show)
  if (blocks.length === 0) {
    blocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: dayIndex++,
      focus: 'rest',
      auto_generated: true,
    });
  }

  await supabase.from('prep_blocks').insert(blocks);
}

function printScenarioResult(result: ScenarioResult): void {
  const statusIcon = result.passed ? '✓' : '✗';
  const statusColor = result.passed ? 'PASSED' : 'FAILED';

  console.log();
  console.log(`  RESULTS: ${statusIcon} ${statusColor}`);
  console.log(`    Battles with stumbles: ${result.battlesWithStumbles}/${result.battlesRun} (${(result.stumbleRate * 100).toFixed(1)}%)`);
  console.log(`    Battles with chokes: ${result.battlesWithChokes}/${result.battlesRun} (${(result.chokeRate * 100).toFixed(1)}%)`);
  console.log(`    Expected: ${(result.scenario.expectedChokeRate * 100).toFixed(0)}% (range: ${(result.scenario.minChokeRate * 100).toFixed(0)}-${(result.scenario.maxChokeRate * 100).toFixed(0)}%)`);
  console.log();
}

function printComprehensiveSummary(results: ScenarioResult[]): void {
  console.log();
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE VALIDATION SUMMARY');
  console.log('='.repeat(80));
  console.log();

  // Group results by badge type
  const knownChokerResults = results.filter(r => r.scenario.badges.includes('Known Choker'));
  const averageResults = results.filter(r => r.scenario.badges.length === 0);

  // Print Known Choker results table
  console.log('KNOWN CHOKER RESULTS:');
  console.log('-'.repeat(80));
  console.log('Prep Days | Res 3       | Res 5       | Res 7       | Status');
  console.log('-'.repeat(80));

  const prepLevels = [0, 2, 5, 10];
  for (const prepLevel of prepLevels) {
    const res3 = knownChokerResults.find(
      r => r.scenario.prepDays.writing + r.scenario.prepDays.performance === prepLevel &&
           r.scenario.resilience === 3
    );
    const res5 = knownChokerResults.find(
      r => r.scenario.prepDays.writing + r.scenario.prepDays.performance === prepLevel &&
           r.scenario.resilience === 5
    );
    const res7 = knownChokerResults.find(
      r => r.scenario.prepDays.writing + r.scenario.prepDays.performance === prepLevel &&
           r.scenario.resilience === 7
    );

    const formatResult = (r: ScenarioResult | undefined) => {
      if (!r) return '---        ';
      const rate = `${(r.chokeRate * 100).toFixed(1)}%`;
      const status = r.passed ? '✓' : '✗';
      return `${rate.padEnd(6)} ${status}`;
    };

    const allPassed = [res3, res5, res7].every(r => r?.passed);
    const rowStatus = allPassed ? '✓ PASS' : '✗ FAIL';

    console.log(
      `${prepLevel.toString().padEnd(9)} | ${formatResult(res3)} | ${formatResult(res5)} | ${formatResult(res7)} | ${rowStatus}`
    );
  }
  console.log('-'.repeat(80));
  console.log();

  // Print Average Battler results table
  console.log('AVERAGE BATTLER RESULTS:');
  console.log('-'.repeat(80));
  console.log('Prep Days | Res 3       | Res 5       | Res 7       | Status');
  console.log('-'.repeat(80));

  for (const prepLevel of prepLevels) {
    const res3 = averageResults.find(
      r => r.scenario.prepDays.writing + r.scenario.prepDays.performance === prepLevel &&
           r.scenario.resilience === 3
    );
    const res5 = averageResults.find(
      r => r.scenario.prepDays.writing + r.scenario.prepDays.performance === prepLevel &&
           r.scenario.resilience === 5
    );
    const res7 = averageResults.find(
      r => r.scenario.prepDays.writing + r.scenario.prepDays.performance === prepLevel &&
           r.scenario.resilience === 7
    );

    const formatResult = (r: ScenarioResult | undefined) => {
      if (!r) return '---        ';
      const rate = `${(r.chokeRate * 100).toFixed(1)}%`;
      const status = r.passed ? '✓' : '✗';
      return `${rate.padEnd(6)} ${status}`;
    };

    const allPassed = [res3, res5, res7].every(r => r?.passed);
    const rowStatus = allPassed ? '✓ PASS' : '✗ FAIL';

    console.log(
      `${prepLevel.toString().padEnd(9)} | ${formatResult(res3)} | ${formatResult(res5)} | ${formatResult(res7)} | ${rowStatus}`
    );
  }
  console.log('-'.repeat(80));
  console.log();

  // Critical tests validation
  const knownChoker5Prep = knownChokerResults.find(
    r => r.scenario.prepDays.writing + r.scenario.prepDays.performance === 5 &&
         r.scenario.resilience === 5
  );
  const average5Prep = averageResults.find(
    r => r.scenario.prepDays.writing + r.scenario.prepDays.performance === 5 &&
         r.scenario.resilience === 5
  );

  console.log('CRITICAL TESTS:');
  console.log('-'.repeat(80));
  if (knownChoker5Prep) {
    console.log(`Known Choker (5 prep, res 5): ${(knownChoker5Prep.chokeRate * 100).toFixed(1)}%`);
    console.log(`  Target: 46% (range: 40-52%)`);
    console.log(`  Status: ${knownChoker5Prep.passed ? '✓ PASSED' : '✗ FAILED'}`);
  }
  if (average5Prep) {
    console.log(`Average Battler (5 prep, res 5): ${(average5Prep.chokeRate * 100).toFixed(1)}%`);
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
  console.log(`Overall status: ${passRate >= 0.80 ? '✓ PASSED (≥80%)' : '✗ FAILED (<80%)'}`);
  console.log('-'.repeat(80));
  console.log();

  // Detailed results table
  console.log('DETAILED RESULTS:');
  console.log('='.repeat(80));
  console.log('Scenario                          | Prep | Res | Stumble% | Choke%  | Expected | Status');
  console.log('-'.repeat(80));

  results.forEach(r => {
    const name = r.scenario.name.length > 32
      ? r.scenario.name.substring(0, 29) + '...'
      : r.scenario.name.padEnd(32);
    const prep = (r.scenario.prepDays.writing + r.scenario.prepDays.performance)
      .toString()
      .padEnd(4);
    const res = r.scenario.resilience.toString().padEnd(3);
    const stumble = `${(r.stumbleRate * 100).toFixed(1)}%`.padEnd(8);
    const choke = `${(r.chokeRate * 100).toFixed(1)}%`.padEnd(7);
    const expected = `${(r.scenario.expectedChokeRate * 100).toFixed(0)}%`.padEnd(8);
    const status = r.passed ? '✓ PASS' : '✗ FAIL';

    console.log(`${name} | ${prep} | ${res} | ${stumble} | ${choke} | ${expected} | ${status}`);
  });
  console.log('='.repeat(80));
  console.log();

  // Key findings
  console.log('KEY FINDINGS:');
  console.log('-'.repeat(80));

  // Check if prep reduces chokes
  const knownChoker0Prep = knownChokerResults.find(
    r => r.scenario.prepDays.writing + r.scenario.prepDays.performance === 0 &&
         r.scenario.resilience === 5
  );
  const knownChoker10Prep = knownChokerResults.find(
    r => r.scenario.prepDays.writing + r.scenario.prepDays.performance === 10 &&
         r.scenario.resilience === 5
  );

  if (knownChoker0Prep && knownChoker10Prep) {
    const prepReduction = knownChoker0Prep.chokeRate - knownChoker10Prep.chokeRate;
    console.log(`1. Prep Impact (Known Choker, Res 5):`);
    console.log(`   - 0 prep: ${(knownChoker0Prep.chokeRate * 100).toFixed(1)}%`);
    console.log(`   - 10 prep: ${(knownChoker10Prep.chokeRate * 100).toFixed(1)}%`);
    console.log(`   - Reduction: ${(prepReduction * 100).toFixed(1)}% (${prepReduction > 0 ? '✓ prep helps' : '✗ prep ineffective'})`);
  }

  // Check if resilience reduces chokes
  const knownChokerRes3 = knownChokerResults.find(
    r => r.scenario.prepDays.writing + r.scenario.prepDays.performance === 5 &&
         r.scenario.resilience === 3
  );
  const knownChokerRes7 = knownChokerResults.find(
    r => r.scenario.prepDays.writing + r.scenario.prepDays.performance === 5 &&
         r.scenario.resilience === 7
  );

  if (knownChokerRes3 && knownChokerRes7) {
    const resReduction = knownChokerRes3.chokeRate - knownChokerRes7.chokeRate;
    console.log(`\n2. Resilience Impact (Known Choker, 5 prep):`);
    console.log(`   - Res 3: ${(knownChokerRes3.chokeRate * 100).toFixed(1)}%`);
    console.log(`   - Res 7: ${(knownChokerRes7.chokeRate * 100).toFixed(1)}%`);
    console.log(`   - Reduction: ${(resReduction * 100).toFixed(1)}% (${resReduction > 0 ? '✓ resilience helps' : '✗ resilience ineffective'})`);
  }

  // Check if badge matters
  if (knownChoker5Prep && average5Prep) {
    const badgeDifference = knownChoker5Prep.chokeRate - average5Prep.chokeRate;
    console.log(`\n3. Badge Impact (5 prep, Res 5):`);
    console.log(`   - Known Choker: ${(knownChoker5Prep.chokeRate * 100).toFixed(1)}%`);
    console.log(`   - Average: ${(average5Prep.chokeRate * 100).toFixed(1)}%`);
    console.log(`   - Difference: ${(badgeDifference * 100).toFixed(1)}% (${badgeDifference > 0.30 ? '✓ badge meaningful' : '✗ badge too weak'})`);
  }

  console.log('-'.repeat(80));
  console.log();
}

// CLI entry point
if (require.main === module) {
  const battlesPerScenario = parseInt(process.argv[2]) || 30;

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

  runComprehensiveChokeValidation(battlesPerScenario)
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
