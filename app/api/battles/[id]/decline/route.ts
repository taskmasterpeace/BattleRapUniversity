import { NextResponse } from "next/server"

// POST /api/battles/[id]/decline - Decline a battle offer
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // In production:
  // 1. Mark offer as declined
  // 2. May affect reputation/rankings

  return NextResponse.json({
    success: true,
  })
}
