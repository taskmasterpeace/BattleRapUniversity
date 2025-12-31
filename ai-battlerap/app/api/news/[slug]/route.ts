import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/news/[slug]
 *
 * Get a single news article by slug
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: article, error } = await supabase
    .from('news_articles')
    .select(`
      id,
      slug,
      title,
      type,
      body_markdown,
      published_at,
      meta_json,
      primary_battler:battlers!primary_battler_id(id, stage_name, tier),
      secondary_battler:battlers!secondary_battler_id(id, stage_name, tier),
      league:leagues(id, name),
      battle:battles(id, scheduled_at, winner_battler_id)
    `)
    .eq('slug', slug)
    .single();

  if (error || !article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  return NextResponse.json({ article });
}
