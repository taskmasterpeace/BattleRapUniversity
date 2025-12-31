"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Calculator, TrendingUp, AlertTriangle, Award, Flame, Target } from "lucide-react"
import type {
  PreBattleAnalysis,
  RoundMetricsSummary,
  EffectivenessMetrics,
} from "@/lib/game/metricsCalculator"

// =====================================================
// PRE-BATTLE ANALYSIS PANEL
// =====================================================

interface PreBattleAnalysisPanelProps {
  analysis: PreBattleAnalysis
  borderColor?: "green" | "red"
}

export function PreBattleAnalysisPanel({
  analysis,
  borderColor = "green",
}: PreBattleAnalysisPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { powerMetrics, riskMetrics, prepSummary, badgeBonuses } = analysis

  const borderColors = {
    green: "border-green-500",
    red: "border-red-500",
  }

  const textColors = {
    green: "text-green-400",
    red: "text-red-400",
  }

  return (
    <div className={`bg-zinc-800 rounded border-l-4 ${borderColors[borderColor]}`}>
      {/* Header */}
      <div
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-zinc-500" />
          <div>
            <p className={`text-sm font-bold ${textColors[borderColor]}`}>
              {analysis.battlerName}'s Analysis
            </p>
            <p className="text-xs text-zinc-400">
              Base: {powerMetrics.weightedBase.toFixed(1)} | Risk: {riskMetrics.riskLevel.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level={riskMetrics.riskLevel} />
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-zinc-700 p-3 space-y-4">
          {/* Base Power Section */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Base Power
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MetricRow
                label="Writing Power"
                value={powerMetrics.writingPower.toFixed(2)}
                formula="(lyr + word + cre) / 3"
              />
              <MetricRow
                label="Performance Power"
                value={powerMetrics.performancePower.toFixed(2)}
                formula="(sp + cc + del) / 3"
              />
              <MetricRow
                label="League Weight"
                value={`${(powerMetrics.leagueWeight.writing * 100).toFixed(0)}W / ${(powerMetrics.leagueWeight.performance * 100).toFixed(0)}P`}
              />
              <MetricRow
                label="Weighted Base"
                value={powerMetrics.weightedBase.toFixed(2)}
                highlight
              />
            </div>
          </div>

          {/* Prep Modifiers Section */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Award className="w-3 h-3" /> Prep Modifiers
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MetricRow
                label={`Writing Days (${prepSummary.writingDays})`}
                value={`+${powerMetrics.writingBonus.toFixed(2)}`}
                isBonus
              />
              <MetricRow
                label={`Rehearsal Days (${prepSummary.rehearsalDays})`}
                value={`+${powerMetrics.performanceBonus.toFixed(2)}`}
                isBonus
              />
              <MetricRow
                label="Modified Writing"
                value={powerMetrics.modifiedWriting.toFixed(2)}
                cap={powerMetrics.modifiedWriting >= 10}
              />
              <MetricRow
                label="Modified Performance"
                value={powerMetrics.modifiedPerformance.toFixed(2)}
                cap={powerMetrics.modifiedPerformance >= 10}
              />
              <MetricRow
                label="Prep Effectiveness"
                value={`${prepSummary.prepEffectiveness}%`}
                highlight={prepSummary.prepEffectiveness >= 80}
              />
            </div>
          </div>

          {/* Risk Factors Section */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Risk Factors
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MetricRow
                label="Choke %/Segment"
                value={`${riskMetrics.chokeProbabilityPerSegment.toFixed(1)}%`}
                isDanger={riskMetrics.chokeProbabilityPerSegment > 5}
              />
              <MetricRow
                label="Stumble %/Segment"
                value={`${riskMetrics.stumbleProbabilityPerSegment.toFixed(1)}%`}
                isDanger={riskMetrics.stumbleProbabilityPerSegment > 10}
              />
              <MetricRow
                label="Expected Chokes"
                value={riskMetrics.expectedChokesPerRound.toFixed(2)}
                isDanger={riskMetrics.expectedChokesPerRound > 0.5}
              />
              <MetricRow
                label="Expected Stumbles"
                value={riskMetrics.expectedStumblesPerRound.toFixed(2)}
                isDanger={riskMetrics.expectedStumblesPerRound > 0.5}
              />
            </div>
          </div>

          {/* Badge Bonuses */}
          {badgeBonuses.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Badge Bonuses
              </p>
              <div className="flex flex-wrap gap-1">
                {badgeBonuses.map((bb, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded text-xs text-orange-300"
                  >
                    {bb.badge}: +{(bb.bonus * 100).toFixed(0)}% {bb.contentType}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// =====================================================
// ROUND METRICS PANEL
// =====================================================

interface RoundMetricsPanelProps {
  battlerAMetrics: RoundMetricsSummary
  battlerBMetrics: RoundMetricsSummary
  battlerAName: string
  battlerBName: string
  roundNumber: number
  winner: "battlerA" | "battlerB"
}

export function RoundMetricsPanel({
  battlerAMetrics,
  battlerBMetrics,
  battlerAName,
  battlerBName,
  roundNumber,
  winner,
}: RoundMetricsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-zinc-800 rounded-lg">
      {/* Header - Collapsed View */}
      <div
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-orange-500 font-black">R{roundNumber}</span>
          <div className="flex items-center gap-4">
            <div className={`text-sm ${winner === "battlerA" ? "text-green-400 font-bold" : "text-zinc-400"}`}>
              {battlerAName}: {battlerAMetrics.averageScore.toFixed(1)} avg, {battlerAMetrics.peakScore.toFixed(1)} peak
            </div>
            <div className={`text-sm ${winner === "battlerB" ? "text-red-400 font-bold" : "text-zinc-400"}`}>
              {battlerBName}: {battlerBMetrics.averageScore.toFixed(1)} avg, {battlerBMetrics.peakScore.toFixed(1)} peak
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-bold ${
            winner === "battlerA" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}>
            {winner === "battlerA" ? battlerAName : battlerBName} WINS
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-zinc-700 p-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Battler A Metrics */}
            <BattlerRoundMetrics
              metrics={battlerAMetrics}
              name={battlerAName}
              isWinner={winner === "battlerA"}
              borderColor="green"
            />

            {/* Battler B Metrics */}
            <BattlerRoundMetrics
              metrics={battlerBMetrics}
              name={battlerBName}
              isWinner={winner === "battlerB"}
              borderColor="red"
            />
          </div>

          {/* Composite Score Comparison */}
          <div className="mt-4 p-3 bg-zinc-900 rounded">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
              Composite Score Formula: (Avg × 0.40) + (Peak × 0.35) + (Crowd × 0.25)
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className={winner === "battlerA" ? "text-green-400" : "text-zinc-400"}>
                <span className="font-bold">{battlerAName}:</span>{" "}
                ({battlerAMetrics.averageScore.toFixed(1)}×0.40) + ({battlerAMetrics.peakScore.toFixed(1)}×0.35) + ({(battlerAMetrics.crowdReaction/10).toFixed(1)}×0.25) = <span className="font-bold">{battlerAMetrics.compositeScore.toFixed(2)}</span>
              </div>
              <div className={winner === "battlerB" ? "text-red-400" : "text-zinc-400"}>
                <span className="font-bold">{battlerBName}:</span>{" "}
                ({battlerBMetrics.averageScore.toFixed(1)}×0.40) + ({battlerBMetrics.peakScore.toFixed(1)}×0.35) + ({(battlerBMetrics.crowdReaction/10).toFixed(1)}×0.25) = <span className="font-bold">{battlerBMetrics.compositeScore.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Effectiveness Impact */}
          {(battlerAMetrics.effectivenessMultiplier !== 1.0 || battlerBMetrics.effectivenessMultiplier !== 1.0) && (
            <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded">
              <p className="text-xs text-orange-300 flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span className="font-bold">Effectiveness Impact:</span>
                {battlerAMetrics.effectivenessMultiplier !== 1.0 && (
                  <span className="ml-2">
                    {battlerAName} {battlerAMetrics.effectivenessMultiplier > 1 ? '+' : ''}{battlerAMetrics.effectivenessImpact.toFixed(2)} pts
                  </span>
                )}
                {battlerBMetrics.effectivenessMultiplier !== 1.0 && (
                  <span className="ml-2">
                    {battlerBName} {battlerBMetrics.effectivenessMultiplier > 1 ? '+' : ''}{battlerBMetrics.effectivenessImpact.toFixed(2)} pts
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Individual battler's round metrics
function BattlerRoundMetrics({
  metrics,
  name,
  isWinner,
  borderColor,
}: {
  metrics: RoundMetricsSummary
  name: string
  isWinner: boolean
  borderColor: "green" | "red"
}) {
  const borderColors = {
    green: "border-green-500",
    red: "border-red-500",
  }

  return (
    <div className={`p-3 rounded border-l-2 ${borderColors[borderColor]} ${isWinner ? 'bg-zinc-700/50' : 'bg-zinc-800/50'}`}>
      <p className={`text-sm font-bold mb-2 ${isWinner ? (borderColor === 'green' ? 'text-green-400' : 'text-red-400') : 'text-zinc-400'}`}>
        {name} {isWinner && '✓'}
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <MetricRow label="Average" value={metrics.averageScore.toFixed(2)} />
        <MetricRow label="Peak" value={metrics.peakScore.toFixed(2)} highlight={metrics.peakScore >= 8.5} />
        <MetricRow label="Consistency" value={metrics.consistencyScore.toFixed(1)} />
        <MetricRow label="Crowd" value={`${metrics.crowdReaction}%`} />
        <MetricRow label="Haymakers" value={String(metrics.haymakerCount)} highlight={metrics.haymakerCount >= 2} />
        <MetricRow label="Stumbles" value={String(metrics.stumbleCount)} isDanger={metrics.stumbleCount > 0} />
        <MetricRow label="Chokes" value={String(metrics.chokeCount)} isDanger={metrics.chokeCount > 0} />
        <MetricRow label="Composite" value={metrics.compositeScore.toFixed(2)} highlight />
      </div>
    </div>
  )
}

// =====================================================
// HELPER COMPONENTS
// =====================================================

function MetricRow({
  label,
  value,
  formula,
  highlight,
  isDanger,
  isBonus,
  cap,
}: {
  label: string
  value: string
  formula?: string
  highlight?: boolean
  isDanger?: boolean
  isBonus?: boolean
  cap?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-zinc-500">{label}:</span>
      <span
        className={`font-mono ${
          isDanger ? 'text-red-400' :
          isBonus ? 'text-green-400' :
          highlight ? 'text-orange-400 font-bold' :
          cap ? 'text-yellow-400' :
          'text-zinc-300'
        }`}
        title={formula}
      >
        {value}
        {cap && ' (CAP)'}
      </span>
    </div>
  )
}

function RiskBadge({ level }: { level: string }) {
  const colors = {
    low: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400',
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${colors[level as keyof typeof colors] || colors.medium}`}>
      {level}
    </span>
  )
}

// =====================================================
// BATTLE SUMMARY PANEL
// =====================================================

interface BattleSummaryPanelProps {
  battlerAName: string
  battlerBName: string
  roundResults: Array<{
    roundNum: number
    winner: "battlerA" | "battlerB"
    battlerAMetrics: RoundMetricsSummary
    battlerBMetrics: RoundMetricsSummary
  }>
  winner: "battlerA" | "battlerB"
}

export function BattleSummaryPanel({
  battlerAName,
  battlerBName,
  roundResults,
  winner,
}: BattleSummaryPanelProps) {
  // Aggregate statistics
  const totalRounds = roundResults.length
  const aWins = roundResults.filter(r => r.winner === "battlerA").length
  const bWins = roundResults.filter(r => r.winner === "battlerB").length

  const avgScoreA = roundResults.reduce((sum, r) => sum + r.battlerAMetrics.averageScore, 0) / totalRounds
  const avgScoreB = roundResults.reduce((sum, r) => sum + r.battlerBMetrics.averageScore, 0) / totalRounds

  const totalHaymakersA = roundResults.reduce((sum, r) => sum + r.battlerAMetrics.haymakerCount, 0)
  const totalHaymakersB = roundResults.reduce((sum, r) => sum + r.battlerBMetrics.haymakerCount, 0)

  const totalChokesA = roundResults.reduce((sum, r) => sum + r.battlerAMetrics.chokeCount, 0)
  const totalChokesB = roundResults.reduce((sum, r) => sum + r.battlerBMetrics.chokeCount, 0)

  const totalStumblesA = roundResults.reduce((sum, r) => sum + r.battlerAMetrics.stumbleCount, 0)
  const totalStumblesB = roundResults.reduce((sum, r) => sum + r.battlerBMetrics.stumbleCount, 0)

  const avgCrowdA = roundResults.reduce((sum, r) => sum + r.battlerAMetrics.crowdReaction, 0) / totalRounds
  const avgCrowdB = roundResults.reduce((sum, r) => sum + r.battlerBMetrics.crowdReaction, 0) / totalRounds

  const totalCompositeA = roundResults.reduce((sum, r) => sum + r.battlerAMetrics.compositeScore, 0)
  const totalCompositeB = roundResults.reduce((sum, r) => sum + r.battlerBMetrics.compositeScore, 0)

  return (
    <div className="bg-zinc-800 rounded-lg p-4 space-y-4">
      <div className="text-center">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">Battle Complete</p>
        <p className={`text-2xl font-black ${winner === "battlerA" ? "text-green-400" : "text-red-400"}`}>
          {winner === "battlerA" ? battlerAName : battlerBName} WINS {aWins}-{bWins}
        </p>
      </div>

      {/* Stats Comparison */}
      <div className="grid grid-cols-3 gap-4 text-center">
        {/* Battler A */}
        <div className={`p-3 rounded ${winner === "battlerA" ? "bg-green-500/10 border border-green-500/30" : "bg-zinc-700/50"}`}>
          <p className="text-xs text-zinc-500 uppercase">{battlerAName}</p>
          <div className="space-y-1 mt-2">
            <p className="text-lg font-bold text-white">{totalCompositeA.toFixed(1)}</p>
            <p className="text-xs text-zinc-400">Total Composite</p>
            <p className="text-sm text-zinc-300">{avgScoreA.toFixed(2)} avg/round</p>
            <p className="text-xs">
              <span className="text-yellow-400">{totalHaymakersA}</span> haymakers |{" "}
              <span className={totalChokesA > 0 ? "text-red-400" : "text-zinc-400"}>{totalChokesA}</span> chokes |{" "}
              <span className={totalStumblesA > 0 ? "text-orange-400" : "text-zinc-400"}>{totalStumblesA}</span> stumbles
            </p>
            <p className="text-xs text-zinc-400">{avgCrowdA.toFixed(0)}% avg crowd</p>
          </div>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <span className="text-zinc-600 text-2xl font-black">VS</span>
        </div>

        {/* Battler B */}
        <div className={`p-3 rounded ${winner === "battlerB" ? "bg-red-500/10 border border-red-500/30" : "bg-zinc-700/50"}`}>
          <p className="text-xs text-zinc-500 uppercase">{battlerBName}</p>
          <div className="space-y-1 mt-2">
            <p className="text-lg font-bold text-white">{totalCompositeB.toFixed(1)}</p>
            <p className="text-xs text-zinc-400">Total Composite</p>
            <p className="text-sm text-zinc-300">{avgScoreB.toFixed(2)} avg/round</p>
            <p className="text-xs">
              <span className="text-yellow-400">{totalHaymakersB}</span> haymakers |{" "}
              <span className={totalChokesB > 0 ? "text-red-400" : "text-zinc-400"}>{totalChokesB}</span> chokes |{" "}
              <span className={totalStumblesB > 0 ? "text-orange-400" : "text-zinc-400"}>{totalStumblesB}</span> stumbles
            </p>
            <p className="text-xs text-zinc-400">{avgCrowdB.toFixed(0)}% avg crowd</p>
          </div>
        </div>
      </div>

      {/* Key Deciding Factors */}
      <div className="p-3 bg-zinc-900 rounded">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Key Factors</p>
        <div className="text-xs text-zinc-400 space-y-1">
          {totalCompositeA > totalCompositeB && (
            <p>• {battlerAName} had higher total composite score ({totalCompositeA.toFixed(1)} vs {totalCompositeB.toFixed(1)})</p>
          )}
          {totalCompositeB > totalCompositeA && (
            <p>• {battlerBName} had higher total composite score ({totalCompositeB.toFixed(1)} vs {totalCompositeA.toFixed(1)})</p>
          )}
          {totalHaymakersA > totalHaymakersB && (
            <p>• {battlerAName} landed more haymakers ({totalHaymakersA} vs {totalHaymakersB})</p>
          )}
          {totalHaymakersB > totalHaymakersA && (
            <p>• {battlerBName} landed more haymakers ({totalHaymakersB} vs {totalHaymakersA})</p>
          )}
          {totalChokesA > 0 && (
            <p className="text-red-400">• {battlerAName} choked {totalChokesA} time(s)</p>
          )}
          {totalChokesB > 0 && (
            <p className="text-red-400">• {battlerBName} choked {totalChokesB} time(s)</p>
          )}
          {Math.abs(avgCrowdA - avgCrowdB) > 10 && (
            <p>• {avgCrowdA > avgCrowdB ? battlerAName : battlerBName} had better crowd control</p>
          )}
        </div>
      </div>
    </div>
  )
}
