'use client';

// "ADD REAL BATTLER" island on /admin/real-battlers — collapsible create form.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RealBattlerForm, {
  DEFAULT_FORM_VALUES,
  toApiPayload,
  type CityOption,
  type RealBattlerFormValues,
} from './RealBattlerForm';

export default function AddRealBattlerForm({ cities }: { cities: CityOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (values: RealBattlerFormValues): Promise<string | null> => {
    const res = await fetch('/api/admin/real-battlers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toApiPayload(values)),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data.error ?? 'Failed to create battler';
    router.push(`/admin/real-battlers/${data.battler.id}`);
    return null;
  };

  return (
    <div className="bg-[#18191c] border-2 border-[#3a3d44]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-display font-black uppercase tracking-tighter text-lg text-zinc-100">
          <span className="text-[#ff8c42]">+</span> ADD REAL BATTLER
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          {open ? 'Close' : 'Open'}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 border-t-2 border-[#3a3d44] pt-6">
          <RealBattlerForm
            cities={cities}
            initial={DEFAULT_FORM_VALUES}
            submitLabel="CREATE REAL BATTLER"
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}
