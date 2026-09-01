// Prev/next footer for the HOW TO PLAY series — every guide page carries it so
// a new player can walk the whole curriculum without touching the menu.
import Link from 'next/link';

export const GUIDE_SERIES = [
  { href: '/guide/the-room', num: '01', title: 'READ THE ROOM' },
  { href: '/guide/the-camp', num: '02', title: 'BATTLE PREP' },
  { href: '/guide/battle-night', num: '03', title: 'BATTLE NIGHT' },
  { href: '/guide/the-rooms', num: '04', title: 'THE ROOMS' },
] as const;

export default function SeriesNav({ current }: { current: string }) {
  const i = GUIDE_SERIES.findIndex((g) => g.href === current);
  const prev = i > 0 ? GUIDE_SERIES[i - 1] : null;
  const next = i >= 0 && i < GUIDE_SERIES.length - 1 ? GUIDE_SERIES[i + 1] : null;
  return (
    <div className="fs mt-14 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {prev ? (
        <Link
          href={prev.href}
          className="bg-[#17181C] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,.45)] p-4 hover:border-[#F5731A] transition-colors"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">← Previous</span>
          <p style={{ fontFamily: 'var(--font-poster)', fontSize: 20 }} className="text-zinc-100 uppercase mt-1">
            {prev.num} {prev.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
      <Link
        href="/guide"
        className="bg-[#101114] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,.45)] p-4 text-center hover:border-[#F5731A] transition-colors"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">How to play</span>
        <p style={{ fontFamily: 'var(--font-poster)', fontSize: 20 }} className="text-[#F5731A] uppercase mt-1">
          Guide index
        </p>
      </Link>
      {next ? (
        <Link
          href={next.href}
          className="bg-[#17181C] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,.45)] p-4 text-right hover:border-[#F5731A] transition-colors"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">Next →</span>
          <p style={{ fontFamily: 'var(--font-poster)', fontSize: 20 }} className="text-zinc-100 uppercase mt-1">
            {next.num} {next.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
