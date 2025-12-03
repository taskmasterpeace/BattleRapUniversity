// Re-export battlers from data.ts for convenience
import { ALL_BATTLERS, getBattlerById, getBattlerByName } from "./data"
import type { Battler } from "./types"

export const BATTLERS = ALL_BATTLERS
export type { Battler }
export { getBattlerById, getBattlerByName }
