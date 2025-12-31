import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Helper to get dev user's battler
async function getDevBattler() {
  const { data: battler } = await supabase
    .from('battlers')
    .select('id')
    .eq('is_player_controlled', true)
    .single()

  return battler
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const target = searchParams.get('target')
    const caller = searchParams.get('caller')
    const league = searchParams.get('league')
    const status = searchParams.get('status') || 'pending'

    const devBattler = await getDevBattler()
    if (!devBattler) {
      return NextResponse.json({ error: 'No active battler' }, { status: 404 })
    }

    // Build query
    let query = supabase
      .from('call_outs')
      .select(`
        *,
        caller:caller_battler_id(
          id,
          stage_name,
          tier,
          crew_id,
          avatar_url,
          crews:crew_id(tag)
        ),
        target:target_battler_id(
          id,
          stage_name,
          tier,
          crew_id,
          avatar_url,
          crews:crew_id(tag)
        ),
        league:league_id(
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (target === 'me') {
      query = query.eq('target_battler_id', devBattler.id)
    }
    if (caller === 'me') {
      query = query.eq('caller_battler_id', devBattler.id)
    }
    if (league && league !== 'all') {
      const { data: leagueData } = await supabase
        .from('leagues')
        .select('id')
        .eq('short_code', league)
        .single()

      if (leagueData) {
        query = query.eq('league_id', leagueData.id)
      }
    }
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching call-outs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data
    const callOuts = (data || []).map((co: any) => ({
      id: co.id,
      caller: {
        id: co.caller?.id,
        stageName: co.caller?.stage_name,
        tier: co.caller?.tier,
        crewTag: co.caller?.crews?.tag,
        avatar: co.caller?.avatar_url,
      },
      target: {
        id: co.target?.id,
        stageName: co.target?.stage_name,
        tier: co.target?.tier,
        crewTag: co.target?.crews?.tag,
        avatar: co.target?.avatar_url,
      },
      template: co.template,
      customMessage: co.custom_message,
      status: co.status,
      stakeAmount: co.stake_amount || 0,
      league: co.league ? {
        id: co.league.id,
        name: co.league.name,
      } : null,
      cosignCount: co.cosign_count || 0,
      responseDeadline: co.response_deadline,
      createdAt: co.created_at,
    }))

    return NextResponse.json({ callOuts })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetBattlerId, template, stakeAmount } = body

    const devBattler = await getDevBattler()
    if (!devBattler) {
      return NextResponse.json({ error: 'No active battler' }, { status: 404 })
    }

    // Validate inputs
    if (!targetBattlerId || !template) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if target exists
    const { data: targetBattler } = await supabase
      .from('battlers')
      .select('id, primary_league_id')
      .eq('id', targetBattlerId)
      .single()

    if (!targetBattler) {
      return NextResponse.json({ error: 'Target battler not found' }, { status: 404 })
    }

    // Set deadline to 48 hours from now
    const deadline = new Date()
    deadline.setHours(deadline.getHours() + 48)

    // Create call-out
    const { data: callOut, error } = await supabase
      .from('call_outs')
      .insert({
        caller_battler_id: devBattler.id,
        target_battler_id: targetBattlerId,
        template: template,
        status: 'pending',
        stake_amount: stakeAmount || 0,
        league_id: targetBattler.primary_league_id,
        cosign_count: 0,
        response_deadline: deadline.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating call-out:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Record grudge action
    await supabase.rpc('record_grudge_action', {
      p_actor_battler_id: devBattler.id,
      p_target_battler_id: targetBattlerId,
      p_action_type: 'call_out',
      p_context: 'call_out',
    })

    // Update or create beef between battlers
    const [orderedA, orderedB] = [devBattler.id, targetBattlerId].sort()

    // Check if relationship exists
    const { data: existingBeef } = await supabase
      .from('battler_relationships')
      .select('id, intensity, rematch_demand')
      .eq('battler_a_id', orderedA)
      .eq('battler_b_id', orderedB)
      .maybeSingle()

    if (existingBeef) {
      // Increase intensity by 15 for a call-out
      const newIntensity = Math.min(100, existingBeef.intensity + 15)
      const newRematchDemand = Math.min(100, existingBeef.rematch_demand + 10)

      await supabase
        .from('battler_relationships')
        .update({
          intensity: newIntensity,
          rematch_demand: newRematchDemand,
          status: 'active',
        })
        .eq('id', existingBeef.id)
    } else {
      // Get caller name for origin story
      const { data: callerData } = await supabase
        .from('battlers')
        .select('stage_name')
        .eq('id', devBattler.id)
        .single()

      const { data: targetData } = await supabase
        .from('battlers')
        .select('stage_name')
        .eq('id', targetBattlerId)
        .single()

      const callerName = callerData?.stage_name || 'Unknown'
      const targetName = targetData?.stage_name || 'Unknown'

      // Create new beef
      await supabase
        .from('battler_relationships')
        .insert({
          battler_a_id: orderedA,
          battler_b_id: orderedB,
          intensity: 25, // Starting intensity for a call-out
          rematch_demand: 15,
          status: 'active',
          origin_type: 'media',
          origin_story: `${callerName} publicly called out ${targetName}, igniting a new rivalry.`,
        })
    }

    return NextResponse.json({ callOut })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
