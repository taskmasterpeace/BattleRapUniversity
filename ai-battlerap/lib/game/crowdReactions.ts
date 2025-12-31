/**
 * Crowd Reaction System
 *
 * Converts a 0-100 crowd_reaction score into a realistic breakdown of reactions
 * showing variety in the crowd (not everyone agrees, but there's consensus)
 */

export type ReactionCategory = 'positive' | 'neutral' | 'negative';

export type PositiveReaction = 'hype' | 'cheer' | 'laugh' | 'stunned';
export type NeutralReaction = 'watch' | 'record' | 'think' | 'talk' | 'listen';
export type NegativeReaction = 'boo' | 'cringe' | 'unimpressed' | 'disappointed';

export type ReactionType = PositiveReaction | NeutralReaction | NegativeReaction;

export type Demographic = 'black' | 'white' | 'mixed';

export interface CrowdBreakdown {
  positive: number;  // Percentage (0-1)
  neutral: number;   // Percentage (0-1)
  negative: number;  // Percentage (0-1)
}

export interface CrowdReactionSprite {
  sprite: string;          // Path to sprite file
  reaction: ReactionType;  // Reaction type
  demographic: Demographic; // Demographic category
  category: ReactionCategory; // Overall category
}

export interface LeagueDemographics {
  black: number;
  white: number;
  mixed: number;
}

/**
 * Maps a 0-100 crowd score to percentage breakdown of reactions
 *
 * @param score - Crowd reaction score (0-100)
 * @returns Breakdown of positive/neutral/negative percentages
 */
export function getCrowdReactionBreakdown(score: number): CrowdBreakdown {
  // Clamp score to valid range
  const clampedScore = Math.max(0, Math.min(100, score));

  if (clampedScore >= 90) {
    return { positive: 0.90, neutral: 0.10, negative: 0.00 };
  } else if (clampedScore >= 80) {
    return { positive: 0.75, neutral: 0.20, negative: 0.05 };
  } else if (clampedScore >= 70) {
    return { positive: 0.60, neutral: 0.30, negative: 0.10 };
  } else if (clampedScore >= 60) {
    return { positive: 0.40, neutral: 0.40, negative: 0.20 };
  } else if (clampedScore >= 50) {
    return { positive: 0.20, neutral: 0.50, negative: 0.30 };
  } else if (clampedScore >= 40) {
    return { positive: 0.10, neutral: 0.40, negative: 0.50 };
  } else if (clampedScore >= 30) {
    return { positive: 0.05, neutral: 0.25, negative: 0.70 };
  } else if (clampedScore >= 20) {
    return { positive: 0.00, neutral: 0.20, negative: 0.80 };
  } else {
    return { positive: 0.00, neutral: 0.10, negative: 0.90 };
  }
}

/**
 * Available reactions by category (based on audited sprites)
 */
const POSITIVE_REACTIONS: PositiveReaction[] = ['hype', 'cheer', 'laugh', 'stunned'];
const NEUTRAL_REACTIONS: NeutralReaction[] = ['watch', 'record', 'think', 'talk', 'listen'];
const NEGATIVE_REACTIONS: NegativeReaction[] = ['boo', 'cringe', 'unimpressed', 'disappointed'];

/**
 * Picks a random reaction type from a category
 */
function pickReaction(category: ReactionCategory): ReactionType {
  let pool: ReactionType[];

  if (category === 'positive') {
    pool = POSITIVE_REACTIONS;
  } else if (category === 'neutral') {
    pool = NEUTRAL_REACTIONS;
  } else {
    pool = NEGATIVE_REACTIONS;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Picks 3 reaction types based on the crowd breakdown percentages
 * Ensures variety while respecting the overall consensus
 *
 * @param breakdown - Percentage breakdown of reactions
 * @returns Array of 3 reaction types
 */
function pick3Reactions(breakdown: CrowdBreakdown): ReactionType[] {
  // Create a weighted pool
  const pool: ReactionCategory[] = [];

  // Add reactions based on percentages (multiply by 100 to get whole numbers)
  const positiveCount = Math.round(breakdown.positive * 100);
  const neutralCount = Math.round(breakdown.neutral * 100);
  const negativeCount = Math.round(breakdown.negative * 100);

  for (let i = 0; i < positiveCount; i++) pool.push('positive');
  for (let i = 0; i < neutralCount; i++) pool.push('neutral');
  for (let i = 0; i < negativeCount; i++) pool.push('negative');

  // Randomly pick 3 from the weighted pool
  const categories: ReactionCategory[] = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    categories.push(pool[randomIndex]);
  }

  // Convert categories to specific reaction types
  return categories.map(cat => pickReaction(cat));
}

/**
 * Picks 3 demographics based on league weights
 *
 * @param demographics - League demographic breakdown
 * @returns Array of 3 demographics
 */
function pick3Demographics(demographics: LeagueDemographics): Demographic[] {
  // Create weighted pool
  const pool: Demographic[] = [];

  const blackCount = Math.round(demographics.black * 100);
  const whiteCount = Math.round(demographics.white * 100);
  const mixedCount = Math.round(demographics.mixed * 100);

  for (let i = 0; i < blackCount; i++) pool.push('black');
  for (let i = 0; i < whiteCount; i++) pool.push('white');
  for (let i = 0; i < mixedCount; i++) pool.push('mixed');

  // Randomly pick 3
  const results: Demographic[] = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    results.push(pool[randomIndex]);
  }

  return results;
}

/**
 * Gets available sprite variants for a given reaction/demographic combo
 * Returns the count of available variants based on actual renamed sprite inventory
 */
function getVariantCount(demographic: Demographic, reaction: ReactionType): number {
  // Based on complete audit and rename of all 444 crowd sprites
  const variantMap: Record<string, number> = {
    // POSITIVE REACTIONS
    // Hype (arms up, excited, screaming)
    'black_hype': 79,
    'white_hype': 10,
    'mixed_hype': 5,

    // Cheer (clapping, smiling)
    'black_cheer': 34,
    'white_cheer': 8,
    'mixed_cheer': 4,

    // Laugh (laughing, comedy appreciation)
    'black_laugh': 2,
    'white_laugh': 1,
    'mixed_laugh': 0,

    // Stunned (shocked, surprised, "oh shit")
    'black_stunned': 35,
    'white_stunned': 8,
    'mixed_stunned': 4,

    // NEUTRAL REACTIONS
    // Watch (arms crossed, neutral, judging)
    'black_watch': 101,  // Most common!
    'white_watch': 16,
    'mixed_watch': 19,

    // Record (holding phone, documenting)
    'black_record': 12,
    'white_record': 6,
    'mixed_record': 2,

    // Think (hand on chin/face, considering)
    'black_think': 20,
    'white_think': 4,
    'mixed_think': 2,

    // Talk (leaning to neighbor, discussing)
    'black_talk': 10,
    'white_talk': 0,
    'mixed_talk': 4,

    // Listen (attentive, focused)
    'black_listen': 3,
    'white_listen': 1,
    'mixed_listen': 0,

    // NEGATIVE REACTIONS
    // Boo (thumbs down, disapproval)
    'black_boo': 12,
    'white_boo': 1,
    'mixed_boo': 0,

    // Cringe (embarrassed for them)
    'black_cringe': 9,
    'white_cringe': 3,
    'mixed_cringe': 1,

    // Unimpressed (stone face, not buying it)
    'black_unimpressed': 13,
    'white_unimpressed': 1,
    'mixed_unimpressed': 0,

    // Disappointed (sad, let down)
    'black_disappointed': 6,
    'white_disappointed': 0,
    'mixed_disappointed': 0,

    // Bored (looking away, disengaged)
    'black_bored': 3,
    'white_bored': 0,
    'mixed_bored': 0,
  };

  const key = `${demographic}_${reaction}`;
  return variantMap[key] || 0;
}

/**
 * Picks a random variant number for a reaction/demographic combo
 */
function pickVariant(demographic: Demographic, reaction: ReactionType): number {
  const count = getVariantCount(demographic, reaction);

  if (count === 0) {
    // Fallback: if this combo doesn't exist, return 1 (will need placeholder)
    return 1;
  }

  return Math.floor(Math.random() * count) + 1; // 1-indexed
}

/**
 * Formats variant number with leading zeros (001, 002, etc.)
 */
function formatVariant(num: number): string {
  return num.toString().padStart(3, '0');
}

/**
 * Gets category from reaction type
 */
function getCategory(reaction: ReactionType): ReactionCategory {
  if (POSITIVE_REACTIONS.includes(reaction as PositiveReaction)) {
    return 'positive';
  } else if (NEUTRAL_REACTIONS.includes(reaction as NeutralReaction)) {
    return 'neutral';
  } else {
    return 'negative';
  }
}

/**
 * Main function: Selects 3 crowd reaction sprites based on score and league demographics
 *
 * @param crowdScore - 0-100 crowd reaction score from battle simulation
 * @param leagueDemographics - League's crowd demographic breakdown
 * @returns Array of 3 crowd reaction sprites to display
 */
export function selectCrowdReactions(
  crowdScore: number,
  leagueDemographics: LeagueDemographics
): CrowdReactionSprite[] {
  // 1. Get breakdown percentages from score
  const breakdown = getCrowdReactionBreakdown(crowdScore);

  // 2. Pick 3 reaction types based on breakdown
  const reactions = pick3Reactions(breakdown);

  // 3. Pick 3 demographics based on league weights
  const demographics = pick3Demographics(leagueDemographics);

  // 4. Build sprite paths
  return reactions.map((reaction, i) => {
    const demographic = demographics[i];
    const variant = pickVariant(demographic, reaction);
    const variantStr = formatVariant(variant);

    return {
      sprite: `/sprites/crowd/organized/${demographic}/${reaction}_${variantStr}.png`,
      reaction,
      demographic,
      category: getCategory(reaction)
    };
  });
}

/**
 * Helper: Get default league demographics if not specified
 */
export function getDefaultDemographics(): LeagueDemographics {
  return {
    black: 0.5,
    white: 0.3,
    mixed: 0.2
  };
}
