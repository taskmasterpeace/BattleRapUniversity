import { createServerSupabaseClient, getUser } from '@/lib/db/server';
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

  // Verify ownership
  if (battle.battler_player_id !== battler.id) {
    return NextResponse.json({ error: 'Not your battle' }, { status: 403 });
  }

  // Verify status
  if (battle.status !== 'offered') {
    return NextResponse.json({ error: 'Battle is not in offered status' }, { status: 400 });
  }

  // Update status to declined
  const { data: updatedBattle, error } = await supabase
    .from('battles')
    .update({ status: 'declined' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error declining battle:', error);
    return NextResponse.json({ error: 'Failed to decline battle' }, { status: 500 });
  }

  // Optional: Apply small reputation penalty
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

  return NextResponse.json({ battle: updatedBattle });
}
