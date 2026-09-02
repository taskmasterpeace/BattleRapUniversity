import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mediaFromBattle, type BattleMediaContext } from '@/lib/game/media/mediaGenerator';
import { loadPersistedMedia, backfillMedia } from '@/lib/game/media/mediaPersistence';

/**
 * ClipHive + Booth feed — reads the PERSISTED media_items rail (composed once when
 * a battle completes). On first run it backfills recent battles; if there's still
 * nothing (fresh DB) it returns a deterministic DEMO feed so the platform always
 * renders. Service-role read (never the cookie client — that hangs on a stale
 * session when the DB is unreachable).
 *
 * GET /api/media/feed  → { items: MediaItem[], isDemo: boolean }
 */

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('no supabase env');
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

    let items = await loadPersistedMedia(supabase, { limit: 48 });
    if (items.length === 0) {
      // No persisted media yet (pre-persistence battles) — backfill then re-read.
      await backfillMedia(supabase, 30);
      items = await loadPersistedMedia(supabase, { limit: 48 });
    }
    if (items.length >= 1) {
      return NextResponse.json({ items, isDemo: false });
    }
    // Fresh DB with no real battles at all → showcase.
    return NextResponse.json({ items: DEMO_BATTLES.flatMap((c) => mediaFromBattle(c)), isDemo: true });
  } catch (e) {
    return NextResponse.json({ items: DEMO_BATTLES.flatMap((c) => mediaFromBattle(c)), isDemo: true });
  }
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
