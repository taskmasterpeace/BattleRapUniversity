'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  selectCrowdReactions,
  type CrowdReactionSprite,
  type LeagueDemographics,
  getDefaultDemographics
} from '@/lib/game/crowdReactions';

interface CrowdReactionWindowProps {
  /** Crowd reaction score (0-100) from battle segment or round */
  crowdScore: number;

  /** League demographic breakdown (optional, uses default if not provided) */
  leagueDemographics?: LeagueDemographics;

  /** Optional title for the window */
  title?: string;

  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Crowd Reaction Window Component
 *
 * Displays 3 random crowd member reactions based on:
 * - Crowd score (0-100) determines reaction breakdown (positive/neutral/negative)
 * - League demographics determine racial makeup of displayed crowd members
 *
 * Visual design: 3 sprites overlapped slightly to look like a crowd sample
 */
export default function CrowdReactionWindow({
  crowdScore,
  leagueDemographics,
  title = 'CROWD REACTION',
  size = 'medium'
}: CrowdReactionWindowProps) {
  const [reactions, setReactions] = useState<CrowdReactionSprite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Select reactions when score or demographics change
  useEffect(() => {
    setIsLoading(true);
    const demographics = leagueDemographics || getDefaultDemographics();
    const selectedReactions = selectCrowdReactions(crowdScore, demographics);
    setReactions(selectedReactions);
    setImageErrors(new Set());
    setIsLoading(false);
  }, [crowdScore, leagueDemographics]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  // Size configurations
  const sizeConfig = {
    small: {
      containerHeight: 'h-24',
      spriteSize: 64,
      overlap: -20,
      fontSize: 'text-xs',
      padding: 'p-3'
    },
    medium: {
      containerHeight: 'h-32',
      spriteSize: 80,
      overlap: -25,
      fontSize: 'text-sm',
      padding: 'p-4'
    },
    large: {
      containerHeight: 'h-40',
      spriteSize: 96,
      overlap: -30,
      fontSize: 'text-base',
      padding: 'p-6'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`bg-[#2d2f35] border-2 border-[#3a3d44] ${config.padding}`}>
      {/* Title */}
      <div className={`${config.fontSize} font-display font-black uppercase tracking-wider text-zinc-500 mb-3`}>
        {title}
      </div>

      {/* Crowd Window */}
      <div
        className={`relative ${config.containerHeight} bg-[#18191c] border-2 border-[#3a3d44] rounded flex items-center justify-center overflow-hidden`}
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(39, 39, 42, 0.3), rgba(9, 9, 11, 1))',
        }}
      >
        {isLoading ? (
          <div className="text-zinc-600 text-xs uppercase tracking-wider">Loading...</div>
        ) : (
          <div className="flex items-center justify-center">
            {reactions.map((reaction, index) => {
              const hasError = imageErrors.has(index);

              return (
                <div
                  key={index}
                  className="relative transition-transform hover:scale-110 hover:z-10"
                  style={{
                    marginLeft: index > 0 ? `${config.overlap}px` : '0',
                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))',
                  }}
                  title={`${reaction.demographic} - ${reaction.reaction}`}
                >
                  {hasError ? (
                    // Fallback if sprite doesn't exist yet
                    <div
                      className="bg-zinc-800 border-2 border-[#3a3d44] rounded-full flex items-center justify-center"
                      style={{
                        width: config.spriteSize,
                        height: config.spriteSize,
                      }}
                    >
                      <span className="text-zinc-600 text-2xl">
                        {reaction.category === 'positive' ? '😃' : reaction.category === 'neutral' ? '😐' : '😒'}
                      </span>
                    </div>
                  ) : (
                    <Image
                      src={reaction.sprite}
                      alt={`${reaction.demographic} person ${reaction.reaction}`}
                      width={config.spriteSize}
                      height={config.spriteSize}
                      className="pixelated"
                      style={{ imageRendering: 'pixelated' }}
                      onError={() => handleImageError(index)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Score Display */}
      <div className="mt-3 flex items-center justify-between">
        <div className={`${config.fontSize} uppercase tracking-wider text-zinc-500`}>
          Score: <span className="text-zinc-100 font-black">{crowdScore}/100</span>
        </div>

        {/* Reaction breakdown (optional debug info) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-zinc-600 uppercase tracking-wider">
            {reactions.map(r => r.reaction.slice(0, 3)).join(' / ')}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact variant for showing crowd reaction inline
 */
export function CompactCrowdReaction({ crowdScore }: { crowdScore: number }) {
  // Color based on score
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'HYPED';
    if (score >= 60) return 'FEELING IT';
    if (score >= 40) return 'LUKEWARM';
    if (score >= 20) return 'NOT IMPRESSED';
    return 'BOOING';
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-zinc-500">Crowd:</span>
      <span className={`text-sm font-black uppercase tracking-wider ${getScoreColor(crowdScore)}`}>
        {getScoreLabel(crowdScore)}
      </span>
      <span className="text-xs text-zinc-600">({crowdScore})</span>
    </div>
  );
}
