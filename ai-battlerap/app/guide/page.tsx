// HOW TO PLAY — the guide hub. Four lessons that turn a spectator into a
// battler: read the crowd, run the camp, fight the night, know the rooms.
import Link from 'next/link';
import { GUIDE_SERIES } from './SeriesNav';

const BLURBS: Record<string, { line: string; art?: { src: string; w: number; h: number } }> = {
  '/guide/the-room': {
    line: 'The crowd IS the scoreboard. Every reaction, what it means, and how the room tells on you.',
    art: { src: '/sprites/crowd/oooh/oooh_007.png', w: 112, h: 128 },
  },
  '/guide/the-camp': {
    line: 'Eleven days to build a battle. Research digs angles, the pen cuts choke risk, rest keeps you sharp.',
  },
  '/guide/battle-night': {
    line: 'Pick your weapons, counter theirs, and decide how much pressure the round can take.',
  },
  '/guide/the-rooms': {
    line: 'Venues are real places. The size of the room decides the size of the crowd — the biggest nights go national.',
    art: { src: '/sprites/venues/grand-theater.png', w: 352, h: 160 },
  },
};

export const metadata = { title: 'How to Play — Battle Rap University' };

export default function GuideIndexPage() {
  return (
    <div className="fs min-h-screen bg-[#0F0F12] pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link href="/dashboard" className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-500 hover:text-[#F5731A]">
          ← Back to dashboard
        </Link>
        <h1 style={{ fontFamily: 'var(--font-poster)', fontSize: 58, lineHeight: 1 }} className="text-zinc-100 uppercase mt-4">
          How to Play
        </h1>
        <p className="text-[15px] text-zinc-400 max-w-2xl mt-3 mb-10">
          Four lessons. No filler. By the end you can read a room, run a camp, pick a fight, and know
          exactly why the building matters.
        </p>

        <div className="space-y-5">
          {GUIDE_SERIES.map((g) => {
            const b = BLURBS[g.href];
            return (
              <Link
                key={g.href}
                href={g.href}
                className="block bg-[#17181C] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] hover:border-[#F5731A] transition-colors overflow-hidden"
              >
                <div className="flex items-stretch">
                  <div className="w-24 shrink-0 bg-[#101114] border-r-2 border-black flex items-center justify-center">
                    <span style={{ fontFamily: 'var(--font-poster)', fontSize: 44 }} className="text-[#F5731A]">
                      {g.num}
                    </span>
                  </div>
                  <div className="p-5 flex-1 min-w-0">
                    <h2 style={{ fontFamily: 'var(--font-poster)', fontSize: 30 }} className="text-zinc-100 uppercase">
                      {g.title}
                    </h2>
                    <p className="text-[14px] text-zinc-400 mt-1">{b?.line}</p>
                  </div>
                  {b?.art && (
                    <div className="hidden md:flex items-end pr-4 pl-2 shrink-0">
                      <img
                        src={b.art.src}
                        alt=""
                        width={b.art.w}
                        height={b.art.h}
                        style={{ imageRendering: 'pixelated', maxHeight: 128, width: 'auto' }}
                      />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 bg-[#101114] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] p-6">
          <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-500 mb-2">The short version</p>
          <p className="text-[14px] text-zinc-400 max-w-3xl">
            Take a battle. Spend your camp days on purpose. Walk in with something written. Read what the
            room gives you and answer it. Everything else — the press, the grudges, the national TV nights —
            comes from doing those four things in public.
          </p>
        </div>
      </div>
    </div>
  );
}
