'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Battle, BattleWithDetails, BattleRound, BattleSegment } from '@/lib/models';
import { RoundResultsBreakdown } from '@/components/battle/RoundResultsBreakdown';
import { toast } from '@/components/ui/Toast';
import MatchupMasthead, { battleFace } from '@/components/battle/MatchupMasthead';
import CrowdStrip from '@/components/battle/CrowdStrip';
import { venueForLeague } from '@/lib/crowd-venue';
import { artForTier } from '@/lib/game/venueForLeague';

export default function RoundResultsPage() {
  const router = useRouter();
  const params = useParams();
  const battleId = params.id as string;
  const roundNum = parseInt(params.roundNum as string);

  const [battle, setBattle] = useState<BattleWithDetails | null>(null);
  const [playerRound, setPlayerRound] = useState<any>(null);
  const [aiRound, setAiRound] = useState<any>(null);
  const [playerSegments, setPlayerSegments] = useState<BattleSegment[]>([]);
  const [aiSegments, setAiSegments] = useState<BattleSegment[]>([]);
  const [lockedContent, setLockedContent] = useState<{
    content_types?: string[];
    delivery_types?: string[];
    performance_types?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [angles, setAngles] = useState<
    Array<{ researcher: string; researcherIsPlayer: boolean; target: string; facets: string[] }>
  >([]);
  const [pressureMove, setPressureMove] = useState<'none' | 'talk_over' | 'bump'>('none');
  // THE AUDIBLE — flip one written slot to adaptive content in the moment.
  const [audible, setAudible] = useState<'none' | 'rebuttals' | 'freestyles'>('none');
  const [bumpPrompt, setBumpPrompt] = useState(false);
  const [fightBroke, setFightBroke] = useState<null | { swungBy: string }>(null);
  const [pressureEvents, setPressureEvents] = useState<
    Array<{ by: 'player' | 'ai'; actor: string; move: string; outcome: string }>
  >([]);

  useEffect(() => {
    fetchRoundData();
  }, [battleId, roundNum]);

  const fetchRoundData = async () => {
    setLoading(true);
    try {
      const [battleRes, roundRes] = await Promise.all([
        fetch(`/api/battles/${battleId}`),
        fetch(`/api/battles/${battleId}/rounds/${roundNum}`),
      ]);

      const battleData = await battleRes.json();
      const roundData = await roundRes.json();

      setBattle(battleData.battle);

      if (roundData.playerRound) {
        setPlayerRound(roundData.playerRound);
        setAiRound(roundData.aiRound);
        setPlayerSegments(roundData.playerSegments || []);
        setAiSegments(roundData.aiSegments || []);
        setAngles(roundData.angles || []);
        setPressureEvents(roundData.pressureEvents || []);
      }
      // Pre-battle: the player's own locked content, echoed back so we can show
      // what they're walking in with on the "about to perform" screen.
      setLockedContent(roundData.playerContentSelection || null);
    } catch (error) {
      console.error('Error fetching round data:', error);
    }
    setLoading(false);
  };

  const handleSimulateRound = async (bumpResponse?: 'laugh_off' | 'bump_back' | 'swing') => {
    setSimulating(true);
    setBumpPrompt(false);
    try {
      const response = await fetch(`/api/battles/${battleId}/rounds/${roundNum}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pressureMove,
          bumpResponse,
          audible: audible === 'none' ? undefined : audible,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        // The opponent walked through your space — the room is waiting on YOU.
        if (data.needsResponse) {
          setBumpPrompt(true);
          setSimulating(false);
          return;
        }
        if (data.fightBroke) {
          setFightBroke({ swungBy: data.swungBy });
          setSimulating(false);
          return;
        }
        await fetchRoundData();
      } else {
        toast(data.error || 'Failed to simulate round', 'error');
      }
    } catch (error) {
      console.error('Error simulating round:', error);
      toast('Failed to simulate round', 'error');
    }
    setSimulating(false);
  };

  const handleNextRound = () => {
    if (roundNum < 3) {
      // Write-first flow: the next round is already on paper — go perform it.
      router.push(`/battle/${battleId}/round/${roundNum + 1}/results`);
    } else {
      // Battle is settled by the finalizer — straight to the full results page.
      router.push(`/battle/${battleId}`);
    }
  };

  const determineWinner = (): 'player' | 'ai' | 'tie' => {
    if (!playerRound || !aiRound) return 'tie';

    // The engine's verdict when persisted (finalizer sets `won` after R3);
    // until then, rounds are judged on average score — same rule the
    // finalizer applies. No invented tie thresholds.
    if (typeof playerRound.won === 'boolean' && typeof aiRound.won === 'boolean') {
      if (playerRound.won) return 'player';
      if (aiRound.won) return 'ai';
    }
    return playerRound.average_score >= aiRound.average_score ? 'player' : 'ai';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-zinc-400">Loading round results...</div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-zinc-400">Battle not found</div>
      </div>
    );
  }

  // Round not simulated yet — the "about to perform" beat. Lights-down moment:
  // show the matchup, echo the player's own locked cards (opponent's stay
  // hidden), then a big commit button. Matches the house battle-surface style.
  if (!playerRound || !aiRound) {
    const fmt = (s: string) => s.replace(/_/g, ' ');
    // Round 1 is different: nothing's been said IN the battle yet, so a round-1
    // rebuttal answers the PRE-BATTLE CALLOUT (the promo / press / grudge), not a
    // bar from last round. Rounds 2-3 flip what the opponent actually just said.
    const isRound1 = roundNum === 1;
    const lockedRows = lockedContent
      ? [
          { label: 'CONTENT', items: lockedContent.content_types },
          { label: 'DELIVERY', items: lockedContent.delivery_types },
          { label: 'PERFORMANCE', items: lockedContent.performance_types },
        ].filter((r) => r.items && r.items.length > 0)
      : [];

    return (
      <div className="min-h-screen bg-[#18191c]">
        {/* Header */}
        <div className="bg-[#101114] border-b-2 border-[#3a3d44]">
          <div className="max-w-7xl mx-auto px-4 py-5 md:py-6">
            <Link
              href="/dashboard"
              className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm font-display font-black uppercase tracking-wider"
            >
              ← Back to Dashboard
            </Link>
            <div className="mt-3 flex items-end gap-4 flex-wrap">
              <h1
                style={{ fontFamily: 'var(--font-poster)', fontSize: 'clamp(56px, 9vw, 96px)', lineHeight: 0.9 }}
                className="uppercase text-[#ff8c42]"
              >
                ROUND {roundNum}
              </h1>
              <div className="pb-2">
                <p className="text-zinc-100 text-lg md:text-xl font-display font-black uppercase tracking-wider">
                  {battle.player_battler?.stage_name} vs {battle.ai_battler?.stage_name}
                </p>
                <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-500 mt-0.5">
                  {battle.venue ? `LIVE FROM ${battle.venue.name.toUpperCase()} · ` : ''}
                  {battle.league?.name?.toUpperCase()}
                  {battle.tv_broadcast ? ' · NATIONAL TV' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
          {/* Matchup — the lights-down moment, faces big in their corners */}
          <div className="mb-10">
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
              subLine={battle.league?.name ? `${battle.league.name.toUpperCase()} · ROUND ${roundNum}` : `ROUND ${roundNum}`}
            />
          </div>

          {/* THE ROOM TONIGHT — you should see where you're battling (owner ask) */}
          {(() => {
            const art =
              battle.venue?.venue_type?.sprite_key ??
              (battle.venue?.venue_type?.tier ? artForTier(battle.venue.venue_type.tier) : null);
            return art ? (
              <div className="fs relative mb-8 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,.45)] overflow-hidden h-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ imageRendering: 'pixelated', filter: 'brightness(.75)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#101114]/90 via-transparent to-transparent" />
                <div className="absolute left-4 bottom-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">Tonight&apos;s room</p>
                  <p style={{ fontFamily: 'var(--font-poster)', fontSize: 20 }} className="text-zinc-100 uppercase">
                    {battle.venue?.name ?? 'The Room'}
                  </p>
                </div>
                {battle.tv_broadcast && (
                  <span className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-[#E23A2E] border border-black">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 9 }} className="text-white">NATIONAL TV</span>
                  </span>
                )}
              </div>
            ) : null;
          })()}

          {/* Legacy / edge: nothing written for this round yet — send them to the pen */}
          {lockedRows.length === 0 && (
            <div className="bg-[#2d2f35] border-2 border-[#ff8c42] p-6 mb-8 text-center">
              <p className="text-zinc-100 font-display font-black uppercase tracking-wider mb-2">
                Nothing on paper for round {roundNum}
              </p>
              <p className="text-[13px] text-zinc-400 font-display font-bold uppercase tracking-wide mb-4">
                You can&apos;t take the stage with empty pages.
              </p>
              <Link
                href={`/battle/${battleId}/round/${roundNum}/select`}
                className="inline-block px-8 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition-all"
              >
                WRITE ROUND {roundNum} →
              </Link>
            </div>
          )}

          {/* YOUR GAME PLAN — see the round you crafted, as an authored card,
              before you take it to the stage (owner: "I want to VISUALLY see
              what I put into a round"). */}
          {lockedRows.length > 0 && (
            <div
              className="fs bg-[#101114] border-2 border-black p-6 mb-8 shadow-[4px_4px_0_rgba(0,0,0,.45)]"
              style={{ borderTop: '4px solid #F5731A' }}
            >
              <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                <h2
                  className="uppercase text-[#ff8c42] leading-none"
                  style={{ fontFamily: 'var(--font-poster)', fontSize: 30, textShadow: '2px 2px 0 #000' }}
                >
                  Your Game Plan
                </h2>
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                  Round {roundNum} · as written
                </span>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-600 mb-5">
                The round you crafted — this is what you take to the stage
              </p>
              <div className="space-y-3">
                {lockedRows.map(({ label, items }) => {
                  const edge =
                    label === 'CONTENT' ? '#F5731A' : label === 'DELIVERY' ? '#E7B23C' : '#35C46B';
                  return (
                    <div
                      key={label}
                      className="bg-[#17181C] border-2 border-black p-4"
                      style={{ borderLeft: `5px solid ${edge}` }}
                    >
                      <div
                        className="font-mono text-[11px] uppercase tracking-[0.25em] mb-2.5"
                        style={{ color: edge }}
                      >
                        {label}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {items!.map((it, idx) => {
                          // The audible swaps the LAST content slot (see simulate route)
                          // — strike it so the player SEES which written bar he's flipping.
                          const flipping =
                            label === 'CONTENT' && audible !== 'none' && idx === items!.length - 1;
                          return (
                            <span
                              key={it}
                              className={`px-3 py-1.5 border-2 border-black uppercase shadow-[2px_2px_0_rgba(0,0,0,.35)] ${
                                flipping ? 'opacity-40 line-through' : ''
                              }`}
                              style={{
                                fontFamily: 'var(--font-poster)',
                                fontSize: 16,
                                background: '#0F0F12',
                                color: '#F4F4F6',
                              }}
                            >
                              {fmt(it)}
                            </span>
                          );
                        })}
                        {label === 'CONTENT' && audible !== 'none' && (
                          <span
                            className="px-3 py-1.5 border-2 uppercase shadow-[2px_2px_0_rgba(0,0,0,.35)]"
                            style={{
                              fontFamily: 'var(--font-poster)',
                              fontSize: 16,
                              background: 'rgba(231,178,60,.14)',
                              color: '#E7B23C',
                              borderColor: '#E7B23C',
                            }}
                          >
                            ⚡ {audible === 'rebuttals' ? 'REBUTTAL' : 'FREESTYLE'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t-2 border-black font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500">
                {battle.ai_battler?.stage_name}&apos;s cards stay hidden until the reveal.
              </div>
            </div>
          )}

          {/* THE AUDIBLE — flip one written slot to adaptive content, live */}
          {lockedRows.length > 0 && (
            <div className="fs bg-[#101114] border-2 border-black p-5 mb-8 shadow-[3px_3px_0_rgba(0,0,0,.4)]" style={{ borderTop: '3px solid #E7B23C' }}>
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500 mb-3">
                THE AUDIBLE · {isRound1 ? 'ANSWER THE CALLOUT' : 'CALL IT LIVE'}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { v: 'none', label: 'STICK TO THE PAPER', hint: 'Perform it as written' },
                    {
                      v: 'rebuttals',
                      label: 'REBUTTALS',
                      // Round 1: there's no "last round" to flip — you answer the build-up.
                      hint: isRound1
                        ? 'Answer the callout — flip the build-up back on them'
                        : 'Flip what they said last round',
                    },
                    {
                      v: 'freestyles',
                      label: 'FREESTYLE',
                      hint: isRound1
                        ? 'Off the top — read the room, not a script'
                        : 'Off the top — show it can’t be written',
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setAudible(opt.v)}
                    className={`p-3 border-2 text-left transition-all ${
                      audible === opt.v
                        ? 'border-[#E7B23C] bg-[#E7B23C]/10'
                        : 'border-[#3a3d44] hover:border-zinc-500'
                    }`}
                  >
                    <div className="font-display font-black uppercase tracking-wider text-sm text-zinc-100">
                      {opt.label}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-wide text-zinc-500 mt-1 leading-relaxed">
                      {opt.hint}
                    </div>
                  </button>
                ))}
              </div>
              {/* Round 1 build-up framing — makes the round-1 rebuttal coherent */}
              {isRound1 && (
                <p className="font-mono text-[10px] uppercase tracking-wide text-zinc-500 mt-3 leading-relaxed">
                  Round 1 — nothing&apos;s been said in the battle yet. A rebuttal here answers
                  THE CALLOUT: the promo, the press, the grudge that built this up.
                </p>
              )}
              {audible !== 'none' && (
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#E7B23C] mt-3">
                  ⚡ One written slot becomes {audible === 'rebuttals' ? 'A REBUTTAL' : 'A FREESTYLE'} this round
                  {isRound1 && audible === 'rebuttals' ? ' — aimed at the build-up' : ''}
                </p>
              )}
            </div>
          )}

          {/* PRESSURE MOVE — the physical chess match before the bars */}
          <div className="fs bg-[#101114] border-2 border-black p-5 mb-8 shadow-[3px_3px_0_rgba(0,0,0,.4)]" style={{ borderTop: '3px solid #E23A2E' }}>
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500 mb-3">
              PRESSURE MOVE · HOW YOU CARRY IT IN THE ROOM
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { v: 'none', label: 'STAY PRO', hint: 'Let the pen talk' },
                  { v: 'talk_over', label: 'TALK OVER', hint: 'Jaw at them mid-round — rattle or look thirsty' },
                  { v: 'bump', label: 'BUMP', hint: 'Walk through their space — they WILL answer' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setPressureMove(opt.v)}
                  className={`p-3 border-2 text-left transition-all ${
                    pressureMove === opt.v
                      ? 'border-[#E23A2E] bg-[#E23A2E]/10'
                      : 'border-[#3a3d44] hover:border-zinc-500'
                  }`}
                >
                  <div className="font-display font-black uppercase tracking-wider text-sm text-zinc-100">
                    {opt.label}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-zinc-500 mt-1 leading-relaxed">
                    {opt.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Perform it */}
          <button
            onClick={() => handleSimulateRound()}
            disabled={simulating || lockedRows.length === 0}
            className="w-full py-5 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-widest text-lg md:text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {simulating ? 'THE ROOM GOES QUIET…' : `PERFORM ROUND ${roundNum} →`}
          </button>
          <p className="text-center text-[13px] text-zinc-600 font-display font-bold uppercase tracking-widest mt-4">
            Once it's performed, there's no taking it back.
          </p>
        </div>

        {/* THE BUMP — they walked through YOUR space. The room is watching. */}
        {bumpPrompt && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <div className="fs max-w-lg w-full bg-[#101114] border-2 border-black p-8 shadow-[6px_6px_0_rgba(0,0,0,.6)]" style={{ borderTop: '4px solid #E23A2E' }}>
              <div
                className="uppercase text-[#E23A2E] leading-none mb-2"
                style={{ fontFamily: 'var(--font-poster)', fontSize: 34, textShadow: '2px 2px 0 #000' }}
              >
                {battle.ai_battler?.stage_name} BUMPED YOU
              </div>
              <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-zinc-400 mb-6">
                Walked straight through your space mid-setup. The whole room saw it. What are you doing?
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleSimulateRound('laugh_off')}
                  className="w-full p-4 border-2 border-[#35C46B]/60 hover:border-[#35C46B] bg-[#35C46B]/5 text-left transition-all"
                >
                  <div className="font-display font-black uppercase tracking-wider text-zinc-100">LAUGH IT OFF</div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-zinc-500 mt-1">
                    Composure wins the room — they look pressed, you look untouchable
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateRound('bump_back')}
                  className="w-full p-4 border-2 border-[#E7B23C]/60 hover:border-[#E7B23C] bg-[#E7B23C]/5 text-left transition-all"
                >
                  <div className="font-display font-black uppercase tracking-wider text-zinc-100">BUMP BACK</div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-zinc-500 mt-1">
                    Meet the energy — both of you tense up, and the room EATS IT UP
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateRound('swing')}
                  className="w-full p-4 border-2 border-[#E23A2E]/60 hover:border-[#E23A2E] bg-[#E23A2E]/5 text-left transition-all"
                >
                  <div className="font-display font-black uppercase tracking-wider text-[#E23A2E]">SWING</div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-zinc-500 mt-1">
                    Battle OVER. No contest. Your rep craters — leagues stop calling people who turn card nights into brawls
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IT GOT PHYSICAL — the battle is void */}
        {fightBroke && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="fs max-w-lg w-full bg-[#101114] border-2 border-black p-8 text-center shadow-[6px_6px_0_rgba(0,0,0,.6)]" style={{ borderTop: '4px solid #E23A2E' }}>
              <div
                className="uppercase text-[#E23A2E] leading-none mb-3 -rotate-2"
                style={{ fontFamily: 'var(--font-poster)', fontSize: 44, textShadow: '3px 3px 0 #000' }}
              >
                IT GOT PHYSICAL
              </div>
              <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-zinc-300 mb-2">
                {fightBroke.swungBy === 'player' ? 'YOU SWUNG.' : `${battle.ai_battler?.stage_name?.toUpperCase()} SWUNG.`} SECURITY RUSHED THE STAGE.
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-6">
                NO CONTEST · THE TAPE CUTS · THE BLOGS ALREADY KNOW
              </p>
              <Link
                href={`/battle/${battleId}`}
                className="inline-block px-8 py-3 bg-[#E23A2E] text-black font-display font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,.5)]"
              >
                FACE THE AFTERMATH →
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  const winner = determineWinner();

  return (
    <div className="min-h-screen bg-[#18191c]">
      {/* Header */}
      <div className="bg-[#101114] border-b-2 border-[#3a3d44]">
        <div className="max-w-7xl mx-auto px-4 py-5 md:py-6">
          <Link href="/dashboard" className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm font-display font-black uppercase tracking-wider">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between mt-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter text-white">ROUND {roundNum} · THE TAPE</h1>
              <p className="text-zinc-400 text-sm mt-1 font-display font-bold uppercase tracking-wider">
                vs {battle.ai_battler?.stage_name} • {battle.league?.name}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-400">Round Progress</div>
              <div className="text-xl font-bold text-[#ff8c42]">{roundNum} / 3</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Round verdict masthead — corner faces + this round's scoreline */}
        <div className="mb-8">
          <MatchupMasthead
            a={{
              id: battle.player_battler?.id,
              name: battle.player_battler?.stage_name || 'YOU',
              portrait: battleFace(battle.player_battler),
              won: winner === 'player',
            }}
            b={{
              id: battle.ai_battler?.id,
              name: battle.ai_battler?.stage_name || 'OPPONENT',
              portrait: battleFace(battle.ai_battler),
              won: winner === 'ai',
            }}
            score={`${Number(playerRound.average_score ?? 0).toFixed(1)}–${Number(aiRound.average_score ?? 0).toFixed(1)}`}
            subLine={battle.league?.name ? battle.league.name.toUpperCase() : undefined}
          />
        </div>

        {/* THE ROOM — the crowd IS the per-round feedback, packed into the booked venue.
            It reacts to WHAT won: comedy → laughter, personals → OOOH, wordplay → nods. */}
        <div className="mb-8">
          <CrowdStrip
            score={Math.max(playerRound.crowd_reaction ?? 0, aiRound.crowd_reaction ?? 0)}
            seed={`${battleId}-r${roundNum}`}
            flavor={
              (determineWinner() === 'ai'
                ? aiRound?.contentSelection?.content_types
                : playerRound?.contentSelection?.content_types) ?? []
            }
            venue={venueForLeague(battle.league?.name)}
            size={(battle.venue?.venue_type?.tier as 'virtual' | 'small' | 'medium' | 'large') ?? undefined}
            backdrop={
              battle.venue?.venue_type?.sprite_key ??
              (battle.venue?.venue_type?.tier ? artForTier(battle.venue.venue_type.tier) : null)
            }
            broadcast={
              battle.tv_broadcast
                ? 'national_tv'
                : battle.context === 'ppv' || battle.context === 'on_cam'
                  ? battle.context
                  : null
            }
            label={`${battle.venue ? `LIVE FROM ${battle.venue.name.toUpperCase()}` : 'THE ROOM'} · YOU ${Math.round(playerRound.crowd_reaction ?? 0)}% — ${(battle.ai_battler?.stage_name || 'THEM').toUpperCase()} ${Math.round(aiRound.crowd_reaction ?? 0)}%`}
          />
          <div className="fs text-right mt-1.5">
            <Link
              href="/guide/the-room"
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-600 hover:text-[#F5731A]"
            >
              How to read the room →
            </Link>
          </div>
        </div>

        {/* PRESSURE — what happened between the bars this round */}
        {pressureEvents.length > 0 && (
          <div className="fs mb-4 flex flex-wrap gap-2">
            {pressureEvents.map((p, i) => {
              const story =
                p.move === 'talk_over'
                  ? p.outcome === 'rattled'
                    ? `${p.actor.toUpperCase()} TALKED OVER THE ROUND — IT LANDED, THEY LOOKED SHOOK`
                    : `${p.actor.toUpperCase()} TRIED TO TALK OVER IT — GOT IGNORED, LOOKED THIRSTY`
                  : p.outcome === 'laughed_off'
                    ? `${p.actor.toUpperCase()} BUMPED — GOT LAUGHED OFF, ROOM SIDED WITH COMPOSURE`
                    : p.outcome === 'bumped_back'
                      ? `${p.actor.toUpperCase()} BUMPED — IT GOT MET. ROOM ON FIRE`
                      : `${p.actor.toUpperCase()} BUMPED`;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-black bg-[#170c0b] shadow-[3px_3px_0_rgba(0,0,0,.45)]"
                  style={{ borderLeft: `4px solid ${p.by === 'player' ? '#E7B23C' : '#E23A2E'}` }}
                >
                  <span className="font-mono text-[13px] uppercase tracking-[0.16em] text-zinc-200">{story}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* ANGLES — what the research dug up (facets weaponized in this battle) */}
        {angles.length > 0 && (
          <div className="fs mb-8 flex flex-wrap gap-2">
            {angles.map((a, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 border-2 border-black bg-[#1c1409] shadow-[3px_3px_0_rgba(0,0,0,.45)]"
                style={{ borderLeft: `4px solid ${a.researcherIsPlayer ? '#E7B23C' : '#E23A2E'}` }}
              >
                <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#E7B23C]">
                  {a.researcherIsPlayer ? 'YOUR RESEARCH FOUND' : `${a.researcher.toUpperCase()} DUG UP`}
                </span>
                <span
                  className="uppercase text-zinc-100"
                  style={{ fontFamily: 'var(--font-poster)', fontSize: 18, textShadow: '1px 1px 0 #000' }}
                >
                  {a.facets.join(' · ')}
                </span>
                <span className="font-mono text-[12px] uppercase tracking-[0.15em] text-zinc-500">
                  ON {a.target.toUpperCase()}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Results Breakdown */}
        <RoundResultsBreakdown
          playerRound={playerRound}
          aiRound={aiRound}
          playerSegments={playerSegments}
          aiSegments={aiSegments}
          winner={winner}
          playerName={battle.player_battler?.stage_name || 'You'}
          aiName={battle.ai_battler?.stage_name || 'Opponent'}
        />

        {/* The read — what decided the round, and a nudge to adjust. Closes the
            strategy loop the interactive battle asks the player to play. */}
        {playerRound && aiRound && (() => {
          const aiName = battle.ai_battler?.stage_name || 'Your opponent';
          const won = winner === 'player';
          const crowdGap = (aiRound.crowd_reaction ?? 0) - (playerRound.crowd_reaction ?? 0);
          const peakGap = (aiRound.peak_score ?? 0) - (playerRound.peak_score ?? 0);
          const avgGap = (aiRound.average_score ?? 0) - (playerRound.average_score ?? 0);
          let headline: string, why: string;
          if (won) {
            headline = 'YOU TOOK THE ROUND';
            why = (playerRound.peak_score ?? 0) >= 8.5
              ? 'Your haymaker landed and the room felt it. Keep that energy.'
              : 'You edged it on the strength of a steadier round. Stay on the gas.';
          } else if (winner === 'tie') {
            headline = 'TOO CLOSE TO CALL';
            why = 'A dead heat — the next round is the swing. Bring something they can’t answer.';
          } else {
            headline = `${aiName.toUpperCase()} TOOK THE ROUND`;
            why =
              crowdGap > 8 ? `${aiName} won the room — the crowd leaned their way. Win the moment back, not just the bars.`
              : peakGap > 1.5 ? `${aiName}'s big moment outshined yours. You need a haymaker of your own next round.`
              : avgGap > 0.5 ? `${aiName} was sharper bar-for-bar. Tighten the pen or counter their content.`
              : 'Razor close — it slipped away on the margins. This is anybody’s battle.';
          }
          // The nudge has to agree with the headline: telling a player who just
          // TOOK the round to "switch it up and counter" contradicts "stay on the gas".
          const nudge = roundNum >= 3
            ? 'That’s the tape. The decision’s in.'
            : won
              ? 'Ride the momentum — just don’t get predictable.'
              : winner === 'tie'
                ? 'The next round’s the swing — take control of it.'
                : 'Switch it up in the next round — counter what they’re bringing.';
          return (
            <div className={`mt-6 border-2 p-5 rounded-lg ${won ? 'border-[#ff8c42]/50 bg-[#ff8c42]/5' : winner === 'tie' ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500">The Read</span>
              </div>
              <div className={`text-xl font-display font-black uppercase tracking-tight ${won ? 'text-[#ff8c42]' : winner === 'tie' ? 'text-yellow-500' : 'text-red-400'}`}>
                {headline}
              </div>
              <p className="text-sm text-zinc-300 mt-1.5 leading-snug">{why}</p>
              <p className="text-xs text-zinc-500 mt-2 font-display font-bold uppercase tracking-wide">→ {nudge}</p>
            </div>
          );
        })()}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
          <div>
            {roundNum < 3 ? (
              <div>
                <div className="text-white font-bold mb-1">Ready for Round {roundNum + 1}?</div>
                <div className="text-sm text-zinc-400">
                  Continue to the next round content selection
                </div>
              </div>
            ) : (
              <div>
                <div className="text-white font-bold mb-1">Battle Complete!</div>
                <div className="text-sm text-zinc-400">View the final results and winner</div>
              </div>
            )}
          </div>
          <button
            onClick={handleNextRound}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all"
          >
            {roundNum < 3 ? `Next Round →` : 'View Final Results →'}
          </button>
        </div>

        {/* Round Summary Text */}
        {playerRound.summary_text && (
          <div className="mt-6 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-3">Round Summary</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">{playerRound.summary_text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
