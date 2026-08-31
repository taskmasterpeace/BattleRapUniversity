// PUBLIC POWER RANKINGS — the shareable face of the game world.
// No login required (middleware protectedPaths does not include /leaderboard).
// Server component; service-role reads so anonymous visitors see the full ladder.
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import LeaderboardFilters from '@/components/leaderboard/LeaderboardFilters';
import ShareButton from '@/components/leaderboard/ShareButton';
import { portraitFillStyle } from '@/lib/sprite-crops';

export const dynamic = 'force-dynamic';

// ── types ──────────────────────────────────────────────────────────────────
type SearchParams = Promise<{
  city?: string;
  league?: string;
  players?: string;
  verified?: string;
}>;

type BattlerRow = {
  id: string;
  stage_name: string;
  region: string | null;
  tier: string | null;
  is_ai: boolean;
  is_real: boolean;
  avatar_url: string | null;
  primary_league_id: string | null;
  current_city_id: string | null;
  hometown_city_id: string | null;
};

type RankingRow = {
  battler_id: string;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
};

type LeagueRow = { id: string; name: string; short_code: string; city_id: string | null };
type CityRow = { id: string; name: string; state: string | null };

type RankedBattler = BattlerRow & {
  rating: number;
  wins: number;
  losses: number;
  streak: number;
  cityName: string | null;
  leagueCode: string | null;
};

// ── helpers ────────────────────────────────────────────────────────────────
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const unslug = (s: string) =>
  s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const TIER_COLOR: Record<string, string> = {
  low: 'text-zinc-400 border-zinc-600',
  mid: 'text-amber-300 border-amber-500/50',
  top: 'text-[#ff8c42] border-[#ff8c42]/50',
  god: 'text-[#ff8c42] border-[#ff8c42]',
};

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ── shared metadata copy ───────────────────────────────────────────────────
function scopeLabel(params: {
  city?: string;
  league?: string;
  players?: string;
  verified?: string;
}): string {
  if (params.city) return `${unslug(params.city)} Power Rankings`;
  if (params.league) return `${params.league.toUpperCase()} League Power Rankings`;
  if (params.players === '1') return 'Player Power Rankings';
  if (params.verified === '1') return 'Verified Battler Power Rankings';
  return 'Univercity Power Rankings';
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const title = `${scopeLabel(params)} — Battle Rap University`;
  const description =
    'The live power rankings of the Battle Rap University circuit. Every battler, one ladder — updated after every battle. Think you belong on this list?';
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// ── tiny presentational pieces (server-rendered) ───────────────────────────
function StreakChip({ streak, size = 'sm' }: { streak: number; size?: 'sm' | 'lg' }) {
  const pad = size === 'lg' ? 'px-2.5 py-1 text-xs' : 'px-1.5 py-0.5 text-[10px]';
  if (streak > 0) {
    return (
      <span
        className={`${pad} inline-flex items-center gap-1 border border-[#ff8c42]/60 bg-[#ff8c42]/10 text-[#ff8c42] font-mono font-bold tracking-wider`}
      >
        W{streak}
      </span>
    );
  }
  if (streak < 0) {
    return (
      <span
        className={`${pad} inline-flex items-center gap-1 border border-sky-500/50 bg-sky-500/10 text-sky-300 font-mono font-bold tracking-wider`}
      >
        L{Math.abs(streak)}
      </span>
    );
  }
  return <span className={`${pad} text-zinc-600 font-mono tracking-wider`}>—</span>;
}

function VerifiedTag({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const cls =
    size === 'lg'
      ? 'px-2.5 py-1 text-[11px]'
      : 'px-1.5 py-0.5 text-[9px]';
  return (
    <span
      className={`${cls} inline-flex items-center gap-1 bg-[#ff8c42] text-black font-mono font-bold uppercase tracking-widest`}
      title="Real battler — verified likeness"
    >
      ✓VERIFIED
    </span>
  );
}

function PlayerChip() {
  return (
    <span className="px-1.5 py-0.5 text-[9px] inline-flex items-center border border-green-500/50 bg-green-500/10 text-green-400 font-mono font-bold uppercase tracking-widest">
      PLAYER
    </span>
  );
}

function Avatar({
  url,
  name,
  className,
}: {
  url: string | null;
  name: string;
  className: string;
}) {
  return (
    <div
      role="img"
      aria-label={name}
      className={`relative overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(170deg, #1F2024 0%, #101114 78%)' }}
    >
      {url ? (
        // Fill-frame portrait, anchored bottom — never a floaty bg-cover crop.
        <img src={url} alt="" style={portraitFillStyle(url, { targetH: 0.95 })} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-700 font-bebas text-3xl">
          ?
        </div>
      )}
    </div>
  );
}

function Record({ wins, losses }: { wins: number; losses: number }) {
  return (
    <span className="font-mono">
      <span className="text-green-400">{wins}</span>
      <span className="text-zinc-600">–</span>
      <span className="text-red-400">{losses}</span>
    </span>
  );
}

// ── podium card ────────────────────────────────────────────────────────────
function PodiumCard({ b, place }: { b: RankedBattler; place: 1 | 2 | 3 }) {
  const isFirst = place === 1;
  const medal = place === 1 ? '#1' : place === 2 ? '#2' : '#3';
  const tierClass = TIER_COLOR[(b.tier || '').toLowerCase()] || 'text-zinc-400 border-zinc-600';

  return (
    <div
      className={`relative flex-1 bg-[#18191c] border-2 transition-all duration-200 ${
        isFirst
          ? 'border-[#ff8c42] shadow-[0_0_50px_-8px_rgba(255,140,66,0.55)] md:-translate-y-6 z-10'
          : 'border-[#3a3d44] hover:border-[#ff8c42]/60'
      }`}
    >
      {/* giant rank watermark */}
      <span
        className={`absolute top-1 right-3 font-bebas leading-none select-none pointer-events-none ${
          isFirst ? 'text-7xl text-[#ff8c42]/25' : 'text-6xl text-zinc-700/40'
        }`}
      >
        {place}
      </span>

      {/* rank ribbon */}
      <div
        className={`absolute -top-px -left-px px-3 py-1 font-bebas text-xl leading-none z-10 ${
          isFirst ? 'bg-[#ff8c42] text-black' : 'bg-[#2d2f35] text-zinc-300'
        }`}
      >
        {medal} #{place}
      </div>

      <Link href={`/battler/${b.id}`} className="block group">
        <Avatar
          url={b.avatar_url}
          name={b.stage_name}
          className={`w-full ${isFirst ? 'aspect-square' : 'aspect-[1/0.9]'} transition-transform duration-300 group-hover:scale-[1.03]`}
        />
        <div className={`p-4 ${isFirst ? 'md:p-5' : ''} space-y-2`}>
          <div className="flex flex-wrap items-center gap-1.5">
            {b.is_real && <VerifiedTag />}
            {!b.is_ai && <PlayerChip />}
          </div>
          <h3
            className={`font-display font-black uppercase tracking-tight leading-tight group-hover:text-[#ff8c42] transition ${
              isFirst ? 'text-2xl md:text-3xl text-white' : 'text-xl text-zinc-100'
            }`}
          >
            {b.stage_name}
          </h3>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                RATING
              </p>
              <p
                className={`font-bebas leading-none ${
                  isFirst ? 'text-6xl md:text-7xl text-[#ff8c42]' : 'text-5xl text-zinc-100'
                }`}
              >
                {b.rating}
              </p>
            </div>
            <div className="text-right space-y-1 pb-0.5">
              <p className="text-sm">
                <Record wins={b.wins} losses={b.losses} />
              </p>
              <StreakChip streak={b.streak} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#2d2f35]">
            <span
              className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-widest ${tierClass}`}
            >
              {b.tier || 'unranked'}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 truncate max-w-[55%] text-right">
              {b.cityName || b.region || '—'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────
export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const citySlug = params.city || null;
  const leagueSlug = params.league || null;
  const playersOnly = params.players === '1';
  const verifiedOnly = params.verified === '1';

  const supabase = serviceClient();

  const [{ data: battlers }, { data: rankings }, { data: leagues }, { data: cities }] =
    await Promise.all([
      supabase
        .from('battlers')
        .select(
          'id, stage_name, region, tier, is_ai, is_real, avatar_url, primary_league_id, current_city_id, hometown_city_id'
        )
        .not('stage_name', 'like', 'Test_%'),
      supabase.from('rankings').select('battler_id, rating, wins, losses, streak'),
      supabase.from('leagues').select('id, name, short_code, city_id').order('name'),
      supabase.from('cities').select('id, name, state').order('name'),
    ]);

  const cityList = (cities ?? []) as CityRow[];
  const leagueList = (leagues ?? []) as LeagueRow[];
  const cityById = new Map(cityList.map((c) => [c.id, c]));
  const leagueById = new Map(leagueList.map((l) => [l.id, l]));
  const rankByBattler = new Map(
    ((rankings ?? []) as RankingRow[]).map((r) => [r.battler_id, r])
  );

  // resolve filter slugs → ids
  const cityFilter = citySlug
    ? cityList.find((c) => slugify(c.name) === citySlug) ?? null
    : null;
  const leagueFilter = leagueSlug
    ? leagueList.find(
        (l) => l.short_code.toLowerCase() === leagueSlug.toLowerCase() || l.id === leagueSlug
      ) ?? null
    : null;

  const totalWorld = (battlers ?? []).length;

  let ranked: RankedBattler[] = ((battlers ?? []) as BattlerRow[]).map((b) => {
    const r = rankByBattler.get(b.id);
    const cid = b.current_city_id || b.hometown_city_id;
    const city = cid ? cityById.get(cid) : undefined;
    const league = b.primary_league_id ? leagueById.get(b.primary_league_id) : undefined;
    return {
      ...b,
      rating: r?.rating ?? 1200,
      wins: r?.wins ?? 0,
      losses: r?.losses ?? 0,
      streak: r?.streak ?? 0,
      cityName: city?.name ?? null,
      leagueCode: league?.short_code ?? null,
    };
  });

  if (cityFilter) {
    ranked = ranked.filter(
      (b) => b.current_city_id === cityFilter.id || b.hometown_city_id === cityFilter.id
    );
  }
  if (leagueFilter) {
    ranked = ranked.filter((b) => b.primary_league_id === leagueFilter.id);
  }
  if (playersOnly) ranked = ranked.filter((b) => !b.is_ai);
  if (verifiedOnly) ranked = ranked.filter((b) => b.is_real);

  ranked.sort(
    (a, b) => b.rating - a.rating || b.wins - a.wins || a.stage_name.localeCompare(b.stage_name)
  );

  const top50 = ranked.slice(0, 50);
  const podium = top50.slice(0, 3);
  const rest = top50.slice(3);

  const scopeName = cityFilter
    ? cityFilter.name
    : leagueFilter
      ? leagueFilter.name
      : playersOnly
        ? 'Players'
        : verifiedOnly
          ? 'Verified'
          : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 overflow-x-hidden">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <header className="relative border-b-2 border-[#3a3d44] bg-[#101114] overflow-hidden">
        {/* orange glow + watermark */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#ff8c42]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-bebas text-[20vw] md:text-[14vw] leading-none text-white/[0.03] uppercase whitespace-nowrap select-none">
            POWER RANKINGS
          </span>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8 md:pt-16 md:pb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 border border-[#ff8c42]/50 bg-[#ff8c42]/5 font-mono text-[10px] sm:text-xs text-[#ff8c42] uppercase tracking-[0.25em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full bg-[#ff8c42] opacity-75" />
                <span className="relative inline-flex h-2 w-2 bg-[#ff8c42]" />
              </span>
              LIVE — UPDATES EVERY BATTLE
            </span>
          </div>

          <h1 className="font-bebas uppercase leading-[0.85] text-white">
            <span className="block text-5xl sm:text-7xl md:text-8xl drop-shadow-[0_0_30px_rgba(255,140,66,0.3)]">
              UNIVERCITY
            </span>
            <span className="block text-5xl sm:text-7xl md:text-8xl text-[#ff8c42] drop-shadow-[0_0_40px_rgba(255,140,66,0.45)]">
              POWER RANKINGS
            </span>
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-zinc-400">
              <span className="text-[#ff8c42] font-bold">{totalWorld}</span> BATTLERS IN THE
              CIRCUIT
            </p>
            {scopeName && (
              <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-zinc-400">
                SCOPE: <span className="text-white font-bold">{scopeName}</span> —{' '}
                <span className="text-[#ff8c42] font-bold">{ranked.length}</span> RANKED
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-10">
        {/* ── FILTERS + SHARE ───────────────────────────────────── */}
        <section className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <LeaderboardFilters
            cities={cityList.map((c) => ({ slug: slugify(c.name), label: c.name }))}
            leagues={leagueList.map((l) => ({
              slug: l.short_code.toLowerCase(),
              label: `${l.short_code} — ${l.name}`,
            }))}
            city={cityFilter ? slugify(cityFilter.name) : null}
            league={leagueFilter ? leagueFilter.short_code.toLowerCase() : null}
            playersOnly={playersOnly}
            verifiedOnly={verifiedOnly}
          />
          <ShareButton />
        </section>

        {top50.length === 0 ? (
          <section className="bg-[#18191c] border-2 border-[#3a3d44] p-12 text-center">
            <p className="font-bebas text-4xl text-zinc-500 mb-2">NOBODY ON THIS LADDER YET</p>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-600">
              No battlers match this filter — the throne is wide open.
            </p>
          </section>
        ) : (
          <>
            {/* ── TOP 3 PODIUM ──────────────────────────────────── */}
            <section aria-label="Top 3 battlers">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="font-display font-black uppercase tracking-tight text-xl sm:text-2xl text-white">
                  THE TOP <span className="text-[#ff8c42]">THREE</span>
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 hidden sm:block">
                  RATED BY THE CULTURE
                </p>
              </div>
              {/* mobile: #1 first then 2,3 — desktop: 2 / 1 / 3 with #1 elevated */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-5 md:items-end md:pt-6">
                {podium[1] && (
                  <div className="flex-1 order-2 md:order-none flex">
                    <PodiumCard b={podium[1]} place={2} />
                  </div>
                )}
                {podium[0] && (
                  <div className="flex-1 order-1 md:order-none flex md:px-0">
                    <PodiumCard b={podium[0]} place={1} />
                  </div>
                )}
                {podium[2] && (
                  <div className="flex-1 order-3 md:order-none flex">
                    <PodiumCard b={podium[2]} place={3} />
                  </div>
                )}
              </div>
            </section>

            {/* ── RANKS 4–50 ────────────────────────────────────── */}
            {rest.length > 0 && (
              <section aria-label="Ranks 4 through 50">
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="font-display font-black uppercase tracking-tight text-xl sm:text-2xl text-white">
                    THE <span className="text-[#ff8c42]">LADDER</span>
                  </h2>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
                    #4 — #{top50.length}
                  </p>
                </div>

                <div className="bg-[#18191c] border-2 border-[#3a3d44]">
                  {/* column headers */}
                  <div className="hidden sm:grid grid-cols-[3rem_2.5rem_1fr_8rem_5rem_5rem_5rem] gap-3 items-center px-4 py-2 border-b-2 border-[#3a3d44] bg-[#101114]">
                    {['RANK', '', 'BATTLER', 'CITY', 'RECORD', 'STREAK', 'RATING'].map(
                      (h, i) => (
                        <span
                          key={`${h}-${i}`}
                          className={`font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-600 ${
                            i >= 4 ? 'text-right' : ''
                          }`}
                        >
                          {h}
                        </span>
                      )
                    )}
                  </div>

                  {rest.map((b, i) => {
                    const rank = i + 4;
                    const hot = b.streak >= 2;
                    return (
                      <div
                        key={b.id}
                        className={`grid grid-cols-[2.2rem_2.5rem_minmax(0,1fr)_4.5rem_4rem] sm:grid-cols-[3rem_2.5rem_1fr_8rem_5rem_5rem_5rem] gap-2 sm:gap-3 items-center px-3 sm:px-4 py-2.5 border-b border-[#2d2f35] last:border-b-0 hover:bg-[#1f2024] transition group ${
                          hot ? 'border-l-2 border-l-[#ff8c42]' : 'border-l-2 border-l-transparent'
                        }`}
                      >
                        {/* rank */}
                        <span className="font-mono text-xs sm:text-sm text-zinc-500 font-bold">
                          #{rank}
                          {hot && <span className="text-[#ff8c42] ml-0.5">▲</span>}
                        </span>

                        {/* avatar */}
                        <Avatar
                          url={b.avatar_url}
                          name={b.stage_name}
                          className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 border border-[#2d2f35]"
                        />

                        {/* name + chips */}
                        <div className="min-w-0">
                          <Link
                            href={`/battler/${b.id}`}
                            className="block font-display font-black uppercase tracking-tight text-sm sm:text-base text-zinc-100 group-hover:text-[#ff8c42] transition truncate"
                          >
                            {b.stage_name}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {b.is_real && <VerifiedTag />}
                            {!b.is_ai && <PlayerChip />}
                            {/* mobile-only city */}
                            <span className="sm:hidden font-mono text-[9px] uppercase tracking-widest text-zinc-600 truncate">
                              {b.cityName || b.region || ''}
                            </span>
                          </div>
                        </div>

                        {/* city (desktop) */}
                        <span className="hidden sm:block font-mono text-[10px] uppercase tracking-widest text-zinc-500 truncate">
                          {b.cityName || b.region || '—'}
                        </span>

                        {/* record (desktop) */}
                        <span className="hidden sm:block text-right text-xs">
                          <Record wins={b.wins} losses={b.losses} />
                        </span>

                        {/* streak */}
                        <span className="hidden sm:flex justify-end">
                          <StreakChip streak={b.streak} />
                        </span>

                        {/* rating — mobile shows record under it */}
                        <span className="text-right">
                          <span className="font-mono font-bold text-sm sm:text-base text-zinc-100 tabular-nums">
                            {b.rating}
                          </span>
                          <span className="block sm:hidden text-[10px]">
                            <Record wins={b.wins} losses={b.losses} />
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── FOOTER CTA ────────────────────────────────────────── */}
        <section className="relative border-2 border-[#ff8c42]/40 bg-gradient-to-b from-[#18191c] to-[#101114] py-12 sm:py-16 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-bebas text-[18vw] md:text-[10vw] leading-none text-[#ff8c42]/[0.05] uppercase whitespace-nowrap select-none">
              PROVE IT
            </span>
          </div>
          <div className="relative">
            <h2 className="font-bebas text-4xl sm:text-6xl uppercase text-white leading-[0.9]">
              THINK YOU BELONG
              <br />
              ON <span className="text-[#ff8c42]">THIS LIST?</span>
            </h2>
            <p className="mt-4 font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-zinc-500">
              HUMANS RANK AMONG THE WORLD — NO HANDICAPS, NO EXCUSES
            </p>
            <Link
              href="/login"
              className="inline-block mt-8 px-8 sm:px-12 py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider text-base sm:text-xl transition-all hover:-translate-y-[2px] hover:shadow-[0_16px_50px_-10px_rgba(255,140,66,0.9)]"
            >
              CREATE YOUR BATTLER
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
