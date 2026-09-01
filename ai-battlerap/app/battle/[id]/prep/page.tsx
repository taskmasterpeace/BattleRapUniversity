'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import GamingButton from '@/components/ui/GamingButton';
import Icon from '@/components/ui/Icon';
import StatCard from '@/components/ui/StatCard';
import ScoutingReport from '@/components/battle/ScoutingReport';
import FightProjection from '@/components/battle/FightProjection';
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

type ProjectionContext = {
  preparation: number;
  resilience: number;
  familyBond: number;
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

// Brand palette only — warm hues + neutrals. No purple, no stray blue.
const FOCUS_OPTIONS = [
  { value: 'research', label: 'RESEARCH', icon: 'search' as const, color: 'bg-amber-500/15 text-amber-400 border-amber-500/60', chipBg: 'bg-amber-500/25 border-amber-400', description: 'Dig into their life — find a facet, own an ANGLE (+peak shot)' },
  { value: 'writing', label: 'WRITE', icon: 'pen' as const, color: 'bg-[#ff8c42]/15 text-[#ff8c42] border-[#ff8c42]/60', chipBg: 'bg-[#ff8c42]/25 border-[#ff8c42]', description: 'Pen + memorize the rounds — cuts choke risk' },
  { value: 'performance', label: 'REHEARSE', icon: 'stage' as const, color: 'bg-red-500/15 text-red-400 border-red-500/60', chipBg: 'bg-red-500/25 border-red-400', description: 'Practice the delivery — cuts stumbles' },
  { value: 'life', label: 'LIFE', icon: 'home' as const, color: 'bg-green-500/15 text-green-400 border-green-500/60', chipBg: 'bg-green-500/25 border-green-400', description: 'Handle business at home' },
  { value: 'rest', label: 'REST', icon: 'rest' as const, color: 'bg-zinc-700/50 text-zinc-400 border-zinc-500', chipBg: 'bg-zinc-600/40 border-zinc-400', description: 'Reset — walk in lighter' },
];

export default function PrepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [prepBlocks, setPrepBlocks] = useState<PrepBlock[]>([]);
  const [totalPrepDays, setTotalPrepDays] = useState(0);
  const [lockPrepAt, setLockPrepAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [allDaysSelected, setAllDaysSelected] = useState(false);
  // Bumped after every confirmed research-day change so the scouting report
  // refetches live (its tier is computed server-side from saved prep blocks)
  const [scoutRefresh, setScoutRefresh] = useState(0);
  // Attributes context for the live fight projection
  const [projectionCtx, setProjectionCtx] = useState<ProjectionContext>({
    preparation: 5,
    resilience: 5,
    familyBond: 5,
  });
  // PvP lock-in state (null for AI battles)
  const [pvp, setPvp] = useState<PvpState | null>(null);
  const [lockingIn, setLockingIn] = useState(false);
  // The "brush": pick a focus once, then paint it across day chips.
  const [brush, setBrush] = useState<PrepBlock['focus']>('writing');

  // --- Optimistic save machinery ----------------------------------------
  // The UI updates instantly on selection; saves run in the background with
  // latest-wins semantics per day. Only failures surface (toast + revert).
  // savedFocusRef holds the last server-confirmed focus per day for reverts.
  const savedFocusRef = useRef<Map<number, string>>(new Map());
  // pendingRef holds the latest desired focus per day + whether a request is
  // currently in flight for that day (so rapid re-selections coalesce into
  // one trailing request instead of racing).
  const pendingRef = useRef<Map<number, { desired: string; inFlight: boolean }>>(new Map());

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
        if (data.projectionContext) setProjectionCtx(data.projectionContext);
        // Seed the revert map with server-confirmed selections
        const saved = new Map<number, string>();
        for (const block of data.prepBlocks as PrepBlock[]) {
          if (block.focus) saved.set(block.day_index, block.focus);
        }
        savedFocusRef.current = saved;
      } else {
        toast(data.error || 'Failed to load prep data', 'error');
      }
    } catch (error) {
      console.error('Error fetching prep data:', error);
      toast('Failed to load prep data', 'error');
    }
    setLoading(false);
  };

  /** Apply a focus to local state immediately (the optimistic update). */
  const applyLocalFocus = (dayIndex: number, focus: PrepBlock['focus']) => {
    setPrepBlocks((prev) => {
      const existing = prev.find((b) => b.day_index === dayIndex);
      if (existing) {
        return prev.map((b) => (b.day_index === dayIndex ? { ...b, focus } : b));
      }
      return [
        ...prev,
        { id: `local-${dayIndex}`, day_index: dayIndex, focus, auto_generated: false },
      ];
    });
  };

  /** Revert a day to its last server-confirmed focus (or unselected). */
  const revertLocalFocus = (dayIndex: number) => {
    const saved = savedFocusRef.current.get(dayIndex);
    if (saved) {
      applyLocalFocus(dayIndex, saved as PrepBlock['focus']);
    } else {
      setPrepBlocks((prev) => prev.filter((b) => b.day_index !== dayIndex));
    }
  };

  /**
   * Background save loop for one day. Latest-wins: if the player re-selects
   * while a request is in flight, the trailing value is saved when it lands.
   * Retries once on failure before reverting + surfacing a toast.
   */
  const flushDay = async (dayIndex: number) => {
    const entry = pendingRef.current.get(dayIndex);
    if (!entry || entry.inFlight) return;
    entry.inFlight = true;
    const focus = entry.desired;

    let ok = false;
    let serverError: string | null = null;
    for (let attempt = 0; attempt < 2 && !ok; attempt++) {
      try {
        const response = await fetch(`/api/battles/${id}/prep`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ day_index: dayIndex, focus }),
        });
        if (response.ok) {
          ok = true;
        } else {
          serverError = (await response.json().catch(() => null))?.error || null;
          // Validation/lock errors won't succeed on retry — bail immediately
          if (response.status === 400 || response.status === 403) break;
        }
      } catch {
        // Network hiccup — loop retries once
      }
    }

    entry.inFlight = false;

    if (!ok) {
      pendingRef.current.delete(dayIndex);
      revertLocalFocus(dayIndex);
      toast(serverError || `Day ${dayIndex} didn't save — reverted, try again`, 'error');
      return;
    }

    if (entry.desired !== focus) {
      // Player changed this day again mid-flight — save the newest value
      void flushDay(dayIndex);
      return;
    }

    pendingRef.current.delete(dayIndex);
    const wasResearch = savedFocusRef.current.get(dayIndex) === 'research';
    savedFocusRef.current.set(dayIndex, focus);
    // Scouting tiers are computed server-side from saved research days, so
    // only refetch when a confirmed save changes the research count.
    if (focus === 'research' || wasResearch) {
      setScoutRefresh((n) => n + 1);
    }
  };

  const handleFocusChange = (dayIndex: number, focus: string) => {
    if (!focus) return; // ignore re-selecting the placeholder
    // 1. Instant UI update — no spinners, no refetch, no blink
    applyLocalFocus(dayIndex, focus as PrepBlock['focus']);
    // 2. Queue the background save (latest-wins per day)
    const entry = pendingRef.current.get(dayIndex);
    if (entry) {
      entry.desired = focus;
    } else {
      pendingRef.current.set(dayIndex, { desired: focus, inFlight: false });
    }
    void flushDay(dayIndex);
  };

  const getFocusForDay = (dayIndex: number): string => {
    const block = prepBlocks.find((b) => b.day_index === dayIndex);
    return block?.focus || '';
  };

  /** Fill every unset day with a balanced camp: writing-led, research for
   * intel, performance reps, and a rest day to buffer the choke risk. */
  const handleAutoFill = () => {
    const balanced: PrepBlock['focus'][] = ['writing', 'research', 'performance', 'writing', 'rest'];
    let filled = 0;
    for (let day = 1; day <= totalPrepDays; day++) {
      if (!getFocusForDay(day)) {
        handleFocusChange(day, balanced[(day - 1) % balanced.length]);
        filled++;
      }
    }
    if (filled > 0) toast(`${filled} day${filled === 1 ? '' : 's'} planned — tune it or take the stage`, 'success');
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
            <div className="mt-6 p-4 bg-red-500/10 text-red-500 border-2 border-red-500/50 font-display font-black uppercase tracking-wider text-sm flex items-center gap-2">
              <Icon name="warning" size={16} /> PREP LOCKED • NO CHANGES ALLOWED
            </div>
          )}

          {/* Promotion Link */}
          {!isLocked && (
            <div className="mt-6 p-4 bg-[#ff8c42]/10 border-2 border-[#ff8c42]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-display font-black uppercase tracking-wider text-[#ff8c42] mb-1 flex items-center gap-2">
                  <Icon name="target" size={16} /> PRE-BATTLE PROMOTION
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
              <span className="px-3 py-1 bg-[#ff8c42] text-black font-display font-black uppercase text-xs tracking-wider inline-flex items-center gap-1.5">
                <Icon name="user" size={12} /> PLAYER BATTLE
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
                  {lockingIn ? 'LOCKING IN...' : 'LOCK IN — READY TO BATTLE'}
                </GamingButton>
              </div>
            ) : (
              <div className="p-4 bg-[#ff8c42]/10 border-2 border-[#ff8c42]/30 font-display font-black uppercase tracking-wider text-sm text-[#ff8c42]">
                <Icon name="check" size={14} className="mr-1.5 -mt-0.5" />
                LOCKED IN — WAITING ON OPPONENT • SIMS AUTOMATICALLY{' '}
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


        {/* Fight Projection — live, computed locally from real config constants */}
        <FightProjection
          counts={{
            research: prepBlocks.filter((b) => b.focus === 'research').length,
            writing: prepBlocks.filter((b) => b.focus === 'writing').length,
            performance: prepBlocks.filter((b) => b.focus === 'performance').length,
            life: prepBlocks.filter((b) => b.focus === 'life').length,
            rest: prepBlocks.filter((b) => b.focus === 'rest').length,
          }}
          totalPrepDays={totalPrepDays}
          roundLengthMinutes={battle.league.round_length_minutes}
          preparation={projectionCtx.preparation}
          resilience={projectionCtx.resilience}
          familyBond={projectionCtx.familyBond}
        />

        {/* Scouting Report — research days unlock opponent intel */}
        <ScoutingReport battleId={id} refreshKey={scoutRefresh} />

        {/* BATTLE PREP PIPELINE — how a battle actually gets built (research →
            write → memorize → practice), with the real mechanics under each
            phase. The calendar below paints days into these phases. */}
        <div className="bg-[#101114] border-2 border-[#3a3d44] p-5 md:p-6 mb-6 md:mb-8">
          <h3 className="font-display font-black text-sm uppercase tracking-[0.25em] text-zinc-500 mb-4">
            ◤ BATTLE PREP — HOW A BATTLE GETS BUILT
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {[
              {
                n: '01', name: 'RESEARCH', c: 'text-amber-400 border-amber-500/50',
                what: 'Study their tape. Unlocks scouting intel + sharpens your angles (creativity/lyricism spillover).',
                note: 'Some battlers skip this lane and pull from their own life instead — realness over research.',
                days: prepBlocks.filter((b) => b.focus === 'research').length,
              },
              {
                n: '02', name: 'WRITE', c: 'text-[#ff8c42] border-[#ff8c42]/50',
                what: 'Pen the rounds, then get them IN YOUR BODY. Boosts writing attributes and every written day cuts choke risk (memorization).',
                note: 'Walking in with nothing written is how chokes happen.',
                days: prepBlocks.filter((b) => b.focus === 'writing').length,
              },
              {
                n: '03', name: 'REHEARSE', c: 'text-red-400 border-red-500/50',
                what: 'Run-throughs. Boosts stage presence/delivery and cuts stumble risk — polish the performance.',
                note: 'REST relieves stress before battle night; LIFE keeps home steady.',
                days: prepBlocks.filter((b) => b.focus === 'performance').length,
              },
            ].map((p) => (
              <div key={p.n} className={`border-2 ${p.c.split(' ')[1]} bg-[#17181C] p-4 relative`}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className={`font-mono text-[11px] tracking-[0.3em] ${p.c.split(' ')[0]}`}>
                    {p.n} · {p.name}
                  </span>
                  <span className={`font-display font-black text-lg ${p.c.split(' ')[0]}`}>
                    {p.days}<span className="text-zinc-600 text-xs">d</span>
                  </span>
                </div>
                <p className="text-[13px] text-zinc-300 leading-snug">{p.what}</p>
                <p className="text-[12px] text-zinc-600 leading-snug mt-1.5 uppercase tracking-wide">{p.note}</p>
              </div>
            ))}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-600">
            RESEARCH → WRITE → MEMORIZE → PRACTICE — PAINT THE DAYS BELOW · REST {prepBlocks.filter((b) => b.focus === 'rest').length}d · LIFE {prepBlocks.filter((b) => b.focus === 'life').length}d
          </p>
        </div>

        {/* Prep Schedule — pick a focus, paint the days */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
            <h3 className="font-display font-black text-xl uppercase tracking-wider text-zinc-300">
              BATTLE PREP — {totalPrepDays} DAY{totalPrepDays === 1 ? '' : 'S'}
            </h3>
            {!isLocked && (
              <div className="flex gap-2">
                <button
                  onClick={handleAutoFill}
                  className="px-4 py-2 border-2 border-[#3a3d44] bg-[#18191c] text-zinc-300 hover:border-[#ff8c42] hover:text-[#ff8c42] font-display font-black text-xs uppercase tracking-wider transition"
                >
                  <Icon name="bolt" size={14} className="mr-1.5 -mt-0.5" />
                  AUTO-FILL REMAINING
                </button>
              </div>
            )}
          </div>

          {/* Focus palette — the brush */}
          {!isLocked && (
            <div className="mb-6">
              <p className="text-xs text-zinc-500 font-display font-black uppercase tracking-wider mb-3">
                1 · PICK A FOCUS
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {FOCUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setBrush(option.value as PrepBlock['focus'])}
                    className={`px-3 py-3 border-2 font-display font-black text-xs uppercase tracking-wider transition flex flex-col items-center gap-1.5 ${option.color} ${
                      brush === option.value
                        ? 'ring-2 ring-[#ff8c42] ring-offset-2 ring-offset-[#2d2f35]'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Icon name={option.icon} size={18} />
                    <span>{option.label}</span>
                    <span className="text-[12px] font-normal normal-case tracking-normal text-zinc-500">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day chips — the canvas */}
          <p className="text-xs text-zinc-500 font-display font-black uppercase tracking-wider mb-3">
            {isLocked ? 'THE PREP YOU RAN' : '2 · PAINT YOUR DAYS'}
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-2">
            {daysArray.map((dayIndex) => {
              const currentFocus = getFocusForDay(dayIndex);
              const focusOption = FOCUS_OPTIONS.find((o) => o.value === currentFocus);

              return (
                <button
                  key={dayIndex}
                  disabled={isLocked}
                  onClick={() => handleFocusChange(dayIndex, brush)}
                  title={focusOption ? `${focusOption.label} — click to set ${brush.toUpperCase()}` : `Set ${brush.toUpperCase()}`}
                  className={`aspect-square border-2 flex flex-col items-center justify-center gap-1 transition disabled:cursor-not-allowed ${
                    focusOption
                      ? focusOption.chipBg
                      : 'border-dashed border-[#3a3d44] bg-[#18191c] hover:border-[#ff8c42]/60'
                  }`}
                >
                  <span className="text-[12px] font-display font-black uppercase tracking-wider text-zinc-500">
                    DAY {dayIndex}
                  </span>
                  {focusOption ? (
                    <Icon name={focusOption.icon} size={20} className={focusOption.color.split(' ').find(c => c.startsWith('text-')) || 'text-zinc-300'} />
                  ) : (
                    <span className="text-zinc-600 text-lg leading-none">·</span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[13px] text-zinc-600 uppercase tracking-wider font-display font-bold mb-8">
            {!isLocked && (allDaysSelected
              ? 'Every day planned — full-camp bonus: +1 battle slot if you take the W'
              : 'Unplanned days become REST when the battle runs')}
          </p>

          {/* Prep Distribution */}
          <div className="pt-6 border-t-2 border-[#3a3d44]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {FOCUS_OPTIONS.map((option) => {
                const count = prepBlocks.filter((b) => b.focus === option.value).length;
                return (
                  <StatCard
                    key={option.value}
                    icon={<Icon name={option.icon} size={20} />}
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
          {!pvp && ['accepted', 'locked'].includes(battle.status) && (
            <GamingButton
              href={`/battle/${battle.id}/control`}
              variant="primary"
              size="lg"
              className="flex-1"
            >
              TAKE THE STAGE →
            </GamingButton>
          )}
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6 font-display font-display font-black uppercase tracking-wider">
          Changes auto-save • Ready when you are — or the card runs {new Date(battle.scheduled_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
