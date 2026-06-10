// GET    /api/admin/roles — list auth users with their roles.
// POST   /api/admin/roles — grant a role { user_id, role }.
// DELETE /api/admin/roles — revoke a role { user_id, role } (cannot revoke own admin).
// Admin only.
import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient, type UserRole } from '@/lib/auth/roles';

const VALID_ROLES: UserRole[] = ['player', 'verified_battler', 'league_operator', 'admin'];

async function parseRoleBody(
  request: Request
): Promise<{ user_id: string; role: UserRole } | { error: string }> {
  try {
    const body = await request.json();
    const user_id = typeof body?.user_id === 'string' ? body.user_id : null;
    const role = VALID_ROLES.includes(body?.role) ? (body.role as UserRole) : null;
    if (!user_id || !role) {
      return { error: 'Body must include { user_id, role }' };
    }
    return { user_id, role };
  } catch {
    return { error: 'Invalid JSON body' };
  }
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const supabase = createServiceClient();

  const [usersResult, rolesResult] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase.from('user_roles').select('user_id, role, granted_at'),
  ]);

  if (usersResult.error) {
    console.error('roles listUsers failed:', usersResult.error);
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }

  const rolesByUser = new Map<string, string[]>();
  for (const r of rolesResult.data ?? []) {
    const arr = rolesByUser.get(r.user_id) ?? [];
    arr.push(r.role);
    rolesByUser.set(r.user_id, arr);
  }

  const users = usersResult.data.users
    .map((u) => ({
      id: u.id,
      email: u.email ?? '(no email)',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      roles: rolesByUser.get(u.id) ?? [],
    }))
    .sort((a, b) => (a.email < b.email ? -1 : 1));

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const parsed = await parseRoleBody(request);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('user_roles').upsert(
    { user_id: parsed.user_id, role: parsed.role, granted_by: admin.id },
    { onConflict: 'user_id,role', ignoreDuplicates: true }
  );

  if (error) {
    console.error('role grant failed:', error);
    return NextResponse.json({ error: 'Failed to grant role' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const parsed = await parseRoleBody(request);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Guard rail: an admin cannot lock themselves out.
  if (parsed.user_id === admin.id && parsed.role === 'admin') {
    return NextResponse.json(
      { error: 'You cannot revoke your own admin role' },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', parsed.user_id)
    .eq('role', parsed.role);

  if (error) {
    console.error('role revoke failed:', error);
    return NextResponse.json({ error: 'Failed to revoke role' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
