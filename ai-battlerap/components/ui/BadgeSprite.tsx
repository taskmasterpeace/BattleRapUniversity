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
  // The sprite art is already framed in its own colored circle, so we render the
  // PNG directly — no extra tier-colored gradient backdrop behind it. Sizes bumped
  // so the artwork is actually legible in the compendium and showcase grids.
  const sizeStyles = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const pixelDimensions = {
    sm: 64,
    md: 96,
    lg: 128,
  };

  return (
    <div className={cn('relative shrink-0', sizeStyles[size], className)} {...props}>
      <Image
        src={src}
        alt={alt}
        width={pixelDimensions[size]}
        height={pixelDimensions[size]}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
