import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import type { PrepCounter, PrepSegment } from "@/lib/types"
import { requireBattleOwnership, requireCounterOwnership } from "@/lib/auth/helpers"

const MAX_COUNTER_SLOTS = 2

// Helper to map database segment row to frontend format
function mapSegmentToFrontend(row: Record<string, unknown>): PrepSegment {
  return {
    id: row.id as string,
    battleId: row.battle_id as string,
    roundNum: row.round_num as number | null,
    position: row.position as number | null,
    contentType: row.content_type as string,
    deliveryType: row.delivery_type as string,
    performanceType: row.performance_type as string,
    isFreestyle: row.is_freestyle as boolean,
    isCounter: row.is_counter as boolean,
    counterTarget: row.counter_target as string | undefined,
    isWritten: row.is_written as boolean,
    isRehearsed: row.is_rehearsed as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

// Helper to map database counter row to frontend format
function mapCounterToFrontend(row: Record<string, unknown>, segment?: PrepSegment): PrepCounter {
  return {
    id: row.id as string,
    battleId: row.battle_id as string,
    anticipatedContent: row.anticipated_content as string,
    segmentId: row.segment_id as string,
    isTriggered: row.was_triggered as boolean | undefined,
    multiplierUsed: row.was_effective ? 1.5 : row.was_triggered === false ? 0.5 : undefined,
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params
    const supabase = createServerClient()

    // Get counters with their associated segments
    const { data: counters, error } = await supabase
      .from('prep_counters')
      .select(`
        *,
        segment:segment_id(*)
      `)
      .eq('battle_id', battleId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching counters:', error)
      return NextResponse.json({ error: 'Failed to fetch counters' }, { status: 500 })
    }

    const mappedCounters = (counters || []).map(counter => {
      const segment = counter.segment ? mapSegmentToFrontend(counter.segment) : undefined
      return {
        ...mapCounterToFrontend(counter),
        segment,
      }
    })

    return NextResponse.json({
      counters: mappedCounters,
      slots: {
        used: mappedCounters.length,
        available: MAX_COUNTER_SLOTS - mappedCounters.length,
        maxSlots: MAX_COUNTER_SLOTS,
        lockedSlots: [],
      },
    })
  } catch (err) {
    console.error('Counters GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

interface CreateCounterRequest {
  anticipatedContent: string
  segmentId?: string
  segment?: {
    contentType: string
    deliveryType: string
    performanceType: string
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params

    // SECURITY: Verify user owns this battle
    const authResult = await requireBattleOwnership(battleId)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const body: CreateCounterRequest = await request.json()
    const supabase = createServerClient()

    // Check if prep is locked (H1 fix)
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('lock_prep_at, status, battler_player_id')
      .eq('id', battleId)
      .single()

    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    const now = new Date()
    const lockDate = new Date(battle.lock_prep_at)

    if (now >= lockDate || battle.status === 'locked') {
      return NextResponse.json({
        error: 'PREP_LOCKED',
        message: 'Cannot create counters after prep lock time'
      }, { status: 403 })
    }

    // Check existing counter count
    // NOTE: This check is not fully atomic - there's a small race condition window
    // between this SELECT and the INSERT below. For true atomicity, we would need:
    // 1. A database CHECK constraint: ALTER TABLE prep_counters ADD CONSTRAINT max_counters_per_battle CHECK (...)
    // 2. Or a Postgres RPC function that does SELECT + INSERT in a transaction
    // The risk is low in practice (requires simultaneous counter creation), but it exists.
    const { data: existingCounters, error: countError } = await supabase
      .from('prep_counters')
      .select('id')
      .eq('battle_id', battleId)

    if (countError) {
      console.error('Error checking counter count:', countError)
      return NextResponse.json({ error: 'Failed to check counters' }, { status: 500 })
    }

    if ((existingCounters?.length || 0) >= MAX_COUNTER_SLOTS) {
      return NextResponse.json({ error: "NO_COUNTER_SLOTS", message: "All counter slots used" }, { status: 400 })
    }

    let segmentId = body.segmentId
    let createdSegment: PrepSegment | undefined

    // Create inline segment if provided
    if (body.segment && !body.segmentId) {
      const { data: newSegment, error: segmentError } = await supabase
        .from('prep_segments')
        .insert({
          battle_id: battleId,
          battler_id: battle.battler_player_id,
          content_type: body.segment.contentType,
          delivery_type: body.segment.deliveryType,
          performance_type: body.segment.performanceType,
          is_freestyle: false,
          is_counter: true,
          counter_target: body.anticipatedContent,
          is_written: true,
          is_rehearsed: false,
        })
        .select()
        .single()

      if (segmentError) {
        console.error('Error creating counter segment:', segmentError)
        return NextResponse.json({ error: 'Failed to create segment' }, { status: 500 })
      }

      segmentId = newSegment.id
      createdSegment = mapSegmentToFrontend(newSegment)
    } else if (body.segmentId) {
      // Mark existing segment as counter
      const { data: existingSegment, error: fetchError } = await supabase
        .from('prep_segments')
        .select('*')
        .eq('id', body.segmentId)
        .eq('battle_id', battleId)
        .single()

      if (fetchError || !existingSegment) {
        return NextResponse.json({ error: "SEGMENT_NOT_FOUND", message: "Segment not found" }, { status: 404 })
      }

      const { error: updateError } = await supabase
        .from('prep_segments')
        .update({
          is_counter: true,
          counter_target: body.anticipatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.segmentId)

      if (updateError) {
        console.error('Error updating segment as counter:', updateError)
        return NextResponse.json({ error: 'Failed to update segment' }, { status: 500 })
      }

      createdSegment = mapSegmentToFrontend({
        ...existingSegment,
        is_counter: true,
        counter_target: body.anticipatedContent,
      })
    }

    // Create the counter record
    const { data: newCounter, error: counterError } = await supabase
      .from('prep_counters')
      .insert({
        battle_id: battleId,
        battler_id: battle.battler_player_id,
        segment_id: segmentId,
        anticipated_content: body.anticipatedContent,
      })
      .select()
      .single()

    if (counterError) {
      console.error('Error creating counter:', counterError)
      return NextResponse.json({ error: 'Failed to create counter' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      counter: {
        ...mapCounterToFrontend(newCounter),
        segment: createdSegment,
      },
    })
  } catch (err) {
    console.error('Counters POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params
    const { searchParams } = new URL(request.url)
    const counterId = searchParams.get("counterId")

    if (!counterId) {
      return NextResponse.json({ error: "counterId required" }, { status: 400 })
    }

    // SECURITY: Verify user owns this counter
    const authResult = await requireCounterOwnership(counterId, battleId)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const supabase = createServerClient()

    // Use atomic RPC function to delete counter and update segment
    // This ensures both operations succeed or both rollback
    const { error } = await supabase.rpc('delete_prep_counter', {
      p_counter_id: counterId,
      p_battle_id: battleId
    })

    if (error) {
      console.error('Error deleting counter:', error)
      return NextResponse.json({ error: 'Failed to delete counter' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Counters DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
