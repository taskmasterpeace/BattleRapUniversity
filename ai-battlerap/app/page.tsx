'use client';

import Link from 'next/link';
import Image from 'next/image';

const ARCHETYPES = [
  {
    src: '/sprites/characters/image_1764146494580/sprite_848.png',
    name: 'THE TECHNICIAN',
    tag: 'Schemes • Wordplay',
    accent: 'from-blue-500 to-blue-700',
    accentText: 'text-blue-300',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.35)]',
  },
  {
    src: '/sprites/characters/image_1764146517369/sprite_815.png',
    name: 'THE PERFORMER',
    tag: 'Crowd • Charisma',
    accent: 'from-[#ff8c42] to-orange-700',
    accentText: 'text-[#ff8c42]',
    glow: 'shadow-[0_0_40px_rgba(255,140,66,0.4)]',
  },
  {
    src: '/sprites/characters/image_1764146527629/sprite_782.png',
    name: 'THE BRAWLER',
    tag: 'Aggression • Intimidation',
    accent: 'from-red-500 to-red-800',
    accentText: 'text-red-400',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.35)]',
  },
];

const FEATURES = [
  {
    icon: '🎤',
    title: 'PICK YOUR PATH',
    body: 'Forum writer, street battler, or app performer. Origin shapes early attributes and storylines.',
  },
  {
    icon: '🧠',
    title: 'STRATEGIZE PREP',
    body: 'Daily research, writing, performance, and rest blocks lock in before showtime. No-shows get exposed.',
  },
  {
    icon: '⚡',
    title: 'EARN 76 BADGES',
    body: 'Bronze, silver, and gold specialties unlock through performance — punchline heavy, crowd favorite, scheme king.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0e0f12] relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0e0f12] via-[#1a1c20] to-[#0e0f12]" />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(#ff8c42 1px, transparent 1px), linear-gradient(90deg, #ff8c42 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)',
        }}
      />
      {/* Radial spotlight on hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80rem] h-[40rem] bg-[radial-gradient(ellipse_at_center,rgba(255,140,66,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 min-h-screen flex flex-col items-center px-6 py-16">
        <div className="max-w-6xl w-full">
          {/* Outer tech frame */}
          <div className="relative p-[2px] bg-gradient-to-br from-[#ff8c42] via-[#3a3d44] to-[#ff8c42]">
            <div className="relative bg-[#1a1c20] px-10 py-14 md:px-16 md:py-16">
              {/* Corner cuts */}
              <div
                className="absolute top-0 left-0 w-10 h-10 bg-[#0e0f12]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
              />
              <div
                className="absolute top-0 right-0 w-10 h-10 bg-[#0e0f12]"
                style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
              />
              <div
                className="absolute bottom-0 left-0 w-10 h-10 bg-[#0e0f12]"
                style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}
              />
              <div
                className="absolute bottom-0 right-0 w-10 h-10 bg-[#0e0f12]"
                style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
              />

              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-3 py-1 border border-[#ff8c42]/50 bg-[#ff8c42]/5">
                  <span className="font-mono text-xs text-[#ff8c42] uppercase tracking-[0.3em]">
                    ◆ Battle Rap Sim ◆
                  </span>
                </div>
                <h1 className="font-bebas text-7xl md:text-9xl text-white uppercase tracking-wide leading-[0.85] drop-shadow-[0_0_30px_rgba(255,140,66,0.4)]">
                  <span className="text-[#ff8c42]">BATTLE RAP</span>
                  <br />
                  <span className="text-white">UNIVERSITY</span>
                </h1>
                <div className="mt-5 inline-block px-8 py-2 bg-[#ff8c42] border-4 border-[#ff8c42] relative overflow-hidden skew-x-[-8deg]">
                  <p className="font-anton text-xl md:text-2xl text-black uppercase tracking-[0.25em] relative z-10 skew-x-[8deg]">
                    BUILD YOUR LEGACY
                  </p>
                </div>
              </div>

              {/* Battler showcase — BIG portraits */}
              <div className="mb-12">
                <p className="text-center text-xs md:text-sm text-zinc-500 uppercase tracking-[0.4em] font-mono mb-6">
                  ─── CHOOSE YOUR ARCHETYPE ───
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {ARCHETYPES.map((arch) => (
                    <div
                      key={arch.name}
                      className="group relative flex flex-col items-center"
                    >
                      {/* Glow ring */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${arch.accent} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`}
                      />

                      {/* Portrait frame */}
                      <div
                        className={`relative w-full aspect-square max-w-[280px] bg-gradient-to-br ${arch.accent} p-[3px] transition-all duration-300 group-hover:scale-105 ${arch.glow}`}
                      >
                        <div className="relative w-full h-full bg-[#0e0f12] overflow-hidden">
                          <Image
                            src={arch.src}
                            alt={arch.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 280px"
                            className="object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          {/* Corner accents */}
                          <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${arch.accentText} opacity-80`} />
                          <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${arch.accentText} opacity-80`} />
                          <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${arch.accentText} opacity-80`} />
                          <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${arch.accentText} opacity-80`} />
                        </div>
                      </div>

                      {/* Name plate */}
                      <div className="mt-4 text-center">
                        <p
                          className={`font-anton text-2xl uppercase tracking-wider ${arch.accentText}`}
                        >
                          {arch.name}
                        </p>
                        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mt-1">
                          {arch.tag}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tagline */}
              <div className="text-center mb-14">
                <p className="font-anton text-3xl md:text-5xl text-white uppercase tracking-[0.3em]">
                  BUILD<span className="text-[#ff8c42]">.</span> BATTLE
                  <span className="text-[#ff8c42]">.</span> DOMINATE
                  <span className="text-[#ff8c42]">.</span>
                </p>
              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="relative bg-[#0e0f12] border-2 border-[#3a3d44] p-6 text-left hover:border-[#ff8c42] transition-all overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-3 h-3 bg-[#ff8c42]" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#ff8c42]/40 group-hover:bg-[#ff8c42] transition-colors" />
                    <div className="text-5xl mb-4">{f.icon}</div>
                    <p className="font-bebas text-xl text-white uppercase tracking-wider mb-2">
                      {f.title}
                    </p>
                    <p className="text-sm text-zinc-400 leading-snug">{f.body}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-block relative px-20 py-6 bg-[#ff8c42] text-black font-anton text-3xl uppercase tracking-[0.2em] hover:bg-[#ff9d5c] transition-all hover:shadow-[0_0_50px_rgba(255,140,66,0.7)] transform hover:scale-105 border-4 border-[#ff8c42] overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10">⚡ ENTER THE CIRCUIT</span>
                </Link>
                <p className="text-xs text-zinc-500 mt-6 uppercase tracking-[0.3em] font-mono">
                  Create your battler · Manage prep · Earn your rep
                </p>
              </div>
            </div>
          </div>

          {/* Bottom stats ticker */}
          <div className="mt-10 flex flex-wrap justify-center gap-x-12 gap-y-3 text-zinc-500 text-sm font-mono uppercase tracking-wider">
            <div>
              ACTIVE BATTLERS <span className="text-[#ff8c42] font-bold">1,247</span>
            </div>
            <div>
              BATTLES TODAY <span className="text-[#ff8c42] font-bold">89</span>
            </div>
            <div>
              ONLINE <span className="text-green-500">●</span>{' '}
              <span className="text-[#ff8c42] font-bold">342</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
