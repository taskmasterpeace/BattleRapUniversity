import { type NextRequest, NextResponse } from "next/server"
import type { OrganizeSegmentsRequest, OrganizeSegmentsResponse, V2Segment } from "@/lib/api-types"

// Mock storage (shared with segments route in production)
const segmentsStore: Map<string, V2Segment[]> = new Map()

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params
  const body: OrganizeSegmentsRequest = await request.json()

  const segments = segmentsStore.get(battleId) || []

  // Apply assignments
  for (const assignment of body.assignments) {
    const segment = segments.find((s) => s.id === assignment.segmentId)
    if (segment) {
      segment.roundNum = assignment.roundNum
      segment.position = assignment.position
      segment.updatedAt = new Date().toISOString()
    }
  }

  segmentsStore.set(battleId, segments)

  const response: OrganizeSegmentsResponse = {
    success: true,
    segments,
  }

  return NextResponse.json(response)
}
