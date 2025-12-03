import { NextResponse } from "next/server"

// POST /api/battles/[id]/lock-in - Lock prep plan
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // In production:
  // 1. Validate all days have focus assigned
  // 2. Mark prep as locked in database
  // 3. Generate battle outcome based on prep

  return NextResponse.json({
    success: true,
    message: "Prep locked",
    battle_id: id,
    locked_at: new Date().toISOString(),
  })
}
