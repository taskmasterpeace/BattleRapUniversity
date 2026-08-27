/**
 * League Throne System Page
 *
 * Example implementation showing how to use the Throne Display component.
 * This page can be accessed at /leagues/[id]/thrones
 */

import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { redirect } from 'next/navigation';
import ThroneDisplay from '@/components/leagues/throne-display';
import ThroneChallengesWidget from '@/components/leagues/throne-challenges-widget';
import type { ThronePosition } from '@/lib/types/throne';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LeagueThronesPage({ params }: Props) {
  const { id: leagueId } = await params;

  // Get authenticated user
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  const supabase = await createServerSupabaseClient();

  // Get user's battler
  const { data: battler } = await supabase
    .from('battlers')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!battler) {
    redirect('/onboarding');
  }

  // Get league info
  const { data: league } = await supabase
    .from('leagues')
    .select('id, name, short_code')
    .eq('id', leagueId)
    .single();

  if (!league) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-500/20 border-2 border-red-500 p-6 text-center">
            <p className="text-xl font-black uppercase text-red-400 tracking-wide">
              LEAGUE NOT FOUND
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get player's rating for challenge eligibility
  const { data: ranking } = await supabase
    .from('rankings')
    .select('rating')
    .eq('battler_id', battler.id)
    .single();

  const playerRating = ranking?.rating || 1200;

  // Fetch throne positions directly via Supabase (same logic as /api route, no HTTP roundtrip).
  // The previous implementation fetch()'d an absolute URL built from NEXT_PUBLIC_SUPABASE_URL —
  // which points at Supabase, not this app — so it always 500'd.
  const { data: thronesRaw, error: thronesError } = await supabase
    .from('throne_positions')
    .select('id, league_id, position, battler_id, started_at, defense_count')
    .eq('league_id', leagueId)
    .order('position', { ascending: true });

  // If the throne_positions table is missing or empty, render three vacant slots.
  const missingTable =
    !!thronesError &&
    (thronesError.code === 'PGRST205' ||
      thronesError.message?.toLowerCase().includes('schema cache') ||
      thronesError.message?.toLowerCase().includes('does not exist'));

  let thrones: ThronePosition[] = [];

  if (missingTable || !thronesRaw || thronesRaw.length === 0) {
    // No persisted throne data yet — seed the display from the league standings.
    // The thrones ARE the top 3 by rating (per "TOP 3 RANKINGS"), so a league full
    // of ranked battlers should read as its top three, not three empty thrones.
    const { data: leagueBattlers } = await supabase
      .from('battlers')
      .select('id, stage_name')
      .eq('primary_league_id', leagueId)
      .not('stage_name', 'like', 'Test_%');
    const ids = (leagueBattlers ?? []).map((b) => b.id as string);
    let ranked: { id: string; name: string; rating: number }[] = [];
    if (ids.length > 0) {
      const { data: rs } = await supabase
        .from('rankings')
        .select('battler_id, rating')
        .in('battler_id', ids);
      const nameById = new Map(
        (leagueBattlers ?? []).map((b) => [b.id as string, b.stage_name as string])
      );
      ranked = (rs ?? [])
        .map((r) => ({
          id: r.battler_id as string,
          name: nameById.get(r.battler_id as string) ?? 'Unknown',
          rating: r.rating as number,
        }))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    }
    thrones = ([1, 2, 3] as const).map((position) => {
      const top = ranked[position - 1];
      return {
        id: '',
        league_id: leagueId,
        position,
        battler_id: top?.id ?? null,
        battlerName: top?.name,
        battlerRating: top?.rating,
        started_at: new Date().toISOString(),
        defense_count: 0,
      };
    });
  } else {
    const battlerIds = thronesRaw.filter((t) => t.battler_id).map((t) => t.battler_id as string);
    let nameMap = new Map<string, string>();
    let ratingMap = new Map<string, number>();
    if (battlerIds.length > 0) {
      const [{ data: bs }, { data: rs }] = await Promise.all([
        supabase.from('battlers').select('id, stage_name').in('id', battlerIds),
        supabase.from('rankings').select('battler_id, rating').in('battler_id', battlerIds),
      ]);
      nameMap = new Map((bs ?? []).map((b) => [b.id as string, b.stage_name as string]));
      ratingMap = new Map((rs ?? []).map((r) => [r.battler_id as string, r.rating as number]));
    }
    thrones = thronesRaw.map((t) => ({
      ...t,
      position: t.position as 1 | 2 | 3,
      battlerName: t.battler_id ? nameMap.get(t.battler_id) ?? 'Unknown' : undefined,
      battlerRating: t.battler_id ? ratingMap.get(t.battler_id) ?? 1200 : undefined,
    }));
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-zinc-100 mb-2">
            {league.name}
          </h1>
          <p className="text-lg text-zinc-400 uppercase tracking-wide">
            THRONE SYSTEM - TOP 3 RANKINGS
          </p>
        </div>

        {/* Pending Challenges Widget */}
        <div className="mb-6">
          <ThroneChallengesWidget playerBattlerId={battler.id} />
        </div>

        {/* Throne Display */}
        <ThroneDisplay
          leagueId={league.id}
          leagueName={league.name}
          thrones={thrones || []}
          playerBattlerId={battler.id}
          playerRating={playerRating}
        />

        {/* Back Button */}
        <div className="mt-8">
          <a
            href={`/leagues/${league.id}`}
            className="inline-block bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-700 px-6 py-3 transition-colors"
          >
            <p className="text-sm font-black uppercase text-zinc-300 tracking-wide">
              ← BACK TO {league.short_code}
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
