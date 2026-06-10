// City detail — THE local scene hub. Skyline hero, travel button,
// local leagues, and the locals you can battle or recruit (in person only).
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import TravelButton from '@/components/city/TravelButton';
import RecruitButton from '@/components/city/RecruitButton';
import { MAX_CREW_SIZE, recruitCostForTier } from '@/lib/game/crew';

const DEFAULT_TRAVEL_COST = 200;

type LocalBattler = {
  id: string;
  stage_name: string;
  tier: string | null;
  is_ai: boolean;
  is_real: boolean;
  avatar_url: string | null;
  current_city_id: string | null;
  hometown_city_id: string | null;
};

type LeagueRow = {
  id: string;
  name: string;
  short_code: string;
  logo_url: string | null;
  writing_weight: number;
  performance_weight: number;
  round_length_minutes: number;
};

const TIER_COLOR: Record<string, string> = {
  low: 'text-zinc-400 border-zinc-600',
  mid: 'text-blue-300 border-blue-500/50',
  top: 'text-purple-300 border-purple-500/50',
  god: 'text-[#ff8c42] border-[#ff8c42]',
};

const TIER_ORDER: Record<string, number> = { god: 3, top: 2, mid: 1, low: 0 };

export default async function CityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect('/login');

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: city } = await supabase
    .from('cities')
    .select('id, name, state, country, scene_size, culture_style, background_url, skyline_url')
    .eq('id', id)
    .maybeSingle();

  if (!city) notFound();

  const [
    { data: leagues },
    { data: locals },
    { data: playerBattler },
    { data: costRow },
  ] = await Promise.all([
    supabase
      .from('leagues')
      .select('id, name, short_code, logo_url, writing_weight, performance_weight, round_length_minutes')
      .eq('city_id', city.id)
      .order('name'),
    supabase
      .from('battlers')
      .select('id, stage_name, tier, is_ai, is_real, avatar_url, current_city_id, hometown_city_id')
      .or(`current_city_id.eq.${city.id},hometown_city_id.eq.${city.id}`)
      .not('stage_name', 'like', 'Test_%'),
    supabase
      .from('battlers')
      .select('id, current_city_id, current_balance')
      .eq('user_id', user.id)
      .eq('is_ai', false)
      .maybeSingle(),
    supabase
      .from('travel_costs')
      .select('cost')
      .eq('scene_size', city.scene_size ?? '')
      .maybeSingle(),
  ]);

  // Player's crew (gates the recruit buttons)
  const { data: crew } = playerBattler
    ? await supabase
        .from('crew_members')
        .select('id, member_battler_id')
        .eq('owner_battler_id', playerBattler.id)
    : { data: [] as { id: string; member_battler_id: string }[] };

  const crewMemberIds = new Set((crew ?? []).map((m) => m.member_battler_id));
  const crewFull = (crew ?? []).length >= MAX_CREW_SIZE;

  const travelCost = costRow?.cost ?? DEFAULT_TRAVEL_COST;
  const playerIsHere = !!playerBattler && playerBattler.current_city_id === city.id;
  const balance = playerBattler?.current_balance ?? 0;

  const localList = ((locals ?? []) as LocalBattler[])
    .filter((b) => b.id !== playerBattler?.id)
    .sort((a, b) => {
      const tierDiff =
        (TIER_ORDER[(b.tier || '').toLowerCase()] ?? 0) -
        (TIER_ORDER[(a.tier || '').toLowerCase()] ?? 0);
      if (tierDiff !== 0) return tierDiff;
      if (a.is_real !== b.is_real) return a.is_real ? -1 : 1;
      return a.stage_name.localeCompare(b.stage_name);
    });

  const leagueList = (leagues ?? []) as LeagueRow[];
  const hero = city.background_url || city.skyline_url;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 animate-fade-in-up">
      {/* ── Hero: skyline ─────────────────────────────────────────── */}
      <div className="relative border-b-2 border-[#3a3d44]">
        <div
          className="h-72 md:h-80 bg-[#18191c] bg-cover bg-center"
          style={hero ? { backgroundImage: `url(${hero})` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-7xl mx-auto px-6 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <Link
                  href="/cities"
                  className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-[#ff8c42] transition"
                >
                  ← All cities
                </Link>
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-zinc-100 drop-shadow-lg">
                {city.name.toUpperCase()}
              </h1>
              <p className="text-sm uppercase tracking-widest text-zinc-300 drop-shadow mt-1">
                {[city.state, city.country].filter(Boolean).join(' · ')}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 text-[10px] uppercase tracking-widest font-bold">
                {city.scene_size && (
                  <span className="px-2 py-1 bg-[#101114]/80 border border-[#3a3d44] text-zinc-300">
                    {city.scene_size} scene
                  </span>
                )}
                {city.culture_style && (
                  <span className="px-2 py-1 bg-[#101114]/80 border border-[#ff8c42]/40 text-[#ff8c42]">
                    {city.culture_style}
                  </span>
                )}
              </div>
            </div>

            {/* Travel / presence */}
            <div className="shrink-0">
              {playerIsHere ? (
                <div className="inline-flex items-center gap-2 px-4 py-3 bg-[#ff8c42]/15 border-2 border-[#ff8c42] text-[#ff8c42] font-black uppercase tracking-wider text-sm">
                  <span className="w-2 h-2 rounded-full bg-[#ff8c42] animate-pulse" />
                  You are here
                </div>
              ) : playerBattler ? (
                <TravelButton
                  cityId={city.id}
                  cityName={city.name}
                  cost={travelCost}
                  balance={balance}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* ── Local leagues ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-2xl font-display font-black tracking-tighter">LOCAL LEAGUES</h2>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              {leagueList.length} based here
            </span>
          </div>

          {leagueList.length === 0 ? (
            <div className="bg-[#18191c] border-2 border-[#3a3d44] p-8 text-center text-zinc-500 uppercase tracking-wider font-bold text-sm">
              No leagues based in {city.name} yet — the scene is still underground
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {leagueList.map((l) => (
                <Link
                  key={l.id}
                  href={`/leagues/${l.id}`}
                  className="group bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42] hover:-translate-y-[2px] hover:shadow-[0_10px_30px_-15px_rgba(255,140,66,0.6)] transition-all duration-200 p-4 flex items-center gap-4"
                >
                  <div
                    className="w-14 h-14 shrink-0 bg-[#2d2f35] bg-cover bg-center border border-[#3a3d44]"
                    style={l.logo_url ? { backgroundImage: `url(${l.logo_url})` } : undefined}
                  >
                    {!l.logo_url && (
                      <div className="w-full h-full flex items-center justify-center font-black text-zinc-600 text-xs">
                        {l.short_code?.slice(0, 3)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black uppercase tracking-tight text-sm group-hover:text-[#ff8c42] transition truncate">
                      {l.name}
                    </h3>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">
                      {Math.round(Number(l.writing_weight) * 100)}% pen ·{' '}
                      {Math.round(Number(l.performance_weight) * 100)}% perf ·{' '}
                      {l.round_length_minutes}min rds
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── The locals ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-2xl font-display font-black tracking-tighter">THE LOCALS</h2>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              {localList.length} battlers rep {city.name}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 mb-4">
            Recruiting is face to face — you can only sign locals while you&apos;re in town
          </p>

          {localList.length === 0 ? (
            <div className="bg-[#18191c] border-2 border-[#3a3d44] p-8 text-center text-zinc-500 uppercase tracking-wider font-bold text-sm">
              Nobody reps {city.name} yet — be the first
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {localList.map((b) => {
                const tierKey = (b.tier || '').toLowerCase();
                const tierClass = TIER_COLOR[tierKey] || 'text-zinc-400 border-zinc-600';
                const isHometown = b.hometown_city_id === city.id;
                const inTown = b.current_city_id === city.id;
                return (
                  <div
                    key={b.id}
                    className="group bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42] hover:-translate-y-[2px] hover:shadow-[0_10px_30px_-15px_rgba(255,140,66,0.6)] transition-all duration-200 overflow-hidden flex flex-col"
                  >
                    <Link href={`/battler/${b.id}`} className="block">
                      <div
                        className="aspect-square bg-[#2d2f35] bg-cover bg-center relative transition-transform duration-300 group-hover:scale-[1.04]"
                        style={b.avatar_url ? { backgroundImage: `url(${b.avatar_url})` } : undefined}
                      >
                        {!b.avatar_url && (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700 text-3xl">
                            ?
                          </div>
                        )}
                        {b.is_real && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#ff8c42] text-black text-[9px] font-black uppercase tracking-widest">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-3 space-y-2 flex-1 flex flex-col">
                      <Link href={`/battler/${b.id}`} className="block">
                        <h3 className="font-black uppercase tracking-tight text-sm group-hover:text-[#ff8c42] transition line-clamp-2 leading-tight min-h-[2.5rem]">
                          {b.stage_name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
                        <span className={`px-2 py-0.5 border ${tierClass}`}>
                          {b.tier || 'unranked'}
                        </span>
                        <span className="font-mono text-[9px] text-zinc-500">
                          {inTown ? 'IN TOWN' : isHometown ? 'HOMETOWN' : ''}
                        </span>
                      </div>

                      {/* Recruit — only AI battlers, only in person */}
                      {b.is_ai && playerBattler && (
                        <div className="mt-auto pt-1">
                          <RecruitButton
                            battlerId={b.id}
                            stageName={b.stage_name}
                            cost={recruitCostForTier(b.tier)}
                            playerIsHere={playerIsHere && inTown}
                            inCrew={crewMemberIds.has(b.id)}
                            crewFull={crewFull}
                            balance={balance}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
