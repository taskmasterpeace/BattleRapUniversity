import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

// GET /api/crews - List all crews or user's crew
export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const myCrewOnly = searchParams.get('my_crew') === 'true'

    // Get dev player's battler
    const { data: playerBattler } = await supabase
      .from('battlers')
      .select('id, crew_id')
      .eq('is_ai', false)
      .limit(1)
      .single()

    if (!playerBattler) {
      return NextResponse.json({ crews: [] })
    }

    if (myCrewOnly) {
      // Get player's crew only
      if (!playerBattler.crew_id) {
        return NextResponse.json({ crew: null })
      }

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
              sprite_url
            )
          )
        `)
        .eq('id', playerBattler.crew_id)
        .eq('active', true)
        .single()

      if (error) {
        console.error('Error fetching crew:', error)
        return NextResponse.json({ error: 'Failed to fetch crew' }, { status: 500 })
      }

      return NextResponse.json({ crew })
    }

    // Get all active crews
    const { data: crews, error } = await supabase
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
          count
        )
      `)
      .eq('active', true)
      .order('reputation', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching crews:', error)
      return NextResponse.json({ error: 'Failed to fetch crews' }, { status: 500 })
    }

    // Get member counts
    const { data: memberCounts } = await supabase
      .from('crew_members')
      .select('crew_id')
      .eq('is_active', true)

    const countsMap = memberCounts?.reduce((acc, m) => {
      acc[m.crew_id] = (acc[m.crew_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const crewsWithCounts = crews?.map(crew => ({
      ...crew,
      member_count: countsMap[crew.id] || 0
    })) || []

    return NextResponse.json({ crews: crewsWithCounts })
  } catch (err) {
    console.error('Crews API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/crews - Create a new crew
export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { name, tag } = body

    if (!name || !tag) {
      return NextResponse.json({ error: 'Name and tag are required' }, { status: 400 })
    }

    // Validate tag format (short code)
    if (tag.length < 2 || tag.length > 5) {
      return NextResponse.json({ error: 'Tag must be 2-5 characters' }, { status: 400 })
    }

    // Get dev player's battler
    const { data: playerBattler } = await supabase
      .from('battlers')
      .select('id, crew_id, user_id')
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

    // Check if name or tag already exists
    const { data: existingCrew } = await supabase
      .from('crews')
      .select('id')
      .or(`name.eq.${name},tag.eq.${tag.toUpperCase()}`)
      .limit(1)
      .single()

    if (existingCrew) {
      return NextResponse.json({ error: 'Crew name or tag already exists' }, { status: 400 })
    }

    // Create crew
    const { data: newCrew, error: crewError } = await supabase
      .from('crews')
      .insert({
        name,
        tag: tag.toUpperCase(),
        created_by: playerBattler.user_id || 'dev-user-001',
        leader_battler_id: playerBattler.id,
        reputation: 50,
        total_wins: 0,
        total_losses: 0,
        active: true
      })
      .select()
      .single()

    if (crewError) {
      console.error('Error creating crew:', crewError)
      return NextResponse.json({ error: 'Failed to create crew' }, { status: 500 })
    }

    // Add creator as leader member
    const { error: memberError } = await supabase
      .from('crew_members')
      .insert({
        crew_id: newCrew.id,
        user_id: playerBattler.user_id || 'dev-user-001',
        battler_id: playerBattler.id,
        role: 'leader',
        is_active: true
      })

    if (memberError) {
      console.error('Error adding crew member:', memberError)
      // Rollback crew creation
      await supabase.from('crews').delete().eq('id', newCrew.id)
      return NextResponse.json({ error: 'Failed to create crew membership' }, { status: 500 })
    }

    // Update battler's crew_id
    await supabase
      .from('battlers')
      .update({ crew_id: newCrew.id })
      .eq('id', playerBattler.id)

    // Record in membership history
    await supabase
      .from('crew_membership_history')
      .insert({
        battler_id: playerBattler.id,
        crew_id: newCrew.id,
        crew_name: name,
        joined_at: new Date().toISOString()
      })

    return NextResponse.json({ crew: newCrew }, { status: 201 })
  } catch (err) {
    console.error('Create crew API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
