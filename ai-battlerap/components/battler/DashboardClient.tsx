'use client';

import Link from 'next/link';
import { createClient } from '@/lib/db/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Avatar from '@/components/ui/Avatar';
import StatCard from '@/components/ui/StatCard';
import GamingButton from '@/components/ui/GamingButton';
import StressIndicator from './StressIndicator';
import ArchetypeDisplay from './ArchetypeDisplay';
import BadgeTooltip from '../ui/BadgeTooltip';
import BadgeShowcase from './BadgeShowcase';
import LeagueOverview from './LeagueOverview';
import EarningsWidget from './EarningsWidget';
import CareerHighlights from './CareerHighlights';
import FanStatsWidget from './FanStatsWidget';
import PendingLifeEventsWidget from './PendingLifeEventsWidget';
import { CharacterPortrait } from '../ui/CharacterPortrait';
import FirstWeekGoals from './FirstWeekGoals';
import BattlerBanner from './BattlerBanner';
import ActiveBeefsWidget from '../relationships/ActiveBeefsWidget';
import CareerStatsWidget from './CareerStatsWidget';
import { getSlotStatus, MAX_BONUS_SLOTS_PER_DAY } from '@/lib/game/battleSlots';

type Props = {
  battler: any;
  attributes: any;
  ranking: any;
  league: any;
  activeBattles: any[];
  offersCount: number;
  recentBattles: any[];
  fanData: {
    total_fans: number;
    hardcore_fans: number;
    casual_fans: number;
    trending_score: number;
    fan_growth_rate: number;
    avg_hype_multiplier: number;
  } | null;
  pendingEvents: any[];
  careerRounds?: Array<{
    peak_score: number;
    average_score: number;
    crowd_reaction: number;
    consistency_score: number;
    choked: boolean;
  }>;
  prepStatusByBattle?: Record<string, { setDays: number; totalDays: number }>;
  badgeProgress?: Array<{ code: string; label: string; pct: number; detail: string }>;
  currentCity?: { id: string; name: string } | null;
};

type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  type: string;
  published_at: string;
};

export default function DashboardClient({
  battler,
  attributes,
  ranking,
  league,
  activeBattles,
  offersCount,
  recentBattles,
  fanData,
  pendingEvents,
  careerRounds = [],
  prepStatusByBattle = {},
  badgeProgress = [],
  currentCity = null,
}: Props) {
  const nextBattle = activeBattles && activeBattles.length > 0 ? activeBattles[0] : null;
  const router = useRouter();
  const [recentNews, setRecentNews] = useState<NewsArticle[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [tournamentData, setTournamentData] = useState<any>(null);

  // Convert battler tier to CharacterPortrait tier format
  const getTierForPortrait = (tier: string): 'low' | 'mid' | 'top' | 'god' => {
    const normalized = tier.toLowerCase();
    if (normalized === 'low') return 'low';
    if (normalized === 'mid') return 'mid';
    if (normalized === 'top') return 'top';
    if (normalized === 'god') return 'god';
    return 'low'; // default fallback
  };

  useEffect(() => {
    fetchRecentNews();
    fetchTournamentData();
  }, [battler.id]);

  const fetchRecentNews = async () => {
    try {
      const response = await fetch(`/api/news?battler_id=${battler.id}&limit=5`);
      const data = await response.json();
      if (response.ok) {
        setRecentNews(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching recent news:', error);
    }
  };

  const fetchTournamentData = async () => {
    try {
      const response = await fetch('/api/tournaments/history?status=all&limit=3');
      const data = await response.json();
      if (response.ok) {
        setTournamentData(data);
      }
    } catch (error) {
      console.error('Error fetching tournament data:', error);
    }
  };

  const [startError, setStartError] = useState<string | null>(null);

  // Daily battle slots — lazy-reset view of the battler's slot columns
  const slots = getSlotStatus(battler);
  const slotsExhausted = slots.remaining === 0;

  const formatResetTime = (iso: string) => {
    const reset = new Date(iso);
    return reset.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const handleStartBattle = async () => {
    if (!nextBattle) return;

    setSimulating(true);
    setStartError(null);
    try {
      const response = await fetch(`/api/battles/${nextBattle.id}/start`, {
        method: 'POST',
      });

      if (response.ok) {
        // Straight to the battle results
        router.push(`/battle/${nextBattle.id}`);
      } else {
        const data = await response.json().catch(() => ({}));
        if (response.status === 429 && data.resetsAt) {
          setStartError(
            `NO BATTLE SLOTS LEFT TODAY — SLOTS RESET AT ${formatResetTime(data.resetsAt)}`
          );
        } else {
          setStartError(data.error || 'Could not start the battle — try again.');
        }
        setSimulating(false);
      }
    } catch (error) {
      console.error('Error starting battle:', error);
      setStartError('Could not start the battle — try again.');
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Global nav lives in app/layout.tsx — no local header needed */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Quick Nav */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          <GamingButton href="/guide" size="md" variant="secondary">
            📖 GAMEPLAY GUIDE
          </GamingButton>
          <GamingButton href="/badges" size="md" variant="secondary">
            🏅 BADGE COLLECTION
          </GamingButton>
          <GamingButton href="/finances" size="md" variant="secondary">
            💰 FINANCES
          </GamingButton>
          <GamingButton href="/tournaments" size="md" variant="secondary">
            🏆 TOURNAMENTS
          </GamingButton>
        </div>

        {/* New-player roadmap — retires itself after 5 career battles */}
        <FirstWeekGoals
          totalBattles={(ranking?.wins || 0) + (ranking?.losses || 0)}
          wins={ranking?.wins || 0}
          hasActiveBattle={!!nextBattle}
          hasFullPrep={Object.values(prepStatusByBattle).some(
            (p) => p.totalDays > 0 && p.setDays >= p.totalDays
          )}
          offersCount={offersCount}
          inCity={!!currentCity}
        />

        {/* Battler Profile Header */}
        <div className="mb-8 bg-[#2d2f35] border-2 border-[#3a3d44] p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-6">
            {/* Large Sprite */}
            <div className="flex-shrink-0">
              <Avatar url={battler.avatar_url} size={128} showBorder={true} alt={battler.stage_name} />
            </div>

            {/* Battler Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-display font-black uppercase tracking-tighter text-zinc-100 mb-2">
                {battler.stage_name}
              </h1>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                <span className="px-4 py-2 bg-[#ff8c42]/20 text-[#ff8c42] border-2 border-[#ff8c42]/50 font-display font-display font-black uppercase tracking-wider text-sm">
                  {league?.name}
                </span>
                <span className="px-4 py-2 bg-[#3a3d44] text-zinc-400 border-2 border-[#3a3d44] font-display font-display font-black uppercase tracking-wider text-sm">
                  {battler.tier} TIER
                </span>
                {battler.region && (
                  <span className="px-4 py-2 bg-[#3a3d44] text-zinc-400 border-2 border-[#3a3d44] font-display font-display font-black uppercase tracking-wider text-sm">
                    📍 {battler.region}
                  </span>
                )}
                {currentCity && (
                  <Link
                    href={`/cities/${currentCity.id}`}
                    className="px-4 py-2 bg-[#ff8c42]/10 text-[#ff8c42] border-2 border-[#ff8c42]/40 hover:border-[#ff8c42] font-display font-black uppercase tracking-wider text-sm transition-colors"
                    title="Your current city — recruit and battle the local scene"
                  >
                    ✈️ IN {currentCity.name}
                  </Link>
                )}
              </div>

              {/* Level Display */}
              <div className="inline-block px-6 py-3 bg-[#ff8c42]/10 border-2 border-[#ff8c42]/30">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 font-display font-display font-black uppercase tracking-wider">
                    {(() => {
                      const level = battler.level || 1;
                      if (level <= 5) return '🌟 ROOKIE';
                      if (level <= 10) return '⭐ UP-AND-COMER';
                      if (level <= 15) return '✨ ESTABLISHED';
                      if (level <= 20) return '💫 ELITE';
                      if (level <= 25) return '🔥 LEGEND';
                      return '👑 GOAT';
                    })()}
                  </span>
                  <span className="text-3xl font-display font-black text-[#ff8c42]">
                    LEVEL {battler.level || 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Rating Display */}
            <div className="flex-shrink-0 text-center">
              <div className="text-6xl font-display font-black text-[#ff8c42] mb-2">
                {ranking?.rating}
              </div>
              <div className="text-xs text-zinc-500 font-display font-display font-black uppercase tracking-wider">
                ELO RATING
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-400 font-display font-display font-black uppercase">
              <span>XP PROGRESS</span>
              <span>{battler.current_level_xp || 0} / {(() => {
                const level = battler.level || 1;
                if (level >= 30) return 0;
                return Math.floor(500 * Math.pow(level + 1, 1.5));
              })()} XP</span>
            </div>
            <div className="w-full bg-[#18191c] border-2 border-[#3a3d44] h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ff8c42] to-[#ffb366] transition-all duration-500"
                style={{
                  width: `${(() => {
                    const level = battler.level || 1;
                    if (level >= 30) return 100;
                    const nextLevelXP = Math.floor(500 * Math.pow(level + 1, 1.5));
                    const currentXP = battler.current_level_xp || 0;
                    return Math.min(100, (currentXP / nextLevelXP) * 100);
                  })()}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Next Battle Section — top of dashboard, most important active CTA */}
        {activeBattles && activeBattles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-4">
              🔥 NEXT BATTLE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBattles.map((battle: any) => {
                const daysUntil = Math.ceil((new Date(battle.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntil <= 3;
                const prep = prepStatusByBattle[battle.id] || { setDays: 0, totalDays: 1 };
                const prepPct = prep.totalDays > 0 ? Math.round((prep.setDays / prep.totalDays) * 100) : 0;
                const needsPrep = prep.setDays < prep.totalDays;
                const noPrepAtAll = prep.setDays === 0;

                return (
                  <div
                    key={battle.id}
                    className={`bg-[#2d2f35] border-2 p-6 ${
                      isUrgent
                        ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                        : 'border-[#ff8c42] shadow-[0_0_20px_rgba(255,140,66,0.2)]'
                    }`}
                  >
                    <div className="flex flex-wrap gap-2 mb-3">
                      {isUrgent && (
                        <div className="inline-block px-3 py-1 bg-red-500 text-white font-display font-black uppercase text-xs tracking-wider">
                          ⚠️ URGENT
                        </div>
                      )}
                      {noPrepAtAll && (
                        <div className="inline-block px-3 py-1 bg-yellow-500 text-zinc-900 font-display font-black uppercase text-xs tracking-wider animate-pulse">
                          ❗ NEEDS PREP
                        </div>
                      )}
                      {!noPrepAtAll && needsPrep && (
                        <div className="inline-block px-3 py-1 bg-blue-500/30 text-blue-300 border-2 border-blue-500/50 font-display font-black uppercase text-xs tracking-wider">
                          📝 PREP IN PROGRESS
                        </div>
                      )}
                      {!needsPrep && (
                        <div className="inline-block px-3 py-1 bg-green-500/30 text-green-300 border-2 border-green-500/50 font-display font-black uppercase text-xs tracking-wider">
                          ✓ PREP COMPLETE
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-zinc-500 font-display font-display font-black uppercase tracking-wider mb-2">
                        VS OPPONENT
                      </p>
                      {battle.ai_battler?.id ? (
                        <Link
                          href={`/battler/${battle.ai_battler.id}`}
                          className="inline-block text-3xl font-display font-black uppercase tracking-tighter text-zinc-100 mb-2 hover:text-[#ff8c42] transition-colors"
                          title={`View ${battle.ai_battler.stage_name}'s career`}
                        >
                          {battle.ai_battler.stage_name}
                        </Link>
                      ) : (
                        <p className="text-3xl font-display font-black uppercase tracking-tighter text-zinc-100 mb-2">
                          {battle.ai_battler?.stage_name}
                        </p>
                      )}
                      <p className="text-sm text-zinc-400 font-display font-display font-black uppercase">
                        {battle.league?.name}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-[#18191c] border-2 border-[#3a3d44] p-3">
                        <p className="text-xs text-zinc-500 font-display font-display font-black uppercase mb-1">SCHEDULED</p>
                        <p className="text-sm font-display font-bold text-zinc-100">
                          {new Date(battle.scheduled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-[#18191c] border-2 border-[#3a3d44] p-3">
                        <p className="text-xs text-zinc-500 font-display font-display font-black uppercase mb-1">DAYS LEFT</p>
                        <p className={`text-2xl font-display font-black ${isUrgent ? 'text-red-400' : 'text-[#ff8c42]'}`}>
                          {daysUntil}
                        </p>
                      </div>
                      <div className="bg-[#18191c] border-2 border-[#3a3d44] p-3">
                        <p className="text-xs text-zinc-500 font-display font-display font-black uppercase mb-1">PREP DAYS</p>
                        <p className={`text-2xl font-display font-black ${needsPrep ? 'text-yellow-400' : 'text-green-400'}`}>
                          {prep.setDays}/{prep.totalDays}
                        </p>
                      </div>
                    </div>

                    {/* Prep progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-zinc-500 font-display font-black uppercase tracking-wider mb-1">
                        <span>PREP PROGRESS</span>
                        <span>{prepPct}%</span>
                      </div>
                      <div className="w-full bg-[#18191c] border-2 border-[#3a3d44] h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            prepPct === 100
                              ? 'bg-gradient-to-r from-green-500 to-green-400'
                              : prepPct === 0
                              ? 'bg-yellow-500'
                              : 'bg-gradient-to-r from-blue-500 to-blue-400'
                          }`}
                          style={{ width: `${Math.max(prepPct, prepPct === 0 ? 0 : 4)}%` }}
                        />
                      </div>
                    </div>

                    <GamingButton
                      href={`/battle/${battle.id}/prep`}
                      variant={noPrepAtAll || isUrgent ? 'danger' : 'primary'}
                      size="lg"
                      className="w-full"
                    >
                      {noPrepAtAll
                        ? '❗ SET YOUR PREP NOW'
                        : needsPrep
                        ? '📝 CONTINUE PREP'
                        : '✏️ REVIEW PREP'}
                    </GamingButton>

                    {nextBattle && battle.id === nextBattle.id && (
                      <>
                        {/* TODAY'S SLOTS — daily battle allowance */}
                        <div
                          className={`mt-3 flex items-center justify-between gap-4 bg-[#0a0a0a] border-2 px-4 py-3 ${
                            slotsExhausted ? 'border-red-500/50' : 'border-[#3a3d44]'
                          }`}
                        >
                          <div>
                            <p className="text-[10px] text-zinc-500 font-display font-black uppercase tracking-wider mb-1.5">
                              TODAY&apos;S SLOTS
                            </p>
                            <div className="flex items-center gap-1.5" aria-label={`${slots.remaining} of ${slots.base + slots.bonus} battle slots remaining today`}>
                              {Array.from({ length: slots.base + slots.bonus }, (_, i) => {
                                const isUsed = i < slots.used;
                                const isBonus = i >= slots.base;
                                return (
                                  <span
                                    key={i}
                                    className={`relative text-xl leading-none transition ${
                                      isUsed
                                        ? 'opacity-25 grayscale'
                                        : 'drop-shadow-[0_0_6px_rgba(255,140,66,0.8)]'
                                    }`}
                                    title={
                                      isBonus
                                        ? isUsed
                                          ? 'Bonus slot — used'
                                          : 'Bonus slot — earned today'
                                        : isUsed
                                        ? 'Slot used'
                                        : 'Slot available'
                                    }
                                  >
                                    🎤
                                    {isBonus && (
                                      <span className="absolute -top-1 -right-1.5 text-[9px] font-display font-black text-[#ff8c42] not-italic">
                                        +
                                      </span>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-display font-black uppercase tracking-wider ${
                                slotsExhausted ? 'text-red-400' : 'text-zinc-100'
                              }`}
                            >
                              {slots.remaining} OF {slots.base + slots.bonus} BATTLE
                              {slots.base + slots.bonus === 1 ? '' : 'S'} LEFT
                            </p>
                            <p className="text-[10px] text-zinc-500 font-display font-black uppercase tracking-wider mt-0.5">
                              {slotsExhausted
                                ? `RESETS AT ${formatResetTime(slots.resetsAt)}`
                                : slots.bonus >= MAX_BONUS_SLOTS_PER_DAY
                                ? 'MAX BONUS EARNED TODAY'
                                : 'WIN TO EARN +1'}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={handleStartBattle}
                          disabled={simulating}
                          className={`w-full mt-3 px-6 py-4 font-display font-black uppercase tracking-wider transition disabled:opacity-50 ${
                            slotsExhausted
                              ? 'bg-[#3a3d44] text-zinc-500 cursor-not-allowed'
                              : 'bg-[#ff8c42] hover:bg-[#ff9d5c] text-black shadow-[0_0_20px_-5px_rgba(255,140,66,0.6)] animate-pulse-orange'
                          }`}
                        >
                          {simulating
                            ? '🔥 ON STAGE…'
                            : slotsExhausted
                            ? '🚫 NO SLOTS LEFT TODAY'
                            : '🎤 BATTLE TIME — TAKE THE STAGE'}
                        </button>
                        {startError && (
                          <div className="mt-3 px-4 py-3 bg-red-500/10 border-2 border-red-500/50 text-red-400 text-sm font-display font-black uppercase tracking-wider text-center">
                            ⛔ {startError}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Career Stats Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-4">
            📊 CAREER STATISTICS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="TOTAL BATTLES"
              value={(ranking?.wins || 0) + (ranking?.losses || 0)}
              icon="⚔️"
              subtext={`${ranking?.wins || 0}W - ${ranking?.losses || 0}L`}
            />
            <StatCard
              label="WIN RATE"
              value={
                (ranking?.wins || 0) + (ranking?.losses || 0) > 0
                  ? `${Math.round(((ranking?.wins || 0) / ((ranking?.wins || 0) + (ranking?.losses || 0))) * 100)}%`
                  : '0%'
              }
              icon="🎯"
              variant="highlight"
            />
            <StatCard
              label="CURRENT STREAK"
              value={
                (ranking?.streak || 0) > 0
                  ? `W${Math.abs(ranking?.streak || 0)}`
                  : (ranking?.streak || 0) < 0
                  ? `L${Math.abs(ranking?.streak || 0)}`
                  : '0'
              }
              icon={
                (ranking?.streak || 0) > 0
                  ? '🔥'
                  : (ranking?.streak || 0) < 0
                  ? '❄️'
                  : '➖'
              }
              subtext={
                (ranking?.streak || 0) > 0
                  ? 'HOT STREAK'
                  : (ranking?.streak || 0) < 0
                  ? 'COLD STREAK'
                  : 'NO STREAK'
              }
            />
            <StatCard
              label="ELO RATING"
              value={ranking?.rating || 1000}
              icon="⭐"
              subtext={`${battler.tier} TIER`}
            />
          </div>
        </div>

        {/* Badges Showcase */}
        <BadgeShowcase styleTags={battler.style_tags} badgeProgress={badgeProgress} />

        {/* Career Highlights */}
        <CareerHighlights rounds={careerRounds} ranking={ranking} />

        {/* Earnings */}
        <EarningsWidget battler={battler} leaguePayout={league?.base_payout} />

        {/* League Overview */}
        <LeagueOverview league={league} rating={ranking?.rating || 1000} />

        {/* Fan Stats Widget */}
        {fanData && (
          <div className="mb-8">
            <FanStatsWidget fanData={fanData} />
          </div>
        )}

        {/* Settings Link */}
        <div className="mb-8 flex justify-end">
          <GamingButton href="/settings/profile" variant="secondary" size="sm">
            ⚙️ SETTINGS
          </GamingButton>
        </div>

        {/* Stats Grid - All Attributes */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-4">
            💪 BATTLER ATTRIBUTES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Writing */}
            <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
              <h3 className="text-sm font-display font-black uppercase tracking-wider text-zinc-400 mb-4">✍️ WRITING</h3>
              <div className="space-y-3">
                <StatBar label="LYRICISM" value={attributes?.writing.lyricism} />
                <StatBar label="WORDPLAY" value={attributes?.writing.wordplay} />
                <StatBar label="CREATIVITY" value={attributes?.writing.creativity} />
                <StatBar label="FLOW" value={attributes?.writing.flow} />
              </div>
            </div>

            {/* Performance */}
            <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
              <h3 className="text-sm font-display font-black uppercase tracking-wider text-zinc-400 mb-4">🎭 PERFORMANCE</h3>
              <div className="space-y-3">
                <StatBar label="STAGE PRESENCE" value={attributes?.performance.stage_presence} />
                <StatBar label="CROWD CONTROL" value={attributes?.performance.crowd_control} />
                <StatBar label="DELIVERY" value={attributes?.performance.delivery} />
              </div>
            </div>

            {/* Personal */}
            <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
              <h3 className="text-sm font-display font-black uppercase tracking-wider text-zinc-400 mb-4">👤 PERSONAL</h3>
              <div className="space-y-3">
                <StatBar label="RESILIENCE" value={attributes?.resilience} />
                <StatBar label="REPUTATION" value={attributes?.personal.reputation} />
                <StatBar label="FINANCIAL" value={attributes?.personal.financial_stability} />
                <StatBar label="FAMILY BOND" value={attributes?.personal.family_bond} />
              </div>
            </div>

            {/* Mental State */}
            <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
              <h3 className="text-sm font-display font-black uppercase tracking-wider text-zinc-400 mb-4">🧠 MENTAL STATE</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-display font-display font-black uppercase text-xs tracking-wide">PUBLIC KNOWLEDGE</span>
                  <span className="font-display font-black text-[#ff8c42]">{attributes?.public_knowledge}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-display font-display font-black uppercase text-xs tracking-wide">PREPARATION</span>
                  <span className="font-display font-black text-blue-500">{attributes?.preparation || 0}/10</span>
                </div>
                <div className="pt-2 border-t-2 border-[#3a3d44]">
                  <StressIndicator
                    stress={attributes?.stress || 0}
                    daysSinceRest={0}
                    upcomingBattleDays={nextBattle ? Math.ceil((new Date(nextBattle.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null}
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Battle moved to top of dashboard */}

        {/* Career Stats Widget — defensive against missing ranking rows */}
        {ranking && (
          <CareerStatsWidget
            ranking={ranking}
            totalBattles={(ranking.wins ?? 0) + (ranking.losses ?? 0)}
          />
        )}

        {/* Pending Life Events Widget */}
        <PendingLifeEventsWidget initialEvents={pendingEvents} />

        {/* Active Beefs Widget */}
        <div className="mb-8 md:mb-12">
          <ActiveBeefsWidget battlerId={battler.id} />
        </div>

        {/* Battle Offers Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-4">
            📬 BATTLE OFFERS
          </h2>
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
            {offersCount > 0 ? (
              <>
                <div className="mb-6 text-center">
                  <div className="text-6xl font-display font-black text-[#ff8c42] mb-2">
                    {offersCount}
                  </div>
                  <p className="text-zinc-400 font-display font-display font-black uppercase tracking-wider">
                    PENDING {offersCount === 1 ? 'OFFER' : 'OFFERS'}
                  </p>
                </div>
                <GamingButton href="/battle/offers" variant="primary" size="lg" className="w-full">
                  📋 VIEW ALL OFFERS
                </GamingButton>
              </>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <div className="text-6xl mb-2">📪</div>
                  <p className="text-zinc-400 font-display font-display font-black uppercase tracking-wider">
                    NO OFFERS YET — PROMOTERS ARE WATCHING
                  </p>
                </div>
                <GamingButton href="/battle/offers" variant="secondary" size="lg" className="w-full">
                  📋 CHECK OFFERS
                </GamingButton>
              </>
            )}
          </div>
        </div>

        {/* Recent Battles */}
        {recentBattles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-4">
              🎬 RECENT BATTLES
            </h2>
            <div className="space-y-3">
              {recentBattles.map((battle: any) => {
                const isWinner = battle.winner_battler_id === battler.id;
                return (
                  <Link
                    key={battle.id}
                    href={`/battle/${battle.id}`}
                    className="block p-6 bg-[#2d2f35] border-2 border-[#3a3d44] hover:border-[#ff8c42] transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`px-4 py-2 text-sm font-display font-black uppercase tracking-wider ${
                              isWinner
                                ? 'bg-green-500/20 text-green-500 border-2 border-green-500/50'
                                : 'bg-red-500/20 text-red-500 border-2 border-red-500/50'
                            }`}
                          >
                            {isWinner
                              ? battle.verdict === '3-0'
                                ? '🔥 BODYBAG (3-0)'
                                : battle.verdict === '2-1'
                                ? '✅ WIN (2-1)'
                                : '✅ WIN'
                              : battle.verdict === '3-0'
                              ? "💀 BODY'D (0-3)"
                              : battle.verdict === '2-1'
                              ? '❌ LOSS (1-2)'
                              : '❌ LOSS'}
                          </span>
                          <span className="text-zinc-500 text-sm font-display font-display font-black uppercase tracking-wide">
                            {battle.league?.name}
                          </span>
                        </div>
                        <p className="text-2xl font-display font-black uppercase tracking-tighter text-zinc-100 mb-2">
                          VS {battle.ai_battler?.stage_name}
                        </p>
                        <p className="text-xs text-zinc-500 font-display font-display font-black uppercase tracking-wide">
                          {new Date(battle.scheduled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-[#ff8c42] text-sm font-display font-black uppercase tracking-wider">
                        VIEW →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Tournament Section */}
        {tournamentData && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42]">
                🏆 TOURNAMENT CAREER
              </h2>
              <GamingButton href="/tournaments/history" variant="secondary" size="sm">
                VIEW HISTORY →
              </GamingButton>
            </div>

            {/* Tournament Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <StatCard
                label="CHAMPIONSHIPS"
                value={tournamentData.stats.championships}
                icon="🏆"
                variant="highlight"
              />
              <StatCard
                label="TOURNAMENTS"
                value={tournamentData.stats.totalTournaments}
                icon="🎯"
              />
              <StatCard
                label="PRIZE MONEY"
                value={`$${parseFloat(tournamentData.stats.totalPrizeEarned).toLocaleString()}`}
                icon="💰"
              />
            </div>

            {/* Recent Tournaments */}
            {tournamentData.tournaments && tournamentData.tournaments.length > 0 && (
              <div className="space-y-3">
                {tournamentData.tournaments.slice(0, 2).map((tournament: any) => (
                  <Link
                    key={tournament.id}
                    href={`/tournaments/${tournament.id}`}
                    className="block p-6 bg-[#2d2f35] border-2 border-[#3a3d44] hover:border-[#ff8c42] transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-display font-black text-zinc-100 mb-2">
                          {tournament.name}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-500 font-display font-display font-black uppercase">
                          <span>{tournament.league}</span>
                          {tournament.final_placement && (
                            <>
                              <span>•</span>
                              <span
                                className={
                                  tournament.final_placement === 'winner'
                                    ? 'text-yellow-400'
                                    : tournament.final_placement === 'runner_up'
                                    ? 'text-gray-400'
                                    : 'text-zinc-400'
                                }
                              >
                                {tournament.final_placement === 'winner'
                                  ? '🏆 CHAMPION'
                                  : tournament.final_placement === 'runner_up'
                                  ? 'RUNNER-UP'
                                  : tournament.final_placement.toUpperCase()}
                              </span>
                            </>
                          )}
                          {tournament.prize_amount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-green-500">
                                ${parseFloat(tournament.prize_amount).toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-[#ff8c42] text-sm font-display font-black uppercase tracking-wider">
                        VIEW →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* No tournaments message */}
            {(!tournamentData.tournaments || tournamentData.tournaments.length === 0) && (
              <div className="text-center py-8 bg-[#2d2f35] border-2 border-[#3a3d44]">
                <p className="text-zinc-500 text-sm font-display font-display font-black uppercase mb-4">
                  NO TOURNAMENT HISTORY YET
                </p>
                <GamingButton href="/tournaments" variant="primary" size="md">
                  BROWSE TOURNAMENTS
                </GamingButton>
              </div>
            )}
          </div>
        )}

        {/* Recent Headlines */}
        {recentNews.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42]">
                📰 RECENT HEADLINES
              </h2>
              <GamingButton href="/media" variant="secondary" size="sm">
                ALL NEWS →
              </GamingButton>
            </div>
            <div className="space-y-2">
              {recentNews.map((article) => (
                <Link
                  key={article.id}
                  href={`/media/${article.slug}`}
                  className="block p-4 bg-[#2d2f35] border-2 border-[#3a3d44] hover:border-[#ff8c42] transition"
                >
                  <p className="text-sm text-zinc-100 font-display font-bold mb-1 line-clamp-1">
                    {article.title}
                  </p>
                  <p className="text-xs text-zinc-500 font-display font-display font-black uppercase">
                    {new Date(article.published_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-zinc-400 font-display font-display font-black uppercase text-xs tracking-wider">{label}</span>
        <span className="font-display font-black text-[#ff8c42]">{value}/10</span>
      </div>
      <div className="h-2 bg-[#18191c] border-2 border-[#3a3d44]">
        <div
          className="h-full bg-gradient-to-r from-[#ff8c42] to-[#ffb366]"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}
