"use client"

import type React from "react"

import Link from "next/link"
import { NavHeader } from "@/components/ui/nav-header"
import { BloggerAvatar } from "@/components/media/blogger-avatar"
import { BLOGGERS } from "@/lib/bloggers"
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Eye,
  Flame,
  BarChart3,
  Mic,
  Crown,
  Fish as Fist,
  Globe,
  Brain,
  ChevronRight,
  Monitor,
  Smartphone,
  MousePointer,
} from "lucide-react"

const bloggerIcons: Record<string, React.ReactNode> = {
  "battle-eyez": <Eye className="w-5 h-5" />,
  "marijuana-piranha": <Flame className="w-5 h-5" />,
  "algorithm-institute": <BarChart3 className="w-5 h-5" />,
  "small-room-report": <Mic className="w-5 h-5" />,
  "main-stage-herald": <Crown className="w-5 h-5" />,
  "underground-voice": <Fist className="w-5 h-5" />,
  "coast-to-coast": <Globe className="w-5 h-5" />,
  "battle-breakdown": <Brain className="w-5 h-5" />,
}

function ScreenshotPlaceholder({
  title,
  description,
  aspectRatio = "16/9",
}: {
  title: string
  description: string
  aspectRatio?: string
}) {
  return (
    <div
      className="relative bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg overflow-hidden"
      style={{ aspectRatio }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        <Monitor className="w-12 h-12 text-zinc-600 mb-3" />
        <p className="text-sm font-display font-bold text-zinc-400 uppercase">{title}</p>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </div>
    </div>
  )
}

function SectionHeader({ title, subtitle, color = "orange" }: { title: string; subtitle: string; color?: string }) {
  return (
    <div className="mb-6">
      <h2 className={`text-2xl md:text-3xl font-display font-black uppercase text-${color}-500`}>{title}</h2>
      <p className="text-zinc-400 mt-1">{subtitle}</p>
    </div>
  )
}

export default function BloggersGuidePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <NavHeader title="BLOGGER SYSTEM" backLabel="Guide" backHref="/guide" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border-b-4 border-orange-500">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 bg-orange-500/20 text-orange-500 text-sm font-display font-bold uppercase rounded-full mb-4">
              Core Content System
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tight">
              The 8 Bloggers
            </h1>
            <p className="text-lg text-zinc-400 mt-4 max-w-2xl mx-auto">
              The bloggers are the voice of the game world. Every article is written by one of them. Players should
              recognize them, follow them, and understand their biases.
            </p>
          </div>

          {/* 16:9 Hero Screenshot */}
          <ScreenshotPlaceholder title="Media Hub Overview" description="16:9 screenshot of the main media hub page" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-3xl font-display font-black text-white">8</div>
            <div className="text-xs text-zinc-500 uppercase">Unique Bloggers</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-cyan-500" />
            <div className="text-3xl font-display font-black text-white">5</div>
            <div className="text-xs text-zinc-500 uppercase">Article Types</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-3xl font-display font-black text-white">32+</div>
            <div className="text-xs text-zinc-500 uppercase">Notable Takes</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-3xl font-display font-black text-white">2</div>
            <div className="text-xs text-zinc-500 uppercase">League Focus</div>
          </div>
        </div>

        {/* Section 1: Meet the Bloggers */}
        <section className="mb-16">
          <SectionHeader
            title="Meet the Bloggers"
            subtitle="Each blogger has a unique personality, color, and coverage focus"
          />

          {/* 16:9 Screenshot */}
          <div className="mb-8">
            <ScreenshotPlaceholder title="Bloggers Grid" description="16:9 screenshot of all 8 blogger cards" />
          </div>

          {/* Blogger Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BLOGGERS.map((blogger) => (
              <div
                key={blogger.slug}
                className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 flex gap-4"
                style={{ borderLeftWidth: 4, borderLeftColor: blogger.color }}
              >
                <div className="flex-shrink-0">
                  <BloggerAvatar blogger={blogger} size="lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: blogger.color }}>{bloggerIcons[blogger.slug]}</span>
                    <h3 className="font-display font-bold text-white uppercase">{blogger.name}</h3>
                  </div>
                  <p className="text-sm text-zinc-500 italic mb-2">"{blogger.title}"</p>
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{blogger.bio}</p>
                  <div className="flex flex-wrap gap-1">
                    {blogger.covers.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs font-bold rounded"
                        style={{ backgroundColor: `${blogger.color}20`, color: blogger.color }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Blogger Profile Anatomy */}
        <section className="mb-16">
          <SectionHeader
            title="Blogger Profile Anatomy"
            subtitle="Understanding each section of a blogger's profile page"
            color="cyan"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Screenshot */}
            <div>
              <ScreenshotPlaceholder
                title="Blogger Profile Page"
                description="16:9 screenshot of a blogger's full profile"
              />
            </div>

            {/* Right: Breakdown */}
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 p-4">
                <h4 className="font-display font-bold text-cyan-500 uppercase mb-2">1. Header Section</h4>
                <p className="text-sm text-zinc-400">
                  Avatar (96px), name, title, writing style tags, and follow button. The header uses the blogger's
                  signature color as the border accent.
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4">
                <h4 className="font-display font-bold text-cyan-500 uppercase mb-2">2. Stats Row</h4>
                <p className="text-sm text-zinc-400">
                  Four stat cards showing: Articles written, Follower count, Home league, and Primary specialty.
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4">
                <h4 className="font-display font-bold text-cyan-500 uppercase mb-2">3. Bio Section</h4>
                <p className="text-sm text-zinc-400">
                  Full biography explaining the blogger's background, reputation, and what makes their coverage unique.
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4">
                <h4 className="font-display font-bold text-cyan-500 uppercase mb-2">4. Notable Takes</h4>
                <p className="text-sm text-zinc-400">
                  4 signature quotes that define the blogger's perspective and biases. Each styled with the blogger's
                  icon.
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4">
                <h4 className="font-display font-bold text-cyan-500 uppercase mb-2">5. Recent Articles</h4>
                <p className="text-sm text-zinc-400">
                  Scrollable list of articles written by this blogger with type badges and timestamps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Article Types */}
        <section className="mb-16">
          <SectionHeader
            title="Article Types"
            subtitle="Different content categories bloggers write about"
            color="green"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { type: "Battle Recap", color: "red", desc: "Round-by-round breakdowns of battles" },
              { type: "Scandal", color: "orange", desc: "Drama, beef, and controversy" },
              { type: "Rankings", color: "cyan", desc: "Power rankings and tier lists" },
              { type: "Career Update", color: "green", desc: "Milestones and achievements" },
              { type: "Hot Take", color: "purple", desc: "Opinion pieces and predictions" },
            ].map((item) => (
              <div key={item.type} className="bg-zinc-900 border border-zinc-800 p-4 text-center">
                <span
                  className={`inline-block px-3 py-1 text-xs font-display font-bold uppercase rounded bg-${item.color}-500/20 text-${item.color}-500 mb-3`}
                >
                  {item.type}
                </span>
                <p className="text-xs text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* 16:9 Screenshot */}
          <ScreenshotPlaceholder title="Article Feed" description="16:9 screenshot showing different article types" />
        </section>

        {/* Section 4: Navigation Flows */}
        <section className="mb-16">
          <SectionHeader title="Navigation Flows" subtitle="How users move through the media system" color="purple" />

          <div className="bg-zinc-900 border border-zinc-800 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MousePointer className="w-5 h-5 text-purple-500" />
              <h4 className="font-display font-bold text-white uppercase">Click Paths</h4>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-zinc-400">
                <span className="px-3 py-1 bg-zinc-800 text-white font-bold rounded">Media Hub</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
                <span className="px-3 py-1 bg-zinc-800 text-white font-bold rounded">Bloggers Tab</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
                <span className="px-3 py-1 bg-purple-500/20 text-purple-500 font-bold rounded">Blogger Profile</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <span className="px-3 py-1 bg-zinc-800 text-white font-bold rounded">Article Card</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
                <span className="px-3 py-1 bg-zinc-800 text-white font-bold rounded">Click Byline</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
                <span className="px-3 py-1 bg-purple-500/20 text-purple-500 font-bold rounded">Blogger Profile</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <span className="px-3 py-1 bg-zinc-800 text-white font-bold rounded">League Page</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
                <span className="px-3 py-1 bg-zinc-800 text-white font-bold rounded">League Blogger</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
                <span className="px-3 py-1 bg-purple-500/20 text-purple-500 font-bold rounded">Blogger Profile</span>
              </div>
            </div>
          </div>

          {/* URL Structure */}
          <div className="bg-zinc-900 border border-zinc-800 p-6">
            <h4 className="font-display font-bold text-white uppercase mb-4">URL Structure</h4>
            <div className="font-mono text-sm space-y-2">
              <div className="flex items-start gap-4">
                <code className="text-orange-500">/media</code>
                <span className="text-zinc-500">→ Main hub (For You tab)</span>
              </div>
              <div className="flex items-start gap-4">
                <code className="text-orange-500">/media?tab=bloggers</code>
                <span className="text-zinc-500">→ Bloggers grid</span>
              </div>
              <div className="flex items-start gap-4">
                <code className="text-orange-500">/media/bloggers/battle-eyez</code>
                <span className="text-zinc-500">→ Blogger profile</span>
              </div>
              <div className="flex items-start gap-4">
                <code className="text-orange-500">/media/[article-slug]</code>
                <span className="text-zinc-500">→ Article detail</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: UI Components */}
        <section className="mb-16">
          <SectionHeader title="UI Components" subtitle="Building blocks of the blogger system" color="yellow" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* BloggerAvatar */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h4 className="font-display font-bold text-yellow-500 uppercase mb-4">BloggerAvatar</h4>
              <div className="flex items-center gap-4 mb-4">
                {BLOGGERS.slice(0, 4).map((b) => (
                  <BloggerAvatar key={b.slug} blogger={b} size="md" />
                ))}
              </div>
              <p className="text-xs text-zinc-400">Sizes: sm (32px), md (48px), lg (64px), xl (96px)</p>
            </div>

            {/* BloggerByline */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h4 className="font-display font-bold text-yellow-500 uppercase mb-4">BloggerByline</h4>
              <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                <BloggerAvatar blogger={BLOGGERS[0]} size="sm" />
                <span>
                  By <span className="text-white font-bold">{BLOGGERS[0].name}</span>
                </span>
                <span>•</span>
                <span>2 hours ago</span>
              </div>
              <p className="text-xs text-zinc-400">Compact variant for article cards</p>
            </div>

            {/* BloggerSelector */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h4 className="font-display font-bold text-yellow-500 uppercase mb-4">BloggerSelector</h4>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                <span className="px-3 py-1 bg-orange-500 text-black text-xs font-bold rounded-full whitespace-nowrap">
                  All
                </span>
                {BLOGGERS.slice(0, 3).map((b) => (
                  <span
                    key={b.slug}
                    className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-full whitespace-nowrap"
                  >
                    {b.icon} {b.name.split(" ")[0]}
                  </span>
                ))}
              </div>
              <p className="text-xs text-zinc-400">Pill or dropdown variants</p>
            </div>

            {/* ArticleCard */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h4 className="font-display font-bold text-yellow-500 uppercase mb-4">ArticleCard</h4>
              <ScreenshotPlaceholder title="Article Card" description="Compact article preview" aspectRatio="4/3" />
              <p className="text-xs text-zinc-400 mt-3">Compact, Featured, or List variants</p>
            </div>

            {/* BloggerCard */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h4 className="font-display font-bold text-yellow-500 uppercase mb-4">BloggerCard</h4>
              <ScreenshotPlaceholder title="Blogger Card" description="Full blogger preview" aspectRatio="4/3" />
              <p className="text-xs text-zinc-400 mt-3">Used in bloggers grid</p>
            </div>

            {/* Color Coding */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h4 className="font-display font-bold text-yellow-500 uppercase mb-4">Color System</h4>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {BLOGGERS.map((b) => (
                  <div
                    key={b.slug}
                    className="aspect-square rounded"
                    style={{ backgroundColor: b.color }}
                    title={b.name}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-400">Each blogger has unique color</p>
            </div>
          </div>
        </section>

        {/* Section 6: Mobile vs Desktop */}
        <section className="mb-16">
          <SectionHeader title="Responsive Design" subtitle="Optimized for both mobile and desktop" color="pink" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Desktop */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="w-5 h-5 text-pink-500" />
                <h4 className="font-display font-bold text-white uppercase">Desktop View</h4>
              </div>
              <ScreenshotPlaceholder title="Desktop Layout" description="16:9 screenshot of desktop media hub" />
              <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                <li>• 3-column blogger grid</li>
                <li>• Sidebar widgets always visible</li>
                <li>• Full article previews</li>
                <li>• Horizontal blogger selector</li>
              </ul>
            </div>

            {/* Mobile */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-pink-500" />
                <h4 className="font-display font-bold text-white uppercase">Mobile View</h4>
              </div>
              <ScreenshotPlaceholder
                title="Mobile Layout"
                description="9:16 screenshot of mobile media hub"
                aspectRatio="9/16"
              />
              <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                <li>• Single column layout</li>
                <li>• Collapsible sidebar widgets</li>
                <li>• Compact article cards</li>
                <li>• Scrollable blogger pills</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Quick Reference */}
        <section className="bg-zinc-900 border-2 border-orange-500/30 p-6">
          <h2 className="text-xl font-display font-bold text-orange-500 mb-6">QUICK REFERENCE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-display font-bold text-white uppercase mb-3">Blogger Colors</h3>
              <div className="space-y-2 text-sm">
                {BLOGGERS.map((b) => (
                  <div key={b.slug} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: b.color }} />
                    <span className="text-zinc-400">{b.name}</span>
                    <span className="text-zinc-600 font-mono text-xs">{b.color}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display font-bold text-white uppercase mb-3">League Focus</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-zinc-800 p-3 rounded">
                  <span className="text-orange-500 font-bold">Small Room Circuit</span>
                  <p className="text-zinc-400 text-xs mt-1">Battle Eyez, Small Room Report</p>
                </div>
                <div className="bg-zinc-800 p-3 rounded">
                  <span className="text-yellow-500 font-bold">Main Stage Arena</span>
                  <p className="text-zinc-400 text-xs mt-1">Main Stage Herald</p>
                </div>
                <div className="bg-zinc-800 p-3 rounded">
                  <span className="text-zinc-400 font-bold">Independent</span>
                  <p className="text-zinc-400 text-xs mt-1">MP, AI, UV, C2C, TBB</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/media"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-black font-display font-bold uppercase transition-colors"
          >
            Explore Media Hub
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
