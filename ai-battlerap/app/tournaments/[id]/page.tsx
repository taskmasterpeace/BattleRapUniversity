import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/db/server';
import TournamentBracketClient from '@/components/tournament/TournamentBracketClient';

export default async function TournamentBracketPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, battler } = await getPlayerBattler();

  if (!user) {
    redirect('/login');
  }

  if (!battler) {
    redirect('/onboarding');
  }

  const supabase = await createServerSupabaseClient();
  const { id: tournamentId } = await params;

  // Get tournament details
  const { data: tournament } = await supabase
    .from('tournaments')
    .select(`
      *,
      leagues(name)
    `)
    .eq('id', tournamentId)
    .single();

  if (!tournament) {
    redirect('/tournaments');
  }

  // Get participants with battler info
  const { data: participants } = await supabase
    .from('tournament_participants')
    .select(`
      *,
      battlers!inner(id, stage_name, tier, avatar_url)
    `)
    .eq('tournament_id', tournamentId)
    .eq('is_active', true)
    .order('seed_number', { ascending: true });

  // Get brackets/matchups
  const { data: brackets } = await supabase
    .from('tournament_brackets')
    .select(`
      *,
      battler_1:battlers!tournament_brackets_battler_1_id_fkey(id, stage_name, tier, avatar_url),
      battler_2:battlers!tournament_brackets_battler_2_id_fkey(id, stage_name, tier, avatar_url),
      winner:battlers!tournament_brackets_winner_battler_id_fkey(id, stage_name),
      battle:battles(id, status, scheduled_at)
    `)
    .eq('tournament_id', tournamentId)
    .order('round', { ascending: true })
    .order('match_number', { ascending: true });

  // Check if player is participating
  const playerParticipation = participants?.find((p) => p.battlers.id === battler.id);

  return (
    <TournamentBracketClient
      tournament={tournament}
      participants={participants || []}
      brackets={brackets || []}
      playerParticipation={playerParticipation || null}
      playerId={battler.id}
    />
  );
}
