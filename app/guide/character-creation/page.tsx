"use client"

import Link from "next/link"
import { ArrowLeft, User, MapPin, Trophy, Star } from "lucide-react"

export default function CharacterCreationPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-zinc-800 bg-zinc-900">
        <Link
          href="/guide"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm font-display transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO GUIDE
        </Link>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-green-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">CHARACTER CREATION</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Overview */}
        <section className="bg-zinc-900 border-2 border-green-500/30 p-6">
          <h2 className="text-2xl font-display font-bold text-green-500 mb-4">CREATING YOUR BATTLER</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Your battler is defined by their stage name, home city, attributes, and initial league choice. These
            decisions shape your entire career path, so choose wisely.
          </p>
        </section>

        {/* Stage Name */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5" />
            STAGE NAME
          </h3>
          <p className="text-zinc-300 mb-4">Pick something memorable! Must be 3-20 characters.</p>
          <div className="bg-zinc-800 border-l-4 border-green-500 p-4">
            <p className="text-sm font-display font-bold text-green-500 mb-2">EXAMPLES:</p>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• "Pattern Master" - Technical writer vibe</li>
              <li>• "Stage Commander" - Performance beast</li>
              <li>• "The Surgeon" - Precision and angles</li>
              <li>• "Cipher King" - Freestyle specialist</li>
            </ul>
          </div>
        </section>

        {/* Home City */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            HOME CITY & REGION
          </h3>
          <p className="text-zinc-300 mb-4">
            Select your city from 45+ major US cities. Your city determines your region, tier, and initial league
            access.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-zinc-800 p-4 border-l-4 border-purple-500">
              <h4 className="font-display font-bold text-purple-500 mb-2">MAJOR CITIES</h4>
              <p className="text-xs text-zinc-400 mb-2">Population 1M+</p>
              <p className="text-sm text-zinc-300">
                <strong>Bonus:</strong> +10% crowd energy
              </p>
              <p className="text-xs text-zinc-500 mt-2">Examples: NYC, LA, Chicago</p>
            </div>
            <div className="bg-zinc-800 p-4 border-l-4 border-blue-500">
              <h4 className="font-display font-bold text-blue-500 mb-2">REGIONAL</h4>
              <p className="text-xs text-zinc-400 mb-2">Population 300K-1M</p>
              <p className="text-sm text-zinc-300">
                <strong>Bonus:</strong> +15% local tournament
              </p>
              <p className="text-xs text-zinc-500 mt-2">Examples: Austin, Portland</p>
            </div>
            <div className="bg-zinc-800 p-4 border-l-4 border-green-500">
              <h4 className="font-display font-bold text-green-500 mb-2">UNDERGROUND</h4>
              <p className="text-xs text-zinc-400 mb-2">Population under 300K</p>
              <p className="text-sm text-zinc-300">
                <strong>Bonus:</strong> +5% authenticity
              </p>
              <p className="text-xs text-zinc-500 mt-2">Examples: Smaller cities</p>
            </div>
          </div>
        </section>

        {/* Attributes */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-3">ATTRIBUTES (1-8 SCALE)</h3>
          <p className="text-zinc-300 mb-4">You have 25 points to distribute across 7 core attributes.</p>

          <div className="space-y-6">
            {/* Writing */}
            <div>
              <h4 className="font-display font-bold text-green-500 mb-3">WRITING ATTRIBUTES</h4>
              <div className="space-y-3">
                <div className="bg-zinc-800 p-3">
                  <h5 className="font-display text-sm text-zinc-100 mb-1">LYRICISM</h5>
                  <p className="text-xs text-zinc-400">
                    Word choice, metaphor depth, poetic quality. Key for Small Room Circuit.
                  </p>
                </div>
                <div className="bg-zinc-800 p-3">
                  <h5 className="font-display text-sm text-zinc-100 mb-1">WORDPLAY</h5>
                  <p className="text-xs text-zinc-400">Double meanings, puns, clever setups. Judges love this.</p>
                </div>
                <div className="bg-zinc-800 p-3">
                  <h5 className="font-display text-sm text-zinc-100 mb-1">CREATIVITY</h5>
                  <p className="text-xs text-zinc-400">
                    Unique angles, unexpected approaches. Freestylers need this high.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div>
              <h4 className="font-display font-bold text-blue-500 mb-3">PERFORMANCE ATTRIBUTES</h4>
              <div className="space-y-3">
                <div className="bg-zinc-800 p-3">
                  <h5 className="font-display text-sm text-zinc-100 mb-1">FLOW</h5>
                  <p className="text-xs text-zinc-400">
                    Rhythm, cadence, delivery smoothness. Main Stage Arena values this.
                  </p>
                </div>
                <div className="bg-zinc-800 p-3">
                  <h5 className="font-display text-sm text-zinc-100 mb-1">STAGE PRESENCE</h5>
                  <p className="text-xs text-zinc-400">Command of the room, confidence, energy projection.</p>
                </div>
                <div className="bg-zinc-800 p-3">
                  <h5 className="font-display text-sm text-zinc-100 mb-1">CHARISMA</h5>
                  <p className="text-xs text-zinc-400">Crowd connection, likeability. Helps with sponsors and media.</p>
                </div>
              </div>
            </div>

            {/* Resilience */}
            <div>
              <h4 className="font-display font-bold text-purple-500 mb-3">RESILIENCE (STANDALONE)</h4>
              <div className="bg-zinc-800 p-3">
                <h5 className="font-display text-sm text-zinc-100 mb-1">RESILIENCE</h5>
                <p className="text-xs text-zinc-400">
                  Ability to handle pressure and avoid choking. Every battler needs at least 5.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
            <p className="text-sm font-display font-bold text-yellow-500 mb-2">ATTRIBUTE TIERS:</p>
            <ul className="text-sm text-zinc-300 space-y-1">
              <li>
                <strong>1-2:</strong> <span className="text-red-500">Weak</span> - Noticeable liability
              </li>
              <li>
                <strong>3-4:</strong> <span className="text-yellow-500">Below Average</span> - Room for improvement
              </li>
              <li>
                <strong>5-6:</strong> <span className="text-blue-500">Competent</span> - Solid foundation
              </li>
              <li>
                <strong>7-8:</strong> <span className="text-purple-500">Exceptional</span> - Defining strength
              </li>
            </ul>
          </div>
        </section>

        {/* Preset Builds */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            PRESET BUILDS
          </h3>
          <p className="text-zinc-300 mb-4">Not sure where to start? Use one of these proven archetypes:</p>

          <div className="space-y-4">
            <div className="bg-zinc-800 border-l-4 border-green-500 p-4">
              <h4 className="font-display font-bold text-green-500 mb-2">TECHNICAL WRITER</h4>
              <p className="text-sm text-zinc-400 mb-3">Best for: Small Room Circuit domination via complex bars</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                <div>Lyricism: 8</div>
                <div>Wordplay: 8</div>
                <div>Creativity: 7</div>
                <div>Flow: 5</div>
                <div>Stage Presence: 4</div>
                <div>Charisma: 5</div>
                <div>Resilience: 5</div>
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-blue-500 p-4">
              <h4 className="font-display font-bold text-blue-500 mb-2">PERFORMER</h4>
              <p className="text-sm text-zinc-400 mb-3">Best for: Main Stage Arena energy and crowd control</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                <div>Lyricism: 5</div>
                <div>Wordplay: 5</div>
                <div>Creativity: 6</div>
                <div>Flow: 8</div>
                <div>Stage Presence: 8</div>
                <div>Charisma: 7</div>
                <div>Resilience: 6</div>
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-purple-500 p-4">
              <h4 className="font-display font-bold text-purple-500 mb-2">BALANCED</h4>
              <p className="text-sm text-zinc-400 mb-3">Best for: Adaptable all-arounder, works in both leagues</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                <div>Lyricism: 6</div>
                <div>Wordplay: 6</div>
                <div>Creativity: 6</div>
                <div>Flow: 6</div>
                <div>Stage Presence: 6</div>
                <div>Charisma: 6</div>
                <div>Resilience: 6</div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/guide"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 text-zinc-100 font-display transition-colors"
          >
            ← BACK TO GUIDE
          </Link>
          <Link
            href="/guide/prep"
            className="px-6 py-3 bg-green-600 hover:bg-green-500 border-2 border-green-400 text-white font-display transition-colors"
          >
            NEXT: PREP PHASE →
          </Link>
        </div>
      </div>
    </div>
  )
}
