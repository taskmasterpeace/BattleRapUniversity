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

// Flyer palette (no purple — banned hues 270-320 never appear here).
const PALETTE = {
  charcoal: '#0F0F12',
  charcoal2: '#17181C',
  orange: '#F5731A',
  green: '#35C46B',
  red: '#E23A2E',
};

// Tone a multiplier by how far it sits from neutral (1.0). Green = it helps,
// red = it hurts, and a calm charcoal-grey for an even trade.
function toneFor(value: number): { text: string; bg: string; border: string } {
  if (value >= 1.25) return { text: PALETTE.green, bg: 'rgba(53,196,107,0.15)', border: 'rgba(53,196,107,0.50)' };
  if (value >= 1.08) return { text: PALETTE.green, bg: 'rgba(53,196,107,0.09)', border: 'rgba(53,196,107,0.30)' };
  if (value > 0.92) return { text: '#D8DAE0', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.16)' };
  if (value > 0.75) return { text: PALETTE.orange, bg: 'rgba(245,115,26,0.13)', border: 'rgba(245,115,26,0.45)' };
  return { text: PALETTE.red, bg: 'rgba(226,58,46,0.15)', border: 'rgba(226,58,46,0.50)' };
}

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

  // The three DISTINCT levers, in the order they multiply together.
  const levers = [
    {
      key: 'picks',
      label: 'Your picks vs theirs',
      value: forecast.averageEffectiveness,
      blurb: 'above 1x = you countered their style',
    },
    {
      key: 'crowd',
      label: 'This crowd',
      value: forecast.crowdPreference,
      blurb: `how hard the ${leagueName} crowd rides for your style`,
    },
    {
      key: 'room',
      label: 'The room',
      value: forecast.contextModifier,
      blurb: `${CONTEXT_LABELS[context] ?? context} — does your material travel here`,
    },
  ];

  const finalTone = toneFor(forecast.finalMultiplier);

  return (
    <div className={`${glass} p-6`}>
      <h3 className="text-lg font-display font-black uppercase tracking-wider text-white mb-1">
        How tonight hits
      </h3>
      <p className="text-[13px] text-zinc-400 mb-4">
        Three separate reads on this round — they multiply into one number.
      </p>

      {/* THREE DISTINCT LEVERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {levers.map((lever) => {
          const tone = toneFor(lever.value);
          return (
            <div
              key={lever.key}
              className="p-4 backdrop-blur-sm rounded-[10px]"
              style={{ backgroundColor: tone.bg, border: `1px solid ${tone.border}` }}
            >
              <div className="text-[11px] text-zinc-300 font-bold uppercase tracking-wider mb-1">
                {lever.label}
              </div>
              <div className="text-3xl font-black" style={{ color: tone.text }}>
                {lever.value.toFixed(2)}x
              </div>
              <div className="text-[12px] text-zinc-400 mt-1 leading-snug">{lever.blurb}</div>
            </div>
          );
        })}
      </div>

      {/* THE COMBINED FINAL — shown as the actual multiplication so it's never a
          mystery where the number came from. */}
      <div
        className="p-4 rounded-[10px] backdrop-blur-sm"
        style={{ backgroundColor: finalTone.bg, border: `1px solid ${finalTone.border}` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-sm text-zinc-300">
            {levers.map((lever, i) => (
              <span key={lever.key} className="flex items-baseline gap-2">
                {i > 0 && <span className="text-zinc-500">×</span>}
                <span style={{ color: toneFor(lever.value).text }} className="font-bold">
                  {lever.value.toFixed(2)}
                </span>
              </span>
            ))}
            <span className="text-zinc-500">=</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-[11px] text-zinc-300 font-bold uppercase tracking-wider">
              Tonight you hit at
            </span>
            <span className="text-4xl font-black leading-none" style={{ color: finalTone.text }}>
              {forecast.finalMultiplier.toFixed(2)}x
            </span>
          </div>
        </div>
        <div className="text-[12px] text-zinc-400 mt-2">
          your picks × this crowd × the room = how hard your whole round lands
        </div>
      </div>

      {/* Matchup Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {/* Strong Against */}
        {forecast.strongAgainst.length > 0 && (
          <div
            className="p-4 rounded-[10px]"
            style={{ backgroundColor: 'rgba(53,196,107,0.10)', border: '1px solid rgba(53,196,107,0.30)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg" style={{ color: PALETTE.green }}>✓</span>
              <span className="text-sm font-bold uppercase tracking-wide" style={{ color: PALETTE.green }}>
                You caught them slipping
              </span>
            </div>
            <div className="space-y-1">
              {forecast.strongAgainst.slice(0, 3).map((type, idx) => (
                <div key={idx} className="text-xs text-zinc-200">
                  • {formatTypeName(type)}
                </div>
              ))}
              {forecast.strongAgainst.length > 3 && (
                <div className="text-xs text-zinc-400">
                  +{forecast.strongAgainst.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weak Against */}
        {forecast.weakAgainst.length > 0 && (
          <div
            className="p-4 rounded-[10px]"
            style={{ backgroundColor: 'rgba(226,58,46,0.10)', border: '1px solid rgba(226,58,46,0.32)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg" style={{ color: PALETTE.red }}>✗</span>
              <span className="text-sm font-bold uppercase tracking-wide" style={{ color: PALETTE.red }}>
                You&apos;re walking into theirs
              </span>
            </div>
            <div className="space-y-1">
              {forecast.weakAgainst.slice(0, 3).map((type, idx) => (
                <div key={idx} className="text-xs text-zinc-200">
                  • {formatTypeName(type)}
                </div>
              ))}
              {forecast.weakAgainst.length > 3 && (
                <div className="text-xs text-zinc-400">
                  +{forecast.weakAgainst.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Neutral Message */}
        {forecast.strongAgainst.length === 0 && forecast.weakAgainst.length === 0 && (
          <div className="sm:col-span-2 bg-white/[0.04] backdrop-blur-sm border border-white/10 p-4 text-center rounded-[10px]">
            <span className="text-sm text-zinc-300 font-display font-bold uppercase tracking-wide">
              Even matchup — nobody caught nobody slipping
            </span>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="mt-4 p-3 bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-[10px]">
        <p className="text-[13px] text-zinc-300">
          <strong style={{ color: PALETTE.orange }}>Read it like this:</strong> the three
          reads are separate — <em className="not-italic text-zinc-100">your picks vs theirs</em>,{' '}
          <em className="not-italic text-zinc-100">this crowd&apos;s taste</em>, and{' '}
          <em className="not-italic text-zinc-100">whether it travels in this room</em>. Green helps
          you, red hurts you, grey is an even trade. Multiply the three and you get how hard your
          whole round lands tonight.
        </p>
      </div>
    </div>
  );
}
