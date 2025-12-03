import { NextResponse } from "next/server"

// POST /api/battles/[id]/accept - Accept a battle offer
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // In production:
  // 1. Verify offer exists and hasn't expired
  // 2. Create battle record in database
  // 3. Set up prep period

  const now = new Date()
  const prepLocksAt = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000)
  const scheduledAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  return NextResponse.json({
    success: true,
    battle: {
      id,
      status: "accepted",
      prepStartsAt: now.toISOString(),
      prepLocksAt: prepLocksAt.toISOString(),
      scheduledAt: scheduledAt.toISOString(),
    },
  })
}
