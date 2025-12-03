"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarNav } from "./sidebar-nav"
import { NotificationDropdown } from "./notification-dropdown"
import { ChevronLeft } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  pageTitle?: string
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/media": "Media Hub",
  "/badges": "Badges",
  "/finances": "Finances",
  "/life-events": "Life Events",
  "/regions": "Regions",
  "/leagues": "Leagues",
  "/tournaments": "Tournaments",
  "/guide": "Guide",
  "/roster": "Roster",
  "/battle/next/prep": "Battle Prep",
}

export function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pageTitle) return pageTitle
    // Check exact match first
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
    // Check partial matches for nested routes
    for (const [path, title] of Object.entries(PAGE_TITLES)) {
      if (pathname.startsWith(path) && path !== "/") {
        return title
      }
    }
    return null
  }

  const title = getPageTitle()
  const showBackButton = pathname !== "/dashboard"

  return (
    <div className="min-h-screen bg-zinc-950">
      <SidebarNav />

      {/* Main content area - offset by sidebar width on desktop */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-orange-500 hover:text-orange-400 text-sm font-display font-bold tracking-wide transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">BACK</span>
              </Link>
            )}
            {title && <h1 className="text-lg font-display font-bold text-zinc-100 tracking-wide">{title}</h1>}
          </div>
          <NotificationDropdown />
        </header>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  )
}
