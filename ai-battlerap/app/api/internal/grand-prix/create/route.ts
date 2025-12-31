/**
 * API Route: Create Grand Prix Tournament
 * Internal endpoint to manually trigger Grand Prix creation for a player
 * Also used for testing the Grand Prix system
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createGrandPrix } from '@/lib/game/grand-prix';

// Service role client (bypasses RLS)
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

export async function POST(request: NextRequest) {
  try {
    // Get battler ID from request body
    const body = await request.json();
    const { battler_id } = body;

    if (!battler_id) {
      return NextResponse.json(
        { success: false, error: 'battler_id is required' },
        { status: 400 }
      );
    }

    // Create Grand Prix
    const result = await createGrandPrix(battler_id, supabase);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      tournament: result.tournament,
    });
  } catch (error) {
    console.error('Error creating Grand Prix:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check eligibility
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const battlerId = searchParams.get('battler_id');

    if (!battlerId) {
      return NextResponse.json(
        { success: false, error: 'battler_id is required' },
        { status: 400 }
      );
    }

    const { checkGrandPrixEligibility, hasCompletedGrandPrix } = await import(
      '@/lib/game/grand-prix'
    );

    const [isEligible, hasParticipated] = await Promise.all([
      checkGrandPrixEligibility(battlerId, supabase),
      hasCompletedGrandPrix(battlerId, supabase),
    ]);

    // Get milestone count
    const { data: milestones } = await supabase
      .from('origin_milestones')
      .select('milestone_key')
      .eq('battler_id', battlerId);

    return NextResponse.json({
      success: true,
      eligibility: {
        is_eligible: isEligible,
        has_participated: hasParticipated,
        can_create: isEligible && !hasParticipated,
        milestone_count: milestones?.length || 0,
        required_milestones: 5,
      },
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
