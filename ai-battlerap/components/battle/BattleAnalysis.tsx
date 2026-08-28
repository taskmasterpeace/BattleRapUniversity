'use client';

import { useState } from 'react';

type AttributeComparison = {
  category: 'writing' | 'performance' | 'personal';
  name: string;
  playerValue: number;
  opponentValue: number;
  difference: number;
};

type KeyMoment = {
  roundIndex: number;
  segmentIndex: number;
  battlerName: string;
  type: 'haymaker' | 'choke' | 'stumble';
  score: number;
  description: string;
};

type PrepImpact = {
  focus: string;
  days: number;
  attributesAffected: string[];
  estimatedBoost: number;
};

type Props = {
  // Battle metadata
  playerName: string;
  opponentName: string;
  playerWon: boolean;
  verdict: string; // "3-0" or "2-1"
  decisionType: string; // "bodybag", "clean_sweep", "gentlemans_30", "classic", "edge"

  // Attribute comparisons
  playerAttributes: {
    writing: { lyricism: number; wordplay: number; creativity: number; flow: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { resilience: number; preparation: number; financial_stability: number; family_bond: number; reputation: number };
  };
  opponentAttributes: {
    writing: { lyricism: number; wordplay: number; creativity: number; flow: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { resilience: number; preparation: number; financial_stability: number; family_bond: number; reputation: number };
  };

  // Key moments
  keyMoments: KeyMoment[];

  // Prep impact
  playerPrep: {
    researchDays: number;
    writingDays: number;
    performanceDays: number;
    lifeDays: number;
    restDays: number;
  };

  // League type
  leagueType: string;
  leagueWritingWeight: number;
  leaguePerformanceWeight: number;
};

export default function BattleAnalysis({
  playerName,
  opponentName,
  playerWon,
  verdict,
  decisionType,
  playerAttributes,
  opponentAttributes,
  keyMoments,
  playerPrep,
  leagueType,
  leagueWritingWeight,
  leaguePerformanceWeight,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate attribute comparisons
  const attributeComparisons: AttributeComparison[] = [
    // Writing
    {
      category: 'writing',
      name: 'Lyricism',
      playerValue: playerAttributes.writing.lyricism,
      opponentValue: opponentAttributes.writing.lyricism,
      difference: playerAttributes.writing.lyricism - opponentAttributes.writing.lyricism,
    },
    {
      category: 'writing',
      name: 'Wordplay',
      playerValue: playerAttributes.writing.wordplay,
      opponentValue: opponentAttributes.writing.wordplay,
      difference: playerAttributes.writing.wordplay - opponentAttributes.writing.wordplay,
    },
    {
      category: 'writing',
      name: 'Creativity',
      playerValue: playerAttributes.writing.creativity,
      opponentValue: opponentAttributes.writing.creativity,
      difference: playerAttributes.writing.creativity - opponentAttributes.writing.creativity,
    },
    {
      category: 'writing',
      name: 'Flow',
      playerValue: playerAttributes.writing.flow,
      opponentValue: opponentAttributes.writing.flow,
      difference: playerAttributes.writing.flow - opponentAttributes.writing.flow,
    },
    // Performance
    {
      category: 'performance',
      name: 'Stage Presence',
      playerValue: playerAttributes.performance.stage_presence,
      opponentValue: opponentAttributes.performance.stage_presence,
      difference: playerAttributes.performance.stage_presence - opponentAttributes.performance.stage_presence,
    },
    {
      category: 'performance',
      name: 'Crowd Control',
      playerValue: playerAttributes.performance.crowd_control,
      opponentValue: opponentAttributes.performance.crowd_control,
      difference: playerAttributes.performance.crowd_control - opponentAttributes.performance.crowd_control,
    },
    {
      category: 'performance',
      name: 'Delivery',
      playerValue: playerAttributes.performance.delivery,
      opponentValue: opponentAttributes.performance.delivery,
      difference: playerAttributes.performance.delivery - opponentAttributes.performance.delivery,
    },
    // Personal
    {
      category: 'personal',
      name: 'Resilience',
      playerValue: playerAttributes.personal.resilience,
      opponentValue: opponentAttributes.personal.resilience,
      difference: playerAttributes.personal.resilience - opponentAttributes.personal.resilience,
    },
  ];

  // Calculate prep impact
  const prepImpacts: PrepImpact[] = [];

  if (playerPrep.writingDays > 0) {
    prepImpacts.push({
      focus: 'Writing',
      days: playerPrep.writingDays,
      attributesAffected: ['Lyricism', 'Wordplay', 'Creativity'],
      estimatedBoost: playerPrep.writingDays * 0.25,
    });
  }

  if (playerPrep.performanceDays > 0) {
    prepImpacts.push({
      focus: 'Performance',
      days: playerPrep.performanceDays,
      attributesAffected: ['Stage Presence', 'Crowd Control', 'Delivery'],
      estimatedBoost: playerPrep.performanceDays * 0.25,
    });
  }

  if (playerPrep.researchDays > 0) {
    prepImpacts.push({
      focus: 'Research',
      days: playerPrep.researchDays,
      attributesAffected: ['Creativity', 'Lyricism'],
      estimatedBoost: playerPrep.researchDays * 0.25,
    });
  }

  if (playerPrep.restDays > 0) {
    prepImpacts.push({
      focus: 'Rest',
      days: playerPrep.restDays,
      attributesAffected: ['Resilience'],
      estimatedBoost: playerPrep.restDays * 0.25,
    });
  }

  if (playerPrep.lifeDays > 0) {
    prepImpacts.push({
      focus: 'Life',
      days: playerPrep.lifeDays,
      attributesAffected: ['Family Bond', 'Financial Stability'],
      estimatedBoost: playerPrep.lifeDays * 0.25,
    });
  }

  // Generate why you won/lost analysis
  const generateOutcomeAnalysis = () => {
    const writingComps = attributeComparisons.filter(c => c.category === 'writing');
    const performanceComps = attributeComparisons.filter(c => c.category === 'performance');

    const avgWritingDiff = writingComps.reduce((sum, c) => sum + c.difference, 0) / writingComps.length;
    const avgPerformanceDiff = performanceComps.reduce((sum, c) => sum + c.difference, 0) / performanceComps.length;

    const points = [];

    // Analyze based on league type
    if (leagueWritingWeight > 0.6) {
      // Writing-focused league
      if (avgWritingDiff > 2) {
        points.push(`Your writing skills (Lyricism, Wordplay, Creativity) were significantly stronger (+${avgWritingDiff.toFixed(1)} average).`);
      } else if (avgWritingDiff < -2) {
        points.push(`Your opponent had a significant writing advantage (+${Math.abs(avgWritingDiff).toFixed(1)} average).`);
      }
    } else {
      // Performance-focused league
      if (avgPerformanceDiff > 2) {
        points.push(`Your performance presence (Stage Presence, Crowd Control, Delivery) dominated (+${avgPerformanceDiff.toFixed(1)} average).`);
      } else if (avgPerformanceDiff < -2) {
        points.push(`Your opponent controlled the room better with superior performance skills (+${Math.abs(avgPerformanceDiff).toFixed(1)} average).`);
      }
    }

    // Prep analysis — phrase it to fit the WHY YOU WON / WHY YOU LOST header this
    // list sits under. "Strong prep maximized your potential" reads as praise, so
    // on a loss it can't be a reason you lost; reframe it as effort that the
    // matchup still beat. Likewise light prep is only a knock on a loss.
    const totalPrepDays = playerPrep.writingDays + playerPrep.performanceDays + playerPrep.researchDays + playerPrep.restDays + playerPrep.lifeDays;
    if (totalPrepDays >= 8) {
      points.push(
        playerWon
          ? `Strong prep strategy (${totalPrepDays} days) maximized your potential.`
          : `You maxed your prep (${totalPrepDays} days) — this one was the matchup, not your preparation.`
      );
    } else if (totalPrepDays <= 3) {
      points.push(
        playerWon
          ? `You pulled it off on light prep (${totalPrepDays} days) — imagine with a full camp.`
          : `Limited prep (${totalPrepDays} days) left performance on the table.`
      );
    }

    // Key moments. Only count haymakers that actually CONNECTED (score >= 5.5,
    // the same threshold the moment prose uses for "landed" vs "reached for the
    // knockout — but it didn't land"). A 4.0 peak-roll that whiffed shouldn't be
    // cited as a reason you won — Key Moments already tells the player it missed.
    const LANDED_HAYMAKER = 5.5;
    const playerHaymakers = keyMoments.filter(m => m.type === 'haymaker' && m.battlerName === playerName && m.score >= LANDED_HAYMAKER).length;
    const opponentHaymakers = keyMoments.filter(m => m.type === 'haymaker' && m.battlerName === opponentName && m.score >= LANDED_HAYMAKER).length;
    const playerChokes = keyMoments.filter(m => m.type === 'choke' && m.battlerName === playerName).length;

    if (playerHaymakers > opponentHaymakers + 1) {
      points.push(`You delivered more haymaker moments (${playerHaymakers} vs ${opponentHaymakers}).`);
    }

    if (playerChokes > 0) {
      points.push(`Choking in ${playerChokes} segment(s) cost you crucial rounds.`);
    }

    // Decision type context
    if (decisionType === 'bodybag') {
      points.push('BODYBAG - This was a dominant performance, complete mismatch.');
    } else if (decisionType === 'clean_sweep') {
      points.push('CLEAR 3-0 - Decisive victory across all rounds.');
    } else if (decisionType === 'gentlemans_30') {
      points.push(
        playerWon
          ? "GENTLEMAN'S 30 - You took all three rounds, but they kept it competitive."
          : "GENTLEMAN'S 30 - They took all three rounds, but you kept it competitive."
      );
    } else if (decisionType === 'classic') {
      points.push('CLASSIC BATTLE - Both battlers brought their A-game.');
    } else if (decisionType === 'edge') {
      points.push('DEBATABLE - This was extremely close, could have gone either way.');
    }

    return points;
  };

  // Generate improvement suggestions
  const generateSuggestions = () => {
    const suggestions = [];

    const writingComps = attributeComparisons.filter(c => c.category === 'writing');
    const performanceComps = attributeComparisons.filter(c => c.category === 'performance');

    const weakestWriting = writingComps.sort((a, b) => a.difference - b.difference)[0];
    const weakestPerformance = performanceComps.sort((a, b) => a.difference - b.difference)[0];

    // League-specific suggestions
    if (leagueWritingWeight > 0.6) {
      // Small Room Circuit
      if (weakestWriting.difference < -1) {
        suggestions.push({
          title: `Improve ${weakestWriting.name}`,
          description: `Your ${weakestWriting.name.toLowerCase()} (${weakestWriting.playerValue.toFixed(1)}) is behind your opponent's (${weakestWriting.opponentValue.toFixed(1)}). Focus on writing prep days.`,
          prepFocus: 'writing',
        });
      }

      if (playerPrep.writingDays < 3) {
        suggestions.push({
          title: 'Increase Writing Prep',
          description: `You only spent ${playerPrep.writingDays} day(s) on writing. Aim for 3-5 days in Small Room battles.`,
          prepFocus: 'writing',
        });
      }

      if (playerPrep.researchDays < 2) {
        suggestions.push({
          title: 'Add Research Days',
          description: 'Research prep helps with angles and creativity. Aim for 2-3 research days.',
          prepFocus: 'research',
        });
      }
    } else {
      // Main Stage Arena
      if (weakestPerformance.difference < -1) {
        suggestions.push({
          title: `Improve ${weakestPerformance.name}`,
          description: `Your ${weakestPerformance.name.toLowerCase()} (${weakestPerformance.playerValue.toFixed(1)}) needs work compared to ${opponentName} (${weakestPerformance.opponentValue.toFixed(1)}). Focus on performance prep days.`,
          prepFocus: 'performance',
        });
      }

      if (playerPrep.performanceDays < 3) {
        suggestions.push({
          title: 'Increase Performance Prep',
          description: `You only spent ${playerPrep.performanceDays} day(s) on performance. Main Stage requires 3-5 performance days.`,
          prepFocus: 'performance',
        });
      }
    }

    // Resilience suggestions
    const playerChokes = keyMoments.filter(m => m.type === 'choke' && m.battlerName === playerName).length;
    if (playerChokes > 0) {
      suggestions.push({
        title: 'Build Resilience',
        description: `You choked ${playerChokes} time(s). Add rest days to improve resilience and reduce choking.`,
        prepFocus: 'rest',
      });
    }

    // Consistency suggestions
    const playerStumbles = keyMoments.filter(m => m.type === 'stumble' && m.battlerName === playerName).length;
    if (playerStumbles > 2) {
      suggestions.push({
        title: 'Improve Consistency',
        description: `${playerStumbles} stumbles detected. Performance prep helps with delivery consistency.`,
        prepFocus: 'performance',
      });
    }

    // Balance suggestions
    const totalPrepDays = playerPrep.writingDays + playerPrep.performanceDays + playerPrep.researchDays + playerPrep.restDays + playerPrep.lifeDays;
    if (totalPrepDays < 5) {
      suggestions.push({
        title: 'Prepare More',
        description: `Only ${totalPrepDays} total prep days. Aim for 7-10 days for competitive battles.`,
        prepFocus: 'general',
      });
    }

    return suggestions.slice(0, 4); // Limit to 4 suggestions
  };

  const outcomePoints = generateOutcomeAnalysis();
  const suggestions = generateSuggestions();

  return (
    <div className="bg-[#101114] border-2 border-[#3a3d44] overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-zinc-800/50 transition"
      >
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42]">
            Battle Analysis
          </h2>
          <p className="text-sm text-zinc-500 uppercase tracking-wide mt-1">
            Deep Dive Into Performance
          </p>
        </div>
        <div className="text-3xl text-[#ff8c42]">
          {isExpanded ? '−' : '+'}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-8 border-t-2 border-[#3a3d44] pt-6">

          {/* 1. WHY YOU WON/LOST */}
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider text-zinc-300 mb-4 flex items-center gap-2">
              <span className="text-2xl">{playerWon ? '✓' : '✗'}</span>
              Why You {playerWon ? 'Won' : 'Lost'}
            </h3>
            <div className="space-y-2">
              {outcomePoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded border-2 border-[#3a3d44]">
                  <span className="text-[#ff8c42] font-black">•</span>
                  <p className="text-sm text-zinc-300">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. KEY MOMENTS */}
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider text-zinc-300 mb-4">
              Key Moments
            </h3>
            {keyMoments.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No significant moments recorded.</p>
            ) : (
              <div className="space-y-2">
                {keyMoments.map((moment, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border-2 ${
                      moment.type === 'haymaker'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : moment.type === 'choke'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-yellow-500/10 border-yellow-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-2xl ${
                            moment.type === 'haymaker'
                              ? 'text-amber-500'
                              : moment.type === 'choke'
                              ? 'text-red-500'
                              : 'text-yellow-500'
                          }`}
                        >
                          {moment.type === 'haymaker' ? '⚡' : moment.type === 'choke' ? '💥' : '⚠'}
                        </span>
                        <div>
                          <div className="text-sm font-display font-black uppercase tracking-wide text-zinc-200">
                            {moment.battlerName} - Round {moment.roundIndex}, Seg {moment.segmentIndex}
                          </div>
                          <div className="text-xs text-zinc-400 mt-1">{moment.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-zinc-300">{moment.score.toFixed(1)}</div>
                        <div className="text-xs uppercase tracking-wide text-zinc-500 font-bold">
                          {moment.type}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. PREP IMPACT */}
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider text-zinc-300 mb-4">
              Prep Impact
            </h3>
            {prepImpacts.length === 0 ? (
              <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded">
                <p className="text-sm text-red-400 font-bold">
                  No prep detected! Prep is crucial for competitive performance.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {prepImpacts.map((impact, idx) => (
                  <div key={idx} className="p-4 bg-zinc-800/50 border-2 border-[#3a3d44] rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-display font-black uppercase tracking-wide text-[#ff8c42]">
                        {impact.focus}
                      </span>
                      <span className="text-xs font-bold text-zinc-400">
                        {impact.days} day{impact.days !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mb-2">
                      Affected: {impact.attributesAffected.join(', ')}
                    </div>
                    <div className="text-sm font-bold text-green-400">
                      +{impact.estimatedBoost.toFixed(1)} estimated boost
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 p-3 bg-blue-500/10 border-2 border-blue-500/30 rounded">
              <p className="text-xs text-blue-300 italic">
                <strong>Prep Efficiency:</strong> Each prep day boosts relevant attributes by ~0.25 points.
                Your preparation attribute ({playerAttributes.personal.preparation.toFixed(1)}) affects prep efficiency.
              </p>
            </div>
          </div>

          {/* 5. IMPROVEMENT SUGGESTIONS */}
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider text-zinc-300 mb-4">
              Improvement Suggestions
            </h3>
            <div className="space-y-3">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gradient-to-r from-orange-500/10 to-transparent border-l-4 border-[#ff8c42]"
                >
                  <h4 className="text-sm font-black uppercase tracking-wide text-orange-400 mb-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-zinc-300">{suggestion.description}</p>
                  <div className="mt-2 inline-block px-2 py-1 bg-zinc-800 border-2 border-[#3a3d44] rounded text-xs font-display font-black uppercase tracking-wide text-zinc-400">
                    Focus: {suggestion.prepFocus}
                  </div>
                </div>
              ))}
              {suggestions.length === 0 && (
                <p className="text-sm text-zinc-500 italic">
                  Solid performance! Keep up the consistency.
                </p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
