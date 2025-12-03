"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

export interface BattlerPortraitData {
  stageName: string
  portrait?: {
    spriteUrl: string
    crop?: {
      scale?: number
      offsetX?: number
      offsetY?: number
    }
  }
  tier?: string
}

interface BattlerPortraitProps {
  battler: BattlerPortraitData
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  showBorder?: boolean
  showFrame?: boolean // add showFrame prop for when used inside parent container
  className?: string
}

const sizeMap = {
  xs: { container: "w-8 h-8", image: 48 }, // increased image sizes to show full portrait
  sm: { container: "w-10 h-10 sm:w-12 sm:h-12", image: 64 },
  md: { container: "w-16 h-16", image: 96 },
  lg: { container: "w-20 h-20 sm:w-24 sm:h-24", image: 128 },
  xl: { container: "w-28 h-28 sm:w-32 sm:h-32", image: 160 },
}

const tierBorderColors: Record<string, string> = {
  "TOP TIER": "border-yellow-500",
  TOP: "border-yellow-500",
  "MID TIER": "border-orange-500",
  MID: "border-orange-500",
  "LOW TIER": "border-zinc-500",
  LOW: "border-zinc-500",
  PROSPECT: "border-zinc-600",
}

const tierBgColors: Record<string, string> = {
  "TOP TIER": "bg-yellow-900/20",
  TOP: "bg-yellow-900/20",
  "MID TIER": "bg-orange-900/20",
  MID: "bg-orange-900/20",
  "LOW TIER": "bg-zinc-800",
  LOW: "bg-zinc-800",
  PROSPECT: "bg-zinc-900",
}

export function BattlerPortrait({
  battler,
  size = "md",
  showBorder = true,
  showFrame = true,
  className,
}: BattlerPortraitProps) {
  const { container } = sizeMap[size]
  const borderColor = battler.tier ? tierBorderColors[battler.tier] || "border-zinc-600" : "border-zinc-600"
  const bgColor = battler.tier ? tierBgColors[battler.tier] || "bg-zinc-800" : "bg-zinc-800"

  const spriteUrl = battler.portrait?.spriteUrl || "/battle-rapper-pixel-art.jpg"

  if (!showFrame) {
    return (
      <Image
        src={spriteUrl || "/placeholder.svg"}
        alt={battler.stageName}
        width={200}
        height={200}
        className={cn("w-full h-full object-contain", className)}
        style={{
          imageRendering: "pixelated",
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        container,
        showBorder && `border-2 ${borderColor}`,
        bgColor,
        "overflow-hidden relative flex-shrink-0 flex items-center justify-center",
        className,
      )}
    >
      <Image
        src={spriteUrl || "/placeholder.svg"}
        alt={battler.stageName}
        width={200}
        height={200}
        className="w-full h-full object-contain pixelated"
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  )
}

// Helper to get initials fallback
export function BattlerInitials({
  name,
  size = "md",
  className,
}: { name: string; size?: "xs" | "sm" | "md" | "lg" | "xl"; className?: string }) {
  const { container } = sizeMap[size]
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={cn(
        container,
        "bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center flex-shrink-0",
        className,
      )}
    >
      <span className="font-display font-bold text-zinc-400">{initials}</span>
    </div>
  )
}
