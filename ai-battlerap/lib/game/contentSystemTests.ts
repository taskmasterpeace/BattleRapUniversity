/**
 * Content/Style System - Comprehensive Test Suite
 *
 * Three extensive test suites to validate:
 * 1. Effectiveness Matrix (all super effective / not very effective matchups)
 * 2. Crowd Demographics (preferences by league)
 * 3. Full Integration (effectiveness × crowd × context)
 *
 * Run with: npx tsx lib/game/contentSystemTests.ts
 */

import {
  getEffectiveness,
  getMatchupDetails,
  getSuperEffectiveAgainst,
  getNotVeryEffectiveAgainst,
  calculateAverageEffectiveness,
  getAllMatchups,
} from './contentEffectiveness';

import {
  calculateCrowdPreference,
  getLeagueDemographics,
  getDominantDemographic,
} from './crowdDemographics';

import {
  getContextModifier,
  getLeagueContextModifier,
  calculateAverageContextModifier,
} from './contextModifiers';

import { ContentType, DeliveryType, PerformanceType } from './contentTypes';

// =====================================================
// TEST SUITE 1: EFFECTIVENESS MATRIX VALIDATION
// =====================================================

function testEffectivenessMatrix() {
  console.log('\n=== TEST SUITE 1: EFFECTIVENESS MATRIX VALIDATION ===\n');

  let passed = 0;
  let failed = 0;

  // Test all super effective matchups
  console.log('Testing SUPER EFFECTIVE matchups (should be 2.0x)...\n');

  const superEffectiveTests = [
    { your: 'personals' as ContentType, vs: 'comedy' as ContentType, expected: 2.0 },
    { your: 'personals' as ContentType, vs: 'gun_bars' as ContentType, expected: 2.0 },
    { your: 'street_talk' as ContentType, vs: 'gun_bars' as ContentType, expected: 2.0 },
    { your: 'comedy' as ContentType, vs: 'wordplay' as ContentType, expected: 2.0 },
    { your: 'comedy' as ContentType, vs: 'schemes' as ContentType, expected: 2.0 },
    { your: 'wordplay' as ContentType, vs: 'gun_bars' as ContentType, expected: 2.0 },
    { your: 'schemes' as ContentType, vs: 'shock_value' as ContentType, expected: 2.0 },
    { your: 'freestyles' as ContentType, vs: 'rebuttals' as ContentType, expected: 2.0 },
    { your: 'rebuttals' as ContentType, vs: 'personals' as ContentType, expected: 2.0 },
    { your: 'pop_culture_refs' as ContentType, vs: 'social_commentary' as ContentType, expected: 2.0 },
    { your: 'aggressive' as DeliveryType, vs: 'nonchalant' as DeliveryType, expected: 2.0 },
    { your: 'theatrical' as PerformanceType, vs: 'minimalist' as PerformanceType, expected: 2.0 },
  ];

  for (const test of superEffectiveTests) {
    const result = getEffectiveness(test.your, test.vs);
    if (result === test.expected) {
      console.log(`✓ ${test.your} vs ${test.vs}: ${result}x (CORRECT)`);
      passed++;
    } else {
      console.log(`✗ ${test.your} vs ${test.vs}: Expected ${test.expected}x, got ${result}x (FAILED)`);
      failed++;
    }
  }

  // Test all not very effective matchups
  console.log('\nTesting NOT VERY EFFECTIVE matchups (should be 0.5x)...\n');

  const notVeryEffectiveTests = [
    { your: 'comedy' as ContentType, vs: 'personals' as ContentType, expected: 0.5 },
    { your: 'gun_bars' as ContentType, vs: 'street_talk' as ContentType, expected: 0.5 },
    { your: 'wordplay' as ContentType, vs: 'comedy' as ContentType, expected: 0.5 },
    { your: 'schemes' as ContentType, vs: 'freestyles' as ContentType, expected: 0.5 },
    { your: 'gun_bars' as ContentType, vs: 'personals' as ContentType, expected: 0.5 },
    { your: 'shock_value' as ContentType, vs: 'schemes' as ContentType, expected: 0.5 },
    { your: 'social_commentary' as ContentType, vs: 'comedy' as ContentType, expected: 0.5 },
    { your: 'pop_culture_refs' as ContentType, vs: 'wordplay' as ContentType, expected: 0.5 },
    { your: 'nonchalant' as DeliveryType, vs: 'aggressive' as DeliveryType, expected: 0.5 },
    { your: 'minimalist' as PerformanceType, vs: 'theatrical' as PerformanceType, expected: 0.5 },
  ];

  for (const test of notVeryEffectiveTests) {
    const result = getEffectiveness(test.your, test.vs);
    if (result === test.expected) {
      console.log(`✓ ${test.your} vs ${test.vs}: ${result}x (CORRECT)`);
      passed++;
    } else {
      console.log(`✗ ${test.your} vs ${test.vs}: Expected ${test.expected}x, got ${result}x (FAILED)`);
      failed++;
    }
  }

  // Test neutral matchups (no specific entry = 1.0x)
  console.log('\nTesting NEUTRAL matchups (should be 1.0x)...\n');

  const neutralTests = [
    { your: 'punchlines' as ContentType, vs: 'punchlines' as ContentType, expected: 1.0 },
    { your: 'storytelling' as ContentType, vs: 'personals' as ContentType, expected: 1.0 },
    { your: 'smooth_flow' as DeliveryType, vs: 'passionate' as DeliveryType, expected: 1.0 },
    { your: 'charismatic' as PerformanceType, vs: 'stage_presence' as PerformanceType, expected: 1.0 },
  ];

  for (const test of neutralTests) {
    const result = getEffectiveness(test.your, test.vs);
    if (result === test.expected) {
      console.log(`✓ ${test.your} vs ${test.vs}: ${result}x (CORRECT - Neutral)`);
      passed++;
    } else {
      console.log(`✗ ${test.your} vs ${test.vs}: Expected ${test.expected}x, got ${result}x (FAILED)`);
      failed++;
    }
  }

  console.log(`\n--- TEST SUITE 1 RESULTS ---`);
  console.log(`Passed: ${passed}/${passed + failed}`);
  console.log(`Failed: ${failed}/${passed + failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  return { passed, failed };
}

// =====================================================
// TEST SUITE 2: CROWD DEMOGRAPHICS VALIDATION
// =====================================================

function testCrowdDemographics() {
  console.log('\n=== TEST SUITE 2: CROWD DEMOGRAPHICS VALIDATION ===\n');

  let passed = 0;
  let failed = 0;

  // Test Small Room Circuit demographics
  console.log('Testing Small Room Circuit demographics...\n');

  const smallRoomDemographics = getLeagueDemographics('Small Room Circuit');
  if (smallRoomDemographics) {
    console.log('Small Room Circuit Demographics:');
    for (const { demographic, percentage } of smallRoomDemographics.demographics) {
      console.log(`  - ${demographic}: ${percentage}%`);
    }

    const dominant = getDominantDemographic('Small Room Circuit');
    if (dominant === 'purists') {
      console.log(`✓ Dominant demographic: ${dominant} (CORRECT)`);
      passed++;
    } else {
      console.log(`✗ Dominant demographic: Expected 'purists', got '${dominant}' (FAILED)`);
      failed++;
    }
  }

  // Test Main Stage Arena demographics
  console.log('\nTesting Main Stage Arena demographics...\n');

  const mainStageDemographics = getLeagueDemographics('Main Stage Arena');
  if (mainStageDemographics) {
    console.log('Main Stage Arena Demographics:');
    for (const { demographic, percentage } of mainStageDemographics.demographics) {
      console.log(`  - ${demographic}: ${percentage}%`);
    }

    const dominant = getDominantDemographic('Main Stage Arena');
    if (dominant === 'performance_fans') {
      console.log(`✓ Dominant demographic: ${dominant} (CORRECT)`);
      passed++;
    } else {
      console.log(`✗ Dominant demographic: Expected 'performance_fans', got '${dominant}' (FAILED)`);
      failed++;
    }
  }

  // Test crowd preference calculations
  console.log('\nTesting crowd preference calculations...\n');

  const crowdPreferenceTests = [
    {
      league: 'Small Room Circuit',
      content: 'wordplay' as ContentType,
      expectedRange: { min: 1.08, max: 1.15 }, // Weighted by all demographics (Purists 45% favor it)
      description: 'Wordplay in Small Room (Purists 45%)',
    },
    {
      league: 'Small Room Circuit',
      content: 'comedy' as ContentType,
      expectedRange: { min: 0.85, max: 1.05 }, // Should be negative/neutral (Purists dislike it)
      description: 'Comedy in Small Room (Purists dislike)',
    },
    {
      league: 'Main Stage Arena',
      content: 'theatrical' as PerformanceType,
      expectedRange: { min: 1.15, max: 1.40 }, // Should be positive (Performance Fans favor it)
      description: 'Theatrical in Main Stage (Performance Fans 30%)',
    },
    {
      league: 'Main Stage Arena',
      content: 'wordplay' as ContentType,
      expectedRange: { min: 0.85, max: 1.05 }, // Should be lower than Small Room
      description: 'Wordplay in Main Stage (fewer Purists)',
    },
  ];

  for (const test of crowdPreferenceTests) {
    const result = calculateCrowdPreference(test.league, test.content);
    if (result >= test.expectedRange.min && result <= test.expectedRange.max) {
      console.log(`✓ ${test.description}: ${result.toFixed(2)}x (in range [${test.expectedRange.min}, ${test.expectedRange.max}])`);
      passed++;
    } else {
      console.log(`✗ ${test.description}: ${result.toFixed(2)}x (out of range [${test.expectedRange.min}, ${test.expectedRange.max}])`);
      failed++;
    }
  }

  console.log(`\n--- TEST SUITE 2 RESULTS ---`);
  console.log(`Passed: ${passed}/${passed + failed}`);
  console.log(`Failed: ${failed}/${passed + failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  return { passed, failed };
}

// =====================================================
// TEST SUITE 3: CONTEXT MODIFIERS VALIDATION
// =====================================================

function testContextModifiers() {
  console.log('\n=== TEST SUITE 3: CONTEXT MODIFIERS VALIDATION ===\n');

  let passed = 0;
  let failed = 0;

  console.log('Testing context modifiers (in building vs on cam)...\n');

  const contextTests = [
    {
      content: 'aggressive' as DeliveryType,
      inBuilding: 1.4,
      ppv: 1.2,
      onCam: 0.9,
      description: 'Aggressive delivery (better in building, weaker on cam)',
    },
    {
      content: 'wordplay' as ContentType,
      inBuilding: 0.8,
      ppv: 1.0,
      onCam: 1.3,
      description: 'Wordplay (weaker in building, better on cam)',
    },
    {
      content: 'crowd_interaction' as PerformanceType,
      inBuilding: 1.5,
      ppv: 1.3,
      onCam: 0.8,
      description: 'Crowd Interaction (best in building, worst on cam)',
    },
    {
      content: 'schemes' as ContentType,
      inBuilding: 0.9,
      ppv: 1.0,
      onCam: 1.25,
      description: 'Schemes (better on cam for replay value)',
    },
  ];

  for (const test of contextTests) {
    const inBuildingResult = getContextModifier(test.content, 'in_building');
    const ppvResult = getContextModifier(test.content, 'ppv');
    const onCamResult = getContextModifier(test.content, 'on_cam');

    let testPassed = true;

    if (inBuildingResult === test.inBuilding) {
      console.log(`  ✓ In Building: ${inBuildingResult}x (CORRECT)`);
      passed++;
    } else {
      console.log(`  ✗ In Building: Expected ${test.inBuilding}x, got ${inBuildingResult}x (FAILED)`);
      failed++;
      testPassed = false;
    }

    if (ppvResult === test.ppv) {
      console.log(`  ✓ PPV: ${ppvResult}x (CORRECT)`);
      passed++;
    } else {
      console.log(`  ✗ PPV: Expected ${test.ppv}x, got ${ppvResult}x (FAILED)`);
      failed++;
      testPassed = false;
    }

    if (onCamResult === test.onCam) {
      console.log(`  ✓ On Cam: ${onCamResult}x (CORRECT)`);
      passed++;
    } else {
      console.log(`  ✗ On Cam: Expected ${test.onCam}x, got ${onCamResult}x (FAILED)`);
      failed++;
      testPassed = false;
    }

    if (testPassed) {
      console.log(`✓ ${test.description} - ALL CONTEXTS PASSED\n`);
    } else {
      console.log(`✗ ${test.description} - SOME CONTEXTS FAILED\n`);
    }
  }

  // Test league-specific modifiers
  console.log('Testing league-specific context modifiers...\n');

  const leagueContextTests = [
    {
      content: 'wordplay' as ContentType,
      league: 'Small Room Circuit',
      context: 'in_building' as const,
      expected: 1.0, // No penalty in small room
      description: 'Wordplay in Small Room in building (no penalty vs 0.8 in Main Stage)',
    },
    {
      content: 'theatrical' as PerformanceType,
      league: 'Main Stage Arena',
      context: 'in_building' as const,
      expected: 1.4, // Increased in main stage
      description: 'Theatrical in Main Stage in building (amplified vs 1.3 default)',
    },
  ];

  for (const test of leagueContextTests) {
    const result = getLeagueContextModifier(test.content, test.context, test.league);
    if (result === test.expected) {
      console.log(`✓ ${test.description}: ${result}x (CORRECT)`);
      passed++;
    } else {
      console.log(`✗ ${test.description}: Expected ${test.expected}x, got ${result}x (FAILED)`);
      failed++;
    }
  }

  console.log(`\n--- TEST SUITE 3 RESULTS ---`);
  console.log(`Passed: ${passed}/${passed + failed}`);
  console.log(`Failed: ${failed}/${passed + failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  return { passed, failed };
}

// =====================================================
// COMPREHENSIVE INTEGRATION TESTS
// =====================================================

function testFullIntegration() {
  console.log('\n=== COMPREHENSIVE INTEGRATION TESTS ===\n');
  console.log('Testing complete formula: Base × Effectiveness × Crowd × Context\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: Loaded Lux vs Calicoe Scenario
  console.log('--- TEST 1: Loaded Lux vs Calicoe (2012) ---');
  console.log('Your Content: Wordplay (Lux)');
  console.log('Opponent: Gun Bars (Calicoe)');
  console.log('League: Small Room Circuit');
  console.log('Context: On Cam (replay)\n');

  const baseScore1 = 85;
  const effectiveness1 = getEffectiveness('wordplay', 'gun_bars');
  const crowd1 = calculateCrowdPreference('Small Room Circuit', 'wordplay');
  const context1 = getContextModifier('wordplay', 'on_cam');

  const finalScore1 = baseScore1 * effectiveness1 * crowd1 * context1;

  console.log(`Base Score: ${baseScore1}`);
  console.log(`Effectiveness (Wordplay > Gun Bars): ${effectiveness1}x`);
  console.log(`Crowd Preference (Purists): ${crowd1.toFixed(2)}x`);
  console.log(`Context (On Cam): ${context1}x`);
  console.log(`FINAL SCORE: ${finalScore1.toFixed(1)}\n`);

  if (effectiveness1 === 2.0 && crowd1 > 1.05 && context1 === 1.3 && finalScore1 > 200) {
    console.log('✓ Lux scenario validates correctly (devastating score)\n');
    passed++;
  } else {
    console.log('✗ Lux scenario failed validation\n');
    failed++;
  }

  // TEST 2: Charlie Clips vs Technical Opponent
  console.log('--- TEST 2: Charlie Clips vs Technical Opponent ---');
  console.log('Your Content: Comedy (Clips)');
  console.log('Opponent: Wordplay');
  console.log('League: Main Stage Arena');
  console.log('Context: In Building\n');

  const baseScore2 = 78;
  const effectiveness2 = getEffectiveness('comedy', 'wordplay');
  const crowd2 = calculateCrowdPreference('Main Stage Arena', 'comedy');
  const context2 = getContextModifier('comedy', 'in_building');

  const finalScore2 = baseScore2 * effectiveness2 * crowd2 * context2;

  console.log(`Base Score: ${baseScore2}`);
  console.log(`Effectiveness (Comedy > Wordplay): ${effectiveness2}x`);
  console.log(`Crowd Preference (Comedy Fans): ${crowd2.toFixed(2)}x`);
  console.log(`Context (In Building): ${context2}x`);
  console.log(`FINAL SCORE: ${finalScore2.toFixed(1)}\n`);

  if (effectiveness2 === 2.0 && crowd2 > 1.1 && context2 === 1.3) {
    console.log('✓ Clips scenario validates correctly (dominant score)\n');
    passed++;
  } else {
    console.log('✗ Clips scenario failed validation\n');
    failed++;
  }

  // TEST 3: Gun Bars vs Street Talk (Bad Matchup)
  console.log('--- TEST 3: Gun Bars vs Street Talk (Losing Matchup) ---');
  console.log('Your Content: Gun Bars');
  console.log('Opponent: Street Talk');
  console.log('League: Main Stage Arena');
  console.log('Context: On Cam\n');

  const baseScore3 = 70;
  const effectiveness3 = getEffectiveness('gun_bars', 'street_talk');
  const crowd3 = calculateCrowdPreference('Main Stage Arena', 'gun_bars');
  const context3 = getContextModifier('gun_bars', 'on_cam');

  const finalScore3 = baseScore3 * effectiveness3 * crowd3 * context3;

  console.log(`Base Score: ${baseScore3}`);
  console.log(`Effectiveness (Gun Bars < Street Talk): ${effectiveness3}x`);
  console.log(`Crowd Preference (Street Fans): ${crowd3.toFixed(2)}x`);
  console.log(`Context (On Cam): ${context3}x`);
  console.log(`FINAL SCORE: ${finalScore3.toFixed(1)}\n`);

  if (effectiveness3 === 0.5 && finalScore3 < baseScore3) {
    console.log('✓ Bad matchup validates correctly (weak score)\n');
    passed++;
  } else {
    console.log('✗ Bad matchup failed validation\n');
    failed++;
  }

  console.log(`\n--- INTEGRATION TEST RESULTS ---`);
  console.log(`Passed: ${passed}/${passed + failed}`);
  console.log(`Failed: ${failed}/${passed + failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  return { passed, failed };
}

// =====================================================
// RUN ALL TESTS
// =====================================================

function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   BATTLE RAP CONTENT SYSTEM - COMPREHENSIVE TESTS     ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const test1Results = testEffectivenessMatrix();
  const test2Results = testCrowdDemographics();
  const test3Results = testContextModifiers();
  const integrationResults = testFullIntegration();

  const totalPassed = test1Results.passed + test2Results.passed + test3Results.passed + integrationResults.passed;
  const totalFailed = test1Results.failed + test2Results.failed + test3Results.failed + integrationResults.failed;
  const totalTests = totalPassed + totalFailed;

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║              FINAL TEST SUMMARY                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`✓ Passed: ${totalPassed}`);
  console.log(`✗ Failed: ${totalFailed}`);
  console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%\n`);

  if (totalFailed === 0) {
    console.log('🎉 ALL TESTS PASSED! Content system is validated and ready.\n');
  } else {
    console.log(`⚠️  ${totalFailed} test(s) failed. Review the output above.\n`);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

export { runAllTests, testEffectivenessMatrix, testCrowdDemographics, testContextModifiers, testFullIntegration };
