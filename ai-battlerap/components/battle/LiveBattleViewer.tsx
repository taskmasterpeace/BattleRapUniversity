'use client';

import { useEffect, useMemo, useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import {
  deriveLaneReactions,
  REACTION_DISPLAY,
  type LaneResult,
  type LeagueRaceDemographics,
} from '@/lib/game/crowdLanes';

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

type League = {
  name: string;
  short_code?: string | null;
  logo_url?: string | null;
};

type Props = {
  player: Battler;
  ai: Battler;
  segments: Segment[];
  rounds: Round[];
  winnerId?: string | null;
  onClose: () => void;
  /** League branding for the battle-night banner. */
  league?: League | null;
  /** Crowd race mix for the sprite reactions (from the league's audience). */
  raceDemographics?: LeagueRaceDemographics;
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

/**
 * A described MOMENT for a segment — so the tape reads as something happening,
 * not a number ticking up. Derived from the score band + event flags. Described
 * reactions only, never an invented bar (culture law). Seeded by segment id so a
 * given segment always narrates the same way.
 */
function momentLine(seg: Segment, name: string): { text: string; mood: 'choke' | 'haymaker' | 'hot' | 'mid' | 'cold' } {
  const flags = (seg.event_flags ?? []).map((f) => f.toLowerCase());
  const pick = (arr: string[]) => {
    let h = 0;
    for (let i = 0; i < seg.id.length; i++) h = (h * 31 + seg.id.charCodeAt(i)) >>> 0;
    return arr[h % arr.length];
  };
  if (flags.some((f) => f.includes('choke'))) {
    return { mood: 'choke', text: pick([
      `The words leave ${name}. Dead silence — the room turns.`,
      `${name} blanks. You can hear the AC. That round is gone.`,
      `It’s gone. ${name} freezes and the crowd groans as one.`,
    ]) };
  }
  if (flags.some((f) => f.includes('stumble'))) {
    return { mood: 'mid', text: pick([
      `${name} trips on the delivery — recovers, but the room caught it.`,
      `A fumble from ${name}. Not fatal, but the section noticed.`,
    ]) };
  }
  if (flags.some((f) => f.includes('haymaker') || f.includes('peak'))) {
    return { mood: 'haymaker', text: pick([
      `HAYMAKER. ${name} lands the one they’ll be clipping all week.`,
      `${name} drops the bomb — the front row is on its feet.`,
      `That’s the moment. ${name} times it to the crowd’s peak and the room erupts.`,
    ]) };
  }
  if (seg.segment_score >= 7) {
    return { mood: 'hot', text: pick([
      `${name} is in a rhythm now — the room’s leaning all the way in.`,
      `${name} stacking bars, the section riding every one.`,
    ]) };
  }
  if (seg.segment_score >= 4) {
    return { mood: 'mid', text: pick([
      `${name} keeps it moving. Solid, nothing that travels.`,
      `Competent stretch from ${name} — holds serve, doesn’t take over.`,
    ]) };
  }
  return { mood: 'cold', text: pick([
    `${name}’s bars aren’t landing. The room stays quiet.`,
    `That didn’t connect. ${name} loses the section for a beat.`,
  ]) };
}

const MOOD_CARD: Record<string, string> = {
  choke: 'border-red-500/60 bg-red-500/5',
  haymaker: 'border-amber-500/60 bg-amber-500/5',
  hot: 'border-[#ff8c42]/50 bg-[#ff8c42]/5',
  mid: 'border-[#3a3d44] bg-[#1a1b1e]',
  cold: 'border-zinc-700 bg-[#141416]',
};

/** Portrait treatment: the battler on the mic reacts to how the moment lands;
 *  the one waiting their turn dims out. Makes the static faces feel alive. */
function portraitFx(isActive: boolean, mood: string | null): string {
  if (!isActive) return 'opacity-45 grayscale-[45%] scale-95 transition-all duration-500';
  const base = 'transition-all duration-300 ring-4 ';
  switch (mood) {
    case 'haymaker': return base + 'ring-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.6)] scale-110';
    case 'choke':    return base + 'ring-red-500 grayscale opacity-70 scale-95';
    case 'hot':      return base + 'ring-[#ff8c42] shadow-[0_0_28px_rgba(255,140,66,0.45)] scale-105';
    case 'cold':     return base + 'ring-zinc-600 opacity-80 scale-100';
    default:         return base + 'ring-[#ff8c42]/70 scale-105'; // mid
  }
}

/** How each section of the room takes THIS beat — with real crowd-member
 *  sprites (the same model the results-page crowd strip uses). The room figure
 *  is derived from the beat itself (the tape carries score + flags). */
function laneResultsForSegment(
  seg: Segment | null,
  raceDemographics?: LeagueRaceDemographics
): LaneResult[] {
  const flags = (seg?.event_flags ?? []).map((f) => f.toLowerCase());
  const isHaymaker = flags.some((f) => f.includes('haymaker') || f.includes('peak'));
  const choked = flags.some((f) => f.includes('choke'));
  let base = seg ? seg.segment_score * 8 : 40; // a 7.0 reads warm, a 9.0 pops
  if (isHaymaker) base += 20;
  if (choked) base -= 40;
  base = Math.max(0, Math.min(100, base));
  return deriveLaneReactions(
    {
      battleId: seg?.id ?? 'preroll', // segment id → stable reactions per beat
      roundIndex: seg?.round_index ?? 1,
      battlerId: seg?.battler_id ?? 'x',
      crowdReaction: base,
      peakScore: isHaymaker ? 9 : seg?.segment_score ?? 4,
      choked,
      styleTags: [],
      writingWeight: 0.5,
      performanceWeight: 0.5,
    },
    raceDemographics
  );
}

// Per-segment mood badge over a battler's portrait. NB: league battle rap is
// acapella — no "on the mic" (that was a culture-rule violation). And the "cold"
// label deliberately avoids the word "room" so it doesn't clash with the
// cumulative WHO-OWNS-THE-ROOM meter below the scoreboard.
const MOOD_BADGE: Record<string, { label: string; tone: string }> = {
  haymaker: { label: '💥 HAYMAKER', tone: 'bg-amber-400 text-black' },
  choke:    { label: '💀 CHOKING', tone: 'bg-red-500 text-white' },
  hot:      { label: '🔥 ON ONE', tone: 'bg-[#ff8c42] text-black' },
  cold:     { label: 'CROWD WENT COLD', tone: 'bg-zinc-700 text-zinc-300' },
  mid:      { label: 'IN THE POCKET', tone: 'bg-[#ff8c42] text-black' },
};

export default function LiveBattleViewer({
  player,
  ai,
  segments,
  rounds,
  winnerId,
  onClose,
  league,
  raceDemographics,
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

  // Equal-footing totals for the room-ownership meter. The timeline is
  // interleaved call-and-response, so mid-exchange one battler is a segment ahead
  // of the other; judging "who owns the room" on those lopsided cumulatives named
  // the wrong leader (e.g. "X IS EDGING IT" the instant before the other drops a
  // haymaker they hadn't performed yet). Compare only through the segments BOTH
  // have now performed.
  const [pairedPlayerScore, pairedAiScore] = useMemo(() => {
    const revealed = timeline.slice(0, Math.max(0, index + 1));
    const p = revealed.filter((s) => s.battler_id === player.id).map((s) => s.segment_score);
    const a = revealed.filter((s) => s.battler_id === ai.id).map((s) => s.segment_score);
    const n = Math.min(p.length, a.length);
    const sum = (arr: number[]) => arr.slice(0, n).reduce((x, y) => x + y, 0);
    return [sum(p), sum(a)];
  }, [timeline, index, player.id, ai.id]);

  const currentSegment = index >= 0 && index < timeline.length ? timeline[index] : null;
  // Who's on the mic right now, and how it's landing — drives the portrait reactions.
  const activeIsPlayer = currentSegment?.battler_id === player.id;
  const activeMood = currentSegment
    ? momentLine(currentSegment, activeIsPlayer ? player.stage_name : ai.stage_name).mood
    : null;
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

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* League banner — the stage you're battling on tonight. */}
          {league && (
            <div className="mb-6 md:mb-8 flex items-center justify-center gap-3 md:gap-4 border-y-2 border-[#3a3d44] bg-gradient-to-r from-transparent via-[#ff8c42]/5 to-transparent py-2.5 md:py-3">
              {league.logo_url && (
                <img
                  src={league.logo_url}
                  alt=""
                  className="w-8 h-8 md:w-11 md:h-11 object-contain [image-rendering:pixelated] shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="text-center min-w-0">
                <div className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.3em] text-[#ff8c42]">Battle Night · Live</div>
                <div className="font-display font-black uppercase tracking-tight text-lg md:text-2xl text-zinc-100 truncate">
                  {league.name}
                </div>
              </div>
              {league.short_code && (
                <span className="hidden sm:inline-block px-2 py-0.5 border-2 border-[#3a3d44] font-mono text-[10px] md:text-xs text-zinc-400 tracking-widest shrink-0">
                  {league.short_code}
                </span>
              )}
            </div>
          )}

          {/* Scoreboard */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 md:gap-6 items-center mb-8 md:mb-10">
            {/* Player */}
            <div className="text-center min-w-0">
              <div className="relative inline-block w-[84px] md:w-[180px] aspect-square">
                <Avatar url={playerAvatarUrl} size={180} className={`!w-full !h-full ${ended ? (playerWon ? 'ring-4 ring-[#ff8c42] shadow-[0_0_44px_rgba(255,140,66,0.65)] scale-110 transition-all duration-500' : 'opacity-40 grayscale scale-95 transition-all duration-500') : portraitFx(!!activeIsPlayer, activeMood)}`} alt={player.stage_name} />
                {activeIsPlayer && !ended && activeMood && (
                  <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 md:px-2.5 py-0.5 text-[8px] md:text-[10px] font-display font-black uppercase tracking-wider ${MOOD_BADGE[activeMood].tone}`}>
                    {MOOD_BADGE[activeMood].label}
                  </span>
                )}
              </div>
              <h2 className="mt-2 md:mt-3 text-base md:text-3xl font-display font-black uppercase tracking-tight truncate">
                {player.stage_name}
              </h2>
              <p className="text-[10px] md:text-xs text-[#ff8c42] uppercase tracking-widest mb-1 md:mb-2">YOU</p>
              <div className="text-3xl md:text-6xl font-display font-black text-[#ff8c42] tabular-nums">
                {playerScore.toFixed(1)}
              </div>
              <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-widest">Cumulative</p>
            </div>
            {/* VS */}
            <div className="text-center px-1">
              <div className="text-xl md:text-5xl font-display font-black uppercase tracking-wider text-zinc-700">
                VS
              </div>
            </div>
            {/* AI */}
            <div className="text-center min-w-0">
              <div className="relative inline-block w-[84px] md:w-[180px] aspect-square">
                <Avatar url={aiAvatarUrl} size={180} className={`!w-full !h-full ${ended ? (!playerWon && winnerId ? 'ring-4 ring-red-500 shadow-[0_0_44px_rgba(239,68,68,0.6)] scale-110 transition-all duration-500' : 'opacity-40 grayscale scale-95 transition-all duration-500') : portraitFx(!activeIsPlayer && !!currentSegment, activeMood)}`} alt={ai.stage_name} />
                {!activeIsPlayer && currentSegment && !ended && activeMood && (
                  <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 md:px-2.5 py-0.5 text-[8px] md:text-[10px] font-display font-black uppercase tracking-wider ${MOOD_BADGE[activeMood].tone}`}>
                    {MOOD_BADGE[activeMood].label}
                  </span>
                )}
              </div>
              <h2 className="mt-2 md:mt-3 text-base md:text-3xl font-display font-black uppercase tracking-tight truncate">
                {ai.stage_name}
              </h2>
              <p className="text-[10px] md:text-xs text-red-500 uppercase tracking-widest mb-1 md:mb-2">OPPONENT</p>
              <div className="text-3xl md:text-6xl font-display font-black text-red-500 tabular-nums">
                {aiScore.toFixed(1)}
              </div>
              <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-widest">Cumulative</p>
            </div>
          </div>

          {/* WHO OWNS THE ROOM — a live crowd-ownership meter that shifts as the
              tape plays, so the empty middle reads as a room reacting. */}
          {(() => {
            const total = pairedPlayerScore + pairedAiScore;
            const playerPct = total > 0 ? (pairedPlayerScore / total) * 100 : 50;
            const diff = playerPct - 50;
            const leaderIsPlayer = diff >= 0;
            const leader = leaderIsPlayer ? player.stage_name : ai.stage_name;
            const mag = Math.abs(diff);
            const verdict =
              total === 0 ? 'THE ROOM IS WAITING'
              : mag < 5 ? 'THE ROOM IS SPLIT'
              : mag < 14 ? `${leader.toUpperCase()} IS EDGING IT`
              : mag < 26 ? `${leader.toUpperCase()} OWNS THE ROOM`
              : `${leader.toUpperCase()} RUNNING AWAY WITH IT`;
            return (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">THE ROOM</span>
                  <span className={`text-[11px] font-display font-black uppercase tracking-wider ${
                    total === 0 ? 'text-zinc-600' : mag < 5 ? 'text-zinc-300' : leaderIsPlayer ? 'text-[#ff8c42]' : 'text-red-500'
                  }`}>
                    {verdict}
                  </span>
                </div>
                <div className="relative h-3 bg-red-500/25 overflow-hidden border border-[#3a3d44]">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#ff8c42] transition-all duration-500 ease-out"
                    style={{ width: `${playerPct}%` }}
                  />
                  {/* center line */}
                  <div className="absolute inset-y-0 left-1/2 w-px bg-black/50" />
                </div>
              </div>
            );
          })()}

          {/* THE SECTIONS — the room reacts in lanes, beat by beat, with real
              crowd-member sprites drawn from the league's audience. */}
          {!ended && (
            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-8">
              {laneResultsForSegment(currentSegment, raceDemographics).map((res) => {
                const d = REACTION_DISPLAY[res.reaction];
                return (
                  <div
                    key={res.lane.id}
                    className={`border-2 p-2 md:p-3 flex flex-col items-center gap-1.5 transition-colors duration-300 ${
                      res.reaction === 'loved' ? 'border-[#ff8c42]/50 bg-[#ff8c42]/5'
                      : res.reaction === 'cold' ? 'border-sky-500/40 bg-sky-500/5'
                      : 'border-[#3a3d44] bg-[#1a1b1e]'
                    }`}
                    title={`${res.lane.name}: ${d.label} (${res.score}/100)`}
                  >
                    <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0 bg-[#18191c] border-2 border-[#3a3d44] overflow-hidden">
                      <img
                        src={res.sprite}
                        alt={`${res.lane.name} crowd member — ${d.label}`}
                        className="w-full h-full object-cover [image-rendering:pixelated]"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                      <span className="absolute bottom-0 right-0 text-xs md:text-sm bg-[#18191c]/80 px-0.5 leading-none">{d.emoji}</span>
                    </div>
                    <div className="text-[9px] md:text-[10px] font-display font-black uppercase tracking-wider text-zinc-300 truncate w-full text-center">{res.lane.name}</div>
                    <div className={`text-[9px] md:text-[10px] font-mono uppercase tracking-wide ${d.tone}`}>{d.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Current segment reveal */}
          {!ended && currentSegment && (() => {
            const segName = currentSegment.battler_id === player.id ? player.stage_name : ai.stage_name;
            const moment = momentLine(currentSegment, segName);
            return (
            // key={index} re-mounts per beat so the entrance animation replays,
            // giving the tape a rhythm instead of an instant swap.
            <div key={index} className={`beat-in border-2 p-4 md:p-6 mb-8 transition-colors duration-300 ${MOOD_CARD[moment.mood]}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest">
                    Round {currentSegment.round_index} • Segment {currentSegment.segment_index + 1}
                  </div>
                  <div className="text-2xl font-display font-black uppercase tracking-tight mt-1">
                    {segName}
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
              {/* The moment — described, never a bar */}
              <p className={`text-base md:text-lg leading-snug ${
                moment.mood === 'choke' ? 'text-red-300'
                : moment.mood === 'haymaker' ? 'text-amber-300'
                : moment.mood === 'cold' ? 'text-zinc-500'
                : 'text-zinc-200'
              }`}>
                {moment.text}
              </p>
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
            );
          })()}

          {/* Round-by-round card: shows who TOOK each round (the real tally),
              which round is live, and which are still to come. */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
            {Array.from({ length: totalRounds }, (_, i) => i + 1).map((r) => {
              const playerRoundScore = roundScores[r]?.player ?? 0;
              const aiRoundScore = roundScores[r]?.ai ?? 0;
              const isActive = currentRoundIndex === r && !ended;
              const decided = (r < currentRoundIndex || ended) && (playerRoundScore > 0 || aiRoundScore > 0);
              const playerTook = decided && playerRoundScore > aiRoundScore;
              const aiTook = decided && aiRoundScore > playerRoundScore;
              return (
                <div
                  key={r}
                  className={`border-2 p-3 md:p-4 transition-colors ${
                    isActive ? 'border-[#ff8c42] bg-[#ff8c42]/5'
                    : decided ? 'border-[#3a3d44] bg-[#1a1b1e]'
                    : 'border-[#2a2b2e] bg-[#141416]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 md:mb-2">
                    <span className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest">Round {r}</span>
                    {isActive && <span className="text-[9px] font-mono text-[#ff8c42] uppercase tracking-wider animate-pulse">● LIVE</span>}
                    {decided && <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">FINAL</span>}
                  </div>
                  <div className="flex justify-between items-center text-base md:text-lg font-display font-black tabular-nums">
                    <span className={playerTook ? 'text-[#ff8c42]' : decided ? 'text-zinc-500' : 'text-zinc-600'}>
                      {decided || isActive ? playerRoundScore.toFixed(1) : '—'}
                    </span>
                    <span className="text-zinc-700 text-[10px] md:text-xs">vs</span>
                    <span className={aiTook ? 'text-red-500' : decided ? 'text-zinc-500' : 'text-zinc-600'}>
                      {decided || isActive ? aiRoundScore.toFixed(1) : '—'}
                    </span>
                  </div>
                  {/* Who took it — the tally you can watch build. */}
                  {decided && (playerTook || aiTook) && (
                    <div className={`mt-2 text-center text-[9px] md:text-[10px] font-display font-black uppercase tracking-wider ${playerTook ? 'text-[#ff8c42]' : 'text-red-500'}`}>
                      ✓ {(playerTook ? player.stage_name : ai.stage_name).slice(0, 12)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* End-of-battle reveal — round scoreline + the culture's verdict */}
          {ended && (() => {
            // Battles are decided round-by-round (best 2 of 3), not on point totals.
            let pw = 0, aw = 0;
            for (let r = 1; r <= totalRounds; r++) {
              const p = roundScores[r]?.player ?? 0;
              const a = roundScores[r]?.ai ?? 0;
              if (p > a) pw++; else if (a > p) aw++;
            }
            const winnerRounds = playerWon ? pw : aw;
            const loserRounds = playerWon ? aw : pw;
            const scoreline = `${winnerRounds}-${loserRounds}`;
            const winnerName = playerWon ? player.stage_name : ai.stage_name;
            const loserName = playerWon ? ai.stage_name : player.stage_name;
            const total = playerScore + aiScore;
            const margin = total > 0 ? Math.abs(playerScore - aiScore) / total : 0; // 0..1
            // Verdict vocabulary (research-battle-dynamics §2).
            let verdict: string, sub: string;
            if (loserRounds === 0 && margin > 0.28) { verdict = 'BODY BAG'; sub = `${winnerName} left nothing on the table.`; }
            else if (loserRounds === 0) { verdict = 'CLEAN SWEEP'; sub = `${winnerName} took every round.`; }
            else if (margin < 0.08) { verdict = 'RAZOR THIN'; sub = `They'll be running this one back. ${winnerName} edged it.`; }
            else { verdict = 'THE DECISION'; sub = `${winnerName} took it, but ${loserName} had moments.`; }
            const accent = playerWon ? 'text-[#ff8c42]' : 'text-red-500';
            const border = playerWon ? 'border-[#ff8c42]' : 'border-red-500';
            const bg = playerWon ? 'bg-[#ff8c42]/10' : 'bg-red-500/10';
            return (
            <div className={`text-center py-10 border-4 ${border} ${bg}`}>
              <div className="text-[11px] text-zinc-500 uppercase tracking-[0.3em] mb-1">The Streets Decided</div>
              {/* Scoreline is the headline — how battles are actually scored. */}
              <div className={`font-display font-black tabular-nums leading-none ${accent}`} style={{ fontSize: 'clamp(64px, 12vw, 130px)' }}>
                {scoreline}
              </div>
              <div className={`text-3xl md:text-5xl font-display font-black uppercase tracking-tighter mt-1 ${accent}`}>
                {verdict}
              </div>
              <div className="text-lg font-display font-black uppercase tracking-tight text-zinc-200 mt-3">
                {winnerName} <span className="text-zinc-500">over</span> {loserName}
              </div>
              <p className="text-sm text-zinc-400 mt-2 max-w-lg mx-auto">{sub}</p>
              <button
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-[#ff8c42] text-black font-display font-black uppercase tracking-wider hover:bg-[#ff9d5c] transition-colors"
              >
                VIEW FULL BREAKDOWN
              </button>
            </div>
            );
          })()}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-6 py-2 border-t border-[#3a3d44] text-[10px] text-zinc-600 uppercase tracking-widest text-center">
        Space: play/pause • ← → step • Esc: exit
      </div>

      <style jsx>{`
        @keyframes beatIn {
          from { opacity: 0; transform: translateY(10px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .beat-in { animation: beatIn 0.28s cubic-bezier(0.2, 0.7, 0.2, 1); }
        @media (prefers-reduced-motion: reduce) {
          .beat-in { animation: none; }
        }
      `}</style>
    </div>
  );
}
