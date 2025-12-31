import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

/**
 * DELETE /api/dev/storylines/[id]
 *
 * Delete an active storyline (for dev testing)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Storyline ID required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // First delete any associated life events
    await supabase
      .from("battler_life_events")
      .delete()
      .eq("storyline_id", id)

    // Delete any prep day impacts
    await supabase
      .from("prep_day_impacts")
      .delete()
      .eq("storyline_id", id)

    // Delete the storyline
    const { error } = await supabase
      .from("active_storylines")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting storyline:", error)
      return NextResponse.json({ error: "Failed to delete storyline" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete storyline error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET /api/dev/storylines/[id]
 *
 * Get details of a specific storyline
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Storyline ID required" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: storyline, error } = await supabase
      .from("active_storylines")
      .select(`
        *,
        storyline_templates (*),
        battlers (id, name)
      `)
      .eq("id", id)
      .single()

    if (error || !storyline) {
      return NextResponse.json({ error: "Storyline not found" }, { status: 404 })
    }

    // Get associated life events
    const { data: events } = await supabase
      .from("battler_life_events")
      .select("*")
      .eq("storyline_id", id)
      .order("created_at", { ascending: true })

    return NextResponse.json({
      storyline,
      events: events || []
    })
  } catch (err) {
    console.error("Get storyline error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
