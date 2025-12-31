"use client"

import { motion } from "framer-motion"

// Original interface
interface CrowdReactionWindowPropsOriginal {
  reactionLevel: number // 0-100
  reactionType: "quiet" | "interested" | "hyped" | "going_crazy" | "legendary"
  momentType?: "haymaker" | "choke" | "rebuttal" | "freestyle" | null
  showAnimation?: boolean
}

// Alternative interface (used by round results page)
interface CrowdReactionWindowPropsAlt {
  playerMomentum: number // 0-100
  crowdEnergy: number // 0-100
  viralMoment?: boolean
}

type CrowdReactionWindowProps = CrowdReactionWindowPropsOriginal | CrowdReactionWindowPropsAlt

function isAltProps(props: CrowdReactionWindowProps): props is CrowdReactionWindowPropsAlt {
  return 'playerMomentum' in props
}

function getReactionTypeFromLevel(level: number): "quiet" | "interested" | "hyped" | "going_crazy" | "legendary" {
  if (level < 25) return "quiet"
  if (level < 50) return "interested"
  if (level < 75) return "hyped"
  if (level < 90) return "going_crazy"
  return "legendary"
}

const reactionConfig = {
  quiet: {
    label: "Crowd is silent...",
    bgColor: "bg-zinc-800",
    textColor: "text-zinc-500",
    barColor: "bg-zinc-600",
  },
  interested: {
    label: "Crowd is paying attention",
    bgColor: "bg-zinc-700",
    textColor: "text-zinc-300",
    barColor: "bg-zinc-500",
  },
  hyped: {
    label: "Crowd is feeling it!",
    bgColor: "bg-orange-900/30",
    textColor: "text-orange-400",
    barColor: "bg-orange-500",
  },
  going_crazy: {
    label: "CROWD GOING CRAZY!",
    bgColor: "bg-orange-500/30",
    textColor: "text-orange-300",
    barColor: "bg-orange-400",
    pulse: true,
  },
  legendary: {
    label: "LEGENDARY MOMENT!",
    bgColor: "bg-yellow-500/30",
    textColor: "text-yellow-300",
    barColor: "bg-yellow-400",
    glow: true,
  },
}

const momentLabels = {
  haymaker: '"THAT WAS CRAZY!"',
  choke: '"He choked..."',
  rebuttal: '"THE REBUTTAL!"',
  freestyle: '"OFF THE TOP!"',
}

export function CrowdReactionWindow(props: CrowdReactionWindowProps) {
  // Handle both prop formats
  let reactionLevel: number
  let reactionType: "quiet" | "interested" | "hyped" | "going_crazy" | "legendary"
  let momentType: "haymaker" | "choke" | "rebuttal" | "freestyle" | null = null
  let showAnimation = true

  if (isAltProps(props)) {
    // Convert alt props to original format
    reactionLevel = props.crowdEnergy
    reactionType = getReactionTypeFromLevel(props.crowdEnergy)
    if (props.viralMoment) {
      momentType = "haymaker"
    }
  } else {
    reactionLevel = props.reactionLevel
    reactionType = props.reactionType
    momentType = props.momentType ?? null
    showAnimation = props.showAnimation ?? true
  }

  const config = reactionConfig[reactionType]

  return (
    <div
      className={`${config.bgColor} border-2 border-[#3a3d44] rounded-lg overflow-hidden ${config.glow ? "shadow-lg shadow-yellow-500/20" : ""}`}
    >
      <div className="bg-zinc-800 px-4 py-3 border-b border-zinc-700">
        <h3 className="font-display font-bold text-zinc-100 text-sm tracking-wide text-center">CROWD REACTION</h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Main reaction label */}
        <motion.div
          className="text-center"
          animate={config.pulse ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.5, repeat: config.pulse ? Number.POSITIVE_INFINITY : 0 }}
        >
          <span className={`font-display font-bold text-2xl tracking-wide ${config.textColor}`}>{config.label}</span>
        </motion.div>

        {/* Reaction meter */}
        <div className="space-y-2">
          <div className="h-4 bg-zinc-900 rounded overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${reactionLevel}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full ${config.barColor} ${showAnimation && config.pulse ? "animate-pulse" : ""}`}
            />
          </div>
          <div className="text-center">
            <span className={`font-mono text-lg ${config.textColor}`}>[{reactionLevel}/100]</span>
          </div>
        </div>

        {/* Moment quote */}
        {momentType && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-2">
            <span className={`font-display italic text-lg ${config.textColor}`}>{momentLabels[momentType]}</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
