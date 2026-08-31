'use client';

// THE LOOP — a self-playing demo of one career cycle:
// callout -> prep week -> battle night -> the press -> (repeat, new opponent).
// Pure presentation; numbers echo real sim outputs but nothing here hits the API.
import { useEffect, useState } from 'react';

const PHASES = ['THE CALLOUT', 'PREP WEEK', 'BATTLE NIGHT', 'THE PRESS'] as const;
const PHASE_MS = [4200, 5200, 6400, 5200];

// Each loop iteration tells a slightly different story.
const STORIES = [
  {
    opponent: 'IRON CLIP',
    tier: 'MID TIER',
    league: 'CROWN CITY BATTLE LEAGUE',
    purse: '$1,200',
    rounds: [
      { you: 78, opp: 64 },
      { you: 91, opp: 70, haymaker: true },
      { you: 74, opp: 69 },
    ],
    verdict: '3-0',
    verdictLabel: 'BODYBAG',
    headline: 'IRON CLIP GOT BODIED — CROWN CITY HAS A NEW PROBLEM',
    blogger: 'BATTLE EYEZ',
    rating: '+24',
    xp: '+180 XP',
    badge: '🔥 FIRST BLOOD',
  },
  {
    opponent: 'SCHEME ARCHITECT',
    tier: 'TOP TIER',
    league: 'BARZ SUPREME LEAGUE',
    purse: '$3,500',
    rounds: [
      { you: 82, opp: 85 },
      { you: 88, opp: 71, haymaker: true },
      { you: 80, opp: 77 },
    ],
    verdict: '2-1',
    verdictLabel: 'DEBATABLE',
    headline: 'INSTANT CLASSIC: THE 2-1 EVERYBODY IS ARGUING ABOUT',
    blogger: 'THE PURIST',
    rating: '+31',
    xp: '+240 XP',
    badge: '⚔️ GIANT SLAYER',
  },
  {
    opponent: 'GLOCK TALK',
    tier: 'MID TIER',
    league: 'SPITFIRE ARENA',
    purse: '$1,800',
    rounds: [
      { you: 75, opp: 72 },
      { you: 38, opp: 80, choke: true },
      { you: 86, opp: 74, haymaker: true },
    ],
    verdict: '2-1',
    verdictLabel: 'SURVIVED THE CHOKE',
    headline: 'HE CHOKED IN THE SECOND — THEN CAME BACK AND STOLE IT',
    blogger: 'MARIJUANA PIRANHA',
    rating: '+19',
    xp: '+205 XP',
    badge: '💪 CLUTCH GENE',
  },
];

const PREP_WEEK = [
  { day: 'MON', focus: 'RESEARCH', icon: '🔍' },
  { day: 'TUE', focus: 'WRITE', icon: '✍️' },
  { day: 'WED', focus: 'WRITE', icon: '✍️' },
  { day: 'THU', focus: 'PERFORM', icon: '🎤' },
  { day: 'FRI', focus: 'WRITE', icon: '✍️' },
  { day: 'SAT', focus: 'PERFORM', icon: '🎤' },
  { day: 'SUN', focus: 'REST', icon: '😴' },
];

// Match the real prep planner's focus palette (app/battle/[id]/prep): writing is
// orange, performance is red, research amber, rest zinc — so the demo teaches the
// same colour language the player meets in-game (and no stray blue on a brand page,
// where WRITE was blue and PERFORM wore LIFE's green).
const FOCUS_COLORS: Record<string, string> = {
  RESEARCH: 'border-amber-500/60 text-amber-300',
  WRITE: 'border-[#ff8c42]/60 text-[#ff8c42]',
  PERFORM: 'border-red-500/60 text-red-300',
  REST: 'border-zinc-500/60 text-zinc-400',
};

export default function GameLoopDemo() {
  const [phase, setPhase] = useState(0);
  const [storyIdx, setStoryIdx] = useState(0);
  const story = STORIES[storyIdx];

  useEffect(() => {
    const t = setTimeout(() => {
      if (phase === PHASES.length - 1) {
        setStoryIdx((s) => (s + 1) % STORIES.length);
        setPhase(0);
      } else {
        setPhase(phase + 1);
      }
    }, PHASE_MS[phase]);
    return () => clearTimeout(t);
  }, [phase, storyIdx]);

  return (
    <div className="relative">
      {/* Phase rail */}
      <div className="flex items-center justify-center gap-1 sm:gap-3 mb-8 flex-wrap">
        {PHASES.map((p, i) => (
          <div key={p} className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => setPhase(i)}
              className={`px-3 sm:px-5 py-2 font-display font-black uppercase tracking-wider text-xs sm:text-sm border-2 transition-all duration-300 ${
                i === phase
                  ? 'bg-[#ff8c42] text-black border-[#ff8c42] shadow-[0_0_24px_-4px_rgba(255,140,66,0.8)]'
                  : i < phase
                  ? 'border-[#ff8c42]/40 text-[#ff8c42]/70'
                  : 'border-[#3a3d44] text-zinc-600'
              }`}
            >
              {p}
            </button>
            {i < PHASES.length - 1 && (
              <span className={`font-mono text-lg ${i < phase ? 'text-[#ff8c42]' : 'text-zinc-700'}`}>→</span>
            )}
          </div>
        ))}
        <span className="font-mono text-lg text-zinc-700 hidden sm:inline">↻</span>
      </div>

      {/* Stage */}
      <div className="relative bg-[#101114] border-2 border-[#3a3d44] min-h-[380px] sm:min-h-[420px] overflow-hidden">
        {/* corner tape */}
        <div className="absolute top-0 left-0 px-3 py-1 bg-[#ff8c42] text-black font-mono text-[12px] font-bold uppercase tracking-widest z-10">
          LIVE DEMO — REAL GAME MECHANICS
        </div>

        {/* PHASE 0: THE CALLOUT */}
        {phase === 0 && (
          <div key={`p0-${storyIdx}`} className="flex items-center justify-center min-h-[380px] sm:min-h-[420px] p-6">
            <div className="w-full max-w-md animate-fade-in-up">
              <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
                📬 NEW BATTLE OFFER
              </p>
              <div className="bg-[#18191c] border-2 border-[#ff8c42]/60 p-6 shadow-[0_0_40px_-12px_rgba(255,140,66,0.5)]">
                <p className="font-mono text-[12px] uppercase tracking-widest text-[#ff8c42] mb-2">{story.league}</p>
                <h3 className="font-display text-4xl font-black uppercase tracking-tight text-zinc-100 mb-1">
                  VS {story.opponent}
                </h3>
                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-4">{story.tier} · 3 ROUNDS · 2-MIN</p>
                <div className="flex justify-between items-center border-t-2 border-[#3a3d44] pt-4">
                  <div>
                    <p className="text-[12px] uppercase tracking-widest text-zinc-500">PURSE</p>
                    <p className="font-display text-2xl font-black text-green-400">{story.purse}</p>
                  </div>
                  <div className="px-6 py-3 bg-[#ff8c42] text-black font-display font-black uppercase tracking-wider animate-pulse-orange">
                    ACCEPT ✓
                  </div>
                </div>
              </div>
              <p className="text-center text-zinc-600 text-xs uppercase tracking-wider mt-4">
                Promoters call based on your rep. Duck too many and the blogs notice.
              </p>
            </div>
          </div>
        )}

        {/* PHASE 1: PREP WEEK */}
        {phase === 1 && (
          <div key={`p1-${storyIdx}`} className="flex items-center justify-center min-h-[380px] sm:min-h-[420px] p-6">
            <div className="w-full max-w-2xl">
              <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mb-6">
                📝 EVERY DAY IS A CHOICE
              </p>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {PREP_WEEK.map((d, i) => (
                  <div
                    key={d.day}
                    className="animate-chip-pop"
                    style={{ animationDelay: `${i * 380}ms` }}
                  >
                    <div className={`border-2 bg-[#18191c] p-2 sm:p-3 text-center ${FOCUS_COLORS[d.focus]}`}>
                      <p className="text-[11px] font-mono text-zinc-600 mb-1">{d.day}</p>
                      <p className="text-lg sm:text-2xl mb-1">{d.icon}</p>
                      <p className="text-[10px] sm:text-[12px] font-black uppercase tracking-wide">{d.focus}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center gap-6 text-center animate-fade-in" style={{ animationDelay: '3s' }}>
                <div>
                  <p className="font-display text-2xl font-black text-[#ff8c42]">+WORDPLAY</p>
                  <p className="text-[12px] uppercase tracking-widest text-zinc-600">writing days</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-black text-amber-400">+ANGLES</p>
                  <p className="text-[12px] uppercase tracking-widest text-zinc-600">research days</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-black text-green-400">−CHOKE RISK</p>
                  <p className="text-[12px] uppercase tracking-widest text-zinc-600">rest days</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: BATTLE NIGHT */}
        {phase === 2 && (
          <div key={`p2-${storyIdx}`} className="flex items-center justify-center min-h-[380px] sm:min-h-[420px] p-6">
            <div className="w-full max-w-xl">
              <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mb-6">
                🎤 SIMULATED IN 30-SECOND SEGMENTS
              </p>
              <div className="space-y-5">
                {story.rounds.map((r, i) => (
                  <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 1500}ms` }}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-mono text-[12px] uppercase tracking-widest text-zinc-500">ROUND {i + 1}</p>
                      {r.haymaker && (
                        <span
                          className="font-display font-black text-sm uppercase text-[#ff8c42] animate-haymaker"
                          style={{ animationDelay: `${i * 1500 + 700}ms` }}
                        >
                          💥 HAYMAKER
                        </span>
                      )}
                      {r.choke && (
                        <span
                          className="font-display font-black text-sm uppercase text-red-500 animate-haymaker"
                          style={{ animationDelay: `${i * 1500 + 700}ms` }}
                        >
                          😶 CHOKE
                        </span>
                      )}
                    </div>
                    {/* you */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-10 font-mono text-[12px] text-[#ff8c42]">YOU</span>
                      <div className="flex-1 h-4 bg-[#18191c] border border-[#3a3d44]">
                        <div
                          className={`h-full animate-bar-fill ${r.choke ? 'bg-red-500/70' : 'bg-[#ff8c42]'}`}
                          style={{ ['--bar-w' as string]: `${r.you}%`, animationDelay: `${i * 1500 + 300}ms` }}
                        />
                      </div>
                      <span className="w-8 font-mono text-xs text-zinc-300">{r.you}</span>
                    </div>
                    {/* opp */}
                    <div className="flex items-center gap-2">
                      <span className="w-10 font-mono text-[12px] text-zinc-500">OPP</span>
                      <div className="flex-1 h-4 bg-[#18191c] border border-[#3a3d44]">
                        <div
                          className="h-full bg-zinc-500 animate-bar-fill"
                          style={{ ['--bar-w' as string]: `${r.opp}%`, animationDelay: `${i * 1500 + 300}ms` }}
                        />
                      </div>
                      <span className="w-8 font-mono text-xs text-zinc-500">{r.opp}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* verdict stamp */}
              <div className="flex justify-center mt-6">
                <div
                  className="animate-stamp-in border-4 border-[#ff8c42] px-6 py-2 rotate-[-8deg]"
                  style={{ animationDelay: '4800ms' }}
                >
                  <p className="font-display text-3xl font-black uppercase tracking-tight text-[#ff8c42]">
                    {story.verdict} · {story.verdictLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 3: THE PRESS */}
        {phase === 3 && (
          <div key={`p3-${storyIdx}`} className="flex items-center justify-center min-h-[380px] sm:min-h-[420px] p-6">
            <div className="w-full max-w-xl">
              <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mb-6">
                📰 THE BLOGS WRITE THEMSELVES
              </p>
              <div className="bg-[#18191c] border-2 border-[#3a3d44] p-6">
                <p className="font-mono text-[12px] uppercase tracking-widest text-[#ff8c42] mb-3">
                  {story.blogger} · BATTLE RECAP
                </p>
                <h3 className="animate-typewriter font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-100">
                  {story.headline}
                </h3>
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="animate-chip-pop px-3 py-1.5 border-2 border-green-500/50 text-green-400 font-display font-black text-sm" style={{ animationDelay: '1.8s' }}>
                    ▲ {story.rating} RATING
                  </span>
                  <span className="animate-chip-pop px-3 py-1.5 border-2 border-amber-400/50 text-amber-300 font-display font-black text-sm" style={{ animationDelay: '2.2s' }}>
                    {story.xp}
                  </span>
                  <span className="animate-chip-pop px-3 py-1.5 border-2 border-[#ff8c42]/50 text-[#ff8c42] font-display font-black text-sm" style={{ animationDelay: '2.6s' }}>
                    BADGE: {story.badge}
                  </span>
                </div>
              </div>
              <p className="text-center text-zinc-500 text-xs uppercase tracking-[0.25em] mt-6 animate-fade-in" style={{ animationDelay: '3.2s' }}>
                ...AND THE NEXT CALLOUT IS ALREADY IN YOUR INBOX ↻
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
