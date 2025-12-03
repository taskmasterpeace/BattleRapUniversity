import { type NextRequest, NextResponse } from "next/server"
import type { GetPrepProgressResponse } from "@/lib/api-types"
import { mockPrepProgressResponse } from "@/lib/api-mocks-v2"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params

  // In production, aggregate from segments, counters, prep_blocks tables
  // For now, return mock data with battleId
  const response: GetPrepProgressResponse = {
    ...mockPrepProgressResponse,
    battleId,
  }

  return NextResponse.json(response)
}
