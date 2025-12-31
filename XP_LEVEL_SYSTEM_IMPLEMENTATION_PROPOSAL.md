# XP & Level System - Implementation Proposal

## Overview

The XP/Level system provides **career progression** separate from skill progression. While attributes represent raw ability, levels represent **story progression** and **career milestones**.

---

## Core Philosophy

- **XP = Career Impact**, not training
- **Levels = Story Beats**, not power
- **Non-Linear XP Curve**: Early levels fast, endgame slow
- **Rewards Matter**: Each level feels significant

---

## Level Structure (30 Levels)

### Tiers & XP Requirements

| Level | Tier | XP Required | Cumulative XP | Story Beat |
|-------|------|-------------|---------------|------------|
| 1-5 | **Rookie** | 100-500 | 0-1,500 | Learning the ropes |
| 6-10 | **Up-and-Comer** | 600-1,000 | 1,500-5,500 | Building reputation |
| 11-15 | **Contender** | 1,200-2,000 | 5,500-13,500 | Main card battles |
| 16-20 | **Veteran** | 2,500-3,500 | 13,500-29,000 | Headliner status |
| 21-25 | **Legend** | 4,000-5,000 | 29,000-51,000 | Defining era |
| 26-30 | **GOAT** | 6,000-10,000 | 51,000-91,000 | Mount Rushmore |

**Total XP to max level**: ~91,000 XP
**Estimated battles to max**: 150-220 battles

---

## XP Sources

### 1. Battle Results (Primary Source)
```typescript
Base XP: 100 XP per battle (always earned)

Win Bonuses:
- Body (3-0): +150 XP
- Clear Victory (2-1): +75 XP
- Close Win (2-1 debatable): +50 XP

Loss Penalties:
- Close Loss: +25 XP (still earned XP)
- Body Loss: +0 XP (base only)
```

### 2. Performance Bonuses
```typescript
Haymaker Bonus: +50 XP per haymaker (peak segment ≥8.5)
Consistency Bonus: +30 XP if no chokes/stumbles
Crowd Bonus: +20 XP if crowd_reaction ≥85%
Perfection Bonus: +100 XP (3-0 + no chokes + 2+ haymakers)
```

### 3. Milestone Bonuses (One-Time)
```typescript
First Victory: +200 XP
First Body: +300 XP
First Perfect Battle: +500 XP
10-Win Streak: +400 XP
Win vs Higher-Tier Opponent: +100-300 XP (scaled by tier gap)
Title Win: +1,000 XP (future feature)
```

### 4. Relationship Bonuses
```typescript
Rival Battle: +50 XP
At War Battle: +100 XP
Legendary Beef Battle: +150 XP
First Win Against Rival: +200 XP
```

---

## XP Calculation Example

**Scenario**: Player wins 2-1 with 2 haymakers, no chokes, 88% crowd reaction, against a rival

```
Base XP: 100
Win Bonus (Clear Victory): +75
Haymaker Bonus (2x): +100
Consistency Bonus: +30
Crowd Bonus: +20
Rival Battle: +50
--------------------------------
Total: 375 XP
```

---

## Level-Up Rewards

### Every Level
- **Skill Points**: 3 points (allocate to attributes)
- **Notification**: "LEVEL UP! You reached Level X"
- **XP Breakdown Display**: Show how XP was earned

### Milestone Levels (Every 5 Levels)
- **Badge Unlock**: Unlock new badge slot or special badge
- **Special Reward**:
  - Level 5: +1 Prep Focus Slot (can do 2 focuses per day)
  - Level 10: Unlock "Advanced Actions" in promotion
  - Level 15: +1 Badge Slot (equip 4 badges instead of 3)
  - Level 20: Unlock "Signature Move" (custom finishing segment)
  - Level 25: Unlock "Hall of Fame" career stats page
  - Level 30: **GOAT Status** - Retire or continue as legend

### Story Unlocks
- **Level 6**: "You're getting noticed" - Unlock higher-tier opponents
- **Level 11**: "Main card status" - Can headline events
- **Level 16**: "The veterans respect you" - Special dialogue/rivalries
- **Level 21**: "You're defining the era" - Media features you prominently
- **Level 26**: "Mount Rushmore debates" - GOATs mention your name

---

## Database Schema

### New Table: `battler_progression`
```sql
CREATE TABLE battler_progression (
  battler_id UUID PRIMARY KEY REFERENCES battlers(id),
  current_xp INT DEFAULT 0,
  current_level INT DEFAULT 1,
  total_xp_earned INT DEFAULT 0, -- Cumulative across all time
  skill_points_available INT DEFAULT 0,
  skill_points_spent INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### New Table: `xp_history`
```sql
CREATE TABLE xp_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battler_id UUID REFERENCES battlers(id),
  battle_id UUID REFERENCES battles(id),
  xp_earned INT NOT NULL,
  xp_breakdown JSONB NOT NULL, -- { base: 100, winBonus: 75, haymaker: 50, ... }
  level_before INT NOT NULL,
  level_after INT NOT NULL,
  leveled_up BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### New Table: `milestones_earned`
```sql
CREATE TABLE milestones_earned (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battler_id UUID REFERENCES battlers(id),
  milestone_code VARCHAR(50) NOT NULL, -- 'first_victory', '10_win_streak', etc.
  milestone_name TEXT NOT NULL,
  xp_bonus INT NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(battler_id, milestone_code) -- Can only earn each milestone once
);
```

---

## Implementation Plan

### Phase 1: Core XP System (Week 1)
- Create database tables
- Implement `calculateBattleXP(battleId)` function
- Integrate into battle simulation (call after battle completes)
- Store XP history
- Create `/api/progression/xp` endpoint

### Phase 2: Level-Up Logic (Week 1)
- Implement `checkLevelUp(battlerId)` function
- Award skill points on level-up
- Send level-up notifications
- Create `/api/progression/level-up` endpoint

### Phase 3: UI Components (Week 2)
- **XP Bar** on dashboard (current level progress)
- **Level Badge** next to battler name
- **PostBattleSummary** integration (show XP earned breakdown)
- **Progression Page** (`/progression`) - XP history, milestones, skill points
- **Skill Point Allocation UI** - spend points to improve attributes

### Phase 4: Milestones (Week 2)
- Implement milestone tracking
- Create `checkMilestones(battleId)` function
- Add milestone notifications
- Display milestones in progression page

### Phase 5: Story Unlocks (Week 3)
- Implement level-gated features
- Add story beat notifications
- Create "Hall of Fame" page (Level 25+)
- Implement GOAT status mechanics (Level 30)

---

## Balancing Notes

### XP Earning Rate
- **Aggressive player** (1 battle/day): ~300 XP/day → Level 30 in ~300 days
- **Moderate player** (3 battles/week): ~150 XP/week → Level 30 in ~1.5 years
- **Casual player** (1 battle/week): ~50 XP/week → Level 30 in ~3+ years

### Skill Points Economy
- **Total skill points by Level 30**: 90 points
- **Attribute improvement**: 1 point = +0.1 to attribute
- **Max improvement**: Can raise ~9 attributes by 1 full point
- **Strategic choice**: Specialize (boost 3 attributes by 3 points) or diversify (boost 9 attributes by 1 point)

### XP Tuning Knobs
If progression feels too slow/fast, adjust:
- `BASE_XP` constant (100 → 120 or 80)
- Win bonus multipliers
- Milestone XP values
- XP requirements per level

---

## Technical Notes

### XP Calculation Function
```typescript
async function calculateBattleXP(battleId: string, supabase: SupabaseClient) {
  // 1. Get battle details
  const battle = await getBattleDetails(battleId);

  // 2. Calculate base + bonuses
  let xp = 100; // Base
  const breakdown = { base: 100 };

  // Win bonus
  if (battle.winner === player) {
    const winBonus = battle.verdict === '3-0' ? 150 :
                     battle.verdict === '2-1' ? 75 : 50;
    xp += winBonus;
    breakdown.winBonus = winBonus;
  }

  // Haymaker bonus
  const haymakers = battle.segments.filter(s => s.score >= 8.5).length;
  if (haymakers > 0) {
    xp += haymakers * 50;
    breakdown.haymakerBonus = haymakers * 50;
  }

  // ... more bonuses

  // 3. Check milestones
  const milestoneXP = await checkAndAwardMilestones(battleId);
  xp += milestoneXP;
  breakdown.milestoneBonus = milestoneXP;

  // 4. Store XP history
  await storeXPHistory(player.id, battleId, xp, breakdown);

  // 5. Update battler progression
  await addXP(player.id, xp);

  // 6. Check level-up
  await checkLevelUp(player.id);

  return { xp, breakdown };
}
```

### Level-Up Check
```typescript
async function checkLevelUp(battlerId: string, supabase: SupabaseClient) {
  const progression = await getProgression(battlerId);
  const currentLevel = progression.current_level;
  const currentXP = progression.current_xp;

  // Get XP required for next level
  const xpRequired = getXPRequiredForLevel(currentLevel + 1);

  if (currentXP >= xpRequired) {
    // Level up!
    const newLevel = currentLevel + 1;
    const skillPointsEarned = 3;

    await supabase
      .from('battler_progression')
      .update({
        current_level: newLevel,
        current_xp: currentXP - xpRequired, // Carry over excess XP
        skill_points_available: progression.skill_points_available + skillPointsEarned,
      })
      .eq('battler_id', battlerId);

    // Send notification
    await notifyLevelUp(supabase, battlerId, newLevel, skillPointsEarned);

    // Check for milestone rewards
    await awardMilestoneRewards(battlerId, newLevel);
  }
}
```

---

## Integration Points

1. **Battle Simulation** (app/api/internal/run-due-battles/route.ts)
   - After simulation completes, call `calculateBattleXP(battleId)`

2. **Battle Results Page** (app/battle/[id]/page.tsx)
   - Fetch XP earned from `xp_history` table
   - Display PostBattleSummary with XP breakdown

3. **Dashboard** (app/dashboard/page.tsx)
   - Show current level and XP progress bar
   - Display "Skill Points Available: X" if > 0

4. **New Progression Page** (app/progression/page.tsx)
   - Show XP history
   - Show milestones earned
   - Allow skill point allocation

---

## Success Metrics

- **Engagement**: Players return to spend skill points
- **Progression Feel**: Levels 1-10 feel fast, 20+ feel meaningful
- **Balance**: No single XP source dominates (battles should be ~70% of XP)
- **Retention**: Milestone unlocks drive continued play

---

## Future Enhancements

- **Prestige System**: After Level 30, reset with permanent bonuses
- **Seasonal XP Boosts**: Double XP weekends
- **Achievement Badges**: Special badges for XP milestones
- **Leaderboards**: Top XP earners per season
- **Daily/Weekly XP Quests**: Bonus XP for specific challenges

---

## Summary

The XP/Level system adds a **long-term progression curve** that complements the attribute-based skill system. It provides:
- Clear goals and rewards
- Narrative progression beats
- Strategic skill point economy
- Milestone celebrations
- Endgame content (GOAT status)

**Estimated Development Time**: 3 weeks for full implementation
**Priority**: High (unlocks PostBattleSummary, skill point system, career progression UI)
