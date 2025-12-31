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
  tier,
  size = 'md',
  className,
  ...props
}: BadgeSpriteProps) {
  const sizeStyles = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const tierGradients = {
    gold: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    silver: 'bg-gradient-to-br from-gray-300 to-gray-500',
    bronze: 'bg-gradient-to-br from-amber-600 to-amber-800',
    common: 'bg-gradient-to-br from-slate-500 to-slate-700',
  };

  return (
    <div
      className={cn('relative', sizeStyles[size], className)}
      {...props}
    >
      {/* Tier-based background circle */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          tierGradients[tier]
        )}
      />

      {/* Badge sprite */}
      <div className="relative z-10 w-full h-full p-2">
        <Image
          src={src}
          alt={alt}
          width={64}
          height={64}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
