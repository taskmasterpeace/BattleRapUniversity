'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getInitials, getTierColor } from '@/lib/services/imageUploadService';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type Props = {
  battler: {
    stage_name: string;
    avatar_url?: string | null;
    tier?: string;
  };
  size?: Size;
  className?: string;
  showBorder?: boolean;
};

const sizeClasses: Record<Size, string> = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-12 h-12 text-sm',
  md: 'w-16 h-16 text-base',
  lg: 'w-24 h-24 text-xl',
  xl: 'w-32 h-32 text-2xl',
  '2xl': 'w-40 h-40 text-3xl',
};

// Convert size to pixel dimensions for Next.js Image
const sizePx: Record<Size, number> = {
  xs: 32,
  sm: 48,
  md: 64,
  lg: 96,
  xl: 128,
  '2xl': 160,
};

export default function BattlerAvatar({
  battler,
  size = 'md',
  className = '',
  showBorder = false,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasImage = battler.avatar_url && !imageError;
  const initials = getInitials(battler.stage_name);
  const tierColor = getTierColor(battler.tier || 'low');
  const sizeClass = sizeClasses[size];
  const borderClass = showBorder ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-zinc-950' : '';

  if (hasImage) {
    return (
      <div className={`relative ${sizeClass} ${className}`}>
        {/* Tier-colored background circle */}
        <div className={`absolute inset-0 rounded-full ${tierColor} ${loading ? 'flex items-center justify-center font-black text-white' : ''}`}>
          {loading && initials}
        </div>
        {/* Character sprite displayed over background */}
        <div className={`relative w-full h-full rounded-full overflow-hidden ${borderClass}`}>
          <Image
            src={battler.avatar_url!}
            alt={battler.stage_name}
            width={sizePx[size]}
            height={sizePx[size]}
            className={`object-contain ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setImageError(true);
              setLoading(false);
            }}
            unoptimized // Character sprites are already optimized PNGs
          />
        </div>
      </div>
    );
  }

  // Fallback to initials (for backwards compatibility or if sprite fails to load)
  return (
    <div
      className={`${sizeClass} ${tierColor} rounded-full flex items-center justify-center font-black text-white ${borderClass} ${className}`}
    >
      {initials}
    </div>
  );
}
