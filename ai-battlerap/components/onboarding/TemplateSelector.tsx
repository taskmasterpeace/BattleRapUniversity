'use client';

import { useState } from 'react';
import { BATTLER_TEMPLATES, BattlerTemplate, calculateTemplatePoints } from '@/lib/game/battlerTemplates';

type Props = {
  onSelect: (template: BattlerTemplate) => void;
  onBack: () => void;
};

export default function TemplateSelector({ onSelect, onBack }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = Object.values(BATTLER_TEMPLATES);

  const handleContinue = () => {
    if (selectedTemplate) {
      const template = BATTLER_TEMPLATES[selectedTemplate];
      onSelect(template);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight">CHOOSE YOUR PATH</h2>
        <p className="text-sm text-zinc-500 mt-1 uppercase tracking-wide">
          SELECT A TEMPLATE OR BUILD FROM SCRATCH
        </p>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`p-6 border-2 cursor-pointer transition-all duration-200 ${
              selectedTemplate === template.id
                ? 'border-[#ff8c42] bg-[#ff8c42]/10'
                : 'border-[#3a3d44] hover:border-zinc-600'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="text-5xl flex-shrink-0">{template.icon}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                      {template.name}
                      {selectedTemplate === template.id && (
                        <span className="text-[#ff8c42] text-base">✓</span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                      {template.tagline}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  {template.description}
                </p>

                {/* Attributes Preview (only for non-custom) */}
                {template.attributes && (
                  <div className="mb-4">
                    <div className="flex flex-col gap-3 max-w-xs">
                      {/* Writing */}
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-zinc-500 mb-2">WRITING</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-600">Lyricism</span>
                            <span className="font-bold text-[#ff8c42]">{template.attributes.lyricism}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-600">Wordplay</span>
                            <span className="font-bold text-[#ff8c42]">{template.attributes.wordplay}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-600">Creativity</span>
                            <span className="font-bold text-[#ff8c42]">{template.attributes.creativity}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-600">Flow</span>
                            <span className="font-bold text-[#ff8c42]">{template.attributes.flow}</span>
                          </div>
                        </div>
                      </div>

                      {/* Performance */}
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-zinc-500 mb-2">PERFORMANCE</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-600">Stage</span>
                            <span className="font-bold text-[#ff8c42]">{template.attributes.stage_presence}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-600">Crowd</span>
                            <span className="font-bold text-[#ff8c42]">{template.attributes.crowd_control}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-600">Delivery</span>
                            <span className="font-bold text-[#ff8c42]">{template.attributes.delivery}</span>
                          </div>
                        </div>
                      </div>

                      {/* Personal */}
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-zinc-500 mb-2">PERSONAL</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-600">Finances</span>
                            <span className="font-bold text-[#ff8c42]">{template.personal.financial_stability}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-600">Reputation</span>
                            <span className="font-bold text-[#ff8c42]">{template.personal.reputation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-600">Family</span>
                            <span className="font-bold text-[#ff8c42]">{template.personal.family_bond}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mental */}
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-zinc-500 mb-2">MENTAL</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-600">Resilience</span>
                            <span className="font-bold text-[#ff8c42]">{template.attributes.resilience}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pros/Cons */}
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs font-black uppercase text-green-500 mb-2">STRENGTHS</p>
                    <ul className="space-y-1">
                      {template.pros.map((pro, i) => (
                        <li key={i} className="text-xs text-zinc-500 flex items-start gap-2">
                          <span className="text-green-500 font-bold">+</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-red-500 mb-2">WEAKNESSES</p>
                    <ul className="space-y-1">
                      {template.cons.map((con, i) => (
                        <li key={i} className="text-xs text-zinc-500 flex items-start gap-2">
                          <span className="text-red-500 font-bold">-</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggested League & Styles */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {template.suggestedLeague && (
                    <span className="px-2 py-1 bg-blue-500/20 border-2 border-blue-500/30 text-blue-400 font-display font-black uppercase tracking-wide">
                      {template.suggestedLeague}
                    </span>
                  )}
                  {template.suggestedStyles.map((style) => (
                    <span
                      key={style}
                      className="px-2 py-1 bg-[#ff8c42]/20 border-2 border-[#ff8c42]/30 text-orange-400 font-display font-black uppercase tracking-wide"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 border-2 border-[#3a3d44] text-zinc-400 font-black uppercase tracking-wider hover:bg-zinc-800 transition"
        >
          BACK
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedTemplate}
          className="flex-1 py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-black uppercase tracking-wider transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
