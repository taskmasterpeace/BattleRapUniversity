import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
}

export function StatusBadge({
  className,
  variant = 'neutral',
  children,
  ...props
}: StatusBadgeProps) {
  const variantStyles = {
    success: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    danger: 'bg-red-500/20 text-red-500 border-red-500/30',
    warning: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    info: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    neutral: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <span
      className={cn(
        'border-2 px-3 py-1 rounded uppercase text-xs font-bold inline-block',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
