import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import type { BattleRound, BattleSegment, RoundContentSelection } from '@/lib/models';

export async function GET(
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

  // Get battle with player battler details
  const { data: battle, error: battleError } = await supabase
    .from('battles')
    .select(`
      *,
      player_battler:battlers!battles_battler_player_id_fkey(id, user_id, stage_name),
      ai_battler:battlers!battles_battler_ai_id_fkey(id, stage_name)
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

  // Fetch round results for both battlers
  const { data: rounds, error: roundsError } = await supabase
    .from('battle_rounds')
    .select('*')
    .eq('battle_id', battleId)
    .eq('round_index', roundIndex)
    .in('battler_id', [battle.battler_player_id, battle.battler_ai_id]);

  if (roundsError || !rounds || rounds.length === 0) {
    return NextResponse.json(
      { error: `Round ${roundIndex} results not found. The round may not have been simulated yet.` },
      { status: 404 }
    );
  }

  // Fetch content selections for both battlers
  const { data: contentSelections } = await supabase
    .from('round_content_selections')
    .select('*')
    .eq('battle_id', battleId)
    .eq('round_index', roundIndex)
    .in('battler_id', [battle.battler_player_id, battle.battler_ai_id]);

  // Fetch segments for both battlers
  const { data: segments } = await supabase
    .from('battle_segments')
    .select('*')
    .eq('battle_id', battleId)
    .eq('round_index', roundIndex)
    .in('battler_id', [battle.battler_player_id, battle.battler_ai_id])
    .order('segment_index');

  // Separate player and AI data
  const playerRound = rounds.find((r) => r.battler_id === battle.battler_player_id) as BattleRound;
  const aiRound = rounds.find((r) => r.battler_id === battle.battler_ai_id) as BattleRound;

  const playerContentSelection = contentSelections?.find(
    (s) => s.battler_id === battle.battler_player_id
  ) as RoundContentSelection | undefined;
  const aiContentSelection = contentSelections?.find(
    (s) => s.battler_id === battle.battler_ai_id
  ) as RoundContentSelection | undefined;

  const playerSegments = (segments?.filter(
    (s) => s.battler_id === battle.battler_player_id
  ) || []) as BattleSegment[];
  const aiSegments = (segments?.filter(
    (s) => s.battler_id === battle.battler_ai_id
  ) || []) as BattleSegment[];

  // Determine round winner
  let winner: string | undefined;
  if (playerRound && aiRound) {
    if (playerRound.average_score > aiRound.average_score) {
      winner = 'player';
    } else if (aiRound.average_score > playerRound.average_score) {
      winner = 'ai';
    } else if (playerRound.peak_score > aiRound.peak_score) {
      winner = 'player';
    } else if (aiRound.peak_score > playerRound.peak_score) {
      winner = 'ai';
    } else {
      winner = 'tie';
    }
  }

  return NextResponse.json({
    playerRound: {
      ...playerRound,
      contentSelection: playerContentSelection,
    },
    aiRound: {
      ...aiRound,
      contentSelection: aiContentSelection,
    },
    playerSegments,
    aiSegments,
    winner,
  });
}
