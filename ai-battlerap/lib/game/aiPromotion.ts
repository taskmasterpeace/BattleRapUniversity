import { createClient } from '@supabase/supabase-js';

/**
 * AI Promotion Decision Engine
 *
 * Determines when and how AI opponents promote against the player.
 * AI uses simpler logic than players - weighted random selection based on attributes.
 */

// Action types available to AI
const PROMOTION_ACTIONS = [
  'interview',
  'twitter_callout',
  'scandal_exposure',
  'authenticity_attack',
  'angle_teaser',
] as const;

type PromotionActionType = (typeof PROMOTION_ACTIONS)[number];

interface AIPromotionDecision {
  shouldPromote: boolean;
  actionType?: PromotionActionType;
  targetScandalId?: string;
  reason?: string;
}

interface AIPromotionContext {
  battleId: string;
  aiBattlerId: string;
  playerBattlerId: string;
  daysUntilBattle: number;
  currentAuthenticity: number;
  opponentCrowdPerception: number;
  playerCrowdPerception: number;
  aiAttributes: any;
  playerScandals?: any[];
}

/**
 * Decide if AI should promote and which action to take
 */
export async function decideAIPromotion(
  context: AIPromotionContext
): Promise<AIPromotionDecision> {
  const {
    daysUntilBattle,
    currentAuthenticity,
    opponentCrowdPerception,
    playerCrowdPerception,
    aiAttributes,
    playerScandals = [],
  } = context;

  // Don't promote if battle is too far out (>30 days)
  if (daysUntilBattle > 30) {
    return { shouldPromote: false, reason: 'Battle too far away' };
  }

  // Don't promote if authenticity is critically low (<20)
  if (currentAuthenticity < 20) {
    return { shouldPromote: false, reason: 'Authenticity too low' };
  }

  // Calculate base promotion probability
  let promotionChance = 0.3; // 30% base

  // Increase chance as battle approaches
  if (daysUntilBattle <= 1) promotionChance += 0.4; // +40% on battle day
  else if (daysUntilBattle <= 3) promotionChance += 0.3; // +30%
  else if (daysUntilBattle <= 7) promotionChance += 0.2; // +20%
  else if (daysUntilBattle <= 14) promotionChance += 0.1; // +10%

  // Increase chance if losing crowd battle
  const crowdDeficit = opponentCrowdPerception - playerCrowdPerception;
  if (crowdDeficit > 20) promotionChance += 0.3; // Desperate
  else if (crowdDeficit > 0) promotionChance += 0.15; // Behind

  // Decrease chance if winning by a lot
  if (crowdDeficit < -30) promotionChance -= 0.2;

  // Roll for promotion
  if (Math.random() > promotionChance) {
    return { shouldPromote: false, reason: 'Random roll failed' };
  }

  // Decide which action to take (attribute-weighted)
  const actionType = selectAIAction(aiAttributes, playerScandals);

  // If scandal exposure, pick a scandal
  let targetScandalId: string | undefined;
  if (actionType === 'scandal_exposure' && playerScandals.length > 0) {
    // Pick highest intensity scandal
    const sortedScandals = [...playerScandals].sort(
      (a, b) => b.intensity - a.intensity
    );
    targetScandalId = sortedScandals[0].id;
  }

  return {
    shouldPromote: true,
    actionType,
    targetScandalId,
    reason: 'AI decided to promote',
  };
}

/**
 * Select action based on AI attributes (weighted random)
 */
function selectAIAction(
  aiAttributes: any,
  playerScandals: any[]
): PromotionActionType {
  // Extract relevant attributes
  const stagePresence =
    aiAttributes.performance?.stage_presence ||
    aiAttributes.performance?.['Stage Presence'] ||
    5;
  const wordplay =
    aiAttributes.writing?.wordplay || aiAttributes.writing?.Wordplay || 5;
  const reputation =
    aiAttributes.personal?.reputation || aiAttributes.personal?.Reputation || 5;
  const creativity =
    aiAttributes.writing?.creativity || aiAttributes.writing?.Creativity || 5;
  const lyricism =
    aiAttributes.writing?.lyricism || aiAttributes.writing?.Lyricism || 5;

  // Build weighted action pool
  const weights: Record<PromotionActionType, number> = {
    interview: stagePresence * 2, // Stage presence heavy
    twitter_callout: wordplay * 1.5 + creativity, // Wordplay + creativity
    scandal_exposure:
      playerScandals.length > 0 ? reputation * 2 + 10 : 0, // Bonus if scandals exist
    authenticity_attack: creativity * 1.5 + stagePresence, // Creative + presence
    angle_teaser: lyricism * 2, // Lyricism heavy
  };

  // Weighted random selection
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (const [action, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return action as PromotionActionType;
    }
  }

  // Fallback
  return 'interview';
}

/**
 * Execute AI promotion (prepares decision data)
 *
 * Returns the decision for execution. The actual execution happens
 * via the promotion API endpoint with x-ai-battler-id header.
 */
export async function executeAIPromotion(
  battleId: string,
  aiBattlerId: string
): Promise<{ success: boolean; error?: string; result?: any }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get battle details
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select(
        `
        id,
        scheduled_at,
        status,
        battler_player_id,
        battler_ai_id
      `
      )
      .eq('id', battleId)
      .single();

    if (battleError || !battle) {
      return { success: false, error: 'Battle not found' };
    }

    // Verify this is an AI battle and get correct AI battler
    if (battle.battler_ai_id !== aiBattlerId) {
      return { success: false, error: 'Battler ID mismatch' };
    }

    // Get AI battler attributes
    const { data: aiAttributes } = await supabase
      .from('battler_attributes')
      .select('*')
      .eq('battler_id', aiBattlerId)
      .single();

    if (!aiAttributes) {
      return { success: false, error: 'AI attributes not found' };
    }

    // Get relationship for crowd perception
    const { data: relationship } = await supabase
      .from('battler_relationships')
      .select('*')
      .or(
        `and(battler_a_id.eq.${aiBattlerId},battler_b_id.eq.${battle.battler_player_id}),and(battler_a_id.eq.${battle.battler_player_id},battler_b_id.eq.${aiBattlerId})`
      )
      .eq('status', 'active')
      .single();

    const isAIPlayerA = relationship?.battler_a_id === aiBattlerId;
    const currentAuthenticity = relationship
      ? isAIPlayerA
        ? relationship.authenticity_score_a
        : relationship.authenticity_score_b
      : 100;

    const opponentCrowdPerception = relationship
      ? isAIPlayerA
        ? relationship.crowd_perception_a
        : relationship.crowd_perception_b
      : 50;

    const playerCrowdPerception = relationship
      ? isAIPlayerA
        ? relationship.crowd_perception_b
        : relationship.crowd_perception_a
      : 50;

    // Get player scandals
    const { data: playerScandals } = await supabase
      .from('scandals')
      .select('*')
      .eq('battler_id', battle.battler_player_id)
      .gte('week_expires', new Date().getTime() / (1000 * 60 * 60 * 24 * 7))
      .order('intensity', { ascending: false })
      .limit(5);

    // Calculate days until battle
    const scheduledDate = new Date(battle.scheduled_at);
    const now = new Date();
    const daysUntilBattle = Math.ceil(
      (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Make AI decision
    const decision = await decideAIPromotion({
      battleId,
      aiBattlerId,
      playerBattlerId: battle.battler_player_id,
      daysUntilBattle,
      currentAuthenticity,
      opponentCrowdPerception,
      playerCrowdPerception,
      aiAttributes,
      playerScandals: playerScandals || [],
    });

    if (!decision.shouldPromote) {
      return {
        success: true,
        result: { promoted: false, reason: decision.reason },
      };
    }

    // Return decision data for execution
    return {
      success: true,
      result: {
        promoted: true,
        shouldExecute: true,
        actionType: decision.actionType,
        targetScandalId: decision.targetScandalId,
        aiBattlerId,
      },
    };
  } catch (error: any) {
    console.error('AI promotion execution error:', error);
    return { success: false, error: error.message };
  }
}
