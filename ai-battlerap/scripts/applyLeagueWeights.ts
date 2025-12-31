import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyLeagueWeights() {
  console.log('🔧 Applying Research-Driven League Weights...\n')

  try {
    // First, let's see what leagues exist
    console.log('Fetching current leagues...')
    const { data: currentLeagues, error: fetchError } = await supabase
      .from('leagues')
      .select('*')

    if (fetchError) {
      console.error('❌ Error fetching leagues:', fetchError)
      throw fetchError
    }

    console.log('Current leagues:')
    console.table(currentLeagues)

    // Update Small Room Circuit (using name as that's what migrations use)
    console.log('\nUpdating Small Room Circuit...')
    const { data: smallRoomData, error: smallRoomError } = await supabase
      .from('leagues')
      .update({
        writing_weight: 0.60,
        performance_weight: 0.40,
        base_crowd_factor: 0.5
      })
      .eq('name', 'Small Room Circuit')
      .select()

    if (smallRoomError) {
      console.error('❌ Error updating Small Room:', smallRoomError)
      throw smallRoomError
    }

    console.log('✅ Small Room Circuit updated:', smallRoomData)
    console.log('   - Writing Weight: 60%')
    console.log('   - Performance Weight: 40%')
    console.log('   - Base Crowd Factor: 0.5\n')

    // Update Main Stage Arena
    console.log('Updating Main Stage Arena...')
    const { data: mainStageData, error: mainStageError } = await supabase
      .from('leagues')
      .update({
        writing_weight: 0.40,
        performance_weight: 0.60,
        base_crowd_factor: 0.8
      })
      .eq('name', 'Main Stage Arena')
      .select()

    if (mainStageError) {
      console.error('❌ Error updating Main Stage:', mainStageError)
      throw mainStageError
    }

    console.log('✅ Main Stage Arena updated:')
    console.log('   - Writing Weight: 40%')
    console.log('   - Performance Weight: 60%')
    console.log('   - Base Crowd Factor: 0.8\n')

    // Verify changes
    console.log('🔍 Verifying league weights...')
    const { data: leagues, error: verifyError } = await supabase
      .from('leagues')
      .select('short_code, name, writing_weight, performance_weight, base_crowd_factor')
      .in('short_code', ['SMALL_ROOM', 'MAIN_STAGE'])

    if (verifyError) {
      console.error('❌ Error verifying leagues:', verifyError)
      throw verifyError
    }

    console.log('\n📊 Current League Configuration:')
    console.table(leagues)

    console.log('\n✅ League weights successfully applied!')
    console.log('\n📝 Expected Impact:')
    console.log('   - Technical Writer: 60-70% win rate in Small Room')
    console.log('   - Performance Beast: 60-70% win rate in Main Stage')
    console.log('   - League differentiation: 20-30 point win rate swings')
    console.log('\n🧪 Next Step: Run balance tests to verify')
    console.log('   npx tsx lib/game/balanceTestRunner.ts\n')

  } catch (error) {
    console.error('\n❌ Failed to apply league weights:', error)
    process.exit(1)
  }
}

applyLeagueWeights()
