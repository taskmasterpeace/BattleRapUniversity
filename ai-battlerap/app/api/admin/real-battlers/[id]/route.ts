// PATCH  /api/admin/real-battlers/[id] — update a real battler's profile/attributes/rating.
// DELETE /api/admin/real-battlers/[id] — remove a real battler (cascades attrs/accolades/codes).
// Admin only.
import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/auth/roles';
import { parseRealBattlerPayload } from '@/lib/admin/realBattlerPayload';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = parseRealBattlerPayload(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const p = parsed.payload;

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from('battlers')
    .select('id, is_real')
    .eq('id', id)
    .eq('is_real', true)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Real battler not found' }, { status: 404 });
  }

  let region: string | null = null;
  if (p.hometown_city_id) {
    const { data: city } = await supabase
      .from('cities')
      .select('name')
      .eq('id', p.hometown_city_id)
      .maybeSingle();
    region = city?.name ?? null;
  }

  const { data: battler, error: battlerError } = await supabase
    .from('battlers')
    .update({
      stage_name: p.stage_name,
      real_name: p.real_name,
      bio: p.bio,
      region,
      tier: p.tier,
      likeness_status: p.likeness_status,
      hometown_city_id: p.hometown_city_id,
      avatar_url: p.avatar_url,
      style_tags: p.style_tags,
    })
    .eq('id', id)
    .select()
    .single();

  if (battlerError) {
    console.error('real-battler update failed:', battlerError);
    return NextResponse.json({ error: 'Failed to update battler' }, { status: 500 });
  }

  // Update writing/performance/resilience; preserve personal + xp earned in-game.
  const a = p.attributes;
  const { error: attrError } = await supabase
    .from('battler_attributes')
    .update({
      writing: {
        lyricism: a.lyricism,
        wordplay: a.wordplay,
        creativity: a.creativity,
        flow: a.flow,
      },
      performance: {
        stage_presence: a.stage_presence,
        crowd_control: a.crowd_control,
        delivery: a.delivery,
      },
      resilience: a.resilience,
    })
    .eq('battler_id', id);

  if (attrError) {
    console.error('real-battler attribute update failed:', attrError);
    return NextResponse.json({ error: 'Failed to update attributes' }, { status: 500 });
  }

  const { error: rankError } = await supabase
    .from('rankings')
    .update({ rating: p.rating })
    .eq('battler_id', id);

  if (rankError) {
    console.error('real-battler rating update failed:', rankError);
    return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
  }

  return NextResponse.json({ battler });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from('battlers')
    .select('id, verified_user_id')
    .eq('id', id)
    .eq('is_real', true)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Real battler not found' }, { status: 404 });
  }

  if (existing.verified_user_id) {
    return NextResponse.json(
      { error: 'Cannot delete a claimed verified profile — unlink it first' },
      { status: 409 }
    );
  }

  const { error } = await supabase.from('battlers').delete().eq('id', id);
  if (error) {
    console.error('real-battler delete failed:', error);
    return NextResponse.json({ error: 'Failed to delete battler' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
