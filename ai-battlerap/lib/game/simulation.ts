import type {
  Battle,
  BattlerAttributes,
  League,
  PrepBlock,
  Ranking,
  PrepProfile,
  ModifiedAttributes,
  Battler,
  RoundContentSelection,
  ScoringContext,
} from '@/lib/models';
import {
  calculateBadgeEffects,
  calculatePrepPatternBonus,
  getLeagueBonus,
  type BadgeEffects,
} from './badges';
import { SIMULATION_CONFIG as CONFIG } from './config';
import {
  autoSelectContent,
  calculateEffectivenessForecast,
  type ContentSelection,
} from './roundContentSelection';
import { calculateAverageEffectiveness } from './contentEffectiveness';
import { calculateCrowdPreference } from './crowdDemographics';
import { getLeagueContextModifier } from './contextModifiers';
import { distributeContentAcrossSegments } from './segmentContentDistribution';
import { getJudgeProfile } from './judgePreferences';
import { scoreTournamentBattle } from './judgeScoring';
import {
  getCrowdPerceptionModifiers,
  getAuthenticityModifiers,
} from './promotionEngine';

/**
 * Main simulation function
 * Simulates a complete 3-round battle between player and AI
 */
export async function simulateBattle(
  battleId: string,
  supabase: any,
  options?: { seed?: number }
): Promise<void> {

  // 1. Load all battle data
  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single();

  if (!battle) {
    throw new Error(`Battle ${battleId} not found`);
  }

  // Idempotency check - prevent double-simulation
  if (battle.status === 'completed' || battle.status === 'forfeit') {
    console.log(`Battle ${battleId} already completed, skipping simulation`);
    return;
  }

  // Load league config
  const { data: league } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', battle.league_id)
    .single();

  if (!league) {
    throw new Error('League not found');
  }

  // Load both battlers' data (including battler records for style_tags)
  const [playerData, aiData, playerBattler, aiBattler] = await Promise.all([
    loadBattlerData(supabase, battle.battler_player_id, battleId),
    loadBattlerData(supabase, battle.battler_ai_id, battleId),
    supabase.from('battlers').select('*').eq('id', battle.battler_player_id).single().then((r: any) => r.data),
    supabase.from('battlers').select('*').eq('id', battle.battler_ai_id).single().then((r: any) => r.data),
  ]);

  // Check for no-show (player has no prep blocks) - this should be a forfeit
  if (playerData.prepBlocks.length === 0) {
    await handleForfeit(
      supabase,
      battleId,
      battle.battler_ai_id,
      playerData.ranking,
      aiData.ranking,
      battle.battler_player_id,
      battle.battler_ai_id
    );
    return;
  }

  // 2. Calculate badge effects for both battlers
  const playerBadgeEffects = calculateBadgeEffects(playerBattler?.style_tags || []);
  const aiBadgeEffects = calculateBadgeEffects(aiBattler?.style_tags || []);

  // 3. Build prep profiles
  const playerPrepProfile = buildPrepProfile(playerData.prepBlocks);
  const aiPrepProfile = buildPrepProfile(aiData.prepBlocks);

  // 4. Apply prep modifiers to attributes (now with badge effects)
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

  // 5. Determine segments per round based on league
  const segmentsPerRound = league.round_length_minutes === 2 ? 4 : 6;

  // 5b. Calculate crowd perception and authenticity modifiers from promotion work
  const crowdModifiers = await getCrowdPerceptionModifiers(
    battleId,
    battle.battler_player_id,
    battle.battler_ai_id
  );
  const authenticityModifiers = await getAuthenticityModifiers(
    battle.battler_player_id,
    battle.battler_ai_id
  );

  // Log promotion impact (for battle narrative)
  if (crowdModifiers.narrative) {
    console.log(`[PROMOTION] ${crowdModifiers.narrative}`);
  }
  if (authenticityModifiers.narrative) {
    console.log(`[AUTHENTICITY] ${authenticityModifiers.narrative}`);
  }

  // 6. Simulate all 3 rounds with momentum system
  const allSegments: any[] = [];
  const allRounds: any[] = [];

  // Initialize momentum state (NEW - per playtest findings)
  interface MomentumState {
    player: number;  // -3 to +3
    ai: number;
  }
  // Apply starting variance to break determinism (Phase 3 fix for 0% even upsets)
  const startingVariance = (Math.random() - 0.5) * 2 * CONFIG.MOMENTUM_STARTING_VARIANCE;
  const momentum: MomentumState = {
    player: startingVariance,
    ai: -startingVariance  // Inverse so total = 0
  };

  for (let roundIndex = 1; roundIndex <= 3; roundIndex++) {
    // Apply momentum boost to attributes for rounds 2 and 3
    let playerModifiedWithMomentum = playerModified;
    let aiModifiedWithMomentum = aiModified;

    if (roundIndex > 1) {
      // Calculate momentum multipliers
      const playerMomentumBoost = 1 + (momentum.player * CONFIG.MOMENTUM_MULTIPLIER);
      const aiMomentumBoost = 1 + (momentum.ai * CONFIG.MOMENTUM_MULTIPLIER);

      // Apply momentum to all attributes (creates deep copy)
      playerModifiedWithMomentum = {
        writing: {
          lyricism: Math.min(10, playerModified.writing.lyricism * playerMomentumBoost),
          wordplay: Math.min(10, playerModified.writing.wordplay * playerMomentumBoost),
          creativity: Math.min(10, playerModified.writing.creativity * playerMomentumBoost),
        },
        performance: {
          stage_presence: Math.min(10, playerModified.performance.stage_presence * playerMomentumBoost),
          crowd_control: Math.min(10, playerModified.performance.crowd_control * playerMomentumBoost),
          delivery: Math.min(10, playerModified.performance.delivery * playerMomentumBoost),
        },
        personal: { ...playerModified.personal },
        resilience: Math.min(10, playerModified.resilience * playerMomentumBoost),
      };

      aiModifiedWithMomentum = {
        writing: {
          lyricism: Math.min(10, aiModified.writing.lyricism * aiMomentumBoost),
          wordplay: Math.min(10, aiModified.writing.wordplay * aiMomentumBoost),
          creativity: Math.min(10, aiModified.writing.creativity * aiMomentumBoost),
        },
        performance: {
          stage_presence: Math.min(10, aiModified.performance.stage_presence * aiMomentumBoost),
          crowd_control: Math.min(10, aiModified.performance.crowd_control * aiMomentumBoost),
          delivery: Math.min(10, aiModified.performance.delivery * aiMomentumBoost),
        },
        personal: { ...aiModified.personal },
        resilience: Math.min(10, aiModified.resilience * aiMomentumBoost),
      };
    }

    const roundResult = await simulateRound(
      roundIndex,
      segmentsPerRound,
      battle.battler_player_id,
      battle.battler_ai_id,
      playerModifiedWithMomentum,
      aiModifiedWithMomentum,
      playerPrepProfile,
      aiPrepProfile,
      league,
      battle.no_show_player,
      playerBadgeEffects,
      aiBadgeEffects,
      supabase,
      battleId,
      battle.context || 'ppv',
      playerBattler,
      aiBattler,
      crowdModifiers,
      authenticityModifiers
    );

    allSegments.push(...roundResult.segments);
    allRounds.push(...roundResult.rounds);

    // Update momentum based on round results (for next round)
    if (roundIndex < 3) {
      const playerRound = roundResult.rounds.find(r => r.battler_id === battle.battler_player_id);
      const aiRound = roundResult.rounds.find(r => r.battler_id === battle.battler_ai_id);

      if (playerRound && aiRound) {
        const roundScoreDiff = playerRound.average_score - aiRound.average_score;

        if (Math.abs(roundScoreDiff) >= 2.0) {
          // Decisive win (2+ point difference)
          if (roundScoreDiff > 0) {
            momentum.player = Math.min(CONFIG.MOMENTUM_MAX, momentum.player + CONFIG.MOMENTUM_DECISIVE_WIN);
            momentum.ai = Math.max(-CONFIG.MOMENTUM_MAX, momentum.ai - CONFIG.MOMENTUM_DECISIVE_WIN);
          } else {
            momentum.ai = Math.min(CONFIG.MOMENTUM_MAX, momentum.ai + CONFIG.MOMENTUM_DECISIVE_WIN);
            momentum.player = Math.max(-CONFIG.MOMENTUM_MAX, momentum.player - CONFIG.MOMENTUM_DECISIVE_WIN);
          }
        } else if (Math.abs(roundScoreDiff) >= 1.0) {
          // Clear win (1-2 point difference)
          if (roundScoreDiff > 0) {
            momentum.player = Math.min(CONFIG.MOMENTUM_MAX, momentum.player + CONFIG.MOMENTUM_CLEAR_WIN);
            momentum.ai = Math.max(-CONFIG.MOMENTUM_MAX, momentum.ai - CONFIG.MOMENTUM_CLEAR_WIN);
          } else {
            momentum.ai = Math.min(CONFIG.MOMENTUM_MAX, momentum.ai + CONFIG.MOMENTUM_CLEAR_WIN);
            momentum.player = Math.max(-CONFIG.MOMENTUM_MAX, momentum.player - CONFIG.MOMENTUM_CLEAR_WIN);
          }
        }
      }
    }
  }

  // 6. Determine battle winner
  const playerRoundsWon = allRounds.filter(
    (r) => r.battler_id === battle.battler_player_id && r.won
  ).length;
  const aiRoundsWon = allRounds.filter(
    (r) => r.battler_id === battle.battler_ai_id && r.won
  ).length;

  const winnerId =
    playerRoundsWon > aiRoundsWon ? battle.battler_player_id : battle.battler_ai_id;

  // 6b. Classify decision type (bodybag, clean_sweep, gentlemans_30, classic, edge)
  // Battle rap terminology for decision types:
  // 3-0: Bodybag (dominated), Clean Sweep (clear), Gentleman's 30 (opponent performed well)
  // 2-1: Classic (both performed great), Edge (close/debatable)
  let decisionType: 'bodybag' | 'clean_sweep' | 'gentlemans_30' | 'classic' | 'edge' = 'edge';
  let verdict: '3-0' | '2-1' = '2-1';

  const playerWon = winnerId === battle.battler_player_id;
  const winnerRoundsWon = playerWon ? playerRoundsWon : aiRoundsWon;

  if (winnerRoundsWon === 3) {
    verdict = '3-0';
    const winnerRounds = allRounds.filter((r) => r.battler_id === winnerId);
    const loserRounds = allRounds.filter((r) => r.battler_id !== winnerId);

    // Calculate average score margin across all rounds
    let totalMargin = 0;
    for (let i = 0; i < 3; i++) {
      const winnerAvg = winnerRounds[i]?.average_score || 0;
      const loserAvg = loserRounds[i]?.average_score || 0;
      totalMargin += Math.abs(winnerAvg - loserAvg);
    }
    const avgMarginPerRound = totalMargin / 3;

    // Check loser's crowd performance (gentleman's 30 = loser still got crowd love)
    const loserAvgCrowd = loserRounds.length > 0
      ? loserRounds.reduce((sum, r) => sum + r.crowd_reaction, 0) / loserRounds.length
      : 0;

    if (avgMarginPerRound >= CONFIG.DECISION_BODYBAG_THRESHOLD) {
      // Bodybag: Dominated/crushed (3.0+ point avg margin)
      decisionType = 'bodybag';
      console.log(
        `🥊 BODYBAG! Dominated 3-0 with ${avgMarginPerRound.toFixed(1)}pt avg margin`
      );
    } else if (avgMarginPerRound >= CONFIG.DECISION_CLASSIC_THRESHOLD) {
      // Clean Sweep: Won all 3 rounds clearly (2.0-3.0 point margin)
      decisionType = 'clean_sweep';
      console.log(
        `✅ CLEAN SWEEP! Clear 3-0 victory (${avgMarginPerRound.toFixed(1)}pt margin)`
      );
    } else {
      // Gentleman's 30: Swept but opponent performed well (< 2.0 margin or high loser crowd)
      decisionType = 'gentlemans_30';
      console.log(
        `🤝 GENTLEMAN'S 30! Close 3-0, opponent performed well (${avgMarginPerRound.toFixed(1)}pt margin, loser crowd ${loserAvgCrowd.toFixed(0)})`
      );
    }
  } else if (winnerRoundsWon === 2) {
    verdict = '2-1';

    // Get average crowd reactions for the whole battle
    const allCrowdReactions = allRounds.map((r) => r.crowd_reaction);
    const avgCrowdReaction = allCrowdReactions.length > 0
      ? allCrowdReactions.reduce((sum, cr) => sum + cr, 0) / allCrowdReactions.length
      : 0;

    // Classic = Both performed great, high crowd engagement (avg crowd >= 70)
    // Edge = Very close, debatable rounds (avg crowd < 70)
    const minCrowdForClassic = CONFIG.DECISION_CLASSIC_CROWD_MIN || 70;

    if (avgCrowdReaction >= minCrowdForClassic) {
      decisionType = 'classic';
      console.log(
        `⚔️ 2-1 CLASSIC! Both performed great (avg crowd ${avgCrowdReaction.toFixed(0)})`
      );
    } else {
      decisionType = 'edge';
      console.log(
        `📊 2-1 EDGE! Close/debatable rounds (avg crowd ${avgCrowdReaction.toFixed(0)})`
      );
    }
  }

  // 6c. TOURNAMENT JUDGE SCORING (if tournament battle)
  // For tournament battles, override winner determination with judge scoring
  let judgeWinnerId = winnerId; // Default to simulation winner
  let tournamentJudges: any[] | null = null;

  if (battle.tournament_id) {
    console.log(`🏆 Tournament battle detected - loading judges...`);

    // Load tournament to get judge panel
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('judges, judge_names')
      .eq('id', battle.tournament_id)
      .single();

    if (tournament && tournament.judges && tournament.judges.length > 0) {
      // Load judge profiles
      tournamentJudges = tournament.judges.map((judgeId: string) => getJudgeProfile(judgeId)).filter(Boolean);

      if (tournamentJudges && tournamentJudges.length === 3) {
        console.log(`⚖️ Judges: ${tournamentJudges.map(j => j.judge_name).join(', ')}`);

        // Separate player and AI data
        const playerRounds = allRounds.filter(r => r.battler_id === battle.battler_player_id);
        const aiRounds = allRounds.filter(r => r.battler_id === battle.battler_ai_id);
        const playerSegments = allSegments.filter(s => s.battler_id === battle.battler_player_id);
        const aiSegments = allSegments.filter(s => s.battler_id === battle.battler_ai_id);

        // Score battle with judges
        const scorecard = scoreTournamentBattle(
          battleId,
          tournamentJudges,
          battle.battler_player_id,
          playerBattler?.style_tags || [],
          playerRounds as any[],
          playerSegments as any[],
          battle.battler_ai_id,
          aiBattler?.style_tags || [],
          aiRounds as any[],
          aiSegments as any[]
        );

        // Use judge decision as winner
        judgeWinnerId = scorecard.winner_battler_id;

        console.log(`📊 Judge Decision: ${scorecard.decision_type} (${scorecard.player_judge_votes}-${scorecard.opponent_judge_votes})`);
        console.log(`🏅 Judge Winner: ${judgeWinnerId === battle.battler_player_id ? 'Player' : 'AI'} (Simulation: ${winnerId === battle.battler_player_id ? 'Player' : 'AI'})`);

        // Save judge scores to database
        for (const playerEval of scorecard.judge_evaluations.player) {
          await supabase.from('battle_judge_scores').insert({
            battle_id: battleId,
            judge_id: playerEval.judge_id,
            judge_name: playerEval.judge_name,
            battler_id: playerEval.battler_id,
            rounds_won: playerEval.rounds_won,
            overall_composite_average: playerEval.overall_composite_average,
            winner: playerEval.winner,
            round_evaluations: playerEval.round_evaluations,
            badge_bias_overall: playerEval.round_evaluations.length > 0
              ? playerEval.round_evaluations.reduce((sum, r) => sum + r.badge_bias_modifier, 0) / playerEval.round_evaluations.length
              : 0,
            content_preference_overall: playerEval.round_evaluations.length > 0
              ? playerEval.round_evaluations.reduce((sum, r) => sum + r.content_preference_modifier, 0) / playerEval.round_evaluations.length
              : 0,
          });
        }

        for (const opponentEval of scorecard.judge_evaluations.opponent) {
          await supabase.from('battle_judge_scores').insert({
            battle_id: battleId,
            judge_id: opponentEval.judge_id,
            judge_name: opponentEval.judge_name,
            battler_id: opponentEval.battler_id,
            rounds_won: opponentEval.rounds_won,
            overall_composite_average: opponentEval.overall_composite_average,
            winner: opponentEval.winner,
            round_evaluations: opponentEval.round_evaluations,
            badge_bias_overall: opponentEval.round_evaluations.length > 0
              ? opponentEval.round_evaluations.reduce((sum, r) => sum + r.badge_bias_modifier, 0) / opponentEval.round_evaluations.length
              : 0,
            content_preference_overall: opponentEval.round_evaluations.length > 0
              ? opponentEval.round_evaluations.reduce((sum, r) => sum + r.content_preference_modifier, 0) / opponentEval.round_evaluations.length
              : 0,
          });
        }
      }
    }
  }

  // Use judge winner for tournaments, simulation winner for regular battles
  const finalWinnerId = battle.tournament_id ? judgeWinnerId : winnerId;

  // 7. Save results to database (with payments and tournament integration)
  await saveBattleResults(
    supabase,
    battleId,
    finalWinnerId,
    allRounds,
    allSegments,
    playerData.ranking,
    aiData.ranking,
    battle.battler_player_id,
    battle.battler_ai_id,
    playerData.attributes,
    aiData.attributes,
    league,
    battle,
    verdict,
    decisionType
  );

  // 8. Calculate and save battle views
  console.log('📊 Calculating battle views...');
  try {
    const { calculateAndSaveBattleViews } = await import('@/lib/services/viewsCalculator');

    // Prepare performance data for view calculation
    const playerRounds = allRounds.filter((r) => r.battler_id === battle.battler_player_id);
    const aiRounds = allRounds.filter((r) => r.battler_id === battle.battler_ai_id);

    const playerAvgScore = playerRounds.length > 0
      ? playerRounds.reduce((sum, r) => sum + r.average_score, 0) / playerRounds.length
      : 0;
    const playerPeakScore = playerRounds.length > 0
      ? Math.max(...playerRounds.map((r) => r.peak_score))
      : 0;
    const aiAvgScore = aiRounds.length > 0
      ? aiRounds.reduce((sum, r) => sum + r.average_score, 0) / aiRounds.length
      : 0;
    const aiPeakScore = aiRounds.length > 0
      ? Math.max(...aiRounds.map((r) => r.peak_score))
      : 0;

    const playerChoked = playerRounds.some((r) => r.choke);
    const aiChoked = aiRounds.some((r) => r.choke);

    // Check if this is a tournament final
    let isFinal = false;
    if (battle.tournament_id) {
      const { data: tournamentData } = await supabase
        .from('tournaments')
        .select('status')
        .eq('id', battle.tournament_id)
        .single();
      isFinal = tournamentData?.status === 'finals';
    }

    const viewResult = await calculateAndSaveBattleViews(
      supabase,
      battleId,
      battle.battler_player_id,
      battle.battler_ai_id,
      league.id,
      {
        winner_battler_id: finalWinnerId,
        loser_battler_id: finalWinnerId === battle.battler_player_id ? battle.battler_ai_id : battle.battler_player_id,
        verdict: decisionType,
        player_avg_score: playerAvgScore,
        player_peak_score: playerPeakScore,
        ai_avg_score: aiAvgScore,
        ai_peak_score: aiPeakScore,
        player_choked: playerChoked,
        ai_choked: aiChoked,
        tournament_id: battle.tournament_id || null,
        is_final: isFinal,
      },
      0 // scandal level (can be enhanced later)
    );

    if (viewResult) {
      console.log(`📈 Battle views: ${viewResult.total_views.toLocaleString()} (${viewResult.view_tier} tier)`);
      console.log(`   Fan base: ${viewResult.from_fan_base.toLocaleString()}`);
      console.log(`   League: ${viewResult.from_league_subscribers.toLocaleString()}`);
      console.log(`   Viral: ${viewResult.from_viral_discovery.toLocaleString()}`);
    }
  } catch (error) {
    console.error('⚠️ Error calculating battle views:', error);
    // Don't fail the entire simulation if view tracking fails
  }
}

/**
 * Handle forfeit when player has no prep blocks
 */
async function handleForfeit(
  supabase: any,
  battleId: string,
  winnerId: string,
  playerRanking: Ranking,
  aiRanking: Ranking,
  playerBattlerId: string,
  aiBattlerId: string
) {
  // Update battle status to forfeit
  await supabase
    .from('battles')
    .update({
      status: 'forfeit',
      winner_battler_id: winnerId,
      no_show_player: true,
    })
    .eq('id', battleId);

  // Update rankings - forfeit counts as a loss with slightly higher penalty
  const newRatings = calculateELO(playerRanking.rating, aiRanking.rating, false);

  await supabase
    .from('rankings')
    .update({
      rating: newRatings.player - 10, // Additional 10 point penalty for forfeit
      wins: playerRanking.wins,
      losses: playerRanking.losses + 1,
      streak: Math.min(0, playerRanking.streak) - 1,
    })
    .eq('battler_id', playerBattlerId);

  await supabase
    .from('rankings')
    .update({
      rating: newRatings.ai,
      wins: aiRanking.wins + 1,
      losses: aiRanking.losses,
      streak: Math.max(0, aiRanking.streak) + 1,
    })
    .eq('battler_id', aiBattlerId);

  console.log(`Battle ${battleId} marked as forfeit due to player no-show`);
}

/**
 * Load all data for a battler
 */
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

  // Create default ranking if it doesn't exist
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

/**
 * Build prep profile from prep blocks
 */
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

/**
 * Apply prep modifiers to base attributes (with badge effects)
 */
function applyPrepModifiers(
  attributes: BattlerAttributes,
  prep: PrepProfile,
  isNoShow: boolean,
  badgeEffects: BadgeEffects,
  league: League
): ModifiedAttributes {
  // Ensure personal stats exist (handle old data)
  const defaultPersonal = {
    financial_stability: 5,
    reputation: 5,
    family_bond: 5,
    preparation: 5
  };

  const modified: ModifiedAttributes = {
    writing: { ...attributes.writing },
    performance: { ...attributes.performance },
    personal: attributes.personal ? { ...attributes.personal } : { ...defaultPersonal },
    resilience: attributes.resilience,
  };

  // === PREP IMPROVEMENTS (with badge efficiency modifiers and preparation attribute) ===

  // Preparation attribute makes prep more effective
  // Formula: prep_modifier = base_prep_modifier * (1 + preparation / 20)
  const preparationAttribute = (attributes.personal && attributes.personal.preparation) || 5;
  const prepEfficiencyMultiplier = 1 + (preparationAttribute / 20);
  const effectivePrepMultiplier = CONFIG.PREP_EFFECT_MULTIPLIER * prepEfficiencyMultiplier;

  // Writing improvements from prep (affected by writingPrepEfficiency)
  const writingBoost = prep.writingDays * effectivePrepMultiplier * badgeEffects.writingPrepEfficiency;
  modified.writing.lyricism = Math.min(
    10,
    attributes.writing.lyricism + writingBoost
  );
  modified.writing.wordplay = Math.min(
    10,
    attributes.writing.wordplay + writingBoost
  );
  modified.writing.creativity = Math.min(
    10,
    attributes.writing.creativity + writingBoost
  );

  // Performance improvements from prep (affected by performancePrepEfficiency)
  const performanceBoost = prep.performanceDays * effectivePrepMultiplier * badgeEffects.performancePrepEfficiency;
  modified.performance.stage_presence = Math.min(
    10,
    attributes.performance.stage_presence + performanceBoost
  );
  modified.performance.crowd_control = Math.min(
    10,
    attributes.performance.crowd_control + performanceBoost
  );
  modified.performance.delivery = Math.min(
    10,
    attributes.performance.delivery + performanceBoost
  );

  // Research improvements (affects creativity and lyricism)
  const researchBoost = prep.researchDays * effectivePrepMultiplier * badgeEffects.researchPrepEfficiency;
  modified.writing.creativity = Math.min(
    10,
    modified.writing.creativity + researchBoost * 0.5
  );
  modified.writing.lyricism = Math.min(
    10,
    modified.writing.lyricism + researchBoost * 0.3
  );

  // Resilience boost from rest (affected by restEfficiency)
  const resilienceBoost = prep.restDays * effectivePrepMultiplier * badgeEffects.restEfficiency;
  modified.resilience = Math.min(10, attributes.resilience + resilienceBoost);

  // Life prep improvements (affects personal stats)
  const lifeBoost = prep.lifeDays * effectivePrepMultiplier * badgeEffects.lifePrepEfficiency;
  modified.personal.family_bond = Math.min(
    10,
    attributes.personal.family_bond + lifeBoost
  );
  modified.personal.financial_stability = Math.min(
    10,
    attributes.personal.financial_stability + lifeBoost * 0.5
  );
  modified.personal.preparation = Math.min(
    10,
    attributes.personal.preparation + lifeBoost * 0.3
  );

  // === BADGE ATTRIBUTE MULTIPLIERS ===
  // Apply badge-specific attribute multipliers
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

  // === PREP PATTERN BONUSES ===
  const prepPatternBonus = calculatePrepPatternBonus(prep, badgeEffects);
  if (prepPatternBonus > 0) {
    // Apply pattern bonus to all attributes
    modified.writing.lyricism = Math.min(10, modified.writing.lyricism * (1 + prepPatternBonus));
    modified.writing.wordplay = Math.min(10, modified.writing.wordplay * (1 + prepPatternBonus));
    modified.writing.creativity = Math.min(10, modified.writing.creativity * (1 + prepPatternBonus));
    modified.performance.stage_presence = Math.min(10, modified.performance.stage_presence * (1 + prepPatternBonus));
    modified.performance.crowd_control = Math.min(10, modified.performance.crowd_control * (1 + prepPatternBonus));
    modified.performance.delivery = Math.min(10, modified.performance.delivery * (1 + prepPatternBonus));
    modified.resilience = Math.min(10, modified.resilience * (1 + prepPatternBonus));
  }

  // === LEAGUE BONUS ===
  const leagueBonus = getLeagueBonus(league.round_length_minutes, badgeEffects);
  if (leagueBonus !== 0) {
    // Apply league bonus as a flat multiplier
    const leagueMult = 1 + leagueBonus;
    modified.writing.lyricism = Math.min(10, modified.writing.lyricism * leagueMult);
    modified.writing.wordplay = Math.min(10, modified.writing.wordplay * leagueMult);
    modified.writing.creativity = Math.min(10, modified.writing.creativity * leagueMult);
    modified.performance.stage_presence = Math.min(10, modified.performance.stage_presence * leagueMult);
    modified.performance.crowd_control = Math.min(10, modified.performance.crowd_control * leagueMult);
    modified.performance.delivery = Math.min(10, modified.performance.delivery * leagueMult);
  }

  // === NO-SHOW PENALTY ===
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

/**
 * Simulate a single round
 */
async function simulateRound(
  roundIndex: number,
  segmentsPerRound: number,
  playerBattlerId: string,
  aiBattlerId: string,
  playerAttrs: ModifiedAttributes,
  aiAttrs: ModifiedAttributes,
  playerPrep: PrepProfile,
  aiPrep: PrepProfile,
  league: League,
  playerNoShow: boolean,
  playerBadgeEffects: BadgeEffects,
  aiBadgeEffects: BadgeEffects,
  supabase: any,
  battleId: string,
  context: ScoringContext,
  playerBattler: Battler,
  aiBattler: Battler,
  crowdModifiers: { playerBonus: number; aiBonus: number; narrative: string },
  authenticityModifiers: { playerPenalty: number; aiPenalty: number; narrative: string }
) {
  // =====================================================
  // CONTENT SELECTION LOADING (Phase 2C Integration)
  // =====================================================

  // Load content selections for this round from database
  const { data: contentSelections } = await supabase
    .from('round_content_selections')
    .select('*')
    .eq('battle_id', battleId)
    .eq('round_index', roundIndex)
    .in('battler_id', [playerBattlerId, aiBattlerId]);

  // Find player and AI selections
  let playerSelection: ContentSelection;
  let aiSelection: ContentSelection;

  const dbPlayerSelection = contentSelections?.find((s: RoundContentSelection) => s.battler_id === playerBattlerId);
  const dbAiSelection = contentSelections?.find((s: RoundContentSelection) => s.battler_id === aiBattlerId);

  // If selections don't exist, auto-generate them
  if (!dbPlayerSelection) {
    playerSelection = autoSelectContent(
      playerBattler.style_tags || [],
      league.name,
      roundIndex
    );
  } else {
    playerSelection = {
      contentTypes: dbPlayerSelection.content_types as any[],
      deliveryTypes: dbPlayerSelection.delivery_types as any[],
      performanceTypes: dbPlayerSelection.performance_types as any[],
    };
  }

  if (!dbAiSelection) {
    aiSelection = autoSelectContent(
      aiBattler.style_tags || [],
      league.name,
      roundIndex
    );
  } else {
    aiSelection = {
      contentTypes: dbAiSelection.content_types as any[],
      deliveryTypes: dbAiSelection.delivery_types as any[],
      performanceTypes: dbAiSelection.performance_types as any[],
    };
  }

  // Calculate effectiveness multipliers for both battlers
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

  // Extract individual multipliers for storage
  const playerEffectivenessMultiplier = playerForecast.averageEffectiveness;
  const playerCrowdPreference = playerForecast.crowdPreference;
  const playerContextModifier = playerForecast.contextModifier;
  const playerFinalMultiplier = playerForecast.finalMultiplier;

  const aiEffectivenessMultiplier = aiForecast.averageEffectiveness;
  const aiCrowdPreference = aiForecast.crowdPreference;
  const aiContextModifier = aiForecast.contextModifier;
  const aiFinalMultiplier = aiForecast.finalMultiplier;

  // =====================================================
  // SEGMENT SIMULATION
  // =====================================================

  const segments: any[] = [];
  const playerSegmentScores: number[] = [];
  const aiSegmentScores: number[] = [];
  const playerSegmentEvents: string[][] = [];
  const aiSegmentEvents: string[][] = [];
  const playerWritingPowers: number[] = [];
  const playerPerformancePowers: number[] = [];
  const aiWritingPowers: number[] = [];
  const aiPerformancePowers: number[] = [];

  // Calculate opponent power values for attribute gap comparison
  const playerWritingPower =
    (playerAttrs.writing.lyricism + playerAttrs.writing.wordplay + playerAttrs.writing.creativity) / 3;
  const playerPerformancePower =
    (playerAttrs.performance.stage_presence + playerAttrs.performance.crowd_control + playerAttrs.performance.delivery) / 3;
  const aiWritingPower =
    (aiAttrs.writing.lyricism + aiAttrs.writing.wordplay + aiAttrs.writing.creativity) / 3;
  const aiPerformancePower =
    (aiAttrs.performance.stage_presence + aiAttrs.performance.crowd_control + aiAttrs.performance.delivery) / 3;

  // Simulate each segment
  for (let segmentIndex = 1; segmentIndex <= segmentsPerRound; segmentIndex++) {
    const playerSegment = simulateSegment(
      playerBattlerId,
      playerAttrs,
      playerPrep,
      league,
      roundIndex,
      segmentIndex,
      playerNoShow,
      playerBadgeEffects,
      aiWritingPower,
      aiPerformancePower
    );
    const aiSegment = simulateSegment(
      aiBattlerId,
      aiAttrs,
      aiPrep,
      league,
      roundIndex,
      segmentIndex,
      false,
      aiBadgeEffects,
      playerWritingPower,
      playerPerformancePower
    );

    // Apply content effectiveness multipliers to segment scores
    const playerAdjustedScore = playerSegment.score * playerFinalMultiplier;
    const aiAdjustedScore = aiSegment.score * aiFinalMultiplier;

    playerSegmentScores.push(playerAdjustedScore);
    aiSegmentScores.push(aiAdjustedScore);
    playerSegmentEvents.push(playerSegment.events);
    aiSegmentEvents.push(aiSegment.events);
    playerWritingPowers.push(playerSegment.writingPower);
    playerPerformancePowers.push(playerSegment.performancePower);
    aiWritingPowers.push(aiSegment.writingPower);
    aiPerformancePowers.push(aiSegment.performancePower);

    segments.push({
      round_index: roundIndex,
      segment_index: segmentIndex,
      battler_id: playerBattlerId,
      segment_score: playerAdjustedScore,
      event_flags: playerSegment.events,
      crowd_reaction: playerSegment.crowdReaction,
    });

    segments.push({
      round_index: roundIndex,
      segment_index: segmentIndex,
      battler_id: aiBattlerId,
      segment_score: aiAdjustedScore,
      event_flags: aiSegment.events,
      crowd_reaction: aiSegment.crowdReaction,
    });
  }

  // Distribute content across segments for player and AI
  const playerSegmentData = segments
    .filter((s) => s.battler_id === playerBattlerId)
    .map((s) => ({
      segmentIndex: s.segment_index,
      score: s.segment_score,
      eventFlags: s.event_flags,
    }));

  const aiSegmentData = segments
    .filter((s) => s.battler_id === aiBattlerId)
    .map((s) => ({
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
    const isPlayer = segment.battler_id === playerBattlerId;
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

  // Calculate average power values for attribute contribution
  const playerAvgWritingPower = playerWritingPowers.length > 0
    ? playerWritingPowers.reduce((a, b) => a + b, 0) / playerWritingPowers.length
    : 0;
  const playerAvgPerformancePower = playerPerformancePowers.length > 0
    ? playerPerformancePowers.reduce((a, b) => a + b, 0) / playerPerformancePowers.length
    : 0;
  const aiAvgWritingPower = aiWritingPowers.length > 0
    ? aiWritingPowers.reduce((a, b) => a + b, 0) / aiWritingPowers.length
    : 0;
  const aiAvgPerformancePower = aiPerformancePowers.length > 0
    ? aiPerformancePowers.reduce((a, b) => a + b, 0) / aiPerformancePowers.length
    : 0;

  // Calculate round summaries with content metadata (including promotion modifiers)
  const playerRound = calculateRoundSummary(
    playerBattlerId,
    roundIndex,
    playerSegmentScores,
    playerSegmentEvents,
    playerAttrs,
    league,
    playerBadgeEffects,
    playerAvgWritingPower,
    playerAvgPerformancePower,
    playerSelection,
    playerEffectivenessMultiplier,
    playerCrowdPreference,
    playerContextModifier,
    playerFinalMultiplier,
    crowdModifiers.playerBonus,
    authenticityModifiers.playerPenalty
  );
  const aiRound = calculateRoundSummary(
    aiBattlerId,
    roundIndex,
    aiSegmentScores,
    aiSegmentEvents,
    aiAttrs,
    league,
    aiBadgeEffects,
    aiAvgWritingPower,
    aiAvgPerformancePower,
    aiSelection,
    aiEffectivenessMultiplier,
    aiCrowdPreference,
    aiContextModifier,
    aiFinalMultiplier,
    crowdModifiers.aiBonus,
    authenticityModifiers.aiPenalty
  );

  // Determine round winner using weighted composite score
  // OLD SYSTEM: Only average_score mattered, peak/crowd were tiebreakers
  // NEW SYSTEM: Weighted formula gives peaks and crowd real impact
  //
  // Formula: composite = (avg × 40%) + (peak × 35%) + (crowd × 25%)
  // This allows "he had a couple big moments" to swing close rounds

  const playerNormalizedCrowd = (playerRound.crowd_reaction / 100) * CONFIG.ROUND_JUDGING_CROWD_SCALE;
  const aiNormalizedCrowd = (aiRound.crowd_reaction / 100) * CONFIG.ROUND_JUDGING_CROWD_SCALE;

  const playerCompositeScore =
    (playerRound.average_score * CONFIG.ROUND_JUDGING_AVERAGE_WEIGHT) +
    (playerRound.peak_score * CONFIG.ROUND_JUDGING_PEAK_WEIGHT) +
    (playerNormalizedCrowd * CONFIG.ROUND_JUDGING_CROWD_WEIGHT);

  const aiCompositeScore =
    (aiRound.average_score * CONFIG.ROUND_JUDGING_AVERAGE_WEIGHT) +
    (aiRound.peak_score * CONFIG.ROUND_JUDGING_PEAK_WEIGHT) +
    (aiNormalizedCrowd * CONFIG.ROUND_JUDGING_CROWD_WEIGHT);

  const playerWon = playerCompositeScore > aiCompositeScore;
  const aiWon = !playerWon;

  // Calculate momentum delta (score difference normalized to -1.0 to 1.0 range)
  const scoreDiff = Math.abs(playerRound.average_score - aiRound.average_score);
  const momentumValue = Math.min(1.0, scoreDiff / 10); // Normalize to 0-1 range

  // From player's perspective: positive = player winning, negative = AI winning
  playerRound.momentum_delta = Number((playerWon ? momentumValue : -momentumValue).toFixed(3));
  aiRound.momentum_delta = Number((aiWon ? momentumValue : -momentumValue).toFixed(3));

  // Add temporary won property for processing (will be removed before DB insert)
  (playerRound as any).won = playerWon;
  (aiRound as any).won = aiWon;

  return {
    segments,
    rounds: [playerRound, aiRound],
  };
}

/**
 * Simulate a single segment (with badge effects)
 */
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

  // Calculate base power
  const writingPower =
    (attrs.writing.lyricism + attrs.writing.wordplay + attrs.writing.creativity) /
    3;
  const performancePower =
    (attrs.performance.stage_presence +
      attrs.performance.crowd_control +
      attrs.performance.delivery) /
    3;

  const baseScore =
    writingPower * league.writing_weight +
    performancePower * league.performance_weight;

  // Calculate attribute gap multiplier (NEW - per playtest findings)
  // This helps favorites win more consistently by amplifying attribute advantages
  const relevantGap = league.writing_weight > 0.6
    ? writingPower - opponentWritingPower  // Small Room: compare writing
    : performancePower - opponentPerformancePower;  // Main Stage: compare performance

  let gapMultiplier = 1.0;
  if (relevantGap > 3) {
    gapMultiplier = CONFIG.ATTRIBUTE_GAP_HUGE_MULTIPLIER;  // 1.25x
  } else if (relevantGap > 2) {
    gapMultiplier = CONFIG.ATTRIBUTE_GAP_MEDIUM_MULTIPLIER;  // 1.15x
  }

  // Add random variance (modified by badge effects)
  const adjustedVariance = CONFIG.SEGMENT_VARIANCE * badgeEffects.segmentVarianceMultiplier;
  const variance = (Math.random() - 0.5) * 2 * adjustedVariance;
  let finalScore = baseScore * gapMultiplier * (1 + variance);

  // Check for peak segment (research/angles bonus + badge peak bonus)
  const peakChance = prep.researchDays > 0 ? CONFIG.PEAK_PROBABILITY : CONFIG.PEAK_PROBABILITY * 0.5;
  const isPeak = Math.random() < peakChance;
  if (isPeak) {
    const peakMultiplier = 1.2 + badgeEffects.peakBonus;
    finalScore *= peakMultiplier;
    events.push('haymaker');
  }

  // ============================================================================
  // STUMBLE CHECK (NEW - PHASE 4)
  // ============================================================================
  // Stumbles are MINOR errors (forgot a line, hesitation) vs chokes (catastrophic)
  // Check stumbles FIRST - they are mutually exclusive with chokes

  const delivery = attrs.performance.delivery;
  const crowdControl = attrs.performance.crowd_control;
  const deliveryFlow = delivery;  // Flow attribute removed from WritingStats

  let stumbleProbability = CONFIG.STUMBLE_BASE_PROBABILITY;

  // Performance prep reduces stumbles (rehearsal prevents minor errors)
  stumbleProbability -= prep.performanceDays * CONFIG.STUMBLE_PREP_REDUCTION;

  // Natural ability reduces stumbles
  const abilityAboveAverage = Math.max(0, deliveryFlow - 5);
  stumbleProbability -= abilityAboveAverage * CONFIG.STUMBLE_ABILITY_REDUCTION;

  // Stress increases stumbles (less than chokes though)
  const stress = (attrs as any).stress || 0;
  stumbleProbability += (stress / 100) * CONFIG.STUMBLE_STRESS_MULTIPLIER;

  // Apply badge modifiers
  stumbleProbability -= badgeEffects.stumbleReduction || 0;
  stumbleProbability += badgeEffects.stumbleIncrease || 0;

  // Apply floor and cap
  stumbleProbability = Math.max(CONFIG.STUMBLE_MINIMUM, Math.min(CONFIG.STUMBLE_MAXIMUM, stumbleProbability));

  // No-show penalty: higher stumble chance
  const stumbleThreshold = isNoShow ? Math.min(CONFIG.STUMBLE_MAXIMUM, stumbleProbability * 2) : stumbleProbability;

  let stumbled = false;
  if (Math.random() < stumbleThreshold) {
    stumbled = true;

    // Recovery skill: (delivery + crowd_control) / 2
    const recoverySkill = (delivery + crowdControl) / 2;

    if (recoverySkill >= 8.0) {
      // Good recovery: 15% penalty instead of 30%
      finalScore *= CONFIG.STUMBLE_RECOVERY_MULTIPLIER;
    } else {
      // Normal stumble: 30% penalty
      finalScore *= CONFIG.STUMBLE_SCORE_MULTIPLIER;
    }

    events.push('stumble');
  }

  // ============================================================================
  // CHOKE CHECK (EXPANDED - PHASE 4)
  // ============================================================================
  // Chokes are CATASTROPHIC failures (70% penalty)
  // Only check if didn't stumble (mutually exclusive)

  if (!stumbled) {
    // Family bond provides resilience buffer: effective_resilience = resilience + (family_bond / 10)
    const familyBond = (attrs.personal && attrs.personal.family_bond) || 5;
    const effectiveResilience = attrs.resilience + (familyBond / 10);

    // Only resilience ABOVE 5 reduces choke chance (5 is average)
    const resilienceAboveAverage = Math.max(0, effectiveResilience - 5);

    let chokeProbability = CONFIG.CHOKE_BASE_PROBABILITY;

    // Base reductions
    chokeProbability -= resilienceAboveAverage * CONFIG.CHOKE_RESILIENCE_FACTOR;
    chokeProbability -= prep.writingDays * CONFIG.CHOKE_PREP_REDUCTION;  // Writing prep = memorization

    // Stress impact (high stress increases choke risk)
    chokeProbability += (stress / 100) * CONFIG.CHOKE_STRESS_MULTIPLIER;

    // Financial pressure: ONLY applies if BOTH low financial AND low prep (Tru Foe validation)
    // "Only matters if you don't have enough prep time; with prep you're straight"
    const financialStability = (attrs.personal && attrs.personal.financial_stability) || 5;
    const totalPrep = prep.writingDays + prep.performanceDays + prep.researchDays;

    if (financialStability < 4 && totalPrep < 5) {
      // Prep reduces financial pressure impact: 0 prep = 100%, 5 prep = 0%
      const prepPenaltyMultiplier = 1.0 - (totalPrep / 10);
      chokeProbability += (4 - financialStability) * CONFIG.CHOKE_FINANCIAL_PRESSURE * prepPenaltyMultiplier;
    }

    // Reputation pressure: REMOVED per Tru Foe feedback
    // Tru Foe: "No" to both rookie and legend pressure being systematic
    // (Keeping code commented for reference)
    // const reputation = (attrs.personal && attrs.personal.reputation) || 5;
    // if (reputation < 4) {
    //   chokeProbability += (4 - reputation) * CONFIG.CHOKE_REPUTATION_LOW_PRESSURE;
    // } else if (reputation > 7) {
    //   chokeProbability += (reputation - 7) * CONFIG.CHOKE_REPUTATION_HIGH_PRESSURE;
    // }

    // Fame pressure: High public knowledge creates expectations
    const publicKnowledge = (attrs as any).public_knowledge || 0;
    if (publicKnowledge > CONFIG.CHOKE_FAME_THRESHOLD) {
      chokeProbability += (publicKnowledge - CONFIG.CHOKE_FAME_THRESHOLD) * CONFIG.CHOKE_FAME_MULTIPLIER;
    }

    // TODO Phase 2: Add these factors (require additional context passed down)
    // - Tournament round pressure (need battle.tournament_id and round info)
    // - Losing streak (need rankings.streak)
    // - Opponent intimidation (need opponent rating)
    // - Life event status (need temporary life event modifiers)

    // Apply badge choke modifiers
    chokeProbability -= badgeEffects.chokeReduction;
    chokeProbability += badgeEffects.chokeIncrease;

    // Apply floor and cap (prevents choke from reaching 0% or exceeding 25%)
    chokeProbability = Math.max(CONFIG.CHOKE_MINIMUM, Math.min(CONFIG.CHOKE_MAXIMUM, chokeProbability));

    const chokeThreshold = isNoShow ? Math.min(CONFIG.CHOKE_MAXIMUM, chokeProbability * 3) : chokeProbability;

    if (Math.random() < chokeThreshold) {
      finalScore *= CONFIG.CHOKE_SCORE_MULTIPLIER;  // 85% penalty (Tru Foe: makes round unwinnable)
      events.push('choke');
    }
  }

  // Ensure score stays in reasonable range (uses config values)
  finalScore = Math.max(CONFIG.SCORE_FLOOR, Math.min(CONFIG.SCORE_CEILING, finalScore));

  // Calculate segment-level crowd reaction
  let segmentCrowdReaction = Math.round(
    (finalScore / 10) * 60 +  // Segment score contributes 60%
    (performancePower / 10) * 40 * league.base_crowd_factor  // Performance contributes 40%
  );

  // Haymaker bonus: Big moments get extra crowd reaction
  if (events.includes('haymaker')) {
    segmentCrowdReaction += 15;
  }

  // Apply badge bonus
  segmentCrowdReaction += badgeEffects.crowdReactionBonus;

  // Clamp to 0-100
  segmentCrowdReaction = Math.min(100, Math.max(0, segmentCrowdReaction));

  return { score: finalScore, events, writingPower, performancePower, crowdReaction: segmentCrowdReaction };
}

/**
 * Calculate round summary stats (with badge effects and content metadata)
 */
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
  finalMultiplier?: number,
  crowdPerceptionBonus: number = 0,
  authenticityPenalty: number = 0
) {
  const average_score = segmentScores.length > 0
    ? segmentScores.reduce((a, b) => a + b, 0) / segmentScores.length
    : 0;
  const peak_score = segmentScores.length > 0
    ? Math.max(...segmentScores)
    : 0;

  // Calculate consistency (affected by badge consistency modifiers)
  let consistency_score = 10 - standardDeviation(segmentScores);
  consistency_score += badgeEffects.consistencyBonus;
  consistency_score -= badgeEffects.consistencyPenalty;
  consistency_score = Math.max(0, Math.min(10, consistency_score));

  // BUG FIX: Check for actual 'choke' events, not segment scores < 3
  // Previous logic: segmentScores.some((s) => s < 3) incorrectly flagged normal variance as chokes
  const hasChoke = segmentEvents.some((events) => events.includes('choke'));

  // Calculate crowd reaction based on performance power and league factor
  const performancePower =
    (attrs.performance.stage_presence +
      attrs.performance.crowd_control +
      attrs.performance.delivery) /
    3;

  let crowd_reaction = Math.round(
    (average_score / 10) * 50 +
      (performancePower / 10) * 50 * league.base_crowd_factor
  );

  // Apply badge crowd reaction bonus
  crowd_reaction += badgeEffects.crowdReactionBonus;

  // Apply promotion modifiers (PHASE 2: Relationship State System)
  // Crowd perception bonus: +/- 25 points max (from promotion work)
  const crowdPerceptionPoints = Math.round(crowdPerceptionBonus * 100);
  crowd_reaction += crowdPerceptionPoints;

  // Authenticity penalty: Low authenticity reduces crowd reaction
  // Penalty is 0 to -50 points (based on how damaged authenticity is)
  const authenticityPenaltyPoints = Math.round(authenticityPenalty * 100);
  crowd_reaction -= authenticityPenaltyPoints;

  // Clamp to 0-100
  crowd_reaction = Math.min(100, Math.max(0, crowd_reaction));

  // Calculate attribute contributions (what % came from writing vs performance)
  const totalPower = avgWritingPower + avgPerformancePower;
  const writing_contribution = totalPower > 0
    ? Number((avgWritingPower / totalPower).toFixed(3))
    : 0;
  const performance_contribution = totalPower > 0
    ? Number((avgPerformancePower / totalPower).toFixed(3))
    : 0;

  return {
    battler_id: battlerId,
    round_index: roundIndex,
    average_score: Number(average_score.toFixed(2)),
    peak_score: Number(peak_score.toFixed(2)),
    consistency_score: Number(consistency_score.toFixed(2)),
    momentum_delta: 0, // Will be calculated after comparing both battlers
    crowd_reaction,
    choked: hasChoke,
    writing_contribution,
    performance_contribution,
    summary_text: null,

    // Content system metadata (Phase 2C)
    content_types: contentSelection?.contentTypes,
    delivery_types: contentSelection?.deliveryTypes,
    performance_types: contentSelection?.performanceTypes,
    effectiveness_multiplier: effectivenessMultiplier,
    crowd_preference_multiplier: crowdPreferenceMultiplier,
    context_modifier: contextModifier,
    final_multiplier: finalMultiplier,
  };
}

/**
 * Save battle results to database
 * Handles payments, tournament brackets, rankings, and news generation
 */
async function saveBattleResults(
  supabase: any,
  battleId: string,
  winnerId: string,
  rounds: any[],
  segments: any[],
  playerRanking: Ranking,
  aiRanking: Ranking,
  playerBattlerId: string,
  aiBattlerId: string,
  playerAttributes: BattlerAttributes,
  aiAttributes: BattlerAttributes,
  league: any,
  battle: any,
  verdict: '3-0' | '2-1',
  decisionType: 'bodybag' | 'clean_sweep' | 'gentlemans_30' | 'classic' | 'edge'
) {
  // Import payment calculator (dynamic to avoid circular dependency)
  const { calculateBattlePayout, getTierFromRating } = await import('./paymentCalculator');

  // Calculate payouts for both battlers
  const playerTier = getTierFromRating(playerRanking.rating);
  const aiTier = getTierFromRating(aiRanking.rating);

  const playerWon = winnerId === playerBattlerId;
  const aiWon = winnerId === aiBattlerId;

  // Check if this is a tournament battle (no per-battle payouts)
  const isTournamentBattle = battle.is_tournament_battle || false;

  const playerPayout = calculateBattlePayout({
    tier: playerTier,
    leagueType: league.name,
    wonBattle: playerWon,
    isTournament: isTournamentBattle,
  });

  const aiPayout = calculateBattlePayout({
    tier: aiTier,
    leagueType: league.name,
    wonBattle: aiWon,
    isTournament: isTournamentBattle,
  });

  // Update battle status, winner, payouts, and verdict data
  await supabase
    .from('battles')
    .update({
      status: 'completed',
      winner_battler_id: winnerId,
      player_payout: playerPayout,
      ai_payout: aiPayout,
      verdict: verdict,
      decision_type: decisionType,
    })
    .eq('id', battleId);

  // Add earnings to player battler (using SQL function from migration)
  await supabase.rpc('add_earnings_transaction', {
    p_battler_id: playerBattlerId,
    p_amount: playerPayout,
    p_transaction_type: playerWon ? 'battle_win_bonus' : 'battle_base_pay',
    p_battle_id: battleId,
    p_description: `Battle payout - ${playerWon ? 'Victory' : 'Participation'}`,
    p_metadata: {
      league: league.name,
      tier: playerTier,
      won: playerWon,
    },
  });

  // Add earnings to AI battler
  await supabase.rpc('add_earnings_transaction', {
    p_battler_id: aiBattlerId,
    p_amount: aiPayout,
    p_transaction_type: aiWon ? 'battle_win_bonus' : 'battle_base_pay',
    p_battle_id: battleId,
    p_description: `Battle payout - ${aiWon ? 'Victory' : 'Participation'}`,
    p_metadata: {
      league: league.name,
      tier: aiTier,
      won: aiWon,
    },
  });

  // Insert all segments
  const segmentsWithBattleId = segments.map((s) => ({
    ...s,
    battle_id: battleId,
  }));
  const { error: segmentError } = await supabase.from('battle_segments').insert(segmentsWithBattleId);
  if (segmentError) {
    console.error('Failed to insert battle segments:', segmentError);
  }

  // Insert all rounds (remove 'won' property as it's not in the schema)
  const roundsWithBattleId = rounds.map((r) => {
    const { won, ...roundData } = r as any;
    return {
      ...roundData,
      battle_id: battleId,
    };
  });
  const { error: roundsError } = await supabase.from('battle_rounds').insert(roundsWithBattleId);
  if (roundsError) {
    console.error('Failed to insert battle rounds:', roundsError);
  }

  // Update rankings using ELO (playerWon already declared above)
  const newRatings = calculateELO(
    playerRanking.rating,
    aiRanking.rating,
    playerWon
  );

  await supabase
    .from('rankings')
    .update({
      rating: newRatings.player,
      wins: playerWon ? playerRanking.wins + 1 : playerRanking.wins,
      losses: playerWon ? playerRanking.losses : playerRanking.losses + 1,
      streak: playerWon ? Math.max(0, playerRanking.streak) + 1 : Math.min(0, playerRanking.streak) - 1,
    })
    .eq('battler_id', playerBattlerId);

  await supabase
    .from('rankings')
    .update({
      rating: newRatings.ai,
      wins: !playerWon ? aiRanking.wins + 1 : aiRanking.wins,
      losses: !playerWon ? aiRanking.losses : aiRanking.losses + 1,
      streak: !playerWon ? Math.max(0, aiRanking.streak) + 1 : Math.min(0, aiRanking.streak) - 1,
    })
    .eq('battler_id', aiBattlerId);

  // Phase 6: Generate news article and life events
  try {
    const { createBattleRecapAndEvents } = await import('@/lib/services/newsGenerator');
    await createBattleRecapAndEvents(battleId, supabase);
  } catch (err) {
    console.error('Failed to create recap/news for battle', battleId, err);
  }

  // Trigger life events based on battle outcome
  try {
    const { triggerLifeEventsForBattle } = await import('@/lib/game/lifeEvents');

    // Calculate battle result details
    const playerRoundsWon = rounds.filter((r) => r.battler_id === playerBattlerId && r.won).length;
    const aiRoundsWon = rounds.filter((r) => r.battler_id === aiBattlerId && r.won).length;

    const playerRounds = rounds.filter((r) => r.battler_id === playerBattlerId);
    const aiRounds = rounds.filter((r) => r.battler_id === aiBattlerId);

    const playerChoked = playerRounds.some((r) => r.choked);
    const aiChoked = aiRounds.some((r) => r.choked);

    const playerAvgCrowdReaction = playerRounds.length > 0
      ? playerRounds.reduce((sum, r) => sum + r.crowd_reaction, 0) / playerRounds.length
      : 0;
    const aiAvgCrowdReaction = aiRounds.length > 0
      ? aiRounds.reduce((sum, r) => sum + r.crowd_reaction, 0) / aiRounds.length
      : 0;

    await triggerLifeEventsForBattle(
      supabase,
      {
        battleId,
        winnerId,
        playerBattlerId,
        aiBattlerId,
        playerRoundsWon,
        aiRoundsWon,
        playerChoked,
        aiChoked,
        playerAvgCrowdReaction,
        aiAvgCrowdReaction,
      },
      {
        battlerId: playerBattlerId,
        rating: playerRanking.rating,
        wins: playerWon ? playerRanking.wins + 1 : playerRanking.wins,
        losses: playerWon ? playerRanking.losses : playerRanking.losses + 1,
        streak: playerWon ? Math.max(0, playerRanking.streak) + 1 : Math.min(0, playerRanking.streak) - 1,
        attributes: playerAttributes,
        publicKnowledge: playerAttributes.public_knowledge,
      },
      {
        battlerId: aiBattlerId,
        rating: aiRanking.rating,
        wins: !playerWon ? aiRanking.wins + 1 : aiRanking.wins,
        losses: !playerWon ? aiRanking.losses : aiRanking.losses + 1,
        streak: !playerWon ? Math.max(0, aiRanking.streak) + 1 : Math.min(0, aiRanking.streak) - 1,
        attributes: aiAttributes,
        publicKnowledge: aiAttributes.public_knowledge,
      }
    );
  } catch (err) {
    console.error('Failed to trigger life events for battle', battleId, err);
  }

  // Apply attribute progression based on battle performance
  try {
    const { applyAttributeProgression } = await import('@/lib/game/progression');
    await applyAttributeProgression(battleId, supabase);
  } catch (err) {
    console.error('Failed to apply attribute progression for battle', battleId, err);
  }

  // Create notification for battle completion
  try {
    const { notifyBattleComplete } = await import('@/lib/services/notificationService');
    const { data: opponentBattler } = await supabase
      .from('battlers')
      .select('name')
      .eq('id', aiBattlerId)
      .single();

    if (opponentBattler) {
      // Generate authentic battle rap result message
      let resultMsg = '';
      if (playerWon) {
        resultMsg = verdict === '3-0' ? `BODYBAG (${verdict})` : `W (${verdict})`;
      } else {
        resultMsg = verdict === '3-0' ? `BODY'D (${verdict})` : `L (${verdict})`;
      }

      await notifyBattleComplete(
        supabase,
        playerBattlerId,
        battleId,
        opponentBattler.name,
        playerWon,
        resultMsg
      );
    }
  } catch (err) {
    console.error('Failed to create battle completion notification for battle', battleId, err);
  }

  // Update tournament bracket if this is a tournament battle
  if (isTournamentBattle && battle.tournament_id) {
    try {
      const { updateBracketWithBattleResult } = await import('./tournamentManager');
      const result = await updateBracketWithBattleResult(battleId, winnerId);
      if (!result.success) {
        console.error('Failed to update tournament bracket:', result.error);
      }
    } catch (err) {
      console.error('Failed to update tournament bracket for battle', battleId, err);
    }
  }
}

/**
 * Calculate new ELO ratings
 */
function calculateELO(
  playerRating: number,
  aiRating: number,
  playerWon: boolean
): { player: number; ai: number } {
  const expectedPlayer =
    1 / (1 + Math.pow(10, (aiRating - playerRating) / 400));
  const expectedAi = 1 - expectedPlayer;

  const playerActual = playerWon ? 1 : 0;
  const aiActual = playerWon ? 0 : 1;

  return {
    player: Math.round(
      playerRating + CONFIG.RATING_K_FACTOR * (playerActual - expectedPlayer)
    ),
    ai: Math.round(aiRating + CONFIG.RATING_K_FACTOR * (aiActual - expectedAi)),
  };
}

/**
 * Calculate standard deviation
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.length > 0
    ? squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length
    : 0;
  return Math.sqrt(avgSquareDiff);
}
