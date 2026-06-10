/**
 * POST /api/travel — move the player's battler to another city.
 *
 * Body: { cityId: string }
 *
 * Travel is priced by the destination's scene_size (travel_costs table,
 * default $200 when a size has no row). Deducts the cost, updates
 * current_city_id, and records the trip in battler_travels.
 *
 * Players who have never set a city (current_city_id IS NULL) can still
 * travel: the trip is logged from their hometown (or nowhere) — cost applies.
 */
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/server';
import { createServiceClient } from '@/lib/auth/roles';

const DEFAULT_TRAVEL_COST = 200;

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { cityId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const cityId = body.cityId;
  if (!cityId || typeof cityId !== 'string') {
    return NextResponse.json({ error: 'cityId is required' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Player's battler
  const { data: battler } = await supabase
    .from('battlers')
    .select('id, stage_name, current_city_id, hometown_city_id, current_balance')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!battler) {
    return NextResponse.json({ error: 'No battler found for this account' }, { status: 404 });
  }

  // Destination city
  const { data: city } = await supabase
    .from('cities')
    .select('id, name, state, scene_size')
    .eq('id', cityId)
    .single();

  if (!city) {
    return NextResponse.json({ error: 'City not found' }, { status: 404 });
  }

  if (battler.current_city_id === city.id) {
    return NextResponse.json(
      { error: `You are already in ${city.name}` },
      { status: 400 }
    );
  }

  // Travel cost by destination scene size (data-driven so ops can tune)
  const { data: costRow } = await supabase
    .from('travel_costs')
    .select('cost')
    .eq('scene_size', city.scene_size ?? '')
    .maybeSingle();

  const cost = costRow?.cost ?? DEFAULT_TRAVEL_COST;
  const balance = battler.current_balance ?? 0;

  if (balance < cost) {
    return NextResponse.json(
      {
        error: `Not enough cash — travel to ${city.name} costs $${cost} and you have $${balance}`,
        code: 'insufficient_funds',
        cost,
        balance,
      },
      { status: 400 }
    );
  }

  const newBalance = balance - cost;

  // First trip for a battler with no current city counts as relocating
  // from their hometown (or from nowhere if they never picked one).
  const fromCityId = battler.current_city_id ?? battler.hometown_city_id ?? null;

  const { error: updateError } = await supabase
    .from('battlers')
    .update({ current_city_id: city.id, current_balance: newBalance })
    .eq('id', battler.id);

  if (updateError) {
    console.error('Travel update failed:', updateError);
    return NextResponse.json({ error: 'Failed to travel' }, { status: 500 });
  }

  const { error: travelLogError } = await supabase.from('battler_travels').insert({
    battler_id: battler.id,
    from_city_id: fromCityId,
    to_city_id: city.id,
    purpose: 'visit',
  });

  if (travelLogError) {
    // Non-fatal: the move itself succeeded, history is flavor
    console.error('Failed to log travel:', travelLogError);
  }

  return NextResponse.json({
    city: { id: city.id, name: city.name, state: city.state },
    balance: newBalance,
    cost,
  });
}
