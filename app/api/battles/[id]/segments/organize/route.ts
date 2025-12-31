import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import type { PrepSegment } from "@/lib/types"

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

interface SegmentAssignment {
  segmentId: string
  roundNum: number | null
  position: number | null
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params
    const body: { assignments: SegmentAssignment[] } = await request.json()
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
        message: 'Cannot reorganize segments after prep lock deadline'
      }, { status: 403 })
    }

    // Update each segment's round and position assignment
    const updatePromises = body.assignments.map(async (assignment) => {
      const { error } = await supabase
        .from('prep_segments')
        .update({
          round_num: assignment.roundNum,
          position: assignment.position,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assignment.segmentId)
        .eq('battle_id', battleId)

      if (error) {
        console.error('Error updating segment assignment:', error)
        throw error
      }
    })

    await Promise.all(updatePromises)

    // Fetch all updated segments
    const { data: segments, error } = await supabase
      .from('prep_segments')
      .select('*')
      .eq('battle_id', battleId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching updated segments:', error)
      return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 })
    }

    const mappedSegments = (segments || []).map(mapToFrontend)

    return NextResponse.json({
      success: true,
      segments: mappedSegments,
    })
  } catch (err) {
    console.error('Organize segments error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
