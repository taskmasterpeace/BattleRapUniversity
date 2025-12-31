/**
 * Life Event Effects Application System
 *
 * Handles applying effects from life events:
 * - IMMEDIATE: Permanent attribute changes
 * - NEXT_BATTLE: Temporary buffs/debuffs until next battle
 * - PREP_CYCLE: Effects for this prep window only
 * - CUMULATIVE: Ongoing effects like stress buildup
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ==========================================
// TYPES
// ==========================================

interface LifeEventEffects {
  // Attribute changes (permanent)
  reputation?: number;
  financial_stability?: number;
  family_bond?: number;
  resilience?: number;
  lyricism?: number;
  wordplay?: number;
  creativity?: number;
  flow?: number;
  stage_presence?: number;
  crowd_control?: number;
  delivery?: number;
  preparation?: number;

  // Public knowledge and stress (cumulative)
  public_knowledge?: number;
  stress?: number;

  // Modifiers (temporary)
  writing_power_modifier?: number;
  performance_power_modifier?: number;
  prep_efficiency_modifier?: number;
  choke_chance_modifier?: number;
  angle_bonus_modifier?: number;
  consistency_penalty?: number;
  confidence_boost?: number;
  adaptability_modifier?: number;
  adaptability_penalty?: number;

  // Prep bonuses/penalties (prep cycle)
  prep_bonus_writing?: number;
  prep_bonus_performance?: number;
  prep_bonus_research?: number;
  prep_bonus_all?: number;
  prep_penalty?: number;

  // Special flags
  all_attributes_bonus?: number; // Bonus to all writing/performance attributes
  surprise_factor?: number;
  target_on_back?: number;
  respect_modifier?: number;
  controversy_risk?: number;
  independence_modifier?: number;
  loyalty_penalty?: number;
  loyalty_bonus?: number;
  negotiating_power?: number;
  pressure_modifier?: number;
  stigma_risk?: number;
  polarizing_figure?: number;
  league_interest?: number;
  main_event_status?: boolean;
  commercial_appeal?: number;
  legend_status?: boolean;
  choker_stigma?: boolean;
  style_vulnerability?: number;
  hiatus_risk?: number;
}

// ==========================================
// APPLY EFFECTS
// ==========================================

/**
 * Apply life event effects to battler
 */
export async function applyLifeEventEffects(
  supabase: SupabaseClient,
  battlerId: string,
  effects: LifeEventEffects,
  effectDuration: string = 'immediate'
): Promise<void> {
  console.log(`[Life Events] Applying effects to battler ${battlerId}:`, effects);

  // Fetch current attributes
  const { data: attributes, error: fetchError } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', battlerId)
    .single();

  if (fetchError || !attributes) {
    console.error('[Life Events] Error fetching attributes:', fetchError);
    return;
  }

  const updates: any = {};

  // ==========================================
  // PERMANENT ATTRIBUTE CHANGES
  // ==========================================

  // Writing attributes
  if (effects.lyricism !== undefined) {
    const current = attributes.writing.lyricism || 5;
    updates.writing = {
      ...(updates.writing || attributes.writing),
      lyricism: clamp(current + effects.lyricism, 1, 10),
    };
  }
  if (effects.wordplay !== undefined) {
    const current = attributes.writing.wordplay || 5;
    updates.writing = {
      ...(updates.writing || attributes.writing),
      wordplay: clamp(current + effects.wordplay, 1, 10),
    };
  }
  if (effects.creativity !== undefined) {
    const current = attributes.writing.creativity || 5;
    updates.writing = {
      ...(updates.writing || attributes.writing),
      creativity: clamp(current + effects.creativity, 1, 10),
    };
  }
  if (effects.flow !== undefined) {
    const current = attributes.writing.flow || 5;
    updates.writing = {
      ...(updates.writing || attributes.writing),
      flow: clamp(current + effects.flow, 1, 10),
    };
  }

  // Performance attributes
  if (effects.stage_presence !== undefined) {
    const current = attributes.performance.stage_presence || 5;
    updates.performance = {
      ...(updates.performance || attributes.performance),
      stage_presence: clamp(current + effects.stage_presence, 1, 10),
    };
  }
  if (effects.crowd_control !== undefined) {
    const current = attributes.performance.crowd_control || 5;
    updates.performance = {
      ...(updates.performance || attributes.performance),
      crowd_control: clamp(current + effects.crowd_control, 1, 10),
    };
  }
  if (effects.delivery !== undefined) {
    const current = attributes.performance.delivery || 5;
    updates.performance = {
      ...(updates.performance || attributes.performance),
      delivery: clamp(current + effects.delivery, 1, 10),
    };
  }

  // Personal attributes
  if (effects.reputation !== undefined) {
    const current = attributes.personal.reputation || 5;
    updates.personal = {
      ...(updates.personal || attributes.personal),
      reputation: clamp(current + effects.reputation, 1, 10),
    };
  }
  if (effects.financial_stability !== undefined) {
    const current = attributes.personal.financial_stability || 5;
    updates.personal = {
      ...(updates.personal || attributes.personal),
      financial_stability: clamp(current + effects.financial_stability, 1, 10),
    };
  }
  if (effects.family_bond !== undefined) {
    const current = attributes.personal.family_bond || 5;
    updates.personal = {
      ...(updates.personal || attributes.personal),
      family_bond: clamp(current + effects.family_bond, 1, 10),
    };
  }
  if (effects.preparation !== undefined) {
    const current = attributes.personal.preparation || 5;
    updates.personal = {
      ...(updates.personal || attributes.personal),
      preparation: clamp(current + effects.preparation, 1, 10),
    };
  }

  // Resilience
  if (effects.resilience !== undefined) {
    updates.resilience = clamp(attributes.resilience + effects.resilience, 1, 10);
  }

  // Public knowledge
  if (effects.public_knowledge !== undefined) {
    updates.public_knowledge = clamp(
      attributes.public_knowledge + effects.public_knowledge,
      0,
      100
    );
  }

  // Stress (cumulative)
  if (effects.stress !== undefined) {
    updates.stress = clamp(
      (attributes.stress || 0) + effects.stress,
      0,
      100
    );
  }

  // All attributes bonus (special effect)
  if (effects.all_attributes_bonus !== undefined) {
    const bonus = effects.all_attributes_bonus;

    // Apply to all writing attributes
    updates.writing = {
      lyricism: clamp((attributes.writing.lyricism || 5) + bonus, 1, 10),
      wordplay: clamp((attributes.writing.wordplay || 5) + bonus, 1, 10),
      creativity: clamp((attributes.writing.creativity || 5) + bonus, 1, 10),
      flow: clamp((attributes.writing.flow || 5) + bonus, 1, 10),
    };

    // Apply to all performance attributes
    updates.performance = {
      stage_presence: clamp((attributes.performance.stage_presence || 5) + bonus, 1, 10),
      crowd_control: clamp((attributes.performance.crowd_control || 5) + bonus, 1, 10),
      delivery: clamp((attributes.performance.delivery || 5) + bonus, 1, 10),
    };
  }

  // Apply updates to database
  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from('battler_attributes')
      .update(updates)
      .eq('battler_id', battlerId);

    if (updateError) {
      console.error('[Life Events] Error updating attributes:', updateError);
    } else {
      console.log(`[Life Events] Applied attribute changes to battler ${battlerId}`);
    }
  }

  // ==========================================
  // TEMPORARY MODIFIERS
  // ==========================================
  // Modifiers are stored in the life event record and applied during simulation
  // They don't modify base attributes but affect calculations

  console.log(`[Life Events] Effects applied successfully (duration: ${effectDuration})`);
}

/**
 * Get active life event modifiers for a battler
 * Returns all active temporary effects that should modify battle calculations
 */
export async function getActiveModifiers(
  supabase: SupabaseClient,
  battlerId: string
): Promise<LifeEventEffects> {
  const { data: activeEvents, error } = await supabase
    .from('battler_life_events')
    .select(`
      effects_applied,
      template:life_event_templates!battler_life_events_template_code_fkey(effect_duration)
    `)
    .eq('battler_id', battlerId)
    .eq('active', true)
    .eq('status', 'resolved');

  if (error || !activeEvents || activeEvents.length === 0) {
    return {};
  }

  // Aggregate all active modifiers
  const modifiers: LifeEventEffects = {};

  for (const event of activeEvents) {
    const effects = event.effects_applied as LifeEventEffects;

    // Only apply modifiers (not permanent attribute changes)
    if (effects.writing_power_modifier !== undefined) {
      modifiers.writing_power_modifier = (modifiers.writing_power_modifier || 0) + effects.writing_power_modifier;
    }
    if (effects.performance_power_modifier !== undefined) {
      modifiers.performance_power_modifier = (modifiers.performance_power_modifier || 0) + effects.performance_power_modifier;
    }
    if (effects.prep_efficiency_modifier !== undefined) {
      modifiers.prep_efficiency_modifier = (modifiers.prep_efficiency_modifier || 0) + effects.prep_efficiency_modifier;
    }
    if (effects.choke_chance_modifier !== undefined) {
      modifiers.choke_chance_modifier = (modifiers.choke_chance_modifier || 0) + effects.choke_chance_modifier;
    }
    if (effects.angle_bonus_modifier !== undefined) {
      modifiers.angle_bonus_modifier = (modifiers.angle_bonus_modifier || 0) + effects.angle_bonus_modifier;
    }
    if (effects.consistency_penalty !== undefined) {
      modifiers.consistency_penalty = (modifiers.consistency_penalty || 0) + effects.consistency_penalty;
    }
    if (effects.confidence_boost !== undefined) {
      modifiers.confidence_boost = (modifiers.confidence_boost || 0) + effects.confidence_boost;
    }
    if (effects.adaptability_modifier !== undefined) {
      modifiers.adaptability_modifier = (modifiers.adaptability_modifier || 0) + effects.adaptability_modifier;
    }
    if (effects.adaptability_penalty !== undefined) {
      modifiers.adaptability_penalty = (modifiers.adaptability_penalty || 0) + effects.adaptability_penalty;
    }
    if (effects.surprise_factor !== undefined) {
      modifiers.surprise_factor = (modifiers.surprise_factor || 0) + effects.surprise_factor;
    }
    if (effects.target_on_back !== undefined) {
      modifiers.target_on_back = (modifiers.target_on_back || 0) + effects.target_on_back;
    }
    if (effects.respect_modifier !== undefined) {
      modifiers.respect_modifier = (modifiers.respect_modifier || 0) + effects.respect_modifier;
    }
    if (effects.pressure_modifier !== undefined) {
      modifiers.pressure_modifier = (modifiers.pressure_modifier || 0) + effects.pressure_modifier;
    }
    if (effects.style_vulnerability !== undefined) {
      modifiers.style_vulnerability = (modifiers.style_vulnerability || 0) + effects.style_vulnerability;
    }

    // Prep bonuses
    if (effects.prep_bonus_writing !== undefined) {
      modifiers.prep_bonus_writing = (modifiers.prep_bonus_writing || 0) + effects.prep_bonus_writing;
    }
    if (effects.prep_bonus_performance !== undefined) {
      modifiers.prep_bonus_performance = (modifiers.prep_bonus_performance || 0) + effects.prep_bonus_performance;
    }
    if (effects.prep_bonus_research !== undefined) {
      modifiers.prep_bonus_research = (modifiers.prep_bonus_research || 0) + effects.prep_bonus_research;
    }
    if (effects.prep_bonus_all !== undefined) {
      modifiers.prep_bonus_all = (modifiers.prep_bonus_all || 0) + effects.prep_bonus_all;
    }
    if (effects.prep_penalty !== undefined) {
      modifiers.prep_penalty = (modifiers.prep_penalty || 0) + effects.prep_penalty;
    }
  }

  return modifiers;
}

/**
 * Expire temporary life event effects after a battle
 */
export async function expireTemporaryEffects(
  supabase: SupabaseClient,
  battlerId: string,
  battleId: string
): Promise<void> {
  // Expire all "next_battle" effects
  await supabase
    .from('battler_life_events')
    .update({
      active: false,
      expires_at: new Date().toISOString(),
    })
    .eq('battler_id', battlerId)
    .eq('active', true)
    .in('effect_duration', ['next_battle']);

  console.log(`[Life Events] Expired temporary effects for battler ${battlerId}`);
}

/**
 * Expire prep cycle effects when prep locks
 */
export async function expirePrepCycleEffects(
  supabase: SupabaseClient,
  battlerId: string
): Promise<void> {
  await supabase
    .from('battler_life_events')
    .update({
      active: false,
      expires_at: new Date().toISOString(),
    })
    .eq('battler_id', battlerId)
    .eq('active', true)
    .in('effect_duration', ['prep_cycle']);

  console.log(`[Life Events] Expired prep cycle effects for battler ${battlerId}`);
}

/**
 * Calculate stress accumulation based on behavior
 */
export async function calculateStressAccumulation(
  supabase: SupabaseClient,
  battlerId: string,
  battlesWithoutRest: number,
  recentChokes: number
): Promise<number> {
  let stressGain = 0;

  // Stress from back-to-back battles without rest
  if (battlesWithoutRest >= 3) {
    stressGain += 15; // High stress
  } else if (battlesWithoutRest >= 2) {
    stressGain += 8; // Moderate stress
  }

  // Stress from recent chokes
  if (recentChokes >= 2) {
    stressGain += 20; // Choke trauma
  } else if (recentChokes === 1) {
    stressGain += 10; // Choke anxiety
  }

  return stressGain;
}

/**
 * Calculate stress reduction from rest prep
 */
export function calculateStressReduction(restDays: number): number {
  // Each rest day reduces stress
  return restDays * 5; // 5 stress reduction per rest day
}

/**
 * Determine battler type for choice events
 * Returns 'writer', 'performer', or 'balanced'
 */
export function determineBattlerType(attributes: any): 'writer' | 'performer' | 'balanced' {
  const writingAvg = (
    (attributes.writing.lyricism || 5) +
    (attributes.writing.wordplay || 5) +
    (attributes.writing.creativity || 5) +
    (attributes.writing.flow || 5)
  ) / 4;

  const performanceAvg = (
    (attributes.performance.stage_presence || 5) +
    (attributes.performance.crowd_control || 5) +
    (attributes.performance.delivery || 5)
  ) / 3;

  const diff = writingAvg - performanceAvg;

  if (diff > 1.5) {
    return 'writer'; // Writing-focused battler
  } else if (diff < -1.5) {
    return 'performer'; // Performance-focused battler
  } else {
    return 'balanced'; // Balanced battler
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
