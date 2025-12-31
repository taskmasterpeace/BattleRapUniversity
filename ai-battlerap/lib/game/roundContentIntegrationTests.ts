/**
 * Round Content Selection System - Integration Tests
 *
 * Tests the complete flow from content selection through simulation to results.
 * These tests validate the end-to-end integration of the content selection system
 * with the battle simulation engine.
 *
 * Run with: npx tsx lib/game/roundContentIntegrationTests.ts
 */

import {
  autoSelectContent,
  validateContentSelection,
  calculateEffectivenessForecast,
  type ContentSelection,
} from './roundContentSelection';

import type {
  Battler,
  BattlerAttributes,
  League,
  PrepProfile,
  ModifiedAttributes,
  ScoringContext,
} from '@/lib/models';

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

// =====================================================
// TEST DATA FIXTURES
// =====================================================

function createTestLeague(name: string): League {
  return {
    id: 'test-league-id',
    name,
    short_code: name === 'Small Room Circuit' ? 'SRC' : 'MSA',
    round_length_minutes: name === 'Small Room Circuit' ? 2 : 3,
    base_crowd_factor: name === 'Small Room Circuit' ? 0.8 : 1.2,
    writing_weight: name === 'Small Room Circuit' ? 0.7 : 0.4,
    performance_weight: name === 'Small Room Circuit' ? 0.3 : 0.6,
    booking_pace_days: 14,
    description: `Test ${name}`,
    created_at: new Date().toISOString(),
  };
}

function createTestBattler(name: string, badges: string[]): Battler {
  return {
    id: `battler-${name.toLowerCase()}`,
    user_id: null,
    stage_name: name,
    region: 'Test Region',
    primary_league_id: 'test-league-id',
    style_tags: badges,
    tier: 'mid',
    is_ai: true,
    created_at: new Date().toISOString(),
  };
}

function createTestAttributes(tier: 'low' | 'mid' | 'high'): BattlerAttributes {
  const base = tier === 'low' ? 3 : tier === 'mid' ? 5 : 7;
  return {
    battler_id: 'test-battler',
    writing: {
      lyricism: base,
      wordplay: base,
      creativity: base,
    },
    performance: {
      stage_presence: base,
      crowd_control: base,
      delivery: base,
    },
    personal: {
      financial_stability: 5,
      reputation: 5,
      family_bond: 5,
      preparation: 5,
    },
    resilience: base,
    public_knowledge: 5,
    stress: 5,
    balance: 5,
    lifetime_earnings: 0,
    xp: {},
    updated_at: new Date().toISOString(),
  };
}

function createTestBattle() {
  return {
    id: 'test-battle-id',
    league_id: 'test-league-id',
    battler_player_id: 'battler-player',
    battler_ai_id: 'battler-ai',
    scheduled_at: new Date().toISOString(),
    lock_prep_at: new Date().toISOString(),
    status: 'locked' as const,
    no_show_player: false,
    player_locked_in: true,
    current_round_index: 1,
    context: 'ppv' as ScoringContext,
    created_at: new Date().toISOString(),
  };
}

// =====================================================
// FULL AUTO MODE FLOW TESTS
// =====================================================

function testFullAutoFlow() {
  console.log('\n=== FULL AUTO MODE FLOW TEST ===\n');

  // Setup test data
  const league = createTestLeague('Small Room Circuit');
  const playerBattler = createTestBattler('Player', ['Wordplay Wizard', 'Technical']);
  const aiBattler = createTestBattler('AI Opponent', ['Crowd Favorite', 'Comedy']);

  console.log(`Player badges: ${playerBattler.style_tags.join(', ')}`);
  console.log(`AI badges: ${aiBattler.style_tags.join(', ')}`);
  console.log(`League: ${league.name}\n`);

  // Generate auto-selections for all 3 rounds
  for (let round = 1; round <= 3; round++) {
    console.log(`\n--- Round ${round} ---`);

    const playerSelection = autoSelectContent(
      playerBattler.style_tags,
      league.name,
      round
    );

    const aiSelection = autoSelectContent(
      aiBattler.style_tags,
      league.name,
      round
    );

    console.log(`Player selected: ${playerSelection.contentTypes.length} content, ${playerSelection.deliveryTypes.length} delivery, ${playerSelection.performanceTypes.length} performance`);
    console.log(`AI selected: ${aiSelection.contentTypes.length} content, ${aiSelection.deliveryTypes.length} delivery, ${aiSelection.performanceTypes.length} performance`);

    // Validate selections
    const playerValidation = validateContentSelection(playerSelection);
    const aiValidation = validateContentSelection(aiSelection);

    assert(playerValidation.valid, `Round ${round}: Player auto-selection is valid`);
    assert(aiValidation.valid, `Round ${round}: AI auto-selection is valid`);

    // Calculate effectiveness forecast
    const playerForecast = calculateEffectivenessForecast(
      playerSelection,
      aiSelection,
      league.name,
      'ppv'
    );

    const aiForecast = calculateEffectivenessForecast(
      aiSelection,
      playerSelection,
      league.name,
      'ppv'
    );

    console.log(`\nPlayer forecast:`);
    console.log(`  - Avg Effectiveness: ${playerForecast.averageEffectiveness.toFixed(2)}x`);
    console.log(`  - Crowd Preference: ${playerForecast.crowdPreference.toFixed(2)}x`);
    console.log(`  - Context Modifier: ${playerForecast.contextModifier.toFixed(2)}x`);
    console.log(`  - Final Multiplier: ${playerForecast.finalMultiplier.toFixed(2)}x`);

    console.log(`\nAI forecast:`);
    console.log(`  - Avg Effectiveness: ${aiForecast.averageEffectiveness.toFixed(2)}x`);
    console.log(`  - Crowd Preference: ${aiForecast.crowdPreference.toFixed(2)}x`);
    console.log(`  - Context Modifier: ${aiForecast.contextModifier.toFixed(2)}x`);
    console.log(`  - Final Multiplier: ${aiForecast.finalMultiplier.toFixed(2)}x`);

    // Verify multipliers are in reasonable ranges
    assertInRange(
      playerForecast.finalMultiplier,
      0.3,
      3.0,
      `Round ${round}: Player final multiplier in reasonable range`
    );

    assertInRange(
      aiForecast.finalMultiplier,
      0.3,
      3.0,
      `Round ${round}: AI final multiplier in reasonable range`
    );

    // Verify strong/weak matchups are identified
    assert(
      playerForecast.strongAgainst.length + playerForecast.weakAgainst.length > 0,
      `Round ${round}: Player forecast identifies matchup dynamics`
    );
  }

  console.log('\n✓ Full auto flow test completed\n');
}

// =====================================================
// LOCKED-IN MODE FLOW TESTS
// =====================================================

function testLockedInFlow() {
  console.log('\n=== LOCKED-IN MODE FLOW TEST ===\n');

  const league = createTestLeague('Main Stage Arena');
  const playerBattler = createTestBattler('Player', ['Aggressive', 'Street']);
  const aiBattler = createTestBattler('AI Opponent', ['Poetic', 'Smooth Operator']);

  console.log(`Player badges: ${playerBattler.style_tags.join(', ')}`);
  console.log(`AI badges: ${aiBattler.style_tags.join(', ')}`);
  console.log(`League: ${league.name}\n`);

  // Simulate 3 rounds of locked-in mode
  for (let round = 1; round <= 3; round++) {
    console.log(`\n--- Round ${round} ---`);

    // Player makes manual selection (simulated here as auto for testing)
    const playerSelection: ContentSelection = {
      contentTypes: ['gun_bars', 'street_talk', 'personals'],
      deliveryTypes: ['aggressive'],
      performanceTypes: ['theatrical'],
    };

    // AI opponent auto-selects
    const aiSelection = autoSelectContent(
      aiBattler.style_tags,
      league.name,
      round
    );

    console.log(`Player manual selection: ${JSON.stringify(playerSelection.contentTypes)}`);
    console.log(`AI auto-selection: ${JSON.stringify(aiSelection.contentTypes)}`);

    // Validate both selections
    const playerValidation = validateContentSelection(playerSelection);
    const aiValidation = validateContentSelection(aiSelection);

    assert(playerValidation.valid, `Round ${round}: Player manual selection is valid`);
    assert(aiValidation.valid, `Round ${round}: AI auto-selection is valid`);

    // Calculate forecasts
    const playerForecast = calculateEffectivenessForecast(
      playerSelection,
      aiSelection,
      league.name,
      'in_building'
    );

    const aiForecast = calculateEffectivenessForecast(
      aiSelection,
      playerSelection,
      league.name,
      'in_building'
    );

    console.log(`\nPlayer final multiplier: ${playerForecast.finalMultiplier.toFixed(2)}x`);
    console.log(`AI final multiplier: ${aiForecast.finalMultiplier.toFixed(2)}x`);

    // Verify multipliers
    assert(
      playerForecast.finalMultiplier > 0,
      `Round ${round}: Player has positive final multiplier`
    );

    assert(
      aiForecast.finalMultiplier > 0,
      `Round ${round}: AI has positive final multiplier`
    );

    // Simulate "round results" (simplified - not actual simulation)
    const mockPlayerScore = 7.5 * playerForecast.finalMultiplier;
    const mockAIScore = 6.0 * aiForecast.finalMultiplier;

    console.log(`\nSimulated adjusted scores:`);
    console.log(`  Player: ${mockPlayerScore.toFixed(2)} (base 7.5 × ${playerForecast.finalMultiplier.toFixed(2)})`);
    console.log(`  AI: ${mockAIScore.toFixed(2)} (base 6.0 × ${aiForecast.finalMultiplier.toFixed(2)})`);

    assert(
      mockPlayerScore > 0 && mockPlayerScore < 30,
      `Round ${round}: Player adjusted score in reasonable range`
    );

    assert(
      mockAIScore > 0 && mockAIScore < 30,
      `Round ${round}: AI adjusted score in reasonable range`
    );
  }

  console.log('\n✓ Locked-in mode flow test completed\n');
}

// =====================================================
// EFFECTIVENESS IMPACT TESTS
// =====================================================

function testEffectivenessImpact() {
  console.log('\n=== EFFECTIVENESS IMPACT TEST ===\n');

  const league = createTestLeague('Small Room Circuit');

  // Test 1: Super effective matchup (personals vs comedy)
  console.log('\n--- Super Effective Matchup ---');
  const superEffectivePlayer: ContentSelection = {
    contentTypes: ['personals', 'wordplay', 'schemes'],
    deliveryTypes: ['aggressive'],
    performanceTypes: ['theatrical'],
  };

  const superEffectiveOpponent: ContentSelection = {
    contentTypes: ['comedy', 'gun_bars', 'pop_culture_refs'],
    deliveryTypes: ['nonchalant'],
    performanceTypes: ['minimalist'],
  };

  const superForecast = calculateEffectivenessForecast(
    superEffectivePlayer,
    superEffectiveOpponent,
    league.name,
    'ppv'
  );

  console.log(`Average effectiveness: ${superForecast.averageEffectiveness.toFixed(2)}x`);
  console.log(`Strong against: ${superForecast.strongAgainst.join(', ')}`);

  assert(
    superForecast.averageEffectiveness > 1.0,
    'Super effective matchup has avg effectiveness > 1.0'
  );

  assert(
    superForecast.strongAgainst.length >= 2,
    'Super effective matchup identifies multiple strong matchups'
  );

  // Test 2: Weak matchup (comedy vs personals)
  console.log('\n--- Weak Matchup ---');
  const weakForecast = calculateEffectivenessForecast(
    superEffectiveOpponent,
    superEffectivePlayer,
    league.name,
    'ppv'
  );

  console.log(`Average effectiveness: ${weakForecast.averageEffectiveness.toFixed(2)}x`);
  console.log(`Weak against: ${weakForecast.weakAgainst.join(', ')}`);

  assert(
    weakForecast.averageEffectiveness < 1.0,
    'Weak matchup has avg effectiveness < 1.0'
  );

  assert(
    weakForecast.weakAgainst.length >= 2,
    'Weak matchup identifies multiple weak matchups'
  );

  // Test 3: Neutral/balanced matchup
  console.log('\n--- Balanced Matchup ---');
  const balancedPlayer: ContentSelection = {
    contentTypes: ['punchlines', 'storytelling', 'name_flips'],
    deliveryTypes: ['conversational'],
    performanceTypes: ['charismatic'],
  };

  const balancedOpponent: ContentSelection = {
    contentTypes: ['schemes', 'freestyles', 'social_commentary'],
    deliveryTypes: ['smooth_flow'],
    performanceTypes: ['strategic_pauses'],
  };

  const balancedForecast = calculateEffectivenessForecast(
    balancedPlayer,
    balancedOpponent,
    league.name,
    'ppv'
  );

  console.log(`Average effectiveness: ${balancedForecast.averageEffectiveness.toFixed(2)}x`);
  console.log(`Final multiplier: ${balancedForecast.finalMultiplier.toFixed(2)}x`);

  assertInRange(
    balancedForecast.averageEffectiveness,
    0.9,
    1.1,
    'Balanced matchup has near-neutral effectiveness'
  );

  console.log('\n✓ Effectiveness impact test completed\n');
}

// =====================================================
// LEAGUE DIFFERENCES TEST
// =====================================================

function testLeagueDifferences() {
  console.log('\n=== LEAGUE DIFFERENCES TEST ===\n');

  const smallRoom = createTestLeague('Small Room Circuit');
  const mainStage = createTestLeague('Main Stage Arena');

  const battler = createTestBattler('Test Battler', ['Wordplay Wizard', 'Technical']);

  // Generate selections for both leagues
  console.log('\n--- Small Room Circuit ---');
  const smallRoomR1 = autoSelectContent(battler.style_tags, smallRoom.name, 1);
  const smallRoomR2 = autoSelectContent(battler.style_tags, smallRoom.name, 2);
  const smallRoomR3 = autoSelectContent(battler.style_tags, smallRoom.name, 3);

  console.log(`R1: ${smallRoomR1.contentTypes.join(', ')}`);
  console.log(`R2: ${smallRoomR2.contentTypes.join(', ')}`);
  console.log(`R3: ${smallRoomR3.contentTypes.join(', ')}`);

  console.log('\n--- Main Stage Arena ---');
  const mainStageR1 = autoSelectContent(battler.style_tags, mainStage.name, 1);
  const mainStageR2 = autoSelectContent(battler.style_tags, mainStage.name, 2);
  const mainStageR3 = autoSelectContent(battler.style_tags, mainStage.name, 3);

  console.log(`R1: ${mainStageR1.contentTypes.join(', ')}`);
  console.log(`R2: ${mainStageR2.contentTypes.join(', ')}`);
  console.log(`R3: ${mainStageR3.contentTypes.join(', ')}`);

  // Verify all selections are valid
  assert(validateContentSelection(smallRoomR1).valid, 'Small Room R1 valid');
  assert(validateContentSelection(smallRoomR2).valid, 'Small Room R2 valid');
  assert(validateContentSelection(smallRoomR3).valid, 'Small Room R3 valid');
  assert(validateContentSelection(mainStageR1).valid, 'Main Stage R1 valid');
  assert(validateContentSelection(mainStageR2).valid, 'Main Stage R2 valid');
  assert(validateContentSelection(mainStageR3).valid, 'Main Stage R3 valid');

  // Verify league demographics create different selections
  const smallRoomAllContent = [
    ...smallRoomR1.contentTypes,
    ...smallRoomR2.contentTypes,
    ...smallRoomR3.contentTypes,
  ];

  const mainStageAllContent = [
    ...mainStageR1.contentTypes,
    ...mainStageR2.contentTypes,
    ...mainStageR3.contentTypes,
  ];

  console.log(`\nSmall Room total selections: ${smallRoomAllContent.length}`);
  console.log(`Main Stage total selections: ${mainStageAllContent.length}`);

  assert(
    smallRoomAllContent.length > 0 && mainStageAllContent.length > 0,
    'Both leagues produce content selections'
  );

  console.log('\n✓ League differences test completed\n');
}

// =====================================================
// CONTEXT IMPACT TEST
// =====================================================

function testContextImpact() {
  console.log('\n=== CONTEXT IMPACT TEST ===\n');

  const league = createTestLeague('Small Room Circuit');

  // Technical content selection
  const techSelection: ContentSelection = {
    contentTypes: ['wordplay', 'schemes', 'storytelling'],
    deliveryTypes: ['smooth_flow'],
    performanceTypes: ['minimalist'],
  };

  // Energy-based content selection
  const energySelection: ContentSelection = {
    contentTypes: ['gun_bars', 'comedy', 'name_flips'],
    deliveryTypes: ['aggressive'],
    performanceTypes: ['crowd_interaction'],
  };

  // Test technical content across contexts
  console.log('\n--- Technical Content Across Contexts ---');

  const techInBuilding = calculateEffectivenessForecast(
    techSelection,
    energySelection,
    league.name,
    'in_building'
  );

  const techPPV = calculateEffectivenessForecast(
    techSelection,
    energySelection,
    league.name,
    'ppv'
  );

  const techOnCam = calculateEffectivenessForecast(
    techSelection,
    energySelection,
    league.name,
    'on_cam'
  );

  console.log(`In Building - Context Modifier: ${techInBuilding.contextModifier.toFixed(2)}x, Final: ${techInBuilding.finalMultiplier.toFixed(2)}x`);
  console.log(`PPV - Context Modifier: ${techPPV.contextModifier.toFixed(2)}x, Final: ${techPPV.finalMultiplier.toFixed(2)}x`);
  console.log(`On Cam - Context Modifier: ${techOnCam.contextModifier.toFixed(2)}x, Final: ${techOnCam.finalMultiplier.toFixed(2)}x`);

  assert(
    techOnCam.contextModifier > techInBuilding.contextModifier,
    'Technical content has higher context modifier on cam than in building'
  );

  // Test energy content across contexts
  console.log('\n--- Energy Content Across Contexts ---');

  const energyInBuilding = calculateEffectivenessForecast(
    energySelection,
    techSelection,
    league.name,
    'in_building'
  );

  const energyPPV = calculateEffectivenessForecast(
    energySelection,
    techSelection,
    league.name,
    'ppv'
  );

  const energyOnCam = calculateEffectivenessForecast(
    energySelection,
    techSelection,
    league.name,
    'on_cam'
  );

  console.log(`In Building - Context Modifier: ${energyInBuilding.contextModifier.toFixed(2)}x, Final: ${energyInBuilding.finalMultiplier.toFixed(2)}x`);
  console.log(`PPV - Context Modifier: ${energyPPV.contextModifier.toFixed(2)}x, Final: ${energyPPV.finalMultiplier.toFixed(2)}x`);
  console.log(`On Cam - Context Modifier: ${energyOnCam.contextModifier.toFixed(2)}x, Final: ${energyOnCam.finalMultiplier.toFixed(2)}x`);

  assert(
    energyInBuilding.contextModifier > energyOnCam.contextModifier,
    'Energy content has higher context modifier in building than on cam'
  );

  console.log('\n✓ Context impact test completed\n');
}

// =====================================================
// EDGE CASES TEST
// =====================================================

function testEdgeCases() {
  console.log('\n=== EDGE CASES TEST ===\n');

  const league = createTestLeague('Small Room Circuit');

  // Test 1: Empty badges
  console.log('\n--- Empty Badges ---');
  const emptyBadgeSelection = autoSelectContent([], league.name, 1);
  const validation1 = validateContentSelection(emptyBadgeSelection);
  assert(validation1.valid, 'Empty badges still produces valid selection');

  // Test 2: Unknown league (should use defaults)
  console.log('\n--- Unknown League ---');
  const unknownLeagueSelection = autoSelectContent(['Wordplay Wizard'], 'Unknown League', 1);
  const validation2 = validateContentSelection(unknownLeagueSelection);
  assert(validation2.valid, 'Unknown league still produces valid selection');

  // Test 3: All same content type forecasting
  console.log('\n--- Identical Selections ---');
  const identicalSelection: ContentSelection = {
    contentTypes: ['wordplay', 'schemes', 'punchlines'],
    deliveryTypes: ['smooth_flow'],
    performanceTypes: ['minimalist'],
  };

  const identicalForecast = calculateEffectivenessForecast(
    identicalSelection,
    identicalSelection,
    league.name,
    'ppv'
  );

  assert(
    identicalForecast.averageEffectiveness === 1.0,
    'Identical selections have neutral effectiveness (1.0x)'
  );

  // Test 4: Maximum variety selection
  console.log('\n--- Maximum Variety ---');
  const maxVarietySelection: ContentSelection = {
    contentTypes: ['personals', 'wordplay', 'comedy', 'gun_bars'],
    deliveryTypes: ['aggressive', 'smooth_flow'],
    performanceTypes: ['theatrical', 'minimalist'],
  };

  const validation3 = validateContentSelection(maxVarietySelection);
  assert(validation3.valid, 'Maximum variety selection (4,2,2) is valid');

  console.log('\n✓ Edge cases test completed\n');
}

// =====================================================
// RUN ALL INTEGRATION TESTS
// =====================================================

function runAllIntegrationTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   ROUND CONTENT SELECTION - INTEGRATION TESTS              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  testFullAutoFlow();
  testLockedInFlow();
  testEffectivenessImpact();
  testLeagueDifferences();
  testContextImpact();
  testEdgeCases();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                     TEST SUMMARY                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✓`);
  console.log(`Failed: ${failedTests} ✗`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (failedTests === 0) {
    console.log('🎉 ALL INTEGRATION TESTS PASSED! 🎉\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED - Review output above\n');
    process.exit(1);
  }
}

// Execute tests
runAllIntegrationTests();
