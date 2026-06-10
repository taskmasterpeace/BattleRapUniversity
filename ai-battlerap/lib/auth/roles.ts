// Role helpers for the verified-battler / admin permission system.
// Roles live in `user_roles` (user_id, role) — writes happen only via
// service-role endpoints, reads are public (badges need them).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/server';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'player' | 'verified_battler' | 'league_operator' | 'admin';

/** Service-role client — bypasses RLS. Server-side only. */
export function createServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** All roles granted to a user. */
export async function getUserRoles(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error) {
    console.error('getUserRoles failed:', error);
    return [];
  }
  return (data ?? []).map((r: { role: string }) => r.role as UserRole);
}

/** Does the user hold a specific role? */
export async function hasRole(
  supabase: SupabaseClient,
  userId: string,
  role: UserRole
): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();

  if (error) {
    console.error('hasRole failed:', error);
    return false;
  }
  return data !== null;
}

/**
 * Server helper for admin pages/APIs: resolves the cookie-authenticated user,
 * then verifies the 'admin' role with a service-role client.
 * Returns the user when they are an admin, otherwise null.
 */
export async function requireAdmin(): Promise<User | null> {
  const user = await getUser();
  if (!user) return null;

  const service = createServiceClient();
  const isAdmin = await hasRole(service, user.id, 'admin');
  return isAdmin ? user : null;
}
