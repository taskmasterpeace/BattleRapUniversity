import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import type { PrepSegment } from "@/lib/types"
import { requireBattleOwnership, requireSegmentOwnership } from "@/lib/auth/helpers"

// Helper to map database row to frontend format
function mapToFrontend(row: Record<string, unknown>): PrepSegment {
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params
    const supabase = createServerClient()

    // Get segments for this battle
    const { data: segments, error } = await supabase
      .from('prep_segments')
      .select('*')
      .eq('battle_id', battleId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching segments:', error)
      return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 })
    }

    const mappedSegments = (segments || []).map(mapToFrontend)

    return NextResponse.json({
      battleId,
      segments: mappedSegments,
      total: mappedSegments.length,
    })
  } catch (err) {
    console.error('Segments GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    const body = await request.json()
    const supabase = createServerClient()

    // Get the player's battler ID from the battle and check prep lock
    const { data: battle } = await supabase
      .from('battles')
      .select('battler_player_id, lock_prep_at, status')
      .eq('id', battleId)
      .single()

    if (!battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    // Check prep lock status
    const now = new Date()
    const lockDate = new Date(battle.lock_prep_at)

    if (now >= lockDate || battle.status === 'locked' || battle.status === 'completed') {
      return NextResponse.json({
        error: 'PREP_LOCKED',
        message: 'Cannot create segments after prep lock deadline'
      }, { status: 403 })
    }

    // Insert new segment
    const { data: newSegment, error } = await supabase
      .from('prep_segments')
      .insert({
        battle_id: battleId,
        battler_id: battle.battler_player_id,
        round_num: body.roundNum ?? null,
        position: body.position ?? null,
        content_type: body.contentType,
        delivery_type: body.deliveryType,
        performance_type: body.performanceType,
        is_freestyle: body.isFreestyle ?? false,
        is_counter: body.isCounter ?? false,
        counter_target: body.counterTarget ?? null,
        is_written: !body.isFreestyle, // Written segments start as written, freestyle don't need writing
        is_rehearsed: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating segment:', error)
      return NextResponse.json({ error: 'Failed to create segment' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      segment: mapToFrontend(newSegment),
    })
  } catch (err) {
    console.error('Segments POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params
    const body = await request.json()
    const { segmentId, ...updates } = body

    if (!segmentId) {
      return NextResponse.json({ error: 'segmentId required' }, { status: 400 })
    }

    // SECURITY: Verify user owns this segment
    const authResult = await requireSegmentOwnership(segmentId, battleId)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const supabase = createServerClient()

    // Check prep lock status
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('lock_prep_at, status')
      .eq('id', battleId)
      .single()

    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    const now = new Date()
    const lockDate = new Date(battle.lock_prep_at)

    if (now >= lockDate || battle.status === 'locked' || battle.status === 'completed') {
      return NextResponse.json({
        error: 'PREP_LOCKED',
        message: 'Cannot modify segments after prep lock deadline'
      }, { status: 403 })
    }

    // Build update object mapping frontend to database fields
    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.roundNum !== undefined) dbUpdates.round_num = updates.roundNum
    if (updates.position !== undefined) dbUpdates.position = updates.position
    if (updates.contentType !== undefined) dbUpdates.content_type = updates.contentType
    if (updates.deliveryType !== undefined) dbUpdates.delivery_type = updates.deliveryType
    if (updates.performanceType !== undefined) dbUpdates.performance_type = updates.performanceType
    if (updates.isFreestyle !== undefined) dbUpdates.is_freestyle = updates.isFreestyle
    if (updates.isCounter !== undefined) dbUpdates.is_counter = updates.isCounter
    if (updates.counterTarget !== undefined) dbUpdates.counter_target = updates.counterTarget
    if (updates.isWritten !== undefined) dbUpdates.is_written = updates.isWritten
    if (updates.isRehearsed !== undefined) dbUpdates.is_rehearsed = updates.isRehearsed

    const { data: updatedSegment, error } = await supabase
      .from('prep_segments')
      .update(dbUpdates)
      .eq('id', segmentId)
      .eq('battle_id', battleId)
      .select()
      .single()

    if (error) {
      console.error('Error updating segment:', error)
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      segment: mapToFrontend(updatedSegment),
    })
  } catch (err) {
    console.error('Segments PUT error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params
    const { searchParams } = new URL(request.url)
    const segmentId = searchParams.get("segmentId")

    if (!segmentId) {
      return NextResponse.json({ error: "segmentId required" }, { status: 400 })
    }

    // SECURITY: Verify user owns this segment
    const authResult = await requireSegmentOwnership(segmentId, battleId)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const supabase = createServerClient()

    // Check prep lock status
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('lock_prep_at, status')
      .eq('id', battleId)
      .single()

    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    const now = new Date()
    const lockDate = new Date(battle.lock_prep_at)

    if (now >= lockDate || battle.status === 'locked' || battle.status === 'completed') {
      return NextResponse.json({
        error: 'PREP_LOCKED',
        message: 'Cannot delete segments after prep lock deadline'
      }, { status: 403 })
    }

    const { error } = await supabase
      .from('prep_segments')
      .delete()
      .eq('id', segmentId)
      .eq('battle_id', battleId)

    if (error) {
      console.error('Error deleting segment:', error)
      return NextResponse.json({ error: 'Failed to delete segment' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deleted: segmentId,
    })
  } catch (err) {
    console.error('Segments DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
