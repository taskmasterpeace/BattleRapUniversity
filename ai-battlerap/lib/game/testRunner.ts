/**
 * Test Runner for Battle Simulation System
 *
 * This script creates test battlers with different attribute profiles,
 * runs multiple battle simulations, and collects statistics to validate
 * game balance and mechanics.
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { simulateBattle } from './simulation';
import type { BattlerAttributes, League, PrepBlock } from '@/lib/models';
import * as fs from 'fs';

// Test configuration
interface TestConfig {
  battlesPerScenario: number;
  scenarios: string[];
  outputDir: string;
}

// Test scenario definition
interface TestScenario {
  name: string;
  description: string;
  battler1Profile: AttributeProfile;
  battler2Profile: AttributeProfile;
  prep1Pattern: PrepPattern;
  prep2Pattern: PrepPattern;
  leaguePreference?: 'small_room' | 'main_stage';
  expectedWinRate?: { min: number; max: number }; // Expected win rate for battler1
}

// Attribute profile builder
interface AttributeProfile {
  name: string;
  writing: { lyricism: number; wordplay: number; creativity: number };
  performance: { stage_presence: number; crowd_control: number; delivery: number };
  personal: { financial_stability: number; reputation: number; family_bond: number };
  resilience: number;
}

// Prep pattern builder
type PrepPattern = 'balanced' | 'writing-heavy' | 'performance-heavy' | 'research-heavy' | 'minimal' | 'none';

// Test results
interface BattleResult {
  battleId: string;
  winner: 'battler1' | 'battler2';
  score: string;
  battler1Rounds: RoundStats[];
  battler2Rounds: RoundStats[];
  chokeOccurred: boolean;
  duration: number;
}

interface RoundStats {
  roundIndex: number;
  averageScore: number;
  peakScore: number;
  consistencyScore: number;
  crowdReaction: number;
  choked: boolean;
}

interface ScenarioResults {
  scenario: string;
  battlesRun: number;
  battler1Wins: number;
  battler2Wins: number;
  battler1WinRate: number;
  avgScoreDifference: number;
  chokeRate: number;
  avgBattler1Stats: AggregateStats;
  avgBattler2Stats: AggregateStats;
  battles: BattleResult[];
}

interface AggregateStats {
  avgScore: number;
  avgPeak: number;
  avgConsistency: number;
  avgCrowdReaction: number;
}

/**
 * Main test runner function
 */
export async function runSimulationTests(config: TestConfig): Promise<void> {
  console.log('Starting Battle Simulation Test Suite...\n');

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

  // Define test scenarios
  const scenarios = getTestScenarios();

  // Filter scenarios if specific ones are requested
  const scenariosToRun = config.scenarios.includes('all')
    ? scenarios
    : scenarios.filter((s) => config.scenarios.includes(s.name));

  const allResults: ScenarioResults[] = [];

  // Run each scenario
  for (const scenario of scenariosToRun) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running Scenario: ${scenario.name}`);
    console.log(`Description: ${scenario.description}`);
    console.log(`${'='.repeat(60)}\n`);

    const league = scenario.leaguePreference === 'small_room' ? smallRoom : mainStage;

    const results = await runScenario(
      supabase,
      scenario,
      league,
      config.battlesPerScenario
    );

    allResults.push(results);

    // Print scenario summary
    printScenarioSummary(results, scenario);
  }

  // Export results to JSON
  const outputPath = path.join(process.cwd(), config.outputDir, `test-results-${Date.now()}.json`);
  fs.mkdirSync(path.join(process.cwd(), config.outputDir), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test results exported to: ${outputPath}`);
  console.log(`${'='.repeat(60)}\n`);

  // Print overall analysis
  printOverallAnalysis(allResults);
}

/**
 * Run a single test scenario
 */
async function runScenario(
  supabase: any,
  scenario: TestScenario,
  league: League,
  battleCount: number
): Promise<ScenarioResults> {
  const battles: BattleResult[] = [];
  let battler1Wins = 0;
  let battler2Wins = 0;
  let totalChokes = 0;

  // Create test battlers
  const battler1Id = await createTestBattler(supabase, scenario.battler1Profile, league.id);
  const battler2Id = await createTestBattler(supabase, scenario.battler2Profile, league.id);

  for (let i = 0; i < battleCount; i++) {
    process.stdout.write(`  Battle ${i + 1}/${battleCount}... `);

    try {
      // Create battle
      const battle = await createTestBattle(supabase, battler1Id, battler2Id, league.id);

      // Create prep blocks
      await createPrepBlocks(supabase, battle.id, battler1Id, scenario.prep1Pattern);
      await createPrepBlocks(supabase, battle.id, battler2Id, scenario.prep2Pattern);

      // Run simulation
      const startTime = Date.now();
      await simulateBattle(battle.id, supabase);
      const duration = Date.now() - startTime;

      // Collect results BEFORE cleanup
      const result = await collectBattleResults(supabase, battle.id, battler1Id, battler2Id, duration);

      if (result.winner === 'battler1') battler1Wins++;
      else battler2Wins++;

      if (result.chokeOccurred) totalChokes++;

      battles.push(result);

      console.log(`✓ Winner: ${result.winner} (${result.score})`);

      // Clean up battle data AFTER collecting results
      await cleanupBattle(supabase, battle.id);
    } catch (error: any) {
      console.log(`✗ Error: ${error.message}`);
    }
  }

  // Clean up battlers
  await cleanupBattler(supabase, battler1Id);
  await cleanupBattler(supabase, battler2Id);

  // Calculate aggregate stats
  const battler1Stats = calculateAggregateStats(battles, 'battler1');
  const battler2Stats = calculateAggregateStats(battles, 'battler2');

  return {
    scenario: scenario.name,
    battlesRun: battles.length,
    battler1Wins,
    battler2Wins,
    battler1WinRate: battler1Wins / battles.length,
    avgScoreDifference: battles.reduce((sum, b) => {
      const b1Avg = b.battler1Rounds.reduce((s, r) => s + r.averageScore, 0) / b.battler1Rounds.length;
      const b2Avg = b.battler2Rounds.reduce((s, r) => s + r.averageScore, 0) / b.battler2Rounds.length;
      return sum + Math.abs(b1Avg - b2Avg);
    }, 0) / battles.length,
    chokeRate: totalChokes / (battles.length * 2), // Per battler per battle
    avgBattler1Stats: battler1Stats,
    avgBattler2Stats: battler2Stats,
    battles,
  };
}

/**
 * Create a test battler with specific attributes
 */
async function createTestBattler(
  supabase: any,
  profile: AttributeProfile,
  leagueId: string
): Promise<string> {
  const { data: battler } = await supabase
    .from('battlers')
    .insert({
      stage_name: `Test_${profile.name}_${Date.now()}`,
      primary_league_id: leagueId,
      is_ai: true,
      tier: 'mid',
      style_tags: ['test'],
    })
    .select()
    .single();

  await supabase.from('battler_attributes').insert({
    battler_id: battler.id,
    writing: profile.writing,
    performance: profile.performance,
    personal: profile.personal,
    resilience: profile.resilience,
    public_knowledge: 5,
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

/**
 * Create a test battle
 */
async function createTestBattle(
  supabase: any,
  battler1Id: string,
  battler2Id: string,
  leagueId: string
): Promise<any> {
  const now = new Date();
  const scheduled = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago
  const lockPrep = new Date(now.getTime() - 1000 * 60 * 5); // 5 minutes ago

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

/**
 * Create prep blocks based on pattern
 */
async function createPrepBlocks(
  supabase: any,
  battleId: string,
  battlerId: string,
  pattern: PrepPattern
): Promise<void> {
  if (pattern === 'none') {
    return; // No prep blocks = forfeit
  }

  const prepDays = 7;
  const blocks: any[] = [];

  for (let i = 1; i <= prepDays; i++) {
    let focus: 'research' | 'writing' | 'performance' | 'life' | 'rest';

    switch (pattern) {
      case 'balanced':
        if (i % 5 === 1) focus = 'research';
        else if (i % 5 === 2) focus = 'writing';
        else if (i % 5 === 3) focus = 'performance';
        else if (i % 5 === 4) focus = 'rest';
        else focus = 'writing';
        break;

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
        if (i <= 3) focus = 'research';
        else if (i <= 5) focus = 'writing';
        else focus = 'performance';
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

/**
 * Collect battle results
 */
async function collectBattleResults(
  supabase: any,
  battleId: string,
  battler1Id: string,
  battler2Id: string,
  duration: number
): Promise<BattleResult> {
  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single();

  const { data: rounds, error: roundsError } = await supabase
    .from('battle_rounds')
    .select('*')
    .eq('battle_id', battleId)
    .order('round_index');

  if (!rounds || rounds.length === 0) {
    console.error('No rounds found for battle', battleId);
    // Return default result
    return {
      battleId,
      winner: battle.winner_battler_id === battler1Id ? 'battler1' : 'battler2',
      score: '0-0',
      battler1Rounds: [],
      battler2Rounds: [],
      chokeOccurred: false,
      duration,
    };
  }

  const battler1Rounds = rounds.filter((r: any) => r.battler_id === battler1Id);
  const battler2Rounds = rounds.filter((r: any) => r.battler_id === battler2Id);

  // Determine round winners by comparing average scores
  let battler1RoundsWon = 0;
  let battler2RoundsWon = 0;

  for (let i = 1; i <= 3; i++) {
    const b1Round = battler1Rounds.find((r: any) => r.round_index === i);
    const b2Round = battler2Rounds.find((r: any) => r.round_index === i);

    if (b1Round && b2Round) {
      if (b1Round.average_score > b2Round.average_score) {
        battler1RoundsWon++;
      } else if (b2Round.average_score > b1Round.average_score) {
        battler2RoundsWon++;
      } else {
        // Tiebreaker: peak score
        if (b1Round.peak_score > b2Round.peak_score) {
          battler1RoundsWon++;
        } else {
          battler2RoundsWon++;
        }
      }
    }
  }

  const chokeOccurred =
    battler1Rounds.some((r: any) => r.choked) || battler2Rounds.some((r: any) => r.choked);

  return {
    battleId,
    winner: battle.winner_battler_id === battler1Id ? 'battler1' : 'battler2',
    score: `${battler1RoundsWon}-${battler2RoundsWon}`,
    battler1Rounds: battler1Rounds.map((r: any) => ({
      roundIndex: r.round_index,
      averageScore: r.average_score,
      peakScore: r.peak_score,
      consistencyScore: r.consistency_score,
      crowdReaction: r.crowd_reaction,
      choked: r.choked,
    })),
    battler2Rounds: battler2Rounds.map((r: any) => ({
      roundIndex: r.round_index,
      averageScore: r.average_score,
      peakScore: r.peak_score,
      consistencyScore: r.consistency_score,
      crowdReaction: r.crowd_reaction,
      choked: r.choked,
    })),
    chokeOccurred,
    duration,
  };
}

/**
 * Calculate aggregate statistics
 */
function calculateAggregateStats(
  battles: BattleResult[],
  battler: 'battler1' | 'battler2'
): AggregateStats {
  const allRounds =
    battler === 'battler1'
      ? battles.flatMap((b) => b.battler1Rounds)
      : battles.flatMap((b) => b.battler2Rounds);

  return {
    avgScore: allRounds.reduce((s, r) => s + r.averageScore, 0) / allRounds.length,
    avgPeak: allRounds.reduce((s, r) => s + r.peakScore, 0) / allRounds.length,
    avgConsistency: allRounds.reduce((s, r) => s + r.consistencyScore, 0) / allRounds.length,
    avgCrowdReaction: allRounds.reduce((s, r) => s + r.crowdReaction, 0) / allRounds.length,
  };
}

/**
 * Clean up battle data
 */
async function cleanupBattle(supabase: any, battleId: string): Promise<void> {
  await supabase.from('battle_segments').delete().eq('battle_id', battleId);
  await supabase.from('battle_rounds').delete().eq('battle_id', battleId);
  await supabase.from('prep_blocks').delete().eq('battle_id', battleId);
  await supabase.from('battles').delete().eq('id', battleId);
}

/**
 * Clean up battler data
 */
async function cleanupBattler(supabase: any, battlerId: string): Promise<void> {
  await supabase.from('rankings').delete().eq('battler_id', battlerId);
  await supabase.from('battler_attributes').delete().eq('battler_id', battlerId);
  await supabase.from('battlers').delete().eq('id', battlerId);
}

/**
 * Print scenario summary
 */
function printScenarioSummary(results: ScenarioResults, scenario: TestScenario): void {
  console.log(`\nScenario Summary:`);
  console.log(`  Battles Run: ${results.battlesRun}`);
  console.log(`  ${scenario.battler1Profile.name} Wins: ${results.battler1Wins} (${(results.battler1WinRate * 100).toFixed(1)}%)`);
  console.log(`  ${scenario.battler2Profile.name} Wins: ${results.battler2Wins} (${((1 - results.battler1WinRate) * 100).toFixed(1)}%)`);
  console.log(`  Avg Score Difference: ${results.avgScoreDifference.toFixed(2)}`);
  console.log(`  Choke Rate: ${(results.chokeRate * 100).toFixed(1)}%`);
  console.log(`\n  ${scenario.battler1Profile.name} Stats:`);
  console.log(`    Avg Score: ${results.avgBattler1Stats.avgScore.toFixed(2)}`);
  console.log(`    Avg Peak: ${results.avgBattler1Stats.avgPeak.toFixed(2)}`);
  console.log(`    Avg Consistency: ${results.avgBattler1Stats.avgConsistency.toFixed(2)}`);
  console.log(`    Avg Crowd Reaction: ${results.avgBattler1Stats.avgCrowdReaction.toFixed(0)}`);
  console.log(`\n  ${scenario.battler2Profile.name} Stats:`);
  console.log(`    Avg Score: ${results.avgBattler2Stats.avgScore.toFixed(2)}`);
  console.log(`    Avg Peak: ${results.avgBattler2Stats.avgPeak.toFixed(2)}`);
  console.log(`    Avg Consistency: ${results.avgBattler2Stats.avgConsistency.toFixed(2)}`);
  console.log(`    Avg Crowd Reaction: ${results.avgBattler2Stats.avgCrowdReaction.toFixed(0)}`);

  // Check if results match expectations
  if (scenario.expectedWinRate) {
    const { min, max } = scenario.expectedWinRate;
    const withinRange = results.battler1WinRate >= min && results.battler1WinRate <= max;
    const status = withinRange ? '✓' : '✗';
    console.log(`\n  ${status} Expected Win Rate: ${(min * 100).toFixed(0)}-${(max * 100).toFixed(0)}% | Actual: ${(results.battler1WinRate * 100).toFixed(1)}%`);
  }
}

/**
 * Print overall analysis
 */
function printOverallAnalysis(allResults: ScenarioResults[]): void {
  console.log('\nOverall Analysis:');
  console.log(`${'='.repeat(60)}\n`);

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for imbalances
  allResults.forEach((result) => {
    // Dominant vs weak should have high win rate
    if (result.scenario.includes('dominant') && result.battler1WinRate < 0.85) {
      issues.push(`${result.scenario}: Dominant build should win more (${(result.battler1WinRate * 100).toFixed(1)}% < 85%)`);
      recommendations.push('Increase attribute impact on segment scores');
    }

    // Balanced should be close to 50/50
    if (result.scenario.includes('balanced') && Math.abs(result.battler1WinRate - 0.5) > 0.15) {
      issues.push(`${result.scenario}: Balanced matchup too skewed (${(result.battler1WinRate * 100).toFixed(1)}% vs 50%)`);
    }

    // High prep should beat no prep
    if (result.scenario.includes('prep') && result.battler1WinRate < 0.70) {
      issues.push(`${result.scenario}: Prep advantage insufficient (${(result.battler1WinRate * 100).toFixed(1)}% < 70%)`);
      recommendations.push('Increase CONFIG.PREP_EFFECT_MULTIPLIER');
    }

    // Choke rate checks
    if (result.chokeRate > 0.15) {
      issues.push(`${result.scenario}: Choke rate too high (${(result.chokeRate * 100).toFixed(1)}% > 15%)`);
      recommendations.push('Reduce CONFIG.CHOKE_BASE_PROBABILITY or increase resilience impact');
    }

    if (result.chokeRate < 0.01 && !result.scenario.includes('high-resilience')) {
      issues.push(`${result.scenario}: Choke rate too low (${(result.chokeRate * 100).toFixed(1)}% < 1%)`);
      recommendations.push('Increase CONFIG.CHOKE_BASE_PROBABILITY');
    }
  });

  if (issues.length === 0) {
    console.log('✓ All scenarios performed within expected ranges!\n');
  } else {
    console.log('Issues Detected:');
    issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
    console.log('');
  }

  if (recommendations.length > 0) {
    console.log('Recommendations:');
    const uniqueRecs = [...new Set(recommendations)];
    uniqueRecs.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
    console.log('');
  }

  // Summary statistics
  const totalBattles = allResults.reduce((sum, r) => sum + r.battlesRun, 0);
  const avgChoke = allResults.reduce((sum, r) => sum + r.chokeRate, 0) / allResults.length;

  console.log('Summary Statistics:');
  console.log(`  Total Scenarios: ${allResults.length}`);
  console.log(`  Total Battles: ${totalBattles}`);
  console.log(`  Avg Choke Rate: ${(avgChoke * 100).toFixed(1)}%`);
}

/**
 * Define test scenarios
 */
function getTestScenarios(): TestScenario[] {
  return [
    {
      name: 'dominant-vs-weak',
      description: 'God-tier battler vs low-tier battler',
      battler1Profile: {
        name: 'God_Tier',
        writing: { lyricism: 10, wordplay: 10, creativity: 10 },
        performance: { stage_presence: 10, crowd_control: 10, delivery: 10 },
        personal: { financial_stability: 8, reputation: 9, family_bond: 7 },
        resilience: 10,
      },
      battler2Profile: {
        name: 'Low_Tier',
        writing: { lyricism: 2, wordplay: 2, creativity: 2 },
        performance: { stage_presence: 2, crowd_control: 2, delivery: 2 },
        personal: { financial_stability: 3, reputation: 2, family_bond: 4 },
        resilience: 2,
      },
      prep1Pattern: 'balanced',
      prep2Pattern: 'balanced',
      expectedWinRate: { min: 0.90, max: 1.0 },
    },
    {
      name: 'balanced-matchup',
      description: 'Two mid-tier battlers with similar stats',
      battler1Profile: {
        name: 'Mid_Tier_A',
        writing: { lyricism: 6, wordplay: 6, creativity: 6 },
        performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
        personal: { financial_stability: 5, reputation: 5, family_bond: 5 },
        resilience: 6,
      },
      battler2Profile: {
        name: 'Mid_Tier_B',
        writing: { lyricism: 6, wordplay: 6, creativity: 6 },
        performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
        personal: { financial_stability: 5, reputation: 5, family_bond: 5 },
        resilience: 6,
      },
      prep1Pattern: 'balanced',
      prep2Pattern: 'balanced',
      expectedWinRate: { min: 0.40, max: 0.60 },
    },
    {
      name: 'high-prep-vs-no-prep',
      description: 'Mid-tier with good prep vs mid-tier with minimal prep',
      battler1Profile: {
        name: 'Prepared',
        writing: { lyricism: 6, wordplay: 6, creativity: 6 },
        performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
        personal: { financial_stability: 5, reputation: 5, family_bond: 5 },
        resilience: 6,
      },
      battler2Profile: {
        name: 'Unprepared',
        writing: { lyricism: 6, wordplay: 6, creativity: 6 },
        performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
        personal: { financial_stability: 5, reputation: 5, family_bond: 5 },
        resilience: 6,
      },
      prep1Pattern: 'balanced',
      prep2Pattern: 'minimal',
      expectedWinRate: { min: 0.70, max: 0.90 },
    },
    {
      name: 'writing-vs-performance-small-room',
      description: 'Writing specialist vs performance specialist in Small Room (writing-favored)',
      battler1Profile: {
        name: 'Writing_Spec',
        writing: { lyricism: 9, wordplay: 9, creativity: 9 },
        performance: { stage_presence: 4, crowd_control: 4, delivery: 4 },
        personal: { financial_stability: 5, reputation: 5, family_bond: 5 },
        resilience: 6,
      },
      battler2Profile: {
        name: 'Performance_Spec',
        writing: { lyricism: 4, wordplay: 4, creativity: 4 },
        performance: { stage_presence: 9, crowd_control: 9, delivery: 9 },
        personal: { financial_stability: 5, reputation: 5, family_bond: 5 },
        resilience: 6,
      },
      prep1Pattern: 'writing-heavy',
      prep2Pattern: 'performance-heavy',
      leaguePreference: 'small_room',
      expectedWinRate: { min: 0.60, max: 0.80 },
    },
    {
      name: 'writing-vs-performance-main-stage',
      description: 'Writing specialist vs performance specialist in Main Stage (performance-favored)',
      battler1Profile: {
        name: 'Writing_Spec',
        writing: { lyricism: 9, wordplay: 9, creativity: 9 },
        performance: { stage_presence: 4, crowd_control: 4, delivery: 4 },
        personal: { financial_stability: 5, reputation: 5, family_bond: 5 },
        resilience: 6,
      },
      battler2Profile: {
        name: 'Performance_Spec',
        writing: { lyricism: 4, wordplay: 4, creativity: 4 },
        performance: { stage_presence: 9, crowd_control: 9, delivery: 9 },
        personal: { financial_stability: 5, reputation: 5, family_bond: 5 },
        resilience: 6,
      },
      prep1Pattern: 'writing-heavy',
      prep2Pattern: 'performance-heavy',
      leaguePreference: 'main_stage',
      expectedWinRate: { min: 0.20, max: 0.40 },
    },
    {
      name: 'high-resilience-vs-low-resilience',
      description: 'High resilience vs low resilience - choke rate test',
      battler1Profile: {
        name: 'High_Resilience',
        writing: { lyricism: 6, wordplay: 6, creativity: 6 },
        performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
        personal: { financial_stability: 5, reputation: 5, family_bond: 5 },
        resilience: 10,
      },
      battler2Profile: {
        name: 'Low_Resilience',
        writing: { lyricism: 6, wordplay: 6, creativity: 6 },
        performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
        personal: { financial_stability: 5, reputation: 5, family_bond: 5 },
        resilience: 2,
      },
      prep1Pattern: 'balanced',
      prep2Pattern: 'balanced',
      expectedWinRate: { min: 0.55, max: 0.75 },
    },
  ];
}

/**
 * CLI Entry Point
 */
export async function runTestsCLI(): Promise<void> {
  const args = process.argv.slice(2);

  const config: TestConfig = {
    battlesPerScenario: 20,
    scenarios: ['all'],
    outputDir: 'test-results',
  };

  // Parse CLI arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--battles' && args[i + 1]) {
      config.battlesPerScenario = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--scenario' && args[i + 1]) {
      config.scenarios = args[i + 1].split(',');
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      config.outputDir = args[i + 1];
      i++;
    }
  }

  try {
    await runSimulationTests(config);
    process.exit(0);
  } catch (error: any) {
    console.error('Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runTestsCLI();
}
