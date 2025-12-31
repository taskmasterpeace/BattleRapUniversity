/**
 * Blogger Memory System
 *
 * Purpose: Track coverage history for each of the 8 blogger personas
 * Ensures narrative continuity - bloggers reference their past articles
 *
 * Integration:
 * - newsGenerator.ts (provides context for article generation)
 * - grudgeEngine.ts (track grudge coverage)
 * - rivalryNarrativeGenerator.ts (rivalry-specific narratives)
 *
 * The 8 Blogger Personas:
 * 1. Battle Eyez - Technical analysis, play-by-play expert
 * 2. Marijuana Piranha - Underground focus, raw energy
 * 3. Algorithm Institute - Data-driven, analytical
 * 4. Small Room Report - Small venue specialist
 * 5. The Main Stage Herald - Big stage coverage
 * 6. Underground Voice - Culture and community
 * 7. Coast to Coast Coverage - Regional news
 * 8. The Battle Breakdown - Strategic analysis
 */

import { createServerSupabaseClient } from '@/lib/db/server';

// =====================================================
// TYPES
// =====================================================

export type BloggerName =
  | 'Battle Eyez'
  | 'Marijuana Piranha'
  | 'Algorithm Institute'
  | 'Small Room Report'
  | 'The Main Stage Herald'
  | 'Underground Voice'
  | 'Coast to Coast Coverage'
  | 'The Battle Breakdown';

export type EntityType = 'battler' | 'battle' | 'grudge' | 'league' | 'event';

export interface BloggerMemoryRecord {
  id: string;
  bloggerName: BloggerName;
  entityType: EntityType;
  entityId: string;
  totalArticles: number;
  firstCoveredAt: string;
  lastCoveredAt: string;
  articleIds: string[];
  sentimentPositive: number;
  sentimentNeutral: number;
  sentimentNegative: number;
  recentNarrative: string | null;
  metaJson: any;
}

export interface CoverageContext {
  hasCoveredBefore: boolean;
  totalArticles: number;
  lastCoveredAt: string | null;
  recentNarrative: string | null;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  previousArticles: Array<{
    id: string;
    title: string;
    publishedAt: string;
  }>;
}

export interface BloggerSentiment {
  positive: number; // 0-100
  neutral: number; // 0-100
  negative: number; // 0-100
}

// =====================================================
// CORE FUNCTIONS
// =====================================================

/**
 * Get blogger's coverage history for a specific entity
 * Used to provide context when generating new articles
 */
export async function getBloggerCoverageContext(
  bloggerName: BloggerName,
  entityType: EntityType,
  entityId: string
): Promise<CoverageContext> {
  const supabase = await createServerSupabaseClient();

  // Get memory record
  const { data: memory } = await supabase
    .from('blogger_memory')
    .select('*')
    .eq('blogger_name', bloggerName)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .single();

  if (!memory) {
    return {
      hasCoveredBefore: false,
      totalArticles: 0,
      lastCoveredAt: null,
      recentNarrative: null,
      sentiment: { positive: 50, neutral: 50, negative: 0 },
      previousArticles: [],
    };
  }

  // Fetch previous article details
  const { data: articles } = await supabase
    .from('news_articles')
    .select('id, title, published_at')
    .in('id', memory.article_ids || [])
    .order('published_at', { ascending: false })
    .limit(5);

  return {
    hasCoveredBefore: true,
    totalArticles: memory.total_articles,
    lastCoveredAt: memory.last_covered_at,
    recentNarrative: memory.recent_narrative,
    sentiment: {
      positive: memory.sentiment_positive,
      neutral: memory.sentiment_neutral,
      negative: memory.sentiment_negative,
    },
    previousArticles: articles?.map(a => ({
      id: a.id,
      title: a.title,
      publishedAt: a.published_at,
    })) || [],
  };
}

/**
 * Record that a blogger has covered an entity
 * Updates or creates memory record
 */
export async function recordBloggerCoverage(
  bloggerName: BloggerName,
  entityType: EntityType,
  entityId: string,
  articleId: string,
  sentiment: BloggerSentiment,
  narrativeSummary: string,
  supabaseClient?: any
): Promise<void> {
  // Use provided client for scripts, or create server client for API routes
  const supabase = supabaseClient || await createServerSupabaseClient();

  // Check if memory exists
  const { data: existing } = await supabase
    .from('blogger_memory')
    .select('*')
    .eq('blogger_name', bloggerName)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .single();

  if (existing) {
    // Update existing memory
    await supabase
      .from('blogger_memory')
      .update({
        total_articles: existing.total_articles + 1,
        last_covered_at: new Date().toISOString(),
        article_ids: [...(existing.article_ids || []), articleId],
        sentiment_positive: Math.round((existing.sentiment_positive + sentiment.positive) / 2),
        sentiment_neutral: Math.round((existing.sentiment_neutral + sentiment.neutral) / 2),
        sentiment_negative: Math.round((existing.sentiment_negative + sentiment.negative) / 2),
        recent_narrative: narrativeSummary,
      })
      .eq('id', existing.id);
  } else {
    // Create new memory
    await supabase.from('blogger_memory').insert({
      blogger_name: bloggerName,
      entity_type: entityType,
      entity_id: entityId,
      total_articles: 1,
      first_covered_at: new Date().toISOString(),
      last_covered_at: new Date().toISOString(),
      article_ids: [articleId],
      sentiment_positive: sentiment.positive,
      sentiment_neutral: sentiment.neutral,
      sentiment_negative: sentiment.negative,
      recent_narrative: narrativeSummary,
    });
  }
}

/**
 * Get all entities a blogger has covered (for "beat" assignment)
 * Helps determine which blogger should cover which stories
 */
export async function getBloggerBeat(
  bloggerName: BloggerName
): Promise<{
  battlers: string[];
  battles: string[];
  grudges: string[];
  mostCovered: Array<{
    entityType: EntityType;
    entityId: string;
    articleCount: number;
  }>;
}> {
  const supabase = await createServerSupabaseClient();

  const { data: memories } = await supabase
    .from('blogger_memory')
    .select('*')
    .eq('blogger_name', bloggerName)
    .order('total_articles', { ascending: false });

  if (!memories) {
    return {
      battlers: [],
      battles: [],
      grudges: [],
      mostCovered: [],
    };
  }

  return {
    battlers: memories.filter(m => m.entity_type === 'battler').map(m => m.entity_id),
    battles: memories.filter(m => m.entity_type === 'battle').map(m => m.entity_id),
    grudges: memories.filter(m => m.entity_type === 'grudge').map(m => m.entity_id),
    mostCovered: memories.map(m => ({
      entityType: m.entity_type as EntityType,
      entityId: m.entity_id,
      articleCount: m.total_articles,
    })),
  };
}

/**
 * Get blogger sentiment about a battler
 * Useful for selecting which blogger to assign to a story
 */
export async function getBloggerSentiment(
  bloggerName: BloggerName,
  battlerId: string
): Promise<BloggerSentiment> {
  const supabase = await createServerSupabaseClient();

  const { data: memory } = await supabase
    .from('blogger_memory')
    .select('sentiment_positive, sentiment_neutral, sentiment_negative')
    .eq('blogger_name', bloggerName)
    .eq('entity_type', 'battler')
    .eq('entity_id', battlerId)
    .single();

  if (!memory) {
    return { positive: 50, neutral: 50, negative: 0 }; // Neutral default
  }

  return {
    positive: memory.sentiment_positive,
    neutral: memory.sentiment_neutral,
    negative: memory.sentiment_negative,
  };
}

/**
 * Select best blogger for a story based on coverage history and entity type
 */
export async function selectBloggerForStory(
  storyType: 'battle_recap' | 'grudge_coverage' | 'career_update' | 'scandal' | 'league_update',
  primaryBattlerId: string,
  secondaryBattlerId?: string,
  grudgeId?: string,
  supabaseClient?: any
): Promise<BloggerName> {
  // Use provided client for scripts, or create server client for API routes
  const supabase = supabaseClient || await createServerSupabaseClient();

  // Blogger specializations (hard-coded preferences)
  const specializationWeights: Record<string, Partial<Record<BloggerName, number>>> = {
    battle_recap: {
      'Battle Eyez': 2.0, // Best for technical battle analysis
      'The Battle Breakdown': 1.8,
      'Algorithm Institute': 1.5,
    },
    grudge_coverage: {
      'Underground Voice': 2.0, // Best for drama/culture
      'Marijuana Piranha': 1.8,
      'Battle Eyez': 1.3,
    },
    career_update: {
      'Algorithm Institute': 2.0, // Best for career stats
      'Coast to Coast Coverage': 1.5,
      'The Main Stage Herald': 1.3,
    },
    scandal: {
      'Marijuana Piranha': 2.0, // Best for controversy
      'Underground Voice': 1.8,
      'Battle Eyez': 1.2,
    },
    league_update: {
      'Small Room Report': 2.0,
      'The Main Stage Herald': 2.0,
      'Coast to Coast Coverage': 1.5,
    },
  };

  // Get coverage history for all bloggers
  const bloggers: BloggerName[] = [
    'Battle Eyez',
    'Marijuana Piranha',
    'Algorithm Institute',
    'Small Room Report',
    'The Main Stage Herald',
    'Underground Voice',
    'Coast to Coast Coverage',
    'The Battle Breakdown',
  ];

  const scores: Record<BloggerName, number> = {} as any;

  for (const blogger of bloggers) {
    let score = specializationWeights[storyType][blogger] || 1.0;

    // Check if blogger has covered primary battler before
    const { data: primaryMemory } = await supabase
      .from('blogger_memory')
      .select('total_articles')
      .eq('blogger_name', blogger)
      .eq('entity_type', 'battler')
      .eq('entity_id', primaryBattlerId)
      .single();

    if (primaryMemory) {
      // Prefer bloggers who have history with the battler (continuity)
      score += 0.5 + (primaryMemory.total_articles * 0.1);
    }

    // Check secondary battler
    if (secondaryBattlerId) {
      const { data: secondaryMemory } = await supabase
        .from('blogger_memory')
        .select('total_articles')
        .eq('blogger_name', blogger)
        .eq('entity_type', 'battler')
        .eq('entity_id', secondaryBattlerId)
        .single();

      if (secondaryMemory) {
        score += 0.3 + (secondaryMemory.total_articles * 0.05);
      }
    }

    // Check grudge coverage
    if (grudgeId) {
      const { data: grudgeMemory } = await supabase
        .from('blogger_memory')
        .select('total_articles')
        .eq('blogger_name', blogger)
        .eq('entity_type', 'grudge')
        .eq('entity_id', grudgeId)
        .single();

      if (grudgeMemory) {
        // Strongly prefer blogger who has been following this grudge
        score += 1.0 + (grudgeMemory.total_articles * 0.2);
      }
    }

    scores[blogger] = score;
  }

  // Select blogger with highest score
  const selectedBlogger = Object.entries(scores).reduce((best, [blogger, score]) => {
    return score > best.score ? { blogger: blogger as BloggerName, score } : best;
  }, { blogger: 'Battle Eyez' as BloggerName, score: 0 }).blogger;

  return selectedBlogger;
}

/**
 * Generate LLM context string from blogger's memory
 * This is passed to the news generator to ensure narrative continuity
 */
export async function generateBloggerContext(
  bloggerName: BloggerName,
  battlerIds: string[],
  grudgeId?: string
): Promise<string> {
  const supabase = await createServerSupabaseClient();

  const contexts: string[] = [];

  // Get battler coverage context
  for (const battlerId of battlerIds) {
    const { data: memory } = await supabase
      .from('blogger_memory')
      .select('*, battlers!inner(stage_name)')
      .eq('blogger_name', bloggerName)
      .eq('entity_type', 'battler')
      .eq('entity_id', battlerId)
      .single();

    if (memory) {
      const battlerName = (memory as any).battlers?.stage_name || 'Unknown';
      contexts.push(
        `You've covered ${battlerName} ${memory.total_articles} time(s) before. ` +
        `Your recent narrative: "${memory.recent_narrative || 'N/A'}". ` +
        `Your sentiment: ${memory.sentiment_positive}% positive, ${memory.sentiment_negative}% negative.`
      );
    }
  }

  // Get grudge coverage context
  if (grudgeId) {
    const { data: grudgeMemory } = await supabase
      .from('blogger_memory')
      .select('*')
      .eq('blogger_name', bloggerName)
      .eq('entity_type', 'grudge')
      .eq('entity_id', grudgeId)
      .single();

    if (grudgeMemory) {
      contexts.push(
        `You've been following this rivalry for ${grudgeMemory.total_articles} article(s). ` +
        `Your recent take: "${grudgeMemory.recent_narrative || 'N/A'}".`
      );
    }
  }

  if (contexts.length === 0) {
    return `This is your first time covering these battlers. Approach with fresh perspective.`;
  }

  return contexts.join(' ');
}

/**
 * Analyze article sentiment (simple heuristic-based)
 * In production, could use sentiment analysis API
 */
export function analyzeSentiment(articleText: string): BloggerSentiment {
  const positiveWords = [
    'impressive', 'dominant', 'excellent', 'strong', 'skilled', 'talented',
    'victory', 'won', 'defeated', 'outperformed', 'masterful', 'brilliant',
  ];

  const negativeWords = [
    'weak', 'struggled', 'failed', 'disappointing', 'poor', 'lackluster',
    'lost', 'defeated', 'embarrassing', 'choked', 'stumbled', 'underwhelming',
  ];

  const lowerText = articleText.toLowerCase();

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of positiveWords) {
    if (lowerText.includes(word)) positiveCount++;
  }

  for (const word of negativeWords) {
    if (lowerText.includes(word)) negativeCount++;
  }

  const total = positiveCount + negativeCount;

  if (total === 0) {
    return { positive: 50, neutral: 50, negative: 0 };
  }

  const positive = Math.round((positiveCount / total) * 100);
  const negative = Math.round((negativeCount / total) * 100);
  const neutral = 100 - positive - negative;

  return {
    positive: Math.max(0, Math.min(100, positive)),
    neutral: Math.max(0, Math.min(100, neutral)),
    negative: Math.max(0, Math.min(100, negative)),
  };
}

/**
 * Extract narrative summary from article (first 200 chars)
 */
export function extractNarrativeSummary(articleText: string): string {
  // Remove markdown headers
  const cleanText = articleText.replace(/^#+\s*/gm, '').trim();

  // Get first paragraph or 200 chars
  const firstParagraph = cleanText.split('\n\n')[0] || cleanText;
  const summary = firstParagraph.substring(0, 200).trim();

  return summary + (firstParagraph.length > 200 ? '...' : '');
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get all bloggers who have covered a specific battler
 */
export async function getBloggersForBattler(
  battlerId: string
): Promise<Array<{ blogger: BloggerName; articleCount: number }>> {
  const supabase = await createServerSupabaseClient();

  const { data: memories } = await supabase
    .from('blogger_memory')
    .select('blogger_name, total_articles')
    .eq('entity_type', 'battler')
    .eq('entity_id', battlerId)
    .order('total_articles', { ascending: false });

  return memories?.map(m => ({
    blogger: m.blogger_name as BloggerName,
    articleCount: m.total_articles,
  })) || [];
}

/**
 * Get blogger's most recent articles
 */
export async function getBloggerRecentArticles(
  bloggerName: BloggerName,
  limit: number = 10
): Promise<Array<{
  id: string;
  title: string;
  type: string;
  publishedAt: string;
}>> {
  const supabase = await createServerSupabaseClient();

  // Get all article IDs for this blogger
  const { data: memories } = await supabase
    .from('blogger_memory')
    .select('article_ids')
    .eq('blogger_name', bloggerName);

  if (!memories || memories.length === 0) {
    return [];
  }

  // Flatten article IDs
  const articleIds = memories.flatMap(m => m.article_ids || []);

  // Fetch article details
  const { data: articles } = await supabase
    .from('news_articles')
    .select('id, title, type, published_at')
    .in('id', articleIds)
    .order('published_at', { ascending: false })
    .limit(limit);

  return articles?.map(a => ({
    id: a.id,
    title: a.title,
    type: a.type,
    publishedAt: a.published_at,
  })) || [];
}
