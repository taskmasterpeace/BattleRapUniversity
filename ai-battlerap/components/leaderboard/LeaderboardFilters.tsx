'use client';

// Filter island for the public Power Rankings page.
// All state lives in the URL (?city=, ?league=, ?players=1, ?verified=1) so
// every filtered view is a shareable link.
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export type CityOption = { slug: string; label: string };
export type LeagueOption = { slug: string; label: string };

type Props = {
  cities: CityOption[];
  leagues: LeagueOption[];
  city: string | null;
  league: string | null;
  playersOnly: boolean;
  verifiedOnly: boolean;
};

function buildHref(params: {
  city?: string | null;
  league?: string | null;
  players?: boolean;
  verified?: boolean;
}) {
  const sp = new URLSearchParams();
  if (params.city) sp.set('city', params.city);
  if (params.league) sp.set('league', params.league);
  if (params.players) sp.set('players', '1');
  if (params.verified) sp.set('verified', '1');
  const qs = sp.toString();
  return qs ? `/leaderboard?${qs}` : '/leaderboard';
}

export default function LeaderboardFilters({
  cities,
  leagues,
  city,
  league,
  playersOnly,
  verifiedOnly,
}: Props) {
  const router = useRouter();

  const tabBase =
    'px-4 py-2.5 text-xs sm:text-sm font-display font-black uppercase tracking-wider border-2 transition whitespace-nowrap';
  const tabActive = 'bg-[#ff8c42] border-[#ff8c42] text-black';
  const tabIdle =
    'border-[#3a3d44] text-zinc-400 hover:border-[#ff8c42] hover:text-[#ff8c42] bg-[#101114]';

  const isGlobal = !playersOnly && !verifiedOnly;

  return (
    <div className="space-y-3">
      {/* mode tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <Link
          href={buildHref({ city, league })}
          className={`${tabBase} ${isGlobal ? tabActive : tabIdle}`}
        >
          🌍 GLOBAL
        </Link>
        <Link
          href={buildHref({ city, league, players: true })}
          className={`${tabBase} ${playersOnly ? tabActive : tabIdle}`}
        >
          👤 PLAYERS ONLY
        </Link>
        <Link
          href={buildHref({ city, league, verified: true })}
          className={`${tabBase} ${verifiedOnly ? tabActive : tabIdle}`}
        >
          ✓ VERIFIED
        </Link>
      </div>

      {/* scope selects */}
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 bg-[#101114] border-2 border-[#3a3d44] px-3 py-2 focus-within:border-[#ff8c42] transition">
          <span className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-500">
            CITY
          </span>
          <select
            value={city ?? ''}
            onChange={(e) =>
              router.push(
                buildHref({
                  city: e.target.value || null,
                  league,
                  players: playersOnly,
                  verified: verifiedOnly,
                })
              )
            }
            className="bg-transparent text-xs font-bold uppercase tracking-wider text-zinc-200 outline-none cursor-pointer [&>option]:bg-[#18191c]"
          >
            <option value="">ALL CITIES</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label.toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 bg-[#101114] border-2 border-[#3a3d44] px-3 py-2 focus-within:border-[#ff8c42] transition">
          <span className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-500">
            LEAGUE
          </span>
          <select
            value={league ?? ''}
            onChange={(e) =>
              router.push(
                buildHref({
                  city,
                  league: e.target.value || null,
                  players: playersOnly,
                  verified: verifiedOnly,
                })
              )
            }
            className="bg-transparent text-xs font-bold uppercase tracking-wider text-zinc-200 outline-none cursor-pointer [&>option]:bg-[#18191c]"
          >
            <option value="">ALL LEAGUES</option>
            {leagues.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.label.toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        {(city || league || playersOnly || verifiedOnly) && (
          <Link
            href="/leaderboard"
            className="flex items-center px-3 py-2 border-2 border-transparent text-[13px] font-mono uppercase tracking-[0.2em] text-zinc-500 hover:text-[#ff8c42] transition"
          >
            ✕ CLEAR
          </Link>
        )}
      </div>
    </div>
  );
}
