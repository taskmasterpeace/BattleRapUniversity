"use client"

import type { Battler } from "@/lib/types"
import { portraitFillStyle } from "@/lib/sprite-crops"

export interface NextBattleLite {
  opponentName?: string
  opponentAvatar?: string
  league?: string
  dateLabel?: string
  prepPct?: number
}

interface BattlerHeroProps {
  battler: Battler
  cityName?: string
  cityBackdrop?: string
  nextBattle?: NextBattleLite | null
  level?: number
  levelLabel?: string
  elo?: number
  xp?: { current: number; needed: number }
  rosterSlots?: string
}

/**
 * The Flyer System command-center hero.
 * Big framed portrait over the battler's city (city NAME featured), matchup-forward next-battle mini-flyer.
 * Portraits fill the frame (shoulders to the bottom) via the measured crop map — never floating.
 * See docs/design/flyer-system/DESIGN_LANGUAGE.md
 */
export function BattlerHero({
  battler,
  cityName,
  cityBackdrop,
  nextBattle,
  level = 1,
  levelLabel = "ROOKIE",
  elo,
  xp,
  rosterSlots = "1 / 3 ROSTER SLOTS",
}: BattlerHeroProps) {
  const portrait = battler.portrait?.spriteUrl || "/sprites/characters/sprite_569.png"
  const oppAvatar = nextBattle?.opponentAvatar || "/sprites/characters/sprite_571.png"
  const city = cityName || battler.city?.name || ""
  const region = battler.region || battler.city?.region || ""
  const backdrop = cityBackdrop || "/sprites/cities/atlanta-dusk.png"
  const rating = elo ?? battler.elo ?? 1000
  const tierLabel = (battler.tier || "MID TIER").replace(/\s*TIER\s*/i, "").trim()
  const xpCur = xp?.current ?? 0
  const xpNeed = Math.max(1, xp?.needed ?? 1000)
  const xpPct = Math.min(100, Math.round((xpCur / xpNeed) * 100))

  return (
    <div className="fs fs-hero fs-ticks">
      <div className="fs-port">
        <img
          className="fs-bg"
          src={backdrop}
          alt=""
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = "none"
          }}
        />
        {city && <span className="fs-cityback">{city}</span>}
        <img className="fs-fg" src={portrait} alt={battler.stageName} style={portraitFillStyle(portrait, { targetH: 0.86 })} />
      </div>

      <div className="fs-mid">
        <div className="fs-status">
          <i />
          ACTIVE BATTLER · {rosterSlots}
        </div>
        <h1 className="fs-name">{battler.stageName}</h1>
        <div className="fs-chips">
          {battler.league && <span className="fs-chip tier">{battler.league}</span>}
          <span className="fs-chip">{tierLabel} TIER</span>
          {city && <span className="fs-chip city">🏙 {city}</span>}
          {region && <span className="fs-chip loc">📍 {region}</span>}
        </div>
        <span className="fs-lvl">
          <span className="r">{levelLabel}</span>
          <b>LEVEL {level}</b>
        </span>
        <div className="fs-elowrap">
          <div className="row">
            <div className="fs-elo">
              {rating}
              <small>ELO RATING</small>
            </div>
            <div style={{ flex: 1 }}>
              <div className="fs-xp">
                <i style={{ width: `${xpPct}%` }} />
                <b>
                  {xpCur.toLocaleString()} / {xpNeed.toLocaleString()} XP
                </b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {nextBattle ? (
        <div className="fs-nextb">
          <span className="lab">◤ NEXT BATTLE</span>
          <div className="vsrow">
            <span className="f r">
              <img src={portrait} alt="" style={portraitFillStyle(portrait, { targetH: 1.08 })} />
            </span>
            <span className="vs">VS</span>
            <span className="f b">
              <img src={oppAvatar} alt="" style={portraitFillStyle(oppAvatar, { targetH: 1.08 })} />
            </span>
          </div>
          <div className="opp">vs {nextBattle.opponentName || "TBA"}</div>
          <div className="meta">
            {[nextBattle.league, nextBattle.dateLabel].filter(Boolean).join(" · ")}
          </div>
          <div className="prep">
            <div className="t">
              <span>PREP PROGRESS</span>
              <span>{nextBattle.prepPct ?? 0}%</span>
            </div>
            <div className="fs-bar">
              <i style={{ width: `${nextBattle.prepPct ?? 0}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="fs-nextb" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <span className="lab" style={{ color: "var(--fs-mut)" }}>
            ◤ NO BATTLE BOOKED
          </span>
          <div className="opp" style={{ marginTop: 10 }}>
            Check Offers
          </div>
        </div>
      )}
    </div>
  )
}
