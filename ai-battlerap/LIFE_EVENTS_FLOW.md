# Life Events System Flow Diagram

## Complete Integration Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BATTLE SIMULATION PIPELINE                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 1. Battle Scheduled (status: 'accepted')                           │
│    - Player has accepted battle offer                               │
│    - Prep blocks created by player                                  │
│    - scheduled_at date arrives                                       │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Generate AI Prep (if missing)                                   │
│    - Auto-generate balanced prep for AI opponent                    │
│    - Ensures both battlers have prep data                           │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 3. PRE-BATTLE LIFE EVENT CHECK (NEW!)                             ┃
┃                                                                     ┃
┃    fetchBattlerContext(battler_id)                                 ┃
┃    ├─ Fetch attributes (writing, performance, personal)            ┃
┃    ├─ Fetch ranking (rating, wins, losses, streak)                 ┃
┃    └─ Fetch prep patterns (consecutive days, recent chokes)        ┃
┃                                                                     ┃
┃    evaluatePreBattleEvents(battle_id, playerContext)               ┃
┃    ├─ Check stress thresholds                                      ┃
┃    │  └─ High stress? → "Burnout" event                            ┃
┃    ├─ Check prep patterns                                          ┃
┃    │  └─ No rest in 5 battles? → "Exhaustion" event                ┃
┃    ├─ Check attribute thresholds                                   ┃
┃    │  └─ Low family bond? → "Personal Crisis" event                ┃
┃    └─ Random events (low probability)                              ┃
┃       └─ "Inspiration" or "Distraction" events                     ┃
┃                                                                     ┃
┃    Events Created:                                                 ┃
┃    - PASSIVE: Auto-applied, instant effects                        ┃
┃    - CHOICE: Pending, requires player decision                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┬━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Simulate Battle (existing core logic)                           │
│    - Calculate prep modifiers                                       │
│    - Simulate 3 rounds, 4-6 segments per round                      │
│    - Track scores, chokes, crowd reactions                          │
│    - Determine winner                                               │
│    - Save rounds and segments to database                           │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 5. POST-BATTLE LIFE EVENT EVALUATION (NEW!)                       ┃
┃                                                                     ┃
┃    Fetch completed battle results                                  ┃
┃    ├─ winner_battler_id                                            ┃
┃    ├─ status: 'completed'                                          ┃
┃    └─ scheduled_at                                                 ┃
┃                                                                     ┃
┃    Fetch and aggregate battle_rounds                               ┃
┃    ├─ Player rounds (3 rounds)                                     ┃
┃    │  ├─ Wins: count where won = true                              ┃
┃    │  ├─ Chokes: any where choke = true                            ┃
┃    │  ├─ Avg crowd reaction: mean(crowd_reaction)                  ┃
┃    │  ├─ Peak score: max(peak_score)                               ┃
┃    │  └─ Consistency: mean(consistency_score)                      ┃
┃    └─ AI rounds (3 rounds)                                         ┃
┃       └─ Same calculations for comparison                          ┃
┃                                                                     ┃
┃    Build battleContext                                             ┃
┃    ├─ result: "3-0", "2-1", etc.                                   ┃
┃    ├─ winnerId                                                     ┃
┃    ├─ playerChoked: boolean                                        ┃
┃    ├─ playerAvgCrowdReaction: 0-100                                ┃
┃    └─ playerPeakScore: 0-10                                        ┃
┃                                                                     ┃
┃    fetchBattlerContext(battler_id) [again, for updated stats]      ┃
┃                                                                     ┃
┃    evaluatePostBattleEvents(battleContext, playerContext)          ┃
┃    ├─ Check result conditions                                      ┃
┃    │  ├─ 3-0 win? → "DOMINANT_VICTORY"                             ┃
┃    │  ├─ 0-3 loss? → "ROCK_BOTTOM"                                 ┃
┃    │  └─ 2-1 close? → "CONTROVERSIAL_DECISION"                     ┃
┃    ├─ Check choke conditions                                       ┃
┃    │  └─ Choked? → "CHOKE_EVENT" or "PUBLIC_HUMILIATION"           ┃
┃    ├─ Check streak conditions                                      ┃
┃    │  ├─ 3 wins? → "WIN_STREAK_3"                                  ┃
┃    │  ├─ 5 wins? → "WIN_STREAK_5"                                  ┃
┃    │  └─ 3 losses? → "LOSING_STREAK"                               ┃
┃    └─ Check special conditions                                     ┃
┃       ├─ High public knowledge + choke? → "PUBLIC_HUMILIATION"     ┃
┃       └─ Close crowd + loss? → "CONTROVERSIAL_LOSS"                ┃
┃                                                                     ┃
┃    Events Created:                                                 ┃
┃    - TRIGGERED: Based on performance, requires choice              ┃
┃    - Updates prep_pattern_tracking (recent_chokes++)               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┬━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. Update Battler Stress (existing)                                │
│    - Calculate stress from prep patterns                            │
│    - Apply stress decay                                             │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. Generate New Battle Offers (existing)                           │
│    - 1-3 new offers based on rating                                 │
│    - Status: 'offered'                                              │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════

                    PLAYER EXPERIENCE FLOW

═══════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│ A. Player visits Dashboard                                         │
│    └─ Dashboard queries battler_life_events (status='pending')      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ B. PendingLifeEventsWidget renders                                 │
│                                                                     │
│    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓    │
│    ┃ 🎭 LIFE EVENTS                                    2         ┃    │
│    ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫    │
│    ┃ 2 life events need your decision.                         ┃    │
│    ┃                                                            ┃    │
│    ┃ ┌────────────────────────────────────────────────────┐    ┃    │
│    ┃ │ Confidence Shaken                                  │    ┃    │
│    ┃ │ You choked in front of everyone. The crowd went... │    ┃    │
│    ┃ │ [MAKE DECISION]                                    │    ┃    │
│    ┃ └────────────────────────────────────────────────────┘    ┃    │
│    ┃                                                            ┃    │
│    ┃ ┌────────────────────────────────────────────────────┐    ┃    │
│    ┃ │ League Recognition                                 │    ┃    │
│    ┃ │ Your 3-0 bodybag has the league talking. They...  │    ┃    │
│    ┃ │ [MAKE DECISION]                                    │    ┃    │
│    ┃ └────────────────────────────────────────────────────┘    ┃    │
│    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ C. Player clicks "MAKE DECISION"                                   │
│    └─ Navigate to /life-events/[event_id]                          │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ D. Life Event Resolution Page                                      │
│                                                                     │
│    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓    │
│    ┃ Confidence Shaken                                          ┃    │
│    ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫    │
│    ┃ You choked in front of everyone. The crowd went silent.    ┃    │
│    ┃ The doubt is real now.                                     ┃    │
│    ┃                                                            ┃    │
│    ┃ What do you do?                                            ┃    │
│    ┃                                                            ┃    │
│    ┃ ┌────────────────────────────────────────────────────┐    ┃    │
│    ┃ │ A. Hire a Performance Coach                        │    ┃    │
│    ┃ │    - Financial Stability: -0.5                     │    ┃    │
│    ┃ │    + Resilience: +0.3                              │    ┃    │
│    ┃ │    + Stage Presence: +0.2                          │    ┃    │
│    ┃ │    [CHOOSE THIS]                                   │    ┃    │
│    ┃ └────────────────────────────────────────────────────┘    ┃    │
│    ┃                                                            ┃    │
│    ┃ ┌────────────────────────────────────────────────────┐    ┃    │
│    ┃ │ B. Push Through Alone                              │    ┃    │
│    ┃ │    - Resilience: -0.2                              │    ┃    │
│    ┃ │    - Reputation: -0.1                              │    ┃    │
│    ┃ │    [CHOOSE THIS]                                   │    ┃    │
│    ┃ └────────────────────────────────────────────────────┘    ┃    │
│    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ E. Player selects option A                                         │
│    - Update battler_life_events (status='resolved', choice='A')     │
│    - Update battler_attributes (apply effects)                      │
│    - Redirect to dashboard                                          │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ F. Dashboard refreshes                                             │
│    - Event removed from pending list                                │
│    - Updated attributes visible in stats section                    │
│    - Player sees changes reflected                                  │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════

                    DATABASE STATE CHANGES

═══════════════════════════════════════════════════════════════════════

Pre-Battle:
┌─────────────────────────────────────────────────────────────────────┐
│ prep_pattern_tracking                                               │
│ ├─ consecutive_rest_days: 0                                         │
│ ├─ battles_without_rest: 5  ← Threshold met!                        │
│ └─ recent_chokes: 2                                                 │
└─────────────────────────────────────────────────────────────────────┘
                        ↓
                  (triggers event)
                        ↓
┌─────────────────────────────────────────────────────────────────────┐
│ battler_life_events                                                 │
│ ├─ template_code: 'BURNOUT'                                         │
│ ├─ status: 'pending'                                                │
│ ├─ event_type: 'choice'                                             │
│ └─ triggered_at: NOW()                                              │
└─────────────────────────────────────────────────────────────────────┘

Post-Battle:
┌─────────────────────────────────────────────────────────────────────┐
│ battle_rounds                                                       │
│ ├─ Round 1: won=true, choke=false, peak_score=8.5                  │
│ ├─ Round 2: won=true, choke=false, peak_score=9.2                  │
│ └─ Round 3: won=true, choke=false, peak_score=8.8                  │
│                                                                     │
│ Result: 3-0 Victory                                                 │
└─────────────────────────────────────────────────────────────────────┘
                        ↓
                  (triggers event)
                        ↓
┌─────────────────────────────────────────────────────────────────────┐
│ battler_life_events                                                 │
│ ├─ template_code: 'DOMINANT_VICTORY'                                │
│ ├─ status: 'pending'                                                │
│ ├─ event_type: 'triggered'                                          │
│ ├─ battle_id: (battle that triggered it)                            │
│ └─ details_json: {"result": "3-0", "outcome": "win"}                │
└─────────────────────────────────────────────────────────────────────┘

After Resolution:
┌─────────────────────────────────────────────────────────────────────┐
│ battler_life_events                                                 │
│ ├─ status: 'resolved'  ← Changed from 'pending'                     │
│ ├─ resolved_at: NOW()                                               │
│ ├─ choice_made: 'A'                                                 │
│ └─ effects_applied: {"reputation": 0.5, "public_knowledge": 10}     │
└─────────────────────────────────────────────────────────────────────┘
                        ↓
                  (applies effects)
                        ↓
┌─────────────────────────────────────────────────────────────────────┐
│ battler_attributes                                                  │
│ ├─ personal.reputation: 6.5 → 7.0  (+0.5)                          │
│ └─ public_knowledge: 45 → 55        (+10)                           │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════

                    TRIGGER CONDITION EXAMPLES

═══════════════════════════════════════════════════════════════════════

Event: DOMINANT_VICTORY
Trigger: {"result": "3-0", "outcome": "win"}
Logic: result === "3-0" AND winnerId === playerBattlerId
Probability: 100% (always triggers)

Event: CHOKE_EVENT
Trigger: {"choked": true}
Logic: playerRounds.some(r => r.choke === true)
Probability: 100%

Event: WIN_STREAK_3
Trigger: {"win_streak": 3}
Logic: isWin AND (streak > 0 ? streak + 1 : 1) >= 3
Probability: 100%

Event: CONTROVERSIAL_LOSS
Trigger: {"result": "2-1", "outcome": "loss", "close_crowd_reaction": true}
Logic: result === "2-1" AND isLoss AND crowdDiff < 10
Probability: 100%

Event: BURNOUT (Pre-battle)
Trigger: {"battles_without_rest": 5}
Logic: prepPatterns.battles_without_rest >= 5
Probability: 75%


═══════════════════════════════════════════════════════════════════════

                    ERROR HANDLING

═══════════════════════════════════════════════════════════════════════

Scenario: Life event trigger throws error
Result: Error caught, logged, battle simulation continues
Impact: Player doesn't get event, but battle completes normally

Scenario: Database query fails
Result: Error caught, logged, simulation continues
Impact: Events skipped for this battle, retry next battle

Scenario: Invalid battle context
Result: Validation fails, event not triggered
Impact: No event created, no error thrown

All errors are non-blocking - the battle simulation ALWAYS completes.
