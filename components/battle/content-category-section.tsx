"use client"

import type React from "react"

import { ChevronDown, ChevronUp, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CATEGORY_COLORS } from "@/lib/round-crafting"

interface ContentCategorySectionProps {
  category: "content" | "delivery" | "performance"
  title: string
  minSelections: number
  maxSelections: number
  currentSelections: number
  children: React.ReactNode
  expanded?: boolean
  onToggleExpand?: () => void
}

export function ContentCategorySection({
  category,
  title,
  minSelections,
  maxSelections,
  currentSelections,
  children,
  expanded = true,
  onToggleExpand,
}: ContentCategorySectionProps) {
  const colors = CATEGORY_COLORS[category]
  const isValid = currentSelections >= minSelections
  const isMaxed = currentSelections >= maxSelections

  return (
    <div className={cn("border", colors.border, "bg-zinc-900/50")}>
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className={cn(
          "w-full flex items-center justify-between p-4",
          colors.bg,
          "hover:bg-opacity-30 transition-colors",
        )}
      >
        <div className="flex items-center gap-3">
          <h3 className={cn("font-bold text-sm uppercase tracking-wider", colors.text)}>{title}</h3>
          <span className="text-xs text-zinc-500">
            (Select {minSelections}-{maxSelections})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Selection count */}
          <span className={cn("text-sm font-bold", isValid ? "text-green-500" : "text-orange-500")}>
            {currentSelections}/{maxSelections}
          </span>

          {/* Validation icon */}
          {isValid ? <Check className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-orange-500" />}

          {/* Expand toggle */}
          {onToggleExpand &&
            (expanded ? (
              <ChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            ))}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 pt-2">
          {children}

          {/* Validation message */}
          {!isValid && (
            <p className="text-red-500 text-xs mt-3">Select at least {minSelections - currentSelections} more</p>
          )}
          {isMaxed && <p className="text-zinc-500 text-xs mt-3">Maximum reached</p>}
        </div>
      )}
    </div>
  )
}
