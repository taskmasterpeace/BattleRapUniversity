import { type NextRequest, NextResponse } from "next/server"
import type { GetResearchResponse } from "@/lib/api-types"
import { mockResearchResponse } from "@/lib/api-mocks-v2"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params

  // In production, calculate from prep_blocks table
  // For now, return mock data
  const response: GetResearchResponse = {
    ...mockResearchResponse,
    // Could customize based on battleId
  }

  return NextResponse.json(response)
}
