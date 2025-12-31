'use client';

type BattlerAttributes = {
  writing: {
    lyricism: number;
    wordplay: number;
    creativity: number;
    flow: number;
  };
  performance: {
    stage_presence: number;
    crowd_control: number;
    delivery: number;
  };
  resilience: number;
};

type Props = {
  playerAttributes: BattlerAttributes;
  opponentAttributes: BattlerAttributes;
  playerName: string;
  opponentName: string;
  showDetailed?: boolean;
};

type AttributeComparison = {
  name: string;
  playerValue: number;
  opponentValue: number;
  advantage: 'player' | 'opponent' | 'even';
  diff: number;
};

export default function MatchupPreview({
  playerAttributes,
  opponentAttributes,
  playerName,
  opponentName,
  showDetailed = false,
}: Props) {
  // Calculate key attribute comparisons
  const comparisons: AttributeComparison[] = [];

  // Writing attributes
  const playerWritingAvg = (
    playerAttributes.writing.lyricism +
    playerAttributes.writing.wordplay +
    playerAttributes.writing.creativity +
    playerAttributes.writing.flow
  ) / 4;

  const opponentWritingAvg = (
    opponentAttributes.writing.lyricism +
    opponentAttributes.writing.wordplay +
    opponentAttributes.writing.creativity +
    opponentAttributes.writing.flow
  ) / 4;

  comparisons.push({
    name: 'Writing',
    playerValue: playerWritingAvg,
    opponentValue: opponentWritingAvg,
    advantage: getAdvantage(playerWritingAvg, opponentWritingAvg),
    diff: playerWritingAvg - opponentWritingAvg,
  });

  // Performance attributes
  const playerPerformanceAvg = (
    playerAttributes.performance.stage_presence +
    playerAttributes.performance.crowd_control +
    playerAttributes.performance.delivery
  ) / 3;

  const opponentPerformanceAvg = (
    opponentAttributes.performance.stage_presence +
    opponentAttributes.performance.crowd_control +
    opponentAttributes.performance.delivery
  ) / 3;

  comparisons.push({
    name: 'Performance',
    playerValue: playerPerformanceAvg,
    opponentValue: opponentPerformanceAvg,
    advantage: getAdvantage(playerPerformanceAvg, opponentPerformanceAvg),
    diff: playerPerformanceAvg - opponentPerformanceAvg,
  });

  // Resilience
  comparisons.push({
    name: 'Resilience',
    playerValue: playerAttributes.resilience,
    opponentValue: opponentAttributes.resilience,
    advantage: getAdvantage(playerAttributes.resilience, opponentAttributes.resilience),
    diff: playerAttributes.resilience - opponentAttributes.resilience,
  });

  // Detailed attribute breakdowns
  const detailedComparisons: AttributeComparison[] = [];

  if (showDetailed) {
    // Writing details
    detailedComparisons.push(
      {
        name: 'Lyricism',
        playerValue: playerAttributes.writing.lyricism,
        opponentValue: opponentAttributes.writing.lyricism,
        advantage: getAdvantage(playerAttributes.writing.lyricism, opponentAttributes.writing.lyricism),
        diff: playerAttributes.writing.lyricism - opponentAttributes.writing.lyricism,
      },
      {
        name: 'Wordplay',
        playerValue: playerAttributes.writing.wordplay,
        opponentValue: opponentAttributes.writing.wordplay,
        advantage: getAdvantage(playerAttributes.writing.wordplay, opponentAttributes.writing.wordplay),
        diff: playerAttributes.writing.wordplay - opponentAttributes.writing.wordplay,
      },
      {
        name: 'Creativity',
        playerValue: playerAttributes.writing.creativity,
        opponentValue: opponentAttributes.writing.creativity,
        advantage: getAdvantage(playerAttributes.writing.creativity, opponentAttributes.writing.creativity),
        diff: playerAttributes.writing.creativity - opponentAttributes.writing.creativity,
      },
      {
        name: 'Flow',
        playerValue: playerAttributes.writing.flow,
        opponentValue: opponentAttributes.writing.flow,
        advantage: getAdvantage(playerAttributes.writing.flow, opponentAttributes.writing.flow),
        diff: playerAttributes.writing.flow - opponentAttributes.writing.flow,
      }
    );

    // Performance details
    detailedComparisons.push(
      {
        name: 'Stage Presence',
        playerValue: playerAttributes.performance.stage_presence,
        opponentValue: opponentAttributes.performance.stage_presence,
        advantage: getAdvantage(playerAttributes.performance.stage_presence, opponentAttributes.performance.stage_presence),
        diff: playerAttributes.performance.stage_presence - opponentAttributes.performance.stage_presence,
      },
      {
        name: 'Crowd Control',
        playerValue: playerAttributes.performance.crowd_control,
        opponentValue: opponentAttributes.performance.crowd_control,
        advantage: getAdvantage(playerAttributes.performance.crowd_control, opponentAttributes.performance.crowd_control),
        diff: playerAttributes.performance.crowd_control - opponentAttributes.performance.crowd_control,
      },
      {
        name: 'Delivery',
        playerValue: playerAttributes.performance.delivery,
        opponentValue: opponentAttributes.performance.delivery,
        advantage: getAdvantage(playerAttributes.performance.delivery, opponentAttributes.performance.delivery),
        diff: playerAttributes.performance.delivery - opponentAttributes.performance.delivery,
      }
    );
  }

  // Calculate overall matchup assessment
  const playerAdvantages = comparisons.filter(c => c.advantage === 'player').length;
  const opponentAdvantages = comparisons.filter(c => c.advantage === 'opponent').length;
  const overallAssessment =
    playerAdvantages > opponentAdvantages ? 'favorable' :
    opponentAdvantages > playerAdvantages ? 'unfavorable' :
    'even';

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] pb-4 mb-6">
        <h3 className="text-lg font-black uppercase tracking-tight text-[#ff8c42]">
          Matchup Preview
        </h3>
        <p className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
          Head-to-Head Comparison
        </p>
      </div>

      {/* Overall Assessment */}
      <div className={`p-4 rounded-lg mb-6 border-2 ${
        overallAssessment === 'favorable'
          ? 'bg-green-500/10 border-green-500/30'
          : overallAssessment === 'unfavorable'
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-yellow-500/10 border-yellow-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">
            Overall Matchup
          </span>
          <span className={`text-sm font-black uppercase tracking-wide ${
            overallAssessment === 'favorable' ? 'text-green-500' :
            overallAssessment === 'unfavorable' ? 'text-red-500' :
            'text-yellow-500'
          }`}>
            {overallAssessment === 'favorable' ? 'ADVANTAGE: YOU' :
             overallAssessment === 'unfavorable' ? 'ADVANTAGE: OPPONENT' :
             'EVENLY MATCHED'}
          </span>
        </div>
      </div>

      {/* Key Comparisons */}
      <div className="space-y-4">
        {comparisons.map((comp, idx) => (
          <AttributeBar key={idx} comparison={comp} />
        ))}
      </div>

      {/* Detailed Comparisons (if enabled) */}
      {showDetailed && detailedComparisons.length > 0 && (
        <div className="mt-6 pt-6 border-t-2 border-[#3a3d44]">
          <h4 className="text-sm font-display font-black uppercase tracking-wider text-zinc-400 mb-4">
            Detailed Breakdown
          </h4>
          <div className="space-y-3">
            {detailedComparisons.map((comp, idx) => (
              <AttributeBar key={idx} comparison={comp} compact />
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-6 border-t-2 border-[#3a3d44]">
        <div className="flex items-center gap-4 justify-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-zinc-500 uppercase tracking-wide">Your Advantage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-zinc-500 uppercase tracking-wide">Even</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-zinc-500 uppercase tracking-wide">Opponent Advantage</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttributeBar({
  comparison,
  compact = false
}: {
  comparison: AttributeComparison;
  compact?: boolean;
}) {
  const getBarColor = (advantage: 'player' | 'opponent' | 'even') => {
    if (advantage === 'player') return 'bg-green-500';
    if (advantage === 'opponent') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getTextColor = (advantage: 'player' | 'opponent' | 'even') => {
    if (advantage === 'player') return 'text-green-500';
    if (advantage === 'opponent') return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <div>
      {/* Label and Values */}
      <div className="flex items-center justify-between mb-2">
        <span className={`${compact ? 'text-xs' : 'text-sm'} uppercase tracking-wide font-bold text-zinc-400`}>
          {comparison.name}
        </span>
        <div className="flex items-center gap-3">
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-zinc-300`}>
            {comparison.playerValue.toFixed(1)}
          </span>
          <span className="text-xs text-zinc-600">VS</span>
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-zinc-300`}>
            {comparison.opponentValue.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Comparison Bar */}
      <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
        {/* Player bar (left side) */}
        <div
          className="absolute left-0 h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${(comparison.playerValue / 10) * 50}%` }}
        />
        {/* Opponent bar (right side) */}
        <div
          className="absolute right-0 h-full bg-zinc-700 transition-all duration-500"
          style={{ width: `${(comparison.opponentValue / 10) * 50}%` }}
        />
      </div>

      {/* Advantage Indicator */}
      {!compact && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs uppercase tracking-wide font-bold ${getTextColor(comparison.advantage)}`}>
            {comparison.advantage === 'player' ? `+${comparison.diff.toFixed(1)} ADVANTAGE` :
             comparison.advantage === 'opponent' ? `${comparison.diff.toFixed(1)} DISADVANTAGE` :
             'EVEN'}
          </span>
        </div>
      )}
    </div>
  );
}

function getAdvantage(playerValue: number, opponentValue: number): 'player' | 'opponent' | 'even' {
  const diff = playerValue - opponentValue;
  if (diff > 0.5) return 'player';
  if (diff < -0.5) return 'opponent';
  return 'even';
}
