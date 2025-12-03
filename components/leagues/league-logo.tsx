"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface LeagueLogoProps {
  league: {
    slug: string
    displayName: string
    primaryColor: string
    logoId?: string
    logoUrl?: string
  }
  size?: "sm" | "md" | "lg" | "xl"
  showName?: boolean
  className?: string
}

const SIZES = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20",
  xl: "w-32 h-32",
}

const TEXT_SIZES = {
  sm: "text-[8px]",
  md: "text-xs",
  lg: "text-base",
  xl: "text-xl",
}

export function LeagueLogo({ league, size = "md", showName = false, className }: LeagueLogoProps) {
  const hasLogo = league.logoId || league.logoUrl
  const logoSrc = league.logoId ? `/sprites/leagues/${league.logoId}.png` : league.logoUrl

  // Generate abbreviation from name
  const abbreviation = league.displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3)

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(SIZES[size], "rounded-lg overflow-hidden border-2 flex-shrink-0")}
        style={{ borderColor: league.primaryColor }}
      >
        {hasLogo && logoSrc ? (
          <Image
            src={logoSrc || "/placeholder.svg"}
            alt={league.displayName}
            width={128}
            height={128}
            className="w-full h-full object-contain bg-zinc-900 p-1 image-pixelated"
          />
        ) : (
          <div
            className={cn("w-full h-full flex items-center justify-center font-black text-white", TEXT_SIZES[size])}
            style={{ backgroundColor: league.primaryColor }}
          >
            {abbreviation}
          </div>
        )}
      </div>

      {showName && <span className="font-black uppercase text-white">{league.displayName}</span>}
    </div>
  )
}
