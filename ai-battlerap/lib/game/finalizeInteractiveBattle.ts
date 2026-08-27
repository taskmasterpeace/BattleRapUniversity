/**
 * Finalizer for INTERACTIVE (round-by-round "Locked In") battles.
 *
 * The interactive flow simulates one round at a time via
 * singleRoundSimulation.ts, which inserts battle_rounds/battle_segments as it
 * goes. When round 3 lands, this module settles the battle with the SAME
 * career consequences as the auto pipeline (runBattle.ts):
 *   per-round winners → verdict + decision type → payouts → ELO rankings →
 *   news recap → progression/slots/loyalty/life events/stress/fresh offers.
 */
import { calculateELO } from '@/lib/game/simulation';
import { applyPostBattleCareerEffects } from '@/lib/game/runBattle';
import { SIMULATION_CONFIG as CONFIG } from '@/lib/game/config';

export type FinalizeResult = {
  winnerId: string;
  verdict: '3-0' | '2-1';
  decisionType: 'bodybag' | 'clean_sweep' | 'gentlemans_30' | 'classic' | 'edge';
};

export async function finalizeInteractiveBattle(
  supabase: any,
  battleId: string
): Promise<FinalizeResult> {
  const { data: battle, error: battleError } = await supabase
    .from('battles')
    .select('*, league:leagues(*)')
    .eq('id', battleId)
    .single();

  if (battleError || !battle) {
    throw new Error(`finalizeInteractiveBattle: battle ${battleId} not found`);
  }

  const { data: allRounds } = await supabase
    .from('battle_rounds')
    .select('*')
    .eq('battle_id', battleId)
    .order('round_index');

  if (!allRounds || allRounds.length < 6) {
    throw new Error(
      `finalizeInteractiveBattle: expected 6 round rows for ${battleId}, got ${allRounds?.length ?? 0}`
    );
  }

  // 1. Per-round winners — persist `won` so recaps, H2H, grudges, and career
  // history read real data (the column every consumer depends on).
  for (let roundIndex = 1; roundIndex <= 3; roundIndex++) {
    const playerRound = allRounds.find(
      (r: any) => r.round_index === roundIndex && r.battler_id === battle.battler_player_id
    );
    const aiRound = allRounds.find(
      (r: any) => r.round_index === roundIndex && r.battler_id === battle.battler_ai_id
    );
    if (!playerRound || !aiRound) continue;

    const playerWonRound = playerRound.average_score >= aiRound.average_score;
    playerRound.won = playerWonRound;
    aiRound.won = !playerWonRound;

    await supabase.from('battle_rounds').update({ won: playerWonRound }).eq('id', playerRound.id);
    await supabase.from('battle_rounds').update({ won: !playerWonRound }).eq('id', aiRound.id);
  }

  const playerRounds = allRounds.filter((r: any) => r.battler_id === battle.battler_player_id);
  const aiRounds = allRounds.filter((r: any) => r.battler_id === battle.battler_ai_id);
  const playerRoundsWon = playerRounds.filter((r: any) => r.won).length;
  const aiRoundsWon = aiRounds.filter((r: any) => r.won).length;

  const winnerId =
    playerRoundsWon > aiRoundsWon ? battle.battler_player_id : battle.battler_ai_id;
  const playerWon = winnerId === battle.battler_player_id;
  const winnerRoundsWon = playerWon ? playerRoundsWon : aiRoundsWon;

  // 2. Verdict + decision type — same thresholds as the auto engine.
  let verdict: '3-0' | '2-1' = '2-1';
  let decisionType: FinalizeResult['decisionType'] = 'edge';

  const winnerRounds = allRounds.filter((r: any) => r.battler_id === winnerId);
  const loserRounds = allRounds.filter((r: any) => r.battler_id !== winnerId);

  if (winnerRoundsWon === 3) {
    verdict = '3-0';
    let totalMargin = 0;
    for (let i = 0; i < 3; i++) {
      totalMargin += Math.abs(
        (winnerRounds[i]?.average_score || 0) - (loserRounds[i]?.average_score || 0)
      );
    }
    const avgMarginPerRound = totalMargin / 3;

    if (avgMarginPerRound >= CONFIG.DECISION_BODYBAG_THRESHOLD) {
      decisionType = 'bodybag';
    } else if (avgMarginPerRound >= CONFIG.DECISION_CLASSIC_THRESHOLD) {
      decisionType = 'clean_sweep';
    } else {
      decisionType = 'gentlemans_30';
    }
  } else {
    const avgCrowd =
      allRounds.reduce((sum: number, r: any) => sum + (r.crowd_reaction || 0), 0) /
      allRounds.length;
    decisionType = avgCrowd >= (CONFIG.DECISION_CLASSIC_CROWD_MIN || 70) ? 'classic' : 'edge';
  }

  // 3. Payouts — the bag is real in both battle modes.
  const { calculateBattlePayout, getTierFromRating } = await import('./paymentCalculator');

  const { data: rankings } = await supabase
    .from('rankings')
    .select('*')
    .in('battler_id', [battle.battler_player_id, battle.battler_ai_id]);

  const playerRanking = rankings?.find((r: any) => r.battler_id === battle.battler_player_id) || {
    rating: 1200, wins: 0, losses: 0, streak: 0,
  };
  const aiRanking = rankings?.find((r: any) => r.battler_id === battle.battler_ai_id) || {
    rating: 1200, wins: 0, losses: 0, streak: 0,
  };

  const isTournamentBattle = battle.is_tournament_battle || false;
  const playerPayout = calculateBattlePayout({
    tier: getTierFromRating(playerRanking.rating),
    leagueType: battle.league.name,
    wonBattle: playerWon,
    isTournament: isTournamentBattle,
  });
  const aiPayout = calculateBattlePayout({
    tier: getTierFromRating(aiRanking.rating),
    leagueType: battle.league.name,
    wonBattle: !playerWon,
    isTournament: isTournamentBattle,
  });

  await supabase
    .from('battles')
    .update({
      status: 'completed',
      winner_battler_id: winnerId,
      player_payout: playerPayout,
      ai_payout: aiPayout,
      verdict,
      decision_type: decisionType,
    })
    .eq('id', battleId);

  // Tournament battles pay through the prize pool, not per-battle (payout is 0);
  // don't write a $0 "battle payout" earning that misrepresents a tournament bout.
  if (!isTournamentBattle) {
    await supabase.rpc('add_earnings_transaction', {
      p_battler_id: battle.battler_player_id,
      p_amount: playerPayout,
      // Flat pay — winning doesn't earn more, so it's never a "win bonus".
      p_transaction_type: 'battle_base_pay',
      p_battle_id: battleId,
      p_description: `Battle payout - ${playerWon ? 'Victory' : 'Participation'}`,
      p_metadata: { league: battle.league.name, won: playerWon },
    });
    await supabase.rpc('add_earnings_transaction', {
      p_battler_id: battle.battler_ai_id,
      p_amount: aiPayout,
      p_transaction_type: 'battle_base_pay',
      p_battle_id: battleId,
      p_description: `Battle payout - ${!playerWon ? 'Victory' : 'Participation'}`,
      p_metadata: { league: battle.league.name, won: !playerWon },
    });
  }

  // 4. Rankings — identical ELO math to the auto engine.
  const newRatings = calculateELO(playerRanking.rating, aiRanking.rating, playerWon);
  await supabase
    .from('rankings')
    .update({
      rating: newRatings.player,
      wins: playerWon ? playerRanking.wins + 1 : playerRanking.wins,
      losses: playerWon ? playerRanking.losses : playerRanking.losses + 1,
      streak: playerWon
        ? Math.max(0, playerRanking.streak) + 1
        : Math.min(0, playerRanking.streak) - 1,
    })
    .eq('battler_id', battle.battler_player_id);
  await supabase
    .from('rankings')
    .update({
      rating: newRatings.ai,
      wins: !playerWon ? aiRanking.wins + 1 : aiRanking.wins,
      losses: !playerWon ? aiRanking.losses : aiRanking.losses + 1,
      streak: !playerWon
        ? Math.max(0, aiRanking.streak) + 1
        : Math.min(0, aiRanking.streak) - 1,
    })
    .eq('battler_id', battle.battler_ai_id);

  // 5. Press coverage — the world talks about interactive battles too.
  try {
    const { createBattleRecapAndEvents } = await import('@/lib/services/newsGenerator');
    await createBattleRecapAndEvents(battleId, supabase);
  } catch (err) {
    console.error('Failed to create recap/news for interactive battle', battleId, err);
  }

  // 6. Career effects — progression, slots, loyalty, life events, stress,
  // fresh offers. Full prep credit: interactive players hand-planned if none
  // of their prep blocks were auto-generated.
  try {
    const { data: playerPrep } = await supabase
      .from('prep_blocks')
      .select('auto_generated')
      .eq('battle_id', battleId)
      .eq('battler_id', battle.battler_player_id);
    const playerFullyPrepped =
      !!playerPrep && playerPrep.length > 0 && playerPrep.every((b: any) => !b.auto_generated);

    await applyPostBattleCareerEffects(battle, supabase, playerFullyPrepped);
  } catch (careerError) {
    console.error('Post-battle career effects failed (interactive):', careerError);
  }

  return { winnerId, verdict, decisionType };
}
