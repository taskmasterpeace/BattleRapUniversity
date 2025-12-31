import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get all battlers (both player and AI)
    const { data, error } = await supabase
      .from('battlers')
      .select(`
        id,
        stage_name,
        tier,
        primary_league_id,
        is_ai,
        rankings(rating)
      `)
      .limit(limit)
      .order('stage_name')

    if (error) {
      console.error('Error fetching battlers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data
    const battlers = (data || []).map((b: any) => ({
      id: b.id,
      stageName: b.stage_name,
      tier: b.tier,
      primaryLeagueId: b.primary_league_id,
      isAi: b.is_ai,
      rating: b.rankings?.rating || 1000,
    }))

    return NextResponse.json({ battlers })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
