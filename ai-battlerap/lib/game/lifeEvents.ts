/**
 * Life Events Triggering System
 *
 * Handles the logic for triggering life events based on battle results
 * and other game conditions.
 */

interface BattleResult {
  battleId: string;
  winnerId: string;
  playerBattlerId: string;
  aiBattlerId: string;
  playerRoundsWon: number;
  aiRoundsWon: number;
  playerChoked: boolean;
  aiChoked: boolean;
  playerAvgCrowdReaction: number;
  aiAvgCrowdReaction: number;
}

interface BattlerContext {
  battlerId: string;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
  attributes: any;
  publicKnowledge: number;
}

interface LifeEventTemplate {
  id: string;
  code: string;
  title: string;
  description: string;
  trigger_type: string;
  trigger_condition: any;
  choice_a_text: string;
  choice_a_effects: any;
  choice_b_text: string | null;
  choice_b_effects: any | null;
}

/**
 * Main function to trigger life events after a battle
 */
export async function triggerLifeEventsForBattle(
  supabase: any,
  battleResult: BattleResult,
  playerContext: BattlerContext,
  aiContext: BattlerContext
): Promise<void> {
  // Fetch all battle_result triggered event templates
  const { data: templates, error } = await supabase
    .from('life_event_templates')
    .select('*')
    .eq('trigger_type', 'battle_result');

  if (error || !templates || templates.length === 0) {
    console.log('No life event templates found');
    return;
  }

  // Determine battle outcome details
  const outcome = determineOutcome(battleResult, playerContext);

  // Find matching templates
  const matchingTemplates = templates.filter((template: LifeEventTemplate) => {
    return evaluateTriggerCondition(template.trigger_condition, outcome, playerContext);
  });

  // Only trigger one event per battle (pick first match by priority)
  if (matchingTemplates.length > 0) {
    const selectedTemplate = matchingTemplates[0];

    // Create the life event
    const { data: lifeEvent, error: insertError } = await supabase
      .from('battler_life_events')
      .insert({
        battler_id: battleResult.playerBattlerId,
        template_code: selectedTemplate.code,
        battle_id: battleResult.battleId,
        status: 'pending',
        details_json: {
          battle_result: outcome.result,
          outcome: outcome.outcome,
          choked: outcome.choked,
          win_streak: outcome.winStreak,
        },
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating life event:', insertError);
    } else {
      console.log(`Life event triggered: ${selectedTemplate.code} for battler ${battleResult.playerBattlerId}`);

      // Create notification for life event
      try {
        const { notifyLifeEvent } = await import('@/lib/services/notificationService');
        await notifyLifeEvent(
          supabase,
          battleResult.playerBattlerId,
          lifeEvent.id,
          selectedTemplate.title,
          selectedTemplate.description
        );
      } catch (notifyError) {
        console.error('Failed to create life event notification:', notifyError);
      }
    }
  }
}

/**
 * Determine the outcome of the battle
 */
function determineOutcome(
  battleResult: BattleResult,
  playerContext: BattlerContext
): any {
  const playerRounds = battleResult.playerRoundsWon;
  const aiRounds = battleResult.aiRoundsWon;
  const isWin = battleResult.winnerId === battleResult.playerBattlerId;

  // Determine result string (3-0, 2-1, etc.)
  let result = '';
  if (isWin) {
    result = `${playerRounds}-${aiRounds}`;
  } else {
    result = `${aiRounds}-${playerRounds}`;
  }

  // Calculate win streak
  let winStreak = 0;
  if (isWin) {
    winStreak = playerContext.streak > 0 ? playerContext.streak + 1 : 1;
  }

  // Check if crowd reactions were close
  const crowdDiff = Math.abs(
    battleResult.playerAvgCrowdReaction - battleResult.aiAvgCrowdReaction
  );
  const closeCrowdReaction = crowdDiff < 10;

  return {
    result,
    outcome: isWin ? 'win' : 'loss',
    choked: battleResult.playerChoked,
    winStreak,
    closeCrowdReaction,
    publicKnowledge: playerContext.publicKnowledge,
    reputation: playerContext.attributes?.personal?.reputation || 5,
    financialStability: playerContext.attributes?.personal?.financial_stability || 5,
  };
}

/**
 * Evaluate if a trigger condition matches the current outcome
 */
function evaluateTriggerCondition(
  condition: any,
  outcome: any,
  playerContext: BattlerContext
): boolean {
  // Handle "any" condition (always matches)
  if (condition.any === true) {
    return true;
  }

  // Check specific result (e.g., "3-0")
  if (condition.result && condition.result !== outcome.result) {
    return false;
  }

  // Check outcome (win/loss)
  if (condition.outcome && condition.outcome !== outcome.outcome) {
    return false;
  }

  // Check choke flag
  if (condition.choked === true && !outcome.choked) {
    return false;
  }

  // Check win streak
  if (condition.win_streak && outcome.winStreak < condition.win_streak) {
    return false;
  }

  // Check close crowd reaction
  if (condition.close_crowd_reaction === true && !outcome.closeCrowdReaction) {
    return false;
  }

  // Check minimum public knowledge
  if (condition.min_public_knowledge && outcome.publicKnowledge < condition.min_public_knowledge) {
    return false;
  }

  // Check maximum public knowledge
  if (condition.max_public_knowledge && outcome.publicKnowledge > condition.max_public_knowledge) {
    return false;
  }

  // Check minimum reputation
  if (condition.min_reputation && outcome.reputation < condition.min_reputation) {
    return false;
  }

  // Check maximum reputation
  if (condition.max_reputation && outcome.reputation > condition.max_reputation) {
    return false;
  }

  // Check minimum financial stability
  if (condition.min_financial_stability && outcome.financialStability < condition.min_financial_stability) {
    return false;
  }

  // Check maximum financial stability
  if (condition.max_financial_stability && outcome.financialStability > condition.max_financial_stability) {
    return false;
  }

  // All conditions passed
  return true;
}

/**
 * Apply effects from a chosen life event option
 * This will be used when the player resolves a pending event
 */
export async function applyLifeEventEffects(
  supabase: any,
  battlerId: string,
  effects: any
): Promise<void> {
  // Fetch current battler attributes
  const { data: attributes, error: fetchError } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', battlerId)
    .single();

  if (fetchError || !attributes) {
    console.error('Error fetching battler attributes:', fetchError);
    return;
  }

  // Apply attribute changes
  const updates: any = {};

  // Personal attributes
  if (effects.reputation !== undefined) {
    const current = attributes.personal.reputation || 5;
    updates.personal = {
      ...attributes.personal,
      reputation: Math.max(1, Math.min(10, current + effects.reputation)),
    };
  }

  if (effects.financial_stability !== undefined) {
    const current = attributes.personal.financial_stability || 5;
    updates.personal = {
      ...(updates.personal || attributes.personal),
      financial_stability: Math.max(1, Math.min(10, current + effects.financial_stability)),
    };
  }

  if (effects.family_bond !== undefined) {
    const current = attributes.personal.family_bond || 5;
    updates.personal = {
      ...(updates.personal || attributes.personal),
      family_bond: Math.max(1, Math.min(10, current + effects.family_bond)),
    };
  }

  // Resilience
  if (effects.resilience !== undefined) {
    updates.resilience = Math.max(1, Math.min(10, attributes.resilience + effects.resilience));
  }

  // Writing attributes
  if (effects.lyricism !== undefined) {
    const current = attributes.writing.lyricism || 5;
    updates.writing = {
      ...attributes.writing,
      lyricism: Math.max(1, Math.min(10, current + effects.lyricism)),
    };
  }

  // Performance attributes
  if (effects.stage_presence !== undefined) {
    const current = attributes.performance.stage_presence || 5;
    updates.performance = {
      ...attributes.performance,
      stage_presence: Math.max(1, Math.min(10, current + effects.stage_presence)),
    };
  }

  // Public knowledge
  if (effects.public_knowledge !== undefined) {
    updates.public_knowledge = Math.max(0, Math.min(100, attributes.public_knowledge + effects.public_knowledge));
  }

  // Apply updates to database
  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from('battler_attributes')
      .update(updates)
      .eq('battler_id', battlerId);

    if (updateError) {
      console.error('Error updating battler attributes:', updateError);
    } else {
      console.log(`Applied life event effects to battler ${battlerId}:`, updates);
    }
  }

  // Note: Prep bonuses/penalties (prep_bonus_writing, prep_penalty, etc.)
  // would be stored in the event details and applied during the next battle's prep phase.
  // This requires additional implementation in the prep system.
}
