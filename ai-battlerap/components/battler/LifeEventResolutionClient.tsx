'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Props = {
  event: any;
  battler: any;
};

// Event category configuration
const EVENT_CATEGORIES = {
  career: {
    color: 'orange',
    icon: '💼',
    bgClass: 'bg-[#ff8c42]/10',
    borderClass: 'border-[#ff8c42]/30',
    textClass: 'text-[#ff8c42]'
  },
  personal: {
    color: 'blue',
    icon: '🏠',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
    textClass: 'text-blue-500'
  },
  scandal: {
    color: 'red',
    icon: '📰',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/30',
    textClass: 'text-red-500'
  },
  financial: {
    color: 'green',
    icon: '💰',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/30',
    textClass: 'text-green-500'
  },
  relationship: {
    color: 'purple',
    icon: '❤️',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
    textClass: 'text-purple-500'
  }
};

// Severity levels
const SEVERITY_LEVELS = {
  minor: { label: 'Minor', color: 'text-zinc-500' },
  moderate: { label: 'Moderate', color: 'text-yellow-500' },
  major: { label: 'Major', color: 'text-[#ff8c42]' },
  critical: { label: 'Critical', color: 'text-red-500' }
};

export default function LifeEventResolutionClient({ event, battler }: Props) {
  const router = useRouter();
  const [selectedChoice, setSelectedChoice] = useState<'a' | 'b' | null>(null);
  const [resolving, setResolving] = useState(false);
  const [showEffects, setShowEffects] = useState<'a' | 'b' | null>(null);
  const [shakeConfirm, setShakeConfirm] = useState(false);

  const template = event.template;

  // Determine event category and severity (with fallbacks for existing events)
  const category = template.category || 'career';
  const severity = template.severity || 'moderate';
  const categoryConfig = EVENT_CATEGORIES[category as keyof typeof EVENT_CATEGORIES] || EVENT_CATEGORIES.career;
  const severityConfig = SEVERITY_LEVELS[severity as keyof typeof SEVERITY_LEVELS] || SEVERITY_LEVELS.moderate;

  const handleResolve = async () => {
    if (!selectedChoice) {
      // Shake animation if no choice selected
      setShakeConfirm(true);
      setTimeout(() => setShakeConfirm(false), 500);
      return;
    }

    setResolving(true);
    try {
      const response = await fetch(`/api/life-events/${event.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ choice: selectedChoice }),
      });

      if (response.ok) {
        const data = await response.json();
        // Pass outcome data to dashboard via URL params
        const outcomeParams = new URLSearchParams({
          event_resolved: 'true',
          event_title: template.title,
          choice: selectedChoice,
          effects: JSON.stringify(data.effects)
        });
        router.push(`/dashboard?${outcomeParams.toString()}`);
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Failed to resolve event: ${data.error}`);
        setResolving(false);
      }
    } catch (error) {
      console.error('Error resolving life event:', error);
      alert('Failed to resolve life event');
      setResolving(false);
    }
  };

  const formatEffects = (effects: any) => {
    if (!effects) return [];

    const formattedEffects: string[] = [];

    // Personal attributes
    if (effects.reputation) {
      formattedEffects.push(`${effects.reputation > 0 ? '+' : ''}${effects.reputation} Reputation`);
    }
    if (effects.financial_stability) {
      formattedEffects.push(`${effects.financial_stability > 0 ? '+' : ''}${effects.financial_stability} Financial Stability`);
    }
    if (effects.family_bond) {
      formattedEffects.push(`${effects.family_bond > 0 ? '+' : ''}${effects.family_bond} Family Bond`);
    }

    // Core attributes
    if (effects.resilience) {
      formattedEffects.push(`${effects.resilience > 0 ? '+' : ''}${effects.resilience} Resilience`);
    }
    if (effects.lyricism) {
      formattedEffects.push(`${effects.lyricism > 0 ? '+' : ''}${effects.lyricism} Lyricism`);
    }
    if (effects.stage_presence) {
      formattedEffects.push(`${effects.stage_presence > 0 ? '+' : ''}${effects.stage_presence} Stage Presence`);
    }

    // Public knowledge
    if (effects.public_knowledge) {
      formattedEffects.push(`${effects.public_knowledge > 0 ? '+' : ''}${effects.public_knowledge}% Public Knowledge`);
    }

    // Prep bonuses/penalties
    if (effects.prep_bonus_writing) {
      formattedEffects.push(`+${effects.prep_bonus_writing} Writing Prep Bonus (next battle)`);
    }
    if (effects.prep_bonus_performance) {
      formattedEffects.push(`+${effects.prep_bonus_performance} Performance Prep Bonus (next battle)`);
    }
    if (effects.prep_penalty) {
      formattedEffects.push(`-${Math.abs(effects.prep_penalty)} Prep Penalty (next battle)`);
    }

    return formattedEffects;
  };

  const choiceAEffects = formatEffects(template.choice_a_effects);
  const choiceBEffects = template.choice_b_effects ? formatEffects(template.choice_b_effects) : [];

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#2d2f35]/50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight hover:text-[#ff8c42] transition">
              ALGORITHM INSTITUTE
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="text-sm text-zinc-500 uppercase tracking-wider">Life Event</span>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition uppercase tracking-wider"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Event Context - Enhanced */}
        {event.battle && (
          <div className="mb-8 bg-[#2d2f35] border-2 border-[#3a3d44] p-4 animate-fade-in">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Triggered After Battle</p>
            <p className="text-sm font-bold text-zinc-300">
              vs {event.battle.ai_battler?.stage_name} • {new Date(event.battle.scheduled_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Event Title & Description - Enhanced with fade-in animation */}
        <div className="mb-8 animate-fade-in-up">
          <div className="mb-4 flex items-center gap-3">
            {/* Category Badge */}
            <span className={`px-3 py-1 ${categoryConfig.bgClass} ${categoryConfig.textClass} border-2 ${categoryConfig.borderClass} text-xs font-display font-black uppercase tracking-wider flex items-center gap-2`}>
              <span>{categoryConfig.icon}</span>
              <span>{category}</span>
            </span>

            {/* Severity Badge */}
            <span className={`px-3 py-1 bg-[#2d2f35] ${severityConfig.color} border-2 border-[#3a3d44] text-xs font-display font-black uppercase tracking-wider`}>
              {severityConfig.label}
            </span>
          </div>

          <h1 className="text-5xl font-display font-black tracking-tighter mb-4 bg-gradient-to-r from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
            {template.title}
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            {template.description}
          </p>
        </div>

        {/* Event Details */}
        {event.details_json && (
          <div className="mb-8 bg-[#2d2f35]/50 border-2 border-[#3a3d44] p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4 font-bold">Event Context</h3>
            <div className="grid grid-cols-2 gap-4">
              {event.details_json.battle_result && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Battle Result</p>
                  <p className="text-sm font-bold text-zinc-300">{event.details_json.battle_result}</p>
                </div>
              )}
              {event.details_json.outcome && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Outcome</p>
                  <p className={`text-sm font-bold ${
                    event.details_json.outcome === 'win' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {event.details_json.outcome.toUpperCase()}
                  </p>
                </div>
              )}
              {event.details_json.choked !== undefined && event.details_json.choked && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Performance Issue</p>
                  <p className="text-sm font-bold text-red-500">CHOKED</p>
                </div>
              )}
              {event.details_json.win_streak > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Win Streak</p>
                  <p className="text-sm font-bold text-green-500">{event.details_json.win_streak}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Choice Cards - Enhanced with slide-in animations */}
        <div className="mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider mb-6 text-[#ff8c42]">
            MAKE YOUR DECISION
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Choice A */}
            <div
              className={`border-2 p-6 cursor-pointer transition-all duration-300 animate-slide-in-left ${
                selectedChoice === 'a'
                  ? 'bg-[#ff8c42]/20 border-[#ff8c42] scale-105 shadow-lg shadow-orange-500/20'
                  : 'bg-[#2d2f35] border-[#3a3d44] hover:border-[#3a3d44] hover:scale-102'
              }`}
              onClick={() => setSelectedChoice('a')}
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-black uppercase tracking-wider">
                  Choice A
                </h3>
                {selectedChoice === 'a' && (
                  <span className="text-[#ff8c42] text-xl animate-bounce-in">✓</span>
                )}
              </div>

              <p className="text-sm text-zinc-300 mb-6">
                {template.choice_a_text}
              </p>

              <div className="pt-4 border-t-2 border-[#3a3d44]">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3 font-bold">Effects:</p>
                <div className="space-y-2">
                  {choiceAEffects.map((effect, index) => {
                    const isPositive = effect.startsWith('+');
                    const isNegative = effect.startsWith('-');
                    return (
                      <div key={index} className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: `${0.3 + index * 0.05}s` }}>
                        <span className={`text-xs ${
                          isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-zinc-400'
                        }`}>
                          {isPositive ? '▲' : isNegative ? '▼' : '•'}
                        </span>
                        <p className={`text-xs ${
                          isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-zinc-400'
                        }`}>
                          {effect}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Choice B */}
            {template.choice_b_text && (
              <div
                className={`border-2 p-6 cursor-pointer transition-all duration-300 animate-slide-in-right ${
                  selectedChoice === 'b'
                    ? 'bg-[#ff8c42]/20 border-[#ff8c42] scale-105 shadow-lg shadow-orange-500/20'
                    : 'bg-[#2d2f35] border-[#3a3d44] hover:border-[#3a3d44] hover:scale-102'
                }`}
                onClick={() => setSelectedChoice('b')}
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-black uppercase tracking-wider">
                    Choice B
                  </h3>
                  {selectedChoice === 'b' && (
                    <span className="text-[#ff8c42] text-xl animate-bounce-in">✓</span>
                  )}
                </div>

                <p className="text-sm text-zinc-300 mb-6">
                  {template.choice_b_text}
                </p>

                <div className="pt-4 border-t-2 border-[#3a3d44]">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3 font-bold">Effects:</p>
                  <div className="space-y-2">
                    {choiceBEffects.map((effect, index) => {
                      const isPositive = effect.startsWith('+');
                      const isNegative = effect.startsWith('-');
                      return (
                        <div key={index} className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: `${0.4 + index * 0.05}s` }}>
                          <span className={`text-xs ${
                            isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-zinc-400'
                          }`}>
                            {isPositive ? '▲' : isNegative ? '▼' : '•'}
                          </span>
                          <p className={`text-xs ${
                            isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-zinc-400'
                          }`}>
                            {effect}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Confirm Button - Enhanced with shake animation */}
        <div className="flex justify-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={handleResolve}
            disabled={resolving}
            className={`px-12 py-4 text-lg font-black uppercase tracking-wider transition-all duration-300 ${
              resolving
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : selectedChoice
                ? 'bg-[#ff8c42] hover:bg-[#ff9d5c] text-black hover:scale-105 shadow-lg'
                : 'bg-zinc-800 text-zinc-600 cursor-pointer'
            } ${shakeConfirm ? 'animate-shake' : ''}`}
          >
            {resolving ? 'RESOLVING...' : 'CONFIRM DECISION'}
          </button>
        </div>

        {/* Warning */}
        <div className={`mt-8 ${categoryConfig.bgClass} border-2 ${categoryConfig.borderClass} p-4 animate-fade-in`} style={{ animationDelay: '0.6s' }}>
          <p className={`text-xs ${categoryConfig.textClass} uppercase tracking-wide font-bold mb-2`}>
            Warning
          </p>
          <p className="text-sm text-zinc-400">
            This decision is permanent and will affect your battler's attributes and future performance.
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-bounce-in {
          animation: bounceIn 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
