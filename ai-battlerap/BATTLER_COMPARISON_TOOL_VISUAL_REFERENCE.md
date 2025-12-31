# Battler Comparison Tool - Visual Reference & Component Guide

## Feature Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BATTLER COMPARISON TOOL (Admin)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [SELECT BATTLERS] [FILTERS ▼] [SAVED COMPS ▼] [EXPORT ▼]  [HELP] [×] │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Battler Cards (Selected: 3/10)                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │ Tru Foe          │  │ QX               │  │ Eminent          │     │
│  │ Rating: 1847     │  │ Rating: 1612     │  │ Rating: 1923     │     │
│  │ Top Tier         │  │ Mid Tier         │  │ Top Tier         │     │
│  │ 66.1% Win Rate   │  │ 58.4% Win Rate   │  │ 66.0% Win Rate   │     │
│  │ [×]              │  │ [×]              │  │ [×]              │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  [Overview] [Attributes] [Performance] [Badges] [Trends] [Analysis]   │
├─────────────────────────────────────────────────────────────────────────┤
│                          ACTIVE TAB CONTENT                             │
│                                                                         │
│  (Charts, tables, grids render here based on selected tab)            │
│                                                                         │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tab 1: Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│ OVERVIEW - Quick Stats & Key Insights                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  KEY METRICS COMPARISON                                                │
│  ┌──────────────┬──────────┬──────────┬──────────┐                     │
│  │ Metric       │ Tru Foe  │ QX       │ Eminent  │                     │
│  ├──────────────┼──────────┼──────────┼──────────┤                     │
│  │ Rating       │ 1847     │ 1612     │ 1923     │ ← Highest            │
│  │ Wins         │ 84       │ 52       │ 103      │                      │
│  │ Win Rate     │ 66.1%    │ 58.4%    │ 66.0%    │                      │
│  │ Streak       │ +3 ↑     │ -1 ↓     │ +5 ↑↑    │ ← Eminent improving  │
│  │ Tier         │ Top      │ Mid      │ Top      │                      │
│  └──────────────┴──────────┴──────────┴──────────┘                     │
│                                                                         │
│  BADGE OVERVIEW                                                        │
│  Tru Foe:  [Stage Presence] [Storytelling] [Wordplay] ... (8 total)   │
│  QX:       [Crowd Control] [Angles] [Technical] ... (6 total)         │
│  Eminent:  [Stage Presence] [Storytelling] [Crowd Favorite] ... (9)   │
│                                                                         │
│  QUICK INSIGHTS                                                        │
│  • Eminent: On hot streak (↑↑), highest rating                        │
│  • Tru Foe: Consistent performer, strong in both leagues              │
│  • QX: Room for improvement, mid-tier specialist                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tab 2: Attributes

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ATTRIBUTES - Skill Comparison                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                        ATTRIBUTE RADAR CHART                            │
│                                                                         │
│                      ╱─ LYRICISM                                       │
│                     ╱  (7.8, 6.2, 7.5)                                 │
│                    ╱                                                   │
│                   ╱                                                    │
│             WORDPLAY ────── 8.0 ────── CREATIVITY                      │
│              (7.5)          (circle)     (7.2)                         │
│                 ╲                      ╱                               │
│                  ╲                    ╱                                │
│                   ╲                  ╱                                 │
│                    ╲  DELIVERY     ╱                                   │
│                     ╲ (7.9)        ╱                                   │
│                      ╲            ╱                                    │
│                       ╲          ╱                                     │
│         STAGE PRESENCE ───CORE─── CROWD CONTROL                        │
│          (8.1)              │       (8.0)                              │
│                             │                                          │
│                          RESILIENCE                                    │
│                           (8.2)                                        │
│                                                                         │
│  Legend:                                                               │
│  ● Tru Foe (orange)   ─── Attributes: 7-10 (Top tier)                │
│  ● QX (cyan)          ─── Attributes: 5-7 (Mid tier)                 │
│  ● Eminent (magenta)  ─── Attributes: 7-10 (Top tier)                │
│  [⊡ Show Average]                                                     │
│                                                                         │
│  ATTRIBUTE BREAKDOWN                                                   │
│  ┌─────────────────────┬─────────┬─────────┬──────────┐               │
│  │ Attribute           │ Tru Foe │ QX      │ Eminent  │               │
│  ├─────────────────────┼─────────┼─────────┼──────────┤               │
│  │ WRITING SKILLS      │         │         │          │               │
│  │  Lyricism           │ 7.8     │ 6.2     │ 7.5      │               │
│  │  Wordplay           │ 7.5     │ 5.1     │ 7.3      │               │
│  │  Creativity         │ 7.2     │ 5.9     │ 7.6      │               │
│  │  Flow               │ 7.4     │ 6.0     │ 7.4      │               │
│  │ PERFORMANCE SKILLS  │         │         │          │               │
│  │  Stage Presence     │ 8.1     │ 6.3     │ 7.9      │               │
│  │  Crowd Control      │ 8.0     │ 6.1     │ 7.8      │               │
│  │  Delivery           │ 7.9     │ 5.8     │ 8.1      │               │
│  │ RESILIENCE          │ 8.2     │ 6.0     │ 7.9      │               │
│  └─────────────────────┴─────────┴─────────┴──────────┘               │
│                                                                         │
│  ATTRIBUTE DISTRIBUTION HEATMAP (Alternative View)                    │
│  [View as Heatmap ▼]                                                  │
│                                                                         │
│              Tru Foe  QX    Eminent                                   │
│  Lyricism      ███    ██     ███     High ← → Low                     │
│  Wordplay      ███    ██     ███                                       │
│  Creativity    ███   ██      ███                                       │
│  Stage Pres.   ███   ██      ███                                       │
│  Crowd Ctrl    ███   ██      ███                                       │
│  Delivery      ███    ██    ████                                       │
│  Resilience    ████   ██    ███                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tab 3: Performance

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PERFORMANCE - Stats & Metrics                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  COMPREHENSIVE STATS COMPARISON                                        │
│  ┌────────────────────────┬──────────┬──────────┬──────────┐          │
│  │ STAT                   │ Tru Foe  │ QX       │ Eminent  │          │
│  ├────────────────────────┼──────────┼──────────┼──────────┤          │
│  │ RECORD                 │          │          │          │          │
│  │  Total Battles         │ 127 ─┐   │ 89  ─┐   │ 156 ─┐   │          │
│  │  Wins                  │ 84   │   │ 52  │   │ 103  │   │          │
│  │  Losses                │ 43 ──┘   │ 37  │   │ 53 ──┘   │          │
│  │  Win Rate (%)          │ 66.1%    │ 58.4%    │ 66.0%    │          │
│  │  Current Streak        │ +3       │ -1       │ +5       │          │
│  ├────────────────────────┼──────────┼──────────┼──────────┤          │
│  │ CHOKE STATS            │          │          │          │          │
│  │  Choke Rate (%)        │ 7.9      │ 6.2      │ 8.1      │          │
│  │  Avg Chokes/Battle     │ 0.42     │ 0.25     │ 0.48     │          │
│  │  Choke Consistency     │ 0.65     │ 0.52     │ 0.71     │          │
│  ├────────────────────────┼──────────┼──────────┼──────────┤          │
│  │ STUMBLE STATS          │          │          │          │          │
│  │  Stumble Rate (%)      │ 38.6     │ 41.2     │ 36.8     │          │
│  │  Avg Stumbles/Battle   │ 1.24     │ 1.38     │ 1.15     │          │
│  │  Stumble Consistency   │ 0.88     │ 0.95     │ 0.82     │          │
│  ├────────────────────────┼──────────┼──────────┼──────────┤          │
│  │ SCORING STATS          │          │          │          │          │
│  │  Average Score         │ 6.82     │ 6.45     │ 6.95     │ ✓ Highest│
│  │  Peak Score            │ 8.41     │ 8.12     │ 8.63     │ ✓ Highest│
│  │  Consistency Score     │ 7.12     │ 6.78     │ 7.25     │          │
│  │  Crowd Reaction (avg)  │ 78.3%    │ 72.1%    │ 81.5%    │ ✓ Highest│
│  ├────────────────────────┼──────────┼──────────┼──────────┤          │
│  │ LEAGUE BREAKDOWN       │          │          │          │          │
│  │  Small Room WR (%)     │ 68.2     │ 61.5     │ 64.3     │          │
│  │  Main Stage WR (%)     │ 63.8     │ 55.2     │ 67.6     │          │
│  │  Specialization        │ Balanced │ Mid-Foc. │ Main Foc.│          │
│  └────────────────────────┴──────────┴──────────┴──────────┘          │
│                                                                         │
│  Legend: ✓ = Highest value in column, ✗ = Lowest value               │
│  Hover any cell for detailed tooltip                                  │
│  Click column headers to sort                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tab 4: Badges

```
┌─────────────────────────────────────────────────────────────────────────┐
│ BADGES - Style & Mechanics                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  BADGE COMPARISON MATRIX                                               │
│  ┌──────────────────────────┬────────────┬────────────┬──────────────┐ │
│  │ Badge Name               │ Tru Foe    │ QX         │ Eminent      │ │
│  ├──────────────────────────┼────────────┼────────────┼──────────────┤ │
│  │ PERFORMANCE BADGES       │            │            │              │ │
│  │  Stage Presence          │     ✓      │            │      ✓       │ │
│  │  Crowd Control           │     ✓      │      ✓     │              │ │
│  │  Charisma                │            │            │      ✓       │ │
│  ├──────────────────────────┼────────────┼────────────┼──────────────┤ │
│  │ CONTENT BADGES           │            │            │              │ │
│  │  Storytelling            │     ✓      │      ✓     │      ✓       │ │
│  │  Wordplay                │     ✓      │            │      ✓       │ │
│  │  Angles                  │            │      ✓     │              │ │
│  │  Comedy                  │            │            │      ✓       │ │
│  ├──────────────────────────┼────────────┼────────────┼──────────────┤ │
│  │ DELIVERY BADGES          │            │            │              │ │
│  │  Aggressive              │     ✓      │      ✓     │              │ │
│  │  Smooth Flow             │     ✓      │            │      ✓       │ │
│  │  Speed Rapping           │            │      ✓     │              │ │
│  ├──────────────────────────┼────────────┼────────────┼──────────────┤ │
│  │ REPUTATION BADGES        │            │            │              │ │
│  │  Respected Veteran       │     ✓      │            │      ✓       │ │
│  │  Crowd Favorite          │     ✓      │            │      ✓       │ │
│  │  Known Choker            │            │            │              │ │
│  ├──────────────────────────┼────────────┼────────────┼──────────────┤ │
│  │ PLAYSTYLE BADGES         │            │            │              │ │
│  │  Technical               │     ✓      │            │      ✓       │ │
│  │  Freestyle               │            │      ✓     │              │ │
│  │  Balanced                │     ✓      │            │      ✓       │ │
│  └──────────────────────────┴────────────┴────────────┴──────────────┘ │
│                                                                         │
│  Badge Count: Tru Foe (8) | QX (6) | Eminent (9)                      │
│                                                                         │
│  [View as Heatmap ▼]  [Show Badge Effects ▼]                          │
│                                                                         │
│  BADGE EFFECT DETAILS (Expand each badge for mechanical effects)      │
│                                                                         │
│  Storytelling ▼                                                        │
│  ├─ Category: Content                                                 │
│  ├─ Rarity: Common                                                    │
│  ├─ Effects:                                                          │
│  │  • Lyricism: 1.1x (10% boost)                                     │
│  │  • Creativity: 1.1x                                               │
│  │  • Writing Prep Efficiency: 1.15x                                 │
│  │  • Consistency: +0.5 points                                       │
│  └─ Description: Master of narrative-driven rebuttals and...          │
│                                                                         │
│  Stage Presence ▼                                                      │
│  ├─ Category: Performance                                             │
│  ├─ Rarity: Rare                                                      │
│  ├─ Effects:                                                          │
│  │  • Stage Presence: 1.15x                                          │
│  │  • Crowd Control: 1.10x                                           │
│  │  • Main Stage Bonus: +5%                                          │
│  │  • Performance Prep: 1.15x efficiency                             │
│  └─ Description: Commands attention on stage, natural performer...    │
│                                                                         │
│  [More Badges...]                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tab 5: Trends

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TRENDS - Historical Performance & League Analysis                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  WIN RATE TREND (Last 50 Battles)                                      │
│                                                                         │
│  100%|                                                                 │
│      |                        ╱╲                                       │
│   80%|      ╱──╲             ╱  ╲         ╱───                         │
│      |     ╱    ╲            ╱    ╲       ╱   ╱                        │
│   60%|    ╱      ╲          ╱      ╲     ╱   ╱  ← Tru Foe (orange)    │
│      |   ╱        ╲────────╱        ╲___╱   ╱   ← QX (cyan)           │
│   40%|  ╱                                    ╱   ← Eminent (magenta)   │
│      | ╱                                    ╱                          │
│   20%|_______________________________________________________          │
│      |                                                                 │
│      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────────     │
│        1   11   21   31   41   51   61   71   81   91 Battle #        │
│                                                                         │
│  [Rolling Window: 5 battles] [10 battles] [20 battles]                │
│  [⊡ Show Trend Line]                                                  │
│                                                                         │
│  TREND ANALYSIS                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Tru Foe:                                                        │ │
│  │  Current Trend: → Stable (win rate hovering 65-68%)             │ │
│  │  Recent Momentum: ↑ Slight improvement (last 5 battles)         │ │
│  │  Projection: Estimated 66% win rate in 10 battles              │ │
│  │  Consistency: 8/10 (predictable performer)                      │ │
│  │                                                                 │ │
│  │ QX:                                                             │ │
│  │  Current Trend: ↓ Declining (win rate 58→55%)                  │ │
│  │  Recent Momentum: ↓ Struggling (last 5 battles: 2-3)            │ │
│  │  Projection: Estimated 53% win rate in 10 battles              │ │
│  │  Consistency: 5/10 (inconsistent, high variance)                │ │
│  │                                                                 │ │
│  │ Eminent:                                                        │ │
│  │  Current Trend: ↑ Improving (win rate 62→68%)                  │ │
│  │  Recent Momentum: ↑↑ Hot streak (last 5 battles: 5-0!)         │ │
│  │  Projection: Estimated 70% win rate in 10 battles              │ │
│  │  Consistency: 7/10 (fairly predictable)                         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  LEAGUE PERFORMANCE BREAKDOWN                                          │
│                                                                         │
│  100%|                                                                │
│      |  ┌────┐           ┌────┐           ┌────┐                     │
│   80%|  │ SR │ MS        │ SR │ MS        │ SR │ MS                  │
│      |  │ ┌──┘           │    │ ┌──────┐  │ ┌──┘                      │
│   60%|  │ │    ┌──────┐  │    │ │      │  │ │  ┌──────┐              │
│      |  │ │    │      │  │    │ │      │  │ │  │      │              │
│   40%|  └─┘    │      │  └────┘ │      │  └─┘  │      │              │
│      |         │      │         │      │       │      │              │
│    0%|_________└──────┘_________└──────┘_______└──────┘______        │
│         Tru Foe        QX              Eminent                       │
│                                                                         │
│  SPECIALIZATION ANALYSIS                                               │
│  ┌──────────────────┬──────────────────┬──────────────────┐          │
│  │ Battler          │ League Pref      │ Analysis         │          │
│  ├──────────────────┼──────────────────┼──────────────────┤          │
│  │ Tru Foe          │ Balanced         │ SR: 68.2%        │          │
│  │                  │ (Diff: 4.4%)     │ MS: 63.8%        │          │
│  ├──────────────────┼──────────────────┼──────────────────┤          │
│  │ QX               │ Mid-Tier Focus   │ SR: 61.5%        │          │
│  │                  │ (Diff: 6.3%)     │ MS: 55.2%        │          │
│  ├──────────────────┼──────────────────┼──────────────────┤          │
│  │ Eminent          │ Main Stage Spec. │ SR: 64.3%        │          │
│  │                  │ (Diff: 3.3%)     │ MS: 67.6%        │          │
│  └──────────────────┴──────────────────┴──────────────────┘          │
│                                                                         │
│  Legend: SR = Small Room | MS = Main Stage                            │
│  Specialist: Difference > 10% | Well-Rounded: < 10% difference       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tab 6: Analysis (Insights)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ANALYSIS - Insights & Recommendations                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  OUTLIER DETECTION                                                     │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ ⚠️  Eminent's Peak Score (8.63) is exceptionally high            │ │
│  │    (99th percentile vs all AI battlers)                          │ │
│  │    → Consider: Haymaker bonus? High creativity synergy?          │ │
│  │                                                                  │ │
│  │ ⚠️  QX's Stumble Rate (41.2%) above target (35%)                │ │
│  │    → Consider: Check performance attribute distribution          │ │
│  │                Verify prep distribution in recent battles       │ │
│  │                                                                  │ │
│  │ ✓   Tru Foe's Choke Rate (7.9%) within target range (5-10%)     │ │
│  │    → Balanced resilience and prep profile                       │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  BALANCE ANALYSIS                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ BADGE SYNERGIES DETECTED                                         │ │
│  │                                                                  │ │
│  │ Strong Combo: Stage Presence + Crowd Control + Charisma          │ │
│  │  Found in: Eminent                                               │ │
│  │  Impact: +15.2% win rate vs single-badge battlers               │ │
│  │  Status: ✓ BALANCED (only 2 of 20 AI have this combo)          │ │
│  │                                                                  │ │
│  │ Potential Overlap: Storytelling + Wordplay (7 of 20 have both)  │ │
│  │  Recommendation: Consider separate mechanical niches            │ │
│  │  OR accept as viable meta choice                                │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ATTRIBUTE EFFECTIVENESS                                               │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ STRONGEST ATTRIBUTES (by win rate correlation)                  │ │
│  │                                                                  │ │
│  │ 1. Stage Presence: +0.87 correlation (p < 0.01)               │ │
│  │    Every +1 point → +1.2% win rate                             │ │
│  │                                                                  │ │
│  │ 2. Delivery: +0.82 correlation                                 │ │
│  │    Every +1 point → +1.0% win rate                             │ │
│  │                                                                  │ │
│  │ 3. Wordplay: +0.71 correlation                                 │ │
│  │    Every +1 point → +0.8% win rate                             │ │
│  │                                                                  │ │
│  │ 4. Creativity: +0.65 correlation                               │ │
│  │    Every +1 point → +0.6% win rate                             │ │
│  │                                                                  │ │
│  │ NOTE: Stage Presence is 2x more effective than Creativity      │ │
│  │ Recommendation: Consider small buff to writing attributes       │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  COMPARISON SUMMARY                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ These 3 battlers represent different tiers:                     │ │
│  │                                                                  │ │
│  │ TIER PROGRESSION:                                               │ │
│  │ QX (Mid) → Tru Foe (Top) → Eminent (Top+)                      │ │
│  │                                                                  │ │
│  │ KEY DIFFERENCES:                                                │ │
│  │ • Rating gap: QX-Tru Foe = 235 points → 7.7% win rate delta    │ │
│  │ • Attribute gap: 1.5-2.0 points per skill                      │ │
│  │ • Badge count: Similar (6-9 badges), but Eminent has rarer    │ │
│  │                                                                  │ │
│  │ DIFFICULTY SCALING:                                             │ │
│  │ QX feels appropriately weaker in both leagues                  │ │
│  │ Tru Foe-Eminent gap is narrow (good competitive tier)         │ │
│  │ Recommendation: ✓ WELL BALANCED at this tier                   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  [GENERATE DETAILED REPORT] [EXPORT INSIGHTS] [COMPARE TO BASELINE]  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Selection Interface Detail

```
┌─────────────────────────────────────────────────────────────────────────┐
│ BATTLER SELECTION                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Search: ___________________] [Clear All] [Reset to Default]          │
│                                                                         │
│  QUICK FILTERS (Collapsible)                                           │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Tier:     [✓ Low] [✓ Mid] [✓ Top] [✓ God]                       │ │
│  │ Rating:   1200 ●──────────────────●───────● 2500               │ │
│  │ League:   [✓ Small Room] [✓ Main Stage]                         │ │
│  │ Badge:    [Select Badge...] ▼ ────────────────────────────────  │ │
│  │ Presets:  [Top 5] [Recent 10] [Tier Comparison] [Balance]       │ │
│  │                                                                  │ │
│  │           [APPLY] [CLEAR FILTERS]                               │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  AVAILABLE BATTLERS (Filtered Results)                                 │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ [×] Tru Foe (AI) | Rating 1847 | Top | Main Stage Specialist   │ │
│  │ [×] QX (AI) | Rating 1612 | Mid | Balanced                     │ │
│  │ [×] Eminent (AI) | Rating 1923 | Top | Small Room Specialist   │ │
│  │ [ ] Zek (AI) | Rating 1756 | Top | Freestyle Master            │ │
│  │ [ ] Lyfe (AI) | Rating 1498 | Mid | Aggressive Focus           │ │
│  │ [ ] GOAT (AI) | Rating 1989 | God | All-rounder                │ │
│  │                                                                  │ │
│  │ [Load More...] (50 of 120 shown)                                │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  SELECTED BATTLERS (3/10)                                              │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ ┌───────────────────────────────────┐                           │ │
│  │ │  Tru Foe                          │  [×]                      │ │
│  │ │  Rating: 1847                     │                           │ │
│  │ │  Tier: Top                        │                           │ │
│  │ │  Wins: 84/127 (66.1%)             │                           │ │
│  │ └───────────────────────────────────┘                           │ │
│  │                                                                  │ │
│  │ ┌───────────────────────────────────┐                           │ │
│  │ │  QX                               │  [×]                      │ │
│  │ │  Rating: 1612                     │                           │ │
│  │ │  Tier: Mid                        │                           │ │
│  │ │  Wins: 52/89 (58.4%)              │                           │ │
│  │ └───────────────────────────────────┘                           │ │
│  │                                                                  │ │
│  │ ┌───────────────────────────────────┐                           │ │
│  │ │  Eminent                          │  [×]                      │ │
│  │ │  Rating: 1923                     │                           │ │
│  │ │  Tier: Top                        │                           │ │
│  │ │  Wins: 103/156 (66.0%)            │                           │ │
│  │ └───────────────────────────────────┘                           │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                        [COMPARE THESE BATTLERS]                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Export Panel Detail

```
┌─────────────────────────────────────────────────────────────────────────┐
│ EXPORT & SAVE OPTIONS                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  EXPORT CURRENT COMPARISON                                             │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Format:  [● CSV] [○ JSON] [○ PDF]                               │ │
│  │                                                                  │ │
│  │ Include:  [✓] Attributes                                         │ │
│  │           [✓] Performance Metrics                                │ │
│  │           [✓] Badge Information                                  │ │
│  │           [✓] Win Rate Trends                                    │ │
│  │           [✓] League Breakdown                                   │ │
│  │           [✓] Metadata (export date, filters)                    │ │
│  │                                                                  │ │
│  │                      [DOWNLOAD] [COPY TO CLIPBOARD]              │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  SAVE THIS COMPARISON                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Save As:  [Top Tier Balance Check (Nov 30)] ← Auto-generated    │ │
│  │                                                                  │ │
│  │           [SAVE] [SAVE & SHARE]                                 │ │
│  │                                                                  │ │
│  │ Saved Comparisons (10/10 slots used):                           │ │
│  │  1. ● Top Tier Balance Check (Nov 30)       [Load] [×]         │ │
│  │  2. ○ Badge Impact Study (Nov 28)           [Load] [×]         │ │
│  │  3. ○ Tier Progression (Nov 25)             [Load] [×]         │ │
│  │  4. ○ All Active Battlers (Nov 20)          [Load] [×]         │ │
│  │  5. ○ Creative Builds Comparison (Nov 15)   [Load] [×]         │ │
│  │  ... 5 more [Show All]                                         │ │
│  │                                                                  │ │
│  │ [Delete Oldest] [Manage Saved] [Clear All]                     │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  CSV PREVIEW                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Export Date,2025-11-30                                           │ │
│  │ Battlers,Tru Foe,QX,Eminent                                      │ │
│  │ Filters,Tier=Top,Rating>1600,League=Both                         │ │
│  │                                                                  │ │
│  │ Metric,Tru Foe,QX,Eminent                                        │ │
│  │ Rating,1847,1612,1923                                            │ │
│  │ Win Rate,66.1%,58.4%,66.0%                                       │ │
│  │ Choke Rate,7.9%,6.2%,8.1%                                        │ │
│  │ Avg Score,6.82,6.45,6.95                                         │ │
│  │ Peak Score,8.41,8.12,8.63                                        │ │
│  │ Small Room WR,68.2%,61.5%,64.3%                                  │ │
│  │ Main Stage WR,63.8%,55.2%,67.6%                                  │ │
│  │ Stage Presence Badge,✓,×,✓                                       │ │
│  │ Storytelling Badge,✓,✓,✓                                         │ │
│  │ ... more rows                                                   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Color & Layout Reference

### Theme Colors
```
Background:  #09090b (bg-zinc-950)
Cards:       #18181b (bg-zinc-900)
Borders:     #27272a (border-zinc-800)
Text Primary: #f4f4f5 (text-zinc-100)
Text Secondary: #a1a1a6 (text-zinc-500)
Accent Orange: #f97316 (bg-orange-500)
Success Green: #22c55e (bg-green-500)
Warning Yellow: #eab308 (bg-yellow-500)
Error Red: #ef4444 (bg-red-500)
```

### Typography
```
Headers: font-black uppercase tracking-tighter (24-32px)
Subheaders: font-bold uppercase tracking-wider (16-20px)
Body: font-bold uppercase tracking-wider (14px)
Labels: text-xs uppercase tracking-wide (12px)
Caption: text-xs gray text-zinc-500 (11px)
```

### Spacing
```
Container max-width: 80rem (max-w-7xl)
Padding: 1.5rem (px-6)
Gap between sections: 1rem (gap-4)
Margin between items: 1rem (space-y-4)
Card padding: 1.5rem
Grid gap: 1rem
```

---

**Document Version**: 1.0
**Audience**: Developers implementing the Battler Comparison Tool
**Purpose**: Visual reference for UI/UX implementation
