'use client';

import { useEffect, useState } from 'react';
import { BADGE_REGISTRY } from '@/lib/game/badges';

type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

type BadgeUnlockModalProps = {
  badgeCode: string;
  rarity?: BadgeRarity;
  onDismiss: () => void;
  autoAdvanceDelay?: number;
};

const BADGE_TYPE_ICONS: Record<string, string> = {
  writing: '✍️',
  performance: '🎤',
  reputation: '⭐',
  content: '🎯',
  career: '🏆',
  streak: '🔥',
  tournament: '👑',
  default: '🏅',
};

const RARITY_CONFIG: Record<BadgeRarity, {
  color: string;
  gradient: string;
  glow: string;
  label: string;
  particleColor: string;
}> = {
  common: {
    color: 'text-zinc-400',
    gradient: 'from-zinc-600 to-zinc-700',
    glow: 'shadow-[0_0_30px_rgba(161,161,170,0.5)]',
    label: 'COMMON',
    particleColor: '#a1a1aa',
  },
  rare: {
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-blue-600',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.6)]',
    label: 'RARE',
    particleColor: '#3b82f6',
  },
  epic: {
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-purple-600',
    glow: 'shadow-[0_0_40px_rgba(168,85,247,0.7)]',
    label: 'EPIC',
    particleColor: '#a855f7',
  },
  legendary: {
    color: 'text-orange-400',
    gradient: 'from-orange-500 via-amber-500 to-orange-600',
    glow: 'shadow-[0_0_50px_rgba(251,146,60,0.8)]',
    label: 'LEGENDARY',
    particleColor: '#fb923c',
  },
};

function getBadgeType(badgeCode: string): string {
  const lowerCode = badgeCode.toLowerCase();
  if (lowerCode.includes('writer') || lowerCode.includes('wordplay') || lowerCode.includes('lyric')) {
    return 'writing';
  }
  if (lowerCode.includes('stage') || lowerCode.includes('crowd') || lowerCode.includes('performance')) {
    return 'performance';
  }
  if (lowerCode.includes('veteran') || lowerCode.includes('professional')) {
    return 'reputation';
  }
  if (lowerCode.includes('tournament')) {
    return 'tournament';
  }
  if (lowerCode.includes('streak')) {
    return 'streak';
  }
  return 'default';
}

function formatBadgeName(badgeCode: string): string {
  return badgeCode.replace(/[_\\\/]/g, ' ');
}

function getBadgeDescription(badgeCode: string): string {
  const effects = BADGE_REGISTRY[badgeCode];
  if (!effects) return 'A special achievement in your battle rap career.';

  const descriptions: string[] = [];

  // Positive effects
  if (effects.lyricismMultiplier && effects.lyricismMultiplier > 1.1) {
    descriptions.push(`+${Math.round((effects.lyricismMultiplier - 1) * 100)}% lyricism`);
  }
  if (effects.wordplayMultiplier && effects.wordplayMultiplier > 1.1) {
    descriptions.push(`+${Math.round((effects.wordplayMultiplier - 1) * 100)}% wordplay`);
  }
  if (effects.stagePresenceMultiplier && effects.stagePresenceMultiplier > 1.1) {
    descriptions.push(`+${Math.round((effects.stagePresenceMultiplier - 1) * 100)}% stage presence`);
  }
  if (effects.chokeReduction && effects.chokeReduction > 0.01) {
    descriptions.push(`-${Math.round(effects.chokeReduction * 100)}% choke risk`);
  }
  if (effects.peakBonus && effects.peakBonus > 0.05) {
    descriptions.push(`+${Math.round(effects.peakBonus * 100)}% peak moments`);
  }

  return descriptions.length > 0
    ? `Grants ${descriptions.slice(0, 3).join(', ')}`
    : 'Shapes your unique battle rap style and reputation.';
}

function getBadgeEffects(badgeCode: string): string[] {
  const effects = BADGE_REGISTRY[badgeCode];
  if (!effects) return [];

  const effectsList: string[] = [];

  // Prep efficiency
  if (effects.writingPrepEfficiency && Math.abs(effects.writingPrepEfficiency - 1.0) > 0.1) {
    const change = Math.round((effects.writingPrepEfficiency - 1) * 100);
    effectsList.push(`${change > 0 ? '+' : ''}${change}% writing prep efficiency`);
  }
  if (effects.performancePrepEfficiency && Math.abs(effects.performancePrepEfficiency - 1.0) > 0.1) {
    const change = Math.round((effects.performancePrepEfficiency - 1) * 100);
    effectsList.push(`${change > 0 ? '+' : ''}${change}% performance prep efficiency`);
  }

  // Attribute multipliers
  if (effects.lyricismMultiplier && Math.abs(effects.lyricismMultiplier - 1.0) > 0.1) {
    const change = Math.round((effects.lyricismMultiplier - 1) * 100);
    effectsList.push(`${change > 0 ? '+' : ''}${change}% lyricism multiplier`);
  }
  if (effects.wordplayMultiplier && Math.abs(effects.wordplayMultiplier - 1.0) > 0.1) {
    const change = Math.round((effects.wordplayMultiplier - 1) * 100);
    effectsList.push(`${change > 0 ? '+' : ''}${change}% wordplay multiplier`);
  }
  if (effects.creativityMultiplier && Math.abs(effects.creativityMultiplier - 1.0) > 0.1) {
    const change = Math.round((effects.creativityMultiplier - 1) * 100);
    effectsList.push(`${change > 0 ? '+' : ''}${change}% creativity multiplier`);
  }

  // Special mechanics
  if (effects.chokeReduction && effects.chokeReduction > 0.01) {
    effectsList.push(`-${Math.round(effects.chokeReduction * 100)}% choke probability`);
  }
  if (effects.chokeIncrease && effects.chokeIncrease > 0.01) {
    effectsList.push(`+${Math.round(effects.chokeIncrease * 100)}% choke probability`);
  }
  if (effects.peakBonus && Math.abs(effects.peakBonus) > 0.05) {
    effectsList.push(`${effects.peakBonus > 0 ? '+' : ''}${Math.round(effects.peakBonus * 100)}% peak segment bonus`);
  }
  if (effects.crowdReactionBonus && Math.abs(effects.crowdReactionBonus) > 3) {
    effectsList.push(`${effects.crowdReactionBonus > 0 ? '+' : ''}${effects.crowdReactionBonus} crowd reaction`);
  }

  return effectsList.slice(0, 5);
}

export default function BadgeUnlockModal({
  badgeCode,
  rarity = 'common',
  onDismiss,
  autoAdvanceDelay = 5000,
}: BadgeUnlockModalProps) {
  const [visible, setVisible] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<Array<{ id: number; x: number; delay: number; duration: number }>>([]);

  const badgeType = getBadgeType(badgeCode);
  const icon = BADGE_TYPE_ICONS[badgeType] || BADGE_TYPE_ICONS.default;
  const name = formatBadgeName(badgeCode);
  const description = getBadgeDescription(badgeCode);
  const effects = getBadgeEffects(badgeCode);
  const rarityConfig = RARITY_CONFIG[rarity];

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setVisible(true), 50);

    // Generate confetti particles
    const particles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 0.5,
    }));
    setConfettiParticles(particles);

    // Auto-advance timer
    const timer = setTimeout(() => {
      handleDismiss();
    }, autoAdvanceDelay);

    return () => clearTimeout(timer);
  }, [autoAdvanceDelay]);

  useEffect(() => {
    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300); // Wait for exit animation
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-unlock-title"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          visible ? 'opacity-80' : 'opacity-0'
        }`}
      />

      {/* Confetti */}
      {confettiParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 pointer-events-none"
          style={{
            left: `${particle.x}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-confetti-fall"
            style={{
              backgroundColor: rarityConfig.particleColor,
            }}
          />
        </div>
      ))}

      {/* Modal Card */}
      <div
        className={`relative max-w-lg w-full transform transition-all duration-500 ${
          visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: visible ? 'badge-bounce 0.5s ease-out' : undefined,
        }}
      >
        {/* Glow Effect */}
        <div
          className={`absolute inset-0 blur-xl ${rarityConfig.glow} animate-pulse-glow`}
          style={{ animationDuration: '2s' }}
        />

        {/* Card Content */}
        <div className="relative bg-[#18191c] border-4 border-[#3a3d44] overflow-hidden">
          {/* Header with Gradient */}
          <div className={`bg-gradient-to-r ${rarityConfig.gradient} p-8 text-center`}>
            <div className="text-6xl mb-4 animate-icon-wobble" style={{ animationDuration: '0.5s' }}>
              {icon}
            </div>
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-widest font-black text-white/80">
                {rarityConfig.label} BADGE UNLOCKED
              </div>
              <h2
                id="badge-unlock-title"
                className="text-3xl font-black uppercase tracking-tight text-white"
              >
                {name}
              </h2>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {/* Description */}
            <p className="text-center text-zinc-300 text-sm leading-relaxed">
              {description}
            </p>

            {/* Effects */}
            {effects.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider text-[#ff8c42] font-bold text-center">
                  Badge Effects
                </div>
                <div className="space-y-2">
                  {effects.map((effect, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border-2 border-[#3a3d44]"
                    >
                      <span className="text-[#ff8c42] text-xs">▸</span>
                      <span className="text-sm text-zinc-300">{effect}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleDismiss}
              className="w-full py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider text-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_-4px_rgba(255,140,66,0.5)]"
              autoFocus
            >
              CLAIM BADGE
            </button>

            <p className="text-xs text-center text-zinc-600 uppercase tracking-wide">
              Press ESC or ENTER to continue
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes badge-bounce {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes icon-wobble {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(600px) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow ease-in-out infinite;
        }

        .animate-icon-wobble {
          animation: icon-wobble ease-out;
        }
      `}</style>
    </div>
  );
}
