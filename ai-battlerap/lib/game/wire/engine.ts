/**
 * THE WIRE — dynamic post engine (MVP).
 *
 * Pipeline (spec: docs/design/THE_WIRE_SOCIAL_NETWORK.md):
 *   Simulation event → world reacts by role/relationship → templates selected
 *   → variables filled from game state → posts appear with simulated engagement.
 *
 * Deterministic per battle (seeded by battle id) so the same battle always
 * produces the same conversation. Templates first — no live LLM dependency.
 * Bodies are described moments/reactions ONLY, never invented rap bars.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { fnv1a } from '@/lib/game/crowdLanes';
import { VOICE_BANK_MAP, type PostAspect } from './voices';

type WireAccount = {
  id: string;
  handle: string;
  kind: string;
  battler_id: string | null;
  league_id: string | null;
  voice_profile: string;
  influence: number;
  posting_frequency: number;
};

/** Small deterministic PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const stripName = (name: string) => name.replace(/[^a-zA-Z0-9]/g, '');

/** Per-aspect "heat" — how much the timeline cares. Drives engagement numbers. */
const ASPECT_HEAT: Record<PostAspect, number> = {
  haymaker: 90,
  robbery: 85,
  choke: 80,
  debatable: 70,
  gloat: 65,
  clean_sweep: 60,
  cold_room: 50,
  league_result: 45,
};

const ASPECT_CATEGORY: Record<PostAspect, string> = {
  haymaker: 'viral_clip',
  robbery: 'reaction',
  choke: 'meme',
  debatable: 'reaction',
  gloat: 'callout',
  clean_sweep: 'reaction',
  cold_room: 'reaction',
  league_result: 'league_news',
};

/**
 * Fan the completed battle out into Wire drops. Idempotent per battle.
 * Fire-and-forget from the sim — never throws.
 */
export async function emitWirePostsForBattle(
  battleId: string,
  supabase: SupabaseClient
): Promise<void> {
  try {
    // Idempotency: one conversation per battle.
    const { data: existing } = await supabase
      .from('wire_posts')
      .select('id')
      .eq('battle_id', battleId)
      .limit(1);
    if (existing && existing.length > 0) return;

    const { data: battle } = await supabase
      .from('battles')
      .select('id, league_id, battler_player_id, battler_ai_id, winner_battler_id')
      .eq('id', battleId)
      .single();
    if (!battle || !battle.winner_battler_id) return;

    const [{ data: battlers }, { data: rounds }, { data: segments }] = await Promise.all([
      supabase
        .from('battlers')
        .select('id, stage_name, is_ai')
        .in('id', [battle.battler_player_id, battle.battler_ai_id]),
      supabase
        .from('battle_rounds')
        .select('round_index, battler_id, crowd_reaction, peak_score, choked, won')
        .eq('battle_id', battleId),
      supabase
        .from('battle_segments')
        .select('round_index, battler_id, event_flags')
        .eq('battle_id', battleId),
    ]);
    if (!battlers || battlers.length < 2 || !rounds || rounds.length === 0) return;

    const nameOf = (id: string) => battlers.find((b) => b.id === id)?.stage_name ?? 'Unknown';
    const winnerId: string = battle.winner_battler_id;
    const loserId =
      winnerId === battle.battler_player_id ? battle.battler_ai_id : battle.battler_player_id;
    const winner = nameOf(winnerId);
    const loser = nameOf(loserId);
    const winnerRoundsWon = rounds.filter((r) => r.battler_id === winnerId && r.won).length;
    const loserRoundsWon = rounds.filter((r) => r.battler_id === loserId && r.won).length;
    const verdict = `${winnerRoundsWon}-${loserRoundsWon}`;
    const crowdAvg = (id: string) => {
      const rs = rounds.filter((r) => r.battler_id === id);
      return rs.length ? rs.reduce((s, r) => s + r.crowd_reaction, 0) / rs.length : 0;
    };
    const tag = `#${stripName(nameOf(battle.battler_player_id))}Vs${stripName(nameOf(battle.battler_ai_id))}`;

    // ---- Structured facts → aspects the timeline reacts to ----
    type AspectCtx = { aspect: PostAspect; round?: number };
    const aspects: AspectCtx[] = [];

    aspects.push({ aspect: 'league_result' });
    if (winnerRoundsWon >= 3 && loserRoundsWon === 0) aspects.push({ aspect: 'clean_sweep' });
    else {
      aspects.push({ aspect: 'debatable' });
      // Robbery narrative: the loser had the room, the cards disagreed.
      if (crowdAvg(loserId) > crowdAvg(winnerId) + 8) aspects.push({ aspect: 'robbery' });
    }

    const chokeRound = rounds.find((r) => r.choked);
    if (chokeRound) aspects.push({ aspect: 'choke', round: chokeRound.round_index });

    // Haymakers only count when the room actually reacted (no dead-room "he's HIM").
    const landed = (segments ?? []).find((s) => {
      if (!s.event_flags?.includes('haymaker')) return false;
      const r = rounds.find(
        (x) => x.round_index === s.round_index && x.battler_id === s.battler_id
      );
      return !!r && (r.crowd_reaction >= 55 || r.peak_score >= 8.5);
    });
    if (landed) aspects.push({ aspect: 'haymaker', round: landed.round_index });

    const coldRound = rounds.find((r) => r.crowd_reaction <= 30 && r.battler_id === loserId);
    if (coldRound) aspects.push({ aspect: 'cold_room', round: coldRound.round_index });

    // The winner talks their talk (AI battlers have accounts; player battlers
    // speak through manager drops instead).
    const winnerIsAi = winnerId === battle.battler_ai_id;
    if (winnerIsAi) aspects.push({ aspect: 'gloat' });

    // ---- Accounts react by role ----
    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('id, handle, kind, battler_id, league_id, voice_profile, influence, posting_frequency');
    if (!accounts || accounts.length === 0) return;

    const rand = rng(fnv1a(battleId));
    const leagueAccount = accounts.find((a) => a.league_id === battle.league_id);
    const winnerAccount = accounts.find((a) => a.battler_id === winnerId);
    const crowdAccounts = accounts.filter((a) => !a.league_id && !a.battler_id);

    const fill = (template: string, round?: number) =>
      template
        .replaceAll('{winner}', winner)
        .replaceAll('{loser}', loser)
        .replaceAll('{round}', String(round ?? 1))
        .replaceAll('{league}', 'the league')
        .replaceAll('{tag}', tag)
        .replaceAll('{verdict}', verdict);

    type NewPost = {
      account_id: string;
      body: string;
      category: string;
      feed_hint: string;
      battle_id: string;
      target_battler_id: string | null;
      crowd_tag: string | null;
      props: number;
      boosts: number;
      replies: number;
      actionable: string | null;
      meta_json: Record<string, unknown>;
    };
    const posts: NewPost[] = [];
    const usedAccountIds = new Set<string>();

    const engagement = (influence: number, heat: number) => {
      const props = Math.max(3, Math.round(influence * (heat / 10) + rand() * influence * 6));
      const boosts = Math.round(props * (0.15 + rand() * 0.2));
      const replies = Math.round(props * (0.05 + rand() * 0.15));
      return { props, boosts, replies };
    };

    const pushPost = (
      account: WireAccount,
      aspect: PostAspect,
      round: number | undefined,
      opts: { actionable?: string | null; target?: string | null; feed?: string } = {}
    ) => {
      const bank = VOICE_BANK_MAP.get(account.voice_profile);
      const lines = bank?.templates[aspect];
      if (!lines || lines.length === 0) return;
      const body = fill(lines[Math.floor(rand() * lines.length)], round);
      const heat = ASPECT_HEAT[aspect];
      const { props, boosts, replies } = engagement(account.influence, heat);
      posts.push({
        account_id: account.id,
        body,
        category: ASPECT_CATEGORY[aspect],
        feed_hint:
          opts.feed ?? (aspect === 'league_result' ? 'league_wire' : 'for_you'),
        battle_id: battleId,
        target_battler_id: opts.target ?? null,
        crowd_tag: rand() < 0.6 ? tag : null,
        props,
        boosts,
        replies,
        actionable: opts.actionable ?? null,
        meta_json: { aspect, verdict },
      });
      usedAccountIds.add(account.id);
    };

    // 1. The league posts the official result first.
    if (leagueAccount) pushPost(leagueAccount, 'league_result', undefined, { feed: 'league_wire' });

    // 2. The AI winner gloats — a callout the loser can answer, but only a
    // HUMAN player gets an actionable prompt (world battles stay ambient).
    const playerIsHuman = !battlers.find((b) => b.id === battle.battler_player_id)?.is_ai;
    if (winnerIsAi && winnerAccount) {
      pushPost(winnerAccount, 'gloat', undefined, {
        actionable: playerIsHuman ? 'callout' : null,
        target: playerIsHuman ? battle.battler_player_id : null,
      });
    }

    // 3. The crowd reacts: for each aspect, 1-2 voices that have something to say.
    for (const { aspect, round } of aspects) {
      if (aspect === 'league_result' || aspect === 'gloat') continue;
      const speakers = crowdAccounts
        .filter((a) => {
          const bank = VOICE_BANK_MAP.get(a.voice_profile);
          return !!bank?.templates[aspect] && !usedAccountIds.has(a.id);
        })
        .filter((a) => rand() < a.posting_frequency)
        .sort(() => rand() - 0.5)
        .slice(0, aspect === 'debatable' || aspect === 'haymaker' ? 2 : 1);
      for (const s of speakers) {
        // A robbery narrative about the player is a controversy they can address.
        const isPlayerRobbery =
          aspect === 'robbery' && loserId === battle.battler_player_id && playerIsHuman;
        pushPost(s, aspect, round, {
          actionable: isPlayerRobbery ? 'controversy' : null,
          target: isPlayerRobbery ? battle.battler_player_id : null,
          feed: s.voice_profile === 'rumor_anon' ? 'rumor_mill' : undefined,
        });
      }
    }

    if (posts.length === 0) return;
    const { error } = await supabase.from('wire_posts').insert(posts);
    if (error) console.error('[wire] failed to insert posts for battle', battleId, error);
  } catch (err) {
    console.error('[wire] emitWirePostsForBattle failed', battleId, err);
  }
}

/** Heating Up — trending crowd tags from volume × influence × recency. */
export async function getHeatingUp(
  supabase: SupabaseClient,
  limit = 5
): Promise<{ tag: string; score: number; posts: number }[]> {
  const { data } = await supabase
    .from('wire_posts')
    .select('crowd_tag, props, boosts, created_at')
    .not('crowd_tag', 'is', null)
    .order('created_at', { ascending: false })
    .limit(400);
  if (!data) return [];
  const now = Date.now();
  const byTag = new Map<string, { score: number; posts: number }>();
  for (const p of data) {
    if (!p.crowd_tag) continue;
    const ageHours = Math.max(0, (now - new Date(p.created_at).getTime()) / 3_600_000);
    const decay = Math.pow(0.5, ageHours / 48); // half-life: two days
    const cur = byTag.get(p.crowd_tag) ?? { score: 0, posts: 0 };
    cur.score += (p.props + p.boosts * 2 + 25) * decay;
    cur.posts += 1;
    byTag.set(p.crowd_tag, cur);
  }
  return [...byTag.entries()]
    .map(([tag, v]) => ({ tag, score: Math.round(v.score), posts: v.posts }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
