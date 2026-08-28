'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Battle, BattleWithDetails, BattleStatus, ScoringContext } from '@/lib/models';
import { RoundContentSelector, ContentSelection } from '@/components/battle/RoundContentSelector';
import { EffectivenessForecast } from '@/components/battle/EffectivenessForecast';
import { predictOpponentContent } from '@/lib/game/roundContentSelection';
import { validateContentSelection } from '@/lib/game/roundContentSelection';
import { toast } from '@/components/ui/Toast';

// The interactive battle marches through these statuses in order. We use the
// ordering to gate this round's selection screen: a player who lands here out
// of sequence (stale tab, browser Back after a round, a link that skipped the
// lock-in step) should see a clear "here's where you actually are" screen, not
// build a full selection and hit a cryptic 409 at lock-in.
const FLOW_ORDER: BattleStatus[] = [
  'offered',
  'accepted',
  'awaiting_lock_in_choice',
  'awaiting_r1_content',
  'r1_simulated',
  'awaiting_r2_content',
  'r2_simulated',
  'awaiting_r3_content',
  'r3_simulated',
  'simulated',
  'completed',
];

/** The one correct next action for a battle, whatever screen the player is on. */
function resumeTargetFor(status: BattleStatus, battleId: string): { label: string; href: string } {
  switch (status) {
    case 'offered':
      return { label: 'VIEW THE OFFER', href: '/battle/offers' };
    case 'accepted':
    case 'awaiting_lock_in_choice':
      return { label: 'GO TO BATTLE NIGHT', href: `/battle/${battleId}/control` };
    case 'awaiting_r1_content':
      return { label: 'CALL ROUND 1', href: `/battle/${battleId}/round/1/select` };
    case 'r1_simulated':
      return { label: 'SEE ROUND 1 RESULTS', href: `/battle/${battleId}/round/1/results` };
    case 'awaiting_r2_content':
      return { label: 'CALL ROUND 2', href: `/battle/${battleId}/round/2/select` };
    case 'r2_simulated':
      return { label: 'SEE ROUND 2 RESULTS', href: `/battle/${battleId}/round/2/results` };
    case 'awaiting_r3_content':
      return { label: 'CALL ROUND 3', href: `/battle/${battleId}/round/3/select` };
    case 'r3_simulated':
    case 'simulated':
    case 'completed':
      return { label: 'VIEW THE TAPE', href: `/battle/${battleId}` };
    default:
      return { label: 'BACK TO DASHBOARD', href: '/dashboard' };
  }
}

export default function RoundSelectPage() {
  const router = useRouter();
  const params = useParams();
  const battleId = params.id as string;
  const roundNum = parseInt(params.roundNum as string);

  const [battle, setBattle] = useState<BattleWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selection, setSelection] = useState<ContentSelection>({
    contentTypes: [],
    deliveryTypes: [],
    performanceTypes: [],
  });
  const [predictedOppContent, setPredictedOppContent] = useState<ContentSelection | null>(null);

  useEffect(() => {
    fetchBattleData();
  }, [battleId]);

  const fetchBattleData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/battles/${battleId}`);
      const data = await response.json();
      setBattle(data.battle);

      // Predict opponent's content
      if (data.battle?.ai_battler?.style_tags && data.battle?.league?.name) {
        const predicted = predictOpponentContent(
          data.battle.ai_battler.style_tags,
          data.battle.league.name,
          roundNum
        );
        setPredictedOppContent(predicted);
      }
    } catch (error) {
      console.error('Error fetching battle data:', error);
    }
    setLoading(false);
  };

  const handleConfirmSelection = async () => {
    // Validate selection
    const validation = validateContentSelection(selection);
    if (!validation.valid) {
      toast('Invalid selection:\n' + validation.errors.join('\n'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/battles/${battleId}/rounds/${roundNum}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentTypes: selection.contentTypes,
          deliveryTypes: selection.deliveryTypes,
          performanceTypes: selection.performanceTypes,
        }),
      });

      if (response.ok) {
        // Redirect to round results page
        router.push(`/battle/${battleId}/round/${roundNum}/results`);
      } else {
        const data = await response.json();
        toast(data.error || 'Failed to save content selection', 'error');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error saving content selection:', error);
      toast('Failed to save content selection', 'error');
      setSubmitting(false);
    }
  };

  const isSelectionValid =
    selection.contentTypes.length >= 3 &&
    selection.contentTypes.length <= 4 &&
    selection.deliveryTypes.length >= 1 &&
    selection.deliveryTypes.length <= 2 &&
    selection.performanceTypes.length >= 1 &&
    selection.performanceTypes.length <= 2;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-zinc-400">Loading round data...</div>
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

  // Is this round's content stage the one that's actually open right now?
  const expectedStatus = `awaiting_r${roundNum}_content` as BattleStatus;
  const curIdx = FLOW_ORDER.indexOf(battle.status);
  const expIdx = FLOW_ORDER.indexOf(expectedStatus);
  const roundState: 'open' | 'locked' | 'not_yet' =
    curIdx === expIdx ? 'open' : curIdx > expIdx ? 'locked' : 'not_yet';

  if (roundState !== 'open') {
    const resume = resumeTargetFor(battle.status, battleId);
    const locked = roundState === 'locked';
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#2d2f35] border-2 border-[#3a3d44] p-8 text-center">
          <div
            className={`inline-block px-3 py-1 mb-5 text-[11px] font-display font-black uppercase tracking-widest ${
              locked ? 'bg-[#ff8c42]/15 text-[#ff8c42]' : 'bg-zinc-700/40 text-zinc-300'
            }`}
          >
            {locked ? 'ALREADY CALLED' : 'NOT YOUR TURN YET'}
          </div>
          <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-white mb-3">
            {locked ? `ROUND ${roundNum} IS IN THE BOOKS` : `ROUND ${roundNum} ISN'T OPEN YET`}
          </h1>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
            {locked
              ? `You already called Round ${roundNum} against ${battle.ai_battler?.stage_name}. You can't re-pick a round that's been performed — here's where the battle stands now.`
              : `You've got to work through the battle in order. Pick up right where you left off against ${battle.ai_battler?.stage_name}.`}
          </p>
          <Link
            href={resume.href}
            className="block w-full py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition-all"
          >
            {resume.label} →
          </Link>
          <Link
            href="/dashboard"
            className="inline-block mt-4 text-xs text-zinc-500 hover:text-zinc-300 font-display font-bold uppercase tracking-wider"
          >
            ← Back to Dashboard
          </Link>
        </div>
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
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter text-white">ROUND {roundNum} — CALL YOUR SHOT</h1>
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
        {/* Opponent Info */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6 mb-6">
          <h2 className="text-lg font-display font-black uppercase tracking-wider text-white mb-4">OPPONENT ANALYSIS</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-zinc-400 mb-2">Opponent</div>
              <div className="text-xl font-bold text-white">
                {battle.ai_battler?.stage_name}
              </div>
              <div className="text-sm text-zinc-400 mt-1 capitalize">
                {battle.ai_battler?.tier} Tier
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-400 mb-2">Style Badges</div>
              <div className="flex flex-wrap gap-2">
                {battle.ai_battler?.style_tags?.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded border-2 border-[#3a3d44]"
                  >
                    {tag}
                  </span>
                ))}
                {battle.ai_battler?.style_tags && battle.ai_battler.style_tags.length > 5 && (
                  <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded">
                    +{battle.ai_battler.style_tags.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {predictedOppContent && (
            <div className="mt-4 pt-4 border-t-2 border-[#3a3d44]">
              <div className="text-sm text-zinc-400 mb-2">Predicted Content (based on badges)</div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-zinc-500 mb-1">Content</div>
                  <div className="text-zinc-300">
                    {predictedOppContent.contentTypes.map((t) => t.replace(/_/g, ' ')).join(', ')}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 mb-1">Delivery</div>
                  <div className="text-zinc-300">
                    {predictedOppContent.deliveryTypes.map((t) => t.replace(/_/g, ' ')).join(', ')}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 mb-1">Performance</div>
                  <div className="text-zinc-300">
                    {predictedOppContent.performanceTypes.map((t) => t.replace(/_/g, ' ')).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selection Interface */}
        <div className="mb-6">
          <h2 className="text-xl font-display font-black uppercase tracking-wider text-white mb-4">SELECT YOUR CONTENT</h2>
          <RoundContentSelector
            onSelectionChange={setSelection}
            initialSelection={selection}
            opponentContent={predictedOppContent}
          />
        </div>

        {/* Effectiveness Forecast */}
        {predictedOppContent && (
          <div className="mb-6">
            <EffectivenessForecast
              yourSelection={selection}
              opponentSelection={predictedOppContent}
              leagueName={battle.league?.name || 'Small Room Circuit'}
              context={battle.context || 'ppv'}
            />
          </div>
        )}

        {/* Confirm Button */}
        <div className="flex items-center justify-between bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
          <div>
            <div className="text-white font-bold mb-1">Ready to lock in your selection?</div>
            <div className="text-sm text-zinc-400">
              {isSelectionValid ? (
                <span className="text-green-500">SELECTION VALID — LOCK IT</span>
              ) : (
                <span className="text-[#ff8c42]">
                  Complete your selection (3-4 content, 1-2 delivery, 1-2 performance)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleConfirmSelection}
            disabled={!isSelectionValid || submitting}
            className="px-8 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? 'LOCKING...' : 'LOCK THE ROUND'}
          </button>
        </div>

        {/* Strategy Tip */}
        <div className="mt-4 bg-[#2d2f35] border-2 border-[#3a3d44] p-4">
          <div className="flex items-start gap-3">
            
            <div>
              <div className="text-sm font-display font-black uppercase tracking-wider text-[#ff8c42] mb-1">STRATEGIC TIP</div>
              <p className="text-xs text-zinc-400">
                Look for super effective matchups (2.0x multiplier) against your opponent's
                predicted content. Balance offense (attack content) with technique (technical
                content) and entertainment for maximum effectiveness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
