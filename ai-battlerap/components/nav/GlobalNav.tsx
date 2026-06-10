'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  FireIcon,
  CalendarDaysIcon,
  TrophyIcon,
  UsersIcon,
  BuildingOffice2Icon,
  StarIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  HeartIcon,
  UserGroupIcon,
  BanknotesIcon,
  BellIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { createClient } from '@/lib/db/client';

// Routes where the global nav should be hidden (pre-auth / first-run flows)
const HIDDEN_ROUTES = ['/login', '/auth', '/onboarding'];

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

// Primary nav appears in the desktop top bar (compressed) AND in the drawer.
const PRIMARY: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/battle/offers', label: 'Battles', icon: FireIcon },
  { href: '/calendar', label: 'Calendar', icon: CalendarDaysIcon },
  { href: '/leagues', label: 'Leagues', icon: TrophyIcon },
];

// Full menu shown in the drawer, grouped by purpose
const DRAWER_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Career',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
      { href: '/battle/offers', label: 'Battles', icon: FireIcon },
      { href: '/calendar', label: 'Calendar', icon: CalendarDaysIcon },
      { href: '/life-events', label: 'Life Events', icon: HeartIcon },
      { href: '/relationships', label: 'Relationships', icon: UserGroupIcon },
      { href: '/crew', label: 'Crew', icon: UsersIcon },
      { href: '/finances', label: 'Finances', icon: BanknotesIcon },
    ],
  },
  {
    title: 'Scene',
    items: [
      { href: '/leagues', label: 'Leagues', icon: TrophyIcon },
      { href: '/cities', label: 'Cities', icon: BuildingOffice2Icon },
      { href: '/battlers', label: 'Roster', icon: UsersIcon },
      { href: '/matchup', label: 'Dream Matchup', icon: FireIcon },
      { href: '/tournaments', label: 'Tournaments', icon: StarIcon },
      { href: '/media', label: 'Media', icon: NewspaperIcon },
      { href: '/badges', label: 'Badges', icon: ShieldCheckIcon },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/notifications', label: 'Notifications', icon: BellIcon },
      { href: '/guide', label: 'Guide', icon: BookOpenIcon },
      { href: '/settings', label: 'Settings', icon: Cog6ToothIcon },
    ],
  },
];

export default function GlobalNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [battlerId, setBattlerId] = useState<string | undefined>(undefined);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Look up the current player's battler ID for the notifications bell.
  // Done client-side so the nav stays a client component without prop drilling.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from('battlers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!cancelled && data?.id) setBattlerId(data.id);
    })();
    return () => { cancelled = true; };
  }, []);

  if (HIDDEN_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return null;
  }
  if (pathname === '/') return null;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <>
      {/* Top bar — sticky on every page */}
      <header className="sticky top-0 z-40 border-b-2 border-[#3a3d44] bg-[#18191c]/95 backdrop-blur supports-[backdrop-filter]:bg-[#18191c]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-anton uppercase tracking-tighter hover:text-[#ff8c42] transition shrink-0"
          >
            <span className="text-[#ff8c42] text-2xl">⚔</span>
            <span className="hidden sm:inline text-lg">Battle Rap U</span>
          </Link>

          {/* Desktop primary links */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {PRIMARY.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider font-bold transition-all duration-200 border-2 hover:-translate-y-[1px] ${
                    active
                      ? 'border-[#ff8c42] text-[#ff8c42] bg-[#ff8c42]/10 shadow-[0_0_12px_-2px_rgba(255,140,66,0.5)]'
                      : 'border-transparent text-zinc-300 hover:text-[#ff8c42] hover:border-[#3a3d44]'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right cluster: notifications + drawer toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <NotificationDropdown battlerId={battlerId} />
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex items-center gap-2 border-2 border-[#3a3d44] hover:border-[#ff8c42] hover:text-[#ff8c42] px-3 py-2 text-xs uppercase tracking-wider font-bold transition"
            >
              <Bars3Icon className="w-5 h-5" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Drawer — full menu */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          {/* Panel */}
          <aside
            role="dialog"
            aria-label="Navigation menu"
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[380px] bg-[#18191c] border-l-2 border-[#3a3d44] shadow-2xl overflow-y-auto animate-slide-in-right"
          >
            {/* Drawer header */}
            <div className="sticky top-0 bg-[#18191c] border-b-2 border-[#3a3d44] px-6 py-4 flex items-center justify-between">
              <span className="font-anton uppercase tracking-tighter text-lg">
                <span className="text-[#ff8c42]">⚔</span> Menu
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="border-2 border-[#3a3d44] hover:border-[#ff8c42] hover:text-[#ff8c42] p-2 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Grouped sections */}
            <div className="px-4 py-4 space-y-6">
              {DRAWER_GROUPS.map(group => (
                <div key={group.title}>
                  <div className="px-2 pb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                    {group.title}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map(({ href, label, icon: Icon }, i) => {
                      const active = isActive(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          style={{ animationDelay: `${i * 30}ms` }}
                          className={`animate-stagger-in flex flex-col items-center gap-2 px-3 py-4 border-2 text-xs uppercase tracking-wider font-bold transition-all duration-200 group hover:-translate-y-[2px] ${
                            active
                              ? 'border-[#ff8c42] text-[#ff8c42] bg-[#ff8c42]/10 shadow-[0_0_18px_-4px_rgba(255,140,66,0.6)]'
                              : 'border-[#3a3d44] text-zinc-300 hover:border-[#ff8c42] hover:text-[#ff8c42] hover:bg-[#2d2f35] hover:shadow-[0_0_18px_-6px_rgba(255,140,66,0.5)]'
                          }`}
                        >
                          <Icon className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                          <span className="text-center leading-tight">{label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Sign out */}
              <div className="pt-4 border-t-2 border-[#3a3d44]">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-500/50 hover:border-red-500 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-3 text-xs uppercase tracking-wider font-bold transition"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
