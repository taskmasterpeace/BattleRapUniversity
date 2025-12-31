import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

// POST /api/crews/[id]/leave - Leave a crew
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const crewId = params.id

    // Get dev player's battler
    const { data: playerBattler } = await supabase
      .from('battlers')
      .select('id, crew_id')
      .eq('is_ai', false)
      .limit(1)
      .single()

    if (!playerBattler) {
      return NextResponse.json({ error: 'No battler found' }, { status: 404 })
    }

    // Check if in this crew
    if (playerBattler.crew_id !== crewId) {
      return NextResponse.json({ error: 'Not in this crew' }, { status: 400 })
    }

    // Check if leader
    const { data: crew } = await supabase
      .from('crews')
      .select('leader_battler_id')
      .eq('id', crewId)
      .single()

    if (!crew) {
      return NextResponse.json({ error: 'Crew not found' }, { status: 404 })
    }

    if (crew.leader_battler_id === playerBattler.id) {
      return NextResponse.json({
        error: 'Leaders cannot leave. Transfer leadership or disband the crew instead.'
      }, { status: 400 })
    }

    // Mark membership as inactive
    const now = new Date().toISOString()
    await supabase
      .from('crew_members')
      .update({ is_active: false, left_at: now })
      .eq('crew_id', crewId)
      .eq('battler_id', playerBattler.id)

    // Update membership history
    await supabase
      .from('crew_membership_history')
      .update({ left_at: now, reason: 'Member left voluntarily' })
      .eq('crew_id', crewId)
      .eq('battler_id', playerBattler.id)
      .is('left_at', null)

    // Clear crew_id from battler
    await supabase
      .from('battlers')
      .update({ crew_id: null })
      .eq('id', playerBattler.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Leave crew API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
