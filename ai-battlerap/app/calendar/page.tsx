// Global calendar — month view of every scheduled battle and tournament milestone.
// Designed as a quick at-a-glance overview; clicking a day shows full details server-side.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { portraitFillStyle } from '@/lib/sprite-crops';

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
type BattlerLite = { id: string; stage_name: string; avatar_url?: string | null };
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

// One event chip in a day cell. Already-fought battles are dimmed and checked so
// past matchups read differently from ones still on the books.
function EventChip({ e }: { e: Event }) {
  const done = e.status === 'completed';
  return (
    <Link
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
}

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
      ? supabase.from('battlers').select('id, stage_name, avatar_url').in('id', [...battlerIds])
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

  // FIGHT NIGHTS rail — the next bouts on the books (next 14 days, NOT bounded
  // to the month being browsed: the rail is "what's next", the grid is "when").
  const nowMs = Date.now();
  const { data: railRows } = await supabase
    .from('battles')
    .select('id, scheduled_at, status, league_id, battler_player_id, battler_ai_id')
    .in('status', ['offered', 'accepted', 'locked'])
    .gte('scheduled_at', new Date(nowMs - 6 * 3600e3).toISOString())
    .lte('scheduled_at', new Date(nowMs + 14 * 86400e3).toISOString())
    .order('scheduled_at')
    .limit(24);
  const railBattles = ((railRows ?? []) as Battle[]).filter(
    (b) => b.battler_player_id && b.battler_ai_id
  );
  const railBattlerIds = [
    ...new Set(railBattles.flatMap((b) => [b.battler_player_id!, b.battler_ai_id!])),
  ].filter((id) => !battlerMap.has(id));
  const railLeagueIds = [...new Set(railBattles.map((b) => b.league_id).filter(Boolean))].filter(
    (id) => !leagueMap.has(id as string)
  );
  const [{ data: railB }, { data: railL }] = await Promise.all([
    railBattlerIds.length
      ? supabase.from('battlers').select('id, stage_name, avatar_url').in('id', railBattlerIds)
      : Promise.resolve({ data: [] as BattlerLite[] }),
    railLeagueIds.length
      ? supabase.from('leagues').select('id, short_code, name').in('id', railLeagueIds as string[])
      : Promise.resolve({ data: [] as LeagueLite[] }),
  ]);
  for (const b of (railB ?? []) as BattlerLite[]) battlerMap.set(b.id, b);
  for (const l of (railL ?? []) as LeagueLite[]) leagueMap.set(l.id, l);

  const upcomingBouts = railBattles
    .filter((b) => {
      const a = battlerMap.get(b.battler_player_id!);
      const o = battlerMap.get(b.battler_ai_id!);
      return a && o && !a.stage_name.startsWith('Test_') && !o.stage_name.startsWith('Test_');
    })
    .slice(0, 8)
    .map((b) => {
      const isMine =
        (b.battler_player_id && myBattlerIds.has(b.battler_player_id)) ||
        (b.battler_ai_id && myBattlerIds.has(b.battler_ai_id));
      return {
        id: b.id,
        a: battlerMap.get(b.battler_player_id!),
        o: battlerMap.get(b.battler_ai_id!),
        league: b.league_id ? leagueMap.get(b.league_id) : undefined,
        mine: !!isMine,
        href: isMine ? `/battle/${b.id}` : `/watch/${b.id}`,
        dateLabel: new Date(b.scheduled_at)
          .toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' })
          .toUpperCase(),
      };
    });

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

      <div className="max-w-7xl mx-auto px-6 py-8 lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 lg:items-start">
        <div>
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
                  {dayEvents.slice(0, 4).map((e, idx) => (
                    <EventChip key={idx} e={e} />
                  ))}
                  {dayEvents.length > 4 && (
                    // Native disclosure so the overflow is actually reachable — the
                    // old "+N more" was a dead label, hiding every event past the
                    // fourth on a busy day. Expanding grows the week's row.
                    <details className="group">
                      <summary className="text-[10px] text-zinc-500 px-1 cursor-pointer list-none hover:text-[#ff8c42] [&::-webkit-details-marker]:hidden">
                        <span className="group-open:hidden">+{dayEvents.length - 4} more</span>
                        <span className="hidden group-open:inline">show less</span>
                      </summary>
                      <div className="space-y-1 mt-1">
                        {dayEvents.slice(4).map((e, idx) => (
                          <EventChip key={idx + 4} e={e} />
                        ))}
                      </div>
                    </details>
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

        {/* FIGHT NIGHTS rail — next bouts on the books, faces first */}
        <aside className="fs mt-8 lg:mt-0">
          <div className="bg-[#101114] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,.45)]">
            <div className="px-4 pt-4 pb-3 border-b border-[#2E2F35]">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#F5731A]">◤ FIGHT NIGHTS</p>
              <p
                className="uppercase text-zinc-100 mt-1"
                style={{ fontFamily: 'var(--font-poster)', fontSize: 22, lineHeight: 0.95, textShadow: '2px 2px 0 #000' }}
              >
                NEXT UP
              </p>
            </div>
            {upcomingBouts.length === 0 ? (
              <p className="p-4 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                NOTHING ON THE BOOKS — THE MATCHMAKERS ARE WORKING
              </p>
            ) : (
              <div>
                {upcomingBouts.map((bout) => (
                  <Link
                    key={bout.id}
                    href={bout.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 border-b border-[#2E2F35] last:border-b-0 hover:bg-[#17181C] transition-colors ${
                      bout.mine ? 'bg-[#F5731A]/10' : ''
                    }`}
                  >
                    <span
                      className="relative overflow-hidden shrink-0"
                      style={{ width: 40, height: 40, borderRadius: 6, background: '#17181C', borderTop: '2px solid #E23A2E' }}
                    >
                      {bout.a?.avatar_url && (
                        <img src={bout.a.avatar_url} alt="" style={portraitFillStyle(bout.a.avatar_url, { targetH: 1.25 })} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display font-black uppercase text-[11px] leading-tight text-zinc-100 truncate">
                        {bout.mine && <span className="text-[#F5731A]">★ </span>}
                        {bout.a?.stage_name} <em className="not-italic" style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: '#E7B23C' }}>VS</em> {bout.o?.stage_name}
                      </span>
                      <span className="block font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-500 mt-0.5 truncate">
                        {bout.league?.short_code ? `${bout.league.short_code} · ` : ''}{bout.dateLabel}
                      </span>
                    </span>
                    <span
                      className="relative overflow-hidden shrink-0"
                      style={{ width: 40, height: 40, borderRadius: 6, background: '#17181C', borderTop: '2px solid #2F7DD1' }}
                    >
                      {bout.o?.avatar_url && (
                        <img src={bout.o.avatar_url} alt="" style={portraitFillStyle(bout.o.avatar_url, { targetH: 1.25 })} />
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/watch"
              className="block text-center py-2.5 border-t-2 border-black font-display font-black text-[10px] uppercase tracking-[0.25em] text-[#E7B23C] hover:bg-[#E7B23C] hover:text-black transition-colors"
            >
              ▸ TONIGHT'S CARD
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
