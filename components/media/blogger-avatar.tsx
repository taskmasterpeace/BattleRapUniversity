"use client"
import type { Blogger } from "@/lib/bloggers"
import { portraitFillStyle } from "@/lib/sprite-crops"

interface BloggerAvatarProps {
  blogger: Blogger
  size: "sm" | "md" | "lg" | "xl"
  showBadge?: boolean
  onClick?: () => void
}

const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl",
}

export function BloggerAvatar({ blogger, size, showBadge = false, onClick }: BloggerAvatarProps) {
  const initials = blogger.name
    .split(" ")
    .map((w) => w[0])
    .join("")
  const avatarUrl = blogger.avatarId ? `/sprites/bloggers/${blogger.avatarId}.png` : undefined

  return (
    <div
      className={`${SIZES[size]} rounded-full overflow-hidden border-2 relative flex items-center justify-center font-black text-white cursor-pointer`}
      style={{ borderColor: blogger.color, backgroundColor: blogger.color }}
      onClick={onClick}
    >
      <span>{initials}</span>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={blogger.name}
          style={portraitFillStyle(avatarUrl, { fit: "width", targetW: 1.18 })}
          onError={(e) => {
            // fall back to the initials underneath
            ;(e.currentTarget as HTMLImageElement).style.display = "none"
          }}
        />
      )}
      {showBadge && (
        <span className="absolute -bottom-1 -right-1 text-xs bg-zinc-900 rounded-full w-5 h-5 flex items-center justify-center z-10">
          {blogger.icon}
        </span>
      )}
    </div>
  )
}
