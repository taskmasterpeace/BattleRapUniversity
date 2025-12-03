import { NextResponse } from "next/server"

// GET /api/battles/[id]/rounds/[roundNum] - Get round data
export async function GET(request: Request, { params }: { params: Promise<{ id: string; roundNum: string }> }) {
  const { id, roundNum } = await params
  const roundNumber = Number.parseInt(roundNum, 10)

  // In production: fetch from database
  return NextResponse.json({
    roundNum: roundNumber,
    isSimulated: false,
  })
}
