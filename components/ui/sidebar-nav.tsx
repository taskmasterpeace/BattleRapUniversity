"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useBattler } from "@/contexts/battler-context"
import { getLeagueTierBadge, type League } from "@/lib/leagues"
import { BattlerPortrait } from "@/components/battler-portrait"
import {
  Home,
  CalendarCheck,
  Trophy,
  DollarSign,
  Newspaper,
  Users,
  BookOpen,
  Map,
  Heart,
  Swords,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Building2,
  Flame,
  Clock,
  BarChart3,
  Wrench,
  LogOut,
  Megaphone,
  UserPlus,
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { motion, AnimatePresence } from "framer-motion"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  children?: { href: string; label: string; badge?: string; logoUrl?: string; icon?: React.ElementType }[]
}

const MEDIA_SUBNAV = [
  { href: "/media?tab=for-you", label: "For You", icon: Flame },
  { href: "/media?tab=latest", label: "Latest", icon: Clock },
  { href: "/media?tab=battle-recaps", label: "Battle Recaps", icon: Swords },
  { href: "/media?tab=scandals", label: "Scandals", icon: Flame },
  { href: "/media?tab=rankings", label: "Rankings", icon: BarChart3 },
  { href: "/media?tab=bloggers", label: "Bloggers", icon: Users },
]

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { activeBattler } = useBattler()
  const [expandedSections, setExpandedSections] = useState<string[]>(["leagues"])
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [leagues, setLeagues] = useState<League[]>([])

  const hasBattler = !!activeBattler

  // Create Supabase client for sign out
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // Fetch leagues on mount
  useEffect(() => {
    async function loadLeagues() {
      try {
        const response = await fetch('/api/leagues?active=true')
        if (response.ok) {
          const data = await response.json()
          setLeagues(data.leagues || [])
        }
      } catch (error) {
        console.error('Failed to load leagues for sidebar:', error)
      }
    }
    loadLeagues()
  }, [])

  useEffect(() => {
    if (pathname.startsWith("/media")) {
      setExpandedSections((prev) => (prev.includes("media") ? prev : [...prev, "media"]))
    }
    if (pathname.startsWith("/leagues")) {
      setExpandedSections((prev) => (prev.includes("leagues") ? prev : [...prev, "leagues"]))
    }
  }, [pathname])

  // Get leagues the battler is affiliated with - show their primary league first
  const battlerLeague = activeBattler?.league?.name
  const battlerLeagues = leagues.filter((l) => {
    // If battler has a primary league, show it first
    if (battlerLeague && l.displayName === battlerLeague) return true
    // Show all active leagues (we now only have 2)
    return true
  }).slice(0, 3)

  // League tier categories for browsing before signing
  const leagueTierCategories = [
    { href: "/leagues?tier=underground", label: "Underground", badge: "underground" },
    { href: "/leagues?tier=regional", label: "Regional", badge: "regional" },
    { href: "/leagues?tier=national", label: "National", badge: "national" },
    { href: "/leagues?tier=premier", label: "Premier", badge: "premier" },
  ]

  // Full nav items for when user has a battler
  const fullNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/roster", label: "Roster", icon: Users },
    { href: "/battle/next/prep", label: "Prep Calendar", icon: CalendarCheck },
    {
      href: "/leagues",
      label: "Leagues",
      icon: Building2,
      children: battlerLeagues.map((league) => ({
        href: `/leagues/${league.slug}`,
        label: league.displayName,
        badge: league.tier,
        logoUrl: league.logoUrl,
      })),
    },
    { href: "/life-events", label: "Life Events", icon: Heart },
    { href: "/badges", label: "Badges", icon: Trophy },
    { href: "/finances", label: "Finances", icon: DollarSign },
    { href: "/regions", label: "Regions", icon: Map },
    { href: "/tournaments", label: "Tournaments", icon: Swords },
    {
      href: "/media",
      label: "Media",
      icon: Newspaper,
      children: MEDIA_SUBNAV,
    },
    { href: "/crews", label: "Crews", icon: UserPlus },
    { href: "/call-outs", label: "Call-Outs", icon: Megaphone },
    { href: "/rivalries", label: "Rivalries", icon: Flame },
    { href: "/guide", label: "Guide", icon: BookOpen },
  ]

  // Limited nav items for when user has no battler
  const limitedNavItems: NavItem[] = [
    { href: "/roster", label: "Roster", icon: Users },
    {
      href: "/leagues",
      label: "Browse Leagues",
      icon: Building2,
      children: leagueTierCategories,
    },
    { href: "/guide", label: "Guide", icon: BookOpen },
  ]

  // Use limited nav when no battler, full nav otherwise
  const navItems = hasBattler ? fullNavItems : limitedNavItems

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => (prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]))
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.includes(item.label.toLowerCase())
    const active = isActive(item.href)

    return (
      <div key={item.href}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleSection(item.label.toLowerCase())}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-display font-bold tracking-wide transition-colors ${
                active
                  ? "bg-orange-600/20 text-orange-500 border-l-2 border-orange-500"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-orange-400 border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              )}
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-6 py-1 space-y-0.5 border-l border-zinc-700 ml-5">
                    {item.label === "Leagues" && (
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-display tracking-wide transition-colors ${
                          pathname === item.href ? "text-orange-400" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        All Leagues
                      </Link>
                    )}
                    {item.children?.map((child) => {
                      const tierClass = child.badge ? getLeagueTierBadge(child.badge as any) : ""
                      const league = leagues.find((l) => `/leagues/${l.slug}` === child.href)
                      const ChildIcon = child.icon

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 text-xs font-display tracking-wide transition-colors ${
                            pathname === child.href || (child.href.includes("?") && pathname === "/media")
                              ? "text-orange-400"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {ChildIcon ? (
                            <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          ) : league?.logoUrl ? (
                            <Image
                              src={league.logoUrl || "/placeholder.svg"}
                              alt={league.displayName}
                              width={18}
                              height={18}
                              className="rounded flex-shrink-0"
                            />
                          ) : (
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                child.badge === "premier"
                                  ? "bg-yellow-400"
                                  : child.badge === "national"
                                    ? "bg-purple-400"
                                    : child.badge === "regional"
                                      ? "bg-blue-400"
                                      : "bg-orange-400"
                              }`}
                            />
                          )}
                          <span className="truncate flex-1">{child.label}</span>
                          {child.badge && (
                            <span className={`text-[10px] px-1.5 py-0.5 border uppercase flex-shrink-0 ${tierClass}`}>
                              {child.badge.slice(0, 3)}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <Link
            href={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-display font-bold tracking-wide transition-colors ${
              active
                ? "bg-orange-600/20 text-orange-500 border-l-2 border-orange-500"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-orange-400 border-l-2 border-transparent"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        )}
      </div>
    )
  }

  const sidebarContent = (
    <>
      {/* Header with Logo + Battler */}
      <div className="p-4 border-b border-zinc-800">
        <Link href="/dashboard" className="block mb-3">
          <Image
            src="/battle-rap-university-logo.png"
            alt="Battle Rap University"
            width={160}
            height={80}
            className="object-contain w-full h-auto"
          />
        </Link>
        {activeBattler ? (
          <div className="flex items-center gap-3 p-2 bg-zinc-800/50 border border-zinc-700">
            <div className="w-10 h-10 border border-orange-500/50 overflow-hidden">
              <BattlerPortrait battler={activeBattler} size="sm" showFrame={false} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-display font-bold text-orange-400 truncate">{activeBattler.stageName}</p>
                {activeBattler.crew && (
                  <span className="text-xs font-display font-bold text-zinc-400 px-1.5 py-0.5 bg-zinc-700/50 border border-zinc-600 flex-shrink-0">
                    {activeBattler.crew.tag}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 truncate">{activeBattler.tier}</p>
            </div>
            <Link href="/roster" className="text-xs text-zinc-500 hover:text-orange-400 font-display">
              <Users className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <Link href="/roster" className="block p-3 bg-orange-600/10 border border-orange-500/30 hover:bg-orange-600/20 transition-colors">
            <p className="text-sm font-display font-bold text-orange-400">No Battler Signed</p>
            <p className="text-xs text-zinc-500">Go to Roster to get started</p>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">{navItems.map(renderNavItem)}</nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800 space-y-2">
        {/* Dev Tools Link */}
        <Link
          href="/dev"
          onClick={() => setIsMobileOpen(false)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-display text-zinc-500 hover:text-orange-400 hover:bg-zinc-800 transition-colors"
        >
          <Wrench className="w-4 h-4" />
          Dev Tools
        </Link>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-red-400 font-display py-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-orange-500 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r-2 border-zinc-800 z-50 flex flex-col
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 text-zinc-400 hover:text-orange-500 transition-colors"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>

        {sidebarContent}
      </aside>
    </>
  )
}
