/**
 * Newsroom — lead creation. A happening in the world becomes a story_lead
 * waiting for a blogger to bite. Fire-and-forget from sim/resolve paths.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

const SEVERITY_HEAT: Record<string, number> = {
  minor: 28,
  moderate: 46,
  major: 66,
  critical: 84,
};

/** Pick a random phrasing so the newsroom doesn't headline every result identically. */
function pickHint(variants: string[]): string {
  return variants[Math.floor(Math.random() * variants.length)];
}

function isFixture(name: string | null | undefined): boolean {
  if (!name) return true;
  return /^test/i.test(name) || /^pvp challenger/i.test(name) || name.includes('_');
}

async function fameBoost(supabase: SupabaseClient, battlerId: string): Promise<number> {
  const { data } = await supabase
    .from('battler_attributes')
    .select('public_knowledge')
    .eq('battler_id', battlerId)
    .maybeSingle();
  const pk = (data as any)?.public_knowledge ?? 0;
  return Math.round((pk / 100) * 20); // up to +20 heat for a household name
}

/** Insert a lead, ignoring the (source, type, subcategory) uniqueness collision. */
async function insertLead(
  supabase: SupabaseClient,
  lead: {
    lead_type: string;
    category: string;
    subcategory: string | null;
    subject_battler_id: string;
    secondary_battler_id?: string | null;
    source_ref_id?: string | null;
    headline_hint: string;
    summary?: string | null;
    heat: number;
    meta_json?: Record<string, unknown>;
  }
): Promise<string | null> {
  // Don't open a SECOND live story on the same battler + beat — one "hot streak"
  // or "beef" brewing at a time. If one's already live, feed its heat instead.
  const { data: live } = await supabase
    .from('story_leads')
    .select('id, heat')
    .eq('subject_battler_id', lead.subject_battler_id)
    .eq('subcategory', lead.subcategory ?? '')
    .in('status', ['open', 'claimed'])
    .limit(1)
    .maybeSingle();
  if (live) {
    // A fresh instance of the same story nudges the one already developing —
    // gently, and capped, so a recurring rivalry doesn't rocket to "breaking".
    await supabase
      .from('story_leads')
      .update({ heat: Math.min(88, Math.round((live as any).heat + lead.heat * 0.2)), updated_at: new Date().toISOString() })
      .eq('id', (live as any).id);
    return null;
  }

  const { data, error } = await supabase
    .from('story_leads')
    .insert({
      ...lead,
      heat: Math.max(0, Math.round(lead.heat)),
      secondary_battler_id: lead.secondary_battler_id ?? null,
      source_ref_id: lead.source_ref_id ?? null,
      summary: lead.summary ?? null,
      meta_json: lead.meta_json ?? {},
    })
    .select('id')
    .single();
  if (error) {
    // 23505 = unique violation → this happening already spawned this lead. Fine.
    if ((error as any).code !== '23505') {
      console.error('[newsroom] insertLead failed', error.message);
    }
    return null;
  }
  return data?.id ?? null;
}

/**
 * A resolved OR freshly-fired life event can become news. Not every event —
 * only ones the culture would actually talk about (major/critical, or a
 * naturally public beat). Keeps the newsroom from covering a quiet rest day.
 */
export async function createLeadFromLifeEvent(
  supabase: SupabaseClient,
  lifeEventId: string
): Promise<string | null> {
  const { data: event } = await supabase
    .from('battler_life_events')
    .select(
      `id, battler_id, details_json,
       template:life_event_templates!battler_life_events_template_code_fkey(code, title, description, category, subcategory, severity),
       battler:battlers!battler_life_events_battler_id_fkey(stage_name)`
    )
    .eq('id', lifeEventId)
    .single();
  if (!event) return null;

  const template: any = Array.isArray(event.template) ? event.template[0] : event.template;
  const battler: any = Array.isArray(event.battler) ? event.battler[0] : event.battler;
  if (!template || isFixture(battler?.stage_name)) return null;

  const severity = template.severity ?? 'moderate';
  // Public beats are worth covering even at lower severity; private ones need weight.
  const publicBeat = ['scandal', 'career', 'financial'].includes(template.category);
  const worthy = severity === 'major' || severity === 'critical' || (publicBeat && severity === 'moderate');
  if (!worthy) return null;

  const heat = SEVERITY_HEAT[severity] + (await fameBoost(supabase, event.battler_id));

  return insertLead(supabase, {
    lead_type: 'life_event',
    category: template.category ?? 'career',
    subcategory: template.subcategory ?? null,
    subject_battler_id: event.battler_id,
    source_ref_id: lifeEventId,
    headline_hint: template.title ?? 'a moment worth talking about',
    summary: template.description ?? null,
    heat,
    meta_json: { template_code: template.code },
  });
}

/**
 * A completed battle spawns the newsroom's bread-and-butter leads: the result
 * itself, plus a rivalry/beef angle when the two have history, plus a streak
 * angle when the winner is running.
 */
export async function createLeadsFromBattle(
  supabase: SupabaseClient,
  battleId: string
): Promise<number> {
  const { data: battle } = await supabase
    .from('battles')
    .select('id, battler_player_id, battler_ai_id, winner_battler_id, league_id')
    .eq('id', battleId)
    .single();
  if (!battle || !battle.winner_battler_id) return 0;

  const winnerId = battle.winner_battler_id;
  const loserId = winnerId === battle.battler_player_id ? battle.battler_ai_id : battle.battler_player_id;

  const [{ data: battlers }, { data: rounds }] = await Promise.all([
    supabase.from('battlers').select('id, stage_name').in('id', [winnerId, loserId]),
    supabase.from('battle_rounds').select('battler_id, crowd_reaction, won').eq('battle_id', battleId),
  ]);
  if (!battlers || !rounds || rounds.length === 0) return 0;
  const nameOf = (id: string) => battlers.find((b) => b.id === id)?.stage_name ?? '';
  if (isFixture(nameOf(winnerId)) || isFixture(nameOf(loserId))) return 0;

  const winnerRounds = rounds.filter((r) => r.battler_id === winnerId);
  const loserRounds = rounds.filter((r) => r.battler_id === loserId);
  const wWon = winnerRounds.filter((r) => r.won).length;
  const lWon = loserRounds.filter((r) => r.won).length;
  const crowd = (rs: typeof rounds) => (rs.length ? rs.reduce((s, r) => s + r.crowd_reaction, 0) / rs.length : 0);
  const winnerName = nameOf(winnerId);
  const loserName = nameOf(loserId);

  let created = 0;

  // 1. The result. Shape the beat by how it went.
  let subcategory = 'close_call';
  let heat = 52;
  let hint = pickHint([
    `${winnerName} took it ${wWon}-${lWon} over ${loserName}.`,
    `${winnerName} got the ${wWon}-${lWon} nod over ${loserName}.`,
    `Cards said ${winnerName}, ${wWon}-${lWon}, over ${loserName}.`,
  ]);
  if (wWon >= 3 && lWon === 0) {
    subcategory = 'statement_win';
    heat = 70;
    hint = `${winnerName} swept ${loserName} clean.`;
  } else if (crowd(loserRounds) > crowd(winnerRounds) + 8) {
    // The loser had the room — a robbery narrative, and it's about the LOSER.
    if (
      (await insertLead(supabase, {
        lead_type: 'battle',
        category: 'scandal',
        subcategory: 'robbed',
        subject_battler_id: loserId,
        secondary_battler_id: winnerId,
        source_ref_id: battleId,
        headline_hint: `${loserName} had the crowd but lost the cards to ${winnerName}.`,
        heat: 74,
        meta_json: { verdict: `${wWon}-${lWon}` },
      })) !== null
    )
      created++;
  }

  if (
    (await insertLead(supabase, {
      lead_type: 'battle',
      category: 'career',
      subcategory,
      subject_battler_id: winnerId,
      secondary_battler_id: loserId,
      source_ref_id: battleId,
      headline_hint: hint,
      heat,
      meta_json: { verdict: `${wWon}-${lWon}` },
    })) !== null
  )
    created++;

  // 2. Beef angle if these two have history.
  const { data: rel } = await supabase
    .from('battler_relationships')
    .select('origin_story')
    .or(
      `and(battler_a_id.eq.${winnerId},battler_b_id.eq.${loserId}),and(battler_a_id.eq.${loserId},battler_b_id.eq.${winnerId})`
    )
    .eq('status', 'active')
    .maybeSingle();
  if (rel) {
    if (
      (await insertLead(supabase, {
        lead_type: 'beef',
        category: 'scandal',
        subcategory: 'beef',
        subject_battler_id: winnerId,
        secondary_battler_id: loserId,
        source_ref_id: battleId,
        headline_hint: pickHint([
          `${winnerName} and ${loserName} ran it back, and it’s still not squashed.`,
          `Round two of ${winnerName} vs ${loserName} settled nothing. This one’s got legs.`,
          `${winnerName} beat ${loserName} again — and the beef only got louder for it.`,
          `${winnerName} and ${loserName} keep finding each other. The scene isn’t mad about it.`,
        ]),
        summary: (rel as any).origin_story ?? null,
        heat: 68,
      })) !== null
    )
      created++;
  }

  // 3. Streak angle if the winner is running.
  const { data: ranking } = await supabase
    .from('rankings')
    .select('streak')
    .eq('battler_id', winnerId)
    .maybeSingle();
  const streak = (ranking as any)?.streak ?? 0;
  if (streak >= 3) {
    if (
      (await insertLead(supabase, {
        lead_type: 'streak',
        category: 'career',
        subcategory: 'hot_streak',
        subject_battler_id: winnerId,
        source_ref_id: battleId,
        headline_hint: `${winnerName} is ${streak} in a row now.`,
        heat: 58 + Math.min(20, streak * 2),
        meta_json: { streak },
      })) !== null
    )
      created++;
  }

  return created;
}
