'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

/**
 * THE PLAYER GUIDE — every number in here is pulled straight from the engine:
 *  - lib/game/config.ts            (choke/stumble/prep/judging constants)
 *  - lib/game/battleSlots.ts       (3 slots/day, bonus slot rules)
 *  - lib/game/crew.ts              (crew size, tier costs, +1 prep day)
 *  - lib/game/progression.ts       (attribute gain thresholds)
 *  - lib/game/xpLevels.ts          (XP values, level curve, tiers)
 *  - lib/game/exhibitionSim.ts     (dream matchup rules)
 *  - app/api/battles/[id]/scouting (intel tiers)
 *  - app/api/travel + travel_costs (city travel pricing)
 *  - app/api/battles/challenge     (PvP 72h window)
 * If you change the engine, change this page. Don't let the guide lie.
 */

const SECTIONS = [
  { id: 'welcome', num: '01', label: 'WELCOME TO THE UNIVERCITY' },
  { id: 'first-week', num: '02', label: 'YOUR FIRST WEEK' },
  { id: 'attributes', num: '03', label: 'THE ATTRIBUTES' },
  { id: 'prep', num: '04', label: 'PREP WEEK IS EVERYTHING' },
  { id: 'scouting', num: '05', label: 'SCOUTING REPORTS' },
  { id: 'battle-night', num: '06', label: 'BATTLE NIGHT' },
  { id: 'rooms', num: '07', label: 'PICK YOUR ROOMS' },
  { id: 'slots', num: '08', label: 'DAILY SLOTS' },
  { id: 'univercity', num: '09', label: 'THE UNIVERCITY' },
  { id: 'crew', num: '10', label: 'YOUR CREW' },
  { id: 'callout', num: '11', label: 'CALL SOMEBODY OUT' },
  { id: 'dream', num: '12', label: 'DREAM MATCHUPS' },
  { id: 'press', num: '13', label: 'BADGES & THE PRESS' },
  { id: 'life', num: '14', label: 'LIFE COMES AT YOU' },
  { id: 'verified', num: '15', label: 'VERIFIED BATTLERS' },
  { id: 'goat', num: '16', label: 'THE ROAD TO GOAT' },
  { id: 'faq', num: '17', label: 'FAQ' },
] as const;

/* ---------------------------------------------------------------- helpers */

function Section({
  id,
  num,
  title,
  kicker,
  children,
}: {
  id: string;
  num: string;
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 bg-[#18191c] border-2 border-[#3a3d44] rounded-lg p-6 sm:p-8"
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#ff8c42] mb-2">
        {num} / SYLLABUS
      </div>
      <h2 className="font-display font-black uppercase tracking-tighter text-2xl sm:text-3xl text-zinc-100 mb-1">
        {title}
      </h2>
      {kicker && (
        <p className="text-zinc-500 text-sm uppercase tracking-wide font-bold mb-4">{kicker}</p>
      )}
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300 mt-4">{children}</div>
    </section>
  );
}

function ProTip({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 border-2 border-[#ff8c42]/50 bg-[#ff8c42]/10 rounded-lg p-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#ff8c42] mb-2">
        ★ PRO TIP
      </div>
      <div className="text-sm text-zinc-200 leading-relaxed">{children}</div>
    </div>
  );
}

function Num({ children }: { children: ReactNode }) {
  return <span className="font-mono font-bold text-[#ff8c42]">{children}</span>;
}

function Hl({ children }: { children: ReactNode }) {
  return <span className="font-bold text-zinc-100">{children}</span>;
}

function StatRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[#3a3d44]/60 py-1.5 last:border-b-0">
      <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="text-sm font-bold text-zinc-200 text-right">{value}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-[#0a0a0a] border-2 border-[#3a3d44] rounded-lg p-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#ff8c42] mb-2">
        {title}
      </div>
      <div className="text-sm text-zinc-300 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="bg-[#0a0a0a] border-2 border-[#3a3d44] rounded-lg p-4">
      <h3 className="font-display font-black uppercase tracking-tight text-zinc-100 mb-2">{q}</h3>
      <div className="text-sm text-zinc-400 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

export default function GameplayGuidePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#18191c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/dashboard"
            className="text-[#ff8c42] hover:text-[#ff9d5c] text-xs font-mono uppercase tracking-[0.2em] font-bold mb-4 inline-block"
          >
            ← DASHBOARD
          </Link>
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-2">
            OFFICIAL COURSE CATALOG · READ BEFORE YOU CATCH A BODY (OR BECOME ONE)
          </div>
          <h1 className="font-display font-black uppercase tracking-tighter text-4xl sm:text-5xl mb-2">
            THE PLAYER <span className="text-[#ff8c42]">GUIDE</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl">
            Everything in this guide is pulled from the actual engine. No vibes-based numbers. If it
            says 7%, the code says 7%. Class is in session.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12 lg:grid lg:grid-cols-[250px_1fr] lg:gap-8 lg:items-start">
        {/* Sticky TOC — sidebar on desktop */}
        <aside className="hidden lg:block sticky top-6">
          <nav
            aria-label="Table of contents"
            className="bg-[#18191c] border-2 border-[#3a3d44] rounded-lg p-4"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#ff8c42] mb-3">
              COURSE INDEX
            </div>
            <ul className="space-y-1">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex items-baseline gap-2 px-2 py-1 rounded text-zinc-400 hover:text-[#ff8c42] hover:bg-[#ff8c42]/10 transition-colors"
                  >
                    <span className="font-mono text-[10px] text-zinc-600">{s.num}</span>
                    <span className="text-xs font-bold uppercase tracking-wide">{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="space-y-8">
          {/* Mobile TOC */}
          <nav
            aria-label="Table of contents"
            className="lg:hidden bg-[#18191c] border-2 border-[#3a3d44] rounded-lg p-4"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#ff8c42] mb-3">
              COURSE INDEX
            </div>
            <div className="grid grid-cols-2 gap-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="px-2 py-1.5 rounded text-[11px] font-bold uppercase tracking-wide text-zinc-400 hover:text-[#ff8c42] hover:bg-[#ff8c42]/10 transition-colors"
                >
                  <span className="font-mono text-[10px] text-zinc-600 mr-1.5">{s.num}</span>
                  {s.label}
                </a>
              ))}
            </div>
          </nav>

          {/* 01 — WELCOME */}
          <Section
            id="welcome"
            num="01"
            title="WELCOME TO THE UNIVERCITY"
            kicker="The two-minute pitch"
          >
            <p>
              Battle Rap University is a battle rap career sim. You build one battler, and that
              battler is <Hl>yours</Hl> — your pen, your presence, your chokes, your classics. You
              don’t type bars. You make the decisions a real battler makes: who to battle, how
              to prep, which rooms to take, when to rest, when to travel, who to bring with you.
              The engine simulates the rest, segment by segment, the way a real battle actually
              breathes.
            </p>
            <p>
              And about the name — it’s University, but it’s also the{' '}
              <Hl>Univer-CITY</Hl>. The whole map is your campus. Cities with their own scenes,
              leagues with their own judging cultures, local battlers waiting to be recruited or
              embarrassed. You don’t graduate by sitting in lecture. You graduate by pulling
              up.
            </p>
            <p>
              Other players are out there too. This isn’t a single-player sandbox — you share
              the city with real people. You can scout them, call them out, take their throne, or
              just argue about dream matchups in the simulator like fans have done since forever.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mt-2">
              <Card title="YOU MANAGE">
                <p>Prep weeks, daily slots, money, travel, crew, stress, your media narrative.</p>
              </Card>
              <Card title="THE ENGINE SIMULATES">
                <p>
                  Every 30-second segment of every round — haymakers, stumbles, chokes, crowd
                  reactions, judges.
                </p>
              </Card>
              <Card title="THE CULTURE REACTS">
                <p>
                  Eight bloggers with eight agendas write you up after every battle. Your career
                  becomes a story whether you like the story or not.
                </p>
              </Card>
            </div>
            <ProTip>
              Nothing in this game is random for randomness’ sake. Every probability is tuned
              against real battle rap outcomes — body rates, debatable 2-1s, choke frequency — and
              validated with an actual touring battler. When the sim does something wild, that’s
              the culture being accurate.
            </ProTip>
          </Section>

          {/* 02 — FIRST WEEK */}
          <Section
            id="first-week"
            num="02"
            title="YOUR FIRST WEEK"
            kicker="From nobody to somebody with a record"
          >
            <p>
              Here’s how your first seven days actually go. No tutorial island. You’re in
              the deep end with floaties.
            </p>
            <div className="space-y-3">
              <Card title="DAY 0 — BUILD YOUR BATTLER">
                <p>
                  Pick a stage name (choose carefully — it’s going on flyers), spread your
                  attribute points, pick an origin story and a home league. Came up on text forums?
                  Your pen is sharper but the stage feels far away. Came up off app freestyles?
                  Reverse that. There’s no wrong build — there are only wrong rooms for your
                  build.
                </p>
              </Card>
              <Card title="DAY 1 — THE FIRST OFFER">
                <p>
                  Offers show up on your dashboard. A local name wants smoke. Check the league, the
                  date, the opponent. Accept it. Congratulations, you now have a problem with a
                  deadline.
                </p>
              </Card>
              <Card title="DAYS 2–6 — PREP WEEK">
                <p>
                  Open the prep planner and assign every day a focus: research, writing,
                  performance, rest, or life. Each prep day moves real numbers (see{' '}
                  <a href="#prep" className="text-[#ff8c42] font-bold hover:underline">
                    Section 04
                  </a>
                  ). Plan every single day yourself and you earn a <Hl>bonus battle slot</Hl> after
                  the battle. The planner auto-saves. The deadline does not negotiate.
                </p>
              </Card>
              <Card title="BATTLE NIGHT — HIT THE BUTTON">
                <p>
                  When it’s time, smash <Hl>🎤 BATTLE TIME</Hl> on your dashboard. The engine
                  runs the whole battle — three rounds, segment by segment — and drops you on the
                  results page. Watch the timeline. Find your haymaker. Pray there’s no choke
                  flag.
                </p>
              </Card>
              <Card title="THE MORNING AFTER — READ YOUR PRESS">
                <p>
                  Check the media hub. Somebody wrote about you. Maybe Battle Eyez is stirring drama
                  about your loss. Maybe The Battle Breakdown gave you 7s across the board. Your
                  rating moved, your attributes ticked up, maybe a badge dropped. Then a new offer
                  arrives, and the loop is alive.
                </p>
              </Card>
            </div>
            <ProTip>
              Win your first battle AND fully hand-plan your prep, and you bank up to{' '}
              <Num>+2 bonus slots</Num> that same day. That’s five battles in a day if
              you’re hungry. Don’t be hungry. Stress is real (Section 14).
            </ProTip>
          </Section>

          {/* 03 — ATTRIBUTES */}
          <Section
            id="attributes"
            num="03"
            title="THE ATTRIBUTES"
            kicker="1–10 scale · Low 1–3 · Mid 4–6 · Top 7–9 · God 10"
          >
            <p>
              Every battler is a stack of numbers from 1 to 10, and every number earns its check
              somewhere in the sim. Here’s what actually matters where.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Card title="WRITING — THE PEN">
                <p>
                  <Hl>Lyricism, Wordplay, Creativity, Flow.</Hl> Your segment scores in
                  writing-weighted rooms live and die here. Creativity also feeds your haymaker
                  ceiling — the wild angles come from somewhere.
                </p>
              </Card>
              <Card title="PERFORMANCE — THE STAGE">
                <p>
                  <Hl>Stage Presence, Crowd Control, Delivery.</Hl> These drive crowd reaction
                  (0–100), which is <Num>25%</Num> of round judging. Delivery + crowd control also
                  form your <Hl>recovery skill</Hl> — at 8+, a stumble only costs you 10% instead
                  of 15%.
                </p>
              </Card>
              <Card title="PERSONAL — THE LIFE">
                <p>
                  <Hl>Financial Stability, Reputation, Family Bond, Preparation.</Hl> The quiet
                  killers. Broke (financial under 4) adds choke pressure. Family bond 7+ doubles
                  your stress recovery; 8+ blocks family-drama events entirely. Preparation makes
                  every prep day hit harder: <Num>×(1 + prep/20)</Num>.
                </p>
              </Card>
              <Card title="RESILIENCE — THE SPINE">
                <p>
                  One number, one job: not folding. Every point above 5 cuts your choke chance by{' '}
                  <Num>2.5%</Num> per segment. The difference between resilience 5 and resilience 9
                  is the difference between “he’s nice” and “he’s nice in
                  the moment that matters.“
                </p>
              </Card>
            </div>
            <p>
              Two hidden meters ride along: <Hl>Stress</Hl> (0–100, builds from overbooking, adds
              up to +10% choke and +4% stumble at max) and <Hl>Public Knowledge</Hl> (0–100, fame —
              above 70 it starts adding its own pressure, because everybody’s watching now).
            </p>
            <ProTip>
              Don’t spread points like peanut butter. The sim rewards identity. A 9-pen / 4-stage
              writer who picks writing rooms beats a 6.5-everything battler who picks rooms at
              random. Build a battler the bloggers can describe in one sentence.
            </ProTip>
          </Section>

          {/* 04 — PREP */}
          <Section
            id="prep"
            num="04"
            title="PREP WEEK IS EVERYTHING"
            kicker="The battle is won before the battle"
          >
            <p>
              Each prep day you pick one focus. Each focus day boosts its attributes by a base of{' '}
              <Num>+0.25</Num> (scaled up by your Preparation attribute and badges). That sounds
              small until you realize five writing days is over a full point on your whole pen —
              the gap between mid and top tier, rented for one night.
            </p>
            <div className="space-y-2">
              <StatRow
                label="RESEARCH"
                value="Unlocks scouting intel + full 15% haymaker chance (half that without it). Feeds creativity/lyricism."
              />
              <StatRow
                label="WRITING"
                value="+0.25/day to lyricism, wordplay, creativity. Also trims choke odds."
              />
              <StatRow
                label="PERFORMANCE"
                value="+0.25/day to stage presence, crowd control, delivery. Reduces stumbles."
              />
              <StatRow
                label="REST"
                value="Boosts resilience, burns stress. The anti-choke day."
              />
              <StatRow
                label="LIFE"
                value="Tends family bond + personal stats. Keeps the off-stage chaos quiet."
              />
            </div>
            <p>
              Every writing or performance day also shaves <Num>0.4%</Num> per day off your
              per-segment choke probability. Prep doesn’t just make you better — it makes you
              harder to break.
            </p>
            <Card title="THE NO-SHOW TAX">
              <p>
                Accept a battle and never open the prep planner? The game gives you a
                “winging it” auto-plan, flags you as a <Hl>no-show</Hl>, and hits your
                performance with a <Num>60% penalty</Num>. You still battle — the game doesn’t
                forfeit you, it lets you feel it. Leave only some days blank and they get backfilled
                as rest: not a disaster, but the bloggers can tell who came ready.
              </p>
            </Card>
            <Card title="THE FULL-PREP BONUS">
              <p>
                Personally plan <Hl>every single day</Hl> — no auto-filled gaps — and you earn{' '}
                <Num>+1 bonus battle slot</Num> the day the battle runs. Win and that’s another{' '}
                <Num>+1</Num>. The game pays you for showing up like a professional.
              </p>
            </Card>
            <ProTip>
              A balanced template to steal: 1–2 research (intel + haymakers), 2 of whatever your
              room weighs (writing or performance), 1 rest. Adjust from the scouting report. Never
              zero rest days if your stress is climbing — tired battlers choke, and the tape lives
              forever.
            </ProTip>
          </Section>

          {/* 05 — SCOUTING */}
          <Section
            id="scouting"
            num="05"
            title="SCOUTING REPORTS"
            kicker="Research days = receipts"
          >
            <p>
              Every research day you bank for a battle unlocks a deeper tier of intel on your
              opponent — all computed from their real game history, never invented. This is film
              study.
            </p>
            <div className="space-y-3">
              <Card title="TIER 0 — NO RESEARCH">
                <p>
                  A teaser. “Word on the street is they got tape out there.” You know
                  their name and nothing else. Walking in blind is a choice.
                </p>
              </Card>
              <Card title="TIER 1 — ONE RESEARCH DAY">
                <p>
                  Record, ELO rating, win streak, tier, and style tags. Enough to know if
                  you’re the favorite or the sacrifice.
                </p>
              </Card>
              <Card title="TIER 2 — TWO RESEARCH DAYS">
                <p>
                  Everything above plus their <Hl>last 3 battle results</Hl> and average crowd
                  reaction across all their tape. Now you know if the room loves them.
                </p>
              </Card>
              <Card title="TIER 3 — THREE+ RESEARCH DAYS">
                <p>
                  The full dossier: <Hl>choke rate</Hl> from their actual round history, a
                  peak-vs-consistency read (FLASHY BUT INCONSISTENT / PEAK PERFORMER / STEADY
                  GRINDER), their complete badge list with negative badges flagged as{' '}
                  <Hl>EXPLOIT</Hl> targets, plus written insights like “pressure him early, he
                  folds when the heat is on.“
                </p>
              </Card>
            </div>
            <p>
              How to weaponize it: a 15%+ choke rate means stay aggressive and let the pressure
              cook. A STEADY GRINDER with no spikes means you need a haymaker they can’t
              answer — load research days for the peak chance. A 75%+ crowd average means take the
              room early or drown in it.
            </p>
            <ProTip>
              Research double-dips. The same days that unlock intel also unlock your full{' '}
              <Num>15%</Num> per-segment haymaker chance — zero research days cuts it to{' '}
              <Num>7.5%</Num>. Film study literally writes your best bar.
            </ProTip>
          </Section>

          {/* 06 — BATTLE NIGHT */}
          <Section
            id="battle-night"
            num="06"
            title="BATTLE NIGHT"
            kicker="Segments, haymakers, stumbles, chokes — the anatomy of a round"
          >
            <p>
              Battles are three rounds, best two out of three. Each round is sliced into 30-second
              segments — <Num>4</Num> per round in 2-minute leagues, <Num>6</Num> in 3-minute
              leagues — and every segment gets its own score. That’s how the sim produces real
              battle shapes: “he had two crazy moments but the filler was weak” is a
              high-peak, low-consistency line of numbers.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Card title="HAYMAKERS">
                <p>
                  <Num>15%</Num> chance per segment (with research prep) that a segment spikes —
                  score multiplied <Num>×1.2+</Num> and the crowd jumps <Num>+15</Num>. The
                  rewindable moment.
                </p>
              </Card>
              <Card title="STUMBLES">
                <p>
                  Base <Num>4.2%</Num> per segment. Forgot a line, slight fumble — <Num>15%</Num>{' '}
                  score penalty (only 10% if your recovery skill is 8+). About <Num>40%</Num> of
                  battles see at least one. Annoying, survivable.
                </p>
              </Card>
              <Card title="CHOKES">
                <p>
                  Base <Num>1.4%</Num> per segment, floor 0.8%, cap 25%. A choked segment keeps
                  only <Num>15%</Num> of its score — an <Hl>85% penalty</Hl>. You do not win that
                  round. Average battler chokes in ~<Num>7%</Num> of battles. A Known Choker?
                  Around <Num>45–50%</Num>.
                </p>
              </Card>
            </div>
            <Card title="HOW THE JUDGES SCORE A ROUND">
              <p>
                Composite of <Num>40%</Num> average score + <Num>35%</Num> peak moment +{' '}
                <Num>25%</Num> crowd reaction. So a steady technician, a one-haymaker wonder, and a
                crowd-rocking performer all have a real path to the round. Momentum carries between
                rounds too (±2% per point) — win a round big and the next one starts tilted your
                way.
              </p>
            </Card>
            <Card title="THE VERDICTS">
              <p>
                <Hl>3-0 BODYBAG</Hl> — swept with a 3.0+ average margin. They’re renaming the
                event after you. <Hl>3-0 CLEAN SWEEP / GENTLEMAN’S 30</Hl> — swept, but the
                loser kept it respectable. <Hl>2-1 CLASSIC</Hl> — both cooked, crowd stayed hot
                (60+ average). <Hl>2-1 EDGE</Hl> — the debatable. The comment section’s whole
                week.
              </p>
            </Card>
            <p>
              What raises your choke odds: stress (up to <Num>+10%</Num> at 100), being broke
              (financial under 4), a losing streak past two, an opponent rated <Num>200+</Num>{' '}
              above you, fame above 70, and deep tournament rounds (finals add <Num>+3%</Num>).
              What lowers them: resilience above 5 (<Num>−2.5%/point</Num>), prep days
              (<Num>−0.4%/day</Num>), rest, and the right badges.
            </p>
            <ProTip>
              Chokes feel random until you audit yourself: low rest, high stress, three battles
              that week, opponent way above your weight. The sim was tuned with a real battler who
              put it plainly — <Hl>“you cannot win a round if you choke.”</Hl> Manage the
              inputs and the meltdowns get rare.
            </ProTip>
          </Section>

          {/* 07 — ROOMS */}
          <Section
            id="rooms"
            num="07"
            title="PICK YOUR ROOMS"
            kicker="19 leagues, 4 tiers, and judging cultures that do not agree"
          >
            <p>
              Every league has a <Hl>writing weight</Hl> and a <Hl>performance weight</Hl>, and
              they change what the judges are even looking at. Small Room Circuit judges the pen at{' '}
              <Num>70/30</Num> writing-heavy. Main Stage Arena flips it — <Num>30/70</Num>{' '}
              performance-heavy. Same battler, same prep, opposite results. That’s not a bug,
              that’s battle rap: legends in one room are food in another.
            </p>
            <div className="space-y-2">
              <StatRow label="UNDERGROUND · 8 LEAGUES" value="$200–500 payouts · 2-min rounds · where names get made" />
              <StatRow label="REGIONAL · 7 LEAGUES" value="$500–2,000 · 2–3 min rounds · booking standards tighten" />
              <StatRow label="NATIONAL · 2 LEAGUES" value="$2,000–5,000 · 3-min rounds · career-defining stages" />
              <StatRow label="PREMIER · 2 LEAGUES" value="$5,000+ · 3-min rounds · the crown" />
            </div>
            <p>
              Leagues also have personality — Gunbarz Assembly rewards heavy gun-bar aggression,
              Respect The Craft is a national room where the pen is everything, You Got Smoked
              wants bodybag energy. Round length matters too: 3-minute rooms mean 6 segments per
              round, which is more chances to haymaker <Hl>and</Hl> more chances to stumble. Deep
              writing wins long rounds.
            </p>
            <ProTip>
              Before accepting any offer, check the league’s weights against your build. A
              9-pen writer taking a 30/70 performance room is donating a loss to someone’s
              highlight reel. Fight where your judges live.
            </ProTip>
          </Section>

          {/* 08 — SLOTS */}
          <Section
            id="slots"
            num="08"
            title="DAILY SLOTS"
            kicker="3 a day. Earn 2 more. Scarcity is the coach."
          >
            <p>
              You get <Num>3</Num> AI battle slots per day. That’s stage time, and stage time
              is finite. Two ways to earn more, capped at <Num>+2</Num> bonus slots per day:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Card title="+1 — WIN A BATTLE">
                <p>Winners get booked. Take a W today and the promoter finds you another spot.</p>
              </Card>
              <Card title="+1 — WALK IN FULLY PREPPED">
                <p>
                  Hand-plan every prep day (zero auto-filled blocks) and you earn a slot the moment
                  that battle runs — win or lose. Professionalism pays.
                </p>
              </Card>
            </div>
            <p>
              Slots reset at <Hl>midnight UTC</Hl>, and bonus slots don’t carry over — use
              them or lose them. PvP battles against other humans <Hl>never</Hl> consume slots,
              and neither do dream matchups. Only AI bookings burn stage time.
            </p>
            <ProTip>
              The cap isn’t punishment, it’s pacing. Three battles a day with real prep
              beats five battles winged. Stress stacks per battle, and stressed battlers choke on
              camera. The grind is a marathon with occasional gunfire.
            </ProTip>
          </Section>

          {/* 09 — UNIVERCITY */}
          <Section
            id="univercity"
            num="09"
            title="THE UNIVERCITY"
            kicker="Cities, scenes, and the price of pulling up"
          >
            <p>
              The map is real. Every city has a scene with its own size, its own culture, its own
              local battlers and leagues. Where you’re standing matters: local scenes feed you
              local offers, and the battlers you can recruit are the ones in the room with you.
            </p>
            <Card title="TRAVEL COSTS — PRICED BY DESTINATION SCENE SIZE">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                <div className="text-center bg-[#18191c] border border-[#3a3d44] rounded p-2">
                  <div className="font-mono text-[10px] uppercase text-zinc-500">SMALL</div>
                  <div className="font-display font-black text-[#ff8c42] text-lg">$100</div>
                </div>
                <div className="text-center bg-[#18191c] border border-[#3a3d44] rounded p-2">
                  <div className="font-mono text-[10px] uppercase text-zinc-500">MEDIUM</div>
                  <div className="font-display font-black text-[#ff8c42] text-lg">$200</div>
                </div>
                <div className="text-center bg-[#18191c] border border-[#3a3d44] rounded p-2">
                  <div className="font-mono text-[10px] uppercase text-zinc-500">LARGE</div>
                  <div className="font-display font-black text-[#ff8c42] text-lg">$350</div>
                </div>
                <div className="text-center bg-[#18191c] border border-[#3a3d44] rounded p-2">
                  <div className="font-mono text-[10px] uppercase text-zinc-500">MAJOR</div>
                  <div className="font-display font-black text-[#ff8c42] text-lg">$500</div>
                </div>
              </div>
            </Card>
            <p>
              Travel comes out of your battle earnings, so the road has to be worth it. Reasons to
              pull up anyway: a recruit you want for your crew (recruiting is strictly in-person —
              Section 10), a scene whose league fits your build, or just planting a flag. Every
              trip gets logged in your travel history. Road warriors are made, not born.
            </p>
            <ProTip>
              Broke and stuck in a small market? Good. Small scenes mean cheap living and winnable
              rooms. Stack wins and payouts at home, <Hl>then</Hl> buy the $500 ticket to a major
              scene when your rating can cash the check your travel budget is writing.
            </ProTip>
          </Section>

          {/* 10 — CREW */}
          <Section
            id="crew"
            num="10"
            title="YOUR CREW"
            kicker="Max 3 · recruited face to face · everybody contributes"
          >
            <p>
              You can recruit up to <Num>3</Num> AI battlers into your crew, and every member
              donates <Hl>+1 prep day per battle</Hl> in their specialty — research, writing, or
              performance, derived from whatever their best stat group actually is. A full crew is
              three free prep days every single battle. That’s a different career.
            </p>
            <Card title="RECRUITING COSTS — BY TARGET TIER">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                <div className="text-center bg-[#18191c] border border-[#3a3d44] rounded p-2">
                  <div className="font-mono text-[10px] uppercase text-zinc-500">LOW</div>
                  <div className="font-display font-black text-[#ff8c42] text-lg">$200</div>
                </div>
                <div className="text-center bg-[#18191c] border border-[#3a3d44] rounded p-2">
                  <div className="font-mono text-[10px] uppercase text-zinc-500">MID</div>
                  <div className="font-display font-black text-[#ff8c42] text-lg">$500</div>
                </div>
                <div className="text-center bg-[#18191c] border border-[#3a3d44] rounded p-2">
                  <div className="font-mono text-[10px] uppercase text-zinc-500">TOP</div>
                  <div className="font-display font-black text-[#ff8c42] text-lg">$1,500</div>
                </div>
                <div className="text-center bg-[#18191c] border border-[#3a3d44] rounded p-2">
                  <div className="font-mono text-[10px] uppercase text-zinc-500">GOD</div>
                  <div className="font-display font-black text-[#ff8c42] text-lg">$5,000</div>
                </div>
              </div>
            </Card>
            <p>
              The rule that matters: <Hl>recruiting happens face to face.</Hl> You must be standing
              in the same city as your target. No DM recruiting, no remote signings. If the wordplay
              wizard you want lives in a $350 large-scene city, that trip is part of the price. Crew
              full? Somebody gets dismissed before somebody gets signed.
            </p>
            <ProTip>
              Recruit for your weakness, not your ego. A writer with a 9-pen doesn’t need a
              writing specialist — they need a performance coach feeding +1 performance day every
              battle, patching the stat the judges keep dinging. A $200 low-tier specialist gives
              the exact same +1 day as a $5,000 god. Buy the specialty, not the name.
            </ProTip>
          </Section>

          {/* 11 — PVP */}
          <Section
            id="callout"
            num="11"
            title="CALL SOMEBODY OUT"
            kicker="Async PvP — battle real people on real stakes"
          >
            <p>
              See another player’s battler flexing on the rankings? Challenge them. PvP is
              asynchronous — nobody has to be online at the same time — and it runs on a clock:
            </p>
            <div className="space-y-2">
              <StatRow label="THE WINDOW" value="Battle fires 72 hours after the challenge" />
              <StatRow label="PREP LOCKS" value="66 hours in — 6 hours before showtime" />
              <StatRow label="ACCEPTANCE" value="They must accept before either side can prep" />
              <StatRow label="SLOTS" value="PvP never burns daily battle slots" />
              <StatRow label="DUPLICATES" value="One pending challenge per pair — settle it first" />
            </div>
            <p>
              Both sides prep <Hl>in private</Hl>. You can’t see their calendar; they
              can’t see yours. Research days still buy scouting intel on them, though — their
              record, tape, and choke history are public knowledge if you do the homework. When
              you’re done prepping, <Hl>lock in</Hl>. If both players lock in early, the
              battle simulates immediately. If someone sits on it, the cron resolves it at the
              72-hour mark with whatever prep exists.
            </p>
            <Card title="NEVER GHOST">
              <p>
                Never open the prep planner on an accepted challenge? You get the full no-show
                treatment: an auto-generated “winging it” plan and the same penalties as
                standing up an AI booking. The battle runs without your input, both careers take
                the result, and the bloggers write it up. The culture remembers who didn’t
                show.
              </p>
            </Card>
            <ProTip>
              Lock in early only if your prep is genuinely done — locking is a commitment, not a
              flex. But if your opponent is the type to ghost, a tight 2-day prep with a lock
              beats their auto-plan ten times out of ten. Pressure busts pipes, even asynchronously.
            </ProTip>
          </Section>

          {/* 12 — DREAM MATCHUPS */}
          <Section
            id="dream"
            num="12"
            title="DREAM MATCHUPS"
            kicker="The simulator — settle arguments, risk nothing"
          >
            <p>
              The matchup simulator is the “who would win” argument with an engine behind
              it. Pick any two battlers in the universe — yours, your rival’s, an AI legend, a
              verified real battler — and run the fight.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Card title="NEUTRAL GROUND">
                <p>
                  Default venue: 50/50 writing-performance weights, 2-minute rounds. Or pick a real
                  league and watch its judging culture flip the result.
                </p>
              </Card>
              <Card title="FAIR FIGHT">
                <p>
                  Both sides get an identical balanced prep week (2 research / 2 writing / 2
                  performance / 1 rest). What you’re testing is attributes, badges, and the
                  room — nothing else.
                </p>
              </Card>
              <Card title="ZERO CONSEQUENCES">
                <p>
                  100% read-only. No ratings, no payouts, no progression, no press. Your record
                  doesn’t know it happened.
                </p>
              </Card>
            </div>
            <p>
              You still get the full three-round breakdown — averages, peaks, crowd, chokes — plus
              a headline made for sharing: “THE 2-1 EVERYBODY WILL ARGUE ABOUT.” Run it
              once, get an answer. Run it ten times, get a probability. That’s how fans argue
              and how smart players scout.
            </p>
            <ProTip>
              Use it as a free scouting lab: sim your own battler against your next real opponent
              in the actual league you’ll fight in. The exhibition uses the same segment math
              as the real engine — if you’re getting swept on neutral ground with balanced
              prep, your real prep week needs to be anything but balanced.
            </ProTip>
          </Section>

          {/* 13 — PRESS */}
          <Section
            id="press"
            num="13"
            title="BADGES & THE PRESS"
            kicker="97 badges · 8 bloggers · your name in somebody's mouth"
          >
            <p>
              <Hl>Badges are earned, not picked.</Hl> After every battle the engine audits your
              performance, career stats, streaks, attributes, and prep habits against 97 defined
              badges. Drop a monster haymaker? Stack a streak? Choke twice in a month? The badge
              system saw it. Badges have real mechanical effects — Clutch Performer cuts choke
              odds, Known Choker adds <Num>+7%</Num> per segment, prep-efficiency badges make your
              prep days hit harder. Coherent badge combos earn synergy bonuses; contradictory ones
              clash.
            </p>
            <Card title="THE 8 BLOGGERS COVERING YOUR CAREER">
              <div className="space-y-1.5 mt-1">
                <p><Hl>Battle Eyez</Hl> — drama hunter. “Let me put you on to what really happened...”</p>
                <p><Hl>Marijuana Piranha</Hl> (The Cipher) — street authenticity. “Keep it a buck—”</p>
                <p><Hl>Algorithm Institute</Hl> — the historian. “In the annals of battle rap history...”</p>
                <p><Hl>Small Room Report</Hl> — underground purist. “The small room doesn’t lie—”</p>
                <p><Hl>The Main Stage Herald</Hl> — big-stage spectacle. “On the biggest stage in battle rap—”</p>
                <p><Hl>Underground Voice</Hl> — regional scenes. “The underground sees everything—”</p>
                <p><Hl>Coast to Coast Coverage</Hl> — cynical underdog champion. “Let me tell you what they won’t—”</p>
                <p><Hl>The Battle Breakdown</Hl> — scorecard analyst. “Let’s go to the scorecards—”</p>
              </div>
            </Card>
            <p>
              Each persona has biases — Battle Eyez lives for personal attacks and beef, The Battle
              Breakdown only respects the numbers — and the coverage adjusts to the verdict: a 3-0
              bodybag gets a short brutal write-up, a 2-1 classic gets the long-form treatment where
              both names shine. Stack the articles over a career and you have a media trail: your
              chokes, your classics, your rivalries, your redemption arcs, all on the record in the
              media hub.
            </p>
            <ProTip>
              Negative badges are public. Tier-3 scouting flags them as EXPLOIT lines for anyone
              researching you. If you’re carrying Known Choker, every prepared opponent is
              walking in planning to pressure you. Rest days and clean performances are how you
              outgrow your worst headline.
            </ProTip>
          </Section>

          {/* 14 — LIFE */}
          <Section
            id="life"
            num="14"
            title="LIFE COMES AT YOU"
            kicker="Stress, events, and the stuff that happens between battles"
          >
            <p>
              Your battler has a life, and it does not pause for prep week. Two systems run under
              everything:
            </p>
            <Card title="STRESS (0–100)">
              <p>
                Builds from juggling multiple booked battles (<Num>+15</Num> per extra concurrent
                battle), battling back-to-back, and money problems. It decays with time off — twice
                as fast if your family bond is 7+. At 100 stress you’re carrying{' '}
                <Num>+10%</Num> choke and <Num>+4%</Num> stumble chance into every segment.
                Overbooking is how highlight reels of <Hl>other people’s</Hl> haymakers get
                made.
              </p>
            </Card>
            <Card title="LIFE EVENTS">
              <p>
                <Hl>Choice events</Hl> drop a situation in your lap — your ex airs you out, address
                it publicly or stay silent? — and the right answer depends on who your battler
                actually is. <Hl>Triggered events</Hl> react to results: win streaks, viral
                haymakers, chokes that follow you. <Hl>Passive events</Hl> punish patterns, like
                burnout from grinding five straight prep days with no rest. Effects are mechanical:
                attributes, stress, reputation, sometimes money.
              </p>
            </Card>
            <p>
              The personal stats are your insurance policy. Family bond 8+ blocks family-drama
              events entirely; 7+ also unlocks support events after rough losses. Financial
              stability above 4 keeps money pressure out of your choke math. Life prep days feel
              like wasted bars right up until they save your season.
            </p>
            <ProTip>
              The week after a bad choke is the most dangerous week of your career: stress is up,
              your streak is bleeding, and the pressure modifiers stack. Take a light battle or
              take days off. Forcing a revenge booking while overwhelmed is how one choke becomes a
              choke <Hl>reputation</Hl> — and that badge travels.
            </ProTip>
          </Section>

          {/* 15 — VERIFIED */}
          <Section
            id="verified"
            num="15"
            title="VERIFIED BATTLERS"
            kicker="Real names. Licensed likenesses. The checkmark means it's really them."
          >
            <p>
              Some battlers in this universe are <Hl>real</Hl>. Verified battlers are actual,
              living battle rappers whose likeness is in the game with permission — the checkmark
              means the person behind the profile signed off on it, and claimed it with a private
              claim code. Verified battlers manage their own bio and avatar. Nobody’s likeness
              gets used without a license.
            </p>
            <Card title="TRU FOE — THE FIRST VERIFIED BATTLER">
              <p>
                “Tha Solid One” out of Chicago’s Northside. A decade-plus road
                warrior with no hometown league — just a trunk full of rounds and a habit of
                pulling up on anybody’s stage. Inaugural Midnight Madness War Dog Champion.
                Sent Geechi Gotti home in the first round of Ultimate Madness 5, an upset people
                still argue about. In-game: <Num>9</Num> flow, <Num>9</Num> delivery,{' '}
                <Num>9</Num> stage presence — and <Num>9</Num> resilience, because performing best
                as the underdog is his whole documented thing.
              </p>
            </Card>
            <p>
              Tru Foe isn’t just on the roster — he helped tune the engine. The choke rates,
              stumble penalties, and “you cannot win a round if you choke” rule were all
              validated against his expert feedback. When the sim feels authentic, that’s
              partially a real battler making sure it does.
            </p>
            <ProTip>
              Verified battlers are fair game in the dream matchup simulator. Want to know how your
              battler does against Tru Foe on neutral ground? Run it. Resilience 9 means waiting
              for him to choke is not a strategy — bring a pen.
            </ProTip>
          </Section>

          {/* 16 — GOAT */}
          <Section
            id="goat"
            num="16"
            title="THE ROAD TO GOAT"
            kicker="XP, levels, thrones — what longevity looks like"
          >
            <p>
              Every battle pays XP whether you win or lose. The base check is <Num>100 XP</Num>{' '}
              just for taking the stage, then the bonuses stack:
            </p>
            <div className="space-y-2">
              <StatRow label="WIN" value="+50" />
              <StatRow label="3-0 BODYBAG" value="+75" />
              <StatRow label="2-1 DECISION" value="+25" />
              <StatRow label="HAYMAKER (PEAK ≥ 8.5)" value="+30 each" />
              <StatRow label="PERFECT ROUND (NO CHOKE, NO STUMBLE)" value="+40" />
              <StatRow label="CROWD ≥ 85" value="+25" />
              <StatRow label="MILESTONES (10/25/50/100 BATTLES)" value="+200 / +500 / +1,000 / +2,500" />
            </div>
            <p>
              Thirty levels, six career tiers: <Hl>Rookie</Hl> (1–5) → <Hl>Up-and-Comer</Hl> (6–10)
              → <Hl>Established</Hl> (11–15) → <Hl>Elite</Hl> (16–20) → <Hl>Legend</Hl> (21–25) →{' '}
              <Hl>GOAT</Hl> (26–30). The full climb takes roughly <Num>180–220</Num> battles. Every
              level pays <Num>2 skill points</Num>, each worth +0.1 to an attribute (max 10 points
              per attribute) — your earned edge on top of natural progression, which is also
              automatic: score 7.0+ and your pen grows, rock a 75+ crowd and your stage grows,
              survive a battle choke-free and your resilience hardens. Peak 8.5+ pays a creativity
              bonus. Winners gain a little extra; losers still gain half.
            </p>
            <Card title="THRONES">
              <p>
                Every league has <Num>3</Num> throne positions — its faces, its top of the food
                chain. To take one, you challenge the holder directly: you must be within{' '}
                <Num>100 ELO</Num> of them, and they get <Num>48 hours</Num> to answer. One pending
                challenge per seat — if somebody’s already next in line, wait your turn or go
                take a different room. Holding a throne means everybody under you is doing this math
                about <Hl>you</Hl>.
              </p>
            </Card>
            <ProTip>
              Longevity is the real flex. Anyone can spike a rating in a hot month — GOATs are
              built on hundreds of battles across multiple rooms, a media trail with chapters, and
              thrones defended, not just taken. Lose a classic at the right moment and it does more
              for your legend than ten quiet wins. Take the big battles.
            </ProTip>
          </Section>

          {/* 17 — FAQ */}
          <Section id="faq" num="17" title="FAQ" kicker="Office hours — real questions, code-true answers">
            <div className="space-y-3">
              <Faq q="Why did I choke?">
                <p>
                  Base choke chance is <Num>1.4%</Num> per segment, but it moves with your life:
                  stress adds up to +10%, financial trouble, losing streaks, fame above 70, and
                  facing somebody rated 200+ above you all stack on top. Resilience above 5
                  (−2.5%/point) and prep days (−0.4%/day) pull it back down, with a floor of 0.8% —
                  even GOATs can have a night. The average battler chokes in about <Num>7%</Num> of
                  battles. If it’s happening a lot, check your stress, your rest days, and
                  whether you’re carrying a negative badge.
                </p>
              </Faq>
              <Faq q="Why can't I battle again today?">
                <p>
                  You get <Num>3</Num> AI battle slots a day. You can earn up to <Num>+2</Num>{' '}
                  bonus slots — one for winning, one for walking in with a fully hand-planned prep
                  calendar. Slots reset at midnight UTC and bonuses don’t carry over. PvP
                  challenges and dream matchups don’t use slots at all, so the stage isn’t
                  totally closed.
                </p>
              </Faq>
              <Faq q="Do dream matchups affect my record?">
                <p>
                  No. The exhibition simulator is 100% read-only — no rating changes, no payouts,
                  no attribute progression, no press coverage. Run your battler against anyone, as
                  many times as you want, consequence-free.
                </p>
              </Faq>
              <Faq q="Can I change my stage name?">
                <p>
                  Not currently — your stage name is set at creation, so treat it like a tattoo.
                  (Verified real battlers can edit their bio and avatar on their claimed profile,
                  but the name is the name.)
                </p>
              </Faq>
              <Faq q="What happens if I accept a battle and never prep?">
                <p>
                  The battle still happens. You get flagged as a no-show, the game auto-generates a
                  “winging it” prep plan, and your performance eats a <Num>60%</Num>{' '}
                  penalty. You’ll almost certainly lose, and you’ll lose on tape. Partial
                  prep is gentler — empty days just get backfilled as rest.
                </p>
              </Faq>
              <Faq q="What's the difference between a stumble and a choke?">
                <p>
                  A stumble is forgetting a line — <Num>15%</Num> score penalty on that segment
                  (10% if your delivery + crowd control average 8+). A choke is a full meltdown —
                  the segment keeps only 15% of its score, and that round is gone. Stumbles happen
                  in ~40% of battles and you recover. Chokes make headlines.
                </p>
              </Faq>
              <Faq q="I have better stats — why did I lose?">
                <p>
                  Three suspects. One: league weights — your 9-pen counts at 30% in a
                  performance-heavy room. Two: variance — segments swing hard by design, which is
                  why upsets exist and why every 2-1 is an argument. Three: judging — rounds score
                  40% average / 35% peak / 25% crowd, so their one haymaker plus a hot room can
                  outvote your steady superiority. Stats are the floor, not the verdict.
                </p>
              </Faq>
              <Faq q="How do I get more prep days?">
                <p>
                  Crew. Each of your (up to) <Num>3</Num> crew members contributes +1 prep day per
                  battle in their specialty — research, writing, or performance. A full crew is
                  three extra days every battle, forever. Costs run $200 / $500 / $1,500 / $5,000
                  by tier, and you must recruit in person, in their city.
                </p>
              </Faq>
              <Faq q="Why can't I recruit this battler?">
                <p>
                  Three possibilities: you’re not standing in their city (recruiting is
                  face-to-face — travel there), your crew is full at 3 (dismiss someone first), or
                  your pockets can’t cover their tier price. Also, only AI battlers can be
                  recruited — other players’ battlers have their own careers to ruin.
                </p>
              </Faq>
              <Faq q="What happens if my PvP opponent ghosts?">
                <p>
                  The battle runs anyway. At the 72-hour mark the cron simulates it with whatever
                  prep exists. A side that never opened the planner gets the no-show treatment —
                  auto-generated “winging it” prep and the penalties that come with it.
                  Both records take the result. Ghosting doesn’t dodge the battle; it just
                  donates it.
                </p>
              </Faq>
            </div>
          </Section>

          {/* Outro */}
          <div className="bg-gradient-to-br from-[#ff8c42]/15 to-[#18191c] border-2 border-[#ff8c42]/40 rounded-lg p-6 sm:p-8 text-center">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#ff8c42] mb-3">
              CLASS DISMISSED
            </div>
            <h2 className="font-display font-black uppercase tracking-tighter text-2xl sm:text-3xl mb-3">
              NOW GO CATCH A BODY
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto mb-6">
              You know the numbers. You know the rooms. The only thing this guide can’t teach
              you is what you do when the crowd goes quiet and it’s your turn to talk.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-tight px-8 py-3 rounded-lg transition-colors"
            >
              🎤 TAKE THE STAGE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
