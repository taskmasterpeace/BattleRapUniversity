// HOW TO PLAY · 03 — BATTLE NIGHT. The round game: pick 3-4 content + 1-2
// delivery + 1-2 performance, counter what they bring (2x / 0.5x), and decide
// how much physical pressure the round can take. Numbers mirror
// lib/game/contentEffectiveness.ts and lib/game/pressureMoves.ts.
import Link from 'next/link';
import SeriesNav from '../SeriesNav';

const COUNTERS = [
  { atk: 'PERSONALS', beats: 'comedy · gun bars', why: 'Real researched pain makes jokes look shallow and threats look fake.' },
  { atk: 'PUNCHLINES', beats: 'schemes · storytelling · name flips', why: 'Haymakers land before long setups pay off.' },
  { atk: 'COMEDY', beats: 'wordplay · schemes · social commentary', why: 'Laughter makes technical bars feel tryhard and preachy bars feel stiff.' },
  { atk: 'STREET TALK', beats: 'gun bars · schemes', why: 'Lived authenticity exposes posturing and makes fancy pens look soft.' },
  { atk: 'WORDPLAY', beats: 'gun bars', why: 'Technical skill dominates one-dimensional aggression.' },
  { atk: 'REBUTTALS', beats: 'personals · shock value', why: 'Dismantle their ammunition and wear it as a trophy.' },
  { atk: 'FREESTYLES', beats: 'rebuttals · schemes', why: 'You cannot pre-write an answer to what has not happened yet.' },
  { atk: 'GUN BARS', beats: 'freestyles · social commentary', why: 'Aggression overwhelms improvisation and kills the lecture.' },
  { atk: 'POP CULTURE', beats: 'social commentary · storytelling', why: 'Quick relatable hits beat slow builds for most rooms.' },
  { atk: 'STORYTELLING', beats: 'name flips', why: 'Narrative depth makes repetitive hooks feel empty.' },
  { atk: 'SCHEMES', beats: 'shock value', why: 'Craftsmanship makes cheap provocation look lazy.' },
];

const PRESSURE = [
  {
    name: 'STAY PRO',
    color: '#35C46B',
    line: 'Let the pen talk.',
    detail: 'No extracurriculars. Your round is exactly as good as your camp — and nobody can put you in a headline for it.',
    risk: 'RISK: NONE',
  },
  {
    name: 'TALK OVER',
    color: '#E7B23C',
    line: 'Jaw at them mid-round.',
    detail: 'A rattle attempt against their RESILIENCE. Land it and they stumble more and battle the rest of the night stressed. Get ignored and YOU look thirsty — the room docks you for it.',
    risk: 'RISK: MODERATE — resilient vets shrug it off and make you pay',
  },
  {
    name: 'BUMP',
    color: '#E23A2E',
    line: 'Walk through their space. They WILL answer.',
    detail: 'The answer is theirs to pick: LAUGH IT OFF (you lose the room for trying), BUMP BACK (both of you battle shook — stress on both, room heat way up), or SWING.',
    risk: 'RISK: HIGH — you do not control what happens next',
  },
  {
    name: 'THE SWING',
    color: '#E23A2E',
    line: 'The fight breaks out. The battle is OVER.',
    detail: 'No contest. Nobody wins, everybody gets talked about, and whoever threw hands takes a real reputation hit. The Wire eats for a week.',
    risk: 'COST: your name — the culture remembers who swung',
  },
];

export const metadata = { title: 'Battle Night — Battle Rap University' };

export default function BattleNightPage() {
  return (
    <div className="fs min-h-screen bg-[#0F0F12] pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link href="/guide" className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-500 hover:text-[#F5731A]">
          ← Guide index
        </Link>
        <div className="mt-4 mb-2 flex items-end justify-between flex-wrap gap-3">
          <h1 style={{ fontFamily: 'var(--font-poster)', fontSize: 54, lineHeight: 1 }} className="text-zinc-100 uppercase">
            Battle Night
          </h1>
          <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#F5731A]">How to play · 03</span>
        </div>
        <p className="text-[15px] text-zinc-400 max-w-2xl mb-10">
          Three rounds. Before each one you call your shot — what you are bringing, how it comes out, and how
          you carry it in the room. Their cards stay hidden until the reveal.
        </p>

        {/* THE LOADOUT */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-[#17181C] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] p-5">
            <p style={{ fontFamily: 'var(--font-poster)', fontSize: 22 }} className="text-[#F5731A] uppercase">Content · pick 3–4</p>
            <p className="text-[13px] text-zinc-400 mt-2">
              WHAT the round is made of — personals, punchlines, schemes, comedy, gun bars, rebuttals...
              Four families: ATTACK, TECHNICAL, ENTERTAINMENT, ADAPTIVE. Balance beats spam.
            </p>
          </div>
          <div className="bg-[#17181C] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] p-5">
            <p style={{ fontFamily: 'var(--font-poster)', fontSize: 22 }} className="text-[#F5731A] uppercase">Delivery · pick 1–2</p>
            <p className="text-[13px] text-zinc-400 mt-2">
              HOW it comes out the mouth — aggressive, smooth, speed, staccato, passionate, nonchalant.
              Energy counters coolness; speed buries casual.
            </p>
          </div>
          <div className="bg-[#17181C] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] p-5">
            <p style={{ fontFamily: 'var(--font-poster)', fontSize: 22 }} className="text-[#F5731A] uppercase">Performance · pick 1–2</p>
            <p className="text-[13px] text-zinc-400 mt-2">
              WHAT the body does — stage presence, crowd work, theatrics, pauses. Big showmanship buries
              minimalists in most rooms.
            </p>
          </div>
        </div>

        {/* THE COUNTER GAME */}
        <div className="mb-12">
          <h2 style={{ fontFamily: 'var(--font-poster)', fontSize: 30 }} className="text-zinc-100 uppercase mb-1">
            The counter game
          </h2>
          <p className="text-[14px] text-zinc-400 mb-5 max-w-3xl">
            Every pick checks against what THEY brought. A clean counter hits for <span className="text-[#35C46B] font-bold">2×</span>;
            walking into one costs you — the same matchup reads <span className="text-[#E23A2E] font-bold">0.5×</span> from the other
            side. Scout their badges: the select screen predicts what they lean on.
          </p>
          <div className="bg-[#101114] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 px-4 py-3">You bring</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#35C46B] px-4 py-3">2× against</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 px-4 py-3 hidden md:table-cell">Why it works</th>
                </tr>
              </thead>
              <tbody>
                {COUNTERS.map((c) => (
                  <tr key={c.atk} className="border-b border-[#2E2F35]">
                    <td className="px-4 py-2.5" style={{ fontFamily: 'var(--font-poster)', fontSize: 16 }}>
                      <span className="text-zinc-100 uppercase">{c.atk}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[13px] uppercase tracking-wide text-[#35C46B]">{c.beats}</td>
                    <td className="px-4 py-2.5 text-[13px] text-zinc-400 hidden md:table-cell">{c.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRESSURE MOVES */}
        <div className="mb-2">
          <h2 style={{ fontFamily: 'var(--font-poster)', fontSize: 30 }} className="text-zinc-100 uppercase mb-1">
            Pressure — how you carry it
          </h2>
          <p className="text-[14px] text-zinc-400 mb-5 max-w-3xl">
            Bars are half the battle. Before each round you also decide what happens BETWEEN them.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {PRESSURE.map((p) => (
              <div key={p.name} className="bg-[#17181C] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] p-5" style={{ borderTop: `6px solid ${p.color}` }}>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h3 style={{ fontFamily: 'var(--font-poster)', fontSize: 24 }} className="uppercase text-zinc-100">{p.name}</h3>
                  <span className="text-[13px] text-zinc-400">{p.line}</span>
                </div>
                <p className="text-[13px] text-zinc-400 mt-2">{p.detail}</p>
                <p className="font-mono text-[11px] uppercase tracking-wider mt-3" style={{ color: p.color }}>{p.risk}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-[12px] uppercase tracking-wider text-zinc-500 mt-6">
          Rather trust the camp? GO AUTO runs the whole card off your prep and badges — same purse, same press,
          same progression. LOCKED IN just means every call was yours.
        </p>

        <SeriesNav current="/guide/battle-night" />
      </div>
    </div>
  );
}
