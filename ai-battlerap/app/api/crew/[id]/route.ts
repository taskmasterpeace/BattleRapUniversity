/**
 * DELETE /api/crew/[id] — dismiss a crew member (no refund).
 * [id] is the crew_members row id; the row must belong to the
 * authenticated player's battler.
 */
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/server';
import { createServiceClient } from '@/lib/auth/roles';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServiceClient();

  const { data: player } = await supabase
    .from('battlers')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!player) {
    return NextResponse.json({ error: 'No battler found for this account' }, { status: 404 });
  }

  const { data: member } = await supabase
    .from('crew_members')
    .select('id, owner_battler_id')
    .eq('id', id)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: 'Crew member not found' }, { status: 404 });
  }

  if (member.owner_battler_id !== player.id) {
    return NextResponse.json({ error: 'Not your crew member' }, { status: 403 });
  }

  const { error } = await supabase.from('crew_members').delete().eq('id', id);

  if (error) {
    console.error('Crew dismiss failed:', error);
    return NextResponse.json({ error: 'Failed to dismiss crew member' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
