/**
 * Badge Balance Test Runner
 *
 * Tests the research-driven badge balance changes to ensure different
 * archetypes are viable and fun to play.
 *
 * Target: All specialist archetypes should have 45-55% win rate against
 * each other, with clear differentiation in playstyle.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { simulateBattle } from './simulation';
import type { BattlerAttributes, League, PrepBlock } from '@/lib/models';
import * as fs from 'fs';

// ============================================================================
// ARCHETYPE DEFINITIONS (Based on Research-Driven Balance Changes)
// ============================================================================

interface ArchetypeProfile {
  name: string;
  description: string;
  badges: string[];
  attributes: {
    writing: { lyricism: number; wordplay: number; creativity: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { financial_stability: number; reputation: number; family_bond: number };
    resilience: number;
  };
  prepStrategy: 'writing-heavy' | 'performance-heavy' | 'research-heavy' | 'balanced' | 'minimal';
  expectedStrengths: string[];
  expectedWeaknesses: string[];
}

const ARCHETYPES: ArchetypeProfile[] = [
  {
    name: 'Technical Writer',
    description: 'Elite writing ability but loses crowds with complexity (Rone, Illmaculate)',
    badges: ['Pen Game Elite', 'Technical Writer'],  // Reduced from 3 badges to 2
    attributes: {
      writing: { lyricism: 8, wordplay: 8, creativity: 8 },  // DOWN from 9/9/8
      performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },  // UP from 5/5/6
      personal: { financial_stability: 6, reputation: 7, family_bond: 6 },
      resilience: 7,  // UP from 6
    },
    prepStrategy: 'writing-heavy',
    expectedStrengths: [
      'Dominant with 8+ prep days',
      'High lyricism and technical complexity',
      'Consistent performance'
    ],
    expectedWeaknesses: [
      'Lower crowd reaction (-10-20%)',
      'Needs extensive prep time',
      'Weak in Main Stage Arena'
    ]
  },
  {
    name: 'Freestyle Genius',
    description: 'Improvises brilliantly, uses freestyle as safety net (Charron, Hollow Da Don)',
    badges: ['Freestyle Genius', 'Rebuttal King/Queen'],  // Reduced from 3 badges to 2
    attributes: {
      writing: { lyricism: 7, wordplay: 7, creativity: 8 },  // DOWN creativity from 9 to 8
      performance: { stage_presence: 7, crowd_control: 7, delivery: 8 },  // DOWN crowd_control from 8 to 7
      personal: { financial_stability: 6, reputation: 6, family_bond: 6 },  // UP from 5/6/5
      resilience: 8,
    },
    prepStrategy: 'research-heavy',
    expectedStrengths: [
      'Strong with research prep (preps scenarios, not bars)',
      'Low choke chance (-25%)',
      'High rebuttal effectiveness',
      'High variance (unpredictable peaks)'
    ],
    expectedWeaknesses: [
      'Less consistent than technical writers',
      'Depends on research for angle discovery'
    ]
  },
  {
    name: 'Performance Beast',
    description: 'Dominates Main Stage with raw energy (Tsu Surf, Tay Roc)',
    badges: ['Stage Domination', 'Aggressive'],  // Reduced from 3 badges to 2
    attributes: {
      writing: { lyricism: 6, wordplay: 6, creativity: 6 },
      performance: { stage_presence: 8, crowd_control: 7, delivery: 8 },  // DOWN crowd_control from 8 to 7
      personal: { financial_stability: 6, reputation: 7, family_bond: 6 },
      resilience: 6,  // DOWN from 7
    },
    prepStrategy: 'performance-heavy',
    expectedStrengths: [
      'Massive crowd reactions (+30-40%)',
      'Dominates Main Stage Arena',
      'High delivery and stage presence'
    ],
    expectedWeaknesses: [
      'Lower writing complexity',
      'Less effective in Small Room Circuit'
    ]
  },
  {
    name: 'Angle Master',
    description: 'Research-heavy angle specialist, analytical style (Hollow Da Don)',
    badges: ['Angle Master', 'Battle Technician'],  // Reduced from 3 badges to 2
    attributes: {
      writing: { lyricism: 7, wordplay: 7, creativity: 8 },
      performance: { stage_presence: 6, crowd_control: 6, delivery: 7 },
      personal: { financial_stability: 6, reputation: 6, family_bond: 6 },
      resilience: 6,
    },
    prepStrategy: 'research-heavy',
    expectedStrengths: [
      'High peak moments (big angles)',
      'Research prep 35% more effective',
      'Bonus with discovered secrets'
    ],
    expectedWeaknesses: [
      'Lower entertainment value (-10% crowd)',
      'Pigeonholed as "angle guy" (-15% versatility)',
      'Loses reputation (-1 per battle from personal attacks)'
    ]
  },
  {
    name: 'Balanced Battler',
    description: 'Well-rounded with no specialization (generic mid-tier)',
    badges: ['Consistent Writer', 'Prepared Battler'],
    attributes: {
      writing: { lyricism: 7, wordplay: 7, creativity: 7 },
      performance: { stage_presence: 7, crowd_control: 7, delivery: 7 },
      personal: { financial_stability: 8, reputation: 8, family_bond: 8 },  // UP from 7/7/7
      resilience: 9,  // UP from 8 - balanced battlers are very reliable
    },
    prepStrategy: 'balanced',
    expectedStrengths: [
      'No major weaknesses',
      'Adapts to any league',
      'Consistent across all metrics'
    ],
    expectedWeaknesses: [
      'No standout strengths',
      'Will lose to specialists in their domain'
    ]
  },
  {
    name: 'Controversial Star',
    description: 'Attention-seeking but skilled (Daylyt)',
    badges: ['Controversial', 'Creativity Beast'],  // Reduced from 3 badges to 2
    attributes: {
      writing: { lyricism: 7, wordplay: 7, creativity: 8 },  // DOWN creativity from 9 to 8
      performance: { stage_presence: 7, crowd_control: 7, delivery: 7 },  // DOWN from 8/8/7
      personal: { financial_stability: 5, reputation: 5, family_bond: 5 },  // UP family from 4
      resilience: 6,
    },
    prepStrategy: 'balanced',
    expectedStrengths: [
      '+20% creativity (if backed by skill)',
      '+15% crowd reaction',
      '+40% media attention'
    ],
    expectedWeaknesses: [
      'Reputation loss (-1 per battle)',
      'More life events triggered',
      'Risky strategy'
    ]
  }
];

// ============================================================================
// TEST SCENARIOS
// ============================================================================

interface TestScenario {
  name: string;
  archetype1: string;
  archetype2: string;
  league: 'small_room' | 'main_stage';
  battlesPerMatchup: number;
  expectedOutcome: string;
  targetWinRate?: { min: number; max: number }; // for archetype1
}

const TEST_SCENARIOS: TestScenario[] = [
  // Small Room Tests
  {
    name: 'Technical Writer vs Performance Beast (Small Room)',
    archetype1: 'Technical Writer',
    archetype2: 'Performance Beast',
    league: 'small_room',
    battlesPerMatchup: 50,
    expectedOutcome: 'Technical Writer should win 60-70% (Small Room favors writing)',
    targetWinRate: { min: 0.55, max: 0.75 }
  },
  {
    name: 'Technical Writer vs Freestyle Genius (Small Room)',
    archetype1: 'Technical Writer',
    archetype2: 'Freestyle Genius',
    league: 'small_room',
    battlesPerMatchup: 50,
    expectedOutcome: 'Close matchup (45-55%), both excel in different ways',
    targetWinRate: { min: 0.40, max: 0.60 }
  },
  {
    name: 'Freestyle Genius vs Balanced Battler (Small Room)',
    archetype1: 'Freestyle Genius',
    archetype2: 'Balanced Battler',
    league: 'small_room',
    battlesPerMatchup: 50,
    expectedOutcome: 'Freestyle Genius wins 50-60% (creativity advantage)',
    targetWinRate: { min: 0.45, max: 0.65 }
  },

  // Main Stage Tests
  {
    name: 'Performance Beast vs Technical Writer (Main Stage)',
    archetype1: 'Performance Beast',
    archetype2: 'Technical Writer',
    league: 'main_stage',
    battlesPerMatchup: 50,
    expectedOutcome: 'Performance Beast wins 60-70% (Main Stage favors performance)',
    targetWinRate: { min: 0.55, max: 0.75 }
  },
  {
    name: 'Performance Beast vs Freestyle Genius (Main Stage)',
    archetype1: 'Performance Beast',
    archetype2: 'Freestyle Genius',
    league: 'main_stage',
    battlesPerMatchup: 50,
    expectedOutcome: 'Close matchup (45-55%), both are performance-oriented',
    targetWinRate: { min: 0.40, max: 0.60 }
  },
  {
    name: 'Angle Master vs Balanced Battler (Main Stage)',
    archetype1: 'Angle Master',
    archetype2: 'Balanced Battler',
    league: 'main_stage',
    battlesPerMatchup: 50,
    expectedOutcome: 'Angle Master wins 50-60% (peak moments offset weaknesses)',
    targetWinRate: { min: 0.45, max: 0.65 }
  },

  // Cross-League Balance
  {
    name: 'Technical Writer vs Balanced (Both Leagues)',
    archetype1: 'Technical Writer',
    archetype2: 'Balanced Battler',
    league: 'small_room',
    battlesPerMatchup: 30,
    expectedOutcome: 'Technical Writer dominant in Small Room',
    targetWinRate: { min: 0.55, max: 0.70 }
  },
  {
    name: 'Performance Beast vs Balanced (Both Leagues)',
    archetype1: 'Performance Beast',
    archetype2: 'Balanced Battler',
    league: 'main_stage',
    battlesPerMatchup: 30,
    expectedOutcome: 'Performance Beast dominant in Main Stage',
    targetWinRate: { min: 0.55, max: 0.70 }
  },

  // Trade-off Validation
  {
    name: 'Controversial Star vs Balanced (Risk/Reward)',
    archetype1: 'Controversial Star',
    archetype2: 'Balanced Battler',
    league: 'main_stage',
    battlesPerMatchup: 40,
    expectedOutcome: 'Should be close (48-58%) - controversy is double-edged',
    targetWinRate: { min: 0.40, max: 0.60 }
  },

  // Freestyle Overhaul Test (Most Important!)
  {
    name: 'Freestyle Genius with Research vs Technical Writer',
    archetype1: 'Freestyle Genius',
    archetype2: 'Technical Writer',
    league: 'small_room',
    battlesPerMatchup: 50,
    expectedOutcome: 'Should be competitive (45-55%) - Freestyle now preps extensively',
    targetWinRate: { min: 0.40, max: 0.60 }
  },
];

// ============================================================================
// TEST EXECUTION
// ============================================================================

interface TestResult {
  scenario: string;
  archetype1: string;
  archetype2: string;
  league: string;
  battlesRun: number;
  archetype1Wins: number;
  archetype2Wins: number;
  winRate: number;
  avgScoreDiff: number;
  archetype1ChokeRate: number;
  archetype2ChokeRate: number;
  archetype1AvgCrowdReaction: number;
  archetype2AvgCrowdReaction: number;
  archetype1AvgPeakScore: number;
  archetype2AvgPeakScore: number;
  passedTargetWinRate: boolean;
  expectedOutcome: string;
}

export async function runBalanceTests(): Promise<TestResult[]> {
  console.log('='.repeat(80));
  console.log('BADGE BALANCE TEST SUITE - Research-Driven Changes');
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
  const mainStage = leagues.find((l) => l.short_code === 'MSA') || leagues[1];

  const results: TestResult[] = [];

  // Run each test scenario
  for (const scenario of TEST_SCENARIOS) {
    console.log('\n' + '='.repeat(80));
    console.log(`TEST: ${scenario.name}`);
    console.log('='.repeat(80));
    console.log(`Expected: ${scenario.expectedOutcome}`);
    console.log();

    const league = scenario.league === 'small_room' ? smallRoom : mainStage;

    const archetype1 = ARCHETYPES.find(a => a.name === scenario.archetype1)!;
    const archetype2 = ARCHETYPES.find(a => a.name === scenario.archetype2)!;

    const result = await runMatchup(
      supabase,
      archetype1,
      archetype2,
      league,
      scenario.battlesPerMatchup,
      scenario
    );

    results.push(result);
    printMatchupResult(result);
  }

  // Export results
  const outputPath = path.join(process.cwd(), 'test-results', `balance-test-${Date.now()}.json`);
  fs.mkdirSync(path.join(process.cwd(), 'test-results'), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log(`Results exported to: ${outputPath}`);
  console.log('='.repeat(80));

  // Print summary
  printSummary(results);

  return results;
}

async function runMatchup(
  supabase: any,
  archetype1: ArchetypeProfile,
  archetype2: ArchetypeProfile,
  league: League,
  battleCount: number,
  scenario: TestScenario
): Promise<TestResult> {
  let archetype1Wins = 0;
  let archetype2Wins = 0;
  let archetype1Chokes = 0;
  let archetype2Chokes = 0;
  let archetype1CrowdTotal = 0;
  let archetype2CrowdTotal = 0;
  let archetype1PeakTotal = 0;
  let archetype2PeakTotal = 0;
  let scoreDiffs: number[] = [];

  // Create test battlers once
  const battler1Id = await createTestBattler(supabase, archetype1, league.id);
  const battler2Id = await createTestBattler(supabase, archetype2, league.id);

  for (let i = 0; i < battleCount; i++) {
    process.stdout.write(`  Battle ${i + 1}/${battleCount}... `);

    try {
      // Create battle
      const battle = await createTestBattle(supabase, battler1Id, battler2Id, league.id);

      // Create prep blocks
      await createPrepBlocks(supabase, battle.id, battler1Id, archetype1.prepStrategy);
      await createPrepBlocks(supabase, battle.id, battler2Id, archetype2.prepStrategy);

      // Run simulation
      await simulateBattle(battle.id, supabase);

      // Collect results
      const { data: battleResult } = await supabase
        .from('battles')
        .select('winner_battler_id')
        .eq('id', battle.id)
        .single();

      const { data: rounds } = await supabase
        .from('battle_rounds')
        .select('*')
        .eq('battle_id', battle.id)
        .order('round_index');

      if (battleResult.winner_battler_id === battler1Id) archetype1Wins++;
      else archetype2Wins++;

      // Collect stats
      const battler1Rounds = rounds.filter((r: any) => r.battler_id === battler1Id);
      const battler2Rounds = rounds.filter((r: any) => r.battler_id === battler2Id);

      if (battler1Rounds.some((r: any) => r.choked)) archetype1Chokes++;
      if (battler2Rounds.some((r: any) => r.choked)) archetype2Chokes++;

      archetype1CrowdTotal += battler1Rounds.reduce((sum: number, r: any) => sum + r.crowd_reaction, 0) / battler1Rounds.length;
      archetype2CrowdTotal += battler2Rounds.reduce((sum: number, r: any) => sum + r.crowd_reaction, 0) / battler2Rounds.length;

      archetype1PeakTotal += battler1Rounds.reduce((sum: number, r: any) => sum + r.peak_score, 0) / battler1Rounds.length;
      archetype2PeakTotal += battler2Rounds.reduce((sum: number, r: any) => sum + r.peak_score, 0) / battler2Rounds.length;

      const avgDiff = Math.abs(
        battler1Rounds.reduce((s: number, r: any) => s + r.average_score, 0) / battler1Rounds.length -
        battler2Rounds.reduce((s: number, r: any) => s + r.average_score, 0) / battler2Rounds.length
      );
      scoreDiffs.push(avgDiff);

      console.log(`✓ Winner: ${battleResult.winner_battler_id === battler1Id ? archetype1.name : archetype2.name}`);

      // Cleanup
      await supabase.from('battle_segments').delete().eq('battle_id', battle.id);
      await supabase.from('battle_rounds').delete().eq('battle_id', battle.id);
      await supabase.from('prep_blocks').delete().eq('battle_id', battle.id);
      await supabase.from('battles').delete().eq('id', battle.id);
    } catch (error: any) {
      console.log(`✗ Error: ${error.message}`);
    }
  }

  // Cleanup battlers
  await supabase.from('rankings').delete().eq('battler_id', battler1Id);
  await supabase.from('battler_attributes').delete().eq('battler_id', battler1Id);
  await supabase.from('battlers').delete().eq('id', battler1Id);
  await supabase.from('rankings').delete().eq('battler_id', battler2Id);
  await supabase.from('battler_attributes').delete().eq('battler_id', battler2Id);
  await supabase.from('battlers').delete().eq('id', battler2Id);

  const winRate = archetype1Wins / battleCount;
  const passedTargetWinRate = scenario.targetWinRate
    ? winRate >= scenario.targetWinRate.min && winRate <= scenario.targetWinRate.max
    : true;

  return {
    scenario: scenario.name,
    archetype1: archetype1.name,
    archetype2: archetype2.name,
    league: league.name,
    battlesRun: battleCount,
    archetype1Wins,
    archetype2Wins,
    winRate,
    avgScoreDiff: scoreDiffs.reduce((a, b) => a + b, 0) / scoreDiffs.length,
    archetype1ChokeRate: archetype1Chokes / battleCount,
    archetype2ChokeRate: archetype2Chokes / battleCount,
    archetype1AvgCrowdReaction: archetype1CrowdTotal / battleCount,
    archetype2AvgCrowdReaction: archetype2CrowdTotal / battleCount,
    archetype1AvgPeakScore: archetype1PeakTotal / battleCount,
    archetype2AvgPeakScore: archetype2PeakTotal / battleCount,
    passedTargetWinRate,
    expectedOutcome: scenario.expectedOutcome,
  };
}

async function createTestBattler(
  supabase: any,
  archetype: ArchetypeProfile,
  leagueId: string
): Promise<string> {
  const { data: battler } = await supabase
    .from('battlers')
    .insert({
      stage_name: `Test_${archetype.name.replace(/\s+/g, '_')}_${Date.now()}_${Math.random()}`,
      primary_league_id: leagueId,
      is_ai: true,
      tier: 'mid',
      style_tags: archetype.badges,
    })
    .select()
    .single();

  await supabase.from('battler_attributes').insert({
    battler_id: battler.id,
    writing: archetype.attributes.writing,
    performance: archetype.attributes.performance,
    personal: archetype.attributes.personal,
    resilience: archetype.attributes.resilience,
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
  strategy: string
): Promise<void> {
  const prepDays = 7;
  const blocks: any[] = [];

  for (let i = 1; i <= prepDays; i++) {
    let focus: 'research' | 'writing' | 'performance' | 'life' | 'rest';

    switch (strategy) {
      case 'writing-heavy':
        if (i === 1) focus = 'research';
        else if (i === 7) focus = 'rest';
        else focus = 'writing';
        break;
      case 'performance-heavy':
        if (i === 1) focus = 'research';
        else if (i === 7) focus = 'rest';
        else focus = 'performance';
        break;
      case 'research-heavy':
        if (i <= 4) focus = 'research';
        else if (i <= 5) focus = 'writing';
        else focus = 'performance';
        break;
      case 'balanced':
        if (i % 5 === 1) focus = 'research';
        else if (i % 5 === 2) focus = 'writing';
        else if (i % 5 === 3) focus = 'performance';
        else if (i % 5 === 4) focus = 'rest';
        else focus = 'writing';
        break;
      case 'minimal':
        focus = 'rest';
        break;
      default:
        focus = 'rest';
    }

    blocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: i,
      focus,
      auto_generated: true,
    });
  }

  await supabase.from('prep_blocks').insert(blocks);
}

function printMatchupResult(result: TestResult): void {
  console.log('\nRESULTS:');
  console.log(`  ${result.archetype1} Wins: ${result.archetype1Wins} (${(result.winRate * 100).toFixed(1)}%)`);
  console.log(`  ${result.archetype2} Wins: ${result.archetype2Wins} (${((1 - result.winRate) * 100).toFixed(1)}%)`);
  console.log(`  Avg Score Difference: ${result.avgScoreDiff.toFixed(2)}`);
  console.log();
  console.log(`  ${result.archetype1} Stats:`);
  console.log(`    Choke Rate: ${(result.archetype1ChokeRate * 100).toFixed(1)}%`);
  console.log(`    Avg Crowd Reaction: ${result.archetype1AvgCrowdReaction.toFixed(0)}`);
  console.log(`    Avg Peak Score: ${result.archetype1AvgPeakScore.toFixed(2)}`);
  console.log();
  console.log(`  ${result.archetype2} Stats:`);
  console.log(`    Choke Rate: ${(result.archetype2ChokeRate * 100).toFixed(1)}%`);
  console.log(`    Avg Crowd Reaction: ${result.archetype2AvgCrowdReaction.toFixed(0)}`);
  console.log(`    Avg Peak Score: ${result.archetype2AvgPeakScore.toFixed(2)}`);
  console.log();

  const status = result.passedTargetWinRate ? '✓ PASSED' : '✗ FAILED';
  console.log(`  ${status} - ${result.expectedOutcome}`);
}

function printSummary(results: TestResult[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.passedTargetWinRate).length;
  const failed = results.filter(r => !r.passedTargetWinRate).length;

  console.log(`\nOverall: ${passed}/${results.length} tests passed`);
  console.log();

  if (failed > 0) {
    console.log('FAILED TESTS:');
    results.filter(r => !r.passedTargetWinRate).forEach(r => {
      console.log(`  ✗ ${r.scenario}: ${(r.winRate * 100).toFixed(1)}% win rate`);
      console.log(`    Expected: ${r.expectedOutcome}`);
    });
    console.log();
  }

  console.log('KEY FINDINGS:');

  // Check for overpowered archetypes
  const archetypeWinRates = new Map<string, number[]>();
  results.forEach(r => {
    if (!archetypeWinRates.has(r.archetype1)) archetypeWinRates.set(r.archetype1, []);
    if (!archetypeWinRates.has(r.archetype2)) archetypeWinRates.set(r.archetype2, []);

    archetypeWinRates.get(r.archetype1)!.push(r.winRate);
    archetypeWinRates.get(r.archetype2)!.push(1 - r.winRate);
  });

  console.log('\nArchetype Overall Performance:');
  archetypeWinRates.forEach((rates, archetype) => {
    const avgWinRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    const status = avgWinRate > 0.60 ? '⚠️ Too Strong' : avgWinRate < 0.40 ? '⚠️ Too Weak' : '✓ Balanced';
    console.log(`  ${archetype}: ${(avgWinRate * 100).toFixed(1)}% avg win rate - ${status}`);
  });

  console.log('\n' + '='.repeat(80));
}

// CLI entry point
if (require.main === module) {
  runBalanceTests()
    .then(() => {
      console.log('\nBalance tests complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Balance tests failed:', error);
      process.exit(1);
    });
}
