'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type LifeEvent = {
  id: string;
  battler_id: string;
  template_code: string;
  battle_id: string | null;
  status: string;
  triggered_at: string;
  details_json: any;
  battle_context?: { opponent?: string; league?: string } | null;
  template: {
    id: string;
    code: string;
    title: string;
    description: string;
    choice_a_text: string;
    choice_b_text: string | null;
  };
};

type Props = {
  initialEvents?: LifeEvent[];
};

export default function PendingLifeEventsWidget({ initialEvents = [] }: Props) {
  const [events, setEvents] = useState<LifeEvent[]>(initialEvents);
  const [loading, setLoading] = useState(!initialEvents.length);

  useEffect(() => {
    if (!initialEvents.length) {
      fetchEvents();
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/life-events');
      const data = await response.json();
      if (response.ok) {
        setEvents(data.events || []);
      }
    } catch {
      // Benign: navigation can abort this fetch mid-flight; the widget simply
      // doesn't render when events can't load.
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-zinc-800 rounded"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return null; // Don't show widget if no events
  }

  const isUrgent = events.length > 2;

  return (
    <div className={`border-2 p-6 mb-8 ${
      isUrgent
        ? 'bg-[#ff8c42]/10 border-[#ff8c42]/50'
        : 'bg-yellow-500/10 border-yellow-500/30'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <h3 className={`text-lg font-display font-black uppercase tracking-wider ${
            isUrgent ? 'text-[#ff8c42]' : 'text-yellow-500'
          }`}>
            LIFE EVENTS
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-black ${
            isUrgent
              ? 'bg-[#ff8c42] text-black'
              : 'bg-yellow-500 text-black'
          }`}>
            {events.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/life-events/history"
            className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-100 transition uppercase tracking-wider"
          >
            View History
          </Link>
          {isUrgent && (
            <span className="text-xs bg-[#ff8c42] text-black px-3 py-1 rounded font-display font-black uppercase tracking-wider">
              REQUIRES ATTENTION
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-zinc-400 mb-4">
        {events.length === 1
          ? 'A life event needs your decision.'
          : `${events.length} life events need your decision.`
        }
      </p>

      {/* Event Preview Cards */}
      <div className="space-y-3 mb-4">
        {events.slice(0, 3).map((event) => (
          <div
            key={event.id}
            className="bg-[#18191c]/50 border-2 border-[#3a3d44] p-4 rounded"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-zinc-100 text-sm">
                {event.template.title}
              </h4>
              <span className="text-xs text-zinc-600 uppercase tracking-wide">
                {new Date(event.triggered_at).toLocaleDateString()}
              </span>
            </div>
            {event.battle_context?.opponent && (
              <p className="font-mono text-[12px] uppercase tracking-wide text-[#ff8c42] mb-1">
                vs {event.battle_context.opponent}
                {event.battle_context.league ? (
                  <span className="text-zinc-500"> · {event.battle_context.league}</span>
                ) : null}
              </p>
            )}
            <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
              {event.template.description}
            </p>
            <Link
              href={`/life-events/${event.id}`}
              className="inline-block px-4 py-2 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black text-xs font-display font-black uppercase tracking-wider transition"
            >
              MAKE DECISION
            </Link>
          </div>
        ))}
      </div>

      {/* View All Button if more than 3 */}
      {events.length > 3 && (
        <div className="text-center pt-2 border-t-2 border-[#3a3d44]">
          <p className="text-xs text-zinc-500 mb-2">
            +{events.length - 3} more event{events.length - 3 !== 1 ? 's' : ''}
          </p>
          <Link
            href="/life-events"
            className="inline-block px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-display font-black uppercase tracking-wider transition"
          >
            VIEW ALL EVENTS
          </Link>
        </div>
      )}
    </div>
  );
}
