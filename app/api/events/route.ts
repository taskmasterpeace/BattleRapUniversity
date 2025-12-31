import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db/server'
import { buildEventCard, getCardPositions } from '@/lib/game/league-booking'

// GET /api/events - List events
export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)

  const leagueId = searchParams.get('league_id')
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '20')

  let query = supabase
    .from('events')
    .select(`
      *,
      league:leagues(id, name, short_code, league_tier),
      event_battles(
        id, card_position, position_order, allocated_budget, booking_status,
        battler_a:battlers!event_battles_battler_a_id_fkey(id, stage_name, tier),
        battler_b:battlers!event_battles_battler_b_id_fkey(id, stage_name, tier),
        battle:battles(id, status, winner_battler_id)
      )
    `)
    .order('scheduled_date', { ascending: true })
    .limit(limit)

  if (leagueId) {
    query = query.eq('league_id', leagueId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data: events, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events })
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const {
      league_id,
      name,
      scheduled_date,
      venue_name,
      city,
      state,
      auto_build_card = false,
      player_battler_id = null,
    } = body

    if (!league_id || !scheduled_date) {
      return NextResponse.json({
        error: 'Missing required fields: league_id, scheduled_date',
      }, { status: 400 })
    }

    // Get league info
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', league_id)
      .single()

    if (leagueError || !league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    // Generate event name if not provided
    const eventName = name || `${league.name} - ${new Date(scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

    // Generate slug
    const slug = eventName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36)

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        league_id,
        name: eventName,
        slug,
        scheduled_date,
        venue_name,
        city,
        state,
        total_budget: league.budget_per_card,
        status: 'planning',
      })
      .select()
      .single()

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 })
    }

    // Create card positions (battle slots)
    const positions = getCardPositions(league.max_battles_per_card, league.budget_per_card)

    const eventBattles = positions.map(pos => ({
      event_id: event.id,
      card_position: pos.position,
      position_order: pos.order,
      allocated_budget: pos.allocated_budget,
      booking_status: 'open',
    }))

    const { error: battlesError } = await supabase
      .from('event_battles')
      .insert(eventBattles)

    if (battlesError) {
      console.error('Error creating event battles:', battlesError)
    }

    // Auto-build card if requested
    let cardBuildResult = null
    if (auto_build_card) {
      const battleDate = new Date(scheduled_date)
      const card = await buildEventCard(league, battleDate, player_battler_id, supabase)

      // Update event battles with matchups
      for (let i = 0; i < card.matchups.length; i++) {
        const matchup = card.matchups[i]
        if (!matchup) continue

        const position = positions[i]

        // Create the actual battle record
        const lockPrepDate = new Date(battleDate)
        lockPrepDate.setDate(lockPrepDate.getDate() - 1)

        const { data: battle } = await supabase
          .from('battles')
          .insert({
            league_id,
            event_id: event.id,
            battler_player_id: matchup.battler_a.is_ai ? matchup.battler_b.id : matchup.battler_a.id,
            battler_ai_id: matchup.battler_a.is_ai ? matchup.battler_a.id : matchup.battler_b.id,
            scheduled_at: battleDate.toISOString(),
            lock_prep_at: lockPrepDate.toISOString(),
            status: 'offered',
            card_position: position.position,
            player_payout: matchup.score_breakdown.battler_a_score.booking_fee,
            opponent_payout: matchup.score_breakdown.battler_b_score.booking_fee,
          })
          .select()
          .single()

        if (battle) {
          // Update event_battle with the matchup
          await supabase
            .from('event_battles')
            .update({
              battle_id: battle.id,
              battler_a_id: matchup.battler_a.id,
              battler_b_id: matchup.battler_b.id,
              booking_status: 'booked',
              booked_at: new Date().toISOString(),
            })
            .eq('event_id', event.id)
            .eq('position_order', position.order)
        }
      }

      cardBuildResult = {
        matchups_created: card.matchups.filter(m => m !== null).length,
        debug: card.debug_info,
      }
    }

    return NextResponse.json({
      success: true,
      event,
      card_build: cardBuildResult,
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
