import Image from 'next/image';
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeSpriteProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  tier: 'gold' | 'silver' | 'bronze' | 'common';
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeSprite({
  src,
  alt,
  tier: _tier,
  size = 'md',
  className,
  ...props
}: BadgeSpriteProps) {
  // The sprite PNGs are 512x512 and contain BOTH the circular artwork (top ~70%)
  // AND a baked-in text label (bottom ~30%) that's clipped at the canvas edge
  // (e.g. "COMMENTARY" loses the descenders). Since BadgeCard already shows the
  // badge name as text alongside, we crop the label out by making the container
  // shorter than wide and letting overflow-hidden hide the bottom of the image.
  // Artwork circle ends at ~65% of canvas height; label sits in the bottom ~35%
  // and gets visually clipped at the PNG edge. Crop down to ~65% to hide labels
  // entirely — the badge name shows as text in BadgeCard anyway.
  const containerStyles = {
    sm: 'w-16 h-[2.625rem]',   // 64x42 - shows top 65%
    md: 'w-24 h-[3.875rem]',   // 96x62 - shows top 65%
    lg: 'w-32 h-[5.25rem]',    // 128x84 - shows top 65%
  };

  const pixelDimensions = {
    sm: 64,
    md: 96,
    lg: 128,
  };

  return (
    <div
      className={cn('relative shrink-0 overflow-hidden', containerStyles[size], className)}
      {...props}
    >
      <Image
        src={src}
        alt={alt}
        width={pixelDimensions[size]}
        height={pixelDimensions[size]}
        className="w-full h-auto"
      />
    </div>
  );
}
