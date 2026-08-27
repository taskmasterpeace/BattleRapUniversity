'use client';

/**
 * THE WIRE — the in-world social feed. Battle rap lives online: fans,
 * bloggers, leagues, meme pages, and battlers argue every result here.
 * Spec: docs/design/THE_WIRE_SOCIAL_NETWORK.md
 *
 * Verbs: Drop · Boost · Props · Heating Up · Stamped. Never Twitter terms.
 * Player speaks through stance-templated camp drops — no free text.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type WireAccount = {
  handle: string;
  display_name: string;
  kind: string;
  stamped: boolean;
};

type WirePost = {
  id: string;
  body: string;
  category: string;
  feed_hint: string;
  battle_id: string | null;
  target_battler_id: string | null;
  crowd_tag: string | null;
  props: number;
  boosts: number;
  replies: number;
  actionable: string | null;
  created_at: string;
  account: WireAccount | null;
};

type HeatingTag = { tag: string; score: number; posts: number };
type MyAction = { post_id: string | null; action: string; stance: string | null };
type DevelopingStory = {
  id: string;
  sitReason: string;
  publishAfter: string;
  blogger: string;
  handle: string;
  subcategory: string | null;
  category: string | null;
  heat: number;
  hint: string;
  subject: string | null;
  other: string | null;
};

const SIT_LABEL: Record<string, { label: string; tone: string }> = {
  breaking: { label: 'BREAKING', tone: 'text-red-400' },
  developing: { label: 'DEVELOPING', tone: 'text-[#ff8c42]' },
  building_it: { label: 'WORKING IT', tone: 'text-yellow-500' },
  backburner: { label: 'SITTING ON IT', tone: 'text-zinc-500' },
};

function dropsIn(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'any minute';
  const h = ms / 3_600_000;
  if (h < 1) return `${Math.round(ms / 60000)}m`;
  if (h < 24) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}

const KIND_CHIPS: Record<string, { label: string; tone: string }> = {
  league: { label: 'LEAGUE', tone: 'bg-amber-500/15 text-amber-400 border-amber-500/40' },
  blogger: { label: 'MEDIA', tone: 'bg-[#ff8c42]/15 text-[#ff8c42] border-[#ff8c42]/40' },
  battler: { label: 'BATTLER', tone: 'bg-red-500/15 text-red-400 border-red-500/40' },
  meme_page: { label: 'MEMES', tone: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40' },
  promoter: { label: 'PROMOTER', tone: 'bg-green-500/15 text-green-400 border-green-500/40' },
  scout: { label: 'SCOUT', tone: 'bg-blue-500/15 text-blue-400 border-blue-500/40' },
  manager: { label: 'CAMP', tone: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/40' },
  fan: { label: 'FAN', tone: 'bg-zinc-600/15 text-zinc-400 border-zinc-600/40' },
};

const FILTERS = [
  { key: 'all', label: 'FOR YOU' },
  { key: 'league_wire', label: 'LEAGUE WIRE' },
  { key: 'rumor_mill', label: 'RUMOR MILL' },
  { key: 'actionable', label: 'NEEDS A RESPONSE' },
] as const;

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'NOW';
  if (mins < 60) return `${mins}M`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}H`;
  return `${Math.floor(hours / 24)}D`;
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function WirePage() {
  const [posts, setPosts] = useState<WirePost[]>([]);
  const [heating, setHeating] = useState<HeatingTag[]>([]);
  const [myActions, setMyActions] = useState<MyAction[]>([]);
  const [myStageName, setMyStageName] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [developing, setDeveloping] = useState<DevelopingStory[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/wire/feed');
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data.posts ?? []);
      setHeating(data.heatingUp ?? []);
      setMyActions(data.myActions ?? []);
      setMyStageName(data.myStageName ?? null);
      setDeveloping(data.developing ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const actedPostIds = new Set(myActions.map((a) => a.post_id));

  const act = async (action: string, stance?: string, postId?: string) => {
    setBusy(postId ?? 'composer');
    try {
      const res = await fetch('/api/wire/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, stance, post_id: postId }),
      });
      const data = await res.json();
      if (res.ok) {
        const fx = Object.entries(data.effects ?? {})
          .map(([k, v]) => `${(v as number) > 0 ? '+' : ''}${v} ${k.replace(/_/g, ' ')}`)
          .join(' · ');
        setToast(
          action === 'ignore'
            ? 'Silence. The scene will remember.'
            : `Drop posted${fx ? ` — ${fx}` : ''}`
        );
        setComposerOpen(false);
        await load();
      } else {
        setToast(data.error ?? 'That didn\'t go through');
      }
    } finally {
      setBusy(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const visible = posts.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'actionable') return !!p.actionable && !actedPostIds.has(p.id);
    return p.feed_hint === filter;
  });

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-zinc-100">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <Link
              href="/dashboard"
              className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-[#ff8c42]"
            >
              ← DASHBOARD
            </Link>
            <h1 className="text-4xl sm:text-5xl font-display font-black uppercase tracking-tighter text-zinc-100 leading-none mt-1">
              THE <span className="text-[#ff8c42]">WIRE</span>
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">
              THE SCENE TALKS. ALL OF IT.
            </p>
          </div>
          {myStageName && (
            <button
              onClick={() => setComposerOpen((v) => !v)}
              className="bg-[#ff8c42] text-black font-display font-black uppercase tracking-wider text-sm px-4 py-2 border-2 border-[#ff8c42] hover:bg-transparent hover:text-[#ff8c42] transition-colors"
            >
              MANAGER DROP
            </button>
          )}
        </div>

        {/* Composer — stance-based, no free text */}
        {composerOpen && (
          <div className="bg-[#101114] border-2 border-[#ff8c42]/50 p-4 mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3">
              SPEAK FOR {myStageName?.toUpperCase()}&apos;S CAMP — PICK A STANCE
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  ['hype', 'HYPE THE CAMP', 'Locked in. Next one gets handled.'],
                  ['defend', 'DEFEND THE TAPE', 'Y\'all watched a different battle.'],
                  ['humble', 'TAKE THE LUMPS', 'No excuses. Back in the lab Monday.'],
                ] as const
              ).map(([stance, label, preview]) => (
                <button
                  key={stance}
                  disabled={busy === 'composer'}
                  onClick={() => act('manager_drop', stance)}
                  className="text-left bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42]/60 p-3 transition-colors disabled:opacity-50"
                >
                  <div className="text-xs font-display font-black uppercase tracking-wider text-[#ff8c42] mb-1">
                    {label}
                  </div>
                  <div className="text-xs text-zinc-400 leading-snug">&ldquo;{preview}&rdquo;</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {toast && (
          <div className="bg-[#18191c] border-2 border-[#ff8c42]/60 px-3 py-2 mb-4 text-xs font-mono uppercase tracking-wider text-[#ff8c42]">
            {toast}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
          {/* Feed */}
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 text-[10px] font-display font-black uppercase tracking-wider border-2 transition-colors ${
                    filter === f.key
                      ? 'bg-[#ff8c42] text-black border-[#ff8c42]'
                      : 'bg-transparent text-zinc-400 border-[#3a3d44] hover:border-[#ff8c42]/50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-16 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                PULLING UP THE WIRE…
              </div>
            ) : visible.length === 0 ? (
              <div className="bg-[#101114] border-2 border-dashed border-[#3a3d44] p-8 text-center">
                <p className="text-sm font-display font-black uppercase tracking-wider text-zinc-400">
                  QUIET OUT HERE
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  Take a battle. Give the scene something to argue about.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {visible.map((post) => {
                  const chip = KIND_CHIPS[post.account?.kind ?? 'fan'] ?? KIND_CHIPS.fan;
                  const canAct = !!post.actionable && !actedPostIds.has(post.id);
                  return (
                    <article key={post.id} className="bg-[#101114] border-2 border-[#3a3d44] p-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-mono text-[#ff8c42] truncate">
                            {post.account?.handle ?? '@unknown'}
                          </span>
                          {post.account?.stamped && (
                            <span
                              title="Stamped"
                              className="text-[9px] font-mono text-amber-400 border border-amber-500/40 px-1"
                            >
                              ✓
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-mono uppercase tracking-widest border px-1.5 py-0.5 ${chip.tone}`}
                          >
                            {chip.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-600 shrink-0">
                          {timeAgo(post.created_at)}
                        </span>
                      </div>

                      <p className="text-sm text-zinc-200 leading-snug break-words">{post.body}</p>

                      <div className="flex items-center justify-between gap-2 mt-2 min-w-0">
                        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 min-w-0">
                          <span title="Props" className="shrink-0">👊 {fmt(post.props)}</span>
                          <span title="Boosts" className="shrink-0">📡 {fmt(post.boosts)}</span>
                          <span title="Replies" className="shrink-0">💬 {fmt(post.replies)}</span>
                          {post.crowd_tag && (
                            <span className="text-[#ff8c42]/80 truncate max-w-[9rem] sm:max-w-[14rem]">
                              {post.crowd_tag}
                            </span>
                          )}
                        </div>
                        {post.battle_id && (
                          <Link
                            href={`/battle/${post.battle_id}`}
                            className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-[#ff8c42]"
                          >
                            THE TAPE →
                          </Link>
                        )}
                      </div>

                      {/* Callout / controversy — the player can answer or stay silent */}
                      {canAct && (
                        <div className="mt-3 pt-3 border-t-2 border-[#3a3d44]">
                          <p className="text-[9px] font-mono uppercase tracking-widest text-red-400 mb-2">
                            {post.actionable === 'callout'
                              ? '🎯 THEY\'RE TALKING ABOUT YOU'
                              : '🔥 CONTROVERSY BREWING'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              disabled={busy === post.id}
                              onClick={() => act('reply', 'fire_back', post.id)}
                              className="px-3 py-1.5 text-[10px] font-display font-black uppercase tracking-wider bg-red-500/15 text-red-400 border-2 border-red-500/40 hover:bg-red-500/25 transition-colors disabled:opacity-50"
                            >
                              FIRE BACK
                            </button>
                            <button
                              disabled={busy === post.id}
                              onClick={() => act('reply', 'take_high_road', post.id)}
                              className="px-3 py-1.5 text-[10px] font-display font-black uppercase tracking-wider bg-green-500/15 text-green-400 border-2 border-green-500/40 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                            >
                              TAKE THE HIGH ROAD
                            </button>
                            <button
                              disabled={busy === post.id}
                              onClick={() => act('ignore', undefined, post.id)}
                              className="px-3 py-1.5 text-[10px] font-display font-black uppercase tracking-wider bg-transparent text-zinc-500 border-2 border-[#3a3d44] hover:border-zinc-500 transition-colors disabled:opacity-50"
                            >
                              STAY SILENT
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Heating Up rail */}
          <aside className="order-first lg:order-none">
            <div className="bg-[#101114] border-2 border-[#3a3d44] p-3 lg:sticky lg:top-4">
              <h2 className="text-sm font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-2">
                🔥 HEATING UP
              </h2>
              {heating.length === 0 ? (
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                  NOTHING BUZZING YET
                </p>
              ) : (
                <ol className="space-y-2">
                  {heating.map((h, i) => (
                    <li key={h.tag} className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-mono text-zinc-200 truncate">
                        <span className="text-zinc-600 mr-1.5">{i + 1}</span>
                        {h.tag}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                        {h.posts} DROPS
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* THE NEWSROOM — stories the blogs have landed and are sitting on. */}
            <div className="bg-[#101114] border-2 border-[#3a3d44] p-3 mt-4 lg:sticky lg:top-[calc(1rem+180px)]">
              <h2 className="text-sm font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-1">
                📰 THE NEWSROOM
              </h2>
              <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 mb-2.5">
                WHAT THE BLOGS ARE SITTING ON
              </p>
              {developing.length === 0 ? (
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                  NO STORIES DEVELOPING
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {developing.slice(0, 8).map((d) => {
                    const sit = SIT_LABEL[d.sitReason] ?? SIT_LABEL.developing;
                    return (
                      <li key={d.id} className="border-l-2 border-[#3a3d44] pl-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${sit.tone}`}>
                            {sit.label}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-600 shrink-0">
                            DROPS ~{dropsIn(d.publishAfter)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-snug mt-0.5">
                          {d.subject}
                          {d.other ? <span className="text-zinc-500"> vs {d.other}</span> : null}
                        </p>
                        <p className="text-[10px] text-zinc-500 leading-snug line-clamp-2">{d.hint}</p>
                        <p className="text-[9px] font-mono text-zinc-600 mt-0.5">
                          {d.handle} on the {(d.subcategory ?? 'story').replace(/_/g, ' ')}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
