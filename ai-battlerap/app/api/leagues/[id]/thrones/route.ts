import { createServerSupabaseClient } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { ThronePosition } from '@/lib/types/throne';

/**
 * GET /api/leagues/[id]/thrones
 *
 * Fetches the current throne positions (top 3) for a specific league.
 * Returns throne holder info including battler name, rating, and defense count.
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await params;
    const supabase = await createServerSupabaseClient();

    // Fetch throne positions for this league
    const { data: thrones, error: thronesError } = await supabase
      .from('throne_positions')
      .select(`
        id,
        league_id,
        position,
        battler_id,
        started_at,
        defense_count
      `)
      .eq('league_id', leagueId)
      .order('position', { ascending: true });

    if (thronesError) {
      console.error('Error fetching thrones:', thronesError);
      return NextResponse.json(
        { error: 'Failed to fetch throne positions' },
        { status: 500 }
      );
    }

    // If no thrones exist, create empty positions 1, 2, 3
    if (!thrones || thrones.length === 0) {
      const emptyThrones: ThronePosition[] = [
        {
          id: '',
          league_id: leagueId,
          position: 1,
          battler_id: null,
          started_at: new Date().toISOString(),
          defense_count: 0,
        },
        {
          id: '',
          league_id: leagueId,
          position: 2,
          battler_id: null,
          started_at: new Date().toISOString(),
          defense_count: 0,
        },
        {
          id: '',
          league_id: leagueId,
          position: 3,
          battler_id: null,
          started_at: new Date().toISOString(),
          defense_count: 0,
        },
      ];
      return NextResponse.json({ thrones: emptyThrones });
    }

    // Enrich with battler info and ratings
    const battlerIds = thrones
      .filter((t) => t.battler_id)
      .map((t) => t.battler_id as string);

    if (battlerIds.length === 0) {
      return NextResponse.json({ thrones });
    }

    // Fetch battler names
    const { data: battlers } = await supabase
      .from('battlers')
      .select('id, stage_name')
      .in('id', battlerIds);

    // Fetch battler ratings
    const { data: rankings } = await supabase
      .from('rankings')
      .select('battler_id, rating')
      .in('battler_id', battlerIds);

    // Create lookup maps
    const battlerMap = new Map(
      (battlers || []).map((b) => [b.id, b.stage_name])
    );
    const ratingMap = new Map(
      (rankings || []).map((r) => [r.battler_id, r.rating])
    );

    // Enrich throne positions
    const enrichedThrones: ThronePosition[] = thrones.map((throne) => ({
      ...throne,
      battlerName: throne.battler_id
        ? battlerMap.get(throne.battler_id) || 'Unknown'
        : undefined,
      battlerRating: throne.battler_id
        ? ratingMap.get(throne.battler_id) || 1200
        : undefined,
    }));

    return NextResponse.json({ thrones: enrichedThrones });
  } catch (error) {
    console.error('Error in GET /api/leagues/[id]/thrones:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
