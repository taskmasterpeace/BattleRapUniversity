"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Search, Skull, AlertTriangle, Shield } from "lucide-react"
import { SecretBadge, SecretBadgeRow, ALL_SECRET_TYPES, SECRET_DATA, type SecretType } from "@/components/ui/secret-badge"
import { SECRETS, getOwnableSecrets, getFabricatableSecrets } from "@/lib/data/secrets"
import { ALL_SECRET_STORYLINES, getStorylinesForSecret, type SecretStoryline } from "@/lib/data/secret-storylines"

export default function DevSecretsPage() {
  const [selectedSecret, setSelectedSecret] = useState<SecretType | null>(null)
  const [showStorylines, setShowStorylines] = useState(true)

  const ownableSecrets = getOwnableSecrets()
  const fabricatableSecrets = getFabricatableSecrets()

  const selectedSecretData = selectedSecret ? SECRETS[selectedSecret] : null
  const selectedStorylines = selectedSecret ? getStorylinesForSecret(selectedSecret) : []

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b-2 border-orange-900/50 bg-zinc-900/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dev" className="text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-display font-bold text-orange-400">DEV: SECRETS & INTEL</h1>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1">
                {ALL_SECRET_TYPES.length} types | {ALL_SECRET_STORYLINES.length} storylines
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* All Secret Badges Grid */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-4 text-zinc-300">ALL SECRET TYPES</h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-4">
            {ALL_SECRET_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedSecret(type === selectedSecret ? null : type)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  selectedSecret === type
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900'
                }`}
              >
                <SecretBadge type={type} size="lg" showTooltip={false} />
                <span className="text-[10px] font-bold uppercase text-zinc-400 text-center leading-tight">
                  {SECRET_DATA[type].label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Selected Secret Detail */}
        {selectedSecretData && selectedSecret && (
          <section className="mb-8 bg-zinc-900 border-2 border-zinc-700 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <SecretBadge type={selectedSecret} size="lg" showTooltip={false} />
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold text-white mb-1">
                  {selectedSecretData.name}
                </h3>
                <p className="text-sm text-zinc-400 mb-4">{selectedSecretData.description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-zinc-800 p-3 rounded">
                    <div className="text-xs text-zinc-500 uppercase mb-1">Damage Level</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Skull
                          key={i}
                          className={`w-4 h-4 ${i < selectedSecretData.damageLevel ? 'text-red-500' : 'text-zinc-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-zinc-800 p-3 rounded">
                    <div className="text-xs text-zinc-500 uppercase mb-1">Discovery</div>
                    <div className="text-sm font-bold text-orange-400">
                      {selectedSecretData.discoveryDifficulty.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="bg-zinc-800 p-3 rounded">
                    <div className="text-xs text-zinc-500 uppercase mb-1">Research Days</div>
                    <div className="text-sm font-bold text-blue-400">
                      {selectedSecretData.researchDaysRequired} days
                    </div>
                  </div>
                  <div className="bg-zinc-800 p-3 rounded">
                    <div className="text-xs text-zinc-500 uppercase mb-1">Backfire Risk</div>
                    <div className="text-sm font-bold text-yellow-400">
                      {selectedSecretData.battleEffects.riskOfBackfire}%
                    </div>
                  </div>
                </div>

                {/* Battle Effects */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-green-500/10 border border-green-500/30 p-3 rounded">
                    <div className="text-xs text-green-400 uppercase mb-1">Crowd Reaction</div>
                    <div className="text-lg font-bold text-green-400">
                      {selectedSecretData.battleEffects.crowdReaction > 0 ? '+' : ''}
                      {selectedSecretData.battleEffects.crowdReaction}
                    </div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded">
                    <div className="text-xs text-red-400 uppercase mb-1">Opponent Morale</div>
                    <div className="text-lg font-bold text-red-400">
                      {selectedSecretData.battleEffects.opponentMorale}
                    </div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded">
                    <div className="text-xs text-purple-400 uppercase mb-1">Attribute Effects</div>
                    <div className="text-xs font-mono text-purple-300">
                      {Object.entries(selectedSecretData.attributeEffects).map(([k, v]) => (
                        <div key={k}>{k}: {v}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Flags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSecretData.canBeOwned && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                      <Shield className="w-3 h-3" />
                      Can be "owned" ({selectedSecretData.ownedDamageReduction}% reduction)
                    </span>
                  )}
                  {selectedSecretData.canBeFabricated && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">
                      <AlertTriangle className="w-3 h-3" />
                      Can be fabricated ({selectedSecretData.fabricationBackfireChance}% backfire)
                    </span>
                  )}
                  {selectedSecretData.discoveryMethods.map((method) => (
                    <span key={method} className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded">
                      {method}
                    </span>
                  ))}
                </div>

                {/* Angle Types */}
                <div className="text-xs text-zinc-500">
                  <span className="uppercase font-bold">Angle types: </span>
                  {selectedSecretData.angleTypes.join(', ')}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Storylines for Selected Secret */}
        {selectedSecret && selectedStorylines.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-zinc-300">
                STORYLINES ({selectedStorylines.length})
              </h2>
              <button
                onClick={() => setShowStorylines(!showStorylines)}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
              >
                {showStorylines ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showStorylines ? 'Hide' : 'Show'}
              </button>
            </div>

            {showStorylines && (
              <div className="space-y-3">
                {selectedStorylines.map((storyline) => (
                  <StorylineCard key={storyline.id} storyline={storyline} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">{ALL_SECRET_TYPES.length}</div>
            <div className="text-xs text-zinc-500 uppercase">Secret Types</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{ALL_SECRET_STORYLINES.length}</div>
            <div className="text-xs text-zinc-500 uppercase">Storylines</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{ownableSecrets.length}</div>
            <div className="text-xs text-zinc-500 uppercase">Ownable (8 Mile style)</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{fabricatableSecrets.length}</div>
            <div className="text-xs text-zinc-500 uppercase">Can Be Made Up</div>
          </div>
        </section>

        {/* Sample Row Display */}
        <section className="mt-8">
          <h2 className="text-lg font-display font-bold mb-4 text-zinc-300">BADGE ROW PREVIEW</h2>
          <div className="space-y-4">
            <div className="bg-zinc-900 p-4 rounded-lg">
              <div className="text-xs text-zinc-500 mb-2">Opponent has 3 known secrets:</div>
              <SecretBadgeRow secrets={['snitch', 'fake-gangster', 'no-show']} size="md" />
            </div>
            <div className="bg-zinc-900 p-4 rounded-lg">
              <div className="text-xs text-zinc-500 mb-2">Opponent has 6 known secrets (with overflow):</div>
              <SecretBadgeRow secrets={['snitch', 'fake-gangster', 'no-show', 'baby-mama-drama', 'pressed', 'broke']} size="md" maxVisible={4} />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function StorylineCard({ storyline }: { storyline: SecretStoryline }) {
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-bold text-white mb-1">{storyline.title}</h4>
          <p className="text-sm text-zinc-400 mb-2">{storyline.description}</p>

          {/* Discovery Text */}
          <div className="bg-zinc-900 p-3 rounded mb-2">
            <div className="text-xs text-zinc-500 uppercase mb-1">Discovery Text:</div>
            <p className="text-sm text-zinc-300 italic">"{storyline.discoveryText}"</p>
          </div>

          {/* Media Headline */}
          {storyline.mediaHeadline && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded">
              <div className="text-xs text-red-400 uppercase mb-1">Media Headline:</div>
              <p className="text-sm text-red-300 font-bold">{storyline.mediaHeadline}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 text-right">
          <span className={`text-xs px-2 py-1 rounded ${
            storyline.discoveryMethod === 'research' ? 'bg-blue-500/20 text-blue-400' :
            storyline.discoveryMethod === 'blogger' ? 'bg-red-500/20 text-red-400' :
            storyline.discoveryMethod === 'crew' ? 'bg-green-500/20 text-green-400' :
            storyline.discoveryMethod === 'social_media' ? 'bg-purple-500/20 text-purple-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {storyline.discoveryMethod.replace('_', ' ')}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${
            storyline.severityModifier > 0 ? 'bg-red-500/20 text-red-400' :
            storyline.severityModifier < 0 ? 'bg-green-500/20 text-green-400' :
            'bg-zinc-700 text-zinc-400'
          }`}>
            {storyline.severityModifier > 0 ? '+' : ''}{storyline.severityModifier.toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  )
}
