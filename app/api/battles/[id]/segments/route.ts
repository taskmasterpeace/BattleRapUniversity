import { type NextRequest, NextResponse } from "next/server"
import type { PrepSegment } from "@/lib/types"

// Mock storage for segments (in production, use database)
const segmentsStore: Map<string, PrepSegment[]> = new Map()

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params

  const segments = segmentsStore.get(battleId) || []

  return NextResponse.json({
    battleId,
    segments,
    total: segments.length,
  })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params
  const body = await request.json()

  const newSegment: PrepSegment = {
    id: `seg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    battleId,
    roundNum: body.roundNum ?? null,
    position: body.position ?? null,
    contentType: body.contentType,
    deliveryType: body.deliveryType,
    performanceType: body.performanceType,
    isFreestyle: body.isFreestyle ?? false,
    isCounter: body.isCounter ?? false,
    counterTarget: body.counterTarget,
    isWritten: body.isFreestyle ?? false,
    isRehearsed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const existing = segmentsStore.get(battleId) || []
  segmentsStore.set(battleId, [...existing, newSegment])

  return NextResponse.json({
    success: true,
    segment: newSegment,
  })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params
  const body = await request.json()
  const { segmentId, ...updates } = body

  const segments = segmentsStore.get(battleId) || []
  const segmentIndex = segments.findIndex((s) => s.id === segmentId)

  if (segmentIndex === -1) {
    return NextResponse.json({ error: "Segment not found" }, { status: 404 })
  }

  segments[segmentIndex] = {
    ...segments[segmentIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  segmentsStore.set(battleId, segments)

  return NextResponse.json({
    success: true,
    segment: segments[segmentIndex],
  })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params
  const { searchParams } = new URL(request.url)
  const segmentId = searchParams.get("segmentId")

  if (!segmentId) {
    return NextResponse.json({ error: "segmentId required" }, { status: 400 })
  }

  const segments = segmentsStore.get(battleId) || []
  const filtered = segments.filter((s) => s.id !== segmentId)
  segmentsStore.set(battleId, filtered)

  return NextResponse.json({
    success: true,
    deleted: segmentId,
  })
}
