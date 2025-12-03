import { NextResponse } from "next/server"

interface CityData {
  name: string
  state: string
  region: string
  population: number
  coordinates: [number, number]
  time_zone: string
  city_tier: "major" | "regional" | "underground"
}

interface CreateBattlerRequest {
  stage_name: string
  city?: CityData | null
  primary_league_id: string
  style_tags: string[]
  allocated_attributes: {
    writing: {
      lyricism: number
      wordplay: number
      creativity: number
      flow: number
    }
    performance: {
      stage_presence: number
      crowd_control: number
      delivery: number
    }
    personal: {
      financial_stability: number
      reputation: number
      family_bond: number
    }
    resilience: number
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateBattlerRequest = await request.json()

    // Validation
    if (!body.stage_name || body.stage_name.length < 2 || body.stage_name.length > 50) {
      return NextResponse.json({ error: "Stage name must be between 2-50 characters" }, { status: 400 })
    }

    if (!body.primary_league_id) {
      return NextResponse.json({ error: "Primary league is required" }, { status: 400 })
    }

    if (!body.style_tags || body.style_tags.length < 1 || body.style_tags.length > 3) {
      return NextResponse.json({ error: "Must select 1-3 style tags" }, { status: 400 })
    }

    // Validate attributes total to 36 (11 * 1 min + 25 distributable)
    const attrs = body.allocated_attributes
    const total =
      attrs.writing.lyricism +
      attrs.writing.wordplay +
      attrs.writing.creativity +
      attrs.writing.flow +
      attrs.performance.stage_presence +
      attrs.performance.crowd_control +
      attrs.performance.delivery +
      attrs.personal.financial_stability +
      attrs.personal.reputation +
      attrs.personal.family_bond +
      attrs.resilience

    if (total !== 36) {
      return NextResponse.json({ error: `Attributes must total 36 points (currently ${total})` }, { status: 400 })
    }

    // Check each attribute is within 1-8
    const allValues = [
      attrs.writing.lyricism,
      attrs.writing.wordplay,
      attrs.writing.creativity,
      attrs.writing.flow,
      attrs.performance.stage_presence,
      attrs.performance.crowd_control,
      attrs.performance.delivery,
      attrs.personal.financial_stability,
      attrs.personal.reputation,
      attrs.personal.family_bond,
      attrs.resilience,
    ]

    for (const val of allValues) {
      if (val < 1 || val > 8) {
        return NextResponse.json({ error: "Each attribute must be between 1-8" }, { status: 400 })
      }
    }

    let crowdEnergyBonus = 0
    let authenticityBonus = 0
    let localTournamentBonus = 0

    if (body.city) {
      switch (body.city.city_tier) {
        case "major":
          crowdEnergyBonus = 10 // +10% crowd energy
          break
        case "regional":
          localTournamentBonus = 15 // +15% in local tournaments
          break
        case "underground":
          authenticityBonus = 5 // +5% authenticity/credibility
          break
      }
    }

    // Create the battler (mock response for now)
    const newBattler = {
      id: `battler_${Date.now()}`,
      stage_name: body.stage_name,
      city: body.city || null,
      region: body.city?.region || null,
      primary_league_id: body.primary_league_id,
      style_tags: body.style_tags,
      tier: "low",
      created_at: new Date().toISOString(),
      bonuses: {
        crowd_energy: crowdEnergyBonus,
        authenticity: authenticityBonus,
        local_tournament: localTournamentBonus,
      },
    }

    const ranking = {
      rating: 1200,
      wins: 0,
      losses: 0,
      streak: 0,
    }

    return NextResponse.json({
      battler: newBattler,
      attributes: body.allocated_attributes,
      ranking,
    })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
