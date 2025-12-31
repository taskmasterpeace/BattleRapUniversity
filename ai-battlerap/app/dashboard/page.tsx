import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/db/server';
import DashboardClient from '@/components/battler/DashboardClient';
import { getVirtualNowISO } from '@/lib/dev/timeManipulation';

export default async function DashboardPage() {
  const { user, battler } = await getPlayerBattler();

  if (!user) {
    redirect('/login');
  }

  if (!battler) {
    redirect('/onboarding');
  }

  const supabase = await createServerSupabaseClient();

  // Execute all database queries in parallel using Promise.all()
  const [
    { data: attributes, error: attributesError },
    { data: ranking, error: rankingError },
    { data: league, error: leagueError },
    { data: activeBattles, error: activeBattlesError },
    { count: offersCount, error: offersCountError },
    { data: recentBattles, error: recentBattlesError },
    { data: fanData, error: fanDataError },
    { data: pendingEvents, error: pendingEventsError }
  ] = await Promise.all([
    // Get battler attributes
    supabase
      .from('battler_attributes')
      .select('*')
      .eq('battler_id', battler.id)
      .single(),

    // Get battler ranking
    supabase
      .from('rankings')
      .select('*')
      .eq('battler_id', battler.id)
      .single(),

    // Get primary league
    supabase
      .from('leagues')
      .select('*')
      .eq('id', battler.primary_league_id)
      .single(),

    // Get active battles (uses virtual time in dev mode)
    supabase
      .from('battles')
      .select(`
        *,
        league:leagues(*),
        ai_battler:battler_ai_id(id, stage_name, tier)
      `)
      .eq('battler_player_id', battler.id)
      .in('status', ['accepted', 'locked'])
      .gt('scheduled_at', getVirtualNowISO())
      .order('scheduled_at', { ascending: true }),

    // Get battle offers count
    supabase
      .from('battles')
      .select('*', { count: 'exact', head: true })
      .eq('battler_player_id', battler.id)
      .eq('status', 'offered'),

    // Get recent completed battles
    supabase
      .from('battles')
      .select(`
        *,
        verdict,
        decision_type,
        league:leagues(name),
        ai_battler:battler_ai_id(id, stage_name, tier)
      `)
      .eq('battler_player_id', battler.id)
      .eq('status', 'completed')
      .order('scheduled_at', { ascending: false })
      .limit(5),

    // Get battler fan data (optional - may not exist yet)
    supabase
      .from('battler_fans')
      .select('*')
      .eq('battler_id', battler.id)
      .maybeSingle(),

    // Get pending life events
    supabase
      .from('battler_life_events')
      .select(`
        *,
        template:life_event_templates!battler_life_events_template_code_fkey(*)
      `)
      .eq('battler_id', battler.id)
      .eq('status', 'pending')
      .order('triggered_at', { ascending: false })
  ]);

  // Log any errors that occurred during parallel queries
  if (attributesError) console.error('Attributes query error:', attributesError);
  if (rankingError) console.error('Ranking query error:', rankingError);
  if (leagueError) console.error('League query error:', leagueError);
  if (activeBattlesError) console.error('Active battles query error:', activeBattlesError);
  if (offersCountError) console.error('Offers count query error:', offersCountError);
  if (recentBattlesError) console.error('Recent battles query error:', recentBattlesError);
  if (fanDataError) console.error('Fan data query error:', fanDataError);
  if (pendingEventsError) console.error('Pending events query error:', pendingEventsError);

  return (
    <DashboardClient
      battler={battler}
      attributes={attributes}
      ranking={ranking}
      league={league}
      activeBattles={activeBattles || []}
      offersCount={offersCount || 0}
      recentBattles={recentBattles || []}
      fanData={fanData}
      pendingEvents={pendingEvents || []}
    />
  );
}
