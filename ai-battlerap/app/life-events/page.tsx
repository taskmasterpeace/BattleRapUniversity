import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { createServerSupabaseClient } from '@/lib/db/server';

/**
 * /life-events — pending life events index.
 *
 * This page was MISSING: GlobalNav and PendingLifeEventsWidget both link to
 * /life-events, but only /life-events/history and /life-events/[id] existed,
 * so every nav hover (dev prefetch) or click logged a 404. This is the page
 * that fixes that.
 */
export default async function LifeEventsPage() {
  const { user, battler } = await getPlayerBattler();

  if (!user) redirect('/login');
  if (!battler) redirect('/onboarding');

  const supabase = await createServerSupabaseClient();

  const { data: events } = await supabase
    .from('battler_life_events')
    .select(`
      *,
      template:life_event_templates!battler_life_events_template_code_fkey(*)
    `)
    .eq('battler_id', battler.id)
    .eq('status', 'pending')
    .order('triggered_at', { ascending: false });

  const pending = events || [];

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#2d2f35]">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <Link
            href="/dashboard"
            className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm font-display font-black uppercase tracking-wider min-h-[44px] inline-flex items-center transition"
          >
            ← DASHBOARD
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-3">
            <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter">
              LIFE EVENTS
            </h1>
            <Link
              href="/life-events/history"
              className="text-xs text-zinc-400 hover:text-zinc-100 font-display font-black uppercase tracking-wider transition"
            >
              VIEW HISTORY →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-12">
        {pending.length === 0 ? (
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-10 md:p-16 text-center">
            <div className="text-5xl mb-4">🧘</div>
            <h2 className="text-xl font-display font-black uppercase tracking-wider text-zinc-300 mb-2">
              ALL QUIET OUTSIDE THE BOOTH
            </h2>
            <p className="text-sm text-zinc-500 font-display font-bold uppercase tracking-wide mb-6">
              No pending life events — battles, win streaks, and chokes can trigger new ones.
            </p>
            <Link
              href="/life-events/history"
              className="inline-block px-6 py-3 bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42]/50 text-zinc-300 text-xs font-display font-black uppercase tracking-wider transition"
            >
              SEE RESOLVED EVENTS
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400 font-display font-black uppercase tracking-wider">
              {pending.length} EVENT{pending.length === 1 ? '' : 'S'} NEED
              {pending.length === 1 ? 'S' : ''} YOUR DECISION
            </p>
            {pending.map((event: any) => (
              <div
                key={event.id}
                className="bg-[#2d2f35] border-2 border-[#3a3d44] hover:border-[#ff8c42]/50 p-6 transition"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-display font-black text-lg uppercase tracking-wide text-zinc-100">
                    {event.template?.title ?? 'LIFE EVENT'}
                  </h3>
                  <span className="text-xs text-zinc-600 uppercase tracking-wide flex-shrink-0">
                    {new Date(event.triggered_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mb-4">
                  {event.template?.description}
                </p>
                <Link
                  href={`/life-events/${event.id}`}
                  className="inline-block px-5 py-2.5 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black text-xs font-display font-black uppercase tracking-wider transition"
                >
                  MAKE DECISION →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
