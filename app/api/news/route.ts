import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import type { NewsArticle } from "@/lib/types"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get news articles
    const { data: articles, error } = await supabase
      .from('news_articles')
      .select(`
        id,
        slug,
        title,
        type,
        body_markdown,
        meta_json,
        published_at,
        primary_battler_id,
        secondary_battler_id,
        league_id,
        battle_id,
        primary_battler:primary_battler_id(
          id,
          stage_name,
          avatar_url
        ),
        secondary_battler:secondary_battler_id(
          id,
          stage_name,
          avatar_url
        ),
        league:league_id(
          id,
          name
        )
      `)
      .order('published_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching news:', error)
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
    }

    // Map to expected format
    const news: NewsArticle[] = (articles || []).map(article => {
      const meta = article.meta_json as Record<string, any> || {}
      const primaryBattler = article.primary_battler as any
      const secondaryBattler = article.secondary_battler as any
      const league = article.league as any

      // Extract excerpt from body (first 150 chars)
      const bodyText = article.body_markdown || ''
      const excerpt = bodyText.replace(/[#*_\[\]]/g, '').slice(0, 150) + '...'

      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt,
        type: article.type as NewsArticle['type'],
        category: meta.category || article.type,
        date: new Date(article.published_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        publishedAt: article.published_at,
        featured: meta.featured || false,
        readTime: Math.ceil(bodyText.split(' ').length / 200), // ~200 wpm reading speed
        battlers: [
          primaryBattler?.stage_name,
          secondaryBattler?.stage_name
        ].filter(Boolean),
        league: league?.name,
        tags: meta.tags || [],
      }
    })

    return NextResponse.json({ articles: news })
  } catch (err) {
    console.error('News route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
