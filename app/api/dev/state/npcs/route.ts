import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import {
  getBattlerNPCs,
  getOrCreateNPC,
  updateNPC,
  setNPCStatus,
  NPCRelationshipType
} from "@/lib/game/battlerState"

/**
 * GET /api/dev/state/npcs?battler_id=xxx
 *
 * Get all NPCs for a battler
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const battlerId = url.searchParams.get('battler_id')
    const status = url.searchParams.get('status') // 'active', 'all', etc.

    if (!battlerId) {
      return NextResponse.json({ error: "battler_id required" }, { status: 400 })
    }

    const supabase = createServerClient()
    let npcs = await getBattlerNPCs(supabase, battlerId)

    // Filter by status if specified
    if (status && status !== 'all') {
      npcs = npcs.filter(n => n.status === status)
    }

    // Group by relationship category
    const grouped = {
      family: npcs.filter(n => ['mother', 'father', 'brother', 'sister', 'grandmother',
        'grandfather', 'aunt', 'uncle', 'cousin', 'child', 'son', 'daughter',
        'baby_mama', 'baby_daddy'].includes(n.relationship_type)),
      romantic: npcs.filter(n => ['girlfriend', 'boyfriend', 'wife', 'husband',
        'ex', 'fling', 'fiance'].includes(n.relationship_type)),
      professional: npcs.filter(n => ['manager', 'lawyer', 'accountant',
        'label_exec', 'agent', 'publicist'].includes(n.relationship_type)),
      street: npcs.filter(n => ['og', 'crew_member', 'plug', 'enemy',
        'rival', 'shooter'].includes(n.relationship_type)),
      other: npcs.filter(n => ['friend', 'mentor', 'protege',
        'roommate'].includes(n.relationship_type))
    }

    return NextResponse.json({
      npcs,
      grouped,
      total: npcs.length
    })
  } catch (err) {
    console.error("NPCs GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/dev/state/npcs
 *
 * Create or get an NPC
 * Body: {
 *   battler_id: string,
 *   relationship_type: NPCRelationshipType,
 *   storyline_code?: string,
 *   force_new?: boolean,
 *   name?: string,
 *   gender?: 'male' | 'female'
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      battler_id,
      relationship_type,
      storyline_code = 'DEV_CREATED',
      force_new = false,
      name,
      gender
    } = body

    if (!battler_id || !relationship_type) {
      return NextResponse.json(
        { error: "battler_id and relationship_type required" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const npc = await getOrCreateNPC(
      supabase,
      battler_id,
      relationship_type as NPCRelationshipType,
      storyline_code,
      { forceNew: force_new, name, gender }
    )

    if (!npc) {
      return NextResponse.json(
        { error: "Failed to create/get NPC" },
        { status: 500 }
      )
    }

    return NextResponse.json({ npc, created: !name }) // Rough indicator
  } catch (err) {
    console.error("NPCs POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PATCH /api/dev/state/npcs
 *
 * Update an NPC
 * Body: { npc_id: string, updates: Partial<BattlerNPC> }
 * Or change status: { npc_id: string, status: string, reason?: string }
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { npc_id, updates, status, reason } = body

    if (!npc_id) {
      return NextResponse.json({ error: "npc_id required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Status change
    if (status) {
      const success = await setNPCStatus(supabase, npc_id, status, reason)

      if (!success) {
        return NextResponse.json(
          { error: "Failed to update NPC status" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, new_status: status })
    }

    // General updates
    if (updates) {
      const npc = await updateNPC(supabase, npc_id, updates)

      if (!npc) {
        return NextResponse.json(
          { error: "Failed to update NPC" },
          { status: 500 }
        )
      }

      return NextResponse.json({ npc })
    }

    return NextResponse.json(
      { error: "Must provide 'updates' or 'status'" },
      { status: 400 }
    )
  } catch (err) {
    console.error("NPCs PATCH error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/dev/state/npcs?npc_id=xxx
 *
 * Delete an NPC (dev only)
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const npcId = url.searchParams.get('npc_id')

    if (!npcId) {
      return NextResponse.json({ error: "npc_id required" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('battler_npcs')
      .delete()
      .eq('id', npcId)

    if (error) {
      console.error("Error deleting NPC:", error)
      return NextResponse.json({ error: "Failed to delete NPC" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("NPCs DELETE error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
