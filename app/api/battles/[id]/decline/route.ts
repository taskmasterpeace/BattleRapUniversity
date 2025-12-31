import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import { requireBattleOwnership } from "@/lib/auth/helpers"

// POST /api/battles/[id]/decline - Decline a battle offer
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
        error: 'Battle offer not found or already accepted/declined'
      }, { status: 404 })
    }

    // Update battle status to cancelled (atomic check-and-set to prevent race conditions)
    const { data: updatedBattle, error: updateError } = await supabase
      .from('battles')
      .update({
        status: 'cancelled',
      })
      .eq('id', battleId)
      .eq('status', 'offered')  // Atomic: only update if still offered
      .select()
      .single()

    if (updateError || !updatedBattle) {
      console.error('Error declining battle:', updateError)
      return NextResponse.json({
        error: 'Battle already declined or no longer available'
      }, { status: 409 })
    }

    return NextResponse.json({
      success: true,
    })
  } catch (err) {
    console.error('Decline battle error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
