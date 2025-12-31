import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Get player's battler
  const { data: battler } = await supabase
    .from('battlers')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!battler) {
    return NextResponse.json({ error: 'No battler found' }, { status: 404 });
  }

  // Get battle with full details
  const { data: battle } = await supabase
    .from('battles')
    .select(`
      *,
      league:leagues(*),
      player_battler:battler_player_id(id, stage_name, tier, avatar_url, sprite_set),
      ai_battler:battler_ai_id(id, stage_name, tier, avatar_url, sprite_set)
    `)
    .eq('id', id)
    .single();

  if (!battle) {
    return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
  }

  // Verify user is a participant
  if (battle.battler_player_id !== battler.id) {
    return NextResponse.json({ error: 'Not your battle' }, { status: 403 });
  }

  // Get rounds for both battlers
  const { data: rounds } = await supabase
    .from('battle_rounds')
    .select('*')
    .eq('battle_id', id)
    .order('round_index')
    .order('battler_id');

  // Get segments for both battlers
  const { data: segments } = await supabase
    .from('battle_segments')
    .select('*')
    .eq('battle_id', id)
    .order('round_index')
    .order('segment_index')
    .order('battler_id');

  // Get prep summary for both battlers
  const { data: prepBlocks } = await supabase
    .from('prep_blocks')
    .select('*')
    .eq('battle_id', id)
    .order('battler_id')
    .order('day_index');

  // Get battle views if battle is completed
  const { data: battleViews } = await supabase
    .from('battle_views')
    .select('*')
    .eq('battle_id', id)
    .single();

  // Get battler fan data for player
  const { data: playerFans } = await supabase
    .from('battler_fans')
    .select('*')
    .eq('battler_id', battle.battler_player_id)
    .single();

  // Get battle progression data for PostBattleSummary
  const { data: progression } = await supabase
    .from('battle_progression')
    .select('*')
    .eq('battle_id', id)
    .eq('battler_id', battler.id)
    .single();

  // Get judge scores for tournament battles
  const { data: judgeScores } = await supabase
    .from('battle_judge_scores')
    .select('*')
    .eq('battle_id', id)
    .order('judge_name');

  // Get player attributes (for analysis)
  const { data: playerAttributes } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', battle.battler_player_id)
    .single();

  // Get opponent attributes (for analysis)
  const { data: opponentAttributes } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', battle.battler_ai_id)
    .single();

  // Check for pending life events triggered by this battle
  const { data: pendingEvents } = await supabase
    .from('battler_life_events')
    .select(`
      *,
      template:life_event_templates!battler_life_events_template_code_fkey(*)
    `)
    .eq('battler_id', battler.id)
    .eq('battle_id', id)
    .eq('status', 'pending')
    .order('triggered_at', { ascending: false });

  return NextResponse.json({
    battle,
    rounds: rounds || [],
    segments: segments || [],
    prepBlocks: prepBlocks || [],
    battleViews: battleViews || null,
    playerFans: playerFans || null,
    progression: progression || null,
    judgeScores: judgeScores || [],
    playerAttributes: playerAttributes || null,
    opponentAttributes: opponentAttributes || null,
    pendingEvents: pendingEvents || [],
  });
}
