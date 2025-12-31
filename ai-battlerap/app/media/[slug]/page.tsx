'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import GamingButton from '@/components/ui/GamingButton';

type Article = {
  id: string;
  slug: string;
  title: string;
  type: string;
  body_markdown: string;
  published_at: string;
  meta_json: any;
  primary_battler?: { id: string; stage_name: string; tier: string } | null;
  secondary_battler?: { id: string; stage_name: string; tier: string } | null;
  league?: { id: string; name: string } | null;
  battle?: { id: string; scheduled_at: string; winner_battler_id: string } | null;
};

const TYPE_LABELS: Record<string, string> = {
  battle_recap: 'Battle Recap',
  scandal: 'Scandal',
  career_update: 'Career Update',
  league_update: 'League Update',
  power_ranking: 'Power Rankings',
};

const TYPE_COLORS: Record<string, string> = {
  battle_recap: 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/30',
  scandal: 'bg-red-500/20 text-red-400 border-2 border-red-500/30',
  career_update: 'bg-green-500/20 text-green-400 border-2 border-green-500/30',
  league_update: 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/30',
  power_ranking: 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/30',
};

export default function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/news/${slug}`);
      const data = await response.json();

      if (response.ok) {
        setArticle(data.article);
      } else {
        console.error('Failed to fetch article:', data.error);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-zinc-400 font-display uppercase tracking-wider">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-red-400 font-display font-black uppercase tracking-wider">Article not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18191c]">
      {/* Header */}
      <div className="bg-[#2d2f35] border-b-2-4 border-[#ff8c42]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/media"
            className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm font-display font-black uppercase tracking-wider"
          >
            ← Back to Media
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <article className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8">
          {/* Type Badge */}
          <span
            className={`inline-block px-4 py-2 text-xs font-display font-black uppercase tracking-wider mb-6 ${
              TYPE_COLORS[article.type] || 'bg-zinc-800/50 text-zinc-300 border-2 border-[#3a3d44]'
            }`}
          >
            {TYPE_LABELS[article.type] || article.type}
          </span>

          {/* Title */}
          <h1 className="text-5xl font-display font-black uppercase tracking-tighter text-white mb-6">
            {article.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400 mb-8 pb-6 border-b-2-2 border-[#3a3d44] font-display uppercase tracking-wide">
            {article.league && (
              <div>
                <span className="font-black text-[#ff8c42]">League: </span>
                {article.league.name}
              </div>
            )}
            {article.primary_battler && (
              <div>
                <span className="font-black text-[#ff8c42]">Battler: </span>
                {article.primary_battler.stage_name}
                <span className="text-zinc-500 ml-1">
                  ({article.primary_battler.tier} tier)
                </span>
              </div>
            )}
            {article.secondary_battler && (
              <div>
                <span className="font-black text-[#ff8c42]">vs: </span>
                {article.secondary_battler.stage_name}
                <span className="text-zinc-500 ml-1">
                  ({article.secondary_battler.tier} tier)
                </span>
              </div>
            )}
            <div>
              <span className="font-black text-[#ff8c42]">Published: </span>
              {new Date(article.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          {/* Markdown Body */}
          <div className="prose prose-lg prose-invert max-w-none">
            <style jsx global>{`
              .prose h1,
              .prose h2,
              .prose h3 {
                font-family: var(--font-display);
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: -0.025em;
                color: #ff8c42;
              }
              .prose p {
                color: #e4e4e7;
                line-height: 1.8;
              }
              .prose strong {
                color: #ff8c42;
                font-weight: 900;
              }
            `}</style>
            <ReactMarkdown>{article.body_markdown}</ReactMarkdown>
          </div>

          {/* Battle Link */}
          {article.battle && (
            <div className="mt-8 pt-6 border-t-2-2 border-[#3a3d44]">
              <GamingButton href={`/battle/${article.battle.id}`} variant="primary" size="lg">
                View Battle Breakdown →
              </GamingButton>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
