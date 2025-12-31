import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import type { FocusType } from "@/lib/types"
import { requireBattleOwnership } from "@/lib/auth/helpers"

// GET /api/battles/[id]/prep - Get prep data for a battle
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params
    const supabase = createServerClient()

    // Get battle with opponent and league info
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select(`
        id,
        scheduled_at,
        lock_prep_at,
        created_at,
        battler_player_id,
        opponent:battler_ai_id(
          id,
          stage_name,
          tier
        ),
        league:league_id(
          id,
          name,
          round_length_minutes,
          short_code
        )
      `)
      .eq('id', battleId)
      .single()

    if (battleError || !battle) {
      console.error('Error fetching battle:', battleError)
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    // Get prep blocks for this battle
    const { data: prepBlocks, error: prepError } = await supabase
      .from('prep_blocks')
      .select('*')
      .eq('battle_id', battleId)
      .order('day_index', { ascending: true })

    if (prepError) {
      console.error('Error fetching prep blocks:', prepError)
      return NextResponse.json({ error: 'Failed to fetch prep blocks' }, { status: 500 })
    }

    // Calculate total prep days (days between created_at and lock_prep_at)
    const createdDate = new Date(battle.created_at)
    const lockDate = new Date(battle.lock_prep_at)
    const totalPrepDays = Math.max(1, Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)))

    // Check if prep is locked
    const now = new Date()
    const isLocked = now >= lockDate

    const prepData = {
      battle: {
        id: battle.id,
        scheduled_at: battle.scheduled_at,
        lock_prep_at: battle.lock_prep_at,
        created_at: battle.created_at,
        league: {
          id: battle.league?.id,
          name: battle.league?.name,
          round_length_minutes: battle.league?.round_length_minutes || 2,
          short_code: battle.league?.short_code || 'SRC',
        },
        ai_battler: {
          id: battle.opponent?.id,
          stage_name: battle.opponent?.stage_name,
          tier: battle.opponent?.tier,
        },
      },
      prepBlocks: (prepBlocks || []).map(block => ({
        id: block.id,
        day_index: block.day_index,
        focus: block.focus as FocusType,
        auto_generated: block.auto_generated,
      })),
      totalPrepDays,
      lockPrepAt: battle.lock_prep_at,
      isLocked,
    }

    return NextResponse.json(prepData)
  } catch (err) {
    console.error('Prep GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/battles/[id]/prep - Save a prep block
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params

    // SECURITY: Verify user owns this battle
    const authResult = await requireBattleOwnership(battleId)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const body = await request.json()
    const supabase = createServerClient()

    const { day_index, focus } = body

    // Basic type validation
    if (typeof day_index !== "number" || day_index < 1) {
      return NextResponse.json({ error: "Invalid day_index" }, { status: 400 })
    }

    const validFocuses: FocusType[] = ["research", "writing", "performance", "life", "rest"]
    if (!validFocuses.includes(focus)) {
      return NextResponse.json({ error: "Invalid focus type" }, { status: 400 })
    }

    // Get the battle to check if prep is locked and get player battler ID
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('battler_player_id, lock_prep_at, created_at')
      .eq('id', battleId)
      .single()

    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    // Calculate actual prep days for this battle
    const createdDate = new Date(battle.created_at)
    const lockDate = new Date(battle.lock_prep_at)
    const totalPrepDays = Math.max(1, Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)))

    // Validate day_index against actual prep days
    if (day_index > totalPrepDays) {
      return NextResponse.json({
        error: "Invalid day_index",
        message: `This battle only has ${totalPrepDays} prep days`,
        maxDays: totalPrepDays
      }, { status: 400 })
    }

    // Check if prep is locked (lockDate already defined above)
    const now = new Date()
    if (now >= lockDate) {
      return NextResponse.json({ error: 'Prep is locked' }, { status: 400 })
    }

    // Upsert the prep block (insert or update)
    const { data: prepBlock, error: upsertError } = await supabase
      .from('prep_blocks')
      .upsert({
        battle_id: battleId,
        battler_id: battle.battler_player_id,
        day_index,
        focus,
        auto_generated: false,
      }, {
        onConflict: 'battle_id,battler_id,day_index',
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Error saving prep block:', upsertError)
      return NextResponse.json({ error: 'Failed to save prep block' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Prep saved",
      data: {
        id: prepBlock.id,
        battle_id: battleId,
        day_index,
        focus,
      },
    })
  } catch (err) {
    console.error('Prep POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
