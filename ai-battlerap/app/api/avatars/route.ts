import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import spriteManifest from '@/lib/game/characterSprites.json';

export const dynamic = 'force-dynamic';

const SAMPLE_SIZE = 24;

/**
 * GET /api/avatars
 *
 * Returns the current face pool for the character creator:
 *   { total, claimed, available: string[] }
 *
 * `available` is a fresh random sample of unclaimed sprite paths on every
 * call, so the SHUFFLE button just refetches. Faces are exclusive — once a
 * battler claims one (battlers.avatar_url), it never shows up here again.
 */
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Service role: we need to see EVERY battler's claimed face, not just ours.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: usedRows, error } = await supabase
    .from('battlers')
    .select('avatar_url')
    .not('avatar_url', 'is', null);

  if (error) {
    console.error('Failed to load claimed avatars:', error);
    return NextResponse.json({ error: 'Failed to load avatar pool' }, { status: 500 });
  }

  const manifest = spriteManifest as string[];
  const claimedSet = new Set((usedRows || []).map((r: { avatar_url: string }) => r.avatar_url));
  const unclaimed = manifest.filter((path) => !claimedSet.has(path));

  // Fisher-Yates shuffle, then take a small sample — payload stays tiny.
  const pool = [...unclaimed];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return NextResponse.json({
    total: manifest.length,
    claimed: manifest.length - unclaimed.length,
    available: pool.slice(0, SAMPLE_SIZE),
  });
}
