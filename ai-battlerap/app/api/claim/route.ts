// POST /api/claim — redeem a verified-battler claim code.
// Authed users only. Validates the code, links the battler to the user,
// grants the 'verified_battler' role, and returns the claimed battler.
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/server';
import { createServiceClient } from '@/lib/auth/roles';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to claim your profile' }, { status: 401 });
  }

  let rawCode: string | null = null;
  try {
    const body = await request.json();
    rawCode = typeof body?.code === 'string' ? body.code : null;
  } catch {
    // validation below
  }

  const code = (rawCode ?? '').trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: 'Enter your claim code' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: claimCode } = await supabase
    .from('claim_codes')
    .select('id, code, battler_id, claimed_by, claimed_at')
    .eq('code', code)
    .maybeSingle();

  if (!claimCode) {
    return NextResponse.json(
      { error: 'That code is not valid. Double-check it and try again.' },
      { status: 404 }
    );
  }

  if (claimCode.claimed_by) {
    return NextResponse.json(
      { error: 'That code has already been used.' },
      { status: 409 }
    );
  }

  const { data: battler } = await supabase
    .from('battlers')
    .select('id, stage_name, real_name, avatar_url, verified_user_id, is_real')
    .eq('id', claimCode.battler_id)
    .maybeSingle();

  if (!battler || !battler.is_real) {
    return NextResponse.json(
      { error: 'This code points to a profile that no longer exists.' },
      { status: 410 }
    );
  }

  if (battler.verified_user_id) {
    return NextResponse.json(
      { error: 'This profile has already been claimed.' },
      { status: 409 }
    );
  }

  // Mark the code claimed first — the WHERE claimed_by IS NULL makes the
  // redemption atomic if two requests race on the same code.
  const { data: claimed, error: claimError } = await supabase
    .from('claim_codes')
    .update({ claimed_by: user.id, claimed_at: new Date().toISOString() })
    .eq('id', claimCode.id)
    .is('claimed_by', null)
    .select('id')
    .maybeSingle();

  if (claimError || !claimed) {
    return NextResponse.json(
      { error: 'That code has already been used.' },
      { status: 409 }
    );
  }

  const { error: linkError } = await supabase
    .from('battlers')
    .update({ verified_user_id: user.id })
    .eq('id', battler.id);

  if (linkError) {
    console.error('claim link failed:', linkError);
    // Roll the code back so it can be retried.
    await supabase
      .from('claim_codes')
      .update({ claimed_by: null, claimed_at: null })
      .eq('id', claimCode.id);
    return NextResponse.json({ error: 'Something went wrong — try again.' }, { status: 500 });
  }

  const { error: roleError } = await supabase.from('user_roles').upsert(
    { user_id: user.id, role: 'verified_battler' },
    { onConflict: 'user_id,role', ignoreDuplicates: true }
  );
  if (roleError) {
    console.error('verified role grant failed (non-fatal):', roleError);
  }

  return NextResponse.json({
    battler: {
      id: battler.id,
      stage_name: battler.stage_name,
      real_name: battler.real_name,
      avatar_url: battler.avatar_url,
    },
  });
}
