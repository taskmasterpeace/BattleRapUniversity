/**
 * Tournament Achievements System
 * Defines tournament-specific achievements and checks conditions
 */

export interface TournamentAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge?: string; // Optional badge unlock
  condition: (stats: TournamentPlayerStats) => boolean;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface TournamentPlayerStats {
  totalTournaments: number;
  championships: number;
  runnerUps: number;
  top4Finishes: number;
  consecutiveWins: number;
  totalPrizeEarned: number;
  tournamentWinRate: number;
  perfectRuns: number;
  comebackWins: number;
  cinderellaRuns: number;
  biggestUpset: number; // Seed difference
  lowestSeedWin: number; // Lowest seed that won tournament
  undefeatedTournaments: number;
}

export const TOURNAMENT_ACHIEVEMENTS: Record<string, TournamentAchievement> = {
  // DEBUT & FIRST STEPS
  first_tournament: {
    id: 'first_tournament',
    name: 'Tournament Debut',
    description: 'Participate in your first tournament',
    icon: '🎯',
    tier: 'bronze',
    condition: (stats) => stats.totalTournaments >= 1,
  },

  first_championship: {
    id: 'first_championship',
    name: 'Champion',
    description: 'Win your first tournament',
    icon: '🏆',
    tier: 'gold',
    condition: (stats) => stats.championships >= 1,
  },

  first_finals: {
    id: 'first_finals',
    name: 'Finals Appearance',
    description: 'Reach your first tournament final',
    icon: '🥈',
    tier: 'silver',
    condition: (stats) => stats.runnerUps >= 1 || stats.championships >= 1,
  },

  // CHAMPIONSHIP ACHIEVEMENTS
  back_to_back: {
    id: 'back_to_back',
    name: 'Repeat Champion',
    description: 'Win consecutive tournaments',
    icon: '👑',
    tier: 'gold',
    condition: (stats) => stats.consecutiveWins >= 2,
  },

  three_peat: {
    id: 'three_peat',
    name: 'Dynasty',
    description: 'Win three consecutive tournaments',
    icon: '🔱',
    tier: 'platinum',
    badge: 'Tournament Veteran',
    condition: (stats) => stats.consecutiveWins >= 3,
  },

  championship_veteran: {
    id: 'championship_veteran',
    name: 'Championship Veteran',
    description: 'Win 3 tournaments',
    icon: '🌟',
    tier: 'gold',
    badge: 'Big Stage Specialist',
    condition: (stats) => stats.championships >= 3,
  },

  championship_legend: {
    id: 'championship_legend',
    name: 'Championship Legend',
    description: 'Win 5 tournaments',
    icon: '💫',
    tier: 'platinum',
    badge: 'Tournament Legend',
    condition: (stats) => stats.championships >= 5,
  },

  // PERFECT PERFORMANCE
  cinderella: {
    id: 'cinderella',
    name: 'Cinderella Story',
    description: 'Win a tournament as the lowest seed (#13-16)',
    icon: '✨',
    tier: 'platinum',
    badge: 'Cinderella Story',
    condition: (stats) => stats.lowestSeedWin >= 13,
  },

  undefeated: {
    id: 'undefeated',
    name: 'Perfect Run',
    description: 'Win a tournament without losing a single battle',
    icon: '💎',
    tier: 'gold',
    condition: (stats) => stats.undefeatedTournaments >= 1,
  },

  perfect_three: {
    id: 'perfect_three',
    name: 'Flawless Victory',
    description: 'Win 3 tournaments with perfect records',
    icon: '👑',
    tier: 'platinum',
    condition: (stats) => stats.undefeatedTournaments >= 3,
  },

  // COMEBACK & RESILIENCE
  glass_cannon: {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    description: 'Win tournament final after losing an earlier round',
    icon: '🔥',
    tier: 'silver',
    badge: 'Glass Cannon (Tournament)',
    condition: (stats) => stats.comebackWins >= 1,
  },

  comeback_king: {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Win 3 tournaments after losing earlier rounds',
    icon: '⚡',
    tier: 'gold',
    badge: 'Comeback Artist',
    condition: (stats) => stats.comebackWins >= 3,
  },

  // PARTICIPATION & GRIND
  tournament_grinder: {
    id: 'tournament_grinder',
    name: 'Tournament Grinder',
    description: 'Participate in 10 tournaments',
    icon: '⚙️',
    tier: 'silver',
    badge: 'Tournament Grinder',
    condition: (stats) => stats.totalTournaments >= 10,
  },

  tournament_veteran: {
    id: 'tournament_veteran',
    name: 'Tournament Veteran',
    description: 'Participate in 25 tournaments',
    icon: '🎖️',
    tier: 'gold',
    condition: (stats) => stats.totalTournaments >= 25,
  },

  tournament_lifer: {
    id: 'tournament_lifer',
    name: 'Tournament Lifer',
    description: 'Participate in 50 tournaments',
    icon: '🏅',
    tier: 'platinum',
    badge: 'Tournament Lifer',
    condition: (stats) => stats.totalTournaments >= 50,
  },

  // PRIZE MONEY
  first_payday: {
    id: 'first_payday',
    name: 'First Payday',
    description: 'Earn your first tournament prize',
    icon: '💵',
    tier: 'bronze',
    condition: (stats) => stats.totalPrizeEarned > 0,
  },

  money_maker: {
    id: 'money_maker',
    name: 'Money Maker',
    description: 'Earn $50,000+ in tournament prizes',
    icon: '💰',
    tier: 'gold',
    condition: (stats) => stats.totalPrizeEarned >= 50000,
  },

  six_figures: {
    id: 'six_figures',
    name: 'Six Figure Battler',
    description: 'Earn $100,000+ in tournament prizes',
    icon: '💎',
    tier: 'platinum',
    badge: 'Money Bags',
    condition: (stats) => stats.totalPrizeEarned >= 100000,
  },

  // UPSET SPECIALIST
  giant_killer: {
    id: 'giant_killer',
    name: 'Giant Killer',
    description: 'Beat a seed 5+ spots higher in tournament',
    icon: '🗡️',
    tier: 'silver',
    condition: (stats) => stats.biggestUpset >= 5,
  },

  david_vs_goliath: {
    id: 'david_vs_goliath',
    name: 'David vs Goliath',
    description: 'Beat a seed 10+ spots higher in tournament',
    icon: '🪨',
    tier: 'gold',
    badge: 'Giant Slayer',
    condition: (stats) => stats.biggestUpset >= 10,
  },

  // CONSISTENCY
  consistent_finalist: {
    id: 'consistent_finalist',
    name: 'Consistent Finalist',
    description: 'Reach 5 tournament finals',
    icon: '🎯',
    tier: 'gold',
    condition: (stats) => (stats.championships + stats.runnerUps) >= 5,
  },

  top_four_regular: {
    id: 'top_four_regular',
    name: 'Top Four Regular',
    description: 'Finish in top 4 of 10 tournaments',
    icon: '📊',
    tier: 'silver',
    condition: (stats) => stats.top4Finishes >= 10,
  },

  // WIN RATE
  tournament_dominator: {
    id: 'tournament_dominator',
    name: 'Tournament Dominator',
    description: 'Maintain 80%+ tournament battle win rate (min 20 battles)',
    icon: '⚔️',
    tier: 'platinum',
    badge: 'Tournament Dominator',
    condition: (stats) => stats.tournamentWinRate >= 80 && stats.totalTournaments >= 5,
  },

  big_stage_specialist: {
    id: 'big_stage_specialist',
    name: 'Big Stage Specialist',
    description: 'Win 70%+ of tournament battles (min 15 battles)',
    icon: '🌟',
    tier: 'gold',
    badge: 'Big Stage Specialist',
    condition: (stats) => stats.tournamentWinRate >= 70 && stats.totalTournaments >= 4,
  },
};

/**
 * Check which achievements a player has unlocked based on their stats
 */
export function checkTournamentAchievements(stats: TournamentPlayerStats): string[] {
  const unlockedAchievements: string[] = [];

  for (const [id, achievement] of Object.entries(TOURNAMENT_ACHIEVEMENTS)) {
    if (achievement.condition(stats)) {
      unlockedAchievements.push(id);
    }
  }

  return unlockedAchievements;
}

/**
 * Get achievement progress (for achievements with incremental goals)
 */
export function getAchievementProgress(achievementId: string, stats: TournamentPlayerStats): {
  current: number;
  required: number;
  percentage: number;
} | null {
  const progressMap: Record<string, { current: number; required: number }> = {
    first_tournament: { current: stats.totalTournaments, required: 1 },
    first_championship: { current: stats.championships, required: 1 },
    back_to_back: { current: stats.consecutiveWins, required: 2 },
    three_peat: { current: stats.consecutiveWins, required: 3 },
    championship_veteran: { current: stats.championships, required: 3 },
    championship_legend: { current: stats.championships, required: 5 },
    tournament_grinder: { current: stats.totalTournaments, required: 10 },
    tournament_veteran: { current: stats.totalTournaments, required: 25 },
    tournament_lifer: { current: stats.totalTournaments, required: 50 },
    money_maker: { current: stats.totalPrizeEarned, required: 50000 },
    six_figures: { current: stats.totalPrizeEarned, required: 100000 },
    consistent_finalist: { current: stats.championships + stats.runnerUps, required: 5 },
    top_four_regular: { current: stats.top4Finishes, required: 10 },
  };

  const progress = progressMap[achievementId];
  if (!progress) return null;

  const percentage = Math.min(100, (progress.current / progress.required) * 100);

  return {
    current: progress.current,
    required: progress.required,
    percentage,
  };
}

/**
 * Get badge unlocks from achievements
 */
export function getBadgeUnlocksFromAchievements(achievementIds: string[]): string[] {
  const badges: string[] = [];

  for (const id of achievementIds) {
    const achievement = TOURNAMENT_ACHIEVEMENTS[id];
    if (achievement?.badge) {
      badges.push(achievement.badge);
    }
  }

  return badges;
}

/**
 * Sort achievements by tier and unlock status
 */
export function sortAchievements(
  achievementIds: string[],
  unlockedIds: string[]
): TournamentAchievement[] {
  const tierOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3, undefined: 4 };

  return achievementIds
    .map(id => TOURNAMENT_ACHIEVEMENTS[id])
    .filter(Boolean)
    .sort((a, b) => {
      // Unlocked first
      const aUnlocked = unlockedIds.includes(a.id);
      const bUnlocked = unlockedIds.includes(b.id);
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;

      // Then by tier
      const aTier = tierOrder[a.tier || 'undefined'];
      const bTier = tierOrder[b.tier || 'undefined'];
      if (aTier !== bTier) return aTier - bTier;

      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
}
