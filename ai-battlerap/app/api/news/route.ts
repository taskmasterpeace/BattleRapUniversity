import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/news
 *
 * List news articles with optional filters
 *
 * Query params:
 * - league_id: filter by league
 * - battler_id: filter by battler (primary or secondary)
 * - type: filter by article type
 * - limit: max results (default 20, max 50)
 */
export async function GET(request: Request) {
  // Public: articles are the world's press — readable by anyone (the
  // follow-from-outside surface, like the leaderboard and watch pages).
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('league_id');
  const battlerId = searchParams.get('battler_id');
  const type = searchParams.get('type');
  const limitParam = searchParams.get('limit');

  const limit = Math.min(
    50,
    limitParam ? parseInt(limitParam, 10) : 20
  );

  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('news_articles')
    .select(`
      id,
      slug,
      title,
      type,
      published_at,
      primary_battler:battlers!primary_battler_id(id, stage_name, avatar_url),
      secondary_battler:battlers!secondary_battler_id(id, stage_name, avatar_url),
      league:leagues(id, name)
    `)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (leagueId) {
    query = query.eq('league_id', leagueId);
  }

  if (type) {
    query = query.eq('type', type);
  }

  if (battlerId) {
    query = query.or(`primary_battler_id.eq.${battlerId},secondary_battler_id.eq.${battlerId}`);
  }

  const { data: articles, error } = await query;

  if (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }

  // Hide articles about internal Test_ validation battlers and test recaps.
  const visibleArticles = (articles || []).filter((a) => {
    const primary = (a.primary_battler as { stage_name?: string } | null)?.stage_name ?? '';
    const secondary = (a.secondary_battler as { stage_name?: string } | null)?.stage_name ?? '';
    if (primary.startsWith('Test_') || secondary.startsWith('Test_')) return false;
    if (/^test\b/i.test(a.title ?? '')) return false;
    return true;
  });

  return NextResponse.json({ articles: visibleArticles });
}
