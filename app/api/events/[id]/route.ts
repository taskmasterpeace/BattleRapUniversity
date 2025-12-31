import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db/server'

// GET /api/events/[id] - Get event details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      league:leagues(
        id, name, short_code, league_tier, budget_per_card,
        max_battles_per_card, style_weights, regional_preference
      ),
      event_battles(
        id, card_position, position_order, allocated_budget, booking_status,
        booked_at, confirmed_at,
        battler_a:battlers!event_battles_battler_a_id_fkey(
          id, stage_name, tier, region, style_tags, base_booking_fee, popularity_score,
          rankings(rating, wins, losses, streak)
        ),
        battler_b:battlers!event_battles_battler_b_id_fkey(
          id, stage_name, tier, region, style_tags, base_booking_fee, popularity_score,
          rankings(rating, wins, losses, streak)
        ),
        battle:battles(
          id, status, scheduled_at, winner_battler_id,
          player_payout, opponent_payout
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  // Sort event_battles by position_order
  if (event.event_battles) {
    event.event_battles.sort((a: any, b: any) => a.position_order - b.position_order)
  }

  // Calculate budget spent
  const budgetSpent = event.event_battles?.reduce((sum: number, eb: any) => {
    if (eb.battle) {
      return sum + (eb.battle.player_payout || 0) + (eb.battle.opponent_payout || 0)
    }
    return sum
  }, 0) || 0

  return NextResponse.json({
    event: {
      ...event,
      budget_spent: budgetSpent,
      budget_remaining: event.total_budget - budgetSpent,
    },
  })
}

// PATCH /api/events/[id] - Update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const allowedFields = [
      'name', 'scheduled_date', 'venue_name', 'city', 'state',
      'status', 'flyer_url', 'stream_url', 'vod_url',
      'total_views', 'peak_concurrent_viewers',
    ]

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    // If status is changing to 'announced', set announced_at
    if (body.status === 'announced') {
      updates.announced_at = new Date().toISOString()
    }

    const { data: event, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, event })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// DELETE /api/events/[id] - Delete event (only if planning)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerClient()

  // Check event status
  const { data: event } = await supabase
    .from('events')
    .select('status')
    .eq('id', id)
    .single()

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  if (event.status !== 'planning' && event.status !== 'cancelled') {
    return NextResponse.json({
      error: 'Can only delete events in planning or cancelled status',
    }, { status: 400 })
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
