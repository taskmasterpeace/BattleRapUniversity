/**
 * Game-Day — the action-based career clock.
 *
 * TIME_SYSTEM_DECISION.md picks "Option A — pure action-based time" (Persona-5
 * style): the career clock advances ONLY when the player acts (preps a day,
 * battles, rests, explicitly advances). There is NO wall-clock tick. Each player
 * owns an independent `battlers.game_day` counter, and every advance is logged
 * to `game_day_history` so the career timeline can be reconstructed.
 *
 * This layer is ADDITIVE. The existing real-time `scheduled_at` / getVirtualNow()
 * machinery keeps running untouched; `game_day` is a parallel per-player counter
 * that features can migrate onto over time.
 *
 * Design rules:
 *  - Pure bookkeeping. Every helper is defensive — a missing battler yields 0
 *    rather than throwing, so a stray call can never break a finalize or a route.
 *  - Pass a SERVICE-ROLE client for advanceGameDay(): `game_day_history` is
 *    RLS-locked to the service role, and the `battlers` update should bypass
 *    user-scoped RLS. getGameDay() is a plain read and works with either client.
 *
 * Columns/tables come from migration `20260901020000_game_time.sql`.
 */

/**
 * Known action types that advance the clock. Kept open (string) so callers can
 * introduce new action kinds without a code change here.
 */
export type GameDayActionType =
  | 'prep_day'
  | 'battle'
  | 'rest'
  | 'life_event'
  | 'travel'
  | 'advance'
  | (string & {});

/**
 * Career tier labels, ordered Rookie → GOAT. See getCareerTier() for thresholds.
 */
export type CareerTier =
  | 'Rookie'
  | 'Up-and-Comer'
  | 'Established'
  | 'Elite'
  | 'Legend'
  | 'GOAT';

/**
 * Read a battler's current game day.
 *
 * Returns 0 when the battler is missing, the column is null, or the read fails —
 * never throws.
 */
export async function getGameDay(supabase: any, battlerId: string): Promise<number> {
  if (!battlerId) return 0;

  const { data, error } = await supabase
    .from('battlers')
    .select('game_day')
    .eq('id', battlerId)
    .maybeSingle();

  if (error || !data) return 0;
  return data.game_day ?? 0;
}

/**
 * Advance a battler's game day by `days` (default 1), log the advance to
 * `game_day_history`, and return the NEW game day.
 *
 * Behaviour:
 *  - Missing battler (or a failed read) → returns 0 and writes nothing.
 *  - `days` is coerced to a non-negative integer; a 0-day "advance" still logs
 *    a history row (useful for recording an action that didn't move the clock).
 *  - If the counter update fails, returns the unchanged current value.
 *  - If only the history insert fails, the counter still moved — logged, not
 *    thrown.
 *
 * Note on concurrency: this reads-then-writes rather than doing an atomic SQL
 * increment (supabase-js can't reference the column in an update without an
 * RPC). Two truly-simultaneous advances of the SAME battler could collide, but
 * a player only advances their own battler through their own sequential actions,
 * so this is acceptable for a per-player action counter.
 *
 * @param supabase   Service-role client (see module note).
 * @param battlerId  The battler whose clock advances.
 * @param actionType What the player did (e.g. 'prep_day', 'battle', 'advance').
 * @param note       Optional human-readable context for the history row.
 * @param days       How many game-days to advance (default 1).
 */
export async function advanceGameDay(
  supabase: any,
  battlerId: string,
  actionType: GameDayActionType,
  note?: string,
  days: number = 1
): Promise<number> {
  if (!battlerId) return 0;

  const step = Number.isFinite(days) ? Math.max(0, Math.trunc(days)) : 1;

  // Read current value AND confirm the battler exists in one shot.
  const { data: row, error: readError } = await supabase
    .from('battlers')
    .select('game_day')
    .eq('id', battlerId)
    .maybeSingle();

  if (readError || !row) {
    if (readError) {
      console.error('advanceGameDay: read failed for battler', battlerId, readError);
    }
    // Missing battler — never throw, never advance.
    return 0;
  }

  const current = row.game_day ?? 0;
  const next = current + step;

  const { error: updateError } = await supabase
    .from('battlers')
    .update({ game_day: next })
    .eq('id', battlerId);

  if (updateError) {
    console.error('advanceGameDay: failed to update game_day for battler', battlerId, updateError);
    return current; // counter did not move
  }

  const { error: historyError } = await supabase.from('game_day_history').insert({
    battler_id: battlerId,
    game_day: next,
    action_type: actionType,
    note: note ?? null,
  });

  if (historyError) {
    // The counter advanced; only the audit row failed. Log and carry on.
    console.error('advanceGameDay: failed to log history for battler', battlerId, historyError);
  }

  return next;
}

/**
 * Map a game-day count to a career tier label.
 *
 * Thresholds are ACTION-based (each advance ≈ one meaningful player action) and
 * tuned so a full ~150-220-action career walks Rookie → GOAT:
 *
 *   Rookie         0  – 29
 *   Up-and-Comer   30 – 89
 *   Established    90 – 179
 *   Elite         180 – 299
 *   Legend        300 – 449
 *   GOAT          450+
 *
 * Pure and total: any non-finite input is treated as 0 (→ 'Rookie').
 */
export function getCareerTier(gameDay: number): CareerTier {
  const d = Number.isFinite(gameDay) ? gameDay : 0;

  if (d < 30) return 'Rookie';
  if (d < 90) return 'Up-and-Comer';
  if (d < 180) return 'Established';
  if (d < 300) return 'Elite';
  if (d < 450) return 'Legend';
  return 'GOAT';
}
