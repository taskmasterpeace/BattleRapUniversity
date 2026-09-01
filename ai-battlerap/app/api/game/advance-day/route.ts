/**
 * POST /api/game/advance-day
 *
 * The player-facing "a day passed because I acted" hook for the action-based
 * clock (TIME_SYSTEM_DECISION.md — Option A). Advances the CALLER'S OWN battler
 * game_day, logs the advance, and returns the new day plus career tier.
 *
 * Request body (all optional):
 * {
 *   "actionType": "prep_day" | "rest" | "battle" | "travel" | "advance" | string,  // default "advance"
 *   "note":       string,   // optional context stored on the history row
 *   "days":       number    // how many game-days to advance (default 1, min 1)
 * }
 *
 * Response: { "gameDay": number, "tier": string, "actionType": string }
 *
 * Auth: the user must be signed in and own a non-AI battler. The advance itself
 * runs through a service-role client (game_day_history is RLS-locked and the
 * battlers update should bypass user RLS), but it ONLY ever targets the battler
 * proven to belong to this user — ownership is established by user_id before the
 * service-role write, so the elevated client can't be steered at another player.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/db/server';
import { advanceGameDay, getCareerTier } from '@/lib/game/time/gameTime';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the caller.
    const userClient = await createServerSupabaseClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Resolve the caller's OWN battler. Ownership is proven here by user_id;
    //    the service-role write below only ever targets this id.
    const { data: battler } = await userClient
      .from('battlers')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_ai', false)
      .maybeSingle();

    if (!battler) {
      return NextResponse.json({ error: 'Battler not found' }, { status: 404 });
    }

    // 3. Parse the body defensively (empty/invalid body → sensible defaults).
    const body = await request.json().catch(() => ({} as any));
    const actionType: string =
      typeof body?.actionType === 'string' && body.actionType.trim()
        ? body.actionType.trim()
        : 'advance';
    const note: string | undefined =
      typeof body?.note === 'string' ? body.note : undefined;
    const days: number =
      Number.isFinite(body?.days) && body.days > 0 ? Math.trunc(body.days) : 1;

    // 4. Advance via a service-role client (bypasses RLS; touches only the
    //    owned battler + its history row).
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const gameDay = await advanceGameDay(service, battler.id, actionType, note, days);
    const tier = getCareerTier(gameDay);

    return NextResponse.json({ gameDay, tier, actionType });
  } catch (error: any) {
    console.error('advance-day route failed:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to advance game day' },
      { status: 500 }
    );
  }
}
