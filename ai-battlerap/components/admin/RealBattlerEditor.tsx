'use client';

// Edit island for /admin/real-battlers/[id]:
// profile form + accolades manager + claim-code generation + danger zone.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RealBattlerForm, {
  toApiPayload,
  type CityOption,
  type RealBattlerFormValues,
} from './RealBattlerForm';

type Accolade = {
  id: string;
  rank: number | null;
  title: string;
  scope: string;
  region: string | null;
  year: number | null;
  source: string | null;
};

type ClaimCode = {
  id: string;
  code: string;
  created_at: string;
  claimed_by: string | null;
  claimed_at: string | null;
};

type BattlerRow = {
  id: string;
  stage_name: string;
  real_name: string | null;
  bio: string | null;
  tier: string;
  likeness_status: string | null;
  avatar_url: string | null;
  style_tags: string[] | null;
  hometown_city_id: string | null;
  verified_user_id: string | null;
};

type AttributeRow = {
  writing: Record<string, number>;
  performance: Record<string, number>;
  resilience: number;
} | null;

const inputClass =
  'w-full px-3 py-2.5 bg-[#0a0a0a] border-2 border-[#3a3d44] text-zinc-100 text-sm placeholder-zinc-600 focus:border-[#ff8c42] focus:outline-none';
const labelClass = 'block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5';
const sectionTitle = 'font-display font-black uppercase tracking-tighter text-xl text-zinc-100';

export default function RealBattlerEditor({
  battler,
  attributes,
  rating,
  accolades: initialAccolades,
  claimCodes: initialCodes,
  cities,
}: {
  battler: BattlerRow;
  attributes: AttributeRow;
  rating: number;
  accolades: Accolade[];
  claimCodes: ClaimCode[];
  cities: CityOption[];
}) {
  const router = useRouter();

  const initial: RealBattlerFormValues = {
    stage_name: battler.stage_name,
    real_name: battler.real_name ?? '',
    bio: battler.bio ?? '',
    hometown_city_id: battler.hometown_city_id ?? '',
    tier: battler.tier,
    likeness_status: battler.likeness_status ?? 'pending',
    avatar_url: battler.avatar_url ?? '',
    style_tags: (battler.style_tags ?? []).join(', '),
    attributes: {
      lyricism: attributes?.writing?.lyricism ?? 5,
      wordplay: attributes?.writing?.wordplay ?? 5,
      creativity: attributes?.writing?.creativity ?? 5,
      flow: attributes?.writing?.flow ?? 5,
      stage_presence: attributes?.performance?.stage_presence ?? 5,
      crowd_control: attributes?.performance?.crowd_control ?? 5,
      delivery: attributes?.performance?.delivery ?? 5,
      resilience: attributes?.resilience ?? 5,
    },
    rating,
  };

  const [saved, setSaved] = useState(false);

  const handleSave = async (values: RealBattlerFormValues): Promise<string | null> => {
    setSaved(false);
    const res = await fetch(`/api/admin/real-battlers/${battler.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toApiPayload(values)),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data.error ?? 'Failed to save';
    setSaved(true);
    router.refresh();
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Profile */}
      <section className="bg-[#18191c] border-2 border-[#3a3d44] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className={sectionTitle}>PROFILE</h2>
          {saved && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-green-400">
              ✓ Saved
            </span>
          )}
        </div>
        <RealBattlerForm cities={cities} initial={initial} submitLabel="SAVE CHANGES" onSubmit={handleSave} />
      </section>

      <AccoladesManager battlerId={battler.id} initialAccolades={initialAccolades} />

      <ClaimCodePanel
        battlerId={battler.id}
        stageName={battler.stage_name}
        claimed={!!battler.verified_user_id}
        initialCodes={initialCodes}
      />

      <DangerZone battlerId={battler.id} stageName={battler.stage_name} claimed={!!battler.verified_user_id} />
    </div>
  );
}

// ── Accolades ────────────────────────────────────────────────────────────────

function AccoladesManager({
  battlerId,
  initialAccolades,
}: {
  battlerId: string;
  initialAccolades: Accolade[];
}) {
  const [accolades, setAccolades] = useState<Accolade[]>(initialAccolades);
  const [form, setForm] = useState({ rank: '', title: '', scope: 'real_world', region: '', year: '', source: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAccolade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/admin/accolades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battler_id: battlerId,
          rank: form.rank ? Number(form.rank) : null,
          title: form.title,
          scope: form.scope,
          region: form.region || null,
          year: form.year ? Number(form.year) : null,
          source: form.source || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to add accolade');
        return;
      }
      setAccolades((a) => [...a, data.accolade]);
      setForm({ rank: '', title: '', scope: form.scope, region: '', year: '', source: '' });
    } finally {
      setBusy(false);
    }
  };

  const deleteAccolade = async (id: string) => {
    const res = await fetch(`/api/admin/accolades?id=${id}`, { method: 'DELETE' });
    if (res.ok) setAccolades((a) => a.filter((x) => x.id !== id));
  };

  return (
    <section className="bg-[#18191c] border-2 border-[#3a3d44] p-6">
      <h2 className={`${sectionTitle} mb-1`}>ACCOLADES</h2>
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-5">
        Real-world resume + in-game records
      </p>

      <div className="space-y-2 mb-6">
        {accolades.length === 0 && (
          <p className="text-sm text-zinc-500">No accolades yet.</p>
        )}
        {accolades.map((a) => (
          <div key={a.id} className="flex items-center gap-3 bg-[#101114] border border-[#3a3d44] px-4 py-3">
            <span className="font-display font-black text-[#ff8c42] w-10 text-center shrink-0">
              {a.rank ? `#${a.rank}` : '—'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-zinc-100">{a.title}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {a.scope === 'real_world' ? 'Real World' : 'In Game'}
                {a.region ? ` · ${a.region}` : ''}
                {a.year ? ` · ${a.year}` : ''}
                {a.source ? ` · src: ${a.source}` : ''}
              </div>
            </div>
            <button
              type="button"
              onClick={() => deleteAccolade(a.id)}
              className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 border border-transparent hover:border-red-500/30"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addAccolade} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
        <div>
          <label className={labelClass}>Rank</label>
          <input
            type="number"
            min={1}
            value={form.rank}
            onChange={(e) => setForm((f) => ({ ...f, rank: e.target.value }))}
            placeholder="—"
            className={inputClass}
          />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Title *</label>
          <input
            required
            maxLength={200}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="War Dog Champion"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Scope</label>
          <select
            value={form.scope}
            onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}
            className={inputClass}
          >
            <option value="real_world">Real World</option>
            <option value="in_game">In Game</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Region</label>
          <input
            value={form.region}
            onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
            placeholder="US"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input
            type="number"
            min={1990}
            max={2100}
            value={form.year}
            onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
            placeholder="2022"
            className={inputClass}
          />
        </div>
        <div className="col-span-2 md:col-span-4">
          <label className={labelClass}>Source</label>
          <input
            value={form.source}
            onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
            placeholder="URL, VerseTracker…"
            className={inputClass}
          />
        </div>
        <div className="col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 bg-transparent border-2 border-[#ff8c42] text-[#ff8c42] hover:bg-[#ff8c42] hover:text-black font-display font-black uppercase tracking-wider text-sm transition disabled:opacity-40"
          >
            {busy ? 'ADDING…' : '+ ADD ACCOLADE'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 px-4 py-3 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm font-bold">
          {error}
        </div>
      )}
    </section>
  );
}

// ── Claim codes ──────────────────────────────────────────────────────────────

function ClaimCodePanel({
  battlerId,
  stageName,
  claimed,
  initialCodes,
}: {
  battlerId: string;
  stageName: string;
  claimed: boolean;
  initialCodes: ClaimCode[];
}) {
  const [codes, setCodes] = useState<ClaimCode[]>(initialCodes);
  const [freshCode, setFreshCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/admin/claim-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battler_id: battlerId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to generate code');
        return;
      }
      setFreshCode(data.claim_code.code);
      setCopied(false);
      setCodes((c) => [data.claim_code, ...c]);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!freshCode) return;
    try {
      await navigator.clipboard.writeText(freshCode);
      setCopied(true);
    } catch {
      // clipboard unavailable; the code is visible to select manually
    }
  };

  return (
    <section className="bg-[#18191c] border-2 border-[#3a3d44] p-6">
      <h2 className={`${sectionTitle} mb-1`}>CLAIM CODES</h2>
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-5">
        One-time codes that let {stageName} verify and take over this profile
      </p>

      {claimed ? (
        <div className="px-4 py-3 bg-[#ff8c42]/10 border-2 border-[#ff8c42]/40 text-[#ff8c42] text-sm font-bold uppercase tracking-wide mb-5">
          This profile has been claimed — no new codes can be issued.
        </div>
      ) : (
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="px-6 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition disabled:opacity-40 mb-5"
        >
          {busy ? 'GENERATING…' : '⚡ GENERATE CLAIM CODE'}
        </button>
      )}

      {freshCode && (
        <div className="border-2 border-[#ff8c42] bg-[#101114] p-5 mb-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
            New claim code — send this to the battler
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-mono text-2xl font-bold text-[#ff8c42] tracking-widest">{freshCode}</span>
            <button
              type="button"
              onClick={copy}
              className="px-4 py-2 border-2 border-[#3a3d44] hover:border-[#ff8c42] text-zinc-200 font-mono text-xs uppercase tracking-widest transition"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            They redeem it at <span className="text-zinc-300 font-mono">/claim</span> after creating an account.
          </p>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm font-bold mb-5">
          {error}
        </div>
      )}

      {codes.length > 0 && (
        <div className="space-y-2">
          {codes.map((c) => (
            <div key={c.id} className="flex items-center gap-3 bg-[#101114] border border-[#3a3d44] px-4 py-3">
              <span className="font-mono text-sm text-zinc-300 tracking-widest">{c.code}</span>
              <span
                className={`ml-auto px-2 py-1 border font-mono text-[10px] uppercase tracking-widest ${
                  c.claimed_by
                    ? 'bg-green-500/15 text-green-400 border-green-500/30'
                    : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                }`}
              >
                {c.claimed_by
                  ? `Claimed ${c.claimed_at ? new Date(c.claimed_at).toLocaleDateString() : ''}`
                  : 'Unclaimed'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Danger zone ──────────────────────────────────────────────────────────────

function DangerZone({
  battlerId,
  stageName,
  claimed,
}: {
  battlerId: string;
  stageName: string;
  claimed: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/real-battlers/${battlerId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to delete');
        return;
      }
      router.push('/admin/real-battlers');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border-2 border-red-500/30 bg-red-500/5 p-6">
      <h2 className="font-display font-black uppercase tracking-tighter text-xl text-red-400 mb-1">
        DANGER ZONE
      </h2>
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-4">
        Removes {stageName}, their attributes, accolades, and claim codes
      </p>
      {claimed ? (
        <p className="text-sm text-zinc-400">Claimed profiles cannot be deleted.</p>
      ) : confirming ? (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="px-6 py-2.5 bg-red-500 hover:bg-red-400 text-black font-display font-black uppercase tracking-wider text-sm transition disabled:opacity-40"
          >
            {busy ? 'DELETING…' : 'YES, DELETE PERMANENTLY'}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="px-6 py-2.5 border-2 border-[#3a3d44] text-zinc-300 font-display font-black uppercase tracking-wider text-sm transition hover:border-zinc-500"
          >
            CANCEL
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="px-6 py-2.5 border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 font-display font-black uppercase tracking-wider text-sm transition"
        >
          DELETE REAL BATTLER
        </button>
      )}
      {error && (
        <div className="mt-4 px-4 py-3 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm font-bold">
          {error}
        </div>
      )}
    </section>
  );
}
