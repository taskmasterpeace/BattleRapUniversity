import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import { SECRETS, type SecretDefinition } from "@/lib/data/secrets"
import { getStorylinesForSecret, getRandomStoryline } from "@/lib/data/secret-storylines"
import type { SecretType } from "@/components/ui/secret-badge"

// Types for intel system
interface DiscoveredSecret {
  type: SecretType
  discoveredAt: string
  discoveryMethod: string
  hasProof: boolean
  storylineId?: string
  storylineTitle?: string
  storylineDescription?: string
  discoveryText?: string
}

interface GetIntelResponse {
  opponentId: string
  opponentName: string
  researchDays: number
  researchLevel: "none" | "casual" | "aggressive"
  discoveredSecrets: DiscoveredSecret[]
  availableSecrets: SecretType[]
  lockedSecrets: {
    type: SecretType
    daysNeeded: number
  }[]
}

// Get secrets available at a given research level
function getAvailableSecretTypes(researchDays: number): SecretType[] {
  return Object.values(SECRETS)
    .filter(secret => secret.researchDaysRequired <= researchDays)
    .filter(secret => secret.discoveryMethods.includes('research'))
    .map(secret => secret.type)
}

// Generate discovered secrets based on research days and opponent
// In production, this would query the database for actual discoveries
function generateDiscoveredSecrets(
  researchDays: number,
  opponentId: string,
  opponentSeed: number = 0
): DiscoveredSecret[] {
  const availableTypes = getAvailableSecretTypes(researchDays)
  const secrets: DiscoveredSecret[] = []

  // Use opponent ID to create deterministic "random" secrets
  // This ensures same opponent always has same secrets
  const seededRandom = (index: number) => {
    const hash = opponentId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, opponentSeed + index)
    return Math.abs(hash) / 2147483647
  }

  availableTypes.forEach((type, index) => {
    // Not every available secret is discovered - use seeded random
    // ~60% chance to discover available secrets
    if (seededRandom(index) < 0.6) {
      const storyline = getRandomStoryline(type)
      const hasProof = seededRandom(index + 100) > 0.3 // 70% have proof

      secrets.push({
        type,
        discoveredAt: new Date(Date.now() - (index * 86400000)).toISOString(),
        discoveryMethod: 'research',
        hasProof,
        storylineId: storyline?.id,
        storylineTitle: storyline?.title,
        storylineDescription: storyline?.description,
        discoveryText: storyline?.discoveryText,
      })
    }
  })

  return secrets
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: battleId } = await params

  try {
    const supabase = createServerClient()

    // Get battle info with opponent
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select(`
        id,
        ai_battler_id,
        ai_battler:ai_battlers(id, stage_name)
      `)
      .eq('id', battleId)
      .single()

    if (battleError || !battle) {
      return NextResponse.json(
        { error: 'Battle not found' },
        { status: 404 }
      )
    }

    // Get research days from prep_blocks
    const { data: prepBlocks, error: prepError } = await supabase
      .from('prep_blocks')
      .select('focus')
      .eq('battle_id', battleId)

    if (prepError) {
      console.error('Error fetching prep blocks:', prepError)
      return NextResponse.json(
        { error: 'Failed to fetch prep data' },
        { status: 500 }
      )
    }

    const researchDays = prepBlocks?.filter(b => b.focus === 'research').length || 0

    // Determine research level
    let researchLevel: "none" | "casual" | "aggressive" = "none"
    if (researchDays >= 4) {
      researchLevel = "aggressive"
    } else if (researchDays >= 2) {
      researchLevel = "casual"
    }

    // Get opponent info
    const opponentId = battle.ai_battler_id
    // ai_battler could be an array or object depending on Supabase query
    const aiBattler = Array.isArray(battle.ai_battler) ? battle.ai_battler[0] : battle.ai_battler
    const opponentName = aiBattler?.stage_name || 'Unknown'

    // Generate discovered secrets based on research
    const discoveredSecrets = generateDiscoveredSecrets(researchDays, opponentId)

    // Get available but undiscovered secrets
    const availableTypes = getAvailableSecretTypes(researchDays)
    const discoveredTypes = discoveredSecrets.map(s => s.type)
    const availableSecrets = availableTypes.filter(t => !discoveredTypes.includes(t))

    // Get locked secrets (need more research)
    const lockedSecrets = Object.values(SECRETS)
      .filter(secret =>
        secret.researchDaysRequired > researchDays &&
        secret.discoveryMethods.includes('research')
      )
      .map(secret => ({
        type: secret.type,
        daysNeeded: secret.researchDaysRequired,
      }))
      .slice(0, 6) // Limit to 6 locked secrets to show

    const response: GetIntelResponse = {
      opponentId,
      opponentName,
      researchDays,
      researchLevel,
      discoveredSecrets,
      availableSecrets,
      lockedSecrets,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Intel route error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Manually trigger secret discovery (e.g., from blogger tip, crew info)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: battleId } = await params

  try {
    const body = await request.json()
    const { secretType, discoveryMethod, storylineId } = body

    // Validate secret type
    if (!secretType || !SECRETS[secretType as SecretType]) {
      return NextResponse.json(
        { error: 'Invalid secret type' },
        { status: 400 }
      )
    }

    // In a full implementation, this would:
    // 1. Check if secret can be discovered via this method
    // 2. Store the discovery in a battle_intel table
    // 3. Trigger any related events (media coverage, etc.)

    // For now, return success with the secret info
    const secret = SECRETS[secretType as SecretType]
    const storylines = getStorylinesForSecret(secretType as SecretType)
    const storyline = storylineId
      ? storylines.find(s => s.id === storylineId)
      : storylines[0]

    const discoveredSecret: DiscoveredSecret = {
      type: secretType as SecretType,
      discoveredAt: new Date().toISOString(),
      discoveryMethod: discoveryMethod || 'research',
      hasProof: discoveryMethod !== 'fabrication',
      storylineId: storyline?.id,
      storylineTitle: storyline?.title,
      storylineDescription: storyline?.description,
      discoveryText: storyline?.discoveryText,
    }

    return NextResponse.json({
      success: true,
      secret: discoveredSecret,
    })
  } catch (err) {
    console.error('Intel POST error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
