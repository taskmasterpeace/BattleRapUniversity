import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { getVirtualNow } from '@/lib/dev/timeManipulation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Get player's battler
  const { data: battler } = await supabase
    .from('battlers')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!battler) {
    return NextResponse.json({ error: 'No battler found' }, { status: 404 });
  }

  // Get battle with league info
  const { data: battle } = await supabase
    .from('battles')
    .select(`
      *,
      league:leagues(*),
      ai_battler:battler_ai_id(id, stage_name, tier, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (!battle) {
    return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
  }

  // Verify ownership
  if (battle.battler_player_id !== battler.id) {
    return NextResponse.json({ error: 'Not your battle' }, { status: 403 });
  }

  // Get existing prep blocks
  const { data: prepBlocks } = await supabase
    .from('prep_blocks')
    .select('*')
    .eq('battle_id', id)
    .eq('battler_id', battler.id)
    .order('day_index');

  // Calculate total prep days
  const lockDate = new Date(battle.lock_prep_at);
  const createdDate = new Date(battle.created_at);
  const totalPrepDays = Math.max(1, Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

  return NextResponse.json({
    battle,
    prepBlocks: prepBlocks || [],
    totalPrepDays,
    lockPrepAt: battle.lock_prep_at,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { day_index, focus } = body;

  // Validate input
  if (typeof day_index !== 'number' || day_index < 1) {
    return NextResponse.json({ error: 'Invalid day_index' }, { status: 400 });
  }

  const validFocus = ['research', 'writing', 'performance', 'life', 'rest'];
  if (!validFocus.includes(focus)) {
    return NextResponse.json({ error: 'Invalid focus' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // Get player's battler
  const { data: battler } = await supabase
    .from('battlers')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!battler) {
    return NextResponse.json({ error: 'No battler found' }, { status: 404 });
  }

  // Get battle
  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', id)
    .single();

  if (!battle) {
    return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
  }

  // Verify ownership
  if (battle.battler_player_id !== battler.id) {
    return NextResponse.json({ error: 'Not your battle' }, { status: 403 });
  }

  // Check if prep is locked (uses virtual time in dev mode)
  const now = getVirtualNow();
  const lockDate = new Date(battle.lock_prep_at);
  if (now >= lockDate) {
    return NextResponse.json({ error: 'Prep is locked' }, { status: 400 });
  }

  // Validate day_index is within range
  const createdDate = new Date(battle.created_at);
  const totalPrepDays = Math.max(1, Math.ceil((lockDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

  if (day_index > totalPrepDays) {
    return NextResponse.json({ error: 'Invalid day_index' }, { status: 400 });
  }

  // Upsert prep block
  const { data: prepBlock, error } = await supabase
    .from('prep_blocks')
    .upsert(
      {
        battle_id: id,
        battler_id: battler.id,
        day_index,
        focus,
        auto_generated: false,
      },
      {
        onConflict: 'battle_id,battler_id,day_index',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error updating prep block:', error);
    return NextResponse.json({ error: 'Failed to update prep' }, { status: 500 });
  }

  return NextResponse.json({ prepBlock });
}
