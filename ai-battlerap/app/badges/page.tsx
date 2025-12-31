import Link from 'next/link';
import { BADGE_DESCRIPTIONS } from '@/lib/game/badgeDescriptions';
import { createServerSupabaseClient } from '@/lib/db/server';
import BadgeCard from '@/components/badges/BadgeCard';

type CategoryFilter = 'all' | 'writing' | 'performance' | 'content' | 'delivery' | 'reputation_positive' | 'reputation_negative';

const categoryNames = {
  all: 'All Badges',
  writing: 'Writing',
  performance: 'Performance',
  content: 'Content',
  delivery: 'Delivery',
  reputation_positive: 'Positive Reputation',
  reputation_negative: 'Negative Reputation'
};

const categoryIcons = {
  writing: '✍️',
  performance: '🎭',
  content: '💡',
  delivery: '🎤',
  reputation_positive: '⭐',
  reputation_negative: '⚠️'
};

interface Badge {
  id: string;
  badge_code: string;
  badge_name: string;
  tier: string;
  category: string;
  icon_url: string | null;
  description: string;
  effects: string[];
}

async function getBadges(): Promise<Badge[]> {
  const supabase = await createServerSupabaseClient();

  const { data: badgeCosts, error } = await supabase
    .from('badge_costs')
    .select('id, badge_code, badge_name, tier, category, icon_url')
    .order('badge_name');

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }

  // Merge database data with descriptions
  return (badgeCosts || []).map(badge => {
    const description = BADGE_DESCRIPTIONS[badge.badge_code];
    return {
      ...badge,
      description: description?.description || 'A special achievement in your battle rap career.',
      effects: description?.effects || []
    };
  });
}

export default async function BadgesPage() {
  const allBadges = await getBadges();

  const badgesByCategory = allBadges.reduce((acc, badge) => {
    const category = badge.category || 'content';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#2d2f35]/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/dashboard" className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm uppercase tracking-wider font-bold mb-4 inline-block">
            ← DASHBOARD
          </Link>
          <h1 className="text-4xl font-display font-black tracking-tighter mb-2">BADGE COMPENDIUM</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-wide">
            All {allBadges.length} badges and their effects
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Badges by Category */}
        <div className="space-y-12">
          {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42]">
                  {categoryNames[category as CategoryFilter]} ({categoryBadges.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryBadges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 p-6 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg">
          <h3 className="font-black text-lg uppercase tracking-wide text-[#ff8c42] mb-4">Badge Tiers</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span className="font-bold text-amber-500 uppercase text-sm">Bronze</span>
              </div>
              <p className="text-xs text-zinc-500">Basic badges with modest effects</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-zinc-400 rounded"></div>
                <span className="font-bold text-zinc-300 uppercase text-sm">Silver</span>
              </div>
              <p className="text-xs text-zinc-500">Advanced badges with strong effects</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span className="font-bold text-yellow-400 uppercase text-sm">Gold</span>
              </div>
              <p className="text-xs text-zinc-500">Elite badges defining your archetype</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
