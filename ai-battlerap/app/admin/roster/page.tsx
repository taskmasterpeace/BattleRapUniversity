// /admin/roster — the AI roster editor: rename, gender, culture coding,
// appearance identity, style tags, attributes, rating. Owner tooling for
// cleaning up the ~100+ generated battlers.
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import RosterEditorClient from '@/components/admin/RosterEditorClient';

export const dynamic = 'force-dynamic';

export default async function RosterAdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');

  return <RosterEditorClient />;
}
