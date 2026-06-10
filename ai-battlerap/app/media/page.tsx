'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GamingButton from '@/components/ui/GamingButton';

type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  type: string;
  published_at: string;
  primary_battler?: { id: string; stage_name: string } | null;
  secondary_battler?: { id: string; stage_name: string } | null;
  league?: { id: string; name: string } | null;
};

const TYPE_LABELS: Record<string, string> = {
  battle_recap: 'Battle Recap',
  scandal: 'Scandal',
  career_update: 'Career Update',
  league_update: 'League Update',
  power_ranking: 'Power Rankings',
  grudge_coverage: 'Grudge Coverage',
  culture: 'Culture',
};

const TYPE_COLORS: Record<string, string> = {
  battle_recap: 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/30',
  scandal: 'bg-red-500/20 text-red-400 border-2 border-red-500/30',
  career_update: 'bg-green-500/20 text-green-400 border-2 border-green-500/30',
  league_update: 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/30',
  power_ranking: 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/30',
  grudge_coverage: 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/30',
  culture: 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500/30',
};

export default function MediaPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchArticles();
  }, [selectedType]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') {
        params.set('type', selectedType);
      }
      params.set('limit', '20');

      const response = await fetch(`/api/news?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setArticles(data.articles || []);
      } else {
        console.error('Failed to fetch articles:', data.error);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#18191c]">
      {/* Header */}
      <div className="bg-[#2d2f35] border-b-4 border-[#ff8c42]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link
            href="/dashboard"
            className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm font-display font-black uppercase tracking-wider"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-5xl font-display font-black uppercase tracking-tighter mt-4 text-white">
            Battle Rap Media
          </h1>
          <p className="text-zinc-400 text-sm font-display uppercase tracking-wider mt-2">
            Latest news, recaps, and updates from the battle rap world
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-6 py-3 font-display font-black uppercase tracking-wider transition-all border-2 ${
              selectedType === 'all'
                ? 'bg-[#ff8c42] text-black border-[#ff8c42]'
                : 'bg-transparent text-zinc-300 border-[#3a3d44] hover:border-[#ff8c42]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType('battle_recap')}
            className={`px-6 py-3 font-display font-black uppercase tracking-wider transition-all border-2 ${
              selectedType === 'battle_recap'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-transparent text-zinc-300 border-[#3a3d44] hover:border-blue-500'
            }`}
          >
            Battle Recaps
          </button>
          <button
            onClick={() => setSelectedType('scandal')}
            className={`px-6 py-3 font-display font-black uppercase tracking-wider transition-all border-2 ${
              selectedType === 'scandal'
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-transparent text-zinc-300 border-[#3a3d44] hover:border-red-500'
            }`}
          >
            Scandals
          </button>
          <button
            onClick={() => setSelectedType('career_update')}
            className={`px-6 py-3 font-display font-black uppercase tracking-wider transition-all border-2 ${
              selectedType === 'career_update'
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-transparent text-zinc-300 border-[#3a3d44] hover:border-green-500'
            }`}
          >
            Career Updates
          </button>
          <button
            onClick={() => setSelectedType('league_update')}
            className={`px-6 py-3 font-display font-black uppercase tracking-wider transition-all border-2 ${
              selectedType === 'league_update'
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-transparent text-zinc-300 border-[#3a3d44] hover:border-purple-500'
            }`}
          >
            League Updates
          </button>
          <button
            onClick={() => setSelectedType('power_ranking')}
            className={`px-6 py-3 font-display font-black uppercase tracking-wider transition-all border-2 ${
              selectedType === 'power_ranking'
                ? 'bg-yellow-500 text-black border-yellow-500'
                : 'bg-transparent text-zinc-300 border-[#3a3d44] hover:border-yellow-500'
            }`}
          >
            Power Rankings
          </button>
          <button
            onClick={() => setSelectedType('culture')}
            className={`px-6 py-3 font-display font-black uppercase tracking-wider transition-all border-2 ${
              selectedType === 'culture'
                ? 'bg-cyan-500 text-black border-cyan-500'
                : 'bg-transparent text-zinc-300 border-[#3a3d44] hover:border-cyan-500'
            }`}
          >
            Culture
          </button>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="text-center py-12 text-zinc-400 font-display uppercase tracking-wider">
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8 text-center">
            <p className="text-zinc-400 font-display font-black uppercase tracking-wider text-lg">
              No articles found.
            </p>
            <p className="text-sm text-zinc-500 mt-2 font-display uppercase tracking-wide">
              Articles will appear here after battles are simulated.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/media/${article.slug}`}
                className="block bg-[#2d2f35] border-2 border-[#3a3d44] hover:border-[#ff8c42] transition-all p-6 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Type Badge */}
                    <span
                      className={`inline-block px-3 py-1 text-xs font-display font-black uppercase tracking-wider mb-3 ${
                        TYPE_COLORS[article.type] || 'bg-zinc-800/50 text-zinc-300 border-2 border-[#3a3d44]'
                      }`}
                    >
                      {TYPE_LABELS[article.type] || article.type}
                    </span>

                    {/* Title */}
                    <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-white mb-3 group-hover:text-[#ff8c42] transition-colors">
                      {article.title}
                    </h2>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400 font-display uppercase tracking-wide">
                      {article.league && (
                        <span className="font-black text-[#ff8c42]">{article.league.name}</span>
                      )}
                      {article.primary_battler && (
                        <span>{article.primary_battler.stage_name}</span>
                      )}
                      {article.secondary_battler && (
                        <span>vs {article.secondary_battler.stage_name}</span>
                      )}
                      <span className="text-zinc-500">
                        {new Date(article.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="ml-4 text-zinc-500 group-hover:text-[#ff8c42] transition-colors">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
