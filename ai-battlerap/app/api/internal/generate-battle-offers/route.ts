import { createClient } from '@supabase/supabase-js';
import { verifyInternalSecret } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { generateOffersForPlayer } from '@/lib/services/battleOffers';

export async function POST(request: Request) {
  // Verify internal secret
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

  // Get all player battlers
  const { data: playerBattlers } = await supabase
    .from('battlers')
    .select('id, primary_league_id')
    .eq('is_ai', false);

  if (!playerBattlers || playerBattlers.length === 0) {
    return NextResponse.json({ message: 'No player battlers found', offersCreated: 0 });
  }

  let totalOffersCreated = 0;

  for (const battler of playerBattlers) {
    // Get financial stability to determine offer count
    const { data: attributes } = await supabase
      .from('battler_attributes')
      .select('personal')
      .eq('battler_id', battler.id)
      .single();

    const financialStability = attributes?.personal?.financial_stability || 5;

    // Financial stability affects offer frequency
    // Low financial stability (1-3) = 2-3 offers (need money)
    // Mid financial stability (4-6) = 1-2 offers (balanced)
    // High financial stability (7-10) = 1 offer (can be picky)
    let offerCount: number;
    if (financialStability <= 3) {
      offerCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
    } else if (financialStability <= 6) {
      offerCount = 1 + Math.floor(Math.random() * 2); // 1 or 2
    } else {
      offerCount = 1; // Always 1
    }

    const offersCreated = await generateOffersForPlayer(
      supabase,
      battler.id,
      offerCount
    );

    totalOffersCreated += offersCreated;
  }

  return NextResponse.json({
    message: `Generated ${totalOffersCreated} battle offers`,
    offersCreated: totalOffersCreated,
  });
}
