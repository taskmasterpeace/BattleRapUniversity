import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { getVirtualNow } from '@/lib/dev/timeManipulation';

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

  // Get battle with league info (both battler joins so PvP can show the
  // correct opponent to whichever side is looking)
  const { data: battle } = await supabase
    .from('battles')
    .select(`
      *,
      league:leagues(*),
      ai_battler:battler_ai_id(id, stage_name, tier, avatar_url),
      player_battler:battler_player_id(id, stage_name, tier, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (!battle) {
    return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
  }

  // Verify ownership. PvP battles have humans on BOTH sides — each preps
  // their own calendar on the same battle row.
  const isChallenger = battle.battler_player_id === battler.id;
  const isChallenged = battle.battler_ai_id === battler.id;
  if (battle.is_pvp ? !(isChallenger || isChallenged) : !isChallenger) {
    return NextResponse.json({ error: 'Not your battle' }, { status: 403 });
  }

  // Get existing prep blocks (only the caller's own side)
  const { data: prepBlocks } = await supabase
    .from('prep_blocks')
    .select('*')
    .eq('battle_id', id)
    .eq('battler_id', battler.id)
    .order('day_index');

  // Calculate total prep days
  const lockDate = new Date(battle.lock_prep_at);
  const createdDate = new Date(battle.created_at);
  const totalPrepDays = Math.max(1, Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Normalize: the UI renders the opponent from `ai_battler`. For the
  // challenged side of a PvP battle, the opponent is the challenger.
  const { player_battler, ...responseBattle } = battle;
  if (battle.is_pvp && isChallenged) {
    responseBattle.ai_battler = player_battler;
  }

  return NextResponse.json({
    battle: responseBattle,
    prepBlocks: prepBlocks || [],
    totalPrepDays,
    lockPrepAt: battle.lock_prep_at,
    pvp: battle.is_pvp
      ? {
          mySide: isChallenger ? 'challenger' : 'challenged',
          myLockedAt: isChallenger ? battle.challenger_locked_at : battle.challenged_locked_at,
          opponentLockedAt: isChallenger ? battle.challenged_locked_at : battle.challenger_locked_at,
        }
      : null,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { day_index, focus } = body;

  // Validate input
  if (typeof day_index !== 'number' || day_index < 1) {
    return NextResponse.json({ error: 'Invalid day_index' }, { status: 400 });
  }

  const validFocus = ['research', 'writing', 'performance', 'life', 'rest'];
  if (!validFocus.includes(focus)) {
    return NextResponse.json({ error: 'Invalid focus' }, { status: 400 });
  }

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

  // Get battle
  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', id)
    .single();

  if (!battle) {
    return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
  }

  // Verify ownership (PvP: either human side may save their own prep)
  const isParticipant = battle.is_pvp
    ? battle.battler_player_id === battler.id || battle.battler_ai_id === battler.id
    : battle.battler_player_id === battler.id;
  if (!isParticipant) {
    return NextResponse.json({ error: 'Not your battle' }, { status: 403 });
  }

  // Check if prep is locked (uses virtual time in dev mode)
  const now = getVirtualNow();
  const lockDate = new Date(battle.lock_prep_at);
  if (now >= lockDate) {
    return NextResponse.json({ error: 'Prep is locked' }, { status: 400 });
  }

  // PvP: once you've locked in, your prep is final
  if (battle.is_pvp) {
    const myLockedAt =
      battle.battler_player_id === battler.id
        ? battle.challenger_locked_at
        : battle.challenged_locked_at;
    if (myLockedAt) {
      return NextResponse.json(
        { error: 'You are locked in — prep is final' },
        { status: 400 }
      );
    }
  }

  // Validate day_index is within range
  const createdDate = new Date(battle.created_at);
  const totalPrepDays = Math.max(1, Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

  if (day_index > totalPrepDays) {
    return NextResponse.json({ error: 'Invalid day_index' }, { status: 400 });
  }

  // Upsert prep block
  const { data: prepBlock, error } = await supabase
    .from('prep_blocks')
    .upsert(
      {
        battle_id: id,
        battler_id: battler.id,
        day_index,
        focus,
        auto_generated: false,
      },
      {
        onConflict: 'battle_id,battler_id,day_index',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error updating prep block:', error);
    return NextResponse.json({ error: 'Failed to update prep' }, { status: 500 });
  }

  return NextResponse.json({ prepBlock });
}
