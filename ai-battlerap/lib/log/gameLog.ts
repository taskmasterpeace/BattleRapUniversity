/**
 * Game event logger (owner ask 2026-09-01: "we need the logs captured so you
 * can examine them"). Fire-and-forget structured rows into game_events —
 * logging must NEVER break gameplay, so every failure is swallowed after a
 * console note.
 *
 * Event vocabulary (keep this list current — it's the query surface):
 *   offer.accepted / offer.declined
 *   battle.mode_chosen        { mode, context }
 *   pen.round_written         { round, content, delivery, performance, forecast }
 *   battle.round_performed    { round, pressure, audible, player, ai, winner }
 *   battle.finalized          { verdict, winnerId, decisionType }
 *   error                     { where, message, detail }
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type GameEventRefs = {
  battleId?: string | null;
  battlerId?: string | null;
  userId?: string | null;
};

export async function logGameEvent(
  supabase: SupabaseClient,
  eventType: string,
  refs: GameEventRefs,
  payload: Record<string, unknown> = {}
): Promise<void> {
  try {
    const { error } = await supabase.from('game_events').insert({
      event_type: eventType,
      battle_id: refs.battleId ?? null,
      battler_id: refs.battlerId ?? null,
      user_id: refs.userId ?? null,
      payload,
    });
    if (error) console.error(`[gameLog] ${eventType} failed:`, error.message);
  } catch (err) {
    console.error(`[gameLog] ${eventType} threw:`, err);
  }
}
