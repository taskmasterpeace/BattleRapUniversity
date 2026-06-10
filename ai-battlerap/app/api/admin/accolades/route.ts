// POST   /api/admin/accolades — add an accolade to a battler.
// DELETE /api/admin/accolades?id=<accolade_id> — remove an accolade.
// Admin only.
import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/auth/roles';

const SCOPES = ['real_world', 'in_game'] as const;

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const battler_id = typeof body.battler_id === 'string' ? body.battler_id : null;
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!battler_id) {
    return NextResponse.json({ error: 'battler_id is required' }, { status: 400 });
  }
  if (title.length === 0 || title.length > 200) {
    return NextResponse.json({ error: 'Title is required (max 200 chars)' }, { status: 400 });
  }

  const scope = SCOPES.includes(body.scope as (typeof SCOPES)[number])
    ? (body.scope as string)
    : 'real_world';

  const rankNum = Number(body.rank);
  const rank = Number.isFinite(rankNum) && rankNum >= 1 ? Math.round(rankNum) : null;

  const yearNum = Number(body.year);
  const year =
    Number.isFinite(yearNum) && yearNum >= 1990 && yearNum <= 2100
      ? Math.round(yearNum)
      : null;

  const region =
    typeof body.region === 'string' && body.region.trim().length > 0
      ? body.region.trim().slice(0, 100)
      : null;
  const source =
    typeof body.source === 'string' && body.source.trim().length > 0
      ? body.source.trim().slice(0, 200)
      : null;

  const supabase = createServiceClient();

  const { data: battler } = await supabase
    .from('battlers')
    .select('id')
    .eq('id', battler_id)
    .maybeSingle();
  if (!battler) {
    return NextResponse.json({ error: 'Battler not found' }, { status: 404 });
  }

  const { data: accolade, error } = await supabase
    .from('battler_accolades')
    .insert({ battler_id, rank, title, scope, region, year, source })
    .select()
    .single();

  if (error) {
    console.error('accolade insert failed:', error);
    return NextResponse.json({ error: 'Failed to add accolade' }, { status: 500 });
  }

  return NextResponse.json({ accolade });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('battler_accolades').delete().eq('id', id);

  if (error) {
    console.error('accolade delete failed:', error);
    return NextResponse.json({ error: 'Failed to delete accolade' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
