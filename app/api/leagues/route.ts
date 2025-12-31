import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') !== 'false' // Default to active only
    const tier = searchParams.get('tier')

    // Get all leagues with real battler counts
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
      .order('prestige_level', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (tier) {
      query = query.eq('league_tier', tier)
    }

    const { data: leagues, error } = await query

    if (error) {
      console.error('Error fetching leagues:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get battler counts for each league (only active battlers)
    const leagueIds = leagues?.map(l => l.id) || []

    const { data: battlerCounts, error: countError } = await supabase
      .from('battlers')
      .select('primary_league_id')
      .in('primary_league_id', leagueIds)
      .or('booking_status.eq.available,booking_status.is.null')

    if (countError) {
      console.error('Error fetching battler counts:', countError)
    }

    // Count battlers per league
    const countsByLeague: Record<string, number> = {}
    battlerCounts?.forEach(b => {
      if (b.primary_league_id) {
        countsByLeague[b.primary_league_id] = (countsByLeague[b.primary_league_id] || 0) + 1
      }
    })

    // Get battle counts
    const { data: battleCounts, error: battleError } = await supabase
      .from('battles')
      .select('league_id')
      .in('league_id', leagueIds)
      .eq('status', 'completed')

    if (battleError) {
      console.error('Error fetching battle counts:', battleError)
    }

    const battlesByLeague: Record<string, number> = {}
    battleCounts?.forEach(b => {
      if (b.league_id) {
        battlesByLeague[b.league_id] = (battlesByLeague[b.league_id] || 0) + 1
      }
    })

    // Transform data to match the League interface from lib/leagues.ts
    const transformedLeagues = (leagues || []).map((l: any) => ({
      id: l.slug || l.short_code?.toLowerCase() || l.id,
      name: l.name?.replace(/\s+/g, '_').toLowerCase(),
      displayName: l.display_name || l.name,
      slug: l.slug || l.short_code?.toLowerCase(),
      tier: l.league_tier || 'regional',
      region: l.region || 'National',
      city: l.city,
      state: l.state,
      description: l.description || '',
      tagline: l.tagline || '',
      founded: l.founded_year?.toString() || '2020',
      avgRating: 1400, // TODO: Calculate from battlers
      battlerCount: countsByLeague[l.id] || 0,
      totalBattles: battlesByLeague[l.id] || 0,
      homeVenueTypeId: null,
      logoUrl: l.logo_url,
      logoId: l.logo_id,
      primaryColor: l.primary_color || '#f97316',
      secondaryColor: l.secondary_color || '#1c1917',
      isActive: l.is_active ?? true,
      roundDurationSeconds: (l.round_length_minutes || 2) * 60,
      roundsPerBattle: 3,
      writingWeight: Math.round((l.writing_weight || 0.5) * 100),
      performanceWeight: Math.round((l.performance_weight || 0.3) * 100),
      crowdReactionWeight: Math.round((l.crowd_reaction_weight || 0.2) * 100),
      baseCrowdFactor: l.base_crowd_factor || 1.0,
      personalityStyle: l.personality_style || 'diverse',
      prestigeLevel: l.prestige_level || 5,
      audienceFavorsLyricism: Math.round((l.audience_favor_lyricism || 50) / 10),
      audienceFavorsDelivery: Math.round((l.audience_favor_delivery || 50) / 10),
      audienceFavorsStorytelling: Math.round((l.audience_favor_storytelling || 50) / 10),
      audienceFavorsCrowdEngagement: Math.round((l.audience_favor_crowd_engagement || 50) / 10),
      basePayout: l.base_payout || 500,
      // DB ID for API calls
      _dbId: l.id
    }))

    return NextResponse.json({ leagues: transformedLeagues })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
