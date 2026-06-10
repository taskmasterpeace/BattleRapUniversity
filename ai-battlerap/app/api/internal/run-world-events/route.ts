import { createClient } from '@supabase/supabase-js';
import { verifyInternalSecret } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { runWorldEventsTick } from '@/lib/game/worldEvents/generator';

/**
 * POST /api/internal/run-world-events
 *
 * World Events tick: generates 2-4 battle-rap world news articles
 * (callouts, beef, league business, culture, career arcs, city scenes,
 * rankings reactions, lifestyle) from live world state.
 *
 * Idempotent and safe to run hourly — template codes are not repeated
 * within 7 days (tracked via news_articles.meta_json->>'world_event_code').
 *
 * Query params (dev convenience):
 *   ?ticks=N   run N ticks in one call (1-10, default 1)
 *   ?count=N   force N articles per tick (1-6, default random 2-4)
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
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const url = new URL(request.url);
  const ticks = Math.min(10, Math.max(1, parseInt(url.searchParams.get('ticks') ?? '1', 10) || 1));
  const countParam = url.searchParams.get('count');
  const count = countParam ? Math.min(6, Math.max(1, parseInt(countParam, 10) || 0)) || undefined : undefined;

  const allInserted: any[] = [];
  const allSkipped: any[] = [];
  let poolSizes;

  try {
    for (let i = 0; i < ticks; i++) {
      const result = await runWorldEventsTick(supabase, { count });
      allInserted.push(...result.inserted);
      allSkipped.push(...result.skipped);
      poolSizes = result.poolSizes;
    }
  } catch (err: any) {
    console.error('[WorldEvents] tick failed:', err);
    return NextResponse.json(
      { error: 'World events tick failed', detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: `Generated ${allInserted.length} world event article(s) across ${ticks} tick(s)`,
    inserted: allInserted,
    skipped: allSkipped,
    poolSizes,
  });
}
