import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { createServerSupabaseClient } from '@/lib/db/server';
import { getEventArt, QUIET_ART } from '@/lib/content/eventArt';
import { categoryOf, severityOf } from '@/lib/content/eventCategories';

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
            <img
              src={QUIET_ART}
              alt=""
              className="w-32 h-32 mx-auto mb-4 opacity-80 [image-rendering:pixelated]"
            />
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
            {pending.map((event: any) => {
              const cat = categoryOf(event.template?.category);
              const sev = severityOf(event.template?.severity);
              const art = getEventArt(
                event.template?.code,
                event.template?.category,
                event.template?.severity
              );
              return (
                // The row IS the button — no separate CTA (LIFE_EVENTS_UI §2)
                <Link
                  key={event.id}
                  href={`/life-events/${event.id}`}
                  className="relative flex items-stretch gap-3 md:gap-4 bg-[#2d2f35] border-2 border-[#3a3d44] hover:border-[#ff8c42]/60 hover:translate-x-[2px] p-3 md:p-4 pl-4 md:pl-5 transition min-h-[64px] group"
                >
                  <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${cat.edge}`} />
                  {art?.thumb && (
                    <img
                      src={art.thumb}
                      alt=""
                      className="w-16 h-16 md:w-20 md:h-20 flex-none border-2 border-[#3a3d44] object-cover [image-rendering:pixelated]"
                    />
                  )}
                  <span className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] mb-0.5">
                      <b className={`${cat.text} font-display font-black tracking-wider`}>{cat.label}</b>
                      <span className="text-zinc-600"> · </span>
                      <b className={`${sev.text} font-display font-black tracking-wider`}>{sev.label}</b>
                    </span>
                    <span className="font-display font-black text-base md:text-lg uppercase tracking-wide text-zinc-100 leading-tight">
                      {event.template?.title ?? 'LIFE EVENT'}
                    </span>
                    <span className="text-xs md:text-sm text-zinc-500 line-clamp-2 mt-0.5">
                      {event.template?.description}
                    </span>
                  </span>
                  <span className="flex-none self-center flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono text-zinc-600 uppercase">
                      {new Date(event.triggered_at).toLocaleDateString()}
                    </span>
                    <span className={`text-lg ${cat.text} group-hover:translate-x-0.5 transition`}>→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
