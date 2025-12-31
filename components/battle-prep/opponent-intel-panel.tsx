"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SecretBadge, SecretBadgeRow, type SecretType } from "@/components/ui/secret-badge"
import { SECRETS, type SecretDefinition } from "@/lib/data/secrets"
import {
  Search, Eye, Lock, Skull, AlertTriangle, Shield,
  ChevronDown, ChevronUp, Crosshair, Sparkles
} from "lucide-react"
import type { ResearchLevel } from "@/lib/types"

interface DiscoveredSecret {
  type: SecretType
  discoveredAt: string
  discoveryMethod: string
  hasProof: boolean
  storylineId?: string
  storylineTitle?: string
}

interface OpponentIntelPanelProps {
  battleId: string
  opponentId: string
  opponentName: string
  researchLevel: ResearchLevel
  researchDays: number
  onSelectSecret?: (secret: DiscoveredSecret) => void
  className?: string
}

// Get available secrets based on research level
function getAvailableSecrets(researchDays: number): SecretType[] {
  return Object.values(SECRETS)
    .filter(secret => secret.researchDaysRequired <= researchDays)
    .map(secret => secret.type)
}

// Mock discovered secrets - in production this comes from API
function getMockDiscoveredSecrets(researchDays: number, opponentId: string): DiscoveredSecret[] {
  // Simulate progressive discovery based on research days
  const secrets: DiscoveredSecret[] = []

  // Easy discoveries (1-2 days)
  if (researchDays >= 1) {
    secrets.push({
      type: 'no-show',
      discoveredAt: new Date().toISOString(),
      discoveryMethod: 'research',
      hasProof: true,
      storylineTitle: 'The No-Call No-Show',
    })
  }

  if (researchDays >= 2) {
    secrets.push({
      type: 'crew-beef',
      discoveredAt: new Date().toISOString(),
      discoveryMethod: 'social_media',
      hasProof: true,
      storylineTitle: 'The Twitter Beef',
    })
  }

  // Medium discoveries (3-4 days)
  if (researchDays >= 3) {
    secrets.push({
      type: 'broke',
      discoveredAt: new Date().toISOString(),
      discoveryMethod: 'research',
      hasProof: false,
      storylineTitle: 'The Eviction Notice',
    })
  }

  // Hard discoveries (5+ days)
  if (researchDays >= 5) {
    secrets.push({
      type: 'fake-gangster',
      discoveredAt: new Date().toISOString(),
      discoveryMethod: 'blogger',
      hasProof: true,
      storylineTitle: 'The LinkedIn Profile',
    })
  }

  return secrets
}

export function OpponentIntelPanel({
  battleId,
  opponentId,
  opponentName,
  researchLevel,
  researchDays,
  onSelectSecret,
  className = "",
}: OpponentIntelPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const [discoveredSecrets, setDiscoveredSecrets] = useState<DiscoveredSecret[]>([])
  const [selectedSecret, setSelectedSecret] = useState<DiscoveredSecret | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch discovered secrets from API
    async function fetchIntel() {
      try {
        // TODO: Replace with actual API call
        // const res = await fetch(`/api/battles/${battleId}/intel`)
        // const data = await res.json()
        // setDiscoveredSecrets(data.secrets)

        // For now, use mock data based on research days
        const mockSecrets = getMockDiscoveredSecrets(researchDays, opponentId)
        setDiscoveredSecrets(mockSecrets)
      } catch (error) {
        console.error('Failed to fetch intel:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIntel()
  }, [battleId, opponentId, researchDays])

  const handleSecretClick = (secret: DiscoveredSecret) => {
    setSelectedSecret(selectedSecret?.type === secret.type ? null : secret)
    onSelectSecret?.(secret)
  }

  const secretData = selectedSecret ? SECRETS[selectedSecret.type] : null

  return (
    <div className={`bg-zinc-900 border-2 border-zinc-700 ${className}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-blue-400" />
          <span className="text-lg font-display font-bold text-zinc-100">
            INTEL ON {opponentName.toUpperCase()}
          </span>
          {discoveredSecrets.length > 0 && (
            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 text-xs font-bold rounded">
              {discoveredSecrets.length} SECRETS
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-zinc-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Research Status */}
              <div className={`p-3 rounded-lg border ${
                researchLevel === 'aggressive'
                  ? 'bg-green-500/10 border-green-500/30'
                  : researchLevel === 'casual'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Search className={`w-4 h-4 ${
                    researchLevel === 'aggressive' ? 'text-green-400' :
                    researchLevel === 'casual' ? 'text-yellow-400' : 'text-red-400'
                  }`} />
                  <span className="text-sm font-bold text-zinc-300">
                    {researchLevel.toUpperCase()} RESEARCH ({researchDays} days)
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {researchLevel === 'aggressive'
                    ? 'Deep intel unlocked. You have access to damaging secrets.'
                    : researchLevel === 'casual'
                      ? 'Basic intel available. Add more research days for deeper secrets.'
                      : 'No research done. Add research days to uncover opponent intel.'}
                </p>
              </div>

              {/* No Secrets State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}

              {!loading && discoveredSecrets.length === 0 && (
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-zinc-400">No secrets discovered yet</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Add research days to your prep to uncover opponent intel
                  </p>
                </div>
              )}

              {/* Discovered Secrets Grid */}
              {!loading && discoveredSecrets.length > 0 && (
                <div>
                  <div className="text-xs text-zinc-500 uppercase mb-2">Discovered Secrets</div>
                  <div className="flex flex-wrap gap-2">
                    {discoveredSecrets.map((secret) => (
                      <button
                        key={secret.type}
                        onClick={() => handleSecretClick(secret)}
                        className={`relative p-2 rounded-lg border-2 transition-all ${
                          selectedSecret?.type === secret.type
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800'
                        }`}
                      >
                        <SecretBadge type={secret.type} size="md" showTooltip={false} />
                        {secret.hasProof && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Shield className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Secret Detail */}
              {selectedSecret && secretData && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <SecretBadge type={selectedSecret.type} size="lg" showTooltip={false} />
                    <div className="flex-1">
                      <h4 className="font-display font-bold text-white">{secretData.name}</h4>
                      <p className="text-xs text-zinc-400">{secretData.description}</p>
                      {selectedSecret.storylineTitle && (
                        <p className="text-xs text-blue-400 mt-1 italic">
                          "{selectedSecret.storylineTitle}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Damage Level */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-zinc-500 uppercase">Damage:</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Skull
                          key={i}
                          className={`w-4 h-4 ${i < secretData.damageLevel ? 'text-red-500' : 'text-zinc-700'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Battle Effects Preview */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-green-500/10 border border-green-500/30 p-2 rounded text-center">
                      <div className="text-lg font-bold text-green-400">
                        +{secretData.battleEffects.crowdReaction}
                      </div>
                      <div className="text-[10px] text-green-400/70 uppercase">Crowd</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 p-2 rounded text-center">
                      <div className="text-lg font-bold text-red-400">
                        {secretData.battleEffects.opponentMorale}
                      </div>
                      <div className="text-[10px] text-red-400/70 uppercase">Morale</div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-2 rounded text-center">
                      <div className="text-lg font-bold text-yellow-400">
                        {selectedSecret.hasProof
                          ? secretData.battleEffects.riskOfBackfire
                          : secretData.fabricationBackfireChance}%
                      </div>
                      <div className="text-[10px] text-yellow-400/70 uppercase">Backfire</div>
                    </div>
                  </div>

                  {/* Proof Status */}
                  <div className={`flex items-center gap-2 p-2 rounded ${
                    selectedSecret.hasProof
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-yellow-500/10 border border-yellow-500/30'
                  }`}>
                    {selectedSecret.hasProof ? (
                      <>
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400 font-bold">VERIFIED - Has receipts</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-bold">UNVERIFIED - Higher backfire risk</span>
                      </>
                    )}
                  </div>

                  {/* 8 Mile Defense Note */}
                  {secretData.canBeOwned && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                      <Sparkles className="w-3 h-3" />
                      <span>This secret can be "owned" - opponent might pre-empt it</span>
                    </div>
                  )}

                  {/* Use as Angle/Personal Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => {
                        // TODO: Open segment creator with this secret as a personal
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded transition-colors"
                    >
                      <Crosshair className="w-4 h-4" />
                      USE AS PERSONAL
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Open angle builder with this secret
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      BUILD AS ANGLE
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Research Progress */}
              {researchDays > 0 && researchDays < 7 && (
                <div className="border-t border-zinc-700 pt-4">
                  <div className="text-xs text-zinc-500 uppercase mb-2">Secrets Requiring More Research</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.values(SECRETS)
                      .filter(s => s.researchDaysRequired > researchDays && s.discoveryMethods.includes('research'))
                      .slice(0, 5)
                      .map((secret) => (
                        <div
                          key={secret.type}
                          className="relative opacity-50 grayscale"
                          title={`Needs ${secret.researchDaysRequired} research days`}
                        >
                          <SecretBadge type={secret.type} size="sm" showTooltip={false} />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                            <Lock className="w-3 h-3 text-zinc-400" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
