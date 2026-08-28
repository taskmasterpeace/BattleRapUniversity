import type { SupabaseClient } from '@supabase/supabase-js';

export type LifeEventBattleContext = { opponent?: string; league?: string } | null;

/**
 * Prepare pending life events for display:
 *  1. Dedup by template_code + battle_id — collapse the exact same event queued
 *     twice, but keep two losses to two different opponents as two distinct beats.
 *  2. Attach { opponent, league } from each event's battle so same-template events
 *     (e.g. two "Rock Bottom" 3-0 losses) read as their own moment instead of
 *     looking like identical duplicate cards.
 *
 * Shared by the /life-events page, /api/life-events, and the dashboard widget so
 * all three agree on the count and show the same context.
 */
export async function prepareLifeEvents(
  supabase: SupabaseClient,
  events: any[]
): Promise<any[]> {
  const seen = new Set<string>();
  const deduped = (events || []).filter((e: any) => {
    if (!e?.template_code) return true;
    const key = `${e.template_code}|${e.battle_id ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const battleIds = [...new Set(deduped.map((e: any) => e.battle_id).filter(Boolean))] as string[];
  const ctx = new Map<string, LifeEventBattleContext>();
  if (battleIds.length) {
    const { data: battles } = await supabase
      .from('battles')
      .select('id, battler_ai_id, league_id')
      .in('id', battleIds);
    const oppIds = [...new Set((battles || []).map((b: any) => b.battler_ai_id).filter(Boolean))];
    const lgIds = [...new Set((battles || []).map((b: any) => b.league_id).filter(Boolean))];
    const [oppRes, lgRes] = await Promise.all([
      oppIds.length
        ? supabase.from('battlers').select('id, stage_name').in('id', oppIds)
        : Promise.resolve({ data: [] as any[] }),
      lgIds.length
        ? supabase.from('leagues').select('id, name').in('id', lgIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const oppName = new Map((oppRes.data || []).map((o: any) => [o.id, o.stage_name]));
    const lgName = new Map((lgRes.data || []).map((l: any) => [l.id, l.name]));
    for (const b of battles || []) {
      ctx.set(b.id, { opponent: oppName.get(b.battler_ai_id), league: lgName.get(b.league_id) });
    }
  }

  return deduped.map((e: any) => ({
    ...e,
    battle_context: e.battle_id ? ctx.get(e.battle_id) ?? null : null,
  }));
}
