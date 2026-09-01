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
  is_world?: boolean | null;
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
  // Capped at 14 to match the prep API window — prep is a scarce resource.
  const lockDate = new Date(battle.lock_prep_at);
  const createdDate = new Date(battle.created_at);
  return Math.min(
    14,
    Math.max(
      1,
      Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    )
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

  // A "no-show" only makes sense for a real human who never opened the planner.
  // World cards, tournament rounds, and any other AI-vs-AI bout have an AI in the
  // player slot that never preps — flagging those as no-shows ran the whole
  // simulated world on penalized, choke-prone performances. Detect the AI slot by
  // its missing user_id (with is_world as a belt-and-suspenders); those get a
  // default AI prep plan, not a no-show.
  const { data: playerBattlerRow } = await supabase
    .from('battlers')
    .select('user_id')
    .eq('id', battle.battler_player_id)
    .single();
  const playerSlotIsAI = !playerBattlerRow?.user_id || !!battle.is_world;

  // Capture BEFORE any backfill: did the player personally plan every prep day?
  // (Full hand-planned prep earns a bonus battle slot after the battle.)
  const playerFullyPrepped =
    !!playerPrepBlocks &&
    playerPrepBlocks.length >= prepDayCount(battle) &&
    playerPrepBlocks.every((b: any) => !b.auto_generated);

  if (!playerPrepBlocks || playerPrepBlocks.length === 0) {
    // No prep for the player-slot battler. For a real player this is a no-show
    // (they never opened the planner); for a world/AI battler it's just how AI
    // battles run. Either way, seed a default "winging it" plan — writing-leaning
    // with rest buffers, not punitive all-rest — then flag the no-show only when
    // an actual human ghosted.
    noShowFlag = !playerSlotIsAI;

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

    if (!playerSlotIsAI) {
      await supabase
        .from('battles')
        .update({ no_show_player: true })
        .eq('id', battle.id);
    }
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

  // ── CREW CONTRIBUTIONS ──────────────────────────────────────────────
  // Each crew member adds ONE extra prep day matching their specialty
  // (research/writing/performance), appended after the player's own prep
  // days. Capped at one per member, max 3 (crew size limit). These flow
  // through buildPrepProfile() in the sim like any other prep block.
  try {
    const { data: crewMembers } = await supabase
      .from('crew_members')
      .select('id, specialty')
      .eq('owner_battler_id', battle.battler_player_id)
      .order('recruited_at')
      .limit(3);

    if (crewMembers && crewMembers.length > 0) {
      // Find the highest existing day_index for the player so crew days
      // never collide with planned/backfilled days.
      const { data: maxDayRow } = await supabase
        .from('prep_blocks')
        .select('day_index')
        .eq('battle_id', battle.id)
        .eq('battler_id', battle.battler_player_id)
        .order('day_index', { ascending: false })
        .limit(1);

      const maxDay = maxDayRow && maxDayRow.length > 0 ? maxDayRow[0].day_index : 0;

      const crewPrepBlocks = crewMembers.slice(0, 3).map((member: any, i: number) => ({
        battle_id: battle.id,
        battler_id: battle.battler_player_id,
        day_index: maxDay + 1 + i,
        focus: member.specialty, // 'research' | 'writing' | 'performance'
        auto_generated: true,
      }));

      if (crewPrepBlocks.length > 0) {
        await supabase.from('prep_blocks').insert(crewPrepBlocks);
      }
    }
  } catch (crewError) {
    // Crew bonuses are additive flavor — never block the battle on them.
    console.error('Error applying crew prep contributions:', crewError);
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

  const offersGenerated = await applyPostBattleCareerEffects(
    battle,
    supabase,
    playerFullyPrepped
  );

  return { noShow: noShowFlag, offersGenerated };
}

/**
 * Everything a completed battle does to a CAREER: attribute/badge/XP
 * progression, bonus battle slots, crew loyalty, post-battle life events,
 * stress, and fresh offers. Shared by the auto pipeline above and the
 * interactive round-by-round finalizer (finalizeInteractiveBattle.ts) so both
 * battle modes leave identical career footprints.
 */
export async function applyPostBattleCareerEffects(
  battle: BattleRow,
  supabase: any,
  playerFullyPrepped: boolean
): Promise<number> {
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

  // Crew loyalty — recruiting somebody is not marriage. Wins build the bond,
  // losses and no-shows bleed it, and every member past the first strains your
  // attention. At zero loyalty they walk, and the player hears about it.
  try {
    const { data: crewRows } = await supabase
      .from('crew_members')
      .select('id, member_battler_id, loyalty')
      .eq('owner_battler_id', battle.battler_player_id);

    if (crewRows && crewRows.length > 0) {
      const { data: resultRow } = await supabase
        .from('battles')
        .select('winner_battler_id, no_show_player')
        .eq('id', battle.id)
        .single();

      const won = resultRow?.winner_battler_id === battle.battler_player_id;
      const noShow = !!resultRow?.no_show_player;
      const strain = Math.max(0, crewRows.length - 1); // attention is finite

      for (const member of crewRows) {
        let delta = won ? 3 : -3;
        if (noShow) delta -= 5; // they showed up for you; you didn't show up at all
        delta -= strain;
        const newLoyalty = Math.max(0, Math.min(100, (member.loyalty ?? 70) + delta));

        if (newLoyalty <= 0) {
          // They walk.
          const { data: leaver } = await supabase
            .from('battlers')
            .select('stage_name')
            .eq('id', member.member_battler_id)
            .single();
          await supabase.from('crew_members').delete().eq('id', member.id);
          try {
            const { createNotification } = await import('@/lib/services/notificationService');
            await createNotification(supabase, battle.battler_player_id, {
              type: 'system_message',
              title: `${leaver?.stage_name ?? 'A crew member'} left your camp`,
              message:
                'Loyalty hit zero. Wins keep a crew together — and nobody stays loyal to a manager stretched too thin.',
              metadata: { link: '/crew', event: 'crew_departure' },
            });
          } catch (notifyError) {
            console.error('Crew departure notification failed:', notifyError);
          }
        } else if (newLoyalty !== member.loyalty) {
          await supabase.from('crew_members').update({ loyalty: newLoyalty }).eq('id', member.id);
        }
      }
    }
  } catch (loyaltyError) {
    console.error('Error updating crew loyalty:', loyaltyError);
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

  // The Newsroom: the battle becomes leads (result, beef, streak), then bloggers
  // land/sit/drop them. Fire-and-forget — never blocks the battle.
  try {
    const { createLeadsFromBattle } = await import('@/lib/game/newsroom/leads');
    const { runNewsroomTick } = await import('@/lib/game/newsroom/engine');
    await createLeadsFromBattle(supabase, battle.id);
    await runNewsroomTick(supabase);
  } catch (newsroomError) {
    console.error('Error running newsroom after battle:', newsroomError);
  }

  // Update battler's stress level after battle completion
  try {
    await updateBattlerStress(supabase, battle.battler_player_id);
  } catch (stressError) {
    console.error('Error updating stress after battle:', stressError);
  }

  // Advance the action-based career clock by the prep days spent (min 1), the
  // same tick the interactive finalizer applies — both modes age a career
  // identically. Additive; never blocks the battle.
  try {
    const { advanceGameDay } = await import('@/lib/game/time/gameTime');
    const { count: prepDays } = await supabase
      .from('prep_blocks')
      .select('id', { count: 'exact', head: true })
      .eq('battle_id', battle.id)
      .eq('battler_id', battle.battler_player_id);
    await advanceGameDay(
      supabase,
      battle.battler_player_id,
      'battle',
      `Auto battle ${battle.id}`,
      Math.max(1, prepDays ?? 1)
    );
  } catch (clockError) {
    console.error('Error advancing game_day after battle:', clockError);
  }

  // ONE follow-up offer after the battle, not a flooded inbox (owner note,
  // 2026-09-01: "as soon as the battle was over I got all these battles in my
  // box — I haven't even went through any days"). A win gets promoters
  // calling; the rest of the slate arrives with time, not instantly.
  let offersGenerated = 0;
  try {
    offersGenerated = await generateOffersForPlayer(
      supabase,
      battle.battler_player_id,
      1
    );
  } catch (offerError: any) {
    console.error(
      `Failed to generate offers for battler ${battle.battler_player_id}:`,
      offerError.message
    );
  }

  return offersGenerated;
}
