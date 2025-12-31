/**
 * Badge Progression and Unlock System
 *
 * Handles badge earning, progression tracking, and reputation badge management.
 * Badges are earned through battle performance, life event choices, and behavior patterns.
 */

import { BADGE_UNLOCK_CONDITIONS, type BadgeUnlockCondition } from './badgeSystem';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface BadgeProgressionContext {
  battlerId: string;

  // Battle history
  totalBattles: number;
  totalWins: number;
  totalLosses: number;
  currentStreak: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  consecutive30Wins: number;
  consecutive30Losses: number;
  consecutiveChokes: number;

  // Current badges
  currentBadges: string[];

  // Attributes
  attributes: {
    writing: { lyricism: number; wordplay: number; creativity: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { reputation: number; financial_stability: number; family_bond: number };
    resilience: number;
  };

  // Recent behavior
  recentLifeEventChoices: {
    eventCode: string;
    choice: 'a' | 'b';
    timestamp: Date;
  }[];

  // Battle performance
  recentBattleResults: {
    result: '3-0' | '2-1' | '1-2' | '0-3';
    isWin: boolean;
    choked: boolean;
    dominantPerformance: boolean;
    timestamp: Date;
  }[];
}

export interface BadgeEarnedResult {
  badgeCode: string;
  reason: string;
  battleId?: string;
  timestamp: Date;
}

// ==========================================
// BATTLE PERFORMANCE BADGE UNLOCKS
// ==========================================

/**
 * Check for badges earned from battle performance
 */
export function checkBattlePerformanceBadges(
  context: BadgeProgressionContext,
  battleResult: {
    result: '3-0' | '2-1' | '1-2' | '0-3';
    isWin: boolean;
    choked: boolean;
    peakScore: number;
    averageScore: number;
    consistencyScore: number;
    battleId: string;
  }
): BadgeEarnedResult[] {
  const earnedBadges: BadgeEarnedResult[] = [];

  // DOMINANT PERFORMER - 3 consecutive 3-0 wins
  if (
    battleResult.result === '3-0' &&
    battleResult.isWin &&
    context.consecutive30Wins >= 2 &&
    !context.currentBadges.includes('DOMINANT_PERFORMER')
  ) {
    earnedBadges.push({
      badgeCode: 'DOMINANT_PERFORMER',
      reason: 'Three consecutive 3-0 victories',
      battleId: battleResult.battleId,
      timestamp: new Date()
    });
  }

  // CHOKER - 2 consecutive chokes
  if (
    battleResult.choked &&
    context.consecutiveChokes >= 1 &&
    !context.currentBadges.includes('CHOKER')
  ) {
    earnedBadges.push({
      badgeCode: 'CHOKER',
      reason: 'Choked in multiple consecutive battles',
      battleId: battleResult.battleId,
      timestamp: new Date()
    });
  }

  // COMEBACK KING/QUEEN - Win after 3+ loss streak
  if (
    battleResult.isWin &&
    context.consecutiveLosses >= 3 &&
    !context.currentBadges.includes('COMEBACK_KING')
  ) {
    earnedBadges.push({
      badgeCode: 'COMEBACK_KING',
      reason: 'Won after overcoming a brutal losing streak',
      battleId: battleResult.battleId,
      timestamp: new Date()
    });
  }

  // PEAK PERFORMER - High peak but low average (flashy but inconsistent)
  if (
    battleResult.peakScore > 8.5 &&
    battleResult.averageScore < 6.5 &&
    battleResult.consistencyScore < 0.6 &&
    !context.currentBadges.includes('PEAK_PERFORMER')
  ) {
    earnedBadges.push({
      badgeCode: 'PEAK_PERFORMER',
      reason: 'Multiple battles with explosive peaks but inconsistent overall performance',
      battleId: battleResult.battleId,
      timestamp: new Date()
    });
  }

  // CONSISTENT WRITER - High consistency across rounds
  if (
    battleResult.consistencyScore > 0.85 &&
    battleResult.averageScore > 7.0 &&
    !context.currentBadges.includes('CONSISTENT_WRITER')
  ) {
    earnedBadges.push({
      badgeCode: 'CONSISTENT_WRITER',
      reason: 'Exceptional consistency in battle performance',
      battleId: battleResult.battleId,
      timestamp: new Date()
    });
  }

  // RESILIENT BATTLER - Never choked in 10+ battles
  if (
    context.totalBattles >= 10 &&
    context.consecutiveChokes === 0 &&
    context.recentBattleResults.filter(b => b.choked).length === 0 &&
    !context.currentBadges.includes('RESILIENT_BATTLER')
  ) {
    earnedBadges.push({
      badgeCode: 'RESILIENT_BATTLER',
      reason: 'Never choked despite pressure',
      battleId: battleResult.battleId,
      timestamp: new Date()
    });
  }

  return earnedBadges;
}

// ==========================================
// LIFE EVENT CHOICE BADGE UNLOCKS
// ==========================================

/**
 * Check for badges earned from life event choice patterns
 */
export function checkLifeEventPatternBadges(
  context: BadgeProgressionContext
): BadgeEarnedResult[] {
  const earnedBadges: BadgeEarnedResult[] = [];

  // Get recent choices (last 5 events)
  const recentChoices = context.recentLifeEventChoices.slice(-5);

  // DRAMA STARTER - Made 3+ drama-escalating choices
  const dramaChoices = recentChoices.filter(choice =>
    choice.eventCode.includes('TWITTER_BEEF') ||
    choice.eventCode.includes('CONTROVERSIAL') ||
    choice.eventCode.includes('LEAK') ||
    (choice.eventCode.includes('JOKE') && choice.choice === 'a')
  );

  if (
    dramaChoices.length >= 3 &&
    !context.currentBadges.includes('DRAMA_STARTER')
  ) {
    earnedBadges.push({
      badgeCode: 'DRAMA_STARTER',
      reason: 'Pattern of choosing controversial and dramatic options',
      timestamp: new Date()
    });
  }

  // CONSUMMATE PROFESSIONAL - Made 5+ professional/humble choices
  const professionalChoices = recentChoices.filter(choice =>
    (choice.eventCode.includes('NARROW_LOSS') && choice.choice === 'b') ||
    (choice.eventCode.includes('CONTROVERSIAL') && choice.choice === 'b') ||
    (choice.eventCode.includes('MENTOR') && choice.choice === 'a') ||
    (choice.eventCode.includes('INTERVIEW') && choice.choice === 'b')
  );

  if (
    professionalChoices.length >= 5 &&
    !context.currentBadges.includes('CONSUMMATE_PROFESSIONAL')
  ) {
    earnedBadges.push({
      badgeCode: 'CONSUMMATE_PROFESSIONAL',
      reason: 'Consistent professional conduct and mature choices',
      timestamp: new Date()
    });
  }

  // HUMBLE WINNER - Chose humble options after multiple wins
  const recentWins = context.recentBattleResults.filter(b => b.isWin).length;
  const humbleChoices = recentChoices.filter(choice =>
    choice.eventCode.includes('VICTORY') && choice.choice === 'b' || // Declined spotlight
    choice.eventCode.includes('MERCH') && choice.choice === 'b' || // Kept it organic
    choice.eventCode.includes('INTERVIEW') && choice.choice === 'b' // Stayed mysterious
  );

  if (
    recentWins >= 3 &&
    humbleChoices.length >= 2 &&
    !context.currentBadges.includes('HUMBLE_WINNER')
  ) {
    earnedBadges.push({
      badgeCode: 'HUMBLE_WINNER',
      reason: 'Stayed humble despite success',
      timestamp: new Date()
    });
  }

  return earnedBadges;
}

// ==========================================
// ATTRIBUTE-BASED BADGE UNLOCKS
// ==========================================

/**
 * Check for badges earned from reaching attribute thresholds
 */
export function checkAttributeBadges(
  context: BadgeProgressionContext
): BadgeEarnedResult[] {
  const earnedBadges: BadgeEarnedResult[] = [];
  const { attributes } = context;

  // PEN GAME ELITE - All writing stats 9+
  if (
    attributes.writing.lyricism >= 9 &&
    attributes.writing.wordplay >= 9 &&
    attributes.writing.creativity >= 9 &&
    !context.currentBadges.includes('PEN_GAME_ELITE')
  ) {
    earnedBadges.push({
      badgeCode: 'PEN_GAME_ELITE',
      reason: 'Mastered all aspects of writing',
      timestamp: new Date()
    });
  }

  // STAGE DOMINATION - All performance stats 9+
  if (
    attributes.performance.stage_presence >= 9 &&
    attributes.performance.crowd_control >= 9 &&
    attributes.performance.delivery >= 9 &&
    !context.currentBadges.includes('STAGE_DOMINATION')
  ) {
    earnedBadges.push({
      badgeCode: 'STAGE_DOMINATION',
      reason: 'Complete mastery of stage performance',
      timestamp: new Date()
    });
  }

  // RESPECTED VETERAN - High reputation + many battles
  if (
    attributes.personal.reputation >= 8 &&
    context.totalBattles >= 20 &&
    !context.currentBadges.includes('RESPECTED_VETERAN')
  ) {
    earnedBadges.push({
      badgeCode: 'RESPECTED_VETERAN',
      reason: 'Earned respect through consistent excellence',
      timestamp: new Date()
    });
  }

  // WORDPLAY WIZARD - Wordplay 9+, earned through battles
  if (
    attributes.writing.wordplay >= 9 &&
    context.totalBattles >= 10 &&
    !context.currentBadges.includes('WORDPLAY_WIZARD')
  ) {
    earnedBadges.push({
      badgeCode: 'WORDPLAY_WIZARD',
      reason: 'Master of complex wordplay and double meanings',
      timestamp: new Date()
    });
  }

  return earnedBadges;
}

// ==========================================
// BADGE REMOVAL CONDITIONS
// ==========================================

/**
 * Check if any badges should be removed (negative badges can be redeemed)
 */
export function checkBadgeRemovals(
  context: BadgeProgressionContext
): string[] {
  const badgesToRemove: string[] = [];

  // CHOKER can be removed with 5 consecutive no-choke battles
  if (
    context.currentBadges.includes('CHOKER') &&
    context.consecutiveChokes === 0 &&
    context.recentBattleResults.slice(-5).every(b => !b.choked) &&
    context.recentBattleResults.length >= 5
  ) {
    badgesToRemove.push('CHOKER');
  }

  // DRAMA STARTER can be removed with professional behavior
  if (
    context.currentBadges.includes('DRAMA_STARTER') &&
    context.recentLifeEventChoices.slice(-5).every(choice =>
      !choice.eventCode.includes('TWITTER') &&
      !choice.eventCode.includes('CONTROVERSIAL')
    )
  ) {
    badgesToRemove.push('DRAMA_STARTER');
  }

  // INCONSISTENT_PERFORMER can be removed with consistent performances
  const recentConsistency = context.recentBattleResults.slice(-5);
  if (
    context.currentBadges.includes('INCONSISTENT_PERFORMER') &&
    recentConsistency.length >= 5 &&
    recentConsistency.every(b => b.dominantPerformance || b.result === '2-1')
  ) {
    badgesToRemove.push('INCONSISTENT_PERFORMER');
  }

  return badgesToRemove;
}

// ==========================================
// BADGE PROGRESSION TRACKING
// ==========================================

export interface BadgeProgress {
  badgeCode: string;
  progress: number; // 0-1
  requirement: string;
  nextMilestone?: string;
}

/**
 * Get progress towards unlocking specific badges
 */
export function getBadgeProgress(
  context: BadgeProgressionContext
): BadgeProgress[] {
  const progressList: BadgeProgress[] = [];

  // DOMINANT_PERFORMER progress
  if (!context.currentBadges.includes('DOMINANT_PERFORMER')) {
    progressList.push({
      badgeCode: 'DOMINANT_PERFORMER',
      progress: Math.min(1, context.consecutive30Wins / 3),
      requirement: 'Win 3 consecutive battles 3-0',
      nextMilestone: `${context.consecutive30Wins}/3 dominant wins`
    });
  }

  // RESPECTED_VETERAN progress
  if (!context.currentBadges.includes('RESPECTED_VETERAN')) {
    const battlesProgress = Math.min(1, context.totalBattles / 20);
    const reputationProgress = Math.min(1, context.attributes.personal.reputation / 8);
    const overallProgress = Math.min(battlesProgress, reputationProgress);

    progressList.push({
      badgeCode: 'RESPECTED_VETERAN',
      progress: overallProgress,
      requirement: 'Complete 20 battles with 8+ reputation',
      nextMilestone: `${context.totalBattles}/20 battles, ${context.attributes.personal.reputation.toFixed(1)}/8 reputation`
    });
  }

  // PEN_GAME_ELITE progress
  if (!context.currentBadges.includes('PEN_GAME_ELITE')) {
    const lyrProgress = Math.min(1, context.attributes.writing.lyricism / 9);
    const wordplayProgress = Math.min(1, context.attributes.writing.wordplay / 9);
    const creativityProgress = Math.min(1, context.attributes.writing.creativity / 9);
    const overallProgress = (lyrProgress + wordplayProgress + creativityProgress) / 3;

    progressList.push({
      badgeCode: 'PEN_GAME_ELITE',
      progress: overallProgress,
      requirement: 'Reach 9+ in all writing attributes',
      nextMilestone: `Lyricism: ${context.attributes.writing.lyricism}/9, Wordplay: ${context.attributes.writing.wordplay}/9, Creativity: ${context.attributes.writing.creativity}/9`
    });
  }

  return progressList;
}

// ==========================================
// MAIN BADGE UPDATE FUNCTION
// ==========================================

/**
 * Check all badge unlock/removal conditions and return changes
 */
export function updateBattlerBadges(
  context: BadgeProgressionContext,
  battleResult?: {
    result: '3-0' | '2-1' | '1-2' | '0-3';
    isWin: boolean;
    choked: boolean;
    peakScore: number;
    averageScore: number;
    consistencyScore: number;
    battleId: string;
  }
): {
  badgesEarned: BadgeEarnedResult[];
  badgesRemoved: string[];
} {
  const badgesEarned: BadgeEarnedResult[] = [];
  const badgesRemoved: string[] = [];

  // Check battle performance badges (if battle result provided)
  if (battleResult) {
    badgesEarned.push(...checkBattlePerformanceBadges(context, battleResult));
  }

  // Check life event pattern badges
  badgesEarned.push(...checkLifeEventPatternBadges(context));

  // Check attribute-based badges
  badgesEarned.push(...checkAttributeBadges(context));

  // Check for badge removals
  badgesRemoved.push(...checkBadgeRemovals(context));

  return {
    badgesEarned,
    badgesRemoved
  };
}
