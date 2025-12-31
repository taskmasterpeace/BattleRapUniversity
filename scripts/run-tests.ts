#!/usr/bin/env npx tsx
/**
 * CLI Test Runner for Battle Rap University
 *
 * Usage:
 *   npm run test:game         # Run all game flow tests
 *   npm run test:simulation   # Run simulation tests
 *   npm run test:all          # Run everything
 *
 *   npx tsx scripts/run-tests.ts --suite=battler    # Run specific suite
 *   npx tsx scripts/run-tests.ts --suite=life-events
 *   npx tsx scripts/run-tests.ts --suite=intel
 *   npx tsx scripts/run-tests.ts --suite=career
 *   npx tsx scripts/run-tests.ts --suite=simulation --battles=100
 */

import { runAllGameFlowTests } from '../lib/testing/gameFlowTests'
import { runExtensiveTests } from '../lib/game/extensiveTestRunner'

// Parse command line arguments
const args = process.argv.slice(2)
const parsedArgs: Record<string, string> = {}

for (const arg of args) {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=')
    parsedArgs[key] = value || 'true'
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗')
  console.log('║     BATTLE RAP UNIVERSITY - AUTOMATED TEST SUITE                   ║')
  console.log('╚════════════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}`)
  console.log(`Time: ${new Date().toISOString()}`)
  console.log('')

  const suite = parsedArgs['suite'] || 'all'
  let exitCode = 0

  switch (suite) {
    case 'simulation':
      // Run simulation tests only
      const battles = parseInt(parsedArgs['battles'] || '50')
      console.log(`Running simulation tests with ${battles} battles per profile...`)
      runExtensiveTests(battles)
      break

    case 'game':
    case 'game-flow':
      // Run game flow tests only
      console.log('Running game flow integration tests...')
      exitCode = await runAllGameFlowTests()
      break

    case 'battler':
    case 'life-events':
    case 'intel':
    case 'career':
      // Run specific suite (handled in gameFlowTests)
      console.log(`Running ${suite} tests...`)
      exitCode = await runAllGameFlowTests()
      break

    case 'all':
    default:
      // Run everything
      console.log('Running ALL tests...')
      console.log('')

      // Game flow tests first
      console.log('─'.repeat(70))
      console.log('PHASE 1: Game Flow Integration Tests')
      console.log('─'.repeat(70))
      exitCode = await runAllGameFlowTests()

      // Then simulation tests
      console.log('\n' + '─'.repeat(70))
      console.log('PHASE 2: Battle Simulation Tests')
      console.log('─'.repeat(70))
      const simBattles = parseInt(parsedArgs['battles'] || '30')
      runExtensiveTests(simBattles)
      break
  }

  console.log('\n' + '═'.repeat(70))
  console.log('TEST RUN COMPLETE')
  console.log('═'.repeat(70))

  return exitCode
}

main()
  .then(exitCode => {
    process.exit(exitCode)
  })
  .catch(error => {
    console.error('\n❌ Test runner crashed:', error)
    process.exit(1)
  })
