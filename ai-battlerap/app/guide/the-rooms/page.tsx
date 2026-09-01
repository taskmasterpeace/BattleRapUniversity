// HOW TO PLAY · 04 — THE ROOMS. Venue law: a venue is a LOCATION. Leagues book
// rooms in their city sized to their draw; room size sets crowd size; the
// hottest nights book the biggest room in the city and go out on national TV.
// Mirrors lib/game/venueBooking.ts + CrowdStrip SIZE_PER_ROW.
import Link from 'next/link';
import SeriesNav from '../SeriesNav';

const ROOMS = [
  { art: '/sprites/venues/home-studio.png', name: 'THE HOME STUDIO', tier: 'VIRTUAL', heads: 4, note: 'Where online-league battles get recorded. No building — the internet IS the room.' },
  { art: '/sprites/venues/basement.png', name: 'THE BASEMENT', tier: 'SMALL', heads: 5, note: 'Where everybody starts. Twenty people, zero forgiveness.' },
  { art: '/sprites/venues/barbershop.png', name: 'THE BARBERSHOP', tier: 'SMALL', heads: 5, note: 'Daytime smoke. The oldheads in the chairs have seen everything.' },
  { art: '/sprites/venues/boxing-gym.png', name: 'THE BOXING GYM', tier: 'SMALL', heads: 5, note: 'Ring in the middle, folding chairs around it. Fitting.' },
  { art: '/sprites/venues/small-bar.png', name: 'THE BAR', tier: 'MEDIUM', heads: 7, note: 'The classic league room — brick wall, spotlights, a crowd that talks back.' },
  { art: '/sprites/venues/grand-theater.png', name: 'THE GRAND THEATER', tier: 'LARGE', heads: 10, note: 'Balconies, curtains, real ticket money. Where careers get certified.' },
];

const CITIES = [
  { city: 'NEW YORK CITY', rooms: 10 },
  { city: 'ATLANTA', rooms: 6 },
  { city: 'LOS ANGELES', rooms: 6 },
  { city: 'CHICAGO', rooms: 5 },
  { city: 'DETROIT', rooms: 5 },
  { city: 'PHILADELPHIA', rooms: 5 },
  { city: 'HOUSTON', rooms: 4 },
  { city: 'OAKLAND', rooms: 4 },
  { city: 'TORONTO', rooms: 4 },
  { city: 'LONDON', rooms: 4 },
];

export const metadata = { title: 'The Rooms — Battle Rap University' };

export default function TheRoomsPage() {
  return (
    <div className="fs min-h-screen bg-[#0F0F12] pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link href="/guide" className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-500 hover:text-[#F5731A]">
          ← Guide index
        </Link>
        <div className="mt-4 mb-2 flex items-end justify-between flex-wrap gap-3">
          <h1 style={{ fontFamily: 'var(--font-poster)', fontSize: 54, lineHeight: 1 }} className="text-zinc-100 uppercase">
            The Rooms
          </h1>
          <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#F5731A]">How to play · 04</span>
        </div>
        <p className="text-[15px] text-zinc-400 max-w-2xl mb-10">
          A venue is a PLACE, not a league logo. Every battle gets booked into a real room in the league&apos;s
          city — and where you battle decides how many people are judging you.
        </p>

        {/* SIZE → CROWD LAW */}
        <div className="mb-12 bg-[#17181C] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] p-6">
          <h2 style={{ fontFamily: 'var(--font-poster)', fontSize: 26 }} className="text-[#F5731A] uppercase mb-1">
            The size law
          </h2>
          <p className="text-[14px] text-zinc-400 max-w-3xl">
            Leagues book rooms they can fill. A startup league runs basements and barbershops; a premier league
            runs theaters. Bigger room, deeper crowd — a virtual room seats a front row of 4, the grand theater
            packs 10 across, three rows deep.
          </p>
        </div>

        {/* THE ROOMS */}
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {ROOMS.map((r) => (
            <div key={r.name} className="bg-[#101114] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] overflow-hidden">
              <img src={r.art} alt={r.name} width={352} height={160} className="w-full h-auto" style={{ imageRendering: 'pixelated' }} />
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 style={{ fontFamily: 'var(--font-poster)', fontSize: 22 }} className="text-zinc-100 uppercase">{r.name}</h3>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#F5731A]">
                    {r.tier} · {r.heads} ACROSS
                  </span>
                </div>
                <p className="text-[13px] text-zinc-400 mt-1.5">{r.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CITY ROSTERS */}
        <div className="mb-12">
          <h2 style={{ fontFamily: 'var(--font-poster)', fontSize: 30 }} className="text-zinc-100 uppercase mb-1">
            The circuit map
          </h2>
          <p className="text-[14px] text-zinc-400 mb-5 max-w-3xl">
            Every city runs its own rooms, basement to arena. New York has the most doors to knock on —
            ten rooms deep, from The Bodega Basement to Kingsbridge Arena.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CITIES.map((c) => (
              <div key={c.city} className="bg-[#17181C] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,.45)] p-4 text-center">
                <p style={{ fontFamily: 'var(--font-poster)', fontSize: 30 }} className="text-[#F5731A]">{c.rooms}</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-400 mt-1">{c.city}</p>
              </div>
            ))}
          </div>
        </div>

        {/* NATIONAL TV */}
        <div className="bg-[#17181C] border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,.45)] p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E23A2E] animate-pulse" />
            <h2 style={{ fontFamily: 'var(--font-poster)', fontSize: 26 }} className="text-zinc-100 uppercase">
              National TV nights
            </h2>
          </div>
          <p className="text-[14px] text-zinc-400 max-w-3xl">
            When a grudge gets WHITE HOT — or a premier league decides it&apos;s a marquee night — the card
            skips the usual booking and takes the biggest room in the city, cameras on. Everything hits harder
            on TV: the crowd, the press, the rep swing. If your offer card says NATIONAL TV, understand what
            you just signed.
          </p>
        </div>

        <SeriesNav current="/guide/the-rooms" />
      </div>
    </div>
  );
}
