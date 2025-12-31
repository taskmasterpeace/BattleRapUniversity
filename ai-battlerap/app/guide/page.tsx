'use client';

import Link from 'next/link';

export default function GameplayGuidePage() {
  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#2d2f35]/50">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link href="/dashboard" className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm uppercase tracking-wider font-bold mb-4 inline-block">
            ← DASHBOARD
          </Link>
          <h1 className="text-4xl font-display font-black tracking-tighter mb-2">GAMEPLAY GUIDE</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-wide">
            Everything you need to know about Battle Rap University
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Game Loop */}
        <section className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8 rounded-lg">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42] mb-6">The Game Loop</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="text-3xl font-black text-[#ff8c42]">1</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Accept Battle Offers</h3>
                <p className="text-zinc-400 text-sm">
                  AI opponents will challenge you. Check their stats, rating, and tier before accepting.
                  Battles are scheduled 7-14 days in the future.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl font-black text-[#ff8c42]">2</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Prepare for Battle</h3>
                <p className="text-zinc-400 text-sm">
                  Choose your daily focus: Research (angles), Writing (bars), Performance (stage presence),
                  Rest (reduce stress), or Life (personal balance). Your prep directly impacts battle performance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl font-black text-[#ff8c42]">3</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Battle Simulates</h3>
                <p className="text-zinc-400 text-sm">
                  Watch segment-by-segment results. See your peaks (haymakers), consistency, crowd reaction,
                  and whether you choked. Best 2 out of 3 rounds wins.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl font-black text-[#ff8c42]">4</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Grow & Progress</h3>
                <p className="text-zinc-400 text-sm">
                  Win or lose, your attributes improve. Earn badges, handle life events, manage stress,
                  and climb the rankings. New battle offers arrive automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Attributes System */}
        <section className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8 rounded-lg">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42] mb-6">Attributes (1-10 Scale)</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-3 text-blue-400">Writing Attributes</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-sm text-zinc-300">Lyricism</p>
                  <p className="text-xs text-zinc-500">Quality of your wordsmithing and vocabulary</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-300">Wordplay</p>
                  <p className="text-xs text-zinc-500">Double entendres and clever punchlines</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-300">Creativity</p>
                  <p className="text-xs text-zinc-500">Unique angles and original concepts</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-300">Flow</p>
                  <p className="text-xs text-zinc-500">Rhythm and cadence delivery</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-red-400">Performance Attributes</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-sm text-zinc-300">Stage Presence</p>
                  <p className="text-xs text-zinc-500">Command of the stage and energy</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-300">Crowd Control</p>
                  <p className="text-xs text-zinc-500">Ability to work and hype the crowd</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-300">Delivery</p>
                  <p className="text-xs text-zinc-500">Voice projection and clarity</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-green-400">Personal Attributes</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-sm text-zinc-300">Resilience</p>
                  <p className="text-xs text-zinc-500">Mental fortitude and choke resistance</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-300">Reputation</p>
                  <p className="text-xs text-zinc-500">Respect in the battle rap community</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-300">Financial Stability</p>
                  <p className="text-xs text-zinc-500">Your financial situation affects choices</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-300">Family Bond</p>
                  <p className="text-xs text-zinc-500">Relationship with family and support system</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-orange-400">Hidden Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-sm text-zinc-300">Stress (0-100)</p>
                  <p className="text-xs text-zinc-500">Builds from battles without rest. Increases choke chance (+0% to +25%)</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-300">Public Knowledge (0-100)</p>
                  <p className="text-xs text-zinc-500">How famous you are. Affects event triggers and opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prep System */}
        <section className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8 rounded-lg">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42] mb-6">Prep Focus Types</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded">
              <h3 className="font-bold text-blue-400 mb-2">🔍 Research</h3>
              <p className="text-sm text-zinc-400 mb-2">Study your opponent and develop angles</p>
              <p className="text-xs text-zinc-500">• Enables better rebuttals • Discovers opponent secrets • Increases angle bonus</p>
            </div>

            <div className="p-4 bg-purple-500/10 border-2 border-purple-500/30 rounded">
              <h3 className="font-bold text-purple-400 mb-2">✍️ Writing</h3>
              <p className="text-sm text-zinc-400 mb-2">Craft your bars and schemes</p>
              <p className="text-xs text-zinc-500">• Boosts lyricism, wordplay, creativity • Most important for Small Room Circuit</p>
            </div>

            <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded">
              <h3 className="font-bold text-red-400 mb-2">🎭 Performance</h3>
              <p className="text-sm text-zinc-400 mb-2">Practice your stage presence and delivery</p>
              <p className="text-xs text-zinc-500">• Improves stage presence, crowd control, delivery • Critical for Main Stage Arena</p>
            </div>

            <div className="p-4 bg-green-500/10 border-2 border-green-500/30 rounded">
              <h3 className="font-bold text-green-400 mb-2">😌 Rest</h3>
              <p className="text-sm text-zinc-400 mb-2">Reduce stress and recover mentally</p>
              <p className="text-xs text-zinc-500">• Reduces stress by ~5 per day • Buffers resilience • Prevents choking</p>
            </div>

            <div className="p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded">
              <h3 className="font-bold text-yellow-400 mb-2">🏠 Life</h3>
              <p className="text-sm text-zinc-400 mb-2">Handle personal matters and maintain balance</p>
              <p className="text-xs text-zinc-500">• Affects family bond, financial stability • Slightly reduces stress • Can trigger life events</p>
            </div>
          </div>
        </section>

        {/* League System */}
        <section className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8 rounded-lg">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42] mb-6">The Two Leagues</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg">
              <h3 className="font-black text-xl text-blue-400 mb-4">Small Room Circuit</h3>
              <div className="space-y-3 text-sm">
                <p className="text-zinc-400">
                  <span className="font-bold text-zinc-300">Format:</span> 2-minute rounds (4 segments each)
                </p>
                <p className="text-zinc-400">
                  <span className="font-bold text-zinc-300">Focus:</span> Writing-heavy (55% weight)
                </p>
                <p className="text-zinc-400">
                  <span className="font-bold text-zinc-300">Crowd:</span> Intimate, focused audience
                </p>
                <p className="text-xs text-zinc-500 pt-3 border-t-2 border-[#3a3d44]">
                  Best for: Technical Writers, Lyricists, Scheme-heavy battlers
                </p>
              </div>
            </div>

            <div className="p-6 bg-red-500/10 border-2 border-red-500/30 rounded-lg">
              <h3 className="font-black text-xl text-red-400 mb-4">Main Stage Arena</h3>
              <div className="space-y-3 text-sm">
                <p className="text-zinc-400">
                  <span className="font-bold text-zinc-300">Format:</span> 3-minute rounds (6 segments each)
                </p>
                <p className="text-zinc-400">
                  <span className="font-bold text-zinc-300">Focus:</span> Performance-heavy (55% weight)
                </p>
                <p className="text-zinc-400">
                  <span className="font-bold text-zinc-300">Crowd:</span> Large, energetic audience
                </p>
                <p className="text-xs text-zinc-500 pt-3 border-t-2 border-[#3a3d44]">
                  Best for: Performance Beasts, Crowd Workers, High-energy battlers
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Battle Mechanics */}
        <section className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8 rounded-lg">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42] mb-6">Battle Mechanics</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Segment-Based Simulation</h3>
              <p className="text-sm text-zinc-400">
                Battles are simulated segment-by-segment (30 seconds each). Each segment gets scored, creating
                natural peaks and valleys. Your <span className="text-[#ff8c42] font-bold">peak score</span> is your best segment (haymaker moment).
                Your <span className="text-blue-400 font-bold">average score</span> is your overall performance.
                Your <span className="text-green-400 font-bold">consistency</span> measures how steady you were.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Choke Probability</h3>
              <p className="text-sm text-zinc-400">
                Base chance: 3%. Reduced by resilience and prep. <span className="text-red-500 font-bold">Increased by stress</span> (up to +25% at 100 stress).
                If you choke, that round is basically lost. Choking damages reputation and triggers stress buildup.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Crowd Reaction</h3>
              <p className="text-sm text-zinc-400">
                0-100 score based on your performance attributes and league crowd factor. Higher crowd reaction
                can swing close battles. Performance badges boost this significantly.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Winner Determination</h3>
              <p className="text-sm text-zinc-400">
                Best 2 out of 3 rounds. Each round is scored by comparing average performance + crowd reaction + momentum.
                Judges favor the battler with higher overall impact, not just raw writing or performance.
              </p>
            </div>
          </div>
        </section>

        {/* Badge System */}
        <section className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8 rounded-lg">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42] mb-6">
            Badge System
            <Link href="/badges" className="text-sm font-normal text-blue-400 hover:text-blue-300 ml-4">
              View All Badges →
            </Link>
          </h2>
          <div className="space-y-4">
            <p className="text-zinc-400">
              Badges define your battler's identity and playstyle. They're not just cosmetic - each badge has
              <span className="text-[#ff8c42] font-bold"> mechanical effects</span> that change how you prep and battle.
            </p>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded">
                <div className="font-bold text-amber-500 mb-2">Bronze Tier</div>
                <p className="text-xs text-zinc-500">Basic badges with modest (+10-30%) effects</p>
              </div>
              <div className="p-4 bg-zinc-500/10 border-2 border-zinc-500/30 rounded">
                <div className="font-bold text-zinc-300 mb-2">Silver Tier</div>
                <p className="text-xs text-zinc-500">Advanced badges with strong (+20-35%) effects</p>
              </div>
              <div className="p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded">
                <div className="font-bold text-yellow-400 mb-2">Gold Tier</div>
                <p className="text-xs text-zinc-500">Elite badges defining archetype (+30-45%)</p>
              </div>
            </div>

            <div className="p-4 bg-zinc-800 rounded mt-4">
              <p className="text-sm font-bold text-green-400 mb-2">Synergies (+5% each)</p>
              <p className="text-xs text-zinc-500">
                Certain badge combinations unlock synergy bonuses. Example: Pen Game Elite + Scheme King = Elite Writing Synergy
              </p>
            </div>

            <div className="p-4 bg-zinc-800 rounded">
              <p className="text-sm font-bold text-red-400 mb-2">Conflicts (-8% penalty)</p>
              <p className="text-xs text-zinc-500">
                Some badges clash. Example: Freestyle Genius + Technical Writer = contradictory approaches hurt both
              </p>
            </div>
          </div>
        </section>

        {/* Stress System */}
        <section className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8 rounded-lg">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42] mb-6">Stress Management</h2>
          <div className="space-y-4">
            <p className="text-zinc-400">
              Stress is a hidden stat (0-100) that builds when you battle without rest. High stress dramatically
              increases your choke chance and can trigger burnout life events.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-sm mb-2 text-green-400">How to Reduce Stress</h3>
                <ul className="text-sm text-zinc-400 space-y-1">
                  <li>• Rest days: -5 stress each</li>
                  <li>• Life focus: -2 stress each</li>
                  <li>• Time between battles</li>
                  <li>• Winning battles</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm mb-2 text-red-400">What Increases Stress</h3>
                <ul className="text-sm text-zinc-400 space-y-1">
                  <li>• Back-to-back battles: +8-15</li>
                  <li>• Choking: +10-20</li>
                  <li>• Losing badly: +5-10</li>
                  <li>• High-intensity prep (5+ days): +1-5</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded mt-4">
              <p className="font-bold text-red-400 mb-2">Stress States & Choke Penalty</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-zinc-400">0-25: <span className="text-green-500">Calm</span> (+0%)</div>
                <div className="text-zinc-400">26-50: <span className="text-yellow-500">Focused</span> (+3%)</div>
                <div className="text-zinc-400">51-75: <span className="text-[#ff8c42]">Tense</span> (+8%)</div>
                <div className="text-zinc-400">76-100: <span className="text-red-500">Overwhelmed</span> (+15-25%)</div>
              </div>
            </div>
          </div>
        </section>

        {/* Life Events */}
        <section className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8 rounded-lg">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42] mb-6">Life Events</h2>
          <p className="text-zinc-400 mb-6">
            Life events add narrative depth and strategic choices. They're based on real battle rap culture
            and have meaningful mechanical effects.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded">
              <h3 className="font-bold text-blue-400 mb-2">Choice Events</h3>
              <p className="text-sm text-zinc-400 mb-2">
                "Your Ex Airs You Out" - Address it publicly or stay silent?
              </p>
              <p className="text-xs text-zinc-500">
                Different archetypes succeed at different choices. Technical Writers prefer calculated responses.
                Freestylers thrive in improvised situations.
              </p>
            </div>

            <div className="p-4 bg-purple-500/10 border-2 border-purple-500/30 rounded">
              <h3 className="font-bold text-purple-400 mb-2">Triggered Events</h3>
              <p className="text-sm text-zinc-400 mb-2">
                "Your Haymaker Goes Viral" - Happens after dominant victories
              </p>
              <p className="text-xs text-zinc-500">
                Performance-based events reward (or punish) your battle results. Win streaks, chokes, viral moments.
              </p>
            </div>

            <div className="p-4 bg-green-500/10 border-2 border-green-500/30 rounded">
              <h3 className="font-bold text-green-400 mb-2">Passive Events</h3>
              <p className="text-sm text-zinc-400 mb-2">
                "Burnout from 5 consecutive prep days" - Automatic consequences
              </p>
              <p className="text-xs text-zinc-500">
                Your behavior patterns trigger these. Push too hard without rest? Expect burnout.
              </p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 p-8 rounded-lg">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42] mb-6">Pro Tips</h2>
          <div className="space-y-3 text-sm text-zinc-300">
            <p>• <span className="font-bold text-orange-400">Match your prep to your league</span>: Small Room needs writing, Main Stage needs performance</p>
            <p>• <span className="font-bold text-orange-400">Rest is not optional</span>: 3+ battles without rest = stress spiral = chokes</p>
            <p>• <span className="font-bold text-orange-400">Badge synergies matter</span>: Build coherent archetypes, don't mix conflicting badges</p>
            <p>• <span className="font-bold text-orange-400">Read your archetype display</span>: It tells you optimal playstyle for your build</p>
            <p>• <span className="font-bold text-orange-400">Life event choices aren't random</span>: They're based on your archetype. Look for hints!</p>
            <p>• <span className="font-bold text-orange-400">Consistency beats peak moments</span>: Don't swing for haymakers every segment</p>
            <p>• <span className="font-bold text-orange-400">Reputation opens doors</span>: High reputation unlocks better opportunities</p>
          </div>
        </section>
      </div>
    </div>
  );
}
