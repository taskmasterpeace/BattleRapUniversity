import { verifyInternalSecret } from '@/lib/db/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { generateTournamentBrackets, scheduleRoundBattles } from '@/lib/game/tournamentManager';
import { getTierFromRating } from '@/lib/game/paymentCalculator';

/**
 * Fill open tournament slots with rating-appropriate AI battlers so a player
 * always gets a full bracket. Runs right before bracket generation.
 *
 * - Picks AI battlers (is_ai = true, excludes Test_ harness profiles)
 * - Respects the tournament's tier_restriction
 * - Prefers AI whose rating is closest to the average of registered humans
 * - Fills up to max_participants (or the nearest valid bracket size: 4/8/16)
 */
async function fillTournamentWithAI(
  supabase: SupabaseClient,
  tournament: { id: string; max_participants: number; tier_restriction: string }
): Promise<{ filled: number; error?: string }> {
  const { data: participants } = await supabase
    .from('tournament_participants')
    .select('battler_id, rating_at_registration, registration_order')
    .eq('tournament_id', tournament.id)
    .eq('is_active', true);

  const current = participants ?? [];
  const validSizes = [4, 8, 16];
  const target = validSizes.includes(tournament.max_participants)
    ? tournament.max_participants
    : validSizes.find((s) => s >= current.length) ?? 16;

  if (current.length >= target) return { filled: 0 };

  // Anchor the AI field around the registered battlers' average rating
  const anchor =
    current.length > 0
      ? current.reduce((s, p) => s + Number(p.rating_at_registration ?? 1200), 0) / current.length
      : 1200;

  const registered = new Set(current.map((p) => p.battler_id));

  // AI candidates with ratings (exclude Test_ harness battlers)
  const { data: candidates, error } = await supabase
    .from('rankings')
    .select('battler_id, rating, battlers!inner(id, stage_name, is_ai)')
    .eq('battlers.is_ai', true)
    .not('battlers.stage_name', 'like', 'Test\\_%')
    .limit(500);

  if (error) return { filled: 0, error: error.message };

  const tierOk = (rating: number): boolean => {
    const tier = getTierFromRating(rating);
    switch (tournament.tier_restriction) {
      case 'low': return tier === 'low';
      case 'mid': return tier === 'mid';
      case 'low_mid': return tier === 'low' || tier === 'mid';
      default: return true; // 'all'
    }
  };

  const pool = (candidates ?? [])
    .filter((c: any) => !registered.has(c.battler_id) && tierOk(Number(c.rating)))
    .sort(
      (a: any, b: any) =>
        Math.abs(Number(a.rating) - anchor) - Math.abs(Number(b.rating) - anchor)
    );

  const needed = target - current.length;
  const picks = pool.slice(0, needed);

  if (picks.length < needed) {
    return {
      filled: 0,
      error: `Not enough eligible AI battlers (need ${needed}, found ${picks.length})`,
    };
  }

  let order = current.length;
  const rows = picks.map((p: any) => ({
    tournament_id: tournament.id,
    battler_id: p.battler_id,
    rating_at_registration: Number(p.rating),
    registration_order: ++order,
  }));

  const { error: insertError } = await supabase
    .from('tournament_participants')
    .insert(rows);

  if (insertError) return { filled: 0, error: insertError.message };
  return { filled: rows.length };
}

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
      // Fill open slots with rating-appropriate AI battlers so the bracket
      // is always full even when only one player registered.
      const fillResult = await fillTournamentWithAI(supabase, tournament);

      // Check participant count (after AI fill)
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
          reason: fillResult.error
            ? `No participants and AI fill failed: ${fillResult.error}`
            : 'No participants registered',
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
          reason: `Invalid participant count (${participantCount}). Must be 4, 8, or 16.${
            fillResult.error ? ` AI fill: ${fillResult.error}` : ''
          }`,
          participantCount,
        });
        continue;
      }

      // Generate brackets (service-role client — bypasses RLS)
      const bracketResult = await generateTournamentBrackets(tournament.id, supabase);

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

      // Schedule first round battles (30 days prep time, service-role client)
      const scheduleResult = await scheduleRoundBattles(
        tournament.id,
        'first_round',
        30,
        supabase
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
        aiFilled: fillResult.filled,
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
