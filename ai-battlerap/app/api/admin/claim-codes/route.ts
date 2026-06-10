// POST /api/admin/claim-codes — generate a one-time claim code for a real battler.
// GET  /api/admin/claim-codes?battler_id=<id> — list codes for a battler.
// Admin only. Codes look like BRU-XXXX-XXXX using unambiguous characters.
import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { requireAdmin, createServiceClient } from '@/lib/auth/roles';

// No I, L, O, 0, 1 — codes get read over the phone / typed from a text.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateClaimCode(): string {
  const chunk = () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  return `BRU-${chunk()}-${chunk()}`;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  let battler_id: string | null = null;
  try {
    const body = await request.json();
    battler_id = typeof body?.battler_id === 'string' ? body.battler_id : null;
  } catch {
    // validation below
  }
  if (!battler_id) {
    return NextResponse.json({ error: 'battler_id is required' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: battler } = await supabase
    .from('battlers')
    .select('id, stage_name, is_real, verified_user_id')
    .eq('id', battler_id)
    .eq('is_real', true)
    .maybeSingle();

  if (!battler) {
    return NextResponse.json({ error: 'Real battler not found' }, { status: 404 });
  }
  if (battler.verified_user_id) {
    return NextResponse.json(
      { error: `${battler.stage_name} is already claimed` },
      { status: 409 }
    );
  }

  // Retry on the (astronomically unlikely) unique collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateClaimCode();
    const { data: created, error } = await supabase
      .from('claim_codes')
      .insert({ code, battler_id, created_by: admin.id })
      .select('id, code, created_at')
      .single();

    if (!error && created) {
      return NextResponse.json({ claim_code: created });
    }
    if (error && error.code !== '23505') {
      console.error('claim code insert failed:', error);
      return NextResponse.json({ error: 'Failed to create claim code' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Failed to generate a unique code' }, { status: 500 });
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const battlerId = new URL(request.url).searchParams.get('battler_id');
  if (!battlerId) {
    return NextResponse.json({ error: 'battler_id query param is required' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: codes, error } = await supabase
    .from('claim_codes')
    .select('id, code, created_at, claimed_by, claimed_at')
    .eq('battler_id', battlerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('claim code list failed:', error);
    return NextResponse.json({ error: 'Failed to list claim codes' }, { status: 500 });
  }

  return NextResponse.json({ codes: codes ?? [] });
}
