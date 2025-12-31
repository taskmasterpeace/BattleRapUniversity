import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

// POST /api/crews/[id]/join - Join a crew
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
      .select('id, crew_id, user_id, stage_name')
      .eq('is_ai', false)
      .limit(1)
      .single()

    if (!playerBattler) {
      return NextResponse.json({ error: 'No battler found' }, { status: 404 })
    }

    // Check if already in a crew
    if (playerBattler.crew_id) {
      return NextResponse.json({ error: 'Already in a crew' }, { status: 400 })
    }

    // Check if crew exists and has space
    const { data: crew, error: crewError } = await supabase
      .from('crews')
      .select('id, name, active')
      .eq('id', crewId)
      .single()

    if (crewError || !crew) {
      return NextResponse.json({ error: 'Crew not found' }, { status: 404 })
    }

    if (!crew.active) {
      return NextResponse.json({ error: 'Crew is inactive' }, { status: 400 })
    }

    // Count current members
    const { data: members, error: countError } = await supabase
      .from('crew_members')
      .select('id')
      .eq('crew_id', crewId)
      .eq('is_active', true)

    if (countError) {
      console.error('Error counting members:', countError)
      return NextResponse.json({ error: 'Failed to check crew capacity' }, { status: 500 })
    }

    if (members && members.length >= 5) {
      return NextResponse.json({ error: 'Crew is full (max 5 members)' }, { status: 400 })
    }

    // Add member
    const { error: memberError } = await supabase
      .from('crew_members')
      .insert({
        crew_id: crewId,
        user_id: playerBattler.user_id || 'dev-user-001',
        battler_id: playerBattler.id,
        role: 'member',
        is_active: true
      })

    if (memberError) {
      console.error('Error adding member:', memberError)
      return NextResponse.json({ error: 'Failed to join crew' }, { status: 500 })
    }

    // Update battler's crew_id
    await supabase
      .from('battlers')
      .update({ crew_id: crewId })
      .eq('id', playerBattler.id)

    // Record in membership history
    await supabase
      .from('crew_membership_history')
      .insert({
        battler_id: playerBattler.id,
        crew_id: crewId,
        crew_name: crew.name,
        joined_at: new Date().toISOString()
      })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Join crew API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
