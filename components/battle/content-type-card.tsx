"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { CATEGORY_COLORS, EFFECTIVENESS_COLORS } from "@/lib/round-crafting"

interface ContentTypeCardProps {
  type: string
  name: string
  description: string
  category: "content" | "delivery" | "performance"
  selected: boolean
  disabled: boolean
  effectiveness?: "strong" | "neutral" | "weak"
  onClick: () => void
}

export function ContentTypeCard({
  type,
  name,
  description,
  category,
  selected,
  disabled,
  effectiveness = "neutral",
  onClick,
}: ContentTypeCardProps) {
  const categoryColors = CATEGORY_COLORS[category]
  const effectColors = EFFECTIVENESS_COLORS[effectiveness]

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative p-2 sm:p-3 border text-left transition-all duration-200",
        "bg-zinc-900 hover:bg-zinc-800/80",
        selected ? `border-orange-500 bg-orange-500/10` : `border-zinc-700 hover:border-zinc-600`,
        effectiveness === "strong" && !selected && "ring-1 ring-green-500/30",
        effectiveness === "weak" && !selected && "bg-red-500/5",
        disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      {/* Checkbox - Smaller on mobile */}
      <div className="flex items-start gap-1.5 sm:gap-2">
        <div
          className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 border flex items-center justify-center",
            selected ? "bg-orange-500 border-orange-500" : "bg-zinc-800 border-zinc-600",
          )}
        >
          {selected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black" />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name - Smaller text on mobile */}
          <h4 className="font-bold text-xs sm:text-sm uppercase tracking-tight text-white truncate">{name}</h4>

          {/* Description - Hidden on very small screens, truncated */}
          <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
            {description}
          </p>

          {/* Effectiveness badge */}
          {effectiveness !== "neutral" && (
            <span
              className={cn(
                "inline-block mt-1 sm:mt-2 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] uppercase tracking-wider font-bold",
                effectiveness === "strong" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400",
              )}
            >
              {effectiveness === "strong" ? "Strong" : "Weak"}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}
