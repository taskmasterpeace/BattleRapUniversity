'use client';

/**
 * THE WIRE — compact dashboard panel. The scene's latest drops at a glance,
 * with a hot badge when something needs the player's response.
 * Full feed lives at /wire. Spec: docs/design/THE_WIRE_SOCIAL_NETWORK.md
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

type PanelPost = {
  id: string;
  body: string;
  crowd_tag: string | null;
  props: number;
  actionable: string | null;
  created_at: string;
  account: { handle: string; kind: string; stamped: boolean } | null;
};

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return 'NOW';
  if (mins < 60) return `${mins}M`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}H`;
  return `${Math.floor(hours / 24)}D`;
}

export default function WirePanel() {
  const [posts, setPosts] = useState<PanelPost[]>([]);
  const [needsResponse, setNeedsResponse] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/wire/feed');
        if (!res.ok) return;
        const data = await res.json();
        const all: PanelPost[] = data.posts ?? [];
        const acted = new Set(
          (data.myActions ?? []).map((a: { post_id: string | null }) => a.post_id)
        );
        setNeedsResponse(all.filter((p) => p.actionable && !acted.has(p.id)).length);
        setPosts(all.slice(0, 5));
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  if (!loaded || posts.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42]">
          📡 THE WIRE
        </h2>
        <Link
          href="/wire"
          className="text-[12px] font-mono uppercase tracking-widest text-zinc-500 hover:text-[#ff8c42] transition-colors"
        >
          {needsResponse > 0 ? (
            <span className="text-red-400">
              {needsResponse} NEED{needsResponse === 1 ? 'S' : ''} A RESPONSE →
            </span>
          ) : (
            'OPEN THE WIRE →'
          )}
        </Link>
      </div>
      <div className="bg-[#101114] border-2 border-[#3a3d44] divide-y-2 divide-[#3a3d44]">
        {posts.map((post) => (
          <Link
            key={post.id}
            href="/wire"
            className="block px-3 py-2 hover:bg-[#18191c] transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-0.5 min-w-0">
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="text-[13px] font-mono text-[#ff8c42] truncate">
                  {post.account?.handle ?? '@unknown'}
                </span>
                {post.account?.stamped && (
                  <span className="text-[10px] font-mono text-amber-400 border border-amber-500/40 px-0.5 shrink-0">
                    ✓
                  </span>
                )}
                {post.actionable && (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 border border-red-500/40 px-1 shrink-0">
                    {post.actionable === 'callout' ? '🎯 CALLOUT' : '🔥 HOT'}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-mono text-zinc-600 shrink-0">
                {timeAgo(post.created_at)}
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-snug break-words line-clamp-2">
              {post.body}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
