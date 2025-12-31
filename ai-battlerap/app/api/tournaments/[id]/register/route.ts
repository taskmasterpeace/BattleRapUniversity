import { NextRequest, NextResponse } from 'next/server';
import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { registerForTournament } from '@/lib/game/tournamentManager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { battler } = await getPlayerBattler();

  if (!battler) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const result = await registerForTournament(id, battler.id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, participant: result.participant });
}
