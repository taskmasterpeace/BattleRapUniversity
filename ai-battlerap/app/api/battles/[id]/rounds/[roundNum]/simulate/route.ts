import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import type { ScoringContext } from '@/lib/models';

// Import the simulation module to access simulateRound
// We'll need to call the internal simulateRound logic
import { simulateSingleRound } from '@/lib/game/singleRoundSimulation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; roundNum: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: battleId, roundNum } = await params;
  const roundIndex = parseInt(roundNum, 10);
  const supabase = await createServerSupabaseClient();

  // Validate round number
  if (isNaN(roundIndex) || roundIndex < 1 || roundIndex > 3) {
    return NextResponse.json(
      { error: 'Invalid round number. Must be 1, 2, or 3.' },
      { status: 400 }
    );
  }

  // Get battle with full details
  const { data: battle, error: battleError } = await supabase
    .from('battles')
    .select(`
      *,
      player_battler:battlers!battles_battler_player_id_fkey(id, user_id, stage_name, style_tags),
      ai_battler:battlers!battles_battler_ai_id_fkey(id, stage_name, style_tags),
      league:leagues(*)
    `)
    .eq('id', battleId)
    .single();

  if (battleError || !battle) {
    return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
  }

  // Verify ownership
  if (battle.player_battler.user_id !== user.id) {
    return NextResponse.json({ error: 'Not your battle' }, { status: 403 });
  }

  // Verify battle is in correct state (content selected for this round)
  const expectedStatus = `awaiting_r${roundIndex}_content`;
  if (battle.status !== expectedStatus) {
    return NextResponse.json(
      { error: `Battle must have content selected for Round ${roundIndex}. Current status: ${battle.status}` },
      { status: 409 }
    );
  }

  // Verify both battlers have content selections for this round
  const { data: selections } = await supabase
    .from('round_content_selections')
    .select('*')
    .eq('battle_id', battleId)
    .eq('round_index', roundIndex);

  if (!selections || selections.length !== 2) {
    return NextResponse.json(
      { error: `Both battlers must have content selections for Round ${roundIndex}` },
      { status: 409 }
    );
  }

  // Simulate the round
  try {
    const result = await simulateSingleRound(
      supabase,
      battleId,
      roundIndex,
      battle.context as ScoringContext,
      battle.player_battler,
      battle.ai_battler
    );

    // Determine next status based on round
    let nextStatus: string;
    if (roundIndex === 1) {
      nextStatus = 'r1_simulated';
    } else if (roundIndex === 2) {
      nextStatus = 'r2_simulated';
    } else {
      nextStatus = 'r3_simulated';
    }

    // Update battle status
    await supabase
      .from('battles')
      .update({
        status: nextStatus,
        current_round_index: roundIndex,
      })
      .eq('id', battleId);

    // If Round 3 is complete, transition to awaiting next round or complete battle
    if (roundIndex === 3) {
      // Calculate overall winner
      const { data: allRounds } = await supabase
        .from('battle_rounds')
        .select('*')
        .eq('battle_id', battleId)
        .order('round_index');

      if (allRounds) {
        // Count rounds won by each battler
        const playerRoundsWon = allRounds.filter((r) => {
          const opponentRound = allRounds.find(
            (opp) => opp.round_index === r.round_index && opp.battler_id !== r.battler_id
          );
          return (
            r.battler_id === battle.battler_player_id &&
            opponentRound &&
            r.average_score > opponentRound.average_score
          );
        }).length;

        const aiRoundsWon = allRounds.filter((r) => {
          const opponentRound = allRounds.find(
            (opp) => opp.round_index === r.round_index && opp.battler_id !== r.battler_id
          );
          return (
            r.battler_id === battle.battler_ai_id &&
            opponentRound &&
            r.average_score > opponentRound.average_score
          );
        }).length;

        const winnerId = playerRoundsWon > aiRoundsWon ? battle.battler_player_id : battle.battler_ai_id;

        // Update battle as completed with winner
        await supabase
          .from('battles')
          .update({
            status: 'completed',
            winner_battler_id: winnerId,
          })
          .eq('id', battleId);

        return NextResponse.json({
          round: result.playerRound,
          segments: result.playerSegments,
          winner: winnerId === battle.battler_player_id ? 'player' : 'ai',
          message: `Round ${roundIndex} simulated. Battle complete!`,
        });
      }
    } else {
      // Transition to next round's content selection
      const nextRoundIndex = roundIndex + 1;
      await supabase
        .from('battles')
        .update({
          status: `awaiting_r${nextRoundIndex}_content`,
          current_round_index: nextRoundIndex,
        })
        .eq('id', battleId);
    }

    return NextResponse.json({
      round: result.playerRound,
      segments: result.playerSegments,
      message: `Round ${roundIndex} simulated successfully.`,
    });
  } catch (error) {
    console.error('Error simulating round:', error);
    return NextResponse.json(
      { error: 'Failed to simulate round' },
      { status: 500 }
    );
  }
}
