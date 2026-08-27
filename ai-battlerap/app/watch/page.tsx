import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import WatchHub, { type CompletedCard, type UpcomingCard } from '@/components/watch/WatchHub';

/**
 * TONIGHT'S CARD — the public fight-card hub for the whole UniverCity.
 *
 * The world battles whether you play or not: this page is where anybody
 * (logged in or not) follows the slate — upcoming AI-vs-AI cards across
 * every league, the player battles on the books, and what just happened.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "TONIGHT'S CARD — Battle Rap University",
  description:
    "The world don't stop. Upcoming battles and fresh verdicts from every league in the UniverCity — watch any battle, any night.",
};

const WINDOW_HOURS = 48;

type BattlerJoin = {
  id: string;
  stage_name: string;
  avatar_url: string | null;
  tier: string | null;
  is_real: boolean;
};

function isTestName(name: string | undefined | null) {
  return !!name && name.toLowerCase().startsWith('test');
}

function side(b: BattlerJoin) {
  return {
    id: b.id,
    name: b.stage_name,
    avatarUrl: b.avatar_url,
    tier: b.tier,
    isReal: b.is_real,
  };
}

function upcomingLabel(scheduledAt: string, now: Date): string {
  const sched = new Date(scheduledAt);
  const diffMs = sched.getTime() - now.getTime();
  if (diffMs <= 0) return 'DOORS OPEN';
  const sameDay = sched.toDateString() === now.toDateString();
  if (sameDay) return 'TONIGHT';
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (sched.toDateString() === tomorrow.toDateString()) return 'TOMORROW';
  return `IN ${Math.round(diffMs / (60 * 60 * 1000))}H`;
}

function agoLabel(when: string, now: Date): string {
  const diffMs = now.getTime() - new Date(when).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins}M AGO`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.round(hours / 24);
  return `${days}D AGO`;
}

export default async function WatchPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const now = new Date();
  const windowEnd = new Date(now.getTime() + WINDOW_HOURS * 60 * 60 * 1000);

  const battlerJoin = 'id, stage_name, avatar_url, tier, is_real';

  const [{ data: upcomingRows }, { data: completedRows }] = await Promise.all([
    supabase
      .from('battles')
      .select(
        `id, league_id, scheduled_at, is_world,
         league:leagues(id, name),
         a:battlers!battles_battler_player_id_fkey(${battlerJoin}),
         b:battlers!battles_battler_ai_id_fkey(${battlerJoin})`
      )
      .in('status', ['accepted', 'locked'])
      .lte('scheduled_at', windowEnd.toISOString())
      .gte('scheduled_at', new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(40),
    supabase
      .from('battles')
      .select(
        `id, league_id, scheduled_at, created_at, completed_at, is_world, verdict, decision_type, winner_battler_id,
         league:leagues(id, name),
         a:battlers!battles_battler_player_id_fkey(${battlerJoin}),
         b:battlers!battles_battler_ai_id_fkey(${battlerJoin})`
      )
      .eq('status', 'completed')
      .not('verdict', 'is', null)
      // Order by when the verdict actually dropped, not when the card was booked,
      // so "Fresh Verdicts" is genuinely fresh. completed_at falls back to
      // created_at for older rows that predate the column.
      .order('completed_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(40),
  ]);

  const upcoming: UpcomingCard[] = (upcomingRows || [])
    .map((row: any) => ({ ...row, a: row.a as BattlerJoin, b: row.b as BattlerJoin }))
    .filter((row: any) => row.a && row.b && !isTestName(row.a.stage_name) && !isTestName(row.b.stage_name))
    .map((row: any) => ({
      id: row.id,
      leagueId: row.league?.id ?? row.league_id,
      leagueName: row.league?.name ?? 'UNKNOWN LEAGUE',
      scheduledAt: row.scheduled_at,
      timeLabel: upcomingLabel(row.scheduled_at, now),
      isWorld: row.is_world,
      a: side(row.a),
      b: side(row.b),
    }));

  const completed: CompletedCard[] = (completedRows || [])
    .map((row: any) => ({ ...row, a: row.a as BattlerJoin, b: row.b as BattlerJoin }))
    .filter((row: any) => row.a && row.b && !isTestName(row.a.stage_name) && !isTestName(row.b.stage_name))
    .slice(0, 12)
    .map((row: any) => ({
      id: row.id,
      leagueId: row.league?.id ?? row.league_id,
      leagueName: row.league?.name ?? 'UNKNOWN LEAGUE',
      verdict: row.verdict,
      agoLabel: agoLabel(row.completed_at ?? row.created_at, now),
      winnerId: row.winner_battler_id,
      a: side(row.a),
      b: side(row.b),
    }));

  // League filter options: every league that actually appears on the page.
  const leagueMap = new Map<string, string>();
  for (const c of [...upcoming, ...completed]) {
    leagueMap.set(c.leagueId, c.leagueName);
  }
  const leagues = Array.from(leagueMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((x, y) => x.name.localeCompare(y.name));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <WatchHub upcoming={upcoming} completed={completed} leagues={leagues} />
    </div>
  );
}
