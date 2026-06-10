/**
 * PvP battle-execution pipeline.
 *
 * Symmetric version of lib/game/runBattle.ts for battles between two HUMAN
 * players (battles.is_pvp = true). Both sides prep independently; this
 * pipeline backfills missing prep for BOTH battlers, runs the (already
 * symmetric) simulation engine, applies progression + stress to BOTH human
 * battlers, and notifies BOTH users of the result.
 *
 * Deliberate differences from runBattleSimulation:
 *  - NO AI prep generation (both sides are human — weak prep speaks for itself)
 *  - NO fresh AI offer generation after the battle
 *  - NO bonus battle slots (PvP battles don't consume daily slots either)
 *  - Progression/stress run for BOTH battler ids
 *
 * Called from:
 *  - /api/battles/[id]/lockin       (when both sides have locked in)
 *  - /api/internal/run-due-battles  (cron: ghosting auto-resolves at scheduled_at)
 */
import { simulateBattle } from '@/lib/game/simulation';
import { updateBattlerStress } from '@/lib/game/stressManagement';
import { notifyBattleComplete } from '@/lib/services/notificationService';

type PvpBattleRow = {
  id: string;
  battler_player_id: string; // CHALLENGER's battler
  battler_ai_id: string; // CHALLENGED player's battler (is_ai = false)
  lock_prep_at: string;
  created_at: string;
};

export type RunPvpBattleResult = {
  challengerNoShow: boolean;
  challengedNoShow: boolean;
  winnerBattlerId: string | null;
  verdict: string | null;
};

function prepDayCount(battle: PvpBattleRow): number {
  const lockDate = new Date(battle.lock_prep_at);
  const createdDate = new Date(battle.created_at);
  return Math.max(
    1,
    Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  );
}

/**
 * Ensure a battler has a full prep calendar before simulation.
 *
 * - Zero prep blocks → "winging it" default plan (auto_generated), returns true (no-show)
 * - Partial prep     → missing days backfilled with 'rest', returns false
 */
async function backfillPrepForBattler(
  supabase: any,
  battle: PvpBattleRow,
  battlerId: string
): Promise<boolean> {
  const prepDays = prepDayCount(battle);

  const { data: blocks } = await supabase
    .from('prep_blocks')
    .select('day_index')
    .eq('battle_id', battle.id)
    .eq('battler_id', battlerId);

  if (!blocks || blocks.length === 0) {
    // No-show: never opened the prep planner. Same "winging it" pattern as
    // the PvE pipeline so penalties are consistent.
    const defaultPattern = ['writing', 'performance', 'rest', 'writing', 'research', 'rest'];
    const autoBlocks = [];
    for (let i = 1; i <= prepDays; i++) {
      autoBlocks.push({
        battle_id: battle.id,
        battler_id: battlerId,
        day_index: i,
        focus: defaultPattern[(i - 1) % defaultPattern.length],
        auto_generated: true,
      });
    }
    if (autoBlocks.length > 0) {
      await supabase.from('prep_blocks').insert(autoBlocks);
    }
    return true;
  }

  // Partial prep: their choice to leave gaps — backfill with 'rest'.
  const filledSet = new Set(blocks.map((r: any) => r.day_index));
  const backfill = [];
  for (let i = 1; i <= prepDays; i++) {
    if (!filledSet.has(i)) {
      backfill.push({
        battle_id: battle.id,
        battler_id: battlerId,
        day_index: i,
        focus: 'rest',
        auto_generated: true,
      });
    }
  }
  if (backfill.length > 0) {
    await supabase.from('prep_blocks').insert(backfill);
  }
  return false;
}

export async function runPvpBattle(
  battle: PvpBattleRow,
  supabase: any
): Promise<RunPvpBattleResult> {
  const challengerId = battle.battler_player_id;
  const challengedId = battle.battler_ai_id;

  // 1. Backfill prep for BOTH humans (no AI prep generation in PvP).
  const challengerNoShow = await backfillPrepForBattler(supabase, battle, challengerId);
  const challengedNoShow = await backfillPrepForBattler(supabase, battle, challengedId);

  // no_show_player only exists for the battler_player_id side (the challenger).
  // For the challenged side, weak auto-prep speaks for itself in the sim.
  if (challengerNoShow) {
    await supabase.from('battles').update({ no_show_player: true }).eq('id', battle.id);
  }

  // 2. Run the simulation — the engine loads both sides' attributes/prep by
  //    battler id and is fully symmetric.
  await simulateBattle(battle.id, supabase);

  // 3. Progression for BOTH human battlers (attributes, badges, XP).
  const { applyAttributeProgression } = await import('@/lib/game/progression');
  for (const battlerId of [challengerId, challengedId]) {
    try {
      await applyAttributeProgression(battle.id, supabase, battlerId);
    } catch (progressionError) {
      console.error(`Error applying PvP progression for battler ${battlerId}:`, progressionError);
    }
  }

  // 4. Stress update for BOTH battlers.
  for (const battlerId of [challengerId, challengedId]) {
    try {
      await updateBattlerStress(supabase, battlerId);
    } catch (stressError) {
      console.error(`Error updating stress for battler ${battlerId}:`, stressError);
    }
  }

  // 5. Result notifications to BOTH players.
  let winnerBattlerId: string | null = null;
  let verdict: string | null = null;
  try {
    const [{ data: completed }, { data: battlers }] = await Promise.all([
      supabase
        .from('battles')
        .select('winner_battler_id, verdict')
        .eq('id', battle.id)
        .single(),
      supabase
        .from('battlers')
        .select('id, stage_name')
        .in('id', [challengerId, challengedId]),
    ]);

    winnerBattlerId = completed?.winner_battler_id ?? null;
    verdict = completed?.verdict ?? null;

    const nameOf = new Map<string, string>(
      (battlers || []).map((b: any) => [b.id, b.stage_name])
    );

    for (const battlerId of [challengerId, challengedId]) {
      const opponentId = battlerId === challengerId ? challengedId : challengerId;
      await notifyBattleComplete(
        supabase,
        battlerId,
        battle.id,
        nameOf.get(opponentId) || 'your opponent',
        winnerBattlerId === battlerId,
        verdict || 'decision'
      );
    }
  } catch (notifyError) {
    console.error('Error sending PvP result notifications:', notifyError);
  }

  return { challengerNoShow, challengedNoShow, winnerBattlerId, verdict };
}
