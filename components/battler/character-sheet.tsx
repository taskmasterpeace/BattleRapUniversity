"use client"

import { useState } from "react"
import { portraitFillStyle } from "@/lib/sprite-crops"

export interface AttrRow {
  label: string
  value: number // 0–100, or 1–10 (scale10)
}

export interface AttrGroup {
  title: string
  scale10?: boolean
  rows: AttrRow[]
}

export interface BadgeEffect {
  label: string
  delta: string
  good: boolean
}

export interface BadgeInfo {
  name: string
  tier: "bronze" | "silver" | "gold"
  icon?: string
  emoji?: string
  effects: BadgeEffect[]
}

export interface NetEffect {
  label: string
  delta: string
  good: boolean
}

export interface LeagueInfo {
  name: string
  crest?: string
  subtitle?: string
}

export interface LineageEntry {
  crest?: string
  label?: string
}

interface CharacterSheetProps {
  name: string
  portrait: string
  portraits?: string[] // multiple profiles — variant strip, click to swap
  cityName?: string
  cityBackdrop?: string
  tierLabel?: string
  record?: string
  elo?: number
  level?: number
  styleTags?: string[]
  league?: LeagueInfo
  lineage?: LineageEntry[]
  groups: AttrGroup[]
  badges?: BadgeInfo[]
  netEffects?: NetEffect[]
}

type Grade = "S" | "A" | "B" | "C" | "D"

// grade code: S gold · A green · B blue · C yellow · D red (dossier legend)
function gradeOf(v10: number): Grade {
  if (v10 >= 8.5) return "S"
  if (v10 >= 7.5) return "A"
  if (v10 >= 6.5) return "B"
  if (v10 >= 5) return "C"
  return "D"
}

function to10(row: AttrRow, scale10?: boolean): number {
  return scale10 ? row.value : row.value / 10
}

function fmt10(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

/** Segmented, notched gauge (pips at 3/6/9) colored by grade. */
function SegGauge({ v10, grade }: { v10: number; grade: Grade }) {
  const filled = Math.round(v10)
  return (
    <div className="fs-seg">
      {Array.from({ length: 10 }).map((_, i) => (
        <i
          key={i}
          className={`${i < filled ? `on ${grade}` : ""}${i === 2 || i === 5 || i === 8 ? " notch" : ""}`}
        />
      ))}
    </div>
  )
}

/** FIGHT SHAPE — six-axis radar giving the battler an instantly readable silhouette. */
function FightShape({ axes }: { axes: { label: string; v10: number }[] }) {
  const size = 190
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 26
  const pt = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / axes.length - Math.PI / 2
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  }
  const ring = (frac: number) =>
    axes.map((_, i) => pt(i, R * frac).join(",")).join(" ")
  const shape = axes.map((ax, i) => pt(i, (R * Math.max(0.08, ax.v10)) / 10).join(",")).join(" ")
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: 230, margin: "0 auto", display: "block" }}>
      {[1, 0.66, 0.33].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="#2E2F35" strokeWidth="1" />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, R)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#2E2F35" strokeWidth="1" />
      })}
      <polygon points={shape} fill="rgba(245,115,26,.28)" stroke="#F5731A" strokeWidth="2" strokeLinejoin="round" />
      {axes.map((ax, i) => {
        const [x, y] = pt(i, (R * Math.max(0.08, ax.v10)) / 10)
        return <circle key={i} cx={x} cy={y} r="3" fill="#F5731A" stroke="#0F0F12" strokeWidth="1.5" />
      })}
      {axes.map((ax, i) => {
        const [x, y] = pt(i, R + 15)
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#A6A8B0"
            style={{ font: "700 7.5px Rajdhani, sans-serif", letterSpacing: ".08em", textTransform: "uppercase" }}
          >
            {ax.label.toUpperCase()} {fmt10(ax.v10)}
          </text>
        )
      })}
    </svg>
  )
}

const RADAR_PICKS = ["Lyricism", "Wordplay", "Flow", "Stage Presence", "Crowd Control", "Resilience"]

/**
 * Flyer System character sheet v2 (Codex collab) — dossier-grade identity masthead,
 * Fight Shape radar, graded notched attribute matrix, league lineage, badge jewels.
 * See docs/design/flyer-system/DESIGN_LANGUAGE.md
 */
export function CharacterSheet({
  name,
  portrait,
  portraits = [],
  cityName,
  cityBackdrop,
  tierLabel,
  record,
  elo,
  level,
  styleTags = [],
  league,
  lineage = [],
  groups,
  badges = [],
  netEffects = [],
}: CharacterSheetProps) {
  const variants = portraits.length > 1 ? portraits : []
  const [activePortrait, setActivePortrait] = useState(0)
  const shownPortrait = variants.length > 0 ? variants[activePortrait] ?? variants[0] : portrait
  // radar axes + range/floor from all rows
  const all: { label: string; v10: number }[] = groups.flatMap((g) =>
    g.rows.map((r) => ({ label: r.label, v10: to10(r, g.scale10) })),
  )
  const axes = RADAR_PICKS.map((p) => all.find((a) => a.label.toLowerCase().startsWith(p.toLowerCase()))).filter(
    Boolean,
  ) as { label: string; v10: number }[]
  const best = all.reduce((m, a) => (a.v10 > m.v10 ? a : m), all[0])
  const worst = all.reduce((m, a) => (a.v10 < m.v10 ? a : m), all[0])

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
          <img className="fs-pf" src={shownPortrait} alt={name} style={portraitFillStyle(shownPortrait, { fit: "width", targetW: 0.96 })} />
          <div className="fs-cap">
            {variants.length > 0 && (
              <div className="fs-variants">
                {variants.map((v, i) => (
                  <button
                    key={v}
                    className={`vt${i === activePortrait ? " on" : ""}`}
                    onClick={() => setActivePortrait(i)}
                    title={i === 0 ? "Primary" : `Profile ${i + 1}`}
                  >
                    <img src={v} alt="" style={portraitFillStyle(v, { targetH: 1.15 })} />
                  </button>
                ))}
                <span className="lab">
                  PROFILE {activePortrait + 1}/{variants.length}
                </span>
              </div>
            )}
            <h2 className="nm">{name}</h2>
            <div className="fs-idplates">
              {tierLabel && (
                <span className="p">
                  <span className="k">Tier</span>
                  <span className="v">{tierLabel.replace(/\s*TIER\s*/i, "")}</span>
                </span>
              )}
              {record && (
                <span className="p">
                  <span className="k">Record</span>
                  <span className="v">{record}</span>
                </span>
              )}
              {elo != null && (
                <span className="p">
                  <span className="k">ELO</span>
                  <span className="v pix">{elo}</span>
                </span>
              )}
              {level != null && (
                <span className="p">
                  <span className="k">Level</span>
                  <span className="v">{String(level).padStart(2, "0")}</span>
                </span>
              )}
            </div>
            {styleTags.length > 0 && (
              <div className="fs-chips" style={{ marginTop: 10 }}>
                {styleTags.slice(0, 4).map((t) => (
                  <span className="fs-chip loc" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            )}
        </div>
      </div>

      <div>
        <div className="fs-sheet2-top">
          <div className="fs-radarwrap">
            <div>
              <div className="hd">
                Fight Shape <span className="sub">// SIGNATURE</span>
              </div>
              {axes.length >= 3 ? <FightShape axes={axes} /> : null}
            </div>
            <div className="fs-radar-side">
              <div className="fs-statchip">
                <div className="k">Range</div>
                <div className="v">{fmt10(best?.v10 ?? 0)}</div>
                <div className="s">highest / {best?.label.toLowerCase()}</div>
              </div>
              <div className="fs-statchip" style={{ borderLeftColor: "var(--fs-red)" }}>
                <div className="k">Floor</div>
                <div className="v">{fmt10(worst?.v10 ?? 0)}</div>
                <div className="s">lowest / {worst?.label.toLowerCase()}</div>
              </div>
            </div>
          </div>

          {league && (
            <div className="fs-league">
              <div className="hd">
                <span className="t">League Affiliation</span>
                <span className="cur">CURRENT</span>
              </div>
              <div className="main">
                {league.crest && (
                  <span className="crest">
                    <img
                      src={league.crest}
                      alt={league.name}
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).style.visibility = "hidden"
                      }}
                    />
                  </span>
                )}
                <div>
                  <div className="nm">{league.name}</div>
                  <div className="sub">{league.subtitle ?? "Current affiliation"}</div>
                </div>
              </div>
              {lineage.length > 0 && (
                <div className="lineage">
                  <span className="lab">Career lineage</span>
                  {lineage.map((l, i) => (
                    <span className="mini" key={i} title={l.label}>
                      {l.crest && <img src={l.crest} alt={l.label ?? ""} />}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {groups.map((g, gi) => {
          const avg = g.rows.reduce((s, r) => s + to10(r, g.scale10), 0) / Math.max(1, g.rows.length)
          const gGrade = gradeOf(avg)
          return (
            <div className="fs-grp2" key={g.title}>
              <div className="hd">
                <span className="n">{String(gi + 1).padStart(2, "0")}</span>
                <span className="t">{g.title}</span>
                <span className="sp" />
                <span className={`fs-gseal ${gGrade}`}>{gGrade}</span>
              </div>
              {g.rows.map((row) => {
                const v10 = to10(row, g.scale10)
                const grade = gradeOf(v10)
                return (
                  <div className="fs-attr2" key={row.label}>
                    <span className="l">{row.label}</span>
                    <SegGauge v10={v10} grade={grade} />
                    <span className={`fs-grade ${grade}`}>{grade}</span>
                    <span className="v">{fmt10(v10)}</span>
                  </div>
                )
              })}
            </div>
          )
        })}

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
