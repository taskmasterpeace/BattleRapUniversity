'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#18191c] relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#18191c] via-[#24262b] to-[#18191c]" />

      {/* Tech grid overlay */}
      <div className="absolute inset-0 opacity-10"
           style={{
             backgroundImage: 'linear-gradient(#ff8c42 1px, transparent 1px), linear-gradient(90deg, #ff8c42 1px, transparent 1px)',
             backgroundSize: '50px 50px'
           }} />

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
           style={{
             backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)',
           }} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">

        {/* Main content container with tech border-2 */}
        <div className="max-w-4xl w-full">

          {/* Tech border-2 wrapper */}
          <div className="relative p-[2px] bg-gradient-to-br from-[#ff8c42] via-[#3a3d44] to-[#ff8c42]">
            <div className="bg-[#24262b] p-12">

              {/* Corner cuts */}
              <div className="absolute top-0 left-0 w-8 h-8 bg-[#18191c]" style={{clipPath: 'polygon(0 0, 100% 0, 0 100%)'}} />
              <div className="absolute top-0 right-0 w-8 h-8 bg-[#18191c]" style={{clipPath: 'polygon(100% 0, 100% 100%, 0 0)'}} />
              <div className="absolute bottom-0 left-0 w-8 h-8 bg-[#18191c]" style={{clipPath: 'polygon(0 0, 0 100%, 100% 100%)'}} />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#18191c]" style={{clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'}} />

              {/* Logo/Title */}
              <div className="text-center mb-10">
                <h1 className="font-bebas text-8xl text-white uppercase tracking-wide mb-4 leading-none drop-shadow-[0_0_20px_rgba(255,140,66,0.4)]">
                  <span className="text-[#ff8c42]">ALGORITHM</span>
                  <br />
                  <span className="text-white">INSTITUTE</span>
                </h1>
                <div className="inline-block px-6 py-2 bg-[#ff8c42] border-4 border-[#ff8c42] relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                    }}
                  />
                  <p className="font-anton text-xl text-black uppercase tracking-wider relative z-10">
                    OF BATTLE RAP
                  </p>
                </div>
              </div>

              {/* Character sprite showcase */}
              <div className="flex justify-center gap-8 mb-8">
                {[
                  '/sprites/characters/image_1764146494580/sprite_848.png',
                  '/sprites/characters/image_1764146517369/sprite_815.png',
                  '/sprites/characters/image_1764146527629/sprite_782.png',
                ].map((src) => (
                  <div key={src} className="relative w-24 h-24 border-2 border-[#3a3d44] bg-[#2d2f35] overflow-hidden">
                    <Image
                      src={src}
                      alt="Battler sprite"
                      fill
                      className="object-contain pixelated"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%232d2f35" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23666" font-size="40"%3E?%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Tagline */}
              <p className="text-center text-white text-3xl mb-10 font-anton uppercase tracking-widest">
                BUILD. BATTLE. DOMINATE.
              </p>

              {/* Feature grid */}
              <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="relative bg-[#1a1b1e] border-4 border-[#3a3d44] p-6 text-center hover:border-[#ff8c42] transition-all overflow-hidden group">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-[#ff8c42]" />
                  <div className="text-4xl mb-3">🎮</div>
                  <p className="text-sm text-white font-bebas uppercase tracking-wide">Simulate<br/>Battles</p>
                </div>
                <div className="relative bg-[#1a1b1e] border-4 border-[#3a3d44] p-6 text-center hover:border-[#ff8c42] transition-all overflow-hidden group">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-[#ff8c42]" />
                  <div className="text-4xl mb-3">🏆</div>
                  <p className="text-sm text-white font-bebas uppercase tracking-wide">Earn 97<br/>Badges</p>
                </div>
                <div className="relative bg-[#1a1b1e] border-4 border-[#3a3d44] p-6 text-center hover:border-[#ff8c42] transition-all overflow-hidden group">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-[#ff8c42]" />
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-sm text-white font-bebas uppercase tracking-wide">Track<br/>Stats</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-block relative px-16 py-5 bg-[#ff8c42] text-black font-anton text-2xl uppercase tracking-wider hover:bg-[#ff9d5c] transition-all hover:shadow-[0_0_30px_rgba(249,115,66,0.6)] transform hover:scale-105 border-4 border-[#ff8c42] overflow-hidden group"
                >
                  <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10">⚡ ENTER THE CIRCUIT</span>
                </Link>
                <p className="text-sm text-zinc-400 mt-6 uppercase tracking-wider font-display font-semibold">
                  Create your battler • Manage prep • Compete in leagues
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom stats ticker */}
        <div className="mt-16 flex gap-12 text-zinc-400 text-base font-mono font-bold">
          <div>ACTIVE BATTLERS: <span className="text-[#ff8c42] text-lg">1,247</span></div>
          <div>BATTLES TODAY: <span className="text-[#ff8c42] text-lg">89</span></div>
          <div>ONLINE NOW: <span className="text-green-500 text-xl">●</span> <span className="text-[#ff8c42] text-lg">342</span></div>
        </div>

      </div>
    </div>
  );
}
