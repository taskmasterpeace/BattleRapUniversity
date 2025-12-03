import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building } from "lucide-react"
import { getLeague, getLeagueBlogger, getLeagueStats } from "@/lib/leagues"
import { getVenueType } from "@/lib/venues"
import { VenueCard } from "@/components/venue-card"
import { LeagueHeader } from "@/components/leagues/league-header"
import { LeagueOverviewCards } from "@/components/leagues/league-overview-cards"
import { LeagueBloggerCard } from "@/components/leagues/league-blogger-card"
import { LeagueRoster } from "@/components/leagues/league-roster"
import { LeagueStats } from "@/components/leagues/league-stats"
import { LeagueArticles } from "@/components/leagues/league-articles"
import { LeagueExplainer } from "@/components/leagues/league-explainer"

export default async function LeagueDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const league = await getLeague(id)

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
            <Link href={`/venues/${homeVenue.id}`}>
              <VenueCard venue={homeVenue} cityName={league.city ? `${league.city}, ${league.state}` : undefined} />
            </Link>
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
