# V2 Implementation Audit Checklist

Use this checklist to verify V2 feature implementation.

---

## PART 1: SEGMENT SYSTEM

### 1.1 Segment Creation

- [ ] SegmentCreator component exists
- [ ] Can select content type (14 options)
- [ ] Can select delivery type (7 options)
- [ ] Can select performance type (8 options)
- [ ] Freestyle toggle works
- [ ] Counter toggle works
- [ ] Counter requires anticipated content when enabled
- [ ] Warning shown for Personals without Aggressive research
- [ ] Segment saved to database

### 1.2 Segment Display

- [ ] Segments show content/delivery/performance types
- [ ] Freestyle segments marked with icon
- [ ] Counter segments marked with icon
- [ ] Rehearsed segments marked
- [ ] Can edit existing segment
- [ ] Can delete segment

### 1.3 Segment API

- [ ] `GET /api/battles/[id]/segments` works
- [ ] `POST /api/battles/[id]/segments` creates segment
- [ ] `PUT /api/battles/[id]/segments/[id]` updates segment
- [ ] `DELETE /api/battles/[id]/segments/[id]` removes segment
- [ ] API rejects after prep lock

---

## PART 2: ROUND ORGANIZATION

### 2.1 RoundOrganizer Component

- [ ] RoundOrganizer component exists
- [ ] Shows unassigned segments area
- [ ] Shows 3 round columns
- [ ] Displays segments per round requirement (4 or 6)
- [ ] Shows current count per round
- [ ] Shows empty slots

### 2.2 Drag and Drop

- [ ] Can drag segment from unassigned to round
- [ ] Can drag segment between rounds
- [ ] Can drag segment back to unassigned
- [ ] Can reorder within a round
- [ ] Cannot exceed segments per round limit
- [ ] Visual feedback on valid/invalid drops
- [ ] Changes auto-save

### 2.3 Round Status

- [ ] Empty round shows "○" status
- [ ] Partial round shows "◐" status
- [ ] Complete round shows "✓" status
- [ ] Rehearsed round shows "✓✓" status
- [ ] Ready for battle only when all rounds complete

### 2.4 Organization API

- [ ] `POST /api/battles/[id]/segments/organize` works
- [ ] Bulk updates segment positions
- [ ] Validates round capacity

---

## PART 3: RESEARCH SYSTEM

### 3.1 ResearchLevelIndicator Component

- [ ] Component exists
- [ ] Shows None/Casual/Aggressive levels
- [ ] Highlights current level
- [ ] Shows days spent
- [ ] Shows days needed for next level
- [ ] Shows level benefits description

### 3.2 Research Tracking

- [ ] Research level calculated from prep days
- [ ] 0 days = None
- [ ] 1-2 days = Casual
- [ ] 3+ days = Aggressive
- [ ] Level displayed on prep page

### 3.3 Research Effects

- [ ] Personals without research shows warning
- [ ] Credibility risk indicator when applicable
- [ ] Research level affects simulation

### 3.4 Research API

- [ ] `GET /api/battles/[id]/research` returns level
- [ ] Returns effects on personals

---

## PART 4: PREP PIPELINE

### 4.1 PrepPipeline Component

- [ ] Component exists
- [ ] Shows Research → Writing → Rehearsal flow
- [ ] Shows percentage for each stage
- [ ] Shows current bottlenecks
- [ ] Visual connection between stages

### 4.2 Dependencies Enforced

- [ ] Cannot rehearse until round is written
- [ ] Warning for Personals without research
- [ ] Freestyle segments skip writing/rehearsal requirements
- [ ] UI shows dependency blockers

### 4.3 PrepProgressBars Component

- [ ] Full version shows all details
- [ ] Compact version for dashboard
- [ ] Color-coded by category (R/W/H)
- [ ] Shows percentages

---

## PART 5: COUNTER SYSTEM

### 5.1 CounterSlotManager Component

- [ ] Component exists
- [ ] Shows available counter slots
- [ ] Shows locked slots (need badges)
- [ ] Can create counter
- [ ] Can select anticipated content
- [ ] Shows effectiveness multipliers (1.5x / 0.5x)
- [ ] Can remove counter

### 5.2 Counter Creation

- [ ] Can use existing segment as counter
- [ ] Can create new segment inline
- [ ] Requires anticipated content type
- [ ] Respects slot limits

### 5.3 Counter in Battle

- [ ] Counter resolution during simulation
- [ ] 1.5x if triggered (opponent uses content)
- [ ] 0.5x if missed (opponent doesn't use)
- [ ] Results show counter outcomes

### 5.4 Counter Badges

- [ ] Default: 1 counter slot
- [ ] "Prepared" badge: +1 slot
- [ ] "Over-Preparer" badge: +2 slots
- [ ] Locked slots show required badge

### 5.5 Counter API

- [ ] `GET /api/battles/[id]/counters` returns counters
- [ ] `POST /api/battles/[id]/counters` creates counter
- [ ] `DELETE /api/battles/[id]/counters/[id]` removes
- [ ] Returns slot availability

---

## PART 6: PREP PAGE UPDATES

### 6.1 Header Section

- [ ] Shows opponent name + avatar
- [ ] Shows league name and tier
- [ ] Shows round count (e.g., "3 ROUNDS")
- [ ] Shows round length (e.g., "3 MINUTES")
- [ ] Shows segments needed (e.g., "18 SEGMENTS")
- [ ] Shows battle date with countdown
- [ ] Shows prep lock date with countdown

### 6.2 Prep Progress Section

- [ ] Research progress bar with level
- [ ] Writing progress bar with segment count
- [ ] Rehearsal progress bar with round count
- [ ] Overall readiness indicator

### 6.3 Daily Focus Section

- [ ] Research option
- [ ] Writing option
- [ ] Rehearsal option (renamed from Performance)
- [ ] Life option
- [ ] Rest option

### 6.4 Content Crafting Section

- [ ] Integrated into prep page
- [ ] Segment creator accessible
- [ ] Round organizer visible
- [ ] Counter slot manager visible

### 6.5 Navigation

- [ ] "Save & Return" → Dashboard
- [ ] "Ready to Battle" → Mode Selection
- [ ] "Ready" button disabled if not ready

---

## PART 7: ROUND SHIFTING

### 7.1 RoundShiftModal Component

- [ ] Component exists
- [ ] Shows opponent's round performance
- [ ] Shows current round order
- [ ] Shows proposed shift
- [ ] Shows penalty calculation
- [ ] Keep/Shift buttons

### 7.2 Shift Logic

- [ ] Only available after round 1 and 2
- [ ] Can only shift unplayed rounds
- [ ] Maximum 1 shift per battle
- [ ] Base penalty: -5% consistency
- [ ] Rehearsed penalty: additional -10%

### 7.3 Shift API

- [ ] `POST /api/battles/[id]/rounds/shift` works
- [ ] Returns penalty applied
- [ ] Updates round order
- [ ] Blocks after shift used

---

## PART 8: FREESTYLE SEGMENTS

### 8.1 Freestyle Toggle

- [ ] Toggle in SegmentCreator
- [ ] Freestyle segments marked clearly
- [ ] No writing days needed
- [ ] No rehearsal needed

### 8.2 Freestyle Performance

- [ ] Higher variance in simulation
- [ ] Better with Freestyle badges
- [ ] Base: 5.5 average
- [ ] With Freestyle Genius: 7.5 average

### 8.3 Freestyle Badges

- [ ] Freestyle Genius: +2.0 average, -30% variance
- [ ] Off the Top: +1.5 average
- [ ] Quick Wit: +1.0 average

---

## PART 9: DASHBOARD WIDGET

### 9.1 PrepProgressWidget Updates

- [ ] Shows opponent name + avatar
- [ ] Shows league
- [ ] Shows days until battle
- [ ] Shows research level
- [ ] Shows writing progress
- [ ] Shows rehearsal progress
- [ ] Shows round status icons
- [ ] Shows counter status
- [ ] "Continue Prep" button works

### 9.2 Widget Display

- [ ] Only shows when active battle exists
- [ ] Updates in real-time (or on refresh)
- [ ] Responsive design

### 9.3 Prep Progress API

- [ ] `GET /api/battles/[id]/prep-progress` returns all data
- [ ] Includes all progress metrics
- [ ] Includes round details
- [ ] Includes blockers list

---

## PART 10: NEW BADGES

### 10.1 Prep Badges Implemented

- [ ] Photographic Memory (-25% research days)
- [ ] Quick Writer (+40% writing speed)
- [ ] Double Shift (2 activities per day)
- [ ] Team Player (+20% writing with team)
- [ ] Last Minute Larry (+30% with low prep)
- [ ] Preparation Monster (+50% with high prep)

### 10.2 Counter Badges Implemented

- [ ] Prepared (+1 counter slot)
- [ ] Over-Preparer (+2 counter slots)
- [ ] Counter King (+25% counter effectiveness)

### 10.3 Badge Effects

- [ ] Badge effects applied in calculations
- [ ] Badge requirements validated
- [ ] Badge effects shown in UI

---

## PART 11: DATABASE

### 11.1 New Tables

- [ ] `battle_segments` table created
- [ ] `battle_counters` table created
- [ ] Proper indexes exist
- [ ] Foreign keys correct
- [ ] Constraints enforced

### 11.2 Updated Tables

- [ ] `battles` has `round_order` column
- [ ] `battles` has `rounds_shifted` column

### 11.3 Migrations

- [ ] Migration files created
- [ ] Migrations run successfully
- [ ] Rollback works

---

## PART 12: SIMULATION UPDATES

### 12.1 Segment-Based Simulation

- [ ] Uses assigned segments
- [ ] Calculates per-segment effectiveness
- [ ] Content type matchups applied
- [ ] Delivery/Performance affects score

### 12.2 Counter Resolution

- [ ] Checks if opponent uses anticipated content
- [ ] Applies 1.5x if triggered
- [ ] Applies 0.5x if missed
- [ ] Adds credibility penalty if appropriate

### 12.3 Research Effects

- [ ] Personals effectiveness based on research
- [ ] Credibility penalty for unresearched personals
- [ ] Aggressive research bonus

### 12.4 Freestyle Calculation

- [ ] Higher variance applied
- [ ] Badge bonuses calculated
- [ ] Random factor appropriate

---

## AUDIT COMPLETION SUMMARY

**Date Audited**: _______________

**Auditor**: _______________

### Feature Completion

| Feature | Components | API | Database | Simulation |
|---------|------------|-----|----------|------------|
| Segment System | __/10 | __/4 | __/2 | __/2 |
| Round Organization | __/8 | __/2 | __/1 | N/A |
| Research System | __/7 | __/2 | N/A | __/3 |
| Counter System | __/9 | __/3 | __/1 | __/3 |
| Prep Page Updates | __/12 | __/1 | N/A | N/A |
| Round Shifting | __/5 | __/1 | __/1 | __/1 |
| Freestyle | __/6 | N/A | N/A | __/3 |
| Dashboard Widget | __/5 | __/1 | N/A | N/A |
| New Badges | __/9 | N/A | N/A | __/3 |

### Overall Status

- Total Checklist Items: ~100
- Completed: __/100
- Percentage: __%

### Critical Blockers

1. ________________________________
2. ________________________________
3. ________________________________

### Notes

_____________________________________________
_____________________________________________
_____________________________________________

---

## TEST SCENARIOS

### Test 1: Full Prep Flow

1. [ ] Accept battle offer
2. [ ] See updated prep header (rounds, segments needed)
3. [ ] Set Day 1-2 to Research
4. [ ] Verify research level becomes "Casual"
5. [ ] Create 6 segments
6. [ ] Assign 4 segments to Round 1
7. [ ] Verify Round 1 shows 4/4
8. [ ] Set Day 3-6 to Writing
9. [ ] Create 12 more segments (18 total)
10. [ ] Organize all 18 into 3 rounds
11. [ ] Set Day 7-8 to Rehearsal
12. [ ] Verify Round 1 shows rehearsed
13. [ ] Click "Ready to Battle"
14. [ ] Verify navigation to mode selection

### Test 2: Counter System

1. [ ] Create a counter segment
2. [ ] Set anticipated content to "Personals"
3. [ ] Complete prep and start battle
4. [ ] If opponent uses Personals: Counter is 1.5x
5. [ ] If opponent doesn't: Counter is 0.5x
6. [ ] Results show counter outcome

### Test 3: Round Shifting

1. [ ] Complete 3 rounds of prep
2. [ ] Start battle (Locked In mode)
3. [ ] Complete Round 1
4. [ ] See option to shift rounds
5. [ ] Shift Round 2 and Round 3
6. [ ] Verify penalty applied
7. [ ] Complete battle

### Test 4: Freestyle Segments

1. [ ] Create segment with Freestyle toggle ON
2. [ ] Assign to Round 1
3. [ ] Note: No writing days needed
4. [ ] Complete battle
5. [ ] Verify freestyle segment has higher variance

### Test 5: Research Effects

1. [ ] Create Personals segment with NO research
2. [ ] See warning about credibility risk
3. [ ] Complete battle
4. [ ] If opponent calls it out: credibility penalty
5. [ ] Repeat with Aggressive research
6. [ ] No penalty, +20% effectiveness

---

## NEXT STEPS AFTER V2

### V3 Potential Features

1. **Team System** - Form/join teams with other battlers
2. **Promotion System** - Build hype before battles
3. **Live Battle Events** - Tournaments and events
4. **Expanded Media** - Video content, interviews
5. **Legacy System** - Long-term career tracking

---

**End of Audit Checklist**
