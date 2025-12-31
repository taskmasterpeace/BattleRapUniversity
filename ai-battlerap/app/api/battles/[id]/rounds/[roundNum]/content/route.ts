import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import {
  validateContentSelection,
  autoSelectContent,
  calculateEffectivenessForecast,
  type ContentSelection,
} from '@/lib/game/roundContentSelection';
import type { ScoringContext } from '@/lib/models';

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

  // Parse request body
  const body = await request.json();
  const { contentTypes, deliveryTypes, performanceTypes } = body as {
    contentTypes: string[];
    deliveryTypes: string[];
    performanceTypes: string[];
  };

  const playerSelection: ContentSelection = {
    contentTypes: contentTypes as any,
    deliveryTypes: deliveryTypes as any,
    performanceTypes: performanceTypes as any,
  };

  // Validate content selection
  const validation = validateContentSelection(playerSelection);
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'Invalid content selection', errors: validation.errors },
      { status: 400 }
    );
  }

  // Get battle with battler details
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

  // Verify battle is in correct state for this round
  const expectedStatus = `awaiting_r${roundIndex}_content`;
  if (battle.status !== expectedStatus) {
    return NextResponse.json(
      { error: `Battle must be in '${expectedStatus}' status. Current status: ${battle.status}` },
      { status: 409 }
    );
  }

  // Auto-generate AI opponent's content selection
  const aiSelection = autoSelectContent(
    battle.ai_battler.style_tags || [],
    battle.league.name,
    roundIndex
  );

  // Calculate effectiveness forecast
  const context = battle.context as ScoringContext;
  const forecast = calculateEffectivenessForecast(
    playerSelection,
    aiSelection,
    battle.league.name,
    context
  );

  // Check if selections already exist (prevent duplicates)
  const { data: existingSelections } = await supabase
    .from('round_content_selections')
    .select('id')
    .eq('battle_id', battleId)
    .eq('round_index', roundIndex);

  if (existingSelections && existingSelections.length > 0) {
    // Delete existing selections for this round
    await supabase
      .from('round_content_selections')
      .delete()
      .eq('battle_id', battleId)
      .eq('round_index', roundIndex);
  }

  // Save both selections to database
  const selectionsToInsert = [
    {
      battle_id: battleId,
      battler_id: battle.battler_player_id,
      round_index: roundIndex,
      content_types: playerSelection.contentTypes,
      delivery_types: playerSelection.deliveryTypes,
      performance_types: playerSelection.performanceTypes,
      auto_selected: false,
      effectiveness_multiplier: forecast.averageEffectiveness,
      crowd_preference_multiplier: forecast.crowdPreference,
      context_modifier: forecast.contextModifier,
    },
    {
      battle_id: battleId,
      battler_id: battle.battler_ai_id,
      round_index: roundIndex,
      content_types: aiSelection.contentTypes,
      delivery_types: aiSelection.deliveryTypes,
      performance_types: aiSelection.performanceTypes,
      auto_selected: true,
      // AI's forecast is calculated from their perspective
      effectiveness_multiplier: calculateEffectivenessForecast(
        aiSelection,
        playerSelection,
        battle.league.name,
        context
      ).averageEffectiveness,
      crowd_preference_multiplier: calculateEffectivenessForecast(
        aiSelection,
        playerSelection,
        battle.league.name,
        context
      ).crowdPreference,
      context_modifier: calculateEffectivenessForecast(
        aiSelection,
        playerSelection,
        battle.league.name,
        context
      ).contextModifier,
    },
  ];

  const { data: insertedSelections, error: insertError } = await supabase
    .from('round_content_selections')
    .insert(selectionsToInsert)
    .select();

  if (insertError) {
    console.error('Error saving content selections:', insertError);
    return NextResponse.json(
      { error: 'Failed to save content selections' },
      { status: 500 }
    );
  }

  // Return player's selection and forecast
  const playerInsertedSelection = insertedSelections.find(
    (s) => s.battler_id === battle.battler_player_id
  );

  return NextResponse.json({
    selection: playerInsertedSelection,
    forecast,
    message: `Content selection saved for Round ${roundIndex}. Ready to simulate.`,
  });
}
