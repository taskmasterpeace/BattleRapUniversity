/**
 * Event Engine - Branching Storylines System
 *
 * Handles:
 * - Badge-driven event triggers
 * - Choice resolution and consequences
 * - Karmic debt tracking
 * - Scandal duration management
 * - Jail time career interruptions
 */

import { createClient } from '@supabase/supabase-js';
import { getVirtualNowISO } from '@/lib/dev/timeManipulation';

// ============================================================================
// Types
// ============================================================================

export interface EventDefinition {
  id: string;
  code: string;
  name: string;
  category: 'criminal' | 'financial' | 'relationship' | 'family' | 'substance' | 'mental_health' | 'career_failure' | 'betrayal' | 'secret_identity';
  trigger_conditions: TriggerConditions;
  base_trigger_probability: number;
  cooldown_battles: number;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface TriggerConditions {
  badges_required?: string[];
  or_conditions?: boolean; // If true, ANY badge triggers. If false, ALL badges required
  min_battles?: number;
  stress_threshold?: number;
  financial_stability?: number;
  reputation?: number;
  family_bond?: number;
  resilience?: number;
  min_choke_count?: number;
  has_karmic_debt?: boolean;
}

export interface EventChoice {
  id: string;
  label: string;
  immediate_effects: ImmediateEffects;
  future_consequences: FutureConsequences;
  karmic_debt_event?: string | null;
}

export interface ImmediateEffects {
  reputation?: number;
  financial_stability?: number;
  stress?: number;
  resilience?: number;
  family_bond?: number;
  media_attention?: number;
  choke_chance?: number;
  preparation?: number;
  respect?: number;
  miss_weeks?: number;
}

export interface FutureConsequences {
  redemption_arc_possible?: boolean;
  league_ban_duration_weeks?: number;
  can_return_gradually?: boolean;
  blacklist_permanent?: boolean;
  trust_issues?: boolean;
  redemption_year_possible?: boolean;
  pressure_increased?: boolean;
  choker_badge_permanent?: boolean;
  offers_decrease?: number;
  comeback_potential?: boolean;
  miss_4_weeks?: boolean;
  can_rebuild_trust?: boolean;
  reputation_recoverable?: boolean;
  leagues_require_full_upfront?: boolean;
  controversy_badge?: boolean;
  some_leagues_blacklist?: boolean;
  health_worsens?: boolean;
  respect_for_toughness?: boolean;
  leagues_hesitant?: boolean;
  health_improves?: boolean;
  health_badge_removable?: boolean;
  comeback_narrative?: boolean;
  jail_duration_years?: number;
  jail_duration_months?: number;
  career_on_hold?: boolean;
  comeback_legendary?: boolean;
  legal_drama?: boolean;
  bookings_increase?: number;
  mainstream_crossover?: boolean;
  normal_career_path?: boolean;
  polarizing_figure?: boolean;
  banned_some_leagues?: boolean;
  cult_following?: boolean;
  miss_12_weeks?: boolean;
  substance_badge_removable?: boolean;
  comeback_inspiring?: boolean;
  problem_worsens?: boolean;
  career_spiral?: boolean;
  slow_recovery?: boolean;
  reputation_stable?: boolean;
  bad_loss_likely?: boolean;
  reputation_risk?: boolean;
  debt_to_repay?: boolean;
  reputation_hit_if_not_repaid?: boolean;
  career_momentum_lost?: boolean;
  big_battle_booked?: boolean;
  rivalry_storyline?: boolean;
  drama_starter_badge?: boolean;
  leagues_wary?: boolean;
  mature_reputation?: boolean;
  family_support_strong?: boolean;
  family_issues_worsen?: boolean;
  career_unaffected?: boolean;
  burnout_risk?: boolean;
  neither_fully_addressed?: boolean;
  redemption_narrative?: boolean;
  pressure_extreme?: boolean;
  missed_opportunity?: boolean;
  veteran_respect?: boolean;
}

export interface ActiveEvent {
  id: string;
  battler_id: string;
  event_definition_id: string;
  triggered_week: number;
  expires_week?: number;
  status: 'pending_choice' | 'resolved' | 'ongoing';
  choice_selected?: string;
  choice_timestamp?: Date;
  active_effects: Record<string, any>;
}

export interface Scandal {
  id: string;
  battler_id: string;
  scandal_code: string;
  title: string;
  week_started: number;
  week_expires: number;
  intensity: number; // 1-10
  media_coverage_level: number; // 0-10
  attribute_penalties: Record<string, number>;
  reputation_impact: number;
  redemption_path?: string;
  redemption_progress: number;
}

export interface KarmicDebt {
  id: string;
  battler_id: string;
  source_event_code: string;
  consequence_event_code: string;
  trigger_probability: number;
  accumulated_weight: number;
  triggered: boolean;
  triggered_week?: number;
}

export interface JailEvent {
  id: string;
  battler_id: string;
  week_started: number;
  duration_weeks: number;
  week_released?: number;
  reason: string;
  career_impact: Record<string, any>;
  is_incarcerated: boolean;
}

// ============================================================================
// Event Trigger Evaluation
// ============================================================================

/**
 * Evaluate if any events should trigger for a battler this week
 */
export async function evaluateEventTriggers(
  battlerId: string,
  currentWeek: number,
  battlerData: {
    badges: string[];
    stress: number;
    financial_stability: number;
    reputation: number;
    family_bond: number;
    resilience: number;
    battle_count: number;
    recent_chokes: number;
  },
  supabase: ReturnType<typeof createClient>
): Promise<EventDefinition | null> {
  // Get all event definitions
  const { data: eventDefinitions, error } = await supabase
    .from('event_definitions')
    .select('*');

  if (error || !eventDefinitions) {
    console.error('Error fetching event definitions:', error);
    return null;
  }

  // Get battler's event history (for cooldowns)
  const { data: eventHistory } = await supabase
    .from('event_history')
    .select('event_definition_code, triggered_week')
    .eq('battler_id', battlerId)
    .order('triggered_week', { ascending: false });

  // Check each event definition
  for (const eventDef of eventDefinitions) {
    // Check cooldown
    if (eventHistory) {
      const lastTrigger = eventHistory.find((e: any) => e.event_definition_code === (eventDef as any).code);
      if (lastTrigger && (currentWeek - (lastTrigger as any).triggered_week) < (eventDef as any).cooldown_battles) {
        continue; // Still in cooldown
      }
    }

    // Check trigger conditions
    if (checkTriggerConditions((eventDef as any).trigger_conditions, battlerData)) {
      // Roll probability
      if (Math.random() < (eventDef as any).base_trigger_probability) {
        return eventDef as EventDefinition;
      }
    }
  }

  return null;
}

/**
 * Check if battler meets event trigger conditions
 */
function checkTriggerConditions(
  conditions: TriggerConditions,
  battlerData: {
    badges: string[];
    stress: number;
    financial_stability: number;
    reputation: number;
    family_bond: number;
    resilience: number;
    battle_count: number;
    recent_chokes: number;
  }
): boolean {
  // Check badge requirements
  if (conditions.badges_required && conditions.badges_required.length > 0) {
    if (conditions.or_conditions) {
      // ANY badge matches
      const hasAnyBadge = conditions.badges_required.some(badge => battlerData.badges.includes(badge));
      if (!hasAnyBadge) return false;
    } else {
      // ALL badges required
      const hasAllBadges = conditions.badges_required.every(badge => battlerData.badges.includes(badge));
      if (!hasAllBadges) return false;
    }
  }

  // Check numeric thresholds
  if (conditions.min_battles && battlerData.battle_count < conditions.min_battles) return false;
  if (conditions.stress_threshold && battlerData.stress < conditions.stress_threshold) return false;
  if (conditions.financial_stability !== undefined && battlerData.financial_stability > conditions.financial_stability) return false;
  if (conditions.reputation !== undefined && battlerData.reputation < conditions.reputation) return false;
  if (conditions.family_bond !== undefined && battlerData.family_bond < conditions.family_bond) return false;
  if (conditions.resilience !== undefined && battlerData.resilience > conditions.resilience) return false;
  if (conditions.min_choke_count && battlerData.recent_chokes < conditions.min_choke_count) return false;

  return true;
}

// ============================================================================
// Event Creation and Resolution
// ============================================================================

/**
 * Trigger an event for a battler
 */
export async function triggerEvent(
  battlerId: string,
  eventDefinition: EventDefinition,
  currentWeek: number,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  const { data, error } = await (supabase as any)
    .from('active_events')
    .insert({
      battler_id: battlerId,
      event_definition_id: eventDefinition.id,
      triggered_week: currentWeek,
      status: 'pending_choice',
      active_effects: {}
    })
    .select()
    .single();

  if (error) {
    console.error('Error triggering event:', error);
    throw error;
  }

  // Also add to event history
  await (supabase as any).from('event_history').insert({
    battler_id: battlerId,
    event_definition_code: eventDefinition.code,
    triggered_week: currentWeek,
    media_coverage_level: 5
  });

  return data.id;
}

/**
 * Resolve an event choice
 */
export async function resolveEventChoice(
  activeEventId: string,
  choiceId: string,
  currentWeek: number,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  // Get the active event and its definition
  const { data: activeEventRaw, error: fetchError } = await (supabase as any)
    .from('active_events')
    .select('*, event_definitions(*)')
    .eq('id', activeEventId)
    .single();

  if (fetchError || !activeEventRaw) {
    console.error('Error fetching active event:', fetchError);
    return;
  }

  const activeEvent = activeEventRaw as any;
  const eventDef: EventDefinition = activeEvent.event_definitions as any;
  const choice = eventDef.choices.find(c => c.id === choiceId);

  if (!choice) {
    console.error('Choice not found:', choiceId);
    return;
  }

  // Apply immediate effects
  await applyImmediateEffects(activeEvent.battler_id, choice.immediate_effects, supabase);

  // Create karmic debt if specified
  if (choice.karmic_debt_event) {
    await (supabase as any).from('karmic_debt').insert({
      battler_id: activeEvent.battler_id,
      source_event_code: eventDef.code,
      consequence_event_code: choice.karmic_debt_event,
      trigger_probability: 0.15,
      accumulated_weight: 1
    });
  }

  // Create scandal if appropriate
  if (eventDef.category === 'criminal' || eventDef.category === 'financial' || eventDef.category === 'substance') {
    await createScandal(
      activeEvent.battler_id,
      eventDef.code,
      eventDef.title,
      currentWeek,
      7, // intensity
      choice.immediate_effects,
      supabase
    );
  }

  // Handle jail time
  if (choice.future_consequences.jail_duration_years) {
    await createJailEvent(
      activeEvent.battler_id,
      currentWeek,
      choice.future_consequences.jail_duration_years * 52,
      eventDef.title,
      supabase
    );
  } else if (choice.future_consequences.jail_duration_months) {
    await createJailEvent(
      activeEvent.battler_id,
      currentWeek,
      choice.future_consequences.jail_duration_months * 4,
      eventDef.title,
      supabase
    );
  }

  // Mark event as resolved (uses virtual time in dev mode)
  await (supabase as any)
    .from('active_events')
    .update({
      status: 'resolved',
      choice_selected: choiceId,
      choice_timestamp: getVirtualNowISO()
    })
    .eq('id', activeEventId);

  // Update event history
  await (supabase as any)
    .from('event_history')
    .update({
      choice_made: choiceId,
      resolved_week: currentWeek,
      outcome: JSON.stringify(choice.immediate_effects)
    })
    .eq('battler_id', activeEvent.battler_id)
    .eq('event_definition_code', eventDef.code)
    .eq('triggered_week', activeEvent.triggered_week);
}

/**
 * Apply immediate effects to battler attributes
 */
async function applyImmediateEffects(
  battlerId: string,
  effects: ImmediateEffects,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  // Get current attributes
  const { data: battler } = await (supabase as any)
    .from('battlers')
    .select('attributes')
    .eq('id', battlerId)
    .single();

  if (!battler) return;

  const attributes = battler.attributes as any;

  // Apply personal attribute changes
  if (effects.reputation !== undefined) {
    attributes.personal = attributes.personal || {};
    attributes.personal.reputation = Math.max(1, Math.min(10, (attributes.personal.reputation || 5) + effects.reputation));
  }

  if (effects.financial_stability !== undefined) {
    attributes.personal = attributes.personal || {};
    attributes.personal.financial_stability = Math.max(1, Math.min(10, (attributes.personal.financial_stability || 5) + effects.financial_stability));
  }

  if (effects.family_bond !== undefined) {
    attributes.personal = attributes.personal || {};
    attributes.personal.family_bond = Math.max(1, Math.min(10, (attributes.personal.family_bond || 5) + effects.family_bond));
  }

  if (effects.preparation !== undefined) {
    attributes.personal = attributes.personal || {};
    attributes.personal.preparation = Math.max(1, Math.min(10, (attributes.personal.preparation || 5) + effects.preparation));
  }

  if (effects.resilience !== undefined) {
    attributes.resilience = Math.max(1, Math.min(10, (attributes.resilience || 5) + effects.resilience));
  }

  // Update battler
  await (supabase as any)
    .from('battlers')
    .update({ attributes })
    .eq('id', battlerId);
}

/**
 * Create a scandal record
 */
async function createScandal(
  battlerId: string,
  scandalCode: string,
  title: string,
  weekStarted: number,
  intensity: number,
  effects: ImmediateEffects,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  await (supabase as any).from('scandals').insert({
    battler_id: battlerId,
    scandal_code: scandalCode,
    title,
    week_started: weekStarted,
    week_expires: weekStarted + 4, // Active for 4 weeks
    intensity,
    media_coverage_level: effects.media_attention ? Math.min(10, Math.floor(effects.media_attention / 10)) : 5,
    attribute_penalties: effects,
    reputation_impact: effects.reputation || -2,
    redemption_progress: 0
  });
}

/**
 * Create a jail time event
 */
async function createJailEvent(
  battlerId: string,
  weekStarted: number,
  durationWeeks: number,
  reason: string,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  await (supabase as any).from('jail_events').insert({
    battler_id: battlerId,
    week_started: weekStarted,
    duration_weeks: durationWeeks,
    reason,
    career_impact: { career_on_hold: true },
    is_incarcerated: true
  });

  // Mark battler as away from culture
  await (supabase as any)
    .from('battlers')
    .update({
      away_from_culture: true,
      away_reason: 'incarcerated'
    })
    .eq('id', battlerId);
}

// ============================================================================
// Scandal Management
// ============================================================================

/**
 * Expire scandals that have passed their duration
 */
export async function expireScandals(
  currentWeek: number,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  // Scandals expire after week_expires
  await supabase
    .from('scandals')
    .delete()
    .lt('week_expires', currentWeek);
}

/**
 * Calculate current scandal intensity (decays over time)
 */
export function calculateScandalIntensity(scandal: Scandal, currentWeek: number): number {
  const weeksActive = currentWeek - scandal.week_started;
  const baseIntensity = scandal.intensity;

  // Week 0-1: Full intensity
  if (weeksActive <= 1) return baseIntensity;

  // Week 2: 80% intensity
  if (weeksActive === 2) return Math.floor(baseIntensity * 0.8);

  // Week 3: 60% intensity
  if (weeksActive === 3) return Math.floor(baseIntensity * 0.6);

  // Week 4: 40% intensity
  if (weeksActive === 4) return Math.floor(baseIntensity * 0.4);

  // Week 5+: Expired
  return 0;
}

// ============================================================================
// Karmic Debt Checks
// ============================================================================

/**
 * Check if any karmic debt consequences should trigger
 */
export async function checkKarmicDebtTriggers(
  battlerId: string,
  currentWeek: number,
  supabase: ReturnType<typeof createClient>
): Promise<string | null> {
  const { data: karmicDebts } = await (supabase as any)
    .from('karmic_debt')
    .select('*')
    .eq('battler_id', battlerId)
    .eq('triggered', false);

  if (!karmicDebts || karmicDebts.length === 0) return null;

  for (const debt of karmicDebts) {
    // Roll probability
    const roll = Math.random();
    if (roll < debt.trigger_probability * debt.accumulated_weight) {
      // Trigger consequence event
      const { data: consequenceEvent } = await supabase
        .from('event_definitions')
        .select('*')
        .eq('code', debt.consequence_event_code)
        .single();

      if (consequenceEvent) {
        // Mark karma as triggered
        await (supabase as any)
          .from('karmic_debt')
          .update({ triggered: true, triggered_week: currentWeek })
          .eq('id', debt.id);

        return debt.consequence_event_code;
      }
    } else {
      // Increase weight for next time
      await (supabase as any)
        .from('karmic_debt')
        .update({ accumulated_weight: debt.accumulated_weight + 1 })
        .eq('id', debt.id);
    }
  }

  return null;
}
