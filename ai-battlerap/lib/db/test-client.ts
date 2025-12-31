/**
 * Test-specific Supabase Client
 *
 * This client bypasses Next.js cookies and uses direct Supabase client
 * for use in test scripts that run outside of Next.js request context.
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Create a direct Supabase client for testing (bypasses Next.js SSR)
 * Uses service role key if available, falls back to anon key
 * Reads env vars lazily to allow test scripts to load them first
 */
export function createTestSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL not set. Make sure .env.local is loaded.');
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Make sure .env.local is loaded.');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
