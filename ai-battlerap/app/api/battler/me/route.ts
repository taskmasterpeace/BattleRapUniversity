import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { getVirtualNowISO } from '@/lib/dev/timeManipulation';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();

  // Get battler
  const { data: battler } = await supabase
    .from('battlers')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .maybeSingle();

  if (!battler) {
    return NextResponse.json({ hasBattler: false });
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

  // Get league info
  const { data: league } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', battler.primary_league_id)
    .single();

  // Get next upcoming battle (uses virtual time in dev mode)
  const { data: nextBattle } = await supabase
    .from('battles')
    .select(`
      *,
      league:leagues(*),
      ai_battler:battler_ai_id(id, stage_name, tier)
    `)
    .eq('battler_player_id', battler.id)
    .eq('status', 'accepted')
    .gt('scheduled_at', getVirtualNowISO())
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    hasBattler: true,
    battler,
    attributes,
    ranking,
    league,
    nextBattle,
  });
}
