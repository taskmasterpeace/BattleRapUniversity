'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Props = {
  eventTitle: string;
  choice: 'a' | 'b';
  effects: any;
  category?: string;
  onClose?: () => void;
};

const EVENT_CATEGORIES = {
  career: {
    icon: '💼',
    color: 'orange',
    bgClass: 'bg-[#ff8c42]/10',
    borderClass: 'border-[#ff8c42]/30',
    textClass: 'text-[#ff8c42]'
  },
  personal: {
    icon: '🏠',
    color: 'blue',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
    textClass: 'text-blue-500'
  },
  scandal: {
    icon: '📰',
    color: 'red',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/30',
    textClass: 'text-red-500'
  },
  financial: {
    icon: '💰',
    color: 'green',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/30',
    textClass: 'text-green-500'
  },
  relationship: {
    icon: '❤️',
    // Rose, not purple — house law #1 (matches lib/content/eventCategories.ts).
    color: 'rose',
    bgClass: 'bg-rose-400/10',
    borderClass: 'border-rose-400/40',
    textClass: 'text-rose-400'
  }
};

export default function EventOutcome({ eventTitle, choice, effects, category = 'career', onClose }: Props) {
  const [animatedEffects, setAnimatedEffects] = useState<Record<string, number>>({});
  const categoryConfig = EVENT_CATEGORIES[category as keyof typeof EVENT_CATEGORIES] || EVENT_CATEGORIES.career;

  // Animate attribute changes
  useEffect(() => {
    if (!effects) return;

    const attributeKeys = Object.keys(effects);
    const initialValues: Record<string, number> = {};

    attributeKeys.forEach(key => {
      initialValues[key] = 0;
    });

    setAnimatedEffects(initialValues);

    // Stagger the animations
    attributeKeys.forEach((key, index) => {
      setTimeout(() => {
        const targetValue = effects[key];
        animateValue(key, 0, targetValue, 500);
      }, index * 150);
    });
  }, [effects]);

  const animateValue = (key: string, start: number, end: number, duration: number) => {
    const startTime = Date.now();
    const range = end - start;

    const updateValue = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (range * easeOut);

      setAnimatedEffects(prev => ({
        ...prev,
        [key]: current
      }));

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  };

  const formatAttributeName = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isPositive = (value: number) => value > 0;
  const isNegative = (value: number) => value < 0;

  // Calculate overall sentiment
  const totalChange = Object.values(effects || {}).reduce((sum: number, val: any) => {
    if (typeof val === 'number') return sum + val;
    return sum;
  }, 0);
  const overallPositive = totalChange > 0;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-2xl w-full bg-[#18191c] border-2 border-[#3a3d44] shadow-2xl animate-scale-in">
        {/* Header */}
        <div className={`${categoryConfig.bgClass} border-b-2 ${categoryConfig.borderClass} p-6`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{categoryConfig.icon}</span>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Life Event Resolved</p>
              <h2 className="text-2xl font-black tracking-tight text-zinc-100">
                {eventTitle}
              </h2>
            </div>
          </div>

          <div className={`${categoryConfig.bgClass} border-2 ${categoryConfig.borderClass} p-3 mt-4`}>
            <p className={`text-sm font-bold ${categoryConfig.textClass} uppercase tracking-wide`}>
              You chose: Choice {choice.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Outcome Message */}
        <div className="p-6 border-b-2 border-[#3a3d44]">
          <div className={`${overallPositive ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} border-2 p-4`}>
            <p className={`text-sm ${overallPositive ? 'text-green-400' : 'text-red-400'} font-display font-black uppercase tracking-wide mb-2`}>
              {overallPositive ? '✓ DECISION EXECUTED' : '⚠ CONSEQUENCES APPLIED'}
            </p>
            <p className="text-sm text-zinc-300">
              Your choice has been enacted and the following changes have been applied to your battler.
            </p>
          </div>
        </div>

        {/* Attribute Changes */}
        <div className="p-6">
          <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4 font-bold">
            Attribute Changes
          </h3>

          <div className="space-y-4">
            {Object.entries(effects || {}).map(([key, value]: [string, any]) => {
              const numValue = typeof value === 'number' ? value : 0;
              const animated = animatedEffects[key] || 0;
              const positive = isPositive(numValue);
              const negative = isNegative(numValue);

              return (
                <div
                  key={key}
                  className="bg-[#2d2f35]/50 border-2 border-[#3a3d44] p-4 animate-slide-in-up"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-zinc-300 uppercase tracking-wide">
                      {formatAttributeName(key)}
                    </span>
                    <span className={`text-2xl font-black ${
                      positive ? 'text-green-500' : negative ? 'text-red-500' : 'text-zinc-500'
                    }`}>
                      {positive ? '+' : ''}{Math.round(animated * 10) / 10}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        positive ? 'bg-green-500' : negative ? 'bg-red-500' : 'bg-zinc-600'
                      }`}
                      style={{
                        width: `${Math.min(Math.abs(animated / numValue) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t-2 border-[#3a3d44] flex gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-display font-black uppercase tracking-wider transition"
            >
              CLOSE
            </button>
          )}
          <Link
            href="/dashboard"
            className="flex-1 px-6 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition text-center"
          >
            RETURN TO DASHBOARD
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.4s ease-out;
        }
        .animate-slide-in-up {
          animation: slideInUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
