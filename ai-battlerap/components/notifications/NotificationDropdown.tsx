'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Notification } from '@/lib/services/notificationService';

interface NotificationDropdownProps {
  battlerId?: string;
}

export default function NotificationDropdown({ battlerId }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (battlerId) {
      fetchNotifications();
      // Refresh every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [battlerId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
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
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
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
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'battle_offer':
        return '🥊';
      case 'battle_complete':
        return '🏆';
      case 'life_event':
        return '📰';
      case 'badge_earned':
        return '🏅';
      case 'level_up':
        return '⬆️';
      case 'tournament_update':
        return '🎯';
      case 'system_message':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'battle_offer':
        return 'border-[#ff8c42]/30 bg-[#ff8c42]/10';
      case 'battle_complete':
        return 'border-green-500/30 bg-green-500/10';
      case 'life_event':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'badge_earned':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'level_up':
        return 'border-amber-500/30 bg-amber-500/10';
      case 'tournament_update':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'system_message':
        return 'border-[#3a3d44] bg-zinc-800/50';
      default:
        return 'border-[#3a3d44] bg-zinc-800/50';
    }
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#ff8c42] rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-[#3a3d44]">
            <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#ff8c42] hover:text-[#ff9d5c] font-display font-black uppercase tracking-wide"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-zinc-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={getNotificationLink(notification)}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                      setIsOpen(false);
                    }}
                    className={`block p-4 hover:bg-zinc-800/50 transition-colors ${
                      !notification.is_read ? 'bg-zinc-800/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-[#ff8c42] rounded-full mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-zinc-600 mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t-2 border-[#3a3d44]">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs font-bold text-[#ff8c42] hover:text-[#ff9d5c] uppercase tracking-wide"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
