'use client';

import { useState, useMemo } from 'react';
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
  const [attributes, setAttributes] = useState<AllocatedAttributes>(
    initialAttributes || {
      writing: { lyricism: 3, wordplay: 3, creativity: 3, flow: 3 },
      performance: { stage_presence: 3, crowd_control: 3, delivery: 3 },
      personal: { financial_stability: 1, reputation: 2, family_bond: 2 },
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
    icon: string;
    label: string;
    value: number;
    category: keyof AllocatedAttributes;
    attribute: string;
    color: string;
  }) => (
    <div className="flex items-center gap-3 mb-3">
      {/* Icon */}
      <span className="text-xl w-6">{icon}</span>

      {/* Label */}
      <div className="w-32">
        <span className="text-xs text-zinc-300 uppercase tracking-wider font-bold">
          {label}
        </span>
      </div>

      {/* Bar container */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-[10px] text-orange-500 font-bold uppercase">LOW</span>
        <div className="flex-1 h-5 bg-[#1e293b] border-2 border-[#374151] relative">
          {/* Filled portion */}
          <div
            className={`h-full ${color} transition-all`}
            style={{ width: `${(value / MAX_PER_ATTRIBUTE) * 100}%` }}
          />
          {/* MID marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-zinc-600" />
        </div>
        <span className="text-[10px] text-orange-500 font-bold uppercase">MID</span>
      </div>

      {/* Controls */}
      <button
        onClick={() => updateAttribute(category, attribute, -1)}
        disabled={value <= MIN_PER_ATTRIBUTE}
        className="w-8 h-8 bg-[#1e293b] border-2 border-[#374151] hover:border-orange-500 text-zinc-300 font-bold disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        −
      </button>
      <button
        onClick={() => updateAttribute(category, attribute, 1)}
        disabled={value >= MAX_PER_ATTRIBUTE || pointsRemaining <= 0}
        className="w-8 h-8 bg-[#1e293b] border-2 border-[#374151] hover:border-orange-500 text-zinc-300 font-bold disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        +
      </button>
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
          <p className={`text-4xl font-black ${pointsRemaining === 0 ? 'text-green-500' : 'text-orange-500'}`}>
            {pointsRemaining}
          </p>
        </div>
      </div>

      {/* Three-column grid matching mockup */}
      <div className="grid grid-cols-3 gap-4">
        {/* WRITING CARD */}
        <div className="bg-[#2d3748] border-2 border-[#374151] p-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-orange-500 mb-4">
            WRITING
          </h3>
          <AttributeBar
            icon="✍️"
            label="LYRICISM"
            value={attributes.writing.lyricism}
            category="writing"
            attribute="lyricism"
            color="bg-orange-500"
          />
          <AttributeBar
            icon="💬"
            label="WORDPLAY"
            value={attributes.writing.wordplay}
            category="writing"
            attribute="wordplay"
            color="bg-orange-500"
          />
          <AttributeBar
            icon="💡"
            label="CREATIVITY"
            value={attributes.writing.creativity}
            category="writing"
            attribute="creativity"
            color="bg-orange-500"
          />
          <AttributeBar
            icon="🌊"
            label="FLOW"
            value={attributes.writing.flow}
            category="writing"
            attribute="flow"
            color="bg-orange-500"
          />
        </div>

        {/* PERFORMANCE CARD */}
        <div className="bg-[#2d3748] border-2 border-[#374151] p-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-blue-400 mb-4">
            PERFORMANCE
          </h3>
          <AttributeBar
            icon="🎭"
            label="STAGE PRESENCE"
            value={attributes.performance.stage_presence}
            category="performance"
            attribute="stage_presence"
            color="bg-blue-500"
          />
          <AttributeBar
            icon="👥"
            label="CROWD CONTROL"
            value={attributes.performance.crowd_control}
            category="performance"
            attribute="crowd_control"
            color="bg-blue-500"
          />
          <AttributeBar
            icon="🎤"
            label="DELIVERY"
            value={attributes.performance.delivery}
            category="performance"
            attribute="delivery"
            color="bg-blue-500"
          />
        </div>

        {/* PERSONAL CARD */}
        <div className="bg-[#2d3748] border-2 border-[#374151] p-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-green-400 mb-4">
            PERSONAL
          </h3>
          <AttributeBar
            icon="💵"
            label="FINANCIAL"
            value={attributes.personal.financial_stability}
            category="personal"
            attribute="financial_stability"
            color="bg-green-500"
          />
          <AttributeBar
            icon="👑"
            label="REPUTATION"
            value={attributes.personal.reputation}
            category="personal"
            attribute="reputation"
            color="bg-green-500"
          />
          <AttributeBar
            icon="👨‍👩‍👧"
            label="FAMILY"
            value={attributes.personal.family_bond}
            category="personal"
            attribute="family_bond"
            color="bg-green-500"
          />
          <AttributeBar
            icon="🧠"
            label="RESILIENCE"
            value={attributes.resilience}
            category="resilience"
            attribute="resilience"
            color="bg-green-500"
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
          className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-wider transition disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(249,115,66,0.4)]"
        >
          {pointsRemaining === 0 ? 'NEXT →' : `USE ${pointsRemaining} MORE POINTS`}
        </button>
      </div>
    </div>
  );
}
