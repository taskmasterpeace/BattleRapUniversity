'use client';

import { useState, useEffect, use, type ReactNode } from 'react';
import Link from 'next/link';
import MatchupMasthead, { battleFace } from '@/components/battle/MatchupMasthead';
import { SegGauge, gradeOf } from '@/components/ui/StatGauge';
import GamingButton from '@/components/ui/GamingButton';
import PostBattleSummary from '@/components/battle/PostBattleSummary';
import JudgeScorecard from '@/components/battle/JudgeScorecard';
import BattleAnalysis from '@/components/battle/BattleAnalysis';
import LiveBattleViewer from '@/components/battle/LiveBattleViewer';
import CrowdReactionStrip from '@/components/battle/CrowdReactionStrip';
import TaleOfTheTape from '@/components/battle/TaleOfTheTape';
import TheInternet from '@/components/battle/TheInternet';
import BadgeUnlockModal from '@/components/badges/BadgeUnlockModal';
import { useBadgeQueue } from '@/lib/hooks/useBadgeQueue';
import { getBadgeRarity } from '@/lib/game/badgeRarity';
import { toast } from '@/components/ui/Toast';

/**
 * The verdict chip on a settled battle. A 3-0 is NOT automatically a body bag —
 * the sim classifies it (bodybag / clean_sweep / gentlemans_30), and calling a
 * competitive gentleman's-30 a "BODY'D" contradicts the Battle Analysis, which
 * reads the same decision_type. Honor decision_type; fall back to the scoreline.
 */
function verdictLabel(
  decisionType: string | undefined,
  verdict: string | undefined,
  playerWon: boolean
): string {
  switch (decisionType) {
    case 'bodybag':
      return playerWon ? 'BODYBAG' : "BODY'D";
    case 'clean_sweep':
      return playerWon ? 'CLEAN SWEEP' : 'SWEPT';
    case 'gentlemans_30':
      return "GENTLEMAN'S 30";
    case 'classic':
      return 'CLASSIC';
    case 'edge':
      return 'RAZOR THIN';
    default: {
      // No stored decision_type — infer from the scoreline.
      const sweep = verdict === '3-0';
      if (playerWon) return sweep ? 'SWEEP' : 'VICTORY';
      return sweep ? 'SWEPT' : 'DEFEAT';
    }
  }
}

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
  created_at?: string;
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
  style_tags?: string[];
};

type RecapArticle = {
  slug: string;
  title: string;
  type: string;
  published_at: string;
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
    short_code?: string | null;
    logo_url?: string | null;
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

/** Simple collapsed-by-default section to keep the page short */
function Expandable({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#101114] border-2 border-[#3a3d44]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#18191c] transition-colors"
      >
        <div className="text-left">
          <span className="text-base font-display font-black uppercase tracking-tighter text-[#ff8c42]">
            {title}
          </span>
          {subtitle && (
            <span className="ml-3 text-[12px] font-mono uppercase tracking-widest text-zinc-500">
              {subtitle}
            </span>
          )}
        </div>
        <span className="text-lg text-[#ff8c42] font-display font-black">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="border-t-2 border-[#3a3d44]">{children}</div>}
    </div>
  );
}

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
  const [recapArticle, setRecapArticle] = useState<RecapArticle | null>(null);
  const [prepBlocks, setPrepBlocks] = useState<any[]>([]);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState(1);
  const [liveMode, setLiveMode] = useState(false);

  const badgesEarned = progression?.badges_earned || [];
  const { currentBadge, dismiss } = useBadgeQueue(badgesEarned);

  // The battler_attributes row stores resilience as a top-level column and may
  // omit keys (e.g. flow) — normalize to the full shape the UI expects.
  const normalizeAttributes = (raw: any): BattlerAttributes | null => {
    if (!raw) return null;
    const w = raw.writing || {};
    const p = raw.performance || {};
    const per = raw.personal || {};
    return {
      writing: {
        lyricism: w.lyricism ?? 0,
        wordplay: w.wordplay ?? 0,
        creativity: w.creativity ?? 0,
        flow: w.flow ?? 0,
      },
      performance: {
        stage_presence: p.stage_presence ?? 0,
        crowd_control: p.crowd_control ?? 0,
        delivery: p.delivery ?? 0,
      },
      personal: {
        resilience: per.resilience ?? raw.resilience ?? 0,
        preparation: per.preparation ?? 0,
        financial_stability: per.financial_stability ?? 0,
        family_bond: per.family_bond ?? 0,
        reputation: per.reputation ?? 0,
      },
    };
  };

  useEffect(() => {
    fetchBattleData();
  }, [id]);

  // Arriving from an AUTO battle (?watch=1): the player saw nothing of the fight,
  // so open the tape instead of the spoiler. Strip the param so a refresh won't
  // re-trigger it. Fires once the battle + segments have loaded.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('watch') !== '1') return;
    if (battle?.status === 'completed' && segments.length > 0) {
      setLiveMode(true);
      params.delete('watch');
      const qs = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
    }
  }, [battle, segments]);

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
        setPlayerAttributes(normalizeAttributes(data.playerAttributes));
        setOpponentAttributes(normalizeAttributes(data.opponentAttributes));
        setRecapArticle(data.recapArticle || null);
        setPrepBlocks(data.prepBlocks || []);
        setPendingEvents(data.pendingEvents || []);
      } else {
        toast(data.error || 'Failed to load battle', 'error');
      }
    } catch (error) {
      console.error('Error fetching battle:', error);
      toast('Failed to load battle', 'error');
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

  // Prefer avatar_url, fall back to first entry of legacy sprite_set
  const getAvatarUrl = (battler: Battler): string | null => {
    if (battler.avatar_url) return battler.avatar_url;
    if (Array.isArray(battler.sprite_set) && battler.sprite_set.length > 0) {
      return battler.sprite_set[0] ?? null;
    }
    return null;
  };

  const playerAvatarUrl = getAvatarUrl(battle.player_battler);
  const aiAvatarUrl = getAvatarUrl(battle.ai_battler);

  const playerWon = battle.winner_battler_id === battle.player_battler.id;

  /** Compact mirrored stat row for the round breakdown */
  const StatRow = ({
    label,
    player,
    opponent,
    max = 10,
    suffix = '',
  }: {
    label: string;
    player: number;
    opponent: number;
    max?: number;
    suffix?: string;
  }) => {
    const playerLeads = player > opponent;
    const oppLeads = opponent > player;
    return (
      <div className="grid grid-cols-[3.25rem_1fr_auto_1fr_3.25rem] items-center gap-2 py-1">
        <span
          className={`text-sm font-display font-black tabular-nums ${
            playerLeads ? 'text-[#ff8c42]' : 'text-zinc-400'
          }`}
        >
          {player.toFixed(suffix ? 0 : 2)}
          {suffix}
        </span>
        <div className="fs min-w-0 [transform:scaleX(-1)]">
          <SegGauge v10={(player / max) * 10} grade={gradeOf((player / max) * 10)} />
        </div>
        <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500 text-center min-w-[64px]">
          {label}
        </span>
        <div className="fs min-w-0">
          <SegGauge v10={(opponent / max) * 10} grade={gradeOf((opponent / max) * 10)} />
        </div>
        <span
          className={`text-sm font-display font-black tabular-nums text-right ${
            oppLeads ? 'text-red-400' : 'text-zinc-400'
          }`}
        >
          {opponent.toFixed(suffix ? 0 : 2)}
          {suffix}
        </span>
      </div>
    );
  };

  /** Compact segment bar lane for one battler */
  const SegmentLane = ({
    name,
    segs,
    accent,
    oppSegs = [],
  }: {
    name: string;
    segs: BattleSegment[];
    accent: string;
    oppSegs?: BattleSegment[];
  }) => (
    <div>
      <div className="text-[12px] font-mono uppercase tracking-widest text-zinc-500 mb-1">{name}</div>
      <div className="flex gap-1.5 items-end h-[72px]">
        {segs.map((seg) => {
          // A haymaker only earns the amber highlight if it LANDED — i.e. won its
          // segment. The sim's "haymaker" flag is a peak ROLL (~1.2x boost), not
          // proof the moment was big: on a weak battler it can sit on a 4.0 that
          // still lost to the opponent's 7.1, and lighting that up next to the
          // bigger bar reads as a bug. Choke always shows — a choke is a choke.
          const oppScore =
            oppSegs.find((o) => o.segment_index === seg.segment_index)?.segment_score ?? 0;
          const landedHaymaker =
            seg.event_flags.includes('haymaker') && seg.segment_score >= oppScore;
          return (
            <div key={seg.id} className="flex-1 flex flex-col justify-end h-full">
              <div
                className={`flex items-end justify-center border ${
                  seg.event_flags.includes('choke')
                    ? 'bg-red-500 border-red-400 text-white'
                    : landedHaymaker
                    ? 'bg-amber-300 border-amber-200 ring-2 ring-amber-300/50 text-black relative z-10'
                    : `${accent} text-white`
                }`}
                style={{ height: `${Math.max(22, Math.min(100, (seg.segment_score / 10) * 100))}%` }}
              >
                <span className="text-[12px] font-black">{seg.segment_score.toFixed(1)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {currentBadge && (
        <BadgeUnlockModal
          badgeCode={currentBadge}
          rarity={getBadgeRarity(currentBadge)}
          onDismiss={dismiss}
          autoAdvanceDelay={5000}
        />
      )}

      {liveMode && isCompleted && (
        <LiveBattleViewer
          player={battle.player_battler}
          ai={battle.ai_battler}
          segments={segments}
          rounds={rounds}
          winnerId={battle.winner_battler_id ?? null}
          onClose={() => setLiveMode(false)}
          league={battle.league ? {
            name: battle.league.name,
            short_code: battle.league.short_code,
            logo_url: battle.league.logo_url,
          } : null}
          raceDemographics={battle.league?.crowd_demographics}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        {/* Back Link + Watch Live */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link href="/dashboard" className="inline-block text-[#ff8c42] hover:text-[#ff9d5c] font-display font-black uppercase tracking-wider text-sm transition-colors">
            ← BACK TO DASHBOARD
          </Link>
          {isCompleted && segments.length > 0 && (
            <button
              onClick={() => setLiveMode(true)}
              className="px-5 py-2 bg-gradient-to-r from-red-600 to-[#ff8c42] text-white font-display font-black uppercase tracking-wider text-sm hover:from-red-500 hover:to-[#ff9d5c] transition-all shadow-[0_0_20px_rgba(255,140,66,0.4)] flex items-center gap-2"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              ▶ WATCH THE TAPE
            </button>
          )}
        </div>

        {/* COMPACT VS HEADER */}
        <div className="bg-[#101114] border-2 border-[#3a3d44] px-6 py-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff8c42]/5 via-transparent to-[#ff8c42]/5 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500">
                {battle.league.name}
              </span>
              <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500">
                {isCompleted ? 'FINAL' : 'UPCOMING'}
              </span>
            </div>

            <MatchupMasthead
              a={{
                id: battle.player_battler.id,
                name: battle.player_battler.stage_name,
                portrait: battleFace(battle.player_battler) ?? playerAvatarUrl,
                won: isCompleted && playerWon,
              }}
              b={{
                id: battle.ai_battler.id,
                name: battle.ai_battler.stage_name,
                portrait: battleFace(battle.ai_battler) ?? aiAvatarUrl,
                tier: battle.ai_battler.tier,
                won: isCompleted && !playerWon,
              }}
              score={isCompleted ? `${playerRoundsWon}–${aiRoundsWon}` : undefined}
              stamp={isCompleted ? verdictLabel(battle.decision_type, battle.verdict, playerWon) : undefined}
            />

            {/* Warnings */}
            {battle.no_show_player && (
              <div className="mt-4 px-3 py-2 bg-red-500/10 text-red-400 border-2 border-red-500/30 font-display font-black uppercase tracking-wider text-xs text-center">
                ⚠ NO-SHOW PENALTY APPLIED - PREP NOT COMPLETED
              </div>
            )}
            {!isCompleted && (
              <div className="mt-4 px-3 py-2 bg-yellow-500/10 text-yellow-400 border-2 border-yellow-500/30 font-display font-black uppercase tracking-wider text-xs text-center">
                BATTLE SCHEDULED FOR {new Date(battle.scheduled_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {isCompleted && (
          <>
            {/* Life Events Notification */}
            {pendingEvents.length > 0 && (
              <div className="bg-[#ff8c42]/10 border-2 border-[#ff8c42]/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-display font-black uppercase tracking-wider text-[#ff8c42] mr-3">
                    LIFE EVENT TRIGGERED
                  </span>
                  <span className="text-xs text-zinc-300">
                    {pendingEvents.length === 1
                      ? pendingEvents[0].template.title
                      : `${pendingEvents.length} events need your decision`}
                  </span>
                </div>
                <div className="flex gap-3 shrink-0">
                  {pendingEvents.length === 1 ? (
                    <GamingButton href={`/life-events/${pendingEvents[0].id}`} variant="primary" size="sm">
                      MAKE DECISION
                    </GamingButton>
                  ) : (
                    <GamingButton href="/dashboard" variant="primary" size="sm">
                      VIEW ALL EVENTS
                    </GamingButton>
                  )}
                </div>
              </div>
            )}

            {/* TWO-COLUMN DESKTOP LAYOUT: rounds left, analysis right */}
            <div className="grid lg:grid-cols-5 gap-4 items-start">
              {/* ── LEFT: ROUNDS ─────────────────────────────── */}
              <div className="lg:col-span-3 space-y-4">
                {/* Round selector */}
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((roundNum) => {
                    const playerData = getPlayerRoundData(roundNum);
                    const aiData = getAIRoundData(roundNum);
                    const won = playerData && aiData && playerData.average_score > aiData.average_score;

                    return (
                      <button
                        key={roundNum}
                        onClick={() => setSelectedRound(roundNum)}
                        className={`py-2 px-3 border-2 font-display font-black uppercase tracking-wider text-sm transition-all ${
                          selectedRound === roundNum
                            ? 'bg-[#ff8c42] border-[#ff8c42] text-black shadow-[0_0_15px_rgba(255,140,66,0.4)]'
                            : won
                            ? 'bg-[#101114] border-green-500/50 text-green-400 hover:border-green-500'
                            : 'bg-[#101114] border-red-500/50 text-red-400 hover:border-red-500'
                        }`}
                      >
                        ROUND {roundNum}
                        {won !== undefined && (
                          <span className="ml-2 text-[12px] font-mono tracking-widest">
                            {won ? '✓ W' : '✗ L'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Round head-to-head */}
                {playerRound && aiRound && (
                  <div className="bg-[#101114] border-2 border-[#3a3d44] p-4">
                    <div className="flex items-baseline justify-between mb-2">
                      <h2 className="text-lg font-display font-black uppercase tracking-tighter text-[#ff8c42]">
                        ROUND {selectedRound} BREAKDOWN
                      </h2>
                      <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500">
                        YOU ← → OPP
                      </span>
                    </div>
                    <div className="divide-y divide-[#3a3d44]/40">
                      <StatRow label="AVG" player={playerRound.average_score} opponent={aiRound.average_score} />
                      <StatRow label="PEAK" player={playerRound.peak_score} opponent={aiRound.peak_score} max={15} />
                      <StatRow
                        label="CROWD"
                        player={playerRound.crowd_reaction}
                        opponent={aiRound.crowd_reaction}
                        max={100}
                        suffix="%"
                      />
                    </div>
                    {(playerRound.choked || aiRound.choked) && (
                      <div className="mt-2 flex gap-2">
                        {playerRound.choked && (
                          <span className="flex-1 px-2 py-1 bg-red-500/10 text-red-400 border-2 border-red-500/30 font-display font-bold text-xs uppercase tracking-wider text-center">
                            ⚠ YOU CHOKED
                          </span>
                        )}
                        {aiRound.choked && (
                          <span className="flex-1 px-2 py-1 bg-green-500/10 text-green-400 border-2 border-green-500/30 font-display font-bold text-xs uppercase tracking-wider text-center">
                            ✓ OPPONENT CHOKED
                          </span>
                        )}
                      </div>
                    )}

                    {/* Segment timeline (compact) */}
                    <div className="mt-4 pt-3 border-t-2 border-[#3a3d44]/60 space-y-3">
                      <SegmentLane
                        name={battle.player_battler.stage_name}
                        segs={playerSegments}
                        oppSegs={aiSegments}
                        accent="bg-[#ff8c42]/70 border-[#ff8c42]"
                      />
                      <SegmentLane
                        name={battle.ai_battler.stage_name}
                        segs={aiSegments}
                        oppSegs={playerSegments}
                        accent="bg-zinc-700 border-zinc-600"
                      />
                      <div className="flex gap-4 justify-center text-[12px] font-mono uppercase tracking-widest text-zinc-500">
                        <span className="flex items-center gap-1">
                          <span className="inline-block w-3 h-3 bg-amber-300 border border-amber-200"></span> HAYMAKER
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block w-3 h-3 bg-red-500 border border-red-400"></span> CHOKE
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block w-3 h-3 bg-zinc-500 border border-zinc-400"></span> NORMAL
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Crowd reaction strip — 3 demographic lanes */}
                {playerRound && aiRound && (
                  <CrowdReactionStrip
                    battleId={battle.id}
                    roundIndex={selectedRound}
                    playerName={battle.player_battler.stage_name}
                    opponentName={battle.ai_battler.stage_name}
                    playerId={battle.player_battler.id}
                    opponentId={battle.ai_battler.id}
                    playerRound={playerRound}
                    opponentRound={aiRound}
                    playerStyleTags={battle.player_battler.style_tags || []}
                    opponentStyleTags={battle.ai_battler.style_tags || []}
                    writingWeight={battle.league.writing_weight}
                    performanceWeight={battle.league.performance_weight}
                    raceDemographics={battle.league.crowd_demographics}
                  />
                )}
              </div>

              {/* ── RIGHT: TAPE / INTERNET / EXPANDABLES ───────── */}
              <div className="lg:col-span-2 space-y-4">
                {playerAttributes && opponentAttributes && (
                  <TaleOfTheTape
                    playerName={battle.player_battler.stage_name}
                    opponentName={battle.ai_battler.stage_name}
                    playerAttributes={playerAttributes}
                    opponentAttributes={opponentAttributes}
                    writingWeight={battle.league.writing_weight}
                    performanceWeight={battle.league.performance_weight}
                  />
                )}

                <TheInternet
                  battleId={battle.id}
                  playerName={battle.player_battler.stage_name}
                  opponentName={battle.ai_battler.stage_name}
                  playerId={battle.player_battler.id}
                  winnerId={battle.winner_battler_id ?? null}
                  verdict={battle.verdict || (playerRoundsWon === 3 || aiRoundsWon === 3 ? '3-0' : '2-1')}
                  rounds={rounds}
                  segments={segments}
                  recapArticle={recapArticle}
                  views={battleViews}
                />

                {/* Progression behind an expandable to keep the page short */}
                {progression && (
                  <Expandable title="YOUR PROGRESSION" subtitle="RATING · XP · ATTRIBUTES">
                    <PostBattleSummary
                      isVictory={playerWon}
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
                  </Expandable>
                )}

                {/* Coach's analysis (self-collapsing) */}
                {playerAttributes && opponentAttributes && (
                  <BattleAnalysis
                    playerName={battle.player_battler.stage_name}
                    opponentName={battle.ai_battler.stage_name}
                    playerWon={playerWon}
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
                          // A haymaker is a swing for the knockout — the score says
                          // whether it LANDED. Don't call a 3.8 a room-shaker.
                          description: event === 'haymaker'
                            ? s.segment_score >= 8
                              ? 'Massive moment that shook the room'
                              : s.segment_score >= 5.5
                              ? 'Big swing that connected'
                              : "Reached for the knockout — but it didn't land"
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

                {/* Judge Scorecard (tournament battles only) */}
                <JudgeScorecard
                  judgeScores={judgeScores}
                  playerBattlerId={battle.player_battler.id}
                  opponentBattlerId={battle.ai_battler.id}
                  playerName={battle.player_battler.stage_name}
                  opponentName={battle.ai_battler.stage_name}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
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
