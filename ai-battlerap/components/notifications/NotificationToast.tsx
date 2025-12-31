'use client';

import { useEffect, useState } from 'react';
import { Notification } from '@/lib/services/notificationService';

interface ToastNotification extends Notification {
  toastId: string;
}

export default function NotificationToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (notification: Notification) => {
    const toastId = `${notification.id}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...notification, toastId }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeToast(toastId);
    }, 5000);
  };

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  };

  const getToastColor = (type: Notification['type'], won?: boolean) => {
    switch (type) {
      case 'battle_offer':
        return 'border-[#ff8c42] bg-[#ff8c42]/20 text-orange-100';
      case 'battle_complete':
        return won
          ? 'border-green-500 bg-green-500/20 text-green-100'
          : 'border-red-500 bg-red-500/20 text-red-100';
      case 'life_event':
        return 'border-yellow-500 bg-yellow-500/20 text-yellow-100';
      case 'badge_earned':
        return 'border-purple-500 bg-purple-500/20 text-purple-100';
      case 'level_up':
        return 'border-amber-500 bg-amber-500/20 text-amber-100';
      case 'tournament_update':
        return 'border-blue-500 bg-blue-500/20 text-blue-100';
      case 'system_message':
        return 'border-zinc-600 bg-zinc-800 text-zinc-100';
      default:
        return 'border-zinc-600 bg-zinc-800 text-zinc-100';
    }
  };

  const getToastIcon = (type: Notification['type']) => {
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

  // Expose addToast globally for easy triggering
  useEffect(() => {
    (window as any).addNotificationToast = addToast;
    return () => {
      delete (window as any).addNotificationToast;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const won = toast.metadata?.won;
        return (
          <div
            key={toast.toastId}
            className={`pointer-events-auto max-w-sm border-l-4 ${getToastColor(
              toast.type,
              won
            )} rounded-r-lg shadow-lg transform transition-all duration-300 ease-out animate-slide-in`}
            style={{
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div className="flex items-start gap-3 p-4">
              <div className="text-2xl flex-shrink-0">{getToastIcon(toast.type)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black uppercase tracking-wider">
                  {toast.title}
                </h4>
                <p className="text-xs mt-1 opacity-90">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.toastId)}
                className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
