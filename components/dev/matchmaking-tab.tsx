"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users, DollarSign, Target, MapPin, TrendingUp,
  Calendar, Zap, RefreshCw, ChevronDown, ChevronRight,
  Swords, Trophy, AlertTriangle
} from "lucide-react"

interface LeagueSummary {
  id: string
  name: string
  tier: string
  budget: number
  max_battles: number
  cards_per_month: number
  min_prep_days: number
  style_weights: Record<string, number>
  regional_preference: string | null
}

interface BattlerSummary {
  id: string
  name: string
  tier: string
  base_fee: number
  calculated_fee: number
  region: string | null
  styles: string[]
  status: string
  is_ai: boolean
  streak: number
  popularity: number
}

interface ScoredBattler {
  battler_id: string
  stage_name: string
  tier_match: number
  style_fit: number
  regional_bonus: number
  momentum: number
  rivalry_potential: number
  availability: number
  total: number
  booking_fee: number
  breakdown: string[]
  is_available: boolean
  availability_reason?: string
}

interface CardSimulation {
  league: { name: string; tier: string; budget: number }
  scheduled_date: string
  total_budget: number
  positions: { position: string; order: number; allocated_budget: number }[]
  matchups: {
    position: { position: string; allocated_budget: number }
    matchup: {
      battler_a: string
      battler_a_tier: string
      battler_a_fee: number
      battler_b: string
      battler_b_tier: string
      battler_b_fee: number
      combined_score: number
      combined_fee: number
      is_sequel: boolean
      sequel_info?: { number: number; reason: string }
      score_breakdown: {
        battler_a: ScoredBattler
        battler_b: ScoredBattler
      }
    } | null
  }[]
  debug_info: {
    candidates_considered: number
    matchups_evaluated: number
    budget_remaining: number
  }
}

export function MatchmakingTab() {
  const [leagues, setLeagues] = useState<LeagueSummary[]>([])
  const [battlersByTier, setBattlersByTier] = useState<Record<string, BattlerSummary[]>>({})
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  const [scoredBattlers, setScoredBattlers] = useState<ScoredBattler[]>([])
  const [cardSimulation, setCardSimulation] = useState<CardSimulation | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    leagues: true,
    battlers: false,
    scores: false,
    card: false,
  })

  useEffect(() => {
    loadOverview()
  }, [])

  const loadOverview = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dev/matchmaking?action=overview')
      const data = await res.json()
      setLeagues(data.leagues || [])
      setBattlersByTier(data.battlers_by_tier || {})
    } catch (error) {
      console.error('Error loading matchmaking data:', error)
    }
    setLoading(false)
  }

  const loadLeagueScores = async (leagueId: string) => {
    setLoading(true)
    setSelectedLeague(leagueId)
    try {
      const res = await fetch(`/api/dev/matchmaking?action=score_battlers&league_id=${leagueId}`)
      const data = await res.json()
      setScoredBattlers(data.scored_battlers || [])
      setExpandedSections(prev => ({ ...prev, scores: true }))
    } catch (error) {
      console.error('Error loading scores:', error)
    }
    setLoading(false)
  }

  const simulateCard = async (leagueId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dev/matchmaking?action=simulate_card&league_id=${leagueId}`)
      const data = await res.json()
      setCardSimulation(data)
      setExpandedSections(prev => ({ ...prev, card: true }))
    } catch (error) {
      console.error('Error simulating card:', error)
    }
    setLoading(false)
  }

  const generateOffers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/internal/generate-battle-offers', { method: 'POST' })
      const data = await res.json()
      alert(`Generated ${data.offers_created || 0} battle offers!`)
    } catch (error) {
      console.error('Error generating offers:', error)
      alert('Error generating offers')
    }
    setLoading(false)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'god': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
      case 'top': return 'text-purple-400 bg-purple-500/20 border-purple-500/50'
      case 'mid': return 'text-blue-400 bg-blue-500/20 border-blue-500/50'
      case 'low': return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/50'
      default: return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/50'
    }
  }

  const getLeagueTierColor = (tier: string) => {
    switch (tier) {
      case 'premier': return 'text-yellow-400'
      case 'national': return 'text-purple-400'
      case 'regional': return 'text-blue-400'
      case 'underground': return 'text-green-400'
      case 'virtual': return 'text-zinc-400'
      default: return 'text-zinc-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-orange-500">
          MATCHMAKING DEBUG
        </h2>
        <div className="flex gap-2">
          <button
            onClick={loadOverview}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-sm font-display border border-zinc-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
          <button
            onClick={generateOffers}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-sm font-display disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            GENERATE OFFERS
          </button>
        </div>
      </div>

      {/* Leagues Section */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader
          className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
          onClick={() => toggleSection('leagues')}
        >
          <CardTitle className="flex items-center justify-between text-zinc-100">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              LEAGUES ({leagues.length})
            </span>
            {expandedSections.leagues ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.leagues && (
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              {leagues.map(league => (
                <div
                  key={league.id}
                  className={`p-3 border ${selectedLeague === league.id ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 bg-zinc-800/50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-display font-bold text-zinc-100">{league.name}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 border ${getLeagueTierColor(league.tier)}`}>
                        {league.tier.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadLeagueScores(league.id)}
                        className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 font-display"
                      >
                        SCORE BATTLERS
                      </button>
                      <button
                        onClick={() => simulateCard(league.id)}
                        className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 font-display"
                      >
                        SIMULATE CARD
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-green-500" />
                      <span className="text-zinc-400">Budget:</span>
                      <span className="text-zinc-100">${league.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Swords className="w-3 h-3 text-red-500" />
                      <span className="text-zinc-400">Max Battles:</span>
                      <span className="text-zinc-100">{league.max_battles}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      <span className="text-zinc-400">Cards/Month:</span>
                      <span className="text-zinc-100">{league.cards_per_month}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-purple-500" />
                      <span className="text-zinc-400">Region:</span>
                      <span className="text-zinc-100">{league.regional_preference || 'Any'}</span>
                    </div>
                  </div>
                  {league.style_weights && Object.keys(league.style_weights).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(league.style_weights).map(([style, weight]) => (
                        <span
                          key={style}
                          className={`text-[10px] px-1.5 py-0.5 border ${
                            weight > 1 ? 'border-green-500/50 text-green-400' :
                            weight < 1 ? 'border-red-500/50 text-red-400' :
                            'border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {style}: {weight}x
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Battlers Overview Section */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader
          className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
          onClick={() => toggleSection('battlers')}
        >
          <CardTitle className="flex items-center justify-between text-zinc-100">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              BATTLERS BY TIER
            </span>
            {expandedSections.battlers ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.battlers && (
          <CardContent>
            {['god', 'top', 'mid', 'low'].map(tier => (
              <div key={tier} className="mb-4">
                <h4 className={`text-sm font-display font-bold mb-2 ${getTierColor(tier).split(' ')[0]}`}>
                  {tier.toUpperCase()} TIER ({battlersByTier[tier]?.length || 0})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {battlersByTier[tier]?.slice(0, 8).map(b => (
                    <div
                      key={b.id}
                      className={`p-2 text-xs border ${b.is_ai ? 'border-zinc-800' : 'border-orange-500/50 bg-orange-500/10'}`}
                    >
                      <div className="font-bold text-zinc-100 truncate">{b.name}</div>
                      <div className="flex justify-between text-zinc-400">
                        <span>${b.calculated_fee.toLocaleString()}</span>
                        <span className={b.streak > 0 ? 'text-green-400' : b.streak < 0 ? 'text-red-400' : ''}>
                          {b.streak > 0 ? `+${b.streak}` : b.streak}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Scored Battlers Section */}
      {scoredBattlers.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader
            className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
            onClick={() => toggleSection('scores')}
          >
            <CardTitle className="flex items-center justify-between text-zinc-100">
              <span className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                BATTLER SCORES FOR SELECTED LEAGUE
              </span>
              {expandedSections.scores ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.scores && (
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-zinc-400 border-b border-zinc-800">
                      <th className="text-left p-2">Battler</th>
                      <th className="text-center p-2">Tier</th>
                      <th className="text-center p-2">Style</th>
                      <th className="text-center p-2">Region</th>
                      <th className="text-center p-2">Momentum</th>
                      <th className="text-center p-2">Rivalry</th>
                      <th className="text-center p-2">Avail</th>
                      <th className="text-center p-2 font-bold">TOTAL</th>
                      <th className="text-right p-2">Fee</th>
                      <th className="text-center p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoredBattlers.slice(0, 20).map((b, i) => (
                      <tr
                        key={b.battler_id}
                        className={`border-b border-zinc-800/50 ${!b.is_available ? 'opacity-50' : ''}`}
                      >
                        <td className="p-2 font-bold text-zinc-100">
                          {i + 1}. {b.stage_name}
                        </td>
                        <td className="text-center p-2">{b.tier_match}/25</td>
                        <td className="text-center p-2">{b.style_fit.toFixed(1)}/25</td>
                        <td className="text-center p-2">{b.regional_bonus}/15</td>
                        <td className="text-center p-2">{b.momentum}/15</td>
                        <td className="text-center p-2">{b.rivalry_potential}/10</td>
                        <td className="text-center p-2">{b.availability}/10</td>
                        <td className="text-center p-2 font-bold text-orange-400">{b.total}/100</td>
                        <td className="text-right p-2 text-green-400">${b.booking_fee.toLocaleString()}</td>
                        <td className="text-center p-2">
                          {b.is_available ? (
                            <span className="text-green-400">✓</span>
                          ) : (
                            <span className="text-red-400" title={b.availability_reason}>✗</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Card Simulation Section */}
      {cardSimulation && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader
            className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
            onClick={() => toggleSection('card')}
          >
            <CardTitle className="flex items-center justify-between text-zinc-100">
              <span className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-orange-500" />
                SIMULATED CARD: {cardSimulation.league.name}
              </span>
              {expandedSections.card ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.card && (
            <CardContent className="space-y-4">
              {/* Card Info */}
              <div className="flex justify-between items-center p-3 bg-zinc-800/50 border border-zinc-700">
                <div className="text-sm">
                  <span className="text-zinc-400">Date: </span>
                  <span className="text-zinc-100">{cardSimulation.scheduled_date}</span>
                </div>
                <div className="text-sm">
                  <span className="text-zinc-400">Budget: </span>
                  <span className="text-green-400">${cardSimulation.total_budget.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-zinc-400">Remaining: </span>
                  <span className="text-blue-400">${cardSimulation.debug_info.budget_remaining.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-zinc-400">Evaluated: </span>
                  <span className="text-zinc-100">{cardSimulation.debug_info.matchups_evaluated} matchups</span>
                </div>
              </div>

              {/* Matchups */}
              <div className="space-y-3">
                {cardSimulation.matchups.map((m, i) => (
                  <div
                    key={i}
                    className={`p-4 border ${
                      m.position.position === 'main_event' ? 'border-yellow-500/50 bg-yellow-500/5' :
                      m.position.position === 'co_main' ? 'border-purple-500/50 bg-purple-500/5' :
                      'border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 font-display font-bold ${
                          m.position.position === 'main_event' ? 'bg-yellow-500 text-black' :
                          m.position.position === 'co_main' ? 'bg-purple-500 text-white' :
                          'bg-zinc-700 text-zinc-300'
                        }`}>
                          {m.position.position.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-zinc-500">
                          Budget: ${m.position.allocated_budget.toLocaleString()}
                        </span>
                      </div>
                      {m.matchup?.is_sequel && (
                        <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/50">
                          SEQUEL #{m.matchup.sequel_info?.number}
                        </span>
                      )}
                    </div>

                    {m.matchup ? (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-lg font-display font-bold text-zinc-100">
                            {m.matchup.battler_a}
                            <span className={`ml-2 text-xs px-1.5 py-0.5 border ${getTierColor(m.matchup.battler_a_tier)}`}>
                              {m.matchup.battler_a_tier.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400">
                            Fee: ${m.matchup.battler_a_fee.toLocaleString()} |
                            Score: {m.matchup.score_breakdown.battler_a.total}/100
                          </div>
                        </div>

                        <div className="px-4 text-center">
                          <div className="text-2xl font-display font-black text-orange-500">VS</div>
                          <div className="text-xs text-zinc-500">
                            Combined: {m.matchup.combined_score.toFixed(0)}
                          </div>
                        </div>

                        <div className="flex-1 text-right">
                          <div className="text-lg font-display font-bold text-zinc-100">
                            <span className={`mr-2 text-xs px-1.5 py-0.5 border ${getTierColor(m.matchup.battler_b_tier)}`}>
                              {m.matchup.battler_b_tier.toUpperCase()}
                            </span>
                            {m.matchup.battler_b}
                          </div>
                          <div className="text-xs text-zinc-400">
                            Fee: ${m.matchup.battler_b_fee.toLocaleString()} |
                            Score: {m.matchup.score_breakdown.battler_b.total}/100
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-zinc-500">
                        <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                        No suitable matchup found for this slot
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
