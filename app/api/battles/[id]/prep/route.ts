import { NextResponse } from "next/server"
import type { FocusType } from "@/lib/types"

// GET /api/battles/[id]/prep - Get prep data for a battle
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Mock data - in production this would come from database
  const prepData = {
    battle: {
      id,
      scheduled_at: "2025-12-15T19:00:00Z",
      lock_prep_at: "2025-12-10T00:00:00Z",
      created_at: "2025-12-01T00:00:00Z",
      league: {
        name: "Small Room Circuit",
        round_length_minutes: 2,
        short_code: "SRC",
      },
      ai_battler: {
        id: "young-pattern",
        stage_name: "Young Pattern",
        tier: "mid",
      },
    },
    prepBlocks: [
      { day_index: 1, focus: "writing" as FocusType, auto_generated: false },
      { day_index: 2, focus: "writing" as FocusType, auto_generated: false },
      { day_index: 3, focus: "rest" as FocusType, auto_generated: false },
    ],
    totalPrepDays: 10,
    lockPrepAt: "2025-12-10T00:00:00Z",
    isLocked: false,
  }

  return NextResponse.json(prepData)
}

// POST /api/battles/[id]/prep - Save a prep block
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const { day_index, focus } = body

  // Validation
  if (typeof day_index !== "number" || day_index < 1 || day_index > 30) {
    return NextResponse.json({ error: "Invalid day_index" }, { status: 400 })
  }

  const validFocuses: FocusType[] = ["research", "writing", "performance", "life", "rest"]
  if (!validFocuses.includes(focus)) {
    return NextResponse.json({ error: "Invalid focus type" }, { status: 400 })
  }

  // In production: save to database
  // For now, just return success
  return NextResponse.json({
    success: true,
    message: "Prep saved",
    data: { battle_id: id, day_index, focus },
  })
}
