// /admin/roles — list every auth user with their roles; grant/revoke.
import { redirect } from 'next/navigation';
import { requireAdmin, createServiceClient } from '@/lib/auth/roles';
import RolesManager from '@/components/admin/RolesManager';

export const dynamic = 'force-dynamic';

export default async function AdminRolesPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');

  const supabase = createServiceClient();

  const [usersResult, { data: roleRows }] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase.from('user_roles').select('user_id, role'),
  ]);

  const rolesByUser = new Map<string, string[]>();
  for (const r of roleRows ?? []) {
    const arr = rolesByUser.get(r.user_id) ?? [];
    arr.push(r.role);
    rolesByUser.set(r.user_id, arr);
  }

  const users = (usersResult.data?.users ?? [])
    .map((u) => ({
      id: u.id,
      email: u.email ?? '(no email)',
      created_at: u.created_at,
      roles: rolesByUser.get(u.id) ?? [],
    }))
    .sort((a, b) => (a.email < b.email ? -1 : 1));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-zinc-100 mb-2">
          USER <span className="text-[#ff8c42]">ROLES</span>
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          {users.length} accounts — grant or revoke staff and verified roles
        </p>
      </div>

      <RolesManager users={users} selfId={admin.id} />
    </div>
  );
}
