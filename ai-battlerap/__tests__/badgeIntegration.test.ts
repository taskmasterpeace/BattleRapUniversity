/**
 * Integration Tests for Badge-Life Event System
 *
 * Tests the complete integration between badges, life events, and choice outcomes
 */

import { describe, expect, test } from '@jest/globals';
import {
  determineBattlerArchetype,
  calculateChoiceModifier,
  calculateEffectMultiplier,
  type BattlerArchetype
} from '../lib/game/badgeSystem';
import {
  calculateChoiceOutcome,
  resolveChoiceOutcome,
  getEffectsForOutcome,
  type ChoiceContext
} from '../lib/game/choiceOutcomeCalculator';
import {
  checkBattlePerformanceBadges,
  checkLifeEventPatternBadges,
  checkAttributeBadges,
  updateBattlerBadges,
  type BadgeProgressionContext
} from '../lib/game/badgeProgression';

// ==========================================
// TEST: BADGE ARCHETYPE DETERMINATION
// ==========================================

describe('Badge Archetype System', () => {
  test('Technical writer archetype identified correctly', () => {
    const badges = ['SCHEME_SPECIALIST', 'MULTISYLLABIC_MASTER', 'PEN_GAME_ELITE'];
    const archetype = determineBattlerArchetype(badges);
    expect(archetype).toBe('technical_writer');
  });

  test('Performance beast archetype identified correctly', () => {
    const badges = ['STAGE_DOMINATION', 'CROWD_CONTROL_MASTER', 'HIGH_ENERGY_PERFORMER'];
    const archetype = determineBattlerArchetype(badges);
    expect(archetype).toBe('performance_beast');
  });

  test('Freestyler archetype identified correctly', () => {
    const badges = ['FREESTYLE_GENIUS', 'REBUTTAL_KING'];
    const archetype = determineBattlerArchetype(badges);
    expect(archetype).toBe('freestyler');
  });

  test('Balanced archetype when no dominant badges', () => {
    const badges = ['CONSISTENT_WRITER'];
    const archetype = determineBattlerArchetype(badges);
    expect(archetype).toBe('balanced');
  });
});

// ==========================================
// TEST: CHOICE OUTCOME CALCULATIONS
// ==========================================

describe('Choice Outcome Probability Calculator', () => {
  const baseContext: ChoiceContext = {
    battlerId: 'test-battler',
    badges: [],
    attributes: {
      writing: { lyricism: 6, wordplay: 6, creativity: 6 },
      performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
      personal: { reputation: 6, financial_stability: 6, family_bond: 6 },
      resilience: 6,
      public_knowledge: 50
    },
    currentStreak: 0,
    totalBattles: 10,
    recentPerformance: 'neutral',
    eventCode: 'TEST_EVENT',
    choiceType: 'composed'
  };

  test('Performance battler has advantage on risky choices', () => {
    const performerContext: ChoiceContext = {
      ...baseContext,
      badges: ['STAGE_DOMINATION', 'CROWD_CONTROL_MASTER'],
      choiceType: 'risky'
    };

    const outcome = calculateChoiceOutcome(performerContext, { reputation: 0.5 });

    // Should have better than base 45% win rate for risky choices
    expect(outcome.win).toBeGreaterThan(0.45);
    expect(outcome.modifiers.length).toBeGreaterThan(0);
  });

  test('Technical writer has advantage on composed choices', () => {
    const writerContext: ChoiceContext = {
      ...baseContext,
      badges: ['SCHEME_SPECIALIST', 'PEN_GAME_ELITE'],
      choiceType: 'composed'
    };

    const outcome = calculateChoiceOutcome(writerContext, { reputation: 0.5 });

    // Should have better than base 60% win rate for composed choices
    expect(outcome.win).toBeGreaterThan(0.60);
  });

  test('Freestyler has advantage on improvised choices', () => {
    const freestylerContext: ChoiceContext = {
      ...baseContext,
      badges: ['FREESTYLE_GENIUS', 'REBUTTAL_KING'],
      choiceType: 'improvised'
    };

    const outcome = calculateChoiceOutcome(freestylerContext, { reputation: 0.5 });

    // Should have significantly better than base 50% win rate
    expect(outcome.win).toBeGreaterThan(0.65);
  });

  test('Choker badge penalizes risky choices', () => {
    const chokerContext: ChoiceContext = {
      ...baseContext,
      badges: ['CHOKER'],
      choiceType: 'risky'
    };

    const outcome = calculateChoiceOutcome(chokerContext, { reputation: 0.5 });

    // Should have worse than base 45% win rate
    expect(outcome.win).toBeLessThan(0.45);
  });

  test('Win streak boosts all choice probabilities', () => {
    const streakContext: ChoiceContext = {
      ...baseContext,
      currentStreak: 5,
      recentPerformance: 'hot'
    };

    const outcome = calculateChoiceOutcome(streakContext, { reputation: 0.5 });

    // Should have boosted probability
    const baseOutcome = calculateChoiceOutcome(baseContext, { reputation: 0.5 });
    expect(outcome.win).toBeGreaterThan(baseOutcome.win);
  });

  test('High attributes improve choice outcomes', () => {
    const highAttrContext: ChoiceContext = {
      ...baseContext,
      attributes: {
        writing: { lyricism: 9, wordplay: 9, creativity: 9 },
        performance: { stage_presence: 9, crowd_control: 9, delivery: 9 },
        personal: { reputation: 9, financial_stability: 8, family_bond: 8 },
        resilience: 9,
        public_knowledge: 80
      },
      choiceType: 'technical'
    };

    const outcome = calculateChoiceOutcome(highAttrContext, { lyricism: 0.3 });
    const baseOutcome = calculateChoiceOutcome(baseContext, { lyricism: 0.3 });

    expect(outcome.win).toBeGreaterThan(baseOutcome.win);
  });

  test('Probabilities always sum to 1.0', () => {
    const outcome = calculateChoiceOutcome(baseContext, { reputation: 0.5 });
    const sum = outcome.win + outcome.neutral + outcome.loss;
    expect(sum).toBeCloseTo(1.0, 2);
  });
});

// ==========================================
// TEST: EFFECT MULTIPLIERS
// ==========================================

describe('Badge Effect Multipliers', () => {
  test('Performance battlers hurt more by voice issues', () => {
    const badges = ['STAGE_DOMINATION', 'HIGH_ENERGY_PERFORMER'];
    const multiplier = calculateEffectMultiplier(badges, 'VOICE_STRAIN');

    expect(multiplier).toBeGreaterThan(1.0);
  });

  test('Technical writers devastated by writer\'s block', () => {
    const badges = ['PEN_GAME_ELITE', 'SCHEME_SPECIALIST'];
    const multiplier = calculateEffectMultiplier(badges, 'WRITERS_BLOCK');

    expect(multiplier).toBeGreaterThanOrEqual(1.8);
  });

  test('Freestylers barely affected by writer\'s block', () => {
    const badges = ['FREESTYLE_GENIUS'];
    const multiplier = calculateEffectMultiplier(badges, 'WRITERS_BLOCK');

    expect(multiplier).toBeLessThan(1.0);
  });

  test('Professional battlers less affected by drama', () => {
    const badges = ['CONSUMMATE_PROFESSIONAL', 'RESPECTED_VETERAN'];
    const multiplier = calculateEffectMultiplier(badges, 'DRAMA_ESCALATION');

    expect(multiplier).toBeLessThan(1.0);
  });
});

// ==========================================
// TEST: BADGE PROGRESSION
// ==========================================

describe('Badge Unlock System', () => {
  const baseProgressionContext: BadgeProgressionContext = {
    battlerId: 'test-battler',
    totalBattles: 5,
    totalWins: 3,
    totalLosses: 2,
    currentStreak: 1,
    consecutiveWins: 1,
    consecutiveLosses: 0,
    consecutive30Wins: 0,
    consecutive30Losses: 0,
    consecutiveChokes: 0,
    currentBadges: [],
    attributes: {
      writing: { lyricism: 6, wordplay: 6, creativity: 6 },
      performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
      personal: { reputation: 6, financial_stability: 6, family_bond: 6 },
      resilience: 6
    },
    recentLifeEventChoices: [],
    recentBattleResults: []
  };

  test('Dominant Performer badge unlocked after 3 consecutive 3-0 wins', () => {
    const context: BadgeProgressionContext = {
      ...baseProgressionContext,
      consecutive30Wins: 2
    };

    const battleResult = {
      result: '3-0' as const,
      isWin: true,
      choked: false,
      peakScore: 8.5,
      averageScore: 7.8,
      consistencyScore: 0.85,
      battleId: 'test-battle'
    };

    const badges = checkBattlePerformanceBadges(context, battleResult);
    const dominantBadge = badges.find(b => b.badgeCode === 'DOMINANT_PERFORMER');

    expect(dominantBadge).toBeDefined();
  });

  test('Choker badge unlocked after 2 consecutive chokes', () => {
    const context: BadgeProgressionContext = {
      ...baseProgressionContext,
      consecutiveChokes: 1
    };

    const battleResult = {
      result: '1-2' as const,
      isWin: false,
      choked: true,
      peakScore: 5.5,
      averageScore: 4.2,
      consistencyScore: 0.4,
      battleId: 'test-battle'
    };

    const badges = checkBattlePerformanceBadges(context, battleResult);
    const chokerBadge = badges.find(b => b.badgeCode === 'CHOKER');

    expect(chokerBadge).toBeDefined();
  });

  test('Comeback King badge unlocked after winning following 3+ loss streak', () => {
    const context: BadgeProgressionContext = {
      ...baseProgressionContext,
      consecutiveLosses: 3,
      currentStreak: -3
    };

    const battleResult = {
      result: '2-1' as const,
      isWin: true,
      choked: false,
      peakScore: 8.0,
      averageScore: 7.2,
      consistencyScore: 0.75,
      battleId: 'test-battle'
    };

    const badges = checkBattlePerformanceBadges(context, battleResult);
    const comebackBadge = badges.find(b => b.badgeCode === 'COMEBACK_KING');

    expect(comebackBadge).toBeDefined();
  });

  test('Drama Starter badge from controversial choice pattern', () => {
    const context: BadgeProgressionContext = {
      ...baseProgressionContext,
      recentLifeEventChoices: [
        { eventCode: 'TWITTER_BEEF_ESCALATION', choice: 'a', timestamp: new Date() },
        { eventCode: 'LEAK_YOUR_OPPONENT', choice: 'a', timestamp: new Date() },
        { eventCode: 'JOKE_TOO_FAR', choice: 'a', timestamp: new Date() }
      ]
    };

    const badges = checkLifeEventPatternBadges(context);
    const dramaBadge = badges.find(b => b.badgeCode === 'DRAMA_STARTER');

    expect(dramaBadge).toBeDefined();
  });

  test('Pen Game Elite badge unlocked with 9+ in all writing stats', () => {
    const context: BadgeProgressionContext = {
      ...baseProgressionContext,
      attributes: {
        ...baseProgressionContext.attributes,
        writing: { lyricism: 9, wordplay: 9, creativity: 9 }
      }
    };

    const badges = checkAttributeBadges(context);
    const penGameBadge = badges.find(b => b.badgeCode === 'PEN_GAME_ELITE');

    expect(penGameBadge).toBeDefined();
  });

  test('Stage Domination badge unlocked with 9+ in all performance stats', () => {
    const context: BadgeProgressionContext = {
      ...baseProgressionContext,
      attributes: {
        ...baseProgressionContext.attributes,
        performance: { stage_presence: 9, crowd_control: 9, delivery: 9 }
      }
    };

    const badges = checkAttributeBadges(context);
    const stageBadge = badges.find(b => b.badgeCode === 'STAGE_DOMINATION');

    expect(stageBadge).toBeDefined();
  });
});

// ==========================================
// TEST: COMPLETE INTEGRATION SCENARIOS
// ==========================================

describe('Complete Badge-Event Integration', () => {
  test('SCENARIO: Performance battler handles stage show opportunity', () => {
    // Setup: Performance-focused battler with stage badges
    const context: ChoiceContext = {
      battlerId: 'test-battler',
      badges: ['STAGE_DOMINATION', 'CROWD_CONTROL_MASTER', 'CHARISMATIC'],
      attributes: {
        writing: { lyricism: 6, wordplay: 6, creativity: 6 },
        performance: { stage_presence: 9, crowd_control: 9, delivery: 8 },
        personal: { reputation: 7, financial_stability: 5, family_bond: 6 },
        resilience: 7,
        public_knowledge: 60
      },
      currentStreak: 2,
      totalBattles: 15,
      recentPerformance: 'hot',
      eventCode: 'STAGE_SHOW_OPPORTUNITY',
      choiceType: 'risky'
    };

    const baseEffects = {
      public_knowledge: 25,
      reputation: 0.6,
      financial_stability: 1.0,
      stage_presence: 0.3
    };

    const outcome = calculateChoiceOutcome(context, baseEffects);

    // Performance battler should have high success rate on this risky stage opportunity
    expect(outcome.win).toBeGreaterThan(0.65);

    // Verify modifiers are being applied
    const badgeModifier = outcome.modifiers.find(m => m.type === 'badge');
    expect(badgeModifier).toBeDefined();
    expect(badgeModifier!.value).toBeGreaterThan(0);
  });

  test('SCENARIO: Technical writer faces writer\'s block crisis', () => {
    const context: ChoiceContext = {
      battlerId: 'test-battler',
      badges: ['PEN_GAME_ELITE', 'SCHEME_SPECIALIST', 'MULTISYLLABIC_MASTER'],
      attributes: {
        writing: { lyricism: 9, wordplay: 9, creativity: 8 },
        performance: { stage_presence: 5, crowd_control: 5, delivery: 6 },
        personal: { reputation: 8, financial_stability: 6, family_bond: 7 },
        resilience: 5,
        public_knowledge: 70
      },
      currentStreak: -1,
      totalBattles: 25,
      recentPerformance: 'cold',
      eventCode: 'WRITERS_BLOCK_CRISIS',
      choiceType: 'composed'
    };

    const baseEffects = {
      creativity: -0.3,
      wordplay: -0.2,
      resilience: -0.2,
      lyricism: -0.1
    };

    // Technical writers are DEVASTATED by writer's block
    const effectMultiplier = calculateEffectMultiplier(context.badges, 'WRITERS_BLOCK_CRISIS');
    expect(effectMultiplier).toBeGreaterThanOrEqual(1.5);

    // Even composed choices have risk when you're in a cold streak
    const outcome = calculateChoiceOutcome(context, baseEffects);
    const streakModifier = outcome.modifiers.find(m => m.type === 'streak');
    expect(streakModifier).toBeDefined();
    expect(streakModifier!.value).toBeLessThan(0);
  });

  test('SCENARIO: Freestyler in 24-hour cypher challenge', () => {
    const context: ChoiceContext = {
      battlerId: 'test-battler',
      badges: ['FREESTYLE_GENIUS', 'REBUTTAL_KING', 'CREATIVITY_BEAST'],
      attributes: {
        writing: { lyricism: 7, wordplay: 7, creativity: 9 },
        performance: { stage_presence: 7, crowd_control: 7, delivery: 8 },
        personal: { reputation: 6, financial_stability: 4, family_bond: 5 },
        resilience: 8,
        public_knowledge: 55
      },
      currentStreak: 3,
      totalBattles: 18,
      recentPerformance: 'hot',
      eventCode: 'FREESTYLE_CYPHER_CHALLENGE',
      choiceType: 'improvised'
    };

    const baseEffects = {
      public_knowledge: 15,
      reputation: 0.5,
      resilience: -0.2,
      creativity: 0.3
    };

    const outcome = calculateChoiceOutcome(context, baseEffects);

    // Freestyler should EXCEL at improvised challenges
    expect(outcome.win).toBeGreaterThan(0.70);

    // Check archetype bonus
    const archetype = determineBattlerArchetype(context.badges);
    expect(archetype).toBe('freestyler');
  });

  test('SCENARIO: Choker facing therapist decision after multiple chokes', () => {
    const context: ChoiceContext = {
      battlerId: 'test-battler',
      badges: ['CHOKER', 'INCONSISTENT_PERFORMER'],
      attributes: {
        writing: { lyricism: 7, wordplay: 7, creativity: 6 },
        performance: { stage_presence: 5, crowd_control: 5, delivery: 6 },
        personal: { reputation: 4, financial_stability: 3, family_bond: 6 },
        resilience: 3,
        public_knowledge: 45
      },
      currentStreak: -2,
      totalBattles: 12,
      recentPerformance: 'cold',
      eventCode: 'THERAPIST_RECOMMENDATION',
      choiceType: 'humble'
    };

    const acceptEffects = {
      financial_stability: -0.8,
      resilience: 0.6,
      stage_presence: 0.3,
      public_knowledge: -5
    };

    const outcome = calculateChoiceOutcome(context, acceptEffects);

    // Even humble choices are risky when you're in a bad place
    // But this is actually the right move for recovery
    expect(outcome.win).toBeLessThan(0.70); // Not guaranteed, but decent chance
  });
});

// ==========================================
// TEST: BADGE REMOVAL (REDEMPTION)
// ==========================================

describe('Badge Redemption System', () => {
  test('Choker badge removed after 5 no-choke battles', () => {
    const context: BadgeProgressionContext = {
      battlerId: 'test-battler',
      totalBattles: 15,
      totalWins: 8,
      totalLosses: 7,
      currentStreak: 2,
      consecutiveWins: 2,
      consecutiveLosses: 0,
      consecutive30Wins: 0,
      consecutive30Losses: 0,
      consecutiveChokes: 0,
      currentBadges: ['CHOKER'],
      attributes: {
        writing: { lyricism: 6, wordplay: 6, creativity: 6 },
        performance: { stage_presence: 7, crowd_control: 6, delivery: 7 },
        personal: { reputation: 6, financial_stability: 5, family_bond: 6 },
        resilience: 7
      },
      recentLifeEventChoices: [],
      recentBattleResults: [
        { result: '2-1', isWin: true, choked: false, dominantPerformance: false, timestamp: new Date() },
        { result: '2-1', isWin: true, choked: false, dominantPerformance: false, timestamp: new Date() },
        { result: '1-2', isWin: false, choked: false, dominantPerformance: false, timestamp: new Date() },
        { result: '2-1', isWin: true, choked: false, dominantPerformance: false, timestamp: new Date() },
        { result: '3-0', isWin: true, choked: false, dominantPerformance: true, timestamp: new Date() }
      ]
    };

    const { badgesRemoved } = updateBattlerBadges(context);

    expect(badgesRemoved).toContain('CHOKER');
  });
});
