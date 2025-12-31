import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';
import { getNotifications, getUnreadCount } from '@/lib/services/notificationService';

/**
 * GET /api/notifications
 * Fetches notifications for the current user's battler
 * Query params:
 * - limit: number of notifications to fetch (default: 20)
 * - offset: pagination offset (default: 0)
 * - type: filter by notification type
 * - unreadOnly: show only unread notifications (true/false)
 */
export async function GET(request: NextRequest) {
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

    // Get user's battler
    const { data: profile } = await supabase
      .from('profiles')
      .select('battler_id')
      .eq('id', user.id)
      .single();

    if (!profile?.battler_id) {
      return NextResponse.json({ error: 'No battler found' }, { status: 404 });
    }

    const battlerId = profile.battler_id;

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') as any;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Fetch notifications
    const notifications = await getNotifications(supabase, battlerId, {
      limit,
      offset,
      type,
      unreadOnly
    });

    // Get unread count
    const unreadCount = await getUnreadCount(supabase, battlerId);

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        limit,
        offset,
        total: notifications.length
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
