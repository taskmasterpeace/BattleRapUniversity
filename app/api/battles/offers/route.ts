import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

// GET /api/battles/offers - Get available battle offers
export async function GET() {
  try {
    const supabase = createServerClient()

    // Get dev player's battler
    const { data: playerBattler } = await supabase
      .from('battlers')
      .select('id')
      .eq('is_ai', false)
      .limit(1)
      .single()

    if (!playerBattler) {
      return NextResponse.json({ offers: [] })
    }

    // Get offered battles for this player
    const { data: battles, error } = await supabase
      .from('battles')
      .select(`
        id,
        scheduled_at,
        lock_prep_at,
        created_at,
        player_payout,
        opponent:battler_ai_id(
          id,
          stage_name,
          tier,
          style_tags,
          avatar_url
        ),
        league:league_id(
          id,
          name,
          prestige_level
        )
      `)
      .eq('battler_player_id', playerBattler.id)
      .eq('status', 'offered')
      .order('scheduled_at', { ascending: true })

    if (error) {
      console.error('Error fetching offers:', error)
      return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 })
    }

    // Get opponent rankings for each battle
    const opponentIds = battles?.map(b => b.opponent?.id).filter(Boolean) || []
    const { data: rankings } = await supabase
      .from('rankings')
      .select('battler_id, rating, wins, losses')
      .in('battler_id', opponentIds)

    // Get opponent attributes for each battle
    const { data: attributes } = await supabase
      .from('battler_attributes')
      .select('battler_id, writing, performance, resilience')
      .in('battler_id', opponentIds)

    // Map to frontend BattleInfo format
    const offers = battles?.map(battle => {
      const oppRanking = rankings?.find(r => r.battler_id === battle.opponent?.id)
      const oppAttributes = attributes?.find(a => a.battler_id === battle.opponent?.id)
      const wins = oppRanking?.wins || 0
      const losses = oppRanking?.losses || 0

      // Calculate prep days (difference between scheduled_at and now)
      const scheduledDate = new Date(battle.scheduled_at)
      const lockDate = new Date(battle.lock_prep_at)
      const now = new Date()
      const prepDays = Math.max(1, Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

      // Format dates for display
      const battleDateStr = scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
      const lockDateStr = lockDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()

      // Map tier from prestige_level
      const tier = battle.opponent?.tier?.toUpperCase() + ' TIER' || 'MID TIER'

      // Base payout calculation
      const basePay = Number(battle.player_payout) || 500
      const winBonus = Math.round(basePay * 2) // Win bonus is 2x base

      // Calculate opponent's overall power levels from attributes
      const writingAttrs = oppAttributes?.writing || { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 }
      const perfAttrs = oppAttributes?.performance || { stagePresence: 5, crowdControl: 5, delivery: 5 }
      const writingAvg = Math.round(((writingAttrs.lyricism || 5) + (writingAttrs.wordplay || 5) + (writingAttrs.creativity || 5) + (writingAttrs.flow || 5)) / 4 * 10) / 10
      const performanceAvg = Math.round(((perfAttrs.stagePresence || 5) + (perfAttrs.crowdControl || 5) + (perfAttrs.delivery || 5)) / 3 * 10) / 10

      return {
        id: battle.id,
        opponent: {
          name: battle.opponent?.stage_name || 'Unknown',
          tier: tier,
          rating: oppRanking?.rating || 1000,
          avatar: battle.opponent?.avatar_url || "/rapper-portrait-pixel-art.jpg",
          styles: battle.opponent?.style_tags || [],
          record: `${wins}-${losses}`,
          // New: detailed attribute stats
          attributes: {
            writing: writingAvg,
            performance: performanceAvg,
            resilience: oppAttributes?.resilience || 5,
            // Individual stats for tooltip/detail view
            breakdown: {
              lyricism: writingAttrs.lyricism || 5,
              wordplay: writingAttrs.wordplay || 5,
              creativity: writingAttrs.creativity || 5,
              flow: writingAttrs.flow || 5,
              stagePresence: perfAttrs.stagePresence || 5,
              crowdControl: perfAttrs.crowdControl || 5,
              delivery: perfAttrs.delivery || 5,
            }
          }
        },
        league: battle.league?.name?.toUpperCase() || 'SMALL ROOM CIRCUIT',
        battleDate: battleDateStr,
        lockDate: lockDateStr,
        prepDays,
        status: 'offered' as const,
        payout: {
          basePay,
          winBonus,
        },
        isGrudgeMatch: false,
        grudgeIntensity: 0,
      }
    }) || []

    return NextResponse.json({ offers })
  } catch (err) {
    console.error('Offers API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
