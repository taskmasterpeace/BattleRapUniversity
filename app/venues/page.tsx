"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Filter } from "lucide-react"
import { VENUE_TYPES, type VenueTier } from "@/lib/venues"
import { VenueCard } from "@/components/venue-card"

const TIERS: VenueTier[] = ["virtual", "small", "medium", "large"]

export default function VenuesPage() {
  const [selectedTier, setSelectedTier] = useState<VenueTier | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredVenues = VENUE_TYPES.filter((venue) => {
    const matchesTier = selectedTier === "all" || venue.tier === selectedTier
    const matchesSearch =
      venue.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.vibe.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTier && matchesSearch
  })

  const venuesByTier = TIERS.reduce(
    (acc, tier) => {
      acc[tier] = filteredVenues.filter((v) => v.tier === tier)
      return acc
    },
    {} as Record<VenueTier, typeof VENUE_TYPES>,
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">VENUE CATALOG</h1>
            <span className="text-sm text-zinc-500">({VENUE_TYPES.length} venues)</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedTier("all")}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  selectedTier === "all"
                    ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                All
              </button>
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors capitalize ${
                    selectedTier === tier
                      ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Venues by Tier */}
        {selectedTier === "all" ? (
          TIERS.map((tier) => {
            const venues = venuesByTier[tier]
            if (venues.length === 0) return null

            return (
              <section key={tier} className="mb-8">
                <h2 className="text-lg font-bold mb-4 capitalize flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      tier === "virtual"
                        ? "bg-blue-500"
                        : tier === "small"
                          ? "bg-orange-500"
                          : tier === "medium"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                    }`}
                  />
                  {tier} Tier
                  <span className="text-sm text-zinc-500 font-normal">({venues.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {venues.map((venue) => (
                    <Link key={venue.id} href={`/venues/${venue.id}`}>
                      <VenueCard venue={venue} />
                    </Link>
                  ))}
                </div>
              </section>
            )
          })
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVenues.map((venue) => (
              <Link key={venue.id} href={`/venues/${venue.id}`}>
                <VenueCard venue={venue} />
              </Link>
            ))}
          </div>
        )}

        {filteredVenues.length === 0 && (
          <div className="text-center py-12 text-zinc-500">No venues found matching your criteria.</div>
        )}
      </main>
    </div>
  )
}
