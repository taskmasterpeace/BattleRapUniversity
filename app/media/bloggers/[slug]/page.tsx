"use client"

import { use } from "react"
import Link from "next/link"
import { NavHeader } from "@/components/ui/nav-header"
import { BloggerAvatar } from "@/components/media/blogger-avatar"
import { ArticleCard } from "@/components/media/article-card"
import { getBloggerBySlug, formatFollowers, BLOGGERS } from "@/lib/bloggers"
import { Users, FileText, Home, Star, TrendingUp, MessageSquare } from "lucide-react"

function generateMockArticlesForBlogger(bloggerSlug: string) {
  const articleTypes = ["battle_recap", "scandal", "rankings", "career_update", "hot_take"]
  const titles: Record<string, string[]> = {
    "battle-eyez": [
      "Coded Flux Bodies Tru Foe in Dominant 3-0 Showing",
      "Technical Breakdown: How JC Lost",
      "Bar Analysis: Best Wordplay of November",
      "Round-by-Round: The Most Debated Battle This Year",
    ],
    "marijuana-piranha": [
      "BREAKING: Top Tier Battler Caught in Ghostwriting Scandal",
      "The Beef Nobody Saw Coming: Drama Unfolds",
      "Industry Plant or Legit? We Investigate",
      "Raw Takes: Why Half These Battlers Are Fake",
    ],
    "algorithm-institute": [
      "Power Rankings Update: December 2025",
      "Statistical Analysis: Win Rates by Region",
      "Career Trajectory: Who's Rising, Who's Falling",
      "The Numbers Don't Lie: Rating Inflation Exposed",
    ],
    "small-room-report": [
      "Small Room Classic: A Night of Pure Pen Game",
      "Why the Intimate Setting Produces Better Battles",
      "Underrated Writers Who Deserve More Shine",
      "The Art of the 2-Minute Round",
    ],
    "main-stage-herald": [
      "Championship Preview: Who Takes the Crown?",
      "Main Stage Moments: The Best Crowd Reactions",
      "Big Stage, Big Pressure: Performance Analysis",
      "Entertainment Kings: Masters of the Arena",
    ],
    "underground-voice": [
      "The Story Behind the Battler: Life Events",
      "Community First: Scene Politics Explained",
      "More Than Bars: The Human Side of Battle Rap",
      "Protecting the Culture: What We Can Do",
    ],
    "coast-to-coast": [
      "Regional Breakdown: NYC vs LA Styles",
      "Midwest Grind: The Underrated Scene",
      "Southern Style: What Makes It Different",
      "International Report: Battle Rap Goes Global",
    ],
    "battle-breakdown": [
      "What Went Wrong: A Strategic Analysis",
      "Prep Strategies: How Champions Prepare",
      "The Chess Match: Breaking Down Tactics",
      "Learn From Losses: Educational Breakdown",
    ],
  }

  const bloggerTitles = titles[bloggerSlug] || titles["battle-eyez"]

  return bloggerTitles.map((title, i) => ({
    id: `${bloggerSlug}-${i}`,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title,
    type: articleTypes[i % articleTypes.length],
    excerpt: `Full coverage and analysis from ${bloggerSlug.replace(/-/g, " ")}...`,
    publishedAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    bloggerSlug,
    league: i % 2 === 0 ? "Small Room Circuit" : "Main Stage Arena",
  }))
}

export default function BloggerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const blogger = getBloggerBySlug(slug)

  if (!blogger) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-white mb-4">Blogger Not Found</h1>
          <Link href="/media" className="text-orange-500 hover:underline">
            Back to Media Hub
          </Link>
        </div>
      </div>
    )
  }

  const bloggerArticles = generateMockArticlesForBlogger(slug)

  return (
    <div className="min-h-screen bg-zinc-950">
      <NavHeader title={blogger.name.toUpperCase()} backLabel="Media Hub" backHref="/media" />

      {/* Hero Header */}
      <div className="border-b-4" style={{ borderColor: blogger.color }}>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <BloggerAvatar blogger={blogger} size="xl" showBadge />

          <h1 className="mt-6 text-3xl md:text-4xl font-display font-black uppercase text-white">{blogger.name}</h1>
          <p className="text-xl text-zinc-400 italic mt-2">"{blogger.title}"</p>

          <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm">
            {blogger.writingStyle.map((style, i) => (
              <span key={i} className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">
                {blogger.icon} {style}
              </span>
            ))}
          </div>

          <button
            className="mt-6 px-8 py-3 font-display font-bold uppercase text-black transition-colors hover:opacity-90"
            style={{ backgroundColor: blogger.color }}
          >
            Follow Blogger
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
            <FileText className="w-6 h-6 mx-auto mb-2" style={{ color: blogger.color }} />
            <div className="text-2xl font-bold text-white">{blogger.articleCount}</div>
            <div className="text-xs text-zinc-500 uppercase">Articles</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2" style={{ color: blogger.color }} />
            <div className="text-2xl font-bold text-white">{formatFollowers(blogger.followers)}</div>
            <div className="text-xs text-zinc-500 uppercase">Followers</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
            <Home className="w-6 h-6 mx-auto mb-2" style={{ color: blogger.color }} />
            <div className="text-lg font-bold text-white">{blogger.homeLeague || "Independent"}</div>
            <div className="text-xs text-zinc-500 uppercase">Home Base</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2" style={{ color: blogger.color }} />
            <div className="text-lg font-bold text-white">{blogger.specialty.split(",")[0]}</div>
            <div className="text-xs text-zinc-500 uppercase">Specialty</div>
          </div>
        </div>

        {/* Bio */}
        <div
          className="bg-zinc-900 border border-zinc-800 p-6 mb-8"
          style={{ borderLeftWidth: 4, borderLeftColor: blogger.color }}
        >
          <h2 className="font-display font-bold text-white uppercase mb-4">About</h2>
          <p className="text-zinc-300 leading-relaxed">{blogger.bio}</p>
        </div>

        {/* Notable Takes */}
        <div
          className="bg-zinc-900 border border-zinc-800 p-6 mb-8"
          style={{ borderLeftWidth: 4, borderLeftColor: blogger.color }}
        >
          <h2 className="font-display font-bold text-white uppercase mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: blogger.color }} />
            Notable Takes
          </h2>
          <div className="space-y-3">
            {blogger.notableTakes.map((take, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded">
                <span style={{ color: blogger.color }} className="mt-1 text-lg">
                  {blogger.icon}
                </span>
                <p className="text-zinc-300 italic">"{take}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Covers */}
        <div
          className="bg-zinc-900 border border-zinc-800 p-6 mb-8"
          style={{ borderLeftWidth: 4, borderLeftColor: blogger.color }}
        >
          <h2 className="font-display font-bold text-white uppercase mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: blogger.color }} />
            Coverage Focus
          </h2>
          <div className="flex flex-wrap gap-2">
            {blogger.covers.map((topic, i) => (
              <span
                key={i}
                className="px-4 py-2 text-sm font-bold border-2 rounded-full uppercase"
                style={{ borderColor: blogger.color, color: blogger.color }}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Related Bloggers */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 mb-8">
          <h2 className="font-display font-bold text-white uppercase mb-4">Other Bloggers</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {BLOGGERS.filter((b) => b.slug !== slug)
              .slice(0, 4)
              .map((b) => (
                <Link
                  key={b.slug}
                  href={`/media/bloggers/${b.slug}`}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <span>{b.icon}</span>
                  <span className="text-sm font-bold text-white">{b.name}</span>
                </Link>
              ))}
          </div>
        </div>

        {/* Recent Articles */}
        <div>
          <h2 className="font-display font-bold text-white uppercase mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: blogger.color }} />
            Recent Articles by {blogger.name}
          </h2>
          <div className="space-y-4">
            {bloggerArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
