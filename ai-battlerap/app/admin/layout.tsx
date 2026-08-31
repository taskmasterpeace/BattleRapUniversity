// Admin shell — sub-navigation for the content tools.
// NOTE: auth lives in each page (requireAdmin), not here; layouts are not a
// security boundary in the App Router.
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="border-b-2 border-[#3a3d44] bg-[#101114]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-6">
          <Link
            href="/admin"
            className="font-display font-black uppercase tracking-tighter text-lg text-zinc-100 hover:text-[#ff8c42] transition-colors"
          >
            ADMIN <span className="text-[#ff8c42]">TOOLS</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-4 font-mono text-xs uppercase tracking-widest">
            <Link href="/admin" className="text-zinc-400 hover:text-[#ff8c42] transition-colors">
              Overview
            </Link>
            <Link
              href="/admin/real-battlers"
              className="text-zinc-400 hover:text-[#ff8c42] transition-colors"
            >
              Real Battlers
            </Link>
            <Link
              href="/admin/roster"
              className="text-zinc-400 hover:text-[#ff8c42] transition-colors"
            >
              AI Roster
            </Link>
            <Link href="/admin/roles" className="text-zinc-400 hover:text-[#ff8c42] transition-colors">
              Roles
            </Link>
          </nav>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-zinc-600 border border-[#3a3d44] px-2 py-1">
            STAFF ONLY
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
