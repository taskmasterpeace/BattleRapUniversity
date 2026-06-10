import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { runExhibition } from '@/lib/game/exhibitionSim';

/**
 * POST /api/matchup — run a fantasy exhibition between any two battlers and
 * persist a shareable result. Public (no auth): this is the growth surface —
 * anyone with the link can create and share dream matchups.
 *
 * Body: { battlerAId, battlerBId, leagueId? }
 * Returns: { slug }
 */

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let body: { battlerAId?: string; battlerBId?: string; leagueId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { battlerAId, battlerBId, leagueId } = body;
  if (!battlerAId || !battlerBId || battlerAId === battlerBId) {
    return NextResponse.json({ error: 'Pick two different battlers' }, { status: 400 });
  }

  // Optional: fight under a real league's judging culture
  let league = null;
  if (leagueId) {
    const { data } = await supabase
      .from('leagues')
      .select('name, writing_weight, performance_weight, base_crowd_factor, round_length_minutes')
      .eq('id', leagueId)
      .single();
    league = data;
  }

  try {
    const result = await runExhibition(supabase, battlerAId, battlerBId, league);

    const slug = `${slugify(result.battlerA.stageName)}-vs-${slugify(result.battlerB.stageName)}-${Math.random().toString(36).slice(2, 7)}`;

    const { error: insertError } = await supabase.from('matchup_sims').insert({
      slug,
      battler_a_id: battlerAId,
      battler_b_id: battlerBId,
      winner_id: result.winnerId,
      verdict: result.verdict,
      rounds_json: {
        rounds: result.rounds,
        decision: result.decision,
        league: result.league,
        battlerA: result.battlerA,
        battlerB: result.battlerB,
      },
      headline: result.headline,
    });

    if (insertError) {
      console.error('matchup insert failed:', insertError);
      return NextResponse.json({ error: 'Failed to save matchup' }, { status: 500 });
    }

    return NextResponse.json({ slug });
  } catch (e: unknown) {
    console.error('matchup sim failed:', e);
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}
