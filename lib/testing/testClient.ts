/**
 * Programmatic Test Client for Battle Rap University
 * Bypasses browser - tests APIs and database directly
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load env vars from .env.local
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=')
        if (key && value && !process.env[key]) {
          process.env[key] = value
        }
      }
    }
  }
}

// Load env on module init
loadEnvFile()

// Test configuration - uses local Supabase (with defaults for local dev)
const TEST_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  apiBaseUrl: process.env.TEST_API_URL || 'http://localhost:3000',
}

// Service role client for admin operations (bypasses RLS)
let adminClient: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      TEST_CONFIG.supabaseUrl,
      TEST_CONFIG.supabaseServiceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return adminClient
}

// Test user context
export interface TestUser {
  id: string
  email: string
  battlerId?: string
}

// Generate a proper UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Create a test user (for testing, we use a virtual ID that doesn't require auth)
export async function setupTestUser(prefix: string = 'test'): Promise<TestUser> {
  const email = `${prefix}-${Date.now()}@test.battlerap.university`
  // Use null user_id for test battlers (like AI battlers) to avoid auth dependency
  // The ID here is just for tracking, not stored in profiles
  const id = generateUUID()

  return { id, email }
}

// Clean up test user and all associated data
export async function cleanupTestUser(user: TestUser): Promise<void> {
  const admin = getAdminClient()

  // Delete in reverse dependency order
  if (user.battlerId) {
    // Delete life events
    await admin.from('battler_life_events').delete().eq('battler_id', user.battlerId)

    // Delete prep data
    await admin.from('prep_blocks').delete().eq('battler_id', user.battlerId)
    await admin.from('prep_segments').delete().eq('battler_id', user.battlerId)

    // Delete battle data (player side)
    await admin.from('battle_segments').delete().match({ 'battle_id.battler_player_id': user.battlerId })
    await admin.from('battle_rounds').delete().match({ 'battle_id.battler_player_id': user.battlerId })
    await admin.from('battles').delete().eq('battler_player_id', user.battlerId)

    // Delete rankings and attributes
    await admin.from('rankings').delete().eq('battler_id', user.battlerId)
    await admin.from('battler_attributes').delete().eq('battler_id', user.battlerId)

    // Delete battler
    await admin.from('battlers').delete().eq('id', user.battlerId)
  }

  // Delete profile
  await admin.from('profiles').delete().eq('id', user.id)
}

// Create a battler for a test user
export interface CreateBattlerOptions {
  stageName?: string
  cityName?: string
  leagueId?: string
  styleTags?: string[]
  tier?: string
  attributes?: {
    writing?: { lyricism?: number; wordplay?: number; creativity?: number; flow?: number }
    performance?: { stagePresence?: number; crowdControl?: number; delivery?: number }
    personal?: { financial?: number; reputation?: number; family?: number; resilience?: number }
  }
}

export async function createTestBattler(
  user: TestUser,
  options: CreateBattlerOptions = {}
): Promise<string> {
  const admin = getAdminClient()

  // Get default league if not provided
  let leagueId = options.leagueId
  if (!leagueId) {
    const { data: leagues } = await admin.from('leagues').select('id').limit(1)
    leagueId = leagues?.[0]?.id
  }

  // Get city ID if name provided
  let cityId: string | null = null
  if (options.cityName) {
    const { data: city } = await admin
      .from('cities')
      .select('id')
      .eq('name', options.cityName)
      .single()
    cityId = city?.id || null
  }

  // Create battler - use null for user_id to avoid auth dependency (like AI battlers)
  // Mark is_ai as false but user_id as null for test purposes
  const { data: battler, error: battlerError } = await admin
    .from('battlers')
    .insert({
      user_id: null, // No auth required for test battlers
      stage_name: options.stageName || `TestBattler-${Date.now()}`,
      city_id: cityId,
      primary_league_id: leagueId,
      style_tags: options.styleTags || ['Lyrical', 'Aggressive'],
      tier: options.tier || 'low',
      is_ai: false, // Still mark as player-controlled for test purposes
      career_days: 0,
    })
    .select('id')
    .single()

  if (battlerError || !battler) {
    throw new Error(`Failed to create battler: ${battlerError?.message}`)
  }

  // Create attributes
  const attrs = options.attributes || {}
  await admin.from('battler_attributes').insert({
    battler_id: battler.id,
    writing: {
      lyricism: attrs.writing?.lyricism ?? 5,
      wordplay: attrs.writing?.wordplay ?? 5,
      creativity: attrs.writing?.creativity ?? 5,
      flow: attrs.writing?.flow ?? 5,
    },
    performance: {
      stagePresence: attrs.performance?.stagePresence ?? 5,
      crowdControl: attrs.performance?.crowdControl ?? 5,
      delivery: attrs.performance?.delivery ?? 5,
    },
    personal: {
      financial: attrs.personal?.financial ?? 5,
      reputation: attrs.personal?.reputation ?? 5,
      family: attrs.personal?.family ?? 5,
      resilience: attrs.personal?.resilience ?? 5,
    },
    resilience: attrs.personal?.resilience ?? 5,
    public_knowledge: 0,
    xp: {},
  })

  // Create ranking
  const { error: rankingError } = await admin.from('rankings').insert({
    battler_id: battler.id,
    rating: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
  })

  if (rankingError) {
    console.error('Failed to create ranking:', rankingError.message)
  }

  user.battlerId = battler.id
  return battler.id
}

// Create AI opponent
export async function createAIOpponent(options: CreateBattlerOptions = {}): Promise<string> {
  const admin = getAdminClient()

  // Get default league
  let leagueId = options.leagueId
  if (!leagueId) {
    const { data: leagues } = await admin.from('leagues').select('id').limit(1)
    leagueId = leagues?.[0]?.id
  }

  const { data: battler, error } = await admin
    .from('battlers')
    .insert({
      user_id: null,
      stage_name: options.stageName || `AI-Opponent-${Date.now()}`,
      primary_league_id: leagueId,
      style_tags: options.styleTags || ['Street', 'Aggressive'],
      tier: options.tier || 'low',
      is_ai: true,
    })
    .select('id')
    .single()

  if (error || !battler) {
    throw new Error(`Failed to create AI opponent: ${error?.message}`)
  }

  // Create AI attributes
  await admin.from('battler_attributes').insert({
    battler_id: battler.id,
    writing: { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
    performance: { stagePresence: 5, crowdControl: 5, delivery: 5 },
    personal: { financial: 5, reputation: 5, family: 5, resilience: 5 },
    resilience: 5,
    public_knowledge: 0,
    xp: {},
  })

  // Create ranking
  const { error: rankingError } = await admin.from('rankings').insert({
    battler_id: battler.id,
    rating: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
  })

  if (rankingError) {
    console.error('Failed to create AI ranking:', rankingError.message)
  }

  return battler.id
}

// Create a battle offer
export async function createBattleOffer(
  playerBattlerId: string,
  aiBattlerId: string,
  options: {
    leagueId?: string
    scheduledAt?: Date
    prepDays?: number
  } = {}
): Promise<string> {
  const admin = getAdminClient()

  let leagueId = options.leagueId
  if (!leagueId) {
    const { data: leagues } = await admin.from('leagues').select('id').limit(1)
    leagueId = leagues?.[0]?.id
  }

  const scheduledAt = options.scheduledAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const lockPrepAt = new Date(scheduledAt.getTime() - 24 * 60 * 60 * 1000)

  // Schema: battles table does NOT have round_count/round_length_minutes
  // Those are determined by the league
  const { data: battle, error } = await admin
    .from('battles')
    .insert({
      battler_player_id: playerBattlerId,
      battler_ai_id: aiBattlerId,
      league_id: leagueId,
      scheduled_at: scheduledAt.toISOString(),
      lock_prep_at: lockPrepAt.toISOString(),
      status: 'offered',
    })
    .select('id')
    .single()

  if (error || !battle) {
    throw new Error(`Failed to create battle: ${error?.message}`)
  }

  return battle.id
}

// Accept a battle offer
export async function acceptBattle(battleId: string): Promise<void> {
  const admin = getAdminClient()

  const { error } = await admin
    .from('battles')
    .update({ status: 'accepted' })
    .eq('id', battleId)

  if (error) {
    throw new Error(`Failed to accept battle: ${error.message}`)
  }
}

// Add prep day
// Schema: prep_blocks has day_index, focus (not day_number, focus_type)
export async function addPrepBlock(
  battleId: string,
  battlerId: string,
  focus: 'research' | 'writing' | 'performance' | 'rest' | 'life',
  dayIndex: number
): Promise<void> {
  const admin = getAdminClient()

  const { error } = await admin
    .from('prep_blocks')
    .insert({
      battle_id: battleId,
      battler_id: battlerId,
      focus: focus,
      day_index: dayIndex,
      auto_generated: false,
    })

  if (error) {
    throw new Error(`Failed to add prep block: ${error.message}`)
  }
}

// Create life event for battler
// Schema: battler_life_events uses template_code (not template_id) per migration
// Columns: id, battler_id, template_code, storyline_id, battle_id, status, details_json, etc.
export async function createLifeEvent(
  battlerId: string,
  options: {
    templateId?: string  // Actually template CODE, kept for backwards compat
    templateCode?: string
    storylineId?: string
    battleId?: string
    status?: string
    details?: Record<string, any>
    isStorylineChapter?: boolean
  } = {}
): Promise<string> {
  const admin = getAdminClient()

  // Get a template code if not provided (and no storyline specified)
  let templateCode = options.templateCode || options.templateId
  if (!templateCode && !options.storylineId) {
    const { data: templates } = await admin
      .from('life_event_templates')
      .select('code')
      .limit(1)
    templateCode = templates?.[0]?.code

    if (!templateCode) {
      throw new Error('No life event templates found in database')
    }
  }

  const { data: event, error } = await admin
    .from('battler_life_events')
    .insert({
      battler_id: battlerId,
      template_code: templateCode || null,
      storyline_id: options.storylineId || null,
      battle_id: options.battleId || null,
      status: options.status || 'pending',
      details_json: options.details || {},
      is_storyline_chapter: options.isStorylineChapter || false,
    })
    .select('id')
    .single()

  if (error || !event) {
    throw new Error(`Failed to create life event: ${error?.message}`)
  }

  return event.id
}

// Query helpers
export async function getBattler(battlerId: string) {
  const admin = getAdminClient()

  // Get battler with attributes
  const { data: battler } = await admin
    .from('battlers')
    .select(`
      *,
      battler_attributes(*),
      cities:city_id(*)
    `)
    .eq('id', battlerId)
    .single()

  if (!battler) return null

  // Get rankings separately (rankings table uses battler_id as PK, not as FK)
  const { data: rankings } = await admin
    .from('rankings')
    .select('*')
    .eq('battler_id', battlerId)

  return {
    ...battler,
    rankings: rankings || []
  }
}

export async function getBattle(battleId: string) {
  const admin = getAdminClient()
  const { data } = await admin
    .from('battles')
    .select(`
      *,
      player:battler_player_id(*),
      opponent:battler_ai_id(*),
      league:league_id(*)
    `)
    .eq('id', battleId)
    .single()
  return data
}

export async function getLifeEvents(battlerId: string) {
  const admin = getAdminClient()
  const { data } = await admin
    .from('battler_life_events')
    .select('*')
    .eq('battler_id', battlerId)
    .order('triggered_at', { ascending: false })
  return data || []
}

export async function getSecrets(battlerId: string) {
  const admin = getAdminClient()
  const { data } = await admin
    .from('battler_secrets')
    .select('*')
    .eq('battler_id', battlerId)
  return data || []
}

export async function getIntel(battleId: string) {
  const admin = getAdminClient()
  const { data } = await admin
    .from('battle_intelligence')
    .select('*')
    .eq('battle_id', battleId)
  return data || []
}

// API call helpers (for testing actual endpoints)
export async function callApi(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    authHeader?: string
  } = {}
): Promise<{ status: number; data: any }> {
  const url = `${TEST_CONFIG.apiBaseUrl}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options.authHeader) {
    headers['Authorization'] = options.authHeader
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => null)
  return { status: response.status, data }
}

// Test result tracking
export interface TestResult {
  name: string
  passed: boolean
  duration: number
  error?: string
  details?: any
}

export class TestRunner {
  results: TestResult[] = []
  currentSuite: string = ''

  suite(name: string) {
    this.currentSuite = name
    console.log(`\n${'='.repeat(60)}`)
    console.log(`SUITE: ${name}`)
    console.log('='.repeat(60))
  }

  async test(name: string, fn: () => Promise<void>): Promise<void> {
    const start = Date.now()
    const fullName = this.currentSuite ? `${this.currentSuite} > ${name}` : name

    try {
      await fn()
      const duration = Date.now() - start
      this.results.push({ name: fullName, passed: true, duration })
      console.log(`  ✓ ${name} (${duration}ms)`)
    } catch (error) {
      const duration = Date.now() - start
      const errorMsg = error instanceof Error ? error.message : String(error)
      this.results.push({ name: fullName, passed: false, duration, error: errorMsg })
      console.log(`  ✗ ${name} (${duration}ms)`)
      console.log(`    Error: ${errorMsg}`)
    }
  }

  summary(): void {
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const total = this.results.length
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)

    console.log(`\n${'='.repeat(60)}`)
    console.log('TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`)
    console.log(`Duration: ${totalDuration}ms`)

    if (failed > 0) {
      console.log('\nFailed tests:')
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`))
    }
  }

  exitCode(): number {
    return this.results.some(r => !r.passed) ? 1 : 0
  }
}

// Assertion helpers
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      `${message || 'Values not equal'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    )
  }
}

export function assertExists<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value should exist but was null/undefined')
  }
}

export function assertArrayLength(arr: any[], expected: number, message?: string): void {
  if (arr.length !== expected) {
    throw new Error(
      `${message || 'Array length mismatch'}: expected ${expected}, got ${arr.length}`
    )
  }
}
