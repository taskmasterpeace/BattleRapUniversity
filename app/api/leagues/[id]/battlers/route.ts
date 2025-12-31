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
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // First, try to find the league by ID, slug, or short_code
    let leagueId = leagueIdOrSlug

    // Check if this is a UUID (contains hyphens in UUID format)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(leagueIdOrSlug)

    if (!isUUID) {
      // Try to find league by slug or short_code
      const { data: league } = await supabase
        .from('leagues')
        .select('id')
        .or(`slug.eq.${leagueIdOrSlug},short_code.ilike.${leagueIdOrSlug}`)
        .limit(1)
        .single()

      if (league) {
        leagueId = league.id
      } else {
        // No matching league found, return empty
        return NextResponse.json({ battlers: [] })
      }
    }

    // Build query for battlers
    let query = supabase
      .from('battlers')
      .select(`
        id,
        stage_name,
        tier,
        is_ai,
        booking_status,
        hometown_city,
        hometown_state,
        avatar_url,
        rankings(rating, wins, losses)
      `)
      .eq('primary_league_id', leagueId)

    // Filter by booking status unless includeInactive is true
    if (!includeInactive) {
      query = query.or('booking_status.eq.available,booking_status.is.null')
    }

    const { data: battlers, error } = await query.order('tier', { ascending: false })

    if (error) {
      console.error('Error fetching league battlers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to match expected format
    const transformedBattlers = (battlers || []).map((b: any) => ({
      id: b.id,
      name: b.stage_name,
      tier: b.tier || 'none',
      isAi: b.is_ai,
      rating: b.rankings?.rating || 1000,
      wins: b.rankings?.wins || 0,
      losses: b.rankings?.losses || 0,
      avatarUrl: b.avatar_url,
      hometownCity: b.hometown_city,
      hometownState: b.hometown_state,
      bookingStatus: b.booking_status || 'available'
    }))

    // Sort by rating (highest first)
    transformedBattlers.sort((a, b) => b.rating - a.rating)

    return NextResponse.json({ battlers: transformedBattlers })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
