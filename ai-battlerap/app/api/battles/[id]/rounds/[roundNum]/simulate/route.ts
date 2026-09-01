import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import type { ScoringContext } from '@/lib/models';

import { simulateSingleRound } from '@/lib/game/singleRoundSimulation';
import { finalizeInteractiveBattle } from '@/lib/game/finalizeInteractiveBattle';
import {
  aiPressureChoice,
  aiBumpResponse,
  resolveTalkOver,
  resolveBump,
  logPressureDecision,
} from '@/lib/game/pressureMoves';
import { SIMULATION_CONFIG } from '@/lib/game/config';

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
      player_battler:battlers!battles_battler_player_id_fkey(id, user_id, stage_name, style_tags, identity),
      ai_battler:battlers!battles_battler_ai_id_fkey(id, stage_name, style_tags, identity),
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

  // PRESSURE MOVES — the physical chess match before the bars start.
  let pressureMove: 'none' | 'talk_over' | 'bump' = 'none';
  let bumpResponse: 'laugh_off' | 'bump_back' | 'swing' | undefined;
  let audible: 'rebuttals' | 'freestyles' | undefined;
  try {
    const body = await request.json();
    if (body?.pressureMove === 'talk_over' || body?.pressureMove === 'bump') pressureMove = body.pressureMove;
    if (['laugh_off', 'bump_back', 'swing'].includes(body?.bumpResponse)) bumpResponse = body.bumpResponse;
    if (body?.audible === 'rebuttals' || body?.audible === 'freestyles') audible = body.audible;
  } catch {
    // no body — defaults hold
  }

  // THE AUDIBLE — adaptive content can't be pre-written (a rebuttal answers
  // what was just said), so the player may flip ONE written content slot to
  // rebuttals/freestyles in the moment, right before performing the round.
  if (audible) {
    const mine = selections.find((s: any) => s.battler_id === battle.battler_player_id);
    if (mine && Array.isArray(mine.content_types) && !mine.content_types.includes(audible)) {
      const swapped = [...mine.content_types.slice(0, -1), audible];
      const { error: audibleError } = await supabase
        .from('round_content_selections')
        .update({ content_types: swapped })
        .eq('id', mine.id);
      if (audibleError) {
        console.error('Audible swap failed:', audibleError);
      } else {
        mine.content_types = swapped;
      }
    }
  }

  // AI intent is decided ONCE per round and persisted, so the interrupt
  // round-trip (client asks the player how to answer a bump) can't reroll it.
  const { data: intentRow } = await supabase
    .from('battle_decisions')
    .select('decision_label')
    .eq('battle_id', battleId)
    .eq('battler_id', battle.battler_ai_id)
    .eq('round_number', roundIndex)
    .eq('decision_type', 'pressure_intent')
    .maybeSingle();

  let aiMove: 'none' | 'talk_over' | 'bump';
  if (intentRow) {
    aiMove = intentRow.decision_label as typeof aiMove;
  } else {
    const { data: prevRounds } = await supabase
      .from('battle_rounds')
      .select('battler_id, won')
      .eq('battle_id', battleId);
    const aiWins = (prevRounds ?? []).filter((r: any) => r.battler_id === battle.battler_ai_id && r.won).length;
    const playerWins = (prevRounds ?? []).filter((r: any) => r.battler_id === battle.battler_player_id && r.won).length;
    aiMove = aiPressureChoice(battle.ai_battler, roundIndex, aiWins < playerWins);
    const { error: intentErr } = await supabase.from('battle_decisions').insert({
      battle_id: battleId,
      battler_id: battle.battler_ai_id,
      round_number: roundIndex,
      segment_number: 0,
      decision_type: 'pressure_intent',
      decision_label: aiMove,
      success_roll: 0,
      success_threshold: 0,
      was_successful: true,
      effects_applied: {},
    });
    if (intentErr) console.error('pressure_intent insert failed:', intentErr.message);
  }

  // AI walked through the player's space — the player has to answer first.
  if (aiMove === 'bump' && !bumpResponse) {
    return NextResponse.json({ needsResponse: true, aiMove: 'bump' });
  }

  // Resolve both sides' moves into round modifiers.
  const { data: attrRows } = await supabase
    .from('battler_attributes')
    .select('battler_id, resilience')
    .in('battler_id', [battle.battler_player_id, battle.battler_ai_id]);
  const resilienceOf = (bid: string) =>
    Number((attrRows ?? []).find((a: any) => a.battler_id === bid)?.resilience ?? 5);

  const pressure = {
    playerStumbleDelta: 0,
    aiStumbleDelta: 0,
    playerStressDelta: 0,
    aiStressDelta: 0,
    playerCrowdDelta: 0,
    aiCrowdDelta: 0,
  };
  let fightBroke: 'player' | 'ai' | null = null;
  const pressureEvents: Array<{ by: 'player' | 'ai'; move: string; outcome: string }> = [];

  const applyEffects = (actor: 'player' | 'ai', fx: ReturnType<typeof resolveTalkOver>) => {
    const target = actor === 'player' ? 'ai' : 'player';
    pressure[`${target}StumbleDelta`] += fx.targetStumbleDelta;
    pressure[`${target}StressDelta`] += fx.targetStressDelta;
    pressure[`${actor}StressDelta`] += fx.actorStressDelta;
    pressure[`${actor}CrowdDelta`] -= fx.actorCrowdPenalty;
    pressure.playerCrowdDelta += fx.roomHeat;
    pressure.aiCrowdDelta += fx.roomHeat;
  };

  // Player's move
  if (pressureMove === 'talk_over') {
    const fx = resolveTalkOver(resilienceOf(battle.battler_ai_id));
    applyEffects('player', fx);
    pressureEvents.push({ by: 'player', move: 'talk_over', outcome: fx.narrative });
    await logPressureDecision(supabase, battleId, battle.battler_player_id, roundIndex, `talk_over:${fx.narrative}`, fx);
  } else if (pressureMove === 'bump') {
    const aiResp = aiBumpResponse(battle.ai_battler);
    const fx = resolveBump(aiResp);
    if (fx.fightBroke) {
      fightBroke = 'ai'; // the AI answered a bump with hands
    } else {
      applyEffects('player', fx);
    }
    pressureEvents.push({ by: 'player', move: 'bump', outcome: fx.narrative });
    await logPressureDecision(supabase, battleId, battle.battler_player_id, roundIndex, `bump:${fx.narrative}`, fx);
  }

  // AI's move
  if (!fightBroke && aiMove === 'talk_over') {
    const fx = resolveTalkOver(resilienceOf(battle.battler_player_id));
    applyEffects('ai', fx);
    pressureEvents.push({ by: 'ai', move: 'talk_over', outcome: fx.narrative });
    await logPressureDecision(supabase, battleId, battle.battler_ai_id, roundIndex, `talk_over:${fx.narrative}`, fx);
  } else if (!fightBroke && aiMove === 'bump' && bumpResponse) {
    const fx = resolveBump(bumpResponse);
    if (fx.fightBroke) {
      fightBroke = 'player'; // the player answered a bump with hands
    } else {
      applyEffects('ai', fx);
    }
    pressureEvents.push({ by: 'ai', move: 'bump', outcome: fx.narrative });
    await logPressureDecision(supabase, battleId, battle.battler_ai_id, roundIndex, `bump:${fx.narrative}`, fx);
  }

  // IT GOT PHYSICAL — battle voided on the spot. The swinger's rep craters;
  // leagues stop calling people who turn card nights into brawls.
  if (fightBroke) {
    const swingerId = fightBroke === 'player' ? battle.battler_player_id : battle.battler_ai_id;
    const { data: swingerAttrs } = await supabase
      .from('battler_attributes')
      .select('personal')
      .eq('battler_id', swingerId)
      .single();
    const personal = swingerAttrs?.personal ?? {};
    personal.reputation = Math.max(
      1,
      Number(personal.reputation ?? 5) - SIMULATION_CONFIG.PRESSURE_SWING_REPUTATION_HIT
    );
    await supabase.from('battler_attributes').update({ personal }).eq('battler_id', swingerId);
    const { error: voidErr } = await supabase
      .from('battles')
      .update({ status: 'completed', winner_battler_id: null, verdict: 'no_contest' })
      .eq('id', battleId);
    if (voidErr) console.error('no-contest battle void failed:', voidErr.message);
    await logPressureDecision(
      supabase,
      battleId,
      swingerId,
      roundIndex,
      'swing:fight_broke',
      { ...resolveBump('swing'), narrative: 'swung' }
    );
    return NextResponse.json({
      fightBroke: true,
      swungBy: fightBroke,
      message: 'The battle is OVER — it got physical. No contest.',
    });
  }

  // Simulate the round
  try {
    const result = await simulateSingleRound(
      supabase,
      battleId,
      roundIndex,
      battle.context as ScoringContext,
      battle.player_battler,
      battle.ai_battler,
      pressure
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
