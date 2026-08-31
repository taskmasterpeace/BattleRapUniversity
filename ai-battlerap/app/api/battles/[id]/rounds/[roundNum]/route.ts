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

  // "Not simulated yet" is a VALID pre-battle state, not an error — return 200
  // with simulated:false so the client shows the "Simulate Round" button without
  // logging a 404 on every fresh round-results load.
  if (roundsError || !rounds || rounds.length === 0) {
    // Echo back the player's OWN locked content so the pre-battle screen can show
    // what they're walking in with. The opponent's cards stay hidden until the
    // reveal — you don't get to see exactly what they'll bring.
    const { data: preSelections } = await supabase
      .from('round_content_selections')
      .select('*')
      .eq('battle_id', battleId)
      .eq('round_index', roundIndex)
      .eq('battler_id', battle.battler_player_id);
    const playerContentSelection = (preSelections?.[0] ?? null) as RoundContentSelection | null;
    return NextResponse.json({
      simulated: false,
      playerRound: null,
      aiRound: null,
      playerSegments: [],
      aiSegments: [],
      winner: undefined,
      playerContentSelection,
    });
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

  // ANGLES — what research dug up before the battle (round-stable; shown
  // once the round is simulated so scouting isn't spoiled pre-reveal).
  const { data: intel } = await supabase
    .from('battle_intelligence')
    .select('researcher_battler_id, target_battler_id, discovery_rolls')
    .eq('battle_id', battleId);
  const nameOf = (bid: string) =>
    bid === battle.battler_player_id ? battle.player_battler.stage_name : battle.ai_battler.stage_name;
  const angles = (intel ?? [])
    .map((row: any) => ({
      researcher: nameOf(row.researcher_battler_id),
      researcherIsPlayer: row.researcher_battler_id === battle.battler_player_id,
      target: nameOf(row.target_battler_id),
      facets: (Array.isArray(row.discovery_rolls) ? row.discovery_rolls : [])
        .filter((r: any) => r?.success)
        .map((r: any) => r.facet),
    }))
    .filter((a: any) => a.facets.length > 0);

  // PRESSURE EVENTS — the physical chess told back (talk-overs, bumps, who
  // laughed who off) for this round.
  const { data: decisions } = await supabase
    .from('battle_decisions')
    .select('battler_id, decision_label')
    .eq('battle_id', battleId)
    .eq('round_number', roundIndex)
    .eq('decision_type', 'pressure_move');
  const pressureEvents = (decisions ?? []).map((d: any) => {
    const [move, outcome] = String(d.decision_label).split(':');
    return {
      by: d.battler_id === battle.battler_player_id ? 'player' : 'ai',
      actor: nameOf(d.battler_id),
      move,
      outcome: outcome ?? '',
    };
  });

  return NextResponse.json({
    simulated: true,
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
    angles,
    pressureEvents,
  });
}
