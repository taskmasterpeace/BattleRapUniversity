'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Battle, BattleWithDetails, BattleRound, BattleSegment } from '@/lib/models';
import { RoundResultsBreakdown } from '@/components/battle/RoundResultsBreakdown';
import { toast } from '@/components/ui/Toast';

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

  // Round not simulated yet
  if (!playerRound || !aiRound) {
    return (
      <div className="min-h-screen bg-[#18191c]">
        {/* Header */}
        <div className="bg-[#2d2f35] border-b-2 border-[#3a3d44]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/dashboard" className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold mt-2 text-white">Round {roundNum} Results</h1>
            <p className="text-zinc-400 text-sm mt-1">
              vs {battle.ai_battler?.stage_name} • {battle.league?.name}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-12 text-center">
            
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Battle?</h2>
            <p className="text-zinc-400 mb-8">
              Both battlers have locked in their content. Click below to simulate Round {roundNum}.
            </p>
            <button
              onClick={handleSimulateRound}
              disabled={simulating}
              className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
            >
              {simulating ? 'Simulating...' : `Simulate Round ${roundNum}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const winner = determineWinner();

  return (
    <div className="min-h-screen bg-[#18191c]">
      {/* Header */}
      <div className="bg-[#2d2f35] border-b-2 border-[#3a3d44]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-2xl font-bold text-white">Round {roundNum} Results</h1>
              <p className="text-zinc-400 text-sm mt-1">
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
