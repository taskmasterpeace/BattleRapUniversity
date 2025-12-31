import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building } from "lucide-react"
import { getLeagueBlogger, getLeagueStats, type League } from "@/lib/leagues"
import { getVenueType } from "@/lib/venues"
import { VenueCard } from "@/components/venue-card"
import { LeagueHeader } from "@/components/leagues/league-header"
import { LeagueOverviewCards } from "@/components/leagues/league-overview-cards"
import { LeagueBloggerCard } from "@/components/leagues/league-blogger-card"
import { LeagueRoster } from "@/components/leagues/league-roster"
import { LeagueStats } from "@/components/leagues/league-stats"
import { LeagueArticles } from "@/components/leagues/league-articles"
import { LeagueExplainer } from "@/components/leagues/league-explainer"

// Server-side fetch of league data
async function getLeagueFromApi(idOrSlug: string): Promise<League | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/leagues/${idOrSlug}`, {
      cache: 'no-store' // Always get fresh data
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.league || null
  } catch (error) {
    console.error('Error fetching league:', error)
    return null
  }
}

export default async function LeagueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const league = await getLeagueFromApi(id)

  if (!league) {
    notFound()
  }

  const blogger = await getLeagueBlogger(league.id)
  const stats = await getLeagueStats(league)
  const homeVenue = league.homeVenueTypeId ? await getVenueType(league.homeVenueTypeId) : null

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Section 1: League Header Hero */}
      <LeagueHeader league={league} />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Section 2: Overview Cards */}
        <LeagueOverviewCards league={league} />

        {/* Section 3: League Blogger */}
        {blogger && <LeagueBloggerCard blogger={blogger} />}

        {/* Home Venue */}
        {homeVenue && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold">HOME VENUE</h3>
            </div>
            <div className="max-w-md">
              <Link href={`/venues/${homeVenue.id}`} className="block hover:opacity-80 transition-opacity">
                <VenueCard venue={homeVenue} cityName={league.city ? `${league.city}, ${league.state}` : undefined} compact />
              </Link>
            </div>
          </div>
        )}

        {/* Section 4: Battler Roster */}
        <LeagueRoster league={league} />

        {/* Section 5: Statistics Dashboard */}
        <LeagueStats stats={stats} basePayout={league.basePayout} />

        {/* Section 6: Recent Articles */}
        <LeagueArticles league={league} />

        {/* Section 7: Educational Explainer */}
        <LeagueExplainer league={league} />

        {/* Back Link */}
        <Link
          href="/leagues"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to League Directory
        </Link>
      </main>
    </div>
  )
}
