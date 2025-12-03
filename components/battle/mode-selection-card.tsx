"use client"

import { motion } from "framer-motion"
import { Swords, Zap, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModeSelectionCardProps {
  mode: "locked_in" | "auto"
  title: string
  description: string
  features: string[]
  duration: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}

export function ModeSelectionCard({
  mode,
  title,
  description,
  features,
  duration,
  selected,
  onClick,
  disabled,
}: ModeSelectionCardProps) {
  const Icon = mode === "locked_in" ? Swords : Zap

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative p-6 border-2 text-left transition-all duration-200",
        "bg-zinc-900 hover:bg-zinc-800/80",
        selected ? "border-orange-500 bg-orange-500/10" : "border-zinc-700 hover:border-zinc-600",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-black" />
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "w-16 h-16 flex items-center justify-center mb-4 border",
          selected ? "bg-orange-500/20 border-orange-500/50" : "bg-zinc-800 border-zinc-700",
        )}
      >
        <Icon className={cn("w-8 h-8", selected ? "text-orange-500" : "text-zinc-400")} />
      </div>

      {/* Title */}
      <h3 className="font-black text-xl uppercase tracking-tight text-white mb-2">{title}</h3>

      {/* Description */}
      <p className="text-zinc-400 text-sm mb-4">{description}</p>

      {/* Features */}
      <ul className="space-y-2 mb-4">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="w-1 h-1 bg-orange-500 rounded-full" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Duration */}
      <p className="text-xs text-zinc-500 uppercase tracking-wider">~{duration}</p>
    </motion.button>
  )
}
