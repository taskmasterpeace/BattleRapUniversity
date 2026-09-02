/**
 * Media persistence — compose a battle's ClipHive video + Booth episode ONCE when
 * it completes and store them in `media_items`, so the media world is a durable,
 * browsable archive. /api/media/feed reads from here.
 *
 * Service-role reads/writes. Defensive — a failure never breaks a battle.
 */

import {
  mediaFromBattle, type BattleMediaContext, type MediaBattler, type MediaItem,
} from './mediaGenerator';
import type { HeadToHead } from './types';

const first = (x: any) => (Array.isArray(x) ? x[0] : x);

/** Assemble the rich media context for one completed battle (+ its completed_at). */
export async function assembleBattleContext(
  supabase: any,
  battleId: string,
): Promise<{ context: BattleMediaContext; completedAt: string | null } | null> {
  const { data: b } = await supabase
    .from('battles')
    .select(`
      id, winner_battler_id, battler_player_id, battler_ai_id, verdict, decision_type, completed_at, status,
      player:battler_player_id ( id, stage_name, hometown:hometown_city_id ( name, culture_style ) ),
      ai:battler_ai_id ( id, stage_name, hometown:hometown_city_id ( name, culture_style ) ),
      venue:venue_id ( city:city_id ( name ) ),
      league:league_id ( city:city_id ( name ) ),
      battle_rounds ( battler_id, choked )
    `)
    .eq('id', battleId)
    .maybeSingle();

  if (!b || b.status !== 'completed' || !b.winner_battler_id || b.verdict === 'no_contest') return null;
  const player = first(b.player);
  const ai = first(b.ai);
  if (!player || !ai) return null;

  const winnerIsPlayer = b.winner_battler_id === b.battler_player_id;
  const w = winnerIsPlayer ? player : ai;
  const l = winnerIsPlayer ? ai : player;

  const { data: ranks } = await supabase
    .from('rankings')
    .select('battler_id, wins, losses, streak, tier, rating')
    .in('battler_id', [w.id, l.id]);
  const rankMap = new Map<string, any>((ranks ?? []).map((r: any) => [r.battler_id, r]));

  const loserChoked = (b.battle_rounds ?? []).filter((r: any) => r.battler_id === l.id).some((r: any) => r.choked);
  const wRating = rankMap.get(w.id)?.rating ?? 1200;
  const lRating = rankMap.get(l.id)?.rating ?? 1200;
  const dt = b.decision_type as string | null;
  const mainStory: BattleMediaContext['mainStory'] = loserChoked
    ? 'choke'
    : dt === 'classic'
      ? 'classic'
      : wRating <= lRating - 60
        ? 'upset'
        : dt === 'bodybag' || dt === 'clean_sweep' || dt === 'gentlemans_30'
          ? 'dominant'
          : 'standard';

  const city = first(first(b.venue)?.city)?.name ?? first(first(b.league)?.city)?.name ?? null;
  const dossier = (bt: any): MediaBattler => {
    const home = first(bt.hometown);
    const rk = rankMap.get(bt.id);
    return {
      battlerId: bt.id, name: bt.stage_name,
      hometownCity: home?.name ?? null, scene: home?.culture_style ?? null,
      wins: rk?.wins, losses: rk?.losses, streak: rk?.streak, tier: rk?.tier ?? null,
    };
  };

  const headToHead = await loadHeadToHead(supabase, w.id, l.id, w.stage_name, l.stage_name);

  return {
    context: {
      battleId: b.id,
      winner: { ...dossier(w), role: 'winner' },
      loser: { ...dossier(l), role: 'loser' },
      score: (b.verdict as string) || '2-1',
      mainStory,
      city,
      bigMoment: mainStory === 'dominant',
      headToHead,
    },
    completedAt: b.completed_at ?? null,
  };
}

async function loadHeadToHead(
  supabase: any, wId: string, lId: string, wName: string, lName: string,
): Promise<HeadToHead | null> {
  const { data } = await supabase
    .from('head_to_head_records')
    .select('battler_a_id, battler_b_id, battler_a_wins, battler_b_wins, total_battles, last_winner_id')
    .or(`and(battler_a_id.eq.${wId},battler_b_id.eq.${lId}),and(battler_a_id.eq.${lId},battler_b_id.eq.${wId})`)
    .maybeSingle();
  if (!data) return null;
  const wIsA = data.battler_a_id === wId;
  const winnerWins = wIsA ? data.battler_a_wins : data.battler_b_wins;
  const loserWins = wIsA ? data.battler_b_wins : data.battler_a_wins;
  const total = data.total_battles ?? winnerWins + loserWins;
  // The h2h already includes this battle. Proxy the "revenge" read: the winner
  // had lost to this loser before iff the loser has a win in the series.
  const isRevenge = loserWins >= 1 && total >= 2;
  return {
    winnerWins, loserWins, total,
    isRematch: total >= 2,
    isRevenge,
    lastWinnerName: isRevenge ? lName : wName,
    lastCity: null,
  };
}

/** Compose + upsert a battle's media items. */
export async function persistBattleMedia(supabase: any, battleId: string): Promise<void> {
  try {
    const assembled = await assembleBattleContext(supabase, battleId);
    if (!assembled) return;
    const items = mediaFromBattle(assembled.context);
    const createdAt = assembled.completedAt ?? new Date().toISOString();
    const rows = items.map((it: MediaItem) => ({
      slug: it.id,
      battle_id: assembled.context.battleId,
      kind: it.kind,
      title: it.title,
      outlet: it.kind === 'podcast_episode' ? it.show : it.channel,
      story: 'story' in it ? it.story ?? assembled.context.mainStory : assembled.context.mainStory,
      subject_battler_ids: it.subjects.map((s) => s.battlerId).filter(Boolean),
      topic_tags: it.topicTags,
      payload: it,
      created_at: createdAt,
    }));
    const { error } = await supabase.from('media_items').upsert(rows, { onConflict: 'slug' });
    if (error) console.error('[media] persist upsert failed:', error.message);
  } catch (e: any) {
    console.error('[media] persistBattleMedia failed:', e?.message ?? e);
  }
}

/** Read persisted media, newest first. */
export async function loadPersistedMedia(
  supabase: any, opts: { limit?: number } = {},
): Promise<MediaItem[]> {
  const { data } = await supabase
    .from('media_items')
    .select('payload')
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 48);
  return (data ?? []).map((r: any) => r.payload as MediaItem);
}

/** Backfill media for recent completed battles that don't have any yet. Returns count persisted. */
export async function backfillMedia(supabase: any, limit = 30): Promise<number> {
  const { data: battles } = await supabase
    .from('battles')
    .select('id')
    .eq('status', 'completed')
    .not('winner_battler_id', 'is', null)
    .neq('verdict', 'no_contest')
    .order('completed_at', { ascending: false })
    .limit(limit);
  const ids = (battles ?? []).map((b: any) => b.id);
  if (!ids.length) return 0;
  const { data: existing } = await supabase.from('media_items').select('battle_id').in('battle_id', ids);
  const have = new Set((existing ?? []).map((r: any) => r.battle_id));
  const todo = ids.filter((id: string) => !have.has(id));
  for (const id of todo) await persistBattleMedia(supabase, id);
  return todo.length;
}
