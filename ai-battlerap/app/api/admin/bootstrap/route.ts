// POST /api/admin/bootstrap — grant the 'admin' role to a user by email.
// Protected by the internal secret (not by an existing admin) so the very
// first admin can be created on a fresh deployment.
//
//   curl -X POST https://<host>/api/admin/bootstrap \
//     -H "Authorization: Bearer $INTERNAL_API_SECRET" \
//     -H "Content-Type: application/json" \
//     -d '{"email":"you@example.com"}'
import { NextResponse } from 'next/server';
import { verifyInternalSecret } from '@/lib/db/server';
import { createServiceClient } from '@/lib/auth/roles';

export async function POST(request: Request) {
  if (!verifyInternalSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let email: string | undefined;
  try {
    const body = await request.json();
    email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : undefined;
  } catch {
    // fall through to validation error
  }

  if (!email) {
    return NextResponse.json({ error: 'Body must include { email }' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Find the auth user by email via the admin API (paginate to be safe).
  let target: { id: string; email?: string } | null = null;
  let page = 1;
  const perPage = 1000;
  // Hard cap of 10 pages (10k users) — plenty for now.
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error('bootstrap listUsers failed:', error);
      return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
    }
    target =
      data.users.find((u) => (u.email ?? '').toLowerCase() === email) ?? null;
    if (target || data.users.length < perPage) break;
    page += 1;
  }

  if (!target) {
    return NextResponse.json({ error: `No auth user found for ${email}` }, { status: 404 });
  }

  const { error: grantError } = await supabase
    .from('user_roles')
    .upsert(
      { user_id: target.id, role: 'admin' },
      { onConflict: 'user_id,role', ignoreDuplicates: true }
    );

  if (grantError) {
    console.error('bootstrap grant failed:', grantError);
    return NextResponse.json({ error: 'Failed to grant admin role' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user_id: target.id, email, role: 'admin' });
}
