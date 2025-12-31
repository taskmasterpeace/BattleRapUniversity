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

import { createServerSupabaseClient } from '@/lib/db/server';
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
  const supabase = await createServerSupabaseClient();

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

  // TODO: Call LLM with prompt (integrate with existing llmIntegration.ts)
  // For now, return placeholder
  const articleBody = await generateArticleWithLLM(blogger, prompt);

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
  prompt: string
): Promise<string> {
  // TODO: Call actual LLM service (OpenAI, Anthropic, etc.)
  // For now, return placeholder markdown

  return `# Grudge Match Delivers Drama

The tension was palpable as these two battlers stepped into the ring with unfinished business on their minds. The crowd knew what was at stake - this wasn't just another battle, this was personal.

## The Setup

Coming into this matchup, both battlers had something to prove. The history between them added an extra layer of intensity that you could feel from the moment they locked eyes.

## The Battle

The performance was electric. Each round saw both competitors bringing their A-game, knowing that every bar, every delivery, every crowd reaction would be dissected by fans for weeks to come.

## The Aftermath

With this result, the rivalry takes another turn. The losing side will surely be looking for another opportunity to settle the score, while the winner has momentum on their side going forward.

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
  const supabase = await createServerSupabaseClient();

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

  if (isGrudgeMatch) {
    const templates = [
      `${winner} Edges ${loser} in Heated Grudge Match (${score})`,
      `Rivalry Intensifies: ${winner} Defeats ${loser} ${score}`,
      `${winner} vs ${loser}: Grudge Battle Delivers Drama`,
      `Beef Escalates as ${winner} Takes ${score} Victory Over ${loser}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  return `${winner} Defeats ${loser} ${score}`;
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
