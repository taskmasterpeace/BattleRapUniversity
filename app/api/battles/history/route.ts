import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get player's battler
    const { data: playerBattler } = await supabase
      .from('battlers')
      .select('id')
      .eq('is_ai', false)
      .limit(1)
      .single()

    if (!playerBattler) {
      return NextResponse.json({ battles: [] })
    }

    // Get completed battles for this player
    const { data: battles, error } = await supabase
      .from('battles')
      .select(`
        id,
        scheduled_at,
        status,
        winner_battler_id,
        battler_player_id,
        battler_ai_id,
        verdict,
        decision_type,
        player_payout,
        opponent:battler_ai_id(
          id,
          stage_name,
          tier,
          avatar_url,
          style_tags
        ),
        league:league_id(
          id,
          name,
          short_code
        )
      `)
      .eq('battler_player_id', playerBattler.id)
      .eq('status', 'completed')
      .order('scheduled_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching battle history:', error)
      return NextResponse.json({ error: 'Failed to fetch battle history' }, { status: 500 })
    }

    // Get battle rounds for round-by-round results
    const battleIds = battles?.map(b => b.id) || []
    const { data: allRounds } = await supabase
      .from('battle_rounds')
      .select('battle_id, battler_id, round_index, average_score, peak_score, crowd_reaction')
      .in('battle_id', battleIds)
      .order('round_index', { ascending: true })

    // Get opponent rankings
    const opponentIds = battles?.map(b => b.opponent?.id).filter(Boolean) || []
    const { data: rankings } = await supabase
      .from('rankings')
      .select('battler_id, rating')
      .in('battler_id', opponentIds)

    // Map to expected format
    const history = battles?.map(battle => {
      const won = battle.winner_battler_id === playerBattler.id
      const opponent = battle.opponent as any
      const league = battle.league as any
      const oppRanking = rankings?.find(r => r.battler_id === opponent?.id)

      // Get rounds for this battle
      const battleRounds = allRounds?.filter(r => r.battle_id === battle.id) || []
      const playerRounds = battleRounds.filter(r => r.battler_id === playerBattler.id)
      const opponentRounds = battleRounds.filter(r => r.battler_id === opponent?.id)

      // Calculate round results (who won each round)
      const roundResults = [0, 1, 2].map(i => {
        const playerRound = playerRounds.find(r => r.round_index === i)
        const oppRound = opponentRounds.find(r => r.battler_id === opponent?.id && r.round_index === i)
        const playerScore = playerRound?.average_score ?? 0
        const oppScore = oppRound?.average_score ?? 0
        return playerScore > oppScore ? 'W' : playerScore < oppScore ? 'L' : 'D'
      })

      // Determine verdict (e.g., "2-1" or "3-0")
      const playerWins = roundResults.filter(r => r === 'W').length
      const oppWins = roundResults.filter(r => r === 'L').length
      const verdictStr = battle.verdict || `${Math.max(playerWins, oppWins)}-${Math.min(playerWins, oppWins)}`

      return {
        id: battle.id,
        opponent: {
          id: opponent?.id,
          name: opponent?.stage_name || 'Unknown',
          tier: opponent?.tier?.toUpperCase() + ' TIER' || 'MID TIER',
          avatar: opponent?.avatar_url || '/rapper-portrait-pixel-art.jpg',
          rating: oppRanking?.rating || 1000,
          styles: opponent?.style_tags || [],
        },
        league: league?.name?.toUpperCase() || 'LEAGUE',
        date: new Date(battle.scheduled_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        result: won ? 'W' : 'L',
        verdict: verdictStr,
        decisionType: battle.decision_type || (playerWins === 3 || oppWins === 3 ? 'body' : 'decision'),
        roundResults,
        payout: Number(battle.player_payout) || 0,
      }
    }) || []

    return NextResponse.json({ battles: history })
  } catch (err) {
    console.error('Battle history route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
