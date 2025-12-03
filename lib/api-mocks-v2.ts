// ============================================
// V2 Mock Data for Segment-Based Prep System
// ============================================

import type {
  V2Segment,
  V2Counter,
  GetPrepProgressResponse,
  GetResearchResponse,
  GetCountersResponse,
  GetSegmentsResponse,
} from "./api-types"

// Mock Segments
export const mockSegments: V2Segment[] = [
  {
    id: "seg-1",
    battleId: "battle-123",
    roundNum: 1,
    position: 1,
    contentType: "wordplay",
    deliveryType: "aggressive",
    performanceType: "stage_presence",
    isFreestyle: false,
    isCounter: false,
    isRehearsed: true,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "seg-2",
    battleId: "battle-123",
    roundNum: 1,
    position: 2,
    contentType: "schemes",
    deliveryType: "smooth_flow",
    performanceType: "theatrical",
    isFreestyle: false,
    isCounter: false,
    isRehearsed: true,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "seg-3",
    battleId: "battle-123",
    roundNum: 1,
    position: 3,
    contentType: "punchlines",
    deliveryType: "staccato",
    performanceType: "crowd_interaction",
    isFreestyle: false,
    isCounter: false,
    isRehearsed: true,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "seg-4",
    battleId: "battle-123",
    roundNum: 1,
    position: 4,
    contentType: "personals",
    deliveryType: "passionate",
    performanceType: "facial_expression",
    isFreestyle: false,
    isCounter: false,
    isRehearsed: true,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "seg-5",
    battleId: "battle-123",
    roundNum: 2,
    position: 1,
    contentType: "gun_bars",
    deliveryType: "aggressive",
    performanceType: "stage_presence",
    isFreestyle: false,
    isCounter: false,
    isRehearsed: false,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "seg-6",
    battleId: "battle-123",
    roundNum: 2,
    position: 2,
    contentType: "street_talk",
    deliveryType: "conversational",
    performanceType: "charismatic",
    isFreestyle: false,
    isCounter: false,
    isRehearsed: false,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "seg-7",
    battleId: "battle-123",
    roundNum: null,
    position: null,
    contentType: "rebuttals",
    deliveryType: "aggressive",
    performanceType: "crowd_interaction",
    isFreestyle: true,
    isCounter: true,
    counterTarget: "personals",
    isRehearsed: false,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
]

// Mock Counters
export const mockCounters: V2Counter[] = [
  {
    id: "counter-1",
    battleId: "battle-123",
    segmentId: "seg-7",
    anticipatedContent: "personals",
    segment: mockSegments[6],
    createdAt: "2024-12-01T00:00:00Z",
  },
]

// Mock Research Response
export const mockResearchResponse: GetResearchResponse = {
  level: "casual",
  daysSpent: 2,
  daysForCasual: 2,
  daysForAggressive: 3,
  effects: {
    canWritePersonals: true,
    personalsEffectiveness: 1.0,
    credibilityRisk: false,
  },
}

// Mock Counters Response
export const mockCountersResponse: GetCountersResponse = {
  counters: mockCounters,
  slots: {
    used: 1,
    available: 1,
    maxSlots: 2,
    lockedSlots: [],
  },
}

// Mock Segments Response
export const mockSegmentsResponse: GetSegmentsResponse = {
  segments: mockSegments,
  meta: {
    totalSegments: 7,
    assignedSegments: 6,
    unassignedSegments: 1,
    segmentsPerRound: 4,
    totalNeeded: 12,
  },
}

// Mock Prep Progress Response
export const mockPrepProgressResponse: GetPrepProgressResponse = {
  battleId: "battle-123",
  opponent: {
    id: "opp-1",
    name: "Gotti Geechi",
    avatar: "/avatars/gotti.png",
  },
  league: {
    name: "Main Stage Arena",
    tier: "god_tier",
  },
  dates: {
    battleDate: "2024-12-20T20:00:00Z",
    prepLockDate: "2024-12-18T20:00:00Z",
    daysUntilBattle: 12,
    daysUntilPrepLock: 10,
  },
  roundInfo: {
    roundCount: 3,
    roundLength: 180,
    segmentsPerRound: 4,
    totalSegmentsNeeded: 12,
  },
  research: {
    level: "casual",
    daysSpent: 2,
    percent: 66,
  },
  writing: {
    segmentsWritten: 6,
    segmentsNeeded: 12,
    percent: 50,
  },
  rehearsal: {
    roundsRehearsed: [1],
    totalRounds: 3,
    percent: 33,
  },
  rounds: [
    {
      roundNum: 1,
      segmentsAssigned: 4,
      segmentsNeeded: 4,
      isComplete: true,
      isRehearsed: true,
      primaryContent: "wordplay",
    },
    {
      roundNum: 2,
      segmentsAssigned: 2,
      segmentsNeeded: 4,
      isComplete: false,
      isRehearsed: false,
      primaryContent: "gun_bars",
    },
    { roundNum: 3, segmentsAssigned: 0, segmentsNeeded: 4, isComplete: false, isRehearsed: false },
  ],
  counters: {
    used: 1,
    available: 1,
  },
  overall: {
    percent: 50,
    isReadyForBattle: false,
    blockers: ["Round 2 incomplete (2/4)", "Round 3 incomplete (0/4)", "Rounds 2 and 3 not rehearsed"],
  },
}

// Helper to generate segments response
export function generateSegmentsResponse(battleId: string, segments: V2Segment[]): GetSegmentsResponse {
  const assigned = segments.filter((s) => s.roundNum !== null)
  return {
    segments,
    meta: {
      totalSegments: segments.length,
      assignedSegments: assigned.length,
      unassignedSegments: segments.length - assigned.length,
      segmentsPerRound: 4,
      totalNeeded: 12,
    },
  }
}
