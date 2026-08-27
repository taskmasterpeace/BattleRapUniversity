'use client';

import { useState, ReactNode } from 'react';

type Props = {
  battler: {
    stage_name: string;
    banner_url?: string | null;
    tier?: string;
  };
  className?: string;
  children?: ReactNode;
  showOverlay?: boolean;
};

export default function BattlerBanner({
  battler,
  className = '',
  children,
  showOverlay = true,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasImage = battler.banner_url && !imageError;

  // Gradient fallback based on tier
  const getGradient = (tier?: string) => {
    switch (tier) {
      case 'god':
        return 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-600';
      case 'top':
        return 'bg-gradient-to-r from-orange-500 via-[#ff8c42] to-amber-400';
      case 'mid':
        return 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600';
      case 'low':
        return 'bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700';
      default:
        return 'bg-gradient-to-r from-orange-600 via-zinc-800 to-zinc-900';
    }
  };

  if (hasImage) {
    return (
      <div className={`relative w-full aspect-[4/1] ${className}`}>
        {loading && (
          <div className={`absolute inset-0 ${getGradient(battler.tier)}`} />
        )}
        <img
          src={battler.banner_url!}
          alt={`${battler.stage_name} banner`}
          className={`w-full h-full object-cover ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setImageError(true);
            setLoading(false);
          }}
        />
        {showOverlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        )}
        {children && (
          <div className="absolute inset-0 flex items-end">
            {children}
          </div>
        )}
      </div>
    );
  }

  // Fallback to gradient
  return (
    <div className={`relative w-full aspect-[4/1] ${getGradient(battler.tier)} ${className}`}>
      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
      )}
      {children && (
        <div className="absolute inset-0 flex items-end">
          {children}
        </div>
      )}
    </div>
  );
}
