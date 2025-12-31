import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import {
  getDueScheduledEvents,
  getPendingScheduledEvents,
  triggerScheduledEvent,
  cancelScheduledEvent
} from "@/lib/game/battlerState"

/**
 * GET /api/dev/state/scheduled-events?battler_id=xxx
 *
 * Get all scheduled events for a battler, or get due events if check_due=true
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const battlerId = url.searchParams.get('battler_id')
    const checkDue = url.searchParams.get('check_due') === 'true'

    if (!battlerId) {
      return NextResponse.json({ error: "battler_id required" }, { status: 400 })
    }

    const supabase = createServerClient()

    if (checkDue) {
      const dueEvents = await getDueScheduledEvents(supabase, battlerId)
      return NextResponse.json({
        due_events: dueEvents,
        count: dueEvents.length
      })
    }

    const pendingEvents = await getPendingScheduledEvents(supabase, battlerId)
    return NextResponse.json({
      pending_events: pendingEvents,
      count: pendingEvents.length
    })
  } catch (err) {
    console.error("Scheduled events GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/dev/state/scheduled-events
 *
 * Trigger or cancel a scheduled event
 * Body: { action: 'trigger' | 'cancel', event_id: string, reason?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, event_id, reason, resulting_storyline_code } = body

    if (!action || !event_id) {
      return NextResponse.json(
        { error: "action and event_id required" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    if (action === 'trigger') {
      const success = await triggerScheduledEvent(
        supabase,
        event_id,
        resulting_storyline_code
      )

      if (!success) {
        return NextResponse.json(
          { error: "Failed to trigger event" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, action: 'triggered' })
    }

    if (action === 'cancel') {
      const success = await cancelScheduledEvent(supabase, event_id, reason)

      if (!success) {
        return NextResponse.json(
          { error: "Failed to cancel event (may not be cancellable)" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, action: 'cancelled' })
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'trigger' or 'cancel'" },
      { status: 400 }
    )
  } catch (err) {
    console.error("Scheduled events POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
