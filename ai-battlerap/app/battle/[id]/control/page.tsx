'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BattleWithDetails, ScoringContext, PrepBlock } from '@/lib/models';
import { toast } from '@/components/ui/Toast';
import MatchupMasthead, { battleFace } from '@/components/battle/MatchupMasthead';
import Icon from '@/components/ui/Icon';

// The ROOM is booked by the league (venue system) — the player doesn't pick
// it anymore (owner: "how am I picking the room? is this a practice mode?").
// Scoring context derives from the room itself.
const CONTEXT_LABEL: Record<ScoringContext, string> = {
  in_building: 'IN BUILDING — intimate room, every bar heard',
  ppv: 'BIG EVENT — cameras on, big-crowd energy',
  on_cam: 'ON CAM — recorded for the internet',
};

function deriveContext(battle: BattleWithDetails): ScoringContext {
  const tier = battle.venue?.venue_type?.tier;
  if (tier === 'virtual') return 'on_cam';
  if (battle.tv_broadcast || tier === 'large') return 'ppv';
  return 'in_building';
}

export default function BattleControlPage() {
  const router = useRouter();
  const params = useParams();
  const battleId = params.id as string;

  const [battle, setBattle] = useState<BattleWithDetails | null>(null);
  const [prepBlocks, setPrepBlocks] = useState<PrepBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<'locked_in' | 'auto' | null>(null);

  useEffect(() => {
    fetchBattleData();
  }, [battleId]);

  const fetchBattleData = async () => {
    setLoading(true);
    try {
      const [battleRes, prepRes] = await Promise.all([
        fetch(`/api/battles/${battleId}`),
        fetch(`/api/battles/${battleId}/prep`),
      ]);

      const battleData = await battleRes.json();
      const prepData = await prepRes.json();

      setBattle(battleData.battle);
      setPrepBlocks(prepData.prepBlocks || []);
    } catch (error) {
      console.error('Error fetching battle data:', error);
    }
    setLoading(false);
  };

  const handleLockIn = async (mode: 'locked_in' | 'auto') => {
    if (!battle || submitting) return;

    setSubmitting(mode);
    try {
      const response = await fetch(`/api/battles/${battleId}/lock-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lockedIn: mode === 'locked_in',
          context: deriveContext(battle),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (mode === 'locked_in') {
          router.push(`/battle/${battleId}/round/1/select`);
        } else {
          // Auto mode simulates inside the lock-in call. The player saw none of
          // the fight, so land them on the tape (?watch=1), not the spoiler.
          router.push(`/battle/${battleId}?watch=1`);
        }
        return;
      }

      toast(data.error || 'Failed to lock in mode', 'error');
      setSubmitting(null);
    } catch (error) {
      console.error('Error locking in mode:', error);
      toast('Failed to lock in mode', 'error');
      setSubmitting(null);
    }
  };

  // Calculate prep summary
  const prepSummary = prepBlocks.reduce(
    (acc, block) => {
      acc[block.focus] = (acc[block.focus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const totalPrepDays = prepBlocks.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-zinc-400 font-display font-black uppercase tracking-wider">Loading battle...</div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-zinc-400 font-display font-black uppercase tracking-wider">Battle not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Header */}
      <div className="bg-[#2d2f35] border-b-2 border-[#3a3d44]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <Link
            href={`/battle/${battleId}/prep`}
            className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm font-display font-black uppercase tracking-wider"
          >
            ← BACK TO PREP
          </Link>
          <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter mt-3">
            BATTLE NIGHT
          </h1>
          <p className="text-zinc-400 text-sm mt-1 font-display font-bold uppercase tracking-wider">
            VS {battle.ai_battler?.stage_name} • {battle.league?.name}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Battle-night masthead — the corners, before you pick the room */}
        <div className="bg-[#101114] border-2 border-[#3a3d44] p-5 md:p-7 mb-6">
          <MatchupMasthead
            a={{
              id: battle.player_battler?.id,
              name: battle.player_battler?.stage_name || 'YOU',
              portrait: battleFace(battle.player_battler),
              tier: battle.player_battler?.tier,
            }}
            b={{
              id: battle.ai_battler?.id,
              name: battle.ai_battler?.stage_name || 'OPPONENT',
              portrait: battleFace(battle.ai_battler),
              tier: battle.ai_battler?.tier,
            }}
            subLine={`${(battle.league?.name || '').toUpperCase()} · ${battle.league?.round_length_minutes}-MIN ROUNDS`}
          />
          {/* Camp readout */}
          <div className="fs mt-5 bg-[#17181C] border-2 border-black px-5 py-4">
            <p className="font-mono text-[11px] text-zinc-500 uppercase tracking-[0.3em] mb-2.5">
              ◤ THE PREP YOU BANKED
            </p>
            <div className="flex gap-5 flex-wrap">
              {(['research', 'writing', 'performance', 'life', 'rest'] as const).map((focus) => (
                <div key={focus} className="text-center">
                  <div
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: 16,
                      color: prepSummary[focus] ? '#E7B23C' : '#3E404A',
                      textShadow: '2px 2px 0 #000',
                    }}
                  >
                    {prepSummary[focus] || 0}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-display font-bold uppercase tracking-wider mt-1">
                    {focus === 'writing' ? 'write' : focus === 'performance' ? 'rehearse' : focus}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {totalPrepDays === 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/50 text-red-400 font-display font-black uppercase tracking-wider text-sm flex items-center gap-2">
            <Icon name="warning" size={16} />
            NO PREP BANKED — YOU'RE WALKING IN COLD. THE CHOKE RISK IS ALL YOURS.
          </div>
        )}

        {/* TONIGHT'S CARD — the league booked the room; this is the flyer */}
        <div className="fs bg-[#101114] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] mb-8 overflow-hidden">
          {(() => {
            const art =
              battle.venue?.venue_type?.sprite_key ??
              (battle.venue?.venue_type?.tier
                ? `/sprites/venues/${battle.venue.venue_type.tier === 'virtual' ? 'home-studio' : battle.venue.venue_type.tier === 'large' ? 'grand-theater' : battle.venue.venue_type.tier === 'medium' ? 'small-bar' : 'basement'}.png`
                : null);
            return (
              <>
                {art && (
                  <div className="relative h-36">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101114] via-transparent to-transparent" />
                    {battle.tv_broadcast && (
                      <span className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-[#E23A2E] border border-black">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 10 }} className="text-white">
                          NATIONAL TV
                        </span>
                      </span>
                    )}
                  </div>
                )}
                <div className="px-5 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
                    Tonight&apos;s card
                  </p>
                  <p style={{ fontFamily: 'var(--font-poster)', fontSize: 24 }} className="text-zinc-100 uppercase mt-0.5">
                    LIVE FROM {(battle.venue?.name ?? 'THE ROOM').toUpperCase()}
                  </p>
                  <p className="font-mono text-[12px] uppercase tracking-wider text-zinc-400 mt-1">
                    {CONTEXT_LABEL[deriveContext(battle)]}
                  </p>
                </div>
              </>
            );
          })()}
        </div>

        {/* Mode Selection */}
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-4 text-center">
          HOW DO YOU WANT IT?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Locked In Mode */}
          <div className="bg-[#2d2f35] border-2 border-[#ff8c42] p-8 flex flex-col">
            <div className="text-center mb-6">
              <Icon name="target" size={36} className="text-[#ff8c42] mb-3" />
              <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-2">LOCKED IN</h3>
              <p className="text-sm text-zinc-400 font-display font-bold uppercase tracking-wide">
                Put your three rounds on paper, then take the stage
              </p>
            </div>

            <ul className="text-xs text-zinc-400 font-display font-bold uppercase tracking-wide space-y-2 mb-6 flex-1">
              <li className="flex gap-2"><Icon name="check" size={14} className="text-[#ff8c42]" /> Write all three rounds before the first bar</li>
              <li className="flex gap-2"><Icon name="check" size={14} className="text-[#ff8c42]" /> Between rounds: pressure moves + live audibles</li>
              <li className="flex gap-2"><Icon name="check" size={14} className="text-[#ff8c42]" /> Maximum control, maximum stakes</li>
            </ul>

            <button
              onClick={() => handleLockIn('locked_in')}
              disabled={!!submitting}
              className="w-full py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting === 'locked_in' ? 'TAKING THE STAGE...' : 'GO LOCKED IN'}
            </button>
          </div>

          {/* Auto Mode */}
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8 flex flex-col">
            <div className="text-center mb-6">
              <Icon name="bolt" size={36} className="text-zinc-300 mb-3" />
              <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-2">AUTO</h3>
              <p className="text-sm text-zinc-400 font-display font-bold uppercase tracking-wide">
                Trust your prep — your banked days and badges call the shots
              </p>
            </div>

            <ul className="text-xs text-zinc-400 font-display font-bold uppercase tracking-wide space-y-2 mb-6 flex-1">
              <li className="flex gap-2"><Icon name="check" size={14} className="text-zinc-300" /> Instant full-battle results</li>
              <li className="flex gap-2"><Icon name="check" size={14} className="text-zinc-300" /> Selections optimized from your style</li>
              <li className="flex gap-2"><Icon name="check" size={14} className="text-zinc-300" /> Same payouts, press, and progression</li>
            </ul>

            <button
              onClick={() => handleLockIn('auto')}
              disabled={!!submitting}
              className="w-full py-3 bg-[#18191c] border-2 border-[#3a3d44] hover:border-zinc-500 text-zinc-200 font-display font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting === 'auto' ? 'RUNNING THE BATTLE...' : 'GO AUTO'}
            </button>
          </div>
        </div>

        <p className="mt-8 text-xs text-zinc-500 font-display font-bold uppercase tracking-wider text-center">
          Either way the battle counts — rating, purse, press, and progression all ride on tonight.
        </p>
      </div>
    </div>
  );
}
