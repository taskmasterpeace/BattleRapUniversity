import { verifyInternalSecret } from '@/lib/db/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { simulateBattle } from '@/lib/game/simulation';
import { generateOffersForPlayer } from '@/lib/services/battleOffers';
import { getVirtualNowISO } from '@/lib/dev/timeManipulation';
import { updateBattlerStress } from '@/lib/game/stressManagement';
import { evaluatePreBattleEvents, evaluatePostBattleEvents, fetchBattlerContext } from '@/lib/game/lifeEventTriggers';

export async function POST(request: Request) {
  // Verify internal secret
  if (!verifyInternalSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Check for specific battle ID (dev mode)
  const url = new URL(request.url);
  const battleId = url.searchParams.get('battle_id');

  let dueBattles;

  if (battleId) {
    // Dev mode: simulate specific battle regardless of date
    const { data } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .in('status', ['accepted', 'locked'])
      .limit(1);
    dueBattles = data;
  } else {
    // Production mode: only battles that are due
    // Uses virtual time in dev mode, real time in production
    const now = getVirtualNowISO();
    const { data } = await supabase
      .from('battles')
      .select('*')
      .lte('scheduled_at', now)
      .in('status', ['accepted', 'locked'])
      .order('scheduled_at', { ascending: true });
    dueBattles = data;
  }

  if (!dueBattles || dueBattles.length === 0) {
    return NextResponse.json({
      message: 'No battles due for simulation',
      battlesSimulated: 0,
    });
  }

  const results = [];

  for (const battle of dueBattles) {
    try {
      // Check for no-show (player has no prep blocks)
      const { data: playerPrepBlocks } = await supabase
        .from('prep_blocks')
        .select('id')
        .eq('battle_id', battle.id)
        .eq('battler_id', battle.battler_player_id);

      let noShowFlag = false;

      if (!playerPrepBlocks || playerPrepBlocks.length === 0) {
        // No-show detected - player never opened the prep planner.
        // Generate a default "winging it" prep plan: lighter than fully-planned,
        // but no longer punitive all-rest (which used to guarantee chokes).
        noShowFlag = true;

        // Calculate prep days
        const lockDate = new Date(battle.lock_prep_at);
        const createdDate = new Date(battle.created_at);
        const prepDays = Math.max(
          1,
          Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        );

        // Default "winging it" plan: writing-leaning with rest buffers.
        // Pattern (cycles): writing, performance, rest, writing, research, rest, ...
        // Why this mix: keeps a writing focus (so player can still spit), some
        // performance time, and rest to buffer resilience. No research-heavy
        // angles since the player didn't bother researching.
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

        // Update battle to mark no-show (player still pays the no_show penalty;
        // they didn't choose their prep, just got a sensible default).
        await supabase
          .from('battles')
          .update({ no_show_player: true })
          .eq('id', battle.id);
      } else {
        // Player set SOME prep but maybe not all days — backfill missing days
        // with 'rest' (their choice to leave gaps, no no_show flag).
        const lockDate = new Date(battle.lock_prep_at);
        const createdDate = new Date(battle.created_at);
        const prepDays = Math.max(
          1,
          Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        );

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
        // Auto-generate balanced AI prep
        const lockDate = new Date(battle.lock_prep_at);
        const createdDate = new Date(battle.created_at);
        const prepDays = Math.max(
          1,
          Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        );

        const aiPrep = generateAIPrep(battle.battler_ai_id, battle.id, prepDays);
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
        // Don't fail the simulation if life event check fails
      }

      // Run simulation
      await simulateBattle(battle.id, supabase);

      // Apply progression (attributes, badges, XP)
      const { applyAttributeProgression } = await import('@/lib/game/progression');
      await applyAttributeProgression(battle.id, supabase);

      // Post-battle life event evaluation
      try {
        // Fetch updated battle results
        const { data: completedBattle } = await supabase
          .from('battles')
          .select('*')
          .eq('id', battle.id)
          .single();

        if (completedBattle) {
          // Fetch battle rounds to calculate context
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

            // Build battle context
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

            // Get battler context
            const playerContext = await fetchBattlerContext(supabase, battle.battler_player_id);

            if (playerContext) {
              await evaluatePostBattleEvents(supabase, battleContext, playerContext);
            }
          }
        }
      } catch (lifeEventError) {
        console.error('Error evaluating post-battle life events:', lifeEventError);
        // Don't fail the simulation if life event evaluation fails
      }

      // Update battler's stress level after battle completion
      try {
        await updateBattlerStress(supabase, battle.battler_player_id);
        console.log(`Updated stress for battler ${battle.battler_player_id} after battle completion`);
      } catch (stressError) {
        console.error('Error updating stress after battle:', stressError);
        // Don't fail the simulation if stress update fails
      }

      // Auto-generate new battle offers for the player after successful simulation
      let offersGenerated = 0;
      try {
        // Generate 1-3 offers based on randomness
        const offerCount = 1 + Math.floor(Math.random() * 3); // 1, 2, or 3
        offersGenerated = await generateOffersForPlayer(
          supabase,
          battle.battler_player_id,
          offerCount
        );
        console.log(`Generated ${offersGenerated} new offers for battler ${battle.battler_player_id}`);
      } catch (offerError: any) {
        console.error(
          `Failed to generate offers for battler ${battle.battler_player_id}:`,
          offerError.message
        );
        // Don't fail the entire simulation if offer generation fails
      }

      results.push({
        battleId: battle.id,
        status: 'success',
        noShow: noShowFlag,
        offersGenerated,
      });
    } catch (error: any) {
      console.error(`Error simulating battle ${battle.id}:`, error);
      results.push({
        battleId: battle.id,
        status: 'error',
        error: error.message,
      });
    }
  }

  return NextResponse.json({
    message: `Simulated ${results.filter((r) => r.status === 'success').length} battles`,
    battlesSimulated: results.filter((r) => r.status === 'success').length,
    results,
  });
}

/**
 * Generate balanced AI prep
 */
function generateAIPrep(battlerId: string, battleId: string, prepDays: number) {
  const prep = [];
  const focuses = ['research', 'writing', 'performance', 'rest'];

  for (let i = 1; i <= prepDays; i++) {
    // Balanced distribution
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
