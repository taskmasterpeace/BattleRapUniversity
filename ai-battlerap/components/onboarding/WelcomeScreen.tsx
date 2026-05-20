'use client';

type Props = {
  onQuickStart: () => void;
  onCustomBuild: () => void;
};

export default function WelcomeScreen({ onQuickStart, onCustomBuild }: Props) {
  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-16 space-y-6">
          <div className="mb-8">
            <h1 className="text-8xl font-display font-black tracking-tighter mb-4 bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
              ALGORITHM INSTITUTE
            </h1>
            <p className="text-2xl text-zinc-400 uppercase tracking-wider font-bold">
              OF BATTLE RAP
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-black tracking-tight uppercase text-zinc-100">
              WELCOME TO THE CIRCUIT
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Build your battler. Master your craft. Rise through the ranks.
            </p>
          </div>
        </div>

        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8 mb-8">
          <h3 className="text-xl font-black uppercase tracking-tight mb-6 text-center">
            WHAT TO EXPECT
          </h3>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-black uppercase text-sm text-[#ff8c42]">STRATEGIC DEPTH</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Manage attributes, prep for battles, and make strategic decisions that impact your career.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-4xl mb-3">🎭</div>
              <h4 className="font-black uppercase text-sm text-[#ff8c42]">SIMULATION-BASED</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Battles are simulated using your attributes. No typing bars - focus on strategy and prep.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-black uppercase text-sm text-[#ff8c42]">CAREER PROGRESSION</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Earn badges, gain XP, improve attributes, and build your legacy through victories.
              </p>
            </div>
          </div>

          <div className="border-t-2 border-[#3a3d44] pt-6">
            <h4 className="font-black uppercase text-sm text-zinc-400 mb-4">
              CORE MECHANICS
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-zinc-500">
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-[#ff8c42] font-bold">•</span>
                  <span>
                    <strong className="text-zinc-300">Battle Offers:</strong> Accept battles against AI opponents
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#ff8c42] font-bold">•</span>
                  <span>
                    <strong className="text-zinc-300">Prep Phase:</strong> Choose daily focus (writing, performance, rest) leading up to battle
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#ff8c42] font-bold">•</span>
                  <span>
                    <strong className="text-zinc-300">Battle Simulation:</strong> Segment-based simulation with peaks, averages, and momentum
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-[#ff8c42] font-bold">•</span>
                  <span>
                    <strong className="text-zinc-300">Attribute Growth:</strong> Improve through performance and victories
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#ff8c42] font-bold">•</span>
                  <span>
                    <strong className="text-zinc-300">Life Events:</strong> Personal events affect attributes and create storylines
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#ff8c42] font-bold">•</span>
                  <span>
                    <strong className="text-zinc-300">Media Coverage:</strong> AI-generated articles recap your battles
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={onQuickStart}
            className="group bg-[#ff8c42] hover:bg-[#ff9d5c] border-2 border-orange-400 p-8 transition-all duration-300 hover:scale-105"
          >
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-black">
              QUICK START
            </h3>
            <p className="text-sm text-black/80 leading-relaxed mb-4">
              Choose from pre-made templates and jump straight into the circuit. Perfect for first-timers.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-display font-black uppercase tracking-wider text-black/70">
              <span>RECOMMENDED FOR BEGINNERS</span>
              <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          <button
            onClick={onCustomBuild}
            className="group bg-[#2d2f35] hover:bg-zinc-800 border-2 border-[#3a3d44] hover:border-[#ff8c42] p-8 transition-all duration-300 hover:scale-105"
          >
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-3">
              CUSTOM BUILD
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Manually allocate all attributes and create your unique battler from scratch. Full creative control.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-display font-black uppercase tracking-wider text-zinc-500 group-hover:text-[#ff8c42]">
              <span>FOR EXPERIENCED PLAYERS</span>
              <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600 uppercase tracking-wider">
            YOU CAN ONLY CREATE ONE BATTLER PER ACCOUNT
          </p>
        </div>
      </div>
    </div>
  );
}
