'use client';

import Link from 'next/link';
import { BADGE_DESCRIPTIONS } from '@/lib/game/badgeDescriptions';
import BadgeTooltip from '@/components/ui/BadgeTooltip';

type Props = {
  styleTags: string[] | null | undefined;
};

const tierColors = {
  bronze: {
    bg: 'bg-amber-900/30',
    border: 'border-amber-600/50',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_15px_rgba(217,119,6,0.25)]',
  },
  silver: {
    bg: 'bg-zinc-600/30',
    border: 'border-zinc-400/50',
    text: 'text-zinc-200',
    glow: 'shadow-[0_0_15px_rgba(161,161,170,0.25)]',
  },
  gold: {
    bg: 'bg-yellow-600/30',
    border: 'border-yellow-400/60',
    text: 'text-yellow-300',
    glow: 'shadow-[0_0_18px_rgba(250,204,21,0.35)]',
  },
} as const;

const categoryIcons: Record<string, string> = {
  writing: '✍️',
  performance: '🎭',
  content: '💡',
  delivery: '🎤',
  reputation_positive: '⭐',
  reputation_negative: '⚠️',
};

const titleCase = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function BadgeShowcase({ styleTags }: Props) {
  const tags = styleTags || [];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42]">
          🏅 BADGES & SPECIALTIES
        </h2>
        <Link
          href="/badges"
          className="text-xs font-display font-black uppercase tracking-wider text-zinc-400 hover:text-[#ff8c42] transition-colors"
        >
          VIEW ALL 97 →
        </Link>
      </div>

      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
        {tags.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3 opacity-40">🏅</div>
            <p className="text-zinc-400 font-display font-black uppercase tracking-wider text-sm mb-2">
              NO BADGES YET
            </p>
            <p className="text-zinc-500 text-xs">
              Earn badges through battles, prep choices, and career milestones
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-[#3a3d44]">
              <span className="text-xs font-display font-black uppercase tracking-wider text-zinc-400">
                EQUIPPED
              </span>
              <span className="text-2xl font-display font-black text-[#ff8c42]">
                {tags.length}
              </span>
              <span className="text-xs text-zinc-500 uppercase tracking-wide">
                {tags.length === 1 ? 'badge active' : 'badges active'}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => {
                const desc = BADGE_DESCRIPTIONS[tag];
                const tier = (desc?.tier || 'bronze') as keyof typeof tierColors;
                const colors = tierColors[tier];
                const icon = desc ? categoryIcons[desc.category] || '🏅' : '🏅';
                const label = desc?.name || titleCase(tag);

                return (
                  <BadgeTooltip key={tag} badgeCode={tag}>
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 border-2 ${colors.bg} ${colors.border} ${colors.glow} transition-all hover:scale-105`}
                    >
                      <span className="text-lg leading-none">{icon}</span>
                      <span
                        className={`font-display font-black uppercase tracking-wider text-sm ${colors.text}`}
                      >
                        {label}
                      </span>
                      {desc?.tier && (
                        <span
                          className={`text-[10px] font-display font-black uppercase tracking-wider ${colors.text} opacity-70`}
                        >
                          {desc.tier}
                        </span>
                      )}
                    </div>
                  </BadgeTooltip>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
