'use client';

import { useState, useEffect } from 'react';
import {
  ContentType,
  DeliveryType,
  PerformanceType,
  getAllContentTypes,
  getAllDeliveryTypes,
  getAllPerformanceTypes,
} from '@/lib/game/contentTypes';
import { getEffectiveness } from '@/lib/game/contentEffectiveness';

export interface ContentSelection {
  contentTypes: ContentType[];
  deliveryTypes: DeliveryType[];
  performanceTypes: PerformanceType[];
}

interface RoundContentSelectorProps {
  onSelectionChange: (selection: ContentSelection) => void;
  initialSelection?: ContentSelection;
  /** Opponent's predicted content — surfaces per-option effectiveness so the
   *  matchup system is legible instead of a chart the player has to memorize. */
  opponentContent?: ContentSelection | null;
}

/** Best matchup of one of my options vs everything the opponent is bringing. */
function matchupVs(
  myType: ContentType | DeliveryType | PerformanceType,
  oppTypes: (ContentType | DeliveryType | PerformanceType)[]
): { kind: 'super' | 'weak'; vs: string } | null {
  let superVs: string | null = null;
  let weakVs: string | null = null;
  for (const opp of oppTypes ?? []) {
    const m = getEffectiveness(myType, opp);
    if (m === 2.0 && !superVs) superVs = opp;
    if (m === 0.5 && !weakVs) weakVs = opp;
  }
  if (superVs) return { kind: 'super', vs: superVs };
  if (weakVs) return { kind: 'weak', vs: weakVs };
  return null;
}

function MatchupBadge({ m }: { m: ReturnType<typeof matchupVs> }) {
  if (!m) return null;
  const label = m.vs.replace(/_/g, ' ');
  return m.kind === 'super' ? (
    <span
      title={`Super effective vs their ${label} (2×)`}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/15 text-green-400 border border-green-500/40 text-[11px] font-mono font-bold uppercase tracking-wider"
    >
      ★ 2× VS {label}
    </span>
  ) : (
    <span
      title={`Not very effective vs their ${label} (0.5×)`}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-500/15 text-red-400 border border-red-500/40 text-[11px] font-mono font-bold uppercase tracking-wider"
    >
      ▼ 0.5× VS {label}
    </span>
  );
}

export function RoundContentSelector({
  onSelectionChange,
  initialSelection,
  opponentContent,
}: RoundContentSelectorProps) {
  const [selectedContent, setSelectedContent] = useState<ContentType[]>(
    initialSelection?.contentTypes || []
  );
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryType[]>(
    initialSelection?.deliveryTypes || []
  );
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceType[]>(
    initialSelection?.performanceTypes || []
  );

  const allContentTypes = getAllContentTypes();
  const allDeliveryTypes = getAllDeliveryTypes();
  const allPerformanceTypes = getAllPerformanceTypes();

  // Notify parent when selection changes
  useEffect(() => {
    onSelectionChange({
      contentTypes: selectedContent,
      deliveryTypes: selectedDelivery,
      performanceTypes: selectedPerformance,
    });
  }, [selectedContent, selectedDelivery, selectedPerformance]);

  const toggleContent = (type: ContentType) => {
    if (selectedContent.includes(type)) {
      setSelectedContent(selectedContent.filter((t) => t !== type));
    } else {
      if (selectedContent.length < 4) {
        setSelectedContent([...selectedContent, type]);
      }
    }
  };

  const toggleDelivery = (type: DeliveryType) => {
    if (selectedDelivery.includes(type)) {
      setSelectedDelivery(selectedDelivery.filter((t) => t !== type));
    } else {
      if (selectedDelivery.length < 2) {
        setSelectedDelivery([...selectedDelivery, type]);
      }
    }
  };

  const togglePerformance = (type: PerformanceType) => {
    if (selectedPerformance.includes(type)) {
      setSelectedPerformance(selectedPerformance.filter((t) => t !== type));
    } else {
      if (selectedPerformance.length < 2) {
        setSelectedPerformance([...selectedPerformance, type]);
      }
    }
  };

  const isContentValid = selectedContent.length >= 3 && selectedContent.length <= 4;
  const isDeliveryValid = selectedDelivery.length >= 1 && selectedDelivery.length <= 2;
  const isPerformanceValid = selectedPerformance.length >= 1 && selectedPerformance.length <= 2;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Content Types Column */}
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-1">Content Types</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Select 3-4 types</p>
            <div
              className={`text-sm font-semibold ${
                isContentValid ? 'text-green-500' : 'text-[#ff8c42]'
              }`}
            >
              {selectedContent.length}/4
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {allContentTypes.map((type) => {
            const isSelected = selectedContent.includes(type.id);
            const isDisabled = !isSelected && selectedContent.length >= 4;

            return (
              <button
                key={type.id}
                onClick={() => toggleContent(type.id)}
                disabled={isDisabled}
                className={`w-full p-3 border-2 transition-all text-left ${
                  isSelected
                    ? 'border-[#ff8c42] bg-orange-950/30'
                    : isDisabled
                    ? 'border-[#3a3d44] bg-[#18191c] opacity-50 cursor-not-allowed'
                    : 'border-[#3a3d44] bg-zinc-800 hover:border-zinc-600'
                }`}
                title={type.description}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white text-sm">{type.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      type.category === 'attack'
                        ? 'bg-red-900/30 text-red-400'
                        : type.category === 'technical'
                        ? 'bg-amber-900/30 text-amber-400'
                        : type.category === 'entertainment'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-green-900/30 text-green-400'
                    }`}
                  >
                    {type.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2">{type.description}</p>
                {opponentContent && (() => {
                  const m = matchupVs(type.id, opponentContent.contentTypes);
                  return m ? <div className="mt-1.5"><MatchupBadge m={m} /></div> : null;
                })()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery Types Column */}
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-1">Delivery Types</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Select 1-2 types</p>
            <div
              className={`text-sm font-semibold ${
                isDeliveryValid ? 'text-green-500' : 'text-[#ff8c42]'
              }`}
            >
              {selectedDelivery.length}/2
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {allDeliveryTypes.map((type) => {
            const isSelected = selectedDelivery.includes(type.id);
            const isDisabled = !isSelected && selectedDelivery.length >= 2;

            return (
              <button
                key={type.id}
                onClick={() => toggleDelivery(type.id)}
                disabled={isDisabled}
                className={`w-full p-3 border-2 transition-all text-left ${
                  isSelected
                    ? 'border-[#ff8c42] bg-orange-950/30'
                    : isDisabled
                    ? 'border-[#3a3d44] bg-[#18191c] opacity-50 cursor-not-allowed'
                    : 'border-[#3a3d44] bg-zinc-800 hover:border-zinc-600'
                }`}
                title={type.description}
              >
                <div className="font-semibold text-white text-sm mb-1">{type.name}</div>
                <p className="text-xs text-zinc-400 line-clamp-2">{type.description}</p>
                {opponentContent && (() => {
                  const m = matchupVs(type.id, opponentContent.deliveryTypes);
                  return m ? <div className="mt-1.5"><MatchupBadge m={m} /></div> : null;
                })()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Performance Types Column */}
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-1">Performance Types</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Select 1-2 types</p>
            <div
              className={`text-sm font-semibold ${
                isPerformanceValid ? 'text-green-500' : 'text-[#ff8c42]'
              }`}
            >
              {selectedPerformance.length}/2
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {allPerformanceTypes.map((type) => {
            const isSelected = selectedPerformance.includes(type.id);
            const isDisabled = !isSelected && selectedPerformance.length >= 2;

            return (
              <button
                key={type.id}
                onClick={() => togglePerformance(type.id)}
                disabled={isDisabled}
                className={`w-full p-3 border-2 transition-all text-left ${
                  isSelected
                    ? 'border-[#ff8c42] bg-orange-950/30'
                    : isDisabled
                    ? 'border-[#3a3d44] bg-[#18191c] opacity-50 cursor-not-allowed'
                    : 'border-[#3a3d44] bg-zinc-800 hover:border-zinc-600'
                }`}
                title={type.description}
              >
                <div className="font-semibold text-white text-sm mb-1">{type.name}</div>
                <p className="text-xs text-zinc-400 line-clamp-2">{type.description}</p>
                {opponentContent && (() => {
                  const m = matchupVs(type.id, opponentContent.performanceTypes);
                  return m ? <div className="mt-1.5"><MatchupBadge m={m} /></div> : null;
                })()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
