'use client';

/**
 * The Booth — the game's podcast platform (audio side of the media world).
 * Standalone, like ClipHive is for video. Browse shows, listen to episodes,
 * filter to "About You". 1:1 cover art; real audio drops in later.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/db/client';
import {
  boothLockup, boothMark, podcastShowCover, podcastEpisodeCover, PODCAST_SHOWS,
} from '@/lib/game/media/brandAssets';
import type { MediaItem, PodcastEpisode } from '@/lib/game/media/mediaGenerator';

const FILTERS = ['upset', 'choke', 'body', 'classic', 'robbery', 'washed', 'mainstream', 'revenge', 'beef'];

function Svg({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function BoothPage() {
  const [onlyYou, setOnlyYou] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const [show, setShow] = useState<string | null>(null);
  const [meId, setMeId] = useState<string | null>(null);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || off) return;
        const { data } = await supabase.from('battlers').select('id').eq('user_id', user.id).maybeSingle();
        if (!off && data?.id) setMeId(data.id);
      } catch { /* DB down — about-you off */ }
    })();
    return () => { off = true; };
  }, []);

  const { data, isLoading } = useQuery<{ items: MediaItem[]; isDemo: boolean }>({
    queryKey: ['booth-feed'],
    queryFn: async () => {
      const res = await fetch('/api/media/feed');
      if (!res.ok) throw new Error('feed');
      return res.json();
    },
    retry: false,
    staleTime: 60_000,
  });

  const episodes = useMemo(
    () => (data?.items ?? []).filter((i): i is PodcastEpisode => i.kind === 'podcast_episode'),
    [data]
  );

  const shown = episodes.filter((e) => {
    const you = !!meId && e.subjects.some((s) => s.battlerId === meId);
    return (!onlyYou || you) && (!tag || e.topicTags.includes(tag)) && (!show || e.show === show);
  });

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-[#e8e6e1]">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[#141418] border-b-2 border-black shadow-[0_3px_0_rgba(0,0,0,.4)]">
        <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center gap-5">
          <Svg html={boothLockup(30)} />
          <div className="hidden sm:flex items-center flex-1 max-w-[460px] bg-[#0c0c0f] border-2 border-[#2a2b31] px-4 py-2">
            <span className="font-mono text-[12px] tracking-wider uppercase text-[#5b5c63]">🔎 search the shows…</span>
          </div>
          <button
            onClick={() => setOnlyYou((v) => !v)}
            className={`ml-auto font-mono text-[12px] tracking-[0.12em] uppercase border-2 px-3 py-2 transition ${
              onlyYou ? 'bg-[#E7B23C] text-black border-[#E7B23C]' : 'text-[#E7B23C] border-[#E7B23C]/60 bg-[#E7B23C]/10'
            }`}
          >
            ★ About You
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 py-6">
        {/* SHOWS strip — browse by show */}
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display font-black uppercase tracking-wider text-sm text-zinc-200">Shows</h2>
          {show && (
            <button onClick={() => setShow(null)} className="font-mono text-[11px] uppercase tracking-widest text-[#E7B23C]">
              clear · {show}
            </button>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 mb-8">
          {PODCAST_SHOWS.map((s) => (
            <button
              key={s}
              onClick={() => setShow((c) => (c === s ? null : s))}
              className={`shrink-0 w-[128px] transition ${show === s ? 'opacity-100' : show ? 'opacity-40' : 'opacity-100'} hover:opacity-100`}
            >
              <span
                className={`block aspect-square border-2 shadow-[3px_3px_0_rgba(0,0,0,.5)] overflow-hidden [&_svg]:block [&_svg]:w-full [&_svg]:h-full ${
                  show === s ? 'border-[#E7B23C]' : 'border-black'
                }`}
                dangerouslySetInnerHTML={{ __html: podcastShowCover(s, 128) }}
              />
            </button>
          ))}
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          <Chip label="ALL TOPICS" active={!tag} onClick={() => setTag(null)} />
          {FILTERS.map((t) => (
            <Chip key={t} label={t.toUpperCase()} active={tag === t} onClick={() => setTag((c) => (c === t ? null : t))} />
          ))}
          {data?.isDemo && (
            <span className="ml-auto font-mono text-[11px] tracking-widest uppercase text-[#5b5c63] self-center">
              showcase · real episodes drop as battles happen
            </span>
          )}
        </div>

        {/* Episodes */}
        {isLoading && <p className="text-[#5b5c63] uppercase tracking-wide text-sm py-10">Tuning in…</p>}
        {!isLoading && shown.length === 0 && (
          <p className="text-[#5b5c63] uppercase tracking-wide text-sm py-10">
            {onlyYou ? 'Nobody’s done a pod about you yet — go give them a reason.' : 'No episodes here.'}
          </p>
        )}
        <div className="flex flex-col gap-3">
          {shown.map((e) => (
            <EpisodeRow key={e.id} e={e} you={!!meId && e.subjects.some((s) => s.battlerId === meId)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-[11px] tracking-[0.12em] uppercase border px-3 py-1.5 transition ${
        active ? 'bg-[#E7B23C] text-black border-[#E7B23C]' : 'text-zinc-400 border-white/15 bg-white/5 hover:border-white/30'
      }`}
    >
      {label}
    </button>
  );
}

function EpisodeRow({ e, you }: { e: PodcastEpisode; you: boolean }) {
  const battleId = e.id.replace(/^pod-/, '');
  const cover = podcastEpisodeCover(
    {
      show: e.show,
      winner: e.winnerName ?? e.subjects.find((s) => s.role === 'winner')?.name ?? '',
      loser: e.loserName ?? e.subjects.find((s) => s.role === 'loser')?.name ?? '',
      story: e.story ?? 'standard',
      topic: e.segments[0]?.topic ?? '',
      duration: e.durationLabel,
    },
    128
  );
  return (
    <Link
      href={`/booth/${battleId}`}
      className="group flex gap-4 border-2 border-black p-3 transition-colors hover:border-[#E7B23C]"
      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.01)), #141418' }}
    >
      <span
        className="shrink-0 w-[112px] h-[112px] border-2 border-black overflow-hidden [&_svg]:block [&_svg]:w-full [&_svg]:h-full"
        dangerouslySetInnerHTML={{ __html: cover }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Svg html={boothMark(22)} className="shrink-0" />
          <span className="font-display font-black uppercase tracking-tight text-[#E7B23C] text-sm">{e.show}</span>
          <span className="font-mono text-[11px] text-[#5b5c63]">{e.host}</span>
          <span className="ml-auto font-mono text-[11px] text-[#5b5c63]">{e.durationLabel}</span>
        </div>
        <div className="font-display font-black uppercase tracking-tight text-white text-lg leading-tight mt-1 line-clamp-2 group-hover:text-[#E7B23C] transition">
          {e.title}
        </div>
        {e.segments[0] && (
          <p className="text-zinc-400 text-[13px] mt-1 line-clamp-1">
            <span className="font-mono text-[11px] uppercase tracking-wide text-zinc-500">{e.segments[0].topic}</span> — {e.segments[0].take}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#E7B23C] border border-[#E7B23C]/40 px-2 py-0.5">▶ Listen</span>
          {you && <span className="font-mono text-[11px] uppercase tracking-widest text-[#E7B23C]">★ You</span>}
          {e.topicTags.slice(0, 4).map((t) => (
            <span key={t} className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
