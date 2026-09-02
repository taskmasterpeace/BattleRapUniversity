import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mediaFromBattle, type BattleMediaContext, type MediaItem, type MediaBattler } from '@/lib/game/media/mediaGenerator';

/**
 * ClipHive + podcast feed. Composes media items from recent completed battles
 * (rich dossiers + head-to-head). Falls back to a deterministic DEMO feed when
 * there's no data yet (or Supabase is unreachable) so the platform always renders.
 *
 * GET /api/media/feed  → { items: MediaItem[], isDemo: boolean }
 */

export async function GET() {
  try {
    // Public feed — service-role read, NOT the cookie/session client (which would
    // hang trying to refresh a stale auth session when the DB is unreachable).
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('no supabase env');
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    const contexts = await assembleRecentBattles(supabase);
    const source = contexts.length >= 3 ? contexts : DEMO_BATTLES;
    const items = source.flatMap((c) => mediaFromBattle(c));
    return NextResponse.json({ items, isDemo: source === DEMO_BATTLES });
  } catch (e) {
    const items = DEMO_BATTLES.flatMap((c) => mediaFromBattle(c));
    return NextResponse.json({ items, isDemo: true });
  }
}

// ── real battles → media contexts (best-effort; defensive) ──────────────────

async function assembleRecentBattles(supabase: any): Promise<BattleMediaContext[]> {
  const { data: battles } = await supabase
    .from('battles')
    .select(`
      id, winner_battler_id, battler_player_id, battler_ai_id, completed_at, verdict, decision_type,
      player:battler_player_id ( id, stage_name, hometown:hometown_city_id ( name, culture_style ) ),
      ai:battler_ai_id ( id, stage_name, hometown:hometown_city_id ( name, culture_style ) ),
      venue:venue_id ( city:city_id ( name ) ),
      league:league_id ( city:city_id ( name ) ),
      battle_rounds ( battler_id, won, choked )
    `)
    .eq('status', 'completed')
    .not('winner_battler_id', 'is', null)
    .neq('verdict', 'no_contest')
    .order('completed_at', { ascending: false })
    .limit(18);

  if (!battles || battles.length === 0) return [];

  // Batch dossier data: rankings for everyone involved.
  const ids = Array.from(
    new Set(battles.flatMap((b: any) => [b.battler_player_id, b.battler_ai_id]).filter(Boolean))
  );
  const { data: ranks } = await supabase.from('rankings').select('battler_id, wins, losses, streak, tier, rating').in('battler_id', ids);
  const rankMap = new Map<string, any>((ranks ?? []).map((r: any) => [r.battler_id, r]));

  const first = (x: any) => (Array.isArray(x) ? x[0] : x);

  return battles
    .map((b: any): BattleMediaContext | null => {
      const player = first(b.player);
      const ai = first(b.ai);
      if (!player || !ai) return null;
      const winnerIsPlayer = b.winner_battler_id === b.battler_player_id;
      const w = winnerIsPlayer ? player : ai;
      const l = winnerIsPlayer ? ai : player;

      const oppRounds = (b.battle_rounds ?? []).filter((r: any) => r.battler_id === l.id);
      const loserChoked = oppRounds.some((r: any) => r.choked);

      // Prefer the recorded verdict/decision over recomputing from rounds.
      const wRating = rankMap.get(w.id)?.rating ?? 1200;
      const lRating = rankMap.get(l.id)?.rating ?? 1200;
      const dt = b.decision_type as string | null;
      const score = (b.verdict as string) || '2-1';
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
          battlerId: bt.id,
          name: bt.stage_name,
          hometownCity: home?.name ?? null,
          scene: home?.culture_style ?? null,
          wins: rk?.wins,
          losses: rk?.losses,
          streak: rk?.streak,
          tier: rk?.tier ?? null,
        };
      };

      return {
        battleId: b.id,
        winner: { ...dossier(w), role: 'winner' },
        loser: { ...dossier(l), role: 'loser' },
        score,
        mainStory: mainStory as BattleMediaContext['mainStory'],
        city,
        bigMoment: mainStory === 'dominant',
      };
    })
    .filter(Boolean) as BattleMediaContext[];
}

// ── demo feed (renders when there's no data / DB is down) ───────────────────

const DEMO_BATTLES: BattleMediaContext[] = [
  { battleId: 'demo-1', score: '2-1', mainStory: 'upset', city: 'Newark', venue: 'The Armory', bigMoment: true,
    winner: { battlerId: null, name: 'Young Vez', hometownCity: 'Newark', scene: 'street', wins: 9, losses: 3, streak: 4 },
    loser: { battlerId: null, name: 'Kingpin K', hometownCity: 'New York City', scene: 'technical', wins: 15, losses: 5 },
    headToHead: { winnerWins: 2, loserWins: 1, total: 3, isRematch: true, isRevenge: true, lastWinnerName: 'Kingpin K', lastCity: 'New York City' } },
  { battleId: 'demo-2', score: '3-0', mainStory: 'choke', city: 'New York City', venue: 'The Loft',
    winner: { battlerId: null, name: 'Rex Ruger', hometownCity: 'New York City', scene: 'technical', wins: 12, losses: 4, streak: 2 },
    loser: { battlerId: null, name: 'Cold Case', hometownCity: 'Philadelphia', scene: 'aggressive', wins: 8, losses: 9, streak: -4, labels: ['WASHED'] } },
  { battleId: 'demo-3', score: '3-0', mainStory: 'dominant', city: 'Atlanta', venue: 'Zone 6',
    winner: { battlerId: null, name: 'Tru Foe', hometownCity: 'Atlanta', scene: 'diverse', wins: 20, losses: 6, streak: 5, labels: ['WENT MAINSTREAM'] },
    loser: { battlerId: null, name: 'Gutter Lord', hometownCity: 'Detroit', scene: 'street', wins: 11, losses: 7 } },
  { battleId: 'demo-4', score: '2-1', mainStory: 'robbery', city: 'Detroit', venue: '8 Mile Room',
    winner: { battlerId: null, name: 'Sur', hometownCity: 'Philadelphia', scene: 'technical', wins: 10, losses: 2, streak: 3 },
    loser: { battlerId: null, name: 'Young Vez', hometownCity: 'Newark', scene: 'street', wins: 9, losses: 4, streak: -1 },
    headToHead: { winnerWins: 1, loserWins: 1, total: 2, isRematch: true, isRevenge: false, lastWinnerName: 'Young Vez', lastCity: 'Newark' } },
  { battleId: 'demo-5', score: '3-0', mainStory: 'classic', city: 'Houston', venue: '3rd Ward Coliseum',
    winner: { battlerId: null, name: 'Halo', hometownCity: 'Houston', scene: 'diverse', wins: 14, losses: 6, streak: 1 },
    loser: { battlerId: null, name: 'Dex', hometownCity: 'Dallas', scene: 'aggressive', wins: 13, losses: 5 } },
  { battleId: 'demo-6', score: '2-1', mainStory: 'standard', city: 'Chicago', venue: 'The Loop',
    winner: { battlerId: null, name: 'Zo', hometownCity: 'Chicago', scene: 'street', wins: 6, losses: 2, streak: 2 },
    loser: { battlerId: null, name: 'Prophet', hometownCity: 'Chicago', scene: 'technical', wins: 7, losses: 6 } },
];
