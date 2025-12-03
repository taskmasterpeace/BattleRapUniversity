"use client"

import { cn } from "@/lib/utils"
import {
  CONTENT_TYPE_INFO,
  DELIVERY_TYPE_INFO,
  PERFORMANCE_TYPE_INFO,
  CATEGORY_COLORS,
  type ContentType,
  type DeliveryType,
  type PerformanceType,
} from "@/lib/round-crafting"

interface ContentTypeBadgeProps {
  type: ContentType | DeliveryType | PerformanceType
  category: "content" | "delivery" | "performance"
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

export function ContentTypeBadge({ type, category, size = "md", showTooltip = false }: ContentTypeBadgeProps) {
  const colors = CATEGORY_COLORS[category]

  let info: { name: string; description: string } | undefined
  if (category === "content") {
    info = CONTENT_TYPE_INFO[type as ContentType]
  } else if (category === "delivery") {
    info = DELIVERY_TYPE_INFO[type as DeliveryType]
  } else {
    info = PERFORMANCE_TYPE_INFO[type as PerformanceType]
  }

  if (!info) return null

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center border font-bold uppercase tracking-tight",
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
      )}
      title={showTooltip ? info.description : undefined}
    >
      {info.name}
    </span>
  )
}
