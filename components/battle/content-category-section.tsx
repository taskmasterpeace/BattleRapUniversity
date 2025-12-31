"use client"

import type React from "react"

import { ChevronDown, ChevronUp, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Color schemes for each category
const COLORS = {
  content: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
    hover: "hover:border-purple-500/50",
  },
  delivery: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    hover: "hover:border-blue-500/50",
  },
  performance: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    hover: "hover:border-emerald-500/50",
  },
}

// Simple item interface for content types
interface ContentItem {
  id: string
  name: string
  description?: string
  icon?: string
}

interface ContentCategorySectionProps {
  title: string
  description?: string
  items: ContentItem[]
  selected: string | null
  onSelect: (id: string) => void
  required?: boolean
}

export function ContentCategorySection({
  title,
  description,
  items,
  selected,
  onSelect,
  required,
}: ContentCategorySectionProps) {
  // Determine category from title for styling
  const category = title.toLowerCase().includes("content")
    ? "content"
    : title.toLowerCase().includes("delivery")
      ? "delivery"
      : "performance"

  const colors = COLORS[category]
  const isValid = selected !== null

  return (
    <div className={cn("border rounded-lg", colors.border, "bg-zinc-900/50")}>
      {/* Header */}
      <div className={cn("p-4 border-b", colors.border)}>
        <h3 className={cn("font-bold text-sm uppercase tracking-wider", colors.text)}>{title}</h3>
        {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
        {required && !isValid && (
          <span className="text-xs text-orange-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Required
          </span>
        )}
      </div>

      {/* Content Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((item) => {
          const isSelected = selected === item.id
          return (
            <button key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "p-3 border rounded text-left transition-all",
                isSelected
                  ? cn(colors.border, colors.bg, "border-2")
                  : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
              )}
            >
              <div className="flex items-center gap-2">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span className={cn("text-sm font-medium", isSelected ? colors.text : "text-zinc-300")}>
                  {item.name}
                </span>
                {isSelected && <Check className="w-4 h-4 text-green-500 ml-auto" />}
              </div>
              {item.description && (
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.description}</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
