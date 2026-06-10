/**
 * Shared battle-execution pipeline.
 *
 * Runs everything that happens when a battle goes live: no-show detection,
 * prep backfill, AI prep generation, pre/post-battle life events, the
 * simulation itself, attribute progression, stress update, and fresh offer
 * generation for the player.
 *
 * Called from:
 *  - /api/internal/run-due-battles (cron: simulates all due battles)
 *  - /api/battles/[id]/start      (player-facing "BATTLE TIME" button)
 */
import { simulateBattle } from '@/lib/game/simulation';
import { generateOffersForPlayer } from '@/lib/services/battleOffers';
import { updateBattlerStress } from '@/lib/game/stressManagement';
import { awardBonusSlot } from '@/lib/game/battleSlots';
import {
  evaluatePreBattleEvents,
  evaluatePostBattleEvents,
  fetchBattlerContext,
} from '@/lib/game/lifeEventTriggers';

type BattleRow = {
  id: string;
  battler_player_id: string;
  battler_ai_id: string;
  lock_prep_at: string;
  created_at: string;
};

export type RunBattleResult = {
  noShow: boolean;
  offersGenerated: number;
};

/**
 * Generate balanced AI prep (research/writing/performance/rest rotation).
 */
function generateAIPrep(battlerId: string, battleId: string, prepDays: number) {
  const prep = [];
  for (let i = 1; i <= prepDays; i++) {
    let focus;
    if (i % 4 === 1) focus = 'research';
    else if (i % 4 === 2) focus = 'writing';
    else if (i % 4 === 3) focus = 'performance';
    else focus = 'rest';

    prep.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: i,
      focus,
      auto_generated: true,
    });
  }
  return prep;
}

function prepDayCount(battle: BattleRow): number {
  const lockDate = new Date(battle.lock_prep_at);
  const createdDate = new Date(battle.created_at);
  return Math.max(
    1,
    Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  );
}

export async function runBattleSimulation(
  battle: BattleRow,
  supabase: any
): Promise<RunBattleResult> {
  // Check for no-show (player has no prep blocks)
  const { data: playerPrepBlocks } = await supabase
    .from('prep_blocks')
    .select('id, auto_generated')
    .eq('battle_id', battle.id)
    .eq('battler_id', battle.battler_player_id);

  let noShowFlag = false;

  // Capture BEFORE any backfill: did the player personally plan every prep day?
  // (Full hand-planned prep earns a bonus battle slot after the battle.)
  const playerFullyPrepped =
    !!playerPrepBlocks &&
    playerPrepBlocks.length >= prepDayCount(battle) &&
    playerPrepBlocks.every((b: any) => !b.auto_generated);

  if (!playerPrepBlocks || playerPrepBlocks.length === 0) {
    // No-show detected - player never opened the prep planner.
    // Generate a default "winging it" prep plan: lighter than fully-planned,
    // but no longer punitive all-rest (which used to guarantee chokes).
    noShowFlag = true;

    const prepDays = prepDayCount(battle);

    // Default "winging it" plan: writing-leaning with rest buffers.
    const defaultPattern = ['writing', 'performance', 'rest', 'writing', 'research', 'rest'];
    const autoPrepBlocks = [];
    for (let i = 1; i <= prepDays; i++) {
      autoPrepBlocks.push({
        battle_id: battle.id,
        battler_id: battle.battler_player_id,
        day_index: i,
        focus: defaultPattern[(i - 1) % defaultPattern.length],
        auto_generated: true,
      });
    }

    if (autoPrepBlocks.length > 0) {
      await supabase.from('prep_blocks').insert(autoPrepBlocks);
    }

    await supabase
      .from('battles')
      .update({ no_show_player: true })
      .eq('id', battle.id);
  } else {
    // Player set SOME prep but maybe not all days — backfill missing days
    // with 'rest' (their choice to leave gaps, no no_show flag).
    const prepDays = prepDayCount(battle);

    const { data: filledDays } = await supabase
      .from('prep_blocks')
      .select('day_index')
      .eq('battle_id', battle.id)
      .eq('battler_id', battle.battler_player_id);

    const filledSet = new Set((filledDays || []).map((r: any) => r.day_index));
    const backfill = [];
    for (let i = 1; i <= prepDays; i++) {
      if (!filledSet.has(i)) {
        backfill.push({
          battle_id: battle.id,
          battler_id: battle.battler_player_id,
          day_index: i,
          focus: 'rest',
          auto_generated: true,
        });
      }
    }
    if (backfill.length > 0) {
      await supabase.from('prep_blocks').insert(backfill);
    }
  }

  // Generate AI prep if missing
  const { data: aiPrepBlocks } = await supabase
    .from('prep_blocks')
    .select('id')
    .eq('battle_id', battle.id)
    .eq('battler_id', battle.battler_ai_id);

  if (!aiPrepBlocks || aiPrepBlocks.length === 0) {
    const aiPrep = generateAIPrep(battle.battler_ai_id, battle.id, prepDayCount(battle));
    if (aiPrep.length > 0) {
      await supabase.from('prep_blocks').insert(aiPrep);
    }
  }

  // Pre-battle life event check
  try {
    const playerContext = await fetchBattlerContext(supabase, battle.battler_player_id);
    if (playerContext) {
      await evaluatePreBattleEvents(supabase, battle.id, playerContext);
    }
  } catch (lifeEventError) {
    console.error('Error evaluating pre-battle life events:', lifeEventError);
  }

  // Run simulation
  await simulateBattle(battle.id, supabase);

  // Apply progression (attributes, badges, XP)
  const { applyAttributeProgression } = await import('@/lib/game/progression');
  await applyAttributeProgression(battle.id, supabase);

  // Bonus battle slots — earn extra stage time today (capped at +2/day):
  //  - WIN the battle            → +1 slot
  //  - fully hand-planned prep   → +1 slot (no auto-generated player blocks)
  try {
    const { data: resultRow } = await supabase
      .from('battles')
      .select('winner_battler_id')
      .eq('id', battle.id)
      .single();

    if (resultRow?.winner_battler_id === battle.battler_player_id) {
      await awardBonusSlot(supabase, battle.battler_player_id, 'win');
    }
    if (playerFullyPrepped) {
      await awardBonusSlot(supabase, battle.battler_player_id, 'full_prep');
    }
  } catch (slotError) {
    console.error('Error awarding bonus battle slots:', slotError);
  }

  // Post-battle life event evaluation
  try {
    const { data: completedBattle } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battle.id)
      .single();

    if (completedBattle) {
      const { data: allRounds } = await supabase
        .from('battle_rounds')
        .select('*')
        .eq('battle_id', battle.id)
        .order('round_index', { ascending: true });

      if (allRounds) {
        const playerRounds = allRounds.filter((r: any) => r.battler_id === battle.battler_player_id);
        const aiRounds = allRounds.filter((r: any) => r.battler_id === battle.battler_ai_id);

        const playerRoundsWon = playerRounds.filter((r: any) => r.won).length;
        const aiRoundsWon = aiRounds.filter((r: any) => r.won).length;

        const playerAvgCrowdReaction =
          playerRounds.reduce((sum: number, r: any) => sum + r.crowd_reaction, 0) / playerRounds.length;
        const aiAvgCrowdReaction =
          aiRounds.reduce((sum: number, r: any) => sum + r.crowd_reaction, 0) / aiRounds.length;

        const playerPeakScore = Math.max(...playerRounds.map((r: any) => r.peak_score));
        const playerConsistencyScore =
          playerRounds.reduce((sum: number, r: any) => sum + r.consistency_score, 0) / playerRounds.length;

        const battleContext = {
          battleId: battle.id,
          winnerId: completedBattle.winner_battler_id,
          playerBattlerId: battle.battler_player_id,
          aiBattlerId: battle.battler_ai_id,
          result: `${playerRoundsWon}-${aiRoundsWon}`,
          playerRoundsWon,
          aiRoundsWon,
          playerChoked: playerRounds.some((r: any) => r.choke),
          aiChoked: aiRounds.some((r: any) => r.choke),
          playerAvgCrowdReaction,
          aiAvgCrowdReaction,
          playerPeakScore,
          playerConsistencyScore,
        };

        const playerContext = await fetchBattlerContext(supabase, battle.battler_player_id);
        if (playerContext) {
          await evaluatePostBattleEvents(supabase, battleContext, playerContext);
        }
      }
    }
  } catch (lifeEventError) {
    console.error('Error evaluating post-battle life events:', lifeEventError);
  }

  // Update battler's stress level after battle completion
  try {
    await updateBattlerStress(supabase, battle.battler_player_id);
  } catch (stressError) {
    console.error('Error updating stress after battle:', stressError);
  }

  // Auto-generate new battle offers for the player after successful simulation
  let offersGenerated = 0;
  try {
    const offerCount = 1 + Math.floor(Math.random() * 3); // 1, 2, or 3
    offersGenerated = await generateOffersForPlayer(
      supabase,
      battle.battler_player_id,
      offerCount
    );
  } catch (offerError: any) {
    console.error(
      `Failed to generate offers for battler ${battle.battler_player_id}:`,
      offerError.message
    );
  }

  return { noShow: noShowFlag, offersGenerated };
}
