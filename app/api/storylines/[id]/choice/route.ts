import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import { createStorylineEngine } from "@/lib/game/storylineEngine"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storylineId } = await params
    const body = await request.json()
    const { chapterId, choiceId, battleId } = body

    if (!chapterId || !choiceId) {
      return NextResponse.json(
        { error: 'chapterId and choiceId are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const engine = createStorylineEngine(supabase)

    const result = await engine.processChoice(
      storylineId,
      chapterId,
      choiceId,
      battleId
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      nextChapter: result.nextChapter,
      ending: result.ending,
      effectsApplied: result.effectsApplied,
      prepDaysLost: result.prepDaysLost
    })
  } catch (err) {
    console.error('Storyline choice error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
