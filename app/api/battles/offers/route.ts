import { NextResponse } from "next/server"
import { mockOffers } from "@/lib/api-mocks"

// GET /api/battles/offers - Get available battle offers
export async function GET() {
  // In production: fetch from database based on user's battler
  // For now, return mock data

  return NextResponse.json({
    offers: mockOffers,
  })
}
