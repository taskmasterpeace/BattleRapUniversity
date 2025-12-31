/**
 * Badge Rarity Mapping
 *
 * Assigns rarity levels to all badges based on earning difficulty and impact:
 * - Common (30-40 badges): Easy to earn, basic achievements
 * - Rare (30-40 badges): Moderate difficulty, specialized skills
 * - Epic (15-20 badges): Significant achievements, advanced skills
 * - Legendary (5-10 badges): Extremely difficult, career-defining
 */

import type { BadgeRarity } from './badges';

export const BADGE_RARITIES: Record<string, BadgeRarity> = {
  // ========== LEGENDARY (5-10 badges) ==========
  'Pen Game Elite': 'legendary',
  'Consummate Professional': 'legendary',
  'Battle Technician': 'legendary',
  'Clutch Performer': 'legendary',
  'Respected Veteran': 'legendary',
  'Enhanced Storyteller': 'legendary',
  'GOAT': 'legendary',
  'Undefeated': 'legendary',
  'Tournament Champion': 'legendary',

  // ========== EPIC (15-20 badges) ==========
  'Scheme Specialist': 'epic',
  'Metaphor Master': 'epic',
  'Wordplay Wizard': 'epic',
  'Freestyle Genius': 'epic',
  'Creativity Beast': 'epic',
  'Technical Writer': 'epic',
  'Angle Master': 'epic',
  'Rebuttal King/Queen': 'epic',
  'Multisyllabic Master': 'epic',
  'Stage Domination': 'epic',
  'Charismatic': 'epic',
  'Theatrical': 'epic',
  'Speed Rapping': 'epic',
  'Resilient Battler': 'epic',
  'Big Stage Performer': 'epic',
  'Battle of the Night Winner': 'epic',
  'Tournament Veteran': 'epic',
  'Cinderella Story': 'epic',

  // ========== RARE (30-40 badges) ==========
  'Punchline King/Queen': 'rare',
  'Comedy King\\Queen': 'rare',
  'Consistent Writer': 'rare',
  'Crowd Favorite': 'rare',
  'Smooth Flow': 'rare',
  'Aggressive': 'rare',
  'Unorthodox': 'rare',
  'Comedian': 'rare',
  'Braggadocious': 'rare',
  'Gritty': 'rare',
  'Political Commentary': 'rare',
  'Shock Value': 'rare',
  'Storytelling': 'rare',
  'Personal Attacks': 'rare',
  'Pop Culture References': 'rare',
  'Impersonations': 'rare',
  'Believable Persona': 'rare',
  'Gun Bar Specialist': 'rare',
  'Aggressive Battler': 'rare',
  'Energy Machine': 'rare',
  'Clout Chaser': 'rare',
  'Tournament Grinder': 'rare',
  'Big Stage Specialist': 'rare',
  'Glass Cannon (Tournament)': 'rare',
  'Multitasker': 'rare',
  'Time Management Expert': 'rare',

  // ========== COMMON (remaining badges) ==========
  'Comedy': 'common',
  'Consistent Grinder': 'common',
  'Stiff Body Language': 'common',
  'Unprepared': 'common',
  'Workaholic': 'common',
  'Focused Specialist': 'common',

  // Negative badges (mostly common, some rare if severe)
  'Recycler': 'common',
  'Biter': 'rare', // Severe reputation damage
  'Reach God/Goddess': 'common',
  'One-Trick Pony': 'common',
  'Filler Abuser': 'common',
  'Outdated Referencer': 'common',
  'Lazy Writer': 'common',
  'Predictable Rhymer': 'common',
  'Weak Punchline Setups': 'common',
  'Shallow Research': 'common',
  'Redundant': 'common',
  'Overcomplicated': 'common',
  'Cliche Abuser': 'common',
  'Name Flip Dependent': 'common',
  'Choker': 'rare', // Significant career impact
  'Mumbler': 'common',
  'Monotone Deliverer': 'common',
  'Poor Breath Control': 'common',
  'Energy Drainer': 'common',
  'Inconsistent Performer': 'common',
  'Crowd Killer': 'common',
  'Awkward Stage Presence': 'common',
  'Off-Beat Performer': 'common',
  'Overprepared': 'common',
  'Underprepared': 'common',
  'Sore Loser': 'common',
  'Drama Starter': 'common',
  'Controversial': 'rare', // High-risk, high-reward
  'Unreliable': 'common',
  'Fallen Star': 'rare', // Severe decline
  'Career Plateaued': 'common',
  'Disrespectful': 'common',
  'Known Stealer': 'rare', // Severe reputation damage
  'Health Issues': 'common',
  'Jail Risk': 'common',
  'Substance Issues': 'rare', // Severe career impact
  'Financial Struggles': 'common',
  'Bitter Veteran': 'common',
  'Backstabber': 'rare', // Severe social impact
  'Washed': 'rare', // Career decline
  'Weak Chin': 'common',
  'Culture Vulture': 'common',
  'Living in Glory Days': 'common',
  'Known Choker': 'epic', // Extreme pressure issues
  'Burnout Risk': 'common',
  'Tournament Choker': 'rare', // Tournament-specific issue
};

/**
 * Get badge rarity with fallback to 'common'
 */
export function getBadgeRarity(badgeCode: string): BadgeRarity {
  return BADGE_RARITIES[badgeCode] || 'common';
}

/**
 * Get all badges of a specific rarity
 */
export function getBadgesByRarity(rarity: BadgeRarity): string[] {
  return Object.entries(BADGE_RARITIES)
    .filter(([_, r]) => r === rarity)
    .map(([badge]) => badge);
}

/**
 * Get rarity distribution statistics
 */
export function getRarityDistribution(): Record<BadgeRarity, number> {
  const distribution: Record<BadgeRarity, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  Object.values(BADGE_RARITIES).forEach(rarity => {
    distribution[rarity]++;
  });

  return distribution;
}
