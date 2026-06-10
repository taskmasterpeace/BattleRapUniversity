import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { getVirtualNow } from '@/lib/dev/timeManipulation';
import { runPvpBattle } from '@/lib/game/runPvpBattle';
import { createNotification } from '@/lib/services/notificationService';

/**
 * POST /api/battles/[id]/lockin
 *
 * Async PvP lock-in. The caller must own one side of an accepted PvP battle.
 * Sets their side's challenger_locked_at / challenged_locked_at. When BOTH
 * sides are locked, the battle simulates immediately and the response carries
 * { simulated: true } so the client can jump straight to the results page.
 *
 * If only one side is locked, the other player is notified ("your move") and
 * the battle sims automatically at scheduled_at via the cron if they ghost.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Service role: lock columns + the simulation pipeline write across tables
  // RLS scopes to other users. Ownership is verified below.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: battler } = await supabase
    .from('battlers')
    .select('id, stage_name')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!battler) {
    return NextResponse.json({ error: 'No battler found' }, { status: 404 });
  }

  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', id)
    .single();

  if (!battle) {
    return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
  }

  if (!battle.is_pvp) {
    return NextResponse.json({ error: 'Not a PvP battle' }, { status: 400 });
  }

  const isChallenger = battle.battler_player_id === battler.id;
  const isChallenged = battle.battler_ai_id === battler.id;
  if (!isChallenger && !isChallenged) {
    return NextResponse.json({ error: 'Not your battle' }, { status: 403 });
  }

  if (!['accepted', 'locked'].includes(battle.status)) {
    return NextResponse.json(
      { error: `Battle is not ready to lock in (status: ${battle.status})` },
      { status: 400 }
    );
  }

  const myColumn = isChallenger ? 'challenger_locked_at' : 'challenged_locked_at';
  const theirColumn = isChallenger ? 'challenged_locked_at' : 'challenger_locked_at';
  const opponentBattlerId = isChallenger ? battle.battler_ai_id : battle.battler_player_id;

  // Idempotent: already locked → just report current state.
  const alreadyLocked = !!battle[myColumn];
  const nowISO = getVirtualNow().toISOString();

  if (!alreadyLocked) {
    const { error: lockError } = await supabase
      .from('battles')
      .update({ [myColumn]: nowISO })
      .eq('id', id);

    if (lockError) {
      console.error('Error locking in:', lockError);
      return NextResponse.json({ error: 'Failed to lock in' }, { status: 500 });
    }
  }

  // Re-read after our write so a near-simultaneous lock by the opponent is
  // seen (simulateBattle is idempotent on completed battles either way).
  const { data: fresh } = await supabase
    .from('battles')
    .select('challenger_locked_at, challenged_locked_at')
    .eq('id', id)
    .single();

  const opponentLocked = !!(fresh?.[theirColumn] ?? battle[theirColumn]);

  if (opponentLocked) {
    // Both sides locked — battle time, right now.
    try {
      const result = await runPvpBattle(battle, supabase);
      return NextResponse.json({
        simulated: true,
        battleId: battle.id,
        winnerBattlerId: result.winnerBattlerId,
        verdict: result.verdict,
      });
    } catch (simError: any) {
      console.error(`Error simulating PvP battle ${id}:`, simError);
      return NextResponse.json({ error: 'Battle simulation failed' }, { status: 500 });
    }
  }

  // Waiting on the other side — poke them (skip if we were already locked,
  // they've been poked once).
  if (!alreadyLocked) {
    try {
      await createNotification(supabase, opponentBattlerId, {
        type: 'system_message',
        title: 'Opponent Locked In',
        message: `${battler.stage_name} locked in — your move. Lock in to battle now, or it sims automatically at the scheduled time.`,
        metadata: { battleId: battle.id, isPvp: true },
      });
    } catch (notifyError) {
      console.error('Error notifying opponent of lock-in:', notifyError);
    }
  }

  return NextResponse.json({
    simulated: false,
    battleId: battle.id,
    lockedAt: battle[myColumn] || nowISO,
    waitingOnOpponent: true,
    simsAt: battle.scheduled_at,
  });
}
