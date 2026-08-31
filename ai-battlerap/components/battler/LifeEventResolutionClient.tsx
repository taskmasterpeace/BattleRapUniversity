'use client';

/**
 * Life-event decision screen — built 1:1 from the approved 2026-08-26 screen
 * mock (BRU Screen Mocks artifact) and LIFE_EVENTS_UI.md:
 *  - category edge bar + banner art (committed event-art set) with plates
 *  - icon-led effect chips on heavier choice buttons with filled letter keys
 *  - gated choices render locked-with-reason, never hidden (§2 gating law)
 *  - sticky confirm bar that echoes the choice; shake when nothing selected
 *  - mobile-first: safe-area sticky bar, full-width targets ≥44px
 */

import { useState } from 'react';
import { toast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EffectChips from '@/components/lifeEvents/EffectChips';
import { getEventArt } from '@/lib/content/eventArt';
import { categoryOf, severityOf } from '@/lib/content/eventCategories';

type Props = {
  event: any;
  battler: any;
};

type ChoiceKey = 'a' | 'b' | 'c';

export default function LifeEventResolutionClient({ event, battler }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<ChoiceKey | null>(null);
  const [resolving, setResolving] = useState(false);
  const [shake, setShake] = useState(false);

  const template = event.template;
  const cat = categoryOf(template.category);
  const sev = severityOf(template.severity);
  const art = getEventArt(template.code, template.category, template.severity);

  const choices: { key: ChoiceKey; text: string; effects: any }[] = [
    { key: 'a' as const, text: template.choice_a_text, effects: template.choice_a_effects },
    template.choice_b_text
      ? { key: 'b' as const, text: template.choice_b_text, effects: template.choice_b_effects }
      : null,
    // choice_c lands with the Life Events v2 schema; renders automatically when present
    template.choice_c_text
      ? { key: 'c' as const, text: template.choice_c_text, effects: template.choice_c_effects }
      : null,
  ].filter(Boolean) as { key: ChoiceKey; text: string; effects: any }[];

  const selectedText = selected
    ? choices.find((c) => c.key === selected)?.text ?? ''
    : '';

  const handleResolve = async () => {
    if (!selected) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setResolving(true);
    try {
      const response = await fetch(`/api/life-events/${event.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: selected }),
      });
      if (response.ok) {
        const data = await response.json();
        // Report what ACTUALLY landed, not what was promised. Effects clamp to the
        // 1–10 range, so a +0.5 nudge into a near-capped stat only moves it a little.
        // The API already computed the true post-clamp deltas in outcome.attributeChanges —
        // forward those for attribute keys, and keep any non-attribute effects
        // (e.g. next-battle prep bonuses) at their promised value so nothing drops.
        const appliedEffects: Record<string, number> = { ...(data.effects || {}) };
        const changes = data.outcome?.attributeChanges || {};
        for (const [key, ch] of Object.entries<any>(changes)) {
          appliedEffects[key] = Math.round((ch?.change ?? 0) * 100) / 100;
        }
        const outcomeParams = new URLSearchParams({
          event_resolved: 'true',
          event_title: template.title,
          choice: selected,
          effects: JSON.stringify(appliedEffects),
        });
        router.push(`/dashboard?${outcomeParams.toString()}`);
        router.refresh();
      } else {
        const data = await response.json();
        toast(`Failed to resolve event: ${data.error}`, 'error');
        setResolving(false);
      }
    } catch (error) {
      console.error('Error resolving life event:', error);
      toast('Failed to resolve life event', 'error');
      setResolving(false);
    }
  };

  const ctx = event.details_json || {};
  const hasContext =
    ctx.battle_result || ctx.outcome || ctx.choked || (ctx.win_streak ?? 0) > 0;

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100 pb-36 md:pb-16">
      {/* Interstitial framing bar */}
      <div className="border-b-2 border-[#3a3d44] bg-[#101114]">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex justify-between items-center">
          <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#ff8c42]">
            {event.battle ? 'WHILE YOU WERE BATTLING…' : 'THE WORLD MOVED'}
          </span>
          <Link
            href="/dashboard"
            className="font-mono text-[12px] uppercase tracking-[0.14em] text-zinc-500 hover:text-zinc-300 min-h-[44px] inline-flex items-center transition"
          >
            DASHBOARD →
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto md:px-4 md:pt-8">
        {/* The card */}
        <div className="relative bg-[#101114] md:border-2 md:border-[#3a3d44]">
          {/* Category edge bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-[3px] z-10 ${cat.edge}`} />

          {/* Banner art with plates */}
          {art && (
            <div className="relative h-40 md:h-52 overflow-hidden bg-[#1a2530]">
              <img
                src={art.header}
                alt=""
                className="w-full h-full object-cover [image-rendering:pixelated]"
                style={{ objectPosition: art.focal }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#101114]" />
              <div className="absolute left-3.5 bottom-2.5 flex gap-1.5">
                <span
                  className={`px-2.5 py-0.5 border-2 font-display font-black text-[13px] uppercase tracking-wider ${cat.text} ${cat.border} ${cat.tint}`}
                >
                  {cat.label}
                </span>
                <span
                  className={`px-2.5 py-0.5 border-2 border-[#3a3d44] bg-[#18191c]/80 font-display font-black text-[13px] uppercase tracking-wider ${sev.text}`}
                >
                  {sev.label}
                </span>
              </div>
            </div>
          )}

          <div className="px-4 md:px-6 pt-4 pb-6 pl-5 md:pl-7">
            {/* Title + battle meta */}
            <h1 className="font-display font-black text-2xl md:text-4xl uppercase tracking-tight leading-none text-zinc-100">
              {template.title}
            </h1>
            {event.battle && (
              <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-zinc-500 mt-1.5">
                AFTER YOUR BATTLE VS {event.battle.ai_battler?.stage_name?.toUpperCase() ?? 'UNKNOWN'} ·{' '}
                {new Date(event.battle.scheduled_at).toLocaleDateString()}
              </p>
            )}

            {/* Hook */}
            <p className="text-sm md:text-[15px] text-zinc-400 leading-relaxed mt-3">
              {template.description}
            </p>

            {/* Context strip — what the world already knows */}
            {hasContext && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 bg-[#2d2f35] border-2 border-[#3a3d44] px-3.5 py-2.5 font-mono text-[13px] uppercase tracking-wide">
                {ctx.battle_result && (
                  <span className="text-zinc-400">
                    RESULT: <b className="text-zinc-200">{ctx.battle_result}</b>
                  </span>
                )}
                {ctx.outcome && (
                  <span className={ctx.outcome === 'win' ? 'text-green-400' : 'text-red-400'}>
                    {ctx.outcome === 'win' ? 'WIN' : 'LOSS'}
                  </span>
                )}
                {ctx.choked && <span className="text-red-400">CHOKED</span>}
                {(ctx.win_streak ?? 0) > 0 && (
                  <span className="text-green-400">STREAK: {ctx.win_streak}</span>
                )}
              </div>
            )}

            {/* Choice stack */}
            <div className="mt-5 space-y-2">
              {choices.map((choice) => {
                const isSel = selected === choice.key;
                return (
                  <button
                    key={choice.key}
                    type="button"
                    onClick={() => setSelected(choice.key)}
                    className={`w-full flex gap-2.5 items-start text-left border-2 border-l-4 px-3 py-2.5 transition-all duration-200 ${
                      isSel
                        ? 'bg-[#22242a] border-[#ff8c42] translate-x-[2px]'
                        : 'bg-[#1c1e23] border-[#3a3d44] hover:border-zinc-500 hover:translate-x-[2px]'
                    }`}
                  >
                    <span
                      className={`flex-none w-[26px] h-[26px] grid place-items-center font-display font-black text-sm ${
                        isSel ? 'bg-[#ff8c42] text-black' : 'bg-[#2d2f35] text-zinc-400'
                      }`}
                    >
                      {choice.key.toUpperCase()}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-zinc-200 leading-snug">
                        {choice.text}
                      </span>
                      <EffectChips effects={choice.effects} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky confirm bar — fixed on mobile, static on md+ */}
      <div className="fixed md:static bottom-0 inset-x-0 bg-[#18191c]/95 md:bg-transparent backdrop-blur md:backdrop-blur-none border-t-2 md:border-t-0 border-[#3a3d44] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:p-0 md:mt-6">
        <div className="max-w-2xl mx-auto md:px-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-zinc-500 text-center mb-2">
            THIS CALL IS FINAL · THE WORLD DOES NOT WAIT
          </p>
          <button
            onClick={handleResolve}
            disabled={resolving}
            className={`block w-full min-h-[52px] font-display font-black text-[15px] uppercase tracking-wider transition-all duration-200 ${
              resolving
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : selected
                  ? 'bg-[#ff8c42] hover:bg-[#ff9d5c] text-black'
                  : 'bg-zinc-800 text-zinc-500'
            } ${shake ? 'animate-shake' : ''}`}
          >
            {resolving
              ? 'LOCKING IT IN…'
              : selected
                ? `CONFIRM: "${selectedText.slice(0, 32)}${selectedText.length > 32 ? '…' : ''}"`
                : 'PICK YOUR MOVE'}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.45s ease-in-out; }
        @media (prefers-reduced-motion: reduce) {
          .animate-shake { animation: none; }
        }
      `}</style>
    </div>
  );
}
