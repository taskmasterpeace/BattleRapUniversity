/**
 * Rivalry Narrative Generator
 *
 * Purpose: Generate grudge-aware battle recaps and rivalry storyline articles
 * Integrates with:
 * - newsGenerator.ts (existing battle recap system)
 * - bloggerMemory.ts (narrative continuity)
 * - grudgeEngine.ts (grudge data)
 * - headToHeadTracking.ts (H2H stats)
 *
 * New Article Types:
 * - grudge_coverage: Rivalry-focused recaps
 * - rivalry_escalation: Intensity increase coverage
 * - rivalry_resolution: Grudge settled coverage
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Rivalry articles are SYSTEM writes fired from the simulation engine for any
 * battle (player, PvP, or world cards). The cookie-based client hit RLS on
 * news_articles and killed the recap pipeline — use the service role.
 */
function createSystemSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
import {
  selectBloggerForStory,
  getBloggerCoverageContext,
  generateBloggerContext,
  recordBloggerCoverage,
  analyzeSentiment,
  extractNarrativeSummary,
  type BloggerName,
} from './bloggerMemory';
import { getHeadToHeadStats } from '@/lib/game/headToHeadTracking';

// =====================================================
// TYPES
// =====================================================

export interface RivalryContext {
  hasGrudge: boolean;
  relationshipId: string | null;
  intensity: number;
  rematchDemand: number;
  status: 'active' | 'dormant' | 'resolved';
  originStory: string | null;
  headToHead: {
    battlerAWins: number;
    battlerBWins: number;
    lastBattleDate: string;
  } | null;
  previousCoverage: Array<{
    articleId: string;
    title: string;
    bloggerName: string;
    publishedAt: string;
  }>;
}

export interface RivalryArticleData {
  battleId: string;
  battlerAId: string;
  battlerBId: string;
  battlerAName: string;
  battlerBName: string;
  winnerId: string;
  score: string;
  rivalryContext: RivalryContext;
  battleSummary: {
    decision: string;
    isUpset: boolean;
    keyMoments: string[];
  };
}

// =====================================================
// CORE FUNCTIONS
// =====================================================

/**
 * Check if a battle involves a rivalry and fetch context
 */
export async function getRivalryContext(
  battlerAId: string,
  battlerBId: string
): Promise<RivalryContext> {
  const supabase = createSystemSupabaseClient();

  // Sort IDs for query (battler_relationships uses ordered IDs)
  const [aId, bId] = battlerAId < battlerBId ? [battlerAId, battlerBId] : [battlerBId, battlerAId];

  // Check for existing relationship
  const { data: relationship } = await supabase
    .from('battler_relationships')
    .select('*')
    .eq('battler_a_id', aId)
    .eq('battler_b_id', bId)
    .single();

  if (!relationship) {
    return {
      hasGrudge: false,
      relationshipId: null,
      intensity: 0,
      rematchDemand: 0,
      status: 'dormant',
      originStory: null,
      headToHead: null,
      previousCoverage: [],
    };
  }

  // Get H2H stats
  const h2hStats = await getHeadToHeadStats(battlerAId, battlerBId);

  // Get previous media coverage of this grudge
  const { data: previousArticles } = await supabase
    .from('news_articles')
    .select('id, title, published_at, meta_json')
    .contains('meta_json', { relationship_id: relationship.id })
    .order('published_at', { ascending: false })
    .limit(5);

  return {
    hasGrudge: true,
    relationshipId: relationship.id,
    intensity: relationship.intensity,
    rematchDemand: relationship.rematch_demand,
    status: relationship.status,
    originStory: relationship.origin_story,
    headToHead: h2hStats ? {
      battlerAWins: h2hStats.battlerARecord.wins,
      battlerBWins: h2hStats.battlerBRecord.wins,
      lastBattleDate: h2hStats.lastBattle?.date || '',
    } : null,
    previousCoverage: previousArticles?.map(a => ({
      articleId: a.id,
      title: a.title,
      bloggerName: a.meta_json?.blogger_name || 'Unknown',
      publishedAt: a.published_at,
    })) || [],
  };
}

/**
 * Generate rivalry-aware battle recap article
 * This enhances the standard battle recap with grudge context
 */
export async function generateRivalryBattleRecap(
  articleData: RivalryArticleData
): Promise<string> {
  const { rivalryContext, battlerAName, battlerBName, winnerId, score } = articleData;

  // Select best blogger for this story
  const blogger = await selectBloggerForStory(
    rivalryContext.hasGrudge ? 'grudge_coverage' : 'battle_recap',
    articleData.battlerAId,
    articleData.battlerBId,
    rivalryContext.relationshipId || undefined
  );

  // Get blogger's coverage context
  const battlerAContext = await getBloggerCoverageContext(blogger, 'battler', articleData.battlerAId);
  const battlerBContext = await getBloggerCoverageContext(blogger, 'battler', articleData.battlerBId);

  let grudgeContext = null;
  if (rivalryContext.relationshipId) {
    grudgeContext = await getBloggerCoverageContext(blogger, 'grudge', rivalryContext.relationshipId);
  }

  // Build enhanced prompt for LLM
  const prompt = buildRivalryRecapPrompt(
    articleData,
    blogger,
    battlerAContext,
    battlerBContext,
    grudgeContext
  );

  // TODO: Call LLM with prompt (integrate with existing llmIntegration.ts).
  // Until then, a data-aware template that at least names the winner, loser,
  // score and margin — not a one-size-fits-all recap.
  const articleBody = await generateArticleWithLLM(blogger, prompt, articleData, rivalryContext.hasGrudge);

  // Create article in database
  const articleId = await createRivalryArticle(
    articleData,
    blogger,
    articleBody,
    rivalryContext.hasGrudge
  );

  // Update blogger memory
  const sentiment = analyzeSentiment(articleBody);
  const narrative = extractNarrativeSummary(articleBody);

  await recordBloggerCoverage(blogger, 'battler', articleData.battlerAId, articleId, sentiment, narrative);
  await recordBloggerCoverage(blogger, 'battler', articleData.battlerBId, articleId, sentiment, narrative);

  if (rivalryContext.relationshipId) {
    await recordBloggerCoverage(blogger, 'grudge', rivalryContext.relationshipId, articleId, sentiment, narrative);
  }

  return articleId;
}

/**
 * Build LLM prompt with rivalry context
 */
function buildRivalryRecapPrompt(
  data: RivalryArticleData,
  blogger: BloggerName,
  battlerAContext: any,
  battlerBContext: any,
  grudgeContext: any
): string {
  const { battlerAName, battlerBName, winnerId, score, rivalryContext, battleSummary } = data;
  const winner = winnerId === data.battlerAId ? battlerAName : battlerBName;
  const loser = winnerId === data.battlerAId ? battlerBName : battlerAName;

  let prompt = `You are ${blogger}, a battle rap media writer. Write a 400-500 word battle recap article.\n\n`;

  // Battle basics
  prompt += `**Battle Result:**\n`;
  prompt += `- ${winner} defeated ${loser} ${score}\n`;
  prompt += `- Decision type: ${battleSummary.decision}\n`;
  if (battleSummary.isUpset) {
    prompt += `- UPSET ALERT: Lower-rated battler won\n`;
  }
  prompt += `\n`;

  // Rivalry context (KEY ENHANCEMENT)
  if (rivalryContext.hasGrudge) {
    prompt += `**GRUDGE MATCH CONTEXT (VERY IMPORTANT):**\n`;
    prompt += `- This battle is part of an ACTIVE RIVALRY between ${battlerAName} and ${battlerBName}\n`;
    prompt += `- Grudge Intensity: ${rivalryContext.intensity}/100 (${getIntensityLabel(rivalryContext.intensity)})\n`;
    prompt += `- Rematch Demand: ${rivalryContext.rematchDemand}/100\n`;
    prompt += `- Head-to-Head Record: ${rivalryContext.headToHead?.battlerAWins || 0}-${rivalryContext.headToHead?.battlerBWins || 0}\n`;
    if (rivalryContext.originStory) {
      prompt += `- Origin: ${rivalryContext.originStory.substring(0, 150)}...\n`;
    }

    if (rivalryContext.previousCoverage.length > 0) {
      prompt += `\n**Your Previous Coverage:**\n`;
      rivalryContext.previousCoverage.slice(0, 3).forEach(article => {
        prompt += `- "${article.title}" (${article.bloggerName})\n`;
      });
    }

    prompt += `\nREQUIREMENT: Emphasize the grudge angle. Reference the rivalry's origin and how this battle affects it. This is a CONTINUATION of an ongoing story.\n\n`;
  }

  // Blogger continuity
  if (battlerAContext.hasCoveredBefore) {
    prompt += `**Your History with ${battlerAName}:**\n`;
    prompt += `- You've covered them ${battlerAContext.totalArticles} time(s)\n`;
    if (battlerAContext.recentNarrative) {
      prompt += `- Your recent take: "${battlerAContext.recentNarrative.substring(0, 100)}..."\n`;
    }
    prompt += `\n`;
  }

  if (battlerBContext.hasCoveredBefore) {
    prompt += `**Your History with ${battlerBName}:**\n`;
    prompt += `- You've covered them ${battlerBContext.totalArticles} time(s)\n`;
    if (battlerBContext.recentNarrative) {
      prompt += `- Your recent take: "${battlerBContext.recentNarrative.substring(0, 100)}..."\n`;
    }
    prompt += `\n`;
  }

  // Grudge coverage history
  if (grudgeContext && grudgeContext.hasCoveredBefore) {
    prompt += `**Your Rivalry Coverage:**\n`;
    prompt += `- You've written ${grudgeContext.totalArticles} article(s) about this grudge\n`;
    if (grudgeContext.recentNarrative) {
      prompt += `- Your narrative thread: "${grudgeContext.recentNarrative}"\n`;
    }
    prompt += `\nREQUIREMENT: Maintain narrative continuity with your past coverage.\n\n`;
  }

  // Key moments
  if (battleSummary.keyMoments.length > 0) {
    prompt += `**Key Moments:**\n`;
    battleSummary.keyMoments.forEach(moment => {
      prompt += `- ${moment}\n`;
    });
    prompt += `\n`;
  }

  // Style guidance
  prompt += `**Writing Style:**\n`;
  prompt += getBloggerStyleGuidance(blogger);
  prompt += `\n\n`;

  prompt += `**IMPORTANT RULES:**\n`;
  prompt += `- DO NOT invent actual bars or lyrics\n`;
  prompt += `- Focus on performance, momentum, crowd reaction, angles\n`;
  prompt += `- Use battle rap terminology naturally\n`;
  if (rivalryContext.hasGrudge) {
    prompt += `- MUST reference the grudge/rivalry prominently\n`;
    prompt += `- MUST discuss how this battle affects the rivalry going forward\n`;
  }
  prompt += `- Keep it 400-500 words\n`;
  prompt += `- Write in markdown format\n`;

  return prompt;
}

/**
 * Get style guidance for each blogger
 */
function getBloggerStyleGuidance(blogger: BloggerName): string {
  const styles: Record<BloggerName, string> = {
    'Battle Eyez': '- Technical, analytical tone. Break down rounds, segments, strategies.\n- Use data and specifics.\n- Professional but passionate.',
    'Marijuana Piranha': '- Raw, energetic, underground voice.\n- Street-level perspective.\n- Emphasize authenticity and rawness.',
    'Algorithm Institute': '- Data-driven, quantitative analysis.\n- Reference stats, percentages, trends.\n- Academic but accessible.',
    'Small Room Report': '- Focus on intimate venue atmosphere.\n- Crowd proximity, energy.\n- Grassroots feel.',
    'The Main Stage Herald': '- Big stage gravitas.\n- Professional sports journalism tone.\n- Emphasize spectacle and stakes.',
    'Underground Voice': '- Culture-focused, community angle.\n- Context beyond just the battle.\n- Voice of the scene.',
    'Coast to Coast Coverage': '- Regional perspective.\n- Connect to broader landscape.\n- Cross-pollination of scenes.',
    'The Battle Breakdown': '- Strategic analysis.\n- Chess match perspective.\n- Tactical insights.',
  };

  return styles[blogger] || '- Clear, engaging battle rap journalism.';
}

/**
 * Get intensity label
 */
function getIntensityLabel(intensity: number): string {
  if (intensity >= 86) return 'VERY HOT';
  if (intensity >= 61) return 'HOT';
  if (intensity >= 31) return 'Warm';
  return 'Cool';
}

/**
 * Placeholder for LLM integration
 * TODO: Integrate with actual LLM service
 */
async function generateArticleWithLLM(
  blogger: BloggerName,
  prompt: string,
  data?: RivalryArticleData,
  isGrudgeMatch = false
): Promise<string> {
  // TODO: Call actual LLM service (OpenAI, Anthropic, etc.) with `prompt`.
  // Until that lands, build the body from the real battle data so every recap
  // isn't the identical generic template.
  if (!data) {
    return `# Grudge Match Delivers Drama\n\nThe tension was palpable as these two battlers stepped into the ring with unfinished business on their minds.\n\nThis story is far from over.`;
  }

  const winner = data.winnerId === data.battlerAId ? data.battlerAName : data.battlerBName;
  const loser = data.winnerId === data.battlerAId ? data.battlerBName : data.battlerAName;
  const score = data.score;
  const dominant = score.trim().startsWith('3'); // 3-0 sweep vs a 2-1 decision
  const intensity = data.rivalryContext?.intensity ?? 0;

  return `# ${dominant ? 'Statement Made' : 'Down to the Wire'}: ${winner} Takes It ${score}

${winner} walked out of the building with the ${score} over ${loser}${
    isGrudgeMatch ? ', and the bad blood between them only got thicker' : ''
}. ${
    dominant
      ? `This one was never up for debate — ${winner} took every round on the cards and left ${loser} without a rebuttal.`
      : `The cards read ${score}, but everyone in the room felt how close it was; ${loser} pushed ${winner} to the wire before it slipped away.`
  }

## The Setup

${
    isGrudgeMatch
      ? `The history did the promo for them. By the time they locked eyes, the room already knew this one was personal.`
      : `Two names with something to prove stepped up, and the room leaned all the way in.`
  }

## The Battle

${
    dominant
      ? `${winner} controlled the pace from the opening round and never handed it back. ${loser} had a flash here and there, but couldn't string enough together to steal a single card.`
      : `Round for round it was a fight — momentum swung both ways and the crowd rode every turn before ${winner} edged the decision.`
  }

## The Aftermath

${loser} will want this one back${
    isGrudgeMatch && intensity >= 61
      ? ` — and at this temperature, the rematch books itself.`
      : '.'
  } For now, ${winner} has the scoreboard and the momentum.

This story is far from over.`;
}

/**
 * Create article in database
 */
async function createRivalryArticle(
  data: RivalryArticleData,
  blogger: BloggerName,
  articleBody: string,
  isGrudgeMatch: boolean
): Promise<string> {
  const supabase = createSystemSupabaseClient();

  const slug = generateSlug(data.battlerAName, data.battlerBName);

  const { data: article, error } = await supabase
    .from('news_articles')
    .insert({
      slug,
      title: generateTitle(data, isGrudgeMatch),
      type: isGrudgeMatch ? 'grudge_coverage' : 'battle_recap',
      body_markdown: articleBody,
      published_at: new Date().toISOString(),
      primary_battler_id: data.battlerAId,
      secondary_battler_id: data.battlerBId,
      battle_id: data.battleId,
      meta_json: {
        blogger_name: blogger,
        relationship_id: data.rivalryContext.relationshipId,
        grudge_intensity: data.rivalryContext.intensity,
        is_grudge_match: isGrudgeMatch,
      },
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating rivalry article:', error);
    throw error;
  }

  return article.id;
}

/**
 * Generate article title
 */
function generateTitle(data: RivalryArticleData, isGrudgeMatch: boolean): string {
  const { battlerAName, battlerBName, winnerId, score } = data;
  const winner = winnerId === data.battlerAId ? battlerAName : battlerBName;
  const loser = winnerId === data.battlerAId ? battlerBName : battlerAName;

  const dominant = score.trim().startsWith('3');
  if (isGrudgeMatch) {
    // Wide on purpose — a thin pool makes the media hub read as five straight
    // "Rivalry Intensifies" headlines. Add here, don't trim.
    const templates = [
      `Rivalry Intensifies: ${winner} Defeats ${loser} ${score}`,
      `${winner} vs ${loser}: Grudge Battle Delivers Drama`,
      `Beef Escalates as ${winner} Takes ${score} Victory Over ${loser}`,
      dominant
        ? `No Debate: ${winner} Bodies ${loser} ${score} to Settle the Score`
        : `${winner} Edges ${loser} in Heated Grudge Match (${score})`,
      `Bad Blood Boils Over: ${winner} Gets the Last Word on ${loser} (${score})`,
      `${winner} Backs It Up, Beats ${loser} ${score} in the Rematch Everyone Wanted`,
      `The Grudge Gets Deeper: ${winner} Over ${loser}, ${score}`,
      dominant
        ? `${winner} Leaves No Doubt Against ${loser} — ${score}`
        : `Down to the Wire: ${winner} Slips Past ${loser} ${score}`,
      `${loser} Answers the Call, But ${winner} Takes It ${score}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  const recapTemplates = [
    `${winner} Defeats ${loser} ${score}`,
    dominant
      ? `${winner} Runs Through ${loser} ${score}`
      : `${winner} Takes a Close One Over ${loser} ${score}`,
    `${winner} Handles Business Against ${loser} (${score})`,
    `Cards Read ${score}: ${winner} Over ${loser}`,
  ];
  return recapTemplates[Math.floor(Math.random() * recapTemplates.length)];
}

/**
 * Generate URL slug
 */
function generateSlug(battlerA: string, battlerB: string): string {
  const timestamp = Date.now();
  const slug = `${battlerA}-vs-${battlerB}-${timestamp}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug;
}

// =====================================================
// EXPORT MAIN FUNCTION
// =====================================================

/**
 * Main entry point: Generate rivalry-aware article for a battle
 */
export async function generateRivalryArticleForBattle(
  battleId: string,
  battlerAId: string,
  battlerBId: string,
  battlerAName: string,
  battlerBName: string,
  winnerId: string,
  score: string,
  battleSummary: {
    decision: string;
    isUpset: boolean;
    keyMoments: string[];
  }
): Promise<string> {
  // Get rivalry context
  const rivalryContext = await getRivalryContext(battlerAId, battlerBId);

  // Build article data
  const articleData: RivalryArticleData = {
    battleId,
    battlerAId,
    battlerBId,
    battlerAName,
    battlerBName,
    winnerId,
    score,
    rivalryContext,
    battleSummary,
  };

  // Generate and store article
  return await generateRivalryBattleRecap(articleData);
}
