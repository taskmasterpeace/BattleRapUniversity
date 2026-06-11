/**
 * Prep Projection — client-safe math that mirrors the REAL simulation formulas
 * (lib/game/simulation.ts applyPrepModifiers + segment choke check) so the
 * prep page can show truthful projected impact as days are assigned.
 *
 * Every constant comes from SIMULATION_CONFIG — if balance is retuned, the
 * projection follows automatically. Badge effects are intentionally omitted
 * (baseline projection); the panel labels itself accordingly.
 */

import { SIMULATION_CONFIG as CONFIG } from './config';

export type PrepCounts = {
  research: number;
  writing: number;
  performance: number;
  life: number;
  rest: number;
};

export type ProjectionContext = {
  /** personal.preparation attribute (1-10), defaults to 5 */
  preparation: number;
  /** resilience attribute (1-10), defaults to 5 */
  resilience: number;
  /** personal.family_bond attribute (1-10), defaults to 5 */
  familyBond: number;
  /** league round length in minutes (2 or 3) */
  roundLengthMinutes: number;
};

export type PrepProjection = {
  /** +X.XX to lyricism/wordplay/creativity (writing days, before research spillover) */
  writingBoost: number;
  /** +X.XX to stage presence/crowd control/delivery */
  performanceBoost: number;
  /** research spillover: +0.5x to creativity, +0.3x to lyricism */
  researchCreativityBoost: number;
  researchLyricismBoost: number;
  /** +X.XX to resilience from rest days */
  resilienceBoost: number;
  /** +X.XX to family bond (life days; financial gets 0.5x, preparation 0.3x) */
  lifeBoost: number;
  /** haymaker (peak segment) chance per segment — doubled once you bank ≥1 research day */
  peakChancePerSegment: number;
  peakChanceUnlocked: boolean;
  /** choke probability per segment after reductions (clamped to config floor/cap) */
  chokePerSegment: number;
  /** chance of at least one choke across the whole battle (3 rounds) */
  chokePerBattle: number;
  /** same numbers with zero prep, for the trend arrow */
  baselineChokePerBattle: number;
  totalDaysAssigned: number;
};

/** Effective prep multiplier: PREP_EFFECT_MULTIPLIER scaled by the preparation attribute. */
export function effectivePrepMultiplier(preparation: number): number {
  return CONFIG.PREP_EFFECT_MULTIPLIER * (1 + preparation / 20);
}

function chokeSegmentProbability(
  resilience: number,
  familyBond: number,
  writingDays: number
): number {
  // Mirrors simulation.ts segment choke check (baseline: no stress, no badges,
  // no fame/financial pressure).
  const effectiveResilience = resilience + familyBond / 10;
  const aboveAverage = Math.max(0, effectiveResilience - 5);

  let p = CONFIG.CHOKE_BASE_PROBABILITY;
  p -= aboveAverage * CONFIG.CHOKE_RESILIENCE_FACTOR;
  p -= writingDays * CONFIG.CHOKE_PREP_REDUCTION; // writing prep = memorization

  return Math.min(CONFIG.CHOKE_MAXIMUM, Math.max(CONFIG.CHOKE_MINIMUM, p));
}

export function projectPrep(counts: PrepCounts, ctx: ProjectionContext): PrepProjection {
  const epm = effectivePrepMultiplier(ctx.preparation);

  const writingBoost = counts.writing * epm;
  const performanceBoost = counts.performance * epm;
  const researchBoost = counts.research * epm;
  const resilienceBoost = counts.rest * epm;
  const lifeBoost = counts.life * epm;

  // Rest days raise resilience BEFORE the choke check runs (modified attrs
  // feed the simulation), so they lower choke risk through resilience.
  const projectedResilience = Math.min(10, ctx.resilience + resilienceBoost);
  const projectedFamilyBond = Math.min(10, ctx.familyBond + lifeBoost);

  const segmentsPerRound = ctx.roundLengthMinutes === 2 ? 4 : 6;
  const totalSegments = segmentsPerRound * 3; // best-of-3 rounds

  const chokeNow = chokeSegmentProbability(
    projectedResilience,
    projectedFamilyBond,
    counts.writing
  );
  const chokeBaseline = chokeSegmentProbability(ctx.resilience, ctx.familyBond, 0);

  const peakChanceUnlocked = counts.research > 0;
  const peakChancePerSegment = peakChanceUnlocked
    ? CONFIG.PEAK_PROBABILITY
    : CONFIG.PEAK_PROBABILITY * 0.5;

  return {
    writingBoost,
    performanceBoost,
    researchCreativityBoost: researchBoost * 0.5,
    researchLyricismBoost: researchBoost * 0.3,
    resilienceBoost,
    lifeBoost,
    peakChancePerSegment,
    peakChanceUnlocked,
    chokePerSegment: chokeNow,
    chokePerBattle: 1 - Math.pow(1 - chokeNow, totalSegments),
    baselineChokePerBattle: 1 - Math.pow(1 - chokeBaseline, totalSegments),
    totalDaysAssigned:
      counts.research + counts.writing + counts.performance + counts.life + counts.rest,
  };
}

/** One-line corner read for the projection panel. */
export function projectionReadline(
  counts: PrepCounts,
  projection: PrepProjection,
  totalPrepDays: number
): string {
  const total = projection.totalDaysAssigned;
  if (total === 0) {
    return 'NO PREP BANKED — WALK IN COLD AND THE CHOKE RISK IS ALL YOURS';
  }
  if (total < totalPrepDays) {
    const left = totalPrepDays - total;
    return `${left} DAY${left === 1 ? '' : 'S'} UNASSIGNED — EVERY EMPTY DAY IS A FREE WIN FOR YOUR OPPONENT`;
  }
  // Full week planned
  const categoriesUsed = [
    counts.research,
    counts.writing,
    counts.performance,
    counts.rest,
  ].filter((d) => d >= 2).length;
  if (categoriesUsed >= 3) {
    return 'LOOKING SHARP — FULL WEEK PLANNED WITH A BALANCED SPLIT, NO HOLES IN YOUR GAME';
  }
  if (!projection.peakChanceUnlocked) {
    return 'FULL WEEK PLANNED — BUT ZERO RESEARCH MEANS YOUR HAYMAKER CHANCE STAYS HALVED';
  }
  return 'LOOKING SHARP — FULL WEEK PLANNED, EVERY DAY IS WORKING FOR YOU';
}
