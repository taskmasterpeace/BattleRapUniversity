'use client';

// Shared form for creating/editing a real battler (admin tools).
// Used by AddRealBattlerForm (create) and RealBattlerEditor (edit).
import { useState } from 'react';
import { ATTRIBUTE_KEYS } from '@/lib/admin/realBattlerPayload';

export type CityOption = { id: string; name: string; state: string | null };

export type RealBattlerFormValues = {
  stage_name: string;
  real_name: string;
  bio: string;
  hometown_city_id: string;
  tier: string;
  likeness_status: string;
  avatar_url: string;
  style_tags: string; // comma-separated in the form
  attributes: Record<(typeof ATTRIBUTE_KEYS)[number], number>;
  rating: number;
};

export const DEFAULT_FORM_VALUES: RealBattlerFormValues = {
  stage_name: '',
  real_name: '',
  bio: '',
  hometown_city_id: '',
  tier: 'mid',
  likeness_status: 'pending',
  avatar_url: '',
  style_tags: '',
  attributes: {
    lyricism: 5,
    wordplay: 5,
    creativity: 5,
    flow: 5,
    stage_presence: 5,
    crowd_control: 5,
    delivery: 5,
    resilience: 5,
  },
  rating: 1200,
};

/** Convert form values → API payload shape. */
export function toApiPayload(v: RealBattlerFormValues) {
  return {
    stage_name: v.stage_name.trim(),
    real_name: v.real_name.trim() || null,
    bio: v.bio.trim() || null,
    hometown_city_id: v.hometown_city_id || null,
    tier: v.tier,
    likeness_status: v.likeness_status,
    avatar_url: v.avatar_url.trim() || null,
    style_tags: v.style_tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0),
    attributes: v.attributes,
    rating: v.rating,
  };
}

const ATTRIBUTE_LABELS: Record<(typeof ATTRIBUTE_KEYS)[number], string> = {
  lyricism: 'Lyricism',
  wordplay: 'Wordplay',
  creativity: 'Creativity',
  flow: 'Flow',
  stage_presence: 'Stage Presence',
  crowd_control: 'Crowd Control',
  delivery: 'Delivery',
  resilience: 'Resilience',
};

const inputClass =
  'w-full px-3 py-2.5 bg-[#0a0a0a] border-2 border-[#3a3d44] text-zinc-100 text-sm placeholder-zinc-600 focus:border-[#ff8c42] focus:outline-none';
const labelClass =
  'block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5';

export default function RealBattlerForm({
  cities,
  initial,
  submitLabel,
  onSubmit,
}: {
  cities: CityOption[];
  initial: RealBattlerFormValues;
  submitLabel: string;
  onSubmit: (values: RealBattlerFormValues) => Promise<string | null>; // returns error message or null
}) {
  const [values, setValues] = useState<RealBattlerFormValues>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof RealBattlerFormValues>(key: K, value: RealBattlerFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const setAttr = (key: (typeof ATTRIBUTE_KEYS)[number], value: number) =>
    setValues((v) => ({ ...v, attributes: { ...v.attributes, [key]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const err = await onSubmit(values);
      if (err) setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Stage Name *</label>
          <input
            required
            minLength={2}
            maxLength={50}
            value={values.stage_name}
            onChange={(e) => set('stage_name', e.target.value)}
            placeholder="Tru Foe"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Real Name (optional)</label>
          <input
            maxLength={100}
            value={values.real_name}
            onChange={(e) => set('real_name', e.target.value)}
            placeholder="Withheld unless licensed"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Bio</label>
        <textarea
          rows={4}
          maxLength={4000}
          value={values.bio}
          onChange={(e) => set('bio', e.target.value)}
          placeholder="Their story — where they came from, what they're known for…"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Hometown City</label>
          <select
            value={values.hometown_city_id}
            onChange={(e) => set('hometown_city_id', e.target.value)}
            className={inputClass}
          >
            <option value="">— None —</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.state ? `, ${c.state}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Tier</label>
          <select value={values.tier} onChange={(e) => set('tier', e.target.value)} className={inputClass}>
            <option value="low">Low</option>
            <option value="mid">Mid</option>
            <option value="top">Top</option>
            <option value="god">God</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Likeness Status</label>
          <select
            value={values.likeness_status}
            onChange={(e) => set('likeness_status', e.target.value)}
            className={inputClass}
          >
            <option value="licensed">Licensed</option>
            <option value="pending">Pending</option>
            <option value="unofficial">Unofficial</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Avatar URL</label>
          <input
            maxLength={500}
            value={values.avatar_url}
            onChange={(e) => set('avatar_url', e.target.value)}
            placeholder="/sprites/characters/real/…png"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Style Tags (comma separated)</label>
          <input
            value={values.style_tags}
            onChange={(e) => set('style_tags', e.target.value)}
            placeholder="Aggressive, Wordplay, Battle Tested"
            className={inputClass}
          />
        </div>
      </div>

      {/* Attributes */}
      <div className="border-2 border-[#3a3d44] bg-[#101114] p-5">
        <div className="font-display font-black uppercase tracking-tighter text-sm text-zinc-100 mb-4">
          ATTRIBUTES <span className="font-mono text-[10px] tracking-widest text-zinc-500 font-normal">1–10</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {ATTRIBUTE_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 w-32 shrink-0">
                {ATTRIBUTE_LABELS[key]}
              </span>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={values.attributes[key]}
                onChange={(e) => setAttr(key, Number(e.target.value))}
                className="flex-1 accent-[#ff8c42]"
              />
              <span className="font-display font-black text-[#ff8c42] w-8 text-right tabular-nums">
                {values.attributes[key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Starting Rating</label>
          <input
            type="number"
            min={400}
            max={3000}
            step={10}
            value={values.rating}
            onChange={(e) => set('rating', Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm font-bold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="px-8 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {busy ? 'SAVING…' : submitLabel}
      </button>
    </form>
  );
}
