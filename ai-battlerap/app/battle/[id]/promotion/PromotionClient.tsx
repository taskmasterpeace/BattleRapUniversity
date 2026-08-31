'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SegGauge } from '@/components/ui/StatGauge';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/Toast';

type Props = {
  battle: any;
  playerBattler: any;
  playerAttributes: any;
  relationship: any;
  promotionEvents: any[];
  opponentScandals: any[];
};

// Promotion action types (abstract choices, no user text)
type PromotionActionType =
  | 'interview'
  | 'twitter_callout'
  | 'scandal_exposure'
  | 'authenticity_attack'
  | 'angle_teaser';

type PromotionAction = {
  type: PromotionActionType;
  title: string;
  description: string;
  icon: string;
  // Attribute requirements
  primaryAttribute: string;
  primaryWeight: number;
  secondaryAttribute?: string;
  secondaryWeight?: number;
  // Outcomes
  crowdGainRange: [number, number]; // Min-max crowd perception gain
  authenticityCost: number; // How much authenticity you lose
  mediaCoverage: number; // 0-10 scale
  cooldownDays?: number; // Can't use again for X days
};

const PROMOTION_ACTIONS: PromotionAction[] = [
  {
    type: 'interview',
    title: 'MEDIA INTERVIEW',
    description: 'Give an interview hyping the battle. Safe play, builds anticipation.',
    icon: '🎤',
    primaryAttribute: 'stage_presence',
    primaryWeight: 0.7,
    secondaryAttribute: 'crowd_control',
    secondaryWeight: 0.3,
    crowdGainRange: [5, 15],
    authenticityCost: 5,
    mediaCoverage: 6,
  },
  {
    type: 'twitter_callout',
    title: 'TWITTER BEEF',
    description: 'Start social media drama. High risk, high reward. Burns authenticity fast.',
    icon: '🐦',
    primaryAttribute: 'wordplay',
    primaryWeight: 0.6,
    secondaryAttribute: 'creativity',
    secondaryWeight: 0.4,
    crowdGainRange: [10, 25],
    authenticityCost: 15,
    mediaCoverage: 8,
    cooldownDays: 3,
  },
  {
    type: 'scandal_exposure',
    title: 'EXPOSE SCANDAL',
    description: 'Bring up dirt on your opponent. Requires known scandal. Devastating if true.',
    icon: '📰',
    primaryAttribute: 'reputation',
    primaryWeight: 0.5,
    secondaryAttribute: 'lyricism',
    secondaryWeight: 0.5,
    crowdGainRange: [15, 35],
    authenticityCost: 10,
    mediaCoverage: 9,
  },
  {
    type: 'authenticity_attack',
    title: 'QUESTION CREDIBILITY',
    description: 'Attack their authenticity. Damages them even if you lose the battle.',
    icon: '🎯',
    primaryAttribute: 'creativity',
    primaryWeight: 0.6,
    secondaryAttribute: 'stage_presence',
    secondaryWeight: 0.4,
    crowdGainRange: [8, 20],
    authenticityCost: 8,
    mediaCoverage: 7,
  },
  {
    type: 'angle_teaser',
    title: 'TEASE YOUR ANGLES',
    description: 'Hint at what you\'ll say in battle. Builds hype without revealing everything.',
    icon: '💡',
    primaryAttribute: 'lyricism',
    primaryWeight: 0.7,
    secondaryAttribute: 'flow',
    secondaryWeight: 0.3,
    crowdGainRange: [6, 18],
    authenticityCost: 3,
    mediaCoverage: 5,
  },
];

export default function PromotionClient({
  battle,
  playerBattler,
  playerAttributes,
  relationship,
  promotionEvents,
  opponentScandals,
}: Props) {
  const router = useRouter();
  const [executing, setExecuting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<PromotionAction | null>(null);

  // Calculate days until battle
  const scheduledDate = new Date(battle.scheduled_at);
  const now = new Date();
  const daysUntilBattle = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate recency multiplier (impacts effectiveness)
  const getRecencyMultiplier = () => {
    if (daysUntilBattle <= 1) return 2.0; // 2x on battle day
    if (daysUntilBattle <= 3) return 1.5; // 1.5x close to battle
    if (daysUntilBattle <= 7) return 1.2; // 1.2x within a week
    if (daysUntilBattle <= 14) return 1.0; // 1.0x standard
    return 0.7; // 0.7x too early
  };

  // Calculate success probability for an action
  const calculateSuccessProbability = (action: PromotionAction): number => {
    const primaryStat =
      playerAttributes?.writing?.[action.primaryAttribute] ||
      playerAttributes?.performance?.[action.primaryAttribute] ||
      playerAttributes?.personal?.[action.primaryAttribute] ||
      5;

    const secondaryStat = action.secondaryAttribute
      ? playerAttributes?.writing?.[action.secondaryAttribute] ||
        playerAttributes?.performance?.[action.secondaryAttribute] ||
        playerAttributes?.personal?.[action.secondaryAttribute] ||
        5
      : 5;

    const weightedScore =
      primaryStat * action.primaryWeight + secondaryStat * (action.secondaryWeight || 0);

    // Base probability: 50% + (weighted score - 5) * 8%
    // So: 10/10 = 90%, 5/10 = 50%, 1/10 = 18%
    const baseProbability = 50 + (weightedScore - 5) * 8;

    // Reputation bonus (higher rep = more effective promotion)
    const repBonus = ((playerAttributes?.personal?.reputation || 5) - 5) * 2;

    return Math.round(Math.min(95, Math.max(15, baseProbability + repBonus)));
  };

  // Crowd gain the player actually banks ON A HIT (raw gain range midpoint x
  // timing). Do NOT weight by success probability here: Success Chance is shown
  // as its own row, and the API grants the full gain on a hit (a reduced ~35% on
  // a miss). Multiplying by successProb double-counted the odds and understated
  // the payoff — the card said "+3" while a *failed* roll already banked +4.
  const calculateCrowdGainOnHit = (action: PromotionAction): number => {
    const avgGain = (action.crowdGainRange[0] + action.crowdGainRange[1]) / 2;
    const recencyMultiplier = getRecencyMultiplier();

    return Math.round(avgGain * recencyMultiplier);
  };

  // Current crowd perception (if relationship exists)
  const isPlayerA = relationship?.battler_a_id === playerBattler.id;
  const playerCrowdPerception = relationship
    ? isPlayerA
      ? relationship.crowd_perception_a
      : relationship.crowd_perception_b
    : 50;
  const opponentCrowdPerception = relationship
    ? isPlayerA
      ? relationship.crowd_perception_b
      : relationship.crowd_perception_a
    : 50;

  // Player authenticity
  const playerAuthenticity = relationship
    ? isPlayerA
      ? relationship.authenticity_score_a
      : relationship.authenticity_score_b
    : 100;

  // Check if action is available
  const isActionAvailable = (action: PromotionAction): boolean => {
    // Scandal exposure requires known scandals
    if (action.type === 'scandal_exposure' && opponentScandals.length === 0) {
      return false;
    }

    // Check cooldown
    if (action.cooldownDays) {
      const lastUsed = promotionEvents.find((e) => e.event_type === action.type);
      if (lastUsed) {
        const daysSinceUsed = Math.floor(
          (now.getTime() - new Date(lastUsed.occurred_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceUsed < action.cooldownDays) {
          return false;
        }
      }
    }

    return true;
  };

  const handleExecuteAction = async (action: PromotionAction) => {
    setExecuting(true);
    try {
      const response = await fetch(`/api/battles/${battle.id}/promotion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType: action.type,
          targetScandalId: opponentScandals.length > 0 ? opponentScandals[0].id : null,
        }),
      });

      // Guard: a missing/failed endpoint returns an HTML error page, not JSON —
      // parsing that as JSON throws "Unexpected token '<'". Check ok first and
      // parse the error body defensively so the player gets a clean message.
      if (!response.ok) {
        let msg = "Promotion isn't available yet — the crowd's still warming up.";
        try {
          const err = await response.json();
          if (err?.error) msg = err.error;
        } catch {
          /* non-JSON (e.g. 404 HTML) — keep the friendly default */
        }
        throw new Error(msg);
      }

      const data = await response.json();

      // Show result
      const result = data.result;
      const message = result.success
        ? `✓ SUCCESS!\n\n${result.title}\n\nCrowd Gain: +${result.crowdGain}\nAuthenticity: ${result.newAuthenticity}/100\n\n"${result.keyQuote}"`
        : `PARTIAL EFFECT\n\n${result.title}\n\nCrowd Gain: +${result.crowdGain} (reduced)\nAuthenticity: ${result.newAuthenticity}/100`;

      toast(message, result.success ? 'success' : 'info');
      router.refresh();
    } catch (error: any) {
      console.error('Failed to execute promotion:', error);
      toast(error.message || 'Failed to execute promotion action', 'error');
    }
    setExecuting(false);
    setSelectedAction(null);
  };

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#2d2f35]/50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight hover:text-[#ff8c42] transition">
              BATTLE RAP UNIVERSITY
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="text-sm text-zinc-500 uppercase tracking-wider">Promotion Phase</span>
          </div>
          <Link
            href={`/battle/${battle.id}/prep`}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition uppercase tracking-wider"
          >
            ← BACK TO PREP
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Battle Header */}
        <div className="mb-12 bg-gradient-to-r from-orange-900/20 to-zinc-900/20 border-2 border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-display font-black tracking-tighter mb-2">
                VS {(battle.opponent as any)?.stage_name?.toUpperCase()}
              </h1>
              <p className="text-sm text-zinc-500 uppercase tracking-wide">
                {(battle.league as any)?.name} | {new Date(battle.scheduled_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-black ${
                daysUntilBattle <= 3 ? 'text-red-500' : 'text-[#ff8c42]'
              }`}>
                {daysUntilBattle}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">
                DAYS UNTIL BATTLE
              </div>
            </div>
          </div>

          {/* Recency Multiplier Warning */}
          <div className={`p-3 rounded ${
            getRecencyMultiplier() >= 1.5
              ? 'bg-green-500/10 border-2 border-green-500/30'
              : getRecencyMultiplier() < 1.0
              ? 'bg-yellow-500/10 border-2 border-yellow-500/30'
              : 'bg-zinc-800'
          }`}>
            <p className="text-xs uppercase tracking-wide">
              <span className="font-bold">TIMING MULTIPLIER:</span> {getRecencyMultiplier()}x{' '}
              {getRecencyMultiplier() >= 1.5
                ? '(PRIME TIME - Promotion is most effective!)'
                : getRecencyMultiplier() < 1.0
                ? '(TOO EARLY - Crowd will forget by battle day)'
                : '(STANDARD EFFECTIVENESS)'}
            </p>
          </div>
        </div>

        {/* Crowd Perception Status — always shown so the player can see the
            authenticity and perception their promotion actions spend and earn,
            even against a fresh (non-rivalry) opponent (defaults: 50/50 · 100). */}
        {(
          <div className="mb-12 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
            <h2 className="text-lg font-black uppercase tracking-wider mb-6 text-[#ff8c42]">
              📊 CURRENT STANDINGS
              {!relationship && (
                <span className="ml-2 text-[12px] font-mono text-zinc-500 tracking-widest">NO HISTORY — EVEN FOOTING</span>
              )}
            </h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-zinc-500 uppercase tracking-wide mb-2">
                  YOUR CROWD PERCEPTION
                </p>
                <div className="text-3xl font-black text-green-500 mb-2">
                  {playerCrowdPerception}/100
                </div>
                <div className="fs">
                  <SegGauge v10={playerCrowdPerception / 10} grade="A" />
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-500 uppercase tracking-wide mb-2">
                  OPPONENT CROWD PERCEPTION
                </p>
                <div className="text-3xl font-black text-red-500 mb-2">
                  {opponentCrowdPerception}/100
                </div>
                <div className="fs">
                  <SegGauge v10={opponentCrowdPerception / 10} grade="D" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#18191c] border-2 border-[#3a3d44] rounded">
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wide mb-1">
                  Your Authenticity Score
                </p>
                <p className={`text-2xl font-black ${
                  playerAuthenticity >= 80 ? 'text-green-500' :
                  playerAuthenticity >= 50 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {playerAuthenticity}/100
                </p>
              </div>
              <div className="text-xs text-zinc-500 text-right max-w-xs">
                Authenticity drops when you do heavy promotion. Too low and the crowd won't believe you.
              </div>
            </div>
          </div>
        )}

        {/* Promotion Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-black uppercase tracking-wider mb-6 text-[#ff8c42]">
            🎯 PROMOTION ACTIONS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROMOTION_ACTIONS.map((action) => {
              const available = isActionAvailable(action);
              const successProb = calculateSuccessProbability(action);
              const expectedGain = calculateCrowdGainOnHit(action);
              // Even a missed roll still banks ~35% of the gain (API line: crowdGain =
              // success ? fullGain : max(1, round(fullGain * 0.35))). Surfacing it stops
              // a 21% "Success Chance" from reading as a 79% chance of nothing.
              const missGain = Math.max(1, Math.round(expectedGain * 0.35));

              return (
                <button
                  key={action.type}
                  onClick={() => setSelectedAction(action)}
                  disabled={!available || executing}
                  className={`p-5 border-2 rounded-lg text-left transition ${
                    available
                      ? 'bg-[#2d2f35] border-[#3a3d44] hover:border-orange-500/50 cursor-pointer'
                      : 'bg-[#18191c] border-zinc-900 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{action.icon}</span>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wide text-zinc-100">
                          {action.title}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Success Chance</span>
                      <span className={`font-bold ${
                        successProb >= 70 ? 'text-green-500' :
                        successProb >= 40 ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {successProb}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Crowd Gain (Hit)</span>
                      <span className="font-bold text-green-500">
                        +{expectedGain} perception
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Even On A Miss</span>
                      <span className="font-bold text-green-500/60">
                        +{missGain} perception
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Authenticity Cost</span>
                      <span className="font-bold text-red-500">
                        -{action.authenticityCost}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Media Coverage</span>
                      <span className="font-bold text-blue-500">
                        {action.mediaCoverage}/10
                      </span>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="text-xs text-zinc-600 pt-2 border-t-2 border-[#3a3d44]">
                    Requires:{' '}
                    <span className="text-zinc-500">
                      {action.primaryAttribute.replace('_', ' ').toUpperCase()}
                      {action.secondaryAttribute && `, ${action.secondaryAttribute.replace('_', ' ').toUpperCase()}`}
                    </span>
                  </div>

                  {!available && (
                    <div className="mt-2 text-xs text-red-500 font-display font-black uppercase">
                      {action.type === 'scandal_exposure'
                        ? 'NO KNOWN SCANDALS'
                        : 'ON COOLDOWN'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Promotion Timeline */}
        {promotionEvents.length > 0 && (
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
            <h2 className="text-lg font-black uppercase tracking-wider mb-6 text-[#ff8c42]">
              📰 PROMOTION TIMELINE ({promotionEvents.length})
            </h2>
            <div className="space-y-3">
              {promotionEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-[#18191c] border-2 border-[#3a3d44] rounded"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">{event.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        {event.event_type.replace(/_/g, ' ').toUpperCase()}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-600">
                      {new Date(event.occurred_at).toLocaleDateString()}
                    </span>
                  </div>
                  {event.key_quote && (
                    <p className="text-xs text-zinc-400 italic border-l-2 border-orange-500 pl-3 mb-2">
                      "{event.key_quote}"
                    </p>
                  )}
                  <div className="flex gap-3 text-xs">
                    {event.crowd_perception_delta !== 0 && (
                      <span className={event.crowd_perception_delta > 0 ? 'text-green-500' : 'text-red-500'}>
                        Crowd: {event.crowd_perception_delta > 0 ? '+' : ''}{event.crowd_perception_delta}
                      </span>
                    )}
                    {event.authenticity_damage > 0 && (
                      <span className="text-[#ff8c42]">
                        Auth Damage: -{event.authenticity_damage}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">
              CONFIRM ACTION
            </h2>
            <div className="mb-6">
              <p className="text-sm text-zinc-400 mb-4">
                Execute: <span className="text-[#ff8c42] font-bold">{selectedAction.title}</span>
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Success Chance:</span>
                  <span className={`font-bold ${
                    calculateSuccessProbability(selectedAction) >= 70 ? 'text-green-500' :
                    calculateSuccessProbability(selectedAction) >= 40 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {calculateSuccessProbability(selectedAction)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Crowd Gain (Hit):</span>
                  <span className="font-bold text-green-500">
                    +{calculateCrowdGainOnHit(selectedAction)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Even On A Miss:</span>
                  <span className="font-bold text-green-500/60">
                    +{Math.max(1, Math.round(calculateCrowdGainOnHit(selectedAction) * 0.35))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Authenticity Cost:</span>
                  <span className="font-bold text-red-500">
                    -{selectedAction.authenticityCost}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleExecuteAction(selectedAction)}
                disabled={executing}
                className="flex-1 px-4 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider rounded transition disabled:opacity-50"
              >
                {executing ? 'EXECUTING...' : 'EXECUTE'}
              </button>
              <button
                onClick={() => setSelectedAction(null)}
                disabled={executing}
                className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-display font-black uppercase tracking-wider rounded transition disabled:opacity-50"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
