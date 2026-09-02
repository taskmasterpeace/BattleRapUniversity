/**
 * Single Round Simulation - For "Locked In" Mode
 *
 * Simulates a single round of a battle when player has manually selected content.
 * This is extracted from the main simulation.ts to support round-by-round gameplay.
 */

import type {
  BattlerAttributes,
  League,
  PrepBlock,
  Ranking,
  PrepProfile,
  ModifiedAttributes,
  Battler,
  ScoringContext,
  BattleRound,
  BattleSegment,
} from '@/lib/models';
import {
  calculateBadgeEffects,
  calculatePrepPatternBonus,
  getLeagueBonus,
  type BadgeEffects,
} from './badges';
import { SIMULATION_CONFIG as CONFIG } from './config';
import { facetsOf, getOrDiscoverAngles } from './angleDiscovery';
import { type ContentSelection } from './roundContentSelection';
import { calculateEffectivenessForecast } from './roundContentSelection';
import { distributeContentAcrossSegments } from './segmentContentDistribution';

/**
 * Simulate a single round for locked-in mode
 * Returns round and segment data for the player
 */
/** Per-round modifiers produced by pressure moves (talk-overs, bumps). */
export type PressureModifiers = {
  playerStumbleDelta: number;
  aiStumbleDelta: number;
  playerStressDelta: number;
  aiStressDelta: number;
  playerCrowdDelta: number;
  aiCrowdDelta: number;
};

export async function simulateSingleRound(
  supabase: any,
  battleId: string,
  roundIndex: number,
  context: ScoringContext,
  playerBattler: Battler,
  aiBattler: Battler,
  pressure?: PressureModifiers
): Promise<{
  playerRound: BattleRound;
  aiRound: BattleRound;
  playerSegments: BattleSegment[];
  aiSegments: BattleSegment[];
}> {
  // Load battle data
  const { data: battle } = await supabase
    .from('battles')
    .select('*, league:leagues(*)')
    .eq('id', battleId)
    .single();

  if (!battle) {
    throw new Error(`Battle ${battleId} not found`);
  }

  // Load league
  const league: League = battle.league;

  // Load both battlers' data
  const [playerData, aiData] = await Promise.all([
    loadBattlerData(supabase, battle.battler_player_id, battleId),
    loadBattlerData(supabase, battle.battler_ai_id, battleId),
  ]);

  // Load content selections for this round
  const { data: contentSelections } = await supabase
    .from('round_content_selections')
    .select('*')
    .eq('battle_id', battleId)
    .eq('round_index', roundIndex)
    .in('battler_id', [battle.battler_player_id, battle.battler_ai_id]);

  const playerSelectionDb = contentSelections?.find(
    (s: any) => s.battler_id === battle.battler_player_id
  );
  const aiSelectionDb = contentSelections?.find(
    (s: any) => s.battler_id === battle.battler_ai_id
  );

  if (!playerSelectionDb || !aiSelectionDb) {
    throw new Error('Content selections not found for this round');
  }

  const playerSelection: ContentSelection = {
    contentTypes: playerSelectionDb.content_types,
    deliveryTypes: playerSelectionDb.delivery_types,
    performanceTypes: playerSelectionDb.performance_types,
  };

  const aiSelection: ContentSelection = {
    contentTypes: aiSelectionDb.content_types,
    deliveryTypes: aiSelectionDb.delivery_types,
    performanceTypes: aiSelectionDb.performance_types,
  };

  // Calculate badge effects
  const playerBadgeEffects = calculateBadgeEffects(playerBattler.style_tags || []);
  const aiBadgeEffects = calculateBadgeEffects(aiBattler.style_tags || []);

  // Build prep profiles
  const playerPrepProfile = buildPrepProfile(playerData.prepBlocks);
  const aiPrepProfile = buildPrepProfile(aiData.prepBlocks);

  // ANGLES — round-stable: the research dig happens once per battle (round 1
  // rolls + persists to battle_intelligence, later rounds read it back).
  playerPrepProfile.angleFacets = await getOrDiscoverAngles(
    supabase,
    battleId,
    battle.battler_player_id,
    battle.battler_ai_id,
    playerPrepProfile.researchDays,
    facetsOf(aiBattler)
  );
  aiPrepProfile.angleFacets = await getOrDiscoverAngles(
    supabase,
    battleId,
    battle.battler_ai_id,
    battle.battler_player_id,
    aiPrepProfile.researchDays,
    facetsOf(playerBattler)
  );

  // Apply prep modifiers to attributes
  const playerModified = applyPrepModifiers(
    playerData.attributes,
    playerPrepProfile,
    battle.no_show_player,
    playerBadgeEffects,
    league
  );
  const aiModified = applyPrepModifiers(
    aiData.attributes,
    aiPrepProfile,
    false,
    aiBadgeEffects,
    league
  );

  // PRESSURE MOVES — talk-overs and bumps land as round-scoped stress and
  // stumble risk (stress already feeds choke/stumble math; the stumble delta
  // rides through the badge stumbleReduction channel with inverted sign).
  if (pressure) {
    playerModified.stress = Math.min(100, playerModified.stress + pressure.playerStressDelta);
    aiModified.stress = Math.min(100, aiModified.stress + pressure.aiStressDelta);
    playerBadgeEffects.stumbleReduction =
      (playerBadgeEffects.stumbleReduction || 0) - pressure.playerStumbleDelta;
    aiBadgeEffects.stumbleReduction =
      (aiBadgeEffects.stumbleReduction || 0) - pressure.aiStumbleDelta;
  }

  // Determine segments per round based on league
  const segmentsPerRound = league.round_length_minutes === 2 ? 4 : 6;

  // Calculate effectiveness forecasts
  const playerForecast = calculateEffectivenessForecast(
    playerSelection,
    aiSelection,
    league.name,
    context
  );

  const aiForecast = calculateEffectivenessForecast(
    aiSelection,
    playerSelection,
    league.name,
    context
  );

  // Rail the combined content multiplier (see FINAL_MULTIPLIER_* in config) so a
  // perfect-storm forecast is a huge deserved edge, not a runaway coin-flip.
  const clampFinal = (m: number) =>
    Math.max(CONFIG.FINAL_MULTIPLIER_MIN, Math.min(CONFIG.FINAL_MULTIPLIER_MAX, m));
  playerForecast.finalMultiplier = clampFinal(playerForecast.finalMultiplier);
  aiForecast.finalMultiplier = clampFinal(aiForecast.finalMultiplier);

  // Simulate segments
  const segments: any[] = [];
  const playerSegmentScores: number[] = [];
  const aiSegmentScores: number[] = [];
  const playerSegmentEvents: string[][] = [];
  const aiSegmentEvents: string[][] = [];
  const playerWritingPowers: number[] = [];
  const playerPerformancePowers: number[] = [];
  const aiWritingPowers: number[] = [];
  const aiPerformancePowers: number[] = [];

  const playerWritingPower =
    (playerModified.writing.lyricism +
      playerModified.writing.wordplay +
      playerModified.writing.creativity) /
    3;
  const playerPerformancePower =
    (playerModified.performance.stage_presence +
      playerModified.performance.crowd_control +
      playerModified.performance.delivery) /
    3;
  const aiWritingPower =
    (aiModified.writing.lyricism + aiModified.writing.wordplay + aiModified.writing.creativity) / 3;
  const aiPerformancePower =
    (aiModified.performance.stage_presence +
      aiModified.performance.crowd_control +
      aiModified.performance.delivery) /
    3;

  // SKILL-GAP CONTENT DAMPING (owner law 2026-09-01): the bigger the skill gap,
  // the less a content counter can swing it — a god-tier can't be countered out
  // of a win by a low-tier. Same tier → content fully decides. Mirrors the auto
  // engine (simulation.ts).
  const playerRelPower = league.writing_weight >= league.performance_weight ? playerWritingPower : playerPerformancePower;
  const aiRelPower = league.writing_weight >= league.performance_weight ? aiWritingPower : aiPerformancePower;
  const skillGap = Math.abs(playerRelPower - aiRelPower);
  const contentInfluence = Math.max(
    CONFIG.SKILL_GAP_CONTENT_DAMP_FLOOR,
    Math.min(1, 1 - skillGap * CONFIG.SKILL_GAP_CONTENT_DAMP_COEF)
  );
  const dampedPlayerMult = 1 + (playerForecast.finalMultiplier - 1) * contentInfluence;
  const dampedAiMult = 1 + (aiForecast.finalMultiplier - 1) * contentInfluence;

  // Simulate each segment
  for (let segmentIndex = 1; segmentIndex <= segmentsPerRound; segmentIndex++) {
    const playerSegment = simulateSegment(
      battle.battler_player_id,
      playerModified,
      playerPrepProfile,
      league,
      roundIndex,
      segmentIndex,
      battle.no_show_player,
      playerBadgeEffects,
      aiWritingPower,
      aiPerformancePower
    );
    const aiSegment = simulateSegment(
      battle.battler_ai_id,
      aiModified,
      aiPrepProfile,
      league,
      roundIndex,
      segmentIndex,
      false,
      aiBadgeEffects,
      playerWritingPower,
      playerPerformancePower
    );

    // Apply content effectiveness multipliers. simulateSegment() already clamps
    // to SCORE_CEILING, but the multiplier is applied AFTER that clamp — so a
    // top-tier battler at the ceiling could be pushed past it (e.g. 11 × 1.26 =
    // 13.8), breaking the 0–SCORE_CEILING scale. Re-clamp the ceiling here. The
    // floor is deliberately NOT re-applied so a weak-matchup multiplier (<1) can
    // still drag a score below the base floor as an intended penalty.
    const playerAdjustedScore = Math.min(
      CONFIG.SCORE_CEILING,
      playerSegment.score * dampedPlayerMult
    );
    const aiAdjustedScore = Math.min(
      CONFIG.SCORE_CEILING,
      aiSegment.score * dampedAiMult
    );

    playerSegmentScores.push(playerAdjustedScore);
    aiSegmentScores.push(aiAdjustedScore);
    playerSegmentEvents.push(playerSegment.events);
    aiSegmentEvents.push(aiSegment.events);
    playerWritingPowers.push(playerSegment.writingPower);
    playerPerformancePowers.push(playerSegment.performancePower);
    aiWritingPowers.push(aiSegment.writingPower);
    aiPerformancePowers.push(aiSegment.performancePower);

    segments.push(
      {
        round_index: roundIndex,
        segment_index: segmentIndex,
        battler_id: battle.battler_player_id,
        segment_score: playerAdjustedScore,
        event_flags: playerSegment.events,
        crowd_reaction: playerSegment.crowdReaction,
      },
      {
        round_index: roundIndex,
        segment_index: segmentIndex,
        battler_id: battle.battler_ai_id,
        segment_score: aiAdjustedScore,
        event_flags: aiSegment.events,
        crowd_reaction: aiSegment.crowdReaction,
      }
    );
  }

  // Distribute content across segments for player and AI
  const playerSegmentData = segments
    .filter((s) => s.battler_id === battle.battler_player_id)
    .map((s, idx) => ({
      segmentIndex: s.segment_index,
      score: s.segment_score,
      eventFlags: s.event_flags,
    }));

  const aiSegmentData = segments
    .filter((s) => s.battler_id === battle.battler_ai_id)
    .map((s, idx) => ({
      segmentIndex: s.segment_index,
      score: s.segment_score,
      eventFlags: s.event_flags,
    }));

  const playerContentAssignments = distributeContentAcrossSegments({
    roundContentTypes: playerSelection.contentTypes,
    roundDeliveryTypes: playerSelection.deliveryTypes,
    roundPerformanceTypes: playerSelection.performanceTypes,
    segments: playerSegmentData,
    battlerBadges: playerBattler.style_tags || [],
  });

  const aiContentAssignments = distributeContentAcrossSegments({
    roundContentTypes: aiSelection.contentTypes,
    roundDeliveryTypes: aiSelection.deliveryTypes,
    roundPerformanceTypes: aiSelection.performanceTypes,
    segments: aiSegmentData,
    battlerBadges: aiBattler.style_tags || [],
  });

  // Apply content assignments to segments
  segments.forEach((segment) => {
    const isPlayer = segment.battler_id === battle.battler_player_id;
    const assignments = isPlayer ? playerContentAssignments : aiContentAssignments;
    const assignment = assignments.find((a) => a.segmentIndex === segment.segment_index);

    if (assignment) {
      segment.primary_content_type = assignment.primaryContent;
      segment.secondary_content_type = assignment.secondaryContent;
      segment.delivery_type = assignment.delivery;
      segment.performance_type = assignment.performance;
      segment.content_effectiveness = assignment.effectiveness;
    }
  });

  // Calculate average power values
  const playerAvgWritingPower =
    playerWritingPowers.reduce((a, b) => a + b, 0) / playerWritingPowers.length;
  const playerAvgPerformancePower =
    playerPerformancePowers.reduce((a, b) => a + b, 0) / playerPerformancePowers.length;
  const aiAvgWritingPower = aiWritingPowers.reduce((a, b) => a + b, 0) / aiWritingPowers.length;
  const aiAvgPerformancePower =
    aiPerformancePowers.reduce((a, b) => a + b, 0) / aiPerformancePowers.length;

  // Calculate round summaries
  const playerRound = calculateRoundSummary(
    battle.battler_player_id,
    roundIndex,
    playerSegmentScores,
    playerSegmentEvents,
    playerModified,
    league,
    playerBadgeEffects,
    playerAvgWritingPower,
    playerAvgPerformancePower,
    playerSelection,
    playerForecast.averageEffectiveness,
    playerForecast.crowdPreference,
    playerForecast.contextModifier,
    playerForecast.finalMultiplier
  );

  const aiRound = calculateRoundSummary(
    battle.battler_ai_id,
    roundIndex,
    aiSegmentScores,
    aiSegmentEvents,
    aiModified,
    league,
    aiBadgeEffects,
    aiAvgWritingPower,
    aiAvgPerformancePower,
    aiSelection,
    aiForecast.averageEffectiveness,
    aiForecast.crowdPreference,
    aiForecast.contextModifier,
    aiForecast.finalMultiplier
  );

  // PRESSURE — room heat and backfired moves land directly on the crowd.
  if (pressure) {
    playerRound.crowd_reaction = Math.min(
      100,
      Math.max(0, playerRound.crowd_reaction + Math.round(pressure.playerCrowdDelta))
    );
    aiRound.crowd_reaction = Math.min(
      100,
      Math.max(0, aiRound.crowd_reaction + Math.round(pressure.aiCrowdDelta))
    );
  }

  // REPUTATION teeth — the same ones the auto-sim applies, so a fearsome rep bites
  // in the player's OWN battles too, not just other people's:
  //  · crowdDelta  → the room warms/cools to who you are (presentational).
  //  · opponentPrepBias → a notable opponent makes BOTH battlers sharpen; lands on
  //    average_score, which DECIDES the lock-in winner (score·(1+bias·0.06), matching
  //    simulation.ts). This is what makes the tooth competitive here, not cosmetic.
  //  · pressurePenalty → target-on-your-back nerves → a shakier showing (consistency).
  try {
    const { loadReputationModifiers } = await import('@/lib/game/reputationLoader');
    const [pMods, aMods] = await Promise.all([
      loadReputationModifiers(supabase, battle.battler_player_id),
      loadReputationModifiers(supabase, battle.battler_ai_id),
    ]);
    playerRound.crowd_reaction = Math.min(100, Math.max(0, playerRound.crowd_reaction + Math.round(pMods.crowdDelta)));
    aiRound.crowd_reaction = Math.min(100, Math.max(0, aiRound.crowd_reaction + Math.round(aMods.crowdDelta)));

    const clamp10 = (n: number) => Math.min(10, Math.max(0, n));
    // Player sharpens vs a notable AI; AI sharpens vs a notable player (bias comes
    // from the OTHER battler, exactly as repTeeth.playerPrepBoost/aiPrepBoost do).
    playerRound.average_score = Number(clamp10(playerRound.average_score * (1 + aMods.opponentPrepBias * 0.06)).toFixed(3));
    aiRound.average_score = Number(clamp10(aiRound.average_score * (1 + pMods.opponentPrepBias * 0.06)).toFixed(3));
    if (playerRound.consistency_score != null)
      playerRound.consistency_score = Math.max(0, Math.round(playerRound.consistency_score - pMods.pressurePenalty * 40));
    if (aiRound.consistency_score != null)
      aiRound.consistency_score = Math.max(0, Math.round(aiRound.consistency_score - aMods.pressurePenalty * 40));
  } catch (repErr) {
    console.error('[reputation] interactive teeth load failed (non-fatal):', repErr);
  }

  // Determine round winner
  const playerWon =
    playerRound.average_score > aiRound.average_score ||
    (playerRound.average_score === aiRound.average_score &&
      playerRound.peak_score > aiRound.peak_score);

  // Calculate momentum delta
  const scoreDiff = Math.abs(playerRound.average_score - aiRound.average_score);
  const momentumValue = Math.min(1.0, scoreDiff / 10);

  playerRound.momentum_delta = Number((playerWon ? momentumValue : -momentumValue).toFixed(3));
  aiRound.momentum_delta = Number((playerWon ? -momentumValue : momentumValue).toFixed(3));

  // Save to database
  const segmentsWithBattleId = segments.map((s) => ({
    ...s,
    battle_id: battleId,
  }));

  await supabase.from('battle_segments').insert(segmentsWithBattleId);

  const roundsToInsert = [
    {
      ...playerRound,
      battle_id: battleId,
    },
    {
      ...aiRound,
      battle_id: battleId,
    },
  ];

  await supabase.from('battle_rounds').insert(roundsToInsert);

  // Return data
  const playerSegments = segmentsWithBattleId.filter(
    (s) => s.battler_id === battle.battler_player_id
  ) as BattleSegment[];
  const aiSegments = segmentsWithBattleId.filter(
    (s) => s.battler_id === battle.battler_ai_id
  ) as BattleSegment[];

  return {
    playerRound: playerRound as unknown as BattleRound,
    aiRound: aiRound as unknown as BattleRound,
    playerSegments,
    aiSegments,
  };
}

// Helper functions (copied from simulation.ts)

async function loadBattlerData(supabase: any, battlerId: string, battleId: string) {
  const [attributes, rankingData, prepBlocks] = await Promise.all([
    supabase
      .from('battler_attributes')
      .select('*')
      .eq('battler_id', battlerId)
      .single()
      .then((r: any) => r.data),
    supabase
      .from('rankings')
      .select('*')
      .eq('battler_id', battlerId)
      .single()
      .then((r: any) => r.data),
    supabase
      .from('prep_blocks')
      .select('*')
      .eq('battle_id', battleId)
      .eq('battler_id', battlerId)
      .then((r: any) => r.data || []),
  ]);

  let ranking = rankingData;
  if (!ranking) {
    const defaultRanking = {
      battler_id: battlerId,
      rating: 1200,
      wins: 0,
      losses: 0,
      streak: 0,
    };
    await supabase.from('rankings').insert(defaultRanking);
    ranking = defaultRanking;
  }

  return { attributes, ranking, prepBlocks };
}

function buildPrepProfile(prepBlocks: PrepBlock[]): PrepProfile {
  const profile: PrepProfile = {
    researchDays: 0,
    writingDays: 0,
    performanceDays: 0,
    lifeDays: 0,
    restDays: 0,
  };

  for (const block of prepBlocks) {
    switch (block.focus) {
      case 'research':
        profile.researchDays++;
        break;
      case 'writing':
        profile.writingDays++;
        break;
      case 'performance':
        profile.performanceDays++;
        break;
      case 'life':
        profile.lifeDays++;
        break;
      case 'rest':
        profile.restDays++;
        break;
    }
  }

  return profile;
}

function applyPrepModifiers(
  attributes: BattlerAttributes,
  prep: PrepProfile,
  isNoShow: boolean,
  badgeEffects: BadgeEffects,
  league: League
): ModifiedAttributes {
  const defaultPersonal = {
    financial_stability: 5,
    reputation: 5,
    family_bond: 5,
    preparation: 5,
  };

  const modified: ModifiedAttributes = {
    writing: { ...attributes.writing },
    performance: { ...attributes.performance },
    personal: attributes.personal ? { ...attributes.personal } : { ...defaultPersonal },
    resilience: attributes.resilience,
    // Rest days relieve battle-night stress (same rule as the full sim)
    stress: Math.max(0, (attributes.stress ?? 0) - prep.restDays * CONFIG.STRESS_REST_RELIEF),
    public_knowledge: attributes.public_knowledge ?? 0,
  };

  const preparationAttribute = (attributes.personal && attributes.personal.preparation) || 5;
  const prepEfficiencyMultiplier = 1 + preparationAttribute / 20;
  const effectivePrepMultiplier = CONFIG.PREP_EFFECT_MULTIPLIER * prepEfficiencyMultiplier;

  // Apply prep improvements (same logic as main simulation)
  const writingBoost = prep.writingDays * effectivePrepMultiplier * badgeEffects.writingPrepEfficiency;
  modified.writing.lyricism = Math.min(10, attributes.writing.lyricism + writingBoost);
  modified.writing.wordplay = Math.min(10, attributes.writing.wordplay + writingBoost);
  modified.writing.creativity = Math.min(10, attributes.writing.creativity + writingBoost);

  const performanceBoost =
    prep.performanceDays * effectivePrepMultiplier * badgeEffects.performancePrepEfficiency;
  modified.performance.stage_presence = Math.min(
    10,
    attributes.performance.stage_presence + performanceBoost
  );
  modified.performance.crowd_control = Math.min(
    10,
    attributes.performance.crowd_control + performanceBoost
  );
  modified.performance.delivery = Math.min(10, attributes.performance.delivery + performanceBoost);

  const researchBoost =
    prep.researchDays * effectivePrepMultiplier * badgeEffects.researchPrepEfficiency;
  modified.writing.creativity = Math.min(10, modified.writing.creativity + researchBoost * 0.5);
  modified.writing.lyricism = Math.min(10, modified.writing.lyricism + researchBoost * 0.3);

  // ANGLES — personal material found on the opponent lands harder.
  const angleCount = prep.angleFacets?.length ?? 0;
  if (angleCount > 0) {
    const angleEdge = angleCount * CONFIG.ANGLE_FACET_WRITING_BONUS;
    modified.writing.lyricism = Math.min(10, modified.writing.lyricism + angleEdge);
    modified.writing.creativity = Math.min(10, modified.writing.creativity + angleEdge);
  }

  const resilienceBoost = prep.restDays * effectivePrepMultiplier * badgeEffects.restEfficiency;
  modified.resilience = Math.min(10, attributes.resilience + resilienceBoost);

  const lifeBoost = prep.lifeDays * effectivePrepMultiplier * badgeEffects.lifePrepEfficiency;
  modified.personal.family_bond = Math.min(10, attributes.personal.family_bond + lifeBoost);
  modified.personal.financial_stability = Math.min(
    10,
    attributes.personal.financial_stability + lifeBoost * 0.5
  );
  modified.personal.preparation = Math.min(
    10,
    attributes.personal.preparation + lifeBoost * 0.3
  );

  // Apply badge multipliers
  modified.writing.lyricism *= badgeEffects.lyricismMultiplier;
  modified.writing.wordplay *= badgeEffects.wordplayMultiplier;
  modified.writing.creativity *= badgeEffects.creativityMultiplier;
  modified.performance.stage_presence *= badgeEffects.stagePresenceMultiplier;
  modified.performance.crowd_control *= badgeEffects.crowdControlMultiplier;
  modified.performance.delivery *= badgeEffects.deliveryMultiplier;

  // Clamp after multipliers
  modified.writing.lyricism = Math.min(10, modified.writing.lyricism);
  modified.writing.wordplay = Math.min(10, modified.writing.wordplay);
  modified.writing.creativity = Math.min(10, modified.writing.creativity);
  modified.performance.stage_presence = Math.min(10, modified.performance.stage_presence);
  modified.performance.crowd_control = Math.min(10, modified.performance.crowd_control);
  modified.performance.delivery = Math.min(10, modified.performance.delivery);

  // Apply prep pattern bonus
  const prepPatternBonus = calculatePrepPatternBonus(prep, badgeEffects);
  if (prepPatternBonus > 0) {
    modified.writing.lyricism = Math.min(10, modified.writing.lyricism * (1 + prepPatternBonus));
    modified.writing.wordplay = Math.min(10, modified.writing.wordplay * (1 + prepPatternBonus));
    modified.writing.creativity = Math.min(10, modified.writing.creativity * (1 + prepPatternBonus));
    modified.performance.stage_presence = Math.min(
      10,
      modified.performance.stage_presence * (1 + prepPatternBonus)
    );
    modified.performance.crowd_control = Math.min(
      10,
      modified.performance.crowd_control * (1 + prepPatternBonus)
    );
    modified.performance.delivery = Math.min(10, modified.performance.delivery * (1 + prepPatternBonus));
    modified.resilience = Math.min(10, modified.resilience * (1 + prepPatternBonus));
  }

  // Apply league bonus
  const leagueBonus = getLeagueBonus(league.round_length_minutes, badgeEffects);
  if (leagueBonus !== 0) {
    const leagueMult = 1 + leagueBonus;
    modified.writing.lyricism = Math.min(10, modified.writing.lyricism * leagueMult);
    modified.writing.wordplay = Math.min(10, modified.writing.wordplay * leagueMult);
    modified.writing.creativity = Math.min(10, modified.writing.creativity * leagueMult);
    modified.performance.stage_presence = Math.min(
      10,
      modified.performance.stage_presence * leagueMult
    );
    modified.performance.crowd_control = Math.min(
      10,
      modified.performance.crowd_control * leagueMult
    );
    modified.performance.delivery = Math.min(10, modified.performance.delivery * leagueMult);
  }

  // No-show penalty
  if (isNoShow) {
    modified.writing.lyricism *= CONFIG.NO_SHOW_PENALTY;
    modified.writing.wordplay *= CONFIG.NO_SHOW_PENALTY;
    modified.writing.creativity *= CONFIG.NO_SHOW_PENALTY;
    modified.performance.stage_presence *= CONFIG.NO_SHOW_PENALTY;
    modified.performance.crowd_control *= CONFIG.NO_SHOW_PENALTY;
    modified.performance.delivery *= CONFIG.NO_SHOW_PENALTY;
    modified.resilience *= CONFIG.NO_SHOW_PENALTY;
  }

  return modified;
}

function simulateSegment(
  battlerId: string,
  attrs: ModifiedAttributes,
  prep: PrepProfile,
  league: League,
  roundIndex: number,
  segmentIndex: number,
  isNoShow: boolean,
  badgeEffects: BadgeEffects,
  opponentWritingPower: number,
  opponentPerformancePower: number
): { score: number; events: string[]; writingPower: number; performancePower: number; crowdReaction: number } {
  const events: string[] = [];

  const writingPower =
    (attrs.writing.lyricism + attrs.writing.wordplay + attrs.writing.creativity) / 3;
  const performancePower =
    (attrs.performance.stage_presence + attrs.performance.crowd_control + attrs.performance.delivery) / 3;

  const baseScore = writingPower * league.writing_weight + performancePower * league.performance_weight;

  // Attribute gap multiplier
  const relevantGap =
    league.writing_weight > 0.6
      ? writingPower - opponentWritingPower
      : performancePower - opponentPerformancePower;

  let gapMultiplier = 1.0;
  if (relevantGap > 3) {
    gapMultiplier = CONFIG.ATTRIBUTE_GAP_HUGE_MULTIPLIER;
  } else if (relevantGap > 2) {
    gapMultiplier = CONFIG.ATTRIBUTE_GAP_MEDIUM_MULTIPLIER;
  }

  // Random variance
  const adjustedVariance = CONFIG.SEGMENT_VARIANCE * badgeEffects.segmentVarianceMultiplier;
  const variance = (Math.random() - 0.5) * 2 * adjustedVariance;
  let finalScore = baseScore * gapMultiplier * (1 + variance);

  // Peak chance
  const peakChance =
    (prep.researchDays > 0 ? CONFIG.PEAK_PROBABILITY : CONFIG.PEAK_PROBABILITY * 0.5) *
    (1 + (prep.angleFacets?.length ?? 0) * CONFIG.ANGLE_FACET_PEAK_MULT);
  if (Math.random() < peakChance) {
    finalScore *= 1.2 + badgeEffects.peakBonus;
    events.push('haymaker');
  }

  // Stumble check
  const delivery = attrs.performance.delivery;
  const crowdControl = attrs.performance.crowd_control;
  const flow = (attrs.writing as any).flow || delivery;
  const deliveryFlow = (delivery + flow) / 2;

  let stumbleProbability = CONFIG.STUMBLE_BASE_PROBABILITY;
  stumbleProbability -= prep.performanceDays * CONFIG.STUMBLE_PREP_REDUCTION;
  stumbleProbability -= Math.max(0, deliveryFlow - 5) * CONFIG.STUMBLE_ABILITY_REDUCTION;
  stumbleProbability += ((attrs.stress || 0) / 100) * CONFIG.STUMBLE_STRESS_MULTIPLIER;
  stumbleProbability -= badgeEffects.stumbleReduction || 0;
  stumbleProbability += badgeEffects.stumbleIncrease || 0;
  stumbleProbability = Math.max(
    CONFIG.STUMBLE_MINIMUM,
    Math.min(CONFIG.STUMBLE_MAXIMUM, stumbleProbability)
  );

  const stumbleThreshold = isNoShow
    ? Math.min(CONFIG.STUMBLE_MAXIMUM, stumbleProbability * 2)
    : stumbleProbability;

  let stumbled = false;
  if (Math.random() < stumbleThreshold) {
    stumbled = true;
    const recoverySkill = (delivery + crowdControl) / 2;
    if (recoverySkill >= 8.0) {
      finalScore *= CONFIG.STUMBLE_RECOVERY_MULTIPLIER;
    } else {
      finalScore *= CONFIG.STUMBLE_SCORE_MULTIPLIER;
    }
    events.push('stumble');
  }

  // Choke check (only if didn't stumble)
  if (!stumbled) {
    const familyBond = (attrs.personal && attrs.personal.family_bond) || 5;
    const effectiveResilience = attrs.resilience + familyBond / 10;
    const resilienceAboveAverage = Math.max(0, effectiveResilience - 5);

    let chokeProbability = CONFIG.CHOKE_BASE_PROBABILITY;
    chokeProbability -= resilienceAboveAverage * CONFIG.CHOKE_RESILIENCE_FACTOR;
    chokeProbability -= prep.writingDays * CONFIG.CHOKE_PREP_REDUCTION;

    // Stress + fame pressure — parity with the full sim's choke formula
    chokeProbability += ((attrs.stress || 0) / 100) * CONFIG.CHOKE_STRESS_MULTIPLIER;
    const publicKnowledge = attrs.public_knowledge || 0;
    if (publicKnowledge > CONFIG.CHOKE_FAME_THRESHOLD) {
      chokeProbability += (publicKnowledge - CONFIG.CHOKE_FAME_THRESHOLD) * CONFIG.CHOKE_FAME_MULTIPLIER;
    }

    const financialStability = (attrs.personal && attrs.personal.financial_stability) || 5;
    const totalPrep = prep.writingDays + prep.performanceDays + prep.researchDays;

    if (financialStability < 4 && totalPrep < 5) {
      const prepPenaltyMultiplier = 1.0 - totalPrep / 10;
      chokeProbability +=
        (4 - financialStability) * CONFIG.CHOKE_FINANCIAL_PRESSURE * prepPenaltyMultiplier;
    }

    chokeProbability -= badgeEffects.chokeReduction;
    chokeProbability += badgeEffects.chokeIncrease;
    chokeProbability = Math.max(
      CONFIG.CHOKE_MINIMUM,
      Math.min(CONFIG.CHOKE_MAXIMUM, chokeProbability)
    );

    const chokeThreshold = isNoShow
      ? Math.min(CONFIG.CHOKE_MAXIMUM, chokeProbability * 3)
      : chokeProbability;

    if (Math.random() < chokeThreshold) {
      finalScore *= CONFIG.CHOKE_SCORE_MULTIPLIER;
      events.push('choke');
    }
  }

  finalScore = Math.max(CONFIG.SCORE_FLOOR, Math.min(CONFIG.SCORE_CEILING, finalScore));

  // Crowd reaction
  let segmentCrowdReaction = Math.round(
    (finalScore / 10) * 60 + (performancePower / 10) * 40 * league.base_crowd_factor
  );

  if (events.includes('haymaker')) {
    segmentCrowdReaction += 15;
  }

  segmentCrowdReaction += badgeEffects.crowdReactionBonus;
  segmentCrowdReaction = Math.min(100, Math.max(0, segmentCrowdReaction));

  return {
    score: finalScore,
    events,
    writingPower,
    performancePower,
    crowdReaction: segmentCrowdReaction,
  };
}

function calculateRoundSummary(
  battlerId: string,
  roundIndex: number,
  segmentScores: number[],
  segmentEvents: string[][],
  attrs: ModifiedAttributes,
  league: League,
  badgeEffects: BadgeEffects,
  avgWritingPower: number,
  avgPerformancePower: number,
  contentSelection?: ContentSelection,
  effectivenessMultiplier?: number,
  crowdPreferenceMultiplier?: number,
  contextModifier?: number,
  finalMultiplier?: number
) {
  const average_score = segmentScores.reduce((a, b) => a + b, 0) / segmentScores.length;
  const peak_score = Math.max(...segmentScores);

  let consistency_score = 10 - standardDeviation(segmentScores);
  consistency_score += badgeEffects.consistencyBonus;
  consistency_score -= badgeEffects.consistencyPenalty;
  consistency_score = Math.max(0, Math.min(10, consistency_score));

  const hasChoke = segmentEvents.some((events) => events.includes('choke'));

  const performancePower =
    (attrs.performance.stage_presence + attrs.performance.crowd_control + attrs.performance.delivery) / 3;

  let crowd_reaction = Math.round(
    (average_score / 10) * 50 + (performancePower / 10) * 50 * league.base_crowd_factor
  );

  crowd_reaction += badgeEffects.crowdReactionBonus;
  crowd_reaction = Math.min(100, Math.max(0, crowd_reaction));

  const totalPower = avgWritingPower + avgPerformancePower;
  const writing_contribution = Number((avgWritingPower / totalPower).toFixed(3));
  const performance_contribution = Number((avgPerformancePower / totalPower).toFixed(3));

  return {
    battler_id: battlerId,
    round_index: roundIndex,
    average_score: Number(average_score.toFixed(2)),
    peak_score: Number(peak_score.toFixed(2)),
    consistency_score: Number(consistency_score.toFixed(2)),
    momentum_delta: 0,
    crowd_reaction,
    choked: hasChoke,
    writing_contribution,
    performance_contribution,
    summary_text: null,
    content_types: contentSelection?.contentTypes,
    delivery_types: contentSelection?.deliveryTypes,
    performance_types: contentSelection?.performanceTypes,
    effectiveness_multiplier: effectivenessMultiplier,
    crowd_preference_multiplier: crowdPreferenceMultiplier,
    context_modifier: contextModifier,
    final_multiplier: finalMultiplier,
  };
}

function standardDeviation(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}
