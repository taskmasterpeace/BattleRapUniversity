"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, Clock, Share2, Bookmark, Flame } from "lucide-react"
import { mockArticles, mockRivalries } from "@/lib/data"

const TYPE_COLORS: Record<string, string> = {
  battle_recap: "bg-blue-900/50 text-blue-400 border-blue-700/50",
  scandal: "bg-red-900/50 text-red-400 border-red-700/50",
  career_update: "bg-green-900/50 text-green-400 border-green-700/50",
  league_update: "bg-purple-900/50 text-purple-400 border-purple-700/50",
  grudge_coverage: "bg-orange-900/50 text-orange-400 border-orange-700/50",
}

export default function ArticleDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  // Find article by slug
  const article = mockArticles.find((a) => a.slug === slug) || mockArticles[0]

  // Check if this is a grudge match article
  const isGrudgeMatch = article.type === "grudge_coverage" || article.title.toLowerCase().includes("grudge")
  const relatedRivalry = isGrudgeMatch ? mockRivalries[0] : null

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-zinc-800 bg-zinc-900">
        <Link
          href="/media"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm font-display transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO MEDIA
        </Link>
        <div className="flex items-center gap-3">
          <button className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Article Header */}
        <div className="mb-8">
          {/* Type Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`px-3 py-1 text-xs font-display font-bold uppercase tracking-wide border ${TYPE_COLORS[article.type] || TYPE_COLORS.battle_recap}`}
            >
              {article.type.replace("_", " ")}
            </span>
            {isGrudgeMatch && (
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-display font-bold uppercase tracking-wide border bg-orange-900/50 text-orange-400 border-orange-700/50">
                <Flame className="w-3 h-3" />
                GRUDGE MATCH
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-zinc-100 tracking-tight mb-4">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <span>By AIBR Media</span>
            <span className="text-zinc-700">•</span>
            <span>{article.date}</span>
            <span className="text-zinc-700">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />5 min read
            </span>
            <span className="text-zinc-700">•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.views || 234} views
            </span>
          </div>
        </div>

        {/* Rivalry Context Panel (for grudge matches) */}
        {isGrudgeMatch && relatedRivalry && (
          <div className="bg-zinc-900 border-2 border-orange-500/30 p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-display font-bold text-orange-500 tracking-wide">RIVALRY CONTEXT</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-3">
              This battle is part of the ongoing rivalry between <span className="text-zinc-100">Tech Wizard</span> and{" "}
              <span className="text-zinc-100">{relatedRivalry.opponent.name}</span>
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="text-zinc-500">Head-to-Head:</span>
                <span className="text-zinc-100 font-mono ml-2">2-1 (You lead)</span>
              </div>
              <div>
                <span className="text-zinc-500">Grudge Intensity:</span>
                <span className="text-orange-500 font-mono ml-2">{relatedRivalry.intensity}/100</span>
              </div>
            </div>
            <Link href={`/battler/tech-wizard`} className="text-xs text-orange-500 hover:text-orange-400 font-display">
              VIEW FULL RIVALRY HISTORY →
            </Link>
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-invert prose-zinc max-w-none">
          <div className="text-zinc-300 leading-relaxed space-y-4">
            <p className="text-lg">
              {article.excerpt ||
                "The atmosphere was electric as two of the league's most talented battlers faced off in what many are calling the most anticipated matchup of the season."}
            </p>

            <p>
              From the opening round, it was clear that both competitors had done their homework. The crowd hung on
              every bar, every punchline landing with devastating precision. The judges were visibly impressed by the
              level of preparation on display.
            </p>

            <blockquote className="border-l-4 border-orange-500 pl-4 italic text-zinc-400">
              "This is what battle rap is all about. Two warriors leaving it all on the stage. The culture is alive and
              well."
              <footer className="text-zinc-500 text-sm mt-2">— League Commissioner</footer>
            </blockquote>

            <p>
              Round two saw the momentum shift dramatically. What started as a close contest became a masterclass in
              wordplay and delivery. The crowd's reaction told the whole story - this was a performance for the ages.
            </p>

            <h2 className="text-xl font-display font-bold text-zinc-100 mt-8 mb-4">Key Moments</h2>

            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>Opening haymaker in Round 1 that set the tone for the entire battle</li>
              <li>Mid-round scheme that had the crowd going wild</li>
              <li>Devastating personal angle that nearly silenced the room</li>
              <li>Comeback sequence that showed championship-level composure</li>
            </ul>

            <p>
              As the final votes were tallied, the tension in the room was palpable. When the decision was announced,
              the reaction was immediate and visceral. This battle will be talked about for years to come.
            </p>

            <h2 className="text-xl font-display font-bold text-zinc-100 mt-8 mb-4">What's Next</h2>

            <p>
              With this victory, questions immediately turn to what comes next. The rematch demands are already flooding
              social media, and league officials are reportedly in discussions about a potential championship bout.
            </p>
          </div>
        </article>

        {/* Battle Link */}
        {article.type === "battle_recap" && (
          <div className="mt-8 p-4 bg-zinc-900 border-2 border-zinc-700">
            <p className="text-sm text-zinc-400 mb-3">Want to see the full breakdown?</p>
            <Link
              href="/battle/1"
              className="inline-block bg-orange-600 hover:bg-orange-500 px-6 py-2.5 text-sm font-display font-bold text-white transition-colors"
            >
              VIEW BATTLE BREAKDOWN
            </Link>
          </div>
        )}

        {/* Related Articles */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">RELATED COVERAGE</h3>
          <div className="space-y-3">
            {mockArticles
              .filter((a) => a.slug !== slug)
              .slice(0, 3)
              .map((related) => (
                <Link
                  key={related.id}
                  href={`/media/${related.slug}`}
                  className="block p-3 bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-colors"
                >
                  <span className="text-sm text-zinc-200 font-display block">{related.title}</span>
                  <span className="text-xs text-zinc-500">{related.date}</span>
                </Link>
              ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/media"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm font-display transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO MEDIA
          </Link>
          <Link
            href="/dashboard"
            className="text-orange-500 hover:text-orange-400 text-sm font-display transition-colors"
          >
            DASHBOARD →
          </Link>
        </div>
      </main>
    </div>
  )
}
