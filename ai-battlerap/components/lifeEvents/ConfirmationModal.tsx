'use client';

type Props = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  eventTitle: string;
  choiceText: string;
  effects: any;
  severity?: 'minor' | 'moderate' | 'major' | 'critical';
};

const SEVERITY_CONFIG = {
  minor: {
    color: 'text-zinc-500',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    label: 'Minor Impact'
  },
  moderate: {
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    label: 'Moderate Impact'
  },
  major: {
    color: 'text-[#ff8c42]',
    bg: 'bg-[#ff8c42]/10',
    border: 'border-[#ff8c42]/30',
    label: 'Major Impact'
  },
  critical: {
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    label: 'Critical Impact'
  }
};

export default function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  eventTitle,
  choiceText,
  effects,
  severity = 'moderate'
}: Props) {
  if (!isOpen) return null;

  const severityConfig = SEVERITY_CONFIG[severity];

  const formatEffects = (effects: any): string[] => {
    if (!effects) return [];

    const formattedEffects: string[] = [];

    Object.entries(effects).forEach(([key, value]: [string, any]) => {
      if (typeof value !== 'number' || value === 0) return;

      const formattedKey = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      if (key === 'public_knowledge') {
        formattedEffects.push(`${value > 0 ? '+' : ''}${value}% ${formattedKey}`);
      } else {
        formattedEffects.push(`${value > 0 ? '+' : ''}${value} ${formattedKey}`);
      }
    });

    return formattedEffects;
  };

  const effectList = formatEffects(effects);
  const hasNegativeEffects = effectList.some(e => e.startsWith('-'));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-xl w-full bg-[#18191c] border-2 border-[#3a3d44] shadow-2xl animate-scale-in">
        {/* Header */}
        <div className={`${severityConfig.bg} border-b-2 ${severityConfig.border} p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-2xl ${severityConfig.color}`}>⚠</span>
            <h2 className="text-xl font-black uppercase tracking-tight text-zinc-100">
              Confirm Your Decision
            </h2>
          </div>
          <p className={`text-xs ${severityConfig.color} uppercase tracking-wider font-bold`}>
            {severityConfig.label} • Irreversible Action
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Event info */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Event</p>
            <p className="text-sm font-bold text-zinc-300">{eventTitle}</p>
          </div>

          {/* Choice info */}
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Your Choice</p>
            <p className="text-sm text-zinc-100">{choiceText}</p>
          </div>

          {/* Effects summary */}
          {effectList.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3 font-bold">
                Consequences
              </p>
              <div className="space-y-2">
                {effectList.map((effect, index) => {
                  const isPositive = effect.startsWith('+');
                  const isNegative = effect.startsWith('-');
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <span className={`text-sm ${
                        isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-zinc-400'
                      }`}>
                        {isPositive ? '▲' : isNegative ? '▼' : '•'}
                      </span>
                      <p className={`text-sm ${
                        isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-zinc-400'
                      }`}>
                        {effect}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Warning message */}
          {(severity === 'major' || severity === 'critical' || hasNegativeEffects) && (
            <div className={`${severityConfig.bg} border-2 ${severityConfig.border} p-4`}>
              <p className={`text-xs ${severityConfig.color} uppercase tracking-wide font-bold mb-2`}>
                {severity === 'critical' ? '⚠ CRITICAL WARNING' : '⚠ WARNING'}
              </p>
              <p className="text-sm text-zinc-400">
                {severity === 'critical'
                  ? 'This is a critical decision that will have major consequences for your career. This action cannot be undone.'
                  : hasNegativeEffects
                  ? 'This choice has negative consequences. Make sure you understand the trade-offs before proceeding.'
                  : 'This decision is permanent and cannot be reversed. Make sure this is what you want.'}
              </p>
            </div>
          )}

          {/* Confirmation question */}
          <div className="bg-[#2d2f35]/50 border-2 border-[#3a3d44] p-4 text-center">
            <p className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Are you sure you want to proceed?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t-2 border-[#3a3d44] flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-display font-black uppercase tracking-wider transition"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 font-display font-black uppercase tracking-wider transition ${
              severity === 'critical'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#ff8c42] hover:bg-[#ff9d5c] text-black'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
