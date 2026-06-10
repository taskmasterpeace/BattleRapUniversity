import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { runBattleSimulation } from '@/lib/game/runBattle';
import { consumeSlot, refundSlot } from '@/lib/game/battleSlots';

/**
 * POST /api/battles/[id]/start
 *
 * Player-facing "BATTLE TIME" action. The authenticated user takes the stage:
 * their accepted battle is locked and simulated immediately — action-based
 * time, no waiting for the calendar. The user must own the battle.
 *
 * Replaces the old dev-only SIMULATE NOW button (which exposed the internal
 * cron secret in client code).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: battleId } = await params;

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Service role for the simulation pipeline (it writes across tables that
  // RLS scopes to other users/AI), but only after ownership is verified.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // The user's own battler
  const { data: battler } = await supabase
    .from('battlers')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!battler) {
    return NextResponse.json({ error: 'No battler found' }, { status: 404 });
  }

  // The battle must belong to this player and be startable
  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .eq('battler_player_id', battler.id)
    .in('status', ['accepted', 'locked'])
    .single();

  if (!battle) {
    return NextResponse.json(
      { error: 'Battle not found or not ready to start' },
      { status: 404 }
    );
  }

  // Daily slot enforcement — AI battles burn one of the player's daily slots.
  // PvP battles (both battlers human) never consume slots.
  const { data: opponent } = await supabase
    .from('battlers')
    .select('id, is_ai')
    .eq('id', battle.battler_ai_id)
    .single();

  const isPvP = opponent ? opponent.is_ai === false : false;
  let slotConsumed = false;

  if (!isPvP) {
    const consume = await consumeSlot(supabase, battler.id);
    if (!consume.ok) {
      if (consume.error === 'no_slots_remaining') {
        return NextResponse.json(
          {
            error: 'No battle slots left today',
            resetsAt: consume.status.resetsAt,
            slots: consume.status,
          },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: 'Could not reserve a battle slot' }, { status: 500 });
    }
    slotConsumed = true;
  }

  try {
    const { noShow, offersGenerated } = await runBattleSimulation(battle, supabase);
    return NextResponse.json({
      message: 'Battle complete',
      battleId: battle.id,
      noShow,
      offersGenerated,
    });
  } catch (error: any) {
    console.error(`Error starting battle ${battleId}:`, error);
    // Don't charge the player a slot for a battle that never happened.
    if (slotConsumed) {
      await refundSlot(supabase, battler.id);
    }
    return NextResponse.json({ error: 'Battle simulation failed' }, { status: 500 });
  }
}
