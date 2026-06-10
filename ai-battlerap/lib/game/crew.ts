/**
 * Crew recruiting constants + helpers.
 *
 * Players recruit AI battlers into their crew (max 3). Recruiting is
 * in-person — you must be standing in the same city as the target.
 * Each member contributes one extra prep day per battle, matching
 * their specialty (research / writing / performance).
 */

export const MAX_CREW_SIZE = 3;

/** Recruit cost by target battler tier. */
export const RECRUIT_COST_BY_TIER: Record<string, number> = {
  low: 200,
  mid: 500,
  top: 1500,
  god: 5000,
};

export function recruitCostForTier(tier: string | null | undefined): number {
  return RECRUIT_COST_BY_TIER[(tier || 'low').toLowerCase()] ?? RECRUIT_COST_BY_TIER.low;
}

export type CrewSpecialty = 'research' | 'writing' | 'performance';

/** Player-facing copy for what each specialty contributes. */
export const SPECIALTY_BONUS_LABEL: Record<CrewSpecialty, string> = {
  research: '+1 RESEARCH DAY EVERY BATTLE',
  writing: '+1 WRITING DAY EVERY BATTLE',
  performance: '+1 PERFORMANCE DAY EVERY BATTLE',
};

type AttributeRow = {
  writing?: Record<string, number> | null;
  performance?: Record<string, number> | null;
  personal?: Record<string, number> | null;
  resilience?: number | null;
};

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/**
 * Derive a recruit's crew specialty from their best stat group:
 * avg(writing) vs avg(performance) vs avg(personal.preparation, resilience).
 * Ties resolve writing > performance > research.
 */
export function deriveSpecialty(attrs: AttributeRow | null | undefined): CrewSpecialty {
  const writingAvg = avg(Object.values(attrs?.writing ?? {}).filter((v) => typeof v === 'number'));
  const performanceAvg = avg(
    Object.values(attrs?.performance ?? {}).filter((v) => typeof v === 'number')
  );
  const researchAvg = avg([
    typeof attrs?.personal?.preparation === 'number' ? attrs.personal.preparation : 5,
    typeof attrs?.resilience === 'number' ? attrs.resilience : 5,
  ]);

  if (writingAvg >= performanceAvg && writingAvg >= researchAvg) return 'writing';
  if (performanceAvg >= researchAvg) return 'performance';
  return 'research';
}
