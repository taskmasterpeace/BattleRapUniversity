import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/thrones/challenge
 *
 * Issues a throne challenge from one battler to a throne holder.
 * Creates a throne_challenge record with a 48-hour deadline.
 *
 * Body:
 * - leagueId: UUID of the league
 * - targetPosition: 1, 2, or 3
 * - throneHolderBattlerId: UUID of current throne holder
 * - challengerBattlerId: UUID of the challenger
 */

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      leagueId,
      targetPosition,
      throneHolderBattlerId,
      challengerBattlerId,
    } = body;

    // Validate required fields
    if (
      !leagueId ||
      !targetPosition ||
      !throneHolderBattlerId ||
      !challengerBattlerId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (![1, 2, 3].includes(targetPosition)) {
      return NextResponse.json(
        { error: 'Invalid throne position (must be 1, 2, or 3)' },
        { status: 400 }
      );
    }

    // Use service role for challenge creation
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

    // Verify challenger belongs to authenticated user
    const { data: challenger } = await supabase
      .from('battlers')
      .select('user_id')
      .eq('id', challengerBattlerId)
      .single();

    if (!challenger || challenger.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Challenger does not belong to authenticated user' },
        { status: 403 }
      );
    }

    // Fetch challenger and holder ratings to validate ELO difference
    const { data: challengerRanking } = await supabase
      .from('rankings')
      .select('rating')
      .eq('battler_id', challengerBattlerId)
      .single();

    const { data: holderRanking } = await supabase
      .from('rankings')
      .select('rating')
      .eq('battler_id', throneHolderBattlerId)
      .single();

    const challengerRating = challengerRanking?.rating || 1200;
    const holderRating = holderRanking?.rating || 1200;
    const ratingDiff = Math.abs(challengerRating - holderRating);

    if (ratingDiff > 100) {
      return NextResponse.json(
        {
          error: `Rating difference too large (${ratingDiff} ELO). Must be within 100 ELO to challenge.`,
        },
        { status: 400 }
      );
    }

    // Check if throne holder is actually on the throne
    const { data: thronePosition } = await supabase
      .from('throne_positions')
      .select('*')
      .eq('league_id', leagueId)
      .eq('position', targetPosition)
      .single();

    if (!thronePosition || thronePosition.battler_id !== throneHolderBattlerId) {
      return NextResponse.json(
        { error: 'Target battler is not currently holding this throne position' },
        { status: 400 }
      );
    }

    // Check for existing pending challenge
    const { data: existingChallenge } = await supabase
      .from('throne_challenges')
      .select('id')
      .eq('league_id', leagueId)
      .eq('target_position', targetPosition)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingChallenge) {
      return NextResponse.json(
        {
          error:
            'A pending challenge already exists for this throne position. Wait for resolution.',
        },
        { status: 400 }
      );
    }

    // Create throne challenge with 48-hour deadline
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 48);

    const { data: challenge, error: challengeError } = await supabase
      .from('throne_challenges')
      .insert({
        league_id: leagueId,
        challenger_battler_id: challengerBattlerId,
        throne_holder_battler_id: throneHolderBattlerId,
        target_position: targetPosition,
        status: 'pending',
        deadline: deadline.toISOString(),
      })
      .select()
      .single();

    if (challengeError) {
      console.error('Error creating throne challenge:', challengeError);
      return NextResponse.json(
        { error: 'Failed to create throne challenge' },
        { status: 500 }
      );
    }

    // TODO: Create notification for throne holder
    // TODO: If throne holder is AI, auto-accept

    return NextResponse.json({
      success: true,
      challenge,
      message: 'Throne challenge issued successfully. Holder has 48 hours to respond.',
    });
  } catch (error) {
    console.error('Error in POST /api/thrones/challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
