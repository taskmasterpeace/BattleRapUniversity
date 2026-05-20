import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';
import { markAllAsRead } from '@/lib/services/notificationService';

/**
 * POST /api/notifications/mark-all-read
 * Marks all unread notifications as read for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's battler (battlers.user_id, not profiles.battler_id)
    const { data: battler } = await supabase
      .from('battlers')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_ai', false)
      .maybeSingle();

    if (!battler?.id) {
      return NextResponse.json({ error: 'No battler found' }, { status: 404 });
    }

    const battlerId = battler.id;

    // Mark all notifications as read
    const count = await markAllAsRead(supabase, battlerId);

    return NextResponse.json({
      success: true,
      count,
      message: `Marked ${count} notification${count !== 1 ? 's' : ''} as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
