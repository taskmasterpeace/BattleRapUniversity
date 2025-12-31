import { createServerSupabaseClient } from '@/lib/db/server';
import type { Battler, BattlerAttributes, Ranking } from '@/lib/models';

export async function getPlayerBattler() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, battler: null, attributes: null, ranking: null };

  const { data: battler } = await supabase
    .from('battlers')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .maybeSingle();

  if (!battler) {
    return { user, battler: null, attributes: null, ranking: null };
  }

  // Get attributes
  const { data: attributes } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', battler.id)
    .single();

  // Get ranking
  const { data: ranking } = await supabase
    .from('rankings')
    .select('*')
    .eq('battler_id', battler.id)
    .single();

  return {
    user,
    battler: battler as Battler,
    attributes: attributes as BattlerAttributes | null,
    ranking: ranking as Ranking | null,
  };
}
