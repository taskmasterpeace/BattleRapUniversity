/**
 * AI vs AI Tournament Runner
 *
 * Runs comprehensive AI vs AI battle tournaments for system validation and reporting.
 * This is NOT the player-facing tournament system (see tournamentManager.ts).
 * This is for testing, validation, and generating battle reports.
 */

import { simulateBattle } from './simulation';
import { autoSelectContent } from './roundContentSelection';
import type { Battler, BattlerTier, PrepFocus } from '@/lib/models';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface TournamentMatchup {
  battler1Id: string;
  battler1Name: string;
  battler1Tier: BattlerTier;
  battler1Rating: number;
  battler2Id: string;
  battler2Name: string;
  battler2Tier: BattlerTier;
  battler2Rating: number;
  matchupType: 'same_tier' | 'cross_tier';
}

export interface TournamentConfig {
  numBattles: number; // 8-12 battles
  league: 'small_room' | 'main_stage' | 'progressive'; // Which league to use (progressive = start small_room, end main_stage)
  prepDays: number; // How many prep days (default 14)
  context: 'in_building' | 'ppv' | 'on_cam'; // Battle context
}

export interface TournamentBattleResult {
  battleId: string;
  matchup: TournamentMatchup;
  winnerId: string;
  winnerName: string;
  loserId: string;
  loserName: string;
  decision: '3-0' | '2-1';
  wasUpset: boolean;
  battler1RoundsWon: number;
  battler2RoundsWon: number;
}

/**
 * Main tournament runner - creates and executes AI vs AI tournament
 */
export async function runAITournament(
  config: TournamentConfig,
  supabase: SupabaseClient
): Promise<{ success: boolean; battleIds: string[]; error?: string }> {

  try {
    // 1. Generate matchups
    const matchups = await generateTournamentMatchups(config.numBattles, supabase);
    if (matchups.length === 0) {
      return { success: false, battleIds: [], error: 'No matchups could be generated' };
    }

    // 2. Get league IDs
    const { data: smallRoomLeague } = await supabase
      .from('leagues')
      .select('id')
      .eq('short_code', 'SRC')
      .single();

    const { data: mainStageLeague } = await supabase
      .from('leagues')
      .select('id')
      .eq('short_code', 'MSA')
      .single();

    if (!smallRoomLeague || !mainStageLeague) {
      return { success: false, battleIds: [], error: 'Leagues not found' };
    }

    const battleIds: string[] = [];

    // 3. Create and run each battle
    for (let i = 0; i < matchups.length; i++) {
      const matchup = matchups[i];
      const battleNumber = i + 1;

      // Determine league for this battle based on config
      let currentLeagueId: string;
      let currentLeagueName: string;

      if (config.league === 'progressive') {
        // Progressive mode: Start in Small Room, progress to Main Stage
        // First 60% of battles in Small Room, last 40% in Main Stage
        const smallRoomBattles = Math.ceil(matchups.length * 0.6);
        if (battleNumber <= smallRoomBattles) {
          currentLeagueId = smallRoomLeague.id;
          currentLeagueName = 'Small Room Circuit (2min rounds)';
        } else {
          currentLeagueId = mainStageLeague.id;
          currentLeagueName = 'Main Stage Arena (3min rounds)';
        }
      } else {
        // Fixed league mode
        if (config.league === 'small_room') {
          currentLeagueId = smallRoomLeague.id;
          currentLeagueName = 'Small Room Circuit';
        } else {
          currentLeagueId = mainStageLeague.id;
          currentLeagueName = 'Main Stage Arena';
        }
      }

      console.log(`\nBattle ${battleNumber}/${matchups.length} [${currentLeagueName}]: ${matchup.battler1Name} vs ${matchup.battler2Name}`);

      // Create battle record
      const scheduledAt = new Date();
      const lockPrepAt = new Date();
      lockPrepAt.setDate(lockPrepAt.getDate() + config.prepDays);

      const { data: battle, error: battleError } = await supabase
        .from('battles')
        .insert({
          league_id: currentLeagueId,
          battler_player_id: matchup.battler1Id,
          battler_ai_id: matchup.battler2Id,
          scheduled_at: scheduledAt.toISOString(),
          lock_prep_at: lockPrepAt.toISOString(),
          status: 'locked', // Skip prep phase, go straight to locked
          context: config.context,
          player_locked_in: false, // Use auto mode
        })
        .select()
        .single();

      if (battleError || !battle) {
        console.error(`Failed to create battle: ${battleError?.message}`);
        continue;
      }

      battleIds.push(battle.id);

      // Generate prep for both battlers
      await generateAIPrepSchedule(
        battle.id,
        matchup.battler1Id,
        matchup.battler1Tier,
        config.prepDays,
        supabase
      );
      await generateAIPrepSchedule(
        battle.id,
        matchup.battler2Id,
        matchup.battler2Tier,
        config.prepDays,
        supabase
      );

      // Simulate battle
      console.log(`Simulating battle ${battle.id}...`);
      await simulateBattle(battle.id, supabase);
      console.log(`Battle ${battle.id} completed`);
    }

    return { success: true, battleIds };
  } catch (error: any) {
    console.error('Tournament execution error:', error);
    return { success: false, battleIds: [], error: error.message };
  }
}

/**
 * Generate tournament matchups
 * Strategy: Mix of same-tier and cross-tier battles
 */
async function generateTournamentMatchups(numBattles: number, supabase: SupabaseClient): Promise<TournamentMatchup[]> {

  // Load all AI battlers with rankings
  const { data: battlers } = await supabase
    .from('battlers')
    .select(`
      id,
      stage_name,
      tier,
      rankings!inner(rating)
    `)
    .eq('is_ai', true)
    .order('tier');

  if (!battlers || battlers.length < 2) {
    console.error('Not enough AI battlers found');
    return [];
  }

  const matchups: TournamentMatchup[] = [];
  const usedBattlers = new Set<string>();

  // Separate battlers by tier
  const godTier = battlers.filter(b => b.tier === 'god');
  const topTier = battlers.filter(b => b.tier === 'top');
  const midTier = battlers.filter(b => b.tier === 'mid');
  const lowTier = battlers.filter(b => b.tier === 'low');

  // Helper to create matchup
  const createMatchup = (b1: any, b2: any, type: 'same_tier' | 'cross_tier'): TournamentMatchup => ({
    battler1Id: b1.id,
    battler1Name: b1.stage_name,
    battler1Tier: b1.tier,
    battler1Rating: b1.rankings.rating,
    battler2Id: b2.id,
    battler2Name: b2.stage_name,
    battler2Tier: b2.tier,
    battler2Rating: b2.rankings.rating,
    matchupType: type,
  });

  // Helper to pick random from array
  const pickRandom = <T>(arr: T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  };

  // Helper to pick two unused battlers from tier
  const pickTwo = (tier: any[]): [any, any] | null => {
    const available = tier.filter(b => !usedBattlers.has(b.id));
    if (available.length < 2) return null;

    const first = pickRandom(available)!;
    const second = pickRandom(available.filter(b => b.id !== first.id))!;

    return [first, second];
  };

  // Strategy:
  // - 2 god tier battles
  // - 2 top tier battles
  // - 2 mid tier battles
  // - 2-6 cross-tier battles for remaining slots

  let battlesCreated = 0;

  // God tier battles (2)
  if (godTier.length >= 4 && battlesCreated < numBattles) {
    const pair1 = pickTwo(godTier);
    if (pair1) {
      matchups.push(createMatchup(pair1[0], pair1[1], 'same_tier'));
      usedBattlers.add(pair1[0].id);
      usedBattlers.add(pair1[1].id);
      battlesCreated++;
    }
  }

  if (godTier.length >= 2 && battlesCreated < numBattles) {
    const pair2 = pickTwo(godTier);
    if (pair2) {
      matchups.push(createMatchup(pair2[0], pair2[1], 'same_tier'));
      usedBattlers.add(pair2[0].id);
      usedBattlers.add(pair2[1].id);
      battlesCreated++;
    }
  }

  // Top tier battles (2)
  if (topTier.length >= 4 && battlesCreated < numBattles) {
    const pair1 = pickTwo(topTier);
    if (pair1) {
      matchups.push(createMatchup(pair1[0], pair1[1], 'same_tier'));
      usedBattlers.add(pair1[0].id);
      usedBattlers.add(pair1[1].id);
      battlesCreated++;
    }
  }

  if (topTier.length >= 2 && battlesCreated < numBattles) {
    const pair2 = pickTwo(topTier);
    if (pair2) {
      matchups.push(createMatchup(pair2[0], pair2[1], 'same_tier'));
      usedBattlers.add(pair2[0].id);
      usedBattlers.add(pair2[1].id);
      battlesCreated++;
    }
  }

  // Mid tier battles (2)
  if (midTier.length >= 4 && battlesCreated < numBattles) {
    const pair1 = pickTwo(midTier);
    if (pair1) {
      matchups.push(createMatchup(pair1[0], pair1[1], 'same_tier'));
      usedBattlers.add(pair1[0].id);
      usedBattlers.add(pair1[1].id);
      battlesCreated++;
    }
  }

  if (midTier.length >= 2 && battlesCreated < numBattles) {
    const pair2 = pickTwo(midTier);
    if (pair2) {
      matchups.push(createMatchup(pair2[0], pair2[1], 'same_tier'));
      usedBattlers.add(pair2[0].id);
      usedBattlers.add(pair2[1].id);
      battlesCreated++;
    }
  }

  // Fill remaining slots with cross-tier battles
  while (battlesCreated < numBattles) {
    const availableGod = godTier.filter(b => !usedBattlers.has(b.id));
    const availableTop = topTier.filter(b => !usedBattlers.has(b.id));
    const availableMid = midTier.filter(b => !usedBattlers.has(b.id));
    const availableLow = lowTier.filter(b => !usedBattlers.has(b.id));

    // Try god vs top
    if (availableGod.length > 0 && availableTop.length > 0) {
      const god = pickRandom(availableGod)!;
      const top = pickRandom(availableTop)!;
      matchups.push(createMatchup(god, top, 'cross_tier'));
      usedBattlers.add(god.id);
      usedBattlers.add(top.id);
      battlesCreated++;
      continue;
    }

    // Try top vs mid
    if (availableTop.length > 0 && availableMid.length > 0) {
      const top = pickRandom(availableTop)!;
      const mid = pickRandom(availableMid)!;
      matchups.push(createMatchup(top, mid, 'cross_tier'));
      usedBattlers.add(top.id);
      usedBattlers.add(mid.id);
      battlesCreated++;
      continue;
    }

    // Try mid vs low
    if (availableMid.length > 0 && availableLow.length > 0) {
      const mid = pickRandom(availableMid)!;
      const low = pickRandom(availableLow)!;
      matchups.push(createMatchup(mid, low, 'cross_tier'));
      usedBattlers.add(mid.id);
      usedBattlers.add(low.id);
      battlesCreated++;
      continue;
    }

    // Can't create more battles
    break;
  }

  return matchups;
}

/**
 * Generate AI prep schedule based on battler tier and archetype
 * Different tiers/archetypes get different prep distributions
 */
async function generateAIPrepSchedule(
  battleId: string,
  battlerId: string,
  tier: BattlerTier,
  prepDays: number,
  supabase: SupabaseClient
): Promise<void> {

  // Get battler's badges to determine prep strategy
  const { data: battler } = await supabase
    .from('battlers')
    .select('style_tags')
    .eq('id', battlerId)
    .single();

  const badges = battler?.style_tags || [];

  // Determine prep distribution based on badges and tier
  const prepStrategy = determinePrepStrategy(badges, tier);

  // Generate prep blocks
  const prepBlocks = [];
  for (let dayIndex = 0; dayIndex < prepDays; dayIndex++) {
    const focus = selectPrepFocus(prepStrategy, dayIndex, prepDays);

    prepBlocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: dayIndex,
      focus,
      auto_generated: true,
    });
  }

  // Insert all prep blocks
  await supabase.from('prep_blocks').insert(prepBlocks);
}

/**
 * Determine prep strategy based on battler's badges
 */
function determinePrepStrategy(
  badges: string[],
  tier: BattlerTier
): Record<PrepFocus, number> {
  // Default balanced strategy
  let strategy: Record<PrepFocus, number> = {
    writing: 0.35,
    performance: 0.35,
    research: 0.15,
    rest: 0.10,
    life: 0.05,
  };

  // Writer-focused battlers
  if (badges.includes('Pen Game Elite') || badges.includes('Technical Writer')) {
    strategy = {
      writing: 0.55,
      performance: 0.20,
      research: 0.15,
      rest: 0.08,
      life: 0.02,
    };
  }

  // Performer-focused battlers
  if (badges.includes('Stage Domination') || badges.includes('Crowd Favorite')) {
    strategy = {
      writing: 0.25,
      performance: 0.50,
      research: 0.10,
      rest: 0.10,
      life: 0.05,
    };
  }

  // Lazy prep battlers
  if (badges.includes('Unprepared') || badges.includes('Lazy Writer')) {
    strategy = {
      writing: 0.20,
      performance: 0.20,
      research: 0.05,
      rest: 0.30,
      life: 0.25,
    };
  }

  // Known chokers need more rest
  if (badges.includes('Known Choker')) {
    strategy.rest += 0.10;
    strategy.writing -= 0.05;
    strategy.performance -= 0.05;
  }

  return strategy;
}

/**
 * Select prep focus for a given day based on strategy
 */
function selectPrepFocus(
  strategy: Record<PrepFocus, number>,
  dayIndex: number,
  totalDays: number
): PrepFocus {
  // First day: always research
  if (dayIndex === 0) {
    return 'research';
  }

  // Last day: always rest
  if (dayIndex === totalDays - 1) {
    return 'rest';
  }

  // Random weighted selection based on strategy
  const rand = Math.random();
  let cumulative = 0;

  for (const [focus, weight] of Object.entries(strategy)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return focus as PrepFocus;
    }
  }

  return 'writing'; // Fallback
}
