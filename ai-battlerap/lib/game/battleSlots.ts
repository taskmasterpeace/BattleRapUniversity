/**
 * Daily AI Battle Slots
 *
 * Every battler gets BASE_SLOTS_PER_DAY AI battles per day. Extra slots can be
 * earned the same day (max MAX_BONUS_SLOTS_PER_DAY) by winning battles or by
 * walking on stage with a fully player-planned prep calendar.
 *
 * Storage (battlers table):
 *  - slots_used_today    INTEGER — battles started today
 *  - bonus_battle_slots  INTEGER — bonus slots earned today (reset daily)
 *  - slots_reset_at      DATE    — the day the counters belong to (lazy reset)
 *
 * Resets are LAZY: nothing runs at midnight. Whenever a slot is read, consumed,
 * or awarded, a stale `slots_reset_at` (< today) means the counters are treated
 * as zero and rewritten for the current day. Bonus slots do NOT carry over.
 *
 * PvP battles (both battlers human) never consume slots — only AI matches
 * burn daily stage time.
 */

export const BASE_SLOTS_PER_DAY = 3;
export const MAX_BONUS_SLOTS_PER_DAY = 2;

export type SlotColumns = {
  bonus_battle_slots?: number | null;
  slots_reset_at?: string | null; // 'YYYY-MM-DD' (Postgres DATE)
  slots_used_today?: number | null;
};

export type SlotStatus = {
  /** Slots consumed today */
  used: number;
  /** Base daily allowance */
  base: number;
  /** Bonus slots earned today */
  bonus: number;
  /** Slots still available today */
  remaining: number;
  /** ISO timestamp of the next daily reset (midnight UTC) */
  resetsAt: string;
};

export type BonusReason = 'win' | 'full_prep';

/** Current day as a Postgres-DATE-compatible string (UTC). */
export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** ISO timestamp of the next daily reset (upcoming midnight UTC). */
export function nextResetISO(): string {
  const next = new Date();
  next.setUTCHours(24, 0, 0, 0);
  return next.toISOString();
}

/**
 * Pure read of a battler's slot state with lazy-reset semantics applied:
 * if the stored counters belong to a previous day they count as zero.
 * Safe to call on the client (no DB access).
 */
export function getSlotStatus(battler: SlotColumns): SlotStatus {
  const today = todayDateString();
  // Postgres DATE serializes as 'YYYY-MM-DD'; lexical compare works.
  const stale = !battler.slots_reset_at || battler.slots_reset_at < today;

  const used = stale ? 0 : Math.max(0, battler.slots_used_today ?? 0);
  const bonus = stale
    ? 0
    : Math.min(MAX_BONUS_SLOTS_PER_DAY, Math.max(0, battler.bonus_battle_slots ?? 0));

  return {
    used,
    base: BASE_SLOTS_PER_DAY,
    bonus,
    remaining: Math.max(0, BASE_SLOTS_PER_DAY + bonus - used),
    resetsAt: nextResetISO(),
  };
}

async function fetchSlotColumns(supabase: any, battlerId: string): Promise<SlotColumns | null> {
  const { data, error } = await supabase
    .from('battlers')
    .select('bonus_battle_slots, slots_reset_at, slots_used_today')
    .eq('id', battlerId)
    .single();
  if (error) {
    console.error(`battleSlots: failed to read slots for battler ${battlerId}:`, error.message);
    return null;
  }
  return data as SlotColumns;
}

export type ConsumeResult =
  | { ok: true; status: SlotStatus }
  | { ok: false; status: SlotStatus; error: 'no_slots_remaining' }
  | { ok: false; status: null; error: 'battler_not_found' | 'update_failed' };

/**
 * Consume one daily battle slot. Lazy-resets stale counters first
 * (new day → used=0, bonus=0). Fails without writing when nothing remains.
 */
export async function consumeSlot(supabase: any, battlerId: string): Promise<ConsumeResult> {
  const row = await fetchSlotColumns(supabase, battlerId);
  if (!row) return { ok: false, status: null, error: 'battler_not_found' };

  const status = getSlotStatus(row);
  if (status.remaining <= 0) {
    return { ok: false, status, error: 'no_slots_remaining' };
  }

  const { error } = await supabase
    .from('battlers')
    .update({
      slots_reset_at: todayDateString(),
      slots_used_today: status.used + 1,
      bonus_battle_slots: status.bonus,
    })
    .eq('id', battlerId);

  if (error) {
    console.error(`battleSlots: failed to consume slot for battler ${battlerId}:`, error.message);
    return { ok: false, status: null, error: 'update_failed' };
  }

  return {
    ok: true,
    status: { ...status, used: status.used + 1, remaining: status.remaining - 1 },
  };
}

/**
 * Refund a slot consumed today (e.g. the simulation crashed after the slot
 * was burned). Never goes below zero and never crosses a day boundary.
 */
export async function refundSlot(supabase: any, battlerId: string): Promise<void> {
  const row = await fetchSlotColumns(supabase, battlerId);
  if (!row) return;

  const status = getSlotStatus(row);
  if (status.used <= 0) return;

  await supabase
    .from('battlers')
    .update({
      slots_reset_at: todayDateString(),
      slots_used_today: status.used - 1,
      bonus_battle_slots: status.bonus,
    })
    .eq('id', battlerId);
}

/**
 * Award one bonus battle slot for today (cap MAX_BONUS_SLOTS_PER_DAY total).
 * Returns true if the bonus was granted, false if already capped.
 */
export async function awardBonusSlot(
  supabase: any,
  battlerId: string,
  reason: BonusReason
): Promise<boolean> {
  const row = await fetchSlotColumns(supabase, battlerId);
  if (!row) return false;

  const status = getSlotStatus(row);
  if (status.bonus >= MAX_BONUS_SLOTS_PER_DAY) {
    return false;
  }

  const { error } = await supabase
    .from('battlers')
    .update({
      slots_reset_at: todayDateString(),
      slots_used_today: status.used,
      bonus_battle_slots: status.bonus + 1,
    })
    .eq('id', battlerId);

  if (error) {
    console.error(
      `battleSlots: failed to award bonus slot (${reason}) for battler ${battlerId}:`,
      error.message
    );
    return false;
  }

  console.log(`battleSlots: +1 bonus slot for battler ${battlerId} (${reason})`);
  return true;
}
