import { verifyInternalSecret } from '@/lib/db/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { generateTournamentBrackets, scheduleRoundBattles } from '@/lib/game/tournamentManager';

/**
 * Automatic Tournament Bracket Generation
 *
 * Checks for tournaments where registration has closed and generates brackets
 * Can be called:
 * - By cron job at regular intervals
 * - Manually with ?tournament_id=X for testing
 */
export async function POST(request: Request) {
  // Verify internal secret
  if (!verifyInternalSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const url = new URL(request.url);
  const tournamentId = url.searchParams.get('tournament_id');

  let tournaments;

  if (tournamentId) {
    // Dev mode: seed specific tournament
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .eq('status', 'registration')
      .limit(1);
    tournaments = data;
  } else {
    // Production mode: find tournaments where registration has closed
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'registration')
      .lte('registration_closes_at', now)
      .order('registration_closes_at', { ascending: true });
    tournaments = data;
  }

  if (!tournaments || tournaments.length === 0) {
    return NextResponse.json({
      message: 'No tournaments ready for bracket generation',
      tournamentsProcessed: 0,
    });
  }

  const results = [];

  for (const tournament of tournaments) {
    try {
      // Check participant count
      const { count: participantCount } = await supabase
        .from('tournament_participants')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournament.id)
        .eq('is_active', true);

      if (participantCount === null || participantCount === 0) {
        results.push({
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          status: 'skipped',
          reason: 'No participants registered',
        });
        continue;
      }

      // Validate participant count (must be 4, 8, or 16)
      const validCounts = [4, 8, 16];
      if (!validCounts.includes(participantCount)) {
        results.push({
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          status: 'error',
          reason: `Invalid participant count (${participantCount}). Must be 4, 8, or 16.`,
          participantCount,
        });
        continue;
      }

      // Generate brackets
      const bracketResult = await generateTournamentBrackets(tournament.id);

      if (!bracketResult.success) {
        results.push({
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          status: 'error',
          reason: bracketResult.error,
          participantCount,
        });
        continue;
      }

      // Schedule first round battles (30 days prep time)
      const scheduleResult = await scheduleRoundBattles(
        tournament.id,
        'first_round',
        30
      );

      if (!scheduleResult.success) {
        results.push({
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          status: 'error',
          reason: `Brackets created but failed to schedule battles: ${scheduleResult.error}`,
          participantCount,
          bracketsCreated: bracketResult.brackets?.length || 0,
        });
        continue;
      }

      results.push({
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        status: 'success',
        participantCount,
        bracketsCreated: bracketResult.brackets?.length || 0,
        battlesScheduled: scheduleResult.battleIds?.length || 0,
      });
    } catch (error: any) {
      console.error(`Error processing tournament ${tournament.id}:`, error);
      results.push({
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        status: 'error',
        reason: error.message,
      });
    }
  }

  const successCount = results.filter((r) => r.status === 'success').length;

  return NextResponse.json({
    message: `Processed ${successCount} tournaments successfully`,
    tournamentsProcessed: successCount,
    results,
  });
}
