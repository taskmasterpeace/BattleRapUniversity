/**
 * Life Event Integration with Battle Simulation
 *
 * Integrates the three-tier life event system into battle flow:
 * 1. PRE-BATTLE: Check for passive events (burnout, stress, etc.)
 * 2. DURING BATTLE: Apply active modifiers to simulation
 * 3. POST-BATTLE: Trigger performance-based events
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  evaluatePreBattleEvents,
  evaluatePostBattleEvents,
  fetchBattlerContext,
} from './lifeEventTriggers';
import {
  applyLifeEventEffects,
  getActiveModifiers,
  expireTemporaryEffects,
  calculateStressAccumulation,
  calculateStressReduction,
} from './lifeEventEffects';

// ==========================================
// PRE-BATTLE INTEGRATION
// ==========================================

/**
 * Called BEFORE battle simulation starts
 * - Evaluates passive events based on prep patterns
 * - Checks stress thresholds
 * - Applies immediate effects to attributes
 */
export async function preBattleLifeEventCheck(
  supabase: SupabaseClient,
  battleId: string,
  playerBattlerId: string
): Promise<void> {
  console.log(`[Life Events] Pre-battle check for battle ${battleId}`);

  // Fetch battler context
  const playerContext = await fetchBattlerContext(supabase, playerBattlerId);
  if (!playerContext) {
    console.error('[Life Events] Could not fetch player context');
    return;
  }

  // Calculate and apply stress accumulation
  const stressGain = await calculateStressAccumulation(
    supabase,
    playerBattlerId,
    playerContext.prepPatterns.battles_without_rest,
    playerContext.prepPatterns.recent_chokes
  );

  if (stressGain > 0) {
    await applyLifeEventEffects(
      supabase,
      playerBattlerId,
      { stress: stressGain },
      'cumulative'
    );
    console.log(`[Life Events] Applied stress accumulation: +${stressGain}`);
  }

  // Evaluate pre-battle events (passive and choice)
  await evaluatePreBattleEvents(supabase, battleId, playerContext);
}

// ==========================================
// DURING BATTLE INTEGRATION
// ==========================================

/**
 * Get modifiers to apply during battle simulation
 * Returns aggregate of all active life event effects
 */
export async function getBattleModifiers(
  supabase: SupabaseClient,
  battlerId: string
): Promise<any> {
  const modifiers = await getActiveModifiers(supabase, battlerId);

  console.log(`[Life Events] Active modifiers for battler ${battlerId}:`, modifiers);

  return modifiers;
}

/**
 * Apply life event modifiers to battle calculation
 * This is called within the simulation engine
 */
export function applyModifiersToSimulation(
  baseStats: any,
  modifiers: any,
  prepProfile: any
): any {
  const modified = { ...baseStats };

  // Apply power modifiers
  if (modifiers.writing_power_modifier) {
    modified.writingPower = (modified.writingPower || 0) * (1 + modifiers.writing_power_modifier);
  }
  if (modifiers.performance_power_modifier) {
    modified.performancePower = (modified.performancePower || 0) * (1 + modifiers.performance_power_modifier);
  }

  // Apply prep efficiency modifiers
  if (modifiers.prep_efficiency_modifier) {
    modified.prepEfficiency = (modified.prepEfficiency || 1.0) * (1 + modifiers.prep_efficiency_modifier);
  }

  // Apply prep bonuses
  if (modifiers.prep_bonus_writing && prepProfile.writingDays > 0) {
    modified.writingPower = (modified.writingPower || 0) * (1 + modifiers.prep_bonus_writing);
  }
  if (modifiers.prep_bonus_performance && prepProfile.performanceDays > 0) {
    modified.performancePower = (modified.performancePower || 0) * (1 + modifiers.prep_bonus_performance);
  }
  if (modifiers.prep_bonus_research && prepProfile.researchDays > 0) {
    modified.angleBonus = (modified.angleBonus || 0) + modifiers.prep_bonus_research;
  }
  if (modifiers.prep_bonus_all) {
    modified.writingPower = (modified.writingPower || 0) * (1 + modifiers.prep_bonus_all);
    modified.performancePower = (modified.performancePower || 0) * (1 + modifiers.prep_bonus_all);
  }
  if (modifiers.prep_penalty) {
    modified.writingPower = (modified.writingPower || 0) * (1 - modifiers.prep_penalty);
    modified.performancePower = (modified.performancePower || 0) * (1 - modifiers.prep_penalty);
  }

  // Apply choke chance modifier
  if (modifiers.choke_chance_modifier) {
    modified.chokeChance = (modified.chokeChance || 0) + modifiers.choke_chance_modifier;
  }

  // Apply angle bonus modifier
  if (modifiers.angle_bonus_modifier) {
    modified.angleBonus = (modified.angleBonus || 0) * (1 + modifiers.angle_bonus_modifier);
  }

  // Apply consistency penalty
  if (modifiers.consistency_penalty) {
    modified.consistencyPenalty = (modified.consistencyPenalty || 0) + modifiers.consistency_penalty;
  }

  // Apply confidence boost
  if (modifiers.confidence_boost) {
    modified.confidenceBoost = (modified.confidenceBoost || 0) + modifiers.confidence_boost;
  }

  // Apply adaptability modifier
  if (modifiers.adaptability_modifier) {
    modified.adaptability = (modified.adaptability || 1.0) * (1 + modifiers.adaptability_modifier);
  }
  if (modifiers.adaptability_penalty) {
    modified.adaptability = (modified.adaptability || 1.0) * (1 - modifiers.adaptability_penalty);
  }

  // Apply surprise factor
  if (modifiers.surprise_factor) {
    modified.surpriseFactor = (modified.surpriseFactor || 0) + modifiers.surprise_factor;
  }

  // Apply target on back (opponent gets bonus)
  if (modifiers.target_on_back) {
    modified.targetOnBack = (modified.targetOnBack || 0) + modifiers.target_on_back;
  }

  // Apply pressure modifier
  if (modifiers.pressure_modifier) {
    modified.pressureMultiplier = (modified.pressureMultiplier || 1.0) + modifiers.pressure_modifier;
  }

  // Apply style vulnerability
  if (modifiers.style_vulnerability) {
    modified.styleVulnerability = (modified.styleVulnerability || 0) + modifiers.style_vulnerability;
  }

  return modified;
}

/**
 * Calculate stress impact on choke probability
 * High stress dramatically increases choke chance
 */
export function calculateStressChokeImpact(stress: number): number {
  if (stress >= 80) {
    return 0.25; // +25% choke chance at very high stress
  } else if (stress >= 60) {
    return 0.15; // +15% choke chance at high stress
  } else if (stress >= 40) {
    return 0.08; // +8% choke chance at moderate stress
  } else if (stress >= 20) {
    return 0.03; // +3% choke chance at low stress
  }
  return 0;
}

// ==========================================
// POST-BATTLE INTEGRATION
// ==========================================

/**
 * Called AFTER battle simulation completes
 * - Triggers performance-based events
 * - Updates prep patterns
 * - Expires temporary effects
 * - Applies stress reduction from rest
 */
export async function postBattleLifeEventCheck(
  supabase: SupabaseClient,
  battleId: string,
  playerBattlerId: string,
  battleResult: any
): Promise<void> {
  console.log(`[Life Events] Post-battle check for battle ${battleId}`);

  // Fetch updated battler context
  const playerContext = await fetchBattlerContext(supabase, playerBattlerId);
  if (!playerContext) {
    console.error('[Life Events] Could not fetch player context');
    return;
  }

  // Evaluate post-battle events (triggered events)
  await evaluatePostBattleEvents(supabase, battleResult, playerContext);

  // Expire temporary effects
  await expireTemporaryEffects(supabase, playerBattlerId, battleId);

  // Apply stress reduction from rest days in prep
  const { data: prepBlocks } = await supabase
    .from('prep_blocks')
    .select('focus')
    .eq('battle_id', battleId)
    .eq('battler_id', playerBattlerId);

  if (prepBlocks) {
    const restDays = prepBlocks.filter((block) => block.focus === 'rest').length;
    if (restDays > 0) {
      const stressReduction = calculateStressReduction(restDays);
      await applyLifeEventEffects(
        supabase,
        playerBattlerId,
        { stress: -stressReduction },
        'cumulative'
      );
      console.log(`[Life Events] Applied stress reduction from rest: -${stressReduction}`);
    }
  }

  // Reset battles_without_rest if they had rest prep
  const hadRest = prepBlocks?.some((block) => block.focus === 'rest');
  if (hadRest) {
    await supabase
      .from('prep_pattern_tracking')
      .update({ battles_without_rest: 0 })
      .eq('battler_id', playerBattlerId);
  } else {
    // Increment battles_without_rest
    await supabase.rpc('increment_battles_without_rest', {
      p_battler_id: playerBattlerId,
    });
  }
}

// ==========================================
// CHOICE EVENT RESOLUTION
// ==========================================

/**
 * Resolve a choice-based life event when player makes a decision
 */
export async function resolveChoiceEvent(
  supabase: SupabaseClient,
  eventId: string,
  chosenOption: 'a' | 'b' | 'c'
): Promise<void> {
  // Fetch the event and template
  const { data: event, error: eventError } = await supabase
    .from('battler_life_events')
    .select(`
      *,
      template:life_event_templates!battler_life_events_template_code_fkey(*)
    `)
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    console.error('[Life Events] Error fetching event:', eventError);
    return;
  }

  // Get the chosen effects
  let chosenEffects: any;
  if (chosenOption === 'a') {
    chosenEffects = event.template.choice_a_effects;
  } else if (chosenOption === 'b') {
    chosenEffects = event.template.choice_b_effects;
  } else if (chosenOption === 'c') {
    chosenEffects = event.template.choice_c_effects;
  }

  if (!chosenEffects) {
    console.error('[Life Events] Invalid choice option');
    return;
  }

  // Apply the effects
  await applyLifeEventEffects(
    supabase,
    event.battler_id,
    chosenEffects,
    event.template.effect_duration
  );

  // Update the event as resolved
  await supabase
    .from('battler_life_events')
    .update({
      status: 'resolved',
      chosen_option: chosenOption,
      resolved_at: new Date().toISOString(),
      effects_applied: chosenEffects,
    })
    .eq('id', eventId);

  console.log(`[Life Events] Resolved choice event ${eventId} with option ${chosenOption}`);
}

// ==========================================
// DATABASE HELPER FUNCTIONS
// ==========================================

/**
 * SQL function to increment battles_without_rest
 */
export const INCREMENT_BATTLES_WITHOUT_REST_SQL = `
CREATE OR REPLACE FUNCTION increment_battles_without_rest(p_battler_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO prep_pattern_tracking (battler_id, battles_without_rest)
  VALUES (p_battler_id, 1)
  ON CONFLICT (battler_id) DO UPDATE
  SET battles_without_rest = prep_pattern_tracking.battles_without_rest + 1,
      updated_at = now();
END;
$$ LANGUAGE plpgsql;
`;

/**
 * SQL function to increment recent_chokes
 */
export const INCREMENT_RECENT_CHOKES_SQL = `
CREATE OR REPLACE FUNCTION increment_recent_chokes(p_battler_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO prep_pattern_tracking (battler_id, recent_chokes)
  VALUES (p_battler_id, 1)
  ON CONFLICT (battler_id) DO UPDATE
  SET recent_chokes = LEAST(prep_pattern_tracking.recent_chokes + 1, 3),
      updated_at = now();
END;
$$ LANGUAGE plpgsql;
`;

/**
 * SQL function to reset recent_chokes after wins
 */
export const RESET_RECENT_CHOKES_SQL = `
CREATE OR REPLACE FUNCTION reset_recent_chokes(p_battler_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE prep_pattern_tracking
  SET recent_chokes = 0,
      updated_at = now()
  WHERE battler_id = p_battler_id;
END;
$$ LANGUAGE plpgsql;
`;
