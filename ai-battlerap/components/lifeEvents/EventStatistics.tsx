'use client';

type LifeEvent = {
  id: string;
  template_code: string;
  status: string;
  triggered_at: string;
  resolved_at?: string;
  template: {
    category?: string;
    title: string;
    choice_a_effects: any;
    choice_b_effects: any;
  };
  chosen_option?: 'a' | 'b';
};

type Props = {
  events: LifeEvent[];
};

const EVENT_CATEGORIES = {
  career: { icon: '💼', color: 'text-[#ff8c42]', bg: 'bg-[#ff8c42]/10', border: 'border-[#ff8c42]/30' },
  personal: { icon: '🏠', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  scandal: { icon: '📰', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  financial: { icon: '💰', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  relationship: { icon: '❤️', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
};

export default function EventStatistics({ events }: Props) {
  const resolvedEvents = events.filter(e => e.status === 'resolved');
  const pendingEvents = events.filter(e => e.status === 'pending');

  // Category breakdown
  const categoryCounts = Object.keys(EVENT_CATEGORIES).reduce((acc, cat) => {
    acc[cat] = resolvedEvents.filter(e => (e.template.category || 'career') === cat).length;
    return acc;
  }, {} as Record<string, number>);

  // Most common events
  const eventCounts = resolvedEvents.reduce((acc, event) => {
    const title = event.template.title;
    acc[title] = (acc[title] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommon = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate impact
  const calculateTotalImpact = (event: LifeEvent): number => {
    const effects = event.chosen_option === 'a'
      ? event.template.choice_a_effects
      : event.template.choice_b_effects;

    if (!effects) return 0;

    return Object.values(effects).reduce((sum: number, val: any) => {
      if (typeof val === 'number') return sum + val;
      return sum;
    }, 0);
  };

  const impacts = resolvedEvents.map(e => ({
    event: e,
    impact: calculateTotalImpact(e)
  }));

  const biggestPositive = impacts
    .filter(i => i.impact > 0)
    .sort((a, b) => b.impact - a.impact)[0];

  const biggestNegative = impacts
    .filter(i => i.impact < 0)
    .sort((a, b) => a.impact - b.impact)[0];

  // Event frequency over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentEvents = resolvedEvents.filter(e =>
    new Date(e.triggered_at) >= thirtyDaysAgo
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Total Events</p>
          <p className="text-3xl font-black text-zinc-100">{events.length}</p>
        </div>
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Resolved</p>
          <p className="text-3xl font-black text-green-500">{resolvedEvents.length}</p>
        </div>
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Pending</p>
          <p className="text-3xl font-black text-[#ff8c42]">{pendingEvents.length}</p>
        </div>
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Last 30 Days</p>
          <p className="text-3xl font-black text-zinc-300">{recentEvents.length}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4 font-bold">
          Events by Category
        </h3>
        <div className="space-y-3">
          {Object.entries(categoryCounts).map(([category, count]) => {
            const config = EVENT_CATEGORIES[category as keyof typeof EVENT_CATEGORIES];
            const percentage = resolvedEvents.length > 0
              ? Math.round((count / resolvedEvents.length) * 100)
              : 0;

            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <span className="text-sm font-bold text-zinc-300 uppercase tracking-wide">
                      {category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-500">{count} events</span>
                    <span className={`text-sm font-bold ${config.color}`}>
                      {percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${config.bg.replace('/10', '/50')}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Common Events */}
      {mostCommon.length > 0 && (
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
          <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4 font-bold">
            Most Common Events
          </h3>
          <div className="space-y-3">
            {mostCommon.map(([title, count], index) => (
              <div key={title} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600 font-black w-6">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-zinc-300">{title}</span>
                </div>
                <span className="text-sm font-bold text-[#ff8c42]">
                  {count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Biggest Impact Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Positive */}
        {biggestPositive && (
          <div className="bg-green-500/10 border-2 border-green-500/30 p-6">
            <h3 className="text-xs uppercase tracking-wider text-green-500 mb-3 font-bold">
              Biggest Positive Impact
            </h3>
            <p className="text-sm font-bold text-zinc-100 mb-2">
              {biggestPositive.event.template.title}
            </p>
            <p className="text-2xl font-black text-green-500">
              +{biggestPositive.impact} Total
            </p>
          </div>
        )}

        {/* Most Negative */}
        {biggestNegative && (
          <div className="bg-red-500/10 border-2 border-red-500/30 p-6">
            <h3 className="text-xs uppercase tracking-wider text-red-500 mb-3 font-bold">
              Biggest Negative Impact
            </h3>
            <p className="text-sm font-bold text-zinc-100 mb-2">
              {biggestNegative.event.template.title}
            </p>
            <p className="text-2xl font-black text-red-500">
              {biggestNegative.impact} Total
            </p>
          </div>
        )}
      </div>

      {/* Timeline */}
      {recentEvents.length > 0 && (
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
          <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4 font-bold">
            Event Frequency (Last 30 Days)
          </h3>
          <div className="flex items-end gap-2 h-32">
            {Array.from({ length: 7 }).map((_, weekIndex) => {
              const weekStart = new Date();
              weekStart.setDate(weekStart.getDate() - (6 - weekIndex) * 7);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 7);

              const weekEvents = recentEvents.filter(e => {
                const date = new Date(e.triggered_at);
                return date >= weekStart && date < weekEnd;
              });

              const height = recentEvents.length > 0
                ? Math.max((weekEvents.length / Math.max(...Array.from({ length: 7 }).map((_, i) => {
                    const start = new Date();
                    start.setDate(start.getDate() - (6 - i) * 7);
                    const end = new Date(start);
                    end.setDate(end.getDate() + 7);
                    return recentEvents.filter(e => {
                      const date = new Date(e.triggered_at);
                      return date >= start && date < end;
                    }).length;
                  }))) * 100, 10)
                : 10;

              return (
                <div key={weekIndex} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end justify-center h-24">
                    <div
                      className="w-full bg-[#ff8c42] transition-all hover:bg-orange-400"
                      style={{ height: `${height}%` }}
                      title={`${weekEvents.length} events`}
                    />
                  </div>
                  <p className="text-xs text-zinc-600 mt-2">
                    {weekIndex === 6 ? 'Now' : `-${(6 - weekIndex) * 7}d`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
