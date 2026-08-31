'use client';

import { useState } from 'react';
import { getInitials, getTierColor } from '@/lib/services/imageUploadService';
import { portraitFillStyle } from '@/lib/sprite-crops';

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
  const borderClass = showBorder ? 'border-[#ff8c42]' : 'border-black';

  if (hasImage) {
    // Square fill-frame portrait (Flyer System) — the face fills the whole box.
    return (
      <div
        className={`relative ${sizeClass} ${className} border-2 ${borderClass} bg-[#0a0a0a] overflow-hidden`}
      >
        {loading && (
          <div className={`absolute inset-0 ${tierColor} flex items-center justify-center font-black text-white`}>
            {initials}
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={battler.avatar_url!}
          alt={battler.stage_name}
          style={{ ...portraitFillStyle(battler.avatar_url!), opacity: loading ? 0 : 1 }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setImageError(true);
            setLoading(false);
          }}
        />
      </div>
    );
  }

  // Fallback to initials (for backwards compatibility or if sprite fails to load)
  return (
    <div
      className={`${sizeClass} ${tierColor} border-2 ${borderClass} flex items-center justify-center font-black text-white ${className}`}
    >
      {initials}
    </div>
  );
}
