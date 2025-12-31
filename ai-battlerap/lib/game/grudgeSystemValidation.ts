/**
 * Grudge System Validation Tests
 *
 * Purpose: Validate grudge creation, H2H tracking, and intensity calculations
 * Tests all trigger types, edge cases, and system integration
 *
 * Run: npx tsx lib/game/grudgeSystemValidation.ts
 */

import { analyzeAndCreateGrudge, GrudgeCreationResult } from './grudgeEngine';
import { updateHeadToHeadRecord, haveBattlersFaced, getHeadToHeadStats } from './headToHeadTracking';
import type { BattleResultForGrudge } from './grudgeEngine';
import type { BattleRecordData } from './headToHeadTracking';

// =====================================================
// TEST DATA GENERATORS
// =====================================================

function generateMockBattle(overrides: Partial<BattleResultForGrudge> = {}): BattleResultForGrudge {
  const defaults: BattleResultForGrudge = {
    battleId: `battle-${Date.now()}-${Math.random()}`,
    battlerA: {
      id: `battler-a-${Math.random()}`,
      stageName: 'Tech Wizard',
      rating: 1200,
    },
    battlerB: {
      id: `battler-b-${Math.random()}`,
      stageName: 'Young Pattern',
      rating: 1250,
    },
    winnerId: '',
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

  const result = { ...defaults, ...overrides };

  // Set winnerId based on rounds if not provided
  if (!result.winnerId) {
    const aWins = result.rounds.filter(r => r.battlerAWon).length;
    result.winnerId = aWins >= 2 ? result.battlerA.id : result.battlerB.id;
  }

  return result;
}

function generateH2HRecordData(battle: BattleResultForGrudge): BattleRecordData {
  const aAvg = battle.rounds.reduce((sum, r) => sum + r.battlerAScore, 0) / battle.rounds.length;
  const bAvg = battle.rounds.reduce((sum, r) => sum + r.battlerBScore, 0) / battle.rounds.length;

  return {
    battleId: battle.battleId,
    battlerAId: battle.battlerA.id,
    battlerBId: battle.battlerB.id,
    winnerId: battle.winnerId,
    score: battle.score,
    battlerAAvgScore: aAvg,
    battlerBAvgScore: bAvg,
    battlerACrowdReaction: 78,
    battlerBCrowdReaction: 82,
    battleDate: battle.scheduledAt,
  };
}

// =====================================================
// TEST SCENARIOS
// =====================================================

type TestScenario = {
  name: string;
  description: string;
  battleOverrides: Partial<BattleResultForGrudge>;
  expectedTrigger: string;
  expectedIntensityMin: number;
  expectedIntensityMax: number;
  expectedRematchDemandMin: number;
};

const TEST_SCENARIOS: TestScenario[] = [
  {
    name: 'Controversial Decision',
    description: 'Close avg scores (< 0.5 diff) but 2-1 result',
    battleOverrides: {
      hasControversy: true,
      wasClose: true,
      rounds: [
        { roundNumber: 1, battlerAScore: 7.8, battlerBScore: 7.9, battlerAWon: false },
        { roundNumber: 2, battlerAScore: 7.7, battlerBScore: 7.6, battlerAWon: true },
        { roundNumber: 3, battlerAScore: 7.9, battlerBScore: 7.8, battlerAWon: true },
      ],
    },
    expectedTrigger: 'controversial_decision',
    expectedIntensityMin: 35,
    expectedIntensityMax: 45,
    expectedRematchDemandMin: 70,
  },
  {
    name: 'Upset Victory',
    description: 'Lower-rated beats higher-rated by 150 points',
    battleOverrides: {
      battlerA: {
        id: 'battler-upset-a',
        stageName: 'Underdog',
        rating: 1100,
      },
      battlerB: {
        id: 'battler-upset-b',
        stageName: 'Favorite',
        rating: 1250,
      },
      wasUpset: true,
      winnerId: 'battler-upset-a', // Underdog wins!
      score: '2-1',
    },
    expectedTrigger: 'upset_victory',
    expectedIntensityMin: 45,
    expectedIntensityMax: 60,
    expectedRematchDemandMin: 60,
  },
  {
    name: 'Humiliation (3-0 Domination)',
    description: 'Complete 3-0 with wide margins',
    battleOverrides: {
      wasDomination: true,
      score: '3-0',
      rounds: [
        { roundNumber: 1, battlerAScore: 8.8, battlerBScore: 6.2, battlerAWon: true },
        { roundNumber: 2, battlerAScore: 9.1, battlerBScore: 6.5, battlerAWon: true },
        { roundNumber: 3, battlerAScore: 8.5, battlerBScore: 6.1, battlerAWon: true },
      ],
    },
    expectedTrigger: 'humiliation',
    expectedIntensityMin: 60,
    expectedIntensityMax: 70,
    expectedRematchDemandMin: 40,
  },
  {
    name: 'Close Battle',
    description: 'All rounds within 0.8 points, 2-1 result',
    battleOverrides: {
      wasClose: true,
      rounds: [
        { roundNumber: 1, battlerAScore: 7.5, battlerBScore: 8.0, battlerAWon: false },
        { roundNumber: 2, battlerAScore: 7.9, battlerBScore: 7.2, battlerAWon: true },
        { roundNumber: 3, battlerAScore: 7.8, battlerBScore: 7.3, battlerAWon: true },
      ],
    },
    expectedTrigger: 'close_battle',
    expectedIntensityMin: 25,
    expectedIntensityMax: 35,
    expectedRematchDemandMin: 50,
  },
  {
    name: 'Domination (Wide Margin)',
    description: '2-1 but avg score diff > 1.5',
    battleOverrides: {
      rounds: [
        { roundNumber: 1, battlerAScore: 8.8, battlerBScore: 6.9, battlerAWon: true },
        { roundNumber: 2, battlerAScore: 7.2, battlerBScore: 8.5, battlerAWon: false },
        { roundNumber: 3, battlerAScore: 8.9, battlerBScore: 7.0, battlerAWon: true },
      ],
    },
    expectedTrigger: 'domination',
    expectedIntensityMin: 30,
    expectedIntensityMax: 45,
    expectedRematchDemandMin: 30,
  },
];

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

async function runGrudgeCreationTests() {
  console.log('\n═══════════════════════════════════════════');
  console.log('GRUDGE SYSTEM VALIDATION TESTS');
  console.log('═══════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  for (const scenario of TEST_SCENARIOS) {
    console.log(`\n📋 Test: ${scenario.name}`);
    console.log(`   Description: ${scenario.description}`);

    try {
      // Generate battle data
      const battle = generateMockBattle(scenario.battleOverrides);

      // Run grudge analysis
      const result: GrudgeCreationResult = await analyzeAndCreateGrudge(battle);

      // Validate trigger detection
      if (result.trigger !== scenario.expectedTrigger) {
        console.log(`   ❌ FAIL: Expected trigger '${scenario.expectedTrigger}', got '${result.trigger}'`);
        failed++;
        continue;
      }

      // Validate intensity range
      if (result.intensity < scenario.expectedIntensityMin || result.intensity > scenario.expectedIntensityMax) {
        console.log(`   ❌ FAIL: Intensity ${result.intensity} not in range [${scenario.expectedIntensityMin}, ${scenario.expectedIntensityMax}]`);
        failed++;
        continue;
      }

      // Validate rematch demand
      if (result.rematchDemand < scenario.expectedRematchDemandMin) {
        console.log(`   ❌ FAIL: Rematch demand ${result.rematchDemand} below minimum ${scenario.expectedRematchDemandMin}`);
        failed++;
        continue;
      }

      // Validate origin story exists
      if (!result.originStory || result.originStory.length < 50) {
        console.log(`   ❌ FAIL: Origin story too short or missing`);
        failed++;
        continue;
      }

      console.log(`   ✅ PASS`);
      console.log(`      Trigger: ${result.trigger}`);
      console.log(`      Intensity: ${result.intensity}/100`);
      console.log(`      Rematch Demand: ${result.rematchDemand}/100`);
      console.log(`      Origin: ${result.originStory.substring(0, 80)}...`);
      passed++;

    } catch (error) {
      console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }

  return { passed, failed };
}

async function runH2HTrackingTests() {
  console.log('\n═══════════════════════════════════════════');
  console.log('HEAD-TO-HEAD TRACKING TESTS');
  console.log('═══════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Create initial H2H record
  console.log('\n📋 Test: Create Initial H2H Record');
  try {
    const battle1 = generateMockBattle({
      battlerA: { id: 'h2h-test-a', stageName: 'Fighter A', rating: 1200 },
      battlerB: { id: 'h2h-test-b', stageName: 'Fighter B', rating: 1200 },
    });

    const h2hData = generateH2HRecordData(battle1);
    await updateHeadToHeadRecord(h2hData);

    const faced = await haveBattlersFaced('h2h-test-a', 'h2h-test-b');
    if (!faced) {
      console.log('   ❌ FAIL: Battlers should have faced each other');
      failed++;
    } else {
      console.log('   ✅ PASS: H2H record created successfully');
      passed++;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    failed++;
  }

  // Test 2: Update existing H2H record
  console.log('\n📋 Test: Update Existing H2H Record (No Rematch Rule)');
  try {
    // This should NOT happen in V1, but we test that the system can handle it
    const battle2 = generateMockBattle({
      battleId: 'battle-rematch-test',
      battlerA: { id: 'h2h-test-a', stageName: 'Fighter A', rating: 1200 },
      battlerB: { id: 'h2h-test-b', stageName: 'Fighter B', rating: 1200 },
    });

    const h2hData2 = generateH2HRecordData(battle2);
    await updateHeadToHeadRecord(h2hData2);

    const stats = await getHeadToHeadStats('h2h-test-a', 'h2h-test-b');

    if (!stats || stats.totalBattles !== 2) {
      console.log('   ❌ FAIL: H2H record should show 2 battles');
      failed++;
    } else {
      console.log('   ✅ PASS: H2H record updated correctly');
      console.log(`      Total Battles: ${stats.totalBattles}`);
      console.log(`      Record: ${stats.battlerARecord.wins}-${stats.battlerARecord.losses}`);
      passed++;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    failed++;
  }

  return { passed, failed };
}

async function runIntegrationTests() {
  console.log('\n═══════════════════════════════════════════');
  console.log('INTEGRATION TESTS');
  console.log('═══════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  // Test: Full flow (Battle → H2H → Grudge)
  console.log('\n📋 Test: Full Integration Flow');
  try {
    const battle = generateMockBattle({
      battleId: 'integration-test-battle',
      battlerA: { id: 'int-a', stageName: 'Integration A', rating: 1100 },
      battlerB: { id: 'int-b', stageName: 'Integration B', rating: 1250 },
      wasUpset: true,
      hasControversy: true,
      winnerId: 'int-a', // Underdog wins
    });

    // Step 1: Update H2H
    const h2hData = generateH2HRecordData(battle);
    await updateHeadToHeadRecord(h2hData);

    // Step 2: Create grudge
    const grudgeResult = await analyzeAndCreateGrudge(battle);

    // Validate
    if (!grudgeResult.created && !grudgeResult.updated) {
      console.log('   ❌ FAIL: No grudge created or updated');
      failed++;
    } else if (grudgeResult.intensity < 40) {
      console.log('   ❌ FAIL: Intensity too low for upset + controversy');
      failed++;
    } else {
      console.log('   ✅ PASS: Full integration successful');
      console.log(`      H2H Record: Created`);
      console.log(`      Grudge: ${grudgeResult.created ? 'Created' : 'Updated'}`);
      console.log(`      Intensity: ${grudgeResult.intensity}/100`);
      console.log(`      Trigger: ${grudgeResult.trigger}`);
      passed++;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    failed++;
  }

  return { passed, failed };
}

// =====================================================
// MAIN TEST RUNNER
// =====================================================

async function main() {
  const startTime = Date.now();

  console.log('\n🚀 Starting Grudge System Validation...\n');

  // Run all test suites
  const grudgeResults = await runGrudgeCreationTests();
  const h2hResults = await runH2HTrackingTests();
  const integrationResults = await runIntegrationTests();

  // Calculate totals
  const totalPassed = grudgeResults.passed + h2hResults.passed + integrationResults.passed;
  const totalFailed = grudgeResults.failed + h2hResults.failed + integrationResults.failed;
  const totalTests = totalPassed + totalFailed;

  // Print summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n═══════════════════════════════════════════');
  console.log('TEST SUMMARY');
  console.log('═══════════════════════════════════════════\n');
  console.log(`Total Tests:    ${totalTests}`);
  console.log(`✅ Passed:      ${totalPassed}`);
  console.log(`❌ Failed:      ${totalFailed}`);
  console.log(`⏱  Duration:    ${duration}s`);
  console.log(`\nSuccess Rate:  ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed! Grudge system is working correctly.\n');
  } else {
    console.log(`\n⚠️  ${totalFailed} test(s) failed. Review failures above.\n`);
  }

  process.exit(totalFailed > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Fatal error during validation:', error);
    process.exit(1);
  });
}

export { runGrudgeCreationTests, runH2HTrackingTests, runIntegrationTests };
