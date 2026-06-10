'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Notification, NotificationType } from '@/lib/services/notificationService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchNotifications();
  }, [filterType, showUnreadOnly, page]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: (page * ITEMS_PER_PAGE).toString(),
      });

      if (filterType !== 'all') {
        params.append('type', filterType);
      }

      if (showUnreadOnly) {
        params.append('unreadOnly', 'true');
      }

      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setHasMore(data.notifications.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    // Note: We don't have a delete endpoint yet, but we can implement it later
    // For now, just mark as read
    await markAsRead(notificationId);
  };

  const getNotificationIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, string> = {
      battle_offer: '🥊',
      battle_complete: '🏆',
      life_event: '📰',
      badge_earned: '🏅',
      level_up: '⬆️',
      tournament_update: '🎯',
      system_message: '📢',
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type: NotificationType) => {
    const colors: Record<NotificationType, string> = {
      battle_offer: 'border-orange-500/30 bg-[#ff8c42]/10',
      battle_complete: 'border-green-500/30 bg-green-500/10',
      life_event: 'border-yellow-500/30 bg-yellow-500/10',
      badge_earned: 'border-purple-500/30 bg-purple-500/10',
      level_up: 'border-amber-500/30 bg-amber-500/10',
      tournament_update: 'border-blue-500/30 bg-blue-500/10',
      system_message: 'border-[#3a3d44] bg-zinc-800/50',
    };
    return colors[type] || 'border-[#3a3d44] bg-zinc-800/50';
  };

  const getNotificationLink = (notification: Notification) => {
    const metadata = notification.metadata || {};
    switch (notification.type) {
      case 'battle_offer':
        return '/battle/offers';
      case 'battle_complete':
        return metadata.battleId ? `/battle/${metadata.battleId}` : '/dashboard';
      case 'life_event':
        return '/dashboard';
      case 'tournament_update':
        return metadata.tournamentId ? `/tournaments/${metadata.tournamentId}` : '/tournaments';
      default:
        return '/dashboard';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 mb-4">
            <h1 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tighter text-zinc-100">
              Notifications
            </h1>
            <Link
              href="/dashboard"
              className="text-sm font-bold text-[#ff8c42] hover:text-[#ff9d5c] uppercase tracking-wide whitespace-nowrap transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-zinc-400">
              You have <span className="text-[#ff8c42] font-bold">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as NotificationType | 'all');
              setPage(0);
            }}
            className="px-4 py-2 bg-[#18191c] border-2 border-[#3a3d44] text-sm font-display font-black uppercase tracking-wide text-zinc-100 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Types</option>
            <option value="battle_offer">Battle Offers</option>
            <option value="battle_complete">Battle Results</option>
            <option value="life_event">Life Events</option>
            <option value="badge_earned">Badges</option>
            <option value="level_up">Level Ups</option>
            <option value="tournament_update">Tournaments</option>
            <option value="system_message">System</option>
          </select>

          {/* Unread Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => {
                setShowUnreadOnly(e.target.checked);
                setPage(0);
              }}
              className="w-4 h-4 rounded border-[#3a3d44] bg-[#2d2f35] text-[#ff8c42] focus:ring-orange-500 focus:ring-offset-zinc-950"
            />
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-wide">
              Unread Only
            </span>
          </label>

          {/* Mark All Read */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="ml-auto px-4 py-2 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black text-xs font-display font-black uppercase tracking-wide transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>

        {/* Notification List */}
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="border-2 border-[#3a3d44] bg-[#18191c] p-4 animate-pulse"
              >
                <div className="h-4 w-1/3 bg-[#2d2f35] mb-3" />
                <div className="h-3 w-2/3 bg-[#2d2f35] mb-2" />
                <div className="h-3 w-1/4 bg-[#2d2f35]" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="border-2 border-[#3a3d44] bg-[#18191c] text-center py-16 px-6">
            <p className="text-2xl font-display font-black uppercase tracking-tighter text-zinc-300">
              All Quiet on the Circuit
            </p>
            <p className="text-zinc-500 text-sm mt-2 uppercase tracking-wide">
              {showUnreadOnly || filterType !== 'all'
                ? 'Nothing matches this filter — loosen it up'
                : "When something pops off, you'll hear it here first"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-2 overflow-hidden transition-all ${
                  !notification.is_read
                    ? 'border-orange-500/50 bg-[#ff8c42]/5'
                    : 'border-[#3a3d44] bg-[#18191c]'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 p-4">
                  {/* Icon + Content */}
                  <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                    <div className="text-3xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-base font-display font-black uppercase tracking-wide text-zinc-100">
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <span className="flex-shrink-0 px-2 py-1 bg-[#ff8c42] text-black text-xs font-display font-black uppercase">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 mb-3">
                        {notification.message}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600">
                        <span className="whitespace-nowrap">{formatDate(notification.created_at)}</span>
                        <span className="px-2 py-0.5 bg-zinc-800 uppercase tracking-wide whitespace-nowrap">
                          {notification.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                    <Link
                      href={getNotificationLink(notification)}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black text-xs font-display font-black uppercase tracking-wide transition-colors text-center"
                    >
                      View
                    </Link>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-[#18191c] border-2 border-[#3a3d44] hover:border-zinc-500 text-zinc-300 text-xs font-display font-black uppercase tracking-wide transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && notifications.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-[#18191c] border-2 border-[#3a3d44] text-zinc-100 text-sm font-display font-black uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:border-zinc-500 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-zinc-500">
              Page {page + 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="px-4 py-2 bg-[#18191c] border-2 border-[#3a3d44] text-zinc-100 text-sm font-display font-black uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:border-zinc-500 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
