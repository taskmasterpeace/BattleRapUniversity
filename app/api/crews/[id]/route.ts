import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

// GET /api/crews/[id] - Get crew details with members
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const crewId = params.id

    const { data: crew, error } = await supabase
      .from('crews')
      .select(`
        id,
        name,
        tag,
        logo_url,
        reputation,
        total_wins,
        total_losses,
        created_at,
        leader_battler_id,
        crew_members!inner(
          id,
          battler_id,
          role,
          joined_at,
          battler:battler_id(
            id,
            stage_name,
            tier,
            sprite_url,
            style_tags
          )
        )
      `)
      .eq('id', crewId)
      .eq('active', true)
      .single()

    if (error) {
      console.error('Error fetching crew:', error)
      return NextResponse.json({ error: 'Crew not found' }, { status: 404 })
    }

    return NextResponse.json({ crew })
  } catch (err) {
    console.error('Get crew API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/crews/[id] - Disband crew (leader only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const crewId = params.id

    // Get dev player's battler
    const { data: playerBattler } = await supabase
      .from('battlers')
      .select('id')
      .eq('is_ai', false)
      .limit(1)
      .single()

    if (!playerBattler) {
      return NextResponse.json({ error: 'No battler found' }, { status: 404 })
    }

    // Check if player is the leader
    const { data: crew } = await supabase
      .from('crews')
      .select('leader_battler_id, name')
      .eq('id', crewId)
      .single()

    if (!crew) {
      return NextResponse.json({ error: 'Crew not found' }, { status: 404 })
    }

    if (crew.leader_battler_id !== playerBattler.id) {
      return NextResponse.json({ error: 'Only the leader can disband the crew' }, { status: 403 })
    }

    // Get all members to update their records
    const { data: members } = await supabase
      .from('crew_members')
      .select('battler_id')
      .eq('crew_id', crewId)
      .eq('is_active', true)

    // Mark crew as inactive
    await supabase
      .from('crews')
      .update({ active: false })
      .eq('id', crewId)

    // Mark all memberships as inactive and set left_at
    const now = new Date().toISOString()
    await supabase
      .from('crew_members')
      .update({ is_active: false, left_at: now })
      .eq('crew_id', crewId)

    // Update membership history
    await supabase
      .from('crew_membership_history')
      .update({ left_at: now, reason: 'Crew disbanded by leader' })
      .eq('crew_id', crewId)
      .is('left_at', null)

    // Clear crew_id from all members' battlers
    if (members) {
      const battlerIds = members.map(m => m.battler_id)
      await supabase
        .from('battlers')
        .update({ crew_id: null })
        .in('id', battlerIds)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete crew API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
