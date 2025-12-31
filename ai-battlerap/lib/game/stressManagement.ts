/**
 * Stress Management System
 * Calculates dynamic stress levels based on battler's workload and circumstances
 */

import { createClient } from '@supabase/supabase-js';
import { getVirtualNow } from '@/lib/dev/timeManipulation';

export interface StressFactors {
  activeBattleCount: number;
  daysUntilNextBattle: number;
  recentBattleCount: number;
  financialStability: number;
  preparation: number;
}

/**
 * Calculate stress level (0-100) based on battler's workload
 *
 * Formula:
 * - Base: (active_battles - 1) × 15
 * - Time pressure: +10 per battle if next battle < 3 days
 * - Recent fatigue: battles in last 7 days × 5
 * - Badge modifiers: Multitasker -20%, Workaholic -10%, Burnout Risk +30%
 * - Prep bonus: (preparation - 5) × 2
 * - Financial pressure: if stability < 4, +(4 - stability) × 5
 */
export function calculateStress(factors: StressFactors, badges: string[]): number {
  let stress = 0;

  // Multiple active battles: (count - 1) × 15
  if (factors.activeBattleCount > 1) {
    stress += (factors.activeBattleCount - 1) * 15;
  }

  // Time pressure: +10 per battle if next battle < 3 days
  if (factors.daysUntilNextBattle < 3 && factors.activeBattleCount > 0) {
    stress += factors.activeBattleCount * 10;
  }

  // Recent battle fatigue: battles in last 7 days × 5
  stress += factors.recentBattleCount * 5;

  // Badge mitigation/amplification
  if (badges.includes('Multitasker')) {
    stress *= 0.8; // -20%
  }
  if (badges.includes('Workaholic')) {
    stress *= 0.9; // -10%
  }
  if (badges.includes('Time Management Expert')) {
    stress *= 0.7; // -30% (best multi-tasking badge)
  }
  if (badges.includes('Burnout Risk')) {
    stress *= 1.3; // +30% (penalty badge)
  }

  // Attribute mitigation: High prep attribute reduces stress
  const prepBonus = (factors.preparation - 5) * 2;
  stress -= prepBonus;

  // Financial pressure: Low financial stability increases stress
  if (factors.financialStability < 4) {
    stress += (4 - factors.financialStability) * 5;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, stress));
}

/**
 * Get stress factors for a specific battler from the database
 */
export async function getStressFactors(
  supabase: ReturnType<typeof createClient>,
  battlerId: string
): Promise<StressFactors> {
  const now = getVirtualNow();

  // Get battler attributes
  const { data: battler } = await (supabase as any)
    .from('battlers')
    .select('battler_attributes')
    .eq('id', battlerId)
    .single();

  const attrs = battler?.battler_attributes || {};
  const financialStability = attrs.personal?.financial_stability || 5;
  const preparation = attrs.personal?.preparation || 5;

  // Count active battles (accepted or locked)
  const { data: activeBattles } = await (supabase as any)
    .from('battles')
    .select('id, lock_prep_at')
    .or(`battler_a_id.eq.${battlerId},battler_b_id.eq.${battlerId}`)
    .in('status', ['accepted', 'locked']);

  const activeBattleCount = activeBattles?.length || 0;

  // Find days until next battle (closest lock_prep_at)
  let daysUntilNextBattle = 999; // Default: no pressure
  if (activeBattles && activeBattles.length > 0) {
    const nextBattleDate = activeBattles
      .map((b: any) => new Date(b.lock_prep_at))
      .sort((a: Date, b: Date) => a.getTime() - b.getTime())[0];

    const diffMs = nextBattleDate.getTime() - now.getTime();
    daysUntilNextBattle = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  // Count battles in last 7 days
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentBattles } = await supabase
    .from('battles')
    .select('id')
    .or(`battler_a_id.eq.${battlerId},battler_b_id.eq.${battlerId}`)
    .eq('status', 'completed')
    .gte('completed_at', sevenDaysAgo.toISOString());

  const recentBattleCount = recentBattles?.length || 0;

  return {
    activeBattleCount,
    daysUntilNextBattle,
    recentBattleCount,
    financialStability,
    preparation,
  };
}

/**
 * Calculate and update stress for a battler
 * Returns the new stress value
 */
export async function updateBattlerStress(
  supabase: any,
  battlerId: string
): Promise<number> {
  // Get current stress factors
  const factors = await getStressFactors(supabase, battlerId);

  // Get battler's badges
  const { data: battler } = await supabase
    .from('battlers')
    .select('style_tags')
    .eq('id', battlerId)
    .single();

  const badges = battler?.style_tags || [];

  // Calculate new stress
  const stress = calculateStress(factors, badges);

  // Update battler's stress attribute
  const { data: currentBattler } = await supabase
    .from('battlers')
    .select('battler_attributes')
    .eq('id', battlerId)
    .single();

  const attrs = currentBattler?.battler_attributes || {};

  const updatedAttrs = {
    ...attrs,
    stress,
  };

  await (supabase as any)
    .from('battlers')
    .update({ battler_attributes: updatedAttrs })
    .eq('id', battlerId);

  return stress;
}

/**
 * Apply stress decay (reduces stress over time when inactive)
 * Call this periodically (e.g., daily cron job)
 */
export async function applyStressDecay(
  supabase: ReturnType<typeof createClient>,
  battlerId: string,
  decayRate: number = 5
): Promise<number> {
  const { data: battler } = await (supabase as any)
    .from('battlers')
    .select('battler_attributes')
    .eq('id', battlerId)
    .single();

  const attrs = battler?.battler_attributes || {};
  const currentStress = attrs.stress || 0;

  // Decay stress by rate (default 5 points per day)
  const newStress = Math.max(0, currentStress - decayRate);

  const updatedAttrs = {
    ...attrs,
    stress: newStress,
  };

  await (supabase as any)
    .from('battlers')
    .update({ battler_attributes: updatedAttrs })
    .eq('id', battlerId);

  return newStress;
}
