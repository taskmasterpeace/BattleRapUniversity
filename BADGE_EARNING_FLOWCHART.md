# Badge Earning Flowchart

Visual guide to how badges are earned, tracked, and removed throughout a battler's career.

---

## Character Creation: Starting Badges

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Choose Identity (Stage Name + Region)              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Choose League (Small Room or Main Stage)           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Allocate Attributes (30 points)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Choose Archetype (NEW)                             │
│                                                             │
│  ○ Technical Writer → Technical Writer + Wordplay Wizard   │
│  ○ Freestyler → Freestyle Genius + Rebuttal King/Queen     │
│  ○ Performance Beast → Charismatic + Aggressive            │
│  ○ Angle Master → Personal Attacks + Angle Master          │
│  ○ Comedian → Comedy + Crowd Control                       │
│                                                             │
│  Result: 2 BADGES                                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Customize Style (NEW)                              │
│                                                             │
│  Choose 1 from:                                             │
│  - Writing: Wordplay Wizard, Metaphor Master, etc.         │
│  - Performance: Smooth Flow, Speed Rapping, etc.           │
│  - Content: Storytelling, Braggadocious, Gritty            │
│  - Reliability: Prepared Battler, Resilient Battler        │
│                                                             │
│  Result: +1 BADGE                                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    TOTAL: 3 STARTER BADGES
```

---

## Badge Earning: Gameplay Flow

```
┌─────────────────────────────────────────────────────────────┐
│ ACCEPT BATTLE OFFER                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ PREP PHASE                                                  │
│ - Allocate prep days (research/writing/performance/rest)   │
│ - [Phase 2] Select content strategy (comfortable vs exp)   │
│ - System tracks: prep pattern, content choice              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ BATTLE SIMULATION                                           │
│ - Segment-by-segment performance calculated                │
│ - peak_score, average_score, consistency tracked           │
│ - choke flag, crowd_reaction recorded                       │
│ - Winner determined (best 2 of 3 rounds)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ POST-BATTLE: BADGE DETECTION                                │
│                                                             │
│ System checks 4 categories:                                 │
│  1. Performance Milestones                                  │
│  2. Playstyle Recognition                                   │
│  3. Career Progression                                      │
│  4. Failure-Based (negative badges)                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
                  ┌───────────┴───────────┐
                  ↓                       ↓
        ┌─────────────────┐    ┌─────────────────┐
        │ BADGES EARNED   │    │ BADGES REMOVED  │
        │ (if conditions  │    │ (redemption arc)│
        │  met)           │    │                 │
        └─────────────────┘    └─────────────────┘
                  ↓                       ↓
        ┌─────────────────┐    ┌─────────────────┐
        │ NOTIFICATION    │    │ NOTIFICATION    │
        │ "Badge Unlocked"│    │ "Badge Removed" │
        └─────────────────┘    └─────────────────┘
                  ↓                       ↓
        ┌─────────────────────────────────────────┐
        │ UPDATE BATTLER PROFILE                  │
        │ - Add/remove badge from style_tags      │
        │ - Update badge_earned table             │
        │ - Update badge_progress tracking        │
        └─────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ LIFE EVENT (Random or Choice-Based)                        │
│ - Player makes choices (humble vs clout, drama vs peace)   │
│ - System tracks choice patterns                             │
│ - Can trigger badge earning (Drama Starter, Professional)  │
│ - Can trigger negative badges (Financial Struggles, etc.)  │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    REPEAT CYCLE (Next Battle)
```

---

## Badge Detection: Performance Milestones

```
POST-BATTLE ANALYSIS
         ↓
┌────────────────────────────────────────────────────────┐
│ CHECK SEGMENT DATA                                     │
│                                                        │
│ For each segment in battle:                           │
│  - Did segment have peak_score ≥ 8.5? → haymaker++    │
│  - Did battler choke? → choke_flag = true             │
│  - Was consistency high (≥ 0.85)? → consistent++      │
│  - Was performance clutch (comeback)? → clutch++      │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ CHECK CAREER TOTALS                                    │
│                                                        │
│ Query battle history:                                  │
│  - Total haymakers across career                      │
│  - Total battles without choking                      │
│  - Total clutch comebacks                             │
│  - Total 3-0 victories                                │
│  - Current win/loss streak                            │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ MATCH AGAINST BADGE THRESHOLDS                         │
│                                                        │
│ IF haymakers ≥ 10 AND !has("Punchline King/Queen")    │
│   → EARN "Punchline King/Queen"                       │
│                                                        │
│ IF consecutive_chokes ≥ 2 AND !has("Known Choker")    │
│   → EARN "Known Choker"                               │
│                                                        │
│ IF battles_no_choke ≥ 10 AND !has("Resilient Battler")│
│   → EARN "Resilient Battler"                          │
│                                                        │
│ IF clutch_comebacks ≥ 5 AND !has("Clutch Performer")  │
│   → EARN "Clutch Performer"                           │
│                                                        │
│ IF total_30_wins ≥ 10 AND !has("Body Specialist")     │
│   → EARN "Body Specialist"                            │
└────────────────────────────────────────────────────────┘
         ↓
    BADGES EARNED
```

---

## Badge Detection: Playstyle Recognition

```
POST-BATTLE ANALYSIS
         ↓
┌────────────────────────────────────────────────────────┐
│ CHECK PREP PATTERN (Last 10 Battles)                  │
│                                                        │
│ Query prep_blocks for battler's last 10 battles:      │
│  - Average total prep days                            │
│  - Average writing prep days                          │
│  - Average research prep % of total                   │
│  - Prep balance (how diverse?)                        │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ ANALYZE PREP PATTERNS                                  │
│                                                        │
│ Technical Writer Pattern:                              │
│  → 15+ battles with avg ≥ 8 prep days                 │
│  → Writing-heavy focus                                │
│                                                        │
│ Freestyle Genius Pattern:                             │
│  → 10+ battles with avg ≤ 3 prep days                 │
│  → Still winning consistently                         │
│                                                        │
│ Angle Master Pattern:                                 │
│  → 20+ battles with research ≥ 40% of total prep      │
│                                                        │
│ Battle Technician Pattern:                            │
│  → 15+ battles with balanced prep (all categories)    │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ CHECK CONTENT PATTERN (Phase 2)                       │
│                                                        │
│ Query content_strategy for last 20 battles:           │
│  - Comedy used in X% of battles                       │
│  - Storytelling used in X% of battles                 │
│  - Angles used in X% of battles                       │
│                                                        │
│ IF comedy ≥ 70% AND has("Comedy")                     │
│   → EVOLVE to "Comedian"                              │
│                                                        │
│ IF storytelling ≥ 70% AND creativity ≥ 8              │
│   → EVOLVE to "Enhanced Storyteller"                  │
└────────────────────────────────────────────────────────┘
         ↓
    BADGES EARNED/EVOLVED
```

---

## Badge Detection: Career Progression

```
POST-BATTLE ANALYSIS
         ↓
┌────────────────────────────────────────────────────────┐
│ CHECK MILESTONE THRESHOLDS                             │
│                                                        │
│ Query battler career stats:                           │
│  - total_battles                                       │
│  - total_wins                                          │
│  - total_losses                                        │
│  - current_reputation                                  │
│  - completion_rate                                     │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ MATCH AGAINST CAREER BADGES                            │
│                                                        │
│ Respected Veteran:                                     │
│  IF battles ≥ 20 AND reputation ≥ 8                   │
│    → EARN                                              │
│                                                        │
│ Consistent Grinder:                                    │
│  IF battles ≥ 30 AND completion_rate ≥ 90%            │
│    → EARN                                              │
│                                                        │
│ Consummate Professional:                               │
│  IF reputation ≥ 9 AND completion_rate ≥ 95%          │
│    → EARN (Legendary status)                          │
│                                                        │
│ Career Plateaued:                                      │
│  IF battles ≥ 20 AND no_attribute_improvement          │
│    → EARN (Negative badge)                            │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ CHECK ATTRIBUTE THRESHOLDS                             │
│                                                        │
│ Query battler_attributes:                             │
│  - writing.lyricism                                    │
│  - writing.wordplay                                    │
│  - writing.creativity                                  │
│  - performance.stage_presence                          │
│  - performance.crowd_control                           │
│  - performance.delivery                                │
│                                                        │
│ Pen Game Elite:                                        │
│  IF lyricism ≥ 9 AND wordplay ≥ 9 AND creativity ≥ 9  │
│    → EARN (Legendary writing badge)                   │
│                                                        │
│ Stage Domination:                                      │
│  IF all performance attributes ≥ 9                     │
│    → EARN (Legendary performance badge)               │
└────────────────────────────────────────────────────────┘
         ↓
    BADGES EARNED
```

---

## Badge Detection: Negative Badge Triggers

```
POST-BATTLE ANALYSIS
         ↓
┌────────────────────────────────────────────────────────┐
│ CHECK FAILURE CONDITIONS                               │
│                                                        │
│ Choking:                                               │
│  IF consecutive_chokes ≥ 2                            │
│    → EARN "Known Choker"                              │
│                                                        │
│ Poor Writing:                                          │
│  IF low_creativity_pattern (last 10 battles)          │
│    → EARN "Recycler"                                  │
│                                                        │
│ Content Repetition:                                    │
│  IF same_content_15_consecutive                        │
│    → EARN "One-Trick Pony"                            │
│                                                        │
│ Low Prep:                                              │
│  IF avg_prep < 2 for 10 battles AND losing            │
│    → EARN "Lazy Writer"                               │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ CHECK REPUTATION TRIGGERS                              │
│                                                        │
│ No-Show:                                               │
│  IF missed_battle = true                              │
│    → EARN "Unreliable" (severe penalty)               │
│                                                        │
│ Declining Performance:                                 │
│  IF was_reputation_8 AND now_reputation_5              │
│    → EARN "Fallen Star"                               │
│                                                        │
│ Stagnation:                                            │
│  IF battles ≥ 20 AND no_improvement                   │
│    → EARN "Career Plateaued"                          │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ CHECK SCANDAL TRIGGERS                                 │
│                                                        │
│ Stealing Bars:                                         │
│  IF creativity_suspiciously_low + scandal_event        │
│    → EARN "Biter" (severe reputation damage)          │
│                                                        │
│ Stealing Money:                                        │
│  IF took_deposit_no_show                              │
│    → EARN "Known Stealer" (permanent)                 │
└────────────────────────────────────────────────────────┘
         ↓
    NEGATIVE BADGES EARNED
```

---

## Badge Removal: Redemption Arc

```
POST-BATTLE ANALYSIS
         ↓
┌────────────────────────────────────────────────────────┐
│ CHECK REMOVAL CONDITIONS (For Removable Badges)       │
│                                                        │
│ Known Choker:                                          │
│  IF has("Known Choker")                               │
│    AND consecutive_clean_battles ≥ 5                  │
│      → REMOVE "Known Choker"                          │
│      → NOTIFICATION: "Redemption! Badge removed"      │
│                                                        │
│ Drama Starter:                                         │
│  IF has("Drama Starter")                              │
│    AND drama_free_choices ≥ 5                         │
│      → REMOVE "Drama Starter"                         │
│                                                        │
│ Recycler:                                              │
│  IF has("Recycler")                                   │
│    AND creativity ≥ 7 for 8 consecutive battles       │
│      → REMOVE "Recycler"                              │
│                                                        │
│ Lazy Writer:                                           │
│  IF has("Lazy Writer")                                │
│    AND avg_prep ≥ 6 for 10 battles                    │
│      → REMOVE "Lazy Writer"                           │
│                                                        │
│ Inconsistent Performer:                                │
│  IF has("Inconsistent Performer")                     │
│    AND consistency ≥ 0.75 for 5 battles               │
│      → REMOVE "Inconsistent Performer"                │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ UPDATE DATABASE                                        │
│                                                        │
│ badge_earned table:                                    │
│  - Mark badge as removed (removed_at timestamp)       │
│                                                        │
│ battlers.style_tags:                                   │
│  - Remove badge from active badge list                │
│                                                        │
│ badge_progress:                                        │
│  - Reset removal progress counter                     │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ NOTIFICATION                                           │
│                                                        │
│ UI Toast:                                              │
│  "REDEMPTION! Badge removed: Known Choker"            │
│  "You've proven yourself under pressure."             │
│                                                        │
│ Profile Update:                                        │
│  - Badge no longer displayed                          │
│  - Badge effects no longer applied                    │
│  - History preserved in badge_earned table            │
└────────────────────────────────────────────────────────┘
         ↓
    REDEMPTION COMPLETE
```

---

## Badge Progress Tracking

```
BATTLE RESULTS SCREEN
         ↓
┌────────────────────────────────────────────────────────┐
│ BADGE PROGRESS DISPLAY                                 │
│                                                        │
│ ✓ BADGE EARNED                                         │
│   🏆 Punchline King/Queen                              │
│   You've delivered 10 devastating haymaker moments     │
│                                                        │
│ ⚠️ BADGE EARNED (NEGATIVE)                             │
│   Known Choker                                         │
│   You choked in 2 consecutive battles                  │
│   → Remove by: 5 clean battles (0/5 progress)         │
│                                                        │
│ 📊 PROGRESS TOWARD BADGES                              │
│   Clutch Performer: ████░░░░░░ 4/5 clutch comebacks   │
│   Consistent Writer: ██████░░░░ 6/10 consistent battles│
│   Body Specialist: ███░░░░░░░ 3/10 dominant 3-0 wins  │
│   Respected Veteran: ████████░░ 16/20 career battles  │
│                                                        │
│ 🎯 RECOMMENDED FOCUS                                   │
│   You're 1 clutch comeback away from "Clutch Performer"│
│   Try accepting battles where you're the underdog!     │
└────────────────────────────────────────────────────────┘
         ↓
DASHBOARD BADGE WIDGET
         ↓
┌────────────────────────────────────────────────────────┐
│ NEXT BADGE TO UNLOCK                                   │
│                                                        │
│ Clutch Performer (4/5) - ALMOST THERE!                │
│ Win 1 more battle after being down 0-1 or 0-2         │
│                                                        │
│ Body Specialist (3/10) - In Progress                  │
│ Win 7 more battles by 3-0                             │
│                                                        │
│ Respected Veteran (16/20) - On Track                  │
│ Complete 4 more battles + maintain reputation ≥ 8     │
│ Current reputation: 7.8 ⚠️ (close to threshold)        │
└────────────────────────────────────────────────────────┘
```

---

## Life Event Badge Triggers

```
LIFE EVENT OCCURS
         ↓
┌────────────────────────────────────────────────────────┐
│ PLAYER MAKES CHOICE                                    │
│                                                        │
│ Event: Twitter Beef with Veteran                      │
│                                                        │
│ Choice A: Escalate (Clout Chasing)                    │
│  "Keep going at them, build hype"                     │
│                                                        │
│ Choice B: De-escalate (Professional)                  │
│  "Let it go, not worth the drama"                     │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ TRACK CHOICE IN DATABASE                               │
│                                                        │
│ life_events_choices table:                            │
│  - battler_id                                          │
│  - event_code: "TWITTER_BEEF_VETERAN"                 │
│  - choice: "a" or "b"                                  │
│  - timestamp                                           │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ ANALYZE CHOICE PATTERN (Last 5 Events)                │
│                                                        │
│ Query recent choices:                                  │
│  - drama_escalating_choices = 3                       │
│  - professional_choices = 1                            │
│  - humble_choices = 0                                  │
│                                                        │
│ Pattern: Consistent drama escalation                   │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ CHECK BADGE THRESHOLDS                                 │
│                                                        │
│ Drama Starter:                                         │
│  IF drama_choices ≥ 3 AND !has("Drama Starter")       │
│    → EARN "Drama Starter"                             │
│                                                        │
│ Consummate Professional:                               │
│  IF professional_choices ≥ 5 AND reputation ≥ 9       │
│    → EARN "Consummate Professional"                   │
│                                                        │
│ Clout Chaser:                                          │
│  IF viral_moment_choices ≥ 5                          │
│    → EARN "Clout Chaser"                              │
│                                                        │
│ Humble Winner:                                         │
│  IF humble_choices ≥ 3 after wins                     │
│    → EARN "Humble Winner"                             │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ RANDOM LIFE EVENT TRIGGERS                             │
│                                                        │
│ Financial Struggles:                                   │
│  IF financial_stability < 3                           │
│    → TRIGGER event → EARN badge                       │
│                                                        │
│ Substance Issues:                                      │
│  IF high_stress + poor_choices                        │
│    → TRIGGER event (5% chance) → EARN badge           │
│                                                        │
│ Jail Risk:                                             │
│  IF disrespectful + reckless_choices                  │
│    → TRIGGER event (rare) → EARN badge                │
│                                                        │
│ Health Issues:                                         │
│  IF poor_rest + high_battles                          │
│    → TRIGGER event (10% chance) → EARN badge          │
└────────────────────────────────────────────────────────┘
         ↓
    BADGE EARNED/TRIGGERED
```

---

## Database Schema

```sql
-- Badge Earned History
CREATE TABLE badge_earned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id),
  badge_code TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  removed_at TIMESTAMPTZ, -- NULL if still active
  reason TEXT, -- "10 haymaker moments", "2 consecutive chokes"
  battle_id UUID REFERENCES battles(id), -- Nullable (career milestone badges)
  life_event_id UUID REFERENCES life_events(id) -- Nullable
);

-- Badge Progress Tracking
CREATE TABLE badge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id),
  badge_code TEXT NOT NULL,
  current_value INT DEFAULT 0, -- e.g., 3 haymakers
  target_value INT NOT NULL, -- e.g., 10 haymakers
  progress DECIMAL(5,2) DEFAULT 0, -- 0.00 to 1.00 (0.30 = 30%)
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(battler_id, badge_code)
);

-- Life Event Choices (for pattern tracking)
CREATE TABLE life_event_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id),
  event_code TEXT NOT NULL,
  choice TEXT NOT NULL, -- 'a' or 'b'
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Badge Active Status (denormalized for performance)
-- Already exists in battlers.style_tags JSONB array
-- This is updated whenever badges are earned/removed
```

---

## UI Components

### Badge Tooltip (Hover on Badge)

```
┌───────────────────────────────────────────┐
│ PUNCHLINE KING/QUEEN                      │
│ ★★★ LEGENDARY                             │
│                                           │
│ You deliver devastating haymaker moments  │
│ that shift the entire battle              │
│                                           │
│ EFFECTS:                                  │
│ • Peak segments +15%                      │
│ • Crowd reaction +5                       │
│ • Consistency -10% (flashy but uneven)    │
│                                           │
│ EARNED:                                   │
│ 10 segments with peak score ≥ 8.5        │
│                                           │
│ YOUR STATS:                               │
│ 12 haymaker moments in career            │
│ Last haymaker: vs Lyric Storm (R2S3)     │
└───────────────────────────────────────────┘
```

### Badge Progress Widget (Dashboard)

```
┌───────────────────────────────────────────┐
│ BADGE PROGRESS                            │
│                                           │
│ 🎯 ALMOST THERE                           │
│ Clutch Performer                          │
│ ████░░░░░░ 4/5 clutch comeback wins       │
│                                           │
│ 📈 IN PROGRESS                            │
│ Body Specialist                           │
│ ███░░░░░░░ 3/10 dominant 3-0 victories    │
│                                           │
│ Consistent Writer                         │
│ ██████░░░░ 6/10 high-consistency battles  │
│                                           │
│ Respected Veteran                         │
│ ████████░░ 16/20 career battles           │
│ ⚠️ Reputation: 7.8/8.0 (need 8.0+)        │
│                                           │
│ 🎯 REDEMPTION IN PROGRESS                 │
│ Remove "Known Choker"                     │
│ ██░░░░░░░░ 2/5 clean battles              │
└───────────────────────────────────────────┘
```

### Badge Earned Notification (Post-Battle)

```
┌───────────────────────────────────────────┐
│ 🏆 BADGE UNLOCKED!                        │
│                                           │
│ PUNCHLINE KING/QUEEN                      │
│                                           │
│ You've delivered 10 devastating haymaker  │
│ moments throughout your career. Your bars │
│ have stopping power.                      │
│                                           │
│ EFFECTS:                                  │
│ • Peak segments +15%                      │
│ • Crowd reaction +5                       │
│ • Consistency -10%                        │
│                                           │
│ [VIEW BADGE] [CONTINUE]                   │
└───────────────────────────────────────────┘
```

---

**Full Design**: See BADGE_SYSTEM_REDESIGN_PROPOSAL.md
**Summary**: See BADGE_SYSTEM_REDESIGN_SUMMARY.md
**Reference**: See BADGE_CATEGORY_REFERENCE.md
