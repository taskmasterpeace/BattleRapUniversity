/**
 * POST /api/crew/recruit — recruit a local AI battler into your crew.
 *
 * Body: { battlerId: string }
 *
 * Recruiting is IN-PERSON: your battler must currently be in the same city
 * as the target. Max 3 crew members. Cost scales with the target's tier
 * (low 200 / mid 500 / top 1500 / god 5000). The recruit's specialty is
 * derived from their best stat group and contributes one extra prep day
 * per battle.
 */
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/server';
import { createServiceClient } from '@/lib/auth/roles';
import {
  MAX_CREW_SIZE,
  recruitCostForTier,
  deriveSpecialty,
} from '@/lib/game/crew';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { battlerId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const targetId = body.battlerId;
  if (!targetId || typeof targetId !== 'string') {
    return NextResponse.json({ error: 'battlerId is required' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Player's battler
  const { data: player } = await supabase
    .from('battlers')
    .select('id, stage_name, current_city_id, current_balance')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!player) {
    return NextResponse.json({ error: 'No battler found for this account' }, { status: 404 });
  }

  // Target battler
  const { data: target } = await supabase
    .from('battlers')
    .select('id, stage_name, tier, is_ai, current_city_id')
    .eq('id', targetId)
    .single();

  if (!target) {
    return NextResponse.json({ error: 'Battler not found' }, { status: 404 });
  }

  if (!target.is_ai || target.stage_name?.startsWith('Test_')) {
    return NextResponse.json({ error: 'This battler cannot be recruited' }, { status: 400 });
  }

  // In-person rule: you must be standing in the target's city
  if (!player.current_city_id || player.current_city_id !== target.current_city_id) {
    let cityName = 'their city';
    if (target.current_city_id) {
      const { data: targetCity } = await supabase
        .from('cities')
        .select('name')
        .eq('id', target.current_city_id)
        .maybeSingle();
      if (targetCity?.name) cityName = targetCity.name;
    }
    return NextResponse.json(
      {
        error: `Recruiting happens face to face — travel to ${cityName} to recruit ${target.stage_name}`,
        code: 'wrong_city',
      },
      { status: 400 }
    );
  }

  // Existing crew checks
  const { data: crew } = await supabase
    .from('crew_members')
    .select('id, member_battler_id')
    .eq('owner_battler_id', player.id);

  const currentCrew = crew ?? [];

  if (currentCrew.some((m) => m.member_battler_id === target.id)) {
    return NextResponse.json(
      { error: `${target.stage_name} is already in your crew` },
      { status: 400 }
    );
  }

  if (currentCrew.length >= MAX_CREW_SIZE) {
    return NextResponse.json(
      { error: `Your crew is full (${MAX_CREW_SIZE} max) — dismiss someone first`, code: 'crew_full' },
      { status: 400 }
    );
  }

  // Cost by tier
  const cost = recruitCostForTier(target.tier);
  const balance = player.current_balance ?? 0;

  if (balance < cost) {
    return NextResponse.json(
      {
        error: `Not enough cash — recruiting ${target.stage_name} costs $${cost} and you have $${balance}`,
        code: 'insufficient_funds',
        cost,
        balance,
      },
      { status: 400 }
    );
  }

  // Specialty from the target's best stat group
  const { data: attrs } = await supabase
    .from('battler_attributes')
    .select('writing, performance, personal, resilience')
    .eq('battler_id', target.id)
    .maybeSingle();

  const specialty = deriveSpecialty(attrs);

  const newBalance = balance - cost;

  const { error: balanceError } = await supabase
    .from('battlers')
    .update({ current_balance: newBalance })
    .eq('id', player.id);

  if (balanceError) {
    console.error('Recruit balance update failed:', balanceError);
    return NextResponse.json({ error: 'Failed to recruit' }, { status: 500 });
  }

  const { data: member, error: insertError } = await supabase
    .from('crew_members')
    .insert({
      owner_battler_id: player.id,
      member_battler_id: target.id,
      specialty,
      recruited_in_city_id: player.current_city_id,
      recruit_cost: cost,
    })
    .select('id, specialty, recruit_cost')
    .single();

  if (insertError) {
    // Refund — the deduction went through but the recruit didn't
    console.error('Crew insert failed, refunding:', insertError);
    await supabase.from('battlers').update({ current_balance: balance }).eq('id', player.id);
    return NextResponse.json({ error: 'Failed to recruit' }, { status: 500 });
  }

  return NextResponse.json({
    member: {
      id: member.id,
      battlerId: target.id,
      stageName: target.stage_name,
      specialty: member.specialty,
      cost: member.recruit_cost,
    },
    balance: newBalance,
  });
}
