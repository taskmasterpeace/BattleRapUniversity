"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBattler } from "@/contexts/battler-context"
import type { Battler } from "@/lib/types"
import { BattlerPortrait } from "@/components/battler-portrait"
import { Users, Star, Check, Search, Loader2, UserPlus, Sparkles, Swords } from "lucide-react"

export default function RosterPage() {
  const { activeBattler, switchBattler, battlers, loading } = useBattler()
  const [searchQuery, setSearchQuery] = useState("")
  const [tierFilter, setTierFilter] = useState<string>("all")

  const filteredBattlers = battlers.filter((battler) => {
    const matchesSearch = battler.stageName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
    const matchesTier = tierFilter === "all" || battler.tier?.toLowerCase().includes(tierFilter)
    return matchesSearch && matchesTier
  })

  const handleSelectBattler = (battler: Battler) => {
    switchBattler(battler.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // Empty state - no battlers signed
  if (battlers.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-32 h-32 mx-auto mb-6 bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
              <Swords className="w-16 h-16 text-zinc-600" />
            </div>
            <h1 className="text-2xl font-display font-black text-zinc-200 mb-2">YOUR ROSTER IS EMPTY</h1>
            <p className="text-zinc-500 max-w-md">
              Sign an existing battler from the pool or create your own custom battler to get started.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/roster/sign">
              <Button
                className="bg-orange-600 hover:bg-orange-500 text-white font-display font-bold px-8 py-6 text-lg flex items-center gap-3"
              >
                <UserPlus className="w-6 h-6" />
                SIGN A BATTLER
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white font-display font-bold px-8 py-6 text-lg flex items-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                CREATE CUSTOM
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xs text-zinc-600 max-w-sm text-center"
          >
            Signing a battler lets you play immediately with a pre-built character. Creating a custom battler lets you choose your own name, style, and starting league.
          </motion.p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-display font-black text-zinc-200">YOUR ROSTER</h1>
          <p className="text-sm text-zinc-500">{battlers.length} battler{battlers.length !== 1 ? 's' : ''} signed</p>
        </div>
        <div className="flex gap-2">
          <Link href="/roster/sign">
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-display text-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Battler
            </Button>
          </Link>
          <Link href="/onboarding">
            <Button className="bg-orange-600 hover:bg-orange-500 text-white font-display text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search battlers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 font-display text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "rookie", "prospect", "contender", "veteran", "elite", "legend"].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-2 text-xs font-display font-bold uppercase whitespace-nowrap transition-colors ${
                tierFilter === tier
                  ? "bg-orange-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Battlers Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBattlers.map((battler, index) => {
          const isActive = activeBattler?.id === battler.id

          return (
            <motion.div
              key={battler.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card
                className={`bg-zinc-900 border-zinc-800 transition-all cursor-pointer ${
                  isActive ? "border-orange-500 ring-2 ring-orange-500/20" : "hover:border-orange-500/50"
                }`}
                onClick={() => handleSelectBattler(battler)}
              >
                <CardContent className="p-3">
                  <div className="relative">
                    <div className="w-full aspect-square border border-zinc-700 bg-zinc-800 overflow-hidden mb-2">
                      <BattlerPortrait battler={battler} size="lg" showFrame={false} />
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-zinc-100 text-sm truncate">{battler.stageName}</h3>
                  <p className="text-xs text-zinc-500 mb-2">{battler.region}</p>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-400 font-display font-bold uppercase">{battler.tier}</span>
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {battler.stats?.clout || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredBattlers.length === 0 && battlers.length > 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No battlers found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
