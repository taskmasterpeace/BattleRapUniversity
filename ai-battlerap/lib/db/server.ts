import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client (for use in Server Components and Route Handlers)
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component, can't set cookies
        }
      },
    },
  });
}

// Get authenticated user from server
export async function getUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Verify internal API secret for cron jobs
export function verifyInternalSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.INTERNAL_API_SECRET;

  if (!secret) {
    throw new Error('INTERNAL_API_SECRET not configured');
  }

  return authHeader === `Bearer ${secret}`;
}
