// /claim — verified battler claim flow. Authed users redeem the one-time
// code an admin sent them; success links their account to the real profile.
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/server';
import ClaimClient from '@/components/claim/ClaimClient';

export const dynamic = 'force-dynamic';

export default async function ClaimPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  return <ClaimClient />;
}
