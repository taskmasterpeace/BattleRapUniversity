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

  if (!isSelectionValid) {
    return (
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Effectiveness Forecast</h3>
        <div className="text-center text-zinc-400 py-8">
          
          <p>Complete your selection to see effectiveness forecast</p>
          <p className="text-sm mt-2">
            Select 3-4 content, 1-2 delivery, and 1-2 performance types
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
      <h3 className="text-lg font-bold text-white mb-4">Effectiveness Forecast</h3>

      {/* Multiplier Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Average Effectiveness */}
        <div
          className={`p-4 border-2 ${getMultiplierBg(
            forecast.averageEffectiveness
          )}`}
        >
          <div className="text-xs text-zinc-400 uppercase mb-1">Content Effectiveness</div>
          <div className={`text-2xl font-bold ${getMultiplierColor(forecast.averageEffectiveness)}`}>
            {forecast.averageEffectiveness.toFixed(2)}x
          </div>
          <div className="text-xs text-zinc-400 mt-1">vs opponent's content</div>
        </div>

        {/* Crowd Preference */}
        <div
          className={`p-4 border-2 ${getMultiplierBg(forecast.crowdPreference)}`}
        >
          <div className="text-xs text-zinc-400 uppercase mb-1">Crowd Preference</div>
          <div className={`text-2xl font-bold ${getMultiplierColor(forecast.crowdPreference)}`}>
            {forecast.crowdPreference.toFixed(2)}x
          </div>
          <div className="text-xs text-zinc-400 mt-1">{leagueName} audience</div>
        </div>

        {/* Context Modifier */}
        <div
          className={`p-4 border-2 ${getMultiplierBg(forecast.contextModifier)}`}
        >
          <div className="text-xs text-zinc-400 uppercase mb-1">Context Modifier</div>
          <div className={`text-2xl font-bold ${getMultiplierColor(forecast.contextModifier)}`}>
            {forecast.contextModifier.toFixed(2)}x
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {CONTEXT_LABELS[context] ?? context}
          </div>
        </div>

        {/* Final Multiplier */}
        <div
          className={`p-4 border-2 ${getMultiplierBg(
            forecast.finalMultiplier
          )} col-span-1`}
        >
          <div className="text-xs text-zinc-400 uppercase mb-1">Final Multiplier</div>
          <div className={`text-3xl font-bold ${getMultiplierColor(forecast.finalMultiplier)}`}>
            {forecast.finalMultiplier.toFixed(2)}x
          </div>
          <div className="text-xs text-zinc-400 mt-1">Combined effect</div>
        </div>
      </div>

      {/* Matchup Analysis */}
      <div className="grid grid-cols-2 gap-4">
        {/* Strong Against */}
        {forecast.strongAgainst.length > 0 && (
          <div className="bg-green-950/20 border-2 border-green-800/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✓</span>
              <span className="text-sm font-semibold text-green-400">Strong Against</span>
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
              <span className="text-sm font-semibold text-red-400">Weak Against</span>
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
          <div className="col-span-2 bg-zinc-800 border-2 border-[#3a3d44] p-4 text-center">
            <span className="text-sm text-zinc-400">
              No strong advantages or disadvantages vs opponent's selection
            </span>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="mt-4 p-3 bg-[#18191c]/50 rounded border-2 border-[#3a3d44]">
        <p className="text-xs text-zinc-400">
          <strong className="text-orange-400">Tip:</strong> Higher multipliers mean better
          performance. Super effective (2.0x) = green, neutral (1.0x) = gray, weak (0.5x) = red.
          Final multiplier combines all three factors.
        </p>
      </div>
    </div>
  );
}
