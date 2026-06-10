import { verifyInternalSecret } from '@/lib/db/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getVirtualNowISO } from '@/lib/dev/timeManipulation';
import { runWorldBattle } from '@/lib/game/runWorldBattle';

/**
 * POST /api/internal/run-world-tick
 *
 * THE LIVING WORLD heartbeat. Each tick:
 *  1. BOOK    — every league keeps at least 2 upcoming AI-vs-AI cards on the
 *               books (rating-matched pairs, scheduled 0-48h out, is_world).
 *  2. TRU FOE — the verified real battler never sits idle: if he has no
 *               upcoming battle, book him against a worthy top-tier opponent.
 *  3. SIMULATE — world battles whose scheduled_at has passed run through
 *               lib/game/runWorldBattle (ELO + recap news fire in the engine).
 *               Capped per tick to respect the cron budget.
 *
 * Dev options (internal-secret protected either way):
 *  ?simulate_all=1  — ignore scheduled_at and run every booked world battle
 *  ?max_sims=N      — override the per-tick simulation cap (default 6)
 */

const RATING_WINDOW = 250;
const DEFAULT_SIM_CAP = 6;
const MIN_UPCOMING_PER_LEAGUE = 2;

type BattlerLite = {
  id: string;
  stage_name: string;
  primary_league_id: string | null;
  is_real: boolean;
  rating: number;
};

function randomScheduleWindow(nowMs: number) {
  // 0-48h out; lock prep one hour before doors.
  const scheduledAt = new Date(nowMs + Math.random() * 48 * 60 * 60 * 1000);
  const lockPrepAt = new Date(scheduledAt.getTime() - 60 * 60 * 1000);
  return { scheduledAt, lockPrepAt };
}

/** Pick a rating-matched opponent for `anchor` from `pool` (closest first). */
function pickOpponent(anchor: BattlerLite, pool: BattlerLite[]): BattlerLite | null {
  const candidates = pool
    .filter((b) => b.id !== anchor.id)
    .sort((x, y) => Math.abs(x.rating - anchor.rating) - Math.abs(y.rating - anchor.rating));
  if (candidates.length === 0) return null;
  const inWindow = candidates.filter((b) => Math.abs(b.rating - anchor.rating) <= RATING_WINDOW);
  // Prefer somebody in the window (random among them for variety), otherwise
  // take the closest available — small rosters still get cards.
  if (inWindow.length > 0) return inWindow[Math.floor(Math.random() * inWindow.length)];
  return candidates[0];
}

export async function POST(request: Request) {
  if (!verifyInternalSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const url = new URL(request.url);
  const simulateAll = url.searchParams.get('simulate_all') === '1';
  const simCap = Math.min(
    20,
    Math.max(1, parseInt(url.searchParams.get('max_sims') || `${DEFAULT_SIM_CAP}`, 10) || DEFAULT_SIM_CAP)
  );

  const nowISO = getVirtualNowISO();
  const nowMs = new Date(nowISO).getTime();

  // ── Load the world state ──────────────────────────────────────────────
  const [{ data: leagues }, { data: aiBattlers }, { data: rankings }, { data: upcoming }] =
    await Promise.all([
      supabase.from('leagues').select('id, name'),
      supabase
        .from('battlers')
        .select('id, stage_name, primary_league_id, is_real')
        .eq('is_ai', true)
        .not('stage_name', 'ilike', 'Test%'),
      supabase.from('rankings').select('battler_id, rating'),
      supabase
        .from('battles')
        .select('id, league_id, battler_player_id, battler_ai_id, is_world, scheduled_at')
        .in('status', ['accepted', 'locked'])
        .gt('scheduled_at', nowISO),
    ]);

  const ratingOf = new Map<string, number>(
    (rankings || []).map((r: any) => [r.battler_id, r.rating])
  );
  const roster: BattlerLite[] = (aiBattlers || []).map((b: any) => ({
    id: b.id,
    stage_name: b.stage_name,
    primary_league_id: b.primary_league_id,
    is_real: b.is_real,
    rating: ratingOf.get(b.id) ?? 1200,
  }));
  const aiIds = new Set(roster.map((b) => b.id));

  // Anybody on an upcoming card (world, player, or PvP) is off the market.
  const busy = new Set<string>();
  for (const b of upcoming || []) {
    busy.add(b.battler_player_id);
    busy.add(b.battler_ai_id);
  }

  // ── 1. BOOK: keep every league's slate warm ───────────────────────────
  const booked: Array<{ league: string; a: string; b: string; scheduled_at: string }> = [];

  for (const league of leagues || []) {
    const upcomingWorldCount = (upcoming || []).filter(
      (b: any) =>
        b.league_id === league.id &&
        aiIds.has(b.battler_player_id) &&
        aiIds.has(b.battler_ai_id)
    ).length;

    let toBook = Math.max(0, MIN_UPCOMING_PER_LEAGUE - upcomingWorldCount);

    while (toBook > 0) {
      const free = roster.filter((b) => b.primary_league_id === league.id && !busy.has(b.id));
      if (free.length < 2) break;

      const anchor = free[Math.floor(Math.random() * free.length)];
      const opponent = pickOpponent(anchor, free);
      if (!opponent) break;

      const { scheduledAt, lockPrepAt } = randomScheduleWindow(nowMs);
      const { error } = await supabase.from('battles').insert({
        league_id: league.id,
        battler_player_id: anchor.id,
        battler_ai_id: opponent.id,
        status: 'accepted',
        is_world: true,
        scheduled_at: scheduledAt.toISOString(),
        lock_prep_at: lockPrepAt.toISOString(),
        deposit_required: false,
        context: 'ppv',
      });

      if (error) {
        console.error(`World tick: failed to book ${anchor.stage_name} vs ${opponent.stage_name}:`, error);
        break;
      }

      busy.add(anchor.id);
      busy.add(opponent.id);
      booked.push({
        league: league.name,
        a: anchor.stage_name,
        b: opponent.stage_name,
        scheduled_at: scheduledAt.toISOString(),
      });
      toBook--;
    }
  }

  // ── 2. TRU FOE PRIORITY: the verified battler never goes cold ─────────
  let truFoeBooked: { opponent: string; scheduled_at: string } | null = null;
  const truFoe = roster.find((b) => b.is_real && b.stage_name === 'Tru Foe');

  if (truFoe && !busy.has(truFoe.id)) {
    // Worthy opposition: top-tier names anywhere in the UniverCity, closest
    // in rating to him (he fights up, never down the card).
    const contenders = roster
      .filter((b) => !busy.has(b.id) && b.id !== truFoe.id)
      .sort((x, y) => y.rating - x.rating)
      .slice(0, 12);
    const opponent = pickOpponent(truFoe, contenders);

    if (opponent) {
      const { scheduledAt, lockPrepAt } = randomScheduleWindow(nowMs);
      const { error } = await supabase.from('battles').insert({
        league_id: truFoe.primary_league_id,
        battler_player_id: truFoe.id,
        battler_ai_id: opponent.id,
        status: 'accepted',
        is_world: true,
        scheduled_at: scheduledAt.toISOString(),
        lock_prep_at: lockPrepAt.toISOString(),
        deposit_required: false,
        context: 'ppv',
      });

      if (!error) {
        busy.add(truFoe.id);
        busy.add(opponent.id);
        truFoeBooked = { opponent: opponent.stage_name, scheduled_at: scheduledAt.toISOString() };
        booked.push({
          league: 'TRU FOE PRIORITY',
          a: truFoe.stage_name,
          b: opponent.stage_name,
          scheduled_at: scheduledAt.toISOString(),
        });
      } else {
        console.error('World tick: failed to book Tru Foe:', error);
      }
    }
  }

  // ── 3. SIMULATE: run the cards whose doors have opened ────────────────
  let dueQuery = supabase
    .from('battles')
    .select('*')
    .eq('is_world', true)
    .in('status', ['accepted', 'locked'])
    .order('scheduled_at', { ascending: true })
    .limit(simCap);
  if (!simulateAll) {
    dueQuery = dueQuery.lte('scheduled_at', nowISO);
  }
  const { data: dueBattles } = await dueQuery;

  const simResults: Array<{ battleId: string; status: string; verdict?: string | null; error?: string }> = [];
  for (const battle of dueBattles || []) {
    try {
      const result = await runWorldBattle(battle, supabase);
      simResults.push({ battleId: battle.id, status: 'success', verdict: result.verdict });
    } catch (error: any) {
      console.error(`World tick: error simulating battle ${battle.id}:`, error);
      simResults.push({ battleId: battle.id, status: 'error', error: error.message });
    }
  }

  const simulated = simResults.filter((r) => r.status === 'success').length;

  return NextResponse.json({
    message: `World tick: booked ${booked.length}, simulated ${simulated}`,
    booked: booked.length,
    bookings: booked,
    truFoeBooked,
    simulated,
    simResults,
  });
}
