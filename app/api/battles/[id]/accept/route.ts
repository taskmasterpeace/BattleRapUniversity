import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import { requireBattleOwnership } from "@/lib/auth/helpers"

// POST /api/battles/[id]/accept - Accept a battle offer
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params

    // SECURITY: Verify user owns this battle
    const authResult = await requireBattleOwnership(battleId)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const supabase = createServerClient()

    // Get the battle offer
    const { data: battle, error: fetchError } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .eq('status', 'offered')
      .single()

    if (fetchError || !battle) {
      return NextResponse.json({
        error: 'Battle offer not found or already accepted'
      }, { status: 404 })
    }

    // Check if offer has expired (2 days after creation)
    const expiresAt = new Date(battle.created_at)
    expiresAt.setDate(expiresAt.getDate() + 2)
    if (new Date() > expiresAt) {
      return NextResponse.json({
        error: 'Battle offer has expired'
      }, { status: 400 })
    }

    // Update battle status to accepted (atomic check-and-set to prevent race conditions)
    const { data: updatedBattle, error: updateError } = await supabase
      .from('battles')
      .update({
        status: 'accepted',
      })
      .eq('id', battleId)
      .eq('status', 'offered')  // Atomic: only update if still offered
      .select()
      .single()

    if (updateError || !updatedBattle) {
      console.error('Error accepting battle:', updateError)
      return NextResponse.json({
        error: 'Battle already accepted or no longer available'
      }, { status: 409 })
    }

    return NextResponse.json({
      success: true,
      battle: {
        id: updatedBattle.id,
        status: updatedBattle.status,
        prepStartsAt: updatedBattle.created_at,
        prepLocksAt: updatedBattle.lock_prep_at,
        scheduledAt: updatedBattle.scheduled_at,
      },
    })
  } catch (err) {
    console.error('Accept battle error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
