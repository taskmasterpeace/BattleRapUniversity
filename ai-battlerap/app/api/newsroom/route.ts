import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';

/**
 * THE NEWSROOM — read model for the desk view.
 * developing: stories bloggers have landed and are sitting on.
 * dropped:    recently published newsroom Wire posts.
 * cold:       leads that died unpublished (sat on too long / nobody bit).
 * bloggers:   the roster with influence + what they're each holding.
 */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createServerSupabaseClient();

  const [{ data: holding }, { data: dropped }, { data: cold }, { data: bloggers }] = await Promise.all([
    supabase
      .from('blogger_assignments')
      .select(
        'id, sit_reason, publish_after, claimed_at, account:social_accounts(handle, display_name, influence), lead:story_leads(subcategory, category, headline_hint, heat, subject_battler_id, secondary_battler_id)'
      )
      .eq('status', 'holding')
      .order('publish_after', { ascending: true })
      .limit(30),
    supabase
      .from('wire_posts')
      .select('id, body, created_at, meta_json, account:social_accounts(handle, display_name)')
      .eq('meta_json->>newsroom', 'true')
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('story_leads')
      .select('id, subcategory, category, headline_hint, subject_battler_id, updated_at')
      .eq('status', 'cold')
      .order('updated_at', { ascending: false })
      .limit(10),
    supabase
      .from('social_accounts')
      .select('handle, display_name, influence, credibility, posting_frequency')
      .eq('kind', 'blogger')
      .order('influence', { ascending: false }),
  ]);

  // Resolve battler names across all sections.
  const ids = new Set<string>();
  const addLeadIds = (row: any) => {
    const lead = Array.isArray(row?.lead) ? row.lead[0] : row?.lead;
    if (lead?.subject_battler_id) ids.add(lead.subject_battler_id);
    if (lead?.secondary_battler_id) ids.add(lead.secondary_battler_id);
  };
  (holding ?? []).forEach(addLeadIds);
  (cold ?? []).forEach((c: any) => c.subject_battler_id && ids.add(c.subject_battler_id));
  const nameMap = new Map<string, string>();
  if (ids.size > 0) {
    const { data: names } = await supabase.from('battlers').select('id, stage_name').in('id', [...ids]);
    for (const n of names ?? []) nameMap.set(n.id, n.stage_name);
  }

  const developing = (holding ?? []).map((d: any) => {
    const lead = Array.isArray(d.lead) ? d.lead[0] : d.lead;
    const acc = Array.isArray(d.account) ? d.account[0] : d.account;
    return {
      id: d.id,
      sitReason: d.sit_reason,
      publishAfter: d.publish_after,
      claimedAt: d.claimed_at,
      blogger: acc?.display_name ?? acc?.handle ?? 'A blogger',
      handle: acc?.handle ?? '',
      influence: acc?.influence ?? 0,
      subcategory: lead?.subcategory ?? null,
      category: lead?.category ?? null,
      heat: lead?.heat ?? 0,
      hint: lead?.headline_hint ?? '',
      subject: lead?.subject_battler_id ? nameMap.get(lead.subject_battler_id) ?? null : null,
      other: lead?.secondary_battler_id ? nameMap.get(lead.secondary_battler_id) ?? null : null,
    };
  });

  return NextResponse.json({
    developing,
    dropped: (dropped ?? []).map((p: any) => {
      const acc = Array.isArray(p.account) ? p.account[0] : p.account;
      return {
        id: p.id,
        body: p.body,
        createdAt: p.created_at,
        blogger: acc?.handle ?? acc?.display_name ?? '',
        beat: p.meta_json?.beat ?? null,
        subcategory: p.meta_json?.subcategory ?? null,
        sitReason: p.meta_json?.sit_reason ?? null,
      };
    }),
    cold: (cold ?? []).map((c: any) => ({
      id: c.id,
      subcategory: c.subcategory,
      hint: c.headline_hint,
      subject: c.subject_battler_id ? nameMap.get(c.subject_battler_id) ?? null : null,
    })),
    bloggers: (bloggers ?? []).map((b: any) => ({
      handle: b.handle,
      name: b.display_name,
      influence: b.influence,
      credibility: b.credibility,
      frequency: b.posting_frequency,
      holdingCount: developing.filter((d) => d.handle === b.handle).length,
    })),
  });
}
