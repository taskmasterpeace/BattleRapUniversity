import { type NextRequest, NextResponse } from "next/server"
import type { ShiftRoundsRequest, ShiftRoundsResponse } from "@/lib/api-types"

// Mock storage for round order
const roundOrderStore: Map<string, number[]> = new Map()
const shiftsUsedStore: Map<string, boolean> = new Map()

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params
  const body: ShiftRoundsRequest = await request.json()

  // Check if already shifted
  if (shiftsUsedStore.get(battleId)) {
    return NextResponse.json(
      { error: "SHIFT_LIMIT_REACHED", message: "Already shifted once this battle" },
      { status: 400 },
    )
  }

  // Calculate penalties
  const consistencyPenalty = 0.05 // 5% for breaking flow
  const rehearsalPenalty = 0.1 // 10% for unrehearsed order
  const totalPenalty = consistencyPenalty + rehearsalPenalty

  // Build new order mapping
  const currentOrder = roundOrderStore.get(battleId) || [1, 2, 3]
  const newRoundOrder = body.newOrder.map((newPos, idx) => ({
    originalRound: currentOrder[idx],
    newPosition: newPos,
  }))

  roundOrderStore.set(battleId, body.newOrder)
  shiftsUsedStore.set(battleId, true)

  const response: ShiftRoundsResponse = {
    success: true,
    penalty: {
      consistencyPenalty,
      rehearsalPenalty,
      totalPenalty,
    },
    newRoundOrder,
  }

  return NextResponse.json(response)
}
