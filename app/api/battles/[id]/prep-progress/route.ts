import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import type { ResearchLevel } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params
    const supabase = createServerClient()

    // Get battle info to check lock status
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select(`
        lock_prep_at,
        league:league_id(
          round_length_minutes
        )
      `)
      .eq('id', battleId)
      .single()

    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    // Get prep blocks to count days by focus
    const { data: prepBlocks, error: prepError } = await supabase
      .from('prep_blocks')
      .select('focus')
      .eq('battle_id', battleId)

    if (prepError) {
      console.error('Error fetching prep blocks:', prepError)
      return NextResponse.json({ error: 'Failed to fetch prep data' }, { status: 500 })
    }

    // Count days by focus type
    const focusCounts = {
      research: 0,
      writing: 0,
      performance: 0,
      life: 0,
      rest: 0,
    }

    for (const block of prepBlocks || []) {
      if (block.focus in focusCounts) {
        focusCounts[block.focus as keyof typeof focusCounts]++
      }
    }

    // Calculate research level
    let researchLevel: ResearchLevel = "none"
    if (focusCounts.research >= 3) {
      researchLevel = "aggressive"
    } else if (focusCounts.research >= 1) {
      researchLevel = "casual"
    }

    // Get segments to count written and organized
    const { data: segments, error: segmentsError } = await supabase
      .from('prep_segments')
      .select('is_written, is_rehearsed, round_num')
      .eq('battle_id', battleId)

    if (segmentsError) {
      console.error('Error fetching segments:', segmentsError)
    }

    const segmentsWritten = (segments || []).filter(s => s.is_written).length

    // Calculate segments needed based on league config (default 3 rounds)
    const roundCount = 3
    const roundLength = battle.league?.round_length_minutes || 2
    const segmentsPerRound = roundLength === 3 ? 6 : roundLength === 2 ? 4 : 3
    const segmentsNeeded = segmentsPerRound * roundCount

    // Track which rounds have been rehearsed
    const roundsRehearsed: number[] = []
    for (const segment of segments || []) {
      if (segment.is_rehearsed && segment.round_num && !roundsRehearsed.includes(segment.round_num)) {
        roundsRehearsed.push(segment.round_num)
      }
    }

    // Check if prep is locked
    const now = new Date()
    const lockDate = new Date(battle.lock_prep_at)
    const isLocked = now >= lockDate

    return NextResponse.json({
      battleId,
      researchLevel,
      researchDays: focusCounts.research,
      writingDays: focusCounts.writing,
      rehearsalDays: focusCounts.performance,
      restDays: focusCounts.rest,
      lifeDays: focusCounts.life,
      segmentsWritten,
      segmentsNeeded,
      roundsRehearsed: roundsRehearsed.sort(),
      isLocked,
    })
  } catch (err) {
    console.error('Prep progress error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
