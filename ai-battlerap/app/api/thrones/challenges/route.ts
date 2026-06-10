import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { ThroneChallenge } from '@/lib/types/throne';

/**
 * GET /api/thrones/challenges
 *
 * Fetches all pending throne challenges for the authenticated user's battler.
 * Returns challenges where the user is either the challenger or the throne holder.
 */

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'No battler found' }, { status: 404 });
    }

    // Fetch all throne challenges where user is involved
    const { data: challenges, error: challengesError } = await supabase
      .from('throne_challenges')
      .select(`
        id,
        league_id,
        challenger_battler_id,
        throne_holder_battler_id,
        target_position,
        status,
        deadline,
        battle_id,
        result,
        created_at
      `)
      .or(
        `challenger_battler_id.eq.${battler.id},throne_holder_battler_id.eq.${battler.id}`
      )
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false });

    if (challengesError) {
      // Table missing in this environment — treat as "no challenges" instead of 500
      // so the widget can render its empty state. Same pattern as /api/leagues/[id]/thrones.
      const missingTable =
        challengesError.code === 'PGRST205' ||
        challengesError.message?.toLowerCase().includes('schema cache') ||
        challengesError.message?.toLowerCase().includes('does not exist');
      if (missingTable) {
        return NextResponse.json({
          outgoingChallenges: [],
          incomingChallenges: [],
          totalPending: 0,
        });
      }
      console.error('Error fetching throne challenges:', challengesError);
      return NextResponse.json(
        { error: 'Failed to fetch throne challenges' },
        { status: 500 }
      );
    }

    if (!challenges || challenges.length === 0) {
      return NextResponse.json({ challenges: [] });
    }

    // Collect all battler IDs and league IDs for enrichment
    const battlerIds = [
      ...new Set(
        challenges.flatMap((c) => [
          c.challenger_battler_id,
          c.throne_holder_battler_id,
        ])
      ),
    ];
    const leagueIds = [...new Set(challenges.map((c) => c.league_id))];

    // Fetch battler names
    const { data: battlers } = await supabase
      .from('battlers')
      .select('id, stage_name')
      .in('id', battlerIds);

    // Fetch league names
    const { data: leagues } = await supabase
      .from('leagues')
      .select('id, name')
      .in('id', leagueIds);

    // Create lookup maps
    const battlerMap = new Map(
      (battlers || []).map((b) => [b.id, b.stage_name])
    );
    const leagueMap = new Map((leagues || []).map((l) => [l.id, l.name]));

    // Enrich challenges
    const enrichedChallenges: ThroneChallenge[] = challenges.map((challenge) => ({
      ...challenge,
      challengerName: battlerMap.get(challenge.challenger_battler_id) || 'Unknown',
      holderName: battlerMap.get(challenge.throne_holder_battler_id) || 'Unknown',
      leagueName: leagueMap.get(challenge.league_id) || 'Unknown League',
    }));

    // Separate into outgoing (user is challenger) and incoming (user is holder)
    const outgoingChallenges = enrichedChallenges.filter(
      (c) => c.challenger_battler_id === battler.id
    );
    const incomingChallenges = enrichedChallenges.filter(
      (c) => c.throne_holder_battler_id === battler.id
    );

    return NextResponse.json({
      outgoingChallenges,
      incomingChallenges,
      totalPending: enrichedChallenges.filter((c) => c.status === 'pending').length,
    });
  } catch (error) {
    console.error('Error in GET /api/thrones/challenges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
