'use client';

import { useState } from 'react';
import { BADGE_DESCRIPTIONS, type BadgeDescription } from '@/lib/game/badgeDescriptions';
import { getBadgeEffectLines, getBadgeEffectText } from '@/lib/game/badgeEffectText';

type Props = {
  badgeCode: string;
  children: React.ReactNode;
};

const tierColors = {
  bronze: {
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/40',
    text: 'text-amber-500'
  },
  silver: {
    bg: 'bg-zinc-700/20',
    border: 'border-zinc-500/40',
    text: 'text-zinc-300'
  },
  gold: {
    bg: 'bg-yellow-600/20',
    border: 'border-yellow-500/40',
    text: 'text-yellow-400'
  }
};

const categoryIcons = {
  writing: '✍️',
  performance: '🎭',
  content: '💡',
  delivery: '🎤',
  reputation_positive: '⭐',
  reputation_negative: '⚠️'
};

export default function BadgeTooltip({ badgeCode, children }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  const badge = BADGE_DESCRIPTIONS[badgeCode];
  const mechanicLines = getBadgeEffectLines(badgeCode);

  if (!badge) {
    // Badge not in the compendium — still show its mechanical effect or flavor role
    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {children}
        </div>
        {isHovered && (
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#2d2f35] border-2 border-[#3a3d44] rounded text-xs w-56 pointer-events-none">
            <p className="text-zinc-200 font-bold uppercase tracking-wide mb-1">
              {badgeCode.replace(/_/g, ' ').toUpperCase()}
            </p>
            {mechanicLines.length > 0 ? (
              <div className="space-y-1">
                {mechanicLines.slice(0, 4).map((line, i) => (
                  <p key={i} className="text-[#ff8c42]">▸ {line}</p>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400">{getBadgeEffectText(badgeCode)}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  const colors = tierColors[badge.tier || 'bronze'];

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {isHovered && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 pointer-events-none">
          <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 shadow-2xl backdrop-blur-sm`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{categoryIcons[badge.category]}</span>
                  <h4 className={`font-black text-sm ${colors.text} uppercase tracking-wide`}>
                    {badge.name}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 italic">
                  {badge.description}
                </p>
              </div>
              {badge.tier && (
                <span className={`px-2 py-1 ${colors.bg} ${colors.border} border-2 rounded text-xs font-bold ${colors.text} uppercase`}>
                  {badge.tier}
                </span>
              )}
            </div>

            {/* Mechanical effects — what the badge actually does in the sim */}
            {mechanicLines.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t-2 border-[#3a3d44]/50">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">In-battle effects:</p>
                {mechanicLines.slice(0, 5).map((line, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-[#ff8c42] text-xs mt-0.5">▸</span>
                    <p className="text-xs text-[#ffb380] font-bold">{line}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Flavor effects from the compendium */}
            {badge.effects.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t-2 border-[#3a3d44]/50">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Effects:</p>
                {badge.effects.map((effect, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-green-500 text-xs mt-0.5">▸</span>
                    <p className="text-xs text-zinc-300">{effect}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Guarantee something concrete shows for every badge */}
            {mechanicLines.length === 0 && badge.effects.length === 0 && (
              <div className="pt-3 border-t-2 border-[#3a3d44]/50">
                <p className="text-xs text-zinc-300">{getBadgeEffectText(badgeCode)}</p>
              </div>
            )}

            {/* Category */}
            <div className="mt-3 pt-3 border-t-2 border-[#3a3d44]/50">
              <p className="text-xs text-zinc-600 uppercase tracking-wide">
                {badge.category.replace(/_/g, ' ')} badge
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className={`w-3 h-3 ${colors.bg} ${colors.border} border-b-2 border-r-2 rotate-45 mx-auto -mt-1.5`} />
        </div>
      )}
    </div>
  );
}
