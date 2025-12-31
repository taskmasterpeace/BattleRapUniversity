/**
 * Badge Impact Test Runner (Phase 3)
 *
 * A/B testing framework to validate that all 60+ badges have measurable 10-20% impact
 * on relevant metrics. Uses control vs test battler methodology with 50+ battle samples
 * for statistical significance.
 *
 * Each badge should create a DISTINCT playstyle with clear mechanical impact:
 * - Gold badges: 15-20% impact in primary domain
 * - Silver badges: 10-15% impact in primary domain
 * - Bronze badges: 5-10% impact (or penalties for negative badges)
 *
 * Run: npm run test:badge-impact
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { simulateBattle } from './simulation';
import type { League } from '@/lib/models';
import * as fs from 'fs';

// ============================================================================
// BADGE TEST SCENARIOS
// ============================================================================

interface BadgeTestScenario {
  badgeName: string;
  category: 'writing' | 'performance' | 'content' | 'delivery' | 'reputation_positive' | 'reputation_negative';
  tier: 'bronze' | 'silver' | 'gold';

  baseBattler: BattlerConfig;
  opponent: BattlerConfig;
  league: 'small_room' | 'main_stage';
  battlesPerTest: number;

  expectedImpact: {
    metric: string;
    direction: 'increase' | 'decrease';
    minChange: number;  // e.g., 0.10 = +10%
    maxChange: number;  // e.g., 0.25 = +25%
  }[];
}

interface BattlerConfig {
  attributes: {
    writing: { lyricism: number; wordplay: number; creativity: number; flow: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { financial_stability: number; reputation: number; family_bond: number; preparation: number };
    resilience: number;
  };
  prepStrategy: 'writing-heavy' | 'performance-heavy' | 'research-heavy' | 'balanced' | 'minimal';
}

interface BadgeTestResult {
  badge: string;
  category: string;
  tier: string;

  control: {
    winRate: number;
    chokeRate: number;
    avgCrowdReaction: number;
    avgPeakScore: number;
    avgAverageScore: number;
    avgConsistency: number;
  };

  badged: {
    winRate: number;
    chokeRate: number;
    avgCrowdReaction: number;
    avgPeakScore: number;
    avgAverageScore: number;
    avgConsistency: number;
  };

  impact: {
    winRateDelta: number;
    chokeRateDelta: number;
    crowdDelta: number;
    peakDelta: number;
    avgScoreDelta: number;
    consistencyDelta: number;
  };

  battlesRun: number;
  passed: boolean;
  findings: string[];
  expectedImpacts: string[];
}

// ============================================================================
// BASELINE BATTLER CONFIGS (Used for A/B Testing)
// ============================================================================

const BASELINE_WRITER: BattlerConfig = {
  attributes: {
    writing: { lyricism: 7, wordplay: 7, creativity: 7, flow: 7 },
    performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
    personal: { financial_stability: 6, reputation: 6, family_bond: 6, preparation: 6 },
    resilience: 6,
  },
  prepStrategy: 'writing-heavy',
};

const BASELINE_PERFORMER: BattlerConfig = {
  attributes: {
    writing: { lyricism: 6, wordplay: 6, creativity: 6, flow: 6 },
    performance: { stage_presence: 7, crowd_control: 7, delivery: 7 },
    personal: { financial_stability: 6, reputation: 6, family_bond: 6, preparation: 6 },
    resilience: 6,
  },
  prepStrategy: 'performance-heavy',
};

const BASELINE_BALANCED: BattlerConfig = {
  attributes: {
    writing: { lyricism: 6, wordplay: 6, creativity: 6, flow: 6 },
    performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
    personal: { financial_stability: 6, reputation: 6, family_bond: 6, preparation: 6 },
    resilience: 6,
  },
  prepStrategy: 'balanced',
};

const STANDARD_OPPONENT: BattlerConfig = {
  attributes: {
    writing: { lyricism: 6, wordplay: 6, creativity: 6, flow: 6 },
    performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
    personal: { financial_stability: 6, reputation: 6, family_bond: 6, preparation: 6 },
    resilience: 6,
  },
  prepStrategy: 'balanced',
};

// ============================================================================
// GOLD BADGES - Top Priority (15-20% Impact Expected)
// ============================================================================

const GOLD_BADGE_TESTS: BadgeTestScenario[] = [
  {
    badgeName: 'Pen Game Elite',
    category: 'writing',
    tier: 'gold',
    baseBattler: BASELINE_WRITER,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'win_rate', direction: 'increase', minChange: 0.15, maxChange: 0.25 },
      { metric: 'crowd_reaction', direction: 'decrease', minChange: 0.05, maxChange: 0.15 },
    ],
  },
  {
    badgeName: 'Technical Writer',
    category: 'writing',
    tier: 'gold',
    baseBattler: BASELINE_WRITER,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'win_rate', direction: 'increase', minChange: 0.18, maxChange: 0.30 },
      { metric: 'crowd_reaction', direction: 'decrease', minChange: 0.05, maxChange: 0.15 },
    ],
  },
  {
    badgeName: 'Freestyle Genius',
    category: 'delivery',
    tier: 'gold',
    baseBattler: BASELINE_BALANCED,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'choke_rate', direction: 'decrease', minChange: 0.20, maxChange: 0.35 },
      { metric: 'consistency', direction: 'decrease', minChange: 0.10, maxChange: 0.25 },
    ],
  },
  {
    badgeName: 'Stage Domination',
    category: 'performance',
    tier: 'gold',
    baseBattler: BASELINE_PERFORMER,
    opponent: STANDARD_OPPONENT,
    league: 'main_stage',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'win_rate', direction: 'increase', minChange: 0.18, maxChange: 0.28 },
      { metric: 'crowd_reaction', direction: 'increase', minChange: 0.15, maxChange: 0.30 },
    ],
  },
  {
    badgeName: 'Clutch Performer',
    category: 'reputation_positive',
    tier: 'gold',
    baseBattler: BASELINE_BALANCED,
    opponent: STANDARD_OPPONENT,
    league: 'main_stage',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'choke_rate', direction: 'decrease', minChange: 0.30, maxChange: 0.50 },
      { metric: 'peak_score', direction: 'increase', minChange: 0.10, maxChange: 0.20 },
    ],
  },
  {
    badgeName: 'Enhanced Storyteller',
    category: 'content',
    tier: 'gold',
    baseBattler: BASELINE_WRITER,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'win_rate', direction: 'increase', minChange: 0.15, maxChange: 0.25 },
      { metric: 'consistency', direction: 'increase', minChange: 0.15, maxChange: 0.25 },
      { metric: 'crowd_reaction', direction: 'increase', minChange: 0.10, maxChange: 0.20 },
    ],
  },
  {
    badgeName: 'Consummate Professional',
    category: 'reputation_positive',
    tier: 'gold',
    baseBattler: BASELINE_BALANCED,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'choke_rate', direction: 'decrease', minChange: 0.03, maxChange: 0.06 },
      { metric: 'consistency', direction: 'increase', minChange: 0.10, maxChange: 0.20 },
    ],
  },
];

// ============================================================================
// NEGATIVE BADGES - Penalty Verification (Opposite Impact)
// ============================================================================

const NEGATIVE_BADGE_TESTS: BadgeTestScenario[] = [
  {
    badgeName: 'Choker',
    category: 'reputation_negative',
    tier: 'bronze',
    baseBattler: BASELINE_BALANCED,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'choke_rate', direction: 'increase', minChange: 0.40, maxChange: 0.70 },
      { metric: 'win_rate', direction: 'decrease', minChange: 0.15, maxChange: 0.30 },
    ],
  },
  {
    badgeName: 'Biter',
    category: 'writing',
    tier: 'bronze',
    baseBattler: BASELINE_WRITER,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'win_rate', direction: 'decrease', minChange: 0.20, maxChange: 0.35 },
      { metric: 'crowd_reaction', direction: 'decrease', minChange: 0.10, maxChange: 0.20 },
    ],
  },
  {
    badgeName: 'Mumbler',
    category: 'performance',
    tier: 'bronze',
    baseBattler: BASELINE_PERFORMER,
    opponent: STANDARD_OPPONENT,
    league: 'main_stage',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'win_rate', direction: 'decrease', minChange: 0.18, maxChange: 0.30 },
      { metric: 'crowd_reaction', direction: 'decrease', minChange: 0.15, maxChange: 0.25 },
    ],
  },
  {
    badgeName: 'Lazy Writer',
    category: 'writing',
    tier: 'bronze',
    baseBattler: BASELINE_WRITER,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'win_rate', direction: 'decrease', minChange: 0.15, maxChange: 0.25 },
      { metric: 'avg_score', direction: 'decrease', minChange: 0.10, maxChange: 0.20 },
    ],
  },
  {
    badgeName: 'Washed',
    category: 'reputation_negative',
    tier: 'silver',
    baseBattler: BASELINE_BALANCED,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'win_rate', direction: 'decrease', minChange: 0.12, maxChange: 0.20 },
      { metric: 'avg_score', direction: 'decrease', minChange: 0.12, maxChange: 0.18 },
    ],
  },
];

// ============================================================================
// CONTROVERSIAL/BALANCED BADGES - Trade-Off Verification
// ============================================================================

const CONTROVERSIAL_BADGE_TESTS: BadgeTestScenario[] = [
  {
    badgeName: 'Controversial',
    category: 'reputation_negative',
    tier: 'bronze',
    baseBattler: BASELINE_BALANCED,
    opponent: STANDARD_OPPONENT,
    league: 'main_stage',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'win_rate', direction: 'increase', minChange: 0.05, maxChange: 0.18 },
      { metric: 'crowd_reaction', direction: 'increase', minChange: 0.10, maxChange: 0.20 },
    ],
  },
  {
    badgeName: 'Freestyle',
    category: 'delivery',
    tier: 'bronze',
    baseBattler: BASELINE_BALANCED,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'choke_rate', direction: 'decrease', minChange: 0.01, maxChange: 0.05 },
      { metric: 'consistency', direction: 'decrease', minChange: 0.05, maxChange: 0.15 },
    ],
  },
  {
    badgeName: 'Angle Master',
    category: 'content',
    tier: 'gold',
    baseBattler: BASELINE_WRITER,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'peak_score', direction: 'increase', minChange: 0.15, maxChange: 0.25 },
      { metric: 'crowd_reaction', direction: 'decrease', minChange: 0.05, maxChange: 0.15 },
    ],
  },
  {
    badgeName: 'Overcomplicated',
    category: 'writing',
    tier: 'silver',
    baseBattler: BASELINE_WRITER,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 50,
    expectedImpact: [
      { metric: 'avg_score', direction: 'increase', minChange: 0.05, maxChange: 0.12 },
      { metric: 'crowd_reaction', direction: 'decrease', minChange: 0.15, maxChange: 0.25 },
    ],
  },
];

// ============================================================================
// SILVER BADGES - Medium Impact (10-15% Expected)
// ============================================================================

const SILVER_BADGE_TESTS: BadgeTestScenario[] = [
  {
    badgeName: 'Scheme Specialist',
    category: 'writing',
    tier: 'silver',
    baseBattler: BASELINE_WRITER,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 40,
    expectedImpact: [
      { metric: 'win_rate', direction: 'increase', minChange: 0.12, maxChange: 0.20 },
      { metric: 'consistency', direction: 'increase', minChange: 0.08, maxChange: 0.15 },
    ],
  },
  {
    badgeName: 'Crowd Favorite',
    category: 'reputation_positive',
    tier: 'silver',
    baseBattler: BASELINE_PERFORMER,
    opponent: STANDARD_OPPONENT,
    league: 'main_stage',
    battlesPerTest: 40,
    expectedImpact: [
      { metric: 'crowd_reaction', direction: 'increase', minChange: 0.12, maxChange: 0.20 },
      { metric: 'win_rate', direction: 'increase', minChange: 0.08, maxChange: 0.15 },
    ],
  },
  {
    badgeName: 'Comedian',
    category: 'content',
    tier: 'silver',
    baseBattler: BASELINE_BALANCED,
    opponent: STANDARD_OPPONENT,
    league: 'main_stage',
    battlesPerTest: 40,
    expectedImpact: [
      { metric: 'crowd_reaction', direction: 'increase', minChange: 0.08, maxChange: 0.15 },
      { metric: 'win_rate', direction: 'increase', minChange: 0.05, maxChange: 0.12 },
    ],
  },
  {
    badgeName: 'Smooth Flow',
    category: 'delivery',
    tier: 'silver',
    baseBattler: BASELINE_BALANCED,
    opponent: STANDARD_OPPONENT,
    league: 'small_room',
    battlesPerTest: 40,
    expectedImpact: [
      { metric: 'consistency', direction: 'increase', minChange: 0.08, maxChange: 0.15 },
      { metric: 'avg_score', direction: 'increase', minChange: 0.05, maxChange: 0.12 },
    ],
  },
];

// ============================================================================
// BRONZE BADGES - Light Impact (5-10% Expected)
// ============================================================================

const BRONZE_BADGE_TESTS: BadgeTestScenario[] = [
  {
    badgeName: 'Punchline King/Queen',
    category: 'content',
    tier: 'bronze',
    baseBattler: BASELINE_BALANCED,
    opponent: STANDARD_OPPONENT,
    league: 'main_stage',
    battlesPerTest: 30,
    expectedImpact: [
      { metric: 'peak_score', direction: 'increase', minChange: 0.10, maxChange: 0.18 },
      { metric: 'consistency', direction: 'decrease', minChange: 0.05, maxChange: 0.12 },
    ],
  },
  {
    badgeName: 'Aggressive',
    category: 'delivery',
    tier: 'bronze',
    baseBattler: BASELINE_PERFORMER,
    opponent: STANDARD_OPPONENT,
    league: 'main_stage',
    battlesPerTest: 30,
    expectedImpact: [
      { metric: 'crowd_reaction', direction: 'increase', minChange: 0.05, maxChange: 0.12 },
      { metric: 'choke_rate', direction: 'increase', minChange: 0.005, maxChange: 0.02 },
    ],
  },
  {
    badgeName: 'Charismatic',
    category: 'performance',
    tier: 'bronze',
    baseBattler: BASELINE_PERFORMER,
    opponent: STANDARD_OPPONENT,
    league: 'main_stage',
    battlesPerTest: 30,
    expectedImpact: [
      { metric: 'crowd_reaction', direction: 'increase', minChange: 0.08, maxChange: 0.15 },
      { metric: 'win_rate', direction: 'increase', minChange: 0.05, maxChange: 0.12 },
    ],
  },
];

// ============================================================================
// TEST EXECUTION
// ============================================================================

export async function runBadgeImpactTests(): Promise<BadgeTestResult[]> {
  console.log('='.repeat(80));
  console.log('BADGE IMPACT TEST RUNNER - Phase 3');
  console.log('A/B Testing Framework for All 60+ Badges');
  console.log('='.repeat(80));
  console.log();
  console.log('Methodology:');
  console.log('  1. Create control battler (without badge)');
  console.log('  2. Create test battler (same attributes + badge)');
  console.log('  3. Run 30-50 battles against same opponent');
  console.log('  4. Compare metrics: win rate, choke rate, crowd, peaks');
  console.log();
  console.log('Pass Criteria:');
  console.log('  - Gold badges: 15-20% impact in primary domain');
  console.log('  - Silver badges: 10-15% impact in primary domain');
  console.log('  - Bronze badges: 5-10% impact in primary domain');
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

  const allResults: BadgeTestResult[] = [];

  // Combine all test scenarios
  const allTests = [
    ...GOLD_BADGE_TESTS,
    ...NEGATIVE_BADGE_TESTS,
    ...CONTROVERSIAL_BADGE_TESTS,
    ...SILVER_BADGE_TESTS,
    ...BRONZE_BADGE_TESTS,
  ];

  console.log(`Total badges to test: ${allTests.length}`);
  console.log();

  // Run each badge test
  for (let i = 0; i < allTests.length; i++) {
    const test = allTests[i];
    console.log('\n' + '='.repeat(80));
    console.log(`[${i + 1}/${allTests.length}] Testing Badge: ${test.badgeName}`);
    console.log(`Category: ${test.category} | Tier: ${test.tier} | League: ${test.league}`);
    console.log(`Battles: ${test.battlesPerTest}`);
    console.log('='.repeat(80));

    const league = test.league === 'small_room' ? smallRoom : mainStage;
    const result = await testBadgeImpact(supabase, test, league);

    allResults.push(result);
    printBadgeResult(result);
  }

  // Generate report
  const timestamp = Date.now();
  const jsonPath = path.join(process.cwd(), 'test-results', `badge-impact-${timestamp}.json`);
  const mdPath = path.join(process.cwd(), 'test-results', `badge-impact-report-${timestamp}.md`);

  fs.mkdirSync(path.join(process.cwd(), 'test-results'), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(allResults, null, 2));

  const markdownReport = generateBadgeReport(allResults);
  fs.writeFileSync(mdPath, markdownReport);

  console.log('\n' + '='.repeat(80));
  console.log('Results exported to:');
  console.log(`  JSON: ${jsonPath}`);
  console.log(`  Markdown: ${mdPath}`);
  console.log('='.repeat(80));

  printBadgeSummary(allResults);

  return allResults;
}

async function testBadgeImpact(
  supabase: any,
  test: BadgeTestScenario,
  league: League
): Promise<BadgeTestResult> {
  // Control group stats
  let controlWins = 0;
  let controlChokes = 0;
  let controlCrowdTotal = 0;
  let controlPeakTotal = 0;
  let controlAvgScoreTotal = 0;
  let controlConsistencyTotal = 0;

  // Badged group stats
  let badgedWins = 0;
  let badgedChokes = 0;
  let badgedCrowdTotal = 0;
  let badgedPeakTotal = 0;
  let badgedAvgScoreTotal = 0;
  let badgedConsistencyTotal = 0;

  // Create opponent once
  const opponentId = await createTestBattler(supabase, test.opponent, [], league.id, 'Opponent');

  // Test control battler (without badge)
  console.log('  [Control Group] Running battles without badge...');
  const controlId = await createTestBattler(supabase, test.baseBattler, [], league.id, 'Control');

  for (let i = 0; i < test.battlesPerTest; i++) {
    process.stdout.write(`    Battle ${i + 1}/${test.battlesPerTest}... `);

    try {
      const battle = await createTestBattle(supabase, controlId, opponentId, league.id);
      await createPrepBlocks(supabase, battle.id, controlId, test.baseBattler.prepStrategy);
      await createPrepBlocks(supabase, battle.id, opponentId, test.opponent.prepStrategy);
      await simulateBattle(battle.id, supabase);

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

      if (battleResult.winner_battler_id === controlId) controlWins++;

      const controlRounds = rounds.filter((r: any) => r.battler_id === controlId);
      if (controlRounds.some((r: any) => r.choked)) controlChokes++;

      controlCrowdTotal += controlRounds.reduce((s: number, r: any) => s + r.crowd_reaction, 0) / controlRounds.length;
      controlPeakTotal += controlRounds.reduce((s: number, r: any) => s + r.peak_score, 0) / controlRounds.length;
      controlAvgScoreTotal += controlRounds.reduce((s: number, r: any) => s + r.average_score, 0) / controlRounds.length;
      controlConsistencyTotal += controlRounds.reduce((s: number, r: any) => s + r.consistency_score, 0) / controlRounds.length;

      console.log('✓');

      // Cleanup
      await supabase.from('battle_segments').delete().eq('battle_id', battle.id);
      await supabase.from('battle_rounds').delete().eq('battle_id', battle.id);
      await supabase.from('prep_blocks').delete().eq('battle_id', battle.id);
      await supabase.from('battles').delete().eq('id', battle.id);
    } catch (error: any) {
      console.log(`✗ ${error.message}`);
    }
  }

  // Cleanup control battler
  await supabase.from('rankings').delete().eq('battler_id', controlId);
  await supabase.from('battler_attributes').delete().eq('battler_id', controlId);
  await supabase.from('battlers').delete().eq('id', controlId);

  // Test badged battler (with badge)
  console.log('  [Badged Group] Running battles WITH badge...');
  const badgedId = await createTestBattler(supabase, test.baseBattler, [test.badgeName], league.id, 'Badged');

  for (let i = 0; i < test.battlesPerTest; i++) {
    process.stdout.write(`    Battle ${i + 1}/${test.battlesPerTest}... `);

    try {
      const battle = await createTestBattle(supabase, badgedId, opponentId, league.id);
      await createPrepBlocks(supabase, battle.id, badgedId, test.baseBattler.prepStrategy);
      await createPrepBlocks(supabase, battle.id, opponentId, test.opponent.prepStrategy);
      await simulateBattle(battle.id, supabase);

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

      if (battleResult.winner_battler_id === badgedId) badgedWins++;

      const badgedRounds = rounds.filter((r: any) => r.battler_id === badgedId);
      if (badgedRounds.some((r: any) => r.choked)) badgedChokes++;

      badgedCrowdTotal += badgedRounds.reduce((s: number, r: any) => s + r.crowd_reaction, 0) / badgedRounds.length;
      badgedPeakTotal += badgedRounds.reduce((s: number, r: any) => s + r.peak_score, 0) / badgedRounds.length;
      badgedAvgScoreTotal += badgedRounds.reduce((s: number, r: any) => s + r.average_score, 0) / badgedRounds.length;
      badgedConsistencyTotal += badgedRounds.reduce((s: number, r: any) => s + r.consistency_score, 0) / badgedRounds.length;

      console.log('✓');

      // Cleanup
      await supabase.from('battle_segments').delete().eq('battle_id', battle.id);
      await supabase.from('battle_rounds').delete().eq('battle_id', battle.id);
      await supabase.from('prep_blocks').delete().eq('battle_id', battle.id);
      await supabase.from('battles').delete().eq('id', battle.id);
    } catch (error: any) {
      console.log(`✗ ${error.message}`);
    }
  }

  // Cleanup badged battler and opponent
  await supabase.from('rankings').delete().eq('battler_id', badgedId);
  await supabase.from('battler_attributes').delete().eq('battler_id', badgedId);
  await supabase.from('battlers').delete().eq('id', badgedId);
  await supabase.from('rankings').delete().eq('battler_id', opponentId);
  await supabase.from('battler_attributes').delete().eq('battler_id', opponentId);
  await supabase.from('battlers').delete().eq('id', opponentId);

  // Calculate averages
  const control = {
    winRate: controlWins / test.battlesPerTest,
    chokeRate: controlChokes / test.battlesPerTest,
    avgCrowdReaction: controlCrowdTotal / test.battlesPerTest,
    avgPeakScore: controlPeakTotal / test.battlesPerTest,
    avgAverageScore: controlAvgScoreTotal / test.battlesPerTest,
    avgConsistency: controlConsistencyTotal / test.battlesPerTest,
  };

  const badged = {
    winRate: badgedWins / test.battlesPerTest,
    chokeRate: badgedChokes / test.battlesPerTest,
    avgCrowdReaction: badgedCrowdTotal / test.battlesPerTest,
    avgPeakScore: badgedPeakTotal / test.battlesPerTest,
    avgAverageScore: badgedAvgScoreTotal / test.battlesPerTest,
    avgConsistency: badgedConsistencyTotal / test.battlesPerTest,
  };

  // Calculate deltas (relative change)
  const impact = {
    winRateDelta: control.winRate > 0 ? (badged.winRate - control.winRate) / control.winRate : 0,
    chokeRateDelta: control.chokeRate > 0 ? (badged.chokeRate - control.chokeRate) / control.chokeRate : 0,
    crowdDelta: control.avgCrowdReaction > 0 ? (badged.avgCrowdReaction - control.avgCrowdReaction) / control.avgCrowdReaction : 0,
    peakDelta: control.avgPeakScore > 0 ? (badged.avgPeakScore - control.avgPeakScore) / control.avgPeakScore : 0,
    avgScoreDelta: control.avgAverageScore > 0 ? (badged.avgAverageScore - control.avgAverageScore) / control.avgAverageScore : 0,
    consistencyDelta: control.avgConsistency > 0 ? (badged.avgConsistency - control.avgConsistency) / control.avgConsistency : 0,
  };

  // Validate against expected impacts
  const findings: string[] = [];
  const expectedImpacts: string[] = [];
  let passed = true;

  for (const expected of test.expectedImpact) {
    const actualDelta = getMetricDelta(expected.metric, impact);
    const expectedDirection = expected.direction;
    const expectedMin = expected.minChange;
    const expectedMax = expected.maxChange;

    expectedImpacts.push(`${expected.metric}: ${expectedDirection} ${(expectedMin * 100).toFixed(0)}-${(expectedMax * 100).toFixed(0)}%`);

    const metPrediction = expectedDirection === 'increase'
      ? actualDelta >= expectedMin && actualDelta <= expectedMax
      : actualDelta <= -expectedMin && actualDelta >= -expectedMax;

    if (!metPrediction) {
      passed = false;
      findings.push(`✗ ${expected.metric}: Expected ${expectedDirection} ${(expectedMin * 100).toFixed(0)}-${(expectedMax * 100).toFixed(0)}%, got ${(actualDelta * 100).toFixed(1)}%`);
    } else {
      findings.push(`✓ ${expected.metric}: ${(actualDelta * 100).toFixed(1)}% ${expectedDirection}`);
    }
  }

  return {
    badge: test.badgeName,
    category: test.category,
    tier: test.tier,
    control,
    badged,
    impact,
    battlesRun: test.battlesPerTest,
    passed,
    findings,
    expectedImpacts,
  };
}

function getMetricDelta(metric: string, impact: any): number {
  switch (metric) {
    case 'win_rate': return impact.winRateDelta;
    case 'choke_rate': return impact.chokeRateDelta;
    case 'crowd_reaction': return impact.crowdDelta;
    case 'peak_score': return impact.peakDelta;
    case 'avg_score': return impact.avgScoreDelta;
    case 'consistency': return impact.consistencyDelta;
    default: return 0;
  }
}

async function createTestBattler(
  supabase: any,
  config: BattlerConfig,
  badges: string[],
  leagueId: string,
  prefix: string
): Promise<string> {
  const { data: battler } = await supabase
    .from('battlers')
    .insert({
      stage_name: `${prefix}_${Date.now()}_${Math.random()}`,
      primary_league_id: leagueId,
      is_ai: true,
      tier: 'mid',
      style_tags: badges,
    })
    .select()
    .single();

  await supabase.from('battler_attributes').insert({
    battler_id: battler.id,
    writing: config.attributes.writing,
    performance: config.attributes.performance,
    personal: config.attributes.personal,
    resilience: config.attributes.resilience,
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

function printBadgeResult(result: BadgeTestResult): void {
  console.log('\n  RESULTS:');
  console.log(`    Status: ${result.passed ? '✓ PASSED' : '✗ FAILED'}`);
  console.log();
  console.log('  Expected Impact:');
  result.expectedImpacts.forEach(e => console.log(`    - ${e}`));
  console.log();
  console.log('  Findings:');
  result.findings.forEach(f => console.log(`    ${f}`));
  console.log();
  console.log('  Detailed Metrics:');
  console.log(`    Win Rate: ${(result.control.winRate * 100).toFixed(1)}% → ${(result.badged.winRate * 100).toFixed(1)}% (${(result.impact.winRateDelta * 100).toFixed(1)}%)`);
  console.log(`    Choke Rate: ${(result.control.chokeRate * 100).toFixed(1)}% → ${(result.badged.chokeRate * 100).toFixed(1)}% (${(result.impact.chokeRateDelta * 100).toFixed(1)}%)`);
  console.log(`    Crowd Reaction: ${result.control.avgCrowdReaction.toFixed(0)} → ${result.badged.avgCrowdReaction.toFixed(0)} (${(result.impact.crowdDelta * 100).toFixed(1)}%)`);
  console.log(`    Peak Score: ${result.control.avgPeakScore.toFixed(2)} → ${result.badged.avgPeakScore.toFixed(2)} (${(result.impact.peakDelta * 100).toFixed(1)}%)`);
  console.log(`    Avg Score: ${result.control.avgAverageScore.toFixed(2)} → ${result.badged.avgAverageScore.toFixed(2)} (${(result.impact.avgScoreDelta * 100).toFixed(1)}%)`);
  console.log(`    Consistency: ${result.control.avgConsistency.toFixed(2)} → ${result.badged.avgConsistency.toFixed(2)} (${(result.impact.consistencyDelta * 100).toFixed(1)}%)`);
}

function printBadgeSummary(results: BadgeTestResult[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('BADGE IMPACT TEST SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`\nOverall: ${passed}/${results.length} badges passed (${((passed / results.length) * 100).toFixed(1)}%)`);

  if (failed > 0) {
    console.log('\nFAILED BADGES:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ✗ ${r.badge} (${r.tier})`);
      r.findings.filter(f => f.startsWith('✗')).forEach(f => console.log(`    ${f}`));
    });
  }

  console.log('\nBY TIER:');
  const byTier = {
    gold: results.filter(r => r.tier === 'gold'),
    silver: results.filter(r => r.tier === 'silver'),
    bronze: results.filter(r => r.tier === 'bronze'),
  };

  for (const [tier, badges] of Object.entries(byTier)) {
    const tierPassed = badges.filter(b => b.passed).length;
    console.log(`  ${tier.toUpperCase()}: ${tierPassed}/${badges.length} passed`);
  }

  console.log('\nBY CATEGORY:');
  const byCategory = {
    writing: results.filter(r => r.category === 'writing'),
    performance: results.filter(r => r.category === 'performance'),
    content: results.filter(r => r.category === 'content'),
    delivery: results.filter(r => r.category === 'delivery'),
    reputation_positive: results.filter(r => r.category === 'reputation_positive'),
    reputation_negative: results.filter(r => r.category === 'reputation_negative'),
  };

  for (const [category, badges] of Object.entries(byCategory)) {
    if (badges.length === 0) continue;
    const catPassed = badges.filter(b => b.passed).length;
    console.log(`  ${category}: ${catPassed}/${badges.length} passed`);
  }

  console.log('\n' + '='.repeat(80));
}

function generateBadgeReport(results: BadgeTestResult[]): string {
  const timestamp = new Date().toISOString();
  const passed = results.filter(r => r.passed).length;

  let md = `# Badge Impact Test Report\n\n`;
  md += `**Generated**: ${timestamp}\n\n`;
  md += `**Total Badges Tested**: ${results.length}\n`;
  md += `**Passed**: ${passed} (${((passed / results.length) * 100).toFixed(1)}%)\n`;
  md += `**Failed**: ${results.length - passed}\n\n`;

  md += `## Summary\n\n`;
  md += `| Badge | Tier | Category | Status | Key Impact |\n`;
  md += `|-------|------|----------|--------|------------|\n`;

  for (const result of results) {
    const status = result.passed ? '✓' : '✗';
    const keyImpact = result.findings[0]?.substring(2) || 'N/A';
    md += `| ${result.badge} | ${result.tier} | ${result.category} | ${status} | ${keyImpact} |\n`;
  }

  md += `\n## Failed Badges (Detailed)\n\n`;
  const failed = results.filter(r => !r.passed);

  if (failed.length === 0) {
    md += `No failed badges. All badges have measurable impact!\n\n`;
  } else {
    for (const result of failed) {
      md += `### ${result.badge} (${result.tier})\n\n`;
      md += `**Category**: ${result.category}\n\n`;
      md += `**Expected Impact**:\n`;
      result.expectedImpacts.forEach(e => md += `- ${e}\n`);
      md += `\n**Findings**:\n`;
      result.findings.forEach(f => md += `- ${f}\n`);
      md += `\n**Recommendations**:\n`;

      if (Math.abs(result.impact.winRateDelta) < 0.05) {
        md += `- Badge has minimal impact on win rate. Consider increasing badge effect multipliers.\n`;
      }
      if (Math.abs(result.impact.crowdDelta) < 0.05 && result.category === 'performance') {
        md += `- Performance badge should have stronger crowd reaction impact.\n`;
      }

      md += `\n---\n\n`;
    }
  }

  md += `## Gold Badge Validation\n\n`;
  const goldBadges = results.filter(r => r.tier === 'gold');
  md += `| Badge | Win Rate Impact | Primary Metric Impact | Status |\n`;
  md += `|-------|----------------|----------------------|--------|\n`;

  for (const result of goldBadges) {
    const primaryImpact = Math.max(
      Math.abs(result.impact.winRateDelta),
      Math.abs(result.impact.chokeRateDelta),
      Math.abs(result.impact.crowdDelta),
      Math.abs(result.impact.peakDelta)
    );
    md += `| ${result.badge} | ${(result.impact.winRateDelta * 100).toFixed(1)}% | ${(primaryImpact * 100).toFixed(1)}% | ${result.passed ? '✓' : '✗'} |\n`;
  }

  md += `\n## Negative Badge Validation\n\n`;
  const negativeBadges = results.filter(r => r.category === 'reputation_negative' || r.badge.includes('Choker') || r.badge.includes('Biter') || r.badge.includes('Mumbler'));
  md += `| Badge | Win Rate Penalty | Choke Rate Increase | Status |\n`;
  md += `|-------|-----------------|---------------------|--------|\n`;

  for (const result of negativeBadges) {
    md += `| ${result.badge} | ${(result.impact.winRateDelta * 100).toFixed(1)}% | ${(result.impact.chokeRateDelta * 100).toFixed(1)}% | ${result.passed ? '✓' : '✗'} |\n`;
  }

  md += `\n---\n\n`;
  md += `*Generated by badgeImpactTestRunner.ts*\n`;

  return md;
}

// CLI entry point
if (require.main === module) {
  runBadgeImpactTests()
    .then(() => {
      console.log('\nBadge impact tests complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Badge impact tests failed:', error);
      process.exit(1);
    });
}
