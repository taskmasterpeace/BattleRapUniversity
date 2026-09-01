'use client';

// Round breakdown in the Flyer System language: red corner vs blue corner
// segment bars, poster-plate stat cards, house chips. (Owner 2026-08-31:
// "obsess over the visuals... text is too small" — everything here sized up.)
import { BattleRound, BattleSegment } from '@/lib/models';
import {
  ContentType,
  DeliveryType,
  PerformanceType,
  getContentType,
  getDeliveryType,
  getPerformanceType,
} from '@/lib/game/contentTypes';

const RED = '#E23A2E';
const BLUE = '#2F7DD1';
const GOLD = '#E7B23C';

// battle_segments carries the per-segment content the sim actually assigned
// (primary_content_type / delivery_type / content_effectiveness / crowd_reaction).
// Those columns come back on SELECT * but aren't declared on the BattleSegment
// type — read them here to tell the player which of THEIR picks drove the tape.
type SegmentWithContent = BattleSegment & {
  primary_content_type?: string | null;
  secondary_content_type?: string | null;
  delivery_type?: string | null;
  performance_type?: string | null;
  content_effectiveness?: number | null;
  crowd_reaction?: number | null;
};

type LandedTone = 'haymaker' | 'room' | 'flat';
interface LandedRead {
  tone: LandedTone;
  content: string; // raw content-type id
  headline: string;
  metric: string;
}

interface RoundResultsBreakdownProps {
  playerRound: BattleRound & {
    contentSelection?: {
      content_types: string[];
      delivery_types: string[];
      performance_types: string[];
    };
  };
  aiRound: BattleRound & {
    contentSelection?: {
      content_types: string[];
      delivery_types: string[];
      performance_types: string[];
    };
  };
  playerSegments: BattleSegment[];
  aiSegments: BattleSegment[];
  winner: 'player' | 'ai' | 'tie';
  playerName: string;
  aiName: string;
}

export function RoundResultsBreakdown({
  playerRound,
  aiRound,
  playerSegments,
  aiSegments,
  winner,
  playerName,
  aiName,
}: RoundResultsBreakdownProps) {
  const getMultiplierColor = (value?: number) => {
    if (!value) return '#A6A8B0';
    if (value >= 1.2) return '#35C46B';
    if (value >= 0.9) return '#F4F4F6';
    if (value >= 0.7) return '#F5731A';
    return RED;
  };

  const formatTypeName = (typeId: string): string => {
    try {
      const contentDef = getContentType(typeId as ContentType);
      if (contentDef) return contentDef.name;
    } catch {}
    try {
      const deliveryDef = getDeliveryType(typeId as DeliveryType);
      if (deliveryDef) return deliveryDef.name;
    } catch {}
    try {
      const performanceDef = getPerformanceType(typeId as PerformanceType);
      if (performanceDef) return performanceDef.name;
    } catch {}
    return typeId.replace(/_/g, ' ');
  };

  // Segment scores live on a ~0-15 scale, NOT 0-100. Scale bars to the round's
  // actual top score (with headroom) so they read as real bars.
  const allScores = [
    ...playerSegments.map((s) => s.segment_score),
    ...aiSegments.map((s) => s.segment_score),
  ];
  const maxScore = Math.max(...allScores, 1) * 1.05;

  // Headline moment of a segment (haymaker > choke > stumble). Haymaker only
  // badges on the segment WINNER — a peak that got topped didn't land.
  const segEvent = (
    pFlags: string[] = [],
    aFlags: string[] = [],
    playerWon = true
  ): { label: string; cls: string } | null => {
    const segWinner = playerWon
      ? { flags: pFlags, name: playerName }
      : { flags: aFlags, name: aiName };
    if (segWinner.flags.includes('haymaker')) {
      return { label: `★ ${segWinner.name} HAYMAKER`, cls: 'bg-[#E7B23C] text-black' };
    }
    const ordered: { flags: string[]; name: string }[] = playerWon
      ? [{ flags: pFlags, name: playerName }, { flags: aFlags, name: aiName }]
      : [{ flags: aFlags, name: aiName }, { flags: pFlags, name: playerName }];
    for (const { flags, name } of ordered) {
      if (flags.includes('choke')) return { label: `✗ ${name} CHOKED`, cls: 'bg-[#E23A2E] text-white' };
    }
    if (pFlags.includes('stumble') || aFlags.includes('stumble'))
      return { label: 'STUMBLE', cls: 'bg-zinc-700 text-zinc-200' };
    return null;
  };

  /** One battler's stat plate — poster numbers over a corner-colored edge. */
  const StatPlate = ({
    name,
    round,
    corner,
  }: {
    name: string;
    round: RoundResultsBreakdownProps['playerRound'];
    corner: string;
  }) => (
    <div
      className="fs bg-[#101114] border-2 border-black p-6 shadow-[4px_4px_0_rgba(0,0,0,.45)]"
      style={{ borderTop: `4px solid ${corner}` }}
    >
      <h3
        className="uppercase leading-none mb-5 truncate"
        style={{ fontFamily: 'var(--font-poster)', fontSize: 26, color: '#F4F4F6', textShadow: '2px 2px 0 #000' }}
      >
        {name}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {(
          [
            { k: 'ROUND AVG', v: round.average_score.toFixed(1), c: '#F5731A' },
            { k: 'PEAK', v: round.peak_score.toFixed(1), c: '#E7B23C' },
            { k: 'CONSISTENCY', v: round.consistency_score.toFixed(1), c: '#35C46B' },
            { k: 'CROWD', v: `${round.crowd_reaction.toFixed(0)}%`, c: corner },
          ] as const
        ).map((s) => (
          <div key={s.k} className="bg-[#17181C] border border-black px-3 py-2.5" style={{ borderTop: `2px solid ${s.c}` }}>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-1">{s.k}</div>
            <div
              className="leading-none"
              style={{ fontFamily: 'var(--font-poster)', fontSize: 30, color: s.c, textShadow: '2px 2px 0 #000' }}
            >
              {s.v}
            </div>
          </div>
        ))}
      </div>
      {round.choked && (
        <div className="mt-4 py-2 bg-[#E23A2E] border-2 border-black text-center shadow-[2px_2px_0_rgba(0,0,0,.5)]">
          <span
            className="uppercase text-black"
            style={{ fontFamily: 'var(--font-poster)', fontSize: 18 }}
          >
            ✗ CHOKED
          </span>
        </div>
      )}
    </div>
  );

  /** House chip — hard borders, display type. */
  const Chip = ({ label, edge }: { label: string; edge: string }) => (
    <span
      className="px-2.5 py-1.5 bg-[#17181C] border border-black text-zinc-200 text-sm font-display font-bold uppercase tracking-wide shadow-[2px_2px_0_rgba(0,0,0,.35)]"
      style={{ borderLeft: `3px solid ${edge}` }}
    >
      {label}
    </span>
  );

  /** One side's content-effectiveness plate. */
  const ContentPlate = ({
    title,
    round,
    corner,
  }: {
    title: string;
    round: RoundResultsBreakdownProps['playerRound'];
    corner: string;
  }) => (
    <div
      className="fs bg-[#101114] border-2 border-black p-6 shadow-[4px_4px_0_rgba(0,0,0,.45)]"
      style={{ borderTop: `4px solid ${corner}` }}
    >
      <h3 className="text-lg font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-5">{title}</h3>
      {round.contentSelection ? (
        <div className="space-y-4">
          {(
            [
              { label: 'CONTENT', items: round.contentSelection.content_types },
              { label: 'DELIVERY', items: round.contentSelection.delivery_types },
              { label: 'PERFORMANCE', items: round.contentSelection.performance_types },
            ] as const
          ).map(
            (row) =>
              row.items &&
              row.items.length > 0 && (
                <div key={row.label}>
                  <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500 mb-2">
                    {row.label}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {row.items.map((type) => (
                      <Chip key={type} label={formatTypeName(type)} edge={corner} />
                    ))}
                  </div>
                </div>
              )
          )}

          <div className="pt-4 border-t-2 border-black space-y-2.5">
            {(
              [
                { k: 'EFFECTIVENESS', v: round.effectiveness_multiplier },
                { k: 'CROWD PREFERENCE', v: round.crowd_preference_multiplier },
                { k: 'CONTEXT MODIFIER', v: round.context_modifier },
              ] as const
            ).map((m) => (
              <div key={m.k} className="flex justify-between items-center">
                <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-zinc-500">{m.k}</span>
                <span
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: getMultiplierColor(m.v) }}
                >
                  {m.v?.toFixed(2)}x
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-[#2E2F35]">
              <span className="font-display font-black uppercase tracking-wider text-zinc-100">
                FINAL MULTIPLIER
              </span>
              <span
                className="leading-none"
                style={{
                  fontFamily: 'var(--font-poster)',
                  fontSize: 28,
                  color: getMultiplierColor(round.final_multiplier),
                  textShadow: '2px 2px 0 #000',
                }}
              >
                {round.final_multiplier?.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-base text-zinc-400 text-center py-4">No content data available</div>
      )}
    </div>
  );

  const playerWonRound = winner === 'player';

  // WHAT LANDED — tie the tape back to the content the player brought. Reads the
  // per-segment content the sim assigned so the player SEES his picks pay off (or
  // not): which beat landed the haymaker, which one won the room, which fell off.
  const readWhatLanded = (
    segs: SegmentWithContent[],
    oppSegs: SegmentWithContent[]
  ): LandedRead[] => {
    if (!segs.some((s) => s.primary_content_type)) return [];
    const reads: LandedRead[] = [];

    // Biggest moment — highest-scoring segment. It "landed" as a haymaker only if
    // the peak roll also topped the opponent's same segment (a peak that got
    // answered didn't land — same rule the replay uses).
    const peak = [...segs].sort((a, b) => b.segment_score - a.segment_score)[0];
    if (peak?.primary_content_type) {
      const peakOpp = oppSegs.find((s) => s.segment_index === peak.segment_index);
      const landed =
        (peak.event_flags?.includes('haymaker') ?? false) &&
        (!peakOpp || peak.segment_score >= peakOpp.segment_score);
      reads.push({
        tone: 'haymaker',
        content: peak.primary_content_type,
        headline: landed ? 'Landed the haymaker' : 'Your biggest moment',
        metric: `${peak.segment_score.toFixed(1)} · segment ${peak.segment_index}`,
      });
    }

    // Won the room — loudest crowd segment, when it's a different beat than the peak.
    const room = [...segs].sort((a, b) => (b.crowd_reaction ?? 0) - (a.crowd_reaction ?? 0))[0];
    if (
      room?.primary_content_type &&
      (room.crowd_reaction ?? 0) >= 55 &&
      room.segment_index !== peak?.segment_index
    ) {
      reads.push({
        tone: 'room',
        content: room.primary_content_type,
        headline: 'Won the room',
        metric: `${Math.round(room.crowd_reaction ?? 0)}% crowd · segment ${room.segment_index}`,
      });
    }

    // Fell off — the choke/stumble beat, and what he was on when it happened.
    const flat =
      segs.find((s) => s.event_flags?.includes('choke') && s.primary_content_type) ??
      segs.find((s) => s.event_flags?.includes('stumble') && s.primary_content_type);
    if (flat?.primary_content_type) {
      const isChoke = flat.event_flags?.includes('choke');
      reads.push({
        tone: 'flat',
        content: flat.primary_content_type,
        headline: isChoke ? 'Choked it off' : 'Stumbled on it',
        metric: `segment ${flat.segment_index}`,
      });
    }

    return reads;
  };

  const playerLanded = readWhatLanded(
    playerSegments as SegmentWithContent[],
    aiSegments as SegmentWithContent[]
  );
  const aiPeakSeg = [...(aiSegments as SegmentWithContent[])].sort(
    (a, b) => b.segment_score - a.segment_score
  )[0];

  const landedTone = (tone: LandedTone) =>
    tone === 'haymaker'
      ? { edge: GOLD, glyph: '★', label: 'HAYMAKER' }
      : tone === 'room'
        ? { edge: '#F5731A', glyph: '◆', label: 'THE ROOM' }
        : { edge: RED, glyph: '✗', label: 'FELL OFF' };

  return (
    <div className="fs space-y-8">
      {/* Verdict stamp */}
      <div
        className="p-8 border-4 text-center bg-[#101114] shadow-[6px_6px_0_rgba(0,0,0,.5)]"
        style={{ borderColor: winner === 'tie' ? '#E7B23C' : playerWonRound ? '#35C46B' : RED }}
      >
        <div
          className={`uppercase leading-none ${winner === 'tie' ? '' : '-rotate-1'}`}
          style={{
            fontFamily: 'var(--font-poster)',
            fontSize: 52,
            color: winner === 'tie' ? '#E7B23C' : playerWonRound ? '#35C46B' : RED,
            textShadow: '3px 3px 0 #000',
          }}
        >
          {winner === 'tie' ? 'TIE ROUND' : winner === 'player' ? `${playerName} WINS` : `${aiName} WINS`}
        </div>
        <div className="font-mono text-[13px] uppercase tracking-[0.3em] text-zinc-400 mt-3">
          {winner === 'player' && 'YOU TOOK THIS ROUND'}
          {winner === 'ai' && 'YOUR OPPONENT TOOK THIS ROUND'}
          {winner === 'tie' && 'NEITHER BATTLER COULD SECURE IT'}
        </div>
      </div>

      {/* Segment timeline — red corner vs blue corner */}
      <div className="bg-[#101114] border-2 border-black p-6 shadow-[4px_4px_0_rgba(0,0,0,.45)]" style={{ borderTop: '4px solid #F5731A' }}>
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42]">
            The Segments
          </h3>
          <span className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-500">
            <span style={{ color: RED }}>■ {playerName}</span>
            <span className="mx-2">·</span>
            <span style={{ color: BLUE }}>■ {aiName}</span>
          </span>
        </div>

        <div className="space-y-5">
          {playerSegments.map((playerSeg, idx) => {
            const aiSeg = aiSegments[idx];
            const aiScore = aiSeg?.segment_score ?? 0;
            const playerWidth = Math.max(4, (playerSeg.segment_score / maxScore) * 100);
            const aiWidth = aiSeg ? Math.max(4, (aiScore / maxScore) * 100) : 0;
            const playerWon = playerSeg.segment_score >= aiScore;
            const event = segEvent(playerSeg.event_flags, aiSeg?.event_flags, playerWon);

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-display font-black uppercase tracking-widest text-zinc-400">
                    Segment {idx + 1}
                  </span>
                  {event && (
                    <span
                      className={`px-2.5 py-1 text-sm font-display font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,.4)] ${event.cls}`}
                    >
                      {event.label}
                    </span>
                  )}
                  <span className="text-sm font-display font-bold uppercase tracking-wider text-zinc-500 tabular-nums">
                    {playerSeg.segment_score.toFixed(1)} · {aiScore.toFixed(1)}
                  </span>
                </div>

                {/* Player bar — red corner */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-display font-bold uppercase tracking-wide text-zinc-300 w-24 shrink-0 truncate">
                    {playerName}
                  </span>
                  <div className="flex-1 bg-[#0F0F12] h-8 border-2 border-black overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${playerWidth}%`,
                        background: playerWon
                          ? `linear-gradient(180deg, #ff6a5e, ${RED})`
                          : 'rgba(226,58,46,.45)',
                      }}
                    />
                  </div>
                  <span
                    className="w-14 text-right tabular-nums leading-none"
                    style={{
                      fontFamily: 'var(--font-poster)',
                      fontSize: 22,
                      color: playerWon ? RED : '#6b6d76',
                      textShadow: '1px 1px 0 #000',
                    }}
                  >
                    {playerSeg.segment_score.toFixed(1)}
                  </span>
                </div>

                {/* AI bar — blue corner */}
                {aiSeg && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-display font-bold uppercase tracking-wide text-zinc-300 w-24 shrink-0 truncate">
                      {aiName}
                    </span>
                    <div className="flex-1 bg-[#0F0F12] h-8 border-2 border-black overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${aiWidth}%`,
                          background: !playerWon
                            ? `linear-gradient(180deg, #5b9fe3, ${BLUE})`
                            : 'rgba(47,125,209,.45)',
                        }}
                      />
                    </div>
                    <span
                      className="w-14 text-right tabular-nums leading-none"
                      style={{
                        fontFamily: 'var(--font-poster)',
                        fontSize: 22,
                        color: !playerWon ? BLUE : '#6b6d76',
                        textShadow: '1px 1px 0 #000',
                      }}
                    >
                      {aiScore.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* WHAT LANDED — the player's picks, told back to him on the tape */}
      {playerLanded.length > 0 && (
        <div
          className="fs bg-[#101114] border-2 border-black p-6 shadow-[4px_4px_0_rgba(0,0,0,.45)]"
          style={{ borderTop: `4px solid ${GOLD}` }}
        >
          <div className="flex items-baseline justify-between mb-1 gap-2 flex-wrap">
            <h3 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42]">
              What Landed
            </h3>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">
              {playerName}&apos;s picks on the tape
            </span>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-600 mb-5">
            Which of the content you brought actually drove the round
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {playerLanded.map((r, i) => {
              const t = landedTone(r.tone);
              return (
                <div
                  key={i}
                  className="bg-[#17181C] border-2 border-black p-4 shadow-[2px_2px_0_rgba(0,0,0,.4)]"
                  style={{ borderLeft: `5px solid ${t.edge}` }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span style={{ color: t.edge, fontFamily: 'var(--font-poster)', fontSize: 18 }}>
                      {t.glyph}
                    </span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.22em]"
                      style={{ color: t.edge }}
                    >
                      {t.label}
                    </span>
                  </div>
                  <div
                    className="uppercase leading-none text-zinc-100"
                    style={{ fontFamily: 'var(--font-poster)', fontSize: 24, textShadow: '1px 1px 0 #000' }}
                  >
                    {formatTypeName(r.content)}
                  </div>
                  <div className="font-display font-black uppercase tracking-wide text-sm text-zinc-300 mt-2">
                    {r.headline}
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-wide text-zinc-500 mt-1">
                    {r.metric}
                  </div>
                </div>
              );
            })}
          </div>
          {aiPeakSeg?.primary_content_type && (
            <div className="mt-4 pt-4 border-t-2 border-black flex items-center gap-2 flex-wrap">
              <span
                className="font-mono text-[11px] uppercase tracking-[0.22em]"
                style={{ color: BLUE }}
              >
                {aiName} leaned on
              </span>
              <span
                className="uppercase text-zinc-200"
                style={{ fontFamily: 'var(--font-poster)', fontSize: 18 }}
              >
                {formatTypeName(aiPeakSeg.primary_content_type)}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wide text-zinc-500">
                — their peak {aiPeakSeg.segment_score.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stat plates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatPlate name={playerName} round={playerRound} corner={RED} />
        <StatPlate name={aiName} round={aiRound} corner={BLUE} />
      </div>

      {/* Content effectiveness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContentPlate title="YOUR CONTENT" round={playerRound} corner={RED} />
        <ContentPlate title="THEIR CONTENT" round={aiRound} corner={BLUE} />
      </div>
    </div>
  );
}
