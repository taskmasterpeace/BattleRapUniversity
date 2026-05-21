'use client';

import { useEffect, useMemo, useState } from 'react';
import Avatar from '@/components/ui/Avatar';

type Segment = {
  id: string;
  round_index: number;
  segment_index: number;
  battler_id: string;
  segment_score: number;
  event_flags: string[];
};

type Round = {
  id: string;
  round_index: number;
  battler_id: string;
  average_score: number;
  peak_score: number;
  consistency_score: number;
  crowd_reaction: number;
  choked: boolean;
};

type Battler = {
  id: string;
  stage_name: string;
  avatar_url?: string | null;
  sprite_set?: string[] | null;
};

type Props = {
  player: Battler;
  ai: Battler;
  segments: Segment[];
  rounds: Round[];
  winnerId?: string | null;
  onClose: () => void;
};

const SEGMENT_MS_BY_SPEED: Record<string, number> = {
  '0.5x': 2800,
  '1x': 1400,
  '2x': 700,
  '4x': 350,
};

function getAvatarUrl(b: Battler): string | null {
  if (b.avatar_url) return b.avatar_url;
  if (Array.isArray(b.sprite_set) && b.sprite_set.length > 0) return b.sprite_set[0] ?? null;
  return null;
}

function flagLabel(flag: string): { text: string; tone: 'good' | 'bad' | 'neutral' } {
  const f = flag.toLowerCase();
  if (f.includes('choke')) return { text: 'CHOKE!', tone: 'bad' };
  if (f.includes('stumble')) return { text: 'STUMBLE', tone: 'bad' };
  if (f.includes('haymaker') || f.includes('peak')) return { text: 'HAYMAKER!', tone: 'good' };
  if (f.includes('angle')) return { text: 'ANGLE HIT', tone: 'good' };
  return { text: flag.replaceAll('_', ' ').toUpperCase(), tone: 'neutral' };
}

export default function LiveBattleViewer({
  player,
  ai,
  segments,
  rounds,
  winnerId,
  onClose,
}: Props) {
  // Interleave segments so that segment_index 0 of round 1 plays for player then ai, etc.
  const timeline = useMemo(() => {
    const sorted = [...segments].sort((a, b) => {
      if (a.round_index !== b.round_index) return a.round_index - b.round_index;
      if (a.segment_index !== b.segment_index) return a.segment_index - b.segment_index;
      // player first for stable order
      return a.battler_id === player.id ? -1 : 1;
    });
    return sorted;
  }, [segments, player.id]);

  const [index, setIndex] = useState(-1); // -1 = pre-roll / intro
  const [speed, setSpeed] = useState<keyof typeof SEGMENT_MS_BY_SPEED>('1x');
  const [playing, setPlaying] = useState(true);

  // Advance the timeline
  useEffect(() => {
    if (!playing) return;
    if (index >= timeline.length) return;
    const ms = index === -1 ? 1500 : SEGMENT_MS_BY_SPEED[speed];
    const t = setTimeout(() => setIndex((i) => i + 1), ms);
    return () => clearTimeout(t);
  }, [index, playing, speed, timeline.length]);

  // Allow user to skip with arrow keys / escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      }
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(timeline.length, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(-1, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [timeline.length, onClose]);

  const playerScore = useMemo(
    () =>
      timeline
        .slice(0, Math.max(0, index + 1))
        .filter((s) => s.battler_id === player.id)
        .reduce((sum, s) => sum + s.segment_score, 0),
    [timeline, index, player.id]
  );
  const aiScore = useMemo(
    () =>
      timeline
        .slice(0, Math.max(0, index + 1))
        .filter((s) => s.battler_id === ai.id)
        .reduce((sum, s) => sum + s.segment_score, 0),
    [timeline, index, ai.id]
  );

  const currentSegment = index >= 0 && index < timeline.length ? timeline[index] : null;
  const currentRoundIndex = currentSegment?.round_index ?? 1;
  const totalRounds = Math.max(...rounds.map((r) => r.round_index), 1);
  const segmentProgress =
    timeline.length === 0 ? 0 : Math.min(100, ((index + 1) / timeline.length) * 100);
  const ended = index >= timeline.length;

  // Per-round running totals
  const roundScores = useMemo(() => {
    const out: Record<number, { player: number; ai: number }> = {};
    for (let r = 1; r <= totalRounds; r++) out[r] = { player: 0, ai: 0 };
    for (let i = 0; i <= Math.min(index, timeline.length - 1); i++) {
      const s = timeline[i];
      if (!out[s.round_index]) out[s.round_index] = { player: 0, ai: 0 };
      if (s.battler_id === player.id) out[s.round_index].player += s.segment_score;
      else out[s.round_index].ai += s.segment_score;
    }
    return out;
  }, [timeline, index, player.id, totalRounds]);

  const playerAvatarUrl = getAvatarUrl(player);
  const aiAvatarUrl = getAvatarUrl(ai);

  const playerWon = winnerId === player.id;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar: round + segment progress + close */}
      <div className="px-6 py-3 border-b-2 border-[#3a3d44] flex items-center justify-between bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-sm font-bold uppercase tracking-wider"
          >
            ✕ EXIT LIVE
          </button>
          <div className="text-zinc-500 text-xs uppercase tracking-widest">
            Round <span className="text-[#ff8c42] font-black text-base">{currentRoundIndex}</span> / {totalRounds}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="px-3 py-1 border border-[#3a3d44] text-zinc-300 hover:border-[#ff8c42] hover:text-[#ff8c42] text-xs uppercase tracking-wider font-bold"
          >
            {playing ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          <div className="flex border border-[#3a3d44]">
            {(['0.5x', '1x', '2x', '4x'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 text-xs uppercase tracking-wider font-bold ${
                  speed === s ? 'bg-[#ff8c42] text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Segment progress bar */}
      <div className="h-1 bg-[#1a1b1e]">
        <div
          className="h-1 bg-[#ff8c42] transition-all duration-300"
          style={{ width: `${segmentProgress}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Scoreboard */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center mb-10">
            {/* Player */}
            <div className="text-center">
              <Avatar url={playerAvatarUrl} size={180} className="mx-auto" alt={player.stage_name} />
              <h2 className="mt-3 text-3xl font-display font-black uppercase tracking-tight">
                {player.stage_name}
              </h2>
              <p className="text-xs text-[#ff8c42] uppercase tracking-widest mb-2">YOU</p>
              <div className="text-6xl font-display font-black text-[#ff8c42] tabular-nums">
                {playerScore.toFixed(1)}
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Cumulative</p>
            </div>
            {/* VS */}
            <div className="text-center">
              <div className="text-5xl font-display font-black uppercase tracking-wider text-zinc-700">
                VS
              </div>
            </div>
            {/* AI */}
            <div className="text-center">
              <Avatar url={aiAvatarUrl} size={180} className="mx-auto" alt={ai.stage_name} />
              <h2 className="mt-3 text-3xl font-display font-black uppercase tracking-tight">
                {ai.stage_name}
              </h2>
              <p className="text-xs text-red-500 uppercase tracking-widest mb-2">OPPONENT</p>
              <div className="text-6xl font-display font-black text-red-500 tabular-nums">
                {aiScore.toFixed(1)}
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Cumulative</p>
            </div>
          </div>

          {/* Current segment reveal */}
          {!ended && currentSegment && (
            <div className="bg-[#1a1b1e] border-2 border-[#3a3d44] p-6 mb-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest">
                    Round {currentSegment.round_index} • Segment {currentSegment.segment_index + 1}
                  </div>
                  <div className="text-2xl font-display font-black uppercase tracking-tight mt-1">
                    {currentSegment.battler_id === player.id ? player.stage_name : ai.stage_name}
                  </div>
                </div>
                <div
                  className={`text-5xl font-display font-black tabular-nums ${
                    currentSegment.battler_id === player.id ? 'text-[#ff8c42]' : 'text-red-500'
                  }`}
                >
                  {currentSegment.segment_score.toFixed(1)}
                </div>
              </div>
              {currentSegment.event_flags && currentSegment.event_flags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {currentSegment.event_flags.map((flag, i) => {
                    const { text, tone } = flagLabel(flag);
                    const toneClass =
                      tone === 'good'
                        ? 'bg-green-500/20 text-green-400 border-green-500/40'
                        : tone === 'bad'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40';
                    return (
                      <span
                        key={i}
                        className={`px-3 py-1 border text-xs font-display font-black uppercase tracking-widest ${toneClass}`}
                      >
                        {text}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Round-by-round running scoreboard */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {Array.from({ length: totalRounds }, (_, i) => i + 1).map((r) => {
              const playerRoundScore = roundScores[r]?.player ?? 0;
              const aiRoundScore = roundScores[r]?.ai ?? 0;
              const isActive = currentRoundIndex === r && !ended;
              const playerLeading = playerRoundScore > aiRoundScore;
              const aiLeading = aiRoundScore > playerRoundScore;
              return (
                <div
                  key={r}
                  className={`border-2 p-4 ${
                    isActive ? 'border-[#ff8c42] bg-[#ff8c42]/5' : 'border-[#3a3d44] bg-[#1a1b1e]'
                  }`}
                >
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
                    Round {r}
                  </div>
                  <div className="flex justify-between items-center text-lg font-display font-black tabular-nums">
                    <span className={playerLeading ? 'text-[#ff8c42]' : 'text-zinc-400'}>
                      {playerRoundScore.toFixed(1)}
                    </span>
                    <span className="text-zinc-700 text-xs">vs</span>
                    <span className={aiLeading ? 'text-red-500' : 'text-zinc-400'}>
                      {aiRoundScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* End-of-battle reveal */}
          {ended && (
            <div className="text-center py-10 border-4 border-[#ff8c42] bg-[#ff8c42]/10">
              <div className="text-sm text-zinc-400 uppercase tracking-widest mb-3">Final Decision</div>
              <div
                className={`text-7xl font-display font-black uppercase tracking-tighter mb-4 ${
                  playerWon ? 'text-[#ff8c42]' : 'text-red-500'
                }`}
              >
                {winnerId
                  ? playerWon
                    ? `${player.stage_name} WINS!`
                    : `${ai.stage_name} WINS`
                  : 'BATTLE CONCLUDED'}
              </div>
              <div className="text-zinc-400 text-sm uppercase tracking-widest">
                Final: <span className="text-[#ff8c42] font-black">{playerScore.toFixed(1)}</span>
                <span className="mx-3 text-zinc-700">|</span>
                <span className="text-red-500 font-black">{aiScore.toFixed(1)}</span>
              </div>
              <button
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-[#ff8c42] text-black font-display font-black uppercase tracking-wider hover:bg-[#ff9d5c] transition-colors"
              >
                VIEW FULL BREAKDOWN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-6 py-2 border-t border-[#3a3d44] text-[10px] text-zinc-600 uppercase tracking-widest text-center">
        Space: play/pause • ← → step • Esc: exit
      </div>
    </div>
  );
}
