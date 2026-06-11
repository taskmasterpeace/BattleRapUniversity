'use client';

/**
 * TheInternet — post-battle online reaction. Battles don't just "appear"
 * online for everybody: footage drops, the blogs write it up, and the
 * timeline starts arguing. This section shows:
 *   - the recap article link (or "bloggers are typing" if not out yet)
 *   - view numbers (flagged EARLY NUMBERS if the battle completed <24h ago)
 *   - 4-6 simulated fan takes derived deterministically from real round
 *     data (haymakers, chokes, verdict, crowd scores) — seeded by battle id
 *     so the same battle always shows the same takes.
 */

import Link from 'next/link';
import { fnv1a } from '@/lib/game/crowdLanes';

type RoundFact = {
  round_index: number;
  battler_id: string;
  crowd_reaction: number;
  peak_score: number;
  choked: boolean;
};

type SegmentFact = {
  round_index: number;
  battler_id: string;
  event_flags: string[];
};

type RecapArticle = {
  slug: string;
  title: string;
  published_at: string;
} | null;

type ViewsData = {
  total_views: number;
  view_tier: 'low' | 'mid' | 'top' | 'goat';
  viral_multiplier: number;
  created_at?: string;
} | null;

type Props = {
  battleId: string;
  playerName: string;
  opponentName: string;
  playerId: string;
  winnerId: string | null;
  verdict: string; // "3-0" | "2-1"
  rounds: RoundFact[];
  segments: SegmentFact[];
  recapArticle: RecapArticle;
  views: ViewsData;
};

const HANDLES = [
  '@barsonly',
  '@PenGameRespecter',
  '@hoodclassics',
  '@LeaguesideJay',
  '@QueenOfTheCulture',
  '@CasualWatcher99',
  '@SmokeDetector_BR',
  '@ThirdRowTina',
  '@ClipChannelKing',
  '@DebatableDee',
];

type FanTake = { handle: string; text: string; heat: number };

function buildTakes(props: Props): FanTake[] {
  const { battleId, playerName, opponentName, playerId, winnerId, verdict, rounds, segments } = props;
  const seed = fnv1a(battleId);
  const nameOf = (id: string) => (id === playerId ? playerName : opponentName);
  const winnerName = winnerId ? nameOf(winnerId) : playerName;
  const loserName = winnerName === playerName ? opponentName : playerName;

  const candidates: string[] = [];

  // Haymaker takes (real segments)
  const haymakers = segments.filter((s) => s.event_flags.includes('haymaker'));
  for (const h of haymakers.slice(0, 2)) {
    candidates.push(`round ${h.round_index} from ${nameOf(h.battler_id)} was DISGUSTING 🔥🔥`);
    candidates.push(`that haymaker in round ${h.round_index} had the whole room on their feet, ${nameOf(h.battler_id)} is HIM`);
  }

  // Choke takes (real rounds)
  const chokes = rounds.filter((r) => r.choked);
  for (const c of chokes.slice(0, 2)) {
    candidates.push(`${nameOf(c.battler_id)} CHOKED in round ${c.round_index} 💀 you cannot come back from that`);
    candidates.push(`somebody check on ${nameOf(c.battler_id)} after that round ${c.round_index}... brutal`);
  }

  // Verdict takes
  if (verdict === '3-0') {
    candidates.push(`clean 30. no debate. ${winnerName} smoked that 🚬`);
    candidates.push(`${loserName} got BODIED, who booked this matchup??`);
  } else {
    candidates.push(`2-1 either way, RUN IT BACK 🗣️`);
    candidates.push(`the room had ${winnerName} but I had ${loserName} 2-1. debate me`);
  }

  // Crowd-score takes
  const hot = rounds.find((r) => r.crowd_reaction >= 85);
  if (hot) candidates.push(`the building was SHAKING when ${nameOf(hot.battler_id)} hit round ${hot.round_index}`);
  const cold = rounds.find((r) => r.crowd_reaction <= 30);
  if (cold) candidates.push(`you could hear a pin drop in ${nameOf(cold.battler_id)}'s round ${cold.round_index} 🧊 rough night`);

  // Generic filler so we always reach 4+
  candidates.push(`${winnerName} different lately. leveling up every battle fr`);
  candidates.push(`ngl I had it closer than the cards did 👀`);
  candidates.push(`waiting on the full tape before I give a verdict, clips don't tell the story`);

  // Deterministic selection: rotate through candidates from a seeded offset
  const count = Math.min(4 + (seed % 3), candidates.length); // 4-6
  const takes: FanTake[] = [];
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    let idx = (seed + i * 7) % candidates.length;
    while (used.has(idx)) idx = (idx + 1) % candidates.length;
    used.add(idx);
    takes.push({
      handle: HANDLES[(seed + i * 13) % HANDLES.length],
      text: candidates[idx],
      heat: 12 + ((seed >> (i + 2)) % 988), // fake like-count, deterministic
    });
  }
  return takes;
}

function formatViews(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

const TIER_TONE: Record<string, string> = {
  low: 'text-zinc-400 border-zinc-600',
  mid: 'text-blue-400 border-blue-500/40',
  top: 'text-purple-400 border-purple-500/40',
  goat: 'text-amber-400 border-amber-500/40',
};

export default function TheInternet(props: Props) {
  const { recapArticle, views } = props;
  const takes = buildTakes(props);

  const isEarly =
    !!views?.created_at &&
    Date.now() - new Date(views.created_at).getTime() < 24 * 60 * 60 * 1000;

  return (
    <div className="bg-[#101114] border-2 border-[#3a3d44] p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-lg font-display font-black uppercase tracking-tighter text-[#ff8c42]">
          THE INTERNET
        </h3>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          POST-BATTLE TIMELINE
        </span>
      </div>

      {/* Views row */}
      <div className="flex items-center justify-between bg-[#18191c] border-2 border-[#3a3d44] px-3 py-2 mb-3">
        {views ? (
          <>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-display font-black tracking-tighter text-zinc-100">
                {formatViews(views.total_views)}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">VIEWS</span>
              {views.viral_multiplier > 1.5 && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  🔥 VIRAL ×{views.viral_multiplier.toFixed(1)}
                </span>
              )}
            </div>
            {isEarly ? (
              <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 border-2 border-yellow-500/40 px-2 py-1">
                EARLY NUMBERS — FULL RELEASE PENDING
              </span>
            ) : (
              <span
                className={`text-[10px] font-mono uppercase tracking-widest border-2 px-2 py-1 ${TIER_TONE[views.view_tier]}`}
              >
                {views.view_tier.toUpperCase()} TIER
              </span>
            )}
          </>
        ) : (
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            FOOTAGE PROCESSING — NUMBERS DROP WHEN THE TAPE GOES LIVE
          </span>
        )}
      </div>

      {/* Recap article */}
      {recapArticle ? (
        <Link
          href={`/media/${recapArticle.slug}`}
          className="block bg-[#18191c] border-2 border-[#3a3d44] px-3 py-2 mb-3 hover:border-[#ff8c42]/60 transition-colors group"
        >
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-0.5">
            📰 BLOG RECAP
          </div>
          <div className="text-sm font-display font-black uppercase tracking-wide text-zinc-200 group-hover:text-[#ff8c42] transition-colors">
            {recapArticle.title} →
          </div>
        </Link>
      ) : (
        <div className="bg-[#18191c] border-2 border-dashed border-[#3a3d44] px-3 py-2 mb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            📰 RECAP PENDING — THE BLOGGERS ARE TYPING…
          </span>
        </div>
      )}

      {/* Fan takes */}
      <div className="space-y-2">
        {takes.map((take, i) => (
          <div key={i} className="bg-[#18191c] border-2 border-[#3a3d44] px-3 py-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-mono text-[#ff8c42]">{take.handle}</span>
              <span className="text-[10px] font-mono text-zinc-600">♥ {take.heat}</span>
            </div>
            <p className="text-sm text-zinc-300 leading-snug">{take.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
