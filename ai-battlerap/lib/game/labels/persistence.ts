/**
 * Sticky-label persistence — the DB adapter between the pure lifecycle reducer
 * (lifecycle.ts) and the `battler_labels` ledger. Service-role writes only.
 *
 * Two entry points, both defensive (a failure here never breaks battle/creation):
 *   - applyGenerationLabels: bake labels at battler creation (currently CITY MADE).
 *   - applyBattleLabels: after a completed battle, advance/decay every stored
 *     label one tick and pin whatever the fired life events map to.
 */

import {
  assignGenerationLabels, mapEventToPin, advanceLabels, pinOrReinforce, newStoredLabel,
  type StoredLabel, type PinRequest,
} from './lifecycle';

type Sb = any; // service-role Supabase client

function rowToStored(r: any): StoredLabel {
  return {
    key: r.key,
    tier: r.tier,
    tone: r.tone,
    heat: r.heat,
    processedBattleCount: r.processed_battle_count ?? 0,
    evidenceCount: r.evidence_count ?? 0,
    qualifyingEvidenceCount: r.qualifying_evidence_count ?? 0,
    status: r.status,
    pinnedAt: r.pinned_at ?? undefined,
    lastReinforcedAt: r.last_reinforced_at ?? undefined,
    source: r.source ?? undefined,
  };
}

function storedToRow(battlerId: string, s: StoredLabel) {
  return {
    battler_id: battlerId,
    key: s.key,
    tier: s.tier,
    tone: s.tone,
    heat: s.heat,
    processed_battle_count: s.processedBattleCount,
    evidence_count: s.evidenceCount,
    qualifying_evidence_count: s.qualifyingEvidenceCount,
    status: s.status,
    source: s.source ?? {},
    pinned_at: s.pinnedAt ?? new Date().toISOString(),
    last_reinforced_at: s.lastReinforcedAt ?? new Date().toISOString(),
    retired_at: s.status === 'retired' ? new Date().toISOString() : null,
  };
}

async function upsertLabels(supabase: Sb, battlerId: string, stored: StoredLabel[]): Promise<void> {
  if (stored.length === 0) return;
  const rows = stored.map((s) => storedToRow(battlerId, s));
  const { error } = await supabase.from('battler_labels').upsert(rows, { onConflict: 'battler_id,key' });
  if (error) console.error('[labels] upsert failed:', error.message);
}

/** Bake labels at character creation. */
export async function applyGenerationLabels(
  supabase: Sb,
  battlerId: string,
  input: { origin?: string | null; cityId?: string | null; cityName?: string | null; cityStyle?: string | null },
): Promise<void> {
  try {
    const pins = assignGenerationLabels(input);
    const stored = pins.map((p) => newStoredLabel(p, new Date().toISOString())).filter(Boolean) as StoredLabel[];
    await upsertLabels(supabase, battlerId, stored);
  } catch (e: any) {
    console.error('[labels] applyGenerationLabels failed:', e?.message ?? e);
  }
}

/**
 * Post-battle: advance every stored label one tick (decay + choke recovery) and
 * pin whatever the life events fired THIS battle map to.
 */
export async function applyBattleLabels(
  supabase: Sb,
  battlerId: string,
  battleId: string,
  opts: { choked: boolean },
): Promise<void> {
  try {
    // The decay clock = this battler's completed-battle count.
    const { count } = await supabase
      .from('battles')
      .select('id', { count: 'exact', head: true })
      .or(`battler_player_id.eq.${battlerId},battler_ai_id.eq.${battlerId}`)
      .eq('status', 'completed');
    const completedCount = count ?? 0;

    const { data: rows } = await supabase.from('battler_labels').select('*').eq('battler_id', battlerId);
    let stored: StoredLabel[] = (rows ?? []).map(rowToStored);

    // Advance: a clean (no-choke) battle feeds CHOKER recovery.
    const clean = opts.choked ? 0 : 1;
    stored = advanceLabels(stored, completedCount, { cleanBattles: clean, cleanQualifying: clean });

    // Pin from the life events that fired this battle. At finalize the event is still
    // PENDING — `chosen_option` is null and there is no publicity column — so choice
    // and publicity aren't known yet. Intrinsically-public labels (CAREER_CRISIS→WASHED,
    // CHOKE_IN_BIG_BATTLE→CHOKER, ROBBED…) pin here from template_code alone; the
    // choice/publicity-gated ones (taking_any_check, battling_hurt, own/hide choke
    // variants) belong to a resolve-time pin path (not built yet — see reputation memo).
    const { data: events } = await supabase
      .from('battler_life_events')
      .select('template_code, chosen_option')
      .eq('battler_id', battlerId)
      .eq('battle_id', battleId);
    const now = new Date().toISOString();
    for (const e of events ?? []) {
      const pin: PinRequest | null = mapEventToPin(e.template_code, {
        choice: e.chosen_option ?? undefined, // top-level column; null until resolved
        isPublic: undefined,                  // no publicity signal exists at finalize
      });
      if (!pin) continue;
      pin.source = { ...(pin.source ?? {}), battleId };
      // Idempotent per (battle, label): re-running this battle can't re-reinforce
      // a label it already pinned (which would inflate heat + reset recovery).
      const existing = stored.find((l) => l.key === pin.key);
      if (existing && (existing.source as any)?.battleId === battleId) continue;
      stored = pinOrReinforce(stored, pin, now);
    }

    // Every label is now "as of" this completed-battle count. Set it on all of
    // them so a freshly-pinned label (pbc 0) doesn't take an entire career's decay
    // on the next battle.
    stored = stored.map((s) => ({ ...s, processedBattleCount: completedCount }));

    await upsertLabels(supabase, battlerId, stored);
  } catch (e: any) {
    console.error('[labels] applyBattleLabels failed:', e?.message ?? e);
  }
}
