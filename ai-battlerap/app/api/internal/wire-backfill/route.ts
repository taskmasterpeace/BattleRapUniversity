import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyInternalSecret } from '@/lib/db/server';
import { emitWirePostsForBattle } from '@/lib/game/wire/engine';

/**
 * THE WIRE — backfill. Fans recent completed battles out into the feed.
 * The live hook covers new battles; this covers battles completed before
 * the Wire existed (idempotent — already-covered battles are skipped).
 *
 * POST /api/internal/wire-backfill?limit=20
 * Auth: Bearer INTERNAL_API_SECRET
 */
export async function POST(request: Request) {
  if (!verifyInternalSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') ?? 20)));

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: battles, error } = await admin
    .from('battles')
    .select('id')
    .eq('status', 'completed')
    .not('winner_battler_id', 'is', null)
    .order('scheduled_at', { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let covered = 0;
  for (const b of battles ?? []) {
    await emitWirePostsForBattle(b.id, admin);
    covered++;
  }

  const { count } = await admin
    .from('wire_posts')
    .select('id', { count: 'exact', head: true });

  return NextResponse.json({ battlesProcessed: covered, totalWirePosts: count });
}
