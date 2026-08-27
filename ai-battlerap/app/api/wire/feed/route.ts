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

  const [{ data: posts }, heatingUp, actions, { data: developing }] = await Promise.all([
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
    // THE NEWSROOM — stories bloggers have LANDED and are SITTING on. Seeing a
    // story brew before it drops is the point. Newest claims first.
    admin
      .from('blogger_assignments')
      .select(
        'id, sit_reason, publish_after, claimed_at, account:social_accounts(handle, display_name), lead:story_leads(subcategory, category, headline_hint, heat, subject_battler_id, secondary_battler_id)'
      )
      .eq('status', 'holding')
      .order('claimed_at', { ascending: false })
      .limit(12),
  ]);

  // Resolve battler names for developing stories.
  const devRows = developing ?? [];
  const nameIds = new Set<string>();
  for (const d of devRows as any[]) {
    const lead = Array.isArray(d.lead) ? d.lead[0] : d.lead;
    if (lead?.subject_battler_id) nameIds.add(lead.subject_battler_id);
    if (lead?.secondary_battler_id) nameIds.add(lead.secondary_battler_id);
  }
  const nameMap = new Map<string, string>();
  if (nameIds.size > 0) {
    const { data: names } = await admin.from('battlers').select('id, stage_name').in('id', [...nameIds]);
    for (const n of names ?? []) nameMap.set(n.id, n.stage_name);
  }
  const developingStories = (devRows as any[]).map((d) => {
    const lead = Array.isArray(d.lead) ? d.lead[0] : d.lead;
    const account = Array.isArray(d.account) ? d.account[0] : d.account;
    return {
      id: d.id,
      sitReason: d.sit_reason,
      publishAfter: d.publish_after,
      blogger: account?.display_name ?? account?.handle ?? 'A blogger',
      handle: account?.handle ?? '',
      subcategory: lead?.subcategory ?? null,
      category: lead?.category ?? null,
      heat: lead?.heat ?? 0,
      hint: lead?.headline_hint ?? '',
      subject: lead?.subject_battler_id ? nameMap.get(lead.subject_battler_id) ?? null : null,
      other: lead?.secondary_battler_id ? nameMap.get(lead.secondary_battler_id) ?? null : null,
    };
  });

  return NextResponse.json({
    posts: posts ?? [],
    heatingUp,
    myBattlerId: battler?.id ?? null,
    myStageName: battler?.stage_name ?? null,
    myActions: (actions.data ?? []).filter((a) => a.post_id),
    developing: developingStories,
  });
}
