import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Helper to get dev user's battler
async function getDevBattler() {
  const { data: battler } = await supabase
    .from('battlers')
    .select('id')
    .eq('is_player_controlled', true)
    .single()

  return battler
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { response } = body
    const callOutId = params.id

    const devBattler = await getDevBattler()
    if (!devBattler) {
      return NextResponse.json({ error: 'No active battler' }, { status: 404 })
    }

    // Validate response type
    if (!['accept', 'counter', 'ignore'].includes(response)) {
      return NextResponse.json({ error: 'Invalid response type' }, { status: 400 })
    }

    // Get the call-out
    const { data: callOut, error: fetchError } = await supabase
      .from('call_outs')
      .select('*')
      .eq('id', callOutId)
      .single()

    if (fetchError || !callOut) {
      return NextResponse.json({ error: 'Call-out not found' }, { status: 404 })
    }

    // Verify this call-out is targeting the user
    if (callOut.target_battler_id !== devBattler.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if already responded
    if (callOut.status !== 'pending') {
      return NextResponse.json({ error: 'Call-out already responded to' }, { status: 400 })
    }

    // Update call-out status
    const newStatus = response === 'accept' ? 'accepted' : response === 'counter' ? 'countered' : 'ignored'
    const { error: updateError } = await supabase
      .from('call_outs')
      .update({
        status: newStatus,
        responded_at: new Date().toISOString(),
      })
      .eq('id', callOutId)

    if (updateError) {
      console.error('Error updating call-out:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // If accepted, create a battle
    if (response === 'accept') {
      // Get league info
      const { data: league } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', callOut.league_id)
        .single()

      if (league) {
        // Schedule battle for 7 days from now
        const battleDate = new Date()
        battleDate.setDate(battleDate.getDate() + 7)

        // Determine which battler is the player
        const isPlayerCaller = callOut.caller_battler_id === devBattler.id

        // Create battle with correct schema
        const { data: battle, error: battleError } = await supabase
          .from('battles')
          .insert({
            battler_player_id: isPlayerCaller ? callOut.caller_battler_id : callOut.target_battler_id,
            battler_ai_id: isPlayerCaller ? callOut.target_battler_id : callOut.caller_battler_id,
            league_id: callOut.league_id,
            status: 'accepted',
            scheduled_at: battleDate.toISOString(),
            lock_prep_at: new Date(battleDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days before battle
            player_payout: (callOut.stake_amount || 0) * 2, // Double the stake
          })
          .select()
          .single()

        if (!battleError && battle) {
          // Link battle to call-out
          await supabase
            .from('call_outs')
            .update({ battle_id: battle.id })
            .eq('id', callOutId)
        }
      }
    }

    // Track ignore count if ignored
    if (response === 'ignore') {
      // Count total ignored call-outs for this battler
      const { data: ignoredCallOuts } = await supabase
        .from('call_outs')
        .select('id')
        .eq('target_battler_id', devBattler.id)
        .eq('status', 'ignored')

      const ignoredCount = (ignoredCallOuts || []).length

      // If they've ignored 3+ call-outs, they should get the "Ducking" badge
      // This would be handled by a separate badge system
      if (ignoredCount >= 3) {
        console.log(`Battler ${devBattler.id} has ignored ${ignoredCount} call-outs - should earn "Ducking" badge`)
        // TODO: Trigger badge system to award "Ducking" badge
      }
    }

    return NextResponse.json({ success: true, response: newStatus })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
