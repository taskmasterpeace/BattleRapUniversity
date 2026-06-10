// PATCH /api/verified/profile — a verified battler edits their own linked
// profile. Only bio and avatar_url are editable, only on the battler whose
// verified_user_id matches the caller.
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/server';
import { createServiceClient, hasRole } from '@/lib/auth/roles';

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const verified = await hasRole(supabase, user.id, 'verified_battler');
  if (!verified) {
    return NextResponse.json({ error: 'Verified battlers only' }, { status: 403 });
  }

  const { data: battler } = await supabase
    .from('battlers')
    .select('id')
    .eq('verified_user_id', user.id)
    .eq('is_real', true)
    .maybeSingle();

  if (!battler) {
    return NextResponse.json({ error: 'No verified profile linked to this account' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updates: { bio?: string | null; avatar_url?: string | null } = {};

  if ('bio' in body) {
    if (body.bio !== null && typeof body.bio !== 'string') {
      return NextResponse.json({ error: 'bio must be a string' }, { status: 400 });
    }
    const bio = typeof body.bio === 'string' ? body.bio.trim().slice(0, 4000) : null;
    updates.bio = bio && bio.length > 0 ? bio : null;
  }

  if ('avatar_url' in body) {
    if (body.avatar_url !== null && typeof body.avatar_url !== 'string') {
      return NextResponse.json({ error: 'avatar_url must be a string' }, { status: 400 });
    }
    const url =
      typeof body.avatar_url === 'string' ? body.avatar_url.trim().slice(0, 500) : null;
    updates.avatar_url = url && url.length > 0 ? url : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'Nothing to update — send bio and/or avatar_url' },
      { status: 400 }
    );
  }

  const { data: updated, error } = await supabase
    .from('battlers')
    .update(updates)
    .eq('id', battler.id)
    .select('id, stage_name, bio, avatar_url')
    .single();

  if (error) {
    console.error('verified profile update failed:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }

  return NextResponse.json({ battler: updated });
}
