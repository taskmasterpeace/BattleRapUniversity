import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';

/**
 * GET /api/roster
 * Returns all battlers owned by the current user
 * (Currently limited to 1 battler per user in V1, but built for future expansion)
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

    // Get all battlers owned by this user
    const { data: battlers, error: battlersError } = await supabase
      .from('battlers')
      .select(
        `
        *,
        attributes:battler_attributes(*),
        ranking:rankings(*),
        league:primary_league_id(
          id,
          name,
          short_code,
          logo_url
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (battlersError) {
      return NextResponse.json(
        { error: 'Failed to fetch roster' },
        { status: 500 }
      );
    }

    // For each battler, get additional stats
    const enrichedBattlers = await Promise.all(
      (battlers || []).map(async (battler) => {
        // Get battle stats
        const { count: totalBattles } = await supabase
          .from('battles')
          .select('*', { count: 'exact', head: true })
          .eq('battler_player_id', battler.id)
          .eq('status', 'completed');

        const { count: wins } = await supabase
          .from('battles')
          .select('*', { count: 'exact', head: true })
          .eq('battler_player_id', battler.id)
          .eq('winner_battler_id', battler.id)
          .eq('status', 'completed');

        // Get next upcoming battle
        const { data: nextBattle } = await supabase
          .from('battles')
          .select(
            `
            id,
            scheduled_at,
            league_id,
            battler_ai_id,
            ai:battler_ai_id(
              id,
              stage_name,
              avatar_url
            )
          `
          )
          .eq('battler_player_id', battler.id)
          .eq('status', 'accepted')
          .order('scheduled_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        // Get badges
        const { data: badges } = await supabase
          .from('battler_badge_inventory')
          .select(
            `
            badge:badge_costs(
              badge_code,
              badge_name,
              tier,
              category,
              icon_url
            )
          `
          )
          .eq('battler_id', battler.id);

        // Calculate win rate
        const winRate =
          totalBattles && totalBattles > 0
            ? ((wins || 0) / totalBattles) * 100
            : 0;

        return {
          id: battler.id,
          stageName: battler.stage_name,
          region: battler.region,
          tier: battler.tier,
          styleTags: battler.style_tags,
          avatarUrl: battler.avatar_url,
          bannerUrl: battler.banner_url,
          league: battler.league,
          attributes: battler.attributes,
          ranking: battler.ranking,
          stats: {
            totalBattles: totalBattles || 0,
            wins: wins || 0,
            losses: (totalBattles || 0) - (wins || 0),
            winRate: Math.round(winRate),
            streak: battler.ranking?.streak || 0,
            rating: battler.ranking?.rating || 1200,
          },
          nextBattle,
          badges: badges?.map((b) => b.badge) || [],
        };
      })
    );

    return NextResponse.json({
      battlers: enrichedBattlers,
    });
  } catch (error) {
    console.error('Error fetching roster:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
