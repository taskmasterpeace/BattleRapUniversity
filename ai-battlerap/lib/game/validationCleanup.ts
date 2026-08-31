/**
 * Validation-residue cleanup — the balance suites create throwaway battlers
 * (`Test_*` / `Opponent_*`) and battles per run. Left behind, they flood the
 * roster (2,225 rows found 2026-08-31) and poison matchmaking/admin views.
 * Every validation entry point MUST call this in a finally block.
 */
export async function cleanupValidationResidue(supabase: any): Promise<void> {
  const { data: junk } = await supabase
    .from('battlers')
    .select('id')
    .or('stage_name.like.Test\\_%,stage_name.like.Opponent\\_%');

  const junkIds: string[] = (junk ?? []).map((b: { id: string }) => b.id);
  if (junkIds.length === 0) return;

  const CHUNK = 100;
  const battleIds: string[] = [];
  for (let i = 0; i < junkIds.length; i += CHUNK) {
    const ids = junkIds.slice(i, i + CHUNK);
    const list = ids.join(',');
    const { data: battles } = await supabase
      .from('battles')
      .select('id')
      .or(`battler_ai_id.in.(${list}),battler_player_id.in.(${list})`);
    for (const b of battles ?? []) battleIds.push(b.id);
  }

  // Clear NO-ACTION references onto the doomed battles, then delete them
  // (battle_rounds/segments/prep cascade with the battle).
  for (let i = 0; i < battleIds.length; i += CHUNK) {
    const ids = battleIds.slice(i, i + CHUNK);
    await supabase.from('badge_earned').delete().in('battle_id', ids);
    await supabase.from('battler_life_events').update({ battle_id: null }).in('battle_id', ids);
    await supabase.from('public_knowledge').update({ related_battle_id: null }).in('related_battle_id', ids);
    await supabase.from('battles').delete().in('id', ids);
  }

  // Clear NO-ACTION references onto the battlers, then delete them
  // (attributes/rankings/etc. cascade).
  for (let i = 0; i < junkIds.length; i += CHUNK) {
    const ids = junkIds.slice(i, i + CHUNK);
    await supabase.from('battle_rounds').delete().in('battler_id', ids);
    await supabase.from('battle_segments').delete().in('battler_id', ids);
    await supabase
      .from('battle_intelligence')
      .delete()
      .or(`researcher_battler_id.in.(${ids.join(',')}),target_battler_id.in.(${ids.join(',')})`);
    await supabase.from('battlers').delete().in('id', ids);
  }

  console.log(`\n[cleanup] removed ${junkIds.length} validation battlers + ${battleIds.length} battles`);
}
