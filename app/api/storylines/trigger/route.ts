import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import { createStorylineEngine } from "@/lib/game/storylineEngine"

/**
 * POST /api/storylines/trigger
 *
 * Check and trigger storylines after a battle
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { battlerId, battleId, battleContext } = body

    if (!battlerId) {
      return NextResponse.json(
        { error: 'battlerId is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const engine = createStorylineEngine(supabase)

    // Check for triggered storylines
    const triggeredStorylines = await engine.checkStorylineTriggers(
      battlerId,
      battleContext
    )

    // Start any triggered storylines
    const startedStorylines = []
    for (const storyline of triggeredStorylines) {
      const result = await engine.startStoryline(
        battlerId,
        storyline.code,
        battleId
      )
      if (result) {
        startedStorylines.push({
          code: storyline.code,
          name: storyline.name,
          category: storyline.category,
          storylineId: result.storylineId,
          eventId: result.eventId
        })
      }
    }

    // Also check for storyline advancement (battle-gated chapters)
    await engine.checkStorylineAdvancement(battlerId)

    return NextResponse.json({
      success: true,
      triggeredCount: triggeredStorylines.length,
      startedCount: startedStorylines.length,
      startedStorylines
    })
  } catch (err) {
    console.error('Storyline trigger error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
