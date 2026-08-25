import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { autoSelectContent } from '@/lib/game/roundContentSelection';
import { runBattleSimulation } from '@/lib/game/runBattle';
import type { ScoringContext } from '@/lib/models';

/**
 * POST /api/battles/[id]/lock-in
 *
 * AI-battle mode commitment. The player picks the battle environment and how
 * to fight it:
 *  - lockedIn: true  → "Locked In" — round-by-round content selection
 *  - lockedIn: false → "Auto"     — the full pipeline simulates instantly
 *
 * Accepts battles in 'accepted' OR 'locked' status: choosing a battle mode IS
 * the player's commitment, so an accepted battle transitions through 'locked'
 * here (previously nothing moved accepted → locked and this endpoint 409'd —
 * the interactive mode was unreachable).
 *
 * Uses the service role after ownership verification: the pipeline writes
 * round_content_selections rows for the AI opponent and simulation tables
 * that RLS scopes away from the player.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: battleId } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Parse request body
  const body = await request.json();
  const { lockedIn, context } = body as {
    lockedIn: boolean;
    context: ScoringContext;
  };

  // Validate context
  if (!context || !['in_building', 'ppv', 'on_cam'].includes(context)) {
    return NextResponse.json(
      { error: 'Invalid context. Must be one of: in_building, ppv, on_cam' },
      { status: 400 }
    );
  }

  // Get battle with player battler details
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

  // Verify status: accepted (player commits now, prep becomes final) or
  // locked (prep deadline already passed via cron).
  if (battle.status !== 'accepted' && battle.status !== 'locked') {
    return NextResponse.json(
      { error: `This battle can't be started right now (status: ${battle.status}).` },
      { status: 409 }
    );
  }

  if (battle.status === 'accepted') {
    const { error: lockError } = await supabase
      .from('battles')
      .update({ status: 'locked' })
      .eq('id', battleId)
      .eq('status', 'accepted'); // atomic guard against double-submits
    if (lockError) {
      console.error('Error locking prep:', lockError);
      return NextResponse.json({ error: 'Failed to lock prep' }, { status: 500 });
    }
  }

  // Update battle based on mode choice
  if (lockedIn) {
    // "Locked In" mode — manual content selection, round by round.
    const { data: updatedBattle, error: updateError } = await supabase
      .from('battles')
      .update({
        player_locked_in: true,
        status: 'awaiting_r1_content',
        current_round_index: 1,
        context,
      })
      .eq('id', battleId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating battle for locked-in mode:', updateError);
      return NextResponse.json(
        { error: 'Failed to update battle status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      battle: updatedBattle,
      message: 'Locked In mode activated. Select your content for Round 1.',
    });
  }

  // "Auto" mode — record auto-selections so the sim scores content, then run
  // the FULL battle pipeline (no-show handling, crew prep, life events,
  // progression, payouts, press, fresh offers) — identical career footprint
  // to the BATTLE TIME button.
  const roundSelections = [];
  for (let roundIndex = 1; roundIndex <= 3; roundIndex++) {
    const playerSelection = autoSelectContent(
      battle.player_battler.style_tags || [],
      battle.league.name,
      roundIndex
    );
    const aiSelection = autoSelectContent(
      battle.ai_battler.style_tags || [],
      battle.league.name,
      roundIndex
    );

    roundSelections.push(
      {
        battle_id: battleId,
        battler_id: battle.battler_player_id,
        round_index: roundIndex,
        content_types: playerSelection.contentTypes,
        delivery_types: playerSelection.deliveryTypes,
        performance_types: playerSelection.performanceTypes,
        auto_selected: true,
      },
      {
        battle_id: battleId,
        battler_id: battle.battler_ai_id,
        round_index: roundIndex,
        content_types: aiSelection.contentTypes,
        delivery_types: aiSelection.deliveryTypes,
        performance_types: aiSelection.performanceTypes,
        auto_selected: true,
      }
    );
  }

  const { error: selectionsError } = await supabase
    .from('round_content_selections')
    .insert(roundSelections);

  if (selectionsError) {
    console.error('Error inserting auto-selections:', selectionsError);
    return NextResponse.json(
      { error: 'Failed to generate auto-selections' },
      { status: 500 }
    );
  }

  await supabase
    .from('battles')
    .update({ player_locked_in: false, context })
    .eq('id', battleId);

  try {
    await runBattleSimulation(battle, supabase);

    const { data: completedBattle } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .single();

    return NextResponse.json({
      battle: completedBattle,
      message: 'Auto mode activated. Battle simulated successfully.',
    });
  } catch (error) {
    console.error('Error simulating battle:', error);
    return NextResponse.json(
      { error: 'Failed to simulate battle' },
      { status: 500 }
    );
  }
}
