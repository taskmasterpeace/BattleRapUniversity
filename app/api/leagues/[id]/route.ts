import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueIdOrSlug } = await params

    // Check if this is a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(leagueIdOrSlug)

    // Build query based on identifier type
    let query = supabase
      .from('leagues')
      .select(`
        id,
        name,
        short_code,
        display_name,
        slug,
        tagline,
        description,
        city,
        state,
        region,
        primary_color,
        secondary_color,
        logo_url,
        logo_id,
        is_active,
        league_tier,
        round_length_minutes,
        base_crowd_factor,
        writing_weight,
        performance_weight,
        crowd_reaction_weight,
        personality_style,
        prestige_level,
        base_payout,
        audience_favor_lyricism,
        audience_favor_delivery,
        audience_favor_storytelling,
        audience_favor_crowd_engagement,
        budget_per_card,
        cards_per_month,
        max_battles_per_card,
        youtube_subscribers,
        platform_subscribers,
        founded_year,
        created_at
      `)

    if (isUUID) {
      query = query.eq('id', leagueIdOrSlug)
    } else {
      query = query.or(`slug.eq.${leagueIdOrSlug},short_code.ilike.${leagueIdOrSlug}`)
    }

    const { data: league, error } = await query.single()

    if (error || !league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    // Get battler count (only active)
    const { count: battlerCount } = await supabase
      .from('battlers')
      .select('id', { count: 'exact', head: true })
      .eq('primary_league_id', league.id)
      .or('booking_status.eq.available,booking_status.is.null')

    // Get battle count
    const { count: battleCount } = await supabase
      .from('battles')
      .select('id', { count: 'exact', head: true })
      .eq('league_id', league.id)
      .eq('status', 'completed')

    // Get average rating of active battlers
    const { data: ratings } = await supabase
      .from('battlers')
      .select('rankings(rating)')
      .eq('primary_league_id', league.id)
      .or('booking_status.eq.available,booking_status.is.null')

    let avgRating = 1400
    if (ratings && ratings.length > 0) {
      const ratingValues = ratings
        .filter((b: any) => b.rankings?.rating)
        .map((b: any) => b.rankings.rating)
      if (ratingValues.length > 0) {
        avgRating = Math.round(ratingValues.reduce((a: number, b: number) => a + b, 0) / ratingValues.length)
      }
    }

    // Transform to match League interface
    const transformedLeague = {
      id: league.slug || league.short_code?.toLowerCase() || league.id,
      name: league.name?.replace(/\s+/g, '_').toLowerCase(),
      displayName: league.display_name || league.name,
      slug: league.slug || league.short_code?.toLowerCase(),
      tier: league.league_tier || 'regional',
      region: league.region || 'National',
      city: league.city,
      state: league.state,
      description: league.description || '',
      tagline: league.tagline || '',
      founded: league.founded_year?.toString() || '2020',
      avgRating,
      battlerCount: battlerCount || 0,
      totalBattles: battleCount || 0,
      homeVenueTypeId: null,
      logoUrl: league.logo_url,
      logoId: league.logo_id,
      primaryColor: league.primary_color || '#f97316',
      secondaryColor: league.secondary_color || '#1c1917',
      isActive: league.is_active ?? true,
      roundDurationSeconds: (league.round_length_minutes || 2) * 60,
      roundsPerBattle: 3,
      writingWeight: Math.round((league.writing_weight || 0.5) * 100),
      performanceWeight: Math.round((league.performance_weight || 0.3) * 100),
      crowdReactionWeight: Math.round((league.crowd_reaction_weight || 0.2) * 100),
      baseCrowdFactor: league.base_crowd_factor || 1.0,
      personalityStyle: league.personality_style || 'diverse',
      prestigeLevel: league.prestige_level || 5,
      audienceFavorsLyricism: Math.round((league.audience_favor_lyricism || 50) / 10),
      audienceFavorsDelivery: Math.round((league.audience_favor_delivery || 50) / 10),
      audienceFavorsStorytelling: Math.round((league.audience_favor_storytelling || 50) / 10),
      audienceFavorsCrowdEngagement: Math.round((league.audience_favor_crowd_engagement || 50) / 10),
      basePayout: league.base_payout || 500,
      // DB ID for API calls
      _dbId: league.id
    }

    return NextResponse.json({ league: transformedLeague })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
