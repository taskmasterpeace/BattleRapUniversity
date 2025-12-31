import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Winner post-battle options
const WINNER_ACTIONS = {
  good_battle: { label: 'Good Battle', emoji: '🤝', change: -5, description: 'Respectful acknowledgment' },
  run_it_back: { label: 'Run It Back', emoji: '😤', change: 20, description: 'Demands rematch' },
  that_was_easy: { label: 'That Was Easy', emoji: '🔥', change: 30, description: 'Disrespectful' },
  career_over: { label: 'Career Over', emoji: '💀', change: 50, description: 'Maximum disrespect' },
}

// Loser post-battle options
const LOSER_ACTIONS = {
  you_got_me: { label: 'You Got Me', emoji: '🤝', change: -10, description: 'Graceful acceptance' },
  rematch_now: { label: 'Rematch Now', emoji: '😤', change: 20, description: 'Demands rematch' },
  you_got_lucky: { label: 'You Got Lucky', emoji: '🙄', change: 25, description: 'Dismissive' },
  i_got_robbed: { label: 'I Got Robbed', emoji: '🔥', change: 35, description: 'Controversial claim' },
}

// GET - Check if user has already reacted and get current grudge status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: battleId } = await params

    // Get current user
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get battle details
    const { data: battle, error: battleError } = await supabaseAdmin
      .from('battles')
      .select(`
        id,
        status,
        winner_battler_id,
        player_battler_id,
        opponent_battler_id,
        player_battler:player_battler_id(id, stage_name, user_id),
        opponent_battler:opponent_battler_id(id, stage_name, user_id)
      `)
      .eq('id', battleId)
      .single()

    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    if (battle.status !== 'completed') {
      return NextResponse.json({ error: 'Battle not completed' }, { status: 400 })
    }

    const playerBattler = battle.player_battler as any
    const opponentBattler = battle.opponent_battler as any

    // Check if this user owns one of the battlers
    const isPlayer = playerBattler?.user_id === user.id
    const isOpponent = opponentBattler?.user_id === user.id

    if (!isPlayer && !isOpponent) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
    }

    const userBattlerId = isPlayer ? playerBattler.id : opponentBattler.id
    const opponentId = isPlayer ? opponentBattler.id : playerBattler.id
    const isWinner = battle.winner_battler_id === userBattlerId

    // Check for existing action
    const { data: existingAction } = await supabaseAdmin
      .from('grudge_actions')
      .select('action_type, intensity_change')
      .eq('battle_id', battleId)
      .eq('actor_battler_id', userBattlerId)
      .single()

    // Get current relationship intensity
    let intensity = 0
    const { data: relationship } = await supabaseAdmin
      .from('battler_relationships')
      .select('intensity')
      .or(`and(battler_a_id.eq.${userBattlerId < opponentId ? userBattlerId : opponentId},battler_b_id.eq.${userBattlerId < opponentId ? opponentId : userBattlerId})`)
      .single()

    if (relationship) {
      intensity = relationship.intensity
    }

    return NextResponse.json({
      battleId,
      isWinner,
      userBattlerId,
      opponentBattlerId: opponentId,
      opponentName: isPlayer ? opponentBattler.stage_name : playerBattler.stage_name,
      availableActions: isWinner ? WINNER_ACTIONS : LOSER_ACTIONS,
      selectedAction: existingAction?.action_type || null,
      currentIntensity: intensity,
    })
  } catch (error) {
    console.error('Error fetching grudge status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Submit post-battle grudge action
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: battleId } = await params
    const body = await request.json()
    const { actionType } = body

    // Get current user
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get battle details
    const { data: battle, error: battleError } = await supabaseAdmin
      .from('battles')
      .select(`
        id,
        status,
        winner_battler_id,
        player_battler_id,
        opponent_battler_id,
        player_battler:player_battler_id(id, stage_name, user_id),
        opponent_battler:opponent_battler_id(id, stage_name, user_id)
      `)
      .eq('id', battleId)
      .single()

    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    if (battle.status !== 'completed') {
      return NextResponse.json({ error: 'Battle not completed' }, { status: 400 })
    }

    const playerBattler = battle.player_battler as any
    const opponentBattler = battle.opponent_battler as any

    // Check if this user owns one of the battlers
    const isPlayer = playerBattler?.user_id === user.id
    const isOpponent = opponentBattler?.user_id === user.id

    if (!isPlayer && !isOpponent) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
    }

    const userBattlerId = isPlayer ? playerBattler.id : opponentBattler.id
    const opponentId = isPlayer ? opponentBattler.id : playerBattler.id
    const isWinner = battle.winner_battler_id === userBattlerId

    // Validate action type
    const validActions = isWinner ? WINNER_ACTIONS : LOSER_ACTIONS
    if (!actionType || !validActions[actionType as keyof typeof validActions]) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })
    }

    const actionInfo = validActions[actionType as keyof typeof validActions]

    // Check for existing action
    const { data: existingAction } = await supabaseAdmin
      .from('grudge_actions')
      .select('id')
      .eq('battle_id', battleId)
      .eq('actor_battler_id', userBattlerId)
      .single()

    if (existingAction) {
      return NextResponse.json({ error: 'Already submitted an action for this battle' }, { status: 400 })
    }

    // Use the database function to record the action
    const { data: actionId, error: actionError } = await supabaseAdmin
      .rpc('record_grudge_action', {
        p_actor_battler_id: userBattlerId,
        p_target_battler_id: opponentId,
        p_action_type: actionType,
        p_context: 'post_battle',
        p_battle_id: battleId,
        p_article_id: null
      })

    if (actionError) {
      console.error('Error recording grudge action:', actionError)
      // Fallback: insert directly if function doesn't exist yet
      const { error: insertError } = await supabaseAdmin
        .from('grudge_actions')
        .insert({
          relationship_id: null, // Will be set by trigger/manual update
          actor_battler_id: userBattlerId,
          target_battler_id: opponentId,
          action_type: actionType,
          intensity_change: actionInfo.change,
          context: 'post_battle',
          battle_id: battleId,
        })

      if (insertError) {
        console.error('Error inserting grudge action:', insertError)
        return NextResponse.json({ error: 'Failed to record action' }, { status: 500 })
      }
    }

    // Get updated intensity
    let newIntensity = 0
    const { data: relationship } = await supabaseAdmin
      .from('battler_relationships')
      .select('intensity')
      .or(`and(battler_a_id.eq.${userBattlerId < opponentId ? userBattlerId : opponentId},battler_b_id.eq.${userBattlerId < opponentId ? opponentId : userBattlerId})`)
      .single()

    if (relationship) {
      newIntensity = relationship.intensity
    }

    return NextResponse.json({
      success: true,
      actionType,
      intensityChange: actionInfo.change,
      newIntensity,
      message: getActionMessage(actionType, isWinner)
    })
  } catch (error) {
    console.error('Error submitting grudge action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getActionMessage(actionType: string, isWinner: boolean): string {
  const messages: Record<string, string> = {
    // Winner messages
    good_battle: "You showed respect. The rivalry cools down.",
    run_it_back: "You demanded a rematch. The tension rises.",
    that_was_easy: "You disrespected your opponent. They won't forget this.",
    career_over: "Maximum disrespect. This rivalry just became personal.",
    // Loser messages
    you_got_me: "You accepted the loss gracefully. Respect earned.",
    rematch_now: "You demanded a rematch. This isn't over.",
    you_got_lucky: "You dismissed the loss. The tension rises.",
    i_got_robbed: "You claim robbery. The controversy heats up the rivalry.",
  }
  return messages[actionType] || "Your response has been recorded."
}
