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

    // Get all tournaments
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select(`
        id,
        name,
        description,
        max_participants,
        tier_restriction,
        tournament_format,
        total_prize_pool,
        prize_distribution,
        status,
        registration_opens_at,
        registration_closes_at,
        tournament_starts_at,
        current_round,
        winner_battler_id,
        runner_up_battler_id,
        rules_text,
        judge_names,
        league:league_id(
          id,
          name,
          short_code
        ),
        winner:winner_battler_id(
          id,
          stage_name,
          avatar_url
        ),
        runner_up:runner_up_battler_id(
          id,
          stage_name,
          avatar_url
        )
      `)
      .order('tournament_starts_at', { ascending: false })

    if (error) {
      console.error('Error fetching tournaments:', error)
      return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 })
    }

    // Get participant counts for each tournament
    const tournamentIds = tournaments?.map(t => t.id) || []
    const { data: participants } = await supabase
      .from('tournament_participants')
      .select('tournament_id, battler_id, seed, eliminated')
      .in('tournament_id', tournamentIds)

    // Check if player is registered in any tournaments
    const playerRegistrations = participants?.filter(p => p.battler_id === playerBattler?.id) || []

    // Map to expected format
    const all = (tournaments || []).map(tournament => {
      const league = tournament.league as any
      const winner = tournament.winner as any
      const runnerUp = tournament.runner_up as any

      const tournamentParticipants = participants?.filter(p => p.tournament_id === tournament.id) || []
      const playerParticipation = playerRegistrations.find(p => p.tournament_id === tournament.id)

      // Format dates
      const startDate = tournament.tournament_starts_at
        ? new Date(tournament.tournament_starts_at)
        : null
      const regCloses = tournament.registration_closes_at
        ? new Date(tournament.registration_closes_at)
        : null

      let dates = ''
      if (startDate) {
        dates = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
        if (tournament.status === 'completed' && winner) {
          dates = 'COMPLETED'
        }
      }

      // Map status to frontend format
      const statusMap: Record<string, string> = {
        'registration': 'open',
        'active': 'in_progress',
        'bracket_set': 'in_progress',
        'completed': 'completed',
        'cancelled': 'cancelled',
      }

      return {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description || '',
        league: {
          name: league?.name || 'Unknown League',
          short_code: league?.short_code || 'UNK',
          logo_url: '/placeholder-logo.png',
        },
        max_participants: tournament.max_participants,
        total_prize_pool: Number(tournament.total_prize_pool) || 0,
        entry_fee: 0, // Entry fee could be added to schema if needed
        status: statusMap[tournament.status] || tournament.status,
        dates,
        format: tournament.tournament_format || 'Single Elimination',
        rules: tournament.rules_text || '3 Rounds',
        participantCount: tournamentParticipants.length,
        isUserRegistered: !!playerParticipation,
        userSeed: playerParticipation?.seed || null,
        currentRound: tournament.current_round || null,
        winner: winner ? {
          name: winner.stage_name,
          avatar: winner.avatar_url || '/rapper-pixel.jpg',
        } : null,
        recentWinners: winner ? [{
          name: winner.stage_name,
          avatar: winner.avatar_url || '/rapper-pixel.jpg',
        }] : [],
        userPlacement: playerParticipation?.eliminated ? 'Eliminated' : null,
      }
    })

    // Categorize tournaments
    const upcoming = all.filter(t => t.status === 'open' || t.status === 'upcoming')
    const active = all.filter(t => t.status === 'in_progress')
    const completed = all.filter(t => t.status === 'completed')

    return NextResponse.json({
      all,
      upcoming,
      active,
      completed,
    })
  } catch (err) {
    console.error('Tournaments route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
