/**
 * Tournament Player Stats API
 * GET /api/tournaments/[id]/player-stats
 * Returns detailed stats for a player in a specific tournament
 */

import { createServerSupabaseClient } from '@/lib/db/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;
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

    // Get tournament participant info
    const { data: participant, error: participantError } = await supabase
      .from('tournament_participants')
      .select(`
        id,
        seed_number,
        final_placement,
        eliminated_in_round,
        prize_amount,
        tournaments!inner (
          id,
          name,
          status,
          winner_battler_id,
          runner_up_battler_id
        )
      `)
      .eq('tournament_id', tournamentId)
      .eq('battler_id', battlerId)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Not a participant in this tournament' }, { status: 404 });
    }

    const tournament = participant.tournaments as any;

    // Get all battle results for this player in the tournament
    const { data: brackets, error: bracketsError } = await supabase
      .from('tournament_brackets')
      .select(`
        id,
        round,
        match_number,
        battler_1_id,
        battler_2_id,
        seed_1,
        seed_2,
        winner_battler_id,
        loser_battler_id,
        status,
        battle_id,
        battles (
          id,
          verdict,
          battler_player_id,
          battler_ai_id,
          winner_battler_id,
          battle_rounds (
            round_number,
            player_average_score,
            player_peak_score,
            ai_average_score,
            ai_peak_score
          )
        )
      `)
      .eq('tournament_id', tournamentId)
      .or(`battler_1_id.eq.${battlerId},battler_2_id.eq.${battlerId}`)
      .order('round', { ascending: true })
      .order('match_number', { ascending: true });

    if (bracketsError) {
      console.error('Error fetching brackets:', bracketsError);
      return NextResponse.json({ error: 'Failed to fetch battle history' }, { status: 500 });
    }

    // Build battle timeline
    const timeline = (brackets || []).map(bracket => {
      const isPlayer1 = bracket.battler_1_id === battlerId;
      const opponentId = isPlayer1 ? bracket.battler_2_id : bracket.battler_1_id;
      const opponentSeed = isPlayer1 ? bracket.seed_2 : bracket.seed_1;
      const won = bracket.winner_battler_id === battlerId;
      const battle = bracket.battles as any;

      let haymakers = 0;
      let averageScore = 0;

      if (battle?.battle_rounds && battle.battle_rounds.length > 0) {
        const isPlayerBattler = battle.battler_player_id === battlerId;

        battle.battle_rounds.forEach((round: any) => {
          const peakScore = isPlayerBattler ? round.player_peak_score : round.ai_peak_score;
          const avgScore = isPlayerBattler ? round.player_average_score : round.ai_average_score;

          if (peakScore >= 8.5) haymakers++;
          averageScore += avgScore;
        });

        averageScore = averageScore / battle.battle_rounds.length;
      }

      return {
        round: bracket.round,
        matchNumber: bracket.match_number,
        opponentId,
        opponentSeed,
        won,
        status: bracket.status,
        battleId: bracket.battle_id,
        verdict: battle?.verdict || null,
        haymakers,
        averageScore: averageScore > 0 ? averageScore.toFixed(2) : null,
      };
    });

    // Calculate stats
    const completedBattles = timeline.filter(b => b.status === 'completed');
    const battlesWon = completedBattles.filter(b => b.won).length;
    const battlesLost = completedBattles.filter(b => !b.won).length;
    const totalHaymakers = completedBattles.reduce((sum, b) => sum + b.haymakers, 0);

    const avgScores = completedBattles
      .map(b => parseFloat(b.averageScore || '0'))
      .filter(s => s > 0);
    const overallAvgScore = avgScores.length > 0
      ? (avgScores.reduce((sum, s) => sum + s, 0) / avgScores.length).toFixed(2)
      : '0.00';

    return NextResponse.json({
      tournamentId,
      tournamentName: tournament.name,
      tournamentStatus: tournament.status,
      placement: participant.final_placement,
      seedNumber: participant.seed_number,
      eliminatedInRound: participant.eliminated_in_round,
      prizeEarned: participant.prize_amount,
      isWinner: tournament.winner_battler_id === battlerId,
      isRunnerUp: tournament.runner_up_battler_id === battlerId,
      battles: timeline,
      stats: {
        battlesWon,
        battlesLost,
        totalBattles: battlesWon + battlesLost,
        totalHaymakers,
        overallAvgScore,
      },
    });

  } catch (error) {
    console.error('Tournament player stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
