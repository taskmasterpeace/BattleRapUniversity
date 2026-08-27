/**
 * Newsroom — publishing. Turns a held assignment into a Wire drop and updates
 * the blogger's running lean on the subject (blogger_memory), which is what the
 * battler profile's "THE PRESS" panel reads.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { copyFor, fillCopy } from './copy';
import { primaryBeat } from './beats';

type Lead = {
  id: string;
  lead_type: string;
  category: string;
  subcategory: string | null;
  subject_battler_id: string;
  secondary_battler_id: string | null;
  source_ref_id: string | null;
  headline_hint: string;
  heat: number;
};

type Account = {
  id: string;
  handle: string;
  display_name: string;
  influence: number;
  credibility: number;
  controversy_tolerance: number;
};

/** Subcategory tone → how this coverage moves the blogger's sentiment on the subject. */
const NEGATIVE = new Set([
  'bad_night', 'slump', 'confidence', 'mental', 'broke', 'got_stiffed', 'robbed',
  'exposed', 'ducking', 'arrest', 'disrespect', 'betrayal', 'controversy', 'vice',
]);
const POSITIVE = new Set([
  'statement_win', 'hot_streak', 'come_up', 'sponsorship', 'family', 'milestone',
  'crew', 'camp', 'grind', 'faith',
]);

function beatTone(subcategory: string | null, controversyTolerance: number): {
  positive: number; neutral: number; negative: number;
} {
  let base = { positive: 34, neutral: 33, negative: 33 };
  if (POSITIVE.has(subcategory ?? '')) base = { positive: 72, neutral: 22, negative: 6 };
  else if (NEGATIVE.has(subcategory ?? '')) base = { positive: 10, neutral: 24, negative: 66 };
  // Drama-hungry bloggers skew a touch more negative on anything.
  if (controversyTolerance >= 80) {
    const shift = 8;
    base = {
      positive: Math.max(0, base.positive - shift),
      neutral: base.neutral,
      negative: Math.min(100, base.negative + shift),
    };
  }
  return base;
}

const FEED_BY_BEAT: Record<string, string> = {
  smoke: 'rumor_mill',
  breaking: 'for_you',
  moments: 'for_you',
  rankings: 'for_you',
  money: 'for_you',
  culture: 'for_you',
  leagues: 'league_wire',
};

async function recordCoverage(
  supabase: SupabaseClient,
  bloggerName: string,
  subjectId: string,
  subcategory: string | null,
  narrative: string,
  controversyTolerance: number
): Promise<void> {
  const tone = beatTone(subcategory, controversyTolerance);
  const { data: existing } = await supabase
    .from('blogger_memory')
    .select('id, total_articles, sentiment_positive, sentiment_neutral, sentiment_negative')
    .eq('blogger_name', bloggerName)
    .eq('entity_type', 'battler')
    .eq('entity_id', subjectId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('blogger_memory')
      .update({
        total_articles: (existing as any).total_articles + 1,
        sentiment_positive: Math.round(((existing as any).sentiment_positive + tone.positive) / 2),
        sentiment_neutral: Math.round(((existing as any).sentiment_neutral + tone.neutral) / 2),
        sentiment_negative: Math.round(((existing as any).sentiment_negative + tone.negative) / 2),
        recent_narrative: narrative,
        last_covered_at: new Date().toISOString(),
      })
      .eq('id', (existing as any).id);
  } else {
    await supabase.from('blogger_memory').insert({
      blogger_name: bloggerName,
      entity_type: 'battler',
      entity_id: subjectId,
      total_articles: 1,
      sentiment_positive: tone.positive,
      sentiment_neutral: tone.neutral,
      sentiment_negative: tone.negative,
      recent_narrative: narrative,
    });
  }
}

/**
 * Publish a held assignment. Returns the new wire_post id (or null on failure).
 * Marks the assignment published and flips the lead to published.
 */
export async function publishAssignment(
  supabase: SupabaseClient,
  assignment: { id: string; lead_id: string; account_id: string; sit_reason: string },
  lead: Lead,
  account: Account
): Promise<string | null> {
  // Names for copy fill.
  const ids = [lead.subject_battler_id, lead.secondary_battler_id].filter(Boolean) as string[];
  const { data: names } = await supabase.from('battlers').select('id, stage_name').in('id', ids);
  const nameOf = (id: string | null) =>
    id ? names?.find((n) => n.id === id)?.stage_name ?? 'a battler' : null;

  const set = copyFor(lead.subcategory);
  const pool = assignment.sit_reason === 'breaking' ? set.breaking : set.developing;
  const line = fillCopy(pool[Math.floor(Math.random() * pool.length)], {
    subject: nameOf(lead.subject_battler_id) ?? 'a battler',
    other: nameOf(lead.secondary_battler_id),
    hint: lead.headline_hint,
  });

  const beat = primaryBeat(lead.subcategory);
  const heat = Math.max(20, lead.heat);
  const props = Math.max(4, Math.round(account.influence * (heat / 12) + Math.random() * account.influence * 4));
  const boosts = Math.round(props * (0.12 + Math.random() * 0.2));
  const replies = Math.round(props * (0.06 + Math.random() * 0.16));

  const post = {
    account_id: account.id,
    body: line,
    category: beat === 'smoke' ? 'rumor' : beat === 'moments' ? 'reaction' : 'blog',
    feed_hint: FEED_BY_BEAT[beat] ?? 'for_you',
    battle_id: ['battle', 'beef', 'streak'].includes(lead.lead_type) ? lead.source_ref_id : null,
    life_event_id: lead.lead_type === 'life_event' ? lead.source_ref_id : null,
    target_battler_id: lead.subject_battler_id,
    crowd_tag: null,
    props,
    boosts,
    replies,
    actionable: null,
    meta_json: {
      newsroom: true,
      lead_id: lead.id,
      beat,
      subcategory: lead.subcategory,
      sit_reason: assignment.sit_reason,
      blogger: account.display_name,
    },
  };

  const { data: inserted, error } = await supabase.from('wire_posts').insert(post).select('id').single();
  if (error) {
    console.error('[newsroom] publish failed', error.message);
    return null;
  }
  const postId = inserted?.id ?? null;

  await supabase
    .from('blogger_assignments')
    .update({ status: 'published', wire_post_id: postId })
    .eq('id', assignment.id);

  await supabase.from('story_leads').update({ status: 'published', updated_at: new Date().toISOString() }).eq('id', lead.id);

  await recordCoverage(
    supabase,
    account.display_name,
    lead.subject_battler_id,
    lead.subcategory,
    line,
    account.controversy_tolerance
  );

  return postId;
}
