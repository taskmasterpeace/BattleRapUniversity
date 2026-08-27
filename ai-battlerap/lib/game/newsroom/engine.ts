/**
 * THE NEWSROOM — the tick.
 *
 * Each tick moves every story one step through its life:
 *   decay   — open leads cool fast, worked leads cool slow
 *   claim   — bloggers score the open leads; whoever fits best LANDS it, and
 *             decides how long to SIT on it (breaking vs developing vs backburner)
 *   publish — any held story whose sit timer elapsed DROPS as a Wire post
 *   kill    — leads nobody wanted, or held past their heat, go COLD
 *
 * Runs on battle completion and from /api/internal/run-newsroom (cron-friendly).
 * Idempotent-ish: safe to run repeatedly; only elapsed timers publish.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { beatAffinity } from './beats';
import { publishAssignment } from './publish';

const HEAT_DECAY_OPEN = 0.8;      // unclaimed: cools fast
const HEAT_DECAY_CLAIMED = 0.93;  // being worked: cools slow
const COLD_THRESHOLD = 12;
const MIN_INTEREST = 0.38;        // a blogger needs this composite to bite
const SECOND_CLAIM_HEAT = 66;     // only hot leads get competing coverage
const SECOND_CLAIM_MIN = 0.52;
const HOUR = 3_600_000;

export interface NewsroomTickResult {
  decayed: number;
  claimed: number;
  published: number;
  wentCold: number;
  developing: number; // leads currently claimed-and-holding after the tick
}

type Account = {
  id: string; handle: string; display_name: string;
  voice_profile: string; influence: number; credibility: number;
  controversy_tolerance: number; posting_frequency: number;
};

type Lead = {
  id: string; lead_type: string; category: string; subcategory: string | null;
  subject_battler_id: string; secondary_battler_id: string | null;
  source_ref_id: string | null; headline_hint: string; heat: number;
  status: string; claim_count: number; created_at: string;
};

/** Composite desire of one blogger for one lead. 0 = wouldn't touch it. */
function scoreLead(
  acc: Account,
  lead: Lead,
  history: Map<string, number>, // key `${display_name}|${battlerId}` -> total_articles
  load: number,                 // stories this blogger is already holding
  jitter: number
): number {
  const affinity = beatAffinity(acc.handle, acc.voice_profile, lead.subcategory);
  if (affinity <= 0) return 0;

  let score = affinity * (0.55 + (acc.influence / 100) * 0.45);

  // A blogger already buried in stories is less hungry for another — spreads
  // coverage across the desk instead of one blog scooping everything.
  score -= Math.min(0.4, load * 0.12);

  // Continuity: a blogger who's covered this battler wants the follow-up.
  const prior = history.get(`${acc.display_name}|${lead.subject_battler_id}`) ?? 0;
  if (prior > 0) score += Math.min(0.32, 0.14 + prior * 0.05);

  // Drama fit: scandal leads pull hard on high-controversy bloggers.
  if (lead.category === 'scandal') {
    score += (acc.controversy_tolerance / 100) * 0.22;
  } else if (acc.controversy_tolerance >= 80) {
    // The drama merchant is lukewarm on wholesome beats.
    score -= 0.08;
  }

  // Heat pulls everyone a little.
  score += (lead.heat / 100) * 0.2;

  return score + jitter;
}

/** Decide the sit: how long they hold it, and how they'll frame it. */
function decideSit(heat: number, postingFrequency: number): { hours: number; reason: string } {
  let reason: string;
  let base: number; // hours
  if (heat >= 80) { reason = 'breaking'; base = 2 + Math.random() * 8; }
  else if (heat >= 60) { reason = 'developing'; base = 24 + Math.random() * 48; }
  else if (heat >= 40) { reason = 'building_it'; base = 72 + Math.random() * 72; }
  else { reason = 'backburner'; base = 144 + Math.random() * 120; }
  // Higher posting_frequency → shorter sit. 0.9 → ×0.45, 0.6 → ×0.75.
  const hours = base * (1.35 - postingFrequency);
  return { hours, reason };
}

export async function runNewsroomTick(
  supabase: SupabaseClient,
  opts: { nowMs?: number } = {}
): Promise<NewsroomTickResult> {
  const res: NewsroomTickResult = { decayed: 0, claimed: 0, published: 0, wentCold: 0, developing: 0 };
  // Simulated clock: the API can advance this per tick to fast-forward the scene.
  // In production the cron runs at real intervals, so the default is wall time.
  const now = opts.nowMs ?? Date.now();

  // ---- Load state ----
  const [{ data: accounts }, { data: leads }, { data: memory }] = await Promise.all([
    supabase
      .from('social_accounts')
      .select('id, handle, display_name, voice_profile, influence, credibility, controversy_tolerance, posting_frequency')
      .eq('kind', 'blogger'),
    supabase
      .from('story_leads')
      .select('*')
      .in('status', ['open', 'claimed'])
      .order('heat', { ascending: false })
      .limit(200),
    supabase
      .from('blogger_memory')
      .select('blogger_name, entity_id, total_articles')
      .eq('entity_type', 'battler'),
  ]);

  if (!accounts || accounts.length === 0 || !leads) return res;

  const history = new Map<string, number>();
  for (const m of memory ?? []) {
    history.set(`${(m as any).blogger_name}|${(m as any).entity_id}`, (m as any).total_articles);
  }

  // Which accounts already hold which leads (avoid double-claim).
  const { data: holdings } = await supabase
    .from('blogger_assignments')
    .select('lead_id, account_id, status')
    .in('status', ['holding']);
  const heldBy = new Map<string, Set<string>>(); // lead_id -> set(account_id)
  const loadByAccount = new Map<string, number>(); // account_id -> stories held
  for (const h of holdings ?? []) {
    if (!heldBy.has((h as any).lead_id)) heldBy.set((h as any).lead_id, new Set());
    heldBy.get((h as any).lead_id)!.add((h as any).account_id);
    loadByAccount.set((h as any).account_id, (loadByAccount.get((h as any).account_id) ?? 0) + 1);
  }

  // ---- 1. Claim (on FRESH heat — a lead is hottest the moment it breaks) ----
  for (const lead of leads as Lead[]) {
    if (lead.heat < COLD_THRESHOLD) continue; // too cold to interest anyone now
    const already = heldBy.get(lead.id) ?? new Set<string>();
    const wantSecond = lead.heat >= SECOND_CLAIM_HEAT && already.size < 2;
    const slots = already.size === 0 ? 1 : wantSecond ? 1 : 0;
    if (slots === 0) continue;

    // Score every eligible blogger.
    const ranked = accounts
      .filter((a) => !already.has(a.id))
      .map((a) => ({
        a: a as Account,
        s: scoreLead(a as Account, lead, history, loadByAccount.get(a.id) ?? 0, (Math.random() - 0.5) * 0.16),
      }))
      .filter((x) => x.s >= (already.size === 0 ? MIN_INTEREST : SECOND_CLAIM_MIN))
      .sort((x, y) => y.s - x.s);

    for (let i = 0; i < slots && i < ranked.length; i++) {
      const winner = ranked[i].a;
      const sit = decideSit(lead.heat, winner.posting_frequency);
      const { error } = await supabase.from('blogger_assignments').insert({
        lead_id: lead.id,
        account_id: winner.id,
        publish_after: new Date(now + sit.hours * HOUR).toISOString(),
        sit_reason: sit.reason,
        status: 'holding',
        meta_json: { score: Math.round(ranked[i].s * 100) / 100 },
      });
      if (!error) {
        res.claimed++;
        already.add(winner.id);
        loadByAccount.set(winner.id, (loadByAccount.get(winner.id) ?? 0) + 1);
        await supabase
          .from('story_leads')
          .update({ status: 'claimed', claim_count: already.size, updated_at: new Date().toISOString() })
          .eq('id', lead.id);
      }
    }
  }

  // ---- 2. Publish held stories whose sit timer elapsed ----
  const { data: due } = await supabase
    .from('blogger_assignments')
    .select('id, lead_id, account_id, sit_reason')
    .eq('status', 'holding')
    .lte('publish_after', new Date(now).toISOString())
    .limit(100);

  for (const asg of due ?? []) {
    const { data: lead } = await supabase.from('story_leads').select('*').eq('id', (asg as any).lead_id).single();
    if (!lead) continue;
    // If the story went cold while held, the blogger sat on it too long → kill it.
    if ((lead as any).heat < COLD_THRESHOLD) {
      await supabase.from('blogger_assignments').update({ status: 'killed' }).eq('id', (asg as any).id);
      continue;
    }
    const acc = accounts.find((a) => a.id === (asg as any).account_id);
    if (!acc) continue;
    const postId = await publishAssignment(supabase, asg as any, lead as any, acc as any);
    if (postId) res.published++;
  }

  // ---- 3. Decay (time passing) — cools whatever is still open or being worked ----
  for (const lead of leads as Lead[]) {
    // Skip leads that just got published this tick.
    const { data: fresh } = await supabase.from('story_leads').select('status, heat').eq('id', lead.id).single();
    if (!fresh || (fresh as any).status === 'published' || (fresh as any).status === 'cold') continue;
    const factor = (fresh as any).status === 'open' ? HEAT_DECAY_OPEN : HEAT_DECAY_CLAIMED;
    await supabase
      .from('story_leads')
      .update({ heat: Math.round((fresh as any).heat * factor), updated_at: new Date().toISOString() })
      .eq('id', lead.id);
    res.decayed++;
  }

  // ---- 4. Kill cold leads (unclaimed or abandoned) ----
  const { data: coldLeads } = await supabase
    .from('story_leads')
    .select('id')
    .in('status', ['open', 'claimed'])
    .lt('heat', COLD_THRESHOLD)
    .limit(200);
  for (const c of coldLeads ?? []) {
    await supabase.from('story_leads').update({ status: 'cold', updated_at: new Date().toISOString() }).eq('id', (c as any).id);
    await supabase.from('blogger_assignments').update({ status: 'killed' }).eq('lead_id', (c as any).id).eq('status', 'holding');
    res.wentCold++;
  }

  // Count what's still developing (for the UI).
  const { count } = await supabase
    .from('blogger_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'holding');
  res.developing = count ?? 0;

  return res;
}
