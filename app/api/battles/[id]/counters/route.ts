import { type NextRequest, NextResponse } from "next/server"
import type {
  GetCountersResponse,
  CreateCounterRequest,
  CreateCounterResponse,
  V2Counter,
  V2Segment,
} from "@/lib/api-types"

// Mock storage
const countersStore: Map<string, V2Counter[]> = new Map()
const segmentsStore: Map<string, V2Segment[]> = new Map()

const MAX_COUNTER_SLOTS = 2

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params

  const counters = countersStore.get(battleId) || []

  const response: GetCountersResponse = {
    counters,
    slots: {
      used: counters.length,
      available: MAX_COUNTER_SLOTS - counters.length,
      maxSlots: MAX_COUNTER_SLOTS,
      lockedSlots: [],
    },
  }

  return NextResponse.json(response)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params
  const body: CreateCounterRequest = await request.json()

  const counters = countersStore.get(battleId) || []

  // Check slots
  if (counters.length >= MAX_COUNTER_SLOTS) {
    return NextResponse.json({ error: "NO_COUNTER_SLOTS", message: "All counter slots used" }, { status: 400 })
  }

  let segmentId = body.segmentId
  let segment: V2Segment | undefined

  // Create inline segment if provided
  if (body.segment && !body.segmentId) {
    const segments = segmentsStore.get(battleId) || []
    const newSegment: V2Segment = {
      id: `seg-${Date.now()}`,
      battleId,
      roundNum: null,
      position: null,
      contentType: body.segment.contentType,
      deliveryType: body.segment.deliveryType,
      performanceType: body.segment.performanceType,
      isFreestyle: false,
      isCounter: true,
      counterTarget: body.anticipatedContent,
      isRehearsed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    segments.push(newSegment)
    segmentsStore.set(battleId, segments)
    segmentId = newSegment.id
    segment = newSegment
  } else if (body.segmentId) {
    const segments = segmentsStore.get(battleId) || []
    segment = segments.find((s) => s.id === body.segmentId)
    if (!segment) {
      return NextResponse.json({ error: "SEGMENT_NOT_FOUND", message: "Segment not found" }, { status: 404 })
    }
    // Mark as counter
    segment.isCounter = true
    segment.counterTarget = body.anticipatedContent
  }

  const newCounter: V2Counter = {
    id: `counter-${Date.now()}`,
    battleId,
    segmentId: segmentId!,
    anticipatedContent: body.anticipatedContent,
    segment,
    createdAt: new Date().toISOString(),
  }

  counters.push(newCounter)
  countersStore.set(battleId, counters)

  const response: CreateCounterResponse = {
    success: true,
    counter: newCounter,
  }

  return NextResponse.json(response)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params
  const { searchParams } = new URL(request.url)
  const counterId = searchParams.get("counterId")

  if (!counterId) {
    return NextResponse.json({ error: "counterId required" }, { status: 400 })
  }

  const counters = countersStore.get(battleId) || []
  const filtered = counters.filter((c) => c.id !== counterId)
  countersStore.set(battleId, filtered)

  return NextResponse.json({ success: true })
}
