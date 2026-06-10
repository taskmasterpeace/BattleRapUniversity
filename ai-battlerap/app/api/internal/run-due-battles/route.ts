import { verifyInternalSecret } from '@/lib/db/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getVirtualNowISO } from '@/lib/dev/timeManipulation';
import { runBattleSimulation } from '@/lib/game/runBattle';

/**
 * POST /api/internal/run-due-battles
 *
 * Cron entrypoint: simulates every battle whose scheduled_at has passed.
 * Optional ?battle_id=X simulates one specific battle regardless of date
 * (used by local tooling; protected by the internal secret either way).
 *
 * The per-battle pipeline lives in lib/game/runBattle.ts and is shared with
 * the player-facing /api/battles/[id]/start endpoint.
 */
export async function POST(request: Request) {
  if (!verifyInternalSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const url = new URL(request.url);
  const battleId = url.searchParams.get('battle_id');

  let dueBattles;

  if (battleId) {
    // Simulate specific battle regardless of date
    const { data } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .in('status', ['accepted', 'locked'])
      .limit(1);
    dueBattles = data;
  } else {
    // Only battles that are due (virtual time in dev mode, real time in prod)
    const now = getVirtualNowISO();
    const { data } = await supabase
      .from('battles')
      .select('*')
      .lte('scheduled_at', now)
      .in('status', ['accepted', 'locked'])
      .order('scheduled_at', { ascending: true });
    dueBattles = data;
  }

  if (!dueBattles || dueBattles.length === 0) {
    return NextResponse.json({
      message: 'No battles due for simulation',
      battlesSimulated: 0,
    });
  }

  const results = [];

  for (const battle of dueBattles) {
    try {
      const { noShow, offersGenerated } = await runBattleSimulation(battle, supabase);
      results.push({
        battleId: battle.id,
        status: 'success',
        noShow,
        offersGenerated,
      });
    } catch (error: any) {
      console.error(`Error simulating battle ${battle.id}:`, error);
      results.push({
        battleId: battle.id,
        status: 'error',
        error: error.message,
      });
    }
  }

  return NextResponse.json({
    message: `Simulated ${results.filter((r) => r.status === 'success').length} battles`,
    battlesSimulated: results.filter((r) => r.status === 'success').length,
    results,
  });
}
