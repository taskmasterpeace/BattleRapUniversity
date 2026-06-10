import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Service role: battles rows are system-created and RLS only allows SELECT
  // for users — the status update must bypass RLS (ownership verified below).
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Get player's battler
  const { data: battler } = await supabase
    .from('battlers')
    .select('id, stage_name')
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

  // Verify ownership.
  // PvP: only the CHALLENGED side (battler_ai_id) may decline the offer.
  if (battle.is_pvp) {
    if (battle.battler_ai_id !== battler.id) {
      return NextResponse.json(
        { error: 'Only the challenged player can decline this challenge' },
        { status: 403 }
      );
    }
  } else if (battle.battler_player_id !== battler.id) {
    return NextResponse.json({ error: 'Not your battle' }, { status: 403 });
  }

  // Verify status
  if (battle.status !== 'offered') {
    return NextResponse.json({ error: 'Battle is not in offered status' }, { status: 400 });
  }

  // Update status to cancelled ('declined' is no longer a valid battles.status)
  const { data: updatedBattle, error } = await supabase
    .from('battles')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error declining battle:', error);
    return NextResponse.json({ error: 'Failed to decline battle' }, { status: 500 });
  }

  if (battle.is_pvp) {
    // Turning down a player challenge carries no rep penalty — just tell the
    // challenger their smoke went unanswered.
    try {
      const { createNotification } = await import('@/lib/services/notificationService');
      await createNotification(supabase, battle.battler_player_id, {
        type: 'system_message',
        title: 'Challenge Declined',
        message: `${battler.stage_name} declined your challenge. No smoke today.`,
        metadata: { battleId: battle.id, isPvp: true },
      });
    } catch (notifyError) {
      console.error('Error notifying challenger of decline:', notifyError);
    }
  } else {
    // Declining a promoter's offer dings your reputation slightly
    const { data: attributes } = await supabase
      .from('battler_attributes')
      .select('personal')
      .eq('battler_id', battler.id)
      .single();

    if (attributes) {
      const newReputation = Math.max(1, attributes.personal.reputation - 1);
      await supabase
        .from('battler_attributes')
        .update({
          personal: {
            ...attributes.personal,
            reputation: newReputation,
          },
        })
        .eq('battler_id', battler.id);
    }
  }

  return NextResponse.json({ battle: updatedBattle });
}
