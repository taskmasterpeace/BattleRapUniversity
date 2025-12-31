import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { executeAIPromotion } from '@/lib/game/aiPromotion';
import { notifySystemMessage } from '@/lib/services/notificationService';

/**
 * POST /api/internal/trigger-ai-promotion
 * Internal endpoint to trigger AI opponent promotion
 *
 * Called when:
 * - Player promotes (AI may counter-promote)
 * - Periodic checks for active battles
 * - Manual dev testing
 *
 * Body:
 * - battleId: string (required)
 * - aiBattlerId?: string (optional - if not provided, uses battle's battler_ai_id)
 */
export async function POST(request: NextRequest) {
  try {
    // Simple auth check for internal endpoints
    const authHeader = request.headers.get('authorization');
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev && authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { battleId, aiBattlerId: providedAiBattlerId } = body;

    if (!battleId) {
      return NextResponse.json(
        { error: 'battleId is required' },
        { status: 400 }
      );
    }

    // If AI battler ID not provided, get from battle
    let aiBattlerId = providedAiBattlerId;

    if (!aiBattlerId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const { data: battle, error: battleError } = await supabase
        .from('battles')
        .select('battler_ai_id')
        .eq('id', battleId)
        .single();

      if (battleError || !battle) {
        return NextResponse.json(
          { error: 'Battle not found' },
          { status: 404 }
        );
      }

      aiBattlerId = battle.battler_ai_id;
    }

    // Get AI decision
    const decision = await executeAIPromotion(battleId, aiBattlerId);

    if (!decision.success) {
      return NextResponse.json(
        { error: decision.error || 'AI promotion decision failed' },
        { status: 500 }
      );
    }

    // If AI decided not to promote, return early
    if (!decision.result?.shouldExecute) {
      return NextResponse.json({
        success: true,
        promoted: false,
        reason: decision.result?.reason || 'AI chose not to promote',
      });
    }

    // Execute the promotion via the promotion API
    const promotionResponse = await fetch(
      `http://localhost:3000/api/battles/${battleId}/promotion`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-battler-id': aiBattlerId,
        },
        body: JSON.stringify({
          actionType: decision.result.actionType,
          targetScandalId: decision.result.targetScandalId,
        }),
      }
    );

    if (!promotionResponse.ok) {
      const errorData = await promotionResponse.json();
      return NextResponse.json(
        { error: errorData.error || 'Promotion execution failed' },
        { status: 500 }
      );
    }

    const promotionResult = await promotionResponse.json();

    // Send notification to player
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      // Get battle and battler details for notification
      const { data: battle } = await supabase
        .from('battles')
        .select(`
          battler_player_id,
          ai_battler:battler_ai_id(stage_name)
        `)
        .eq('id', battleId)
        .single();

      if (battle) {
        const aiName = (battle.ai_battler as any)?.stage_name || 'Your opponent';
        const actionNames: Record<string, string> = {
          interview: 'gave an interview',
          twitter_callout: 'called you out on social media',
          scandal_exposure: 'exposed a scandal',
          authenticity_attack: 'questioned your authenticity',
          angle_teaser: 'teased their angles',
        };

        const actionText = actionNames[decision.result.actionType] || 'promoted';

        await notifySystemMessage(
          supabase,
          battle.battler_player_id,
          '⚔️ Opponent Promotion',
          `${aiName} ${actionText} for your upcoming battle!`,
          {
            battleId,
            actionType: decision.result.actionType,
            opponentId: aiBattlerId,
          }
        );
      }
    } catch (notificationError) {
      console.error('Failed to send promotion notification:', notificationError);
      // Don't fail the whole request if notification fails
    }

    return NextResponse.json({
      success: true,
      promoted: true,
      actionType: decision.result.actionType,
      result: promotionResult,
    });
  } catch (error: any) {
    console.error('Error triggering AI promotion:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
