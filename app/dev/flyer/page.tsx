"use client"

import { BattlerHero } from "@/components/dashboard/battler-hero"
import { CharacterSheet } from "@/components/battler/character-sheet"
import { BattleFlyer, TaleOfTheTape } from "@/components/battle/battle-flyer"
import type { Battler } from "@/lib/types"

// Representative mock data so we can build the Flyer System components without
// depending on the (currently broken) local free-agents query. Renders live once data is healthy.
const mockBattler = {
  id: "preview",
  stageName: "Flow Tester",
  tier: "LOW TIER",
  league: "SMALL ROOM CIRCUIT",
  region: "Atlanta",
  city: { name: "New York", region: "Northeast" },
  elo: 1118,
  portrait: { spriteUrl: "/images/sprite-536.png" },
} as unknown as Battler

const longNameBattler = {
  ...mockBattler,
  stageName: "The Anatomical Assassin",
} as unknown as Battler

export default function FlyerPreviewPage() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 80px" }}>
      <p
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 10,
          color: "#F5731A",
          letterSpacing: ".04em",
          marginBottom: 18,
        }}
      >
        ◤ FLYER SYSTEM PREVIEW · /dev/flyer
      </p>

      <h2 style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: ".06em", color: "#A6A8B0", fontSize: 13, margin: "0 0 10px" }}>
        Command Hero
      </h2>
      <BattlerHero
        battler={mockBattler}
        cityName="New York"
        cityBackdrop="/sprites/cities/new-york-day.png"
        level={2}
        levelLabel="ROOKIE"
        elo={1118}
        xp={{ current: 1841, needed: 2598 }}
        nextBattle={{
          opponentName: "Slim 44",
          opponentAvatar: "/sprites/characters/sprite_571.png",
          league: "Small Room Circuit",
          dateLabel: "Dec 5 · 10 days left",
          prepPct: 70,
        }}
      />

      <h2 style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: ".06em", color: "#A6A8B0", fontSize: 13, margin: "28px 0 10px" }}>
        Long name + no booked battle
      </h2>
      <BattlerHero
        battler={longNameBattler}
        cityName="New York"
        cityBackdrop="/sprites/cities/new-york-day.png"
        level={2}
        levelLabel="ROOKIE"
        elo={1118}
        xp={{ current: 1841, needed: 2598 }}
        nextBattle={null}
      />

      <h2 style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: ".06em", color: "#A6A8B0", fontSize: 13, margin: "28px 0 10px" }}>
        Character Sheet
      </h2>
      <CharacterSheet
        name="Tru Foe"
        portrait="/sprites/characters/image_1764146494580/sprite_841.png"
        cityName="Atlanta"
        cityBackdrop="/sprites/cities/atlanta-dusk.png"
        tierLabel="MID TIER"
        record="4W · 2L"
        elo={1290}
        groups={[
          {
            title: "Writing & Rapping",
            rows: [
              { label: "Lyricism", value: 84 },
              { label: "Wordplay", value: 79 },
              { label: "Creativity", value: 66 },
              { label: "Flow", value: 71 },
            ],
          },
          {
            title: "Performance",
            rows: [
              { label: "Stage Presence", value: 58 },
              { label: "Crowd Control", value: 62 },
              { label: "Delivery", value: 69 },
            ],
          },
          {
            title: "Personal",
            rows: [
              { label: "Financial Stab.", value: 41 },
              { label: "Reputation", value: 55 },
              { label: "Family Bond", value: 80 },
              { label: "Preparation", value: 64 },
            ],
          },
          {
            title: "Mental",
            rows: [{ label: "Resilience", value: 44 }],
          },
        ]}
        badges={[
          {
            name: "Freestyle Genius",
            tier: "gold",
            icon: "/sprites/badges/badge_046.png",
            effects: [
              { delta: "+15%", label: "creativity", good: true },
              { delta: "+10%", label: "rebuttals going 2nd", good: true },
              { delta: "+8%", label: "haymakers", good: true },
              { delta: "−25%", label: "choke chance", good: true },
              { delta: "+20%", label: "research prep", good: true },
            ],
          },
          {
            name: "Animated Performer",
            tier: "bronze",
            icon: "/sprites/badges/badge_054.png",
            effects: [
              { delta: "+18%", label: "stage presence", good: true },
              { delta: "+15%", label: "crowd control", good: true },
              { delta: "+12", label: "crowd reaction", good: true },
              { delta: "−5%", label: "in small rooms", good: false },
            ],
          },
          {
            name: "Aggressive Battler",
            tier: "bronze",
            icon: "/images/badge-046.png",
            effects: [
              { delta: "+5%", label: "delivery", good: true },
              { delta: "+4%", label: "stage presence", good: true },
              { delta: "+1", label: "crowd reaction", good: true },
              { delta: "+2%", label: "choke risk", good: false },
            ],
          },
          {
            name: "Smooth Flow",
            tier: "silver",
            icon: "/images/badge-048.png",
            effects: [
              { delta: "+10%", label: "flow", good: true },
              { delta: "+6%", label: "delivery", good: true },
              { delta: "−3%", label: "stumble risk", good: true },
            ],
          },
        ]}
        netEffects={[
          { label: "Stage Presence", delta: "+22%", good: true },
          { label: "Delivery", delta: "+11%", good: true },
          { label: "Creativity", delta: "+15%", good: true },
          { label: "Choke", delta: "−23%", good: true },
          { label: "Haymakers", delta: "+8%", good: true },
          { label: "Small Rooms", delta: "−5%", good: false },
        ]}
      />

      <h2 style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: ".06em", color: "#A6A8B0", fontSize: 13, margin: "28px 0 10px" }}>
        Battle Flyer — headliner + undercard
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 16 }} className="fs-flyrow">
        <BattleFlyer
          eventTitle="Outside 5"
          leagueLine="OUTSIDE 5 · SMALL ROOM CIRCUIT"
          a={{ name: "Geechi Gotti", portrait: "/sprites/characters/sprite_571.png" }}
          b={{ name: "Chef Trez", portrait: "/sprites/characters/sprite_655.png" }}
          undercard={[
            { a: "T-Top", b: "Kyd Slade", aPortrait: "/sprites/characters/sprite_661.png", bPortrait: "/sprites/characters/sprite_667.png" },
            { a: "A Ward", b: "Jakkboy Maine", aPortrait: "/images/sprite-536.png", bPortrait: "/sprites/characters/sprite_569.png" },
            { a: "Ms Hustle", b: "Lu Castro", aPortrait: "/sprites/characters/sprite_571.png", bPortrait: "/sprites/characters/sprite_655.png" },
            { a: "Danny Myers", b: "Dice", aPortrait: "/sprites/characters/sprite_661.png", bPortrait: "/sprites/characters/sprite_667.png" },
          ]}
          footerLine="FRI · DEC 5 · 8PM | THE ANNEX, ATLANTA | PPV + TICKETS"
          sponsorLine="SPONSOR · SPONSOR · SPONSOR"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <BattleFlyer
            eventTitle="Who's Next?"
            leagueLine="MAIN EVENT · UNANNOUNCED"
            mono
            a={{ name: "???", portrait: "/sprites/characters/sprite_667.png", silhouette: true, cornerTag: "TBA" }}
            b={{ name: "???", portrait: "/sprites/characters/sprite_661.png", silhouette: true, cornerTag: "TBA" }}
          />
          <TaleOfTheTape
            a={{ name: "Geechi Gotti", portrait: "/sprites/characters/sprite_571.png", record: "18W · 4L · ELO 1642", cityBackdrop: "/sprites/cities/philadelphia-dusk.png" }}
            b={{ name: "Chef Trez", portrait: "/sprites/characters/sprite_655.png", record: "15W · 6L · ELO 1588", cityBackdrop: "/sprites/cities/new-york-day.png" }}
            stats={[
              { label: "LYRICISM", a: 88, b: 74 },
              { label: "DELIVERY", a: 70, b: 90 },
              { label: "STAGE PRES.", a: 82, b: 78 },
              { label: "CROWD CTRL", a: 76, b: 84 },
            ]}
          />
        </div>
      </div>
      <style>{`@media(max-width:900px){.fs-flyrow{grid-template-columns:1fr !important}}`}</style>
    </div>
  )
}
