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
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
      primary_battler:battlers!primary_battler_id(id, stage_name),
      secondary_battler:battlers!secondary_battler_id(id, stage_name),
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

  return NextResponse.json({ articles: articles || [] });
}
