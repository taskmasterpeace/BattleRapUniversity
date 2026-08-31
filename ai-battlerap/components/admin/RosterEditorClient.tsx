'use client';

// AI Roster Editor — go down the list and fix what the generator got wrong:
// names, gender, culture coding, appearance identity, style tags, attributes.
// CODING is the culture read (owner Q 2026-08-31, researched): which room
// claims them — STREET (raw, believability-first, URL-coded), CRAFT
// (technical/backpack, KOTD-coded), CROSSOVER (both rooms ride), OVERSEAS
// (foreign-language / international scene). Personality, not race.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { portraitFillStyle } from '@/lib/sprite-crops';
import { toast } from '@/components/ui/Toast';

type Attrs = {
  writing: { lyricism: number; wordplay: number; creativity: number; flow: number };
  performance: { stage_presence: number; crowd_control: number; delivery: number };
  personal: { financial_stability: number; reputation: number; family_bond: number; preparation: number };
  resilience: number;
} | null;

type Row = {
  id: string;
  stageName: string;
  avatarUrl: string | null;
  gender: string | null;
  identity: Record<string, string>;
  styleTags: string[];
  region: string | null;
  isReal: boolean;
  rating: number | null;
  attributes: Attrs;
};

const CODING_META: Record<string, { label: string; color: string; hint: string }> = {
  street: { label: 'STREET', color: '#E23A2E', hint: 'raw · believability-first · URL-coded room' },
  craft: { label: 'CRAFT', color: '#2F7DD1', hint: 'technical · schemes · backpack / KOTD-coded room' },
  crossover: { label: 'CROSSOVER', color: '#E7B23C', hint: 'both rooms ride for them' },
  overseas: { label: 'OVERSEAS', color: '#35C46B', hint: 'foreign-language / international scene' },
};

const IDENTITY_FIELDS: Array<{ key: string; label: string; ph: string }> = [
  { key: 'ethnicity', label: 'Ethnicity', ph: 'Black / White / Latino…' },
  { key: 'age_range', label: 'Age', ph: 'mid 20s' },
  { key: 'build', label: 'Build', ph: 'slim / solid / heavy' },
  { key: 'skin_tone', label: 'Skin', ph: 'brown / fair…' },
  { key: 'hair', label: 'Hair', ph: 'short locs, red durag…' },
  { key: 'facial_hair', label: 'Facial hair', ph: 'full beard / (blank)' },
  { key: 'signature_look', label: 'Signature look', ph: 'green hoodie with drawstrings' },
  { key: 'distinguishing', label: 'Distinguishing', ph: 'hard scowl' },
];

const ATTR_GROUPS: Array<{ group: 'writing' | 'performance' | 'personal'; label: string; keys: string[] }> = [
  { group: 'writing', label: 'WRITING', keys: ['lyricism', 'wordplay', 'creativity', 'flow'] },
  { group: 'performance', label: 'PERFORMANCE', keys: ['stage_presence', 'crowd_control', 'delivery'] },
  { group: 'personal', label: 'PERSONAL', keys: ['financial_stability', 'reputation', 'family_bond', 'preparation'] },
];

export default function RosterEditorClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [codingFilter, setCodingFilter] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  // Draft state for the open drawer
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/roster')
      .then((r) => r.json())
      .then((d) => setRows(d.battlers ?? []))
      .catch(() => toast('Failed to load roster', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (needle && !r.stageName.toLowerCase().includes(needle)) return false;
      if (genderFilter === 'unset' && r.gender) return false;
      if ((genderFilter === 'male' || genderFilter === 'female') && r.gender !== genderFilter) return false;
      const coding = r.identity?.coding;
      if (codingFilter === 'unset' && coding) return false;
      if (codingFilter !== 'all' && codingFilter !== 'unset' && coding !== codingFilter) return false;
      return true;
    });
  }, [rows, q, genderFilter, codingFilter]);

  const counts = useMemo(() => {
    const noGender = rows.filter((r) => !r.gender).length;
    const noCoding = rows.filter((r) => !r.identity?.coding).length;
    return { total: rows.length, noGender, noCoding };
  }, [rows]);

  function openDrawer(r: Row) {
    setOpenId(r.id);
    setDraft({
      stageName: r.stageName,
      gender: r.gender ?? '',
      coding: r.identity?.coding ?? '',
      facets: Array.isArray((r.identity as any)?.facets) ? ((r.identity as any).facets as string[]).join(', ') : '',
      identity: Object.fromEntries(IDENTITY_FIELDS.map((f) => [f.key, r.identity?.[f.key] ?? ''])),
      styleTags: r.styleTags.join(', '),
      rating: r.rating ?? 1200,
      attributes: r.attributes
        ? JSON.parse(JSON.stringify(r.attributes))
        : {
            writing: { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
            performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
            personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
            resilience: 5,
          },
    });
  }

  async function save(r: Row) {
    if (!draft) return;
    setSaving(r.id);
    try {
      const payload: any = {
        stageName: draft.stageName,
        gender: draft.gender || null,
        identity: {
          ...draft.identity,
          coding: draft.coding || null,
          facets: draft.facets.split(',').map((t: string) => t.trim()).filter(Boolean),
        },
        styleTags: draft.styleTags.split(',').map((t: string) => t.trim()).filter(Boolean),
        rating: Number(draft.rating) || 1200,
        attributes: draft.attributes,
      };
      const res = await fetch(`/api/admin/roster/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setRows((prev) =>
        prev.map((row) =>
          row.id === r.id
            ? {
                ...row,
                stageName: data.battler.stage_name,
                gender: data.battler.gender ?? null,
                identity: data.battler.identity ?? {},
                styleTags: Array.isArray(data.battler.style_tags) ? data.battler.style_tags : [],
                rating: Number(draft.rating) || row.rating,
                attributes: draft.attributes,
              }
            : row
        )
      );
      toast(`${data.battler.stage_name} saved`, 'success');
      setOpenId(null);
      setDraft(null);
    } catch (e: any) {
      toast(e.message || 'Save failed', 'error');
    } finally {
      setSaving(null);
    }
  }

  const inputCls =
    'bg-[#0F0F12] border-2 border-[#2E2F35] px-2 py-1.5 text-sm text-zinc-100 font-mono focus:border-[#F5731A] focus:outline-none w-full';

  return (
    <div className="fs max-w-7xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-zinc-100 mb-2">
          AI <span className="text-[#ff8c42]">ROSTER</span> EDITOR
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          {counts.total} AI battlers · {counts.noGender} missing gender · {counts.noCoding} missing coding
        </p>
      </div>

      {/* Coding legend — the culture read, not race */}
      <div className="bg-[#17181C] border-2 border-black p-4 shadow-[3px_3px_0_rgba(0,0,0,.4)]" style={{ borderTop: '3px solid #F5731A' }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-2">
          CODING = WHICH ROOM CLAIMS THEM (PERSONALITY, NOT RACE)
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {Object.entries(CODING_META).map(([k, m]) => (
            <span key={k} className="font-mono text-[10px] uppercase tracking-wide text-zinc-400">
              <span className="font-bold" style={{ color: m.color }}>■ {m.label}</span> — {m.hint}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="SEARCH NAME…"
          className={`${inputCls} max-w-xs`}
        />
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className={`${inputCls} w-auto`}>
          <option value="all">GENDER: ALL</option>
          <option value="male">MALE</option>
          <option value="female">FEMALE</option>
          <option value="unset">MISSING</option>
        </select>
        <select value={codingFilter} onChange={(e) => setCodingFilter(e.target.value)} className={`${inputCls} w-auto`}>
          <option value="all">CODING: ALL</option>
          <option value="street">STREET</option>
          <option value="craft">CRAFT</option>
          <option value="crossover">CROSSOVER</option>
          <option value="overseas">OVERSEAS</option>
          <option value="unset">MISSING</option>
        </select>
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 ml-auto">
          {filtered.length > 150 ? `SHOWING 150 OF ${filtered.length} — REFINE SEARCH` : `SHOWING ${filtered.length}`}
        </span>
      </div>

      {loading ? (
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 py-10 text-center">
          LOADING THE ROSTER…
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.slice(0, 150).map((r) => {
            const coding = r.identity?.coding;
            const cm = coding ? CODING_META[coding] : null;
            const isOpen = openId === r.id;
            return (
              <div
                key={r.id}
                className="bg-[#101114] border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,.4)]"
                style={{ borderLeft: `3px solid ${cm ? cm.color : '#2E2F35'}` }}
              >
                <div className="flex items-center gap-3 p-3">
                  <Link
                    href={`/battler/${r.id}`}
                    className="relative w-12 h-12 shrink-0 bg-[#0a0a0a] border-2 border-black overflow-hidden"
                    title="Open dossier"
                  >
                    {r.avatarUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={r.avatarUrl} alt="" style={portraitFillStyle(r.avatarUrl)} />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/battler/${r.id}`}
                        className="font-display font-black uppercase tracking-tight text-zinc-100 hover:text-[#ff8c42] transition-colors truncate"
                      >
                        {r.stageName}
                      </Link>
                      {r.isReal && (
                        <span className="px-1.5 py-0.5 bg-[#ff8c42] text-black font-mono text-[8px] font-bold uppercase">
                          REAL
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 truncate">
                      {[
                        r.gender ? r.gender.toUpperCase() : '⚠ NO GENDER',
                        cm ? cm.label : '⚠ NO CODING',
                        r.rating ? `ELO ${r.rating}` : null,
                        r.styleTags.slice(0, 3).join(' · ') || null,
                        Array.isArray((r.identity as any)?.facets) && (r.identity as any).facets.length > 0
                          ? `✦ ${(r.identity as any).facets.join(' · ')}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join('  ·  ')}
                    </p>
                  </div>
                  <button
                    onClick={() => (isOpen ? (setOpenId(null), setDraft(null)) : openDrawer(r))}
                    className="shrink-0 px-4 py-2 border-2 border-[#3a3d44] font-mono text-[10px] uppercase tracking-widest text-zinc-300 hover:border-[#F5731A] hover:text-[#F5731A] transition-colors"
                  >
                    {isOpen ? 'CLOSE ▲' : 'EDIT ▼'}
                  </button>
                </div>

                {isOpen && draft && (
                  <div className="border-t-2 border-black p-4 grid gap-4 md:grid-cols-2">
                    {/* Left: identity */}
                    <div className="space-y-3">
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 block mb-1">
                          Stage name
                        </label>
                        <input
                          value={draft.stageName}
                          onChange={(e) => setDraft({ ...draft, stageName: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 block mb-1">
                            Gender
                          </label>
                          <select
                            value={draft.gender}
                            onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
                            className={inputCls}
                          >
                            <option value="">— unset —</option>
                            <option value="male">MALE</option>
                            <option value="female">FEMALE</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 block mb-1">
                            Coding
                          </label>
                          <select
                            value={draft.coding}
                            onChange={(e) => setDraft({ ...draft, coding: e.target.value })}
                            className={inputCls}
                          >
                            <option value="">— unset —</option>
                            <option value="street">STREET</option>
                            <option value="craft">CRAFT</option>
                            <option value="crossover">CROSSOVER</option>
                            <option value="overseas">OVERSEAS</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {IDENTITY_FIELDS.map((f) => (
                          <div key={f.key}>
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 block mb-1">
                              {f.label}
                            </label>
                            <input
                              value={draft.identity[f.key]}
                              onChange={(e) =>
                                setDraft({ ...draft, identity: { ...draft.identity, [f.key]: e.target.value } })
                              }
                              placeholder={f.ph}
                              className={inputCls}
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 block mb-1">
                          Style tags (comma separated)
                        </label>
                        <input
                          value={draft.styleTags}
                          onChange={(e) => setDraft({ ...draft, styleTags: e.target.value })}
                          placeholder="Punchline Queen, Aggressive, Street"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 block mb-1">
                          Persona facets — who they are in the culture (comma separated)
                        </label>
                        <input
                          value={draft.facets}
                          onChange={(e) => setDraft({ ...draft, facets: e.target.value })}
                          placeholder="Christian, LGBTQ, Ex-Con, Veteran, Muslim, Sober, Family Man, Battle Nerd…"
                          className={inputCls}
                        />
                        <p className="font-mono text-[8px] uppercase tracking-wide text-zinc-600 mt-1">
                          FEEDS ANGLES + STORYLINES — WHAT OPPONENTS AND BLOGGERS CAN TALK ABOUT
                        </p>
                      </div>
                    </div>

                    {/* Right: numbers */}
                    <div className="space-y-3">
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 block mb-1">
                          ELO rating
                        </label>
                        <input
                          type="number"
                          value={draft.rating}
                          onChange={(e) => setDraft({ ...draft, rating: e.target.value })}
                          className={`${inputCls} max-w-[140px]`}
                        />
                      </div>
                      {ATTR_GROUPS.map((g) => (
                        <div key={g.group}>
                          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#ff8c42] mb-1">{g.label}</p>
                          <div className="grid grid-cols-4 gap-2">
                            {g.keys.map((k) => (
                              <div key={k}>
                                <label className="font-mono text-[8px] uppercase tracking-wide text-zinc-600 block">
                                  {k.replace(/_/g, ' ').slice(0, 10)}
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  step={0.1}
                                  value={draft.attributes[g.group][k]}
                                  onChange={(e) =>
                                    setDraft({
                                      ...draft,
                                      attributes: {
                                        ...draft.attributes,
                                        [g.group]: { ...draft.attributes[g.group], [k]: Number(e.target.value) },
                                      },
                                    })
                                  }
                                  className={inputCls}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#ff8c42] mb-1">MENTAL</p>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          step={0.1}
                          value={draft.attributes.resilience}
                          onChange={(e) =>
                            setDraft({ ...draft, attributes: { ...draft.attributes, resilience: Number(e.target.value) } })
                          }
                          className={`${inputCls} max-w-[140px]`}
                        />
                      </div>
                      <div className="pt-2 flex gap-3">
                        <button
                          onClick={() => save(r)}
                          disabled={saving === r.id}
                          className="px-6 py-2.5 bg-[#F5731A] text-black font-display font-black uppercase tracking-wider text-sm border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,.45)] hover:bg-[#ff8c42] disabled:opacity-50 transition-colors"
                        >
                          {saving === r.id ? 'SAVING…' : 'SAVE'}
                        </button>
                        <button
                          onClick={() => (setOpenId(null), setDraft(null))}
                          className="px-4 py-2.5 border-2 border-[#3a3d44] font-mono text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
