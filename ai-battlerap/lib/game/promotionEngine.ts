/**
 * Promotion & Authenticity Warfare Engine
 *
 * Purpose: Implements pre-battle promotion mechanics based on Cassidy vs Easy model
 *
 * Core Concepts:
 * - Crowd Perception (0-100): How much the crowd favors each battler before battle starts
 * - Authenticity (100 = real, 0 = exposed): Credibility damaged by scandals/exposure
 * - 25% Rule: Turn 25% of crowd against opponent = successful promotion
 * - Close Battles: Decided by who did better promotion work
 * - Truth Verification: Research to prove/disprove scandals
 *
 * Based on battle rap culture insights:
 * "When you can't out-rap somebody, you have to be able to strip their authenticity from them"
 * "Your promotion could affect how you start the battle, like the perception of people
 *  before the first bars even spit"
 *
 * Integrates with:
 * - simulation.ts (applies crowd perception modifiers to battle outcomes)
 * - grudgeEngine.ts (relationships affect promotion opportunities)
 * - newsGenerator.ts (creates media around promotion events)
 */

import { createServerSupabaseClient } from '@/lib/db/server';

// =====================================================
// TYPES
// =====================================================

export type PromotionEventType =
  | 'interview'           // Media appearance discussing opponent
  | 'twitter_callout'     // Social media beef/callout
  | 'scandal_exposure'    // Exposing opponent's scandal publicly
  | 'truth_research'      // Investigating opponent's background
  | 'media_appearance'    // Generic media work (podcast, blog, etc)
  | 'angle_teaser'        // Previewing what you'll say in battle
  | 'authenticity_attack' // Generic attack on opponent's credibility
  | 'battle_acceptance';  // Publicly accepting a rival's challenge

export type VerificationStatus =
  | 'unverified'   // Not researched yet
  | 'researching'  // Investigation in progress
  | 'proven'       // Evidence confirms it's true
  | 'disproven'    // Evidence shows it's false
  | 'debatable';   // Evidence is mixed/unclear

export type ResolutionType =
  | 'admitted'      // Battler confessed in battle
  | 'disproven'     // Battler proved it false in battle
  | 'ignored'       // Battler didn't address it
  | 'doubled_down'; // Battler claimed it's false but no proof

export interface PromotionEventData {
  battleId: string;
  battlerId: string;
  eventType: PromotionEventType;
  targetBattlerId?: string;      // Who are you attacking?
  targetScandalId?: string;      // Which scandal are you exposing?
  targetSecretId?: string;       // Which secret are you researching?
  title: string;
  description: string;
  keyQuote?: string;             // Memorable line from the promotion
  mediaCoverage?: number;        // 0-10 scale
  daysBeforeBattle?: number;     // Recency matters (closer = more impact)
}

export interface CrowdPerceptionResult {
  battlerAId: string;
  battlerBId: string;
  perceptionA: number;  // 0-100 (50 = neutral)
  perceptionB: number;  // 0-100 (50 = neutral)
  advantageFor: string | null;  // Battler ID with crowd advantage
  advantageMargin: number;      // How much advantage (0-50)
  promotionWorked: boolean;     // Did promotion achieve 25% Rule?
  breakdown: {
    basePerception: number;
    promotionDelta: number;
    scandalPenalty: number;
    authenticityPenalty: number;
  };
}

export interface AuthenticityDamageResult {
  targetBattlerId: string;
  damageDone: number;           // 0-100 points of damage
  newAuthenticityScore: number; // Updated score (0-100)
  wasEffective: boolean;        // Did it matter? (target >50 authenticity)
  scandalVerified: boolean;     // Was the scandal proven?
}

export interface TruthResearchResult {
  scandalId: string;
  researcherId: string;
  success: boolean;              // Did research find evidence?
  evidenceFound: number;         // 0-100 evidence level gained
  newVerificationStatus: VerificationStatus;
  coverUpStrength: number;       // How hard it was to uncover (0-100)
  timeSpent: number;             // Days invested in research
}

// =====================================================
// CONFIGURATION
// =====================================================

const PROMOTION_IMPACT = {
  interview: {
    crowdDelta: 5,           // +5 perception per interview
    mediaCoverage: 4,        // Decent media attention
    authenticityDamage: 0,   // Interviews don't damage authenticity
  },
  twitter_callout: {
    crowdDelta: 8,           // +8 perception (social media is powerful)
    mediaCoverage: 6,        // High visibility
    authenticityDamage: 10,  // Can damage opponent if scandal attached
  },
  scandal_exposure: {
    crowdDelta: 15,          // +15 perception if scandal verified
    mediaCoverage: 8,        // Major media attention
    authenticityDamage: 25,  // Massive damage if proven true
  },
  truth_research: {
    crowdDelta: 0,           // No immediate crowd impact
    mediaCoverage: 0,        // Behind the scenes
    authenticityDamage: 0,   // Damage comes when you expose it
  },
  media_appearance: {
    crowdDelta: 3,           // +3 perception (generic promotion)
    mediaCoverage: 3,        // Moderate coverage
    authenticityDamage: 0,
  },
  angle_teaser: {
    crowdDelta: 10,          // +10 perception (building hype)
    mediaCoverage: 5,        // Good buzz
    authenticityDamage: 5,   // Slight damage if you preview exposing them
  },
  authenticity_attack: {
    crowdDelta: 12,          // +12 perception if effective
    mediaCoverage: 7,        // Strong attention
    authenticityDamage: 15,  // Direct attack on credibility
  },
  battle_acceptance: {
    crowdDelta: 7,           // +7 perception (shows confidence)
    mediaCoverage: 5,        // Newsworthy
    authenticityDamage: 0,
  },
};

// Recency multipliers (closer to battle = more impact)
const RECENCY_MULTIPLIERS = {
  0: 2.0,   // Same day as battle = 2x impact
  1: 1.8,   // 1 day before = 1.8x impact
  2: 1.5,   // 2 days before = 1.5x impact
  3: 1.3,   // 3 days before = 1.3x impact
  7: 1.0,   // 1 week before = normal impact
  14: 0.7,  // 2 weeks before = 70% impact
  21: 0.5,  // 3 weeks before = 50% impact
  30: 0.3,  // 1 month before = 30% impact
};

// Truth research difficulty (how hard to verify scandals)
const RESEARCH_DIFFICULTY_FACTORS = {
  cover_up_high: 0.3,      // 30% success if well-hidden (cover_up > 70)
  cover_up_medium: 0.6,    // 60% success if moderately hidden (30-70)
  cover_up_low: 0.9,       // 90% success if poorly hidden (< 30)
};

// Authenticity damage thresholds
const AUTHENTICITY_THRESHOLDS = {
  fully_authentic: 90,     // 90+ = "real" battler
  questionable: 70,        // 70-89 = some doubts
  sus: 50,                 // 50-69 = "sus" reputation
  exposed: 30,             // 30-49 = "exposed"
  career_damaging: 10,     // 10-29 = "career damaging"
  never_live_it_down: 0,   // 0-9 = "never live it down"
};

// 25% Rule: Successful promotion = swing 25% of crowd (from 50 neutral to 25/75 split)
const TWENTY_FIVE_PERCENT_RULE = 25;

// =====================================================
// CORE FUNCTIONS
// =====================================================

/**
 * Create a promotion event (called during battle prep phase)
 */
export async function createPromotionEvent(
  eventData: PromotionEventData
): Promise<{ eventId: string; impactSummary: string }> {
  const supabase = await createServerSupabaseClient();

  // Get relationship between battlers
  const { data: battle } = await supabase
    .from('battles')
    .select('battler_player_id, battler_ai_id, scheduled_at')
    .eq('id', eventData.battleId)
    .single();

  if (!battle) {
    throw new Error('Battle not found');
  }

  // Calculate impact
  const impact = PROMOTION_IMPACT[eventData.eventType];
  let crowdDelta = impact.crowdDelta;
  let authenticityDamage = impact.authenticityDamage;

  // Apply recency multiplier
  const daysBeforeBattle = eventData.daysBeforeBattle || 7;
  const recencyMultiplier = calculateRecencyMultiplier(daysBeforeBattle);
  crowdDelta = Math.round(crowdDelta * recencyMultiplier);
  authenticityDamage = Math.round(authenticityDamage * recencyMultiplier);

  // Insert promotion event
  const { data: event, error } = await supabase
    .from('promotion_events')
    .insert({
      battle_id: eventData.battleId,
      battler_id: eventData.battlerId,
      event_type: eventData.eventType,
      target_battler_id: eventData.targetBattlerId || null,
      target_scandal_id: eventData.targetScandalId || null,
      target_secret_id: eventData.targetSecretId || null,
      crowd_perception_delta: crowdDelta,
      authenticity_damage: authenticityDamage,
      media_coverage: eventData.mediaCoverage || impact.mediaCoverage,
      title: eventData.title,
      description: eventData.description,
      key_quote: eventData.keyQuote || null,
      days_before_battle: daysBeforeBattle,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating promotion event:', error);
    throw error;
  }

  // Update crowd perception on relationship
  if (eventData.targetBattlerId) {
    await updateCrowdPerception(
      eventData.battlerId,
      eventData.targetBattlerId,
      crowdDelta
    );

    // Apply authenticity damage if targeting opponent
    if (authenticityDamage > 0) {
      await damageAuthenticity(
        eventData.targetBattlerId,
        eventData.battlerId,
        authenticityDamage,
        eventData.targetScandalId || null
      );
    }
  }

  const impactSummary = `+${crowdDelta} crowd perception${authenticityDamage > 0 ? `, -${authenticityDamage} opponent authenticity` : ''}`;

  return {
    eventId: event.id,
    impactSummary,
  };
}

/**
 * Calculate current crowd perception for both battlers in a matchup
 */
export async function calculateCrowdPerception(
  battlerAId: string,
  battlerBId: string,
  battleId: string
): Promise<CrowdPerceptionResult> {
  const supabase = await createServerSupabaseClient();

  // Get relationship between battlers
  const relationshipId = await getOrCreateRelationshipId(battlerAId, battlerBId);

  // Call database function to calculate perception
  const { data: perceptionA } = await supabase.rpc('calculate_crowd_perception', {
    rel_id: relationshipId,
    battler_side: 'a',
    battle_id_param: battleId,
  });

  const { data: perceptionB } = await supabase.rpc('calculate_crowd_perception', {
    rel_id: relationshipId,
    battler_side: 'b',
    battle_id_param: battleId,
  });

  const finalPerceptionA = perceptionA || 50;
  const finalPerceptionB = perceptionB || 50;

  // Determine advantage
  const advantageMargin = Math.abs(finalPerceptionA - finalPerceptionB);
  const advantageFor = finalPerceptionA > finalPerceptionB
    ? battlerAId
    : finalPerceptionB > finalPerceptionA
    ? battlerBId
    : null;

  // Check if 25% Rule was achieved
  const promotionWorked = advantageMargin >= TWENTY_FIVE_PERCENT_RULE;

  return {
    battlerAId,
    battlerBId,
    perceptionA: finalPerceptionA,
    perceptionB: finalPerceptionB,
    advantageFor,
    advantageMargin,
    promotionWorked,
    breakdown: {
      basePerception: 50,
      promotionDelta: finalPerceptionA - 50, // Simplified for now
      scandalPenalty: 0,
      authenticityPenalty: 0,
    },
  };
}

/**
 * Research truth behind a scandal/secret (called during prep phase)
 */
export async function researchTruth(
  researcherId: string,
  scandalId: string,
  daysInvested: number = 1
): Promise<TruthResearchResult> {
  const supabase = await createServerSupabaseClient();

  // Get scandal details
  const { data: scandal } = await supabase
    .from('scandals')
    .select('*')
    .eq('id', scandalId)
    .single();

  if (!scandal) {
    throw new Error('Scandal not found');
  }

  // Calculate research success chance
  const coverUpStrength = scandal.cover_up_strength || 50;
  const baseSuccessRate = coverUpStrength > 70
    ? RESEARCH_DIFFICULTY_FACTORS.cover_up_high
    : coverUpStrength > 30
    ? RESEARCH_DIFFICULTY_FACTORS.cover_up_medium
    : RESEARCH_DIFFICULTY_FACTORS.cover_up_low;

  // Time investment improves odds (each day adds 10% success chance)
  const timeBonus = Math.min(0.4, daysInvested * 0.1); // Max +40% from time
  const totalSuccessRate = Math.min(1.0, baseSuccessRate + timeBonus);

  // Roll for success
  const success = Math.random() < totalSuccessRate;

  let evidenceFound = 0;
  let newVerificationStatus: VerificationStatus = scandal.verification_status;

  if (success) {
    // Research successful - gain evidence
    evidenceFound = Math.floor(20 + Math.random() * 30); // 20-50 evidence points
    const newEvidenceLevel = Math.min(100, (scandal.evidence_level || 0) + evidenceFound);

    // Update verification status based on evidence level
    if (newEvidenceLevel >= 80) {
      newVerificationStatus = 'proven';
    } else if (newEvidenceLevel >= 40) {
      newVerificationStatus = 'debatable';
    } else if (newEvidenceLevel >= 20) {
      newVerificationStatus = 'researching';
    }

    // Update scandal in database
    await supabase
      .from('scandals')
      .update({
        evidence_level: newEvidenceLevel,
        verification_status: newVerificationStatus,
      })
      .eq('id', scandalId);
  } else {
    // Research failed - no new evidence
    newVerificationStatus = 'researching'; // At least mark as being investigated
    await supabase
      .from('scandals')
      .update({
        verification_status: newVerificationStatus,
      })
      .eq('id', scandalId);
  }

  return {
    scandalId,
    researcherId,
    success,
    evidenceFound,
    newVerificationStatus,
    coverUpStrength,
    timeSpent: daysInvested,
  };
}

/**
 * Damage opponent's authenticity score
 */
export async function damageAuthenticity(
  targetBattlerId: string,
  attackerId: string,
  damageAmount: number,
  scandalId: string | null = null
): Promise<AuthenticityDamageResult> {
  const supabase = await createServerSupabaseClient();

  // Get relationship
  const relationshipId = await getOrCreateRelationshipId(attackerId, targetBattlerId);

  const { data: relationship } = await supabase
    .from('battler_relationships')
    .select('*')
    .eq('id', relationshipId)
    .single();

  if (!relationship) {
    throw new Error('Relationship not found');
  }

  // Determine which side is the target
  const targetIsA = relationship.battler_a_id === targetBattlerId;
  const currentAuth = targetIsA
    ? relationship.authenticity_score_a
    : relationship.authenticity_score_b;

  // If scandal is verified, damage is multiplied
  let finalDamage = damageAmount;
  let scandalVerified = false;

  if (scandalId) {
    const { data: scandal } = await supabase
      .from('scandals')
      .select('verification_status, evidence_level')
      .eq('id', scandalId)
      .single();

    if (scandal) {
      scandalVerified = scandal.verification_status === 'proven';
      if (scandalVerified) {
        finalDamage = Math.round(damageAmount * 1.5); // 50% more damage if proven
      } else if (scandal.verification_status === 'disproven') {
        finalDamage = 0; // No damage if disproven
      }
    }
  }

  // Apply damage
  const newAuth = Math.max(0, currentAuth - finalDamage);

  // Update relationship
  const updateData = targetIsA
    ? { authenticity_score_a: newAuth }
    : { authenticity_score_b: newAuth };

  await supabase
    .from('battler_relationships')
    .update(updateData)
    .eq('id', relationshipId);

  return {
    targetBattlerId,
    damageDone: currentAuth - newAuth,
    newAuthenticityScore: newAuth,
    wasEffective: currentAuth > 50 && newAuth <= 50, // Crossed the "sus" threshold
    scandalVerified,
  };
}

/**
 * Update crowd perception on relationship
 */
async function updateCrowdPerception(
  battlerId: string,
  opponentId: string,
  perceptionDelta: number
): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const relationshipId = await getOrCreateRelationshipId(battlerId, opponentId);

  const { data: relationship } = await supabase
    .from('battler_relationships')
    .select('*')
    .eq('id', relationshipId)
    .single();

  if (!relationship) {
    return;
  }

  // Determine which side is which
  const battlerIsA = relationship.battler_a_id === battlerId;

  // Update perception (gains for self, loses for opponent)
  const newPerceptionSelf = battlerIsA
    ? Math.min(100, relationship.crowd_perception_a + perceptionDelta)
    : Math.min(100, relationship.crowd_perception_b + perceptionDelta);

  const newPerceptionOpponent = battlerIsA
    ? Math.max(0, relationship.crowd_perception_b - Math.floor(perceptionDelta / 2))
    : Math.max(0, relationship.crowd_perception_a - Math.floor(perceptionDelta / 2));

  const updateData = battlerIsA
    ? {
        crowd_perception_a: newPerceptionSelf,
        crowd_perception_b: newPerceptionOpponent,
      }
    : {
        crowd_perception_a: newPerceptionOpponent,
        crowd_perception_b: newPerceptionSelf,
      };

  await supabase
    .from('battler_relationships')
    .update(updateData)
    .eq('id', relationshipId);
}

/**
 * Get or create relationship ID between two battlers
 */
async function getOrCreateRelationshipId(
  battler1Id: string,
  battler2Id: string
): Promise<string> {
  const supabase = await createServerSupabaseClient();

  // Call database function
  const { data, error } = await supabase.rpc('get_or_create_relationship', {
    battler_1_id: battler1Id,
    battler_2_id: battler2Id,
    new_origin_type: 'battle',
    new_origin_story: 'Relationship created during promotion phase',
    new_origin_battle_id: null,
  });

  if (error) {
    console.error('Error getting/creating relationship:', error);
    throw error;
  }

  return data;
}

/**
 * Calculate recency multiplier based on days before battle
 */
function calculateRecencyMultiplier(daysBeforeBattle: number): number {
  // Find closest matching key
  const keys = Object.keys(RECENCY_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => a - b);

  for (let i = 0; i < keys.length; i++) {
    if (daysBeforeBattle <= keys[i]) {
      return RECENCY_MULTIPLIERS[keys[i] as keyof typeof RECENCY_MULTIPLIERS];
    }
  }

  // Default to 30+ days
  return RECENCY_MULTIPLIERS[30];
}

// =====================================================
// INTEGRATION WITH BATTLE SIMULATION
// =====================================================

/**
 * Get crowd perception modifiers for battle simulation
 * Called by simulation.ts before battle starts
 */
export async function getCrowdPerceptionModifiers(
  battleId: string,
  battlerPlayerId: string,
  battlerAiId: string
): Promise<{
  playerBonus: number;  // -0.25 to +0.25 (25% swing)
  aiBonus: number;      // -0.25 to +0.25 (25% swing)
  narrative: string;    // Description for battle report
}> {
  const perception = await calculateCrowdPerception(
    battlerPlayerId,
    battlerAiId,
    battleId
  );

  // Convert 0-100 perception to -0.25 to +0.25 modifier
  // 50 = neutral (0 bonus)
  // 75 = +0.25 bonus (25% boost)
  // 25 = -0.25 bonus (25% penalty)
  const playerBonus = (perception.perceptionA - 50) / 100;
  const aiBonus = (perception.perceptionB - 50) / 100;

  // Generate narrative
  let narrative = '';
  if (perception.promotionWorked) {
    const winner = perception.advantageFor === battlerPlayerId ? 'Player' : 'AI';
    narrative = `${winner} won the promotion war, swaying ${perception.advantageMargin}% of the crowd before the battle even started. The pre-battle buzz gives them a significant advantage.`;
  } else if (perception.advantageMargin > 10) {
    const winner = perception.advantageFor === battlerPlayerId ? 'Player' : 'AI';
    narrative = `${winner} did better promotion work (+${perception.advantageMargin}% crowd favor), entering with momentum.`;
  } else {
    narrative = 'Both battlers enter with neutral crowd perception. The battle will be decided on performance alone.';
  }

  return {
    playerBonus,
    aiBonus,
    narrative,
  };
}

/**
 * Get authenticity modifiers for battle simulation
 * Low authenticity reduces crowd reaction
 */
export async function getAuthenticityModifiers(
  battlerPlayerId: string,
  battlerAiId: string
): Promise<{
  playerPenalty: number;  // 0 to -0.50 (up to 50% crowd penalty)
  aiPenalty: number;      // 0 to -0.50 (up to 50% crowd penalty)
  narrative: string;
}> {
  const supabase = await createServerSupabaseClient();

  const relationshipId = await getOrCreateRelationshipId(battlerPlayerId, battlerAiId);

  const { data: relationship } = await supabase
    .from('battler_relationships')
    .select('*')
    .eq('id', relationshipId)
    .single();

  if (!relationship) {
    return {
      playerPenalty: 0,
      aiPenalty: 0,
      narrative: '',
    };
  }

  const playerIsA = relationship.battler_a_id === battlerPlayerId;
  const playerAuth = playerIsA
    ? relationship.authenticity_score_a
    : relationship.authenticity_score_b;
  const aiAuth = playerIsA
    ? relationship.authenticity_score_b
    : relationship.authenticity_score_a;

  // Convert 0-100 authenticity to 0 to -0.50 penalty
  // 100 = no penalty
  // 50 = -0.25 penalty (25% crowd reduction)
  // 0 = -0.50 penalty (50% crowd reduction)
  const playerPenalty = (100 - playerAuth) / 200;
  const aiPenalty = (100 - aiAuth) / 200;

  let narrative = '';
  if (playerAuth < 50) {
    narrative += `Player's authenticity has been damaged (${playerAuth}/100). Crowd is skeptical. `;
  }
  if (aiAuth < 50) {
    narrative += `AI's authenticity has been damaged (${aiAuth}/100). Crowd is skeptical.`;
  }

  return {
    playerPenalty,
    aiPenalty,
    narrative: narrative.trim(),
  };
}
