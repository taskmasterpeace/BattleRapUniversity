import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyInternalSecret } from '@/lib/db/server';
import { seedAllThrones, seedThronesForLeague } from '@/lib/thrones/seedThrones';

/**
 * POST /api/admin/seed-thrones
 *
 * Seeds throne positions for leagues with top 3 battlers by rating.
 * Requires internal API secret for authorization.
 *
 * Query params:
 * - leagueId (optional): Seed specific league, otherwise seed all leagues
 *
 * Example:
 * POST /api/admin/seed-thrones
 * POST /api/admin/seed-thrones?leagueId=uuid-here
 *
 * Header:
 * Authorization: Bearer <INTERNAL_API_SECRET>
 */

export async function POST(request: Request) {
  try {
    // Verify internal secret
    if (!verifyInternalSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid secret' },
        { status: 401 }
      );
    }

    // Create service role client
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

    // Check if specific league ID provided
    const url = new URL(request.url);
    const leagueId = url.searchParams.get('leagueId');

    if (leagueId) {
      // Seed specific league
      const result = await seedThronesForLeague(supabase, leagueId);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Thrones seeded for league ${leagueId}`,
        thrones: result.thrones,
      });
    } else {
      // Seed all leagues
      const result = await seedAllThrones(supabase);

      const successCount = Object.values(result.results).filter(
        (r) => r.success
      ).length;
      const failureCount = Object.values(result.results).filter(
        (r) => !r.success
      ).length;

      return NextResponse.json({
        success: result.success,
        message: `Seeded thrones for ${successCount} leagues, ${failureCount} failed`,
        results: result.results,
      });
    }
  } catch (error) {
    console.error('Error in POST /api/admin/seed-thrones:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
