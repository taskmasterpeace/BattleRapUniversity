// Scene roster — browse every real battler in the game world (excludes test profiles).
// Filterable by league. Each card links to the battler's profile.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import ChallengeButton from '@/components/battlers/ChallengeButton';
import { portraitFillStyle } from '@/lib/sprite-crops';

type Battler = {
  id: string;
  stage_name: string;
  primary_league_id: string | null;
  region: string | null;
  tier: string | null;
  is_ai: boolean;
  avatar_url: string | null;
};

type LeagueLite = { id: string; name: string; short_code: string };
type Ranking = { battler_id: string; rating: number; wins: number; losses: number };

// Cold->hot prestige ladder — no purple (house rule #1), no blue default.
const TIER_COLOR: Record<string, string> = {
  low: 'text-zinc-400 border-zinc-600',
  mid: 'text-emerald-300 border-emerald-500/50',
  top: 'text-amber-300 border-amber-500/50',
  god: 'text-[#ff8c42] border-[#ff8c42]',
};

// Tier accent for each fighter card's top rule (Flyer System roster language)
const TIER_EDGE: Record<string, string> = {
  low: '#3E404A',
  mid: '#2FA46B',
  top: '#E7B23C',
  god: '#F5731A',
};

export default async function BattlersRosterPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string; view?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect('/login');
  const params = await searchParams;
  const playersView = params.view === 'players';

  const supabase = await createServerSupabaseClient();

  // Filter out validation/test battlers (Test_* prefix is used by simulation harnesses)
  let q = supabase
    .from('battlers')
    .select('id, stage_name, primary_league_id, region, tier, is_ai, avatar_url')
    .not('stage_name', 'like', 'Test_%')
    .order('tier', { ascending: false })
    .order('stage_name');
  if (params.league) q = q.eq('primary_league_id', params.league);
  if (playersView) q = q.eq('is_ai', false);

  const [{ data: battlers }, { data: leagues }, { data: rankings }, { data: myBattler }] =
    await Promise.all([
      q,
      supabase.from('leagues').select('id, name, short_code').order('name'),
      supabase.from('rankings').select('battler_id, rating, wins, losses'),
      supabase
        .from('battlers')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_ai', false)
        .maybeSingle(),
    ]);

  // In PLAYERS view, hide your own battler — you can't challenge yourself
  const list: Battler[] = ((battlers ?? []) as Battler[]).filter(
    (b) => !playersView || b.id !== myBattler?.id
  );
  const leagueMap = new Map<string, LeagueLite>(
    ((leagues ?? []) as LeagueLite[]).map((l) => [l.id, l])
  );
  const rankMap = new Map<string, Ranking>(
    ((rankings ?? []) as Ranking[]).map((r) => [r.battler_id, r])
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 animate-fade-in-up">
      <div className="border-b-2 border-[#3a3d44] bg-[#18191c]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-display font-black tracking-tighter mb-2">
            BATTLER ROSTER
          </h1>
          <p className="text-zinc-400 text-sm uppercase tracking-wide">
            {playersView
              ? `${list.length} real players in the scene — call one out`
              : `${list.length} battlers in the world — known names, rising stars, and legends`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* World / Players toggle */}
        <div className="mb-6 flex gap-2">
          <Link
            href={params.league ? `/battlers?league=${params.league}` : '/battlers'}
            className={`px-5 py-2.5 text-sm font-display font-black uppercase tracking-wider border-2 transition ${
              !playersView
                ? 'bg-[#ff8c42] border-[#ff8c42] text-black'
                : 'border-[#3a3d44] text-zinc-400 hover:border-[#ff8c42] hover:text-[#ff8c42]'
            }`}
          >
            FULL ROSTER
          </Link>
          <Link
            href={
              params.league
                ? `/battlers?view=players&league=${params.league}`
                : '/battlers?view=players'
            }
            className={`px-5 py-2.5 text-sm font-display font-black uppercase tracking-wider border-2 transition ${
              playersView
                ? 'bg-[#ff8c42] border-[#ff8c42] text-black'
                : 'border-[#3a3d44] text-zinc-400 hover:border-[#ff8c42] hover:text-[#ff8c42]'
            }`}
          >
            👤 PLAYERS
          </Link>
        </div>

        {/* League filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={playersView ? '/battlers?view=players' : '/battlers'}
            className={`px-3 py-2 text-xs uppercase tracking-wider font-bold border-2 transition ${
              !params.league
                ? 'border-[#ff8c42] text-[#ff8c42] bg-[#ff8c42]/10'
                : 'border-[#3a3d44] text-zinc-400 hover:border-[#ff8c42] hover:text-[#ff8c42]'
            }`}
          >
            All Leagues
          </Link>
          {((leagues ?? []) as LeagueLite[]).map((l) => (
            <Link
              key={l.id}
              href={`/battlers?league=${l.id}${playersView ? '&view=players' : ''}`}
              className={`px-3 py-2 text-xs uppercase tracking-wider font-bold border-2 transition ${
                params.league === l.id
                  ? 'border-[#ff8c42] text-[#ff8c42] bg-[#ff8c42]/10'
                  : 'border-[#3a3d44] text-zinc-400 hover:border-[#ff8c42] hover:text-[#ff8c42]'
              }`}
            >
              {l.short_code}
            </Link>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="bg-[#18191c] border-2 border-[#3a3d44] p-10 text-center text-zinc-400 uppercase tracking-wider font-bold">
            {playersView
              ? 'No other players in the scene yet. Spread the word.'
              : 'No battlers match this filter.'}
          </div>
        ) : (
          <div className="fs grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {list.map((b) => {
              const league = b.primary_league_id ? leagueMap.get(b.primary_league_id) : undefined;
              const rank = rankMap.get(b.id);
              const tierKey = (b.tier || '').toLowerCase();
              const tierClass = TIER_COLOR[tierKey] || 'text-zinc-400 border-zinc-600';
              const edge = TIER_EDGE[tierKey] || '#3E404A';
              return (
                <div
                  key={b.id}
                  className="group bg-[#17181C] border-2 border-black hover:border-[#F5731A] hover:-translate-y-[2px] hover:shadow-[0_10px_30px_-15px_rgba(245,115,26,0.6)] transition-all duration-200 overflow-hidden flex flex-col shadow-[4px_4px_0_rgba(0,0,0,.45)]"
                >
                  <Link href={`/battler/${b.id}`} className="block">
                    {/* Fighter-card frame — portrait FILLS it, anchored bottom (never floating) */}
                    <div
                      className="relative aspect-square overflow-hidden"
                      style={{
                        background: 'linear-gradient(170deg, #1F2024 0%, #101114 78%)',
                        borderTop: `3px solid ${edge}`,
                      }}
                    >
                      {b.avatar_url ? (
                        <img
                          src={b.avatar_url}
                          alt={b.stage_name}
                          loading="lazy"
                          style={portraitFillStyle(b.avatar_url, { targetH: 0.94 })}
                          className="transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 text-3xl">
                          ?
                        </div>
                      )}
                    </div>

                    <div className="p-3 space-y-2">
                      <h3
                        className="uppercase text-zinc-100 group-hover:text-[#F5731A] transition line-clamp-2 min-h-[2.4rem]"
                        style={{
                          fontFamily: 'var(--font-poster)',
                          fontSize: '17px',
                          lineHeight: 0.95,
                          textShadow: '2px 2px 0 #000',
                          letterSpacing: '.01em',
                        }}
                      >
                        {b.stage_name}
                      </h3>
                      <div className="flex items-center justify-between text-[12px] uppercase tracking-widest font-bold">
                        <span className={`px-2 py-0.5 border ${tierClass}`}>
                          {b.tier || 'unranked'}
                        </span>
                        {rank && (
                          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: '#E7B23C' }}>
                            {rank.rating}
                          </span>
                        )}
                      </div>
                      {league && (
                        <div className="text-[12px] uppercase tracking-widest text-zinc-500 truncate">
                          {league.short_code}
                        </div>
                      )}
                    </div>
                  </Link>
                  {playersView && (
                    <div className="p-3 pt-0 mt-auto">
                      <ChallengeButton opponentBattlerId={b.id} stageName={b.stage_name} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
