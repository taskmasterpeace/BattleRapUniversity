'use client';

// THE stat plate — the Flyer System poster plate (same family as THE BAG on
// /finances): black border, colored top edge, hard offset shadow, Anton
// number. One card style for stats app-wide.
type Props = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  subtext?: string;
  variant?: 'default' | 'highlight';
};

export default function StatCard({ label, value, icon, subtext, variant = 'default' }: Props) {
  const hot = variant === 'highlight';
  return (
    <div
      className="fs relative p-4 border-2 border-black bg-[#101114] shadow-[4px_4px_0_rgba(0,0,0,.45)] transition-all overflow-hidden group hover:-translate-y-[1px]"
      style={{ borderTop: `3px solid ${hot ? '#E7B23C' : '#3E404A'}` }}
    >
      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 min-w-0">
          {icon && <span className={`${hot ? 'text-[#E7B23C]' : 'text-[#F5731A]'} flex items-center`}>{icon}</span>}
          <span className={`font-mono text-[9px] uppercase tracking-[0.25em] ${hot ? 'text-[#E7B23C]' : 'text-zinc-500'}`}>
            {label}
          </span>
        </div>
        <div
          className="mb-1 leading-none"
          style={{
            fontFamily: 'var(--font-poster)',
            fontSize: 'clamp(26px,3vw,36px)',
            color: hot ? '#E7B23C' : '#F4F4F6',
            textShadow: '2px 2px 0 #000',
          }}
        >
          {value}
        </div>
        {subtext && (
          <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-[0.2em]">{subtext}</p>
        )}
      </div>
    </div>
  );
}
