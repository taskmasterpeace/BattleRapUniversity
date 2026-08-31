// Landing page — fight-night poster energy, real game UI, a self-playing demo
// of the career loop, and a LIVE pulse from the actual world (real upcoming
// cards, real headlines, real rankings). Server component; the loop demo is
// the only client island.
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import GameLoopDemo from '@/components/landing/GameLoopDemo';
import { portraitFillStyle } from '@/lib/sprite-crops';

export const revalidate = 300; // the world moves hourly; refresh the pulse every 5 min

type PulseBattle = {
  id: string;
  scheduled_at: string;
  a: { stage_name: string; avatar_url: string | null; is_real: boolean } | null;
  b: { stage_name: string; avatar_url: string | null; is_real: boolean } | null;
  league: { name: string } | null;
};

async function getWorldPulse() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const [{ data: upcoming }, { data: headlines }, { data: top }] = await Promise.all([
      supabase
        .from('battles')
        .select(
          'id, scheduled_at, a:battler_player_id(stage_name, avatar_url, is_real), b:battler_ai_id(stage_name, avatar_url, is_real), league:leagues(name)'
        )
        .eq('status', 'accepted')
        .gt('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(3),
      supabase
        .from('news_articles')
        .select('slug, title')
        .order('published_at', { ascending: false })
        .limit(8),
      supabase
        .from('rankings')
        .select('rating, battler:battler_id(id, stage_name, avatar_url, is_real)')
        .order('rating', { ascending: false })
        .limit(6),
    ]);

    return {
      upcoming: ((upcoming as unknown as PulseBattle[]) ?? []).filter(
        (x) => x.a && x.b && !x.a.stage_name.startsWith('Test_') && !x.b.stage_name.startsWith('Test_')
      ),
      headlines: (headlines ?? []).filter((h) => !/^test/i.test(h.title ?? '')),
      top: ((top as any[]) ?? [])
        .filter((t) => t.battler && !t.battler.stage_name.startsWith('Test_'))
        .slice(0, 3),
    };
  } catch {
    return { upcoming: [], headlines: [], top: [] };
  }
}

const HERO_BATTLERS = [
  { src: '/sprites/characters/image_1764146494580/sprite_848.png', name: 'THE WRITER' },
  { src: '/sprites/characters/image_1764146517369/sprite_815.png', name: 'THE PERFORMER' },
  { src: '/sprites/characters/image_1764146527629/sprite_782.png', name: 'THE PROBLEM' },
];

const LEAGUES = [
  { name: 'Royal Wordsmiths', code: 'RWS', logo: '/sprites/leagues/image_1764195526092/league_152.png' },
  { name: 'Stay Forever', code: 'STF', logo: '/sprites/leagues/image_1764196239271/league_001.png' },
  { name: 'Respect The Craft', code: 'RTC', logo: '/sprites/leagues/image_1764196239271/league_003.png' },
  { name: 'Spitfire Arena', code: 'SFA', logo: '/sprites/leagues/image_1764196065055/league_078.png' },
  { name: 'Crown City Battle League', code: 'CCB', logo: '/sprites/leagues/image_1764196065055/league_073.png' },
  { name: 'Block Buster Battles', code: 'BBB', logo: '/sprites/leagues/image_1764196070252/league_072.png' },
  { name: 'Urban Warfare League', code: 'UWL', logo: '/sprites/leagues/image_1764196065055/league_079.png' },
  { name: 'Barz Supreme League', code: 'BSL', logo: '/sprites/leagues/image_1764196076327/league_050.png' },
  { name: 'Flow Syndicate', code: 'FSY', logo: '/sprites/leagues/image_1764196076327/league_051.png' },
  { name: 'Main Stage Arena', code: 'MSA', logo: '/sprites/leagues/image_1764195537197/league_110.png' },
  { name: 'Small Room Circuit', code: 'SRC', logo: '/sprites/leagues/image_1764196076327/league_053.png' },
  { name: 'Mic Masters Arena', code: 'MMA', logo: '/sprites/leagues/image_1764196076327/league_049.png' },
];

const FEATURES = [
  {
    icon: 'skull',
    title: 'THE CHOKE IS REAL',
    body: 'Low resilience and bad prep means you can freeze on stage with the whole room watching. Known Chokers blow 45% of their battles. Clutch performers? 3%. Build the nerve or get a reputation.',
  },
  {
    icon: 'pen',
    title: 'PEN VS PERFORMANCE',
    body: 'A technical league judges 60% on the writing. A bar-room crowd wants delivery and presence. The same battler wins one room and gets washed in the other. Pick your circuits wisely.',
  },
  {
    icon: 'news',
    title: 'THE PRESS NEVER SLEEPS',
    body: 'Eight AI bloggers with their own agendas cover every battle. Bodied somebody? Front page. Choked? Also front page. Your rivalries, your slumps, your comebacks — all on the record.',
  },
  {
    icon: 'medal',
    title: '97 BADGES TO EARN',
    body: 'Punchline Czar. Crowd Favorite. Giant Slayer. And the ones you don\'t want — Choker, Drama Starter, One-Dimensional. Your badge case tells the story of who you really are.',
  },
  {
    icon: 'crown',
    title: 'TAKE THE THRONE',
    body: 'Every league has three thrones held by its top battlers. Call out a throne holder, win, and take their seat. Then defend it — because everybody under you is calling you out next.',
  },
  {
    icon: 'flame',
    title: 'LIFE COMES AT YOU',
    body: 'Win streaks bring temptation. Losses bring doubt. Family, money, beef — life events hit between battles and your choices shape your attributes, your stress, and your story.',
  },
];

const SHOTS = [
  {
    src: '/landing/shot-battle.png',
    label: 'BATTLE RESULTS',
    caption: 'Round by round, segment by segment — the tape tells the whole story.',
    rotate: '-rotate-1',
  },
  {
    src: '/landing/shot-dashboard.png',
    label: 'YOUR CAREER HQ',
    caption: 'Rating, record, streaks, XP, badges — your whole legacy on one screen.',
    rotate: 'rotate-1',
  },
  {
    src: '/landing/shot-league.png',
    label: 'THE LEAGUE LADDER',
    caption: 'From underground rooms to the main stages — every league has its own purse and culture.',
    rotate: '-rotate-1',
  },
  {
    src: '/landing/shot-badges.png',
    label: 'BADGE COLLECTION',
    caption: '97 ways to make a name. A few ways to ruin one.',
    rotate: 'rotate-1',
  },
];

const TICKER_ITEMS = [
  'MAIN STAGE ARENA', 'ROYAL WORDSMITHS', 'BARZ SUPREME LEAGUE', 'SPITFIRE ARENA',
  'CROWN CITY', 'FLOW SYNDICATE', 'URBAN WARFARE', 'SMALL ROOM CIRCUIT',
  'MIC MASTERS ARENA', 'BLOCK BUSTER BATTLES', 'RESPECT THE CRAFT', 'STAY FOREVER',
];

export default async function LandingPage() {
  const pulse = await getWorldPulse();
  // Live ticker: real headlines when the world has them, league names as filler
  const tickerItems =
    pulse.headlines.length >= 4 ? pulse.headlines.map((h) => h.title) : TICKER_ITEMS;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 overflow-x-hidden relative">
      {/* film grain over everything */}
      <div className="grain-overlay fixed inset-0 z-50" />

      {/* ── BREAKING TICKER (real headlines from the living world) ── */}
      <div className="border-b border-[#ff8c42]/30 bg-[#0e0f12] py-2 overflow-hidden flex items-center">
        <span className="flex-shrink-0 px-3 font-mono text-[10px] font-bold uppercase tracking-widest bg-[#ff8c42] text-black py-0.5 ml-3 mr-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-black animate-live-blink" />
          LIVE
        </span>
        <div className="overflow-hidden flex-1">
          <div className="marquee-track marquee-track--slow">
            {[0, 1].map((dup) => (
              <span key={dup} className="inline-flex">
                {tickerItems.map((t, i) => (
                  <span key={`${dup}-${i}`} className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#ff8c42]/90 mx-8">
                    ● {t}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* city skyline backdrop — the UniverCity at night */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-bottom opacity-[0.22] animate-ken-burns [image-rendering:pixelated]"
            style={{ backgroundImage: "url('/sprites/cities/midwest/chicago-night.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/80" />
          <div className="scanlines absolute inset-0" />
        </div>
        {/* glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#ff8c42]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid lg:grid-cols-2 gap-12 items-center relative">
          {/* left: type */}
          <div>
            <div className="inline-block mb-6 px-3 py-1 border border-[#ff8c42]/50 bg-[#ff8c42]/5">
              <span className="font-mono text-xs text-[#ff8c42] uppercase tracking-[0.3em]">
                ◆ FREE PUBLIC BETA — OPEN NOW ◆
              </span>
            </div>
            <h1 className="font-bebas uppercase leading-[0.82] tracking-wide">
              <span className="block text-7xl md:text-9xl text-white drop-shadow-[0_0_30px_rgba(255,140,66,0.35)]">TALK</span>
              <span className="block text-7xl md:text-9xl text-white drop-shadow-[0_0_30px_rgba(255,140,66,0.35)]">IS</span>
              <span className="block text-7xl md:text-9xl text-[#ff8c42] drop-shadow-[0_0_40px_rgba(255,140,66,0.5)]">CHEAP.</span>
            </h1>
            <div className="mt-6 inline-block px-6 py-2 bg-[#ff8c42] skew-x-[-8deg]">
              <p className="font-anton text-lg md:text-2xl text-black uppercase tracking-[0.2em] skew-x-[8deg]">
                BATTLE RAP UNIVERSITY
              </p>
            </div>
            <p className="mt-6 text-zinc-400 text-lg leading-relaxed max-w-md">
              The battle rap career sim. Build a battler, prep like your rep depends
              on it, take the stage — and let the culture decide what you are.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider text-lg transition-all hover:-translate-y-[2px] hover:shadow-[0_12px_40px_-10px_rgba(255,140,66,0.8)]"
              >
                <Icon name="mic" size={16} className="mr-2 -mt-0.5" />ENTER THE CIRCUIT
              </Link>
              <Link
                href="/matchup"
                className="px-8 py-4 border-2 border-[#3a3d44] hover:border-[#ff8c42] text-zinc-300 font-display font-black uppercase tracking-wider text-lg transition-all"
              >
                <Icon name="swords" size={16} className="mr-2 -mt-0.5" />RUN A DREAM MATCHUP
              </Link>
              <Link
                href="/leaderboard"
                className="px-8 py-4 border-2 border-[#3a3d44] hover:border-[#ff8c42] text-zinc-300 font-display font-black uppercase tracking-wider text-lg transition-all"
              >
                <Icon name="trophy" size={16} className="mr-2 -mt-0.5" />POWER RANKINGS
              </Link>
            </div>
          </div>

          {/* right: pixel battlers under the spotlight */}
          <div className="relative flex justify-center items-end gap-0 h-[340px] md:h-[420px]">
            {/* stage spotlight cone */}
            <div className="animate-spotlight absolute bottom-0 left-1/2 w-[420px] md:w-[560px] h-[110%] pointer-events-none bg-[radial-gradient(ellipse_50%_70%_at_50%_100%,rgba(255,140,66,0.22),transparent_70%)]" />
            {/* stage floor line */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-px bg-gradient-to-r from-transparent via-[#ff8c42]/50 to-transparent" />
            {HERO_BATTLERS.map((b, i) => (
              <div
                key={b.name}
                className={`relative animate-hero-float ${i === 1 ? 'z-10 -mx-8 md:-mx-10' : 'opacity-90'}`}
                style={{ animationDelay: `${i * 0.8}s` }}
              >
                <div className={`relative ${i === 1 ? 'w-44 h-64 md:w-60 md:h-[340px]' : 'w-36 h-52 md:w-48 md:h-72'}`}>
                  <Image
                    src={b.src}
                    alt={b.name}
                    fill
                    sizes="(max-width: 768px) 176px, 240px"
                    className="object-contain [image-rendering:pixelated] drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                    priority={i === 1}
                  />
                </div>
                <p className={`text-center font-mono text-[10px] uppercase tracking-[0.25em] mt-2 ${i === 1 ? 'text-[#ff8c42]' : 'text-zinc-600'}`}>
                  {b.name}
                </p>
              </div>
            ))}
            {/* VS badge */}
            <div className="absolute top-6 right-2 md:right-8 border-4 border-[#ff8c42] px-4 py-1 rotate-12 bg-[#0a0a0a]">
              <span className="font-bebas text-3xl text-[#ff8c42]">BARS UP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE FROM THE UNIVERCITY (real world data) ───────────── */}
      {(pulse.upcoming.length > 0 || pulse.top.length > 0) && (
        <section className="relative border-y-2 border-[#ff8c42]/30 bg-[#0e0f12] py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-live-blink" />
              <h2 className="font-bebas text-3xl md:text-5xl uppercase text-white">
                LIVE FROM THE <span className="text-[#ff8c42]">UNIVERCITY</span>
              </h2>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-live-blink" />
            </div>
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500 -mt-4 mb-8">
              THIS IS NOT A MOCKUP — THE WORLD IS RUNNING RIGHT NOW
            </p>
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Tonight's card */}
              <div className="bg-[#101114] border-2 border-[#3a3d44] p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff8c42] mb-4">TONIGHT&apos;S CARD</p>
                <div className="space-y-3">
                  {pulse.upcoming.map((b) => (
                    <Link key={b.id} href={`/watch/${b.id}`} className="flex items-center gap-2 group">
                      <span className="relative w-9 h-9 flex-shrink-0 bg-[#18191c] border border-[#3a3d44] overflow-hidden">
                        {b.a?.avatar_url && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={b.a.avatar_url} alt="" style={portraitFillStyle(b.a.avatar_url)} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold uppercase tracking-tight text-zinc-200 group-hover:text-[#ff8c42] truncate transition-colors">
                          {b.a?.stage_name} <span className="text-[#ff8c42]">vs</span> {b.b?.stage_name}
                        </span>
                        <span className="block font-mono text-[9px] uppercase tracking-widest text-zinc-600 truncate">
                          {b.league?.name}
                        </span>
                      </span>
                      <span className="relative w-9 h-9 flex-shrink-0 bg-[#18191c] border border-[#3a3d44] overflow-hidden">
                        {b.b?.avatar_url && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={b.b.avatar_url} alt="" style={portraitFillStyle(b.b.avatar_url)} />
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
                <Link href="/watch" className="block mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-[#ff8c42] hover:text-[#ff9d5c]">
                  FULL CARD →
                </Link>
              </div>
              {/* Top of the rankings */}
              <div className="bg-[#101114] border-2 border-[#3a3d44] p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff8c42] mb-4">POWER RANKINGS</p>
                <div className="space-y-3">
                  {pulse.top.map((t: any, i: number) => (
                    <Link key={t.battler.id} href={`/battler/${t.battler.id}`} className="flex items-center gap-3 group">
                      <span className="font-bebas text-2xl text-[#ff8c42] w-7">#{i + 1}</span>
                      <span className="relative w-9 h-9 flex-shrink-0 bg-[#18191c] border border-[#3a3d44] overflow-hidden">
                        {t.battler.avatar_url && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={t.battler.avatar_url} alt="" style={portraitFillStyle(t.battler.avatar_url)} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold uppercase tracking-tight text-zinc-200 group-hover:text-[#ff8c42] truncate transition-colors">
                          {t.battler.stage_name}
                          {t.battler.is_real && <span className="ml-1.5 px-1 py-px bg-[#ff8c42] text-black font-mono text-[7px] font-bold tracking-widest align-middle">✓</span>}
                        </span>
                      </span>
                      <span className="font-mono text-xs text-zinc-400">{t.rating}</span>
                    </Link>
                  ))}
                </div>
                <Link href="/leaderboard" className="block mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-[#ff8c42] hover:text-[#ff9d5c]">
                  FULL RANKINGS →
                </Link>
              </div>
              {/* The press */}
              <div className="bg-[#101114] border-2 border-[#3a3d44] p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff8c42] mb-4">THE PRESS</p>
                <div className="space-y-3">
                  {pulse.headlines.slice(0, 3).map((h) => (
                    <Link key={h.slug} href={`/media/${h.slug}`} className="block group">
                      <span className="block text-xs font-bold uppercase tracking-tight leading-snug text-zinc-200 group-hover:text-[#ff8c42] transition-colors line-clamp-2">
                        {h.title}
                      </span>
                    </Link>
                  ))}
                </div>
                <Link href="/media" className="block mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-[#ff8c42] hover:text-[#ff9d5c]">
                  ALL COVERAGE →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── THE FILM ROOM — front and center, right after the pulse ── */}
      <section className="py-16 md:py-24 relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#ff8c42] mb-4">─── THE FILM ROOM ───</p>
            <h2 className="font-bebas text-6xl md:text-8xl uppercase text-white leading-none">
              HOW TO <span className="text-[#ff8c42]">PREP</span>
            </h2>
            <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
              Thirty-seven seconds on why prepared battlers eat and lazy ones
              freeze. Watch the film, then live it.
            </p>
          </div>
          <div className="relative border-2 border-[#ff8c42]/60 bg-[#101114] p-2 shadow-[0_0_80px_-20px_rgba(255,140,66,0.4)]">
            <div className="absolute -top-3 left-6 px-3 py-0.5 bg-[#ff8c42] text-black font-mono text-[10px] font-bold uppercase tracking-widest z-10">
              ▶ REQUIRED VIEWING — FRESHMAN ORIENTATION
            </div>
            <video
              className="w-full aspect-video object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src="/landing/prep-film.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* ── THE LOOP ──────────────────────────────────────────────── */}
      <section id="the-loop" className="clip-diagonal-top bg-[#0e0f12] border-y border-[#3a3d44] py-20 md:py-28 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#ff8c42] mb-4">─── THIS IS THE LIFE ───</p>
            <h2 className="font-bebas text-5xl md:text-7xl uppercase text-white leading-none">
              ONE WEEK IN <span className="text-[#ff8c42]">THE CIRCUIT</span>
            </h2>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
              Get the callout. Spend your week wisely. Take the stage. Read what they
              wrote about you. Then do it all again — that&apos;s the loop, and it never stops.
            </p>
          </div>
          <GameLoopDemo />
        </div>
      </section>

      {/* ── REAL FOOTAGE ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#ff8c42] mb-4">─── NO MOCKUPS ───</p>
            <h2 className="font-bebas text-5xl md:text-7xl uppercase text-white leading-none">
              ACTUAL GAME <span className="text-[#ff8c42]">FOOTAGE</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 md:gap-12">
            {SHOTS.map((s) => (
              <figure key={s.label} className={`group ${s.rotate} transition-transform duration-300 hover:rotate-0 hover:scale-[1.02]`}>
                <div className="border-2 border-[#3a3d44] group-hover:border-[#ff8c42] bg-[#101114] p-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] transition-colors">
                  <div className="relative aspect-[12/7]">
                    <Image
                      src={s.src}
                      alt={s.label}
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="object-cover object-top"
                    />
                  </div>
                  <figcaption className="flex items-baseline justify-between gap-4 px-2 py-3">
                    <span className="font-display font-black uppercase tracking-wider text-[#ff8c42] text-sm whitespace-nowrap">
                      {s.label}
                    </span>
                    <span className="text-zinc-500 text-xs text-right">{s.caption}</span>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section className="clip-diagonal-top bg-[#0e0f12] border-y border-[#3a3d44] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#ff8c42] mb-4">─── BUILT BY FANS, FOR FANS ───</p>
            <h2 className="font-bebas text-5xl md:text-7xl uppercase text-white leading-none">
              THE CULTURE IS <span className="text-[#ff8c42]">IN THE CODE</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-[#101114] border-2 border-[#3a3d44] p-6 hover:border-[#ff8c42] hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(255,140,66,0.5)] transition-all duration-200"
              >
                <div className="mb-4 text-[#ff8c42]"><Icon name={f.icon as any} size={34} /></div>
                <h3 className="font-display text-xl font-black uppercase tracking-tight text-zinc-100 mb-3">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEAGUES STRIP ─────────────────────────────────────────── */}
      <section className="py-16 md:py-20 overflow-hidden">
        <p className="text-center font-mono text-xs uppercase tracking-[0.4em] text-zinc-500 mb-3">
          19 LEAGUES · 10 CITIES · UNDERGROUND TO MAIN STAGE
        </p>
        <h2 className="text-center font-bebas text-4xl md:text-5xl uppercase text-white mb-10">
          WHERE WILL YOU <span className="text-[#ff8c42]">MAKE YOUR NAME?</span>
        </h2>
        <div className="marquee-track marquee-track--slow">
          {[0, 1].map((dup) => (
            <span key={dup} className="inline-flex items-center">
              {LEAGUES.map((l) => (
                <span key={`${dup}-${l.code}`} className="inline-flex flex-col items-center mx-7 w-24">
                  <span className="relative w-20 h-20 block">
                    <Image
                      src={l.logo}
                      alt={l.name}
                      fill
                      sizes="80px"
                      className="object-contain [image-rendering:pixelated] opacity-90"
                    />
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-2 text-center whitespace-normal leading-tight">
                    {l.name}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="relative border-t-2 border-[#ff8c42]/40 bg-gradient-to-b from-[#0e0f12] to-[#0a0a0a] py-24 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-bebas text-[26vw] leading-none text-[#ff8c42]/[0.045] uppercase whitespace-nowrap select-none">
            BARS UP
          </span>
        </div>
        <div className="relative max-w-3xl mx-auto px-6">
          <h2 className="font-bebas text-6xl md:text-8xl uppercase text-white leading-[0.85]">
            THE CIRCUIT<br />IS <span className="text-[#ff8c42]">OPEN.</span>
          </h2>
          <p className="text-zinc-400 mt-6 text-lg">
            Free public beta. Create your battler in two minutes.
            Your first callout is already waiting.
          </p>
          <Link
            href="/login"
            className="inline-block mt-10 px-12 py-5 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider text-xl transition-all hover:-translate-y-[2px] hover:shadow-[0_16px_50px_-10px_rgba(255,140,66,0.9)] animate-pulse-orange"
          >
            <Icon name="mic" size={18} className="mr-2 -mt-0.5" />CREATE YOUR BATTLER
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 mt-8">
            NO BARS REQUIRED — WE SIMULATE. YOU STRATEGIZE.
          </p>
        </div>
      </section>
    </div>
  );
}
