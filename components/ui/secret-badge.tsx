"use client"

import Image from "next/image"

export type SecretType =
  | 'snitch'
  | 'substance-abuse'
  | 'crew-beef'
  | 'addiction'
  | 'no-show'
  | 'broke'
  | 'shady-deal'
  | 'mental-health'
  | 'ghostwriter'
  // New types based on research
  | 'fake-gangster'    // Lying about street cred (Rick Ross, 6ix9ine style)
  | 'stolen-bars'      // Plagiarism (Prez Mafia scandal)
  | 'baby-mama-drama'  // Child support, cheating, multiple kids
  | 'pressed'          // Got beat up / punked and didn't do anything
  | 'charges-filed'    // Pressed charges after street beef (ultimate violation)

interface SecretInfo {
  label: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  bgColor: string
  borderColor: string
}

const SECRET_DATA: Record<SecretType, SecretInfo> = {
  'snitch': {
    label: 'Snitch',
    description: 'Known to give up information on others',
    severity: 'critical',
    bgColor: 'bg-red-900',
    borderColor: 'border-red-500',
  },
  'substance-abuse': {
    label: 'Substance Issues',
    description: 'Struggles with drugs or alcohol',
    severity: 'high',
    bgColor: 'bg-purple-900',
    borderColor: 'border-purple-500',
  },
  'crew-beef': {
    label: 'Crew Beef',
    description: 'Has internal conflict with their crew',
    severity: 'medium',
    bgColor: 'bg-orange-900',
    borderColor: 'border-orange-500',
  },
  'addiction': {
    label: 'Addiction',
    description: 'Battling addiction demons',
    severity: 'high',
    bgColor: 'bg-amber-900',
    borderColor: 'border-amber-500',
  },
  'no-show': {
    label: 'No Show',
    description: 'Has a history of missing scheduled battles',
    severity: 'medium',
    bgColor: 'bg-zinc-800',
    borderColor: 'border-zinc-500',
  },
  'broke': {
    label: 'Broke',
    description: 'Serious financial problems',
    severity: 'low',
    bgColor: 'bg-green-900',
    borderColor: 'border-green-600',
  },
  'shady-deal': {
    label: 'Shady Dealings',
    description: 'Involved in questionable business',
    severity: 'medium',
    bgColor: 'bg-slate-800',
    borderColor: 'border-slate-500',
  },
  'mental-health': {
    label: 'Mental Health',
    description: 'Dealing with mental health struggles',
    severity: 'high',
    bgColor: 'bg-blue-900',
    borderColor: 'border-blue-500',
  },
  'ghostwriter': {
    label: 'Ghostwriter',
    description: 'Doesn\'t write their own material',
    severity: 'critical',
    bgColor: 'bg-violet-900',
    borderColor: 'border-violet-500',
  },
  // New types from research
  'fake-gangster': {
    label: 'Fake Gangster',
    description: 'Lying about street cred, not really about that life',
    severity: 'critical',
    bgColor: 'bg-rose-900',
    borderColor: 'border-rose-500',
  },
  'stolen-bars': {
    label: 'Stolen Bars',
    description: 'Caught using someone else\'s material',
    severity: 'critical',
    bgColor: 'bg-fuchsia-900',
    borderColor: 'border-fuchsia-500',
  },
  'baby-mama-drama': {
    label: 'Baby Mama Drama',
    description: 'Child support issues, cheating, family chaos',
    severity: 'medium',
    bgColor: 'bg-pink-900',
    borderColor: 'border-pink-500',
  },
  'pressed': {
    label: 'Got Pressed',
    description: 'Got beat up or punked and didn\'t retaliate',
    severity: 'high',
    bgColor: 'bg-stone-800',
    borderColor: 'border-stone-500',
  },
  'charges-filed': {
    label: 'Filed Charges',
    description: 'Pressed charges after street beef - ultimate violation',
    severity: 'critical',
    bgColor: 'bg-red-950',
    borderColor: 'border-red-600',
  },
}

interface SecretBadgeProps {
  type: SecretType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showTooltip?: boolean
  className?: string
}

export function SecretBadge({
  type,
  size = 'md',
  showLabel = false,
  showTooltip = true,
  className = ''
}: SecretBadgeProps) {
  const info = SECRET_DATA[type]

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }

  const imageSizes = {
    sm: 24,
    md: 32,
    lg: 48,
  }

  return (
    <div className={`group relative inline-flex flex-col items-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          ${info.bgColor}
          border-2 ${info.borderColor}
          rounded-lg
          flex items-center justify-center
          overflow-hidden
          shadow-lg
          transition-transform hover:scale-110
          cursor-pointer
        `}
      >
        <Image
          src={`/sprites/secrets/${type}.png`}
          alt={info.label}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {showLabel && (
        <span className="mt-1 text-[10px] font-bold uppercase text-zinc-400 text-center leading-tight">
          {info.label}
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none
          z-50
        ">
          <div className={`
            px-3 py-2
            ${info.bgColor}
            border ${info.borderColor}
            rounded-lg
            shadow-xl
            min-w-[140px]
            text-center
          `}>
            <div className="text-xs font-bold text-white uppercase tracking-wide">
              {info.label}
            </div>
            <div className="text-[10px] text-zinc-300 mt-1">
              {info.description}
            </div>
            <div className={`
              text-[9px] font-bold uppercase mt-1
              ${info.severity === 'critical' ? 'text-red-400' : ''}
              ${info.severity === 'high' ? 'text-orange-400' : ''}
              ${info.severity === 'medium' ? 'text-yellow-400' : ''}
              ${info.severity === 'low' ? 'text-green-400' : ''}
            `}>
              {info.severity} severity
            </div>
          </div>
          {/* Arrow */}
          <div className={`
            absolute top-full left-1/2 -translate-x-1/2
            border-8 border-transparent
            ${info.borderColor.replace('border-', 'border-t-')}
          `} />
        </div>
      )}
    </div>
  )
}

// Display all secrets in a row
interface SecretBadgeRowProps {
  secrets: SecretType[]
  size?: 'sm' | 'md' | 'lg'
  maxVisible?: number
}

export function SecretBadgeRow({ secrets, size = 'sm', maxVisible = 3 }: SecretBadgeRowProps) {
  const visible = secrets.slice(0, maxVisible)
  const hidden = secrets.length - maxVisible

  return (
    <div className="flex items-center gap-1">
      {visible.map((secret) => (
        <SecretBadge key={secret} type={secret} size={size} />
      ))}
      {hidden > 0 && (
        <div className="w-6 h-6 bg-zinc-800 border border-zinc-600 rounded flex items-center justify-center">
          <span className="text-[10px] font-bold text-zinc-400">+{hidden}</span>
        </div>
      )}
    </div>
  )
}

// Export secret types list for reference
export const ALL_SECRET_TYPES: SecretType[] = [
  'snitch',
  'substance-abuse',
  'crew-beef',
  'addiction',
  'no-show',
  'broke',
  'shady-deal',
  'mental-health',
  'ghostwriter',
  'fake-gangster',
  'stolen-bars',
  'baby-mama-drama',
  'pressed',
  'charges-filed',
]

export { SECRET_DATA }
