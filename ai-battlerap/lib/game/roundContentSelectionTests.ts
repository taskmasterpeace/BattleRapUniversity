/**
 * Round Content Selection System - Unit Tests
 *
 * Tests the auto-selection algorithm, validation, effectiveness forecasting,
 * and recommendation engine.
 *
 * Run with: npx tsx lib/game/roundContentSelectionTests.ts
 */

import {
  createBadgeWeightMap,
  autoSelectContent,
  validateContentSelection,
  calculateEffectivenessForecast,
  recommendContent,
  predictOpponentContent,
  type ContentSelection,
} from './roundContentSelection';

import {
  getEffectiveness,
  calculateAverageEffectiveness,
} from './contentEffectiveness';

import {
  calculateCrowdPreference,
  getDominantDemographic,
} from './crowdDemographics';

import {
  getContextModifier,
  calculateAverageContextModifier,
} from './contextModifiers';

// =====================================================
// TEST HELPERS
// =====================================================

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`✗ FAIL: ${message}`);
  }
}

function assertEquals(actual: any, expected: any, message: string) {
  totalTests++;
  if (actual === expected) {
    passedTests++;
    console.log(`✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`✗ FAIL: ${message} (expected: ${expected}, got: ${actual})`);
  }
}

function assertInRange(value: number, min: number, max: number, message: string) {
  totalTests++;
  if (value >= min && value <= max) {
    passedTests++;
    console.log(`✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`✗ FAIL: ${message} (value ${value} not in range [${min}, ${max}])`);
  }
}

function assertContains<T>(array: T[], item: T, message: string) {
  totalTests++;
  if (array.includes(item)) {
    passedTests++;
    console.log(`✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`✗ FAIL: ${message} (array does not contain ${item})`);
  }
}

// =====================================================
// BADGE WEIGHT MAP TESTS
// =====================================================

function testBadgeWeightMap() {
  console.log('\n=== BADGE WEIGHT MAP TESTS ===\n');

  // Test 1: Wordplay Wizard badge prioritizes wordplay
  const wordplayWeights = createBadgeWeightMap(['Wordplay Wizard']);
  assert(
    wordplayWeights.content.has('wordplay') && wordplayWeights.content.get('wordplay')! > 2.0,
    'Wordplay Wizard badge gives high weight to wordplay content'
  );

  // Test 2: Punchline King badge prioritizes punchlines
  const punchlineWeights = createBadgeWeightMap(['Punchline King']);
  assert(
    punchlineWeights.content.has('punchlines') && punchlineWeights.content.get('punchlines')! > 2.0,
    'Punchline King badge gives high weight to punchlines content'
  );

  // Test 3: Aggressive badge prioritizes aggressive delivery and gun bars
  const aggressiveWeights = createBadgeWeightMap(['Aggressive']);
  assert(
    aggressiveWeights.delivery.has('aggressive') && aggressiveWeights.delivery.get('aggressive')! > 2.0,
    'Aggressive badge gives high weight to aggressive delivery'
  );
  assert(
    aggressiveWeights.content.has('gun_bars') && aggressiveWeights.content.get('gun_bars')! > 1.5,
    'Aggressive badge gives weight to gun bars content'
  );

  // Test 4: Crowd Favorite badge prioritizes charismatic performance and comedy
  const crowdWeights = createBadgeWeightMap(['Crowd Favorite']);
  assert(
    crowdWeights.performance.has('crowd_interaction') && crowdWeights.performance.get('crowd_interaction')! > 1.5,
    'Crowd Favorite badge gives weight to crowd interaction performance'
  );
  assert(
    crowdWeights.content.has('comedy') && crowdWeights.content.get('comedy')! > 1.0,
    'Crowd Favorite badge gives weight to comedy content'
  );

  // Test 5: Multiple badges combine weights
  const combinedWeights = createBadgeWeightMap(['Wordplay Wizard', 'Technical']);
  assert(
    combinedWeights.content.get('wordplay')! > 3.5,
    'Multiple badges (Wordplay Wizard + Technical) combine to increase wordplay weight'
  );

  // Test 6: Empty badges array returns empty weights
  const emptyWeights = createBadgeWeightMap([]);
  assert(
    emptyWeights.content.size === 0 && emptyWeights.delivery.size === 0 && emptyWeights.performance.size === 0,
    'Empty badge array returns empty weight maps'
  );
}

// =====================================================
// AUTO-SELECTION TESTS
// =====================================================

function testAutoSelection() {
  console.log('\n=== AUTO-SELECTION TESTS ===\n');

  // Test 1: Correct counts for Round 1 (3 content, 1 delivery, 1 performance)
  const round1Selection = autoSelectContent(['Wordplay Wizard'], 'Small Room Circuit', 1);
  assertEquals(round1Selection.contentTypes.length, 3, 'Round 1 selects 3 content types');
  assertEquals(round1Selection.deliveryTypes.length, 1, 'Round 1 selects 1 delivery type');
  assertEquals(round1Selection.performanceTypes.length, 1, 'Round 1 selects 1 performance type');

  // Test 2: Correct counts for Round 2 (4 content, 1 delivery, 2 performance)
  const round2Selection = autoSelectContent(['Wordplay Wizard'], 'Small Room Circuit', 2);
  assertEquals(round2Selection.contentTypes.length, 4, 'Round 2 selects 4 content types');
  assertEquals(round2Selection.deliveryTypes.length, 1, 'Round 2 selects 1 delivery type');
  assertEquals(round2Selection.performanceTypes.length, 2, 'Round 2 selects 2 performance types');

  // Test 3: Correct counts for Round 3 (3 content, 2 delivery, 2 performance)
  const round3Selection = autoSelectContent(['Wordplay Wizard'], 'Small Room Circuit', 3);
  assertEquals(round3Selection.contentTypes.length, 3, 'Round 3 selects 3 content types');
  assertEquals(round3Selection.deliveryTypes.length, 2, 'Round 3 selects 2 delivery types');
  assertEquals(round3Selection.performanceTypes.length, 2, 'Round 3 selects 2 performance types');

  // Test 4: Wordplay Wizard badge prioritizes wordplay in selection
  const wordplaySelection = autoSelectContent(['Wordplay Wizard'], 'Small Room Circuit', 1);
  assertContains(wordplaySelection.contentTypes, 'wordplay', 'Wordplay Wizard selects wordplay content');

  // Test 5: League demographics influence selection (Small Room favors technical)
  const smallRoomSelection = autoSelectContent(['Comedy'], 'Small Room Circuit', 1);
  // Comedy should still be selected (badge weight), but we can't guarantee first position
  assert(
    smallRoomSelection.contentTypes.includes('comedy'),
    'Small Room Circuit allows comedy despite purist demographic'
  );

  // Test 6: Different rounds produce different selections (variety)
  const r1 = autoSelectContent(['Wordplay Wizard', 'Technical'], 'Small Room Circuit', 1);
  const r2 = autoSelectContent(['Wordplay Wizard', 'Technical'], 'Small Room Circuit', 2);
  const r3 = autoSelectContent(['Wordplay Wizard', 'Technical'], 'Small Room Circuit', 3);

  // At least some variation should exist across rounds
  const allContentTypes = [...r1.contentTypes, ...r2.contentTypes, ...r3.contentTypes];
  const uniqueContentTypes = new Set(allContentTypes);
  assert(
    uniqueContentTypes.size > 4,
    'Different rounds show variety in content selection'
  );

  // Test 7: Empty badges still produces valid selection
  const emptyBadgeSelection = autoSelectContent([], 'Main Stage Arena', 1);
  assert(
    emptyBadgeSelection.contentTypes.length === 3,
    'Empty badges still produces valid selection with correct count'
  );
}

// =====================================================
// VALIDATION TESTS
// =====================================================

function testValidation() {
  console.log('\n=== VALIDATION TESTS ===\n');

  // Test 1: Valid selection passes
  const validSelection: ContentSelection = {
    contentTypes: ['wordplay', 'punchlines', 'schemes'],
    deliveryTypes: ['aggressive'],
    performanceTypes: ['theatrical'],
  };
  const validation1 = validateContentSelection(validSelection);
  assert(validation1.valid, 'Valid selection (3 content, 1 delivery, 1 performance) passes validation');

  // Test 2: Valid selection with max counts passes
  const validSelection2: ContentSelection = {
    contentTypes: ['wordplay', 'punchlines', 'schemes', 'comedy'],
    deliveryTypes: ['aggressive', 'smooth_flow'],
    performanceTypes: ['theatrical', 'charismatic'],
  };
  const validation2 = validateContentSelection(validSelection2);
  assert(validation2.valid, 'Valid selection (4 content, 2 delivery, 2 performance) passes validation');

  // Test 3: Too few content types fails
  const invalidSelection1: ContentSelection = {
    contentTypes: ['wordplay', 'punchlines'],
    deliveryTypes: ['aggressive'],
    performanceTypes: ['theatrical'],
  };
  const validation3 = validateContentSelection(invalidSelection1);
  assert(!validation3.valid, 'Too few content types (2) fails validation');
  assert(validation3.errors.length > 0, 'Validation errors are provided');

  // Test 4: Too many content types fails
  const invalidSelection2: ContentSelection = {
    contentTypes: ['wordplay', 'punchlines', 'schemes', 'comedy', 'personals'],
    deliveryTypes: ['aggressive'],
    performanceTypes: ['theatrical'],
  };
  const validation4 = validateContentSelection(invalidSelection2);
  assert(!validation4.valid, 'Too many content types (5) fails validation');

  // Test 5: Duplicate content types fail
  const invalidSelection3: ContentSelection = {
    contentTypes: ['wordplay', 'wordplay', 'punchlines'],
    deliveryTypes: ['aggressive'],
    performanceTypes: ['theatrical'],
  };
  const validation5 = validateContentSelection(invalidSelection3);
  assert(!validation5.valid, 'Duplicate content types fail validation');

  // Test 6: Invalid content type fails
  const invalidSelection4: ContentSelection = {
    contentTypes: ['wordplay', 'punchlines', 'fake_type' as any],
    deliveryTypes: ['aggressive'],
    performanceTypes: ['theatrical'],
  };
  const validation6 = validateContentSelection(invalidSelection4);
  assert(!validation6.valid, 'Invalid content type fails validation');

  // Test 7: Empty arrays fail
  const invalidSelection5: ContentSelection = {
    contentTypes: [],
    deliveryTypes: [],
    performanceTypes: [],
  };
  const validation7 = validateContentSelection(invalidSelection5);
  assert(!validation7.valid, 'Empty arrays fail validation');
}

// =====================================================
// EFFECTIVENESS TESTS
// =====================================================

function testEffectiveness() {
  console.log('\n=== EFFECTIVENESS TESTS ===\n');

  // Test 1: Personals super effective vs comedy (2.0x)
  const effectiveness1 = getEffectiveness('personals', 'comedy');
  assertEquals(effectiveness1, 2.0, 'Personals super effective vs comedy (2.0x)');

  // Test 2: Wordplay super effective vs gun bars (2.0x)
  const effectiveness2 = getEffectiveness('wordplay', 'gun_bars');
  assertEquals(effectiveness2, 2.0, 'Wordplay super effective vs gun bars (2.0x)');

  // Test 3: Comedy weak vs personals (0.5x)
  const effectiveness3 = getEffectiveness('comedy', 'personals');
  assertEquals(effectiveness3, 0.5, 'Comedy weak vs personals (0.5x)');

  // Test 4: Gun bars weak vs street talk (0.5x)
  const effectiveness4 = getEffectiveness('gun_bars', 'street_talk');
  assertEquals(effectiveness4, 0.5, 'Gun bars weak vs street talk (0.5x)');

  // Test 5: Neutral matchup (1.0x)
  const effectiveness5 = getEffectiveness('wordplay', 'schemes');
  assertEquals(effectiveness5, 1.0, 'Wordplay vs schemes is neutral (1.0x)');

  // Test 6: Aggressive delivery super effective vs nonchalant (2.0x)
  const effectiveness6 = getEffectiveness('aggressive', 'nonchalant');
  assertEquals(effectiveness6, 2.0, 'Aggressive delivery super effective vs nonchalant (2.0x)');

  // Test 7: Theatrical performance super effective vs minimalist (2.0x)
  const effectiveness7 = getEffectiveness('theatrical', 'minimalist');
  assertEquals(effectiveness7, 2.0, 'Theatrical performance super effective vs minimalist (2.0x)');

  // Test 8: Calculate average effectiveness across multiple types
  const avgEffectiveness = calculateAverageEffectiveness(
    ['personals', 'wordplay'],
    ['comedy', 'gun_bars']
  );
  // personals vs comedy = 2.0, personals vs gun_bars = 2.0,
  // wordplay vs comedy = 0.5, wordplay vs gun_bars = 2.0
  // Average = (2.0 + 2.0 + 0.5 + 2.0) / 4 = 1.625
  assertInRange(avgEffectiveness, 1.6, 1.65, 'Average effectiveness calculated correctly');
}

// =====================================================
// CROWD PREFERENCE TESTS
// =====================================================

function testCrowdPreference() {
  console.log('\n=== CROWD PREFERENCE TESTS ===\n');

  // Test 1: Small Room Circuit favors wordplay (purists dominant)
  const smallRoomWordplay = calculateCrowdPreference('Small Room Circuit', 'wordplay');
  assert(smallRoomWordplay > 1.0, 'Small Room Circuit favors wordplay (purist crowd)');

  // Test 2: Small Room Circuit is near-neutral for gun bars (purists don't like, street fans do)
  const smallRoomGunBars = calculateCrowdPreference('Small Room Circuit', 'gun_bars');
  assertInRange(smallRoomGunBars, 0.95, 1.10, 'Small Room Circuit near-neutral for gun bars (mixed preferences)');

  // Test 3: Main Stage Arena favors theatrical (performance fans dominant)
  const mainStageTheatrical = calculateCrowdPreference('Main Stage Arena', 'theatrical');
  assert(mainStageTheatrical > 1.0, 'Main Stage Arena favors theatrical performance');

  // Test 4: Main Stage Arena disfavors wordplay (technical less appreciated)
  const mainStageWordplay = calculateCrowdPreference('Main Stage Arena', 'wordplay');
  assert(mainStageWordplay < 1.0, 'Main Stage Arena disfavors wordplay (less purists)');

  // Test 5: Dominant demographic detection works
  const smallRoomDominant = getDominantDemographic('Small Room Circuit');
  assertEquals(smallRoomDominant, 'purists', 'Small Room Circuit dominated by purists');

  const mainStageDominant = getDominantDemographic('Main Stage Arena');
  assertEquals(mainStageDominant, 'performance_fans', 'Main Stage Arena dominated by performance fans');

  // Test 6: Unknown league returns neutral preference
  const unknownLeague = calculateCrowdPreference('Unknown League', 'wordplay');
  assertEquals(unknownLeague, 1.0, 'Unknown league returns neutral preference (1.0)');
}

// =====================================================
// CONTEXT MODIFIER TESTS
// =====================================================

function testContextModifiers() {
  console.log('\n=== CONTEXT MODIFIER TESTS ===\n');

  // Test 1: Wordplay better on cam than in building
  const wordplayInBuilding = getContextModifier('wordplay', 'in_building');
  const wordplayOnCam = getContextModifier('wordplay', 'on_cam');
  assert(wordplayOnCam > wordplayInBuilding, 'Wordplay scores higher on cam than in building');

  // Test 2: Gun bars better in building than on cam
  const gunBarsInBuilding = getContextModifier('gun_bars', 'in_building');
  const gunBarsOnCam = getContextModifier('gun_bars', 'on_cam');
  assert(gunBarsInBuilding > gunBarsOnCam, 'Gun bars score higher in building than on cam');

  // Test 3: Crowd interaction best in building
  const crowdInBuilding = getContextModifier('crowd_interaction', 'in_building');
  const crowdPPV = getContextModifier('crowd_interaction', 'ppv');
  const crowdOnCam = getContextModifier('crowd_interaction', 'on_cam');
  assert(
    crowdInBuilding > crowdPPV && crowdInBuilding > crowdOnCam,
    'Crowd interaction best in building context'
  );

  // Test 4: Aggressive delivery best in building
  const aggressiveInBuilding = getContextModifier('aggressive', 'in_building');
  const aggressiveOnCam = getContextModifier('aggressive', 'on_cam');
  assert(aggressiveInBuilding > aggressiveOnCam, 'Aggressive delivery better in building');

  // Test 5: Schemes better on cam (replay value)
  const schemesInBuilding = getContextModifier('schemes', 'in_building');
  const schemesOnCam = getContextModifier('schemes', 'on_cam');
  assert(schemesOnCam > schemesInBuilding, 'Schemes better on cam (replay value)');

  // Test 6: Calculate average context modifier
  const avgContextModifier = calculateAverageContextModifier(
    ['wordplay', 'schemes'],
    'on_cam'
  );
  assert(avgContextModifier > 1.0, 'Average context modifier for technical content on cam > 1.0');
}

// =====================================================
// EFFECTIVENESS FORECAST TESTS
// =====================================================

function testEffectivenessForecast() {
  console.log('\n=== EFFECTIVENESS FORECAST TESTS ===\n');

  // Test 1: Super effective matchup forecast
  const playerSelection: ContentSelection = {
    contentTypes: ['personals', 'wordplay', 'punchlines'],
    deliveryTypes: ['aggressive'],
    performanceTypes: ['theatrical'],
  };

  const opponentSelection: ContentSelection = {
    contentTypes: ['comedy', 'gun_bars', 'pop_culture_refs'],
    deliveryTypes: ['nonchalant'],
    performanceTypes: ['minimalist'],
  };

  const forecast = calculateEffectivenessForecast(
    playerSelection,
    opponentSelection,
    'Small Room Circuit',
    'ppv'
  );

  assert(forecast.averageEffectiveness > 1.0, 'Forecast shows advantage (avg effectiveness > 1.0)');
  assert(forecast.strongAgainst.length > 0, 'Forecast identifies strong matchups');
  assert(forecast.finalMultiplier > 0, 'Final multiplier is calculated');

  // Test 2: Weak matchup forecast
  const weakPlayerSelection: ContentSelection = {
    contentTypes: ['comedy', 'gun_bars', 'shock_value'],
    deliveryTypes: ['nonchalant'],
    performanceTypes: ['minimalist'],
  };

  const strongOpponentSelection: ContentSelection = {
    contentTypes: ['personals', 'wordplay', 'schemes'],
    deliveryTypes: ['aggressive'],
    performanceTypes: ['theatrical'],
  };

  const weakForecast = calculateEffectivenessForecast(
    weakPlayerSelection,
    strongOpponentSelection,
    'Small Room Circuit',
    'ppv'
  );

  assert(weakForecast.averageEffectiveness < 1.0, 'Weak forecast shows disadvantage (avg < 1.0)');
  assert(weakForecast.weakAgainst.length > 0, 'Forecast identifies weak matchups');

  // Test 3: League differences affect final multiplier (via league-specific context modifiers)
  const techSelection: ContentSelection = {
    contentTypes: ['wordplay', 'schemes', 'storytelling'],
    deliveryTypes: ['smooth_flow'],
    performanceTypes: ['minimalist'],
  };

  const smallRoomForecast = calculateEffectivenessForecast(
    techSelection,
    opponentSelection,
    'Small Room Circuit',
    'in_building' // in_building context shows league differences best
  );

  const mainStageForecast = calculateEffectivenessForecast(
    techSelection,
    opponentSelection,
    'Main Stage Arena',
    'in_building' // in_building context shows league differences best
  );

  // Small Room has league-specific adjustments that favor wordplay/schemes (no penalty)
  // Main Stage penalizes wordplay/schemes more in building (harder to hear)
  assert(
    smallRoomForecast.crowdPreference > mainStageForecast.crowdPreference ||
    smallRoomForecast.finalMultiplier > mainStageForecast.finalMultiplier,
    'Technical content performs better in Small Room than Main Stage (league-specific modifiers)'
  );
}

// =====================================================
// RECOMMENDATION TESTS
// =====================================================

function testRecommendations() {
  console.log('\n=== RECOMMENDATION TESTS ===\n');

  // Test 1: Recommendations include valid selection
  const recommendation = recommendContent(
    ['Wordplay Wizard', 'Technical'],
    'Small Room Circuit',
    1
  );

  const validation = validateContentSelection(recommendation);
  assert(validation.valid, 'Recommended selection is valid');
  assert(recommendation.reasoning.length > 0, 'Recommendation includes reasoning');

  // Test 2: Recommendations adapt to opponent
  const vsComedyRecommendation = recommendContent(
    ['Wordplay Wizard'],
    'Small Room Circuit',
    1,
    ['Comedy', 'Crowd Favorite']
  );

  assert(
    vsComedyRecommendation.reasoning.includes('opponent') ||
    vsComedyRecommendation.reasoning.includes('Strong') ||
    vsComedyRecommendation.reasoning.includes('struggle'),
    'Recommendation considers opponent style'
  );

  // Test 3: Predict opponent content
  const predictedOpponent = predictOpponentContent(
    ['Aggressive', 'Street'],
    'Main Stage Arena',
    2
  );

  assert(
    predictedOpponent.contentTypes.includes('gun_bars') ||
    predictedOpponent.contentTypes.includes('street_talk'),
    'Predicted opponent content matches their badges'
  );
}

// =====================================================
// RUN ALL TESTS
// =====================================================

function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   ROUND CONTENT SELECTION SYSTEM - UNIT TESTS              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  testBadgeWeightMap();
  testAutoSelection();
  testValidation();
  testEffectiveness();
  testCrowdPreference();
  testContextModifiers();
  testEffectivenessForecast();
  testRecommendations();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                     TEST SUMMARY                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✓`);
  console.log(`Failed: ${failedTests} ✗`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED! 🎉\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED - Review output above\n');
    process.exit(1);
  }
}

// Execute tests
runAllTests();
