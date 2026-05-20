import { createServerSupabaseClient } from '@/lib/db/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/battler/relationships
 * Fetch active relationships (rivalries) for the authenticated user's battler
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's battler
    const { data: battler, error: battlerError } = await supabase
      .from('battlers')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_ai', false)
      .single();

    if (battlerError || !battler) {
      return NextResponse.json({ error: 'Battler not found' }, { status: 404 });
    }

    // Fetch active relationships (state_level >= 3 = rivals or higher)
    const { data: relationships, error: relError } = await supabase
      .from('battler_relationships')
      .select(`
        id,
        battler_a_id,
        battler_b_id,
        current_state,
        state_level,
        high_water_mark,
        intensity,
        crowd_perception_a,
        crowd_perception_b,
        authenticity_score_a,
        authenticity_score_b,
        is_ducking_a,
        is_ducking_b,
        consecutive_offers_ignored_by_a,
        consecutive_offers_ignored_by_b,
        twitter_beef_active,
        twitter_beef_started_at,
        status,
        started_at,
        last_modified_at,
        battler_a:battlers!battler_a_id(
          id,
          stage_name,
          region,
          avatar_url,
          banner_url
        ),
        battler_b:battlers!battler_b_id(
          id,
          stage_name,
          region,
          avatar_url,
          banner_url
        )
      `)
      .or(`battler_a_id.eq.${battler.id},battler_b_id.eq.${battler.id}`)
      .gte('state_level', 3) // Only rivals or higher
      .eq('status', 'active')
      .order('state_level', { ascending: false })
      .order('intensity', { ascending: false });

    if (relError) {
      console.error('Error fetching relationships:', relError);
      return NextResponse.json(
        { error: 'Failed to fetch relationships' },
        { status: 500 }
      );
    }

    // Transform relationships to include opponent info and perspective
    const activeBeefs = (relationships || []).map((rel) => {
      const isPlayerA = rel.battler_a_id === battler.id;
      const opponent = (isPlayerA ? rel.battler_b : rel.battler_a) as any;

      return {
        id: rel.id,
        opponent: opponent,
        currentState: rel.current_state,
        stateLevel: rel.state_level,
        highWaterMark: rel.high_water_mark,
        intensity: rel.intensity,
        // Player's crowd perception (from opponent's perspective)
        playerCrowdPerception: isPlayerA
          ? rel.crowd_perception_a
          : rel.crowd_perception_b,
        // Opponent's crowd perception
        opponentCrowdPerception: isPlayerA
          ? rel.crowd_perception_b
          : rel.crowd_perception_a,
        // Player's authenticity score
        playerAuthenticity: isPlayerA
          ? rel.authenticity_score_a
          : rel.authenticity_score_b,
        // Opponent's authenticity score
        opponentAuthenticity: isPlayerA
          ? rel.authenticity_score_b
          : rel.authenticity_score_a,
        // Ducking status
        playerIsDucking: isPlayerA ? rel.is_ducking_a : rel.is_ducking_b,
        opponentIsDucking: isPlayerA ? rel.is_ducking_b : rel.is_ducking_a,
        playerOffersIgnored: isPlayerA
          ? rel.consecutive_offers_ignored_by_a
          : rel.consecutive_offers_ignored_by_b,
        opponentOffersIgnored: isPlayerA
          ? rel.consecutive_offers_ignored_by_b
          : rel.consecutive_offers_ignored_by_a,
        // Twitter beef
        twitterBeefActive: rel.twitter_beef_active,
        twitterBeefStartedAt: rel.twitter_beef_started_at,
        // Metadata
        startedAt: rel.started_at,
        lastModifiedAt: rel.last_modified_at,
      };
    });

    return NextResponse.json({ relationships: activeBeefs });
  } catch (error) {
    console.error('Unexpected error fetching relationships:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
