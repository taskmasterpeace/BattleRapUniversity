import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = createServerClient()

    // Get article by slug
    const { data: article, error } = await supabase
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
          avatar_url,
          tier
        ),
        secondary_battler:secondary_battler_id(
          id,
          stage_name,
          avatar_url,
          tier
        ),
        league:league_id(
          id,
          name,
          short_code
        ),
        battle:battle_id(
          id,
          verdict,
          decision_type,
          winner_battler_id
        )
      `)
      .eq('slug', slug)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const meta = article.meta_json as Record<string, any> || {}
    const primaryBattler = article.primary_battler as any
    const secondaryBattler = article.secondary_battler as any
    const league = article.league as any
    const battle = article.battle as any

    const response = {
      id: article.id,
      slug: article.slug,
      title: article.title,
      type: article.type,
      body: article.body_markdown,
      publishedAt: article.published_at,
      date: new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      meta,
      primaryBattler: primaryBattler ? {
        id: primaryBattler.id,
        name: primaryBattler.stage_name,
        avatar: primaryBattler.avatar_url,
        tier: primaryBattler.tier,
      } : null,
      secondaryBattler: secondaryBattler ? {
        id: secondaryBattler.id,
        name: secondaryBattler.stage_name,
        avatar: secondaryBattler.avatar_url,
        tier: secondaryBattler.tier,
      } : null,
      league: league ? {
        id: league.id,
        name: league.name,
        shortCode: league.short_code,
      } : null,
      battle: battle ? {
        id: battle.id,
        verdict: battle.verdict,
        decisionType: battle.decision_type,
        winnerId: battle.winner_battler_id,
      } : null,
      readTime: Math.ceil((article.body_markdown || '').split(' ').length / 200),
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('News article route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
