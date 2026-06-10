'use client';

import { useEffect, useState } from 'react';

type Props = {
  stageName: string;
  league: string;
  avatarUrl?: string | null;
  cityName?: string | null;
  onContinue: () => void;
  attributes: {
    writing: { lyricism: number; wordplay: number; creativity: number; flow: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { financial_stability: number; reputation: number; family_bond: number };
    resilience: number;
  };
  styles: string[];
};

export default function OnboardingSuccess({
  stageName,
  league,
  avatarUrl,
  cityName,
  onContinue,
  attributes,
  styles,
}: Props) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate average attribute scores
  const writingAvg =
    (attributes.writing.lyricism +
      attributes.writing.wordplay +
      attributes.writing.creativity +
      attributes.writing.flow) /
    4;
  const performanceAvg =
    (attributes.performance.stage_presence +
      attributes.performance.crowd_control +
      attributes.performance.delivery) /
    3;

  const strengthArea = writingAvg > performanceAvg ? 'WRITING' : 'PERFORMANCE';

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2"
                style={{
                  backgroundColor: ['#f97316', '#fb923c', '#fdba74', '#fed7aa'][
                    Math.floor(Math.random() * 4)
                  ],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-3xl w-full bg-[#2d2f35] border-2 border-[#ff8c42] p-8 md:p-12 animate-in zoom-in duration-500">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🎤</div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 text-[#ff8c42]">
            WELCOME TO THE CIRCUIT
          </h1>
          <p className="text-xl text-zinc-400 uppercase tracking-wide">
            YOUR BATTLER HAS BEEN CREATED
          </p>
        </div>

        {/* The Face Claim Moment */}
        {avatarUrl && (
          <div className="text-center mb-8">
            <div className="inline-block bg-[#0a0a0a] border-[3px] border-[#ff8c42] shadow-[0_0_40px_rgba(255,140,66,0.5)] p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={`${stageName}'s face`}
                className="w-40 h-40 object-contain [image-rendering:pixelated]"
              />
            </div>
            <p className="mt-4 font-mono text-sm uppercase tracking-widest text-[#ff8c42] font-bold">
              THIS FACE IS YOURS. FOREVER.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 mt-1">
              NO OTHER BATTLER CAN EVER CLAIM IT
            </p>
          </div>
        )}

        {/* Battler Summary Card */}
        <div className="bg-[#18191c] border-2 border-[#3a3d44] p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">{stageName}</h2>
            <p className="text-sm text-zinc-500 uppercase tracking-wider">
              {cityName ? `${cityName} — ` : ''}{league}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Writing */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-zinc-500 mb-3">WRITING</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Lyricism</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#ff8c42]"
                        style={{ width: `${(attributes.writing.lyricism / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#ff8c42] w-6">
                      {attributes.writing.lyricism}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Wordplay</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#ff8c42]"
                        style={{ width: `${(attributes.writing.wordplay / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#ff8c42] w-6">
                      {attributes.writing.wordplay}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Creativity</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#ff8c42]"
                        style={{ width: `${(attributes.writing.creativity / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#ff8c42] w-6">
                      {attributes.writing.creativity}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Flow</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#ff8c42]"
                        style={{ width: `${(attributes.writing.flow / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#ff8c42] w-6">
                      {attributes.writing.flow}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-zinc-500 mb-3">PERFORMANCE</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Stage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#ff8c42]"
                        style={{ width: `${(attributes.performance.stage_presence / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#ff8c42] w-6">
                      {attributes.performance.stage_presence}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Crowd</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#ff8c42]"
                        style={{ width: `${(attributes.performance.crowd_control / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#ff8c42] w-6">
                      {attributes.performance.crowd_control}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Delivery</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#ff8c42]"
                        style={{ width: `${(attributes.performance.delivery / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#ff8c42] w-6">
                      {attributes.performance.delivery}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mental & Personal */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-zinc-500 mb-3">MENTAL & PERSONAL</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Resilience</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#ff8c42]"
                        style={{ width: `${(attributes.resilience / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#ff8c42] w-6">
                      {attributes.resilience}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Finances</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#ff8c42]"
                        style={{ width: `${(attributes.personal.financial_stability / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#ff8c42] w-6">
                      {attributes.personal.financial_stability}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Reputation</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#ff8c42]"
                        style={{ width: `${(attributes.personal.reputation / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#ff8c42] w-6">
                      {attributes.personal.reputation}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Family</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#ff8c42]"
                        style={{ width: `${(attributes.personal.family_bond / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#ff8c42] w-6">
                      {attributes.personal.family_bond}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Style Tags */}
          <div className="border-t-2 border-[#3a3d44] pt-4">
            <h3 className="text-xs font-black uppercase text-zinc-500 mb-2">BATTLE STYLES</h3>
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <span
                  key={style}
                  className="px-3 py-1 bg-[#ff8c42]/20 border-2 border-[#ff8c42]/30 text-orange-400 text-xs font-display font-black uppercase tracking-wider"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>

          {/* Strength Indicator */}
          <div className="border-t-2 border-[#3a3d44] pt-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-zinc-500">PRIMARY STRENGTH</span>
              <span className="text-sm font-black uppercase text-[#ff8c42]">{strengthArea}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-[#18191c] border-2 border-[#3a3d44] p-6 mb-8">
          <h3 className="text-sm font-black uppercase text-zinc-400 mb-4">WHAT'S NEXT?</h3>
          <div className="space-y-3 text-xs text-zinc-500">
            <p className="flex items-start gap-2">
              <span className="text-[#ff8c42] font-bold text-base">1.</span>
              <span>
                <strong className="text-zinc-300">Check Battle Offers:</strong> View AI opponents
                looking to battle you
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#ff8c42] font-bold text-base">2.</span>
              <span>
                <strong className="text-zinc-300">Prepare:</strong> Choose daily focus (writing,
                performance, rest) in the prep calendar
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#ff8c42] font-bold text-base">3.</span>
              <span>
                <strong className="text-zinc-300">Battle:</strong> Simulation runs on scheduled date,
                view results and earn progression
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#ff8c42] font-bold text-base">4.</span>
              <span>
                <strong className="text-zinc-300">Grow:</strong> Improve attributes through
                performance, earn badges, build your legacy
              </span>
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onContinue}
          className="w-full py-5 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black text-xl font-black uppercase tracking-wider transition-all duration-300 hover:scale-105"
        >
          ENTER THE CIRCUIT
        </button>

        <p className="text-center text-xs text-zinc-600 uppercase tracking-wider mt-4">
          GOOD LUCK, {stageName}
        </p>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
