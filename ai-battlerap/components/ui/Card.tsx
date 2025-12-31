import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-slate-800 border-2 border-slate-600',
      elevated: 'bg-slate-700 border-2 border-slate-500',
      bordered: 'bg-slate-900 border-2 border-slate-600',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg p-6 space-y-4',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
