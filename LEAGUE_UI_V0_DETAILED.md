# LEAGUE SYSTEM - COMPLETE FRONTEND SPECIFICATION

## CRITICAL: Leagues are the core competitive structure

The game has 2 main leagues with different mechanics. Players need to understand league differences to make strategic decisions about where to battle.

---

# PART 1: THE 2 LEAGUES - FULL PROFILES

## 1. SMALL ROOM CIRCUIT
```
Name:           Small Room Circuit
Slug:           small-room-circuit
Tagline:        "Where Pen Game Matters Most"
Logo:           [PLACEHOLDER - Add league logo here]
Primary Color:  #F97316 (orange-500)
Secondary:      #EA580C (orange-600)

Round Length:   2 minutes (120 seconds)
Segments:       4 per round
Rounds:         3 per battle

JUDGING WEIGHTS:
┌─────────────────────────────────┐
│ Writing:           60%         │
│ Performance:       20%         │
│ Crowd Reaction:    20%         │
└─────────────────────────────────┘

CROWD MECHANICS:
- Base Crowd Factor: 0.85 (crowds are 15% less reactive)
- Typical Venue Size: 20-200 people
- Crowd Style: "Reserved but appreciative - they analyze bars"

PERSONALITY STYLE: Technical
- Audience favors lyricism over delivery
- Complex schemes get extra appreciation
- Performance flash without content falls flat

AUDIENCE PREFERENCES (0-10):
- Lyricism:          9
- Wordplay:          8
- Storytelling:      6
- Delivery:          4
- Crowd Engagement:  3

PRESTIGE LEVEL: 7/10
BASE PAYOUT: $500

DESCRIPTION:
"The Small Room Circuit is where pen game reigns supreme. Intimate venues,
knowledgeable crowds, and 2-minute rounds that expose who really writes.
If you can't scheme, you can't win here. Performance is secondary - bring
your best bars or stay home."

WHAT WINS HERE:
• Complex multi-syllabic rhyme schemes
• Dense wordplay and double meanings
• Technical precision over flashy delivery
• Writing preparation pays off big

WHAT STRUGGLES HERE:
• Pure performance battlers
• Crowd-pleasing antics without substance
• Aggressive delivery without bars to back it up
• Freestylers who don't prepare
```

## 2. MAIN STAGE ARENA
```
Name:           Main Stage Arena
Slug:           main-stage-arena
Tagline:        "Where Legends Are Made"
Logo:           [PLACEHOLDER - Add league logo here]
Primary Color:  #EAB308 (yellow-500)
Secondary:      #CA8A04 (yellow-600)

Round Length:   3 minutes (180 seconds)
Segments:       6 per round
Rounds:         3 per battle

JUDGING WEIGHTS:
┌─────────────────────────────────┐
│ Writing:           40%         │
│ Performance:       35%         │
│ Crowd Reaction:    25%         │
└─────────────────────────────────┘

CROWD MECHANICS:
- Base Crowd Factor: 1.15 (crowds are 15% MORE reactive)
- Typical Venue Size: 500-5000 people
- Crowd Style: "Loud, reactive, entertainment-focused"

PERSONALITY STYLE: Diverse
- Audience appreciates both writing AND performance
- Big moments get massive reactions
- Entertainment value matters

AUDIENCE PREFERENCES (0-10):
- Lyricism:          6
- Wordplay:          5
- Storytelling:      7
- Delivery:          8
- Crowd Engagement:  9

PRESTIGE LEVEL: 9/10
BASE PAYOUT: $2,000

DESCRIPTION:
"The Main Stage Arena is where careers are made or broken. Massive crowds,
bright lights, and 3-minute rounds that demand both pen AND presence.
Can you rock a crowd of thousands? Can you deliver when the pressure is
highest? This is the big league."

WHAT WINS HERE:
• Strong stage presence and delivery
• Crowd control and engagement
• Memorable haymaker moments
• Consistency over 3 long rounds

WHAT STRUGGLES HERE:
• Quiet, technical writers
• Battlers who can't project
• Stage fright under pressure
• Low energy performances
```

---

# PART 2: UI COMPONENTS

## 2.1 LEAGUE LOGO COMPONENT

```tsx
// components/leagues/LeagueLogo.tsx

interface LeagueLogoProps {
  league: 'small-room-circuit' | 'main-stage-arena';
  size: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
}

// Size mappings
const SIZES = {
  sm: 'w-8 h-8',      // 32px - inline mentions
  md: 'w-12 h-12',    // 48px - cards
  lg: 'w-20 h-20',    // 80px - headers
  xl: 'w-32 h-32',    // 128px - league page hero
};

// Render:
<div className="flex items-center gap-3">
  <div className={`${SIZES[size]} rounded-lg overflow-hidden border-2`}
       style={{ borderColor: LEAGUE_COLORS[league].primary }}>
    {/* If logo exists */}
    <img
      src={`/logos/leagues/${league}.png`}
      alt={LEAGUE_NAMES[league]}
      className="w-full h-full object-contain bg-zinc-900 p-1"
    />

    {/* Fallback if no logo */}
    {!hasLogo && (
      <div
        className={`${SIZES[size]} flex items-center justify-center font-black text-white`}
        style={{ backgroundColor: LEAGUE_COLORS[league].primary }}
      >
        {league === 'small-room-circuit' ? 'SRC' : 'MSA'}
      </div>
    )}
  </div>

  {showName && (
    <span className="font-black uppercase text-white">
      {LEAGUE_NAMES[league]}
    </span>
  )}
</div>
```

**Logo Placeholder Design:**
```
Small Room Circuit:
┌────────────────┐
│                │
│     🎤         │
│     SRC        │
│                │
└────────────────┘
Orange background, mic icon

Main Stage Arena:
┌────────────────┐
│                │
│     👑         │
│     MSA        │
│                │
└────────────────┘
Yellow/gold background, crown icon
```

---

## 2.2 LEAGUE BADGE COMPONENT

Small inline badge showing league affiliation.

```tsx
// components/leagues/LeagueBadge.tsx

interface LeagueBadgeProps {
  league: 'small-room-circuit' | 'main-stage-arena';
  variant: 'pill' | 'tag' | 'icon-only';
}

// PILL variant (rounded, colored background):
┌─────────────────────────┐
│ 🎤 SMALL ROOM CIRCUIT   │
└─────────────────────────┘

// TAG variant (square, outline):
┌─────────────────────────┐
│ SMALL ROOM CIRCUIT      │
└─────────────────────────┘

// ICON-ONLY variant:
[🎤]

// Render (pill):
<span
  className="inline-flex items-center gap-1 px-3 py-1 rounded-full
             text-xs font-black uppercase"
  style={{
    backgroundColor: `${LEAGUE_COLORS[league].primary}20`,
    color: LEAGUE_COLORS[league].primary,
    border: `1px solid ${LEAGUE_COLORS[league].primary}40`,
  }}
>
  <span>{LEAGUE_ICONS[league]}</span>
  <span>{LEAGUE_NAMES[league]}</span>
</span>
```

---

## 2.3 LEAGUE CARD COMPONENT

Used in league selection and league list pages.

```tsx
// components/leagues/LeagueCard.tsx

interface LeagueCardProps {
  league: League;
  selected?: boolean;
  onClick?: () => void;
  variant: 'selectable' | 'display' | 'compact';
}

// SELECTABLE variant (for onboarding/selection):
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Logo-lg]  SMALL ROOM CIRCUIT                             │
│             "Where Pen Game Matters Most"                   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Round Length: 2 min  │  Focus: WRITING                    │
│  Segments: 4          │  Crowd: Reserved                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ JUDGING WEIGHTS                                      │   │
│  │ Writing:      ████████████░░░░░░░░  60%            │   │
│  │ Performance:  ████░░░░░░░░░░░░░░░░  20%            │   │
│  │ Crowd:        ████░░░░░░░░░░░░░░░░  20%            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ✓ Best for technical writers                              │
│  ✓ Intimate crowds appreciate bars                         │
│  ✗ Performance alone won't win                             │
│                                                             │
│  [SELECT THIS LEAGUE]                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
Border changes to league color when selected

// DISPLAY variant (for viewing):
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Logo-lg]  SMALL ROOM CIRCUIT                             │
│             "Where Pen Game Matters Most"                   │
│                                                             │
│  45 Battlers  │  234 Battles  │  Avg Rating: 1340          │
│                                                             │
│  [VIEW LEAGUE →]                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

// COMPACT variant (inline):
┌─────────────────────────────────────────┐
│ [Logo-sm] Small Room Circuit   [View →] │
└─────────────────────────────────────────┘
```

**Code (selectable):**
```tsx
<div
  className={`bg-zinc-900 border-2 p-6 cursor-pointer transition-all
              ${selected
                ? 'border-orange-500 bg-orange-500/5'
                : 'border-zinc-800 hover:border-zinc-600'}`}
  onClick={onClick}
>
  {/* Header */}
  <div className="flex items-start gap-4 mb-4">
    <LeagueLogo league={league.slug} size="lg" />
    <div>
      <h3 className="text-2xl font-black uppercase text-white">
        {league.name}
      </h3>
      <p className="text-zinc-400 italic">"{league.tagline}"</p>
    </div>
  </div>

  {/* Quick Stats */}
  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
    <div>
      <span className="text-zinc-500">Round Length:</span>
      <span className="text-white font-bold ml-2">{league.roundDuration / 60} min</span>
    </div>
    <div>
      <span className="text-zinc-500">Focus:</span>
      <span className="text-orange-500 font-bold ml-2 uppercase">{league.focus}</span>
    </div>
  </div>

  {/* Weights */}
  <div className="bg-zinc-800/50 p-4 rounded mb-4">
    <div className="text-xs font-bold uppercase text-zinc-400 mb-2">Judging Weights</div>
    <WeightBar label="Writing" value={league.writingWeight} color="blue" />
    <WeightBar label="Performance" value={league.performanceWeight} color="purple" />
    <WeightBar label="Crowd" value={league.crowdWeight} color="green" />
  </div>

  {/* Pros/Cons */}
  <div className="space-y-1 text-sm mb-4">
    {league.pros.map(pro => (
      <div key={pro} className="text-green-400">✓ {pro}</div>
    ))}
    {league.cons.map(con => (
      <div key={con} className="text-red-400">✗ {con}</div>
    ))}
  </div>

  {/* Select Button */}
  <button
    className={`w-full py-3 font-black uppercase text-sm transition-all
                ${selected
                  ? 'bg-orange-500 text-black'
                  : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
  >
    {selected ? '✓ SELECTED' : 'SELECT THIS LEAGUE'}
  </button>
</div>
```

---

## 2.4 WEIGHT BAR COMPONENT

Visual bar showing judging weight percentages.

```tsx
// components/leagues/WeightBar.tsx

interface WeightBarProps {
  label: string;
  value: number; // 0-100
  color: 'blue' | 'purple' | 'green' | 'orange' | 'yellow';
  showValue?: boolean;
}

// Visual:
Writing:      ████████████░░░░░░░░  60%

// Render:
<div className="flex items-center gap-2 mb-2">
  <span className="w-24 text-sm text-zinc-400">{label}:</span>
  <div className="flex-1 h-3 bg-zinc-700 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full bg-${color}-500`}
      style={{ width: `${value}%` }}
    />
  </div>
  {showValue && (
    <span className="w-12 text-right text-sm font-bold text-white">{value}%</span>
  )}
</div>
```

---

## 2.5 AUDIENCE PREFERENCE COMPONENT

Shows what the crowd values.

```tsx
// components/leagues/AudiencePreferences.tsx

interface AudiencePreferencesProps {
  preferences: {
    lyricism: number;      // 0-10
    wordplay: number;
    storytelling: number;
    delivery: number;
    crowdEngagement: number;
  };
}

// Visual:
┌─────────────────────────────────────────┐
│ WHAT THE CROWD WANTS                    │
├─────────────────────────────────────────┤
│ Lyricism:      ████████░░  8            │
│ Wordplay:      ████████░░  8            │
│ Storytelling:  ██████░░░░  6            │
│ Delivery:      ████░░░░░░  4            │
│ Engagement:    ███░░░░░░░  3            │
│                                         │
│ "This crowd analyzes bars"              │
└─────────────────────────────────────────┘

// Render:
<div className="bg-zinc-800/50 p-4 rounded">
  <h4 className="text-sm font-bold uppercase text-zinc-400 mb-3">
    What The Crowd Wants
  </h4>

  {Object.entries(preferences).map(([key, value]) => (
    <div key={key} className="flex items-center gap-2 mb-2">
      <span className="w-28 text-sm text-zinc-400 capitalize">
        {formatLabel(key)}:
      </span>
      <div className="flex gap-0.5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-4 rounded-sm ${
              i < value ? 'bg-orange-500' : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  ))}

  <p className="text-xs text-zinc-500 italic mt-3">
    {getCrowdDescription(preferences)}
  </p>
</div>
```

---

## 2.6 LEAGUE COMPARISON COMPONENT

Side-by-side comparison of both leagues.

```tsx
// components/leagues/LeagueComparison.tsx

// Visual:
┌─────────────────────────────────────────────────────────────────────────┐
│ CHOOSE YOUR LEAGUE                                                      │
├─────────────────────────────────┬───────────────────────────────────────┤
│                                 │                                       │
│  [Logo]                         │  [Logo]                               │
│  SMALL ROOM CIRCUIT             │  MAIN STAGE ARENA                     │
│  "Where Pen Game Matters"       │  "Where Legends Are Made"             │
│                                 │                                       │
│  Round: 2 min (4 segments)      │  Round: 3 min (6 segments)            │
│                                 │                                       │
│  Writing:     60% ████████████  │  Writing:     40% ████████            │
│  Performance: 20% ████          │  Performance: 35% ███████             │
│  Crowd:       20% ████          │  Crowd:       25% █████               │
│                                 │                                       │
│  Crowd: Reserved (0.85x)        │  Crowd: Reactive (1.15x)              │
│  Payout: $500                   │  Payout: $2,000                       │
│  Prestige: ⭐⭐⭐⭐⭐⭐⭐             │  Prestige: ⭐⭐⭐⭐⭐⭐⭐⭐⭐              │
│                                 │                                       │
│  BEST FOR:                      │  BEST FOR:                            │
│  ✓ Technical writers            │  ✓ Performance battlers               │
│  ✓ Scheme specialists           │  ✓ Crowd pleasers                     │
│  ✓ Pen-first approach           │  ✓ Stage presence masters             │
│                                 │                                       │
│  [SELECT]                       │  [SELECT]                             │
│                                 │                                       │
└─────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2.7 LEAGUE HEADER/HERO COMPONENT

For the league detail page.

```tsx
// components/leagues/LeagueHeader.tsx

interface LeagueHeaderProps {
  league: League;
  stats: {
    totalBattlers: number;
    totalBattles: number;
    avgRating: number;
    activeBattlesThisWeek: number;
  };
}

// Visual:
┌────────────────────────────────────────────────────────────────────────────┐
│ [GRADIENT BACKGROUND - League Colors]                                      │
│                                                                            │
│  [Logo-xl]                                                                 │
│                                                                            │
│  SMALL ROOM CIRCUIT                                                        │
│  "Where Pen Game Matters Most"                                             │
│                                                                            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │    45      │ │    234     │ │   1,340    │ │     12     │             │
│  │  Battlers  │ │  Battles   │ │ Avg Rating │ │ This Week  │             │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘             │
│                                                                            │
│  Style: TECHNICAL  │  Prestige: ⭐⭐⭐⭐⭐⭐⭐  │  Payout: $500             │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

// Render:
<div
  className="relative overflow-hidden"
  style={{
    background: `linear-gradient(135deg, ${league.color}20, transparent)`,
  }}
>
  <div className="max-w-5xl mx-auto px-6 py-12">
    {/* Back button */}
    <Link href="/leagues" className="text-orange-500 text-sm font-bold uppercase mb-4 block">
      ← All Leagues
    </Link>

    {/* Logo and Title */}
    <div className="flex items-center gap-6 mb-6">
      <LeagueLogo league={league.slug} size="xl" />
      <div>
        <h1 className="text-4xl font-black uppercase text-white">
          {league.name}
        </h1>
        <p className="text-xl text-zinc-400 italic">
          "{league.tagline}"
        </p>
      </div>
    </div>

    {/* Stats Row */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <StatBox label="Battlers" value={stats.totalBattlers} />
      <StatBox label="Total Battles" value={stats.totalBattles} />
      <StatBox label="Avg Rating" value={stats.avgRating} />
      <StatBox label="This Week" value={stats.activeBattlesThisWeek} />
    </div>

    {/* Quick Info */}
    <div className="flex items-center gap-6 text-sm">
      <div>
        <span className="text-zinc-500">Style:</span>
        <span className="text-orange-500 font-bold uppercase ml-2">{league.personalityStyle}</span>
      </div>
      <div>
        <span className="text-zinc-500">Prestige:</span>
        <span className="ml-2">{renderStars(league.prestigeLevel)}</span>
      </div>
      <div>
        <span className="text-zinc-500">Base Payout:</span>
        <span className="text-green-500 font-bold ml-2">${league.basePayout}</span>
      </div>
    </div>
  </div>
</div>
```

---

## 2.8 LEAGUE ROSTER COMPONENT

Shows battlers in a league.

```tsx
// components/leagues/LeagueRoster.tsx

interface LeagueRosterProps {
  battlers: BattlerSummary[];
  sortBy: 'rating' | 'wins' | 'win_rate' | 'recent';
  onSortChange: (sort: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

// Visual:
┌────────────────────────────────────────────────────────────────────────────┐
│ LEAGUE ROSTER (45 Battlers)                                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ Sort: [Rating ▼] [Wins] [Win Rate] [Recent]                               │
│                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │ #1  [Avatar]  CODED FLUX         1890    18-4   82%   GOD   [View →]  ││
│ ├────────────────────────────────────────────────────────────────────────┤│
│ │ #2  [Avatar]  PENMASTER JONES    1720    14-6   70%   TOP   [View →]  ││
│ ├────────────────────────────────────────────────────────────────────────┤│
│ │ #3  [Avatar]  SCHEME KING        1680    12-5   71%   TOP   [View →]  ││
│ ├────────────────────────────────────────────────────────────────────────┤│
│ │ #4  [Avatar]  LYRIC STORM        1620    10-6   63%   TOP   [View →]  ││
│ └────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ [LOAD MORE...]                                                            │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

// Table columns:
// Rank | Avatar | Name | Rating | Record | Win% | Tier | Action
```

---

## 2.9 LEAGUE MECHANICS EXPLAINER

Educational component showing how the league works.

```tsx
// components/leagues/LeagueMechanics.tsx

// Visual:
┌────────────────────────────────────────────────────────────────────────────┐
│ HOW THIS LEAGUE WORKS                                                      │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ [▼] Round Structure                                                        │
│     • 2-minute rounds (120 seconds each)                                   │
│     • 4 segments per round (30 seconds each)                               │
│     • 3 rounds per battle                                                  │
│     • Total battle time: 6 minutes                                         │
│                                                                            │
│ [▼] How Rounds Are Judged                                                  │
│     • Writing (60%): Lyricism, wordplay, creativity, flow                 │
│     • Performance (20%): Stage presence, delivery, crowd control          │
│     • Crowd Reaction (20%): How the crowd responds to your bars           │
│     • Winner: Best 2 out of 3 rounds                                      │
│                                                                            │
│ [▼] Crowd Factor (0.85x)                                                   │
│     • Crowds in this league are 15% LESS reactive than average            │
│     • Your bars need to be FIRE to get big reactions                      │
│     • Reserved, analytical audiences appreciate technical skill            │
│                                                                            │
│ [▼] Tips for Success                                                       │
│     • Focus on WRITING prep days before battles                           │
│     • Bring complex schemes and wordplay                                   │
│     • Don't rely on crowd energy to carry you                             │
│     • Consistency matters more than haymakers here                         │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

# PART 3: PAGES

## 3.1 LEAGUES LIST PAGE (`/leagues`)

```tsx
// app/leagues/page.tsx

// Layout:
┌────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Dashboard                                                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ THE LEAGUES                                                                │
│ Choose where you want to compete                                           │
│                                                                            │
│ ───────────────────────────────────────────────────────────────────────── │
│                                                                            │
│ ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│ │                                 │  │                                 │  │
│ │  SMALL ROOM CIRCUIT             │  │  MAIN STAGE ARENA               │  │
│ │  [LeagueCard - display]         │  │  [LeagueCard - display]         │  │
│ │                                 │  │                                 │  │
│ └─────────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                            │
│ ───────────────────────────────────────────────────────────────────────── │
│                                                                            │
│ QUICK COMPARISON                                                           │
│                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │                    Small Room       Main Stage                         ││
│ │ Round Length       2 min            3 min                              ││
│ │ Writing Weight     60%              40%                                ││
│ │ Performance        20%              35%                                ││
│ │ Crowd Factor       0.85x            1.15x                              ││
│ │ Base Payout        $500             $2,000                             ││
│ │ Prestige           ⭐⭐⭐⭐⭐⭐⭐          ⭐⭐⭐⭐⭐⭐⭐⭐⭐                       ││
│ └────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3.2 LEAGUE DETAIL PAGE (`/leagues/[slug]`)

```tsx
// app/leagues/[slug]/page.tsx

// Layout:
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│ [LEAGUE HEADER - LeagueHeader component]                                   │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ TABS: [Overview] [Roster] [Recent Battles] [News] [How It Works]          │
│                                                                            │
│ ═══════════════════════════════════════════════════════════════════════════│
│                                                                            │
│ [TAB CONTENT AREA]                                                         │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

// OVERVIEW TAB:
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│ ┌──────────────────────────────┐  ┌──────────────────────────────┐        │
│ │ JUDGING WEIGHTS              │  │ AUDIENCE PREFERENCES         │        │
│ │                              │  │                              │        │
│ │ [WeightBar components]       │  │ [AudiencePreferences]        │        │
│ │                              │  │                              │        │
│ └──────────────────────────────┘  └──────────────────────────────┘        │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ ABOUT THIS LEAGUE                                                     │  │
│ │                                                                       │  │
│ │ [League description text]                                            │  │
│ │                                                                       │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌──────────────────────────────┐  ┌──────────────────────────────┐        │
│ │ WHAT WINS HERE               │  │ WHAT STRUGGLES HERE          │        │
│ │ ✓ Complex schemes            │  │ ✗ Pure performance           │        │
│ │ ✓ Dense wordplay             │  │ ✗ Crowd-pleasing antics      │        │
│ │ ✓ Technical precision        │  │ ✗ Aggressive w/o bars        │        │
│ └──────────────────────────────┘  └──────────────────────────────┘        │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ LEAGUE STATISTICS                                                     │  │
│ │                                                                       │  │
│ │  Total Battles    Body Rate    Close Rate    Avg Crowd    Choke Rate │  │
│ │     234            22%          35%          72/100         8%       │  │
│ │                                                                       │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

// ROSTER TAB:
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│ [LeagueRoster component]                                                   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

// RECENT BATTLES TAB:
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│ RECENT BATTLES IN SMALL ROOM CIRCUIT                                       │
│                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │ Coded Flux vs Tru Foe        3-0    Nov 28    [View Battle →]         ││
│ ├────────────────────────────────────────────────────────────────────────┤│
│ │ Scheme King vs Lyric Storm   2-1    Nov 26    [View Battle →]         ││
│ ├────────────────────────────────────────────────────────────────────────┤│
│ │ Penmaster vs Wordsmith       2-1    Nov 24    [View Battle →]         ││
│ └────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

// NEWS TAB:
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│ LATEST NEWS FROM SMALL ROOM CIRCUIT                                        │
│                                                                            │
│ [ArticleCard list filtered by league]                                      │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

// HOW IT WORKS TAB:
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│ [LeagueMechanics component]                                                │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

# PART 4: NAVIGATION

## Main Nav Addition
```
[Dashboard] [Battles] [Prep] [Media] [Leagues] [Rankings] [Profile]
                                        │
                                        ├─ All Leagues
                                        ├─ Small Room Circuit
                                        └─ Main Stage Arena
```

## URL Structure
```
/leagues                          → Leagues list page
/leagues/small-room-circuit       → Small Room Circuit detail
/leagues/main-stage-arena         → Main Stage Arena detail
/leagues/[slug]/roster            → Full roster view
/leagues/[slug]/battles           → Recent battles
/leagues/[slug]/news              → League news
```

---

# PART 5: API ENDPOINTS

## GET /api/leagues
```typescript
{
  leagues: [
    {
      id: string;
      name: string;
      slug: string;
      tagline: string;
      logo_url: string | null;
      primary_color: string;
      round_duration_seconds: number;
      rounds_per_battle: number;
      writing_weight: number;
      performance_weight: number;
      crowd_reaction_weight: number;
      base_crowd_factor: number;
      personality_style: string;
      prestige_level: number;
      base_payout: number;
      audience_preferences: {
        lyricism: number;
        wordplay: number;
        storytelling: number;
        delivery: number;
        crowd_engagement: number;
      };
      stats: {
        total_battlers: number;
        total_battles: number;
        avg_rating: number;
      };
    }
  ]
}
```

## GET /api/leagues/[slug]
Full league details with stats, recent battles, top battlers.

## GET /api/leagues/[slug]/roster
Paginated list of battlers in this league.

## GET /api/leagues/[slug]/battles
Recent battles in this league.

## GET /api/leagues/[slug]/stats
League statistics (body rate, close rate, choke rate, etc.)

---

# PART 6: DATA CONSTANTS

```typescript
// lib/constants/leagues.ts

export const LEAGUES = {
  'small-room-circuit': {
    name: 'Small Room Circuit',
    slug: 'small-room-circuit',
    tagline: 'Where Pen Game Matters Most',
    icon: '🎤',
    primaryColor: '#F97316',
    secondaryColor: '#EA580C',
    roundDuration: 120,
    segmentsPerRound: 4,
    roundsPerBattle: 3,
    writingWeight: 60,
    performanceWeight: 20,
    crowdWeight: 20,
    crowdFactor: 0.85,
    personalityStyle: 'Technical',
    prestigeLevel: 7,
    basePayout: 500,
    audiencePreferences: {
      lyricism: 9,
      wordplay: 8,
      storytelling: 6,
      delivery: 4,
      crowdEngagement: 3,
    },
    pros: [
      'Technical writers thrive',
      'Intimate crowds appreciate bars',
      'Writing prep pays off',
    ],
    cons: [
      'Performance alone won\'t win',
      'Need dense content',
      'Lower payouts',
    ],
  },
  'main-stage-arena': {
    name: 'Main Stage Arena',
    slug: 'main-stage-arena',
    tagline: 'Where Legends Are Made',
    icon: '👑',
    primaryColor: '#EAB308',
    secondaryColor: '#CA8A04',
    roundDuration: 180,
    segmentsPerRound: 6,
    roundsPerBattle: 3,
    writingWeight: 40,
    performanceWeight: 35,
    crowdWeight: 25,
    crowdFactor: 1.15,
    personalityStyle: 'Diverse',
    prestigeLevel: 9,
    basePayout: 2000,
    audiencePreferences: {
      lyricism: 6,
      wordplay: 5,
      storytelling: 7,
      delivery: 8,
      crowdEngagement: 9,
    },
    pros: [
      'Performance battlers thrive',
      'Big crowds amplify moments',
      'Higher payouts and prestige',
    ],
    cons: [
      'Technical writers struggle',
      'Stage fright is punished',
      'Need presence to win',
    ],
  },
} as const;

export const LEAGUE_COLORS = {
  'small-room-circuit': { primary: '#F97316', secondary: '#EA580C' },
  'main-stage-arena': { primary: '#EAB308', secondary: '#CA8A04' },
};

export const LEAGUE_ICONS = {
  'small-room-circuit': '🎤',
  'main-stage-arena': '👑',
};
```

---

# PART 7: IMPLEMENTATION CHECKLIST

## Phase 1: Core Components
- [ ] LeagueLogo component (with placeholder fallback)
- [ ] LeagueBadge component (pill/tag variants)
- [ ] WeightBar component
- [ ] AudiencePreferences component
- [ ] LeagueCard component (selectable/display variants)

## Phase 2: Pages
- [ ] /leagues page (list both leagues)
- [ ] /leagues/[slug] page (league detail with tabs)
- [ ] League header/hero section
- [ ] League roster tab
- [ ] League recent battles tab
- [ ] League news tab
- [ ] League mechanics explainer

## Phase 3: Integration
- [ ] Add league logo upload/display
- [ ] Update onboarding to use LeagueCard selectable
- [ ] Add league info to battle offers
- [ ] Add league filter to media/news

## Phase 4: Navigation
- [ ] Add "Leagues" to main navigation
- [ ] Add league links in dashboard
- [ ] Add league breadcrumbs

---

# PART 8: LOGO REQUIREMENTS

**Small Room Circuit Logo:**
- Should convey: Intimate, technical, pen-focused
- Suggested elements: Microphone, notebook, small venue
- Colors: Orange (#F97316) primary
- Size: 256x256 minimum, SVG preferred

**Main Stage Arena Logo:**
- Should convey: Grand, prestigious, performance
- Suggested elements: Crown, spotlight, stage, large venue
- Colors: Yellow/Gold (#EAB308) primary
- Size: 256x256 minimum, SVG preferred

**Logo Display Locations:**
1. League header hero (128px)
2. League cards (80px)
3. Battle offer cards (48px)
4. Inline mentions (32px)
5. Favicon/tab (16px)

---

# SUMMARY

This spec provides everything V0 needs for leagues:

1. **2 complete league profiles** with all mechanics, preferences, and descriptions
2. **9 core components** with exact layouts and code
3. **2 pages** (leagues list + league detail with 5 tabs)
4. **API endpoints** for league data
5. **Navigation structure** and URL patterns
6. **Data constants** for frontend
7. **Logo requirements** and placeholders

The leagues are the CORE competitive structure. Players choose their league based on playstyle. Make the differences CLEAR and VISUAL.
