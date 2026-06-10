/**
 * World battle-execution pipeline.
 *
 * AI-vs-AI version of lib/game/runPvpBattle.ts for battles booked by the
 * world tick (battles.is_world = true). The world keeps moving without the
 * player: both sides get balanced auto-prep, then the (already symmetric)
 * simulation engine runs — which handles ELO, payouts, attribute progression
 * and the recap article internally.
 *
 * Deliberate differences from runBattleSimulation / runPvpBattle:
 *  - Prep is ALWAYS auto-generated (no humans involved, both sides equal days)
 *  - NO bonus battle slots, NO fresh offers, NO player life events,
 *    NO player notifications — nobody is sitting behind these battlers
 *
 * Called from:
 *  - /api/internal/run-world-tick  (cron: books + simulates the world's slate)
 */
import { simulateBattle } from '@/lib/game/simulation';

type WorldBattleRow = {
  id: string;
  battler_player_id: string; // corner A (AI battler)
  battler_ai_id: string; // corner B (AI battler)
  lock_prep_at: string;
  created_at: string;
};

export type RunWorldBattleResult = {
  winnerBattlerId: string | null;
  verdict: string | null;
};

/**
 * Balanced prep rotation with a random starting offset so two cards on the
 * same night don't produce identical prep profiles.
 */
function generateWorldPrep(battlerId: string, battleId: string, prepDays: number) {
  const rotation = ['research', 'writing', 'performance', 'rest'];
  const offset = Math.floor(Math.random() * rotation.length);
  const blocks = [];
  for (let i = 1; i <= prepDays; i++) {
    blocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: i,
      focus: rotation[(i - 1 + offset) % rotation.length],
      auto_generated: true,
    });
  }
  return blocks;
}

function prepDayCount(battle: WorldBattleRow): number {
  const lockDate = new Date(battle.lock_prep_at);
  const createdDate = new Date(battle.created_at);
  // World battlers are pros — they always show up with at least a few days of
  // work in the book, even on short-notice bookings.
  return Math.min(
    8,
    Math.max(
      4,
      Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    )
  );
}

export async function runWorldBattle(
  battle: WorldBattleRow,
  supabase: any
): Promise<RunWorldBattleResult> {
  const prepDays = prepDayCount(battle);

  // 1. Auto-generate balanced prep for BOTH AI battlers (same day count —
  //    the matchup stays fair; attributes and variance decide the night).
  for (const battlerId of [battle.battler_player_id, battle.battler_ai_id]) {
    const { data: existing } = await supabase
      .from('prep_blocks')
      .select('id')
      .eq('battle_id', battle.id)
      .eq('battler_id', battlerId)
      .limit(1);

    if (!existing || existing.length === 0) {
      const blocks = generateWorldPrep(battlerId, battle.id, prepDays);
      await supabase.from('prep_blocks').insert(blocks);
    }
  }

  // 2. Run the simulation. The engine is symmetric and self-contained:
  //    rounds/segments, ELO movement, payouts, progression and the recap
  //    article all fire inside simulateBattle.
  await simulateBattle(battle.id, supabase);

  // 3. Read back the verdict for the tick's report.
  const { data: completed } = await supabase
    .from('battles')
    .select('winner_battler_id, verdict')
    .eq('id', battle.id)
    .single();

  return {
    winnerBattlerId: completed?.winner_battler_id ?? null,
    verdict: completed?.verdict ?? null,
  };
}
