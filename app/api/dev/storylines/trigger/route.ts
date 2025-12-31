import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import { createStorylineEngine } from "@/lib/game/storylineEngine"

/**
 * POST /api/dev/storylines/trigger
 *
 * Force trigger a specific storyline for a battler (dev tool)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { battlerId, templateCode } = body

    if (!battlerId || !templateCode) {
      return NextResponse.json(
        { error: "battlerId and templateCode required" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const engine = createStorylineEngine(supabase)

    // Start the storyline directly (bypassing trigger conditions)
    const result = await engine.startStoryline(battlerId, templateCode)

    if (!result) {
      return NextResponse.json({ error: "Failed to start storyline" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      storylineId: result.storylineId,
      eventId: result.eventId,
    })
  } catch (err) {
    console.error("Storyline trigger error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
