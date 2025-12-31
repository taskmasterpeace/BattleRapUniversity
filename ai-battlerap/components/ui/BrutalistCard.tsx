'use client';

import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  variant?: 'default' | 'tilted' | 'torn';
  accent?: 'orange' | 'red' | 'yellow' | 'blue';
  className?: string;
};

export default function BrutalistCard({ children, variant = 'default', accent = 'orange', className = '' }: Props) {
  const accentColors = {
    orange: 'border-[#ff8c42]',
    red: 'border-red-500',
    yellow: 'border-yellow-400',
    blue: 'border-blue-500',
  };

  const baseClasses = 'relative bg-[#1a1b1e] border-4 p-6 overflow-hidden';

  const variantClasses = {
    default: '',
    tilted: 'transform -rotate-1',
    torn: '',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${accentColors[accent]} ${className}`}>
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Diagonal stripe accent */}
      <div className={`absolute top-0 right-0 w-2 h-full ${accentColors[accent]} opacity-50`} />

      {children}
    </div>
  );
}
