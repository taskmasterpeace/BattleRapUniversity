import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';
import { markAsRead } from '@/lib/services/notificationService';

/**
 * POST /api/notifications/mark-read
 * Marks a specific notification as read
 * Body: { notificationId: string }
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

    // Parse request body
    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required' },
        { status: 400 }
      );
    }

    // Mark notification as read
    const success = await markAsRead(supabase, notificationId, battlerId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark notification as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
