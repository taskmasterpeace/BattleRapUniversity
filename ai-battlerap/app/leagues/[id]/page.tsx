// League home — header + roster/standings + schedule (upcoming + recent) + link to throne sub-page.
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient, getUser } from '@/lib/db/server';

type League = {
  id: string;
  name: string;
  short_code: string;
  description: string | null;
  round_length_minutes: number;
  base_crowd_factor: number;
  writing_weight: number;
  performance_weight: number;
  booking_pace_days: number;
  personality_style: string | null;
  prestige_level: number | null;
  base_payout: number | null;
  city_id: string | null;
  logo_url: string | null;
};

type City = { id: string; name: string; state: string | null; country: string | null };

type Battler = {
  id: string;
  stage_name: string;
  tier: string;
  is_ai: boolean;
  avatar_url: string | null;
};

type Ranking = { battler_id: string; rating: number; wins: number; losses: number };

type Battle = {
  id: string;
  status: string;
  scheduled_at: string;
  battler_player_id: string;
  battler_ai_id: string;
  winner_battler_id: string | null;
};

// Cold->hot prestige ladder — no purple (house rule #1), no blue default.
const TIER_COLOR: Record<string, string> = {
  low: 'text-zinc-400 border-zinc-600',
  mid: 'text-emerald-300 border-emerald-500/50',
  top: 'text-amber-300 border-amber-500/50',
  god: 'text-[#ff8c42] border-[#ff8c42]',
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function LeagueHomePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) redirect('/login');
  const { id: leagueId } = await params;

  const supabase = await createServerSupabaseClient();

  const { data: league, error: leagueErr } = await supabase
    .from('leagues')
    .select('id, name, short_code, description, round_length_minutes, base_crowd_factor, writing_weight, performance_weight, booking_pace_days, personality_style, prestige_level, base_payout, city_id, logo_url')
    .eq('id', leagueId)
    .maybeSingle();

  if (leagueErr || !league) notFound();
  const l = league as League;

  // City (optional)
  const cityPromise: Promise<{ data: City | null }> = l.city_id
    ? (supabase.from('cities').select('id, name, state, country').eq('id', l.city_id).maybeSingle() as unknown as Promise<{ data: City | null }>)
    : Promise.resolve({ data: null });

  // Pull battlers signed primarily to this league. Exclude Test_* simulation rows.
  const battlersPromise = supabase
    .from('battlers')
    .select('id, stage_name, tier, is_ai, avatar_url')
    .eq('primary_league_id', leagueId)
    .not('stage_name', 'like', 'Test_%')
    .order('stage_name');

  // Upcoming battles in this league (not completed). Latest 12.
  const upcomingPromise = supabase
    .from('battles')
    .select('id, status, scheduled_at, battler_player_id, battler_ai_id, winner_battler_id')
    .eq('league_id', leagueId)
    .neq('status', 'completed')
    .order('scheduled_at', { ascending: true })
    .limit(12);

  // Recent completed. Latest 12.
  const recentPromise = supabase
    .from('battles')
    .select('id, status, scheduled_at, battler_player_id, battler_ai_id, winner_battler_id')
    .eq('league_id', leagueId)
    .eq('status', 'completed')
    .order('scheduled_at', { ascending: false })
    .limit(12);

  const [
    { data: city },
    { data: battlersRaw },
    { data: upcomingRaw },
    { data: recentRaw },
  ] = await Promise.all([cityPromise, battlersPromise, upcomingPromise, recentPromise]);

  const battlers: Battler[] = (battlersRaw ?? []) as Battler[];
  const upcoming: Battle[] = (upcomingRaw ?? []) as Battle[];
  const recent: Battle[] = (recentRaw ?? []) as Battle[];

  // Collect all battler IDs we need to resolve names for (roster + every fighter in upcoming/recent)
  const idSet = new Set<string>();
  battlers.forEach((b) => idSet.add(b.id));
  [...upcoming, ...recent].forEach((b) => {
    if (b.battler_player_id) idSet.add(b.battler_player_id);
    if (b.battler_ai_id) idSet.add(b.battler_ai_id);
  });

  const [{ data: allBattlers }, { data: rankings }] = await Promise.all([
    idSet.size > 0
      ? supabase.from('battlers').select('id, stage_name, tier, is_ai, avatar_url').in('id', Array.from(idSet))
      : Promise.resolve({ data: [] as Battler[] }),
    idSet.size > 0
      ? supabase.from('rankings').select('battler_id, rating, wins, losses').in('battler_id', Array.from(idSet))
      : Promise.resolve({ data: [] as Ranking[] }),
  ]);

  const battlerMap = new Map<string, Battler>(((allBattlers ?? []) as Battler[]).map((b) => [b.id, b]));
  const rankMap = new Map<string, Ranking>(((rankings ?? []) as Ranking[]).map((r) => [r.battler_id, r]));

  // Standings = roster sorted by ELO
  const standings = [...battlers]
    .map((b) => ({ ...b, rank: rankMap.get(b.id) }))
    .sort((a, b) => (b.rank?.rating ?? 0) - (a.rank?.rating ?? 0));

  function renderMatchup(b: Battle) {
    const a = battlerMap.get(b.battler_player_id);
    const c = battlerMap.get(b.battler_ai_id);
    const aName = a?.stage_name ?? '???';
    const cName = c?.stage_name ?? '???';
    const winnerId = b.winner_battler_id;
    const aWon = winnerId && winnerId === b.battler_player_id;
    const cWon = winnerId && winnerId === b.battler_ai_id;
    return (
      <Link
        key={b.id}
        href={`/battle/${b.id}`}
        className="block bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42] hover:-translate-y-[1px] hover:shadow-[0_10px_30px_-15px_rgba(255,140,66,0.5)] transition-all duration-200 p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-black uppercase tracking-tight truncate ${aWon ? 'text-[#ff8c42]' : 'text-zinc-200'}`}>
              {aName}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 my-1">vs</div>
            <div className={`text-sm font-black uppercase tracking-tight truncate ${cWon ? 'text-[#ff8c42]' : 'text-zinc-200'}`}>
              {cName}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">{fmtDate(b.scheduled_at)}</div>
            <div className="text-[10px] uppercase tracking-widest font-bold mt-1 text-zinc-400">{b.status}</div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 animate-fade-in-up">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#18191c]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link
            href="/leagues"
            className="text-[#ff8c42] hover:text-[#ff9d5c] text-xs uppercase tracking-wider font-bold mb-4 inline-block"
          >
            ← ALL LEAGUES
          </Link>
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#2d2f35] border-2 border-[#3a3d44] flex items-center justify-center shrink-0 overflow-hidden">
              {l.logo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={l.logo_url} alt={l.name} className="w-full h-full object-cover pixelated" />
              ) : (
                <span className="text-3xl font-anton text-zinc-700">{l.short_code.slice(0, 3)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono uppercase tracking-wider text-[#ff8c42] mb-1">
                {l.short_code}
                {city && (
                  <>
                    {' · '}
                    {city.name}
                    {city.state ? `, ${city.state}` : ''}
                  </>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tighter mb-2">
                {l.name}
              </h1>
              {l.description && (
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-4 max-w-3xl">
                  {l.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest font-bold">
                <span className="px-2 py-1 border-2 border-[#3a3d44] text-zinc-300">
                  {l.round_length_minutes}-min rounds
                </span>
                {l.personality_style && (
                  <span className="px-2 py-1 border-2 border-[#ff8c42]/40 text-[#ff8c42]">
                    {l.personality_style}
                  </span>
                )}
                {l.prestige_level != null && (
                  <span className="px-2 py-1 border-2 border-amber-500/40 text-amber-300">
                    Prestige {l.prestige_level}/10
                  </span>
                )}
                {l.base_payout != null && (
                  <span className="px-2 py-1 border-2 border-green-500/40 text-green-300">
                    Base ${l.base_payout.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Weights + throne link */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-[#18191c] border-2 border-[#3a3d44] p-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Writing</div>
            <div className="text-2xl font-black text-zinc-100">{Math.round(Number(l.writing_weight) * 100)}%</div>
          </div>
          <div className="bg-[#18191c] border-2 border-[#3a3d44] p-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Performance</div>
            <div className="text-2xl font-black text-zinc-100">{Math.round(Number(l.performance_weight) * 100)}%</div>
          </div>
          <div className="bg-[#18191c] border-2 border-[#3a3d44] p-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Crowd Factor</div>
            <div className="text-2xl font-black text-zinc-100">{Math.round(Number(l.base_crowd_factor) * 100)}%</div>
          </div>
          <Link
            href={`/leagues/${l.id}/thrones`}
            className="group bg-[#ff8c42]/10 border-2 border-[#ff8c42] hover:bg-[#ff8c42]/20 hover:-translate-y-[1px] hover:shadow-[0_10px_30px_-15px_rgba(255,140,66,0.6)] transition-all duration-200 p-4 flex flex-col justify-between"
          >
            <div className="text-[10px] uppercase tracking-widest text-[#ff8c42] mb-1">Throne System</div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-black uppercase tracking-tight text-zinc-100">
                View Crown →
              </div>
            </div>
          </Link>
        </div>

        {/* Two-column: Standings | Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Standings (col 1) */}
          <section className="lg:col-span-1">
            <h2 className="text-lg font-black uppercase tracking-tighter mb-3 flex items-center gap-2">
              <span className="text-[#ff8c42]">⚔</span> Standings
            </h2>
            {standings.length === 0 ? (
              <div className="bg-[#18191c] border-2 border-[#3a3d44] p-6 text-center text-zinc-500 text-sm uppercase tracking-wide">
                No battlers signed to this league yet
              </div>
            ) : (
              <div className="bg-[#18191c] border-2 border-[#3a3d44] divide-y divide-[#3a3d44]">
                {standings.slice(0, 15).map((b, i) => {
                  const tierClass = TIER_COLOR[(b.tier || '').toLowerCase()] || 'text-zinc-400 border-zinc-600';
                  const rating = b.rank?.rating ?? '—';
                  const w = b.rank?.wins ?? 0;
                  const losses = b.rank?.losses ?? 0;
                  return (
                    <Link
                      key={b.id}
                      href={`/battler/${b.id}`}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-[#2d2f35] transition-colors group"
                    >
                      <span className="w-6 text-xs font-mono text-zinc-500 shrink-0">{i + 1}</span>
                      <div
                        className="w-8 h-8 bg-[#2d2f35] bg-cover bg-center shrink-0"
                        style={b.avatar_url ? { backgroundImage: `url(${b.avatar_url})` } : undefined}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold uppercase tracking-tight text-zinc-100 group-hover:text-[#ff8c42] truncate">
                          {b.stage_name}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                          {w}W · {losses}L
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 border ${tierClass} shrink-0`}>
                        {b.tier || '—'}
                      </span>
                      <span className="text-sm font-black text-zinc-200 shrink-0 w-12 text-right">{rating}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            {standings.length > 15 && (
              <Link
                href={`/battlers?league=${l.id}`}
                className="block mt-2 text-xs uppercase tracking-widest font-bold text-[#ff8c42] hover:text-[#ff9d5c]"
              >
                View full roster ({standings.length}) →
              </Link>
            )}
          </section>

          {/* Schedule (col 2-3) */}
          <section className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter mb-3 flex items-center gap-2">
                <span className="text-[#ff8c42]">🔥</span> Upcoming Card
              </h2>
              {upcoming.length === 0 ? (
                <div className="bg-[#18191c] border-2 border-[#3a3d44] p-6 text-center text-zinc-500 text-sm uppercase tracking-wide">
                  Card&apos;s empty — somebody call out somebody
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcoming.map(renderMatchup)}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter mb-3 flex items-center gap-2">
                <span className="text-[#ff8c42]">📜</span> Recent Results
              </h2>
              {recent.length === 0 ? (
                <div className="bg-[#18191c] border-2 border-[#3a3d44] p-6 text-center text-zinc-500 text-sm uppercase tracking-wide">
                  No tape on the books yet — history starts with the first battle
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recent.map(renderMatchup)}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
