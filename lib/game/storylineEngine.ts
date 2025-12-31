/**
 * Storyline Chain Engine
 *
 * Handles multi-event narrative arcs where choices lead to different paths and endings.
 * Storylines are variable length (2-7 chapters) with branching outcomes.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  applyStateChanges,
  getOrCreateNPC,
  scheduleLifeEvent,
  recordStorylineCompletion,
  getBattlerLifeState,
  StateChangeEffect,
  NPCRelationshipType
} from './battlerState'

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type StorylineCategory =
  | 'family' | 'legal' | 'financial' | 'rivalry' | 'health'
  | 'career' | 'street' | 'crew' | 'romance'

export type StorylineEndingType = 'positive' | 'negative' | 'neutral' | 'catastrophic'

export type StorylineUrgency = 'passive' | 'timed' | 'battle_gated' | 'immediate'

export type StorylineDelayType = 'battles' | 'days' | 'immediate'

export interface V2Effect {
  type: 'permanent' | 'temporary' | 'conditional' | 'lockout' | 'state_change' | 'special'
  // Attribute changes
  reputation?: number
  financial_stability?: number
  family_bond?: number
  preparation?: number
  resilience?: number
  crew_loyalty?: number
  // Writing attributes
  writing?: {
    lyricism?: number
    wordplay?: number
    creativity?: number
    flow?: number
  }
  // Performance attributes
  performance?: {
    stage_presence?: number
    crowd_control?: number
    delivery?: number
  }
  // Hidden stats
  stress?: number
  public_knowledge?: number
  // Temp modifiers
  choke_chance_modifier?: number
  prep_efficiency_modifier?: number
  prep_days_lost?: number
  // Duration for temporary effects
  duration_days?: number
  duration_battles?: number

  // NEW: Life state changes (felony, probation, relationship status, etc.)
  state_changes?: StateChangeEffect

  // NEW: Create or reference an NPC
  create_npc?: {
    relationship_type: NPCRelationshipType
    name?: string  // Optional: specific name, otherwise generated
    gender?: 'male' | 'female'
    personality?: string
    set_as_partner?: boolean  // If true, sets this NPC as the battler's partner
    set_as_manager?: boolean  // If true, sets this NPC as the battler's manager
  }

  // NEW: Schedule a future event
  schedule_event?: {
    event_type: string  // 'baby_birth', 'court_date', 'contract_expires', etc.
    delay_days: number  // How many days in the future
    details?: Record<string, any>
    priority?: number  // 1-10, higher = more urgent
    can_be_cancelled?: boolean
    triggers_storyline?: string  // Storyline code to trigger when event fires
  }

  // Special effect: Reveal career days (the "battle rap secret")
  reveal_career?: boolean
  reveal_method?: 'media' | 'opponent' | 'storyline' | 'self' | 'call_out' | 'tournament'

  // NEW: Secret creation (life events can CREATE secrets about the battler)
  create_secret?: {
    secret_type: 'criminal_record' | 'financial_crisis' | 'relationship_drama' |
                 'family_scandal' | 'substance_use' | 'mental_health' |
                 'career_failure' | 'betrayal' | 'secret_identity'
    title: string
    description: string
    severity: 'minor' | 'moderate' | 'major'
    exposure_risk?: number  // 0.0-1.0, default 0.15
    battle_vulnerability?: {
      angle_bonus?: number      // Default 0.15
      crowd_reaction_penalty?: number  // Default -10
    }
  }

  // NEW: Secret exposure (change status of an existing secret)
  expose_secret?: {
    secret_id?: string           // Specific secret ID
    secret_type?: string         // OR find by type
    new_status: 'rumored' | 'exposed' | 'addressed'
    exposed_by?: 'life_event' | 'battle_angle' | 'social_media' | 'opponent_research'
  }

  // NEW: Modify existing secret (change exposure risk)
  modify_secret?: {
    secret_id?: string
    secret_type?: string
    exposure_risk_delta?: number  // +/- change to exposure risk
  }
}

export interface StorylineChoice {
  id: string
  label: string
  description: string
  effects: V2Effect[]
  leads_to: {
    type: 'chapter' | 'ending'
    id: string
  }
  // Optional: branches to different storyline category
  branches_to_storyline?: string  // e.g., fight loss -> "HEALTH_CRISIS"
}

export interface StorylineChapter {
  id: string
  chapter_number: number
  title: string
  description: string
  delay: {
    type: StorylineDelayType
    value: number
  }
  urgency: StorylineUrgency
  deadline_hours?: number
  prep_days_cost?: number
  choices: StorylineChoice[]
}

export interface StorylineEnding {
  id: string
  type: StorylineEndingType
  title: string
  description: string
  effects: V2Effect[]
  badge?: string
}

// Career tiers for tier-based conditions
export type CareerTier = 'rookie' | 'rising' | 'established' | 'elite' | 'legend'

export const TIER_THRESHOLDS: Record<CareerTier, { minRating: number; minBattles: number }> = {
  rookie: { minRating: 0, minBattles: 0 },
  rising: { minRating: 1200, minBattles: 10 },
  established: { minRating: 1500, minBattles: 25 },
  elite: { minRating: 1800, minBattles: 50 },
  legend: { minRating: 2100, minBattles: 100 }
}

export const TIER_ORDER: CareerTier[] = ['rookie', 'rising', 'established', 'elite', 'legend']

export interface MadeChoiceCondition {
  storyline_code: string
  choice_id: string
}

export interface CompletedStorylineCondition {
  storyline_code: string
  ending_type?: StorylineEndingType
  ending_id?: string
}

export interface TriggerConditions {
  // Basic conditions
  min_battles?: number
  max_battles?: number
  min_attribute?: Record<string, number>
  max_attribute?: Record<string, number>
  streak_type?: 'win' | 'loss'
  streak_count?: number

  // Badge requirements
  has_badge?: string[]
  lacks_badge?: string[]
  badge_count_min?: number

  // Previous storyline decisions
  made_choice?: MadeChoiceCondition[]
  completed_storyline?: CompletedStorylineCondition[]
  active_storyline?: string[]
  no_active_storyline?: string[]

  // Battler relationships
  has_rival?: boolean
  rival_with?: string
  has_ally?: boolean
  ally_with?: string
  relationship_count_min?: number

  // Event/league requirements
  attended_event?: string[]
  league_affiliation?: string[]
  league_standing_min?: number

  // Career tier requirements
  tier?: CareerTier
  min_tier?: CareerTier
  max_tier?: CareerTier

  // Career visibility (the "battle rap secret")
  career_is_hidden?: boolean  // true = career must not be public

  // Battle history conditions
  last_battle_had_choke?: boolean  // Most recent battle had a choke
  has_recent_big_win?: boolean  // Won by 2+ rounds in last 14 days

  // Compound logic
  all?: TriggerConditions[]
  any?: TriggerConditions[]

  // Legacy support for attribute shortcuts
  [key: string]: any
}

export interface StorylineTrigger {
  type: 'random' | 'attribute' | 'streak' | 'prep_pattern' | 'battle_result' | 'compound'
  probability?: number
  conditions?: TriggerConditions
}

export interface StorylineTemplate {
  code: string
  name: string
  description: string
  category: StorylineCategory
  min_chapters: number
  max_chapters: number
  trigger: StorylineTrigger
  chapters: StorylineChapter[]
  endings: StorylineEnding[]
}

export interface ActiveStoryline {
  id: string
  battler_id: string
  template_code: string
  current_chapter_id: string
  status: 'active' | 'completed' | 'abandoned'
  choices_made: ChoiceRecord[]
  ending_id?: string
  ending_type?: StorylineEndingType
  next_chapter_available_at?: string
  next_chapter_deadline?: string
  started_at: string
  ended_at?: string
  total_prep_days_lost: number
  narrative_summary?: string
}

/**
 * Context for evaluating trigger conditions
 * Built once per trigger check and passed to all evaluations
 */
export interface TriggerEvaluationContext {
  totalBattles: number
  badges: string[]
  completedStorylines: {
    storyline_code: string
    ending_type?: string
    ending_id?: string
  }[]
  choicesMade: {
    storyline_code: string
    choice_id: string
  }[]
  activeStorylines: string[]
  relationships: {
    type: string
    target_battler_id: string
  }[]
  tier: CareerTier
  leagues: string[]
  leagueStanding?: number
  attendedEvents: string[]
  // Career days tracking (the "battle rap secret")
  careerDays?: number
  careerPublic?: boolean
  // Recent battles for trigger conditions
  recentBattles?: {
    won: boolean
    margin: number // rounds won by (2-1 = 1, 3-0 = 3)
    daysAgo: number
    hadChoke: boolean
  }[]
}

export interface ChoiceRecord {
  chapter_id: string
  choice_id: string
  timestamp: string
  effects_applied: V2Effect[]
}

// ==========================================
// STORYLINE ENGINE CLASS
// ==========================================

export class StorylineEngine {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  // ==========================================
  // TRIGGER EVALUATION
  // ==========================================

  /**
   * Check if any storylines should trigger after a battle
   */
  async checkStorylineTriggers(battlerId: string, battleContext?: {
    won: boolean
    score: string  // e.g., "3-0", "2-1"
    wasChoke: boolean
    streakLength: number
    prepDaysUsed: number
  }): Promise<StorylineTemplate[]> {
    // Get battler attributes for condition checking
    const { data: battler } = await this.supabase
      .from('battlers')
      .select(`
        id,
        battler_attributes (*)
      `)
      .eq('id', battlerId)
      .single()

    if (!battler) return []

    // Build the evaluation context once (used for all trigger evaluations)
    const evaluationContext = await this.buildEvaluationContext(battlerId)

    // Get active storylines to avoid triggering duplicates
    const activeTemplateCodes = new Set(evaluationContext.activeStorylines)

    // Get all active storyline templates
    const { data: templates } = await this.supabase
      .from('storyline_templates')
      .select('*')
      .eq('is_active', true)

    if (!templates) return []

    const triggeredStorylines: StorylineTemplate[] = []

    for (const template of templates) {
      // Skip if already active
      if (activeTemplateCodes.has(template.code)) continue

      const triggerConfig = template.trigger_config as StorylineTrigger
      const triggered = await this.evaluateTrigger(triggerConfig, battler, battleContext, evaluationContext)

      if (triggered) {
        triggeredStorylines.push({
          code: template.code,
          name: template.name,
          description: template.description,
          category: template.category,
          min_chapters: template.min_chapters,
          max_chapters: template.max_chapters,
          trigger: triggerConfig,
          chapters: template.chapters as StorylineChapter[],
          endings: template.endings as StorylineEnding[]
        })
      }
    }

    return triggeredStorylines
  }

  /**
   * Evaluate if a trigger condition is met
   */
  private async evaluateTrigger(
    trigger: StorylineTrigger,
    battler: any,
    battleContext?: any,
    evaluationContext?: TriggerEvaluationContext
  ): Promise<boolean> {
    const conditions = trigger.conditions || {}
    const attrs = battler.battler_attributes?.[0] || battler.battler_attributes || {}

    // Check probability first
    if (trigger.probability !== undefined) {
      if (Math.random() > trigger.probability) return false
    }

    // Check conditions
    switch (trigger.type) {
      case 'random':
        // For random type, also check any additional conditions
        if (Object.keys(conditions).length > 0) {
          return this.evaluateConditions(conditions, battler, battleContext, evaluationContext)
        }
        return true  // Probability already checked

      case 'attribute':
        // Check attribute thresholds (legacy format)
        for (const [attr, threshold] of Object.entries(conditions)) {
          if (attr.endsWith('_min') && attrs[attr.replace('_min', '')] < threshold) return false
          if (attr.endsWith('_max') && attrs[attr.replace('_max', '')] > threshold) return false
        }
        // Also check new format
        if (conditions.min_attribute) {
          for (const [attr, value] of Object.entries(conditions.min_attribute)) {
            if (attrs[attr] < value) return false
          }
        }
        if (conditions.max_attribute) {
          for (const [attr, value] of Object.entries(conditions.max_attribute)) {
            if (attrs[attr] > value) return false
          }
        }
        return true

      case 'streak':
        if (!battleContext) return false
        if (conditions.streak_type === 'win' && battleContext.won && battleContext.streakLength >= (conditions.streak_count || 1)) return true
        if (conditions.streak_type === 'loss' && !battleContext.won && battleContext.streakLength >= (conditions.streak_count || 1)) return true
        // Legacy support
        if (conditions.win_streak && battleContext.won && battleContext.streakLength >= conditions.win_streak) return true
        if (conditions.loss_streak && !battleContext.won && battleContext.streakLength >= conditions.loss_streak) return true
        return false

      case 'battle_result':
        if (!battleContext) return false
        if (conditions.outcome === 'win' && !battleContext.won) return false
        if (conditions.outcome === 'loss' && battleContext.won) return false
        if (conditions.choke_required && !battleContext.wasChoke) return false
        if (conditions.score && conditions.score !== battleContext.score) return false
        return true

      case 'prep_pattern':
        // Check prep day patterns (would need prep data)
        if (conditions.min_prep_days && battleContext?.prepDaysUsed < conditions.min_prep_days) return false
        if (conditions.max_prep_days && battleContext?.prepDaysUsed > conditions.max_prep_days) return false
        return true

      case 'compound':
        // Full condition evaluation with compound logic
        return this.evaluateConditions(conditions, battler, battleContext, evaluationContext)

      default:
        return false
    }
  }

  /**
   * Evaluate complex conditions including compound logic
   */
  private async evaluateConditions(
    conditions: TriggerConditions,
    battler: any,
    battleContext?: any,
    ctx?: TriggerEvaluationContext
  ): Promise<boolean> {
    const attrs = battler.battler_attributes?.[0] || battler.battler_attributes || {}

    // Handle compound logic first
    if (conditions.all && conditions.all.length > 0) {
      for (const subCondition of conditions.all) {
        if (!(await this.evaluateConditions(subCondition, battler, battleContext, ctx))) {
          return false
        }
      }
    }

    if (conditions.any && conditions.any.length > 0) {
      let anyMatch = false
      for (const subCondition of conditions.any) {
        if (await this.evaluateConditions(subCondition, battler, battleContext, ctx)) {
          anyMatch = true
          break
        }
      }
      if (!anyMatch) return false
    }

    // Basic conditions
    if (conditions.min_battles !== undefined && ctx?.totalBattles !== undefined) {
      if (ctx.totalBattles < conditions.min_battles) return false
    }

    if (conditions.max_battles !== undefined && ctx?.totalBattles !== undefined) {
      if (ctx.totalBattles > conditions.max_battles) return false
    }

    // Attribute conditions (new format)
    if (conditions.min_attribute) {
      for (const [attr, value] of Object.entries(conditions.min_attribute)) {
        if ((attrs[attr] ?? 0) < value) return false
      }
    }

    if (conditions.max_attribute) {
      for (const [attr, value] of Object.entries(conditions.max_attribute)) {
        if ((attrs[attr] ?? 10) > value) return false
      }
    }

    // Badge conditions
    if (conditions.has_badge && conditions.has_badge.length > 0) {
      const battlerBadges = ctx?.badges || []
      for (const badge of conditions.has_badge) {
        if (!battlerBadges.includes(badge)) return false
      }
    }

    if (conditions.lacks_badge && conditions.lacks_badge.length > 0) {
      const battlerBadges = ctx?.badges || []
      for (const badge of conditions.lacks_badge) {
        if (battlerBadges.includes(badge)) return false
      }
    }

    if (conditions.badge_count_min !== undefined) {
      const battlerBadges = ctx?.badges || []
      if (battlerBadges.length < conditions.badge_count_min) return false
    }

    // Previous storyline decisions
    if (conditions.made_choice && conditions.made_choice.length > 0) {
      const choicesMade = ctx?.choicesMade || []
      for (const required of conditions.made_choice) {
        const found = choicesMade.some(
          c => c.storyline_code === required.storyline_code && c.choice_id === required.choice_id
        )
        if (!found) return false
      }
    }

    if (conditions.completed_storyline && conditions.completed_storyline.length > 0) {
      const completedStorylines = ctx?.completedStorylines || []
      for (const required of conditions.completed_storyline) {
        const found = completedStorylines.some(s => {
          if (s.storyline_code !== required.storyline_code) return false
          if (required.ending_type && s.ending_type !== required.ending_type) return false
          if (required.ending_id && s.ending_id !== required.ending_id) return false
          return true
        })
        if (!found) return false
      }
    }

    if (conditions.active_storyline && conditions.active_storyline.length > 0) {
      const activeStorylines = ctx?.activeStorylines || []
      for (const code of conditions.active_storyline) {
        if (!activeStorylines.includes(code)) return false
      }
    }

    if (conditions.no_active_storyline && conditions.no_active_storyline.length > 0) {
      const activeStorylines = ctx?.activeStorylines || []
      for (const code of conditions.no_active_storyline) {
        if (activeStorylines.includes(code)) return false
      }
    }

    // Relationship conditions
    if (conditions.has_rival !== undefined && ctx?.relationships) {
      const hasRival = ctx.relationships.some(r => r.type === 'rival')
      if (conditions.has_rival && !hasRival) return false
      if (!conditions.has_rival && hasRival) return false
    }

    if (conditions.rival_with && ctx?.relationships) {
      const found = ctx.relationships.some(
        r => r.type === 'rival' && r.target_battler_id === conditions.rival_with
      )
      if (!found) return false
    }

    if (conditions.has_ally !== undefined && ctx?.relationships) {
      const hasAlly = ctx.relationships.some(r => r.type === 'ally')
      if (conditions.has_ally && !hasAlly) return false
      if (!conditions.has_ally && hasAlly) return false
    }

    if (conditions.ally_with && ctx?.relationships) {
      const found = ctx.relationships.some(
        r => r.type === 'ally' && r.target_battler_id === conditions.ally_with
      )
      if (!found) return false
    }

    if (conditions.relationship_count_min !== undefined && ctx?.relationships) {
      if (ctx.relationships.length < conditions.relationship_count_min) return false
    }

    // Career tier conditions
    if (conditions.tier && ctx?.tier) {
      if (ctx.tier !== conditions.tier) return false
    }

    if (conditions.min_tier && ctx?.tier) {
      const currentIdx = TIER_ORDER.indexOf(ctx.tier)
      const minIdx = TIER_ORDER.indexOf(conditions.min_tier)
      if (currentIdx < minIdx) return false
    }

    if (conditions.max_tier && ctx?.tier) {
      const currentIdx = TIER_ORDER.indexOf(ctx.tier)
      const maxIdx = TIER_ORDER.indexOf(conditions.max_tier)
      if (currentIdx > maxIdx) return false
    }

    // League conditions
    if (conditions.league_affiliation && conditions.league_affiliation.length > 0) {
      const leagues = ctx?.leagues || []
      for (const league of conditions.league_affiliation) {
        if (!leagues.includes(league)) return false
      }
    }

    if (conditions.league_standing_min !== undefined && ctx?.leagueStanding !== undefined) {
      if (ctx.leagueStanding > conditions.league_standing_min) return false // Lower is better
    }

    // Event attendance
    if (conditions.attended_event && conditions.attended_event.length > 0) {
      const events = ctx?.attendedEvents || []
      for (const event of conditions.attended_event) {
        if (!events.includes(event)) return false
      }
    }

    // Career visibility conditions
    if (conditions.career_is_hidden !== undefined && ctx?.careerPublic !== undefined) {
      // career_is_hidden: true means career must NOT be public
      if (conditions.career_is_hidden && ctx.careerPublic) return false
      if (!conditions.career_is_hidden && !ctx.careerPublic) return false
    }

    // Recent win condition (for CAREER_EXPOSED trigger)
    if (conditions.has_recent_big_win && ctx?.recentBattles) {
      const hasRecentBigWin = ctx.recentBattles.some(
        b => b.won && b.margin >= 2 && b.daysAgo <= 14
      )
      if (!hasRecentBigWin) return false
    }

    // Last battle choke condition (for VIRAL_CHOKE trigger)
    if (conditions.last_battle_had_choke && ctx?.recentBattles) {
      const lastBattle = ctx.recentBattles[0]
      if (!lastBattle || !lastBattle.hadChoke) return false
    }

    return true
  }

  /**
   * Calculate a battler's career tier based on rating and battles
   */
  calculateTier(rating: number, totalBattles: number): CareerTier {
    // Check tiers from highest to lowest
    for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
      const tier = TIER_ORDER[i]
      const threshold = TIER_THRESHOLDS[tier]
      if (rating >= threshold.minRating && totalBattles >= threshold.minBattles) {
        return tier
      }
    }
    return 'rookie'
  }

  /**
   * Build the evaluation context for trigger checking
   */
  private async buildEvaluationContext(battlerId: string): Promise<TriggerEvaluationContext> {
    // Get total battles
    const { count: totalBattles } = await this.supabase
      .from('battles')
      .select('*', { count: 'exact', head: true })
      .or(`battler_player_id.eq.${battlerId},battler_opponent_id.eq.${battlerId}`)
      .eq('status', 'completed')

    // Get badges
    const { data: badgeData } = await this.supabase
      .from('battler_badges')
      .select('badge_name')
      .eq('battler_id', battlerId)

    const badges = (badgeData || []).map(b => b.badge_name)

    // Get completed storylines with their endings
    const { data: completedData } = await this.supabase
      .from('active_storylines')
      .select('template_code, ending_type, ending_id, choices_made')
      .eq('battler_id', battlerId)
      .eq('status', 'completed')

    const completedStorylines = (completedData || []).map(s => ({
      storyline_code: s.template_code,
      ending_type: s.ending_type,
      ending_id: s.ending_id
    }))

    // Extract all choices made across all storylines
    const choicesMade: { storyline_code: string; choice_id: string }[] = []
    for (const storyline of completedData || []) {
      const choices = storyline.choices_made as ChoiceRecord[] || []
      for (const choice of choices) {
        choicesMade.push({
          storyline_code: storyline.template_code,
          choice_id: choice.choice_id
        })
      }
    }

    // Also get choices from active storylines
    const { data: activeData } = await this.supabase
      .from('active_storylines')
      .select('template_code, choices_made')
      .eq('battler_id', battlerId)
      .eq('status', 'active')

    const activeStorylines = (activeData || []).map(s => s.template_code)

    for (const storyline of activeData || []) {
      const choices = storyline.choices_made as ChoiceRecord[] || []
      for (const choice of choices) {
        choicesMade.push({
          storyline_code: storyline.template_code,
          choice_id: choice.choice_id
        })
      }
    }

    // Get rating for tier calculation
    const { data: ranking } = await this.supabase
      .from('rankings')
      .select('rating')
      .eq('battler_id', battlerId)
      .single()

    const rating = ranking?.rating || 1000
    const tier = this.calculateTier(rating, totalBattles || 0)

    // Get league affiliations and career data
    const { data: battlerData } = await this.supabase
      .from('battlers')
      .select('primary_league_id, career_days, career_public')
      .eq('id', battlerId)
      .single()

    const leagues = battlerData?.primary_league_id ? [battlerData.primary_league_id] : []
    const careerDays = battlerData?.career_days || 0
    const careerPublic = battlerData?.career_public || false

    // Get relationships (if table exists)
    let relationships: { type: string; target_battler_id: string }[] = []
    try {
      const { data: relData } = await this.supabase
        .from('battler_relationships')
        .select('relationship_type, target_battler_id')
        .eq('battler_id', battlerId)

      relationships = (relData || []).map(r => ({
        type: r.relationship_type,
        target_battler_id: r.target_battler_id
      }))
    } catch {
      // Table may not exist yet
    }

    // Get recent battles for trigger conditions
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const { data: recentBattleData } = await this.supabase
      .from('battles')
      .select(`
        id,
        winner_battler_id,
        created_at,
        battle_rounds!inner(battler_id, choked)
      `)
      .or(`battler_player_id.eq.${battlerId},battler_opponent_id.eq.${battlerId}`)
      .eq('status', 'completed')
      .gte('created_at', twoWeeksAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    const recentBattles: { won: boolean; margin: number; daysAgo: number; hadChoke: boolean }[] = []

    for (const battle of recentBattleData || []) {
      const won = battle.winner_battler_id === battlerId
      const rounds = battle.battle_rounds as any[] || []
      const playerRounds = rounds.filter((r: any) => r.battler_id === battlerId)
      const opponentRounds = rounds.filter((r: any) => r.battler_id !== battlerId)

      // Calculate margin (3-0 = 3, 2-1 = 1, etc.)
      const playerWins = playerRounds.filter((r: any) => !r.choked).length
      const opponentWins = opponentRounds.filter((r: any) => !r.choked).length
      const margin = won ? Math.abs(playerWins - opponentWins) : 0

      // Check if player choked
      const hadChoke = playerRounds.some((r: any) => r.choked)

      // Days ago
      const daysAgo = Math.floor(
        (Date.now() - new Date(battle.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )

      recentBattles.push({ won, margin, daysAgo, hadChoke })
    }

    return {
      totalBattles: totalBattles || 0,
      badges,
      completedStorylines,
      choicesMade,
      activeStorylines,
      relationships,
      tier,
      leagues,
      attendedEvents: [], // Future: implement event attendance tracking
      careerDays,
      careerPublic,
      recentBattles
    }
  }

  // ==========================================
  // STORYLINE MANAGEMENT
  // ==========================================

  /**
   * Start a new storyline for a battler
   */
  async startStoryline(
    battlerId: string,
    templateCode: string,
    battleId?: string
  ): Promise<{ storylineId: string; eventId: string } | null> {
    // Get the template
    const { data: template } = await this.supabase
      .from('storyline_templates')
      .select('*')
      .eq('code', templateCode)
      .single()

    if (!template) {
      console.error(`Storyline template ${templateCode} not found`)
      return null
    }

    const chapters = template.chapters as StorylineChapter[]
    const firstChapter = chapters.find(c => c.chapter_number === 1) || chapters[0]

    if (!firstChapter) {
      console.error(`No first chapter found for ${templateCode}`)
      return null
    }

    // Create the active storyline record
    const { data: storyline, error: storylineError } = await this.supabase
      .from('active_storylines')
      .insert({
        battler_id: battlerId,
        template_code: templateCode,
        current_chapter_id: firstChapter.id,
        status: 'active',
        choices_made: [],
        total_prep_days_lost: 0
      })
      .select()
      .single()

    if (storylineError || !storyline) {
      console.error('Failed to create storyline:', storylineError)
      return null
    }

    // Create the life event for the first chapter
    // Note: storyline chapters don't use template_code - they store all data in details_json
    // and are identified by is_storyline_chapter=true + storyline_id
    const { data: lifeEvent, error: eventError } = await this.supabase
      .from('battler_life_events')
      .insert({
        battler_id: battlerId,
        // template_code is NULL for storyline chapters - they use details_json instead
        battle_id: battleId,
        status: 'pending',
        storyline_id: storyline.id,
        chapter_id: firstChapter.id,
        prep_days_cost: firstChapter.prep_days_cost || 0,
        is_storyline_chapter: true,
        details_json: {
          storyline_code: templateCode,
          storyline_name: template.name,
          chapter_title: firstChapter.title,
          chapter_description: firstChapter.description,
          urgency: firstChapter.urgency,
          deadline_hours: firstChapter.deadline_hours,
          choices: firstChapter.choices
        }
      })
      .select()
      .single()

    if (eventError || !lifeEvent) {
      console.error('Failed to create life event:', eventError)
      // Clean up the storyline
      await this.supabase.from('active_storylines').delete().eq('id', storyline.id)
      return null
    }

    // Set deadline if urgency is timed
    if (firstChapter.urgency === 'timed' && firstChapter.deadline_hours) {
      const deadline = new Date()
      deadline.setHours(deadline.getHours() + firstChapter.deadline_hours)

      await this.supabase
        .from('active_storylines')
        .update({ next_chapter_deadline: deadline.toISOString() })
        .eq('id', storyline.id)
    }

    return {
      storylineId: storyline.id,
      eventId: lifeEvent.id
    }
  }

  /**
   * Process a choice made by the player
   */
  async processChoice(
    storylineId: string,
    chapterId: string,
    choiceId: string,
    battleId?: string
  ): Promise<{
    success: boolean
    nextChapter?: StorylineChapter
    ending?: StorylineEnding
    effectsApplied: V2Effect[]
    prepDaysLost: number
    error?: string
  }> {
    // Get the storyline
    const { data: storyline } = await this.supabase
      .from('active_storylines')
      .select('*, storyline_templates!inner(*)')
      .eq('id', storylineId)
      .single()

    if (!storyline) {
      return { success: false, error: 'Storyline not found', effectsApplied: [], prepDaysLost: 0 }
    }

    if (storyline.status !== 'active') {
      return { success: false, error: 'Storyline is not active', effectsApplied: [], prepDaysLost: 0 }
    }

    const template = storyline.storyline_templates as any
    const chapters = template.chapters as StorylineChapter[]
    const endings = template.endings as StorylineEnding[]

    // Find the current chapter
    const chapter = chapters.find(c => c.id === chapterId)
    if (!chapter) {
      return { success: false, error: 'Chapter not found', effectsApplied: [], prepDaysLost: 0 }
    }

    // Find the choice
    const choice = chapter.choices.find(c => c.id === choiceId)
    if (!choice) {
      return { success: false, error: 'Choice not found', effectsApplied: [], prepDaysLost: 0 }
    }

    // Apply effects
    const effectsApplied = await this.applyEffects(
      storyline.battler_id,
      choice.effects,
      storylineId,
      template.code
    )

    // Apply prep day cost from chapter
    let prepDaysLost = chapter.prep_days_cost || 0

    // Also check for prep_days_lost in choice effects
    for (const effect of choice.effects) {
      if (effect.prep_days_lost) {
        prepDaysLost += effect.prep_days_lost
      }
    }

    if (prepDaysLost > 0 && battleId) {
      await this.applyPrepDayCost(
        storyline.battler_id,
        battleId,
        prepDaysLost,
        storylineId,
        `${template.name}: ${chapter.title}`
      )
    }

    // Record the choice
    const choiceRecord: ChoiceRecord = {
      chapter_id: chapterId,
      choice_id: choiceId,
      timestamp: new Date().toISOString(),
      effects_applied: effectsApplied
    }

    const updatedChoices = [...(storyline.choices_made || []), choiceRecord]

    // Determine next step
    if (choice.leads_to.type === 'ending') {
      // Resolve to ending
      const ending = endings.find(e => e.id === choice.leads_to.id)
      if (!ending) {
        return { success: false, error: 'Ending not found', effectsApplied, prepDaysLost }
      }

      // Apply ending effects
      await this.applyEffects(storyline.battler_id, ending.effects, storylineId, template.code)

      // Grant badge if specified
      if (ending.badge) {
        await this.grantBadge(storyline.battler_id, ending.badge)
      }

      // Update storyline as completed
      await this.supabase
        .from('active_storylines')
        .update({
          status: 'completed',
          ending_id: ending.id,
          ending_type: ending.type,
          ended_at: new Date().toISOString(),
          choices_made: updatedChoices,
          total_prep_days_lost: (storyline.total_prep_days_lost || 0) + prepDaysLost
        })
        .eq('id', storylineId)

      // Record in storyline_completions table for sequel/block tracking
      try {
        await recordStorylineCompletion(
          this.supabase,
          storyline.battler_id,
          template.code,
          ending.id,
          ending.type as 'positive' | 'negative' | 'neutral' | 'catastrophic',
          {
            chaptersVisited: updatedChoices.length,
            choicesMade: updatedChoices.map(c => ({
              chapter_id: c.chapter_id,
              choice_id: c.choice_id,
              timestamp: c.timestamp
            })),
            prepDaysLost: (storyline.total_prep_days_lost || 0) + prepDaysLost,
            // Get sequel/blocks from template config if exists
            unlocksSequel: template.on_completion_config?.unlocks_sequels?.[0],
            blocksStorylines: template.on_completion_config?.blocks || []
          }
        )
      } catch (err) {
        // Non-critical - log but don't fail
        console.warn('Failed to record storyline completion:', err)
      }

      return { success: true, ending, effectsApplied, prepDaysLost }
    } else {
      // Advance to next chapter
      const nextChapter = chapters.find(c => c.id === choice.leads_to.id)
      if (!nextChapter) {
        return { success: false, error: 'Next chapter not found', effectsApplied, prepDaysLost }
      }

      // Calculate when next chapter becomes available
      let nextAvailableAt: Date | undefined
      if (nextChapter.delay.type === 'immediate') {
        nextAvailableAt = new Date()
      } else if (nextChapter.delay.type === 'days') {
        nextAvailableAt = new Date()
        nextAvailableAt.setDate(nextAvailableAt.getDate() + nextChapter.delay.value)
      }
      // For 'battles' type, we'll check battle count instead

      // Calculate deadline for next chapter
      let nextDeadline: Date | undefined
      if (nextChapter.urgency === 'timed' && nextChapter.deadline_hours && nextAvailableAt) {
        nextDeadline = new Date(nextAvailableAt)
        nextDeadline.setHours(nextDeadline.getHours() + nextChapter.deadline_hours)
      }

      // Update storyline
      await this.supabase
        .from('active_storylines')
        .update({
          current_chapter_id: nextChapter.id,
          choices_made: updatedChoices,
          next_chapter_available_at: nextAvailableAt?.toISOString(),
          next_chapter_deadline: nextDeadline?.toISOString(),
          total_prep_days_lost: (storyline.total_prep_days_lost || 0) + prepDaysLost
        })
        .eq('id', storylineId)

      // If immediate, create the life event now
      if (nextChapter.delay.type === 'immediate') {
        await this.createChapterEvent(storyline.battler_id, storylineId, nextChapter, template.name, template.code)
      }

      return { success: true, nextChapter, effectsApplied, prepDaysLost }
    }
  }

  /**
   * Check and advance storylines after a battle
   */
  async checkStorylineAdvancement(battlerId: string): Promise<void> {
    // Get all active storylines waiting for battles
    const { data: storylines } = await this.supabase
      .from('active_storylines')
      .select('*, storyline_templates!inner(*)')
      .eq('battler_id', battlerId)
      .eq('status', 'active')

    if (!storylines) return

    // Count battles since each storyline started
    for (const storyline of storylines) {
      const template = storyline.storyline_templates as any
      const chapters = template.chapters as StorylineChapter[]
      const currentChapter = chapters.find(c => c.id === storyline.current_chapter_id)

      if (!currentChapter) continue

      // Check if this chapter has battle-based delay
      if (currentChapter.delay.type === 'battles') {
        const { count } = await this.supabase
          .from('battles')
          .select('*', { count: 'exact', head: true })
          .eq('battler_player_id', battlerId)
          .eq('status', 'completed')
          .gte('completed_at', storyline.started_at)

        if (count && count >= currentChapter.delay.value) {
          // Create the chapter event
          await this.createChapterEvent(battlerId, storyline.id, currentChapter, template.name, template.code)
        }
      }
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Create a life event for a chapter
   */
  private async createChapterEvent(
    battlerId: string,
    storylineId: string,
    chapter: StorylineChapter,
    storylineName: string,
    storylineCode: string
  ): Promise<void> {
    // Check if event already exists for this chapter
    const { data: existing } = await this.supabase
      .from('battler_life_events')
      .select('id')
      .eq('storyline_id', storylineId)
      .eq('chapter_id', chapter.id)
      .single()

    if (existing) return  // Already created

    // Note: storyline chapters don't use template_code - they store all data in details_json
    // and are identified by is_storyline_chapter=true + storyline_id
    await this.supabase
      .from('battler_life_events')
      .insert({
        battler_id: battlerId,
        // template_code is NULL for storyline chapters - they use details_json instead
        status: 'pending',
        storyline_id: storylineId,
        chapter_id: chapter.id,
        prep_days_cost: chapter.prep_days_cost || 0,
        is_storyline_chapter: true,
        details_json: {
          storyline_code: storylineCode,
          storyline_name: storylineName,
          chapter_title: chapter.title,
          chapter_description: chapter.description,
          urgency: chapter.urgency,
          deadline_hours: chapter.deadline_hours,
          choices: chapter.choices
        }
      })
  }

  /**
   * Apply effects to battler attributes
   */
  private async applyEffects(
    battlerId: string,
    effects: V2Effect[],
    storylineId?: string,
    storylineCode?: string
  ): Promise<V2Effect[]> {
    if (!effects || effects.length === 0) return []

    // Get current attributes
    const { data: attrs } = await this.supabase
      .from('battler_attributes')
      .select('*')
      .eq('battler_id', battlerId)
      .single()

    if (!attrs) return []

    const updates: Record<string, any> = {}
    const appliedEffects: V2Effect[] = []
    const npcsCreated: string[] = []

    for (const effect of effects) {
      // Skip prep_days_lost as it's handled separately
      if (effect.prep_days_lost) continue

      // Handle career reveal (special effect for CAREER_EXPOSED storyline)
      if (effect.type === 'special' && effect.reveal_career) {
        const { revealCareer } = await import('./careerDays')
        try {
          await revealCareer(
            this.supabase,
            battlerId,
            effect.reveal_method || 'storyline'
          )
          appliedEffects.push(effect)
        } catch (error) {
          console.error('Failed to reveal career:', error)
        }
        continue
      }

      // Handle state changes (new)
      if (effect.type === 'state_change' && effect.state_changes) {
        const result = await applyStateChanges(this.supabase, battlerId, effect.state_changes)
        if (result.success) {
          appliedEffects.push(effect)
        }
        continue
      }

      // Handle NPC creation (new)
      if (effect.create_npc) {
        const npc = await getOrCreateNPC(
          this.supabase,
          battlerId,
          effect.create_npc.relationship_type,
          storylineCode || 'STORYLINE',
          {
            forceNew: true,
            gender: effect.create_npc.gender,
            name: effect.create_npc.name
          }
        )

        if (npc) {
          npcsCreated.push(npc.id)

          // Set personality if provided
          if (effect.create_npc.personality) {
            await this.supabase
              .from('battler_npcs')
              .update({ personality_notes: effect.create_npc.personality })
              .eq('id', npc.id)
          }

          // Set as partner if requested
          if (effect.create_npc.set_as_partner) {
            await applyStateChanges(this.supabase, battlerId, {
              set_partner: { npc_id: npc.id, health: 7 },
              set_relationship_status: 'dating'
            })
          }

          // Set as manager if requested
          if (effect.create_npc.set_as_manager) {
            await applyStateChanges(this.supabase, battlerId, {
              hire_manager: { npc_id: npc.id }
            })
          }

          appliedEffects.push(effect)
        }
        continue
      }

      // Handle scheduled events (new)
      if (effect.schedule_event) {
        const scheduledDate = new Date()
        scheduledDate.setDate(scheduledDate.getDate() + effect.schedule_event.delay_days)

        await scheduleLifeEvent(
          this.supabase,
          battlerId,
          effect.schedule_event.event_type,
          scheduledDate,
          {
            sourceStorylineId: storylineId,
            details: {
              ...effect.schedule_event.details,
              triggers_storyline: effect.schedule_event.triggers_storyline
            },
            priority: effect.schedule_event.priority,
            canBeCancelled: effect.schedule_event.can_be_cancelled
          }
        )

        appliedEffects.push(effect)
        continue
      }

      // Handle secret creation (NEW: Life events can create secrets)
      if (effect.create_secret) {
        const secretId = await this.createSecret(battlerId, effect.create_secret)
        if (secretId) {
          appliedEffects.push({
            ...effect,
            _created_secret_id: secretId
          } as V2Effect & { _created_secret_id: string })
        }
        continue
      }

      // Handle secret exposure (NEW: Life events can expose existing secrets)
      if (effect.expose_secret) {
        const exposed = await this.exposeSecret(battlerId, effect.expose_secret)
        if (exposed) {
          appliedEffects.push(effect)
        }
        continue
      }

      // Handle secret modification (NEW: Life events can modify exposure risk)
      if (effect.modify_secret) {
        const modified = await this.modifySecret(battlerId, effect.modify_secret)
        if (modified) {
          appliedEffects.push(effect)
        }
        continue
      }

      if (effect.type === 'permanent' || effect.type === 'temporary') {
        // Personal attributes
        if (effect.reputation !== undefined) {
          updates.reputation = Math.max(0, Math.min(10, (attrs.reputation || 5) + effect.reputation))
        }
        if (effect.financial_stability !== undefined) {
          updates.financial_stability = Math.max(0, Math.min(10, (attrs.financial_stability || 5) + effect.financial_stability))
        }
        if (effect.family_bond !== undefined) {
          updates.family_bond = Math.max(0, Math.min(10, (attrs.family_bond || 5) + effect.family_bond))
        }
        if (effect.resilience !== undefined) {
          updates.resilience = Math.max(0, Math.min(10, (attrs.resilience || 5) + effect.resilience))
        }
        if (effect.crew_loyalty !== undefined) {
          updates.crew_loyalty = Math.max(0, Math.min(10, (attrs.crew_loyalty || 5) + effect.crew_loyalty))
        }
        if (effect.stress !== undefined) {
          updates.stress = Math.max(0, Math.min(100, (attrs.stress || 0) + effect.stress))
        }
        if (effect.preparation !== undefined) {
          updates.preparation = Math.max(0, Math.min(10, (attrs.preparation || 5) + effect.preparation))
        }

        // Writing attributes (stored as JSONB)
        if (effect.writing) {
          const writing = attrs.writing || {}
          for (const [key, value] of Object.entries(effect.writing)) {
            if (value !== undefined) {
              writing[key] = Math.max(0, Math.min(10, (writing[key] || 5) + value))
            }
          }
          updates.writing = writing
        }

        // Performance attributes (stored as JSONB)
        if (effect.performance) {
          const performance = attrs.performance || {}
          for (const [key, value] of Object.entries(effect.performance)) {
            if (value !== undefined) {
              performance[key] = Math.max(0, Math.min(10, (performance[key] || 5) + value))
            }
          }
          updates.performance = performance
        }

        // Also handle state_changes embedded in permanent/temporary effects
        if (effect.state_changes) {
          await applyStateChanges(this.supabase, battlerId, effect.state_changes)
        }

        appliedEffects.push(effect)
      }

      // TODO: Handle conditional and lockout effects
    }

    // Apply attribute updates
    if (Object.keys(updates).length > 0) {
      await this.supabase
        .from('battler_attributes')
        .update(updates)
        .eq('battler_id', battlerId)
    }

    return appliedEffects
  }

  /**
   * Apply prep day cost
   */
  private async applyPrepDayCost(
    battlerId: string,
    battleId: string,
    daysCost: number,
    storylineId: string,
    reasonText: string
  ): Promise<void> {
    // Get upcoming prep days for this battle
    const { data: prepBlocks } = await this.supabase
      .from('prep_blocks')
      .select('id, prep_date')
      .eq('battle_id', battleId)
      .eq('battler_id', battlerId)
      .order('prep_date', { ascending: true })
      .limit(daysCost)

    if (prepBlocks && prepBlocks.length > 0) {
      // Delete the prep blocks
      const idsToDelete = prepBlocks.map(b => b.id)
      await this.supabase
        .from('prep_blocks')
        .delete()
        .in('id', idsToDelete)
    }

    // Record the impact
    await this.supabase
      .from('prep_day_impacts')
      .insert({
        storyline_id: storylineId,
        battle_id: battleId,
        battler_id: battlerId,
        impact_type: 'day_loss',
        days_lost: daysCost,
        reason_text: reasonText,
        applied_at: new Date().toISOString()
      })
  }

  /**
   * Grant a badge to the battler
   */
  private async grantBadge(battlerId: string, badgeName: string): Promise<void> {
    // Check if badge already exists
    const { data: existing } = await this.supabase
      .from('battler_badges')
      .select('id')
      .eq('battler_id', battlerId)
      .eq('badge_name', badgeName)
      .single()

    if (existing) return

    await this.supabase
      .from('battler_badges')
      .insert({
        battler_id: battlerId,
        badge_name: badgeName,
        earned_at: new Date().toISOString(),
        source: 'storyline'
      })
  }

  // ==========================================
  // SECRET MANAGEMENT METHODS
  // ==========================================

  /**
   * Create a new secret for a battler
   * Called when a life event or storyline creates a secret
   */
  private async createSecret(
    battlerId: string,
    secretData: V2Effect['create_secret']
  ): Promise<string | null> {
    if (!secretData) return null

    const { data, error } = await this.supabase
      .from('battler_secrets')
      .insert({
        battler_id: battlerId,
        secret_type: secretData.secret_type,
        title: secretData.title,
        description: secretData.description,
        severity: secretData.severity,
        status: 'private',
        exposure_risk: secretData.exposure_risk ?? 0.15,
        battle_vulnerability: secretData.battle_vulnerability ?? {
          angle_bonus: 0.15,
          crowd_reaction_penalty: -10
        }
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to create secret:', error)
      return null
    }

    return data.id
  }

  /**
   * Expose an existing secret (private -> rumored -> exposed -> addressed)
   * Called when a life event or storyline exposes a secret
   */
  private async exposeSecret(
    battlerId: string,
    exposeData: V2Effect['expose_secret']
  ): Promise<boolean> {
    if (!exposeData) return false

    // Find the secret to expose
    let secretId = exposeData.secret_id

    if (!secretId && exposeData.secret_type) {
      const { data } = await this.supabase
        .from('battler_secrets')
        .select('id')
        .eq('battler_id', battlerId)
        .eq('secret_type', exposeData.secret_type)
        .in('status', ['private', 'rumored'])
        .limit(1)
        .single()

      secretId = data?.id
    }

    if (!secretId) return false

    const updateData: Record<string, any> = {
      status: exposeData.new_status,
      exposed_by: exposeData.exposed_by || 'life_event'
    }

    // Set exposed_at timestamp if newly exposed
    if (exposeData.new_status === 'exposed') {
      updateData.exposed_at = new Date().toISOString()
    }

    const { error } = await this.supabase
      .from('battler_secrets')
      .update(updateData)
      .eq('id', secretId)

    return !error
  }

  /**
   * Modify an existing secret's exposure risk
   * Called when a life event increases/decreases exposure risk
   */
  private async modifySecret(
    battlerId: string,
    modifyData: V2Effect['modify_secret']
  ): Promise<boolean> {
    if (!modifyData) return false

    // Find the secret to modify
    let secretId = modifyData.secret_id

    if (!secretId && modifyData.secret_type) {
      const { data } = await this.supabase
        .from('battler_secrets')
        .select('id, exposure_risk')
        .eq('battler_id', battlerId)
        .eq('secret_type', modifyData.secret_type)
        .in('status', ['private', 'rumored'])
        .limit(1)
        .single()

      if (!data) return false
      secretId = data.id

      // Calculate new exposure risk
      if (modifyData.exposure_risk_delta !== undefined) {
        const currentRisk = data.exposure_risk ?? 0.15
        const newRisk = Math.max(0, Math.min(1.0, currentRisk + modifyData.exposure_risk_delta))

        const { error } = await this.supabase
          .from('battler_secrets')
          .update({ exposure_risk: newRisk })
          .eq('id', secretId)

        return !error
      }
    }

    return false
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Get all active storylines for a battler
   */
  async getActiveStorylines(battlerId: string): Promise<ActiveStoryline[]> {
    const { data } = await this.supabase
      .from('active_storylines')
      .select('*')
      .eq('battler_id', battlerId)
      .eq('status', 'active')
      .order('started_at', { ascending: false })

    return (data || []) as ActiveStoryline[]
  }

  /**
   * Get storyline history for a battler
   */
  async getStorylineHistory(battlerId: string): Promise<ActiveStoryline[]> {
    const { data } = await this.supabase
      .from('active_storylines')
      .select('*')
      .eq('battler_id', battlerId)
      .in('status', ['completed', 'abandoned'])
      .order('ended_at', { ascending: false })
      .limit(20)

    return (data || []) as ActiveStoryline[]
  }

  /**
   * Auto-resolve expired storyline events
   */
  async autoResolveExpired(): Promise<number> {
    const now = new Date().toISOString()

    // Get expired storylines
    const { data: expired } = await this.supabase
      .from('active_storylines')
      .select('*')
      .eq('status', 'active')
      .lt('next_chapter_deadline', now)

    if (!expired || expired.length === 0) return 0

    let resolved = 0

    for (const storyline of expired) {
      // Auto-resolve with worst outcome (last choice, or abandon)
      await this.supabase
        .from('active_storylines')
        .update({
          status: 'abandoned',
          ended_at: now,
          narrative_summary: 'Storyline expired - player did not respond in time'
        })
        .eq('id', storyline.id)

      // Apply penalty effects
      await this.applyEffects(storyline.battler_id, [
        { type: 'permanent', stress: 15 },
        { type: 'permanent', reputation: -0.5 }
      ])

      resolved++
    }

    return resolved
  }
}

// Export singleton factory
export function createStorylineEngine(supabase: SupabaseClient): StorylineEngine {
  return new StorylineEngine(supabase)
}
