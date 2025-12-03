"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, X, Flame, Trophy, Calendar, Newspaper, AlertTriangle } from "lucide-react"

interface Notification {
  id: string
  type: "battle_result" | "life_event" | "offer" | "badge" | "news"
  title: string
  message: string
  time: string
  read: boolean
  link?: string
}

interface NotificationDropdownProps {
  notifications?: Notification[]
}

const mockNotifications: Notification[] = [
  {
    id: "n-1",
    type: "battle_result",
    title: "Battle Complete",
    message: "You defeated Young Pattern 2-1",
    time: "2h ago",
    read: false,
    link: "/battle/b-001",
  },
  {
    id: "n-2",
    type: "life_event",
    title: "Life Event",
    message: "Family emergency requires your attention",
    time: "5h ago",
    read: false,
    link: "/life-events/le-001",
  },
  {
    id: "n-3",
    type: "offer",
    title: "New Battle Offer",
    message: "Scheme Master wants to battle",
    time: "1d ago",
    read: true,
    link: "/battle/offers",
  },
  {
    id: "n-4",
    type: "badge",
    title: "Badge Earned",
    message: "You earned 'Rising Star' badge!",
    time: "2d ago",
    read: true,
    link: "/badges",
  },
]

export function NotificationDropdown({ notifications = mockNotifications }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState(notifications)

  const unreadCount = items.filter((n) => !n.read).length

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "battle_result":
        return <Flame className="w-4 h-4 text-orange-500" />
      case "life_event":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "offer":
        return <Calendar className="w-4 h-4 text-blue-500" />
      case "badge":
        return <Trophy className="w-4 h-4 text-amber-500" />
      case "news":
        return <Newspaper className="w-4 h-4 text-zinc-400" />
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-orange-500 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-xs font-mono font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border-2 border-zinc-700 z-50 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-zinc-800">
              <h3 className="text-sm font-display font-bold text-zinc-100">NOTIFICATIONS</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-orange-500 hover:text-orange-400 font-display"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-6 text-center text-sm text-zinc-500">No notifications</div>
              ) : (
                items.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.link || "#"}
                    onClick={() => setIsOpen(false)}
                    className={`block p-3 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors ${
                      !notification.read ? "bg-zinc-800/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-display font-bold text-zinc-200 truncate">
                            {notification.title}
                          </span>
                          {!notification.read && <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />}
                        </div>
                        <p className="text-xs text-zinc-400 truncate">{notification.message}</p>
                        <span className="text-xs text-zinc-600">{notification.time}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Footer */}
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block p-3 text-center text-xs text-orange-500 hover:text-orange-400 font-display border-t border-zinc-800"
            >
              VIEW ALL NOTIFICATIONS
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
