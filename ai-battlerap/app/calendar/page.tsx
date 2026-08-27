// Global calendar — month view of every scheduled battle and tournament milestone.
// Designed as a quick at-a-glance overview; clicking a day shows full details server-side.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getUser } from '@/lib/db/server';

type Battle = {
  id: string;
  scheduled_at: string;
  status: string;
  league_id: string | null;
  battler_player_id: string | null;
  battler_ai_id: string | null;
};
type Tournament = {
  id: string;
  name: string;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  tournament_starts_at: string | null;
};
type BattlerLite = { id: string; stage_name: string };
type LeagueLite = { id: string; short_code: string; name: string };

type Event = {
  date: string; // YYYY-MM-DD in UTC
  kind: 'battle' | 'tournament-start' | 'tournament-reg-open' | 'tournament-reg-close';
  title: string;
  href: string;
  status?: string;
  mine?: boolean; // one of the player's own battles — surfaced amid the world schedule
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const KIND_STYLE: Record<Event['kind'], string> = {
  battle: 'bg-[#ff8c42]/20 border-l-2 border-[#ff8c42] text-[#ffb380]',
  'tournament-start': 'bg-amber-500/20 border-l-2 border-amber-400 text-amber-200',
  'tournament-reg-open': 'bg-green-500/20 border-l-2 border-green-400 text-green-200',
  'tournament-reg-close': 'bg-yellow-500/20 border-l-2 border-yellow-400 text-yellow-200',
};

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect('/login');
  const params = await searchParams;

  // Determine which month to render. Default to today (UTC).
  const now = new Date();
  const year = Number(params.year) || now.getUTCFullYear();
  const month = (Number(params.month) || (now.getUTCMonth() + 1)) - 1; // 0-indexed

  const monthStart = new Date(Date.UTC(year, month, 1));
  const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
  const prev = new Date(Date.UTC(year, month - 1, 1));
  const next = new Date(Date.UTC(year, month + 1, 1));

  const supabase = await createServerSupabaseClient();

  // The player's own battlers — their battles open the private battle view,
  // everything else opens the public spectator view (/watch/[id]).
  const { data: myBattlers } = await supabase
    .from('battlers')
    .select('id')
    .eq('user_id', user.id);
  const myBattlerIds = new Set(((myBattlers ?? []) as { id: string }[]).map((b) => b.id));

  const [{ data: battles }, { data: tournaments }] = await Promise.all([
    supabase
      .from('battles')
      .select('id, scheduled_at, status, league_id, battler_player_id, battler_ai_id')
      .gte('scheduled_at', monthStart.toISOString())
      .lte('scheduled_at', monthEnd.toISOString())
      .order('scheduled_at'),
    supabase
      .from('tournaments')
      .select('id, name, registration_opens_at, registration_closes_at, tournament_starts_at'),
  ]);

  // Filter out battles between simulation/validation test profiles (Test_* stage names).
  // These pollute the calendar with thousands of harness rows.
  const battlerProbeIds = new Set<string>();
  for (const b of (battles ?? []) as Battle[]) {
    if (b.battler_player_id) battlerProbeIds.add(b.battler_player_id);
    if (b.battler_ai_id) battlerProbeIds.add(b.battler_ai_id);
  }
  const { data: probeRows } = battlerProbeIds.size
    ? await supabase.from('battlers').select('id, stage_name').in('id', [...battlerProbeIds])
    : { data: [] as BattlerLite[] };
  const testBattlerIds = new Set(
    ((probeRows ?? []) as BattlerLite[])
      .filter((b) => b.stage_name.startsWith('Test_'))
      .map((b) => b.id)
  );
  const filteredBattles = ((battles ?? []) as Battle[]).filter(
    (b) =>
      !(b.battler_player_id && testBattlerIds.has(b.battler_player_id)) &&
      !(b.battler_ai_id && testBattlerIds.has(b.battler_ai_id))
  );

  // Resolve referenced battlers + leagues in batched lookups (on the filtered set)
  const battlerIds = new Set<string>();
  const leagueIds = new Set<string>();
  for (const b of filteredBattles) {
    if (b.battler_player_id) battlerIds.add(b.battler_player_id);
    if (b.battler_ai_id) battlerIds.add(b.battler_ai_id);
    if (b.league_id) leagueIds.add(b.league_id);
  }
  const [{ data: bRows }, { data: lRows }] = await Promise.all([
    battlerIds.size
      ? supabase.from('battlers').select('id, stage_name').in('id', [...battlerIds])
      : Promise.resolve({ data: [] as BattlerLite[] }),
    leagueIds.size
      ? supabase.from('leagues').select('id, short_code, name').in('id', [...leagueIds])
      : Promise.resolve({ data: [] as LeagueLite[] }),
  ]);
  const battlerMap = new Map<string, BattlerLite>(
    ((bRows ?? []) as BattlerLite[]).map((b) => [b.id, b])
  );
  const leagueMap = new Map<string, LeagueLite>(
    ((lRows ?? []) as LeagueLite[]).map((l) => [l.id, l])
  );

  // Build the event list
  const events: Event[] = [];
  for (const b of filteredBattles) {
    const p = b.battler_player_id ? battlerMap.get(b.battler_player_id)?.stage_name : null;
    const o = b.battler_ai_id ? battlerMap.get(b.battler_ai_id)?.stage_name : null;
    const league = b.league_id ? leagueMap.get(b.league_id) : undefined;
    const matchup = p && o ? `${p} vs ${o}` : 'Battle';
    const tag = league ? `[${league.short_code}] ` : '';
    // Own battles → private battle page. World/AI battles → public spectator view.
    const isMine =
      (b.battler_player_id && myBattlerIds.has(b.battler_player_id)) ||
      (b.battler_ai_id && myBattlerIds.has(b.battler_ai_id));
    events.push({
      date: toDateKey(b.scheduled_at),
      kind: 'battle',
      title: `${isMine ? '★ ' : ''}${tag}${matchup}`,
      href: isMine ? `/battle/${b.id}` : `/watch/${b.id}`,
      status: b.status,
      mine: !!isMine,
    });
  }
  const inMonth = (iso: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d >= monthStart && d <= monthEnd;
  };
  for (const t of (tournaments ?? []) as Tournament[]) {
    if (inMonth(t.tournament_starts_at)) {
      events.push({
        date: toDateKey(t.tournament_starts_at!),
        kind: 'tournament-start',
        title: `${t.name} starts`,
        href: `/tournaments/${t.id}`,
      });
    }
    if (inMonth(t.registration_opens_at)) {
      events.push({
        date: toDateKey(t.registration_opens_at!),
        kind: 'tournament-reg-open',
        title: `${t.name} registration opens`,
        href: `/tournaments/${t.id}`,
      });
    }
    if (inMonth(t.registration_closes_at)) {
      events.push({
        date: toDateKey(t.registration_closes_at!),
        kind: 'tournament-reg-close',
        title: `${t.name} registration closes`,
        href: `/tournaments/${t.id}`,
      });
    }
  }

  // Group events by date
  const eventsByDay = new Map<string, Event[]>();
  for (const e of events) {
    const arr = eventsByDay.get(e.date) ?? [];
    arr.push(e);
    eventsByDay.set(e.date, arr);
  }

  // Build the 6-row, 7-col grid (Sun..Sat). Pad with prev/next month leadings.
  const firstDow = monthStart.getUTCDay(); // 0 = Sunday
  const daysInMonth = monthEnd.getUTCDate();
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ date: new Date(Date.UTC(year, month, i - firstDow + 1)), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(Date.UTC(year, month, d)), inMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 35) {
    const last = cells[cells.length - 1].date;
    cells.push({
      date: new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate() + 1)),
      inMonth: false,
    });
    if (cells.length >= 42) break;
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const totalEvents = events.length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 animate-fade-in-up">
      <div className="border-b-2 border-[#3a3d44] bg-[#18191c]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tighter mb-2">
              CALENDAR
            </h1>
            <p className="text-zinc-400 text-sm uppercase tracking-wide">
              {MONTH_NAMES[month]} {year} — {totalEvents} {totalEvents === 1 ? 'event' : 'events'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/calendar?year=${prev.getUTCFullYear()}&month=${prev.getUTCMonth() + 1}`}
              className="px-3 py-2 text-xs uppercase tracking-wider font-bold border-2 border-[#3a3d44] hover:border-[#ff8c42] hover:text-[#ff8c42] transition"
            >
              ← {MONTH_NAMES[prev.getUTCMonth()].slice(0, 3)}
            </Link>
            <Link
              href="/calendar"
              className="px-3 py-2 text-xs uppercase tracking-wider font-bold border-2 border-[#ff8c42] text-[#ff8c42] hover:bg-[#ff8c42]/10 transition"
            >
              Today
            </Link>
            <Link
              href={`/calendar?year=${next.getUTCFullYear()}&month=${next.getUTCMonth() + 1}`}
              className="px-3 py-2 text-xs uppercase tracking-wider font-bold border-2 border-[#3a3d44] hover:border-[#ff8c42] hover:text-[#ff8c42] transition"
            >
              {MONTH_NAMES[next.getUTCMonth()].slice(0, 3)} →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-3 text-xs uppercase tracking-wider font-bold text-zinc-300">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 bg-[#ff8c42] inline-block" /> Battle
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 bg-amber-400 inline-block" /> Tournament
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 bg-green-400 inline-block" /> Reg opens
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-400 inline-block" /> Reg closes
          </span>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1 mb-1 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="px-2 py-2 text-center">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            const key = cell.date.toISOString().slice(0, 10);
            // Player's own battles first, so a busy day never buries them under "+more".
            const dayEvents = (eventsByDay.get(key) ?? [])
              .slice()
              .sort((a, b) => Number(b.mine) - Number(a.mine));
            const isToday = key === todayKey;
            return (
              <div
                key={i}
                className={`min-h-[100px] border-2 p-1.5 transition-all duration-200 hover:border-[#ff8c42]/60 hover:bg-[#1f2024] ${
                  cell.inMonth ? 'bg-[#18191c]' : 'bg-[#0f0f10] opacity-50'
                } ${isToday ? 'border-[#ff8c42] shadow-[0_0_16px_-4px_rgba(255,140,66,0.5)]' : 'border-[#3a3d44]'}`}
              >
                <div className={`text-xs font-bold ${isToday ? 'text-[#ff8c42]' : 'text-zinc-400'} mb-1`}>
                  {cell.date.getUTCDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 4).map((e, idx) => {
                    // Already-fought battles are dimmed and checked so the player
                    // can tell past matchups from ones still on the books at a glance.
                    const done = e.status === 'completed';
                    return (
                      <Link
                        key={idx}
                        href={e.href}
                        title={e.title}
                        className={`block text-[10px] px-1.5 py-1 leading-tight line-clamp-2 hover:translate-x-[1px] transition-all duration-150 ${
                          e.mine
                            ? 'bg-[#ff8c42] border-l-2 border-[#ff8c42] text-black font-black hover:bg-[#ff9d5c]'
                            : `${KIND_STYLE[e.kind]} hover:bg-[#2d2f35]`
                        } ${done ? 'opacity-50' : ''}`}
                      >
                        {done ? '✓ ' : ''}{e.title}
                      </Link>
                    );
                  })}
                  {dayEvents.length > 4 && (
                    <div className="text-[10px] text-zinc-500 px-1">
                      +{dayEvents.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {totalEvents === 0 && (
          <div className="mt-8 bg-[#18191c] border-2 border-[#3a3d44] p-8 text-center">
            <p className="text-zinc-400 uppercase tracking-wider font-bold text-sm">
              No events scheduled this month
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
