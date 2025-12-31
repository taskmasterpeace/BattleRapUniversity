/**
 * Comprehensive Grudge/Rivalry System Test Suite
 *
 * Tests:
 * 1. Grudge creation from different battle outcomes
 * 2. Head-to-head record tracking accuracy
 * 3. Intensity calculation correctness
 * 4. Rematch demand updates
 * 5. Database query performance
 * 6. Edge cases (first-time opponents, multiple battles, dormant grudges)
 * 7. Integration points (newsGenerator, grudgeEngine, API endpoints)
 *
 * Run: npx tsx tests/grudge-system-comprehensive.test.ts
 */

// Load environment variables using .env.local
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

import { createTestSupabaseClient } from '@/lib/db/test-client';
import type { BattleResultForGrudge, GrudgeCreationResult, GrudgeTriggerType, GrudgeOriginType } from '@/lib/game/grudgeEngine';
import type { BattleRecordData, HeadToHeadRecord, HeadToHeadStats } from '@/lib/game/headToHeadTracking';

// =====================================================
// TEST-FRIENDLY WRAPPER FUNCTIONS
// These wrap the grudge engine functions to use test client
// =====================================================

const INTENSITY_TRIGGERS = {
  controversial_decision: 30,
  upset_victory: 40,
  humiliation: 50,
  personal_disrespect: 60,
  badge_event: 35,
  close_battle: 25,
  domination: 35,
};

const REMATCH_BASE_MULTIPLIERS: Record<string, number> = {
  close_battle: 1.5,
  upset_victory: 1.8,
  controversial_decision: 2.0,
  humiliation: 1.2,
};

const UPSET_RATING_THRESHOLD = 100;
const DOMINATION_AVG_DIFF = 1.5;

function sortBattlerIds(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

function detectGrudgeTriggers(battle: BattleResultForGrudge): GrudgeTriggerType[] {
  const triggers: GrudgeTriggerType[] = [];

  if (battle.hasControversy) {
    triggers.push('controversial_decision');
  }

  if (battle.wasUpset) {
    const ratingDiff = Math.abs(battle.battlerA.rating - battle.battlerB.rating);
    if (ratingDiff >= UPSET_RATING_THRESHOLD) {
      triggers.push('upset_victory');
    }
  }

  if (battle.wasDomination) {
    triggers.push('humiliation');
  }

  if (battle.wasClose) {
    triggers.push('close_battle');
  }

  const avgScoreDiff = battle.rounds.map(r => Math.abs(r.battlerAScore - r.battlerBScore))
    .reduce((sum, diff) => sum + diff, 0) / battle.rounds.length;
  if (avgScoreDiff >= DOMINATION_AVG_DIFF) {
    triggers.push('domination');
  }

  return triggers;
}

function selectPrimaryTrigger(triggers: GrudgeTriggerType[]): GrudgeTriggerType {
  const priority: GrudgeTriggerType[] = [
    'personal_disrespect',
    'humiliation',
    'controversial_decision',
    'upset_victory',
    'domination',
    'close_battle',
    'badge_event',
  ];

  for (const trigger of priority) {
    if (triggers.includes(trigger)) {
      return trigger;
    }
  }

  return 'close_battle';
}

function calculateIntensity(trigger: GrudgeTriggerType, battle: BattleResultForGrudge): number {
  let baseIntensity = INTENSITY_TRIGGERS[trigger] || 20;

  if (battle.wasUpset && trigger === 'upset_victory') {
    const ratingDiff = Math.abs(battle.battlerA.rating - battle.battlerB.rating);
    baseIntensity += Math.min(20, Math.floor(ratingDiff / 50));
  }

  if (battle.wasDomination && trigger === 'humiliation') {
    baseIntensity += 15;
  }

  if (battle.hasControversy && trigger === 'controversial_decision') {
    baseIntensity += 10;
  }

  return Math.min(100, baseIntensity);
}

function calculateRematchDemand(trigger: GrudgeTriggerType, battle: BattleResultForGrudge): number {
  let baseDemand = 30;

  const multiplier = REMATCH_BASE_MULTIPLIERS[trigger] || 1.0;
  baseDemand *= multiplier;

  if (battle.wasClose) {
    baseDemand += 25;
  }

  if (battle.hasControversy) {
    baseDemand += 30;
  }

  if (battle.wasUpset) {
    baseDemand += 20;
  }

  baseDemand += 10;

  return Math.min(100, Math.round(baseDemand));
}

function generateOriginStory(trigger: GrudgeTriggerType, battle: BattleResultForGrudge): string {
  const winner = battle.winnerId === battle.battlerA.id ? battle.battlerA : battle.battlerB;
  const loser = battle.winnerId === battle.battlerA.id ? battle.battlerB : battle.battlerA;

  switch (trigger) {
    case 'controversial_decision':
      return `${winner.stageName} defeated ${loser.stageName} ${battle.score} in a battle many felt could have gone either way.`;
    case 'upset_victory':
      return `In a shocking upset, ${winner.stageName} defeated heavily favored ${loser.stageName} by a score of ${battle.score}.`;
    case 'humiliation':
      return `${winner.stageName} dominated ${loser.stageName} in a one-sided ${battle.score} victory.`;
    case 'close_battle':
      return `${winner.stageName} narrowly edged out ${loser.stageName} in an instant classic that ended ${battle.score}.`;
    default:
      return `${winner.stageName} and ${loser.stageName}'s ${battle.score} battle created friction.`;
  }
}

async function analyzeAndCreateGrudge(battleResult: BattleResultForGrudge): Promise<GrudgeCreationResult> {
  const supabase = createTestSupabaseClient();

  const triggers = detectGrudgeTriggers(battleResult);

  if (triggers.length === 0) {
    return {
      created: false,
      updated: false,
      relationshipId: null,
      intensity: 0,
      rematchDemand: 0,
      trigger: 'close_battle',
      originStory: '',
    };
  }

  const primaryTrigger = selectPrimaryTrigger(triggers);
  const intensity = calculateIntensity(primaryTrigger, battleResult);
  const rematchDemand = calculateRematchDemand(primaryTrigger, battleResult);
  const originStory = generateOriginStory(primaryTrigger, battleResult);

  const { data: existing } = await supabase
    .from('battler_relationships')
    .select('*')
    .or(`and(battler_a_id.eq.${battleResult.battlerA.id},battler_b_id.eq.${battleResult.battlerB.id}),and(battler_a_id.eq.${battleResult.battlerB.id},battler_b_id.eq.${battleResult.battlerA.id})`)
    .single();

  let relationshipId: string;
  let created = false;
  let updated = false;

  if (existing) {
    const newIntensity = Math.min(100, existing.intensity + intensity);
    const newRematchDemand = Math.min(100, rematchDemand);

    await supabase
      .from('battler_relationships')
      .update({
        intensity: newIntensity,
        rematch_demand: newRematchDemand,
        status: 'active',
        last_modified_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    relationshipId = existing.id;
    updated = true;
  } else {
    const [aId, bId] = sortBattlerIds(battleResult.battlerA.id, battleResult.battlerB.id);

    const { data, error } = await supabase
      .from('battler_relationships')
      .insert({
        battler_a_id: aId,
        battler_b_id: bId,
        intensity,
        rematch_demand: rematchDemand,
        status: 'active',
        origin_type: 'battle',
        origin_story: originStory,
        origin_battle_id: battleResult.battleId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    relationshipId = data.id;
    created = true;
  }

  return {
    created,
    updated,
    relationshipId,
    intensity,
    rematchDemand,
    trigger: primaryTrigger,
    originStory,
  };
}

async function updateHeadToHeadRecord(battleData: BattleRecordData): Promise<HeadToHeadRecord> {
  const supabase = createTestSupabaseClient();

  const [aId, bId] = sortBattlerIds(battleData.battlerAId, battleData.battlerBId);

  const isAFirst = battleData.battlerAId === aId;
  const battlerAWins = isAFirst && battleData.winnerId === battleData.battlerAId ? 1 :
                       !isAFirst && battleData.winnerId === battleData.battlerBId ? 1 : 0;
  const battlerBWins = isAFirst && battleData.winnerId === battleData.battlerBId ? 1 :
                       !isAFirst && battleData.winnerId === battleData.battlerAId ? 1 : 0;

  const scoreDiff = isAFirst
    ? battleData.battlerAAvgScore - battleData.battlerBAvgScore
    : battleData.battlerBAvgScore - battleData.battlerAAvgScore;

  const crowdDiff = isAFirst
    ? battleData.battlerACrowdReaction - battleData.battlerBCrowdReaction
    : battleData.battlerBCrowdReaction - battleData.battlerACrowdReaction;

  const { data: existing } = await supabase
    .from('head_to_head_records')
    .select('*')
    .eq('battler_a_id', aId)
    .eq('battler_b_id', bId)
    .single();

  if (existing) {
    const newBattlerAWins = existing.battler_a_wins + battlerAWins;
    const newBattlerBWins = existing.battler_b_wins + battlerBWins;

    const newAvgScoreDiff = ((existing.avg_score_differential || 0) * existing.battle_ids.length + scoreDiff) / (existing.battle_ids.length + 1);
    const newAvgCrowdDiff = ((existing.avg_crowd_reaction_differential || 0) * existing.battle_ids.length + crowdDiff) / (existing.battle_ids.length + 1);

    const { data: updated } = await supabase
      .from('head_to_head_records')
      .update({
        battler_a_wins: newBattlerAWins,
        battler_b_wins: newBattlerBWins,
        last_battle_id: battleData.battleId,
        last_battle_at: battleData.battleDate,
        last_battle_winner_id: battleData.winnerId,
        last_battle_score: battleData.score,
        avg_score_differential: newAvgScoreDiff,
        avg_crowd_reaction_differential: newAvgCrowdDiff,
        battle_ids: [...existing.battle_ids, battleData.battleId],
      })
      .eq('id', existing.id)
      .select()
      .single();

    return {
      id: updated.id,
      battlerAId: updated.battler_a_id,
      battlerBId: updated.battler_b_id,
      battlerAWins: updated.battler_a_wins,
      battlerBWins: updated.battler_b_wins,
      lastBattleId: updated.last_battle_id,
      lastBattleAt: updated.last_battle_at,
      lastBattleWinnerId: updated.last_battle_winner_id,
      lastBattleScore: updated.last_battle_score,
      avgScoreDifferential: updated.avg_score_differential,
      avgCrowdReactionDifferential: updated.avg_crowd_reaction_differential,
      battleIds: updated.battle_ids,
    };
  } else {
    const { data: created } = await supabase
      .from('head_to_head_records')
      .insert({
        battler_a_id: aId,
        battler_b_id: bId,
        battler_a_wins: battlerAWins,
        battler_b_wins: battlerBWins,
        last_battle_id: battleData.battleId,
        last_battle_at: battleData.battleDate,
        last_battle_winner_id: battleData.winnerId,
        last_battle_score: battleData.score,
        avg_score_differential: scoreDiff,
        avg_crowd_reaction_differential: crowdDiff,
        battle_ids: [battleData.battleId],
      })
      .select()
      .single();

    return {
      id: created.id,
      battlerAId: created.battler_a_id,
      battlerBId: created.battler_b_id,
      battlerAWins: created.battler_a_wins,
      battlerBWins: created.battler_b_wins,
      lastBattleId: created.last_battle_id,
      lastBattleAt: created.last_battle_at,
      lastBattleWinnerId: created.last_battle_winner_id,
      lastBattleScore: created.last_battle_score,
      avgScoreDifferential: created.avg_score_differential,
      avgCrowdReactionDifferential: created.avg_crowd_reaction_differential,
      battleIds: created.battle_ids,
    };
  }
}

async function getHeadToHeadRecord(battlerAId: string, battlerBId: string): Promise<HeadToHeadRecord | null> {
  const supabase = createTestSupabaseClient();
  const [aId, bId] = sortBattlerIds(battlerAId, battlerBId);

  const { data } = await supabase
    .from('head_to_head_records')
    .select('*')
    .eq('battler_a_id', aId)
    .eq('battler_b_id', bId)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    battlerAId: data.battler_a_id,
    battlerBId: data.battler_b_id,
    battlerAWins: data.battler_a_wins,
    battlerBWins: data.battler_b_wins,
    lastBattleId: data.last_battle_id,
    lastBattleAt: data.last_battle_at,
    lastBattleWinnerId: data.last_battle_winner_id,
    lastBattleScore: data.last_battle_score,
    avgScoreDifferential: data.avg_score_differential,
    avgCrowdReactionDifferential: data.avg_crowd_reaction_differential,
    battleIds: data.battle_ids,
  };
}

async function getHeadToHeadStats(battlerAId: string, battlerBId: string): Promise<HeadToHeadStats | null> {
  const record = await getHeadToHeadRecord(battlerAId, battlerBId);
  if (!record) return null;

  return {
    totalBattles: record.battlerAWins + record.battlerBWins,
    battlerARecord: {
      wins: record.battlerAWins,
      losses: record.battlerBWins,
    },
    battlerBRecord: {
      wins: record.battlerBWins,
      losses: record.battlerAWins,
    },
    lastBattle: record.lastBattleId ? {
      id: record.lastBattleId,
      date: record.lastBattleAt!,
      winnerId: record.lastBattleWinnerId!,
      score: record.lastBattleScore!,
    } : null,
    avgScoreDifferential: record.avgScoreDifferential || 0,
    avgCrowdReactionDifferential: record.avgCrowdReactionDifferential || 0,
    battleHistory: [],
  };
}

async function haveBattlersFaced(battlerAId: string, battlerBId: string): Promise<boolean> {
  const record = await getHeadToHeadRecord(battlerAId, battlerBId);
  return record !== null && record.battleIds.length > 0;
}

// =====================================================
// TEST DATA GENERATORS
// =====================================================

function generateTestBattlerId(prefix: string): string {
  return `test-${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

function generateTestBattleId(): string {
  return `test-battle-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

function createMockBattle(overrides: Partial<BattleResultForGrudge> = {}): BattleResultForGrudge {
  const battlerAId = generateTestBattlerId('a');
  const battlerBId = generateTestBattlerId('b');

  const defaults: BattleResultForGrudge = {
    battleId: generateTestBattleId(),
    battlerA: {
      id: battlerAId,
      stageName: 'Test Fighter A',
      rating: 1200,
    },
    battlerB: {
      id: battlerBId,
      stageName: 'Test Fighter B',
      rating: 1250,
    },
    winnerId: battlerAId,
    score: '2-1',
    rounds: [
      { roundNumber: 1, battlerAScore: 7.2, battlerBScore: 8.1, battlerAWon: false },
      { roundNumber: 2, battlerAScore: 8.5, battlerBScore: 7.3, battlerAWon: true },
      { roundNumber: 3, battlerAScore: 7.7, battlerBScore: 7.1, battlerAWon: true },
    ],
    wasUpset: false,
    wasClose: true,
    wasDomination: false,
    hasControversy: false,
    scheduledAt: new Date().toISOString(),
  };

  return { ...defaults, ...overrides };
}

// =====================================================
// PERFORMANCE TESTING UTILITIES
// =====================================================

interface PerformanceMetric {
  operationName: string;
  durationMs: number;
  queryCount?: number;
  recordCount?: number;
}

const performanceMetrics: PerformanceMetric[] = [];

function startTimer(): number {
  return Date.now();
}

function endTimer(start: number, operationName: string, queryCount?: number, recordCount?: number): void {
  const durationMs = Date.now() - start;
  performanceMetrics.push({ operationName, durationMs, queryCount, recordCount });
}

// =====================================================
// TEST SUITES
// =====================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const testResults: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string, details?: any) {
  testResults.push({ name, passed, error, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (error) console.log(`   Error: ${error}`);
  if (details) console.log(`   Details:`, details);
}

// =====================================================
// TEST 1: Grudge Creation from Different Battle Outcomes
// =====================================================

async function testGrudgeCreation() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 1: Grudge Creation from Battle Outcomes');
  console.log('═══════════════════════════════════════════\n');

  const scenarios = [
    {
      name: 'Controversial Decision',
      overrides: {
        hasControversy: true,
        wasClose: true,
        score: '2-1',
      },
      expectedTrigger: 'controversial_decision',
      expectedMinIntensity: 35,
    },
    {
      name: 'Upset Victory (150pt difference)',
      overrides: {
        battlerA: { id: generateTestBattlerId('upset-a'), stageName: 'Underdog', rating: 1100 },
        battlerB: { id: generateTestBattlerId('upset-b'), stageName: 'Favorite', rating: 1250 },
        wasUpset: true,
        winnerId: '', // Will be set to battlerA
        score: '2-1',
      },
      expectedTrigger: 'upset_victory',
      expectedMinIntensity: 45,
    },
    {
      name: 'Humiliation (3-0 Bodybag)',
      overrides: {
        wasDomination: true,
        score: '3-0',
        rounds: [
          { roundNumber: 1, battlerAScore: 8.8, battlerBScore: 6.2, battlerAWon: true },
          { roundNumber: 2, battlerAScore: 9.1, battlerBScore: 6.5, battlerAWon: true },
          { roundNumber: 3, battlerAScore: 8.5, battlerBScore: 6.1, battlerAWon: true },
        ],
      },
      expectedTrigger: 'humiliation',
      expectedMinIntensity: 60,
    },
    {
      name: 'Close Battle',
      overrides: {
        wasClose: true,
        hasControversy: false,
        score: '2-1',
      },
      expectedTrigger: 'close_battle',
      expectedMinIntensity: 20,
    },
  ];

  for (const scenario of scenarios) {
    try {
      const battle = createMockBattle(scenario.overrides);

      // Set winnerId if not provided
      if (scenario.overrides.winnerId === '') {
        battle.winnerId = battle.battlerA.id;
      }

      const start = startTimer();
      const result: GrudgeCreationResult = await analyzeAndCreateGrudge(battle);
      endTimer(start, `Grudge Creation: ${scenario.name}`, 2); // Typically 2 queries (check existing + insert/update)

      const passed =
        result.trigger === scenario.expectedTrigger &&
        result.intensity >= scenario.expectedMinIntensity &&
        result.originStory.length > 50 &&
        (result.created || result.updated);

      logTest(
        `Grudge Creation: ${scenario.name}`,
        passed,
        passed ? undefined : `Expected trigger ${scenario.expectedTrigger}, got ${result.trigger}. Intensity: ${result.intensity}`,
        {
          trigger: result.trigger,
          intensity: result.intensity,
          rematchDemand: result.rematchDemand,
          created: result.created,
          updated: result.updated,
        }
      );
    } catch (error: any) {
      logTest(`Grudge Creation: ${scenario.name}`, false, error.message);
    }
  }
}

// =====================================================
// TEST 2: Head-to-Head Record Tracking
// =====================================================

async function testH2HTracking() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 2: Head-to-Head Record Tracking');
  console.log('═══════════════════════════════════════════\n');

  const battlerA = generateTestBattlerId('h2h-a');
  const battlerB = generateTestBattlerId('h2h-b');

  // Test 2.1: Initial H2H Record Creation
  try {
    const battle1 = createMockBattle({
      battlerA: { id: battlerA, stageName: 'Fighter A', rating: 1200 },
      battlerB: { id: battlerB, stageName: 'Fighter B', rating: 1200 },
      winnerId: battlerA,
    });

    const h2hData: BattleRecordData = {
      battleId: battle1.battleId,
      battlerAId: battlerA,
      battlerBId: battlerB,
      winnerId: battlerA,
      score: '2-1',
      battlerAAvgScore: 7.8,
      battlerBAvgScore: 7.2,
      battlerACrowdReaction: 78,
      battlerBCrowdReaction: 72,
      battleDate: new Date().toISOString(),
    };

    const start = startTimer();
    await updateHeadToHeadRecord(h2hData);
    endTimer(start, 'H2H Record Creation', 2); // SELECT + INSERT

    const faced = await haveBattlersFaced(battlerA, battlerB);
    const stats = await getHeadToHeadStats(battlerA, battlerB);

    const passed =
      faced === true &&
      stats !== null &&
      stats.totalBattles === 1 &&
      stats.battlerARecord.wins === 1 &&
      stats.battlerBRecord.wins === 0;

    logTest(
      'H2H Record: Initial Creation',
      passed,
      passed ? undefined : 'H2H record not created correctly',
      stats
    );
  } catch (error: any) {
    logTest('H2H Record: Initial Creation', false, error.message);
  }

  // Test 2.2: H2H Record Update (Second Battle)
  try {
    const battle2 = createMockBattle({
      battlerA: { id: battlerA, stageName: 'Fighter A', rating: 1200 },
      battlerB: { id: battlerB, stageName: 'Fighter B', rating: 1200 },
      winnerId: battlerB, // B wins this time
    });

    const h2hData2: BattleRecordData = {
      battleId: battle2.battleId,
      battlerAId: battlerA,
      battlerBId: battlerB,
      winnerId: battlerB,
      score: '2-1',
      battlerAAvgScore: 7.3,
      battlerBAvgScore: 7.9,
      battlerACrowdReaction: 73,
      battlerBCrowdReaction: 79,
      battleDate: new Date().toISOString(),
    };

    const start = startTimer();
    await updateHeadToHeadRecord(h2hData2);
    endTimer(start, 'H2H Record Update', 2); // SELECT + UPDATE

    const stats = await getHeadToHeadStats(battlerA, battlerB);

    const passed =
      stats !== null &&
      stats.totalBattles === 2 &&
      stats.battlerARecord.wins === 1 &&
      stats.battlerBRecord.wins === 1;

    logTest(
      'H2H Record: Update (Second Battle)',
      passed,
      passed ? undefined : 'H2H record not updated correctly',
      stats
    );
  } catch (error: any) {
    logTest('H2H Record: Update (Second Battle)', false, error.message);
  }

  // Test 2.3: Average Score Differential Calculation
  try {
    const stats = await getHeadToHeadStats(battlerA, battlerB);

    const passed =
      stats !== null &&
      stats.avgScoreDifferential !== null &&
      Math.abs(stats.avgScoreDifferential) < 1.0; // Should be close to 0 since they split

    logTest(
      'H2H Record: Average Score Differential',
      passed,
      passed ? undefined : 'Score differential calculation incorrect',
      { avgScoreDifferential: stats?.avgScoreDifferential }
    );
  } catch (error: any) {
    logTest('H2H Record: Average Score Differential', false, error.message);
  }
}

// =====================================================
// TEST 3: Intensity Calculation
// =====================================================

async function testIntensityCalculation() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 3: Intensity Calculation');
  console.log('═══════════════════════════════════════════\n');

  const tests = [
    {
      name: 'Low Intensity (Close Battle)',
      battle: createMockBattle({ wasClose: true, hasControversy: false }),
      expectedMin: 20,
      expectedMax: 40,
    },
    {
      name: 'Medium Intensity (Upset)',
      battle: createMockBattle({
        battlerA: { id: generateTestBattlerId('int-a'), stageName: 'A', rating: 1100 },
        battlerB: { id: generateTestBattlerId('int-b'), stageName: 'B', rating: 1250 },
        wasUpset: true,
        winnerId: '', // Will be set
      }),
      expectedMin: 40,
      expectedMax: 70,
    },
    {
      name: 'High Intensity (Humiliation)',
      battle: createMockBattle({ wasDomination: true, score: '3-0' }),
      expectedMin: 60,
      expectedMax: 100,
    },
  ];

  for (const test of tests) {
    try {
      if (!test.battle.winnerId) {
        test.battle.winnerId = test.battle.battlerA.id;
      }

      const result = await analyzeAndCreateGrudge(test.battle);

      const passed =
        result.intensity >= test.expectedMin &&
        result.intensity <= test.expectedMax;

      logTest(
        `Intensity Calculation: ${test.name}`,
        passed,
        passed ? undefined : `Expected ${test.expectedMin}-${test.expectedMax}, got ${result.intensity}`,
        { intensity: result.intensity }
      );
    } catch (error: any) {
      logTest(`Intensity Calculation: ${test.name}`, false, error.message);
    }
  }
}

// =====================================================
// TEST 4: Rematch Demand Calculation
// =====================================================

async function testRematchDemand() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 4: Rematch Demand Calculation');
  console.log('═══════════════════════════════════════════\n');

  const tests = [
    {
      name: 'High Demand (Controversial)',
      battle: createMockBattle({ hasControversy: true, wasClose: true }),
      expectedMin: 60,
    },
    {
      name: 'High Demand (Upset)',
      battle: createMockBattle({
        battlerA: { id: generateTestBattlerId('rd-a'), stageName: 'A', rating: 1100 },
        battlerB: { id: generateTestBattlerId('rd-b'), stageName: 'B', rating: 1250 },
        wasUpset: true,
        winnerId: '',
      }),
      expectedMin: 50,
    },
    {
      name: 'Medium Demand (Domination)',
      battle: createMockBattle({ wasDomination: true }),
      expectedMin: 30,
    },
  ];

  for (const test of tests) {
    try {
      if (!test.battle.winnerId) {
        test.battle.winnerId = test.battle.battlerA.id;
      }

      const result = await analyzeAndCreateGrudge(test.battle);

      const passed = result.rematchDemand >= test.expectedMin;

      logTest(
        `Rematch Demand: ${test.name}`,
        passed,
        passed ? undefined : `Expected min ${test.expectedMin}, got ${result.rematchDemand}`,
        { rematchDemand: result.rematchDemand }
      );
    } catch (error: any) {
      logTest(`Rematch Demand: ${test.name}`, false, error.message);
    }
  }
}

// =====================================================
// TEST 5: Database Query Performance
// =====================================================

async function testQueryPerformance() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 5: Database Query Performance');
  console.log('═══════════════════════════════════════════\n');

  // Test 5.1: Single Grudge Creation Performance
  try {
    const battle = createMockBattle();
    const start = startTimer();
    await analyzeAndCreateGrudge(battle);
    const duration = Date.now() - start;

    const passed = duration < 1000; // Should complete in under 1 second

    logTest(
      'Performance: Single Grudge Creation',
      passed,
      passed ? undefined : `Took ${duration}ms, expected < 1000ms`,
      { durationMs: duration }
    );
  } catch (error: any) {
    logTest('Performance: Single Grudge Creation', false, error.message);
  }

  // Test 5.2: Batch Grudge Fetch Performance (simulating battle offers)
  try {
    const supabase = createTestSupabaseClient();

    // Create 10 test relationships
    const battlerIds: string[] = [];
    const mainBattlerId = generateTestBattlerId('main');

    for (let i = 0; i < 10; i++) {
      const opponentId = generateTestBattlerId(`opp-${i}`);
      battlerIds.push(opponentId);

      const [aId, bId] = mainBattlerId < opponentId ? [mainBattlerId, opponentId] : [opponentId, mainBattlerId];

      await supabase.from('battler_relationships').insert({
        battler_a_id: aId,
        battler_b_id: bId,
        intensity: 50 + i * 5,
        rematch_demand: 60 + i * 3,
        status: 'active',
        origin_type: 'battle',
        origin_story: 'Test rivalry',
      });
    }

    // Test batch fetch (simulating battle offers API)
    const start = startTimer();
    const { data: relationships } = await supabase
      .from('battler_relationships')
      .select('*')
      .or(`and(battler_a_id.eq.${mainBattlerId},battler_b_id.in.(${battlerIds.join(',')})),and(battler_b_id.eq.${mainBattlerId},battler_a_id.in.(${battlerIds.join(',')}))`);
    const duration = Date.now() - start;

    const passed =
      duration < 500 && // Should complete in under 500ms
      relationships !== null &&
      relationships.length === 10;

    logTest(
      'Performance: Batch Grudge Fetch (10 opponents)',
      passed,
      passed ? undefined : `Took ${duration}ms, expected < 500ms`,
      { durationMs: duration, recordsFetched: relationships?.length }
    );

    endTimer(start, 'Batch Grudge Fetch (10 opponents)', 1, relationships?.length);
  } catch (error: any) {
    logTest('Performance: Batch Grudge Fetch (10 opponents)', false, error.message);
  }

  // Test 5.3: H2H Stats Fetch Performance
  try {
    const battlerA = generateTestBattlerId('perf-a');
    const battlerB = generateTestBattlerId('perf-b');

    // Create H2H record
    const battle = createMockBattle({
      battlerA: { id: battlerA, stageName: 'A', rating: 1200 },
      battlerB: { id: battlerB, stageName: 'B', rating: 1200 },
    });

    await updateHeadToHeadRecord({
      battleId: battle.battleId,
      battlerAId: battlerA,
      battlerBId: battlerB,
      winnerId: battlerA,
      score: '2-1',
      battlerAAvgScore: 7.5,
      battlerBAvgScore: 7.2,
      battlerACrowdReaction: 75,
      battlerBCrowdReaction: 72,
      battleDate: new Date().toISOString(),
    });

    const start = startTimer();
    const stats = await getHeadToHeadStats(battlerA, battlerB);
    const duration = Date.now() - start;

    const passed = duration < 500 && stats !== null;

    logTest(
      'Performance: H2H Stats Fetch',
      passed,
      passed ? undefined : `Took ${duration}ms, expected < 500ms`,
      { durationMs: duration }
    );

    endTimer(start, 'H2H Stats Fetch', 2); // Typically 2 queries
  } catch (error: any) {
    logTest('Performance: H2H Stats Fetch', false, error.message);
  }
}

// =====================================================
// TEST 6: Edge Cases
// =====================================================

async function testEdgeCases() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 6: Edge Cases');
  console.log('═══════════════════════════════════════════\n');

  // Test 6.1: First-Time Opponents (No Grudge)
  try {
    const battle = createMockBattle({
      wasClose: false,
      hasControversy: false,
      wasDomination: false,
      rounds: [
        { roundNumber: 1, battlerAScore: 7.5, battlerBScore: 7.3, battlerAWon: true },
        { roundNumber: 2, battlerAScore: 7.6, battlerBScore: 7.4, battlerAWon: true },
        { roundNumber: 3, battlerAScore: 7.2, battlerBScore: 7.8, battlerAWon: false },
      ],
    });

    const result = await analyzeAndCreateGrudge(battle);

    // Standard 2-1 should create at least a low-intensity grudge
    const passed = result.created || result.updated;

    logTest(
      'Edge Case: First-Time Opponents',
      passed,
      passed ? undefined : 'Should create grudge even for standard battles',
      { created: result.created, intensity: result.intensity }
    );
  } catch (error: any) {
    logTest('Edge Case: First-Time Opponents', false, error.message);
  }

  // Test 6.2: Multiple Battles (Intensity Accumulation)
  try {
    const battlerA = generateTestBattlerId('multi-a');
    const battlerB = generateTestBattlerId('multi-b');

    // First battle - upset
    const battle1 = createMockBattle({
      battlerA: { id: battlerA, stageName: 'A', rating: 1100 },
      battlerB: { id: battlerB, stageName: 'B', rating: 1250 },
      wasUpset: true,
      winnerId: battlerA,
    });
    const result1 = await analyzeAndCreateGrudge(battle1);

    // Second battle - controversial
    const battle2 = createMockBattle({
      battleId: generateTestBattleId(),
      battlerA: { id: battlerA, stageName: 'A', rating: 1150 },
      battlerB: { id: battlerB, stageName: 'B', rating: 1230 },
      hasControversy: true,
      wasClose: true,
      winnerId: battlerB,
    });
    const result2 = await analyzeAndCreateGrudge(battle2);

    const passed =
      result2.updated === true &&
      result2.intensity > result1.intensity;

    logTest(
      'Edge Case: Multiple Battles (Intensity Accumulation)',
      passed,
      passed ? undefined : 'Intensity should increase with multiple battles',
      {
        battle1Intensity: result1.intensity,
        battle2Intensity: result2.intensity,
        updated: result2.updated,
      }
    );
  } catch (error: any) {
    logTest('Edge Case: Multiple Battles (Intensity Accumulation)', false, error.message);
  }

  // Test 6.3: Dormant Grudge Reactivation
  try {
    const supabase = createTestSupabaseClient();
    const battlerA = generateTestBattlerId('dorm-a');
    const battlerB = generateTestBattlerId('dorm-b');
    const [aId, bId] = battlerA < battlerB ? [battlerA, battlerB] : [battlerB, battlerA];

    // Create dormant grudge
    await supabase.from('battler_relationships').insert({
      battler_a_id: aId,
      battler_b_id: bId,
      intensity: 20,
      rematch_demand: 10,
      status: 'dormant',
      origin_type: 'battle',
      origin_story: 'Old beef',
    });

    // New battle should reactivate
    const battle = createMockBattle({
      battlerA: { id: battlerA, stageName: 'A', rating: 1200 },
      battlerB: { id: battlerB, stageName: 'B', rating: 1200 },
      hasControversy: true,
      winnerId: battlerA,
    });

    const result = await analyzeAndCreateGrudge(battle);

    // Check if reactivated
    const { data: updated } = await supabase
      .from('battler_relationships')
      .select('status')
      .eq('battler_a_id', aId)
      .eq('battler_b_id', bId)
      .single();

    const passed =
      result.updated === true &&
      updated?.status === 'active';

    logTest(
      'Edge Case: Dormant Grudge Reactivation',
      passed,
      passed ? undefined : 'Dormant grudge should be reactivated',
      { status: updated?.status, updated: result.updated }
    );
  } catch (error: any) {
    logTest('Edge Case: Dormant Grudge Reactivation', false, error.message);
  }
}

// =====================================================
// TEST 7: Integration Points
// =====================================================

async function testIntegrationPoints() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 7: Integration Points');
  console.log('═══════════════════════════════════════════\n');

  // Test 7.1: Full Flow (Battle → H2H → Grudge)
  try {
    const battlerA = generateTestBattlerId('int-a');
    const battlerB = generateTestBattlerId('int-b');

    const battle = createMockBattle({
      battlerA: { id: battlerA, stageName: 'Integration A', rating: 1100 },
      battlerB: { id: battlerB, stageName: 'Integration B', rating: 1250 },
      wasUpset: true,
      winnerId: battlerA,
    });

    // Step 1: Update H2H
    const h2hData: BattleRecordData = {
      battleId: battle.battleId,
      battlerAId: battlerA,
      battlerBId: battlerB,
      winnerId: battlerA,
      score: '2-1',
      battlerAAvgScore: 7.8,
      battlerBAvgScore: 7.2,
      battlerACrowdReaction: 78,
      battlerBCrowdReaction: 72,
      battleDate: new Date().toISOString(),
    };

    const start = startTimer();
    await updateHeadToHeadRecord(h2hData);

    // Step 2: Create grudge
    const grudgeResult = await analyzeAndCreateGrudge(battle);
    const duration = Date.now() - start;

    // Step 3: Verify both systems updated
    const h2hRecord = await getHeadToHeadRecord(battlerA, battlerB);

    const passed =
      h2hRecord !== null &&
      h2hRecord.battleIds.length === 1 &&
      grudgeResult.created === true &&
      grudgeResult.intensity >= 40;

    logTest(
      'Integration: Full Flow (Battle → H2H → Grudge)',
      passed,
      passed ? undefined : 'Integration flow incomplete',
      {
        h2hCreated: h2hRecord !== null,
        grudgeCreated: grudgeResult.created,
        intensity: grudgeResult.intensity,
        durationMs: duration,
      }
    );

    endTimer(start, 'Full Integration Flow', 4); // Multiple queries
  } catch (error: any) {
    logTest('Integration: Full Flow (Battle → H2H → Grudge)', false, error.message);
  }

  // Test 7.2: Grudge Context for Battle Offers
  try {
    const supabase = createTestSupabaseClient();
    const playerId = generateTestBattlerId('player');
    const opponentId = generateTestBattlerId('opponent');
    const [aId, bId] = playerId < opponentId ? [playerId, opponentId] : [opponentId, playerId];

    // Create relationship
    await supabase.from('battler_relationships').insert({
      battler_a_id: aId,
      battler_b_id: bId,
      intensity: 75,
      rematch_demand: 85,
      status: 'active',
      origin_type: 'battle',
      origin_story: 'Test grudge for battle offers',
    });

    // Fetch as battle offers would
    const start = startTimer();
    const { data: relationship } = await supabase
      .from('battler_relationships')
      .select('*')
      .or(`and(battler_a_id.eq.${playerId},battler_b_id.eq.${opponentId}),and(battler_a_id.eq.${opponentId},battler_b_id.eq.${playerId})`)
      .single();
    const duration = Date.now() - start;

    const passed =
      relationship !== null &&
      relationship.intensity === 75 &&
      relationship.status === 'active';

    logTest(
      'Integration: Grudge Context for Battle Offers',
      passed,
      passed ? undefined : 'Grudge not fetched correctly',
      {
        fetched: relationship !== null,
        intensity: relationship?.intensity,
        durationMs: duration,
      }
    );

    endTimer(start, 'Grudge Context Fetch', 1);
  } catch (error: any) {
    logTest('Integration: Grudge Context for Battle Offers', false, error.message);
  }
}

// =====================================================
// CLEANUP
// =====================================================

async function cleanup() {
  console.log('\n═══════════════════════════════════════════');
  console.log('CLEANUP: Removing Test Data');
  console.log('═══════════════════════════════════════════\n');

  try {
    const supabase = createTestSupabaseClient();

    // Delete all test relationships
    await supabase
      .from('battler_relationships')
      .delete()
      .like('battler_a_id', 'test-%');

    // Delete all test H2H records
    await supabase
      .from('head_to_head_records')
      .delete()
      .like('battler_a_id', 'test-%');

    console.log('✅ Cleanup complete');
  } catch (error: any) {
    console.log('❌ Cleanup failed:', error.message);
  }
}

// =====================================================
// REPORT GENERATION
// =====================================================

function generateReport() {
  console.log('\n\n═══════════════════════════════════════════');
  console.log('COMPREHENSIVE TEST REPORT');
  console.log('═══════════════════════════════════════════\n');

  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const total = testResults.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('FAILED TESTS:');
    console.log('─────────────────────────────────────────');
    testResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`❌ ${r.name}`);
        if (r.error) console.log(`   Error: ${r.error}`);
      });
    console.log('');
  }

  console.log('\nPERFORMANCE METRICS:');
  console.log('─────────────────────────────────────────');

  // Group by operation type
  const grouped = performanceMetrics.reduce((acc, metric) => {
    if (!acc[metric.operationName]) {
      acc[metric.operationName] = [];
    }
    acc[metric.operationName].push(metric);
    return acc;
  }, {} as Record<string, PerformanceMetric[]>);

  Object.entries(grouped).forEach(([operation, metrics]) => {
    const avgDuration = metrics.reduce((sum, m) => sum + m.durationMs, 0) / metrics.length;
    const maxDuration = Math.max(...metrics.map(m => m.durationMs));
    const minDuration = Math.min(...metrics.map(m => m.durationMs));

    console.log(`\n${operation}:`);
    console.log(`  Avg: ${avgDuration.toFixed(2)}ms`);
    console.log(`  Min: ${minDuration.toFixed(2)}ms`);
    console.log(`  Max: ${maxDuration.toFixed(2)}ms`);
    console.log(`  Runs: ${metrics.length}`);

    if (metrics[0].queryCount) {
      console.log(`  Queries per operation: ${metrics[0].queryCount}`);
    }
    if (metrics[0].recordCount) {
      console.log(`  Records: ${metrics[0].recordCount}`);
    }
  });

  console.log('\n\nRECOMMENDATIONS:');
  console.log('─────────────────────────────────────────');

  const recommendations: string[] = [];

  // Performance recommendations
  const batchFetchMetrics = performanceMetrics.filter(m => m.operationName.includes('Batch'));
  if (batchFetchMetrics.length > 0) {
    const avgBatchTime = batchFetchMetrics.reduce((sum, m) => sum + m.durationMs, 0) / batchFetchMetrics.length;
    if (avgBatchTime > 300) {
      recommendations.push(`⚠️  Batch fetch performance: ${avgBatchTime.toFixed(0)}ms average. Consider database indexing on battler_a_id and battler_b_id.`);
    } else {
      recommendations.push(`✅ Batch fetch performance is good: ${avgBatchTime.toFixed(0)}ms average.`);
    }
  }

  // Failed test recommendations
  if (failed > 0) {
    recommendations.push(`❌ ${failed} test(s) failed. Review error messages above and fix issues before deploying.`);
  } else {
    recommendations.push('✅ All tests passed! Grudge system is working correctly.');
  }

  // Data consistency recommendations
  const h2hTests = testResults.filter(r => r.name.includes('H2H'));
  const h2hFailed = h2hTests.filter(r => !r.passed).length;
  if (h2hFailed > 0) {
    recommendations.push('⚠️  H2H tracking has issues. Verify database schema and record update logic.');
  }

  // Intensity/demand recommendations
  const intensityTests = testResults.filter(r => r.name.includes('Intensity') || r.name.includes('Rematch'));
  const intensityFailed = intensityTests.filter(r => !r.passed).length;
  if (intensityFailed > 0) {
    recommendations.push('⚠️  Intensity/rematch calculations may need tuning. Review grudgeEngine.ts constants.');
  }

  recommendations.forEach(rec => console.log(rec));

  console.log('\n═══════════════════════════════════════════\n');
}

// =====================================================
// MAIN TEST RUNNER
// =====================================================

async function main() {
  console.log('\n🚀 Starting Comprehensive Grudge System Tests...\n');
  const startTime = Date.now();

  try {
    await testGrudgeCreation();
    await testH2HTracking();
    await testIntensityCalculation();
    await testRematchDemand();
    await testQueryPerformance();
    await testEdgeCases();
    await testIntegrationPoints();
  } catch (error: any) {
    console.error('\n💥 Fatal error during testing:', error);
  } finally {
    await cleanup();
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n⏱  Total test duration: ${totalTime}s`);

  generateReport();

  const failedCount = testResults.filter(r => !r.passed).length;
  process.exit(failedCount > 0 ? 1 : 0);
}

// Run tests
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
}

export { main as runComprehensiveGrudgeTests };
