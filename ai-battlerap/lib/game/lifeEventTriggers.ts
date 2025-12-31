/**
 * Three-Tier Life Event Trigger Evaluation System
 *
 * Handles evaluation of trigger conditions for:
 * - PASSIVE events (behavior thresholds)
 * - CHOICE events (player decision points)
 * - TRIGGERED events (performance-based)
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ==========================================
// TYPES
// ==========================================

interface BattleContext {
  battleId: string;
  winnerId: string;
  playerBattlerId: string;
  aiBattlerId: string;
  result: string; // "3-0", "2-1", etc.
  playerRoundsWon: number;
  aiRoundsWon: number;
  playerChoked: boolean;
  aiChoked: boolean;
  playerAvgCrowdReaction: number;
  aiAvgCrowdReaction: number;
  playerPeakScore: number;
  playerConsistencyScore: number;
}

interface BattlerContext {
  battlerId: string;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
  attributes: any;
  publicKnowledge: number;
  stress: number;
  prepPatterns: PrepPatternContext;
}

interface PrepPatternContext {
  consecutive_writing_days: number;
  consecutive_performance_days: number;
  consecutive_research_days: number;
  consecutive_rest_days: number;
  consecutive_life_days: number;
  total_writing_days: number;
  total_performance_days: number;
  total_research_days: number;
  total_rest_days: number;
  total_life_days: number;
  battles_without_rest: number;
  recent_chokes: number;
  last_prep_focus: string;
}

interface LifeEventTemplate {
  id: string;
  code: string;
  title: string;
  description: string;
  event_type: 'passive' | 'choice' | 'triggered';
  trigger_type: string;
  trigger_condition: any;
  trigger_probability: number;
  passive_effects?: any;
  choice_a_text?: string;
  choice_a_effects?: any;
  choice_b_text?: string;
  choice_b_effects?: any;
  choice_c_text?: string;
  choice_c_effects?: any;
  winning_choice_for_writers?: string;
  winning_choice_for_performers?: string;
  winning_choice_for_balanced?: string;
  effect_duration: string;
  severity: string;
  can_trigger_multiple_times: boolean;
  cooldown_battles: number;
}

// ==========================================
// PRE-BATTLE TRIGGER EVALUATION
// ==========================================

/**
 * Check for passive events before battle starts
 * These fire based on prep patterns and stress thresholds
 */
export async function evaluatePreBattleEvents(
  supabase: SupabaseClient,
  battleId: string,
  playerContext: BattlerContext
): Promise<void> {
  console.log(`[Life Events] Evaluating pre-battle events for battle ${battleId}`);

  // Fetch all passive and choice event templates
  const { data: templates, error } = await supabase
    .from('life_event_templates')
    .select('*')
    .in('event_type', ['passive', 'choice'])
    .in('trigger_type', ['prep_pattern', 'stress_threshold', 'random', 'attribute']);

  if (error || !templates) {
    console.error('[Life Events] Error fetching templates:', error);
    return;
  }

  // Check each template for matching conditions
  for (const template of templates) {
    // Check cooldown
    if (!(await canTriggerEvent(supabase, template, playerContext.battlerId))) {
      continue;
    }

    // Evaluate trigger condition
    if (evaluateTriggerCondition(template.trigger_condition, template.trigger_type, playerContext)) {
      // Check probability
      if (Math.random() <= template.trigger_probability) {
        await triggerLifeEvent(supabase, template, playerContext.battlerId, battleId);
      }
    }
  }
}

// ==========================================
// POST-BATTLE TRIGGER EVALUATION
// ==========================================

/**
 * Check for triggered events after battle completes
 * These fire based on battle performance and outcomes
 */
export async function evaluatePostBattleEvents(
  supabase: SupabaseClient,
  battleContext: BattleContext,
  playerContext: BattlerContext
): Promise<void> {
  console.log(`[Life Events] Evaluating post-battle events for battle ${battleContext.battleId}`);

  // Fetch all triggered event templates
  const { data: templates, error } = await supabase
    .from('life_event_templates')
    .select('*')
    .eq('event_type', 'triggered')
    .eq('trigger_type', 'battle_result');

  if (error || !templates) {
    console.error('[Life Events] Error fetching templates:', error);
    return;
  }

  // Update recent chokes in prep patterns
  if (battleContext.playerChoked) {
    await updateRecentChokes(supabase, playerContext.battlerId);
  }

  // Check each template for matching conditions
  for (const template of templates) {
    // Check cooldown
    if (!(await canTriggerEvent(supabase, template, playerContext.battlerId))) {
      continue;
    }

    // Evaluate trigger condition with battle context
    if (evaluateBattleResultCondition(
      template.trigger_condition,
      battleContext,
      playerContext
    )) {
      // Check probability
      if (Math.random() <= template.trigger_probability) {
        await triggerLifeEvent(
          supabase,
          template,
          playerContext.battlerId,
          battleContext.battleId,
          {
            battle_result: battleContext.result,
            outcome: battleContext.winnerId === playerContext.battlerId ? 'win' : 'loss',
            choked: battleContext.playerChoked,
            crowd_reaction: battleContext.playerAvgCrowdReaction,
            peak_score: battleContext.playerPeakScore,
            consistency: battleContext.playerConsistencyScore,
          }
        );
      }
    }
  }
}

// ==========================================
// TRIGGER CONDITION EVALUATION
// ==========================================

/**
 * Evaluate if a trigger condition matches the current context
 */
function evaluateTriggerCondition(
  condition: any,
  triggerType: string,
  context: BattlerContext
): boolean {
  if (!condition) return false;

  // Random events - just check probability in condition
  if (triggerType === 'random') {
    return true; // Probability is checked separately
  }

  // Prep pattern events
  if (triggerType === 'prep_pattern') {
    return evaluatePrepPatternCondition(condition, context.prepPatterns);
  }

  // Stress threshold events
  if (triggerType === 'stress_threshold') {
    return evaluateStressCondition(condition, context.stress);
  }

  // Attribute threshold events
  if (triggerType === 'attribute') {
    return evaluateAttributeCondition(condition, context);
  }

  return false;
}

/**
 * Evaluate prep pattern conditions
 */
function evaluatePrepPatternCondition(
  condition: any,
  prepPatterns: PrepPatternContext
): boolean {
  // Check consecutive day thresholds
  if (condition.consecutive_writing_days &&
      prepPatterns.consecutive_writing_days < condition.consecutive_writing_days) {
    return false;
  }
  if (condition.consecutive_performance_days &&
      prepPatterns.consecutive_performance_days < condition.consecutive_performance_days) {
    return false;
  }
  if (condition.consecutive_research_days &&
      prepPatterns.consecutive_research_days < condition.consecutive_research_days) {
    return false;
  }
  if (condition.consecutive_rest_days &&
      prepPatterns.consecutive_rest_days < condition.consecutive_rest_days) {
    return false;
  }

  // Check battles without rest
  if (condition.battles_without_rest &&
      prepPatterns.battles_without_rest < condition.battles_without_rest) {
    return false;
  }

  // Check total prep day minimums
  if (condition.total_writing_days_min &&
      prepPatterns.total_writing_days < condition.total_writing_days_min) {
    return false;
  }
  if (condition.total_performance_days_min &&
      prepPatterns.total_performance_days < condition.total_performance_days_min) {
    return false;
  }

  // Check prep imbalance ratio
  if (condition.prep_imbalance_ratio) {
    const totalPrep = prepPatterns.total_writing_days +
                      prepPatterns.total_performance_days +
                      prepPatterns.total_research_days;
    if (totalPrep > 0) {
      const maxRatio = Math.max(
        prepPatterns.total_writing_days / totalPrep,
        prepPatterns.total_performance_days / totalPrep,
        prepPatterns.total_research_days / totalPrep
      );
      if (maxRatio < condition.prep_imbalance_ratio) {
        return false;
      }
    }
  }

  // Check recent chokes
  if (condition.recent_chokes &&
      prepPatterns.recent_chokes < condition.recent_chokes) {
    return false;
  }

  return true;
}

/**
 * Evaluate stress threshold conditions
 */
function evaluateStressCondition(
  condition: any,
  stress: number
): boolean {
  if (condition.stress_min && stress < condition.stress_min) {
    return false;
  }
  if (condition.stress_max && stress > condition.stress_max) {
    return false;
  }
  return true;
}

/**
 * Evaluate attribute threshold conditions
 */
function evaluateAttributeCondition(
  condition: any,
  context: BattlerContext
): boolean {
  // Check reputation
  if (condition.reputation_min &&
      (context.attributes?.personal?.reputation || 5) < condition.reputation_min) {
    return false;
  }
  if (condition.reputation_max &&
      (context.attributes?.personal?.reputation || 5) > condition.reputation_max) {
    return false;
  }

  // Check financial stability
  if (condition.financial_stability_min &&
      (context.attributes?.personal?.financial_stability || 5) < condition.financial_stability_min) {
    return false;
  }
  if (condition.financial_stability_max &&
      (context.attributes?.personal?.financial_stability || 5) > condition.financial_stability_max) {
    return false;
  }

  // Check public knowledge
  if (condition.public_knowledge_min &&
      context.publicKnowledge < condition.public_knowledge_min) {
    return false;
  }
  if (condition.public_knowledge_max &&
      context.publicKnowledge > condition.public_knowledge_max) {
    return false;
  }

  return true;
}

/**
 * Evaluate battle result conditions
 */
function evaluateBattleResultCondition(
  condition: any,
  battleContext: BattleContext,
  playerContext: BattlerContext
): boolean {
  const isWin = battleContext.winnerId === playerContext.battlerId;
  const outcome = isWin ? 'win' : 'loss';

  // Check specific result (e.g., "3-0")
  if (condition.result && condition.result !== battleContext.result) {
    return false;
  }

  // Check outcome (win/loss)
  if (condition.outcome && condition.outcome !== outcome) {
    return false;
  }

  // Check win margin
  if (condition.margin === 'dominant' && battleContext.result !== '3-0') {
    return false;
  }
  if (condition.margin === 'close' && !['2-1', '1-2'].includes(battleContext.result)) {
    return false;
  }

  // Check choke flag
  if (condition.choked === true && !battleContext.playerChoked) {
    return false;
  }

  // Check win streak
  if (condition.win_streak && isWin) {
    const newStreak = playerContext.streak > 0 ? playerContext.streak + 1 : 1;
    if (newStreak < condition.win_streak) {
      return false;
    }
  }
  if (condition.win_streak_min && isWin) {
    const newStreak = playerContext.streak > 0 ? playerContext.streak + 1 : 1;
    if (newStreak < condition.win_streak_min) {
      return false;
    }
  }

  // Check loss streak
  if (condition.loss_streak && !isWin) {
    const newLossStreak = playerContext.streak < 0 ? Math.abs(playerContext.streak) + 1 : 1;
    if (newLossStreak < condition.loss_streak) {
      return false;
    }
  }
  if (condition.loss_streak_before && isWin) {
    // Check if they had a loss streak before this win
    if (playerContext.streak >= 0) {
      return false;
    }
    if (Math.abs(playerContext.streak) < condition.loss_streak_before) {
      return false;
    }
  }

  // Check crowd reaction
  if (condition.avg_crowd_reaction_min &&
      battleContext.playerAvgCrowdReaction < condition.avg_crowd_reaction_min) {
    return false;
  }
  if (condition.crowd_differential_max) {
    const diff = Math.abs(battleContext.playerAvgCrowdReaction - battleContext.aiAvgCrowdReaction);
    if (diff > condition.crowd_differential_max) {
      return false;
    }
  }

  // Check peak score
  if (condition.peak_score_min &&
      battleContext.playerPeakScore < condition.peak_score_min) {
    return false;
  }

  // Check consistency
  if (condition.consistency_score_min &&
      battleContext.playerConsistencyScore < condition.consistency_score_min) {
    return false;
  }

  // Check rating differential (upset victory)
  if (condition.rating_differential_min) {
    // This would need AI rating passed in - placeholder for now
    return true; // Implement when we have AI rating available
  }

  // Check public knowledge requirements
  if (condition.public_knowledge_min &&
      playerContext.publicKnowledge < condition.public_knowledge_min) {
    return false;
  }

  // Check reputation requirements
  if (condition.reputation_min &&
      (playerContext.attributes?.personal?.reputation || 5) < condition.reputation_min) {
    return false;
  }

  // Check recent chokes
  if (condition.recent_chokes &&
      playerContext.prepPatterns.recent_chokes < condition.recent_chokes) {
    return false;
  }

  return true;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Check if event can trigger based on cooldown
 */
async function canTriggerEvent(
  supabase: SupabaseClient,
  template: LifeEventTemplate,
  battlerId: string
): Promise<boolean> {
  // If event can't trigger multiple times, check if already triggered
  if (!template.can_trigger_multiple_times) {
    const { data: existing } = await supabase
      .from('battler_life_events')
      .select('id')
      .eq('battler_id', battlerId)
      .eq('template_code', template.code)
      .limit(1);

    if (existing && existing.length > 0) {
      return false;
    }
  }

  // Check cooldown period
  if (template.cooldown_battles > 0) {
    const { data: recentEvents } = await supabase
      .from('battler_life_events')
      .select('id, battle_id')
      .eq('battler_id', battlerId)
      .eq('template_code', template.code)
      .order('triggered_at', { ascending: false })
      .limit(1);

    if (recentEvents && recentEvents.length > 0) {
      // Count battles since last trigger
      const { data: recentBattles } = await supabase
        .from('battles')
        .select('id')
        .eq('battler_player_id', battlerId)
        .eq('status', 'completed')
        .gt('created_at', new Date().toISOString()) // Simplified - should compare to event timestamp
        .limit(template.cooldown_battles);

      if (!recentBattles || recentBattles.length < template.cooldown_battles) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Trigger a life event
 */
async function triggerLifeEvent(
  supabase: SupabaseClient,
  template: LifeEventTemplate,
  battlerId: string,
  battleId: string,
  details: any = {}
): Promise<void> {
  console.log(`[Life Events] Triggering event: ${template.code} for battler ${battlerId}`);

  // Create the life event instance
  const eventData: any = {
    battler_id: battlerId,
    template_code: template.code,
    battle_id: battleId,
    event_type: template.event_type,
    status: template.event_type === 'passive' || template.event_type === 'triggered' ? 'resolved' : 'pending',
    details_json: details,
    effects_applied: template.event_type === 'passive' || template.event_type === 'triggered' ? template.passive_effects : {},
  };

  // For passive/triggered events, apply effects immediately
  if (template.event_type === 'passive' || template.event_type === 'triggered') {
    eventData.resolved_at = new Date().toISOString();

    // Set expiration for temporary effects
    if (template.effect_duration === 'next_battle' || template.effect_duration === 'prep_cycle') {
      eventData.active = true;
      // Expiration will be set when next battle starts/completes
    }
  }

  const { error } = await supabase
    .from('battler_life_events')
    .insert(eventData);

  if (error) {
    console.error('[Life Events] Error creating life event:', error);
  } else {
    console.log(`[Life Events] Successfully triggered: ${template.code}`);
  }
}

/**
 * Update recent chokes counter in prep patterns
 */
async function updateRecentChokes(
  supabase: SupabaseClient,
  battlerId: string
): Promise<void> {
  await supabase.rpc('increment_recent_chokes', { p_battler_id: battlerId });
}

/**
 * Fetch battler context for trigger evaluation
 */
export async function fetchBattlerContext(
  supabase: SupabaseClient,
  battlerId: string
): Promise<BattlerContext | null> {
  // Fetch battler attributes
  const { data: attributes } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', battlerId)
    .single();

  // Fetch ranking
  const { data: ranking } = await supabase
    .from('rankings')
    .select('*')
    .eq('battler_id', battlerId)
    .single();

  // Fetch prep patterns
  const { data: prepPatterns } = await supabase
    .from('prep_pattern_tracking')
    .select('*')
    .eq('battler_id', battlerId)
    .single();

  if (!attributes || !ranking) {
    return null;
  }

  return {
    battlerId,
    rating: ranking.rating,
    wins: ranking.wins,
    losses: ranking.losses,
    streak: ranking.streak,
    attributes: attributes,
    publicKnowledge: attributes.public_knowledge,
    stress: attributes.stress || 0,
    prepPatterns: prepPatterns || {
      consecutive_writing_days: 0,
      consecutive_performance_days: 0,
      consecutive_research_days: 0,
      consecutive_rest_days: 0,
      consecutive_life_days: 0,
      total_writing_days: 0,
      total_performance_days: 0,
      total_research_days: 0,
      total_rest_days: 0,
      total_life_days: 0,
      battles_without_rest: 0,
      recent_chokes: 0,
      last_prep_focus: '',
    },
  };
}
