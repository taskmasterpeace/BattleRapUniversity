'use client';

// Two-corner battler picker with searchable lists, optional league ground,
// and a RUN THE SIM action that creates a shareable matchup.
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { portraitFillStyle } from '@/lib/sprite-crops';

type PickerBattler = {
  id: string;
  stage_name: string;
  avatar_url: string | null;
  tier: string | null;
  is_real: boolean;
  region: string | null;
};

type PickerLeague = {
  id: string;
  name: string;
  short_code: string;
  writing_weight: number;
  performance_weight: number;
};

function BattlerSlot({
  label,
  corner,
  selected,
  onClear,
}: {
  label: string;
  corner: 'a' | 'b';
  selected: PickerBattler | null;
  onClear: () => void;
}) {
  const accent = corner === 'a' ? 'border-[#ff8c42]' : 'border-blue-400';
  const text = corner === 'a' ? 'text-[#ff8c42]' : 'text-blue-400';
  return (
    <div className={`border-2 ${selected ? accent : 'border-dashed border-[#3a3d44]'} bg-[#101114] p-5 min-h-[180px] flex flex-col items-center justify-center relative`}>
      <p className={`absolute top-2 left-3 font-mono text-[12px] uppercase tracking-widest ${text}`}>{label}</p>
      {selected ? (
        <>
          <div
            className="relative w-24 h-24 mb-2 overflow-hidden"
            style={{
              background: 'linear-gradient(170deg, #1F2024 0%, #101114 78%)',
              borderTop: `3px solid ${corner === 'a' ? '#E23A2E' : '#2F7DD1'}`,
            }}
          >
            {selected.avatar_url ? (
              <img src={selected.avatar_url} alt={selected.stage_name} style={portraitFillStyle(selected.avatar_url, { targetH: 1.0 })} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-[#18191c] border border-[#3a3d44]">🎤</div>
            )}
          </div>
          <p className="font-display font-black uppercase tracking-tight text-lg text-zinc-100 text-center leading-tight">
            {selected.stage_name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {selected.is_real && (
              <span className="px-1.5 py-0.5 bg-[#ff8c42] text-black font-mono text-[10px] font-bold uppercase tracking-widest">✓ VERIFIED</span>
            )}
            <span className="font-mono text-[12px] uppercase tracking-widest text-zinc-500">{selected.tier} TIER</span>
          </div>
          <button onClick={onClear} className="mt-3 text-[12px] font-mono uppercase tracking-widest text-zinc-600 hover:text-red-400 transition">
            ✕ CHANGE
          </button>
        </>
      ) : (
        <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest text-center">
          SELECT FROM<br />THE LIST BELOW
        </p>
      )}
    </div>
  );
}

export default function MatchupPicker({
  battlers,
  leagues,
}: {
  battlers: PickerBattler[];
  leagues: PickerLeague[];
}) {
  const router = useRouter();
  const [a, setA] = useState<PickerBattler | null>(null);
  const [b, setB] = useState<PickerBattler | null>(null);
  const [leagueId, setLeagueId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return battlers.filter(
      (x) => x.id !== a?.id && x.id !== b?.id && (!q || x.stage_name.toLowerCase().includes(q))
    );
  }, [battlers, search, a, b]);

  const pick = (battler: PickerBattler) => {
    setError(null);
    if (!a) setA(battler);
    else if (!b) setB(battler);
  };

  const run = async () => {
    if (!a || !b) return;
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/matchup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battlerAId: a.id, battlerBId: b.id, leagueId: leagueId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Simulation failed — try again.');
        setRunning(false);
        return;
      }
      router.push(`/matchup/${data.slug}`);
    } catch {
      setError('Simulation failed — try again.');
      setRunning(false);
    }
  };

  return (
    <div>
      {/* corners */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6 mb-6">
        <BattlerSlot label="A CORNER" corner="a" selected={a} onClear={() => setA(null)} />
        <div className="font-bebas text-5xl md:text-6xl text-[#ff8c42] drop-shadow-[0_0_20px_rgba(255,140,66,0.5)]">VS</div>
        <BattlerSlot label="B CORNER" corner="b" selected={b} onClear={() => setB(null)} />
      </div>

      {/* ground + run */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <select
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
          className="flex-1 bg-[#101114] border-2 border-[#3a3d44] text-zinc-300 px-4 py-3 font-bold uppercase tracking-wide text-sm focus:border-[#ff8c42] focus:outline-none"
        >
          <option value="">⚖️ NEUTRAL GROUND (50/50 JUDGING)</option>
          {leagues.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} — {Math.round(l.writing_weight * 100)}% PEN / {Math.round(l.performance_weight * 100)}% PERFORMANCE
            </option>
          ))}
        </select>
        <button
          onClick={run}
          disabled={!a || !b || running}
          className="px-10 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider text-lg transition disabled:opacity-30 disabled:cursor-not-allowed animate-pulse-orange"
        >
          {running ? '🔥 RUNNING IT…' : '🎤 RUN THE SIM'}
        </button>
      </div>
      {error && (
        <p className="mb-6 text-center text-red-400 font-bold text-sm uppercase tracking-wide">{error}</p>
      )}

      {/* roster */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="SEARCH BATTLERS…"
        className="w-full bg-[#101114] border-2 border-[#3a3d44] text-zinc-100 placeholder-zinc-600 px-4 py-3 uppercase tracking-wide font-bold text-sm focus:border-[#ff8c42] focus:outline-none mb-4"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[420px] overflow-y-auto pr-1">
        {filtered.map((x) => (
          <button
            key={x.id}
            onClick={() => pick(x)}
            disabled={!!(a && b)}
            className="group bg-[#101114] border-2 border-[#3a3d44] hover:border-[#ff8c42] p-3 text-left transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              <div
                className="relative w-10 h-10 flex-shrink-0 overflow-hidden"
                style={{ background: '#17181C', borderRadius: 4 }}
              >
                {x.avatar_url ? (
                  <img src={x.avatar_url} alt="" style={portraitFillStyle(x.avatar_url, { targetH: 1.25 })} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#18191c] text-lg">🎤</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold uppercase tracking-tight text-xs text-zinc-200 group-hover:text-[#ff8c42] truncate transition-colors">
                  {x.stage_name}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-600">
                  {x.is_real ? <span className="text-[#ff8c42]">✓ VERIFIED</span> : `${x.tier ?? '—'} TIER`}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
