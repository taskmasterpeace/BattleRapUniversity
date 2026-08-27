'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
  url?: string | null;
  size?: number;
  className?: string;
  showBorder?: boolean;
  alt?: string;
};

/**
 * Avatar — renders a battler's `avatar_url` (a full path under /public).
 * Falls back to the battler's initials when the url is missing or fails to load
 * (never a microphone — league battle rap is acapella; only hosts hold mics).
 * Replaces the legacy BattlerSprite which selected from a hardcoded sheet
 * by numeric sprite_id (a column that never existed on the battlers table).
 */
export default function Avatar({
  url,
  size = 96,
  className = '',
  showBorder = true,
  alt = 'Battler avatar',
}: Props) {
  const [imageError, setImageError] = useState(false);
  const showImage = !!url && !imageError;
  // Fallback identity when there's no portrait: the battler's initials. Never a
  // microphone (no-mics law) — and initials also render everywhere, unlike an
  // emoji glyph. Ignore the generic default alt so it doesn't become "BA".
  const named = alt && alt !== 'Battler avatar' ? alt.trim() : '';
  const initials = named
    ? named.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <div
      className={`relative overflow-hidden group ${showBorder ? 'border-4 border-[#3a3d44] bg-[#1a1b1e]' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {showBorder && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-[#ff8c42] z-10" />
      )}
      {showBorder && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          }}
        />
      )}

      {showImage ? (
        <Image
          src={url as string}
          alt={alt}
          width={size}
          height={size}
          className="pixelated transition-transform group-hover:scale-[1.85] absolute inset-0 w-full h-full object-cover"
          style={{
            transform: 'scale(1.75)',
            transformOrigin: 'center 35%',
          }}
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#1a1b1e]">
          {initials ? (
            <span
              className="font-display font-black text-[#ff8c42] leading-none tracking-tight"
              style={{ fontSize: Math.max(13, Math.floor(size * 0.36)) }}
            >
              {initials}
            </span>
          ) : (
            <span style={{ fontSize: Math.max(16, Math.floor(size * 0.4)) }}>🎭</span>
          )}
        </div>
      )}
    </div>
  );
}
