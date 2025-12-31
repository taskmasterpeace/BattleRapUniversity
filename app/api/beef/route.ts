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
    const battlerA = searchParams.get('battler_a')
    const battlerB = searchParams.get('battler_b')

    if (!battlerA || !battlerB) {
      return NextResponse.json({ error: 'Both battler_a and battler_b are required' }, { status: 400 })
    }

    // Order IDs to match the constraint (battler_a_id < battler_b_id)
    const [orderedA, orderedB] = [battlerA, battlerB].sort()

    // Fetch relationship
    const { data: relationship, error: relError } = await supabase
      .from('battler_relationships')
      .select('*')
      .eq('battler_a_id', orderedA)
      .eq('battler_b_id', orderedB)
      .maybeSingle()

    if (relError) {
      console.error('Error fetching relationship:', relError)
      return NextResponse.json({ error: relError.message }, { status: 500 })
    }

    // If no relationship exists, return null
    if (!relationship) {
      return NextResponse.json({ beef: null })
    }

    // Fetch head-to-head record
    const { data: h2h, error: h2hError } = await supabase
      .from('head_to_head_records')
      .select('*')
      .eq('battler_a_id', orderedA)
      .eq('battler_b_id', orderedB)
      .maybeSingle()

    // Build response
    const beef = {
      intensity: relationship.intensity,
      rematchDemand: relationship.rematch_demand,
      status: relationship.status,
      originType: relationship.origin_type,
      originStory: relationship.origin_story,
      startedAt: relationship.started_at,
      headToHead: h2h ? {
        battles: h2h.total_battles || 0,
        playerWins: battlerA === orderedA ? (h2h.battler_a_wins || 0) : (h2h.battler_b_wins || 0),
        opponentWins: battlerA === orderedA ? (h2h.battler_b_wins || 0) : (h2h.battler_a_wins || 0),
        lastBattleDate: h2h.last_battle_at,
        lastBattleWinner: h2h.last_battle_winner_id,
      } : undefined,
    }

    return NextResponse.json({ beef })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create or update beef between battlers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { battlerAId, battlerBId, intensityDelta, originType, originStory, originBattleId } = body

    if (!battlerAId || !battlerBId) {
      return NextResponse.json({ error: 'Both battlerAId and battlerBId are required' }, { status: 400 })
    }

    // Order IDs to match the constraint
    const [orderedA, orderedB] = [battlerAId, battlerBId].sort()

    // Check if relationship exists
    const { data: existing } = await supabase
      .from('battler_relationships')
      .select('id, intensity, rematch_demand')
      .eq('battler_a_id', orderedA)
      .eq('battler_b_id', orderedB)
      .maybeSingle()

    if (existing) {
      // Update existing relationship
      const newIntensity = Math.min(100, Math.max(0, existing.intensity + (intensityDelta || 10)))
      const newRematchDemand = Math.min(100, existing.rematch_demand + 5)

      const { data, error } = await supabase
        .from('battler_relationships')
        .update({
          intensity: newIntensity,
          rematch_demand: newRematchDemand,
          status: newIntensity >= 30 ? 'active' : 'dormant',
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating relationship:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ beef: data, action: 'updated' })
    } else {
      // Create new relationship
      const { data, error } = await supabase
        .from('battler_relationships')
        .insert({
          battler_a_id: orderedA,
          battler_b_id: orderedB,
          intensity: intensityDelta || 20,
          rematch_demand: 10,
          status: 'active',
          origin_type: originType || 'battle',
          origin_story: originStory || 'A new rivalry is brewing',
          origin_battle_id: originBattleId || null,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating relationship:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ beef: data, action: 'created' })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
