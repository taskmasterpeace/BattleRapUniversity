import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db/server'
import { generateBattleOffersForPlayer } from '@/lib/game/league-booking'

export async function POST(request: NextRequest) {
  // Simple auth check for internal endpoints
  const authHeader = request.headers.get('Authorization')
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev && authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  try {
    // Get request body or use defaults
    let body: { battler_id?: string; count?: number } = {}
    try {
      body = await request.json()
    } catch {
      // No body provided, use defaults
    }

    const count = body.count || 3

    // If no battler_id provided, find the player's battler
    let battlerId = body.battler_id

    if (!battlerId) {
      // Find player battler (non-AI battler)
      const { data: playerBattler } = await supabase
        .from('battlers')
        .select('id')
        .eq('is_ai', false)
        .limit(1)
        .single()

      if (!playerBattler) {
        return NextResponse.json({
          success: false,
          error: 'No player battler found',
          hint: 'Create a battler first via onboarding',
        }, { status: 404 })
      }

      battlerId = playerBattler.id
    }

    // Generate offers
    const result = await generateBattleOffersForPlayer(battlerId, count, supabase)

    if (!result.success && result.offers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate any battle offers',
        debug: result.debug,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      offers_created: result.offers.length,
      offers: result.offers.map(o => ({
        battle_id: o.battle.id,
        league: o.league.name,
        opponent: o.opponent.stage_name,
        opponent_tier: o.opponent.tier,
        scheduled_at: o.battle.scheduled_at,
        player_payout: o.player_fee,
        matchup_score: o.matchup_score,
        is_sequel: o.is_sequel,
      })),
      debug: result.debug,
    })
  } catch (error) {
    console.error('Error generating battle offers:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// GET endpoint for easy testing
export async function GET(request: NextRequest) {
  return POST(request)
}
