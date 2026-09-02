'use client';

/**
 * The Booth — episode page. Open a podcast about a battle: big cover, the full
 * segment rundown (chapters), who it's about (drill-downs), tags. This is the
 * "listen to a podcast about the battle, rich enough to make sense" surface.
 * Audio drops into the placeholder bar later.
 */

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { boothLockup, boothMark, podcastEpisodeCover } from '@/lib/game/media/brandAssets';
import type { MediaItem, PodcastEpisode } from '@/lib/game/media/mediaGenerator';

function Svg({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data, isLoading } = useQuery<{ items: MediaItem[] }>({
    queryKey: ['booth-feed'],
    queryFn: async () => {
      const res = await fetch('/api/media/feed');
      if (!res.ok) throw new Error('feed');
      return res.json();
    },
    retry: false,
    staleTime: 60_000,
  });

  const ep = (data?.items ?? []).find(
    (i): i is PodcastEpisode => i.kind === 'podcast_episode' && i.id === `pod-${id}`
  );

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-[#e8e6e1]">
      <div className="sticky top-0 z-20 bg-[#141418] border-b-2 border-black shadow-[0_3px_0_rgba(0,0,0,.4)]">
        <div className="max-w-[1000px] mx-auto px-5 py-3 flex items-center gap-5">
          <Link href="/booth"><Svg html={boothLockup(28)} /></Link>
          <Link href="/booth" className="ml-auto font-mono text-[12px] uppercase tracking-widest text-zinc-400 hover:text-[#E7B23C]">
            ← all shows
          </Link>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-5 py-8">
        {isLoading && <p className="text-[#5b5c63] uppercase tracking-wide text-sm py-10">Tuning in…</p>}
        {!isLoading && !ep && (
          <div className="py-16 text-center">
            <p className="text-[#5b5c63] uppercase tracking-wide text-sm">That episode isn’t in the feed anymore.</p>
            <Link href="/booth" className="inline-block mt-4 font-mono text-[12px] uppercase tracking-widest text-[#E7B23C] border border-[#E7B23C]/50 px-4 py-2">
              Back to The Booth
            </Link>
          </div>
        )}
        {ep && <Episode ep={ep} />}
      </div>
    </div>
  );
}

function Episode({ ep }: { ep: PodcastEpisode }) {
  const cover = podcastEpisodeCover(
    {
      show: ep.show,
      winner: ep.winnerName ?? ep.subjects.find((s) => s.role === 'winner')?.name ?? '',
      loser: ep.loserName ?? ep.subjects.find((s) => s.role === 'loser')?.name ?? '',
      story: ep.story ?? 'standard',
      topic: ep.segments[0]?.topic ?? '',
    },
    360
  );
  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-8">
      {/* Cover + play */}
      <div>
        <span
          className="block aspect-square border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,.5)] overflow-hidden [&_svg]:block [&_svg]:w-full [&_svg]:h-full"
          dangerouslySetInnerHTML={{ __html: cover }}
        />
        <div className="mt-4 border-2 border-[#E7B23C]/40 bg-[#E7B23C]/5 p-3 flex items-center gap-3">
          <span className="font-display font-black text-[#E7B23C] text-2xl">▶</span>
          <div>
            <div className="font-mono text-[12px] uppercase tracking-widest text-[#E7B23C]">Placeholder</div>
            <div className="font-mono text-[11px] uppercase tracking-wide text-zinc-500">real audio drops in here · {ep.durationLabel}</div>
          </div>
        </div>
        {/* About this episode */}
        <div className="mt-6">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 mb-2">About this episode</h3>
          <div className="flex flex-wrap gap-2">
            {ep.subjects.map((s) =>
              s.battlerId ? (
                <Link
                  key={s.name}
                  href={`/battler/${s.battlerId}`}
                  className="font-bold uppercase tracking-wide text-sm border-2 border-black bg-white/5 hover:border-[#E7B23C] px-2.5 py-1 transition-colors"
                >
                  {s.name}
                  <span className="text-zinc-500 text-[11px] ml-1.5">{s.role}</span>
                </Link>
              ) : (
                <span key={s.name} className="font-bold uppercase tracking-wide text-sm border-2 border-black bg-white/5 px-2.5 py-1">
                  {s.name}
                  <span className="text-zinc-500 text-[11px] ml-1.5">{s.role}</span>
                </span>
              )
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {ep.topicTags.map((t) => (
              <span key={t} className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 border border-white/12 px-2 py-0.5">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Show + title + rundown */}
      <div>
        <div className="flex items-center gap-2">
          <Svg html={boothMark(26)} className="shrink-0" />
          <span className="font-display font-black uppercase tracking-tight text-[#E7B23C]">{ep.show}</span>
          <span className="font-mono text-[12px] text-zinc-500">{ep.host}</span>
        </div>
        <h1 className="font-display font-black uppercase tracking-tight text-white text-3xl leading-none mt-3 mb-6">
          {ep.title}
        </h1>

        <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 mb-3">The rundown</h3>
        <ol className="flex flex-col">
          {ep.segments.map((s, i) => (
            <li key={i} className="flex gap-4 py-3 border-t-2 border-[#1c1d22]">
              <span className="font-mono text-[13px] text-[#E7B23C] pt-0.5 min-w-[48px]">{s.time}</span>
              <div>
                <div className="font-display font-black uppercase tracking-tight text-zinc-200 text-sm">{s.topic}</div>
                <p className="text-zinc-400 text-[15px] leading-snug mt-1">{s.take}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
