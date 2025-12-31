import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/db/server';
import TournamentsClient from '@/components/tournament/TournamentsClient';
import { getTierFromRating } from '@/lib/game/paymentCalculator';

export default async function TournamentsPage() {
  const { user, battler } = await getPlayerBattler();

  if (!user) {
    redirect('/login');
  }

  if (!battler) {
    redirect('/onboarding');
  }

  const supabase = await createServerSupabaseClient();

  // Get player's rating and tier
  const { data: ranking } = await supabase
    .from('rankings')
    .select('rating')
    .eq('battler_id', battler.id)
    .single();

  const playerTier = ranking ? getTierFromRating(ranking.rating) : 'low';

  // Get all active tournaments (registration or in progress)
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select(`
      *,
      leagues(name)
    `)
    .in('status', ['registration', 'seeding', 'in_progress'])
    .order('tournament_starts_at', { ascending: true });

  // Get player's registrations
  const { data: myRegistrations } = await supabase
    .from('tournament_participants')
    .select(`
      *,
      tournaments!inner(*)
    `)
    .eq('battler_id', battler.id)
    .eq('is_active', true);

  // Get completed tournaments (for achievements)
  const { data: completedTournaments } = await supabase
    .from('tournaments')
    .select(`
      *,
      leagues(name)
    `)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <TournamentsClient
      battler={battler}
      playerTier={playerTier}
      tournaments={tournaments || []}
      myRegistrations={myRegistrations || []}
      completedTournaments={completedTournaments || []}
    />
  );
}
