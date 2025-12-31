'use client';

import Link from 'next/link';

type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export default function GamingButton({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  className = '',
}: Props) {
  const baseClasses = 'relative font-anton uppercase tracking-wider transition-all transform overflow-hidden group';

  const variantClasses = {
    primary:
      'bg-[#ff8c42] hover:bg-[#ff9d5c] text-black hover:shadow-[0_0_30px_rgba(255,140,66,0.6)] hover:scale-[1.02] border-4 border-[#ff8c42]',
    secondary: 'border-4 border-[#3a3d44] hover:border-[#ff8c42] text-white bg-[#1a1b1e] hover:bg-[#2d2f35]',
    danger: 'bg-red-500 hover:bg-red-600 text-white border-4 border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
    disabled ? 'opacity-30 cursor-not-allowed' : ''
  } ${className}`;

  const content = (
    <>
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Animated highlight on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

      <span className="relative z-10">{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
