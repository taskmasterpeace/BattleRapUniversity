"use client"

import Image from "next/image"
import { FLYER_TEMPLATES, type BattleFlyer } from "@/lib/battle-flyers"
import { Calendar, MapPin, Trophy, Flame } from "lucide-react"

interface BattleFlyerProps {
  flyer: BattleFlyer
  size?: "sm" | "md" | "lg"
}

export function BattleFlyerCard({ flyer, size = "md" }: BattleFlyerProps) {
  const template = FLYER_TEMPLATES[flyer.type]
  const accentColors: Record<string, string> = {
    orange: "text-orange-500 border-orange-500",
    yellow: "text-yellow-500 border-yellow-500",
    red: "text-red-500 border-red-500",
    purple: "text-purple-500 border-purple-500",
    green: "text-green-500 border-green-500",
  }
  const accent = accentColors[template.accentColor]

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  }

  return (
    <div
      className={`relative bg-gradient-to-br ${template.bgGradient} border border-zinc-700 overflow-hidden ${sizeClasses[size]}`}
      style={{ aspectRatio: flyer.aspectRatio === "16:9" ? "16/9" : flyer.aspectRatio === "9:16" ? "9/16" : "1/1" }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* League Header */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase ${accent.split(" ")[0]}`}>{flyer.league}</span>
          <span className="text-xs text-zinc-500">{template.name}</span>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h3 className={`font-display font-black uppercase text-xl md:text-2xl ${accent.split(" ")[0]}`}>
            {flyer.title}
          </h3>
          {flyer.subtitle && <p className="text-sm text-zinc-400 italic">{flyer.subtitle}</p>}
        </div>

        {/* VS Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-4 w-full">
            {/* Battler 1 */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-2 bg-zinc-800 border-2 border-zinc-700 overflow-hidden">
                {flyer.battler1.spriteId ? (
                  <Image
                    src={`/sprites/characters/${flyer.battler1.spriteId}.png`}
                    alt={flyer.battler1.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-zinc-600">
                    {flyer.battler1.name[0]}
                  </div>
                )}
              </div>
              <div className="font-display font-bold text-white uppercase text-sm md:text-base">
                {flyer.battler1.name}
              </div>
              <div className="text-xs text-zinc-500">{flyer.battler1.city}</div>
              <div className="text-xs text-zinc-400">({flyer.battler1.record})</div>
            </div>

            {/* VS */}
            <div className={`font-display font-black text-2xl md:text-3xl ${accent.split(" ")[0]}`}>VS</div>

            {/* Battler 2 */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-2 bg-zinc-800 border-2 border-zinc-700 overflow-hidden">
                {flyer.battler2.spriteId ? (
                  <Image
                    src={`/sprites/characters/${flyer.battler2.spriteId}.png`}
                    alt={flyer.battler2.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-zinc-600">
                    {flyer.battler2.name[0]}
                  </div>
                )}
              </div>
              <div className="font-display font-bold text-white uppercase text-sm md:text-base">
                {flyer.battler2.name}
              </div>
              <div className="text-xs text-zinc-500">{flyer.battler2.city}</div>
              <div className="text-xs text-zinc-400">({flyer.battler2.record})</div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-zinc-700/50">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(flyer.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {flyer.venue}
            </span>
            {flyer.stakes && (
              <span className={`flex items-center gap-1 ${accent.split(" ")[0]}`}>
                {flyer.type === "grudge" ? <Flame className="w-3 h-3" /> : <Trophy className="w-3 h-3" />}
                {flyer.stakes}
              </span>
            )}
          </div>
          <div className="text-center text-xs text-zinc-500 mt-1">{flyer.format}</div>
        </div>
      </div>
    </div>
  )
}
