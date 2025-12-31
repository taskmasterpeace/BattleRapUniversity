'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
  spriteId: number | null;
  size?: number;
  className?: string;
  showBorder?: boolean;
};

export default function BattlerSprite({ spriteId, size = 96, className = '', showBorder = true }: Props) {
  const [imageError, setImageError] = useState(false);

  const spritePath = spriteId
    ? `/sprites/characters/image_1764147239421/sprite_${spriteId.toString().padStart(3, '0')}.png`
    : null;

  return (
    <div
      className={`relative overflow-hidden group ${showBorder ? 'border-4 border-[#3a3d44] bg-[#1a1b1e]' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Corner accent */}
      {showBorder && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-[#ff8c42] z-10" />
      )}

      {/* Noise texture overlay */}
      {showBorder && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          }}
        />
      )}

      {spritePath && !imageError ? (
        <Image
          src={spritePath}
          alt="Battler sprite"
          width={size}
          height={size}
          className="pixelated transition-transform group-hover:scale-105"
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : (
        // Fallback placeholder
        <div className="w-full h-full flex items-center justify-center bg-[#1a1b1e]">
          <span className="text-4xl">🎤</span>
        </div>
      )}
    </div>
  );
}
