// Viewer-neutral battle replay — corner A vs corner B with animated
// round-by-round score bars, haymaker/choke callouts and the verdict stamp.
// Adapted from the matchup replay patterns (animate-bar-fill / animate-stamp-in)
// but with zero "YOU" framing: this is for the crowd, not a competitor.
// Pure CSS animations → renders fine as a server component.
import MatchupMasthead from '@/components/battle/MatchupMasthead';
import CrowdStrip, { type Venue } from '@/components/battle/CrowdStrip';

export type SpectatorSide = {
  id: string;
  name: string;
  avatarUrl: string | null;
  tier: string | null;
  isReal: boolean;
};

export type ReplayRound = {
  roundIndex: number;
  // `content` (the round's content types, strongest first) is optional so this
  // stays backward-compatible — when a caller supplies it, the momentum read names
  // the approach that drove the round ("took it on PERSONALS"); without it the read
  // falls back to the stat story (haymaker / room / steadier / choke).
  a: { avg: number; peak: number; crowd: number; choke: boolean; haymaker: boolean; content?: string[] };
  b: { avg: number; peak: number; crowd: number; choke: boolean; haymaker: boolean; content?: string[] };
  winner: 'a' | 'b';
};

export default function SpectatorReplay({
  a,
  b,
  rounds,
  winnerId,
  decision,
  venue = 'urban',
  broadcast = null,
}: {
  a: SpectatorSide;
  b: SpectatorSide;
  rounds: ReplayRound[];
  winnerId: string | null;
  decision: string;
  venue?: Venue;
  broadcast?: 'ppv' | 'on_cam' | null;
}) {
  const aWon = winnerId === a.id;
  const bWon = !aWon && !!winnerId;
  const aRounds = rounds.filter((r) => r.winner === 'a').length;
  const bRounds = rounds.length - aRounds;

  // THE READ — teach the tape. Say WHO took each round and HOW, from the same
  // signals the round carries (haymaker landed, room swung it, steadier bar-for-
  // bar, or the opponent choked it away). Names the driving content when a caller
  // passes it. This is what turns a wall of bars into "here's what worked".
  const readMomentum = (r: ReplayRound): { text: string; edge: string } => {
    const win = r.winner === 'a' ? r.a : r.b;
    const lose = r.winner === 'a' ? r.b : r.a;
    const winName = r.winner === 'a' ? a.name : b.name;
    const loseName = r.winner === 'a' ? b.name : a.name;
    const winContent = (r.winner === 'a' ? r.a.content : r.b.content) ?? [];
    const lead = winContent.length ? winContent[0].replace(/_/g, ' ') : null;
    const crowdGap = win.crowd - lose.crowd;
    const edge = r.winner === 'a' ? '#E23A2E' : '#2F7DD1';
    let text: string;
    if (win.haymaker) {
      text = lead ? `${winName} took it on a haymaker off ${lead}` : `${winName} took it on a haymaker`;
    } else if (lose.choke) {
      text = `${winName} took it — ${loseName} choked it away`;
    } else if (crowdGap >= 12) {
      text = lead ? `${winName} won the room with ${lead}` : `${winName} won the room`;
    } else if (win.peak <= lose.peak) {
      text = `${winName} edged it on the steadier round`;
    } else {
      text = lead ? `${winName} took it on ${lead}` : `${winName} took it bar-for-bar`;
    }
    return { text, edge };
  };

  return (
    <div className="bg-[#101114] border-2 border-[#3a3d44] p-5 md:p-10">
      {/* VS header — red corner vs blue corner with the scoreline + verdict stamp */}
      <MatchupMasthead
        a={{ id: a.id, name: a.name, portrait: a.avatarUrl, tier: a.tier, isReal: a.isReal, won: aWon }}
        b={{ id: b.id, name: b.name, portrait: b.avatarUrl, tier: b.tier, isReal: b.isReal, won: bWon }}
        score={`${aRounds}–${bRounds}`}
        stamp={decision}
      />

      {/* round-by-round */}
      <div className="mt-10 space-y-5">
        {/* legend — the solid bar is the round average, the tick is the peak (haymaker) moment */}
        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 flex items-center gap-4 -mt-3 mb-1">
          <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-2 bg-zinc-500/60" /> ROUND AVG</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-[2px] h-3.5 bg-white shadow-[0_0_4px_rgba(255,255,255,0.7)]" /> PEAK MOMENT</span>
        </p>
        {rounds.map((r, i) => {
          // Scale to the highest PEAK, not just the highest average, so the peak
          // ticks land on the track. The gap between a bar's end (avg) and its tick
          // (peak) is the whole point — it shows who landed a haymaker vs. who was
          // steady-but-flat, the core of the segment-based sim.
          const max = Math.max(r.a.avg, r.b.avg, r.a.peak, r.b.peak, 1) * 1.05;
          // Haymaker-landed rule: the sim's haymaker flag is a peak ROLL, not proof
          // of a big moment. Only call it out when it WON the round — a peak that
          // got topped didn't land. (Chokes show for either battler regardless.)
          const landedHaymaker =
            r.a.haymaker && r.winner === 'a' ? a.name : r.b.haymaker && r.winner === 'b' ? b.name : null;
          const read = readMomentum(r);
          return (
            <div key={r.roundIndex} className="animate-fade-in" style={{ animationDelay: `${i * 1500}ms` }}>
              <div className="flex justify-between items-center mb-1 gap-2 flex-wrap">
                <p className="font-mono text-[12px] uppercase tracking-widest text-zinc-500">
                  ROUND {r.roundIndex}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {landedHaymaker && (
                    <span
                      className="font-display font-black text-xs uppercase text-[#E7B23C] animate-haymaker"
                      style={{ animationDelay: `${i * 1500 + 600}ms` }}
                    >
                      💥 HAYMAKER — {landedHaymaker}
                    </span>
                  )}
                  {(r.a.choke || r.b.choke) && (
                    <span
                      className="font-display font-black text-xs uppercase text-red-500 animate-haymaker"
                      style={{ animationDelay: `${i * 1500 + 600}ms` }}
                    >
                      😶 CHOKE — {r.a.choke ? a.name : b.name}
                    </span>
                  )}
                </div>
              </div>
              {/* THE READ — who took the round and how (teaches what worked) */}
              <div className="mb-2 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">The Read</span>
                <span
                  className="inline-flex items-center px-2.5 py-1 border-2 border-black bg-[#0F0F12] shadow-[2px_2px_0_rgba(0,0,0,.4)] font-display font-black text-[13px] uppercase tracking-wide text-zinc-100"
                  style={{ borderLeft: `4px solid ${read.edge}` }}
                >
                  {read.text}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-20 md:w-28 font-mono text-[12px] uppercase truncate text-[#ff6a5e]">{a.name}</span>
                <div className="flex-1 h-4 bg-[#18191c] border border-[#3a3d44] relative">
                  <div
                    className={`h-full animate-bar-fill ${r.a.choke ? 'bg-[#E23A2E]/25' : r.winner === 'a' ? 'bg-[#E23A2E]' : 'bg-[#E23A2E]/40'}`}
                    style={{
                      ['--bar-w' as string]: `${(r.a.avg / max) * 100}%`,
                      animationDelay: `${i * 1500 + 250}ms`,
                    }}
                  />
                  {r.a.peak > 0 && (
                    <span
                      className="absolute top-[-2px] bottom-[-2px] w-[2px] -ml-px bg-[#ffd0a8] shadow-[0_0_5px_rgba(255,140,66,0.9)] animate-fade-in"
                      style={{ left: `${(r.a.peak / max) * 100}%`, animationDelay: `${i * 1500 + 700}ms` }}
                      title={`Peak ${r.a.peak.toFixed(1)}`}
                    />
                  )}
                </div>
                <span className="w-10 font-mono text-xs text-zinc-300 text-right">{r.a.avg.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20 md:w-28 font-mono text-[12px] uppercase truncate text-[#5da2e8]">{b.name}</span>
                <div className="flex-1 h-4 bg-[#18191c] border border-[#3a3d44] relative">
                  <div
                    className={`h-full animate-bar-fill ${r.b.choke ? 'bg-[#2F7DD1]/25' : r.winner === 'b' ? 'bg-[#2F7DD1]' : 'bg-[#2F7DD1]/40'}`}
                    style={{
                      ['--bar-w' as string]: `${(r.b.avg / max) * 100}%`,
                      animationDelay: `${i * 1500 + 250}ms`,
                    }}
                  />
                  {r.b.peak > 0 && (
                    <span
                      className="absolute top-[-2px] bottom-[-2px] w-[2px] -ml-px bg-white shadow-[0_0_5px_rgba(255,255,255,0.85)] animate-fade-in"
                      style={{ left: `${(r.b.peak / max) * 100}%`, animationDelay: `${i * 1500 + 700}ms` }}
                      title={`Peak ${r.b.peak.toFixed(1)}`}
                    />
                  )}
                </div>
                <span className="w-10 font-mono text-xs text-zinc-300 text-right">{r.b.avg.toFixed(1)}</span>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-600 mt-1">
                CROWD {r.a.crowd}% / {r.b.crowd}% · PEAKS {r.a.peak.toFixed(1)} / {r.b.peak.toFixed(1)}
              </p>
              {/* THE ROOM — what the crowd was doing during this round */}
              <div className="mt-2">
                <CrowdStrip
                  score={Math.max(r.a.crowd ?? 0, r.b.crowd ?? 0)}
                  seed={`${a.id}-${b.id}-r${r.roundIndex}`}
                  venue={venue}
                  broadcast={r.roundIndex === 1 ? broadcast : null}
                  height={84}
                  perRow={8}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
