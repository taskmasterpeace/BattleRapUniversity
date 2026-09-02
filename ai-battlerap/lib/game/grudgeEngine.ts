/**
 * Grudge Creation Engine
 *
 * Purpose: Analyzes battle results and creates/updates grudges between battlers
 * Based on American battle rap culture triggers:
 * - Controversial decisions
 * - Upsets (lower-rated beats higher-rated)
 * - Humiliation (dominant 3-0 victories)
 * - Personal disrespect
 * - Badge-related events
 *
 * Integrates with:
 * - headToHeadTracking.ts (updates H2H records)
 * - bloggerMemory.ts (provides narrative context)
 * - newsGenerator.ts (triggers grudge coverage)
 */

import { createClient } from '@supabase/supabase-js';
import { loadReputationModifiers } from './reputationLoader';

/**
 * Grudge writes are SYSTEM operations (fired from the simulation engine for
 * any pair of battlers — player, AI, or world cards). They must bypass
 * user-scoped RLS: the cookie-based client used to throw
 * "new row violates row-level security policy for table battler_relationships"
 * which silently killed the entire recap/news pipeline after every battle.
 */
function createSystemSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// =====================================================
// TYPES
// =====================================================

export type GrudgeTriggerType =
  | 'controversial_decision'
  | 'upset_victory'
  | 'humiliation'
  | 'personal_disrespect'
  | 'badge_event'
  | 'close_battle'
  | 'domination';

export type GrudgeOriginType =
  | 'career'
  | 'regional'
  | 'personal'
  | 'business'
  | 'media'
  | 'battle';

export type GrudgeStatus = 'active' | 'dormant' | 'resolved';

export interface BattleResultForGrudge {
  battleId: string;
  battlerA: {
    id: string;
    stageName: string;
    rating: number;
  };
  battlerB: {
    id: string;
    stageName: string;
    rating: number;
  };
  winnerId: string;
  score: string; // e.g., "2-1"
  rounds: {
    roundNumber: number;
    battlerAScore: number;
    battlerBScore: number;
    battlerAWon: boolean;
  }[];
  wasUpset: boolean; // lower-rated beat higher-rated
  wasClose: boolean; // 2-1 with close rounds
  wasDomination: boolean; // 3-0 or 2-0 with wide margins
  hasControversy: boolean; // close score but one-sided rounds
  scheduledAt: string;
}

export interface GrudgeCreationResult {
  created: boolean;
  updated: boolean;
  relationshipId: string | null;
  intensity: number;
  rematchDemand: number;
  trigger: GrudgeTriggerType;
  originStory: string;
}

// =====================================================
// CONFIGURATION
// =====================================================

const INTENSITY_TRIGGERS = {
  controversial_decision: 30,
  upset_victory: 40,
  humiliation: 50,
  personal_disrespect: 60,
  badge_event: 35,
  close_battle: 25,
  domination: 35,
};

const REMATCH_BASE_MULTIPLIERS = {
  close_battle: 1.5,
  upset_victory: 1.8,
  controversial_decision: 2.0,
  humiliation: 1.2,
};

// Rating difference thresholds
const UPSET_RATING_THRESHOLD = 100; // Win despite being 100+ rating lower
const CONTROVERSY_SCORE_THRESHOLD = 0.5; // Avg score difference < 0.5 but 2-1 or 3-0
const DOMINATION_AVG_DIFF = 1.5; // Winner avg 1.5+ points higher
const CLOSE_BATTLE_THRESHOLD = 0.8; // All rounds within 0.8 points

// =====================================================
// CORE FUNCTIONS
// =====================================================

/**
 * Main entry point: Analyze battle and create/update grudge
 */
export async function analyzeAndCreateGrudge(
  battleResult: BattleResultForGrudge
): Promise<GrudgeCreationResult> {
  const supabase = createSystemSupabaseClient();

  // Detect triggers
  const triggers = detectGrudgeTriggers(battleResult);

  // If no triggers, no grudge created
  if (triggers.length === 0) {
    return {
      created: false,
      updated: false,
      relationshipId: null,
      intensity: 0,
      rematchDemand: 0,
      trigger: 'close_battle',
      originStory: '',
    };
  }

  // Use strongest trigger
  const primaryTrigger = selectPrimaryTrigger(triggers, battleResult);

  // Calculate intensity
  const intensity = calculateIntensity(primaryTrigger, battleResult);

  // Calculate rematch demand
  let rematchDemand = calculateRematchDemand(primaryTrigger, battleResult);

  // REPUTATION TEETH: beef/sympathy labels inflate fan demand for the run-back.
  // The loser is the one who wants it back, so their rematchDemandBias (0..1) —
  // fed by labels like ROBBED, STARTS SMOKE, DUCKING — nudges demand up by up to
  // +25. A modest bump, not a takeover. loadReputationModifiers never throws
  // (returns zeroed modifiers on any error); guard the id so a bad payload can't crash.
  const loserId =
    battleResult.winnerId === battleResult.battlerA.id
      ? battleResult.battlerB.id
      : battleResult.battlerA.id;
  if (loserId) {
    const { rematchDemandBias } = await loadReputationModifiers(supabase, loserId);
    rematchDemand = Math.min(100, rematchDemand + Math.round(rematchDemandBias * 25));
  }

  // Generate origin story
  const originStory = generateOriginStory(primaryTrigger, battleResult);

  // Determine origin type
  const originType: GrudgeOriginType = 'battle'; // All post-battle grudges are 'battle' type

  // Check if relationship already exists
  const { data: existing } = await supabase
    .from('battler_relationships')
    .select('*')
    .or(`and(battler_a_id.eq.${battleResult.battlerA.id},battler_b_id.eq.${battleResult.battlerB.id}),and(battler_a_id.eq.${battleResult.battlerB.id},battler_b_id.eq.${battleResult.battlerA.id})`)
    .single();

  let relationshipId: string;
  let created = false;
  let updated = false;

  if (existing) {
    // Update existing grudge
    const newIntensity = Math.min(100, existing.intensity + intensity);
    const newRematchDemand = Math.min(100, rematchDemand);

    await supabase
      .from('battler_relationships')
      .update({
        intensity: newIntensity,
        rematch_demand: newRematchDemand,
        status: 'active', // Reactivate if dormant
        last_modified_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    relationshipId = existing.id;
    updated = true;

    // PHASE 3: Update relationship state based on new intensity
    await updateRelationshipState(supabase, existing.id, newIntensity, primaryTrigger);

    // Add storyline event
    await addStorylineEvent(existing.id, {
      eventType: 'battle',
      eventDescription: `Battle ended ${battleResult.score}. ${originStory}`,
      battleId: battleResult.battleId,
      intensityDelta: intensity,
      rematchDemandDelta: rematchDemand - existing.rematch_demand,
    });
  } else {
    // Create new grudge
    const [aId, bId] = sortBattlerIds(battleResult.battlerA.id, battleResult.battlerB.id);

    const { data, error } = await supabase
      .from('battler_relationships')
      .insert({
        battler_a_id: aId,
        battler_b_id: bId,
        intensity,
        rematch_demand: rematchDemand,
        status: 'active',
        origin_type: originType,
        origin_story: originStory,
        origin_battle_id: battleResult.battleId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating grudge:', error);
      throw error;
    }

    relationshipId = data.id;
    created = true;

    // PHASE 3: Set initial relationship state
    await updateRelationshipState(supabase, data.id, intensity, primaryTrigger);

    // Add initial storyline event
    await addStorylineEvent(data.id, {
      eventType: 'battle',
      eventDescription: `Rivalry began after battle. ${originStory}`,
      battleId: battleResult.battleId,
      intensityDelta: intensity,
      rematchDemandDelta: rematchDemand,
    });
  }

  return {
    created,
    updated,
    relationshipId,
    intensity,
    rematchDemand,
    trigger: primaryTrigger,
    originStory,
  };
}

/**
 * Detect all applicable grudge triggers from battle result
 */
function detectGrudgeTriggers(battle: BattleResultForGrudge): GrudgeTriggerType[] {
  const triggers: GrudgeTriggerType[] = [];

  // 1. Controversial Decision: Close avg scores but decisive result
  if (battle.hasControversy) {
    triggers.push('controversial_decision');
  }

  // 2. Upset Victory: Lower-rated wins
  if (battle.wasUpset) {
    const ratingDiff = Math.abs(battle.battlerA.rating - battle.battlerB.rating);
    if (ratingDiff >= UPSET_RATING_THRESHOLD) {
      triggers.push('upset_victory');
    }
  }

  // 3. Humiliation: Dominant victory
  if (battle.wasDomination) {
    triggers.push('humiliation');
  }

  // 4. Close Battle: All rounds very close
  if (battle.wasClose) {
    triggers.push('close_battle');
  }

  // 5. Domination: Wide margin victory
  const avgScoreDiff = calculateAvgScoreDiff(battle);
  if (avgScoreDiff >= DOMINATION_AVG_DIFF) {
    triggers.push('domination');
  }

  return triggers;
}

/**
 * Select the primary (strongest) trigger
 */
function selectPrimaryTrigger(
  triggers: GrudgeTriggerType[],
  battle: BattleResultForGrudge
): GrudgeTriggerType {
  // Priority order (highest to lowest)
  const priority: GrudgeTriggerType[] = [
    'personal_disrespect',
    'humiliation',
    'controversial_decision',
    'upset_victory',
    'domination',
    'close_battle',
    'badge_event',
  ];

  for (const trigger of priority) {
    if (triggers.includes(trigger)) {
      return trigger;
    }
  }

  return 'close_battle'; // Default fallback
}

/**
 * Calculate grudge intensity (0-100)
 */
function calculateIntensity(
  trigger: GrudgeTriggerType,
  battle: BattleResultForGrudge
): number {
  let baseIntensity = INTENSITY_TRIGGERS[trigger] || 20;

  // Modifiers
  if (battle.wasUpset && trigger === 'upset_victory') {
    const ratingDiff = Math.abs(battle.battlerA.rating - battle.battlerB.rating);
    baseIntensity += Math.min(20, Math.floor(ratingDiff / 50)); // +4 per 50 rating diff, max +20
  }

  if (battle.wasDomination && trigger === 'humiliation') {
    baseIntensity += 15; // Extra intensity for public embarrassment
  }

  if (battle.hasControversy && trigger === 'controversial_decision') {
    baseIntensity += 10; // Extra for disputed outcome
  }

  return Math.min(100, baseIntensity);
}

/**
 * Calculate rematch demand (0-100)
 */
function calculateRematchDemand(
  trigger: GrudgeTriggerType,
  battle: BattleResultForGrudge
): number {
  let baseDemand = 30; // Default starting demand

  // Trigger-specific multipliers
  const multiplier = REMATCH_BASE_MULTIPLIERS[trigger as keyof typeof REMATCH_BASE_MULTIPLIERS] || 1.0;
  baseDemand *= multiplier;

  // Closeness boosts demand
  if (battle.wasClose) {
    baseDemand += 25;
  }

  // Controversy boosts demand significantly
  if (battle.hasControversy) {
    baseDemand += 30;
  }

  // Upset boosts demand
  if (battle.wasUpset) {
    baseDemand += 20;
  }

  // Recency matters (battles are recent by default in this context)
  baseDemand += 10; // Fresh beef is hot

  return Math.min(100, Math.round(baseDemand));
}

/**
 * Generate human-readable origin story
 */
function generateOriginStory(
  trigger: GrudgeTriggerType,
  battle: BattleResultForGrudge
): string {
  const winner = battle.winnerId === battle.battlerA.id ? battle.battlerA : battle.battlerB;
  const loser = battle.winnerId === battle.battlerA.id ? battle.battlerB : battle.battlerA;

  switch (trigger) {
    case 'controversial_decision':
      return `${winner.stageName} defeated ${loser.stageName} ${battle.score} in a battle many felt could have gone either way. The close scorecards sparked immediate controversy, with ${loser.stageName}'s camp disputing the decision. Fans and media questioned the judging, fueling tension between the two battlers.`;

    case 'upset_victory':
      const ratingDiff = Math.abs(winner.rating - loser.rating);
      return `In a shocking upset, ${winner.stageName} (rated ${winner.rating}) defeated heavily favored ${loser.stageName} (rated ${loser.rating}) by a score of ${battle.score}. The ${ratingDiff}-point rating difference made this one of the biggest upsets of the season, leaving ${loser.stageName} embarrassed and hungry for redemption.`;

    case 'humiliation':
      return `${winner.stageName} dominated ${loser.stageName} in a one-sided ${battle.score} victory that many called embarrassing. The lopsided performance left ${loser.stageName} facing criticism and questions about their place in the league. The public nature of the loss sparked immediate calls for a rematch to restore ${loser.stageName}'s reputation.`;

    case 'close_battle':
      return `${winner.stageName} narrowly edged out ${loser.stageName} in an instant classic that ended ${battle.score}. Every round was razor-thin, with neither battler giving an inch. The competitive nature of the battle left fans demanding to see them run it back, and both camps expressing interest in a rematch.`;

    case 'domination':
      return `${winner.stageName} thoroughly outperformed ${loser.stageName} in a ${battle.score} decision, showcasing superior skill across all rounds. The wide performance gap stunned observers and created tension, with ${loser.stageName} feeling disrespected by the margin of defeat.`;

    case 'personal_disrespect':
      return `Personal lines crossed during the ${winner.stageName} vs ${loser.stageName} battle sparked genuine animosity. What started as competition became personal, with both sides taking the battle beyond the stage. The disrespectful nature of the confrontation created lasting bad blood.`;

    case 'badge_event':
      return `The ${winner.stageName} vs ${loser.stageName} battle had implications beyond the result, affecting rankings, reputation, and career trajectories. The competitive stakes created ongoing tension between the two battlers.`;

    default:
      return `${winner.stageName} and ${loser.stageName}'s ${battle.score} battle created friction that extended beyond the stage. The competitive nature of their matchup sparked an ongoing rivalry.`;
  }
}

/**
 * Add storyline event to rivalry_storylines table
 */
async function addStorylineEvent(
  relationshipId: string,
  event: {
    eventType: string;
    eventDescription: string;
    battleId?: string;
    articleId?: string;
    intensityDelta?: number;
    rematchDemandDelta?: number;
  }
) {
  const supabase = createSystemSupabaseClient();

  await supabase.from('rivalry_storylines').insert({
    relationship_id: relationshipId,
    event_type: event.eventType,
    event_description: event.eventDescription,
    battle_id: event.battleId || null,
    article_id: event.articleId || null,
    intensity_delta: event.intensityDelta || 0,
    rematch_demand_delta: event.rematchDemandDelta || 0,
  });
}

/**
 * Calculate average score differential across all rounds
 */
function calculateAvgScoreDiff(battle: BattleResultForGrudge): number {
  const diffs = battle.rounds.map(r => Math.abs(r.battlerAScore - r.battlerBScore));
  return diffs.reduce((sum, diff) => sum + diff, 0) / diffs.length;
}

/**
 * Ensure battler IDs are sorted (smaller UUID first)
 */
function sortBattlerIds(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

// =====================================================
// DECAY AND RESOLUTION
// =====================================================

/**
 * Decay grudge intensity over time (call periodically via cron)
 * Intensity decays by 5 per week if no new events
 */
export async function decayGrudgeIntensity(daysSinceLastModified: number = 7) {
  const supabase = createSystemSupabaseClient();

  const decayAmount = Math.floor(daysSinceLastModified / 7) * 5; // 5 per week

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastModified);

  await supabase.rpc('decay_grudge_intensity', {
    decay_amount: decayAmount,
    cutoff_date: cutoffDate.toISOString(),
  });
}

/**
 * Resolve grudge (mark as resolved, intensity → 0)
 */
export async function resolveGrudge(relationshipId: string, reason: string) {
  const supabase = createSystemSupabaseClient();

  await supabase
    .from('battler_relationships')
    .update({
      status: 'resolved',
      intensity: 0,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', relationshipId);

  await addStorylineEvent(relationshipId, {
    eventType: 'status_change',
    eventDescription: `Rivalry resolved: ${reason}`,
    intensityDelta: -100,
  });
}

/**
 * Set grudge to dormant (low tension but not resolved)
 */
export async function setGrudgeDormant(relationshipId: string) {
  const supabase = createSystemSupabaseClient();

  await supabase
    .from('battler_relationships')
    .update({
      status: 'dormant',
    })
    .eq('id', relationshipId);

  await addStorylineEvent(relationshipId, {
    eventType: 'status_change',
    eventDescription: 'Rivalry cooled off, entered dormant state.',
    intensityDelta: -20,
  });
}

/**
 * Update relationship state based on intensity and battle triggers (PHASE 3)
 * Maps intensity levels to relationship states in the state tree
 */
async function updateRelationshipState(
  supabase: any,
  relationshipId: string,
  intensity: number,
  trigger: GrudgeTriggerType
): Promise<void> {
  // Determine target state based on intensity and trigger
  let targetState: string;

  // Intensity-based state mapping (aligned with migration logic)
  if (intensity >= 85) {
    targetState = 'at_war'; // Legendary beef territory
  } else if (intensity >= 60) {
    targetState = 'rivals'; // Official rivals
  } else if (intensity >= 35) {
    targetState = 'tense'; // Building tension
  } else if (intensity >= 10) {
    targetState = 'aware'; // They know about each other
  } else {
    targetState = 'unknown'; // Not enough heat yet
  }

  // Trigger-specific state promotions (can skip states for severe triggers)
  if (trigger === 'humiliation' && intensity >= 50) {
    targetState = 'at_war'; // Public embarrassment = instant war
  } else if (trigger === 'personal_disrespect') {
    targetState = 'at_war'; // Personal lines crossed = war
  } else if (trigger === 'controversial_decision' && intensity >= 40) {
    targetState = 'rivals'; // Disputed result = instant rivals
  }

  // Call database function to update state (with high water mark tracking)
  await supabase.rpc('move_to_state', {
    rel_id: relationshipId,
    new_state: targetState,
  });

  console.log(`[GRUDGE] Relationship ${relationshipId} moved to state: ${targetState} (intensity: ${intensity})`);
}
