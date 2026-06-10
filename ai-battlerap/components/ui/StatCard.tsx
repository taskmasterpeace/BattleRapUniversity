'use client';

type Props = {
  label: string;
  value: string | number;
  icon?: string;
  subtext?: string;
  variant?: 'default' | 'highlight';
};

export default function StatCard({ label, value, icon, subtext, variant = 'default' }: Props) {
  return (
    <div
      className={`relative p-4 border-4 transition-all overflow-hidden group ${
        variant === 'highlight'
          ? 'bg-[#1a1b1e] border-[#ff8c42]'
          : 'bg-[#1a1b1e] border-[#3a3d44] hover:border-[#ff8c42]/60'
      }`}
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Diagonal accent line */}
      <div className={`absolute top-0 right-0 w-1 h-full transition-all ${
        variant === 'highlight' ? 'bg-[#ff8c42]' : 'bg-[#3a3d44] group-hover:bg-[#ff8c42]/60'
      }`} />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 min-w-0">
          {icon && <span className="text-xl sm:text-2xl">{icon}</span>}
          <span className="text-xs text-zinc-500 font-bebas uppercase tracking-wide sm:tracking-widest">{label}</span>
        </div>
        <div className="text-3xl sm:text-4xl font-anton text-[#ff8c42] mb-1 leading-none">{value}</div>
        {subtext && (
          <p className="text-xs text-zinc-400 uppercase tracking-wide font-display font-bold">{subtext}</p>
        )}
      </div>
    </div>
  );
}
