// ============================================
// API Client with Error Handling
// ============================================

import type {
  ApiErrorCode,
  GetOffersResponse,
  AcceptBattleResponse,
  DeclineBattleResponse,
  GetBattleResponse,
  GetPrepResponse,
  SavePrepRequest,
  SavePrepResponse,
  LockInRequest,
  LockInResponse,
  GetRoundResponse,
  SubmitContentRequest,
  SubmitContentResponse,
  SimulateRoundResponse,
} from "./api-types"

import { mockOffers, mockBattle, mockPrepBlocks, mockPrepProgress, generateMockRoundResult } from "./api-mocks"

// ============================================
// ERROR HANDLING
// ============================================

export class BattleApiError extends Error {
  code: ApiErrorCode

  constructor(code: ApiErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = "BattleApiError"
  }
}

function handleApiError(error: unknown): never {
  if (error instanceof BattleApiError) {
    throw error
  }

  if (error instanceof Error) {
    throw new BattleApiError("UNKNOWN_ERROR", error.message)
  }

  throw new BattleApiError("UNKNOWN_ERROR", "An unknown error occurred")
}

// ============================================
// API CLIENT
// ============================================

const USE_MOCK = true // Toggle for development

export const battleApi = {
  // --- Battle Offers ---

  async getOffers(): Promise<GetOffersResponse> {
    if (USE_MOCK) {
      return { offers: mockOffers }
    }

    try {
      const res = await fetch("/api/battles/offers")
      if (!res.ok) {
        const error = await res.json()
        throw new BattleApiError(error.code || "UNKNOWN_ERROR", error.message)
      }
      return res.json()
    } catch (error) {
      handleApiError(error)
    }
  },

  async acceptBattle(battleId: string): Promise<AcceptBattleResponse> {
    if (USE_MOCK) {
      return {
        success: true,
        battle: {
          id: battleId,
          status: "accepted",
          prepStartsAt: new Date().toISOString(),
          prepLocksAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
          scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      }
    }

    try {
      const res = await fetch(`/api/battles/${battleId}/accept`, {
        method: "POST",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new BattleApiError(error.code || "UNKNOWN_ERROR", error.message)
      }
      return res.json()
    } catch (error) {
      handleApiError(error)
    }
  },

  async declineBattle(battleId: string): Promise<DeclineBattleResponse> {
    if (USE_MOCK) {
      return { success: true }
    }

    try {
      const res = await fetch(`/api/battles/${battleId}/decline`, {
        method: "POST",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new BattleApiError(error.code || "UNKNOWN_ERROR", error.message)
      }
      return res.json()
    } catch (error) {
      handleApiError(error)
    }
  },

  // --- Battle Details ---

  async getBattle(battleId: string): Promise<GetBattleResponse> {
    if (USE_MOCK) {
      return { battle: { ...mockBattle, id: battleId } }
    }

    try {
      const res = await fetch(`/api/battles/${battleId}`)
      if (!res.ok) {
        const error = await res.json()
        throw new BattleApiError(error.code || "BATTLE_NOT_FOUND", error.message)
      }
      return res.json()
    } catch (error) {
      handleApiError(error)
    }
  },

  // --- Prep ---

  async getPrep(battleId: string): Promise<GetPrepResponse> {
    if (USE_MOCK) {
      return {
        prepBlocks: mockPrepBlocks,
        prepProgress: mockPrepProgress,
        prepLocksAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        isLocked: false,
      }
    }

    try {
      const res = await fetch(`/api/battles/${battleId}/prep`)
      if (!res.ok) {
        const error = await res.json()
        throw new BattleApiError(error.code || "BATTLE_NOT_FOUND", error.message)
      }
      return res.json()
    } catch (error) {
      handleApiError(error)
    }
  },

  async savePrep(battleId: string, data: SavePrepRequest): Promise<SavePrepResponse> {
    if (USE_MOCK) {
      // Calculate mock progress based on prep blocks
      const research = data.prepBlocks.filter((b) => b.focus === "research").length * 15
      const writing = data.prepBlocks.filter((b) => b.focus === "writing").length * 12
      const rehearsal = data.prepBlocks.filter((b) => b.focus === "rehearsal").length * 18

      return {
        success: true,
        prepProgress: {
          research: Math.min(100, research),
          writing: Math.min(100, writing),
          rehearsal: Math.min(100, rehearsal),
        },
      }
    }

    try {
      const res = await fetch(`/api/battles/${battleId}/prep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new BattleApiError(error.code || "PREP_LOCKED", error.message)
      }
      return res.json()
    } catch (error) {
      handleApiError(error)
    }
  },

  // --- Lock In Mode ---

  async lockInMode(battleId: string, data: LockInRequest): Promise<LockInResponse> {
    if (USE_MOCK) {
      return {
        success: true,
        battle: {
          id: battleId,
          mode: data.mode,
          status: "locked",
        },
      }
    }

    try {
      const res = await fetch(`/api/battles/${battleId}/lock-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new BattleApiError(error.code || "UNKNOWN_ERROR", error.message)
      }
      return res.json()
    } catch (error) {
      handleApiError(error)
    }
  },

  // --- Rounds ---

  async getRound(battleId: string, roundNum: number): Promise<GetRoundResponse> {
    if (USE_MOCK) {
      return {
        roundNum,
        isSimulated: false,
      }
    }

    try {
      const res = await fetch(`/api/battles/${battleId}/rounds/${roundNum}`)
      if (!res.ok) {
        const error = await res.json()
        throw new BattleApiError(error.code || "BATTLE_NOT_FOUND", error.message)
      }
      return res.json()
    } catch (error) {
      handleApiError(error)
    }
  },

  async submitContent(battleId: string, roundNum: number, data: SubmitContentRequest): Promise<SubmitContentResponse> {
    if (USE_MOCK) {
      return {
        success: true,
        selection: {
          contentTypes: data.contentTypes,
          deliveryTypes: data.deliveryTypes,
          performanceTypes: data.performanceTypes,
        },
      }
    }

    try {
      const res = await fetch(`/api/battles/${battleId}/rounds/${roundNum}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new BattleApiError(error.code || "INVALID_SELECTION", error.message)
      }
      return res.json()
    } catch (error) {
      handleApiError(error)
    }
  },

  async simulateRound(
    battleId: string,
    roundNum: number,
    playerSelection: SubmitContentRequest,
    playerRoundsWon = 0,
    opponentRoundsWon = 0,
  ): Promise<SimulateRoundResponse> {
    if (USE_MOCK) {
      return generateMockRoundResult(
        roundNum,
        {
          contentTypes: playerSelection.contentTypes,
          deliveryTypes: playerSelection.deliveryTypes,
          performanceTypes: playerSelection.performanceTypes,
        },
        playerRoundsWon,
        opponentRoundsWon,
      )
    }

    try {
      const res = await fetch(`/api/battles/${battleId}/rounds/${roundNum}/simulate`, {
        method: "POST",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new BattleApiError(error.code || "ROUND_ALREADY_SIMULATED", error.message)
      }
      return res.json()
    } catch (error) {
      handleApiError(error)
    }
  },
}

// ============================================
// ERROR DISPLAY COMPONENT HELPER
// ============================================

export function getErrorMessage(code: ApiErrorCode): string {
  const messages: Record<ApiErrorCode, string> = {
    BATTLE_NOT_FOUND: "Battle not found. It may have been deleted.",
    NOT_AUTHORIZED: "You don't have permission to access this battle.",
    PREP_LOCKED: "Prep has been locked and can no longer be modified.",
    INVALID_SELECTION: "Invalid content selection. Check requirements.",
    ROUND_ALREADY_SIMULATED: "This round has already been played.",
    BATTLE_COMPLETED: "This battle has already been completed.",
    OFFER_EXPIRED: "This battle offer has expired.",
    UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  }

  return messages[code] || messages.UNKNOWN_ERROR
}
