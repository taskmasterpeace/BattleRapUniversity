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
    { data: pendingEvents, error: pendingEventsError },
    { data: careerRounds, error: careerRoundsError }
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
      .order('triggered_at', { ascending: false }),

    // Get all rounds for this battler (for career highlights)
    supabase
      .from('battle_rounds')
      .select('peak_score, average_score, crowd_reaction, consistency_score, choked')
      .eq('battler_id', battler.id)
  ]);

  // Current city (UniverCity: where you are determines who you can recruit/battle)
  let currentCity: { id: string; name: string } | null = null;
  if (battler.current_city_id) {
    const { data: cityRow } = await supabase
      .from('cities')
      .select('id, name')
      .eq('id', battler.current_city_id)
      .single();
    currentCity = cityRow ?? null;
  }

  // Compute "badges in reach" — top 3 badges the player is closest to earning.
  // Looks at career rounds + ranking to estimate progress percentages.
  const earnedSet = new Set<string>(battler.style_tags || []);
  const totalBattles = (ranking?.wins || 0) + (ranking?.losses || 0);
  const winRate = totalBattles > 0 ? (ranking?.wins || 0) / totalBattles : 0;
  const maxPeakSeen = (careerRounds || []).reduce(
    (m: number, r: any) => Math.max(m, r.peak_score || 0),
    0
  );
  const maxCrowdSeen = (careerRounds || []).reduce(
    (m: number, r: any) => Math.max(m, r.crowd_reaction || 0),
    0
  );
  const candidates: Array<{ code: string; label: string; pct: number; detail: string }> = [
    {
      code: 'punchline_heavy',
      label: 'PUNCHLINE HEAVY',
      pct: Math.min(100, Math.round((maxPeakSeen / 9.0) * 100)),
      detail: `Best peak ${maxPeakSeen.toFixed(1)} / 9.0 needed`,
    },
    {
      code: 'crowd_favorite',
      label: 'CROWD FAVORITE',
      pct: Math.min(100, Math.round((maxCrowdSeen / 85) * 100)),
      detail: `Best crowd ${Math.round(maxCrowdSeen)}% / 85% needed`,
    },
    {
      code: 'respected_veteran',
      label: 'RESPECTED VETERAN',
      pct: Math.min(100, Math.round((totalBattles / 25) * 100)),
      detail: `${totalBattles} / 25 career battles`,
    },
    {
      code: 'consummate_professional',
      label: 'CONSUMMATE PRO',
      pct:
        totalBattles >= 5
          ? Math.min(100, Math.round((winRate / 0.7) * 100))
          : Math.round((totalBattles / 20) * 100),
      detail:
        totalBattles >= 5
          ? `${Math.round(winRate * 100)}% win rate / 70% needed (20+ battles)`
          : `Need 20+ battles (${totalBattles} so far)`,
    },
    {
      code: 'main_stage_specialist',
      label: 'MAIN STAGE SPEC',
      pct: Math.min(100, Math.round(((ranking?.streak || 0) / 5) * 100)),
      detail: `${ranking?.streak || 0} / 5 win streak`,
    },
  ];
  const badgeProgress = candidates
    .filter((c) => !earnedSet.has(c.code))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  // Real badge sprite art for the equipped badges + the in-reach ones, so the
  // dashboard shows the actual pixel badges (like a 2K badge card) instead of
  // generic icons. Small lookup table; codes not in badge_costs fall back.
  const badgeCodesNeeded = Array.from(
    new Set([...(battler.style_tags || []), ...badgeProgress.map((b) => b.code)])
  );
  const badgeIcons: Record<string, { url: string | null; tier: string | null }> = {};
  if (badgeCodesNeeded.length > 0) {
    const { data: badgeArt } = await supabase
      .from('badge_costs')
      .select('badge_code, icon_url, tier')
      .in('badge_code', badgeCodesNeeded);
    for (const row of badgeArt || []) {
      badgeIcons[(row as any).badge_code] = {
        url: (row as any).icon_url ?? null,
        tier: (row as any).tier ?? null,
      };
    }
  }

  // For each active battle, count prep blocks the player has set (and compute totalPrepDays)
  // Used to show "PREP: 3/7 DAYS" on the Next Battle card and surface "NEEDS PREP" CTA
  const activeBattleIds = (activeBattles || []).map((b: any) => b.id);
  let prepStatusByBattle: Record<string, { setDays: number; totalDays: number }> = {};
  if (activeBattleIds.length > 0) {
    const { data: prepRows } = await supabase
      .from('prep_blocks')
      .select('battle_id, focus')
      .eq('battler_id', battler.id)
      .in('battle_id', activeBattleIds);

    for (const battle of activeBattles || []) {
      const blocks = (prepRows || []).filter((r: any) => r.battle_id === battle.id && r.focus);
      const created = new Date(battle.created_at);
      const lock = new Date(battle.lock_prep_at);
      const totalDays = Math.max(
        1,
        Math.ceil((lock.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      );
      prepStatusByBattle[battle.id] = {
        setDays: blocks.length,
        totalDays,
      };
    }
  }

  // Log any errors that occurred during parallel queries
  if (attributesError) console.error('Attributes query error:', attributesError);
  if (rankingError) console.error('Ranking query error:', rankingError);
  if (leagueError) console.error('League query error:', leagueError);
  if (activeBattlesError) console.error('Active battles query error:', activeBattlesError);
  if (offersCountError) console.error('Offers count query error:', offersCountError);
  if (recentBattlesError) console.error('Recent battles query error:', recentBattlesError);
  if (fanDataError) console.error('Fan data query error:', fanDataError);
  if (pendingEventsError) console.error('Pending events query error:', pendingEventsError);

  if (careerRoundsError) console.error('Career rounds query error:', careerRoundsError);

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
      careerRounds={careerRounds || []}
      prepStatusByBattle={prepStatusByBattle}
      badgeProgress={badgeProgress}
      badgeIcons={badgeIcons}
      currentCity={currentCity}
    />
  );
}
