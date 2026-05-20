/**
 * Tournament History API
 * GET /api/tournaments/history
 * Returns paginated tournament history and overall stats for the current player
 */

import { createServerSupabaseClient } from '@/lib/db/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get player's battler (battlers.user_id, not profiles.battler_id)
    const { data: battler } = await supabase
      .from('battlers')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_ai', false)
      .maybeSingle();

    if (!battler?.id) {
      return NextResponse.json({ error: 'Battler not found' }, { status: 404 });
    }

    const battlerId = battler.id;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build query for tournaments
    let tournamentsQuery = supabase
      .from('tournament_participants')
      .select(`
        id,
        tournament_id,
        seed_number,
        final_placement,
        eliminated_in_round,
        prize_amount,
        registered_at,
        tournaments!inner (
          id,
          name,
          league_id,
          status,
          total_prize_pool,
          created_at,
          tournament_starts_at,
          winner_battler_id,
          runner_up_battler_id,
          leagues!inner (
            id,
            name
          )
        )
      `)
      .eq('battler_id', battlerId)
      .eq('is_active', true);

    // Filter by status
    if (status === 'completed') {
      tournamentsQuery = tournamentsQuery.eq('tournaments.status', 'completed');
    } else if (status === 'active') {
      tournamentsQuery = tournamentsQuery.eq('tournaments.status', 'in_progress');
    } else if (status === 'upcoming') {
      tournamentsQuery = tournamentsQuery.in('tournaments.status', ['registration', 'seeding']);
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('tournament_participants')
      .select('*', { count: 'exact', head: true })
      .eq('battler_id', battlerId)
      .eq('is_active', true);

    // Get paginated results
    const { data: tournaments, error: tournamentsError } = await tournamentsQuery
      .order('created_at', { referencedTable: 'tournaments', ascending: false })
      .range(offset, offset + limit - 1);

    if (tournamentsError) {
      console.error('Error fetching tournaments:', tournamentsError);
      return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
    }

    // Get wins and losses for each tournament
    const tournamentsWithStats = await Promise.all(
      (tournaments || []).map(async (participant) => {
        const tournament = participant.tournaments as any;

        // Get battle results for this tournament
        const { data: brackets } = await supabase
          .from('tournament_brackets')
          .select('winner_battler_id, loser_battler_id, status')
          .eq('tournament_id', tournament.id)
          .or(`battler_1_id.eq.${battlerId},battler_2_id.eq.${battlerId}`)
          .eq('status', 'completed');

        const battlesWon = brackets?.filter(b => b.winner_battler_id === battlerId).length || 0;
        const battlesLost = brackets?.filter(b => b.loser_battler_id === battlerId).length || 0;

        return {
          id: tournament.id,
          name: tournament.name,
          league: tournament.leagues.name,
          league_id: tournament.league_id,
          status: tournament.status,
          seed_number: participant.seed_number,
          final_placement: participant.final_placement,
          eliminated_in_round: participant.eliminated_in_round,
          prize_amount: participant.prize_amount,
          battles_won: battlesWon,
          battles_lost: battlesLost,
          total_prize_pool: tournament.total_prize_pool,
          registered_at: participant.registered_at,
          tournament_starts_at: tournament.tournament_starts_at,
          is_winner: tournament.winner_battler_id === battlerId,
          is_runner_up: tournament.runner_up_battler_id === battlerId,
        };
      })
    );

    // Calculate overall stats
    const completedTournaments = tournamentsWithStats.filter(t => t.status === 'completed');

    const championships = completedTournaments.filter(t => t.final_placement === 'winner').length;
    const runnerUps = completedTournaments.filter(t => t.final_placement === 'runner_up').length;
    const top4Finishes = completedTournaments.filter(t =>
      ['semifinalist', 'quarterfinalist'].includes(t.final_placement || '')
    ).length;

    const totalPrizeEarned = completedTournaments.reduce((sum, t) => sum + (parseFloat(t.prize_amount as any) || 0), 0);

    const totalBattlesWon = completedTournaments.reduce((sum, t) => sum + t.battles_won, 0);
    const totalBattlesLost = completedTournaments.reduce((sum, t) => sum + t.battles_lost, 0);
    const totalBattles = totalBattlesWon + totalBattlesLost;
    const winRate = totalBattles > 0 ? (totalBattlesWon / totalBattles) * 100 : 0;

    const stats = {
      totalTournaments: completedTournaments.length,
      championships,
      runnerUps,
      top4Finishes,
      totalPrizeEarned: totalPrizeEarned.toFixed(2),
      winRate: winRate.toFixed(1),
      totalBattlesWon,
      totalBattlesLost,
    };

    const pagination = {
      page,
      limit,
      total: totalCount || 0,
      hasMore: ((totalCount || 0) > offset + limit),
    };

    return NextResponse.json({
      tournaments: tournamentsWithStats,
      stats,
      pagination,
    });

  } catch (error) {
    console.error('Tournament history API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
