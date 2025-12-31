import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';

/**
 * GET /api/tournaments
 * Returns all tournaments with participant counts and user registration status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's battler
    const { data: battler, error: battlerError } = await supabase
      .from('battlers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (battlerError || !battler) {
      return NextResponse.json(
        { error: 'No battler found for user' },
        { status: 404 }
      );
    }

    // Get all tournaments with league info
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select(
        `
        *,
        league:leagues(
          id,
          name,
          short_code,
          logo_url
        )
      `
      )
      .order('registration_opens_at', { ascending: false });

    if (tournamentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch tournaments' },
        { status: 500 }
      );
    }

    // For each tournament, get participant count and check if user is registered
    const enrichedTournaments = await Promise.all(
      (tournaments || []).map(async (tournament) => {
        // Get participant count
        const { count: participantCount } = await supabase
          .from('tournament_participants')
          .select('*', { count: 'exact', head: true })
          .eq('tournament_id', tournament.id)
          .eq('is_active', true);

        // Check if user is registered
        const { data: userParticipation } = await supabase
          .from('tournament_participants')
          .select('id, seed_number, final_placement')
          .eq('tournament_id', tournament.id)
          .eq('battler_id', battler.id)
          .eq('is_active', true)
          .maybeSingle();

        // Get recent winners for completed tournaments
        let recentWinners = null;
        if (tournament.status === 'completed' && tournament.winner_battler_id) {
          const { data: winner } = await supabase
            .from('battlers')
            .select('id, stage_name, avatar_url')
            .eq('id', tournament.winner_battler_id)
            .single();

          const { data: runnerUp } = await supabase
            .from('battlers')
            .select('id, stage_name, avatar_url')
            .eq('id', tournament.runner_up_battler_id)
            .maybeSingle();

          recentWinners = {
            winner,
            runnerUp,
          };
        }

        return {
          ...tournament,
          participantCount: participantCount || 0,
          isUserRegistered: !!userParticipation,
          userSeed: userParticipation?.seed_number || null,
          userPlacement: userParticipation?.final_placement || null,
          recentWinners,
        };
      })
    );

    // Separate tournaments by status
    const upcoming = enrichedTournaments.filter(
      (t) => t.status === 'registration' || t.status === 'seeding'
    );
    const active = enrichedTournaments.filter(
      (t) => t.status === 'in_progress'
    );
    const completed = enrichedTournaments.filter(
      (t) => t.status === 'completed'
    );

    return NextResponse.json({
      all: enrichedTournaments,
      upcoming,
      active,
      completed,
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
