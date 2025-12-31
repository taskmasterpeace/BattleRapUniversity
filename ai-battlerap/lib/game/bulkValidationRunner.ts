/**
 * Bulk Validation Test Runner
 *
 * Comprehensive validation of balance fixes against target metrics.
 * Runs 100+ battles across different attribute gap scenarios to validate:
 * - Body rate (3-0 dominant): 20-30% target
 * - Debatable rate (2-1 close): 40-50% target
 * - Upset rate (underdog wins): 10-20% target
 * - Choke rate: 5-15% target
 *
 * Run after ANY config changes: npm run test:bulk-validation
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { simulateBattle } from './simulation';
import { SIMULATION_CONFIG as CONFIG } from './config';
import type { BattlerAttributes, League } from '@/lib/models';
import * as fs from 'fs';

// ============================================================================
// TEST BATTLER PROFILES (Attribute Gap Testing)
// ============================================================================

interface TestBattler {
  stage_name: string;
  description: string;
  tier: 'god' | 'top' | 'mid' | 'low';
  attributes: {
    writing: { lyricism: number; wordplay: number; creativity: number; flow: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { financial_stability: number; reputation: number; family_bond: number; preparation: number };
    resilience: number;
  };
  expectedRating: number;
}

// God-tier battlers (9-10 attributes)
const GOD_TIER_WRITER: TestBattler = {
  stage_name: 'GodWriter',
  description: 'Elite technical writer with 9+ writing stats',
  tier: 'god',
  attributes: {
    writing: { lyricism: 9, wordplay: 9, creativity: 8, flow: 9 },
    performance: { stage_presence: 6, crowd_control: 6, delivery: 7 },
    personal: { financial_stability: 7, reputation: 8, family_bond: 7, preparation: 8 },
    resilience: 7,
  },
  expectedRating: 1400,
};

const GOD_TIER_PERFORMER: TestBattler = {
  stage_name: 'GodPerformer',
  description: 'Elite performance beast with 9+ performance stats',
  tier: 'god',
  attributes: {
    writing: { lyricism: 6, wordplay: 6, creativity: 7, flow: 6 },
    performance: { stage_presence: 9, crowd_control: 9, delivery: 9 },
    personal: { financial_stability: 7, reputation: 8, family_bond: 7, preparation: 8 },
    resilience: 7,
  },
  expectedRating: 1400,
};

// Top-tier battlers (7-8 attributes)
const TOP_TIER_WRITER: TestBattler = {
  stage_name: 'TopWriter',
  description: 'Strong technical writer with 8 writing stats',
  tier: 'top',
  attributes: {
    writing: { lyricism: 8, wordplay: 8, creativity: 7, flow: 8 },
    performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
    personal: { financial_stability: 7, reputation: 7, family_bond: 7, preparation: 7 },
    resilience: 7,
  },
  expectedRating: 1320,
};

const TOP_TIER_PERFORMER: TestBattler = {
  stage_name: 'TopPerformer',
  description: 'Strong performer with 8 performance stats',
  tier: 'top',
  attributes: {
    writing: { lyricism: 6, wordplay: 6, creativity: 6, flow: 6 },
    performance: { stage_presence: 8, crowd_control: 8, delivery: 8 },
    personal: { financial_stability: 7, reputation: 7, family_bond: 7, preparation: 7 },
    resilience: 7,
  },
  expectedRating: 1320,
};

const TOP_TIER_BALANCED: TestBattler = {
  stage_name: 'TopBalanced',
  description: 'Well-rounded top tier with 7-8 across the board',
  tier: 'top',
  attributes: {
    writing: { lyricism: 7, wordplay: 7, creativity: 8, flow: 7 },
    performance: { stage_presence: 7, crowd_control: 7, delivery: 8 },
    personal: { financial_stability: 7, reputation: 7, family_bond: 7, preparation: 7 },
    resilience: 7,
  },
  expectedRating: 1320,
};

// Mid-tier battlers (6-7 attributes)
const MID_TIER_WRITER: TestBattler = {
  stage_name: 'MidWriter',
  description: 'Decent writer with 6-7 writing stats',
  tier: 'mid',
  attributes: {
    writing: { lyricism: 7, wordplay: 7, creativity: 6, flow: 7 },
    performance: { stage_presence: 5, crowd_control: 5, delivery: 6 },
    personal: { financial_stability: 6, reputation: 6, family_bond: 6, preparation: 6 },
    resilience: 6,
  },
  expectedRating: 1250,
};

const MID_TIER_PERFORMER: TestBattler = {
  stage_name: 'MidPerformer',
  description: 'Decent performer with 6-7 performance stats',
  tier: 'mid',
  attributes: {
    writing: { lyricism: 5, wordplay: 5, creativity: 6, flow: 5 },
    performance: { stage_presence: 7, crowd_control: 7, delivery: 7 },
    personal: { financial_stability: 6, reputation: 6, family_bond: 6, preparation: 6 },
    resilience: 6,
  },
  expectedRating: 1250,
};

const MID_TIER_BALANCED: TestBattler = {
  stage_name: 'MidBalanced',
  description: 'Average across the board with 6-7 stats',
  tier: 'mid',
  attributes: {
    writing: { lyricism: 6, wordplay: 6, creativity: 7, flow: 6 },
    performance: { stage_presence: 6, crowd_control: 6, delivery: 7 },
    personal: { financial_stability: 6, reputation: 6, family_bond: 6, preparation: 6 },
    resilience: 6,
  },
  expectedRating: 1250,
};

// Low-tier battlers (4-5 attributes)
const LOW_TIER_WRITER: TestBattler = {
  stage_name: 'LowWriter',
  description: 'Weak writer with 5 writing stats',
  tier: 'low',
  attributes: {
    writing: { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
    performance: { stage_presence: 4, crowd_control: 4, delivery: 5 },
    personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
    resilience: 5,
  },
  expectedRating: 1150,
};

const LOW_TIER_PERFORMER: TestBattler = {
  stage_name: 'LowPerformer',
  description: 'Weak performer with 5 performance stats',
  tier: 'low',
  attributes: {
    writing: { lyricism: 4, wordplay: 4, creativity: 5, flow: 4 },
    performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
    personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
    resilience: 5,
  },
  expectedRating: 1150,
};

const LOW_TIER_BALANCED: TestBattler = {
  stage_name: 'LowBalanced',
  description: 'Weak across the board with 5 stats',
  tier: 'low',
  attributes: {
    writing: { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
    performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
    personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
    resilience: 5,
  },
  expectedRating: 1150,
};

// ============================================================================
// TEST SCENARIOS (Organized by Attribute Gap Size)
// ============================================================================

interface TestScenario {
  name: string;
  description: string;
  battler1: TestBattler;
  battler2: TestBattler;
  attributeGap: 'huge' | 'medium' | 'small' | 'even';
  league: 'small_room' | 'main_stage';
  battlesPerMatchup: number;
  expectedBodyRate: { min: number; max: number };
  expectedUpsetRate: { min: number; max: number };
}

const TEST_SCENARIOS: TestScenario[] = [
  // ============================================================================
  // HUGE ATTRIBUTE GAPS (3+ points) - 20 battles
  // Target: 70-80% body rate, 5% upset rate
  // ============================================================================
  {
    name: 'God Writer vs Mid Writer (Small Room)',
    description: '9 vs 6 writing in writing-favored league - should be dominant',
    battler1: GOD_TIER_WRITER,
    battler2: MID_TIER_WRITER,
    attributeGap: 'huge',
    league: 'small_room',
    battlesPerMatchup: 5,
    expectedBodyRate: { min: 0.70, max: 0.80 },
    expectedUpsetRate: { min: 0.00, max: 0.10 },
  },
  {
    name: 'God Performer vs Mid Performer (Main Stage)',
    description: '9 vs 6 performance in performance-favored league - should be dominant',
    battler1: GOD_TIER_PERFORMER,
    battler2: MID_TIER_PERFORMER,
    attributeGap: 'huge',
    league: 'main_stage',
    battlesPerMatchup: 5,
    expectedBodyRate: { min: 0.70, max: 0.80 },
    expectedUpsetRate: { min: 0.00, max: 0.10 },
  },
  {
    name: 'God Writer vs Low Writer (Small Room)',
    description: '9 vs 5 writing - massive gap, should be body',
    battler1: GOD_TIER_WRITER,
    battler2: LOW_TIER_WRITER,
    attributeGap: 'huge',
    league: 'small_room',
    battlesPerMatchup: 5,
    expectedBodyRate: { min: 0.70, max: 0.80 },
    expectedUpsetRate: { min: 0.00, max: 0.05 },
  },
  {
    name: 'God Performer vs Low Performer (Main Stage)',
    description: '9 vs 5 performance - massive gap, should be body',
    battler1: GOD_TIER_PERFORMER,
    battler2: LOW_TIER_PERFORMER,
    attributeGap: 'huge',
    league: 'main_stage',
    battlesPerMatchup: 5,
    expectedBodyRate: { min: 0.70, max: 0.80 },
    expectedUpsetRate: { min: 0.00, max: 0.05 },
  },

  // ============================================================================
  // MEDIUM ATTRIBUTE GAPS (2 points) - 30 battles
  // Target: 45% body rate, 15% upset rate
  // ============================================================================
  {
    name: 'Top Writer vs Mid Writer (Small Room)',
    description: '8 vs 6 writing - clear advantage but not dominant',
    battler1: TOP_TIER_WRITER,
    battler2: MID_TIER_WRITER,
    attributeGap: 'medium',
    league: 'small_room',
    battlesPerMatchup: 8,
    expectedBodyRate: { min: 0.35, max: 0.55 },
    expectedUpsetRate: { min: 0.10, max: 0.20 },
  },
  {
    name: 'Top Performer vs Mid Performer (Main Stage)',
    description: '8 vs 6 performance - clear advantage but not dominant',
    battler1: TOP_TIER_PERFORMER,
    battler2: MID_TIER_PERFORMER,
    attributeGap: 'medium',
    league: 'main_stage',
    battlesPerMatchup: 8,
    expectedBodyRate: { min: 0.35, max: 0.55 },
    expectedUpsetRate: { min: 0.10, max: 0.20 },
  },
  {
    name: 'Top Balanced vs Low Balanced (Small Room)',
    description: '7-8 vs 5 balanced - solid gap',
    battler1: TOP_TIER_BALANCED,
    battler2: LOW_TIER_BALANCED,
    attributeGap: 'medium',
    league: 'small_room',
    battlesPerMatchup: 7,
    expectedBodyRate: { min: 0.35, max: 0.55 },
    expectedUpsetRate: { min: 0.10, max: 0.20 },
  },
  {
    name: 'Top Balanced vs Low Balanced (Main Stage)',
    description: '7-8 vs 5 balanced - solid gap on big stage',
    battler1: TOP_TIER_BALANCED,
    battler2: LOW_TIER_BALANCED,
    attributeGap: 'medium',
    league: 'main_stage',
    battlesPerMatchup: 7,
    expectedBodyRate: { min: 0.35, max: 0.55 },
    expectedUpsetRate: { min: 0.10, max: 0.20 },
  },

  // ============================================================================
  // SMALL ATTRIBUTE GAPS (1 point) - 30 battles
  // Target: 25% body rate, 25% upset rate
  // ============================================================================
  {
    name: 'Top Writer vs Mid Balanced (Small Room)',
    description: '8 writing vs 6 balanced - slight edge',
    battler1: TOP_TIER_WRITER,
    battler2: MID_TIER_BALANCED,
    attributeGap: 'small',
    league: 'small_room',
    battlesPerMatchup: 8,
    expectedBodyRate: { min: 0.15, max: 0.35 },
    expectedUpsetRate: { min: 0.20, max: 0.35 },
  },
  {
    name: 'Top Performer vs Mid Balanced (Main Stage)',
    description: '8 performance vs 6 balanced - slight edge',
    battler1: TOP_TIER_PERFORMER,
    battler2: MID_TIER_BALANCED,
    attributeGap: 'small',
    league: 'main_stage',
    battlesPerMatchup: 8,
    expectedBodyRate: { min: 0.15, max: 0.35 },
    expectedUpsetRate: { min: 0.20, max: 0.35 },
  },
  {
    name: 'Mid Writer vs Low Writer (Small Room)',
    description: '7 vs 5 writing - small gap',
    battler1: MID_TIER_WRITER,
    battler2: LOW_TIER_WRITER,
    attributeGap: 'small',
    league: 'small_room',
    battlesPerMatchup: 7,
    expectedBodyRate: { min: 0.15, max: 0.35 },
    expectedUpsetRate: { min: 0.20, max: 0.35 },
  },
  {
    name: 'Mid Performer vs Low Performer (Main Stage)',
    description: '7 vs 5 performance - small gap',
    battler1: MID_TIER_PERFORMER,
    battler2: LOW_TIER_PERFORMER,
    attributeGap: 'small',
    league: 'main_stage',
    battlesPerMatchup: 7,
    expectedBodyRate: { min: 0.15, max: 0.35 },
    expectedUpsetRate: { min: 0.20, max: 0.35 },
  },

  // ============================================================================
  // EVEN MATCHUPS (0 gap) - 20 battles
  // Target: 15% body rate, 40-50% upset rate
  // ============================================================================
  {
    name: 'Top Writer vs Top Writer (Small Room)',
    description: '8 vs 8 writing - mirror match',
    battler1: TOP_TIER_WRITER,
    battler2: TOP_TIER_WRITER,
    attributeGap: 'even',
    league: 'small_room',
    battlesPerMatchup: 5,
    expectedBodyRate: { min: 0.05, max: 0.25 },
    expectedUpsetRate: { min: 0.40, max: 0.60 },
  },
  {
    name: 'Top Performer vs Top Performer (Main Stage)',
    description: '8 vs 8 performance - mirror match',
    battler1: TOP_TIER_PERFORMER,
    battler2: TOP_TIER_PERFORMER,
    attributeGap: 'even',
    league: 'main_stage',
    battlesPerMatchup: 5,
    expectedBodyRate: { min: 0.05, max: 0.25 },
    expectedUpsetRate: { min: 0.40, max: 0.60 },
  },
  {
    name: 'Mid Balanced vs Mid Balanced (Small Room)',
    description: '6-7 vs 6-7 balanced - even matchup',
    battler1: MID_TIER_BALANCED,
    battler2: MID_TIER_BALANCED,
    attributeGap: 'even',
    league: 'small_room',
    battlesPerMatchup: 5,
    expectedBodyRate: { min: 0.05, max: 0.25 },
    expectedUpsetRate: { min: 0.40, max: 0.60 },
  },
  {
    name: 'Mid Balanced vs Mid Balanced (Main Stage)',
    description: '6-7 vs 6-7 balanced - even matchup on big stage',
    battler1: MID_TIER_BALANCED,
    battler2: MID_TIER_BALANCED,
    attributeGap: 'even',
    league: 'main_stage',
    battlesPerMatchup: 5,
    expectedBodyRate: { min: 0.05, max: 0.25 },
    expectedUpsetRate: { min: 0.40, max: 0.60 },
  },
];

// ============================================================================
// BATTLE OUTCOME CLASSIFICATION
// ============================================================================

interface BattleOutcome {
  verdict: '3-0' | '2-1';
  outcomeType: 'body' | 'clear_win' | 'debatable' | 'upset';
  chokeOccurred: boolean;
  roundScores: number[];
  winnerRating: number;
  loserRating: number;
  avgScoreDiff: number;
}

function classifyBattle(
  rounds: any[],
  battler1Id: string,
  battler2Id: string,
  winnerId: string,
  battler1Rating: number,
  battler2Rating: number
): BattleOutcome {
  const battler1Rounds = rounds.filter((r) => r.battler_id === battler1Id);
  const battler2Rounds = rounds.filter((r) => r.battler_id === battler2Id);

  const battler1RoundsWon = battler1Rounds.filter((r, i) => {
    const r2 = battler2Rounds[i];
    return r.average_score > r2.average_score;
  }).length;
  const battler2RoundsWon = 3 - battler1RoundsWon;

  const isWinner1 = winnerId === battler1Id;
  const winnerRounds = isWinner1 ? battler1Rounds : battler2Rounds;
  const loserRounds = isWinner1 ? battler2Rounds : battler1Rounds;
  const winnerRating = isWinner1 ? battler1Rating : battler2Rating;
  const loserRating = isWinner1 ? battler2Rating : battler1Rating;

  // Check for chokes
  const chokeOccurred = rounds.some((r) => r.choked);

  // Calculate average score differential
  const avgScoreDiffs = winnerRounds.map((wr, i) => {
    return Math.abs(wr.average_score - loserRounds[i].average_score);
  });
  const avgScoreDiff = avgScoreDiffs.reduce((a, b) => a + b, 0) / avgScoreDiffs.length;

  // Determine verdict
  const roundsWon = isWinner1 ? battler1RoundsWon : battler2RoundsWon;
  let verdict: '3-0' | '2-1';
  let outcomeType: 'body' | 'clear_win' | 'debatable' | 'upset';

  if (roundsWon === 3) {
    verdict = '3-0';
    // Body: 3-0 with average score diff > 2.0 (testing stricter threshold)
    outcomeType = avgScoreDiff > 2.0 ? 'body' : 'clear_win';
  } else {
    verdict = '2-1';
    // Debatable: 2-1 with average score diff < 1.8 (was 0.8 - way too strict, only caught 4% of battles)
    outcomeType = avgScoreDiff < 1.8 ? 'debatable' : 'clear_win';
  }

  // Check for upset (lower-rated battler won)
  const favoriteWon = winnerRating >= loserRating;
  if (!favoriteWon && outcomeType !== 'body') {
    outcomeType = 'upset';
  }

  // Collect round scores for debugging
  const roundScores = winnerRounds.map((r) => r.average_score);

  return {
    verdict,
    outcomeType,
    chokeOccurred,
    roundScores,
    winnerRating,
    loserRating,
    avgScoreDiff,
  };
}

// ============================================================================
// VALIDATION METRICS
// ============================================================================

interface ValidationMetrics {
  totalBattles: number;
  bodyRate: number;
  debatableRate: number;
  upsetRate: number;
  chokeRate: number;

  byAttributeGap: {
    huge: { bodyRate: number; upsetRate: number; battles: number };
    medium: { bodyRate: number; upsetRate: number; battles: number };
    small: { bodyRate: number; upsetRate: number; battles: number };
    even: { bodyRate: number; upsetRate: number; battles: number };
  };

  byOutcome: {
    bodies: number;
    clearWins: number;
    debatable: number;
    upsets: number;
  };

  chokes: number;
  scenarioResults: ScenarioResult[];
}

interface ScenarioResult {
  scenario: string;
  attributeGap: string;
  league: string;
  battlesRun: number;
  bodies: number;
  clearWins: number;
  debatable: number;
  upsets: number;
  chokes: number;
  bodyRate: number;
  upsetRate: number;
  chokeRate: number;
  passedBodyRate: boolean;
  passedUpsetRate: boolean;
  expectedBodyRange: string;
  expectedUpsetRange: string;
}

// ============================================================================
// TEST EXECUTION
// ============================================================================

export async function runBulkValidation(): Promise<ValidationMetrics> {
  console.log('='.repeat(80));
  console.log('BULK VALIDATION TEST RUNNER');
  console.log('Comprehensive Balance Validation Against Target Metrics');
  console.log('='.repeat(80));
  console.log();
  console.log('Target Metrics:');
  console.log('  - Body rate (3-0 dominant): 20-30%');
  console.log('  - Debatable rate (2-1 close): 40-50%');
  console.log('  - Upset rate (underdog wins): 10-20%');
  console.log('  - Choke rate: 5-15%');
  console.log();
  console.log('Config Snapshot:');
  console.log(`  - Choke Base: ${CONFIG.CHOKE_BASE_PROBABILITY}`);
  console.log(`  - Choke Resilience Factor: ${CONFIG.CHOKE_RESILIENCE_FACTOR}`);
  console.log(`  - Choke Prep Reduction: ${CONFIG.CHOKE_PREP_REDUCTION}`);
  console.log(`  - Choke Min/Max: ${CONFIG.CHOKE_MINIMUM}/${CONFIG.CHOKE_MAXIMUM}`);
  console.log(`  - Prep Effect Multiplier: ${CONFIG.PREP_EFFECT_MULTIPLIER}`);
  console.log(`  - Segment Variance: ${CONFIG.SEGMENT_VARIANCE}`);
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

  // Initialize metrics
  const metrics: ValidationMetrics = {
    totalBattles: 0,
    bodyRate: 0,
    debatableRate: 0,
    upsetRate: 0,
    chokeRate: 0,
    byAttributeGap: {
      huge: { bodyRate: 0, upsetRate: 0, battles: 0 },
      medium: { bodyRate: 0, upsetRate: 0, battles: 0 },
      small: { bodyRate: 0, upsetRate: 0, battles: 0 },
      even: { bodyRate: 0, upsetRate: 0, battles: 0 },
    },
    byOutcome: {
      bodies: 0,
      clearWins: 0,
      debatable: 0,
      upsets: 0,
    },
    chokes: 0,
    scenarioResults: [],
  };

  // Run all scenarios
  for (const scenario of TEST_SCENARIOS) {
    console.log('\n' + '-'.repeat(80));
    console.log(`SCENARIO: ${scenario.name}`);
    console.log(`Gap: ${scenario.attributeGap} | League: ${scenario.league} | Battles: ${scenario.battlesPerMatchup}`);
    console.log(`Expected Body: ${(scenario.expectedBodyRate.min * 100).toFixed(0)}-${(scenario.expectedBodyRate.max * 100).toFixed(0)}%`);
    console.log(`Expected Upset: ${(scenario.expectedUpsetRate.min * 100).toFixed(0)}-${(scenario.expectedUpsetRate.max * 100).toFixed(0)}%`);
    console.log('-'.repeat(80));

    const league = scenario.league === 'small_room' ? smallRoom : mainStage;

    const scenarioResult = await runScenario(
      supabase,
      scenario,
      league,
      metrics
    );

    metrics.scenarioResults.push(scenarioResult);
    printScenarioResult(scenarioResult);
  }

  // Calculate final aggregate metrics
  calculateAggregateMetrics(metrics);

  // Export results
  const timestamp = Date.now();
  const jsonPath = path.join(process.cwd(), 'test-results', `bulk-validation-${timestamp}.json`);
  const mdPath = path.join(process.cwd(), 'test-results', `bulk-validation-report-${timestamp}.md`);

  fs.mkdirSync(path.join(process.cwd(), 'test-results'), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2));

  const markdownReport = generateMarkdownReport(metrics);
  fs.writeFileSync(mdPath, markdownReport);

  console.log('\n' + '='.repeat(80));
  console.log(`Results exported to:`);
  console.log(`  JSON: ${jsonPath}`);
  console.log(`  Markdown: ${mdPath}`);
  console.log('='.repeat(80));

  // Print final validation summary
  printValidationSummary(metrics);

  return metrics;
}

async function runScenario(
  supabase: any,
  scenario: TestScenario,
  league: League,
  metrics: ValidationMetrics
): Promise<ScenarioResult> {
  let bodies = 0;
  let clearWins = 0;
  let debatable = 0;
  let upsets = 0;
  let chokes = 0;

  // Create test battlers once
  const battler1Id = await createTestBattler(supabase, scenario.battler1, league.id);
  const battler2Id = await createTestBattler(supabase, scenario.battler2, league.id);

  for (let i = 0; i < scenario.battlesPerMatchup; i++) {
    process.stdout.write(`  Battle ${i + 1}/${scenario.battlesPerMatchup}... `);

    try {
      // Create battle
      const battle = await createTestBattle(supabase, battler1Id, battler2Id, league.id);

      // Create prep blocks (standard 7-day prep)
      await createPrepBlocks(supabase, battle.id, battler1Id, 'balanced');
      await createPrepBlocks(supabase, battle.id, battler2Id, 'balanced');

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

      // Classify battle
      const outcome = classifyBattle(
        rounds,
        battler1Id,
        battler2Id,
        battleResult.winner_battler_id,
        scenario.battler1.expectedRating,
        scenario.battler2.expectedRating
      );

      // Update counts
      if (outcome.outcomeType === 'body') bodies++;
      else if (outcome.outcomeType === 'debatable') debatable++;
      else if (outcome.outcomeType === 'upset') upsets++;
      else clearWins++;

      if (outcome.chokeOccurred) chokes++;

      console.log(`✓ ${outcome.verdict} ${outcome.outcomeType}${outcome.chokeOccurred ? ' [CHOKE]' : ''}`);

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

  // Calculate rates
  const bodyRate = bodies / scenario.battlesPerMatchup;
  const upsetRate = upsets / scenario.battlesPerMatchup;
  const chokeRate = chokes / scenario.battlesPerMatchup;

  // Validate against expectations
  const passedBodyRate =
    bodyRate >= scenario.expectedBodyRate.min && bodyRate <= scenario.expectedBodyRate.max;
  const passedUpsetRate =
    upsetRate >= scenario.expectedUpsetRate.min && upsetRate <= scenario.expectedUpsetRate.max;

  // Update global metrics
  metrics.totalBattles += scenario.battlesPerMatchup;
  metrics.byOutcome.bodies += bodies;
  metrics.byOutcome.clearWins += clearWins;
  metrics.byOutcome.debatable += debatable;
  metrics.byOutcome.upsets += upsets;
  metrics.chokes += chokes;

  // Update gap-specific metrics
  metrics.byAttributeGap[scenario.attributeGap].battles += scenario.battlesPerMatchup;
  metrics.byAttributeGap[scenario.attributeGap].bodyRate += bodies;
  metrics.byAttributeGap[scenario.attributeGap].upsetRate += upsets;

  return {
    scenario: scenario.name,
    attributeGap: scenario.attributeGap,
    league: league.name,
    battlesRun: scenario.battlesPerMatchup,
    bodies,
    clearWins,
    debatable,
    upsets,
    chokes,
    bodyRate,
    upsetRate,
    chokeRate,
    passedBodyRate,
    passedUpsetRate,
    expectedBodyRange: `${(scenario.expectedBodyRate.min * 100).toFixed(0)}-${(scenario.expectedBodyRate.max * 100).toFixed(0)}%`,
    expectedUpsetRange: `${(scenario.expectedUpsetRate.min * 100).toFixed(0)}-${(scenario.expectedUpsetRate.max * 100).toFixed(0)}%`,
  };
}

async function createTestBattler(
  supabase: any,
  battler: TestBattler,
  leagueId: string
): Promise<string> {
  const { data: created } = await supabase
    .from('battlers')
    .insert({
      stage_name: `${battler.stage_name}_${Date.now()}_${Math.random()}`,
      primary_league_id: leagueId,
      is_ai: true,
      tier: battler.tier,
      style_tags: [],
    })
    .select()
    .single();

  await supabase.from('battler_attributes').insert({
    battler_id: created.id,
    writing: battler.attributes.writing,
    performance: battler.attributes.performance,
    personal: battler.attributes.personal,
    resilience: battler.attributes.resilience,
    public_knowledge: 50,
    xp: {},
  });

  await supabase.from('rankings').insert({
    battler_id: created.id,
    rating: battler.expectedRating,
    wins: 0,
    losses: 0,
    streak: 0,
  });

  return created.id;
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

    // Balanced prep strategy
    if (i % 5 === 1) focus = 'research';
    else if (i % 5 === 2) focus = 'writing';
    else if (i % 5 === 3) focus = 'performance';
    else if (i % 5 === 4) focus = 'rest';
    else focus = 'writing';

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

function calculateAggregateMetrics(metrics: ValidationMetrics): void {
  // Calculate overall rates
  metrics.bodyRate = metrics.byOutcome.bodies / metrics.totalBattles;
  metrics.debatableRate = metrics.byOutcome.debatable / metrics.totalBattles;
  metrics.upsetRate = metrics.byOutcome.upsets / metrics.totalBattles;
  metrics.chokeRate = metrics.chokes / metrics.totalBattles;

  // Calculate gap-specific rates
  for (const gap of ['huge', 'medium', 'small', 'even'] as const) {
    const gapData = metrics.byAttributeGap[gap];
    if (gapData.battles > 0) {
      gapData.bodyRate = gapData.bodyRate / gapData.battles;
      gapData.upsetRate = gapData.upsetRate / gapData.battles;
    }
  }
}

function printScenarioResult(result: ScenarioResult): void {
  console.log(`\n  Results:`);
  console.log(`    Bodies: ${result.bodies}/${result.battlesRun} (${(result.bodyRate * 100).toFixed(1)}%) ${result.passedBodyRate ? '✓' : '✗ Expected: ' + result.expectedBodyRange}`);
  console.log(`    Clear Wins: ${result.clearWins}/${result.battlesRun}`);
  console.log(`    Debatable: ${result.debatable}/${result.battlesRun} (${(result.debatable / result.battlesRun * 100).toFixed(1)}%)`);
  console.log(`    Upsets: ${result.upsets}/${result.battlesRun} (${(result.upsetRate * 100).toFixed(1)}%) ${result.passedUpsetRate ? '✓' : '✗ Expected: ' + result.expectedUpsetRange}`);
  console.log(`    Chokes: ${result.chokes}/${result.battlesRun} (${(result.chokeRate * 100).toFixed(1)}%)`);
}

function printValidationSummary(metrics: ValidationMetrics): void {
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(80));

  console.log(`\nTotal Battles Run: ${metrics.totalBattles}`);

  console.log('\nOVERALL OUTCOME DISTRIBUTION:');
  console.log(`  Bodies (3-0 dominant): ${metrics.byOutcome.bodies} (${(metrics.bodyRate * 100).toFixed(1)}%)`);
  console.log(`    Target: 20-30% ${metrics.bodyRate >= 0.20 && metrics.bodyRate <= 0.30 ? '✓ PASS' : '✗ FAIL'}`);

  console.log(`  Debatable (2-1 close): ${metrics.byOutcome.debatable} (${(metrics.debatableRate * 100).toFixed(1)}%)`);
  console.log(`    Target: 40-50% ${metrics.debatableRate >= 0.40 && metrics.debatableRate <= 0.50 ? '✓ PASS' : '✗ FAIL'}`);

  console.log(`  Upsets (underdog wins): ${metrics.byOutcome.upsets} (${(metrics.upsetRate * 100).toFixed(1)}%)`);
  console.log(`    Target: 10-20% ${metrics.upsetRate >= 0.10 && metrics.upsetRate <= 0.20 ? '✓ PASS' : '✗ FAIL'}`);

  console.log(`  Clear Wins: ${metrics.byOutcome.clearWins} (${((metrics.byOutcome.clearWins / metrics.totalBattles) * 100).toFixed(1)}%)`);

  console.log(`\nCHOKE RATE: ${metrics.chokes} (${(metrics.chokeRate * 100).toFixed(1)}%)`);
  console.log(`  Target: 5-15% ${metrics.chokeRate >= 0.05 && metrics.chokeRate <= 0.15 ? '✓ PASS' : '✗ FAIL'}`);

  console.log('\nBY ATTRIBUTE GAP:');
  console.log(`  Huge (3+ points): ${metrics.byAttributeGap.huge.battles} battles`);
  console.log(`    Body Rate: ${(metrics.byAttributeGap.huge.bodyRate * 100).toFixed(1)}% (target: 70-80%)`);
  console.log(`    Upset Rate: ${(metrics.byAttributeGap.huge.upsetRate * 100).toFixed(1)}% (target: 0-5%)`);

  console.log(`  Medium (2 points): ${metrics.byAttributeGap.medium.battles} battles`);
  console.log(`    Body Rate: ${(metrics.byAttributeGap.medium.bodyRate * 100).toFixed(1)}% (target: 35-55%)`);
  console.log(`    Upset Rate: ${(metrics.byAttributeGap.medium.upsetRate * 100).toFixed(1)}% (target: 10-20%)`);

  console.log(`  Small (1 point): ${metrics.byAttributeGap.small.battles} battles`);
  console.log(`    Body Rate: ${(metrics.byAttributeGap.small.bodyRate * 100).toFixed(1)}% (target: 15-35%)`);
  console.log(`    Upset Rate: ${(metrics.byAttributeGap.small.upsetRate * 100).toFixed(1)}% (target: 20-35%)`);

  console.log(`  Even (0 gap): ${metrics.byAttributeGap.even.battles} battles`);
  console.log(`    Body Rate: ${(metrics.byAttributeGap.even.bodyRate * 100).toFixed(1)}% (target: 5-25%)`);
  console.log(`    Upset Rate: ${(metrics.byAttributeGap.even.upsetRate * 100).toFixed(1)}% (target: 40-60%)`);

  console.log('\n' + '='.repeat(80));
  console.log('KEY FINDINGS:');
  console.log('='.repeat(80));

  const findings: string[] = [];

  // Overall metrics validation
  if (metrics.bodyRate < 0.20) findings.push('⚠️  Body rate too low - attribute gaps may not be impactful enough');
  else if (metrics.bodyRate > 0.30) findings.push('⚠️  Body rate too high - reduce attribute gap advantage');
  else findings.push('✓ Body rate within target range');

  if (metrics.debatableRate < 0.40) findings.push('⚠️  Not enough close battles - increase variance or reduce gaps');
  else if (metrics.debatableRate > 0.50) findings.push('⚠️  Too many debatable outcomes - need clearer separation');
  else findings.push('✓ Debatable rate within target range');

  if (metrics.upsetRate < 0.10) findings.push('⚠️  Upsets too rare - increase prep impact or add variance');
  else if (metrics.upsetRate > 0.20) findings.push('⚠️  Upsets too common - favorites should win more often');
  else findings.push('✓ Upset rate within target range');

  if (metrics.chokeRate < 0.05) findings.push('⚠️  Chokes too rare - increase CHOKE_BASE_PROBABILITY');
  else if (metrics.chokeRate > 0.15) findings.push('⚠️  Chokes too common - reduce CHOKE_BASE_PROBABILITY');
  else findings.push('✓ Choke rate within target range');

  // Gap-specific validation
  if (metrics.byAttributeGap.huge.bodyRate < 0.70) {
    findings.push('⚠️  Huge gaps not dominant enough - increase ATTRIBUTE_GAP_HUGE_MULTIPLIER');
  }
  if (metrics.byAttributeGap.medium.bodyRate < 0.35 || metrics.byAttributeGap.medium.bodyRate > 0.55) {
    findings.push('⚠️  Medium gaps out of balance - adjust ATTRIBUTE_GAP_MEDIUM_MULTIPLIER');
  }
  if (metrics.byAttributeGap.even.upsetRate < 0.40 || metrics.byAttributeGap.even.upsetRate > 0.60) {
    findings.push('⚠️  Even matchups not competitive - check variance and prep impact');
  }

  findings.forEach((f) => console.log(`  ${f}`));

  console.log('\n' + '='.repeat(80));
}

function generateMarkdownReport(metrics: ValidationMetrics): string {
  const timestamp = new Date().toISOString();

  let md = `# Bulk Validation Report\n\n`;
  md += `**Generated**: ${timestamp}\n\n`;
  md += `**Total Battles**: ${metrics.totalBattles}\n\n`;

  md += `## Config Snapshot\n\n`;
  md += `\`\`\`json\n`;
  md += JSON.stringify(CONFIG, null, 2);
  md += `\n\`\`\`\n\n`;

  md += `## Overall Metrics\n\n`;
  md += `| Metric | Value | Target | Status |\n`;
  md += `|--------|-------|--------|--------|\n`;
  md += `| Body Rate | ${(metrics.bodyRate * 100).toFixed(1)}% | 20-30% | ${metrics.bodyRate >= 0.20 && metrics.bodyRate <= 0.30 ? '✓ PASS' : '✗ FAIL'} |\n`;
  md += `| Debatable Rate | ${(metrics.debatableRate * 100).toFixed(1)}% | 40-50% | ${metrics.debatableRate >= 0.40 && metrics.debatableRate <= 0.50 ? '✓ PASS' : '✗ FAIL'} |\n`;
  md += `| Upset Rate | ${(metrics.upsetRate * 100).toFixed(1)}% | 10-20% | ${metrics.upsetRate >= 0.10 && metrics.upsetRate <= 0.20 ? '✓ PASS' : '✗ FAIL'} |\n`;
  md += `| Choke Rate | ${(metrics.chokeRate * 100).toFixed(1)}% | 5-15% | ${metrics.chokeRate >= 0.05 && metrics.chokeRate <= 0.15 ? '✓ PASS' : '✗ FAIL'} |\n\n`;

  md += `## By Attribute Gap\n\n`;
  md += `| Gap | Battles | Body Rate | Upset Rate |\n`;
  md += `|-----|---------|-----------|------------|\n`;
  md += `| Huge (3+ pts) | ${metrics.byAttributeGap.huge.battles} | ${(metrics.byAttributeGap.huge.bodyRate * 100).toFixed(1)}% | ${(metrics.byAttributeGap.huge.upsetRate * 100).toFixed(1)}% |\n`;
  md += `| Medium (2 pts) | ${metrics.byAttributeGap.medium.battles} | ${(metrics.byAttributeGap.medium.bodyRate * 100).toFixed(1)}% | ${(metrics.byAttributeGap.medium.upsetRate * 100).toFixed(1)}% |\n`;
  md += `| Small (1 pt) | ${metrics.byAttributeGap.small.battles} | ${(metrics.byAttributeGap.small.bodyRate * 100).toFixed(1)}% | ${(metrics.byAttributeGap.small.upsetRate * 100).toFixed(1)}% |\n`;
  md += `| Even (0 gap) | ${metrics.byAttributeGap.even.battles} | ${(metrics.byAttributeGap.even.bodyRate * 100).toFixed(1)}% | ${(metrics.byAttributeGap.even.upsetRate * 100).toFixed(1)}% |\n\n`;

  md += `## Scenario Results\n\n`;
  for (const result of metrics.scenarioResults) {
    md += `### ${result.scenario}\n\n`;
    md += `- **League**: ${result.league}\n`;
    md += `- **Attribute Gap**: ${result.attributeGap}\n`;
    md += `- **Battles**: ${result.battlesRun}\n`;
    md += `- **Body Rate**: ${(result.bodyRate * 100).toFixed(1)}% (expected: ${result.expectedBodyRange}) ${result.passedBodyRate ? '✓' : '✗'}\n`;
    md += `- **Upset Rate**: ${(result.upsetRate * 100).toFixed(1)}% (expected: ${result.expectedUpsetRange}) ${result.passedUpsetRate ? '✓' : '✗'}\n`;
    md += `- **Choke Rate**: ${(result.chokeRate * 100).toFixed(1)}%\n`;
    md += `\n`;
  }

  md += `## Recommendations\n\n`;

  if (metrics.bodyRate < 0.20) {
    md += `- ⚠️  **Body rate too low**: Increase attribute gap impact (ATTRIBUTE_GAP_HUGE_MULTIPLIER)\n`;
  }
  if (metrics.chokeRate < 0.05) {
    md += `- ⚠️  **Choke rate too low**: Increase CHOKE_BASE_PROBABILITY or reduce CHOKE_RESILIENCE_FACTOR\n`;
  }
  if (metrics.upsetRate < 0.10) {
    md += `- ⚠️  **Upset rate too low**: Increase prep impact (PREP_EFFECT_MULTIPLIER) or segment variance\n`;
  }

  md += `\n---\n\n`;
  md += `*Generated by bulkValidationRunner.ts*\n`;

  return md;
}

// CLI entry point
if (require.main === module) {
  runBulkValidation()
    .then(() => {
      console.log('\nBulk validation complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Bulk validation failed:', error);
      process.exit(1);
    });
}
