import { type NextRequest, NextResponse } from "next/server"
import type { GetResearchResponse, ResearchLevel } from "@/lib/api-types"
import { createServerClient } from "@/lib/db/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params

  try {
    const supabase = createServerClient()

    // Query prep_blocks to count research days
    const { data: prepBlocks, error } = await supabase
      .from('prep_blocks')
      .select('focus')
      .eq('battle_id', battleId)

    if (error) {
      console.error('Error fetching prep blocks:', error)
      return NextResponse.json({ error: 'Failed to fetch research data' }, { status: 500 })
    }

    // Count days spent on research
    const daysSpent = prepBlocks?.filter(b => b.focus === 'research').length || 0

    // Determine research level
    // Configuration: 2 days for casual, 3+ for aggressive
    const DAYS_FOR_CASUAL = 2
    const DAYS_FOR_AGGRESSIVE = 4

    let level: ResearchLevel = "none"
    if (daysSpent >= DAYS_FOR_AGGRESSIVE) {
      level = "aggressive"
    } else if (daysSpent >= DAYS_FOR_CASUAL) {
      level = "casual"
    }

    // Calculate effects based on level
    const effects = {
      canWritePersonals: level !== "none",
      personalsEffectiveness: level === "aggressive" ? 1.0 : level === "casual" ? 0.7 : 0.0,
      credibilityRisk: level === "none", // Risk if you write personals without research
    }

    const response: GetResearchResponse = {
      level,
      daysSpent,
      daysForCasual: DAYS_FOR_CASUAL,
      daysForAggressive: DAYS_FOR_AGGRESSIVE,
      effects,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Research route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
