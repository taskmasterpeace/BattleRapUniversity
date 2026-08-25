import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import type { ScoringContext } from '@/lib/models';

import { simulateSingleRound } from '@/lib/game/singleRoundSimulation';
import { finalizeInteractiveBattle } from '@/lib/game/finalizeInteractiveBattle';

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
  // Service role: the round simulation writes rounds/segments for BOTH
  // battlers. Ownership is verified below.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

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

    // If Round 3 is complete, settle the battle with the full career pipeline:
    // per-round winners, verdict, payouts, ELO, press, progression, offers —
    // identical consequences to an auto-simulated battle.
    if (roundIndex === 3) {
      const finalResult = await finalizeInteractiveBattle(supabase, battleId);

      return NextResponse.json({
        round: result.playerRound,
        segments: result.playerSegments,
        winner: finalResult.winnerId === battle.battler_player_id ? 'player' : 'ai',
        verdict: finalResult.verdict,
        decisionType: finalResult.decisionType,
        message: `Round ${roundIndex} simulated. Battle complete!`,
      });
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
