'use client';

import { useState } from 'react';
import { BATTLER_TEMPLATES, BattlerTemplate } from '@/lib/game/battlerTemplates';
import Icon, { type IconName } from '@/components/ui/Icon';

type Props = {
  onSelect: (template: BattlerTemplate) => void;
  onBack: () => void;
};

// Archetype identity in the house icon language (template.icon is legacy emoji)
const TEMPLATE_ICONS: Record<string, IconName> = {
  lyrical_assassin: 'pen',
  performance_beast: 'mic',
  versatile_warrior: 'bolt',
  aggressive_puncher: 'flame',
  comedy_specialist: 'heart',
  storytelling_master: 'book',
  custom: 'target',
};

/** The three numbers that define an archetype at a glance. */
function headline(template: BattlerTemplate): { label: string; value: number }[] {
  if (!template.attributes) return [];
  const a = template.attributes;
  const all: { label: string; value: number }[] = [
    { label: 'LYRICISM', value: a.lyricism },
    { label: 'WORDPLAY', value: a.wordplay },
    { label: 'CREATIVITY', value: a.creativity },
    { label: 'FLOW', value: a.flow },
    { label: 'STAGE', value: a.stage_presence },
    { label: 'CROWD', value: a.crowd_control },
    { label: 'DELIVERY', value: a.delivery },
    { label: 'RESILIENCE', value: a.resilience },
  ];
  return all.sort((x, y) => y.value - x.value).slice(0, 3);
}

export default function TemplateSelector({ onSelect, onBack }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = Object.values(BATTLER_TEMPLATES);
  const selected = selectedTemplate ? BATTLER_TEMPLATES[selectedTemplate] : null;

  const handleContinue = () => {
    if (selected) onSelect(selected);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-black uppercase tracking-tight">CHOOSE YOUR STYLE</h2>
        <p className="text-sm text-zinc-500 mt-1 uppercase tracking-wide">
          Every archetype can win — pick the one that sounds like you
        </p>
      </div>

      {/* Compact archetype grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const tops = headline(template);
          return (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-4 border-2 text-left transition-all ${
                isSelected
                  ? 'border-[#ff8c42] bg-[#ff8c42]/10 shadow-[0_0_18px_-6px_rgba(255,140,66,0.6)]'
                  : 'border-[#3a3d44] bg-[#101114] hover:border-zinc-500'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={isSelected ? 'text-[#ff8c42]' : 'text-zinc-500'}>
                  <Icon name={TEMPLATE_ICONS[template.id] || 'star'} size={22} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display font-black uppercase tracking-tight text-sm text-zinc-100 truncate">
                    {template.name}
                  </h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider truncate">
                    {template.tagline}
                  </p>
                </div>
              </div>

              {tops.length > 0 ? (
                <div className="flex gap-3 mt-3">
                  {tops.map((t) => (
                    <div key={t.label} className="flex-1 min-w-0">
                      <div className="text-lg font-display font-black text-[#ff8c42] leading-none">
                        {t.value}
                      </div>
                      <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider truncate">
                        {t.label}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-3">
                  Allocate every point yourself
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail panel for the selected archetype */}
      {selected && (
        <div className="bg-[#101114] border-2 border-[#ff8c42]/50 p-6 animate-fade-in-up">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-display font-black uppercase tracking-tight text-[#ff8c42]">
                {selected.name}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mt-1 max-w-2xl">{selected.description}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Full spread */}
            {selected.attributes && (
              <div>
                <p className="text-[10px] font-display font-black uppercase tracking-wider text-zinc-500 mb-2">
                  THE SPREAD
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {[
                    ['Lyricism', selected.attributes.lyricism],
                    ['Wordplay', selected.attributes.wordplay],
                    ['Creativity', selected.attributes.creativity],
                    ['Flow', selected.attributes.flow],
                    ['Stage', selected.attributes.stage_presence],
                    ['Crowd', selected.attributes.crowd_control],
                    ['Delivery', selected.attributes.delivery],
                    ['Resilience', selected.attributes.resilience],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex items-center justify-between gap-2">
                      <span className="text-zinc-600">{label}</span>
                      <span className="font-bold text-zinc-200 tabular-nums">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] font-display font-black uppercase tracking-wider text-green-500 mb-2">
                STRENGTHS
              </p>
              <ul className="space-y-1">
                {selected.pros.map((pro, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                    <span className="text-green-500 font-bold">+</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-display font-black uppercase tracking-wider text-red-500 mb-2">
                WEAKNESSES
              </p>
              <ul className="space-y-1">
                {selected.cons.map((con, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                    <span className="text-red-500 font-bold">−</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* League + style chips */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t-2 border-[#3a3d44]">
            {selected.suggestedLeague && (
              <span className="px-2 py-1 bg-[#18191c] border-2 border-[#3a3d44] text-zinc-400 text-xs font-display font-black uppercase tracking-wide">
                HOME LEAGUE · {selected.suggestedLeague}
              </span>
            )}
            {selected.suggestedStyles.map((style) => (
              <span
                key={style}
                className="px-2 py-1 bg-[#ff8c42]/15 border-2 border-[#ff8c42]/40 text-[#ff8c42] text-xs font-display font-black uppercase tracking-wide"
              >
                {style}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-4 border-2 border-[#3a3d44] text-zinc-400 font-display font-black uppercase tracking-wider hover:bg-zinc-800 transition"
        >
          BACK
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedTemplate}
          className="flex-1 py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
