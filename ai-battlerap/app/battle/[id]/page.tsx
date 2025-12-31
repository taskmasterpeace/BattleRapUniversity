'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import BattlerSprite from '@/components/ui/BattlerSprite';
import StatCard from '@/components/ui/StatCard';
import GamingButton from '@/components/ui/GamingButton';
import CrowdReactionWindow from '@/components/battle/CrowdReactionWindow';
import BattleViewsDisplay from '@/components/battle/BattleViewsDisplay';
import PostBattleSummary from '@/components/battle/PostBattleSummary';
import JudgeScorecard from '@/components/battle/JudgeScorecard';
import BattleAnalysis from '@/components/battle/BattleAnalysis';
import BadgeUnlockModal from '@/components/badges/BadgeUnlockModal';
import { useBadgeQueue } from '@/lib/hooks/useBadgeQueue';
import { getBadgeRarity } from '@/lib/game/badgeRarity';

type BattleRound = {
  id: string;
  round_index: number;
  battler_id: string;
  average_score: number;
  peak_score: number;
  consistency_score: number;
  crowd_reaction: number;
  choked: boolean;
};

type BattleSegment = {
  id: string;
  round_index: number;
  segment_index: number;
  battler_id: string;
  segment_score: number;
  event_flags: string[];
};

type BattleViews = {
  total_views: number;
  from_fan_base: number;
  from_league_subscribers: number;
  from_opponent_fans: number;
  from_viral_discovery: number;
  from_scandal_boost: number;
  viral_multiplier: number;
  view_tier: 'low' | 'mid' | 'top' | 'goat';
};

type JudgeScore = {
  judge_id: string;
  judge_name: string;
  battler_id: string;
  rounds_won: number;
  overall_composite_average: number;
  winner: boolean;
  round_evaluations: any;
};

type AttributeChange = {
  attribute: string;
  category: 'writing' | 'performance' | 'personal';
  oldValue: number;
  newValue: number;
  change: number;
};

type ProgressionData = {
  rating_change: number;
  attribute_changes: Record<string, any>;
  badges_earned: string[];
  stress_change: number;
  stress_after: number;
  total_views: number;
  view_tier: 'low' | 'mid' | 'top' | 'goat';
  fans_before: number;
  fans_after: number;
  fans_gained: number;
  trending_change: number;
  xp_earned?: number;
  xp_breakdown?: any;
  level_before?: number;
  level_after?: number;
  skill_points_earned?: number;
};

type BattlerAttributes = {
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
    resilience: number;
    preparation: number;
    financial_stability: number;
    family_bond: number;
    reputation: number;
  };
};

type Battler = {
  id: string;
  stage_name: string;
  tier: string;
  avatar_url?: string;
  sprite_set?: any;
};

type Battle = {
  id: string;
  scheduled_at: string;
  status: string;
  winner_battler_id?: string;
  no_show_player: boolean;
  verdict?: string;
  decision_type?: string;
  league: {
    name: string;
    round_length_minutes: number;
    writing_weight: number;
    performance_weight: number;
    crowd_demographics?: {
      black: number;
      white: number;
      mixed: number;
    };
  };
  player_battler: Battler;
  ai_battler: Battler;
};

export default function BattleViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [rounds, setRounds] = useState<BattleRound[]>([]);
  const [segments, setSegments] = useState<BattleSegment[]>([]);
  const [battleViews, setBattleViews] = useState<BattleViews | null>(null);
  const [progression, setProgression] = useState<ProgressionData | null>(null);
  const [judgeScores, setJudgeScores] = useState<JudgeScore[]>([]);
  const [playerAttributes, setPlayerAttributes] = useState<BattlerAttributes | null>(null);
  const [opponentAttributes, setOpponentAttributes] = useState<BattlerAttributes | null>(null);
  const [prepBlocks, setPrepBlocks] = useState<any[]>([]);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState(1);

  const badgesEarned = progression?.badges_earned || [];
  const { currentBadge, dismiss } = useBadgeQueue(badgesEarned);

  useEffect(() => {
    fetchBattleData();
  }, [id]);

  const fetchBattleData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/battles/${id}`);
      const data = await response.json();

      if (response.ok) {
        setBattle(data.battle);
        setRounds(data.rounds);
        setSegments(data.segments);
        setBattleViews(data.battleViews);
        setProgression(data.progression || null);
        setJudgeScores(data.judgeScores || []);
        setPlayerAttributes(data.playerAttributes || null);
        setOpponentAttributes(data.opponentAttributes || null);
        setPrepBlocks(data.prepBlocks || []);
        setPendingEvents(data.pendingEvents || []);
      } else {
        alert(data.error || 'Failed to load battle');
      }
    } catch (error) {
      console.error('Error fetching battle:', error);
      alert('Failed to load battle');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-zinc-400 font-display font-black uppercase tracking-wider text-2xl animate-pulse">
          LOADING BATTLE...
        </div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-red-500 font-display font-black uppercase tracking-wider text-2xl">
          BATTLE NOT FOUND
        </div>
      </div>
    );
  }

  const isCompleted = battle.status === 'completed';

  // Calculate rounds won by comparing average scores
  let playerRoundsWon = 0;
  let aiRoundsWon = 0;

  for (let roundIndex = 1; roundIndex <= 3; roundIndex++) {
    const playerRound = rounds.find(
      (r) => r.round_index === roundIndex && r.battler_id === battle.player_battler.id
    );
    const aiRound = rounds.find(
      (r) => r.round_index === roundIndex && r.battler_id === battle.ai_battler.id
    );

    if (playerRound && aiRound) {
      if (playerRound.average_score > aiRound.average_score) {
        playerRoundsWon++;
      } else {
        aiRoundsWon++;
      }
    }
  }

  const getPlayerRoundData = (roundIndex: number) =>
    rounds.find(
      (r) => r.round_index === roundIndex && r.battler_id === battle.player_battler.id
    );
  const getAIRoundData = (roundIndex: number) =>
    rounds.find(
      (r) => r.round_index === roundIndex && r.battler_id === battle.ai_battler.id
    );

  const getSegmentsForRound = (roundIndex: number, battlerId: string) =>
    segments.filter(
      (s) => s.round_index === roundIndex && s.battler_id === battlerId
    );

  const playerRound = getPlayerRoundData(selectedRound);
  const aiRound = getAIRoundData(selectedRound);
  const playerSegments = getSegmentsForRound(selectedRound, battle.player_battler.id);
  const aiSegments = getSegmentsForRound(selectedRound, battle.ai_battler.id);

  const calculatePlayerPrep = () => {
    if (!battle?.player_battler?.id) {
      return {
        researchDays: 0,
        writingDays: 0,
        performanceDays: 0,
        lifeDays: 0,
        restDays: 0,
      };
    }

    const playerPrepBlocks = prepBlocks.filter(pb => pb.battler_id === battle.player_battler.id);
    return {
      researchDays: playerPrepBlocks.filter(pb => pb.focus === 'research').length,
      writingDays: playerPrepBlocks.filter(pb => pb.focus === 'writing').length,
      performanceDays: playerPrepBlocks.filter(pb => pb.focus === 'performance').length,
      lifeDays: playerPrepBlocks.filter(pb => pb.focus === 'life').length,
      restDays: playerPrepBlocks.filter(pb => pb.focus === 'rest').length,
    };
  };

  const convertAttributeChanges = (jsonbChanges: Record<string, any>): AttributeChange[] => {
    if (!jsonbChanges) return [];

    const changes: AttributeChange[] = [];

    const writingAttrs = ['lyricism', 'wordplay', 'creativity', 'flow'];
    writingAttrs.forEach(attr => {
      if (jsonbChanges[attr]) {
        changes.push({
          attribute: attr.charAt(0).toUpperCase() + attr.slice(1),
          category: 'writing',
          oldValue: jsonbChanges[attr].before,
          newValue: jsonbChanges[attr].after,
          change: jsonbChanges[attr].change,
        });
      }
    });

    const perfAttrs = ['stage_presence', 'crowd_control', 'delivery'];
    perfAttrs.forEach(attr => {
      if (jsonbChanges[attr]) {
        changes.push({
          attribute: attr.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          category: 'performance',
          oldValue: jsonbChanges[attr].before,
          newValue: jsonbChanges[attr].after,
          change: jsonbChanges[attr].change,
        });
      }
    });

    const personalAttrs = ['resilience'];
    personalAttrs.forEach(attr => {
      if (jsonbChanges[attr]) {
        changes.push({
          attribute: attr.charAt(0).toUpperCase() + attr.slice(1),
          category: 'personal',
          oldValue: jsonbChanges[attr].before,
          newValue: jsonbChanges[attr].after,
          change: jsonbChanges[attr].change,
        });
      }
    });

    return changes;
  };

  // Extract sprite ID from sprite_set (use first sprite as representative)
  const getFirstSpriteId = (battler: Battler): number | null => {
    if (battler.sprite_set && Array.isArray(battler.sprite_set) && battler.sprite_set.length > 0) {
      // sprite_set contains paths like "/sprites/characters/image_1764147239421/sprite_001.png"
      const firstSprite = battler.sprite_set[0];
      const match = firstSprite.match(/sprite_(\d+)\.png/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return null;
  };

  const playerSpriteId = getFirstSpriteId(battle.player_battler);
  const aiSpriteId = getFirstSpriteId(battle.ai_battler);

  return (
    <div className="min-h-screen bg-[#18191c] text-white">
      {currentBadge && (
        <BadgeUnlockModal
          badgeCode={currentBadge}
          rarity={getBadgeRarity(currentBadge)}
          onDismiss={dismiss}
          autoAdvanceDelay={5000}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Back Link */}
        <Link href="/dashboard" className="inline-block text-[#ff8c42] hover:text-[#ff9d5c] font-display font-display font-black uppercase tracking-wider text-sm transition-colors">
          ← BACK TO DASHBOARD
        </Link>

        {/* VS MATCHUP HEADER */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff8c42]/5 via-transparent to-[#ff8c42]/5"></div>

          <div className="relative z-10">
            {/* League and Title */}
            <div className="text-center mb-8">
              <h3 className="text-sm text-zinc-500 font-display font-display font-black uppercase tracking-widest mb-2">
                {battle.league.name}
              </h3>
              <h1 className="text-5xl font-display font-black uppercase tracking-tighter text-[#ff8c42]">
                BATTLE RESULTS
              </h1>
            </div>

            {/* VS Matchup */}
            <div className="grid grid-cols-3 gap-8 items-center">
              {/* Player Side */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <BattlerSprite
                    spriteId={playerSpriteId}
                    size={160}
                    className="shadow-[0_0_30px_rgba(255,140,66,0.3)]"
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-black uppercase tracking-tight mb-1">
                    {battle.player_battler.stage_name}
                  </h2>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">YOU</p>
                </div>
                {isCompleted && (
                  <div className="text-6xl font-display font-black text-[#ff8c42]">
                    {playerRoundsWon}
                  </div>
                )}
              </div>

              {/* VS Divider */}
              <div className="text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-[#ff8c42]/10 blur-xl"></div>
                  </div>
                  <div className="relative text-7xl font-display font-black uppercase tracking-wider text-[#ff8c42]">
                    VS
                  </div>
                </div>
                {isCompleted && (
                  <div className="mt-6">
                    {battle.winner_battler_id === battle.player_battler.id ? (
                      <div className="px-6 py-3 bg-green-500/20 text-green-400 border-2 border-green-500/50 font-display font-black text-xl uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        {battle.verdict === '3-0' ? 'BODYBAG 🔥' : 'VICTORY'}
                      </div>
                    ) : (
                      <div className="px-6 py-3 bg-red-500/20 text-red-400 border-2 border-red-500/50 font-display font-black text-xl uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                        {battle.verdict === '3-0' ? "BODY'D 💀" : 'DEFEAT'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* AI Side */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <BattlerSprite
                    spriteId={aiSpriteId}
                    size={160}
                    className="shadow-[0_0_30px_rgba(100,100,100,0.3)]"
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-black uppercase tracking-tight mb-1">
                    {battle.ai_battler.stage_name}
                  </h2>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider capitalize">
                    {battle.ai_battler.tier} TIER
                  </p>
                </div>
                {isCompleted && (
                  <div className="text-6xl font-display font-black text-zinc-500">
                    {aiRoundsWon}
                  </div>
                )}
              </div>
            </div>

            {/* No Show Warning */}
            {battle.no_show_player && (
              <div className="mt-8 p-4 bg-red-500/10 text-red-400 border-2 border-red-500/30 font-display font-display font-black uppercase tracking-wider text-sm text-center">
                ⚠ NO-SHOW PENALTY APPLIED - PREP NOT COMPLETED
              </div>
            )}

            {/* Battle Not Simulated Yet */}
            {!isCompleted && (
              <div className="mt-8 p-4 bg-yellow-500/10 text-yellow-400 border-2 border-yellow-500/30 font-display font-display font-black uppercase tracking-wider text-sm text-center">
                BATTLE SCHEDULED FOR {new Date(battle.scheduled_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {isCompleted && (
          <>
            {/* Life Events Notification */}
            {pendingEvents.length > 0 && (
              <div className="bg-[#ff8c42]/10 border-2 border-[#ff8c42]/50 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-display font-black uppercase tracking-wider text-[#ff8c42]">
                        LIFE EVENT TRIGGERED
                      </h3>
                      <span className="px-3 py-1 bg-[#ff8c42] text-black text-xs font-display font-black uppercase tracking-wider rounded-full">
                        NEW
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 mb-4">
                      {pendingEvents.length === 1
                        ? `This battle triggered a life event that requires your decision.`
                        : `This battle triggered ${pendingEvents.length} life events that require your decisions.`
                      }
                    </p>
                    <div className="space-y-2 mb-4">
                      {pendingEvents.map((event) => (
                        <div key={event.id} className="text-sm">
                          <span className="font-bold text-zinc-100">{event.template.title}</span>
                          <span className="text-zinc-500"> - {event.template.description.substring(0, 80)}...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  {pendingEvents.length === 1 ? (
                    <GamingButton href={`/life-events/${pendingEvents[0].id}`} variant="primary">
                      MAKE DECISION NOW
                    </GamingButton>
                  ) : (
                    <GamingButton href="/dashboard" variant="primary">
                      VIEW ALL EVENTS
                    </GamingButton>
                  )}
                  <GamingButton href="/dashboard" variant="secondary">
                    DECIDE LATER
                  </GamingButton>
                </div>
              </div>
            )}

            {/* Post-Battle Summary */}
            {progression && (
              <PostBattleSummary
                isVictory={battle.winner_battler_id === battle.player_battler.id}
                ratingChange={progression.rating_change}
                attributeChanges={convertAttributeChanges(progression.attribute_changes)}
                badgesEarned={progression.badges_earned}
                stressChange={progression.stress_change}
                currentStress={progression.stress_after}
                viewData={{
                  total_views: progression.total_views,
                  view_tier: progression.view_tier,
                }}
                fanGrowth={{
                  fans_before: progression.fans_before,
                  fans_after: progression.fans_after,
                  fans_gained: progression.fans_gained,
                  trending_change: progression.trending_change,
                }}
                levelUpData={
                  progression.xp_earned && progression.level_before !== undefined && progression.level_after !== undefined
                    ? {
                        leveledUp: progression.level_after > progression.level_before,
                        previousLevel: progression.level_before,
                        newLevel: progression.level_after,
                        skillPointsEarned: progression.skill_points_earned || 0,
                        xpEarned: progression.xp_earned,
                        xpBreakdown: progression.xp_breakdown as any,
                      }
                    : undefined
                }
              />
            )}

            {/* BATTLE STATS - Using StatCard */}
            {playerRound && aiRound && (
              <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8">
                <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-6">
                  ROUND {selectedRound} BREAKDOWN
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <StatCard
                    label="YOUR AVG"
                    value={playerRound.average_score.toFixed(2)}
                    icon="📊"
                    variant={playerRound.average_score > aiRound.average_score ? 'highlight' : 'default'}
                  />
                  <StatCard
                    label="YOUR PEAK"
                    value={playerRound.peak_score.toFixed(2)}
                    icon="⚡"
                    subtext="HAYMAKER"
                  />
                  <StatCard
                    label="OPP AVG"
                    value={aiRound.average_score.toFixed(2)}
                    icon="📊"
                    variant={aiRound.average_score > playerRound.average_score ? 'highlight' : 'default'}
                  />
                  <StatCard
                    label="OPP PEAK"
                    value={aiRound.peak_score.toFixed(2)}
                    icon="⚡"
                    subtext="HAYMAKER"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    label="YOUR CROWD"
                    value={`${playerRound.crowd_reaction}%`}
                    icon="🔥"
                    variant={playerRound.crowd_reaction > aiRound.crowd_reaction ? 'highlight' : 'default'}
                  />
                  <StatCard
                    label="OPP CROWD"
                    value={`${aiRound.crowd_reaction}%`}
                    icon="🔥"
                    variant={aiRound.crowd_reaction > playerRound.crowd_reaction ? 'highlight' : 'default'}
                  />
                </div>

                {/* Choke indicators */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {playerRound.choked && (
                    <div className="p-3 bg-red-500/10 text-red-400 border-2 border-red-500/30 font-display font-bold text-sm uppercase tracking-wider text-center">
                      ⚠ YOU CHOKED
                    </div>
                  )}
                  {aiRound.choked && (
                    <div className="p-3 bg-green-500/10 text-green-400 border-2 border-green-500/30 font-display font-bold text-sm uppercase tracking-wider text-center">
                      ✓ OPPONENT CHOKED
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Round Selector */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((roundNum) => {
                const playerData = getPlayerRoundData(roundNum);
                const aiData = getAIRoundData(roundNum);
                const won = playerData && aiData && playerData.average_score > aiData.average_score;

                return (
                  <button
                    key={roundNum}
                    onClick={() => setSelectedRound(roundNum)}
                    className={`py-4 px-4 border-2 font-display font-black uppercase tracking-wider transition-all transform ${
                      selectedRound === roundNum
                        ? 'bg-[#ff8c42] border-[#ff8c42] text-black scale-105 shadow-[0_0_20px_rgba(255,140,66,0.5)]'
                        : won
                        ? 'bg-[#2d2f35] border-green-500/50 text-green-400 hover:border-green-500 hover:scale-102'
                        : 'bg-[#2d2f35] border-red-500/50 text-red-400 hover:border-red-500 hover:scale-102'
                    }`}
                  >
                    <div className="text-lg">ROUND {roundNum}</div>
                    {won !== undefined && (
                      <div className="text-xs mt-1 font-bold">
                        {won ? '✓ WON' : '✗ LOST'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Segment Timeline */}
            <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8">
              <h3 className="text-2xl font-display font-black uppercase tracking-wider text-[#ff8c42] mb-8">
                SEGMENT BREAKDOWN - ROUND {selectedRound}
              </h3>
              <div className="space-y-8">
                {/* Player Timeline */}
                <div>
                  <div className="text-sm font-display font-display font-black uppercase tracking-wider mb-3 text-zinc-300">
                    {battle.player_battler.stage_name}
                  </div>
                  <div className="flex gap-3">
                    {playerSegments.map((seg) => (
                      <div key={seg.id} className="flex-1">
                        <div
                          className={`rounded flex items-end justify-center p-2 border-2 transition-all ${
                            seg.event_flags.includes('choke')
                              ? 'bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                              : seg.event_flags.includes('haymaker')
                              ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                              : 'bg-blue-500 border-blue-400 text-white'
                          }`}
                          style={{
                            height: `${Math.max(40, (seg.segment_score / 10) * 120)}px`,
                          }}
                        >
                          <div className="text-xs font-black">
                            {seg.segment_score.toFixed(1)}
                          </div>
                        </div>
                        <div className="text-xs text-center mt-2 text-zinc-500 font-display font-black uppercase tracking-wide">
                          SEG {seg.segment_index}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Timeline */}
                <div>
                  <div className="text-sm font-display font-display font-black uppercase tracking-wider mb-3 text-zinc-300">
                    {battle.ai_battler.stage_name}
                  </div>
                  <div className="flex gap-3">
                    {aiSegments.map((seg) => (
                      <div key={seg.id} className="flex-1">
                        <div
                          className={`rounded flex items-end justify-center p-2 border-2 transition-all ${
                            seg.event_flags.includes('choke')
                              ? 'bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                              : seg.event_flags.includes('haymaker')
                              ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                              : 'bg-zinc-700 border-zinc-600 text-white'
                          }`}
                          style={{
                            height: `${Math.max(40, (seg.segment_score / 10) * 120)}px`,
                          }}
                        >
                          <div className="text-xs font-black">
                            {seg.segment_score.toFixed(1)}
                          </div>
                        </div>
                        <div className="text-xs text-center mt-2 text-zinc-500 font-display font-black uppercase tracking-wide">
                          SEG {seg.segment_index}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t-2 border-[#3a3d44] text-sm">
                <div className="flex gap-6 justify-center">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-6 h-6 bg-amber-500 border-2 border-amber-400 rounded"></span>
                    <span className="text-zinc-400 uppercase tracking-wider font-display font-bold">HAYMAKER</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-6 h-6 bg-red-500 border-2 border-red-400 rounded"></span>
                    <span className="text-zinc-400 uppercase tracking-wider font-display font-bold">CHOKE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-6 h-6 bg-blue-500 border-2 border-blue-400 rounded"></span>
                    <span className="text-zinc-400 uppercase tracking-wider font-display font-bold">NORMAL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Battle Analysis */}
            {playerAttributes && opponentAttributes && (
              <BattleAnalysis
                playerName={battle.player_battler.stage_name}
                opponentName={battle.ai_battler.stage_name}
                playerWon={battle.winner_battler_id === battle.player_battler.id}
                verdict={battle.verdict || '2-1'}
                decisionType={battle.decision_type || 'edge'}
                playerAttributes={playerAttributes}
                opponentAttributes={opponentAttributes}
                keyMoments={segments
                  .filter(s => s.event_flags.length > 0)
                  .map(s => {
                    const battlerName = s.battler_id === battle.player_battler.id ? battle.player_battler.stage_name : battle.ai_battler.stage_name;
                    const event = s.event_flags[0];
                    return {
                      roundIndex: s.round_index,
                      segmentIndex: s.segment_index,
                      battlerName,
                      type: event as 'haymaker' | 'choke' | 'stumble',
                      score: s.segment_score,
                      description: event === 'haymaker'
                        ? 'Massive moment that shook the room'
                        : event === 'choke'
                        ? 'Catastrophic failure - forgot lines'
                        : 'Minor stumble - slight hesitation',
                    };
                  })}
                playerPrep={calculatePlayerPrep()}
                leagueType={battle.league.name}
                leagueWritingWeight={battle.league.writing_weight}
                leaguePerformanceWeight={battle.league.performance_weight}
              />
            )}

            {/* Judge Scorecard */}
            <JudgeScorecard
              judgeScores={judgeScores}
              playerBattlerId={battle.player_battler.id}
              opponentBattlerId={battle.ai_battler.id}
              playerName={battle.player_battler.stage_name}
              opponentName={battle.ai_battler.stage_name}
            />

            {/* Battle Views Display */}
            {battleViews && (
              <BattleViewsDisplay views={battleViews} showBreakdown={true} />
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-6">
              <GamingButton href="/dashboard" variant="secondary" size="lg">
                ← BACK TO DASHBOARD
              </GamingButton>
              <GamingButton href="/battle/offers" variant="primary" size="lg">
                VIEW NEW OFFERS →
              </GamingButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
