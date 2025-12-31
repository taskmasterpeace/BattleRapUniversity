import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import {
  getBattlerLifeState,
  updateBattlerLifeState,
  applyStateChanges,
  generateStateSummary,
  getBattlerNPCs,
  getCompletedStorylines,
  getBlockedStorylines,
  getAvailableSequels,
  canBookInternational,
  canPerform,
  getStatePerformanceModifiers,
  StateChangeEffect
} from "@/lib/game/battlerState"

/**
 * GET /api/dev/state?battler_id=xxx
 *
 * Get complete state information for a battler
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const battlerId = url.searchParams.get('battler_id')
    const format = url.searchParams.get('format') // 'full', 'summary', 'ai'

    if (!battlerId) {
      return NextResponse.json({ error: "battler_id required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get battler name for summary
    const { data: battler } = await supabase
      .from('battlers')
      .select('name')
      .eq('id', battlerId)
      .single()

    const battlerName = battler?.name || 'Unknown'

    // AI-readable summary format
    if (format === 'ai' || format === 'summary') {
      const summary = await generateStateSummary(supabase, battlerId, battlerName)
      return NextResponse.json({ summary })
    }

    // Full state data
    const lifeState = await getBattlerLifeState(supabase, battlerId)
    const npcs = await getBattlerNPCs(supabase, battlerId)
    const completedStorylines = await getCompletedStorylines(supabase, battlerId)
    const blockedStorylines = await getBlockedStorylines(supabase, battlerId)
    const availableSequels = await getAvailableSequels(supabase, battlerId)

    // Capability checks
    const internationalCheck = await canBookInternational(supabase, battlerId)
    const performCheck = await canPerform(supabase, battlerId)
    const performanceModifiers = await getStatePerformanceModifiers(supabase, battlerId)

    return NextResponse.json({
      battler_id: battlerId,
      battler_name: battlerName,
      life_state: lifeState,
      npcs: npcs,
      storylines: {
        completed: completedStorylines,
        blocked: blockedStorylines,
        available_sequels: availableSequels
      },
      capabilities: {
        can_book_international: internationalCheck,
        can_perform: performCheck
      },
      performance_modifiers: performanceModifiers
    })
  } catch (err) {
    console.error("State GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/dev/state
 *
 * Update battler state directly (for dev testing)
 * Body: { battler_id: string, updates: Partial<BattlerLifeState> }
 *
 * Or apply effects:
 * Body: { battler_id: string, effects: StateChangeEffect }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { battler_id, updates, effects } = body

    if (!battler_id) {
      return NextResponse.json({ error: "battler_id required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Apply effects (storyline-style changes)
    if (effects) {
      const result = await applyStateChanges(supabase, battler_id, effects as StateChangeEffect)
      return NextResponse.json({
        success: result.success,
        changes_applied: result.changes
      })
    }

    // Direct updates (dev override)
    if (updates) {
      const newState = await updateBattlerLifeState(supabase, battler_id, updates)

      if (!newState) {
        return NextResponse.json(
          { error: "Failed to update state" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        state: newState
      })
    }

    return NextResponse.json(
      { error: "Must provide either 'updates' or 'effects'" },
      { status: 400 }
    )
  } catch (err) {
    console.error("State POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/dev/state?battler_id=xxx
 *
 * Reset a battler's life state to defaults (for dev testing)
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const battlerId = url.searchParams.get('battler_id')

    if (!battlerId) {
      return NextResponse.json({ error: "battler_id required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Delete all NPCs
    await supabase
      .from('battler_npcs')
      .delete()
      .eq('battler_id', battlerId)

    // Delete all scheduled events
    await supabase
      .from('scheduled_life_events')
      .delete()
      .eq('battler_id', battlerId)

    // Delete all storyline completions
    await supabase
      .from('storyline_completions')
      .delete()
      .eq('battler_id', battlerId)

    // Reset life state to defaults
    const { error } = await supabase
      .from('battler_life_state')
      .update({
        // Legal - reset
        has_felony: false,
        felony_type: null,
        on_probation: false,
        probation_ends_at: null,
        has_pending_charges: false,
        pending_charges: [],
        passport_status: 'valid',
        can_travel_international: true,

        // Family - reset
        relationship_status: 'single',
        partner_id: null,
        partner_relationship_health: 5,
        has_children: false,
        children_count: 0,
        custody_status: null,
        mother_alive: true,
        father_alive: true,
        family_estranged: false,

        // Financial - reset
        in_debt: false,
        debt_amount: 0,
        debt_type: null,
        has_tax_issues: false,
        bankruptcy_filed: false,

        // Health - reset
        has_active_injury: false,
        injury_type: null,
        injury_severity: null,
        injury_heals_at: null,
        in_rehab: false,
        rehab_ends_at: null,
        has_chronic_condition: false,
        chronic_condition_type: null,

        // Street - reset
        gang_affiliated: false,
        gang_name: null,
        gang_rank: null,
        has_street_enemies: false,
        street_heat_level: 0,

        // Career - reset
        signed_to_label: false,
        label_name: null,
        contract_battles_remaining: null,
        contract_ends_at: null,
        has_manager: false,
        manager_id: null,
        has_ghostwriting_secret: false,
        league_banned_from: []
      })
      .eq('battler_id', battlerId)

    if (error) {
      console.error("Error resetting state:", error)
      return NextResponse.json({ error: "Failed to reset state" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Life state reset to defaults, all NPCs and storyline data deleted"
    })
  } catch (err) {
    console.error("State DELETE error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
