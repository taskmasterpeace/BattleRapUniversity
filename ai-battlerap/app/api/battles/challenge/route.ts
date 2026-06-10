import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { getVirtualNow } from '@/lib/dev/timeManipulation';
import { createNotification } from '@/lib/services/notificationService';

/**
 * POST /api/battles/challenge
 *
 * Async PvP: challenge another player's battler.
 * Body: { opponentBattlerId: string }
 *
 * Creates a battles row with is_pvp = true:
 *  - battler_player_id = CHALLENGER's battler
 *  - battler_ai_id     = CHALLENGED player's battler (is_ai = false on both)
 *  - status 'offered', scheduled_at = now + 72h, lock_prep_at = now + 66h
 *
 * The challenged player gets a notification and must accept before either
 * side can prep/lock in. If both lock in early, the battle sims immediately;
 * otherwise the cron resolves it at scheduled_at with whatever prep exists.
 */
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const opponentBattlerId = body?.opponentBattlerId;
  if (!opponentBattlerId || typeof opponentBattlerId !== 'string') {
    return NextResponse.json({ error: 'opponentBattlerId is required' }, { status: 400 });
  }

  // Service role: battle rows + notifications are system-owned writes.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Challenger = the authed user's battler
  const { data: challenger } = await supabase
    .from('battlers')
    .select('id, stage_name, primary_league_id')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!challenger) {
    return NextResponse.json({ error: 'No battler found' }, { status: 404 });
  }

  if (opponentBattlerId === challenger.id) {
    return NextResponse.json({ error: "You can't challenge yourself" }, { status: 400 });
  }

  // Opponent must exist and be another HUMAN player's battler
  const { data: opponent } = await supabase
    .from('battlers')
    .select('id, stage_name, is_ai, user_id, primary_league_id')
    .eq('id', opponentBattlerId)
    .single();

  if (!opponent) {
    return NextResponse.json({ error: 'Opponent battler not found' }, { status: 404 });
  }
  if (opponent.is_ai) {
    return NextResponse.json(
      { error: 'You can only challenge battlers controlled by other players' },
      { status: 400 }
    );
  }
  if (opponent.user_id === user.id) {
    return NextResponse.json({ error: "You can't challenge your own battler" }, { status: 400 });
  }

  // No duplicate pending PvP battle between the two (either direction)
  const { data: existing } = await supabase
    .from('battles')
    .select('id, status')
    .eq('is_pvp', true)
    .in('status', ['offered', 'accepted', 'locked'])
    .or(
      `and(battler_player_id.eq.${challenger.id},battler_ai_id.eq.${opponent.id}),` +
        `and(battler_player_id.eq.${opponent.id},battler_ai_id.eq.${challenger.id})`
    )
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: 'There is already a pending challenge between you two. Settle that one first.' },
      { status: 409 }
    );
  }

  // League: challenger's home turf (fall back to opponent's if unset)
  const leagueId = challenger.primary_league_id || opponent.primary_league_id;
  if (!leagueId) {
    return NextResponse.json(
      { error: 'Neither battler has a league — cannot stage the battle' },
      { status: 400 }
    );
  }

  const { data: league } = await supabase
    .from('leagues')
    .select('id, name')
    .eq('id', leagueId)
    .single();

  const now = getVirtualNow();
  const scheduledAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);
  const lockPrepAt = new Date(now.getTime() + 66 * 60 * 60 * 1000);

  const { data: battle, error: insertError } = await supabase
    .from('battles')
    .insert({
      league_id: leagueId,
      battler_player_id: challenger.id, // challenger
      battler_ai_id: opponent.id, // challenged player's battler
      scheduled_at: scheduledAt.toISOString(),
      lock_prep_at: lockPrepAt.toISOString(),
      status: 'offered',
      is_pvp: true,
    })
    .select()
    .single();

  if (insertError || !battle) {
    console.error('Error creating PvP challenge:', insertError);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }

  // Notify the challenged player (notifications are battler-scoped)
  await createNotification(supabase, opponent.id, {
    type: 'battle_offer',
    title: 'Player Challenge!',
    message: `${challenger.stage_name} challenged you to a battle in ${league?.name || 'their league'}. Accept before it expires.`,
    metadata: {
      battleId: battle.id,
      isPvp: true,
      opponentName: challenger.stage_name,
      league: league?.name || null,
    },
  });

  return NextResponse.json({ battle });
}
