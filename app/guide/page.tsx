"use client"

import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  Target,
  Brain,
  Dumbbell,
  Users,
  Swords,
  Trophy,
  Heart,
  Lightbulb,
  Shield,
  MapPin,
  TrendingUp,
  Calendar,
  Newspaper,
} from "lucide-react"

const guideCards = [
  {
    id: "game-loop",
    title: "🎯 The Game Loop",
    icon: Target,
    description: "Understand the core cycle: Offers → Prep → Battle → Results → Repeat",
    href: "/guide/game-loop",
    color: "orange",
  },
  {
    id: "attributes",
    title: "🧠 Attributes System",
    icon: Brain,
    description: "Deep dive into Writing, Performance, and Personal attributes",
    href: "/guide/attributes",
    color: "green",
  },
  {
    id: "prep",
    title: "✍️ Prep Focus Types",
    icon: Dumbbell,
    description: "Master Research, Writing, Performance, Life, and Rest prep",
    href: "/guide/prep",
    color: "blue",
  },
  {
    id: "leagues",
    title: "🏟️ Leagues & Cities",
    icon: Users,
    description: "Small Room Circuit vs Main Stage Arena. City tier system.",
    href: "/guide/leagues",
    color: "purple",
  },
  {
    id: "battle",
    title: "⚔️ Battle Mechanics",
    icon: Swords,
    description: "Rounds, segments, haymakers, chokes, and scoring explained",
    href: "/guide/battle",
    color: "red",
  },
  {
    id: "bloggers",
    title: "📰 Blogger System",
    icon: Newspaper,
    description: "Meet the 8 voices of battle rap media. Their biases, coverage, and personalities.",
    href: "/guide/bloggers",
    color: "cyan",
  },
  {
    id: "badges",
    title: "🏆 Badge Compendium",
    icon: Trophy,
    description: "100+ badges across 7 categories with effects and synergies",
    href: "/badges",
    color: "yellow",
  },
  {
    id: "stress",
    title: "💪 Stress & Resilience",
    icon: Heart,
    description: "Manage stress levels to avoid choking under pressure",
    href: "/guide/stress",
    color: "pink",
  },
  {
    id: "tiers",
    title: "📈 Tier System",
    icon: TrendingUp,
    description: "None → Low → Mid → Top → God tier progression explained",
    href: "/guide/tiers",
    color: "cyan",
  },
  {
    id: "calendar",
    title: "📅 Time & Events",
    icon: Calendar,
    description: "Life events, tournaments, media scandals, and random occurrences",
    href: "/guide/events",
    color: "indigo",
  },
  {
    id: "regions",
    title: "🗺️ Regional System",
    icon: MapPin,
    description: "City rankings, regional competitions, and location bonuses",
    href: "/guide/regions",
    color: "teal",
  },
  {
    id: "rivalries",
    title: "🔥 Rivalries & Grudges",
    icon: Shield,
    description: "Build beef for bigger payouts and media attention",
    href: "/guide/rivalries",
    color: "amber",
  },
  {
    id: "tips",
    title: "💡 Pro Tips & Strategies",
    icon: Lightbulb,
    description: "Advanced tactics for climbing the ranks efficiently",
    href: "/guide/tips",
    color: "lime",
  },
]

const colorClasses: Record<string, { border: string; bg: string; text: string; hoverBg: string }> = {
  orange: {
    border: "border-orange-500/40",
    bg: "bg-orange-900/20",
    text: "text-orange-500",
    hoverBg: "hover:bg-orange-900/30",
  },
  green: {
    border: "border-green-500/40",
    bg: "bg-green-900/20",
    text: "text-green-500",
    hoverBg: "hover:bg-green-900/30",
  },
  blue: { border: "border-blue-500/40", bg: "bg-blue-900/20", text: "text-blue-500", hoverBg: "hover:bg-blue-900/30" },
  purple: {
    border: "border-purple-500/40",
    bg: "bg-purple-900/20",
    text: "text-purple-500",
    hoverBg: "hover:bg-purple-900/30",
  },
  red: { border: "border-red-500/40", bg: "bg-red-900/20", text: "text-red-500", hoverBg: "hover:bg-red-900/30" },
  yellow: {
    border: "border-yellow-500/40",
    bg: "bg-yellow-900/20",
    text: "text-yellow-500",
    hoverBg: "hover:bg-yellow-900/30",
  },
  pink: { border: "border-pink-500/40", bg: "bg-pink-900/20", text: "text-pink-500", hoverBg: "hover:bg-pink-900/30" },
  cyan: { border: "border-cyan-500/40", bg: "bg-cyan-900/20", text: "text-cyan-500", hoverBg: "hover:bg-cyan-900/30" },
  indigo: {
    border: "border-indigo-500/40",
    bg: "bg-indigo-900/20",
    text: "text-indigo-500",
    hoverBg: "hover:bg-indigo-900/30",
  },
  teal: { border: "border-teal-500/40", bg: "bg-teal-900/20", text: "text-teal-500", hoverBg: "hover:bg-teal-900/30" },
  amber: {
    border: "border-amber-500/40",
    bg: "bg-amber-900/20",
    text: "text-amber-500",
    hoverBg: "hover:bg-amber-900/30",
  },
  lime: { border: "border-lime-500/40", bg: "bg-lime-900/20", text: "text-lime-500", hoverBg: "hover:bg-lime-900/30" },
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-zinc-800 bg-zinc-900">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm font-display transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          DASHBOARD
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">GAMEPLAY GUIDE</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Intro */}
        <div className="bg-zinc-900 border-2 border-orange-500/30 p-6 mb-8">
          <h1 className="text-2xl font-display font-bold text-orange-500 mb-3">🎤 WELCOME TO BATTLE RAP UNIVERSITY</h1>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Master the art of battle rap management. This guide covers everything from attributes and prep strategies to
            badges, rivalries, and advanced tactics. Click any section below to learn more.
          </p>
          <p className="text-sm text-zinc-500 italic">
            💡 Tip: Bookmark this page. You'll reference it often as you climb the ranks.
          </p>
        </div>

        {/* Guide Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {guideCards.map((card) => {
            const Icon = card.icon
            const colors = colorClasses[card.color]

            return (
              <Link
                key={card.id}
                href={card.href}
                className={`group block ${colors.bg} ${colors.border} border-2 p-6 transition-all ${colors.hoverBg} hover:border-opacity-70`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${colors.text} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-display font-bold ${colors.text} mb-2 group-hover:underline`}>
                      {card.title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Reference */}
        <div className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h2 className="text-xl font-display font-bold text-zinc-100 mb-4">📚 QUICK REFERENCE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-display font-bold text-orange-500 mb-2">✍️ PREP FOCUS</h3>
              <ul className="space-y-1 text-zinc-400">
                <li>
                  <span className="text-green-500">■</span> 🔍 Research - Study opponent
                </li>
                <li>
                  <span className="text-orange-500">■</span> ✍️ Writing - Craft bars
                </li>
                <li>
                  <span className="text-blue-500">■</span> 🎤 Performance - Practice delivery
                </li>
                <li>
                  <span className="text-purple-500">■</span> 💰 Life - Handle personal matters
                </li>
                <li>
                  <span className="text-zinc-500">■</span> 😴 Rest - Recover & reduce stress
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold text-orange-500 mb-2">📈 TIER SYSTEM</h3>
              <ul className="space-y-1 text-zinc-400">
                <li>
                  <span className="text-zinc-600">■</span> 🚫 None (Under 800 ELO)
                </li>
                <li>
                  <span className="text-amber-700">■</span> 🥉 Low (800-1199 ELO)
                </li>
                <li>
                  <span className="text-yellow-500">■</span> 🥈 Mid (1200-1599 ELO)
                </li>
                <li>
                  <span className="text-purple-500">■</span> 🥇 Top (1600-1999 ELO)
                </li>
                <li>
                  <span className="text-orange-500">■</span> 👑 God (2000+ ELO)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
