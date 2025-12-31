'use client';

type JudgeScore = {
  judge_id: string;
  judge_name: string;
  battler_id: string;
  rounds_won: number;
  overall_composite_average: number;
  winner: boolean;
  round_evaluations: any; // JSONB from database
};

type Props = {
  judgeScores: JudgeScore[];
  playerBattlerId: string;
  opponentBattlerId: string;
  playerName: string;
  opponentName: string;
};

export default function JudgeScorecard({
  judgeScores,
  playerBattlerId,
  opponentBattlerId,
  playerName,
  opponentName,
}: Props) {
  if (!judgeScores || judgeScores.length === 0) {
    return null; // Not a tournament battle or no scores yet
  }

  // Group scores by judge
  const judgesByName = judgeScores.reduce((acc, score) => {
    if (!acc[score.judge_name]) {
      acc[score.judge_name] = {
        judge_id: score.judge_id,
        judge_name: score.judge_name,
        player_score: null as JudgeScore | null,
        opponent_score: null as JudgeScore | null,
      };
    }

    if (score.battler_id === playerBattlerId) {
      acc[score.judge_name].player_score = score;
    } else {
      acc[score.judge_name].opponent_score = score;
    }

    return acc;
  }, {} as Record<string, any>);

  const judges = Object.values(judgesByName);

  // Count judge votes
  const playerVotes = judgeScores.filter(
    (s) => s.battler_id === playerBattlerId && s.winner
  ).length;
  const opponentVotes = judgeScores.filter(
    (s) => s.battler_id === opponentBattlerId && s.winner
  ).length;

  const decisionType =
    playerVotes === 3
      ? 'unanimous'
      : opponentVotes === 3
      ? 'unanimous'
      : 'split';

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-8 space-y-6">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] pb-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42] mb-2">
          Judge Scorecards
        </h2>
        <p className="text-sm text-zinc-500 uppercase tracking-wide">
          {decisionType === 'unanimous' ? 'BODYBAG (3-0)' : 'DEBATABLE (2-1)'}
        </p>
      </div>

      {/* Decision Summary */}
      <div className="grid grid-cols-2 gap-6">
        {/* Player Votes */}
        <div
          className={`p-6 rounded-lg border-2 ${
            playerVotes > opponentVotes
              ? 'bg-green-500/10 border-green-500/40'
              : 'bg-zinc-800/50 border-[#3a3d44]'
          }`}
        >
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-2">
            {playerName}
          </div>
          <div
            className={`text-4xl font-display font-black tracking-tighter ${
              playerVotes > opponentVotes ? 'text-green-500' : 'text-zinc-500'
            }`}
          >
            {playerVotes}
            <span className="text-xl text-zinc-600 ml-2">/ 3 JUDGES</span>
          </div>
        </div>

        {/* Opponent Votes */}
        <div
          className={`p-6 rounded-lg border-2 ${
            opponentVotes > playerVotes
              ? 'bg-red-500/10 border-red-500/40'
              : 'bg-zinc-800/50 border-[#3a3d44]'
          }`}
        >
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-2">
            {opponentName}
          </div>
          <div
            className={`text-4xl font-display font-black tracking-tighter ${
              opponentVotes > playerVotes ? 'text-red-500' : 'text-zinc-500'
            }`}
          >
            {opponentVotes}
            <span className="text-xl text-zinc-600 ml-2">/ 3 JUDGES</span>
          </div>
        </div>
      </div>

      {/* Individual Judge Scorecards */}
      <div className="space-y-4">
        <h3 className="text-sm font-display font-black uppercase tracking-wider text-zinc-400">
          Individual Scorecards
        </h3>

        {judges.map((judge, index) => {
          const playerScore = judge.player_score;
          const opponentScore = judge.opponent_score;

          const playerWon = playerScore?.winner || false;
          const opponentWon = opponentScore?.winner || false;

          return (
            <div
              key={index}
              className="bg-zinc-800/50 border-2 border-[#3a3d44] rounded-lg p-6"
            >
              {/* Judge Name */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#3a3d44]">
                <div>
                  <div className="text-lg font-black uppercase tracking-tight text-[#ff8c42]">
                    {judge.judge_name}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide">
                    Judge
                  </div>
                </div>
                <div className="text-xs uppercase tracking-wide text-zinc-400 font-bold">
                  {playerWon ? (
                    <span className="text-green-500">✓ {playerName}</span>
                  ) : (
                    <span className="text-red-500">✓ {opponentName}</span>
                  )}
                </div>
              </div>

              {/* Round-by-Round Scores */}
              <div className="grid grid-cols-2 gap-6">
                {/* Player Side */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-3">
                    {playerName}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Rounds Won</span>
                      <span
                        className={`text-xl font-black ${
                          playerWon ? 'text-green-500' : 'text-zinc-400'
                        }`}
                      >
                        {playerScore?.rounds_won || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">
                        Composite Avg
                      </span>
                      <span className="text-sm font-bold text-zinc-300">
                        {playerScore?.overall_composite_average?.toFixed(2) ||
                          '0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Opponent Side */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-3">
                    {opponentName}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Rounds Won</span>
                      <span
                        className={`text-xl font-black ${
                          opponentWon ? 'text-red-500' : 'text-zinc-400'
                        }`}
                      >
                        {opponentScore?.rounds_won || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">
                        Composite Avg
                      </span>
                      <span className="text-sm font-bold text-zinc-300">
                        {opponentScore?.overall_composite_average?.toFixed(
                          2
                        ) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
