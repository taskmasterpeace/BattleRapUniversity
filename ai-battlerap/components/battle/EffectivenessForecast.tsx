'use client';

import {
  ContentType,
  DeliveryType,
  PerformanceType,
  getContentType,
  getDeliveryType,
  getPerformanceType,
} from '@/lib/game/contentTypes';
import {
  calculateEffectivenessForecast,
  EffectivenessForecast as ForecastData,
} from '@/lib/game/roundContentSelection';
import { ScoringContext } from '@/lib/models';

export interface ContentSelection {
  contentTypes: ContentType[];
  deliveryTypes: DeliveryType[];
  performanceTypes: PerformanceType[];
}

interface EffectivenessForecastProps {
  yourSelection: ContentSelection;
  opponentSelection: ContentSelection;
  leagueName: string;
  context: ScoringContext;
}

// Proper venue labels. CSS `capitalize` mangles the "ppv" acronym into "Ppv",
// so map each context to its display form explicitly.
const CONTEXT_LABELS: Record<ScoringContext, string> = {
  in_building: 'In Building',
  ppv: 'PPV',
  on_cam: 'On Cam',
};

export function EffectivenessForecast({
  yourSelection,
  opponentSelection,
  leagueName,
  context,
}: EffectivenessForecastProps) {
  // Calculate forecast
  const forecast: ForecastData = calculateEffectivenessForecast(
    yourSelection,
    opponentSelection,
    leagueName,
    context
  );

  const getMultiplierColor = (value: number) => {
    if (value >= 1.5) return 'text-green-500';
    if (value >= 1.2) return 'text-green-400';
    if (value >= 0.9) return 'text-zinc-300';
    if (value >= 0.7) return 'text-orange-400';
    return 'text-red-500';
  };

  const getMultiplierBg = (value: number) => {
    if (value >= 1.5) return 'bg-green-900/30 border-green-600';
    if (value >= 1.2) return 'bg-green-900/20 border-green-700';
    if (value >= 0.9) return 'bg-zinc-800 border-[#3a3d44]';
    if (value >= 0.7) return 'bg-orange-900/20 border-orange-700';
    return 'bg-red-900/30 border-red-600';
  };

  const formatTypeName = (type: ContentType | DeliveryType | PerformanceType): string => {
    // Try each type getter
    const contentDef = getContentType(type as ContentType);
    if (contentDef) return contentDef.name;

    const deliveryDef = getDeliveryType(type as DeliveryType);
    if (deliveryDef) return deliveryDef.name;

    const performanceDef = getPerformanceType(type as PerformanceType);
    if (performanceDef) return performanceDef.name;

    return type;
  };

  const isSelectionValid =
    yourSelection.contentTypes.length >= 3 &&
    yourSelection.contentTypes.length <= 4 &&
    yourSelection.deliveryTypes.length >= 1 &&
    yourSelection.deliveryTypes.length <= 2 &&
    yourSelection.performanceTypes.length >= 1 &&
    yourSelection.performanceTypes.length <= 2;

  // Light glass treatment (owner call 2026-09-01: "we like the light glass
  // effect we saw in a tooltip — it was underutilized") — translucent panes
  // over the dark board, text bright enough to read from the couch.
  const glass = 'bg-white/[0.05] backdrop-blur-md border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]';

  if (!isSelectionValid) {
    return (
      <div className={`${glass} p-6`}>
        <h3 className="text-lg font-display font-black uppercase tracking-wider text-white mb-4">
          How tonight hits
        </h3>
        <div className="text-center text-zinc-300 py-8">
          <p className="font-display font-bold uppercase tracking-wide">Finish the round and the read appears</p>
          <p className="text-sm mt-2 text-zinc-400">3-4 content · 1-2 delivery · 1-2 performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${glass} p-6`}>
      <h3 className="text-lg font-display font-black uppercase tracking-wider text-white mb-1">
        How tonight hits
      </h3>
      <p className="text-[13px] text-zinc-400 mb-4">
        The read on this round — your picks, this crowd, this room.
      </p>

      {/* Multiplier Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Average Effectiveness */}
        <div className={`p-4 border-2 backdrop-blur-sm ${getMultiplierBg(forecast.averageEffectiveness)}`}>
          <div className="text-[12px] text-zinc-300 font-bold uppercase tracking-wider mb-1">Your picks vs theirs</div>
          <div className={`text-3xl font-black ${getMultiplierColor(forecast.averageEffectiveness)}`}>
            {forecast.averageEffectiveness.toFixed(2)}x
          </div>
          <div className="text-[12px] text-zinc-400 mt-1">above 1x = you countered their style</div>
        </div>

        {/* Crowd Preference */}
        <div className={`p-4 border-2 backdrop-blur-sm ${getMultiplierBg(forecast.crowdPreference)}`}>
          <div className="text-[12px] text-zinc-300 font-bold uppercase tracking-wider mb-1">This crowd</div>
          <div className={`text-3xl font-black ${getMultiplierColor(forecast.crowdPreference)}`}>
            {forecast.crowdPreference.toFixed(2)}x
          </div>
          <div className="text-[12px] text-zinc-400 mt-1">how hard the {leagueName} crowd rides for your style</div>
        </div>

        {/* Context Modifier */}
        <div className={`p-4 border-2 backdrop-blur-sm ${getMultiplierBg(forecast.contextModifier)}`}>
          <div className="text-[12px] text-zinc-300 font-bold uppercase tracking-wider mb-1">The room</div>
          <div className={`text-3xl font-black ${getMultiplierColor(forecast.contextModifier)}`}>
            {forecast.contextModifier.toFixed(2)}x
          </div>
          <div className="text-[12px] text-zinc-400 mt-1">
            {CONTEXT_LABELS[context] ?? context} — does your material travel here
          </div>
        </div>

        {/* Final Multiplier */}
        <div className={`p-4 border-2 backdrop-blur-sm ${getMultiplierBg(forecast.finalMultiplier)}`}>
          <div className="text-[12px] text-zinc-300 font-bold uppercase tracking-wider mb-1">Tonight you hit at</div>
          <div className={`text-4xl font-black ${getMultiplierColor(forecast.finalMultiplier)}`}>
            {forecast.finalMultiplier.toFixed(2)}x
          </div>
          <div className="text-[12px] text-zinc-400 mt-1">all three combined</div>
        </div>
      </div>

      {/* Matchup Analysis */}
      <div className="grid grid-cols-2 gap-4">
        {/* Strong Against */}
        {forecast.strongAgainst.length > 0 && (
          <div className="bg-green-950/20 border-2 border-green-800/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✓</span>
              <span className="text-sm font-bold uppercase tracking-wide text-green-400">You caught them slipping</span>
            </div>
            <div className="space-y-1">
              {forecast.strongAgainst.slice(0, 3).map((type, idx) => (
                <div key={idx} className="text-xs text-green-300">
                  • {formatTypeName(type)}
                </div>
              ))}
              {forecast.strongAgainst.length > 3 && (
                <div className="text-xs text-green-400/70">
                  +{forecast.strongAgainst.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weak Against */}
        {forecast.weakAgainst.length > 0 && (
          <div className="bg-red-950/20 border-2 border-red-800/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✗</span>
              <span className="text-sm font-bold uppercase tracking-wide text-red-400">You&apos;re walking into theirs</span>
            </div>
            <div className="space-y-1">
              {forecast.weakAgainst.slice(0, 3).map((type, idx) => (
                <div key={idx} className="text-xs text-red-300">
                  • {formatTypeName(type)}
                </div>
              ))}
              {forecast.weakAgainst.length > 3 && (
                <div className="text-xs text-red-400/70">
                  +{forecast.weakAgainst.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Neutral Message */}
        {forecast.strongAgainst.length === 0 && forecast.weakAgainst.length === 0 && (
          <div className="col-span-2 bg-white/[0.04] backdrop-blur-sm border border-white/10 p-4 text-center">
            <span className="text-sm text-zinc-300 font-display font-bold uppercase tracking-wide">
              Even matchup — nobody caught nobody slipping
            </span>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="mt-4 p-3 bg-white/[0.04] backdrop-blur-sm border border-white/10">
        <p className="text-[13px] text-zinc-300">
          <strong className="text-orange-400">Read it like this:</strong> green means you counter
          what they brought (2x = you caught them slipping), gray is an even trade, red means you
          walked into their lane. The big number is how hard your whole round hits tonight.
        </p>
      </div>
    </div>
  );
}
