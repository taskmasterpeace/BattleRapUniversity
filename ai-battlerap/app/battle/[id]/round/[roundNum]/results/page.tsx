'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Battle, BattleWithDetails, BattleRound, BattleSegment } from '@/lib/models';
import { RoundResultsBreakdown } from '@/components/battle/RoundResultsBreakdown';
import { toast } from '@/components/ui/Toast';
import MatchupMasthead, { battleFace } from '@/components/battle/MatchupMasthead';

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
      }
      // Pre-battle: the player's own locked content, echoed back so we can show
      // what they're walking in with on the "about to perform" screen.
      setLockedContent(roundData.playerContentSelection || null);
    } catch (error) {
      console.error('Error fetching round data:', error);
    }
    setLoading(false);
  };

  const handleSimulateRound = async () => {
    setSimulating(true);
    try {
      const response = await fetch(`/api/battles/${battleId}/rounds/${roundNum}/simulate`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh round data
        await fetchRoundData();
      } else {
        const data = await response.json();
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
      router.push(`/battle/${battleId}/round/${roundNum + 1}/select`);
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
            <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter text-white mt-3">
              ON DECK · ROUND {roundNum}
            </h1>
            <p className="text-zinc-400 text-sm mt-1 font-display font-bold uppercase tracking-wider">
              vs {battle.ai_battler?.stage_name} • {battle.league?.name}
            </p>
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

          {/* What you locked in */}
          {lockedRows.length > 0 && (
            <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6 mb-8">
              <div className="text-[11px] text-zinc-500 font-display font-black uppercase tracking-widest mb-4">
                WHAT YOU'RE WALKING IN WITH
              </div>
              <div className="space-y-3">
                {lockedRows.map(({ label, items }) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="text-[10px] text-zinc-500 font-display font-black uppercase tracking-widest w-24 shrink-0">
                      {label}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {items!.map((it) => (
                        <span
                          key={it}
                          className="px-2.5 py-1 bg-[#18191c] border border-[#3a3d44] text-zinc-200 text-xs font-display font-bold uppercase tracking-wide"
                        >
                          {fmt(it)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#3a3d44] text-[11px] text-zinc-500 font-display font-bold uppercase tracking-wide">
                {battle.ai_battler?.stage_name}'s cards stay hidden until the reveal.
              </div>
            </div>
          )}

          {/* Perform it */}
          <button
            onClick={handleSimulateRound}
            disabled={simulating}
            className="w-full py-5 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-widest text-lg md:text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {simulating ? 'THE ROOM GOES QUIET…' : `PERFORM ROUND ${roundNum} →`}
          </button>
          <p className="text-center text-[11px] text-zinc-600 font-display font-bold uppercase tracking-widest mt-4">
            Once it's performed, there's no taking it back.
          </p>
        </div>
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">The Read</span>
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
