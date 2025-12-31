import { createServerSupabaseClient } from '@/lib/db/server';
import { getBloggerPrompt } from '../game/bloggerPrompts';
import { generateBloggerArticleWithLLM } from './llmIntegration';
import { getLLMConfig } from './llmConfig';
import { analyzeAndCreateGrudge, type BattleResultForGrudge } from '../game/grudgeEngine';
import { updateHeadToHeadRecord, type BattleRecordData } from '../game/headToHeadTracking';
import { getRivalryContext, generateRivalryArticleForBattle } from './rivalryNarrativeGenerator';
import { selectBloggerForStory, recordBloggerCoverage, analyzeSentiment, extractNarrativeSummary } from './bloggerMemory';
import { generateNarrativeArticleBody, type BattleNarrativeInput, type BattlePerformanceData } from '@/lib/game/blogger-narratives';

/**
 * Phase 6: News Generator Service
 *
 * Creates battle recaps and life events after battles complete.
 * Makes the game feel like a living world with media coverage.
 */

export interface BattleRecapSummary {
  battleId: string;
  leagueName: string;
  leagueStageType: 'small_room' | 'main_stage';
  player: {
    id: string;
    name: string;
    ratingBefore: number;
    ratingAfter: number;
    roundsWon: number;
    chokes: number;
    stumbles: number;
    haymakers: number;
    crowdAverage: number;
  };
  ai: {
    id: string;
    name: string;
    ratingBefore: number;
    ratingAfter: number;
    roundsWon: number;
    chokes: number;
    stumbles: number;
    haymakers: number;
    crowdAverage: number;
  };
  winnerId: string;
  loserId: string;
  decision: 'bodybag_30' | 'clear_30' | 'clear_21' | 'edge' | 'classic' | 'comeback';
  isUpset: boolean;
  keyMoments: {
    round: number;
    segment: number;
    who: 'player' | 'ai';
    event: 'haymaker' | 'choke' | 'stumble';
  }[];
}

/**
 * Main entry point - creates recap article and life events for a completed battle
 * ENHANCED WITH GRUDGE SYSTEM: Now tracks H2H records, creates grudges, and generates rivalry-aware articles
 */
export async function createBattleRecapAndEvents(battleId: string, supabaseClient?: any): Promise<void> {
  // Use provided client for scripts, or create server client for API routes
  const supabase = supabaseClient || await createServerSupabaseClient();

  // 1. Load all battle data
  const { data: battle } = await supabase
    .from('battles')
    .select(`
      *,
      league:leagues(*),
      player_battler:battler_player_id(id, stage_name),
      ai_battler:battler_ai_id(id, stage_name)
    `)
    .eq('id', battleId)
    .single();

  if (!battle) {
    throw new Error(`Battle ${battleId} not found`);
  }

  // Load rounds
  const { data: rounds } = await supabase
    .from('battle_rounds')
    .select('*')
    .eq('battle_id', battleId)
    .order('round_index');

  // Load segments
  const { data: segments } = await supabase
    .from('battle_segments')
    .select('*')
    .eq('battle_id', battleId)
    .order('round_index')
    .order('segment_index');

  // Load rankings to get before/after ratings
  const { data: rankings } = await supabase
    .from('rankings')
    .select('*')
    .in('battler_id', [battle.battler_player_id, battle.battler_ai_id]);

  if (!rounds || !segments || !rankings) {
    throw new Error('Failed to load battle data for recap');
  }

  // 2. Build summary
  const summary = buildBattleRecapSummary(
    battle,
    rounds,
    segments,
    rankings
  );

  // 3. GRUDGE SYSTEM: Update head-to-head record (optional - gracefully skip if table doesn't exist)
  let rivalryContext = { hasGrudge: false, grudge: null };
  let grudgeResult = null;

  try {
    await updateH2HRecord(summary, supabase);

    // 4. GRUDGE SYSTEM: Analyze and create/update grudge
    grudgeResult = await analyzeGrudge(summary);

    // 5. GRUDGE SYSTEM: Check if battle involves active rivalry
    rivalryContext = await getRivalryContext(
      summary.player.id,
      summary.ai.id
    ) as any;
  } catch (err: any) {
    // If grudge system tables don't exist yet, skip rivalry features
    if (err?.code === 'PGRST205' || err?.message?.includes('head_to_head_records')) {
      console.log('Grudge/rivalry tables not found, skipping rivalry features');
    } else {
      // Re-throw unexpected errors
      throw err;
    }
  }

  // 6. Create recap article (rivalry-aware if grudge exists)
  let articleId: string;
  if (rivalryContext.hasGrudge) {
    // Use rivalry-aware article generation
    articleId = await createRivalryRecapArticle(supabase, summary, rivalryContext, grudgeResult);
  } else {
    // Use standard article generation
    articleId = await createRecapArticle(supabase, summary);
  }

  // 7. Create life events
  await createLifeEvents(supabase, summary);

  // 8. Update reputation
  await updateReputation(supabase, summary);
}

// =====================================================
// GRUDGE SYSTEM INTEGRATION FUNCTIONS
// =====================================================

/**
 * Update head-to-head record after battle
 */
async function updateH2HRecord(summary: BattleRecapSummary, supabase: any): Promise<void> {
  const playerRounds = summary.player.roundsWon;
  const aiRounds = summary.ai.roundsWon;

  const h2hData: BattleRecordData = {
    battleId: summary.battleId,
    battlerAId: summary.player.id,
    battlerBId: summary.ai.id,
    winnerId: summary.winnerId,
    score: `${Math.max(playerRounds, aiRounds)}-${Math.min(playerRounds, aiRounds)}`,
    battlerAAvgScore: summary.player.crowdAverage,
    battlerBAvgScore: summary.ai.crowdAverage,
    battlerACrowdReaction: summary.player.crowdAverage,
    battlerBCrowdReaction: summary.ai.crowdAverage,
    battleDate: new Date().toISOString(),
  };

  await updateHeadToHeadRecord(h2hData, supabase);
}

/**
 * Analyze battle and create/update grudge if applicable
 */
async function analyzeGrudge(summary: BattleRecapSummary) {
  const playerRanking = summary.player.ratingBefore;
  const aiRanking = summary.ai.ratingBefore;

  const battleData: BattleResultForGrudge = {
    battleId: summary.battleId,
    battlerA: {
      id: summary.player.id,
      stageName: summary.player.name,
      rating: playerRanking,
    },
    battlerB: {
      id: summary.ai.id,
      stageName: summary.ai.name,
      rating: aiRanking,
    },
    winnerId: summary.winnerId,
    score: `${Math.max(summary.player.roundsWon, summary.ai.roundsWon)}-${Math.min(summary.player.roundsWon, summary.ai.roundsWon)}`,
    rounds: [
      {
        roundNumber: 1,
        battlerAScore: summary.player.crowdAverage,
        battlerBScore: summary.ai.crowdAverage,
        battlerAWon: summary.player.roundsWon >= 2,
      },
      {
        roundNumber: 2,
        battlerAScore: summary.player.crowdAverage,
        battlerBScore: summary.ai.crowdAverage,
        battlerAWon: summary.player.roundsWon >= 2,
      },
      {
        roundNumber: 3,
        battlerAScore: summary.player.crowdAverage,
        battlerBScore: summary.ai.crowdAverage,
        battlerAWon: summary.player.roundsWon >= 2,
      },
    ],
    wasUpset: summary.isUpset,
    wasClose: summary.decision === 'edge' || summary.decision === 'classic',
    wasDomination: summary.decision === 'bodybag_30' || summary.decision === 'clear_30',
    hasControversy: summary.decision === 'edge',
    scheduledAt: new Date().toISOString(),
  };

  return await analyzeAndCreateGrudge(battleData);
}

/**
 * Create rivalry-aware recap article
 */
async function createRivalryRecapArticle(
  supabase: any,
  summary: BattleRecapSummary,
  rivalryContext: any,
  grudgeResult: any
): Promise<string> {
  const winnerName = summary.winnerId === summary.player.id ? summary.player.name : summary.ai.name;
  const loserName = summary.loserId === summary.player.id ? summary.player.name : summary.ai.name;
  const winnerRounds = summary.winnerId === summary.player.id ? summary.player.roundsWon : summary.ai.roundsWon;
  const loserRounds = summary.loserId === summary.player.id ? summary.player.roundsWon : summary.ai.roundsWon;

  // Map decision to string description
  let decisionDescription = 'edged out';
  if (summary.decision === 'bodybag_30') decisionDescription = 'bodybag';
  if (summary.decision === 'clear_30') decisionDescription = 'dominated';
  if (summary.decision === 'classic') decisionDescription = 'instant classic';

  // Build key moments from summary
  const keyMoments = summary.keyMoments.map(m => {
    const who = m.who === 'player' ? summary.player.name : summary.ai.name;
    if (m.event === 'haymaker') return `${who} landed a haymaker in R${m.round}`;
    if (m.event === 'choke') return `${who} choked in R${m.round}`;
    return `${who} stumbled in R${m.round}`;
  });

  // Use rivalry article generator
  const articleId = await generateRivalryArticleForBattle(
    summary.battleId,
    summary.player.id,
    summary.ai.id,
    summary.player.name,
    summary.ai.name,
    summary.winnerId,
    `${winnerRounds}-${loserRounds}`,
    {
      decision: decisionDescription,
      isUpset: summary.isUpset,
      keyMoments,
    }
  );

  return articleId;
}

// =====================================================
// ORIGINAL FUNCTIONS (Enhanced)
// =====================================================

/**
 * Build comprehensive battle summary from raw data
 */
function buildBattleRecapSummary(
  battle: any,
  rounds: any[],
  segments: any[],
  rankings: any[]
): BattleRecapSummary {
  const playerRounds = rounds.filter((r) => r.battler_id === battle.battler_player_id);
  const aiRounds = rounds.filter((r) => r.battler_id === battle.battler_ai_id);

  const playerSegments = segments.filter((s) => s.battler_id === battle.battler_player_id);
  const aiSegments = segments.filter((s) => s.battler_id === battle.battler_ai_id);

  const playerRanking = rankings.find((r) => r.battler_id === battle.battler_player_id);
  const aiRanking = rankings.find((r) => r.battler_id === battle.battler_ai_id);

  // Count wins
  const playerRoundsWon = playerRounds.filter((r) => r.won).length;
  const aiRoundsWon = aiRounds.filter((r) => r.won).length;

  // Count chokes and haymakers
  const playerChokes = playerSegments.filter((s) =>
    s.event_flags.includes('choke')
  ).length;
  const aiChokes = aiSegments.filter((s) => s.event_flags.includes('choke')).length;

  const playerStumbles = playerSegments.filter((s) =>
    s.event_flags.includes('stumble')
  ).length;
  const aiStumbles = aiSegments.filter((s) => s.event_flags.includes('stumble')).length;

  const playerHaymakers = playerSegments.filter((s) =>
    s.event_flags.includes('haymaker')
  ).length;
  const aiHaymakers = aiSegments.filter((s) =>
    s.event_flags.includes('haymaker')
  ).length;

  // Average crowd reaction
  const playerCrowdAverage =
    playerRounds.reduce((sum, r) => sum + r.crowd_reaction, 0) / playerRounds.length;
  const aiCrowdAverage =
    aiRounds.reduce((sum, r) => sum + r.crowd_reaction, 0) / aiRounds.length;

  const winnerId = battle.winner_battler_id;
  const loserId =
    winnerId === battle.battler_player_id
      ? battle.battler_ai_id
      : battle.battler_player_id;

  const winnerRoundsWon =
    winnerId === battle.battler_player_id ? playerRoundsWon : aiRoundsWon;

  const loserChokes =
    loserId === battle.battler_player_id ? playerChokes : aiChokes;
  const loserCrowdAverage =
    loserId === battle.battler_player_id ? playerCrowdAverage : aiCrowdAverage;

  // Determine decision type
  let decision: BattleRecapSummary['decision'] = 'edge';

  if (winnerRoundsWon === 3) {
    // 3-0
    if (loserCrowdAverage < 40 && loserChokes >= 1) {
      decision = 'bodybag_30';
    } else {
      decision = 'clear_30';
    }
  } else if (winnerRoundsWon === 2) {
    // 2-1
    const winnerRounds =
      winnerId === battle.battler_player_id ? playerRounds : aiRounds;
    const loserRounds = winnerId === battle.battler_player_id ? aiRounds : playerRounds;

    const winnerAvg =
      winnerRounds.reduce((sum, r) => sum + r.average_score, 0) / winnerRounds.length;
    const loserAvg =
      loserRounds.reduce((sum, r) => sum + r.average_score, 0) / loserRounds.length;

    const margin = winnerAvg - loserAvg;

    // Check for comeback (lost round 1, won 2 and 3)
    const winnerWonRound1 = winnerRounds.find((r) => r.round_index === 1)?.won;
    const winnerWonRound2 = winnerRounds.find((r) => r.round_index === 2)?.won;
    const winnerWonRound3 = winnerRounds.find((r) => r.round_index === 3)?.won;

    if (!winnerWonRound1 && winnerWonRound2 && winnerWonRound3) {
      decision = 'comeback';
    } else if (margin > 1.5) {
      decision = 'clear_21';
    } else {
      decision = 'edge';
    }
  }

  // Check for classic
  if (playerCrowdAverage >= 75 && aiCrowdAverage >= 75) {
    if (playerHaymakers >= 2 && aiHaymakers >= 2) {
      decision = 'classic';
    }
  }

  // Check for upset
  const winnerRatingBefore =
    winnerId === battle.battler_player_id
      ? playerRanking?.rating || 1200
      : aiRanking?.rating || 1200;
  const loserRatingBefore =
    loserId === battle.battler_player_id
      ? playerRanking?.rating || 1200
      : aiRanking?.rating || 1200;

  const isUpset = winnerRatingBefore <= loserRatingBefore - 150;

  // Collect key moments
  const keyMoments: BattleRecapSummary['keyMoments'] = [];
  segments.forEach((seg) => {
    seg.event_flags.forEach((event: string) => {
      if (event === 'haymaker' || event === 'choke' || event === 'stumble') {
        keyMoments.push({
          round: seg.round_index,
          segment: seg.segment_index,
          who: seg.battler_id === battle.battler_player_id ? 'player' : 'ai',
          event: event as 'haymaker' | 'choke' | 'stumble',
        });
      }
    });
  });

  // Determine league stage type
  const leagueStageType: 'small_room' | 'main_stage' =
    battle.league.round_length_minutes === 2 ? 'small_room' : 'main_stage';

  return {
    battleId: battle.id,
    leagueName: battle.league.name,
    leagueStageType,
    player: {
      id: battle.battler_player_id,
      name: battle.player_battler.stage_name,
      ratingBefore: playerRanking?.rating || 1200,
      ratingAfter: playerRanking?.rating || 1200,
      roundsWon: playerRoundsWon,
      chokes: playerChokes,
      stumbles: playerStumbles,
      haymakers: playerHaymakers,
      crowdAverage: Math.round(playerCrowdAverage),
    },
    ai: {
      id: battle.battler_ai_id,
      name: battle.ai_battler.stage_name,
      ratingBefore: aiRanking?.rating || 1200,
      ratingAfter: aiRanking?.rating || 1200,
      roundsWon: aiRoundsWon,
      chokes: aiChokes,
      stumbles: aiStumbles,
      haymakers: aiHaymakers,
      crowdAverage: Math.round(aiCrowdAverage),
    },
    winnerId,
    loserId,
    decision,
    isUpset,
    keyMoments,
  };
}

/**
 * Create recap article in news_articles table
 * ENHANCED: Now uses blogger memory system and returns article ID
 */
async function createRecapArticle(supabase: any, summary: BattleRecapSummary): Promise<string> {
  const title = buildTitle(summary);
  const slug = buildSlug(title, summary.battleId);

  // ENHANCED: Use new blogger memory system
  const blogger = await selectBloggerForStory(
    'battle_recap',
    summary.player.id,
    summary.ai.id,
    undefined,
    supabase
  );

  // Generate article content (with LLM or fallback)
  const bodyMarkdown = await generateArticleContent(summary, blogger);

  const { data: article, error } = await supabase.from('news_articles').insert({
    slug,
    title,
    type: 'battle_recap',
    body_markdown: bodyMarkdown,
    primary_battler_id:
      summary.winnerId === summary.player.id ? summary.player.id : summary.ai.id,
    secondary_battler_id:
      summary.loserId === summary.player.id ? summary.player.id : summary.ai.id,
    league_id: null, // We don't have league_id in summary - could enhance
    battle_id: summary.battleId,
    meta_json: {
      decision: summary.decision,
      isUpset: summary.isUpset,
      blogger: blogger,
    },
    published_at: new Date().toISOString(),
  }).select().single();

  if (error) {
    console.error('Error creating recap article:', error);
    throw error;
  }

  // ENHANCED: Record blogger coverage in memory system
  const sentiment = analyzeSentiment(bodyMarkdown);
  const narrative = extractNarrativeSummary(bodyMarkdown);

  await recordBloggerCoverage(blogger, 'battler', summary.player.id, article.id, sentiment, narrative, supabase);
  await recordBloggerCoverage(blogger, 'battler', summary.ai.id, article.id, sentiment, narrative, supabase);
  await recordBloggerCoverage(blogger, 'battle', summary.battleId, article.id, sentiment, narrative, supabase);

  return article.id;
}

/**
 * Select which blogger should cover this battle based on characteristics
 */
function selectBloggerForBattle(summary: BattleRecapSummary): string {
  // Logic to pick appropriate blogger based on battle narrative
  // New 8 bloggers: battle_eyez, marijuana_piranha, algorithm_institute, small_room_report,
  // the_main_stage_herald, underground_voice, coast_to_coast_coverage, the_battle_breakdown

  // Upset stories → Coast to Coast Coverage (cynical underdog champion)
  if (summary.isUpset) {
    return 'coast_to_coast_coverage';
  }

  // Drama/chokes/scandals → Battle Eyez (drama hunter)
  if (summary.player.chokes > 0 || summary.ai.chokes > 0) {
    return 'battle_eyez';
  }

  // Small room battles → Small Room Report (underground specialist)
  if (summary.leagueStageType === 'small_room') {
    return 'small_room_report';
  }

  // Main stage classics with high crowd → The Main Stage Herald (big stage specialist)
  if (summary.leagueStageType === 'main_stage' && summary.decision === 'classic' && summary.player.crowdAverage > 70) {
    return 'the_main_stage_herald';
  }

  // Street energy battles (high crowd, aggressive) → Marijuana Piranha (street voice)
  if (summary.player.crowdAverage > 80 || summary.ai.crowdAverage > 80) {
    return 'marijuana_piranha';
  }

  // Historical significance (high ratings) → Algorithm Institute (historian)
  if (summary.player.ratingBefore > 1400 || summary.ai.ratingBefore > 1400) {
    return 'algorithm_institute';
  }

  // Lower-rated/undercard battles → Underground Voice (indie advocate)
  if (summary.player.ratingBefore < 1200 && summary.ai.ratingBefore < 1200) {
    return 'underground_voice';
  }

  // Default to The Battle Breakdown (technical scorecard analyst) for everything else
  return 'the_battle_breakdown';
}

/**
 * Build article title based on battle outcome
 */
function buildTitle(summary: BattleRecapSummary): string {
  const winner =
    summary.winnerId === summary.player.id ? summary.player.name : summary.ai.name;
  const loser =
    summary.loserId === summary.player.id ? summary.player.name : summary.ai.name;
  const league = summary.leagueName;

  const winnerRounds =
    summary.winnerId === summary.player.id
      ? summary.player.roundsWon
      : summary.ai.roundsWon;
  const loserRounds =
    summary.loserId === summary.player.id
      ? summary.player.roundsWon
      : summary.ai.roundsWon;

  if (summary.decision === 'bodybag_30') {
    return `${winner} 30s ${loser} in ${league} Bodybag`;
  } else if (summary.decision === 'clear_30') {
    return `${winner} Dominates ${loser} 3-0 at ${league}`;
  } else if (summary.isUpset) {
    return `${winner} Shocks ${loser} in Major Upset at ${league}`;
  } else if (summary.decision === 'classic') {
    return `${winner} vs ${loser}: Instant Classic on ${league}`;
  } else if (summary.decision === 'comeback') {
    return `${winner} Rallies Back to Beat ${loser} ${winnerRounds}-${loserRounds} at ${league}`;
  } else if (summary.decision === 'edge') {
    return `${winner} Edges ${loser} in ${league} ${winnerRounds}-${loserRounds} War`;
  } else {
    return `${winner} Defeats ${loser} ${winnerRounds}-${loserRounds} at ${league}`;
  }
}

/**
 * Build URL slug from title
 */
function buildSlug(title: string, battleId: string): string {
  const kebab = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const shortId = battleId.substring(battleId.length - 6);
  return `${kebab}-${shortId}`;
}

/**
 * Determine decision type for blogger prompts
 * Maps internal decision codes to blogger-friendly types
 */
function getDecisionType(summary: BattleRecapSummary): '3-0' | '2-1 edge' | '2-1 classic' {
  const verdict = `${Math.max(summary.player.roundsWon, summary.ai.roundsWon)}-${Math.min(summary.player.roundsWon, summary.ai.roundsWon)}`;

  // 3-0 decisions (bodybags or clear sweeps)
  if (verdict === '3-0') {
    return '3-0';
  }

  // 2-1 decisions - determine if edge or classic
  if (summary.decision === 'classic') {
    return '2-1 classic';  // Both battlers performed well, close competitive battle
  }

  // Everything else is a 2-1 edge (clear victor but not dominant)
  return '2-1 edge';
}

/**
 * Generate article using LLM or fallback to template
 * ENHANCED: Now accepts BloggerName type from blogger memory system
 */
async function generateArticleContent(summary: BattleRecapSummary, bloggerKey: string): Promise<string> {
  const config = getLLMConfig();

  // If real LLM is disabled, use mock generation with blogger narrative system
  if (!config.useRealLLM) {
    console.log('[NewsGen] Using narrative article generation (USE_REAL_LLM=false)');
    return buildMarkdownBody(summary, bloggerKey);
  }

  try {
    // Prepare battle data for blogger prompt
    const winner = summary.winnerId === summary.player.id ? summary.player.name : summary.ai.name;
    const loser = summary.loserId === summary.player.id ? summary.player.name : summary.ai.name;
    const winnerRounds = summary.winnerId === summary.player.id ? summary.player.roundsWon : summary.ai.roundsWon;
    const loserRounds = summary.loserId === summary.player.id ? summary.player.roundsWon : summary.ai.roundsWon;
    const verdict = `${winnerRounds}-${loserRounds}`;

    // Determine decision type for blogger differentiation
    const decisionType = getDecisionType(summary);

    // Build round summary
    const roundSummary = summary.keyMoments
      .map(m => `Round ${m.round}, Segment ${m.segment}: ${m.who === 'player' ? summary.player.name : summary.ai.name} ${m.event === 'haymaker' ? 'landed a haymaker' : 'choked'}`)
      .join('\n');

    const notableMoments = summary.keyMoments
      .filter(m => m.event === 'haymaker')
      .map(m => `${m.who === 'player' ? summary.player.name : summary.ai.name} in R${m.round}`)
      .join(', ') || 'No major haymakers';

    const crowdReaction = `Player: ${summary.player.crowdAverage}%, AI: ${summary.ai.crowdAverage}%`;

    const dramaNotes = summary.isUpset
      ? `Major upset! ${winner} was rated ${summary.winnerId === summary.player.id ? summary.player.ratingBefore : summary.ai.ratingBefore} vs ${loser}'s ${summary.loserId === summary.player.id ? summary.player.ratingBefore : summary.ai.ratingBefore}`
      : 'No major drama';

    // Get blogger prompt with decision type
    const { systemPrompt, userPrompt } = getBloggerPrompt(bloggerKey, {
      decision_type: decisionType,
      battler_a: summary.player.name,
      battler_b: summary.ai.name,
      winner,
      verdict,
      league: summary.leagueName,
      round_summary: roundSummary,
      notable_moments: notableMoments,
      crowd_reaction: crowdReaction,
      drama_notes: dramaNotes,
      performance_notes: `${winner} avg crowd: ${summary.winnerId === summary.player.id ? summary.player.crowdAverage : summary.ai.crowdAverage}%`,
      technical_analysis: `Decision: ${decisionType} (${summary.decision})`,
      career_notes: `${winner} moves to ${summary.winnerId === summary.player.id ? summary.player.ratingAfter : summary.ai.ratingAfter} rating`,
    });

    // Call LLM
    console.log(`[NewsGen] Generating article with LLM for blogger: ${bloggerKey}`);
    const response = await generateBloggerArticleWithLLM(bloggerKey, systemPrompt, userPrompt);

    console.log(`[NewsGen] LLM article generated successfully (${response.tokensUsed} tokens, ${response.latencyMs}ms)`);

    // Return LLM-generated content
    return response.content;

  } catch (error: any) {
    // Fallback to narrative generation on error
    console.error(`[NewsGen] LLM generation failed: ${error.message}. Falling back to narrative generation.`);
    return buildMarkdownBody(summary, bloggerKey);
  }
}

/**
 * Build markdown article body using skill-based narratives (NO raw scores)
 * Uses the blogger narrative system to translate performance data into storytelling
 */
function buildMarkdownBody(summary: BattleRecapSummary, bloggerId?: string): string {
  // Build performance data for winner
  const winnerData =
    summary.winnerId === summary.player.id ? summary.player : summary.ai;
  const loserData =
    summary.loserId === summary.player.id ? summary.player : summary.ai;

  const winnerPerformance: BattlePerformanceData = {
    battlerName: winnerData.name,
    crowdAverage: winnerData.crowdAverage,
    haymakers: winnerData.haymakers,
    chokes: winnerData.chokes,
    stumbles: winnerData.stumbles,
    roundsWon: winnerData.roundsWon,
    isWinner: true,
  };

  const loserPerformance: BattlePerformanceData = {
    battlerName: loserData.name,
    crowdAverage: loserData.crowdAverage,
    haymakers: loserData.haymakers,
    chokes: loserData.chokes,
    stumbles: loserData.stumbles,
    roundsWon: loserData.roundsWon,
    isWinner: false,
  };

  // Use the narrative system to generate article body
  const narrativeInput: BattleNarrativeInput = {
    bloggerId: bloggerId || 'battle-breakdown',
    winner: winnerPerformance,
    loser: loserPerformance,
    decision: summary.decision,
    isUpset: summary.isUpset,
    leagueName: summary.leagueName,
  };

  return generateNarrativeArticleBody(narrativeInput);
}

/**
 * Create life events based on battle outcome
 */
async function createLifeEvents(supabase: any, summary: BattleRecapSummary) {
  // Load templates
  const { data: templates } = await supabase
    .from('life_event_templates')
    .select('*');

  if (!templates) return;

  const events: any[] = [];

  // Winner events
  if (summary.decision === 'bodybag_30') {
    const template = templates.find((t: any) => t.code === 'DOMINANT_30_BODYBAG');
    if (template) {
      events.push({
        battler_id: summary.winnerId,
        template_id: template.id,
        battle_id: summary.battleId,
        public: true,
        details_json: {
          opponent: summary.loserId === summary.player.id ? summary.player.name : summary.ai.name,
          decision: 'bodybag_30',
        },
      });
    }
  } else if (summary.decision === 'clear_30') {
    const template = templates.find((t: any) => t.code === 'CLEAR_30_VICTORY');
    if (template) {
      events.push({
        battler_id: summary.winnerId,
        template_id: template.id,
        battle_id: summary.battleId,
        public: true,
        details_json: {
          opponent: summary.loserId === summary.player.id ? summary.player.name : summary.ai.name,
        },
      });
    }
  } else if (summary.decision === 'comeback') {
    const template = templates.find((t: any) => t.code === 'COMEBACK_VICTORY');
    if (template) {
      events.push({
        battler_id: summary.winnerId,
        template_id: template.id,
        battle_id: summary.battleId,
        public: true,
        details_json: {
          opponent: summary.loserId === summary.player.id ? summary.player.name : summary.ai.name,
        },
      });
    }
  } else if (
    summary.winnerId === summary.player.id
      ? summary.player.roundsWon === 2
      : summary.ai.roundsWon === 2
  ) {
    const template = templates.find((t: any) => t.code === 'NARROW_VICTORY');
    if (template) {
      events.push({
        battler_id: summary.winnerId,
        template_id: template.id,
        battle_id: summary.battleId,
        public: true,
        details_json: {
          opponent: summary.loserId === summary.player.id ? summary.player.name : summary.ai.name,
        },
      });
    }
  }

  // Upset
  if (summary.isUpset) {
    const template = templates.find((t: any) => t.code === 'UPSET_OF_THE_NIGHT');
    if (template) {
      events.push({
        battler_id: summary.winnerId,
        template_id: template.id,
        battle_id: summary.battleId,
        public: true,
        details_json: {
          opponent: summary.loserId === summary.player.id ? summary.player.name : summary.ai.name,
          ratingDifference:
            (summary.loserId === summary.player.id
              ? summary.player.ratingBefore
              : summary.ai.ratingBefore) -
            (summary.winnerId === summary.player.id
              ? summary.player.ratingBefore
              : summary.ai.ratingBefore),
        },
      });
    }
  }

  // Classic
  if (summary.decision === 'classic') {
    const template = templates.find((t: any) => t.code === 'CLASSIC_BACK_AND_FORTH');
    if (template) {
      // Both get this event
      events.push({
        battler_id: summary.player.id,
        template_id: template.id,
        battle_id: summary.battleId,
        public: true,
        details_json: {
          opponent: summary.ai.name,
        },
      });
      events.push({
        battler_id: summary.ai.id,
        template_id: template.id,
        battle_id: summary.battleId,
        public: true,
        details_json: {
          opponent: summary.player.name,
        },
      });
    }
  }

  // Loser events
  const loserChokes = summary.loserId === summary.player.id ? summary.player.chokes : summary.ai.chokes;

  if (summary.decision === 'bodybag_30' && loserChokes >= 1) {
    const template = templates.find((t: any) => t.code === 'CHOKE_IN_BIG_BATTLE');
    if (template) {
      events.push({
        battler_id: summary.loserId,
        template_id: template.id,
        battle_id: summary.battleId,
        public: true,
        details_json: {
          chokes: loserChokes,
        },
      });
    }
  } else if ((summary.loserId === summary.player.id ? summary.player.roundsWon : summary.ai.roundsWon) === 1) {
    const template = templates.find((t: any) => t.code === 'NARROW_LOSS');
    if (template) {
      events.push({
        battler_id: summary.loserId,
        template_id: template.id,
        battle_id: summary.battleId,
        public: true,
        details_json: {
          opponent: summary.winnerId === summary.player.id ? summary.player.name : summary.ai.name,
        },
      });
    }
  }

  if (events.length > 0) {
    await supabase.from('battler_life_events').insert(events);
  }
}

/**
 * Update battler reputation based on outcome
 */
async function updateReputation(supabase: any, summary: BattleRecapSummary) {
  let winnerRepDelta = 0;
  let loserRepDelta = 0;

  if (summary.decision === 'bodybag_30') {
    winnerRepDelta = 15;
    loserRepDelta = -15;
  } else if (summary.decision === 'clear_30') {
    winnerRepDelta = 10;
    loserRepDelta = -10;
  } else if (summary.decision === 'classic') {
    winnerRepDelta = 10;
    loserRepDelta = 5; // Even in loss, you gain rep from a classic
  } else if (summary.decision === 'comeback') {
    winnerRepDelta = 15;
    loserRepDelta = -5;
  } else if (summary.decision === 'edge') {
    winnerRepDelta = 5;
    loserRepDelta = -3;
  } else {
    winnerRepDelta = 8;
    loserRepDelta = -5;
  }

  if (summary.isUpset) {
    winnerRepDelta += 10;
  }

  // Apply deltas
  const { data: winnerAttrs } = await supabase
    .from('battler_attributes')
    .select('personal')
    .eq('battler_id', summary.winnerId)
    .single();

  const { data: loserAttrs } = await supabase
    .from('battler_attributes')
    .select('personal')
    .eq('battler_id', summary.loserId)
    .single();

  if (winnerAttrs) {
    const newRep = Math.max(
      0,
      Math.min(10, (winnerAttrs.personal.reputation || 5) + winnerRepDelta / 10)
    );
    await supabase
      .from('battler_attributes')
      .update({
        personal: {
          ...winnerAttrs.personal,
          reputation: newRep,
        },
      })
      .eq('battler_id', summary.winnerId);
  }

  if (loserAttrs) {
    const newRep = Math.max(
      0,
      Math.min(10, (loserAttrs.personal.reputation || 5) + loserRepDelta / 10)
    );
    await supabase
      .from('battler_attributes')
      .update({
        personal: {
          ...loserAttrs.personal,
          reputation: newRep,
        },
      })
      .eq('battler_id', summary.loserId);
  }
}
