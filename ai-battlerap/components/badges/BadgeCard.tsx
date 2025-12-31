'use client';

import { BadgeSprite } from '@/components/ui/BadgeSprite';

interface Badge {
  id: string;
  badge_code: string;
  badge_name: string;
  tier: string;
  category: string;
  icon_url: string | null;
  description: string;
  effects: string[];
}

type BadgeCardProps = {
  badge: Badge;
  variant?: 'compact' | 'default' | 'detailed';
  locked?: boolean;
  onClick?: () => void;
  showEffects?: boolean;
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
  },
  common: {
    bg: 'bg-slate-700/20',
    border: 'border-slate-600/40',
    text: 'text-slate-400'
  }
};

export default function BadgeCard({
  badge,
  variant = 'default',
  locked = false,
  onClick,
  showEffects = false,
}: BadgeCardProps) {
  const tier = (badge.tier || 'common') as 'gold' | 'silver' | 'bronze' | 'common';
  const colors = tierColors[tier] || tierColors.common;

  // Default variant (for compendium page)
  return (
    <div
      onClick={onClick}
      className={`
        ${colors.bg} ${colors.border} border-2 rounded-lg p-5 transition-all duration-300
        ${locked ? 'opacity-50 grayscale' : ''}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
      `}
    >
      {/* Badge Header */}
      <div className="flex items-start gap-4 mb-3">
        {/* Badge Sprite */}
        {badge.icon_url && !locked ? (
          <BadgeSprite
            src={badge.icon_url}
            alt={badge.badge_name}
            tier={tier}
            size="md"
          />
        ) : (
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
            <span className="text-2xl">{locked ? '🔒' : '🏅'}</span>
          </div>
        )}

        {/* Badge Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-black text-base ${colors.text} uppercase tracking-wide`}>
              {badge.badge_name}
            </h3>
          </div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
            {badge.badge_code.replace(/_/g, ' ')}
          </p>
          {badge.tier && (
            <span className={`px-2 py-1 ${colors.bg} ${colors.border} border-2 rounded text-xs font-bold ${colors.text} uppercase`}>
              {badge.tier}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-400 italic mb-4">
        {locked ? 'This badge is locked. Complete specific achievements to unlock it.' : badge.description}
      </p>

      {/* Effects */}
      {!locked && badge.effects && badge.effects.length > 0 && (
        <div className="space-y-2 pt-3 border-t-2 border-[#3a3d44]">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Effects:</p>
          {badge.effects.map((effect: string, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-500 text-xs mt-0.5">▸</span>
              <p className="text-xs text-zinc-300">{effect}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
