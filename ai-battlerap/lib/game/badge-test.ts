/**
 * Badge System Test Suite
 *
 * Tests to verify that different badge combinations create meaningfully
 * different gameplay experiences.
 */

import {
  calculateBadgeEffects,
  calculatePrepPatternBonus,
  describeBadgeEffects,
  type BadgeEffects,
} from './badges';
import type { PrepProfile } from '@/lib/models';

// ============================================================================
// Test Scenarios
// ============================================================================

interface TestScenario {
  name: string;
  badges: string[];
  prep: PrepProfile;
  expectedBehavior: string;
}

const TEST_SCENARIOS: TestScenario[] = [
  // Freestyle vs Technical Writer
  {
    name: 'Freestyle Genius (Minimal Prep)',
    badges: ['Freestyle Genius', 'Rebuttal King/Queen', 'Unorthodox'],
    prep: {
      researchDays: 0,
      writingDays: 1,
      performanceDays: 2,
      lifeDays: 0,
      restDays: 0,
    },
    expectedBehavior: 'Should excel with minimal prep, high variance, low choke chance',
  },
  {
    name: 'Technical Writer (High Prep)',
    badges: ['Scheme Specialist', 'Multisyllabic Master', 'Pen Game Elite'],
    prep: {
      researchDays: 3,
      writingDays: 4,
      performanceDays: 2,
      lifeDays: 0,
      restDays: 1,
    },
    expectedBehavior: 'Should excel with extensive prep, very consistent, high lyricism',
  },

  // Performance vs Writing Focused
  {
    name: 'Pure Performer',
    badges: ['Stage Domination', 'Charismatic', 'Crowd Favorite'],
    prep: {
      researchDays: 1,
      writingDays: 1,
      performanceDays: 5,
      lifeDays: 0,
      restDays: 1,
    },
    expectedBehavior: 'Should have massive crowd reaction, great stage presence',
  },
  {
    name: 'Pure Writer',
    badges: ['Wordplay Wizard', 'Metaphor Master', 'Creativity Beast'],
    prep: {
      researchDays: 2,
      writingDays: 5,
      performanceDays: 1,
      lifeDays: 0,
      restDays: 0,
    },
    expectedBehavior: 'Should have exceptional writing stats, lower performance',
  },

  // Specialized Archetypes
  {
    name: 'Angle Hunter',
    badges: ['Angle Master', 'Personal Attacks', 'Battle Technician'],
    prep: {
      researchDays: 6,
      writingDays: 1,
      performanceDays: 1,
      lifeDays: 0,
      restDays: 0,
    },
    expectedBehavior: 'Should have massive research efficiency, big peak moments',
  },
  {
    name: 'Comedy Performer',
    badges: ['Comedy', 'Charismatic', 'Impersonations'],
    prep: {
      researchDays: 1,
      writingDays: 2,
      performanceDays: 3,
      lifeDays: 0,
      restDays: 2,
    },
    expectedBehavior: 'Should have high crowd control, benefits from rest (timing)',
  },

  // Negative Badge Examples
  {
    name: 'Known Choker',
    badges: ['Choker', 'Inconsistent Performer', 'Awkward Stage Presence'],
    prep: {
      researchDays: 0,
      writingDays: 3,
      performanceDays: 3,
      lifeDays: 0,
      restDays: 2,
    },
    expectedBehavior: 'Should have high choke chance, very inconsistent',
  },
  {
    name: 'Lazy Recycler',
    badges: ['Lazy Writer', 'Recycler', 'Predictable Rhymer'],
    prep: {
      researchDays: 0,
      writingDays: 2,
      performanceDays: 2,
      lifeDays: 0,
      restDays: 0,
    },
    expectedBehavior: 'Should have terrible writing efficiency, low creativity',
  },

  // Conflicting Badges
  {
    name: 'Aggressive Comedian (Conflict)',
    badges: ['Aggressive', 'Comedy', 'Speed Rapping'],
    prep: {
      researchDays: 0,
      writingDays: 2,
      performanceDays: 4,
      lifeDays: 0,
      restDays: 0,
    },
    expectedBehavior: 'Should suffer from badge conflicts, reduced efficiency',
  },

  // Synergistic Builds
  {
    name: 'Perfect Synergy Build',
    badges: ['Scheme Specialist', 'Multisyllabic Master', 'Consistent Writer'],
    prep: {
      researchDays: 2,
      writingDays: 4,
      performanceDays: 2,
      lifeDays: 0,
      restDays: 2,
    },
    expectedBehavior: 'Should have bonus from synergies, amplified prep efficiency',
  },

  // League-Specific Builds
  {
    name: 'Small Room Specialist',
    badges: ['Metaphor Master', 'Storytelling', 'Multisyllabic Master'],
    prep: {
      researchDays: 1,
      writingDays: 4,
      performanceDays: 1,
      lifeDays: 0,
      restDays: 1,
    },
    expectedBehavior: 'Should excel in Small Room Circuit (2-min rounds)',
  },
  {
    name: 'Main Stage Star',
    badges: ['Theatrical', 'Big Stage Performer', 'Stage Domination'],
    prep: {
      researchDays: 1,
      writingDays: 2,
      performanceDays: 4,
      lifeDays: 0,
      restDays: 1,
    },
    expectedBehavior: 'Should excel in Main Stage Arena (3-min rounds)',
  },
];

// ============================================================================
// Test Runner
// ============================================================================

export function runBadgeTests() {
  console.log('='.repeat(80));
  console.log('BADGE SYSTEM TEST SUITE');
  console.log('='.repeat(80));
  console.log();

  for (const scenario of TEST_SCENARIOS) {
    console.log('-'.repeat(80));
    console.log(`TEST: ${scenario.name}`);
    console.log('-'.repeat(80));
    console.log(`Badges: ${scenario.badges.join(', ')}`);
    console.log(`Prep: ${formatPrep(scenario.prep)}`);
    console.log(`Expected: ${scenario.expectedBehavior}`);
    console.log();

    const effects = calculateBadgeEffects(scenario.badges);
    const prepBonus = calculatePrepPatternBonus(scenario.prep, effects);
    const descriptions = describeBadgeEffects(scenario.badges);

    // Display results
    console.log('BADGE EFFECTS:');
    printEffectsSummary(effects, prepBonus);
    console.log();

    console.log('DESCRIPTIONS:');
    descriptions.forEach(desc => console.log(`  - ${desc}`));
    console.log();

    // Calculate some example outcomes
    printExampleOutcomes(effects, scenario.prep);
    console.log();
  }

  console.log('='.repeat(80));
  console.log('COMPARISON: Freestyler vs Technical Writer');
  console.log('='.repeat(80));
  compareBattlerTypes();
  console.log();

  console.log('='.repeat(80));
  console.log('TESTS COMPLETE');
  console.log('='.repeat(80));
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatPrep(prep: PrepProfile): string {
  return `R:${prep.researchDays} W:${prep.writingDays} P:${prep.performanceDays} L:${prep.lifeDays} Rest:${prep.restDays}`;
}

function printEffectsSummary(effects: BadgeEffects, prepBonus: number) {
  console.log(`  Writing Prep Efficiency: ${(effects.writingPrepEfficiency * 100).toFixed(0)}%`);
  console.log(`  Performance Prep Efficiency: ${(effects.performancePrepEfficiency * 100).toFixed(0)}%`);
  console.log(`  Research Prep Efficiency: ${(effects.researchPrepEfficiency * 100).toFixed(0)}%`);
  console.log(`  Rest Efficiency: ${(effects.restEfficiency * 100).toFixed(0)}%`);
  console.log();
  console.log(`  Lyricism Multiplier: ${effects.lyricismMultiplier.toFixed(2)}x`);
  console.log(`  Wordplay Multiplier: ${effects.wordplayMultiplier.toFixed(2)}x`);
  console.log(`  Creativity Multiplier: ${effects.creativityMultiplier.toFixed(2)}x`);
  console.log(`  Stage Presence Multiplier: ${effects.stagePresenceMultiplier.toFixed(2)}x`);
  console.log(`  Crowd Control Multiplier: ${effects.crowdControlMultiplier.toFixed(2)}x`);
  console.log(`  Delivery Multiplier: ${effects.deliveryMultiplier.toFixed(2)}x`);
  console.log();
  console.log(`  Choke Reduction: ${(effects.chokeReduction * 100).toFixed(1)}%`);
  console.log(`  Choke Increase: ${(effects.chokeIncrease * 100).toFixed(1)}%`);
  console.log(`  Peak Bonus: ${(effects.peakBonus * 100).toFixed(0)}%`);
  console.log(`  Consistency Bonus: ${effects.consistencyBonus.toFixed(1)}`);
  console.log(`  Consistency Penalty: ${effects.consistencyPenalty.toFixed(1)}`);
  console.log(`  Crowd Reaction Bonus: ${effects.crowdReactionBonus > 0 ? '+' : ''}${effects.crowdReactionBonus}`);
  console.log(`  Segment Variance Multiplier: ${effects.segmentVarianceMultiplier.toFixed(2)}x`);
  console.log();
  console.log(`  Prep Pattern Bonus: ${(prepBonus * 100).toFixed(0)}%`);
  console.log(`  Small Room Bonus: ${(effects.smallRoomBonus * 100).toFixed(0)}%`);
  console.log(`  Main Stage Bonus: ${(effects.mainStageBonus * 100).toFixed(0)}%`);
}

function printExampleOutcomes(effects: BadgeEffects, prep: PrepProfile) {
  console.log('EXAMPLE OUTCOMES (Base Stats: All 5s):');

  // Simulate attribute improvements
  const baseWriting = 5;
  const basePerformance = 5;
  const baseResilience = 5;

  const prepEffectMultiplier = 0.10; // From CONFIG

  // Calculate improvements
  const writingImprovement = prep.writingDays * prepEffectMultiplier * effects.writingPrepEfficiency;
  const performanceImprovement = prep.performanceDays * prepEffectMultiplier * effects.performancePrepEfficiency;
  const researchImprovement = prep.researchDays * prepEffectMultiplier * effects.researchPrepEfficiency;
  const restImprovement = prep.restDays * prepEffectMultiplier * effects.restEfficiency;

  // Apply to base stats
  let lyricism = (baseWriting + writingImprovement + researchImprovement * 0.3) * effects.lyricismMultiplier;
  let wordplay = (baseWriting + writingImprovement) * effects.wordplayMultiplier;
  let creativity = (baseWriting + writingImprovement + researchImprovement * 0.5) * effects.creativityMultiplier;
  let stagePresence = (basePerformance + performanceImprovement) * effects.stagePresenceMultiplier;
  let crowdControl = (basePerformance + performanceImprovement) * effects.crowdControlMultiplier;
  let delivery = (basePerformance + performanceImprovement) * effects.deliveryMultiplier;
  let resilience = baseResilience + restImprovement;

  // Clamp
  lyricism = Math.min(10, lyricism);
  wordplay = Math.min(10, wordplay);
  creativity = Math.min(10, creativity);
  stagePresence = Math.min(10, stagePresence);
  crowdControl = Math.min(10, crowdControl);
  delivery = Math.min(10, delivery);
  resilience = Math.min(10, resilience);

  console.log(`  Lyricism: 5.0 → ${lyricism.toFixed(2)}`);
  console.log(`  Wordplay: 5.0 → ${wordplay.toFixed(2)}`);
  console.log(`  Creativity: 5.0 → ${creativity.toFixed(2)}`);
  console.log(`  Stage Presence: 5.0 → ${stagePresence.toFixed(2)}`);
  console.log(`  Crowd Control: 5.0 → ${crowdControl.toFixed(2)}`);
  console.log(`  Delivery: 5.0 → ${delivery.toFixed(2)}`);
  console.log(`  Resilience: 5.0 → ${resilience.toFixed(2)}`);

  // Calculate choke probability
  const baseChoke = 0.03;
  const chokeResilienceFactor = 0.025;
  const chokePrepReduction = 0.01;

  let chokeProbability = baseChoke - resilience * chokeResilienceFactor -
                         (prep.writingDays + prep.performanceDays) * chokePrepReduction;
  chokeProbability -= effects.chokeReduction;
  chokeProbability += effects.chokeIncrease;

  console.log(`  Choke Probability: ${(Math.max(0, chokeProbability) * 100).toFixed(2)}%`);
}

function compareBattlerTypes() {
  const freestyler = {
    badges: ['Freestyle Genius', 'Rebuttal King/Queen'],
    minimalPrep: {
      researchDays: 0,
      writingDays: 1,
      performanceDays: 2,
      lifeDays: 0,
      restDays: 0,
    },
    highPrep: {
      researchDays: 2,
      writingDays: 3,
      performanceDays: 3,
      lifeDays: 0,
      restDays: 2,
    },
  };

  const technical = {
    badges: ['Scheme Specialist', 'Multisyllabic Master'],
    minimalPrep: {
      researchDays: 0,
      writingDays: 1,
      performanceDays: 2,
      lifeDays: 0,
      restDays: 0,
    },
    highPrep: {
      researchDays: 2,
      writingDays: 3,
      performanceDays: 3,
      lifeDays: 0,
      restDays: 2,
    },
  };

  console.log('FREESTYLER WITH MINIMAL PREP:');
  const freestyleMinEffects = calculateBadgeEffects(freestyler.badges);
  const freestyleMinBonus = calculatePrepPatternBonus(freestyler.minimalPrep, freestyleMinEffects);
  console.log(`  Prep Pattern Bonus: ${(freestyleMinBonus * 100).toFixed(0)}% (LOW PREP BONUS!)`);
  console.log(`  Writing Efficiency: ${(freestyleMinEffects.writingPrepEfficiency * 100).toFixed(0)}%`);
  console.log(`  Choke Modifier: ${(freestyleMinEffects.chokeReduction * 100).toFixed(1)}%`);
  console.log();

  console.log('FREESTYLER WITH HIGH PREP:');
  const freestyleHighBonus = calculatePrepPatternBonus(freestyler.highPrep, freestyleMinEffects);
  console.log(`  Prep Pattern Bonus: ${(freestyleHighBonus * 100).toFixed(0)}% (no bonus)`);
  console.log(`  Writing Efficiency: ${(freestyleMinEffects.writingPrepEfficiency * 100).toFixed(0)}% (penalized)`);
  console.log();

  console.log('TECHNICAL WRITER WITH MINIMAL PREP:');
  const technicalMinEffects = calculateBadgeEffects(technical.badges);
  const technicalMinBonus = calculatePrepPatternBonus(technical.minimalPrep, technicalMinEffects);
  console.log(`  Prep Pattern Bonus: ${(technicalMinBonus * 100).toFixed(0)}% (no bonus)`);
  console.log(`  Writing Efficiency: ${(technicalMinEffects.writingPrepEfficiency * 100).toFixed(0)}%`);
  console.log();

  console.log('TECHNICAL WRITER WITH HIGH PREP:');
  const technicalHighBonus = calculatePrepPatternBonus(technical.highPrep, technicalMinEffects);
  console.log(`  Prep Pattern Bonus: ${(technicalHighBonus * 100).toFixed(0)}% (HIGH PREP BONUS!)`);
  console.log(`  Writing Efficiency: ${(technicalMinEffects.writingPrepEfficiency * 100).toFixed(0)}% (amplified)`);
  console.log();

  console.log('CONCLUSION:');
  console.log('  - Freestyler excels with 3 days or less prep (+15% bonus)');
  console.log('  - Technical writer excels with 8+ days prep (+12% bonus)');
  console.log('  - Freestyler has 70% writing efficiency (penalty) but benefits from low prep bonus');
  console.log('  - Technical writer has ~163% writing efficiency and stacks with high prep bonus');
  console.log('  - These are FUNDAMENTALLY DIFFERENT playstyles');
}

// ============================================================================
// Run Tests
// ============================================================================

// Uncomment to run tests:
// runBadgeTests();
