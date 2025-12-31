import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

/**
 * GET /api/dev/storylines?battlerId=xxx
 *
 * Get active and completed storylines for a battler
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const battlerId = searchParams.get("battlerId")

    if (!battlerId) {
      return NextResponse.json({ error: "battlerId required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get active storylines
    const { data: active, error: activeError } = await supabase
      .from("active_storylines")
      .select(`
        *,
        storyline_templates (*)
      `)
      .eq("battler_id", battlerId)
      .eq("status", "active")
      .order("started_at", { ascending: false })

    if (activeError) {
      console.error("Error fetching active storylines:", activeError)
    }

    // Get completed storylines
    const { data: completed, error: completedError } = await supabase
      .from("active_storylines")
      .select(`
        *,
        storyline_templates (*)
      `)
      .eq("battler_id", battlerId)
      .in("status", ["completed", "abandoned"])
      .order("ended_at", { ascending: false })
      .limit(20)

    if (completedError) {
      console.error("Error fetching completed storylines:", completedError)
    }

    return NextResponse.json({
      active: active || [],
      completed: completed || [],
    })
  } catch (err) {
    console.error("Storylines fetch error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
