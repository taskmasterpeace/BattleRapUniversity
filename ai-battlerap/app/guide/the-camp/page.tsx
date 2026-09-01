// HOW TO PLAY · 02 — THE CAMP. Teaches the prep economy: five lanes, what each
// buys, why walking in cold is how chokes happen, and what scouting digs up.
// Numbers mirror lib/game/config.ts + the prep page — keep them in step.
import Link from 'next/link';
import SeriesNav from '../SeriesNav';

const LANES = [
  {
    name: 'RESEARCH',
    color: '#2F7DD1',
    what: 'Study their tape and their LIFE.',
    buys: 'Each day is a 45% shot at digging up a FACET of who they really are — an ANGLE you own all battle (max 2). Angles sharpen your pen and fatten your haymaker chance. Research also unlocks the scouting report, tier by tier.',
    warn: 'Walk in with zero research and your haymaker odds are CUT IN HALF.',
  },
  {
    name: 'WRITE',
    color: '#F5731A',
    what: 'Pen the rounds, then get them IN YOUR BODY.',
    buys: 'Boosts every writing attribute and every written day cuts choke risk — memorization is armor.',
    warn: 'Walking in with nothing written is how chokes happen. Cold baseline is around 15% per battle.',
  },
  {
    name: 'REHEARSE',
    color: '#E23A2E',
    what: 'Run-throughs. Full performances to an empty room.',
    buys: 'Boosts stage presence and delivery, and cuts stumble risk — polish keeps the small slips out of the tape.',
    warn: 'Bars you never performed out loud come out different under lights.',
  },
  {
    name: 'LIFE',
    color: '#35C46B',
    what: 'Handle business at home.',
    buys: 'Keeps the personal side steady so battle night is only about battling. Ignoring home long enough invites life to interrupt the story.',
    warn: null,
  },
  {
    name: 'REST',
    color: '#E7B23C',
    what: 'Reset. Walk in lighter.',
    buys: 'Relieves stress before the night and buffers resilience — the stat that decides whether pressure rattles you.',
    warn: 'Every UNPLANNED day becomes REST automatically. Rest on purpose instead.',
  },
];

const TIERS = [
  { t: 'TIER 1 — THE BASICS', cost: '1 research day', gets: 'Who they are: record, style badges, how they are coded.' },
  { t: 'TIER 2 — RECENT TAPE', cost: '2 research days', gets: 'What they have been doing lately — form, wins, the shape of their recent rounds.' },
  { t: 'TIER 3 — WEAKNESS REPORT', cost: '3 research days', gets: 'Where they crack: tendencies, soft spots, what the tape says they cannot handle.' },
];

export const metadata = { title: 'The Camp — Battle Rap University' };

export default function TheCampPage() {
  return (
    <div className="fs min-h-screen bg-[#0F0F12] pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link href="/guide" className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-500 hover:text-[#F5731A]">
          ← Guide index
        </Link>
        <div className="mt-4 mb-2 flex items-end justify-between flex-wrap gap-3">
          <h1 style={{ fontFamily: 'var(--font-poster)', fontSize: 54, lineHeight: 1 }} className="text-zinc-100 uppercase">
            The Camp
          </h1>
          <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#F5731A]">How to play · 02</span>
        </div>
        <p className="text-[15px] text-zinc-400 max-w-2xl mb-10">
          From the day you accept to the day prep LOCKS, every day is a choice. Paint your days across five
          lanes — the battle you perform is the camp you ran.
        </p>

        {/* THE FIVE LANES */}
        <div className="space-y-4 mb-12">
          {LANES.map((l) => (
            <div key={l.name} className="bg-[#17181C] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] p-5" style={{ borderLeft: `6px solid ${l.color}` }}>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h2 style={{ fontFamily: 'var(--font-poster)', fontSize: 26 }} className="uppercase" >
                  <span style={{ color: l.color }}>{l.name}</span>
                </h2>
                <span className="text-[14px] text-zinc-300">{l.what}</span>
              </div>
              <p className="text-[14px] text-zinc-400 mt-2 max-w-3xl">{l.buys}</p>
              {l.warn && (
                <p className="font-mono text-[12px] uppercase tracking-wider text-[#E23A2E] mt-2">⚠ {l.warn}</p>
              )}
            </div>
          ))}
        </div>

        {/* SCOUTING */}
        <div className="mb-12">
          <h2 style={{ fontFamily: 'var(--font-poster)', fontSize: 30 }} className="text-zinc-100 uppercase mb-1">
            The Scouting Report
          </h2>
          <p className="text-[14px] text-zinc-400 mb-5 max-w-2xl">
            Research days double as intel. The report unlocks in three tiers — the deeper you dig, the more
            of their game shows up readable before you ever touch the stage.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {TIERS.map((t) => (
              <div key={t.t} className="bg-[#101114] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,.45)] p-5">
                <p style={{ fontFamily: 'var(--font-poster)', fontSize: 18 }} className="text-[#F5731A] uppercase">{t.t}</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 mt-1">{t.cost}</p>
                <p className="text-[13px] text-zinc-400 mt-3">{t.gets}</p>
              </div>
            ))}
          </div>
        </div>

        {/* THE LAWS */}
        <div className="bg-[#17181C] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] p-6">
          <h2 style={{ fontFamily: 'var(--font-poster)', fontSize: 26 }} className="text-[#F5731A] uppercase mb-4">
            Camp laws
          </h2>
          <ul className="space-y-3 text-[14px] text-zinc-300">
            <li>
              <span className="font-mono text-[12px] uppercase tracking-wider text-zinc-500 mr-2">PREP LOCKS 24H OUT.</span>
              After the lock there are no more choices — whatever camp you ran is the battler who shows up.
            </li>
            <li>
              <span className="font-mono text-[12px] uppercase tracking-wider text-zinc-500 mr-2">EVERY DAY COMPOUNDS.</span>
              Each day in a lane makes that lane hit noticeably harder on the night — a focused camp beats a scattered one.
            </li>
            <li>
              <span className="font-mono text-[12px] uppercase tracking-wider text-zinc-500 mr-2">ANGLES ARE AMMUNITION.</span>
              A found facet follows your opponent into the building: your pen gets sharper against them and your
              peak moments hit harder. The room hears when you did the homework.
            </li>
            <li>
              <span className="font-mono text-[12px] uppercase tracking-wider text-zinc-500 mr-2">PROMOTION IS PREP TOO.</span>
              The pre-battle promotion window lets you build hype or attack their credibility before a bar is thrown —
              the crowd walks in already leaning.
            </li>
            <li>
              <span className="font-mono text-[12px] uppercase tracking-wider text-zinc-500 mr-2">COLD IS A CHOICE.</span>
              Skip camp entirely and the game does not forfeit you — it simulates you unprepared. Low consistency,
              high choke odds, and the recap writers will say so.
            </li>
          </ul>
        </div>

        <SeriesNav current="/guide/the-camp" />
      </div>
    </div>
  );
}
