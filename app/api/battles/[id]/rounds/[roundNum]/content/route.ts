import { NextResponse } from "next/server"
import type { SubmitContentRequest } from "@/lib/api-types"

// POST /api/battles/[id]/rounds/[roundNum]/content - Submit round content selection
export async function POST(request: Request, { params }: { params: Promise<{ id: string; roundNum: string }> }) {
  const { id, roundNum } = await params
  const body: SubmitContentRequest = await request.json()

  // Validation
  if (!body.contentTypes || body.contentTypes.length < 3 || body.contentTypes.length > 4) {
    return NextResponse.json(
      { error: true, code: "INVALID_SELECTION", message: "Select 3-4 content types" },
      { status: 400 },
    )
  }

  if (!body.deliveryTypes || body.deliveryTypes.length < 1 || body.deliveryTypes.length > 2) {
    return NextResponse.json(
      { error: true, code: "INVALID_SELECTION", message: "Select 1-2 delivery types" },
      { status: 400 },
    )
  }

  if (!body.performanceTypes || body.performanceTypes.length < 1 || body.performanceTypes.length > 2) {
    return NextResponse.json(
      { error: true, code: "INVALID_SELECTION", message: "Select 1-2 performance types" },
      { status: 400 },
    )
  }

  // In production: save to database
  return NextResponse.json({
    success: true,
    selection: {
      contentTypes: body.contentTypes,
      deliveryTypes: body.deliveryTypes,
      performanceTypes: body.performanceTypes,
    },
  })
}
