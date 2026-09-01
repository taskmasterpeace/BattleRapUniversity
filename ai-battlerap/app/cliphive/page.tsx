'use client';

/**
 * ClipHive — the game's own video platform (a fake YouTube for the battle-rap
 * world). Standalone on purpose: it's fun to browse the fake platform full of
 * the world's drama. Our own brand (hex-hive mark), our own thumbnails.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/db/client';
import { clipHiveLockup, clipHiveMark, videoThumbnailSVG } from '@/lib/game/media/brandAssets';
import type { MediaItem, VideoCard } from '@/lib/game/media/mediaGenerator';

const FILTERS = ['upset', 'choke', 'body', 'classic', 'robbery', 'washed', 'mainstream', 'revenge'];

function Svg({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ClipHivePage() {
  const [onlyYou, setOnlyYou] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const [meId, setMeId] = useState<string | null>(null);

  // Current player's battler → powers the "About You" filter + YOU badge.
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || off) return;
        const { data } = await supabase.from('battlers').select('id').eq('user_id', user.id).maybeSingle();
        if (!off && data?.id) setMeId(data.id);
      } catch { /* DB unreachable — about-you just stays off */ }
    })();
    return () => { off = true; };
  }, []);

  const { data, isLoading } = useQuery<{ items: MediaItem[]; isDemo: boolean }>({
    queryKey: ['cliphive-feed'],
    queryFn: async () => {
      const res = await fetch('/api/media/feed');
      if (!res.ok) throw new Error('feed');
      return res.json();
    },
    retry: false,
    staleTime: 60_000,
  });

  const videos = useMemo(
    () => (data?.items ?? []).filter((i): i is VideoCard => i.kind === 'video_card'),
    [data]
  );

  const shown = videos.filter((v) => {
    const you = !!meId && v.subjects.some((s) => s.battlerId === meId);
    return (!onlyYou || you) && (!tag || v.topicTags.includes(tag));
  });

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-[#e8e6e1]">
      {/* ClipHive top bar */}
      <div className="sticky top-0 z-20 bg-[#141418] border-b-2 border-black shadow-[0_3px_0_rgba(0,0,0,.4)]">
        <div className="max-w-[1400px] mx-auto px-5 py-3 flex items-center gap-5">
          <Svg html={clipHiveLockup(30)} />
          <div className="hidden sm:flex items-center flex-1 max-w-[520px] bg-[#0c0c0f] border-2 border-[#2a2b31] px-4 py-2">
            <span className="font-mono text-[12px] tracking-wider uppercase text-[#5b5c63]">🔎 search the culture…</span>
          </div>
          <button
            onClick={() => setOnlyYou((v) => !v)}
            className={`ml-auto font-mono text-[12px] tracking-[0.12em] uppercase border-2 px-3 py-2 transition ${
              onlyYou ? 'bg-[#5aa2f0] text-black border-[#5aa2f0]' : 'text-[#5aa2f0] border-[#5aa2f0]/60 bg-[#5aa2f0]/10'
            }`}
          >
            ★ About You
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="sticky top-[59px] z-10 bg-[#0c0c0f] px-5 pt-4 pb-1 flex flex-wrap gap-1.5">
        <Chip label="ALL" active={!tag} onClick={() => setTag(null)} />
        {FILTERS.map((t) => (
          <Chip key={t} label={t.toUpperCase()} active={tag === t} onClick={() => setTag((c) => (c === t ? null : t))} />
        ))}
        {data?.isDemo && (
          <span className="ml-auto font-mono text-[11px] tracking-widest uppercase text-[#5b5c63] self-center">
            showcase · real cards fill in as battles happen
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-[1400px] mx-auto px-5 py-5 grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {isLoading && <p className="text-[#5b5c63] uppercase tracking-wide text-sm py-10">Loading the feed…</p>}
        {!isLoading && shown.length === 0 && (
          <p className="text-[#5b5c63] uppercase tracking-wide text-sm py-10">
            {onlyYou ? 'No clips about you yet — go make a moment.' : 'Nothing here yet.'}
          </p>
        )}
        {shown.map((v) => (
          <VideoTile key={v.id} v={v} you={!!meId && v.subjects.some((s) => s.battlerId === meId)} />
        ))}
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-[11px] tracking-[0.12em] uppercase border px-3 py-1.5 transition ${
        active ? 'bg-[#ff8c42] text-black border-[#ff8c42]' : 'text-zinc-400 border-white/15 bg-white/5 hover:border-white/30'
      }`}
    >
      {label}
    </button>
  );
}

function VideoTile({ v, you }: { v: VideoCard; you: boolean }) {
  const battleId = v.id.replace(/^vid-/, '');
  const thumb = videoThumbnailSVG({ winner: v.winnerName, loser: v.loserName, story: v.story, duration: v.durationLabel });
  return (
    <Link href={`/watch/${battleId}`} className="group block">
      <div className="aspect-[16/9] border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,.5)] overflow-hidden transition-transform group-hover:-translate-x-px group-hover:-translate-y-px [&_svg]:block [&_svg]:w-full [&_svg]:h-full">
        <Svg html={thumb} />
      </div>
      <div className="flex gap-3 mt-3">
        <Svg html={clipHiveMark(34)} className="shrink-0" />
        <div className="min-w-0">
          <div className="font-display font-black uppercase tracking-tight text-white leading-tight line-clamp-2 group-hover:text-[#ff8c42] transition">
            {v.title}
          </div>
          <div className="text-[13px] font-bold uppercase tracking-wide text-zinc-400 mt-1">
            {v.channel}
            {you && <span className="text-[#ff8c42]"> · ★ YOU</span>}
          </div>
          <div className="font-mono text-[11px] uppercase tracking-wide text-[#5b5c63] mt-0.5">
            {v.viewsLabel} · {v.topicTags.slice(0, 3).join(' · ')}
          </div>
        </div>
      </div>
    </Link>
  );
}
