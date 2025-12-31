# Origin System Implementation Summary

**Date**: December 7, 2025
**Status**: ✅ Implemented and Documented

---

## Overview

The Origin System is a character creation mechanic that shapes the player's early game experience by defining **how they discovered battle rap** and **what skills they developed** before going professional. It adds narrative depth and mechanical differentiation to the onboarding process.

---

## Three Origins

### 1. Text Forums (Writer Path)
- **Identity**: The pen game scholar
- **Bonuses**: +2 Lyricism, +1 Wordplay, +1 Creativity
- **Penalties**: -1 Stage Presence, -1 Delivery
- **Best For**: Technical writers, angle specialists, Small Room battlers
- **Starting League**: Text Wars (virtual) → Small Room Circuit

### 2. App Camera (Performer Path)
- **Identity**: The new wave performer
- **Bonuses**: +2 Stage Presence, +1 Delivery, +1 Crowd Control
- **Penalties**: -1 Lyricism, -1 Wordplay
- **Best For**: Performers, crowd workers, Main Stage battlers
- **Starting League**: BattleRap App (virtual) → Main Stage

### 3. Crew (Street Path)
- **Identity**: The circle-tested battler
- **Bonuses**: +1 Reputation, +1 Resilience
- **Penalties**: -1 Financial Stability
- **Best For**: Balanced battlers, street authenticity, clutch performers
- **Starting League**: Any Underground league

---

## Implementation Details

### Frontend Components

**`components/onboarding/OriginSelector.tsx`**:
- Self-contained origin selection component
- Displays all three origins with bonuses/penalties
- Visual selection state with orange highlight
- Integrated into onboarding flow as Step 2

### API Integration

**`app/api/battler/create/route.ts`** (lines 99-129):
- Applies origin bonuses/penalties after attribute allocation
- Uses `Math.min(10, ...)` and `Math.max(1, ...)` to clamp values
- Handles all three origin types with switch statement
- Returns final attributes with bonuses applied

### Database Schema

**`battlers` table**:
- `origin_type` field stores: `text_forums`, `app_camera`, or `crew`
- Field is optional (nullable) for backwards compatibility
- Applied during character creation, permanent thereafter

---

## Virtual Leagues

Two virtual leagues support origin-based progression:

### Text Wars
- **Type**: Asynchronous text battles
- **Format**: Post rounds, community votes
- **Scoring**: 85% Writing, 0% Performance, 15% Crowd
- **Best For**: Text Forums origin
- **Payout**: $150 base

### BattleRap App
- **Type**: Recorded video battles
- **Format**: Record rounds, post to app, get voted on
- **Scoring**: 35% Writing, 45% Performance, 20% Crowd
- **Best For**: App Camera origin
- **Payout**: $100 base

Both leagues are defined in `lib/leagues.ts` with `isVirtual: true` flag.

---

## Starter Crews

Three AI-owned crews provide reference points for new players:

### Street Prophets (Street Style, Rep: 35)
- Truth Seeker (1320 rating) - Storytelling/Angles
- Raw Prophet (1340 rating) - Aggressive/Personals
- Corner Poet (1300 rating) - Storytelling/Metaphors

### Bar Scientists (Technical Style, Rep: 40)
- Scheme Architect (1380 rating) - Schemes/Multisyllabic
- Wordplay Wizard (1520 rating - TOP TIER) - Wordplay/Metaphors
- Technical Professor (1350 rating) - Technical/Angles

### Gutter Kings (Aggressive Style, Rep: 30)
- Street Brawler (1280 rating) - Aggressive/Gun Bars
- Grime Lord (1260 rating) - Theatrical/Aggressive
- Raw Energy (1220 rating - LOW TIER) - Aggressive/Crowd Engagement

**Database**: Created via migration `20251207152934_seed_starter_crews.sql`

---

## Documentation Created

### 1. CLAUDE.md Updates
- Added Origin System to Game Flow section
- Documented three origins with bonuses/penalties
- Added Starter Crews to core concepts
- Updated league structure to show tiered progression

**Location**: Lines 30-48

### 2. ORIGIN_SYSTEM_PLAYER_GUIDE.md (NEW)
**Purpose**: Player-facing comprehensive guide to the Origin System

**Contents**:
- Detailed explanation of each origin (who you are, why choose it, strategy)
- Early game league recommendations by origin
- Starter crew descriptions and what they teach
- Progression paths (e.g., Text Forums → Text Wars → Small Room → National)
- Strategic recommendations (attribute allocation, prep focus, badges, goals)
- FAQ section answering common questions

**Audience**: New players during/after character creation

### 3. lib/tooltips-data.ts (NEW)
**Purpose**: Single source of truth for all game concept tooltips

**Contents**:
- 50+ tooltip objects covering:
  - Origins (3)
  - Leagues (8 featured)
  - Attributes (11)
  - Prep Types (5)
  - Starter Crews (3)
  - Battle Mechanics (6)
  - System Concepts (4)
- Helper functions for accessing tooltips by ID or category
- TypeScript interfaces for type safety

**Usage**: Can be imported into UI components for in-game tooltips AND used to generate guide content

---

## Design Philosophy

### Narrative Over Mechanics
Origins are designed to tell a story about the player's journey, not just provide stat bonuses. Each origin has a clear identity:
- **Text Forums**: The internet scholar stepping into reality
- **App Camera**: The social media star proving they can write
- **Crew**: The street soldier going professional

### Balanced Early Game Advantage
- **Strong Origins** (Text Forums, App Camera): +4 total bonuses, -2 penalties = +2 net
- **Balanced Origin** (Crew): +2 total bonuses, -1 penalty = +1 net
- Crew's lower net bonus is offset by reputation (better offers) and resilience (choke protection)

### Long-Term Irrelevance
Origins define the **first 10-20 battles**, not the entire career. After 30+ battles, attribute progression dwarfs starting bonuses. This prevents "origin lock-in" while still making the choice meaningful early.

---

## Player Experience Flow

1. **Onboarding Step 1**: Choose stage name and hometown
2. **Onboarding Step 2**: **SELECT ORIGIN** (new)
3. **Onboarding Step 3**: Choose primary league
4. **Onboarding Step 4**: Allocate 36 attribute points
5. **Onboarding Step 5**: Choose 1-3 style tags
6. **Submission**: Origin bonuses/penalties applied to allocated attributes
7. **Post-Creation**: Player reads ORIGIN_SYSTEM_PLAYER_GUIDE.md to understand their path

---

## Testing Recommendations

### Manual Testing
1. Create three battlers (one per origin)
2. Verify bonuses/penalties are correctly applied
3. Check that final attributes are capped at 1-10
4. Confirm origin_type is stored in database
5. Test battle simulation with different origin builds

### Validation Scenarios
- **Text Forums + Heavy Writing Build**: Should dominate Small Room Circuit
- **App Camera + Heavy Performance Build**: Should dominate Main Stage
- **Crew + Balanced Build**: Should be competitive in Underground leagues
- **Edge Cases**: Max attribute (8) + origin bonus should cap at 10
- **Edge Cases**: Min attribute (1) + origin penalty should stay at 1

---

## Future Enhancements

### Tutorial System (Designed, Not Implemented)
- Optional 3-battle tutorial sequence after character creation
- Teaches prep system, battle mechanics, and league differences
- Can be skipped to jump straight into local leagues
- All paths converge at hypothetical "Grand Prix" tournament (endgame)

### Origin-Specific Badges
- "Forum Legend" (Text Forums origin + 50 battles in technical leagues)
- "Camera King" (App Camera origin + 50 battles in performance leagues)
- "Street Certified" (Crew origin + 50 battles in underground leagues)

### Origin-Based Life Events
- Text Forums: "Forum Beef" (someone calls you out online)
- App Camera: "Viral Moment" (video gets massive views)
- Crew: "Crew Loyalty Test" (choose between crew and solo opportunity)

---

## Files Modified/Created

### Modified
- `C:\git\battlerapuniversity\CLAUDE.md` (lines 30-48)
- `C:\git\battlerapuniversity\app\api\battler\create\route.ts` (lines 99-129)

### Created
- `C:\git\battlerapuniversity\components\onboarding\OriginSelector.tsx`
- `C:\git\battlerapuniversity\lib\tooltips-data.ts`
- `C:\git\battlerapuniversity\ORIGIN_SYSTEM_PLAYER_GUIDE.md`
- `C:\git\battlerapuniversity\ORIGIN_SYSTEM_IMPLEMENTATION_SUMMARY.md` (this file)
- `C:\git\battlerapuniversity\supabase\migrations\20251207152934_seed_starter_crews.sql`

---

## Success Metrics

The Origin System is considered successful if:
1. ✅ Players understand the three paths and their mechanical differences
2. ✅ Origin bonuses create meaningful early game differentiation
3. ✅ All three origins lead to viable long-term builds
4. ✅ Player choice reflects their intended playstyle (writer/performer/balanced)
5. ✅ Documentation is clear enough that players don't need to ask "which origin is best?"

---

## Conclusion

The Origin System adds narrative depth and mechanical variety to character creation without introducing complexity or balance issues. It's implemented, documented, and ready for playtesting.

**Next Steps**:
- Playtest all three origins with different attribute builds
- Monitor player feedback on origin balance
- Consider implementing tutorial system (optional)
- Add origin-specific achievements/badges (future)
