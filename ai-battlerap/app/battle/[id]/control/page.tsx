'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Battle, BattleWithDetails, ScoringContext, PrepBlock } from '@/lib/models';

export default function BattleControlPage() {
  const router = useRouter();
  const params = useParams();
  const battleId = params.id as string;

  const [battle, setBattle] = useState<BattleWithDetails | null>(null);
  const [prepBlocks, setPrepBlocks] = useState<PrepBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedContext, setSelectedContext] = useState<ScoringContext>('ppv');

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
    if (!battle) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/battles/${battleId}/lock-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          context: selectedContext,
        }),
      });

      if (response.ok) {
        if (mode === 'locked_in') {
          // Redirect to round 1 content selection
          router.push(`/battle/${battleId}/round/1/select`);
        } else {
          // Auto mode - wait for simulation, then redirect to results
          const simulateRes = await fetch(`/api/battles/${battleId}/simulate`, {
            method: 'POST',
          });

          if (simulateRes.ok) {
            router.push(`/battle/${battleId}/results`);
          } else {
            alert('Failed to simulate battle');
            setSubmitting(false);
          }
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to lock in mode');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error locking in mode:', error);
      alert('Failed to lock in mode');
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-zinc-400">Loading battle...</div>
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

  return (
    <div className="min-h-screen bg-[#18191c]">
      {/* Header */}
      <div className="bg-[#2d2f35] border-b-2 border-[#3a3d44]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-2 text-white">Battle Control</h1>
          <p className="text-zinc-400 text-sm mt-1">
            vs {battle.ai_battler?.stage_name} • {battle.league?.name}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Battle Info Card */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Battle Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-400">Opponent:</span>
              <span className="text-white ml-2 font-semibold">
                {battle.ai_battler?.stage_name}
              </span>
            </div>
            <div>
              <span className="text-zinc-400">League:</span>
              <span className="text-white ml-2">{battle.league?.name}</span>
            </div>
            <div>
              <span className="text-zinc-400">Scheduled:</span>
              <span className="text-white ml-2">
                {new Date(battle.scheduled_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-zinc-400">Format:</span>
              <span className="text-white ml-2">
                {battle.league?.round_length_minutes}-minute rounds
              </span>
            </div>
          </div>
        </div>

        {/* Prep Summary */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Prep Summary</h2>
          <div className="grid grid-cols-5 gap-4">
            {['research', 'writing', 'performance', 'life', 'rest'].map((focus) => (
              <div key={focus} className="text-center">
                <div className="text-2xl font-bold text-[#ff8c42]">
                  {prepSummary[focus] || 0}
                </div>
                <div className="text-xs text-zinc-400 capitalize">{focus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Context Selection */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Battle Context</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Choose the battle environment. This affects crowd reactions and scoring modifiers.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                value: 'in_building' as ScoringContext,
                label: 'In Building',
                description: 'Small venue, intimate crowd',
              },
              {
                value: 'ppv' as ScoringContext,
                label: 'PPV Event',
                description: 'Large event, balanced crowd',
              },
              {
                value: 'on_cam' as ScoringContext,
                label: 'On Cam',
                description: 'Recorded for online, global audience',
              },
            ].map((context) => (
              <button
                key={context.value}
                onClick={() => setSelectedContext(context.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedContext === context.value
                    ? 'border-orange-500 bg-orange-950/30'
                    : 'border-[#3a3d44] bg-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="font-semibold text-white mb-1">{context.label}</div>
                <div className="text-xs text-zinc-400">{context.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Choose Your Battle Mode
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {/* Locked In Mode */}
            <div className="bg-gradient-to-br from-orange-950/40 to-zinc-900 border-2 border-orange-600 rounded-lg p-8 flex flex-col">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-2">Locked In</h3>
                <p className="text-sm text-zinc-300">
                  Strategic gameplay - manually select content for each round
                </p>
              </div>

              <div className="bg-[#18191c]/50 rounded-lg p-4 mb-6 flex-1">
                <div className="text-xs font-semibold text-orange-400 mb-2 uppercase">
                  Pros
                </div>
                <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside mb-4">
                  <li>Counter opponent's strategy</li>
                  <li>Optimize content effectiveness</li>
                  <li>Real-time tactical decisions</li>
                  <li>Maximum engagement</li>
                </ul>
                <div className="text-xs font-semibold text-red-400 mb-2 uppercase">
                  Cons
                </div>
                <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                  <li>Requires round-by-round input</li>
                  <li>More time investment</li>
                </ul>
              </div>

              <button
                onClick={() => handleLockIn('locked_in')}
                disabled={submitting}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Processing...' : 'Go Locked In'}
              </button>
            </div>

            {/* Auto Mode */}
            <div className="bg-gradient-to-br from-blue-950/40 to-zinc-900 border-2 border-blue-600 rounded-lg p-8 flex flex-col">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-2xl font-bold text-white mb-2">Auto</h3>
                <p className="text-sm text-zinc-300">
                  Quick results - AI auto-selects content based on your prep
                </p>
              </div>

              <div className="bg-[#18191c]/50 rounded-lg p-4 mb-6 flex-1">
                <div className="text-xs font-semibold text-green-400 mb-2 uppercase">
                  Pros
                </div>
                <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside mb-4">
                  <li>Instant results</li>
                  <li>AI optimizes based on badges</li>
                  <li>No manual selection needed</li>
                  <li>Quick gameplay loop</li>
                </ul>
                <div className="text-xs font-semibold text-red-400 mb-2 uppercase">
                  Cons
                </div>
                <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                  <li>Less strategic control</li>
                  <li>Miss tactical opportunities</li>
                </ul>
              </div>

              <button
                onClick={() => handleLockIn('auto')}
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Processing...' : 'Go Auto'}
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-4">
          <p className="text-sm text-zinc-400 text-center">
            Your prep work is complete. Now it's time to execute your strategy.
            <br />
            <span className="text-orange-400">Locked In</span> mode lets you adapt round-by-round, while{' '}
            <span className="text-blue-400">Auto</span> mode gives instant results based on your attributes.
          </p>
        </div>
      </div>
    </div>
  );
}
