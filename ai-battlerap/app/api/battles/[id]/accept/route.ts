import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { getVirtualNow } from '@/lib/dev/timeManipulation';
import { updateBattlerStress } from '@/lib/game/stressManagement';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Use service role to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

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

  // Verify ownership
  if (battle.battler_player_id !== battler.id) {
    return NextResponse.json({ error: 'Not your battle' }, { status: 403 });
  }

  // Verify status
  if (battle.status !== 'offered') {
    return NextResponse.json({ error: 'Battle is not in offered status' }, { status: 400 });
  }

  // Check if offer has expired (past lock_prep_at deadline)
  const now = getVirtualNow();
  const lockDate = new Date(battle.lock_prep_at);
  if (now >= lockDate) {
    return NextResponse.json(
      { error: 'This battle offer has expired. You cannot accept it as the prep deadline has passed.' },
      { status: 400 }
    );
  }

  // Update status to accepted
  const { data: updatedBattle, error } = await supabase
    .from('battles')
    .update({ status: 'accepted' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error accepting battle:', error);
    return NextResponse.json({ error: 'Failed to accept battle' }, { status: 500 });
  }

  // Update battler's stress level after accepting battle
  try {
    await updateBattlerStress(supabase, battler.id);
    console.log(`Updated stress for battler ${battler.id} after accepting battle`);
  } catch (stressError) {
    console.error('Error updating stress:', stressError);
    // Don't fail the request, stress is a secondary system
  }

  return NextResponse.json({ battle: updatedBattle });
}
