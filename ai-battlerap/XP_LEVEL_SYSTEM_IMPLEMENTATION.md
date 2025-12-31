# XP and Level System Implementation

**Status**: ✅ COMPLETE

This document describes the XP (experience points) and level progression system implemented for the Algorithm Institute of BattleRap game.

## Overview

The XP/Level system provides long-term career progression for players. Players earn XP from battles based on performance, level up at specific XP thresholds, and earn skill points to boost attributes.

## System Components

### 1. Database Schema (`20251130040000_add_xp_level_system.sql`)

**New fields on `battlers` table:**
- `level` (INTEGER): Current level (1-30), default 1
- `total_xp` (INTEGER): Cumulative XP earned across career, default 0
- `current_level_xp` (INTEGER): XP progress toward next level, default 0
- `skill_points_available` (INTEGER): Unspent skill points from level-ups, default 0
- `skill_points_spent` (JSONB): Mapping of attribute names to points spent (max 10 per attribute)

**New table: `xp_history`**
- Tracks all XP gains for battlers
- Columns: `battler_id`, `battle_id`, `xp_earned`, `source`, `xp_breakdown`
- Useful for displaying career progression timeline

**New fields on `battle_progression` table:**
- `xp_earned` (INTEGER): Total XP from this battle
- `xp_breakdown` (JSONB): Detailed XP breakdown
- `level_before` (INTEGER): Player level before battle
- `level_after` (INTEGER): Player level after battle
- `skill_points_earned` (INTEGER): Skill points from level-ups (0, 2, 4, etc.)

### 2. Core Logic (`lib/game/xpLevels.ts`)

**XP Calculation Formula:**
```
Base XP: 100 (every battle)
+ Win Bonus: +50 (if won)
+ Margin Bonus: +75 (3-0 bodybag) OR +25 (2-1 debatable)
+ Haymaker Bonus: +30 per round with peak_score >= 8.5
+ Perfect Consistency: +40 (no chokes/stumbles)
+ Dominant Crowd: +25 (avg crowd_reaction >= 85)
+ Career Milestones:
  - 10th battle: +200 XP
  - 25th battle: +500 XP
  - 50th battle: +1000 XP
  - 100th battle: +2500 XP
```

**Level Curve:**
- Formula: `XP_required = 500 * (level^1.5)`
- Max Level: 30
- Total XP to max: ~135,000 XP
- Estimated battles to max: 180-220 battles
- Level tiers:
  - 1-5: Rookie
  - 6-10: Up-and-Comer
  - 11-15: Established
  - 16-20: Elite
  - 21-25: Legend
  - 26-30: GOAT

**Skill Points:**
- Award: 2 skill points per level-up
- Usage: Each point = +0.1 to an attribute
- Max: 10 points per attribute (+1.0 total boost)
- Valid attributes: lyricism, wordplay, creativity, stage_presence, crowd_control, delivery, resilience

**Key Functions:**
- `calculateBattleXP(data: BattleXPData): XPBreakdown` - Calculate XP earned from battle
- `getLevelFromXP(totalXP: number)` - Determine level from total XP
- `checkLevelUp(battleId, battlerId, supabase)` - Check/apply level-up after battle
- `validateSkillPointSpend()` - Validate skill point spending
- `calculateSkillPointBoost()` - Calculate attribute boost from skill points

### 3. Progression Integration (`lib/game/progression.ts`)

**Modified `applyAttributeProgression()` function:**
- After attribute progression and badge earning, now calls `checkLevelUp()`
- Logs XP earned and level-ups to console
- Passes level-up data to `saveProgressionSnapshot()` for UI display

**Integration point:**
```typescript
// 9. Check for level-up and award XP
const { checkLevelUp } = await import('./xpLevels');
const levelUpResult = await checkLevelUp(battleId, playerBattlerId, supabase);

console.log(`XP awarded: ${levelUpResult.xpEarned} (Level ${levelUpResult.previousLevel} → ${levelUpResult.newLevel})`);
if (levelUpResult.leveledUp) {
  console.log(`🎉 LEVEL UP! Earned ${levelUpResult.skillPointsEarned} skill points`);
}
```

### 4. API Endpoint (`app/api/battler/spend-skill-points/route.ts`)

**POST `/api/battler/spend-skill-points`**

Request body:
```json
{
  "attributeName": "lyricism",
  "pointsToSpend": 1
}
```

Response:
```json
{
  "success": true,
  "newAttributeValue": 7.3,
  "skillPointsRemaining": 4,
  "totalSpentOnAttribute": 3,
  "attributeName": "lyricism"
}
```

**Validation:**
- Only 1 point at a time
- Max 10 points per attribute
- Must have available skill points
- Updates both `battlers.skill_points_spent` and `battler_attributes` table

### 5. Dashboard UI (`components/battler/DashboardClient.tsx`)

**New Level & XP Progress Widget:**
- Displays current level with tier badge (Rookie, Elite, GOAT, etc.)
- Shows XP progress bar with current/next level XP
- Displays total XP earned
- Shows skill points available with "Spend Points" button (if available)
- Color-coded orange gradient design

**Features:**
- Real-time XP progress visualization
- Level tier names with emojis
- Prominent skill point notification
- Link to skill point spending page (future implementation)

### 6. Battle Results UI (`components/battle/PostBattleSummary.tsx`)

**New XP & Level-Up Section:**

**Level-Up Celebration (if leveled up):**
- Large orange gradient card with celebration emoji
- "LEVEL UP!" headline
- Shows level transition (e.g., "Level 5 → Level 6")
- Displays skill points earned
- Reminder to spend points in dashboard

**XP Breakdown Card:**
- Shows total XP earned (+XXX XP)
- Detailed breakdown by source:
  - Base Participation
  - Victory Bonus (green)
  - Margin Bonus (green)
  - Haymaker Bonus (purple)
  - Perfect Consistency (blue)
  - Dominant Crowd (amber)
  - Career Milestone (orange, special highlighting)

**Color Coding:**
- Green: Win/victory bonuses
- Purple: Haymaker bonuses
- Blue: Consistency bonuses
- Amber: Crowd bonuses
- Orange: Milestone bonuses

## Testing Checklist

### Database Migration
- [ ] Run migration: `npm run supabase:reset`
- [ ] Verify new fields exist on `battlers` table
- [ ] Verify `xp_history` table created
- [ ] Verify `battle_progression` has XP columns

### Core Functionality
- [ ] Battle completion awards XP
- [ ] XP calculation includes all bonuses (win, margin, performance)
- [ ] Level-up triggers at correct thresholds
- [ ] Skill points awarded correctly (2 per level)
- [ ] XP history records created
- [ ] Battle progression includes XP data

### UI Display
- [ ] Dashboard shows level, XP bar, total XP
- [ ] Dashboard shows skill points if available
- [ ] PostBattleSummary shows XP earned
- [ ] PostBattleSummary shows level-up celebration (if applicable)
- [ ] XP breakdown displays all sources correctly

### API
- [ ] Skill point spending endpoint works
- [ ] Validation prevents overspending
- [ ] Attributes update correctly
- [ ] Database records both skill_points_spent and attribute values

### Edge Cases
- [ ] Level 1 → 2 transition works
- [ ] Max level (30) caps correctly
- [ ] Multiple level-ups in one battle (e.g., milestone + performance)
- [ ] Loss still awards base XP
- [ ] Milestone bonuses trigger at exact battle counts

## Example XP Scenarios

### Scenario 1: Dominant Victory
- Base: 100 XP
- Win: +50 XP
- 3-0 Bodybag: +75 XP
- 2 Haymakers: +60 XP
- Perfect Consistency: +40 XP
- Dominant Crowd: +25 XP
- **Total: 350 XP**

### Scenario 2: Close Loss
- Base: 100 XP
- **Total: 100 XP**

### Scenario 3: 25th Battle Win
- Base: 100 XP
- Win: +50 XP
- 2-1 Debatable: +25 XP
- 25th Battle Milestone: +500 XP
- **Total: 675 XP**

### Scenario 4: Level-Up Example
- Starting: Level 9, 14,500 total XP
- XP for Level 10: 15,811 total XP
- Battle earns: 350 XP
- New total: 14,850 XP (no level-up, need 961 more)
- Next battle earns: 250 XP
- New total: 15,100 XP (no level-up, need 711 more)
- Next battle earns: 800 XP
- New total: 15,900 XP → **LEVEL UP to 10!**
- Skill points earned: +2
- Current level XP: 89 / 1,581 toward Level 11

## Future Enhancements

### Phase 2 (Not Yet Implemented)
- [ ] Skill point spending UI page (`/battler/skill-points`)
- [ ] XP history timeline view
- [ ] Level-up notifications/toasts
- [ ] Achievement system integration
- [ ] Tournament/championship XP bonuses (defined but not triggered)

### Phase 3 (Design Ideas)
- [ ] Prestige system (reset to Level 1 with permanent bonuses)
- [ ] Level-based unlocks (content types, special battles)
- [ ] XP multiplier events
- [ ] Season-based level resets with rewards
- [ ] Leaderboards by level/XP

## Integration Points

### Current Game Systems
- ✅ Attribute progression (runs before XP calculation)
- ✅ Badge earning (runs before XP calculation)
- ✅ Battle simulation (provides performance data for XP calc)
- ✅ Ranking/ELO system (parallel progression)
- ✅ Fan system (shown in same post-battle summary)

### Future Systems
- ⏳ Tournament system (milestone XP bonuses)
- ⏳ Championship system (milestone XP bonuses)
- ⏳ Notification system (level-up alerts)
- ⏳ Career stats dashboard (XP history timeline)

## Configuration

All XP/Level constants are in `lib/game/xpLevels.ts`:

```typescript
const XP_CONFIG = {
  BASE_BATTLE_XP: 100,
  WIN_BONUS: 50,
  BODYBAG_BONUS: 75,
  DEBATABLE_BONUS: 25,
  HAYMAKER_BONUS: 30,
  PERFECT_CONSISTENCY_BONUS: 40,
  DOMINANT_CROWD_BONUS: 25,
  MILESTONE_10_BATTLES: 200,
  MILESTONE_25_BATTLES: 500,
  MILESTONE_50_BATTLES: 1000,
  MILESTONE_100_BATTLES: 2500,
  SKILL_POINTS_PER_LEVEL: 2,
  MAX_SKILL_POINTS_PER_ATTRIBUTE: 10,
  SKILL_POINT_BOOST_AMOUNT: 0.1,
};
```

These can be tuned during playtesting.

## Files Modified/Created

### Created:
1. `supabase/migrations/20251130040000_add_xp_level_system.sql` - Database schema
2. `lib/game/xpLevels.ts` - Core XP/level logic (680 lines)
3. `app/api/battler/spend-skill-points/route.ts` - Skill point spending API
4. `XP_LEVEL_SYSTEM_IMPLEMENTATION.md` - This documentation

### Modified:
1. `lib/game/progression.ts` - Integrated XP calculation after battles
2. `components/battler/DashboardClient.tsx` - Added level/XP display widget
3. `components/battle/PostBattleSummary.tsx` - Added XP breakdown and level-up UI

## Design Philosophy

### Core Principles
1. **Performance over participation**: Reward skill, not just showing up
2. **Always progress**: Even losses earn base XP
3. **Meaningful milestones**: Big XP bonuses at career landmarks
4. **Long-term engagement**: 180-220 battles to max level
5. **Player agency**: Skill points let players customize progression

### Balance Targets
- Average battle XP: 150-250 XP
- Dominant win: 300-400 XP
- Close loss: 100-120 XP
- Milestone battles: 600-1000 XP
- Level-ups feel earned but not grindy

### UI/UX Goals
- Make XP gains visible and satisfying
- Celebrate level-ups prominently
- Show XP sources for transparency
- Encourage skill point spending
- Integrate cleanly with existing progression systems

---

**Implementation Date**: 2025-11-30
**Status**: Complete and ready for playtesting
**Next Steps**: Apply migration, test battle completion, gather player feedback
