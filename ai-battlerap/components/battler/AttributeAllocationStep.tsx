'use client';

import { useState, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import Tooltip from '@/components/onboarding/Tooltip';

export type AllocatedAttributes = {
  writing: {
    lyricism: number;
    wordplay: number;
    creativity: number;
    flow: number;
  };
  performance: {
    stage_presence: number;
    crowd_control: number;
    delivery: number;
  };
  personal: {
    financial_stability: number;
    reputation: number;
    family_bond: number;
  };
  resilience: number;
};

type Props = {
  onNext: (attributes: AllocatedAttributes) => void;
  onBack: () => void;
  initialAttributes?: AllocatedAttributes;
  suggestedLeague?: string;
};

const TOTAL_POINTS = 25;
const MIN_PER_ATTRIBUTE = 1;
const MAX_PER_ATTRIBUTE = 8;

export default function AttributeAllocationStep({
  onNext,
  onBack,
  initialAttributes,
  suggestedLeague
}: Props) {
  // Balanced starting build that sums to exactly TOTAL_POINTS (25) — the player
  // begins valid and tunes from there, never staring at a negative counter.
  const [attributes, setAttributes] = useState<AllocatedAttributes>(
    initialAttributes || {
      writing: { lyricism: 3, wordplay: 3, creativity: 3, flow: 2 },
      performance: { stage_presence: 3, crowd_control: 3, delivery: 2 },
      personal: { financial_stability: 1, reputation: 2, family_bond: 1 },
      resilience: 2,
    }
  );

  const pointsUsed = useMemo(() => {
    return (
      attributes.writing.lyricism +
      attributes.writing.wordplay +
      attributes.writing.creativity +
      attributes.writing.flow +
      attributes.performance.stage_presence +
      attributes.performance.crowd_control +
      attributes.performance.delivery +
      attributes.personal.financial_stability +
      attributes.personal.reputation +
      attributes.personal.family_bond +
      attributes.resilience
    );
  }, [attributes]);

  const pointsRemaining = TOTAL_POINTS - pointsUsed;

  const updateAttribute = (
    category: keyof AllocatedAttributes,
    attribute: string,
    delta: number
  ) => {
    setAttributes((prev) => {
      const currentValue =
        category === 'resilience'
          ? prev[category]
          : (prev[category] as any)[attribute];
      const newValue = Math.max(
        MIN_PER_ATTRIBUTE,
        Math.min(MAX_PER_ATTRIBUTE, currentValue + delta)
      );

      if (delta > 0 && pointsRemaining <= 0) return prev;
      if (newValue === currentValue) return prev;

      if (category === 'resilience') {
        return { ...prev, resilience: newValue };
      }

      return {
        ...prev,
        [category]: {
          ...(prev[category] as any),
          [attribute]: newValue,
        },
      };
    });
  };

  // Attribute bar component matching mockup
  const AttributeBar = ({
    icon,
    label,
    value,
    category,
    attribute,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    category: keyof AllocatedAttributes;
    attribute: string;
    color: string;
  }) => (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="flex items-center justify-center text-[#ff8c42] flex-shrink-0">{icon}</span>
        <span className="text-[11px] text-zinc-300 uppercase tracking-wider font-bold leading-tight flex-1 min-w-0">
          {label}
        </span>
        <span className="text-lg font-display font-black text-[#ff8c42] tabular-nums w-5 text-right">
          {value}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateAttribute(category, attribute, -1)}
          disabled={value <= MIN_PER_ATTRIBUTE}
          className="w-7 h-7 bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42] text-zinc-300 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition flex-shrink-0"
        >
          −
        </button>
        {/* Fill bar between the steppers */}
        <div className="flex-1 h-3 bg-[#18191c] border-2 border-[#3a3d44] relative overflow-hidden">
          <div
            className={`h-full ${color} transition-all`}
            style={{ width: `${((value - MIN_PER_ATTRIBUTE) / (MAX_PER_ATTRIBUTE - MIN_PER_ATTRIBUTE)) * 100}%` }}
          />
        </div>
        <button
          onClick={() => updateAttribute(category, attribute, 1)}
          disabled={value >= MAX_PER_ATTRIBUTE || pointsRemaining <= 0}
          className="w-7 h-7 bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42] text-zinc-300 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition flex-shrink-0"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">ALLOCATE ATTRIBUTES</h2>
          <p className="text-sm text-zinc-500 uppercase tracking-wide mt-1">
            DISTRIBUTE {TOTAL_POINTS} POINTS • RANGE: {MIN_PER_ATTRIBUTE}-{MAX_PER_ATTRIBUTE}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">POINTS REMAINING</p>
          <p className={`text-4xl font-display font-black ${
            pointsRemaining === 0 ? 'text-green-500' : pointsRemaining < 0 ? 'text-red-500' : 'text-[#ff8c42]'
          }`}>
            {pointsRemaining}
          </p>
        </div>
      </div>

      {/* Three-column grid matching mockup */}
      <div className="grid grid-cols-3 gap-4">
        {/* WRITING CARD */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-[#ff8c42] mb-4">
            WRITING
          </h3>
          <AttributeBar
            icon={<Icon name="pen" size={18} />}
            label="LYRICISM"
            value={attributes.writing.lyricism}
            category="writing"
            attribute="lyricism"
            color="bg-orange-500"
          />
          <AttributeBar
            icon={<Icon name="swords" size={18} />}
            label="WORDPLAY"
            value={attributes.writing.wordplay}
            category="writing"
            attribute="wordplay"
            color="bg-orange-500"
          />
          <AttributeBar
            icon={<Icon name="bolt" size={18} />}
            label="CREATIVITY"
            value={attributes.writing.creativity}
            category="writing"
            attribute="creativity"
            color="bg-orange-500"
          />
          <AttributeBar
            icon={<Icon name="chart" size={18} />}
            label="FLOW"
            value={attributes.writing.flow}
            category="writing"
            attribute="flow"
            color="bg-orange-500"
          />
        </div>

        {/* PERFORMANCE CARD */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-[#ff8c42] mb-4">
            PERFORMANCE
          </h3>
          <AttributeBar
            icon={<Icon name="stage" size={18} />}
            label="STAGE PRESENCE"
            value={attributes.performance.stage_presence}
            category="performance"
            attribute="stage_presence"
            color="bg-[#ff8c42]"
          />
          <AttributeBar
            icon={<Icon name="users" size={18} />}
            label="CROWD CONTROL"
            value={attributes.performance.crowd_control}
            category="performance"
            attribute="crowd_control"
            color="bg-[#ff8c42]"
          />
          <AttributeBar
            icon={<Icon name="mic" size={18} />}
            label="DELIVERY"
            value={attributes.performance.delivery}
            category="performance"
            attribute="delivery"
            color="bg-[#ff8c42]"
          />
        </div>

        {/* PERSONAL CARD */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-[#ff8c42] mb-4">
            PERSONAL
          </h3>
          <AttributeBar
            icon={<Icon name="cash" size={18} />}
            label="FINANCIAL"
            value={attributes.personal.financial_stability}
            category="personal"
            attribute="financial_stability"
            color="bg-[#ff8c42]"
          />
          <AttributeBar
            icon={<Icon name="crown" size={18} />}
            label="REPUTATION"
            value={attributes.personal.reputation}
            category="personal"
            attribute="reputation"
            color="bg-[#ff8c42]"
          />
          <AttributeBar
            icon={<Icon name="heart" size={18} />}
            label="FAMILY"
            value={attributes.personal.family_bond}
            category="personal"
            attribute="family_bond"
            color="bg-[#ff8c42]"
          />
          <AttributeBar
            icon={<Icon name="brain" size={18} />}
            label="RESILIENCE"
            value={attributes.resilience}
            category="resilience"
            attribute="resilience"
            color="bg-[#ff8c42]"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 border-2 border-[#3a3d44] text-zinc-400 font-black uppercase tracking-wider hover:bg-zinc-800 transition"
        >
          ← BACK
        </button>
        <button
          onClick={() => onNext(attributes)}
          disabled={pointsRemaining !== 0}
          className="flex-1 py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,140,66,0.4)]"
        >
          {pointsRemaining === 0
            ? 'NEXT →'
            : pointsRemaining > 0
            ? `SPEND ${pointsRemaining} MORE POINT${pointsRemaining === 1 ? '' : 'S'}`
            : `REMOVE ${Math.abs(pointsRemaining)} POINT${Math.abs(pointsRemaining) === 1 ? '' : 'S'}`}
        </button>
      </div>
    </div>
  );
}
