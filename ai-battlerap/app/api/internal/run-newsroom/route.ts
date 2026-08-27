import { createClient } from '@supabase/supabase-js';
import { verifyInternalSecret } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { runNewsroomTick } from '@/lib/game/newsroom/engine';
import { createLeadsFromBattle } from '@/lib/game/newsroom/leads';

/**
 * POST /api/internal/run-newsroom
 *
 * The Newsroom tick: decays open leads, lets bloggers LAND stories that fit
 * their beat, has them SIT on those stories (breaking vs developing), DROPS the
 * ones whose timer elapsed as Wire posts, and lets cold stories die.
 *
 * Safe to run on a schedule (hourly/daily). Also fired after each battle so the
 * scene reacts even with no cron.
 *
 * Query params:
 *   ?ticks=N   advance N ticks in one call (1-30, default 1) — dev fast-forward
 *
 * Auth: Authorization: Bearer <INTERNAL_API_SECRET>
 */
export async function POST(request: Request) {
  if (!verifyInternalSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const url = new URL(request.url);
  const ticks = Math.min(30, Math.max(1, parseInt(url.searchParams.get('ticks') ?? '1', 10) || 1));

  // Optional backfill: mint leads from the N most recent completed battles
  // (prod seeding + a way to give the newsroom something to chew on).
  let leadsMinted = 0;
  const fromBattles = Math.min(50, Math.max(0, parseInt(url.searchParams.get('fromBattles') ?? '0', 10) || 0));
  if (fromBattles > 0) {
    const { data: battles } = await supabase
      .from('battles')
      .select('id')
      .eq('status', 'completed')
      .not('winner_battler_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(fromBattles);
    for (const b of battles ?? []) {
      leadsMinted += await createLeadsFromBattle(supabase, (b as any).id);
    }
  }
  // Each fast-forward tick advances the newsroom's simulated clock 12h, so
  // ticks=14 ≈ one week of the scene reacting. A single tick uses real time.
  const TICK_HOURS = 12;
  const base = Date.now();

  const totals = { decayed: 0, claimed: 0, published: 0, wentCold: 0, developing: 0 };
  try {
    for (let i = 0; i < ticks; i++) {
      const nowMs = ticks > 1 ? base + i * TICK_HOURS * 3_600_000 : undefined;
      const r = await runNewsroomTick(supabase, { nowMs });
      totals.decayed += r.decayed;
      totals.claimed += r.claimed;
      totals.published += r.published;
      totals.wentCold += r.wentCold;
      totals.developing = r.developing; // last tick's snapshot
    }
  } catch (err: any) {
    console.error('[Newsroom] tick failed:', err);
    return NextResponse.json(
      { error: 'Newsroom tick failed', detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: `Newsroom ran ${ticks} tick(s): minted ${leadsMinted} lead(s), landed ${totals.claimed}, dropped ${totals.published}, ${totals.developing} developing`,
    leadsMinted,
    ...totals,
  });
}

// Vercel Cron issues GET — keep the scene alive on a schedule (publishes held
// stories whose sit timer elapsed, decays the rest) even between battles.
export const GET = POST;
