'use client';

import { portraitFillStyle } from '@/lib/sprite-crops';
import Icon from '@/components/ui/Icon';

type Props = {
  onQuickStart: () => void;
  onCustomBuild: () => void;
};

// A taste of the roster on the very first screen — this is a world of faces,
// and one of them is about to be yours.
const PREVIEW_FACES = [
  '/sprites/characters/image_1764146517369/sprite_809.png',
  '/sprites/characters/image_1764146527629/sprite_761.png',
  '/sprites/characters/image_1764146527629/sprite_764.png',
  '/sprites/characters/image_1764146527629/sprite_766.png',
  '/sprites/characters/image_1764146527629/sprite_767.png',
];

const PILLARS = [
  {
    icon: 'brain' as const,
    title: 'STRATEGY, NOT TYPING',
    body: 'You never write bars. You build the battler, run the camp, and call the shots — the engine fights the fight.',
  },
  {
    icon: 'target' as const,
    title: 'PREP IS THE GAME',
    body: 'Research your opponent, bank writing days, rest before the stage. Walk in cold and the choke risk is all yours.',
  },
  {
    icon: 'news' as const,
    title: 'THE WORLD TALKS BACK',
    body: 'Rankings move, bloggers write you up, rivals call you out. Wins build a legacy — chokes follow you.',
  },
];

const MECHANICS: { icon: React.ComponentProps<typeof Icon>['name']; strong: string; rest: string }[] = [
  { icon: 'swords', strong: 'Battle offers', rest: 'promoters come to you — pick your fights' },
  { icon: 'pen', strong: 'Training camp', rest: 'paint your prep days: research, writing, performance, rest' },
  { icon: 'mic', strong: 'Battle night', rest: 'call every round yourself or trust the camp' },
  { icon: 'chart', strong: 'Progression', rest: 'attributes grow from real performance' },
  { icon: 'flame', strong: 'Life & beef', rest: 'events and rivalries shape the story' },
  { icon: 'cash', strong: 'The bag', rest: 'purses, crew payroll, travel money' },
];

export default function WelcomeScreen({ onQuickStart, onCustomBuild }: Props) {
  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full">
        {/* Roster strip — real faces, real world */}
        <div className="flex justify-center gap-3 mb-8">
          {PREVIEW_FACES.map((src, i) => (
            <div
              key={src}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-[#0a0a0a] border-2 overflow-hidden ${
                i === 2 ? 'border-[#ff8c42] shadow-[0_0_18px_-4px_rgba(255,140,66,0.7)]' : 'border-[#3a3d44] opacity-70'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" style={portraitFillStyle(src)} />
            </div>
          ))}
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-7xl font-display font-black uppercase tracking-tighter mb-3">
            WELCOME TO <span className="text-[#ff8c42]">THE CIRCUIT</span>
          </h1>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 font-bold">
            ONE BATTLER · ONE FACE · ONE LEGACY
          </p>
        </div>

        {/* The three pillars */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
              <Icon name={p.icon} size={28} className="text-[#ff8c42] mb-3" />
              <h4 className="font-display font-black uppercase tracking-wider text-sm text-zinc-100 mb-2">
                {p.title}
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Core mechanics ribbon */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6 mb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-xs text-zinc-500">
            {MECHANICS.map((m) => (
              <p key={m.strong} className="flex items-start gap-2">
                <Icon name={m.icon} size={13} className="text-[#ff8c42] mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-zinc-300 uppercase">{m.strong}</strong> — {m.rest}
                </span>
              </p>
            ))}
          </div>
        </div>

        {/* Path choice */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={onQuickStart}
            className="group bg-[#ff8c42] hover:bg-[#ff9d5c] p-8 text-left transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon name="bolt" size={28} className="text-black" />
              <h3 className="text-2xl font-display font-black uppercase tracking-tight text-black">
                QUICK START
              </h3>
            </div>
            <p className="text-sm text-black/80 leading-relaxed mb-4">
              Pick an archetype and be on a card in two minutes. The circuit is waiting.
            </p>
            <div className="flex items-center gap-2 text-xs font-display font-black uppercase tracking-wider text-black/70">
              <span>RECOMMENDED FOR FIRST-TIMERS</span>
              <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          <button
            onClick={onCustomBuild}
            className="group bg-[#2d2f35] hover:bg-zinc-800 border-2 border-[#3a3d44] hover:border-[#ff8c42] p-8 text-left transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon name="pen" size={28} className="text-[#ff8c42]" />
              <h3 className="text-2xl font-display font-black uppercase tracking-tight">
                CUSTOM BUILD
              </h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Allocate every point yourself. Build the exact battler you hear in your head.
            </p>
            <div className="flex items-center gap-2 text-xs font-display font-black uppercase tracking-wider text-zinc-500 group-hover:text-[#ff8c42]">
              <span>FULL CREATIVE CONTROL</span>
              <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600 uppercase tracking-wider">
          One battler per account — your face claim is forever
        </p>
      </div>
    </div>
  );
}
