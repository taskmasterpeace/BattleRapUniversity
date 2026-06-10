// Shareable matchup result — public, with OG metadata so the headline travels.
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import MatchupResult from '@/components/matchup/MatchupResult';

export const dynamic = 'force-dynamic';

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function loadMatchup(slug: string) {
  const { data } = await admin().from('matchup_sims').select('*').eq('slug', slug).single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = await loadMatchup(slug);
  if (!m) return { title: 'Matchup Not Found | Battle Rap University' };
  const payload = m.rounds_json as { battlerA?: { stageName?: string }; battlerB?: { stageName?: string } };
  const title = `${payload?.battlerA?.stageName ?? 'A'} vs ${payload?.battlerB?.stageName ?? 'B'} — ${m.verdict}`;
  return {
    title: `${title} | Battle Rap University`,
    description: m.headline ?? 'Simulated on the Battle Rap University engine. Run your own dream matchup.',
    openGraph: {
      title,
      description: m.headline ?? 'Who you got? Simulated round by round.',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: m.headline ?? 'Who you got? Simulated round by round.',
    },
  };
}

export default async function MatchupResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = await loadMatchup(slug);
  if (!m) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <MatchupResult
        slug={m.slug}
        verdict={m.verdict}
        headline={m.headline}
        winnerId={m.winner_id}
        payload={m.rounds_json}
        battlerAId={m.battler_a_id}
        battlerBId={m.battler_b_id}
      />
    </div>
  );
}
