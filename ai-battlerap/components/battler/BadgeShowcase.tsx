'use client';

import Link from 'next/link';
import { BADGE_DESCRIPTIONS } from '@/lib/game/badgeDescriptions';
import { getBadgeEffectText } from '@/lib/game/badgeEffectText';
import BadgeTooltip from '@/components/ui/BadgeTooltip';
import Icon, { type IconName } from '@/components/ui/Icon';

type BadgeProgress = {
  code: string;
  label: string;
  pct: number;
  detail: string;
};

type BadgeIcon = { url: string | null; tier: string | null };

type Props = {
  styleTags: string[] | null | undefined;
  badgeProgress?: BadgeProgress[];
  badgeIcons?: Record<string, BadgeIcon>;
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

const categoryIcons: Record<string, IconName> = {
  writing: 'pen',
  performance: 'stage',
  content: 'bolt',
  delivery: 'mic',
  reputation_positive: 'star',
  reputation_negative: 'warning',
};

const titleCase = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function BadgeShowcase({ styleTags, badgeProgress = [], badgeIcons = {} }: Props) {
  const tags = styleTags || [];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42] flex items-center gap-2">
          <Icon name="medal" size={22} /> BADGES & SPECIALTIES
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
            <div className="flex justify-center mb-3 text-zinc-600"><Icon name="medal" size={44} /></div>
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
                const iconName = desc ? categoryIcons[desc.category] || 'medal' : 'medal';
                const label = desc?.name || titleCase(tag);
                const spriteUrl = badgeIcons[tag]?.url || null;

                const effectText = getBadgeEffectText(tag);
                return (
                  <BadgeTooltip key={tag} badgeCode={tag}>
                    <div
                      className={`inline-flex items-center gap-3 px-4 py-3 border-2 ${colors.bg} ${colors.border} ${colors.glow} transition-all hover:scale-105 max-w-xs`}
                    >
                      {/* The real pixel badge sprite — the 2K-style medal */}
                      {spriteUrl ? (
                        <img
                          src={spriteUrl}
                          alt={label}
                          className="w-12 h-12 object-contain [image-rendering:pixelated] flex-shrink-0"
                        />
                      ) : (
                        <span className={`flex-shrink-0 ${colors.text}`}>
                          <Icon name={iconName} size={22} />
                        </span>
                      )}
                      <span className="flex flex-col gap-0.5 min-w-0">
                        <span className="flex items-center gap-2">
                          <span className={`font-display font-black uppercase tracking-wider text-sm ${colors.text}`}>
                            {label}
                          </span>
                          {desc?.tier && (
                            <span className={`text-[9px] font-display font-black uppercase tracking-widest ${colors.text} opacity-70`}>
                              {desc.tier}
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-zinc-400 leading-snug normal-case tracking-normal">
                          {effectText}
                        </span>
                      </span>
                    </div>
                  </BadgeTooltip>
                );
              })}
            </div>
          </>
        )}

        {/* Badges In Reach — concrete progress toward 3 nearest badges */}
        {badgeProgress.length > 0 && (
          <div className="mt-6 pt-6 border-t-2 border-[#3a3d44]">
            <p className="text-xs font-display font-black uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
              <Icon name="target" size={14} className="text-[#ff8c42]" /> BADGES IN REACH
            </p>
            <div className="space-y-3">
              {badgeProgress.slice(0, 3).map((bp) => {
                const desc = BADGE_DESCRIPTIONS[bp.code];
                const tier = (desc?.tier || 'bronze') as keyof typeof tierColors;
                const colors = tierColors[tier];
                const iconName = desc ? categoryIcons[desc.category] || 'medal' : 'medal';
                const spriteUrl = badgeIcons[bp.code]?.url || null;
                return (
                  <BadgeTooltip key={bp.code} badgeCode={bp.code}>
                    <div className="bg-[#18191c] border-2 border-[#3a3d44] p-3 hover:border-[#ff8c42]/40 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {spriteUrl ? (
                            <img src={spriteUrl} alt="" className="w-8 h-8 object-contain [image-rendering:pixelated] opacity-80" />
                          ) : (
                            <span className={colors.text}><Icon name={iconName} size={16} /></span>
                          )}
                          <span className={`font-display font-black uppercase text-sm tracking-wider ${colors.text}`}>
                            {bp.label}
                          </span>
                        </div>
                        <span className="text-xs font-display font-black text-zinc-400">
                          {bp.pct}%
                        </span>
                      </div>
                      <div className="w-full bg-[#0e0f12] h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            bp.pct >= 80 ? 'bg-green-500' : bp.pct >= 40 ? 'bg-[#ff8c42]' : 'bg-zinc-600'
                          }`}
                          style={{ width: `${Math.min(100, bp.pct)}%` }}
                        />
                      </div>
                      <p className="text-xs text-zinc-500 mt-2 uppercase tracking-wide">{bp.detail}</p>
                    </div>
                  </BadgeTooltip>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
