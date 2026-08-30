"use client"

import { portraitFillStyle } from "@/lib/sprite-crops"

export interface AttrRow {
  label: string
  value: number // 0–100, or 1–10 (auto-detected per group via scale10)
}

export interface AttrGroup {
  title: string
  scale10?: boolean // values are on the 1–10 game scale
  rows: AttrRow[]
}

export interface BadgeEffect {
  label: string
  delta: string // e.g. "+15%", "−25%", "+12"
  good: boolean // green (buff) vs red (cost)
}

export interface BadgeInfo {
  name: string
  tier: "bronze" | "silver" | "gold"
  icon?: string
  emoji?: string // fallback medallion until real badge art exists
  effects: BadgeEffect[]
}

export interface NetEffect {
  label: string
  delta: string
  good: boolean
}

interface CharacterSheetProps {
  name: string
  portrait: string
  cityName?: string
  cityBackdrop?: string
  tierLabel?: string
  record?: string
  elo?: number
  groups: AttrGroup[]
  badges?: BadgeInfo[]
  netEffects?: NetEffect[]
}

function gaugeClass(pct: number): string {
  if (pct >= 75) return "hi"
  if (pct < 50) return "lo"
  return ""
}

/**
 * Flyer System character sheet — big face over the origin city (name crowning the frame),
 * every attribute as a gauge, every badge with its real sim effects, net-effect summary.
 * See docs/design/flyer-system/DESIGN_LANGUAGE.md
 */
export function CharacterSheet({
  name,
  portrait,
  cityName,
  cityBackdrop,
  tierLabel,
  record,
  elo,
  groups,
  badges = [],
  netEffects = [],
}: CharacterSheetProps) {
  return (
    <div className="fs fs-sheet">
      <div className="fs-bigport fs-ticks">
        {cityBackdrop && (
          <img
            className="fs-bg"
            src={cityBackdrop}
            alt=""
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = "none"
            }}
          />
        )}
        {cityName && <span className="fs-cityback">{cityName}</span>}
        <img className="fs-pf" src={portrait} alt={name} style={portraitFillStyle(portrait, { targetH: 0.78 })} />
        <div className="fs-cap">
          <h2 className="nm">{name}</h2>
          <div className="r">
            {tierLabel && <span className="t">{tierLabel}</span>}
            {record && <span className="t">{record}</span>}
            {elo != null && <span className="e">ELO {elo}</span>}
          </div>
        </div>
      </div>

      <div>
        {groups.map((g) => (
          <div className="fs-grp" key={g.title}>
            <h3 className="fs-gt">{g.title}</h3>
            {g.rows.map((row) => {
              const pct = g.scale10 ? Math.min(100, row.value * 10) : Math.min(100, row.value)
              const display = g.scale10 ? row.value : Math.round(row.value)
              return (
                <div className="fs-attr" key={row.label}>
                  <span className="l">{row.label}</span>
                  <div className="fs-g">
                    <i className={gaugeClass(pct)} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="v">{display}</span>
                </div>
              )
            })}
          </div>
        ))}

        {badges.length > 0 && (
          <>
            <h3 className="fs-gt" style={{ marginBottom: 12 }}>
              Badges &amp; Effects
            </h3>
            <div className="fs-bgrid">
              {badges.map((b) => (
                <div className={`fs-badge${b.tier === "gold" ? " gold" : ""}`} key={b.name}>
                  <div className="med">
                    {b.icon ? (
                      <img
                        src={b.icon}
                        alt={b.name}
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).style.visibility = "hidden"
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 44,
                          background: "radial-gradient(circle at 50% 38%, #2C261F, #17181C 72%)",
                          border: "1px solid var(--fs-line2)",
                          borderRadius: 12,
                        }}
                      >
                        {b.emoji ?? "🏅"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="bn">{b.name}</h4>
                    <span className={`fs-tier ${b.tier}`}>{b.tier.toUpperCase()}</span>
                    <div className="fs-eff">
                      {b.effects.map((ef, i) => (
                        <span className={ef.good ? "up" : "dn"} key={i}>
                          <b>{ef.delta}</b>
                          {ef.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {netEffects.length > 0 && (
          <div className="fs-net">
            <p className="pt">◤ NET EFFECT ON {name.toUpperCase()}</p>
            <div className="row">
              {netEffects.map((n) => (
                <span className="m" key={n.label}>
                  {n.label}
                  <b className={n.good ? "p" : "n"}>{n.delta}</b>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
