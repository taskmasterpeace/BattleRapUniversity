/**
 * Time, Economy, and Cities System
 *
 * Handles:
 * - Week-based calendar progression
 * - Battle scheduling (announced → prep → live → release)
 * - Deposit/booking mechanics (Geechi, Twork scenarios)
 * - Public knowledge vs insider knowledge
 * - League blacklists and tolerance
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export interface BattleSchedule {
  id: string;
  battle_id: string;
  week_announced: number;
  week_prep_start: number;
  week_prep_end: number;
  week_live_event: number;
  week_public_release?: number;
  is_ppv: boolean;
  is_streamed_live: boolean;
  live_audience_verdict?: string;
  live_crowd_reaction?: number;
  camera_audience_verdict?: string;
  online_views: number;
  online_reaction_score?: number;
}

export interface Deposit {
  battle_id: string;
  battler_id: string;
  deposit_amount: number;
  remaining_payout: number;
  deposit_paid: boolean;
  deposit_paid_week?: number;
  deposit_stolen: boolean;
  deposit_stolen_week?: number;
  final_payout_paid: boolean;
  final_payout_week?: number;
}

export interface City {
  id: string;
  name: string;
  state?: string;
  country: string;
  scene_size: 'small' | 'medium' | 'large' | 'major';
  culture_style: 'technical' | 'aggressive' | 'diverse' | 'street';
}

// ============================================================================
// Battle Scheduling
// ============================================================================

/**
 * Schedule a battle with week-based timeline
 */
export async function scheduleBattle(
  battleId: string,
  currentWeek: number,
  prepWeeks: number,
  isPPV: boolean,
  supabase: ReturnType<typeof createClient>
): Promise<BattleSchedule> {
  const weekAnnounced = currentWeek;
  const weekPrepStart = currentWeek + 1;
  const weekPrepEnd = weekPrepStart + prepWeeks - 1;
  const weekLiveEvent = weekPrepEnd + 1;
  const weekPublicRelease = isPPV ? weekLiveEvent : weekLiveEvent + Math.floor(Math.random() * 4) + 4; // 4-8 weeks delay

  const { data, error } = await (supabase as any)
    .from('battle_schedule')
    .insert({
      battle_id: battleId,
      week_announced: weekAnnounced,
      week_prep_start: weekPrepStart,
      week_prep_end: weekPrepEnd,
      week_live_event: weekLiveEvent,
      week_public_release: isPPV ? null : weekPublicRelease,
      is_ppv: isPPV,
      is_streamed_live: isPPV,
      online_views: 0
    })
    .select()
    .single();

  if (error) throw error;
  return data as BattleSchedule;
}

// ============================================================================
// Deposit Management
// ============================================================================

/**
 * Calculate and create deposit for a battle
 */
export async function createDeposit(
  battleId: string,
  battlerId: string,
  basePayout: number,
  battlerRating: number,
  depositPercentage: number,
  currentWeek: number,
  supabase: ReturnType<typeof createClient>
): Promise<Deposit> {
  // Calculate deposit using helper function
  const { data: depositData, error } = await (supabase as any).rpc('calculate_deposit_amount', {
    base_payout: basePayout,
    battler_rating: battlerRating,
    deposit_percentage: depositPercentage
  });

  if (error) throw error;

  const depositAmount = depositData as number;
  const totalPayout = Math.floor(basePayout * Math.max(0.5, Math.min(2.0, battlerRating / 1200)));
  const remainingPayout = totalPayout - depositAmount;

  const { data, error: insertError } = await (supabase as any)
    .from('battle_deposits')
    .insert({
      battle_id: battleId,
      battler_id: battlerId,
      deposit_amount: depositAmount,
      remaining_payout: remainingPayout,
      deposit_paid: false,
      deposit_stolen: false,
      final_payout_paid: false
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return data as Deposit;
}

/**
 * Pay deposit to battler
 */
export async function payDeposit(
  depositId: string,
  currentWeek: number,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  const { data: deposit } = await (supabase as any)
    .from('battle_deposits')
    .select('*')
    .eq('id', depositId)
    .single();

  if (!deposit) return;

  // Update deposit status
  await (supabase as any)
    .from('battle_deposits')
    .update({
      deposit_paid: true,
      deposit_paid_week: currentWeek
    })
    .eq('id', depositId);

  // Add to battler's balance
  await (supabase as any).rpc('add_financial_transaction', {
    p_battler_id: deposit.battler_id,
    p_week: currentWeek,
    p_transaction_type: 'deposit_received',
    p_amount: deposit.deposit_amount,
    p_related_battle_id: deposit.battle_id
  });
}

/**
 * Handle deposit theft (Geechi scenario)
 */
export async function stealDeposit(
  depositId: string,
  currentWeek: number,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  const { data: deposit } = await (supabase as any)
    .from('battle_deposits')
    .select('*, battles!inner(league_id)')
    .eq('id', depositId)
    .single();

  if (!deposit) return;

  // Mark deposit as stolen
  await (supabase as any)
    .from('battle_deposits')
    .update({
      deposit_stolen: true,
      deposit_stolen_week: currentWeek
    })
    .eq('id', depositId);

  // Create scandal
  await (supabase as any).from('scandals').insert({
    battler_id: deposit.battler_id,
    scandal_code: 'deposit_theft',
    title: 'Accused of Stealing Deposit',
    week_started: currentWeek,
    week_expires: currentWeek + 4,
    intensity: 7,
    media_coverage_level: 8,
    attribute_penalties: { reputation: -3, financial_stability: 2 },
    reputation_impact: -3,
    redemption_path: 'return_money_or_win_big'
  });

  // Trigger no-show event
  await (supabase as any).from('event_history').insert({
    battler_id: deposit.battler_id,
    event_definition_code: 'deposit_theft_scandal',
    triggered_week: currentWeek,
    media_coverage_level: 8
  });

  // Increase no-show count
  await (supabase as any).rpc('increment', {
    table_name: 'battlers',
    column_name: 'no_show_count',
    row_id: deposit.battler_id,
    increment_by: 1
  });
}

// ============================================================================
// League Blacklists (Math Hoffa, Twork scenarios)
// ============================================================================

/**
 * Blacklist a battler from a league
 */
export async function blacklistBattler(
  battlerId: string,
  leagueId: string,
  reason: string,
  durationWeeks: number | null, // null = permanent
  currentWeek: number,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  await (supabase as any).from('league_blacklists').insert({
    league_id: leagueId,
    battler_id: battlerId,
    reason,
    blacklisted_week: currentWeek,
    is_permanent: durationWeeks === null,
    can_return_week: durationWeeks ? currentWeek + durationWeeks : null
  });
}

/**
 * Check if battler can be booked (reputation vs talent, Twork scenario)
 */
export async function canBookBattler(
  battlerId: string,
  leagueId: string,
  currentWeek: number,
  supabase: ReturnType<typeof createClient>
): Promise<{ canBook: boolean; reason?: string }> {
  // Check blacklist
  const { data: isBlacklisted } = await (supabase as any).rpc('is_blacklisted_from_league', {
    p_battler_id: battlerId,
    p_league_id: leagueId,
    current_week: currentWeek
  });

  if (isBlacklisted) {
    return { canBook: false, reason: 'blacklisted' };
  }

  // Get battler stats
  const { data: battler } = await (supabase as any)
    .from('battlers')
    .select('no_show_count, completed_battles_count, attributes')
    .eq('id', battlerId)
    .single();

  if (!battler) return { canBook: false, reason: 'not_found' };

  // Get league tolerance
  const { data: league } = await (supabase as any)
    .from('leagues')
    .select('tolerance_unreliable, blacklist_threshold')
    .eq('id', leagueId)
    .single();

  if (!league) return { canBook: false, reason: 'league_not_found' };

  // Check no-show count vs blacklist threshold
  if (battler.no_show_count >= league.blacklist_threshold) {
    return { canBook: false, reason: 'too_many_no_shows' };
  }

  // Twork Scenario: High talent can overcome unreliability
  const talent = calculateTalentScore(battler.attributes);
  const reliabilityRatio = battler.completed_battles_count / Math.max(1, battler.completed_battles_count + battler.no_show_count);

  // If talent is high (8+) and league is tolerant, allow booking despite no-shows
  if (talent >= 8 && league.tolerance_unreliable >= 7 && reliabilityRatio >= 0.6) {
    return { canBook: true };
  }

  // Normal case: need good reliability
  if (reliabilityRatio < 0.8) {
    return { canBook: false, reason: 'unreliable' };
  }

  return { canBook: true };
}

function calculateTalentScore(attributes: any): number {
  const writing = (attributes.writing.lyricism + attributes.writing.wordplay + attributes.writing.creativity + attributes.writing.flow) / 4;
  const performance = (attributes.performance.stage_presence + attributes.performance.crowd_control + attributes.performance.delivery) / 3;
  return (writing + performance) / 2;
}

// ============================================================================
// Public Knowledge Management
// ============================================================================

/**
 * Make battle result public (after release week)
 */
export async function releaseBattlePublicly(
  battleId: string,
  currentWeek: number,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  const { data: battle } = await (supabase as any)
    .from('battles')
    .select('*, battle_schedule(*)')
    .eq('id', battleId)
    .single();

  if (!battle) return;

  const schedule = battle.battle_schedule as any;

  // Check if release week has arrived
  if (schedule.week_public_release && currentWeek >= schedule.week_public_release) {
    // Create public knowledge entry
    await (supabase as any).from('public_knowledge').insert({
      knowledge_type: 'battle_result',
      related_battle_id: battleId,
      related_battler_id: battle.winner_id,
      week_became_public: currentWeek,
      publicity_level: 'culture_knows',
      title: `${battle.battler_a_name} vs ${battle.battler_b_name} Result Released`,
      description: `Winner: ${battle.winner_id === battle.battler_a_id ? battle.battler_a_name : battle.battler_b_name}`,
      media_coverage_level: 6
    });
  }
}

// ============================================================================
// Week Progression
// ============================================================================

/**
 * Advance game to next week
 */
export async function advanceWeek(
  currentWeek: number,
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  const nextWeek = currentWeek + 1;

  // Update all battlers' current_week
  await (supabase as any)
    .from('battlers')
    .update({ current_week: nextWeek })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

  // Release battles that are ready
  const { data: schedulesToRelease } = await (supabase as any)
    .from('battle_schedule')
    .select('battle_id')
    .eq('week_public_release', nextWeek);

  if (schedulesToRelease) {
    for (const schedule of schedulesToRelease) {
      await releaseBattlePublicly(schedule.battle_id, nextWeek, supabase);
    }
  }

  // Expire scandals
  await (supabase as any)
    .from('scandals')
    .delete()
    .lt('week_expires', nextWeek);

  // Check for jail releases
  const { data: jailEvents } = await (supabase as any)
    .from('jail_events')
    .select('*')
    .eq('is_incarcerated', true);

  if (jailEvents) {
    for (const jailEvent of jailEvents) {
      if (jailEvent.week_started + jailEvent.duration_weeks <= nextWeek) {
        // Release from jail
        await (supabase as any)
          .from('jail_events')
          .update({
            is_incarcerated: false,
            week_released: nextWeek
          })
          .eq('id', jailEvent.id);

        // Update battler
        await (supabase as any)
          .from('battlers')
          .update({
            away_from_culture: false,
            away_reason: null
          })
          .eq('id', jailEvent.battler_id);
      }
    }
  }

  return nextWeek;
}
