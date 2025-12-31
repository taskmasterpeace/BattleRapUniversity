# Orphan Features Implementation Plan

## Overview

We have 45 orphan tables that are designed but not fully connected. This plan shows how to integrate them into the existing game loop.

---

## PHASE 1: Quick Wins (Already Wired, Just Need UI)

### 1. Manager History & Grudges (Trigger exists, needs UI)

**Status**: Database trigger `record_manager_change()` already handles:
- Recording when battlers change managers
- Creating grudges when battlers are signed away
- Helper function `has_manager_grudge()` exists

**To Implement**:
- [ ] Add "Management History" section to battler profile page
- [ ] Show grudge indicator when facing opponent from ex-manager's roster
- [ ] Add grudge bonus/penalty in battle simulation

**Files to modify**:
- `app/battler/[id]/page.tsx` - Add management history section
- `lib/game/simulation.ts` - Add grudge bonus calculation
- `app/battle/[id]/page.tsx` - Show grudge indicator

---

### 2. Head-to-Head Records (Table ready, needs population + UI)

**Table**: `head_to_head_records` - Full schema with:
- Win counts for each battler
- Last battle info
- Average score differential
- Battle IDs history

**To Implement**:
- [ ] Populate H2H records after each battle completion
- [ ] Show H2H record on battle offer cards
- [ ] Display rivalry history on battler profiles

**Files to create/modify**:
- `lib/game/headToHead.ts` - Utility to update H2H records
- `app/api/internal/run-due-battles/route.ts` - Call H2H update after battle
- `components/battle/battle-offer-card.tsx` - Show H2H record

---

### 3. XP History (Table ready, needs population + UI)

**Table**: `xp_history` - Tracks XP earned per battle with breakdown

**To Implement**:
- [ ] Record XP earned after each battle
- [ ] Show XP history in career stats
- [ ] Add XP progress bar to dashboard

**Files to create/modify**:
- `lib/game/xpSystem.ts` - XP calculation and recording
- `app/api/internal/run-due-battles/route.ts` - Record XP after battle
- `components/battler/xp-progress.tsx` - XP display component

---

## PHASE 2: Belt/Championship System (Using `throne_positions`)

### Concept: League Belts

Transform `throne_positions` into a championship belt system:
- Each league has 1-3 belt positions (Champion, #1 Contender, etc.)
- Win streak or rating triggers title shot
- Defending champion must face challengers

**Table**: `throne_positions`
```sql
league_id     -- Which league's belt
position      -- 1 = Champion, 2 = #1 Contender, etc.
battler_id    -- Current holder
defense_count -- Successful defenses
```

**Related Tables**:
- `throne_challenges` - Championship match requests
- `throne_history` - Past champions

**To Implement**:
- [ ] Rename in UI to "Championship Belts"
- [ ] Auto-populate champions based on highest-rated battlers per league
- [ ] Add championship match offer type
- [ ] Show belt icons on battler cards
- [ ] Track defense counts

**Files to create**:
- `app/api/championships/route.ts` - Get current champions
- `components/battler/belt-display.tsx` - Show belt icon
- `lib/game/championships.ts` - Belt logic

---

## PHASE 3: Rivalry Storylines System

### Tables Involved:
- `battler_relationships` (30 columns!) - Full state machine for rivalries
- `rivalry_storylines` - Events in the rivalry narrative

### What's Already Designed:
```sql
battler_relationships:
  - current_state (fresh/warming/heated/blood_feud/resolved)
  - state_level (intensity 1-10)
  - crowd_perception_a/b
  - is_ducking_a/b (tracking if someone is avoiding the fight)
  - twitter_beef_active
  - action_history (JSONB log)
```

**To Implement**:
- [ ] Initialize relationships after battles
- [ ] Escalate rivalry based on grudge actions
- [ ] Generate rivalry storyline events
- [ ] Show rivalry status in media hub
- [ ] Add rivalry-specific battle offers

**Files to create**:
- `lib/game/rivalryEngine.ts` - Manage rivalry state machine
- `app/api/rivalries/route.ts` - Get player's rivalries
- `components/media/rivalry-card.tsx` - Display rivalry status

---

## PHASE 4: Notifications System

**Table**: `notifications`
```sql
type (battle_offer, battle_result, life_event, championship, etc.)
title, message, metadata
is_read, read_at
```

**To Implement**:
- [ ] Create notifications on key events
- [ ] Add notification bell to header
- [ ] Show notification count badge
- [ ] Mark as read on click

**Files to create**:
- `lib/services/notificationService.ts`
- `app/api/notifications/route.ts`
- `components/ui/notification-bell.tsx`

---

## PHASE 5: Old Life Events Migration

### Comparison:
| Old `life_events` | New `battler_life_events` |
|-------------------|---------------------------|
| event_type | template_code |
| trigger_source | (inferred from template) |
| choice_made | chosen_option |
| attribute_changes | details_json |
| public | (use template's public flag) |

**Decision**: The new system is more comprehensive. OLD table can be DROPPED.
- Keep `battler_life_events` (storyline integration)
- Keep `scheduled_life_events` (future events)
- Keep `life_event_templates` (event definitions)
- DROP `life_events` (obsolete)

---

## PHASE 6: Fix Missing Tables

Code references tables that DON'T EXIST:

### 1. `prep_counters`
**Referenced in**: `app/api/battles/[id]/counters/route.ts`
**Purpose**: Track counter/rebuttal preparation for specific opponent angles
**Fix**: Create table OR remove dead code

### 2. `prep_segments`
**Referenced in**: `app/api/battles/[id]/segments/route.ts`
**Purpose**: Track segment-by-segment prep planning
**Fix**: Create table OR remove dead code

### 3. `earned_badges`
**Referenced in**: `app/api/battler/[id]/route.ts`
**Purpose**: Track badges earned by battler
**Fix**: Table should be `badge_earned` - update code reference

---

## PHASE 7: Tables to DROP (True Orphans)

These tables have no code references AND no clear purpose:

| Table | Reason to Drop |
|-------|----------------|
| `active_events` | Replaced by `events` |
| `badge_progress` | Not implemented, badge system uses different approach |
| `battle_decisions` | In-battle decisions not implemented |
| `battle_deposits` | Financial deposits not implemented |
| `battle_intelligence` | Intel system not implemented |
| `battle_judge_scores` | Judge scoring not implemented |
| `battle_progression` | Duplicate of battle_rounds? |
| `battle_schedule` | Scheduling handled differently |
| `battle_views` | View tracking not implemented |
| `battler_contracts` | Contract system not implemented |
| `battler_financial_history` | Use `battler_earnings` instead |
| `battler_secrets` | Secrets not fully implemented |
| `battler_view_history` | View tracking not implemented |
| `blogger_memory` | Blogger AI not implemented |
| `call_out_cosigns` | Cosigns not implemented |
| `career_day_history` | Career days not implemented |
| `contract_offers` | Use battle offers instead |
| `crew_assists` | Crew assists not implemented |
| `crew_challenges` | Crew challenges not implemented |
| `crowd_reactions` | Use battle_segments.event_flags instead |
| `event_eligibility` | Events use different filtering |
| `event_history` | Use events table directly |
| `jail_events` | Legal system not implemented |
| `karmic_debt` | Karma system not implemented |
| `league_blacklists` | Blacklists not implemented |
| `league_summary` | Use leagues table directly |
| `life_events` | OLD - replaced by battler_life_events |
| `origin_milestones` | Origin system not fully implemented |
| `profiles` | Auth handled by Supabase auth.users |
| `promotion_events` | Promotions not implemented |
| `public_knowledge` | Use battler_public_info instead |
| `round_content_selections` | Content selection not implemented |
| `scandals` | Use news_articles with type='scandal' |
| `tournament_battle_scorecards` | Tournament scoring not implemented |

---

## Implementation Priority

### Week 1: Quick Wins
1. Fix `badge_earned` → `earned_badges` code reference
2. Add manager history to battler profile
3. Show grudge indicator in battles
4. Populate H2H records on battle completion

### Week 2: Championship Belts
1. Initialize belt holders from top-rated battlers
2. Add belt icons to UI
3. Create championship match offers
4. Track defenses

### Week 3: Rivalries
1. Auto-create relationships after battles
2. Escalate based on grudge actions
3. Show rivalry status
4. Generate rivalry news articles

### Week 4: Notifications + Cleanup
1. Implement notification system
2. Create migration to DROP orphan tables
3. Remove dead code referencing missing tables

---

## Quick Reference: Tables by Status

### KEEP & CONNECT (Need code changes)
- `manager_history` - Add UI
- `manager_grudges` - Add to battle simulation
- `head_to_head_records` - Populate + UI
- `throne_positions` - Belt system
- `throne_challenges` - Belt matches
- `throne_history` - Past champions
- `rivalry_storylines` - Connect to relationships
- `notifications` - Implement
- `xp_history` - Track XP

### KEEP (Already working)
- All other used tables

### DROP (Orphans)
- 30+ tables listed in Phase 7
