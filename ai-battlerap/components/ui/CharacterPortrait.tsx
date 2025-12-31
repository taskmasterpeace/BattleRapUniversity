import Image from 'next/image';
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CharacterPortraitProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tier?: 'low' | 'mid' | 'top' | 'god';
}

export function CharacterPortrait({
  src,
  alt,
  size = 'md',
  tier,
  className,
  ...props
}: CharacterPortraitProps) {
  const sizeStyles = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const tierBackgrounds = {
    low: 'bg-slate-700',
    mid: 'bg-gradient-to-br from-slate-600 to-slate-700',
    top: 'bg-gradient-to-br from-orange-600 to-orange-700',
    god: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
  };

  return (
    <div
      className={cn('relative', sizeStyles[size], className)}
      {...props}
    >
      {/* Background circle with tier-based gradient */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          tier ? tierBackgrounds[tier] : 'bg-slate-700'
        )}
      />

      {/* Character sprite */}
      <div className="relative z-10 w-full h-full rounded-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}
