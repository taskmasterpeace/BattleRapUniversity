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

  // Fetch throne positions
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/auth/v1', '')}/api/leagues/${leagueId}/thrones`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );

  const { thrones } = await response.json();

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
            href="/dashboard"
            className="inline-block bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-700 px-6 py-3 transition-colors"
          >
            <p className="text-sm font-black uppercase text-zinc-300 tracking-wide">
              ← BACK TO DASHBOARD
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
