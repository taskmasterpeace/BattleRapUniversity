/**
 * Badge System - Mechanical Effects
 *
 * This system maps style_tags (badges) to concrete mechanical effects.
 * Badges modify prep efficiency, attribute effectiveness, and special mechanics.
 *
 * Design Philosophy:
 * - Each badge should create a DISTINCT playstyle
 * - Trade-offs matter: strengths come with weaknesses
 * - Synergies and conflicts create build diversity
 * - Badges affect both preparation and in-battle performance
 */

import type { PrepProfile, ModifiedAttributes, WritingStats, PerformanceStats } from '@/lib/models';

// ============================================================================
// Badge Effect Interfaces
// ============================================================================

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeEffects {
  // Prep efficiency modifiers (multiplied with base prep gains)
  writingPrepEfficiency: number;      // Default: 1.0
  performancePrepEfficiency: number;  // Default: 1.0
  researchPrepEfficiency: number;     // Default: 1.0
  restEfficiency: number;             // Default: 1.0
  lifePrepEfficiency: number;         // Default: 1.0

  // Specific attribute multipliers (applied to final modified attributes)
  lyricismMultiplier: number;         // Default: 1.0
  wordplayMultiplier: number;         // Default: 1.0
  creativityMultiplier: number;       // Default: 1.0
  stagePresenceMultiplier: number;    // Default: 1.0
  crowdControlMultiplier: number;     // Default: 1.0
  deliveryMultiplier: number;         // Default: 1.0

  // Special mechanics
  chokeReduction: number;             // Flat reduction to choke probability (default: 0)
  chokeIncrease: number;              // Flat increase to choke probability (default: 0)
  stumbleReduction: number;           // Flat reduction to stumble probability (default: 0) - NEW PHASE 4
  stumbleIncrease: number;            // Flat increase to stumble probability (default: 0) - NEW PHASE 4
  rebuttalBonus: number;              // Bonus when going second (default: 0) - NEW PHASE 4
  peakBonus: number;                  // Multiplier for peak segments (default: 0)
  consistencyBonus: number;           // Bonus to consistency score (default: 0)
  consistencyPenalty: number;         // Penalty to consistency score (default: 0)
  crowdReactionBonus: number;         // Flat bonus to crowd reaction (default: 0)

  // Variance modifiers
  segmentVarianceMultiplier: number;  // Multiplier for segment variance (default: 1.0)

  // Prep pattern bonuses
  lowPrepBonus: boolean;              // Benefits from minimal prep (freestylers)
  highPrepBonus: boolean;             // Benefits from maximum prep (technical writers)
  balancedPrepBonus: boolean;         // Benefits from diverse prep

  // League preference
  smallRoomBonus: number;             // Bonus in Small Room Circuit (default: 0)
  mainStageBonus: number;             // Bonus in Main Stage Arena (default: 0)
}

export interface BadgeDefinition extends Partial<BadgeEffects> {
  rarity?: BadgeRarity;
  description?: string;
}

// Default badge effects (neutral)
const DEFAULT_EFFECTS: BadgeEffects = {
  writingPrepEfficiency: 1.0,
  performancePrepEfficiency: 1.0,
  researchPrepEfficiency: 1.0,
  restEfficiency: 1.0,
  lifePrepEfficiency: 1.0,
  lyricismMultiplier: 1.0,
  wordplayMultiplier: 1.0,
  creativityMultiplier: 1.0,
  stagePresenceMultiplier: 1.0,
  crowdControlMultiplier: 1.0,
  deliveryMultiplier: 1.0,
  chokeReduction: 0,
  chokeIncrease: 0,
  stumbleReduction: 0,                // NEW PHASE 4
  stumbleIncrease: 0,                 // NEW PHASE 4
  rebuttalBonus: 0,                   // NEW PHASE 4
  peakBonus: 0,
  consistencyBonus: 0,
  consistencyPenalty: 0,
  crowdReactionBonus: 0,
  segmentVarianceMultiplier: 1.0,
  lowPrepBonus: false,
  highPrepBonus: false,
  balancedPrepBonus: false,
  smallRoomBonus: 0,
  mainStageBonus: 0,
};

// ============================================================================
// Badge Definitions Database
// ============================================================================

export const BADGE_REGISTRY: Record<string, BadgeDefinition> = {

  // ========== WRITING & CONTENT BADGES ==========

  // Positive Writing Badges
  'Punchline King/Queen': {
    rarity: 'rare',
    peakBonus: 0.15,                    // 15% better peaks
    consistencyPenalty: 0.5,            // Less consistent, more flashy
    crowdReactionBonus: 5,              // Crowd loves big moments
  },

  'Scheme Specialist': {
    lyricismMultiplier: 1.25,
    writingPrepEfficiency: 1.3,         // Excellent at preparing complex schemes
    consistencyBonus: 1.0,              // Very consistent
    highPrepBonus: true,
  },

  'Metaphor Master': {
    creativityMultiplier: 1.3,
    lyricismMultiplier: 1.15,
    writingPrepEfficiency: 1.2,
    smallRoomBonus: 0.05,               // Appreciated in intimate settings
  },

  'Wordplay Wizard': {
    wordplayMultiplier: 1.4,            // HUGE wordplay bonus
    writingPrepEfficiency: 1.25,
    crowdReactionBonus: 8,
  },

  'Freestyle Genius': {
    lowPrepBonus: true,                 // THRIVES on minimal prep
    chokeReduction: 0.02,               // -2% choke chance (DOWN from 0.025)
    stumbleReduction: 0.006,            // -0.6% stumble (DOWN from 0.008)
    rebuttalBonus: 0.10,                // +10% when going second (DOWN from 0.12 - was winning 70% vs Balanced)
    researchPrepEfficiency: 1.10,       // +10% research prep (DOWN from 1.15)
    writingPrepEfficiency: 1.0,         // No writing bonus (DOWN from 1.05)
    performancePrepEfficiency: 1.10,    // +10% performance prep (DOWN from 1.15)
    creativityMultiplier: 1.15,         // +15% creativity (DOWN from 1.20)
    segmentVarianceMultiplier: 1.15,    // Less variance (DOWN from 1.2)
    consistencyPenalty: 1.15,           // Slightly more inconsistent (UP from 1.1)
    peakBonus: 0.08,                    // +8% peak score (DOWN from 0.10)
  },

  'Creativity Beast': {
    creativityMultiplier: 1.12,         // DOWN from 1.18 - still strong but not dominant
    wordplayMultiplier: 1.05,           // DOWN from 1.10
    researchPrepEfficiency: 1.10,       // DOWN from 1.15 - research fuels creativity
    peakBonus: 0.03,                    // DOWN from 0.05
  },

  'Consistent Writer': {
    consistencyBonus: 2.0,              // Much more consistent
    segmentVarianceMultiplier: 0.6,     // Lower variance
    writingPrepEfficiency: 1.20,        // UP from 1.18 - better prep efficiency
    lyricismMultiplier: 1.12,           // UP from 1.08 - solid lyricism boost
    wordplayMultiplier: 1.08,           // NEW - small wordplay boost
    crowdReactionBonus: 3,              // NEW - consistent = crowd appreciates reliability
    highPrepBonus: true,
  },

  'Technical Writer': {
    writingPrepEfficiency: 1.20,        // Writing prep 20% more effective (DOWN from 1.25)
    lyricismMultiplier: 1.12,           // Lyricism +12% (DOWN from 1.18 - was winning 76% vs PB)
    stagePresenceMultiplier: 0.88,      // Stage Presence -12% (UP from 0.80 - less harsh)
    crowdReactionBonus: -6,             // Crowds prefer entertainment (DOWN from -5)
    crowdControlMultiplier: 0.90,       // -10% crowd control (DOWN from 0.92)
    highPrepBonus: true,
    smallRoomBonus: 0.02,               // Small room bonus (DOWN from 0.04 - was too dominant)
  },

  'Angle Master': {
    researchPrepEfficiency: 1.40,       // Research prep 40% more effective (UP from 1.35)
    writingPrepEfficiency: 1.15,        // +15% writing prep (NEW)
    peakBonus: 0.25,                    // Good at big moments (UP from 0.20 - their key strength)
    creativityMultiplier: 1.25,         // +25% creativity (UP from 1.22)
    wordplayMultiplier: 1.10,           // +10% wordplay (UP from 1.08)
    lyricismMultiplier: 1.12,           // +12% lyricism (UP from 1.10)
    crowdReactionBonus: 8,              // +8 crowd (UP from 5 - angles get big reactions)
    consistencyBonus: 2.5,              // Prepared angles = very consistent (UP from 2.0)
  },

  'Rebuttal King/Queen': {
    chokeReduction: 0.02,
    creativityMultiplier: 1.2,
    performancePrepEfficiency: 1.15,
    lowPrepBonus: true,                 // Good at thinking on feet
  },

  'Multisyllabic Master': {
    lyricismMultiplier: 1.3,
    wordplayMultiplier: 1.2,
    writingPrepEfficiency: 1.25,
    deliveryMultiplier: 0.95,           // Slightly harder to deliver
    smallRoomBonus: 0.05,
  },

  'Pen Game Elite': {
    lyricismMultiplier: 1.18,           // DOWN from 1.25 to reduce stacking
    creativityMultiplier: 1.15,         // DOWN from 1.25
    wordplayMultiplier: 1.18,           // DOWN from 1.25
    writingPrepEfficiency: 1.20,        // DOWN from 1.30
    highPrepBonus: true,
    crowdReactionBonus: -6,             // UP from -10 (less harsh penalty)
  },

  // Negative Writing Badges (EXPANDED)
  'Recycler': {
    creativityMultiplier: 0.7,
    writingPrepEfficiency: 0.8,
    crowdReactionBonus: -10,
  },

  'Biter': {
    creativityMultiplier: 0.6,            // -40% creativity (stealing, not creating)
    crowdReactionBonus: -15,              // Crowd hates biters
    // Note: -2 reputation and scandal risk enforced in progression system
  },

  'Reach God/Goddess': {
    wordplayMultiplier: 0.7,              // Forced wordplay doesn't land
    crowdReactionBonus: -8,
    peakBonus: -0.1,                      // Bad at big moments
  },

  'One-Trick Pony': {
    creativityMultiplier: 0.75,           // Limited versatility
    consistencyBonus: 0.5,                // At least predictably consistent
    // Note: Opponents get +10% prep bonus against One-Trick Ponies (enforced in battle sim)
  },

  'Filler Abuser': {
    lyricismMultiplier: 0.8,              // -20% lyricism
    crowdReactionBonus: -10,
    peakBonus: -0.15,                     // Peak moments diluted by filler
  },

  'Outdated Referencer': {
    creativityMultiplier: 0.85,           // -15% creativity
    crowdReactionBonus: -12,              // Younger audiences don't get references
    researchPrepEfficiency: 0.8,          // Research 20% less effective
  },

  'Lazy Writer': {
    writingPrepEfficiency: 0.6,
    lyricismMultiplier: 0.8,
    wordplayMultiplier: 0.8,
    creativityMultiplier: 0.8,
  },

  'Predictable Rhymer': {
    lyricismMultiplier: 0.85,
    creativityMultiplier: 0.7,
    consistencyBonus: 0.5,              // At least they're consistent
  },

  'Weak Punchline Setups': {
    peakBonus: -0.15,                   // Terrible at big moments
    lyricismMultiplier: 0.85,
  },

  'Shallow Research': {
    researchPrepEfficiency: 0.5,        // Research barely helps
    creativityMultiplier: 0.9,
  },

  'Redundant': {
    lyricismMultiplier: 0.8,            // Says same thing multiple ways
    crowdReactionBonus: -10,
    peakBonus: -0.2,                    // Peak moments diluted
    writingPrepEfficiency: 0.85,
  },

  'Overcomplicated': {
    lyricismMultiplier: 1.1,            // +10% lyricism (technically skilled)
    crowdReactionBonus: -18,            // Way over audience heads
    deliveryMultiplier: 0.9,            // Hard to perform complex bars
    writingPrepEfficiency: 1.1,         // Good at writing, bad at execution
  },

  'Cliche Abuser': {
    creativityMultiplier: 0.7,          // -30% creativity
    wordplayMultiplier: 0.85,           // -15% wordplay
    crowdReactionBonus: -8,
    researchPrepEfficiency: 0.9,
  },

  'Name Flip Dependent': {
    wordplayMultiplier: 1.1,            // +10% wordplay (name flips count)
    creativityMultiplier: 0.75,         // -25% creativity (gimmicky)
    crowdReactionBonus: -12,
    // Note: Struggles against difficult names (enforced in battle system)
  },

  // ========== PERFORMANCE BADGES ==========

  // Positive Performance Badges
  'Crowd Favorite': {
    crowdReactionBonus: 8,              // DOWN from 15 - stacking was too strong
    crowdControlMultiplier: 1.15,       // DOWN from 1.30
    mainStageBonus: 0.04,               // DOWN from 0.08
  },

  'Stage Domination': {
    stagePresenceMultiplier: 1.08,      // DOWN from 1.12 - was winning 80% vs TW
    crowdControlMultiplier: 1.05,       // DOWN from 1.08
    mainStageBonus: 0.01,               // DOWN from 0.02 - less main stage advantage
    performancePrepEfficiency: 1.08,    // DOWN from 1.10
  },

  'Smooth Flow': {
    deliveryMultiplier: 1.18,           // DOWN from 1.30
    consistencyBonus: 1.0,
    performancePrepEfficiency: 1.15,    // DOWN from 1.20
  },

  'Aggressive': {
    deliveryMultiplier: 1.05,           // DOWN from 1.08 - was winning too much
    stagePresenceMultiplier: 1.04,      // DOWN from 1.06
    chokeIncrease: 0.022,               // UP from 0.020 - more choke risk for aggression
    crowdReactionBonus: 1,              // DOWN from 2
    mainStageBonus: 0.005,              // DOWN from 0.01 - minimal main stage advantage
  },

  'Charismatic': {
    crowdControlMultiplier: 1.15,       // DOWN from 1.35 - was WAY too strong
    stagePresenceMultiplier: 1.10,      // DOWN from 1.20
    crowdReactionBonus: 5,              // DOWN from 10
    performancePrepEfficiency: 1.10,    // DOWN from 1.15
  },

  'Theatrical': {
    stagePresenceMultiplier: 1.18,      // DOWN from 1.30
    crowdControlMultiplier: 1.15,       // DOWN from 1.25
    mainStageBonus: 0.05,               // DOWN from 0.10
    smallRoomBonus: -0.05,              // Less effective in small rooms
    performancePrepEfficiency: 1.15,    // DOWN from 1.25
  },

  'Speed Rapping': {
    deliveryMultiplier: 1.2,
    lyricismMultiplier: 1.15,
    crowdReactionBonus: 8,
    chokeIncrease: 0.015,               // Risky - more choke chance
  },

  'Unorthodox': {
    creativityMultiplier: 1.25,
    segmentVarianceMultiplier: 1.4,     // Very unpredictable
    consistencyPenalty: 1.0,
    crowdReactionBonus: 5,
  },

  // Negative Performance Badges (EXPANDED)
  'Choker': {
    chokeIncrease: 0.020,               // +2.0% per segment (Tru Foe: moderate choking)
    restEfficiency: 0.7,
    crowdReactionBonus: -10,
  },

  'Mumbler': {
    deliveryMultiplier: 0.7,            // -30% delivery
    crowdReactionBonus: -12,
    peakBonus: -0.15,                   // Great bars go unheard
  },

  'Monotone Deliverer': {
    deliveryMultiplier: 0.75,           // -25% delivery
    performancePrepEfficiency: 0.8,     // 20% less effective
    crowdReactionBonus: -8,
  },

  'Poor Breath Control': {
    deliveryMultiplier: 0.8,            // -20% delivery
    performancePrepEfficiency: 0.75,    // 25% less effective
    consistencyPenalty: 1.0,            // -15% consistency
    // Note: Gets worse in later rounds (enforced in battle simulation)
  },

  'Energy Drainer': {
    crowdControlMultiplier: 0.7,        // -30% crowd control
    crowdReactionBonus: -15,
    stagePresenceMultiplier: 0.8,       // -20% stage presence
  },

  'Inconsistent Performer': {
    segmentVarianceMultiplier: 1.8,     // Wildly inconsistent
    consistencyPenalty: 2.0,
  },

  'Crowd Killer': {
    crowdControlMultiplier: 0.7,
    crowdReactionBonus: -15,
  },

  'Awkward Stage Presence': {
    stagePresenceMultiplier: 0.7,
    crowdControlMultiplier: 0.8,
    mainStageBonus: -0.1,
  },

  'Off-Beat Performer': {
    deliveryMultiplier: 0.75,
    consistencyPenalty: 1.0,
  },

  'Overprepared': {
    highPrepBonus: false,
    writingPrepEfficiency: 1.15,
    performancePrepEfficiency: 0.85,    // Sounds robotic
    deliveryMultiplier: 0.9,
    chokeIncrease: 0.01,
  },

  'Underprepared': {
    writingPrepEfficiency: 0.7,
    performancePrepEfficiency: 0.7,
    chokeIncrease: 0.025,
  },

  // ========== REPUTATION & PERSONAL BADGES (EXPANDED) ==========

  'Respected Veteran': {
    crowdReactionBonus: 8,               // +8 crowd reaction (respected presence)
    chokeReduction: 0.02,                // -2% choke (experienced under pressure)
    restEfficiency: 1.2,                 // +20% rest efficiency
    // Note: +1 reputation, +20% positive media coverage, blogs perceive favorably
    // Note: Media system gives benefit of doubt in close battles, positive framing
  },

  'Consummate Professional': {
    writingPrepEfficiency: 1.15,        // +15% all prep types
    performancePrepEfficiency: 1.15,
    researchPrepEfficiency: 1.15,
    restEfficiency: 1.15,
    lifePrepEfficiency: 1.15,
    chokeReduction: 0.015,              // -1.5% choke chance (DOWN from 0.04 - was stacking to 0%)
    consistencyBonus: 1.0,
    // Note: +2 reputation and +25% battle offers enforced in progression
  },

  'Prepared Battler': {
    // Strong baseline badge for well-rounded battlers - competes with specialists
    writingPrepEfficiency: 1.30,        // +30% writing prep (UP from 1.25 - key to competitiveness)
    performancePrepEfficiency: 1.30,    // +30% performance prep (UP from 1.25)
    researchPrepEfficiency: 1.30,       // +30% research prep (UP from 1.25)
    chokeReduction: 0.015,              // -1.5% choke (DOWN from 0.02)
    highPrepBonus: true,                // Thrives with good prep
    consistencyBonus: 2.0,              // Very consistent (UP from 1.5)
    lyricismMultiplier: 1.15,           // +15% lyricism (UP from 1.12)
    stagePresenceMultiplier: 1.15,      // +15% stage presence (UP from 1.12)
    wordplayMultiplier: 1.10,           // +10% wordplay (NEW)
    crowdControlMultiplier: 1.10,       // +10% crowd control (NEW)
    deliveryMultiplier: 1.10,           // +10% delivery (NEW)
    crowdReactionBonus: 8,              // +8 crowd reaction (UP from 5)
  },

  'Clout Chaser': {
    crowdReactionBonus: 8,              // Gets crowd attention
    peakBonus: 0.1,                     // Focuses on viral moments
    consistencyPenalty: 0.5,            // Substance over style suffers
    // Note: +15 public knowledge, -1 reputation, +30% media attention enforced in progression
  },

  'Resilient Battler': {
    chokeReduction: 0.015,              // DOWN from 0.03 - prevent stacking to 0%
    restEfficiency: 1.25,
    consistencyBonus: 0.5,
  },

  'Big Stage Performer': {
    mainStageBonus: 0.12,
    smallRoomBonus: -0.05,
    chokeReduction: 0.02,
  },

  'Clutch Performer': {
    chokeReduction: 0.015,              // Clutch (DOWN from 0.025 - still causing 0%)
    peakBonus: 0.15,
    restEfficiency: 1.2,
  },

  'Battle Technician': {
    researchPrepEfficiency: 1.15,       // DOWN from 1.40 - was stacking too much
    writingPrepEfficiency: 1.12,        // DOWN from 1.25
    balancedPrepBonus: true,
    consistencyBonus: 0.8,              // DOWN from 1.0
  },

  'Known Choker': {
    chokeIncrease: 0.055,               // +5.5% per segment (UP from 4.5% - was showing 20% vs 46% target)
    restEfficiency: 0.6,
    crowdReactionBonus: -12,
  },

  'Sore Loser': {
    crowdControlMultiplier: 0.9,
    crowdReactionBonus: -5,
  },

  'Drama Starter': {
    crowdReactionBonus: 5,              // Controversial = attention
    chokeIncrease: 0.015,
    // Note: -30% battle offers and -2 reputation enforced in battle offer system
  },

  'Controversial': {
    // Double-edged sword: Both benefits and costs - target ~50%
    creativityMultiplier: 1.12,         // +12% creativity (UP from 1.10)
    crowdReactionBonus: 2,              // +2 crowd (UP from -2 - controversy = engagement)
    crowdControlMultiplier: 0.92,       // -8% crowd control (UP from 0.88)
    stagePresenceMultiplier: 0.95,      // -5% stage presence (UP from 0.92)
    chokeIncrease: 0.012,               // +1.2% choke (DOWN from 0.015)
    peakBonus: 0.12,                    // +12% peak (UP from 0.10)
    segmentVarianceMultiplier: 1.1,     // +10% variance (DOWN from 1.15)
    // Note: -1 reputation per battle and media attention enforced in progression system
  },

  'Unreliable': {
    chokeIncrease: 0.02,                // Higher choke risk
    restEfficiency: 0.8,                // Poor rest effectiveness
    // Note: +12% no-show risk, -40% battle offers, -2 Financial Stability enforced in systems
  },

  'Fallen Star': {
    lyricismMultiplier: 0.9,            // All attributes -10%
    wordplayMultiplier: 0.9,
    creativityMultiplier: 0.9,
    stagePresenceMultiplier: 0.9,
    crowdControlMultiplier: 0.9,
    deliveryMultiplier: 0.9,
    // Note: -2 reputation, high public knowledge (people remember peak) enforced in progression
  },

  'Career Plateaued': {
    consistencyBonus: 0.5,              // +10% consistency (predictable level)
    creativityMultiplier: 0.95,         // Stagnant, not evolving
    // Note: -20% battle offers, reputation gains 50% less effective enforced in systems
  },

  'Disrespectful': {
    crowdReactionBonus: -8,             // Negativity shows
    chokeIncrease: 0.02,                // Stress from beefs
    // Note: -2 reputation, -30% battle offers, +40% beef events enforced in systems
  },

  'Known Stealer': {
    chokeIncrease: 0.03,                // Guilt/stress
    restEfficiency: 0.7,                // Poor reputation affects mental state
    // Note: -3 reputation, +2 Financial Stability, -50% offers, full payment required enforced
  },

  'Health Issues': {
    chokeIncrease: 0.05,                // +5% choke chance
    consistencyPenalty: 2.0,            // -2 consistency penalty
    restEfficiency: 0.7,                // Rest doesn't help health issues
    deliveryMultiplier: 0.9,            // Physical issues affect delivery
    // Note: -15% battle completion, -2 resilience enforced in systems
  },

  'Jail Risk': {
    chokeIncrease: 0.03,                // Stress from legal issues
    restEfficiency: 0.75,               // Can't fully relax
    lifePrepEfficiency: 0.7,            // Life prep disrupted by legal issues
    // Note: -2 reputation, -25% offers, can trigger jail time event enforced in systems
  },

  'Substance Issues': {
    chokeIncrease: 0.06,                // +6% choke chance
    stumbleIncrease: 0.01,              // +1% stumble chance - NEW PHASE 4
    restEfficiency: 0.6,                // Poor rest quality
    consistencyPenalty: 2.5,            // -2.5 consistency penalty (very inconsistent)
    deliveryMultiplier: 0.85,           // Affects performance
    // Note: -2 reputation, -2 resilience, -2 financial stability enforced in systems
  },

  // ========== MULTI-TASKING & WORKLOAD MANAGEMENT BADGES ==========
  // For multiple concurrent battles feature

  'Multitasker': {
    writingPrepEfficiency: 1.1,         // +10% writing prep (good at juggling)
    performancePrepEfficiency: 1.1,     // +10% performance prep
    researchPrepEfficiency: 1.1,        // +10% research prep
    restEfficiency: 1.15,               // +15% rest (recovers well)
    chokeReduction: 0.02,               // -2% choke (handles pressure well)
    // Note: -20% stress from multiple battles enforced in stressManagement.ts
  },

  'Workaholic': {
    writingPrepEfficiency: 1.15,        // +15% writing prep
    performancePrepEfficiency: 1.15,    // +15% performance prep
    lifePrepEfficiency: 0.7,            // -30% life prep (neglects personal life)
    restEfficiency: 0.8,                // -20% rest (doesn't rest well)
    consistencyBonus: 0.5,              // +10% consistency (always grinding)
    // Note: -10% stress from multiple battles enforced in stressManagement.ts
  },

  'Focused Specialist': {
    writingPrepEfficiency: 1.25,        // +25% writing when focused
    performancePrepEfficiency: 1.25,    // +25% performance when focused
    chokeReduction: 0.015,              // -1.5% choke when focused (DOWN from 0.03)
    // Note: -20% all prep efficiency if managing 2+ battles enforced in prep system
    // Note: Trade-off: Best single-battle performance, worst multi-battle
  },

  'Time Management Expert': {
    researchPrepEfficiency: 1.2,        // +20% research (plans efficiently)
    writingPrepEfficiency: 1.15,        // +15% writing
    performancePrepEfficiency: 1.15,    // +15% performance
    restEfficiency: 1.1,                // +10% rest
    consistencyBonus: 0.3,              // +6% consistency
    // Note: NO stress penalty from multiple battles enforced in stressManagement.ts
  },

  'Burnout Risk': {
    restEfficiency: 0.6,                // -40% rest (can't recover)
    lifePrepEfficiency: 0.7,            // -30% life prep
    chokeIncrease: 0.03,                // +3% choke risk
    consistencyPenalty: 1.0,            // -20% consistency
    // Note: +30% stress from multiple battles enforced in stressManagement.ts
    // Note: Negative badge earned from overworking
  },

  // ========== TOURNAMENT PERFORMANCE BADGES ==========
  // For tournament system feature

  'Tournament Veteran': {
    chokeReduction: 0.03,               // -3% choke in high-pressure tournament settings
    crowdReactionBonus: 5,              // +5 crowd reaction (experienced on big stage)
    consistencyBonus: 0.4,              // +8% consistency (knows how to pace tournament runs)
    stagePresenceMultiplier: 1.1,       // +10% stage presence
    // Note: Earned after completing 3+ tournaments, +10% prize money enforced in tournament system
  },

  'Tournament Choker': {
    chokeIncrease: 0.05,                // +5% choke in tournament battles only
    crowdReactionBonus: -10,            // -10 crowd (reputation for underperforming)
    restEfficiency: 0.75,               // Stress from tournament pressure
    consistencyPenalty: 0.5,            // -10% consistency in tournaments
    // Note: Earned after choking in 2+ tournament battles, -15% tournament offers enforced in system
  },

  'Big Stage Specialist': {
    crowdReactionBonus: 10,             // +10 crowd reaction in tournament battles
    stagePresenceMultiplier: 1.15,      // +15% stage presence in tournaments
    deliveryMultiplier: 1.1,            // +10% delivery in tournaments
    chokeReduction: 0.02,               // -2% choke in tournament settings
    // Note: Only applies in tournament battles, -5% in regular battles enforced in battle sim
    // Note: Trade-off: Performs better under bright lights, worse in small rooms
  },

  'Cinderella Story': {
    peakBonus: 0.2,                     // +20% to peak segments (underdog moments)
    crowdReactionBonus: 8,              // +8 crowd (fans love underdogs)
    creativityMultiplier: 1.12,         // +12% creativity (has to be different to upset)
    chokeReduction: 0.02,               // -2% choke (fearless underdog mentality)
    // Note: Earned by reaching finals as #13-16 seed, +30% media attention enforced in news system
    // Note: Badge persists for reputation, effects apply for 30 days after achievement
  },

  'Tournament Grinder': {
    writingPrepEfficiency: 1.08,        // +8% writing prep
    performancePrepEfficiency: 1.08,    // +8% performance prep
    restEfficiency: 1.12,               // +12% rest (used to tournament schedule)
    consistencyBonus: 0.3,              // +6% consistency
    chokeReduction: 0.01,               // -1% choke
    // Note: Earned after competing in 5+ tournaments, +20% tournament invite rate enforced in system
  },

  'Glass Cannon (Tournament)': {
    peakBonus: 0.3,                     // +30% to peak segments (explosive moments)
    lyricismMultiplier: 1.15,           // +15% lyricism in peaks
    wordplayMultiplier: 1.15,           // +15% wordplay in peaks
    consistencyPenalty: 1.5,            // -30% consistency (very inconsistent)
    chokeIncrease: 0.03,                // +3% choke (high variance)
    // Note: Tournament-specific version of Glass Cannon, all-or-nothing strategy
    // Note: Either dominates with haymakers or gets bodied, no middle ground
  },

  'Financial Struggles': {
    restEfficiency: 0.7,                // Stress from money issues
    lifePrepEfficiency: 0.6,            // Life unstable
    chokeIncrease: 0.02,                // Financial stress
    // Note: -3 financial stability, more likely to accept bad matchups enforced in systems
  },

  'Bitter Veteran': {
    crowdReactionBonus: -10,            // Negativity shows
    creativityMultiplier: 0.9,          // Stuck in old ways
    crowdControlMultiplier: 0.85,       // Can't connect with young crowd
    // Note: -1 reputation, -20% media attention, +10% veteran respect enforced in systems
  },

  'Backstabber': {
    chokeIncrease: 0.03,                // Paranoia/guilt
    restEfficiency: 0.7,                // Can't relax (trust issues)
    crowdReactionBonus: -5,             // People know your reputation
    // Note: -3 reputation, +50% beef events, no team battles enforced in systems
  },

  'Washed': {
    lyricismMultiplier: 0.85,           // All attributes -15%
    wordplayMultiplier: 0.85,
    creativityMultiplier: 0.85,
    stagePresenceMultiplier: 0.85,
    crowdControlMultiplier: 0.85,
    deliveryMultiplier: 0.85,
    restEfficiency: 0.75,
    // Note: -2 reputation, -40% offers, media portrays as washed enforced in systems
  },

  'Weak Chin': {
    chokeIncrease: 0.04,                // +4% choke when losing
    restEfficiency: 0.75,               // Loses confidence easily
    crowdReactionBonus: -8,
    // Note: -2 resilience, +25% momentum loss, +15% opponent confidence enforced in battle sim
  },

  'Culture Vulture': {
    crowdReactionBonus: -12,            // Crowd hates outsiders
    crowdControlMultiplier: 0.8,        // Can't connect authentically
    deliveryMultiplier: 0.9,            // Authenticity questioned
    // Note: -2 reputation, -30% veteran respect, +20% media attention enforced in systems
  },

  'Living in Glory Days': {
    creativityMultiplier: 0.8,          // -20% creativity (relives old material)
    crowdReactionBonus: -10,            // Heard it before
    consistencyPenalty: 1.0,            // -1 consistency penalty (hard to evolve)
    // Note: -1 reputation, +10 public knowledge (name recognition) enforced in systems
  },

  // ========== CONTENT STYLE BADGES (EXPANDED) ==========

  'Comedy': {
    crowdControlMultiplier: 1.3,
    crowdReactionBonus: 10,
    creativityMultiplier: 1.2,
    restEfficiency: 1.15,               // Timing benefits from rest
    deliveryMultiplier: 1.15,
  },

  'Comedian': {
    crowdControlMultiplier: 1.3,        // +30% crowd control
    crowdReactionBonus: 10,
    creativityMultiplier: 1.2,          // +20% creativity
    deliveryMultiplier: 1.15,           // +15% delivery (timing matters)
    // Note: May struggle to be taken seriously in certain contexts
  },

  'Braggadocious': {
    stagePresenceMultiplier: 1.2,       // +20% stage presence
    crowdControlMultiplier: 1.15,       // +15% crowd control
    deliveryMultiplier: 1.1,            // +10% delivery
    creativityMultiplier: 0.95,         // Can feel repetitive
  },

  'Gritty': {
    deliveryMultiplier: 1.2,            // +20% delivery
    stagePresenceMultiplier: 1.15,      // +15% stage presence
    smallRoomBonus: 0.08,               // +8% in Small Room
  },

  'Political Commentary': {
    creativityMultiplier: 1.25,         // +25% creativity
    researchPrepEfficiency: 1.2,        // +20% research prep
    crowdReactionBonus: 15,             // Polarizing but attention-grabbing
    // Note: +/-1 reputation depending on audience (enforced in progression)
  },

  'Shock Value': {
    crowdReactionBonus: 20,             // +20% crowd reaction
    peakBonus: 0.15,                    // +15% peak segments
    segmentVarianceMultiplier: 1.3,     // Unpredictable reactions
    // Note: -1 reputation and +50% media attention enforced in progression
  },

  'Enhanced Storyteller': {
    creativityMultiplier: 1.35,         // +35% creativity
    lyricismMultiplier: 1.25,           // +25% lyricism
    consistencyBonus: 1.5,              // +20% consistency
    crowdReactionBonus: 15,
    smallRoomBonus: 0.1,                // +10% in Small Room
    writingPrepEfficiency: 1.2,
  },

  'Storytelling': {
    creativityMultiplier: 1.25,
    lyricismMultiplier: 1.2,
    consistencyBonus: 1.0,
    smallRoomBonus: 0.08,
  },

  'Personal Attacks': {
    researchPrepEfficiency: 1.12,       // DOWN from 1.30 - was stacking with other badges
    peakBonus: 0.06,                    // DOWN from 0.15 - stacking with Angle Master
    crowdReactionBonus: 3,              // DOWN from 6
  },

  'Pop Culture References': {
    creativityMultiplier: 1.15,
    crowdReactionBonus: 5,
    researchPrepEfficiency: 1.2,
  },

  'Impersonations': {
    performancePrepEfficiency: 1.2,
    crowdControlMultiplier: 1.25,
    creativityMultiplier: 1.15,
  },

  // ========== TRU FOE BADGES (NEW) ==========

  'Stiff Body Language': {
    stagePresenceMultiplier: 0.85,       // -15% stage presence
    deliveryMultiplier: 0.9,             // -10% delivery
    crowdReactionBonus: -5,              // -5 crowd reaction
    performancePrepEfficiency: 0.9,      // Harder to improve through prep
  },

  'Consistent Grinder': {
    consistencyBonus: 1.5,               // +15% consistency
    writingPrepEfficiency: 1.1,          // +10% all prep types
    performancePrepEfficiency: 1.1,
    researchPrepEfficiency: 1.1,
    restEfficiency: 1.1,
    lifePrepEfficiency: 1.1,
    // Note: +1 preparation enforced in attribute system
  },

  'Believable Persona': {
    crowdReactionBonus: 12,              // +12 crowd reaction
    deliveryMultiplier: 1.15,            // Authentic delivery resonates
    researchPrepEfficiency: 1.15,        // Personal angles land harder
    // Note: +1 reputation enforced in progression system
  },

  'Battle of the Night Winner': {
    peakBonus: 0.2,                      // +20% peak segments
    crowdReactionBonus: 10,              // Memorable performances
    segmentVarianceMultiplier: 1.2,      // Creates standout moments
    // Note: +15 public knowledge, +2 reputation, +40% media attention enforced in progression
  },

  // ========== ADDITIONAL CONTENT & STYLE BADGES ==========

  'Gun Bar Specialist': {
    smallRoomBonus: 0.05,                // +5% in Small Room (more believable in intimate settings)
    peakBonus: 0.08,                     // +8% peak segments (gun bars hit hard)
    segmentVarianceMultiplier: 1.2,      // Inconsistent - big hits or misses
    deliveryMultiplier: 1.05,            // +5% delivery (conviction matters)
    crowdReactionBonus: 3,               // Divisive but attention-grabbing
  },

  'Aggressive Battler': {
    deliveryMultiplier: 1.10,            // +10% delivery
    stagePresenceMultiplier: 1.08,       // +8% stage presence
    crowdReactionBonus: 5,               // +5 crowd reaction
    peakBonus: 0.10,                     // +10% peak segments (big moments when aggressive)
    chokeIncrease: 0.02,                 // +2% choke (aggression = riskier)
    mainStageBonus: 0.05,                // +5% in Main Stage (big stages love energy)
  },

  'Energy Machine': {
    performancePrepEfficiency: 1.30,     // +30% performance prep
    deliveryMultiplier: 1.12,            // +12% delivery
    stagePresenceMultiplier: 1.10,       // +10% stage presence
    restEfficiency: 0.85,                // -15% rest (doesn't need it, always energized)
    chokeReduction: 0.03,                // -3% choke (energy helps avoid chokes)
    consistencyBonus: 5,                 // Reliable energy level
    mainStageBonus: 0.10,                // +10% in Main Stage (big venues love energy)
  },

  'Unprepared': {
    writingPrepEfficiency: 1.40,         // +40% writing speed (fast processor, genius writer)
    performancePrepEfficiency: 0.70,     // -30% performance prep (doesn't practice delivery)
    researchPrepEfficiency: 0.60,        // -40% research prep (wings it, doesn't dig deep)
    chokeIncrease: 0.03,                 // +3% choke risk (risky approach)
    segmentVarianceMultiplier: 1.3,      // High variance (genius or trash, no middle ground)
    consistencyPenalty: 0.5,             // -10% consistency (unpredictable)
  },

  // ========== NAMING VARIANT ALIASES (DATABASE COMPATIBILITY) ==========
  // Some badges use backslashes in the database, forward slashes in code

  'Punchline King\\Queen': {
    peakBonus: 0.15,                     // Same as forward-slash variant
    consistencyPenalty: 0.5,
    crowdReactionBonus: 5,
  },

  'Comedy King\\Queen': {
    crowdControlMultiplier: 1.35,        // Elite comedy performance
    crowdReactionBonus: 12,              // Crowd loves comedy kings/queens
    creativityMultiplier: 1.25,          // +25% creativity
    deliveryMultiplier: 1.2,             // +20% delivery (timing is everything)
    peakBonus: 0.1,                      // Great at big comedy moments
  },
};

// ============================================================================
// Badge Combination System
// ============================================================================

/**
 * Badge synergies - certain badges work extremely well together
 */
export const BADGE_SYNERGIES: Record<string, string[]> = {
  'Scheme Specialist': ['Multisyllabic Master', 'Pen Game Elite', 'Consistent Writer', 'Technical Writer'],
  'Freestyle Genius': ['Rebuttal King/Queen', 'Unorthodox', 'Comedy', 'Comedian'],
  'Wordplay Wizard': ['Punchline King/Queen', 'Multisyllabic Master'],
  'Comedy': ['Charismatic', 'Crowd Favorite', 'Impersonations', 'Comedian'],
  'Comedian': ['Comedy', 'Charismatic', 'Crowd Favorite', 'Freestyle Genius'],
  'Aggressive': ['Stage Domination', 'Speed Rapping', 'Personal Attacks', 'Gritty'],
  'Angle Master': ['Personal Attacks', 'Battle Technician', 'Political Commentary'],
  'Theatrical': ['Stage Domination', 'Charismatic', 'Big Stage Performer', 'Braggadocious'],
  'Battle Technician': ['Scheme Specialist', 'Angle Master', 'Consistent Writer', 'Consummate Professional'],
  'Technical Writer': ['Scheme Specialist', 'Pen Game Elite', 'Consistent Writer', 'Multisyllabic Master', 'Enhanced Storyteller'],
  'Pen Game Elite': ['Technical Writer', 'Scheme Specialist', 'Multisyllabic Master'],
  'Enhanced Storyteller': ['Technical Writer', 'Creativity Beast', 'Consistent Writer'],
  'Gritty': ['Aggressive', 'Personal Attacks', 'Braggadocious'],
  'Political Commentary': ['Angle Master', 'Creativity Beast', 'Shock Value'],
  'Shock Value': ['Controversial', 'Political Commentary', 'Unorthodox'],
  'Braggadocious': ['Theatrical', 'Stage Domination', 'Charismatic', 'Gritty'],
  'Consummate Professional': ['Battle Technician', 'Consistent Writer', 'Prepared Battler', 'Respected Veteran'],
  'Clout Chaser': ['Viral Sensation', 'Crowd Favorite', 'Social Media Created'],
  'Consistent Grinder': ['Consistent Performer', 'Prepared Battler', 'Consummate Professional', 'Respected Veteran'],
  'Believable Persona': ['Gritty', 'Respected Veteran', 'Crowd Favorite', 'Personal Attacks'],
  'Battle of the Night Winner': ['Crowd Favorite', 'Clutch Performer', 'Punchline King/Queen', 'Viral Sensation'],
};

/**
 * Badge conflicts - certain badges work poorly together
 */
export const BADGE_CONFLICTS: Record<string, string[]> = {
  'Freestyle Genius': ['Scheme Specialist', 'Overprepared', 'Consistent Writer', 'Technical Writer', 'One-Trick Pony'],
  'Aggressive': ['Comedy', 'Smooth Flow', 'Storytelling', 'Comedian', 'Enhanced Storyteller'],
  'Theatrical': ['Gritty', 'Monotone Deliverer', 'Mumbler', 'Energy Drainer'],
  'Overprepared': ['Freestyle Genius', 'Rebuttal King/Queen', 'Underprepared'],
  'Speed Rapping': ['Smooth Flow', 'Storytelling', 'Poor Breath Control', 'Mumbler'],
  'Monotone Deliverer': ['Charismatic', 'Theatrical', 'Comedy', 'Comedian', 'Animated'],
  'Technical Writer': ['Freestyle Genius', 'Underprepared', 'Lazy Writer', 'Recycler', 'Filler Abuser'],
  'Recycler': ['Creativity Beast', 'Technical Writer', 'Pen Game Elite', 'Enhanced Storyteller'],
  'Biter': ['Pen Game Elite', 'Technical Writer', 'Creativity Beast', 'Respected Veteran', 'Consummate Professional'],
  'Reach God/Goddess': ['Wordplay Wizard', 'Multisyllabic Master', 'Punchline King/Queen'],
  'One-Trick Pony': ['Creativity Beast', 'Unorthodox', 'Freestyle Genius', 'Versatile'],
  'Filler Abuser': ['Punchline King/Queen', 'Technical Writer', 'Pen Game Elite', 'Enhanced Storyteller'],
  'Outdated Referencer': ['Political Commentary', 'Creativity Beast', 'Pop Culture References'],
  'Mumbler': ['Speed Rapping', 'Theatrical', 'Crowd Favorite', 'Charismatic'],
  'Poor Breath Control': ['Speed Rapping', 'Aggressive', 'Performance Beast'],
  'Energy Drainer': ['Crowd Favorite', 'Charismatic', 'Stage Domination', 'Theatrical'],
  'Consummate Professional': ['Unreliable', 'Drama Starter', 'Choker', 'Underprepared'],
  'Clout Chaser': ['Respected Veteran', 'Consummate Professional', 'Consistent Performer'],
  'Enhanced Storyteller': ['Aggressive', 'Filler Abuser', 'Punchline Heavy'],
  'Comedian': ['Aggressive', 'Monotone Deliverer', 'Energy Drainer'],
  'Gritty': ['Theatrical', 'Comedy', 'Comedian'],
  'Stiff Body Language': ['Theatrical', 'Animated', 'Charismatic', 'Stage Domination', 'Performance Beast'],
  'Consistent Grinder': ['Underprepared', 'Lazy Writer', 'Unreliable'],
};

// ============================================================================
// Badge Effect Calculation Functions
// ============================================================================

/**
 * Calculate combined badge effects from a list of style tags
 */
export function calculateBadgeEffects(styleTags: string[]): BadgeEffects {
  const combined = { ...DEFAULT_EFFECTS };

  // Apply each badge's effects
  for (const tag of styleTags) {
    const badgeEffect = BADGE_REGISTRY[tag];
    if (!badgeEffect) continue;

    // Merge effects (multiplicative for multipliers, additive for bonuses/reductions)
    for (const [key, value] of Object.entries(badgeEffect)) {
      const effectKey = key as keyof BadgeEffects;

      // Multipliers are multiplicative
      if (effectKey.endsWith('Multiplier') || effectKey.endsWith('Efficiency')) {
        (combined as any)[effectKey] = (combined[effectKey] as number) * (value as number);
      }
      // Bonuses/reductions are additive
      else if (effectKey.endsWith('Bonus') || effectKey.endsWith('Reduction') ||
               effectKey.endsWith('Increase') || effectKey.endsWith('Penalty')) {
        (combined as any)[effectKey] = (combined[effectKey] as number) + (value as number);
      }
      // Booleans use OR logic
      else if (typeof value === 'boolean') {
        (combined as any)[effectKey] = (combined[effectKey] as boolean) || value;
      }
    }
  }

  // Apply synergy bonuses
  const synergyCount = countSynergies(styleTags);
  if (synergyCount > 0) {
    const synergyMultiplier = 1 + (synergyCount * 0.05); // +5% per synergy
    combined.writingPrepEfficiency *= synergyMultiplier;
    combined.performancePrepEfficiency *= synergyMultiplier;
  }

  // Apply conflict penalties
  const conflictCount = countConflicts(styleTags);
  if (conflictCount > 0) {
    const conflictPenalty = 1 - (conflictCount * 0.08); // -8% per conflict
    combined.writingPrepEfficiency *= conflictPenalty;
    combined.performancePrepEfficiency *= conflictPenalty;
    combined.chokeIncrease += conflictCount * 0.01; // +1% choke per conflict
  }

  return combined;
}

/**
 * Count synergies in a badge combination
 */
function countSynergies(styleTags: string[]): number {
  let count = 0;
  for (const tag of styleTags) {
    const synergies = BADGE_SYNERGIES[tag];
    if (!synergies) continue;

    for (const synergyTag of synergies) {
      if (styleTags.includes(synergyTag)) {
        count++;
      }
    }
  }
  // Each synergy is counted twice (once from each badge), so divide by 2
  return Math.floor(count / 2);
}

/**
 * Count conflicts in a badge combination
 */
function countConflicts(styleTags: string[]): number {
  let count = 0;
  for (const tag of styleTags) {
    const conflicts = BADGE_CONFLICTS[tag];
    if (!conflicts) continue;

    for (const conflictTag of conflicts) {
      if (styleTags.includes(conflictTag)) {
        count++;
      }
    }
  }
  // Each conflict is counted twice (once from each badge), so divide by 2
  return Math.floor(count / 2);
}

/**
 * Check if a battler benefits from low prep (freestyler archetype)
 */
export function hasLowPrepBonus(effects: BadgeEffects): boolean {
  return effects.lowPrepBonus;
}

/**
 * Check if a battler benefits from high prep (technical writer archetype)
 */
export function hasHighPrepBonus(effects: BadgeEffects): boolean {
  return effects.highPrepBonus;
}

/**
 * Check if a battler benefits from balanced prep
 */
export function hasBalancedPrepBonus(effects: BadgeEffects): boolean {
  return effects.balancedPrepBonus;
}

/**
 * Calculate prep pattern bonus based on prep profile
 */
export function calculatePrepPatternBonus(
  prep: PrepProfile,
  effects: BadgeEffects
): number {
  const totalPrep = prep.researchDays + prep.writingDays + prep.performanceDays +
                    prep.lifeDays + prep.restDays;

  // Low prep bonus (3 days or less)
  if (totalPrep <= 3 && effects.lowPrepBonus) {
    return 0.15; // +15% to all stats
  }

  // High prep bonus (8+ days)
  if (totalPrep >= 8 && effects.highPrepBonus) {
    return 0.12; // +12% to all stats
  }

  // Balanced prep bonus (at least 2 in different categories)
  if (effects.balancedPrepBonus) {
    const categories = [
      prep.researchDays,
      prep.writingDays,
      prep.performanceDays,
      prep.restDays
    ];
    const categoriesUsed = categories.filter(days => days >= 2).length;
    if (categoriesUsed >= 3) {
      return 0.10; // +10% to all stats
    }
  }

  return 0; // No pattern bonus
}

/**
 * Get league-specific bonus
 */
export function getLeagueBonus(
  leagueRoundLength: number,
  effects: BadgeEffects
): number {
  // Small Room Circuit (2-minute rounds)
  if (leagueRoundLength === 2) {
    return effects.smallRoomBonus;
  }
  // Main Stage Arena (3-minute rounds)
  else if (leagueRoundLength === 3) {
    return effects.mainStageBonus;
  }
  return 0;
}

/**
 * Get human-readable description of badge effects
 */
export function describeBadgeEffects(styleTags: string[]): string[] {
  const effects = calculateBadgeEffects(styleTags);
  const descriptions: string[] = [];

  // Prep efficiency
  if (effects.writingPrepEfficiency > 1.2) {
    descriptions.push('Excellent writing prep efficiency');
  } else if (effects.writingPrepEfficiency < 0.8) {
    descriptions.push('Poor writing prep efficiency');
  }

  if (effects.performancePrepEfficiency > 1.2) {
    descriptions.push('Excellent performance prep efficiency');
  } else if (effects.performancePrepEfficiency < 0.8) {
    descriptions.push('Poor performance prep efficiency');
  }

  // Choke mechanics
  if (effects.chokeReduction >= 0.03) {
    descriptions.push('Very clutch under pressure');
  } else if (effects.chokeIncrease >= 0.03) {
    descriptions.push('Prone to choking');
  }

  // Variance
  if (effects.segmentVarianceMultiplier > 1.3) {
    descriptions.push('Highly unpredictable performance');
  } else if (effects.segmentVarianceMultiplier < 0.7) {
    descriptions.push('Very consistent performance');
  }

  // Playstyle patterns
  if (effects.lowPrepBonus) {
    descriptions.push('Thrives with minimal preparation');
  }
  if (effects.highPrepBonus) {
    descriptions.push('Rewards extensive preparation');
  }

  // League preferences
  if (effects.smallRoomBonus > 0.05) {
    descriptions.push('Excels in Small Room Circuit');
  }
  if (effects.mainStageBonus > 0.05) {
    descriptions.push('Shines on Main Stage Arena');
  }

  // Synergies and conflicts
  const synergies = countSynergies(styleTags);
  const conflicts = countConflicts(styleTags);

  if (synergies > 0) {
    descriptions.push(`${synergies} badge synerg${synergies === 1 ? 'y' : 'ies'} active`);
  }
  if (conflicts > 0) {
    descriptions.push(`${conflicts} badge conflict${conflicts === 1 ? '' : 's'} present`);
  }

  return descriptions;
}

// Legacy export alias for backward compatibility
export const BADGE_EFFECTS = BADGE_REGISTRY;
