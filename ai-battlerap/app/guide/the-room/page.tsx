// READ THE ROOM — the first HOW TO PLAY page (owner call, 2026-08-31: "we're
// gonna have to make some kind of tutorial or something so we can leverage
// this"). The crowd IS the meter: this page teaches what every reaction means,
// when it fires, and that the room reacts to WHAT lands, not just how hard.
import Link from 'next/link';
import familyRaw from '@/lib/crowd-family.json';
import SeriesNav from '../SeriesNav';

type Member = { src: string; mood: string; demo: string; gender: string };
const FAMILY = familyRaw as Member[];

const MOODS: Array<{ key: string; title: string; meaning: string; fires: string; good: boolean | null }> = [
  { key: 'hype', title: 'HYPE', meaning: 'Going crazy — jumping, arms up, screaming.', fires: 'Crowd 55%+, everywhere at 90%+. The round is ON FIRE.', good: true },
  { key: 'oooh', title: 'THE OOOH', meaning: 'Hands on head, mouth covered, shook.', fires: 'Crowd 45%+. A bar just LANDED — the haymaker face.', good: true },
  { key: 'laugh', title: 'CRACKING UP', meaning: 'Doubled over, stomach grab, pointing.', fires: 'Crowd 40%+ when the jokes are landing.', good: true },
  { key: 'nod', title: 'THE HEAD NOD', meaning: 'Pointing at the stage, feeling the pen.', fires: 'Peaks around 60%. Respect for the writing — the "bars" face.', good: true },
  { key: 'talk', title: 'SIDE-TALK', meaning: 'Turned to their neighbor, debating the round.', fires: 'Peaks around 45%. The room is SPLIT — a debatable.', good: null },
  { key: 'watch', title: 'ARMS CROSSED', meaning: 'Locked in, judging, show-me face.', fires: 'A few are always in the building. Neutral.', good: null },
  { key: 'unimpressed', title: 'NOT FEELING IT', meaning: 'Flat face, slight head shake.', fires: 'Crowd below 55%. You are losing them.', good: false },
  { key: 'dismiss', title: 'WAVED OFF', meaning: 'Hand flick — "get outta here with that."', fires: 'Crowd below 45%. The room is turning on you.', good: false },
  { key: 'boo', title: 'THE BOOS', meaning: 'Cupped hands, open jeers.', fires: 'Crowd below 30%. Hostile — booed out the building.', good: false },
];

const DEMO_CHIP: Record<string, { label: string; color: string }> = {
  urban: { label: 'URBAN', color: '#F5731A' },
  non_urban: { label: 'NON-URBAN', color: '#2F7DD1' },
  foreign: { label: 'OVERSEAS', color: '#35C46B' },
};

// What the room does when a TYPE of content wins the round (mirrors
// FLAVOR_MOODS in CrowdStrip.tsx — keep the two in step).
const FLAVOR_ROWS: Array<{ content: string; reaction: string }> = [
  { content: 'COMEDY · POP CULTURE · NAME FLIPS', reaction: 'The room CRACKS UP — laughter everywhere' },
  { content: 'PERSONALS · SHOCK VALUE · GUN BARS', reaction: 'The OOOH — hands on heads, faces covered' },
  { content: 'WORDPLAY · SCHEMES · STORYTELLING', reaction: 'HEAD NODS — quiet respect for the pen' },
  { content: 'PUNCHLINES · STREET TALK', reaction: 'HYPE — the room explodes on contact' },
  { content: 'REBUTTALS · FREESTYLES', reaction: 'SIDE-TALK + OOOH — "did he just flip that?"' },
];

export const metadata = { title: 'Read the Room — Battle Rap University' };

export default function ReadTheRoomPage() {
  return (
    <div className="fs min-h-screen bg-[#0F0F12] pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link href="/guide" className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-500 hover:text-[#F5731A]">
          ← Guide index
        </Link>
        <div className="mt-4 mb-2 flex items-end justify-between flex-wrap gap-3">
          <h1 style={{ fontFamily: 'var(--font-poster)', fontSize: 54, lineHeight: 1 }} className="text-zinc-100 uppercase">
            Read the Room
          </h1>
          <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#F5731A]">How to play · 01</span>
        </div>
        <p className="text-[15px] text-zinc-400 max-w-2xl mb-10">
          The crowd IS your scoreboard. Every round, the room fills with real reactions — read the bodies and you
          know how the round went before you see a number.
        </p>

        {/* THE FLAVOR LAW — the room reacts to WHAT lands */}
        <div className="mb-12 bg-[#17181C] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] p-6">
          <h2 style={{ fontFamily: 'var(--font-poster)', fontSize: 26 }} className="text-[#F5731A] uppercase mb-1">
            The room reacts to WHAT lands
          </h2>
          <p className="text-[14px] text-zinc-400 mb-5">
            Win the round with a certain kind of content and the crowd shows it. Same score, different face.
          </p>
          <div className="space-y-2">
            {FLAVOR_ROWS.map((r) => (
              <div key={r.content} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-[#2E2F35] pb-2">
                <span className="font-mono text-[13px] tracking-wider text-zinc-200 min-w-[300px]">{r.content}</span>
                <span className="text-[14px] text-zinc-400">→ {r.reaction}</span>
              </div>
            ))}
          </div>
        </div>

        {/* THE 9 REACTIONS */}
        {MOODS.map((mood) => {
          const members = FAMILY.filter((m) => m.mood === mood.key);
          const edge = mood.good === true ? '#35C46B' : mood.good === false ? '#E23A2E' : '#2E2F35';
          return (
            <section key={mood.key} className="mb-12">
              <div className="border-t-4" style={{ borderColor: edge }} />
              <div className="flex items-baseline gap-4 mt-4 mb-1 flex-wrap">
                <h2 style={{ fontFamily: 'var(--font-poster)', fontSize: 34 }} className="text-zinc-100 uppercase">
                  {mood.title}
                </h2>
                <span className="font-mono text-[12px] text-zinc-500">×{members.length} in the family</span>
              </div>
              <p className="text-[15px] text-zinc-300">{mood.meaning}</p>
              <p className="font-mono text-[12px] uppercase tracking-wider text-zinc-500 mt-1 mb-5">{mood.fires}</p>
              <div className="flex flex-wrap gap-5">
                {members.map((m) => (
                  <div key={m.src} className="flex flex-col items-center gap-2">
                    {/* integer-scale law: 112x128 art shown at exactly 2x */}
                    <img
                      src={m.src}
                      alt={`${mood.title} crowd reaction`}
                      width={224}
                      height={256}
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span
                      className="font-mono text-[11px] tracking-wider px-2 py-0.5 border"
                      style={{ color: DEMO_CHIP[m.demo]?.color ?? '#888', borderColor: DEMO_CHIP[m.demo]?.color ?? '#888' }}
                    >
                      {DEMO_CHIP[m.demo]?.label ?? m.demo.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div className="bg-[#101114] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] p-6">
          <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Why the tags matter</p>
          <p className="text-[14px] text-zinc-400 max-w-3xl">
            Different rooms pull different crowds. An URBAN-coded league packs the room with its own; a crossover
            league mixes NON-URBAN faces in; an OVERSEAS card brings the scarves out. Where you battle changes who
            is judging you.
          </p>
        </div>

        <SeriesNav current="/guide/the-room" />
      </div>
    </div>
  );
}
