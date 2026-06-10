'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import GamingButton from '@/components/ui/GamingButton';
import StatCard from '@/components/ui/StatCard';
import ScoutingReport from '@/components/battle/ScoutingReport';
import { toast } from '@/components/ui/Toast';

type PrepBlock = {
  id: string;
  day_index: number;
  focus: 'research' | 'writing' | 'performance' | 'life' | 'rest';
  auto_generated: boolean;
};

type PvpState = {
  mySide: 'challenger' | 'challenged';
  myLockedAt: string | null;
  opponentLockedAt: string | null;
};

type Battle = {
  id: string;
  scheduled_at: string;
  lock_prep_at: string;
  status: string;
  league: {
    name: string;
    round_length_minutes: number;
  };
  ai_battler: {
    stage_name: string;
    tier: string;
    avatar_url?: string | null;
  };
};

const FOCUS_OPTIONS = [
  { value: 'research', label: 'RESEARCH', icon: '🔬', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50', hoverColor: 'hover:border-purple-400', description: 'Angles + unlock scouting intel' },
  { value: 'writing', label: 'WRITING', icon: '📝', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', hoverColor: 'hover:border-blue-400', description: 'Bars & wordplay' },
  { value: 'performance', label: 'PERFORMANCE', icon: '🎤', color: 'bg-green-500/20 text-green-400 border-green-500/50', hoverColor: 'hover:border-green-400', description: 'Delivery & presence' },
  { value: 'life', label: 'LIFE', icon: '🏠', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', hoverColor: 'hover:border-yellow-400', description: 'Handle personal' },
  { value: 'rest', label: 'REST', icon: '😴', color: 'bg-zinc-700/50 text-zinc-400 border-zinc-600', hoverColor: 'hover:border-zinc-500', description: 'Recover & reset' },
];

export default function PrepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [prepBlocks, setPrepBlocks] = useState<PrepBlock[]>([]);
  const [totalPrepDays, setTotalPrepDays] = useState(0);
  const [lockPrepAt, setLockPrepAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [allDaysSelected, setAllDaysSelected] = useState(false);
  // Bumped after every prep save so the scouting report refetches live
  const [scoutRefresh, setScoutRefresh] = useState(0);
  // PvP lock-in state (null for AI battles)
  const [pvp, setPvp] = useState<PvpState | null>(null);
  const [lockingIn, setLockingIn] = useState(false);

  useEffect(() => {
    fetchPrepData();
  }, [id]);

  useEffect(() => {
    // Check if all days have a focus selected
    if (totalPrepDays > 0 && prepBlocks.length === totalPrepDays) {
      const allSelected = prepBlocks.every(block => block.focus !== null);
      setAllDaysSelected(allSelected);
    }
  }, [prepBlocks, totalPrepDays]);

  const fetchPrepData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/battles/${id}/prep`);
      const data = await response.json();

      if (response.ok) {
        setBattle(data.battle);
        setPrepBlocks(data.prepBlocks);
        setTotalPrepDays(data.totalPrepDays);
        setLockPrepAt(data.lockPrepAt);
        setPvp(data.pvp || null);
      } else {
        toast(data.error || 'Failed to load prep data', 'error');
      }
    } catch (error) {
      console.error('Error fetching prep data:', error);
      toast('Failed to load prep data', 'error');
    }
    setLoading(false);
  };

  const handleFocusChange = async (dayIndex: number, focus: string) => {
    setUpdating(dayIndex);
    try {
      const response = await fetch(`/api/battles/${id}/prep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_index: dayIndex, focus }),
      });

      if (response.ok) {
        await fetchPrepData();
        setScoutRefresh((n) => n + 1);
      } else {
        const data = await response.json();
        toast(data.error || 'Failed to update prep', 'error');
      }
    } catch (error) {
      console.error('Error updating prep:', error);
      toast('Failed to update prep', 'error');
    }
    setUpdating(null);
  };

  const getFocusForDay = (dayIndex: number): string => {
    const block = prepBlocks.find((b) => b.day_index === dayIndex);
    return block?.focus || '';
  };

  const handleLockIn = async () => {
    setLockingIn(true);
    try {
      const response = await fetch(`/api/battles/${id}/lockin`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        toast(data.error || 'Failed to lock in', 'error');
      } else if (data.simulated) {
        toast('Both sides locked in — battle ran!', 'success');
        router.push(`/battle/${id}`);
        return;
      } else {
        setPvp((prev) =>
          prev ? { ...prev, myLockedAt: data.lockedAt || new Date().toISOString() } : prev
        );
        toast('Locked in! Waiting on your opponent.', 'success');
      }
    } catch (error) {
      console.error('Error locking in:', error);
      toast('Failed to lock in', 'error');
    }
    setLockingIn(false);
  };

  const isLocked =
    (lockPrepAt && new Date() >= new Date(lockPrepAt)) || Boolean(pvp?.myLockedAt);

  const getDaysUntilBattle = () => {
    const now = new Date();
    const battleDate = new Date(battle?.scheduled_at || '');
    const diffTime = battleDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-zinc-400 font-display font-display font-black uppercase tracking-wider">Loading prep...</div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-red-500 font-display font-display font-black uppercase tracking-wider">Battle not found</div>
      </div>
    );
  }

  const daysArray = Array.from({ length: totalPrepDays }, (_, i) => i + 1);
  const daysUntilBattle = getDaysUntilBattle();

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#2d2f35]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <Link href="/dashboard" className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm font-display font-display font-black uppercase tracking-wider min-h-[44px] inline-flex items-center transition">
            ← DASHBOARD
          </Link>
          <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter mt-3">BATTLE PREP</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Battle Info Header with Opponent Sprite */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Opponent Sprite */}
            <div className="flex-shrink-0">
              <Avatar url={battle.ai_battler.avatar_url} size={120} alt={battle.ai_battler.stage_name} />
            </div>

            {/* Battle Details */}
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight mb-3">
                VS {battle.ai_battler.stage_name}
              </h2>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="px-4 py-2 bg-[#18191c] border-2 border-[#3a3d44]">
                  <span className="text-xs text-zinc-500 font-display font-display font-black uppercase tracking-wider block mb-1">LEAGUE</span>
                  <span className="text-sm text-[#ff8c42] font-display font-black uppercase">{battle.league.name}</span>
                </div>
                <div className="px-4 py-2 bg-[#18191c] border-2 border-[#3a3d44]">
                  <span className="text-xs text-zinc-500 font-display font-display font-black uppercase tracking-wider block mb-1">FORMAT</span>
                  <span className="text-sm text-[#ff8c42] font-display font-black uppercase">{battle.league.round_length_minutes} MIN ROUNDS</span>
                </div>
                <div className="px-4 py-2 bg-[#18191c] border-2 border-[#3a3d44]">
                  <span className="text-xs text-zinc-500 font-display font-display font-black uppercase tracking-wider block mb-1">TIER</span>
                  <span className="text-sm text-[#ff8c42] font-display font-black uppercase">{battle.ai_battler.tier}</span>
                </div>
              </div>
            </div>

            {/* Battle Countdown */}
            <div className="flex-shrink-0 text-center md:text-right bg-[#18191c] border-2 border-[#3a3d44] p-6">
              <p className="text-xs text-zinc-500 font-display font-display font-black uppercase tracking-wider mb-2">BATTLE IN</p>
              <p className="text-4xl font-display font-black text-[#ff8c42] mb-1">{daysUntilBattle}</p>
              <p className="text-sm text-zinc-400 font-display font-display font-black uppercase">DAYS</p>
              <div className="mt-4 pt-4 border-t-2 border-[#3a3d44]">
                <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">PREP LOCKS</p>
                <p className="text-xs font-display font-bold text-zinc-400">{new Date(lockPrepAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {isLocked && (
            <div className="mt-6 p-4 bg-red-500/10 text-red-500 border-2 border-red-500/50 font-display font-black uppercase tracking-wider text-sm">
              ⚠️ PREP LOCKED • NO CHANGES ALLOWED
            </div>
          )}

          {/* Promotion Link */}
          {!isLocked && (
            <div className="mt-6 p-4 bg-[#ff8c42]/10 border-2 border-[#ff8c42]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-display font-black uppercase tracking-wider text-[#ff8c42] mb-1">
                  🎯 PRE-BATTLE PROMOTION
                </h4>
                <p className="text-xs text-zinc-500 font-display font-display font-black uppercase tracking-wide">
                  Sway the crowd before the battle • Attack credibility • Build hype
                </p>
              </div>
              <GamingButton href={`/battle/${battle.id}/promotion`} size="md">
                PROMOTE →
              </GamingButton>
            </div>
          )}
        </div>

        {/* PvP Lock-In Panel */}
        {pvp && ['accepted', 'locked'].includes(battle.status) && (
          <div className="bg-[#2d2f35] border-2 border-[#ff8c42]/50 p-6 md:p-8 mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-[#ff8c42] text-black font-display font-black uppercase text-xs tracking-wider">
                👤 PLAYER BATTLE
              </span>
              <h3 className="font-display font-black text-lg uppercase tracking-wider text-zinc-300">
                ASYNC CHALLENGE
              </h3>
            </div>
            {!pvp.myLockedAt ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-sm text-zinc-400 font-display font-black uppercase tracking-wide">
                  Your opponent preps on their own time. Lock in when your prep is set — the
                  battle runs the moment you both do.
                </p>
                <GamingButton
                  onClick={handleLockIn}
                  disabled={lockingIn}
                  variant="primary"
                  size="lg"
                  className="flex-shrink-0"
                >
                  {lockingIn ? 'LOCKING IN...' : '🔒 LOCK IN — READY TO BATTLE'}
                </GamingButton>
              </div>
            ) : (
              <div className="p-4 bg-[#ff8c42]/10 border-2 border-[#ff8c42]/30 font-display font-black uppercase tracking-wider text-sm text-[#ff8c42]">
                🔒 LOCKED IN — WAITING ON OPPONENT • SIMS AUTOMATICALLY{' '}
                {new Date(battle.scheduled_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}{' '}
                IF THEY GHOST
              </div>
            )}
          </div>
        )}

        {/* Focus Legend */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6 md:p-8 mb-6 md:mb-8">
          <h3 className="font-display font-black text-lg uppercase tracking-wider text-zinc-400 mb-6">PREP FOCUS OPTIONS</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {FOCUS_OPTIONS.map((option) => (
              <div key={option.value} className="text-center">
                <div className={`px-4 py-3 border-2 ${option.color} font-display font-black text-sm uppercase tracking-wider mb-2 transition flex items-center justify-center gap-2`}>
                  <span className="text-xl">{option.icon}</span>
                  <span>{option.label}</span>
                </div>
                <p className="text-xs text-zinc-600 uppercase tracking-wide">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scouting Report — research days unlock opponent intel */}
        <ScoutingReport battleId={id} refreshKey={scoutRefresh} />

        {/* Prep Calendar */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
            <h3 className="font-display font-black text-xl uppercase tracking-wider text-zinc-300">PREP SCHEDULE ({totalPrepDays} DAYS)</h3>
            {!allDaysSelected && !isLocked && (
              <span className="text-sm text-[#ff8c42] font-display font-black uppercase tracking-wider animate-pulse">
                ⚠️ SELECT ALL DAYS TO CONTINUE
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {daysArray.map((dayIndex) => {
              const currentFocus = getFocusForDay(dayIndex);
              const focusOption = FOCUS_OPTIONS.find((o) => o.value === currentFocus);

              return (
                <div
                  key={dayIndex}
                  className={`border-2 ${
                    currentFocus ? 'border-[#ff8c42] bg-[#ff8c42]/5' : 'border-[#3a3d44] bg-[#18191c]'
                  } p-4 transition-all hover:border-[#ff8c42]/50`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display font-black text-sm uppercase tracking-wider text-zinc-400">
                      DAY {dayIndex}
                    </h4>
                    {updating === dayIndex && (
                      <span className="text-xs text-[#ff8c42] font-display font-display font-black uppercase animate-pulse">SAVING...</span>
                    )}
                  </div>

                  {focusOption && (
                    <div className={`mb-3 px-3 py-2 border-2 ${focusOption.color} font-display font-black text-center`}>
                      <span className="text-2xl block mb-1">{focusOption.icon}</span>
                      <span className="text-xs uppercase">{focusOption.label}</span>
                    </div>
                  )}

                  <select
                    value={currentFocus}
                    onChange={(e) => handleFocusChange(dayIndex, e.target.value)}
                    disabled={isLocked || updating === dayIndex}
                    className="w-full px-3 py-3 min-h-[44px] bg-[#18191c] border-2 border-[#3a3d44] text-zinc-100 text-sm font-display font-display font-black uppercase tracking-wide focus:border-[#ff8c42] focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <option value="">SELECT FOCUS...</option>
                    {FOCUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>

                  {focusOption && (
                    <div className="mt-3 text-xs text-zinc-500 uppercase tracking-wide text-center">
                      {focusOption.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Prep Summary */}
          <div className="mt-8 pt-8 border-t-2 border-[#3a3d44]">
            <h4 className="font-display font-black uppercase tracking-wider text-zinc-400 mb-6 text-lg">PREP DISTRIBUTION</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {FOCUS_OPTIONS.map((option) => {
                const count = prepBlocks.filter((b) => b.focus === option.value).length;
                return (
                  <StatCard
                    key={option.value}
                    icon={option.icon}
                    label={option.label}
                    value={count}
                    subtext="DAYS"
                    variant={count > 0 ? 'highlight' : 'default'}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <GamingButton href="/dashboard" variant="secondary" size="lg" className="flex-1">
            ← BACK TO DASHBOARD
          </GamingButton>
          {allDaysSelected && !isLocked && (
            <GamingButton
              onClick={() => {
                toast(`Prep saved! Your battle will simulate on ${new Date(battle.scheduled_at).toLocaleDateString()}.`, 'success');
                router.push('/dashboard');
              }}
              variant="primary"
              size="lg"
              className="flex-1"
            >
              ✓ SAVE & RETURN
            </GamingButton>
          )}
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6 font-display font-display font-black uppercase tracking-wider">
          Changes auto-save • Battle simulates on {new Date(battle.scheduled_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
