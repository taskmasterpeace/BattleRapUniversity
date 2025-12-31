"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { NavHeader } from "@/components/ui/nav-header"
import type { BattleInfo } from "@/lib/types"
import {
  Flame,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  Zap,
  CheckCircle,
  XCircle,
  Users,
  Star,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { RivalryHistoryModal } from "@/components/battle-prep/rivalry-history-modal"
import { VENUE_TYPES, getModifierDisplay, getCrowdIntensityDisplay, getTierBadgeClasses } from "@/lib/venues"

function VenueCard({ venueTypeId }: { venueTypeId?: string }) {
  // Default to a random venue if none specified
  const venue =
    VENUE_TYPES.find((v) => v.id === venueTypeId) || VENUE_TYPES[Math.floor(Math.random() * VENUE_TYPES.length)]

  const writingMod = getModifierDisplay(venue.writingMod)
  const perfMod = getModifierDisplay(venue.performanceMod)
  const crowdInfo = getCrowdIntensityDisplay(venue.crowdIntensity)
  const tierClasses = getTierBadgeClasses(venue.tier)

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 p-3">
      {/* Venue Header with sprite placeholder */}
      <div className="flex items-start gap-3">
        <div className="w-16 h-12 bg-zinc-900 border border-zinc-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {venue.spriteKey ? (
            <Image
              src={`/sprites/venues/${venue.spriteKey}.png`}
              alt={venue.displayName}
              width={64}
              height={48}
              className="object-cover pixelated"
            />
          ) : (
            <MapPin className="w-6 h-6 text-zinc-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-display font-bold text-zinc-100 truncate">{venue.displayName}</span>
            <span className={`text-[10px] px-1.5 py-0.5 border font-mono uppercase ${tierClasses}`}>{venue.tier}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400">
            <Users className="w-3 h-3" />
            <span className="font-mono">
              {venue.baseCap}-{venue.maxCap}
            </span>
          </div>
        </div>
      </div>

      {/* Modifiers */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="flex items-center justify-between bg-zinc-900/50 px-2 py-1.5 border border-zinc-700/50">
          <span className="text-zinc-500">Writing</span>
          <span className={`font-mono flex items-center gap-1 ${writingMod.color}`}>
            {venue.writingMod > 1 ? (
              <ArrowUp className="w-3 h-3" />
            ) : venue.writingMod < 1 ? (
              <ArrowDown className="w-3 h-3" />
            ) : null}
            {writingMod.text}
          </span>
        </div>
        <div className="flex items-center justify-between bg-zinc-900/50 px-2 py-1.5 border border-zinc-700/50">
          <span className="text-zinc-500">Perform</span>
          <span className={`font-mono flex items-center gap-1 ${perfMod.color}`}>
            {venue.performanceMod > 1 ? (
              <ArrowUp className="w-3 h-3" />
            ) : venue.performanceMod < 1 ? (
              <ArrowDown className="w-3 h-3" />
            ) : null}
            {perfMod.text}
          </span>
        </div>
      </div>

      {/* Crowd Intensity & Prestige */}
      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">Crowd:</span>
          <span className={`font-mono font-bold ${crowdInfo.color}`}>{crowdInfo.label.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < venue.prestigeLevel ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function BattleOfferCard({
  offer,
  onAccept,
  onDecline,
  onViewRivalry,
}: {
  offer: BattleInfo
  onAccept: () => void
  onDecline: () => void
  onViewRivalry?: () => void
}) {
  const difficulty = offer.opponent.rating > 1250 ? "HIGH" : offer.opponent.rating > 1150 ? "MEDIUM" : "LOW"
  const difficultyColor =
    difficulty === "HIGH" ? "text-red-500" : difficulty === "MEDIUM" ? "text-yellow-500" : "text-green-500"

  const playerRating = 1200
  const ratingDiff = offer.opponent.rating - playerRating

  return (
    <div
      className={`bg-zinc-900 border-2 ${offer.isGrudgeMatch ? "border-orange-500/50" : "border-zinc-700"} p-4 sm:p-5`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        {offer.isGrudgeMatch ? (
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-display font-bold text-orange-500 tracking-wide">GRUDGE MATCH OFFER</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-display font-bold text-zinc-400 tracking-wide">BATTLE OFFER</span>
          </div>
        )}
        <span
          className={`text-xs font-mono font-bold px-2 py-1 border ${
            difficulty === "HIGH"
              ? "bg-red-900/30 border-red-700/50 text-red-400"
              : difficulty === "MEDIUM"
                ? "bg-yellow-900/30 border-yellow-700/50 text-yellow-400"
                : "bg-green-900/30 border-green-700/50 text-green-400"
          }`}
        >
          <Zap className="w-3 h-3 inline mr-1" />
          {difficulty}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Opponent Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-zinc-800 border-2 border-zinc-600 overflow-hidden flex-shrink-0">
              <Image
                src={
                  offer.opponent.avatar || "/placeholder.svg?height=64&width=64&query=battle rapper pixel art portrait"
                }
                alt={offer.opponent.name}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-display font-bold text-zinc-100">{offer.opponent.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm text-zinc-400">{offer.opponent.tier}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-sm text-zinc-300 font-mono">
                  Rating: {offer.opponent.rating}
                  <span className={`ml-1 text-xs ${ratingDiff > 0 ? "text-red-400" : "text-green-400"}`}>
                    ({ratingDiff > 0 ? "+" : ""}
                    {ratingDiff} vs You)
                  </span>
                </span>
              </div>

              {/* Opponent Styles */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {offer.opponent.styles.map((style) => (
                  <span key={style} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-xs text-zinc-400">
                    {style}
                  </span>
                ))}
              </div>

              {/* Opponent Stats Preview */}
              {offer.opponent.attributes && (
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">PEN:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(offer.opponent.attributes.writing / 10) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-blue-400">{offer.opponent.attributes.writing.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">PERF:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${(offer.opponent.attributes.performance / 10) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-purple-400">{offer.opponent.attributes.performance.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">RES:</span>
                    <span className="font-mono text-yellow-400">{offer.opponent.attributes.resilience}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grudge Info */}
          {offer.isGrudgeMatch && offer.grudgeIntensity && (
            <div className="mt-4 p-3 bg-orange-950/30 border border-orange-800/50">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-orange-400 font-display">HEAD-TO-HEAD RECORD: 1-0 (You Lead)</span>
              </div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-orange-400 font-display">GRUDGE INTENSITY</span>
                <span className="text-orange-500 font-mono font-bold">{offer.grudgeIntensity}/100</span>
              </div>
              <div className="h-2 bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 to-red-500"
                  style={{ width: `${offer.grudgeIntensity}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">Origin: Controversial decision sparked beef</p>
            </div>
          )}

          {/* Battle Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-zinc-400">Venue:</span>
                <span className="text-zinc-200 font-mono">{offer.league}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-500 shrink-0" />
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-zinc-400">Format:</span>
                <span className="text-zinc-200 font-mono whitespace-nowrap">2-min rounds</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-zinc-400">Scheduled:</span>
                <span className="text-zinc-200 font-mono whitespace-nowrap">{offer.battleDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500 shrink-0" />
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-zinc-400">Prep Locks:</span>
                <span className="text-yellow-500 font-mono whitespace-nowrap">{offer.lockDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-xs">Record:</span>
              <span className="text-zinc-300 font-mono text-sm">{offer.opponent.record}</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-64 space-y-3 shrink-0">
          {/* Venue Card */}
          <VenueCard venueTypeId={offer.venueTypeId} />

          {/* Payout Preview */}
          {offer.payout && (
            <div className="p-3 bg-zinc-800/50 border border-zinc-700">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs font-display font-bold text-zinc-100 tracking-wide">POTENTIAL EARNINGS</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Base Pay:</span>
                  <span className="text-zinc-200 font-mono">${offer.payout.basePay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Win Bonus:</span>
                  <span className="text-green-500 font-mono">${offer.payout.winBonus}</span>
                </div>
                {offer.payout.rivalryBonus && (
                  <div className="flex justify-between">
                    <span className="text-orange-400">Rivalry Bonus:</span>
                    <span className="text-orange-500 font-mono">${offer.payout.rivalryBonus}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-zinc-700">
                  <span className="text-zinc-300 font-bold">Total:</span>
                  <span className="text-green-500 font-mono font-bold">
                    ${offer.payout.basePay + offer.payout.winBonus + (offer.payout.rivalryBonus || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-zinc-800">
        <button className="flex-1 sm:flex-none bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-4 py-2.5 text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors">
          VIEW PROFILE
        </button>
        {offer.isGrudgeMatch && (
          <button
            onClick={onViewRivalry}
            className="flex-1 sm:flex-none bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-4 py-2.5 text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors"
          >
            VIEW RIVALRY HISTORY
          </button>
        )}
        <div className="flex gap-2 flex-1 sm:flex-none sm:ml-auto">
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2.5 text-sm font-display font-bold text-white tracking-wide transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            ACCEPT
          </button>
          <button
            onClick={onDecline}
            className="flex-1 flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-800/50 border border-red-700/50 px-4 py-2.5 text-sm font-display font-bold text-red-400 tracking-wide transition-colors"
          >
            <XCircle className="w-4 h-4" />
            DECLINE
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BattleOffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<BattleInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [rivalryModalOpen, setRivalryModalOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<BattleInfo | null>(null)

  // Fetch offers from API
  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch('/api/battles/offers')
        if (res.ok) {
          const data = await res.json()
          setOffers(data.offers || [])  // ✓ Fix: API returns { offers: [...] }
        }
      } catch (error) {
        console.error('Failed to fetch offers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOffers()
  }, [])

  const handleAccept = async (offerId: string) => {
    try {
      const res = await fetch(`/api/battles/${offerId}/accept`, { method: 'POST' })
      if (res.ok) {
        router.push(`/battle/${offerId}/prep`)
      } else {
        console.error('Failed to accept battle')
      }
    } catch (error) {
      console.error('Error accepting battle:', error)
    }
  }

  const handleDecline = async (offerId: string) => {
    try {
      const res = await fetch(`/api/battles/${offerId}/decline`, { method: 'POST' })
      if (res.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== offerId))
      }
    } catch (error) {
      console.error('Error declining battle:', error)
    }
  }

  const handleViewRivalry = (offer: BattleInfo) => {
    setSelectedOffer(offer)
    setRivalryModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <NavHeader title="BATTLE OFFERS" backLabel="DASHBOARD" backHref="/dashboard" />

      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-zinc-100">Available Offers</h1>
            <span className="px-2 py-0.5 bg-orange-600 text-white text-xs font-mono font-bold">{offers.length}</span>
          </div>
          <div className="flex gap-2">
            <select className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 font-display focus:outline-none focus:border-orange-500">
              <option>All Offers</option>
              <option>Grudge Matches</option>
              <option>Regular</option>
            </select>
            <select className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 font-display focus:outline-none focus:border-orange-500">
              <option>Sort by Date</option>
              <option>Sort by Payout</option>
              <option>Sort by Difficulty</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-zinc-900 border-2 border-zinc-700 p-12 text-center">
              <span className="text-zinc-500 font-display">Loading offers...</span>
            </div>
          ) : offers.length > 0 ? (
            offers.map((offer) => (
              <BattleOfferCard
                key={offer.id}
                offer={offer}
                onAccept={() => handleAccept(offer.id)}
                onDecline={() => handleDecline(offer.id)}
                onViewRivalry={() => handleViewRivalry(offer)}
              />
            ))
          ) : (
            <div className="bg-zinc-900 border-2 border-zinc-700 p-12 text-center">
              <span className="text-zinc-500 font-display">No pending offers</span>
              <Link href="/dashboard" className="block mt-4 text-orange-500 hover:text-orange-400 text-sm font-display">
                Return to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>

      {selectedOffer && (
        <RivalryHistoryModal
          isOpen={rivalryModalOpen}
          onClose={() => setRivalryModalOpen(false)}
          opponent={selectedOffer.opponent}
          playerName="Tech Wizard"
        />
      )}
    </div>
  )
}
