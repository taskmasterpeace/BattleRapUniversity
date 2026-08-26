import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getHeatingUp } from '@/lib/game/wire/engine';

/**
 * THE WIRE — feed API.
 * Returns the latest drops (with author accounts), Heating Up (trending
 * crowd tags), the caller's battler id, and which posts they've already
 * acted on. Spec: docs/design/THE_WIRE_SOCIAL_NETWORK.md
 */
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: battler } = await supabase
    .from('battlers')
    .select('id, stage_name')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [{ data: posts }, heatingUp, actions] = await Promise.all([
    admin
      .from('wire_posts')
      .select(
        'id, body, category, feed_hint, battle_id, target_battler_id, crowd_tag, props, boosts, replies, actionable, created_at, account:social_accounts(handle, display_name, kind, stamped)'
      )
      .order('created_at', { ascending: false })
      .limit(80),
    getHeatingUp(admin, 5),
    battler
      ? admin
          .from('wire_player_actions')
          .select('post_id, action, stance')
          .eq('battler_id', battler.id)
      : Promise.resolve({ data: [] as { post_id: string | null; action: string; stance: string | null }[] }),
  ]);

  return NextResponse.json({
    posts: posts ?? [],
    heatingUp,
    myBattlerId: battler?.id ?? null,
    myStageName: battler?.stage_name ?? null,
    myActions: (actions.data ?? []).filter((a) => a.post_id),
  });
}
