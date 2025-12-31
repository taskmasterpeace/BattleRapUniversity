import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import { simulateBattle } from "@/lib/game/simulation"
import { checkForViralMoments, applyViralMomentEffects, checkForGrudgeMatchOffer, createGrudgeMatchOffer } from "@/lib/game/viralMoments"

// POST /api/battles/[id]/lock-in - Lock prep plan and simulate battle
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params
    const supabase = createServerClient()

    // Get the battle
    const { data: battle, error: fetchError } = await supabase
      .from('battles')
      .select('status, lock_prep_at')
      .eq('id', battleId)
      .single()

    if (fetchError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    // Check battle status
    if (battle.status === 'completed') {
      return NextResponse.json({ error: 'Battle already completed' }, { status: 400 })
    }

    if (battle.status !== 'accepted') {
      return NextResponse.json({ error: 'Battle must be accepted first' }, { status: 400 })
    }

    // Update battle status to locked
    const { error: lockError } = await supabase
      .from('battles')
      .update({ status: 'locked', player_locked_in: true })
      .eq('id', battleId)

    if (lockError) {
      console.error('Error locking battle:', lockError)
      return NextResponse.json({ error: 'Failed to lock prep' }, { status: 500 })
    }

    // Run simulation
    const result = await simulateBattle(battleId, supabase)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: "Prep locked but simulation failed",
        battle_id: battleId,
        locked_at: new Date().toISOString(),
      }, { status: 500 })
    }

    // Get player and opponent IDs for viral moment processing
    const { data: battleData } = await supabase
      .from('battles')
      .select('player_battler_id, opponent_battler_id, league_id')
      .eq('id', battleId)
      .single()

    let viralMoments: any[] = []
    let grudgeMatchOffered = false

    if (battleData) {
      const { player_battler_id: playerId, opponent_battler_id: opponentId, league_id: leagueId } = battleData

      // Check for viral moments
      try {
        viralMoments = await checkForViralMoments(battleId, playerId, opponentId)

        if (viralMoments.length > 0) {
          // Apply viral moment effects (reputation, beef updates)
          await applyViralMomentEffects(battleId, playerId, opponentId, viralMoments)
        }

        // Check if beef is high enough for a grudge match offer
        const shouldOfferGrudge = await checkForGrudgeMatchOffer(playerId, opponentId)
        if (shouldOfferGrudge) {
          const grudgeMatchId = await createGrudgeMatchOffer(opponentId, playerId, leagueId)
          grudgeMatchOffered = !!grudgeMatchId
        }
      } catch (viralError) {
        console.error('Error processing viral moments:', viralError)
        // Don't fail the whole request for viral moment errors
      }
    }

    return NextResponse.json({
      success: true,
      message: "Battle simulated",
      battle_id: battleId,
      locked_at: new Date().toISOString(),
      winner_id: result.winnerId,
      player_rounds: result.playerRounds,
      ai_rounds: result.aiRounds,
      viral_moments: viralMoments.map(m => ({
        type: m.type,
        description: m.description,
        viral_score: m.viralScore,
      })),
      grudge_match_offered: grudgeMatchOffered,
    })
  } catch (err) {
    console.error('Lock-in error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
