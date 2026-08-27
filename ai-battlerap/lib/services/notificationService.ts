import { SupabaseClient } from '@supabase/supabase-js';

export type NotificationType =
  | 'battle_offer'
  | 'battle_complete'
  | 'life_event'
  | 'badge_earned'
  | 'level_up'
  | 'tournament_update'
  | 'system_message';

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  battler_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

/**
 * Creates a notification for a battler
 */
export async function createNotification(
  supabase: SupabaseClient,
  battlerId: string,
  data: NotificationData
): Promise<string | null> {
  try {
    const { data: notificationId, error } = await supabase.rpc('create_notification', {
      p_battler_id: battlerId,
      p_type: data.type,
      p_title: data.title,
      p_message: data.message,
      p_metadata: data.metadata || {}
    });

    if (error) {
      console.error('Failed to create notification:', error);
      return null;
    }

    return notificationId as string;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Fetches notifications for a battler
 */
export async function getNotifications(
  supabase: SupabaseClient,
  battlerId: string,
  options?: {
    limit?: number;
    offset?: number;
    type?: NotificationType;
    unreadOnly?: boolean;
  }
): Promise<Notification[]> {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('battler_id', battlerId)
      .order('created_at', { ascending: false });

    if (options?.type) {
      query = query.eq('type', options.type);
    }

    if (options?.unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }

    return data as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Gets unread notification count for a battler
 */
export async function getUnreadCount(
  supabase: SupabaseClient,
  battlerId: string
): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_unread_notification_count', {
      p_battler_id: battlerId
    });

    if (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }

    return (data as number) || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Marks a notification as read
 */
export async function markAsRead(
  supabase: SupabaseClient,
  notificationId: string,
  battlerId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId,
      p_battler_id: battlerId
    });

    if (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }

    return data as boolean;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Marks all notifications as read for a battler
 */
export async function markAllAsRead(
  supabase: SupabaseClient,
  battlerId: string
): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('mark_all_notifications_read', {
      p_battler_id: battlerId
    });

    if (error) {
      console.error('Failed to mark all as read:', error);
      return 0;
    }

    return (data as number) || 0;
  } catch (error) {
    console.error('Error marking all as read:', error);
    return 0;
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR COMMON NOTIFICATION TYPES
// ============================================================================

/**
 * Notifies battler of a new battle offer
 */
export async function notifyBattleOffer(
  supabase: SupabaseClient,
  battlerId: string,
  battleId: string,
  opponentName: string,
  league: string
): Promise<string | null> {
  return createNotification(supabase, battlerId, {
    type: 'battle_offer',
    title: 'New Battle Offer',
    message: `You have a new battle offer against ${opponentName} in ${league}`,
    metadata: { battleId, opponentName, league }
  });
}

/**
 * Notifies battler that a battle is complete
 */
export async function notifyBattleComplete(
  supabase: SupabaseClient,
  battlerId: string,
  battleId: string,
  opponentName: string,
  won: boolean,
  verdict: string
): Promise<string | null> {
  return createNotification(supabase, battlerId, {
    type: 'battle_complete',
    title: won ? 'Victory!' : 'Battle Complete',
    message: `Your battle against ${opponentName} is complete. Result: ${verdict}`,
    metadata: { battleId, opponentName, won, verdict }
  });
}

/**
 * Notifies battler of a life event
 */
export async function notifyLifeEvent(
  supabase: SupabaseClient,
  battlerId: string,
  eventId: string,
  eventTitle: string,
  eventDescription: string
): Promise<string | null> {
  return createNotification(supabase, battlerId, {
    type: 'life_event',
    // Title is the event itself ("Rock Bottom"), not a generic "Life Event" that
    // just repeats the type badge; the body carries the real detail so three of
    // these aren't three identical, contentless rows.
    title: eventTitle,
    message: eventDescription || eventTitle,
    metadata: { eventId, eventTitle, eventDescription }
  });
}

/**
 * Notifies battler of earned badges
 */
export async function notifyBadgeEarned(
  supabase: SupabaseClient,
  battlerId: string,
  badges: string[]
): Promise<string | null> {
  if (badges.length === 0) return null;

  const badgeList = badges.join(', ');
  return createNotification(supabase, battlerId, {
    type: 'badge_earned',
    title: badges.length > 1 ? 'Badges Earned!' : 'Badge Earned!',
    message: `You earned: ${badgeList}`,
    metadata: { badges }
  });
}

/**
 * Notifies battler of level up
 */
export async function notifyLevelUp(
  supabase: SupabaseClient,
  battlerId: string,
  newLevel: number,
  skillPointsEarned: number
): Promise<string | null> {
  return createNotification(supabase, battlerId, {
    type: 'level_up',
    title: 'Level Up!',
    message: `Congratulations! You reached Level ${newLevel} and earned ${skillPointsEarned} skill points.`,
    metadata: { newLevel, skillPointsEarned }
  });
}

/**
 * Notifies battler of tournament updates
 */
export async function notifyTournamentUpdate(
  supabase: SupabaseClient,
  battlerId: string,
  tournamentId: string,
  tournamentName: string,
  updateType: 'bracket_ready' | 'match_scheduled' | 'round_complete' | 'champion' | 'eliminated'
): Promise<string | null> {
  const messages: Record<typeof updateType, string> = {
    bracket_ready: `Brackets are ready for ${tournamentName}!`,
    match_scheduled: `Your next match in ${tournamentName} has been scheduled.`,
    round_complete: `Round complete in ${tournamentName}. Check the bracket!`,
    champion: `Congratulations! You won ${tournamentName}!`,
    eliminated: `You've been eliminated from ${tournamentName}. Better luck next time!`
  };

  return createNotification(supabase, battlerId, {
    type: 'tournament_update',
    title: 'Tournament Update',
    message: messages[updateType],
    metadata: { tournamentId, tournamentName, updateType }
  });
}

/**
 * Notifies battler of a system message
 */
export async function notifySystemMessage(
  supabase: SupabaseClient,
  battlerId: string,
  title: string,
  message: string,
  metadata?: Record<string, any>
): Promise<string | null> {
  return createNotification(supabase, battlerId, {
    type: 'system_message',
    title,
    message,
    metadata
  });
}
