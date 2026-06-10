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
  style,
  ...props
}: BadgeSpriteProps) {
  // The sprite PNGs are 512x512 with the circle artwork in the top ~70%
  // and a baked-in text label in the bottom ~30%. We use background-image
  // sized to ~140% (so the top 70% of the source fills the container) and
  // positioned at the top, which cleanly crops out the label.
  const containerStyles = {
    sm: 'w-16 h-16',  // 64x64 square
    md: 'w-24 h-24',  // 96x96 square
    lg: 'w-32 h-32',  // 128x128 square
  };

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn('shrink-0 bg-no-repeat', containerStyles[size], className)}
      style={{
        backgroundImage: `url(${src})`,
        // Sprites are 512x512 squares: circle artwork on top + baked-in label below.
        // Show the full image (no crop) so both the icon and the label are visible.
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        ...style,
      }}
      {...props}
    />
  );
}
