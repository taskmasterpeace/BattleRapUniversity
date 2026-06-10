'use client';

import { useState } from 'react';
import Link from 'next/link';

type LifeEvent = {
  id: string;
  battler_id: string;
  template_code: string;
  battle_id: string | null;
  status: string;
  chosen_option: 'a' | 'b' | null;
  triggered_at: string;
  resolved_at: string;
  details_json: any;
  template: {
    id: string;
    code: string;
    title: string;
    description: string;
    category?: string;
    severity?: string;
    choice_a_text: string;
    choice_a_effects: any;
    choice_b_text: string | null;
    choice_b_effects: any | null;
  };
  battle?: {
    id: string;
    scheduled_at: string;
    ai_battler?: {
      stage_name: string;
    };
  } | null;
};

type Props = {
  events: LifeEvent[];
  battler: any;
};

const EVENT_CATEGORIES = {
  career: { icon: '💼', color: 'text-[#ff8c42]', bg: 'bg-[#ff8c42]/10', border: 'border-[#ff8c42]/30' },
  personal: { icon: '🏠', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  scandal: { icon: '📰', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  financial: { icon: '💰', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  relationship: { icon: '❤️', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
};

export default function LifeEventHistoryClient({ events, battler }: Props) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      // Category filter
      if (filterCategory !== 'all') {
        const category = event.template.category || 'career';
        if (category !== filterCategory) return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          event.template.title.toLowerCase().includes(searchLower) ||
          event.template.description.toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.resolved_at).getTime();
      const dateB = new Date(b.resolved_at).getTime();
      return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
    });

  const formatEffects = (effects: any): string[] => {
    if (!effects) return [];

    const formattedEffects: string[] = [];

    Object.entries(effects).forEach(([key, value]: [string, any]) => {
      if (typeof value !== 'number' || value === 0) return;

      const formattedKey = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      if (key === 'public_knowledge') {
        formattedEffects.push(`${value > 0 ? '+' : ''}${value}% ${formattedKey}`);
      } else {
        formattedEffects.push(`${value > 0 ? '+' : ''}${value} ${formattedKey}`);
      }
    });

    return formattedEffects;
  };

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#2d2f35]/50">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-xl font-bold tracking-tight hover:text-[#ff8c42] transition">
                BATTLE RAP UNIVERSITY
              </Link>
              <span className="text-zinc-700">|</span>
              <span className="text-sm text-zinc-500 uppercase tracking-wider">Life Event History</span>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition uppercase tracking-wider"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Stats Summary */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Total Events</p>
            <p className="text-4xl font-black text-zinc-100">{events.length}</p>
          </div>
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Most Recent</p>
            <p className="text-lg font-bold text-zinc-300">
              {events.length > 0
                ? new Date(events[0].resolved_at).toLocaleDateString()
                : 'None'}
            </p>
          </div>
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Categories</p>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(EVENT_CATEGORIES).map(cat => {
                const count = events.filter(e => (e.template.category || 'career') === cat).length;
                if (count === 0) return null;
                return (
                  <span key={cat} className="text-xs text-zinc-400">
                    {EVENT_CATEGORIES[cat as keyof typeof EVENT_CATEGORIES].icon} {count}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Category filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider transition ${
                filterCategory === 'all'
                  ? 'bg-[#ff8c42] text-black'
                  : 'bg-[#2d2f35] text-zinc-400 hover:text-zinc-100'
              }`}
            >
              All
            </button>
            {Object.entries(EVENT_CATEGORIES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider transition flex items-center gap-2 ${
                  filterCategory === key
                    ? `${config.bg} ${config.color} border-2 ${config.border}`
                    : 'bg-[#2d2f35] text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <span>{config.icon}</span>
                <span>{key}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider transition ${
                sortBy === 'recent'
                  ? 'bg-[#ff8c42] text-black'
                  : 'bg-[#2d2f35] text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('oldest')}
              className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider transition ${
                sortBy === 'oldest'
                  ? 'bg-[#ff8c42] text-black'
                  : 'bg-[#2d2f35] text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Oldest
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#2d2f35] border-2 border-[#3a3d44] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-[#ff8c42] focus:outline-none transition"
          />
        </div>

        {/* Event List */}
        {filteredEvents.length === 0 ? (
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-12 text-center">
            <p className="text-sm text-zinc-500">No events found matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map(event => {
              const category = event.template.category || 'career';
              const categoryConfig = EVENT_CATEGORIES[category as keyof typeof EVENT_CATEGORIES] || EVENT_CATEGORIES.career;
              const chosenEffects = event.chosen_option === 'a'
                ? event.template.choice_a_effects
                : event.template.choice_b_effects;
              const chosenText = event.chosen_option === 'a'
                ? event.template.choice_a_text
                : event.template.choice_b_text;
              const isExpanded = expandedEvent === event.id;

              return (
                <div
                  key={event.id}
                  className="bg-[#2d2f35] border-2 border-[#3a3d44] overflow-hidden transition-all hover:border-[#3a3d44]"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{categoryConfig.icon}</span>
                          <div>
                            <h3 className="text-lg font-black text-zinc-100">
                              {event.template.title}
                            </h3>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">
                              {new Date(event.resolved_at).toLocaleDateString()} • {category}
                            </p>
                          </div>
                        </div>
                        {event.battle && (
                          <p className="text-xs text-zinc-600">
                            Triggered after battle vs {event.battle.ai_battler?.stage_name}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-display font-black uppercase tracking-wider transition"
                      >
                        {isExpanded ? 'Hide' : 'Details'}
                      </button>
                    </div>

                    {/* Choice made */}
                    <div className="mb-4 bg-[#18191c] border-2 border-[#3a3d44] p-4">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Choice Made</p>
                      <p className="text-sm text-zinc-300">{chosenText}</p>
                    </div>

                    {/* Effects applied */}
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2 font-bold">
                        Effects Applied
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formatEffects(chosenEffects).map((effect, index) => {
                          const isPositive = effect.startsWith('+');
                          const isNegative = effect.startsWith('-');
                          return (
                            <span
                              key={index}
                              className={`px-3 py-1 text-xs font-bold ${
                                isPositive
                                  ? 'bg-green-500/10 text-green-500 border-2 border-green-500/30'
                                  : isNegative
                                  ? 'bg-red-500/10 text-red-500 border-2 border-red-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {effect}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t-2 border-[#3a3d44] space-y-4">
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Description</p>
                          <p className="text-sm text-zinc-400">{event.template.description}</p>
                        </div>

                        {event.details_json && Object.keys(event.details_json).length > 0 && (
                          <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Event Context</p>
                            <div className="bg-[#18191c] border-2 border-[#3a3d44] p-4 grid grid-cols-2 gap-4">
                              {event.details_json.battle_result && (
                                <div>
                                  <p className="text-xs text-zinc-600 uppercase">Battle Result</p>
                                  <p className="text-sm font-bold text-zinc-300">{event.details_json.battle_result}</p>
                                </div>
                              )}
                              {event.details_json.outcome && (
                                <div>
                                  <p className="text-xs text-zinc-600 uppercase">Outcome</p>
                                  <p className={`text-sm font-bold ${
                                    event.details_json.outcome === 'win' ? 'text-green-500' : 'text-red-500'
                                  }`}>
                                    {event.details_json.outcome.toUpperCase()}
                                  </p>
                                </div>
                              )}
                              {event.details_json.win_streak > 0 && (
                                <div>
                                  <p className="text-xs text-zinc-600 uppercase">Win Streak</p>
                                  <p className="text-sm font-bold text-green-500">{event.details_json.win_streak}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
