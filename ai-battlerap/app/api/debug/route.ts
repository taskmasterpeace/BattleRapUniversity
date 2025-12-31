import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all battles
  const { data: battles } = await supabase
    .from('battles')
    .select(`
      id,
      status,
      scheduled_at,
      player:battler_player_id(stage_name),
      ai:battler_ai_id(stage_name)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get all battlers
  const { data: battlers } = await supabase
    .from('battlers')
    .select('id, stage_name, is_ai, user_id')
    .order('created_at');

  // Get all rankings
  const { data: rankings } = await supabase
    .from('rankings')
    .select(`
      battler_id,
      rating,
      wins,
      losses,
      battler:battler_id(stage_name)
    `)
    .order('rating', { ascending: false });

  return NextResponse.json({
    battles: battles || [],
    battlers: battlers || [],
    rankings: rankings || [],
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
