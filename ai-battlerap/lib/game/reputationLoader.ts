/**
 * Reputation loader — assembles a battler's full reputation (labels + recognition
 * + signature wins + gameplay modifiers) from the DB, so the sim, offer generator,
 * and media all read the SAME reputation the career page shows.
 *
 * Service-role reads. Returns the modifiers the teeth systems consume:
 *   crowdDelta → crowd reaction · offerAppeal → who books you ·
 *   opponentPrepBias → how hard they prep for you.
 */

import { deriveReputation, type RepBattle, type Reputation, type ReputationModifiers } from './reputation';
import type { StoredLabel } from './labels/lifecycle';

export const ZERO_MODIFIERS: ReputationModifiers = {
  crowdDelta: 0, pressurePenalty: 0, offerAppeal: 0, opponentPrepBias: 0, rematchDemandBias: 0, notes: [],
};

const first = (x: any) => (Array.isArray(x) ? x[0] : x);

/** Full reputation for a battler (or null if not found). */
export async function loadReputation(supabase: any, battlerId: string): Promise<Reputation | null> {
  const { data: battler } = await supabase
    .from('battlers')
    .select('id, style_tags, region, hometown:hometown_city_id ( id, name, state, culture_style )')
    .eq('id', battlerId)
    .maybeSingle();
  if (!battler) return null;

  const { data: ranking } = await supabase
    .from('rankings')
    .select('rating, tier, wins, losses, streak')
    .eq('battler_id', battlerId)
    .maybeSingle();

  const { data: battles } = await supabase
    .from('battles')
    .select(`
      id, winner_battler_id, battler_player_id, battler_ai_id, verdict, completed_at,
      player:battler_player_id ( id, stage_name ),
      ai:battler_ai_id ( id, stage_name ),
      venue:venue_id ( city:city_id ( id, name, state ) ),
      league:league_id ( city:city_id ( id, name, state ) ),
      battle_rounds ( battler_id, choked, peak_score, crowd_reaction )
    `)
    .or(`battler_player_id.eq.${battlerId},battler_ai_id.eq.${battlerId}`)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(60);

  const rows = battles ?? [];
  const opponentIds = Array.from(
    new Set(rows.map((b: any) => (b.battler_player_id === battlerId ? b.battler_ai_id : b.battler_player_id)).filter(Boolean))
  );
  const { data: oppRanks } = opponentIds.length
    ? await supabase.from('rankings').select('battler_id, rating, tier').in('battler_id', opponentIds)
    : { data: [] as any[] };
  const oppMap = new Map<string, { rating: number; tier: string | null }>(
    (oppRanks ?? []).map((r: any) => [r.battler_id, { rating: r.rating, tier: r.tier ?? null }])
  );

  let crowdSum = 0, crowdN = 0;
  const repBattles: RepBattle[] = rows.map((b: any): RepBattle => {
    const isPlayer = b.battler_player_id === battlerId;
    const oppId = isPlayer ? b.battler_ai_id : b.battler_player_id;
    const oppName = isPlayer ? first(b.ai)?.stage_name : first(b.player)?.stage_name;
    const myRounds = (b.battle_rounds ?? []).filter((r: any) => r.battler_id === battlerId);
    const chokedRounds = myRounds.filter((r: any) => r.choked).length;
    const bestPeak = myRounds.reduce((m: number, r: any) => Math.max(m, r.peak_score ?? 0), 0);
    for (const r of myRounds) { crowdSum += r.crowd_reaction ?? 0; crowdN++; }
    const city = first(first(b.venue)?.city) ?? first(first(b.league)?.city) ?? null;
    const opp = oppMap.get(oppId);
    return {
      opponentId: oppId,
      opponentName: oppName ?? 'Unknown',
      result: b.winner_battler_id === battlerId ? 'W' : 'L',
      score: b.verdict || '2-1',
      chokedRounds,
      bestPeak,
      cityId: city?.id ?? null,
      city: city?.name ?? null,
      state: city?.state ?? null,
      opponentRating: opp?.rating,
      opponentTier: opp?.tier,
      date: b.completed_at,
    };
  });

  const { data: labelRows } = await supabase
    .from('battler_labels')
    .select('key, tier, tone, heat, processed_battle_count, evidence_count, qualifying_evidence_count, status, pinned_at, last_reinforced_at, source')
    .eq('battler_id', battlerId)
    .eq('status', 'active');
  const storedLabels: StoredLabel[] = (labelRows ?? []).map((r: any) => ({
    key: r.key, tier: r.tier, tone: r.tone, heat: r.heat,
    processedBattleCount: r.processed_battle_count ?? 0,
    evidenceCount: r.evidence_count ?? 0,
    qualifyingEvidenceCount: r.qualifying_evidence_count ?? 0,
    status: r.status, pinnedAt: r.pinned_at ?? undefined, lastReinforcedAt: r.last_reinforced_at ?? undefined,
    source: r.source ?? undefined,
  }));

  const { data: pressRows } = await supabase
    .from('blogger_memory')
    .select('sentiment_positive, sentiment_negative')
    .eq('entity_type', 'battler')
    .eq('entity_id', battlerId)
    .limit(8);

  // Record from the battle history (matches the career page). Deriving from
  // rankings risked a null read defaulting losses→0 → a false UNTOUCHABLE.
  const wins = repBattles.filter((b) => b.result === 'W').length;
  const losses = repBattles.filter((b) => b.result === 'L').length;

  const home = first(battler.hometown);
  return deriveReputation({
    rating: ranking?.rating ?? 1200,
    tier: ranking?.tier ?? null,
    wins,
    losses,
    streak: ranking?.streak ?? 0,
    battles: repBattles,
    storedLabels,
    press: (pressRows ?? []).map((p: any) => ({ pos: p.sentiment_positive ?? 0, neg: p.sentiment_negative ?? 0 })),
    avgCrowd: crowdN > 0 ? Math.round(crowdSum / crowdN) : undefined,
    homeCityId: home?.id ?? null,
    homeCity: home?.name ?? battler.region ?? null,
    homeState: home?.state ?? null,
    styleTags: Array.isArray(battler.style_tags) ? battler.style_tags : [],
  });
}

/** Just the gameplay modifiers (the teeth) for a battler — never throws. */
export async function loadReputationModifiers(supabase: any, battlerId: string): Promise<ReputationModifiers> {
  try {
    const rep = await loadReputation(supabase, battlerId);
    return rep?.modifiers ?? ZERO_MODIFIERS;
  } catch (e: any) {
    console.error('[reputation] loadReputationModifiers failed:', e?.message ?? e);
    return ZERO_MODIFIERS;
  }
}
