'use client';

import { getRegionalBadge } from '@/lib/game/regionalBadges';
import Icon from '@/components/ui/Icon';
import StatGauge from '@/components/ui/StatGauge';
import { portraitFillStyle } from '@/lib/sprite-crops';

type League = {
  id: string;
  name: string;
  short_code: string;
  round_length_minutes: number;
  description: string;
  writing_weight: number;
  performance_weight: number;
};

type Props = {
  stageName: string;
  avatarUrl: string | null;
  cityName: string;
  league: League;
  attributes: {
    writing: { lyricism: number; wordplay: number; creativity: number; flow: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { financial_stability: number; reputation: number; family_bond: number };
    resilience: number;
  };
  styles: string[];
  onBack: () => void;
  onConfirm: () => void;
  onEdit: (step: number) => void;
};

export default function ReviewStep({
  stageName,
  avatarUrl,
  cityName,
  league,
  attributes,
  styles,
  onBack,
  onConfirm,
  onEdit,
}: Props) {
  // Calculate tier based on average
  const calculateTier = (value: number): string => {
    if (value >= 10) return 'GOD';
    if (value >= 7) return 'TOP';
    if (value >= 4) return 'MID';
    return 'LOW';
  };

  const getTierColor = (value: number): string => {
    if (value >= 10) return 'text-[#ff8c42]';
    if (value >= 7) return 'text-orange-400';
    if (value >= 4) return 'text-amber-400';
    return 'text-zinc-500';
  };

  // Calculate averages
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
  const personalAvg =
    (attributes.personal.financial_stability +
      attributes.personal.reputation +
      attributes.personal.family_bond) /
    3;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight">REVIEW YOUR BATTLER</h2>
        <p className="text-sm text-zinc-500 mt-1 uppercase tracking-wide">
          CONFIRM YOUR CHOICES BEFORE CREATION
        </p>
      </div>

      {/* Identity Section */}
      <div className="bg-[#18191c] border-2 border-[#3a3d44] p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-black uppercase text-zinc-400">IDENTITY</h3>
          <button
            onClick={() => onEdit(1)}
            className="text-xs font-display font-black uppercase tracking-wider text-[#ff8c42] hover:text-[#ff9d5c] transition"
          >
            EDIT
          </button>
        </div>
        <div className="flex items-start gap-4">
          {avatarUrl && (
            <div className="relative w-24 h-24 shrink-0 bg-[#0a0a0a] border-2 border-[#ff8c42] shadow-[0_0_15px_rgba(255,140,66,0.4)] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt="Your claimed face" style={portraitFillStyle(avatarUrl)} />
            </div>
          )}
          <div className="space-y-2">
            <div>
              <span className="text-xs text-zinc-600 uppercase">Stage Name:</span>
              <p className="text-xl font-black uppercase">{stageName}</p>
            </div>
            {cityName && (
              <div>
                <span className="text-xs text-zinc-600 uppercase">Home City:</span>
                <p className="text-sm font-display font-black uppercase text-zinc-400">{cityName}</p>
              </div>
            )}
            {avatarUrl && (
              <p className="font-mono text-[12px] uppercase tracking-wider text-[#ff8c42]">
                FACE CLAIMED ON CREATE — YOURS FOREVER
              </p>
            )}
          </div>
        </div>
      </div>

      {/* League Section */}
      <div className="bg-[#18191c] border-2 border-[#3a3d44] p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-black uppercase text-zinc-400">LEAGUE</h3>
          <button
            onClick={() => onEdit(2)}
            className="text-xs font-display font-black uppercase tracking-wider text-[#ff8c42] hover:text-[#ff9d5c] transition"
          >
            EDIT
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-black uppercase">{league.name}</p>
          <p className="text-xs text-zinc-500">{league.description}</p>
          <div className="flex gap-4 text-xs uppercase tracking-wider mt-3">
            <span className="text-zinc-500">
              <span className="font-bold">{league.round_length_minutes} MIN ROUNDS</span>
            </span>
            <span className="text-zinc-500">
              <span className="font-bold">
                {league.writing_weight > league.performance_weight ? 'WRITING' : 'PERFORMANCE'}{' '}
                FOCUSED
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Attributes Section */}
      <div className="bg-[#18191c] border-2 border-[#3a3d44] p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-black uppercase text-zinc-400">ATTRIBUTES</h3>
          <button
            onClick={() => onEdit(3)}
            className="text-xs font-display font-black uppercase tracking-wider text-[#ff8c42] hover:text-[#ff9d5c] transition"
          >
            EDIT
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Writing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-black uppercase text-zinc-500">WRITING</h4>
              <span className={`text-xs font-bold ${getTierColor(writingAvg)}`}>
                {calculateTier(writingAvg)} TIER
              </span>
            </div>
            <StatGauge label="LYRICISM" v10={attributes.writing.lyricism} />
            <StatGauge label="WORDPLAY" v10={attributes.writing.wordplay} />
            <StatGauge label="CREATIVITY" v10={attributes.writing.creativity} />
            <StatGauge label="FLOW" v10={attributes.writing.flow} />
          </div>

          {/* Performance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-black uppercase text-zinc-500">PERFORMANCE</h4>
              <span className={`text-xs font-bold ${getTierColor(performanceAvg)}`}>
                {calculateTier(performanceAvg)} TIER
              </span>
            </div>
            <StatGauge label="STAGE PRESENCE" v10={attributes.performance.stage_presence} />
            <StatGauge label="CROWD CONTROL" v10={attributes.performance.crowd_control} />
            <StatGauge label="DELIVERY" v10={attributes.performance.delivery} />
          </div>

          {/* Personal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-black uppercase text-zinc-500">PERSONAL</h4>
              <span className={`text-xs font-bold ${getTierColor(personalAvg)}`}>
                {calculateTier(personalAvg)} TIER
              </span>
            </div>
            <StatGauge label="FINANCES" v10={attributes.personal.financial_stability} />
            <StatGauge label="REPUTATION" v10={attributes.personal.reputation} />
            <StatGauge label="FAMILY" v10={attributes.personal.family_bond} />
          </div>

          {/* Mental */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-black uppercase text-zinc-500">MENTAL</h4>
              <span className={`text-xs font-bold ${getTierColor(attributes.resilience)}`}>
                {calculateTier(attributes.resilience)} TIER
              </span>
            </div>
            <StatGauge label="RESILIENCE" v10={attributes.resilience} />
          </div>
        </div>
      </div>

      {/* Styles Section */}
      <div className="bg-[#18191c] border-2 border-[#3a3d44] p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-black uppercase text-zinc-400">BATTLE STYLES</h3>
          <button
            onClick={() => onEdit(4)}
            className="text-xs font-display font-black uppercase tracking-wider text-[#ff8c42] hover:text-[#ff9d5c] transition"
          >
            EDIT
          </button>
        </div>
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

      {/* Starting Badges — what you automatically walk in with */}
      <div className="bg-[#18191c] border-2 border-[#3a3d44] p-6">
        <h3 className="text-sm font-black uppercase text-zinc-400 mb-1">STARTING BADGES</h3>
        <p className="font-mono text-[12px] uppercase tracking-widest text-zinc-600 mb-4">
          AUTOMATIC ON CREATION — YOUR STYLES PLUS YOUR CITY REP
        </p>
        <div className="flex flex-wrap gap-2">
          {[...new Set([...styles, getRegionalBadge(cityName || null)])].map((badge) => (
            <span
              key={badge}
              className="px-3 py-1 bg-green-500/10 border-2 border-green-500/30 text-green-400 text-xs font-display font-black uppercase tracking-wider"
            >
              <Icon name="medal" size={12} className="mr-1 -mt-0.5" />{badge}
            </span>
          ))}
        </div>
      </div>

      {/* Expected Stats */}
      <div className="bg-[#ff8c42]/5 border-2 border-[#ff8c42]/30 p-6">
        <h3 className="text-sm font-display font-black uppercase text-[#ff8c42] mb-4">EXPECTED STARTING STATS</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-zinc-500">Starting Rating:</span>
            <p className="font-black text-zinc-300">1200 ELO</p>
          </div>
          <div>
            <span className="text-zinc-500">Tier:</span>
            <p className="font-black text-zinc-300">ROOKIE</p>
          </div>
          <div>
            <span className="text-zinc-500">Battles:</span>
            <p className="font-black text-zinc-300">0</p>
          </div>
          <div>
            <span className="text-zinc-500">Win Rate:</span>
            <p className="font-black text-zinc-300">N/A</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 border-2 border-[#3a3d44] text-zinc-400 font-black uppercase tracking-wider hover:bg-zinc-800 transition"
        >
          BACK
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-black uppercase tracking-wider transition"
        >
          CONFIRM & CREATE
        </button>
      </div>
    </div>
  );
}
