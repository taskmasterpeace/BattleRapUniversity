import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { autoSelectContent } from '@/lib/game/roundContentSelection';
import { simulateBattle } from '@/lib/game/simulation';
import type { ScoringContext } from '@/lib/models';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: battleId } = await params;
  const supabase = await createServerSupabaseClient();

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

  // Verify status is 'locked' (prep phase complete)
  if (battle.status !== 'locked') {
    return NextResponse.json(
      { error: `Battle must be in 'locked' status. Current status: ${battle.status}` },
      { status: 409 }
    );
  }

  // Update battle based on mode choice
  if (lockedIn) {
    // Player chose "Locked In" mode - manual content selection
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
  } else {
    // Player chose "Auto" mode - full auto-simulation
    // Generate auto-selections for all 3 rounds for both battlers
    const roundSelections = [];

    for (let roundIndex = 1; roundIndex <= 3; roundIndex++) {
      // Auto-select for player
      const playerSelection = autoSelectContent(
        battle.player_battler.style_tags || [],
        battle.league.name,
        roundIndex
      );

      // Auto-select for AI
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

    // Insert all selections
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

    // Update battle to simulated status and set context
    const { error: updateError } = await supabase
      .from('battles')
      .update({
        player_locked_in: false,
        status: 'simulated',
        context,
      })
      .eq('id', battleId);

    if (updateError) {
      console.error('Error updating battle for auto mode:', updateError);
      return NextResponse.json(
        { error: 'Failed to update battle status' },
        { status: 500 }
      );
    }

    // Trigger full battle simulation
    try {
      await simulateBattle(battleId, supabase);

      // Fetch updated battle
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
}
