// Life Events V2 - Types and Mock Data

export type EffectType = "permanent" | "temporary" | "conditional" | "lockout"
export type EventUrgency = "passive" | "timed" | "battle_gated" | "immediate"
export type EventCategory = "career" | "personal" | "scandal" | "financial" | "relationship"
export type EventSeverity = "minor" | "moderate" | "major" | "critical"
export type PresentationType = "text_only" | "image_text"
export type ImageAspectRatio = "1:1" | "9:16" | "16:9" | "21:9"
export type StressLevel = "relaxed" | "comfortable" | "managing" | "strained" | "breaking_point"

export interface Effect {
  type: EffectType
  // Permanent effects
  attribute_changes?: Record<string, number>
  badge_earned?: string
  badge_lost?: string
  rival_created?: string
  ally_gained?: string
  league_banned?: string
  reputation?: number
  // Temporary effects
  duration_type?: "battles" | "days"
  duration_value?: number
  status_effect?:
    | "inspired"
    | "distracted"
    | "motivated"
    | "stressed"
    | "injured"
    | "hot_streak"
    | "cold_streak"
    | "humiliated"
  prep_bonus?: number
  prep_penalty?: number
  // Conditional effects
  trigger_condition?: string
  then_effect?: Effect
  // Lockout effects
  league_locked?: { league_id: string; duration_battles?: number; reason: string }
  city_locked?: { city_id: string; duration_battles?: number; reason: string }
  cant_battle_battler?: { battler_id: string; duration: "permanent" | number; reason: string }
}

export interface EventChoice {
  id: string
  text: string
  short_label: string
  effects: Effect[]
}

export interface LifeEventV2 {
  id: string
  code: string
  title: string
  description: string
  full_text?: string
  category: EventCategory
  severity: EventSeverity
  urgency: EventUrgency
  deadline_hours?: number
  deadline_at?: string
  presentation_type: PresentationType
  image_aspect_ratio?: ImageAspectRatio
  image_url?: string
  choice_a: EventChoice
  choice_b?: EventChoice
  choice_c?: EventChoice
  can_ignore: boolean
  ignore_effects?: Effect[]
  status: "pending" | "resolved" | "expired" | "ignored"
  choice_made?: string
  created_at: string
}

export interface StressState {
  level: number // 0-100
  status: StressLevel
  contributing_factors: {
    label: string
    icon: string
    stress_amount: number
  }[]
}

export function getStressStatus(level: number): StressLevel {
  if (level <= 20) return "relaxed"
  if (level <= 40) return "comfortable"
  if (level <= 60) return "managing"
  if (level <= 80) return "strained"
  return "breaking_point"
}

export function getStressColor(status: StressLevel): string {
  switch (status) {
    case "relaxed":
      return "text-green-500 bg-green-500"
    case "comfortable":
      return "text-blue-500 bg-blue-500"
    case "managing":
      return "text-yellow-500 bg-yellow-500"
    case "strained":
      return "text-orange-500 bg-orange-500"
    case "breaking_point":
      return "text-red-500 bg-red-500"
  }
}

export function getUrgencyColor(urgency: EventUrgency): string {
  switch (urgency) {
    case "immediate":
      return "bg-red-500 text-white border-red-500"
    case "timed":
      return "bg-orange-500 text-white border-orange-500"
    case "battle_gated":
      return "bg-yellow-500 text-black border-yellow-500"
    case "passive":
      return "bg-zinc-600 text-white border-zinc-600"
  }
}

export function getUrgencyLabel(urgency: EventUrgency): string {
  switch (urgency) {
    case "immediate":
      return "DECIDE NOW"
    case "timed":
      return "TIMED"
    case "battle_gated":
      return "BLOCKS BATTLES"
    case "passive":
      return "CAN WAIT"
  }
}

// Mock stress state
export const mockStressState: StressState = {
  level: 58,
  status: "managing", // 58 falls in 41-60 range = "managing"
  contributing_factors: [
    { label: "3 pending life events", icon: "📋", stress_amount: 15 },
    { label: "2 battle loss streak", icon: "📉", stress_amount: 10 },
    { label: "Family situation unresolved", icon: "🏠", stress_amount: 20 },
    { label: "No rest in 14 days", icon: "⏰", stress_amount: 8 },
  ],
}

// Mock life events V2
export const mockLifeEventsV2: LifeEventV2[] = [
  {
    id: "ev-001",
    code: "called_out_on_stage",
    title: "CALLED OUT ON STAGE",
    description: "Your opponent just grabbed the mic and challenged you in front of everyone.",
    full_text: `The venue is packed. You're watching from the crowd when suddenly your rival grabs the mic between battles.\n\n"Yo, where's that faker at? I know you're in here! You've been ducking me for months. Let's settle this RIGHT NOW!"\n\nThe crowd starts chanting your name. Every eye in the room is searching for you. Your heart is pounding. This is it - the moment of truth.`,
    category: "scandal",
    severity: "critical",
    urgency: "immediate",
    presentation_type: "image_text",
    image_aspect_ratio: "16:9",
    image_url: "/battle-rap-stage-crowd-spotlight-dramatic.jpg",
    choice_a: {
      id: "accept",
      text: "Accept the smoke. Battle right now, unprepared but pride intact.",
      short_label: "ACCEPT THE SMOKE",
      effects: [
        { type: "conditional", trigger_condition: "next_battle", then_effect: { type: "temporary", prep_penalty: -5 } },
        { type: "permanent", reputation: 1.5, badge_earned: "Never Ducked" },
      ],
    },
    choice_b: {
      id: "walk_away",
      text: "Walk away. Live to fight another day.",
      short_label: "WALK AWAY",
      effects: [
        { type: "permanent", reputation: -1.0, badge_earned: "Known Ducker" },
        { type: "temporary", status_effect: "humiliated", duration_type: "battles", duration_value: 3 },
      ],
    },
    can_ignore: false,
    status: "pending",
    created_at: "2025-12-03",
  },
  {
    id: "ev-002",
    code: "interview_offer_major",
    title: "MAJOR PODCAST INTERVIEW",
    description: "A top-tier battle rap podcast wants you on. This could be huge.",
    full_text: `You got a DM from the biggest podcast in the culture. They want you on next week to discuss your come-up, your battles, and "address some rumors."\n\nThis is major exposure. But interviews can be tricky - say the wrong thing and it follows you forever. You could also use this to call out opponents or build your brand.`,
    category: "career",
    severity: "major",
    urgency: "timed",
    deadline_hours: 72,
    deadline_at: "2025-12-06T12:00:00Z",
    presentation_type: "image_text",
    image_aspect_ratio: "16:9",
    image_url: "/podcast-studio-microphone-professional.jpg",
    choice_a: {
      id: "accept_safe",
      text: "Accept and play it safe. Promote yourself, stay humble.",
      short_label: "PLAY IT SAFE",
      effects: [{ type: "permanent", reputation: 0.5, attribute_changes: { crowd_control: 1 } }],
    },
    choice_b: {
      id: "accept_aggressive",
      text: "Accept and go aggressive. Call out your rivals, make headlines.",
      short_label: "GO AGGRESSIVE",
      effects: [
        { type: "permanent", reputation: 1.5, rival_created: "verbal-assassin" },
        { type: "conditional", trigger_condition: "next_loss", then_effect: { type: "permanent", reputation: -1.0 } },
      ],
    },
    choice_c: {
      id: "decline",
      text: "Decline. Stay mysterious, let your battles speak.",
      short_label: "DECLINE",
      effects: [{ type: "permanent", badge_earned: "Media Shy" }],
    },
    can_ignore: true,
    ignore_effects: [{ type: "permanent", reputation: -0.5, badge_earned: "Media Dodger" }],
    status: "pending",
    created_at: "2025-12-02",
  },
  {
    id: "ev-003",
    code: "league_ban_warning",
    title: "YOU MIGHT GET BANNED",
    description: "The league owner heard about what you said. They're threatening to ban you.",
    full_text: `Word got back to the league owner about those comments you made on social media. They're not happy.\n\n"Either you apologize publicly, or you're banned from competing here for the next 5 events. Your choice."\n\nThis league has been good to you. But apologizing might make you look weak...`,
    category: "career",
    severity: "major",
    urgency: "battle_gated",
    presentation_type: "text_only",
    choice_a: {
      id: "apologize",
      text: "Apologize publicly. Swallow your pride to keep competing.",
      short_label: "APOLOGIZE",
      effects: [
        { type: "permanent", reputation: -0.5 },
        { type: "temporary", status_effect: "distracted", duration_type: "battles", duration_value: 2 },
      ],
    },
    choice_b: {
      id: "stand_ground",
      text: "Stand your ground. You said what you said.",
      short_label: "STAND GROUND",
      effects: [
        { type: "permanent", reputation: 0.5, badge_earned: "Speaks Their Mind" },
        {
          type: "lockout",
          league_locked: {
            league_id: "main-stage-arena",
            duration_battles: 5,
            reason: "Banned for refusing to apologize",
          },
        },
      ],
    },
    can_ignore: false,
    status: "pending",
    created_at: "2025-12-01",
  },
  {
    id: "ev-004",
    code: "family_needs_help",
    title: "FAMILY EMERGENCY",
    description: "Your mother is in the hospital. Your next battle is in 5 days.",
    full_text: `Mom's in the hospital. Nothing life-threatening, but she needs surgery and someone to help her recover.\n\nYou've got a big battle coming up - this could be your breakout moment. But family is family...`,
    category: "personal",
    severity: "moderate",
    urgency: "passive",
    presentation_type: "image_text",
    image_aspect_ratio: "1:1",
    image_url: "/hospital-room-emotional-family.jpg",
    choice_a: {
      id: "family_first",
      text: "Take time off. Family comes first, always.",
      short_label: "FAMILY FIRST",
      effects: [
        { type: "permanent", attribute_changes: { resilience: 1 } },
        { type: "temporary", prep_penalty: -3, duration_type: "battles", duration_value: 1 },
      ],
    },
    choice_b: {
      id: "balance",
      text: "Try to balance both. Visit when you can, prep when you can.",
      short_label: "BALANCE",
      effects: [{ type: "temporary", status_effect: "stressed", duration_type: "battles", duration_value: 2 }],
    },
    choice_c: {
      id: "career_focus",
      text: "Focus on the battle. Mom would understand... right?",
      short_label: "FOCUS ON BATTLE",
      effects: [
        { type: "permanent", reputation: -0.5 },
        {
          type: "conditional",
          trigger_condition: "next_loss",
          then_effect: { type: "temporary", status_effect: "distracted", duration_type: "battles", duration_value: 3 },
        },
      ],
    },
    can_ignore: true,
    ignore_effects: [{ type: "permanent", attribute_changes: { resilience: -1 } }],
    status: "pending",
    created_at: "2025-11-30",
  },
  {
    id: "ev-005",
    code: "leaked_dms",
    title: "LEAKED MESSAGES",
    description: "Someone leaked your old DMs. Screenshots are circulating.",
    full_text: `You wake up to 47 notifications. Someone leaked screenshots of your old DMs where you were talking shit about half the scene.\n\nThe screenshots are spreading fast. Some of the stuff you said... it's not a good look.`,
    category: "scandal",
    severity: "major",
    urgency: "timed",
    deadline_hours: 24,
    deadline_at: "2025-12-04T00:00:00Z",
    presentation_type: "image_text",
    image_aspect_ratio: "9:16",
    image_url: "/phone-screen-messages-leaked-social-media.jpg",
    choice_a: {
      id: "address_it",
      text: "Get ahead of it. Go live, own it, explain the context.",
      short_label: "ADDRESS IT",
      effects: [
        { type: "permanent", reputation: -0.5 },
        { type: "permanent", badge_earned: "Took Accountability" },
      ],
    },
    choice_b: {
      id: "ignore_it",
      text: "Ignore it completely. Never acknowledge, never apologize.",
      short_label: "IGNORE",
      effects: [
        { type: "permanent", reputation: -1.0 },
        { type: "permanent", rival_created: "young-pattern" },
        { type: "permanent", rival_created: "lyric-master" },
      ],
    },
    can_ignore: true,
    ignore_effects: [{ type: "permanent", reputation: -1.5, badge_earned: "Coward" }],
    status: "pending",
    created_at: "2025-12-03",
  },
]

export function getPendingEvents(): LifeEventV2[] {
  return mockLifeEventsV2.filter((e) => e.status === "pending")
}

export function getImmediateEvent(): LifeEventV2 | undefined {
  return mockLifeEventsV2.find((e) => e.status === "pending" && e.urgency === "immediate")
}

export function getBattleGatedEvents(): LifeEventV2[] {
  return mockLifeEventsV2.filter((e) => e.status === "pending" && e.urgency === "battle_gated")
}

export function getTimedEvents(): LifeEventV2[] {
  return mockLifeEventsV2.filter((e) => e.status === "pending" && e.urgency === "timed")
}

export const MOCK_EVENTS = mockLifeEventsV2
export const MOCK_STRESS_STATE = mockStressState
