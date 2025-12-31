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

async function applyBattleEnhancements() {
  console.log('🔧 Applying Battle Data Enhancements...\n')

  try {
    // Fetch current leagues to show before state
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

    // Update Small Room Circuit with personality data
    console.log('\n📊 Updating Small Room Circuit with personality...')
    const { data: smallRoomData, error: smallRoomError } = await supabase
      .from('leagues')
      .update({
        personality_style: 'technical',
        base_payout: 1500,
        prestige_level: 5,
        audience_favor_lyricism: 80,
        audience_favor_delivery: 60,
        audience_favor_storytelling: 70,
        audience_favor_crowd_engagement: 40
      })
      .eq('short_code', 'SMALL_ROOM')
      .select()

    if (smallRoomError) {
      console.error('❌ Error updating Small Room:', smallRoomError)
      console.error('This probably means the columns don\'t exist yet.')
      console.error('You\'ll need to add them manually via Supabase Dashboard SQL Editor.')
      console.error('See: ai-battlerap/supabase/migrations/20251124150000_add_league_personality_fields.sql')
    } else {
      console.log('✅ Small Room Circuit updated!')
      console.log('   - Personality: Technical')
      console.log('   - Base Payout: $1,500')
      console.log('   - Prestige: 5/10')
      console.log('   - Audience Favors: Lyricism (80), Delivery (60), Storytelling (70), Crowd (40)\n')
    }

    // Update Main Stage Arena with personality data
    console.log('📊 Updating Main Stage Arena with personality...')
    const { data: mainStageData, error: mainStageError } = await supabase
      .from('leagues')
      .update({
        personality_style: 'aggressive',
        base_payout: 3000,
        prestige_level: 7,
        audience_favor_lyricism: 50,
        audience_favor_delivery: 80,
        audience_favor_storytelling: 60,
        audience_favor_crowd_engagement: 85
      })
      .eq('short_code', 'MAIN_STAGE')
      .select()

    if (mainStageError) {
      console.error('❌ Error updating Main Stage:', mainStageError)
      console.error('This probably means the columns don\'t exist yet.')
      console.error('You\'ll need to add them manually via Supabase Dashboard SQL Editor.')
      console.error('See: ai-battlerap/supabase/migrations/20251124150000_add_league_personality_fields.sql')
    } else {
      console.log('✅ Main Stage Arena updated!')
      console.log('   - Personality: Aggressive')
      console.log('   - Base Payout: $3,000')
      console.log('   - Prestige: 7/10')
      console.log('   - Audience Favors: Lyricism (50), Delivery (80), Storytelling (60), Crowd (85)\n')
    }

    // Verify final state
    console.log('🔍 Verifying updated leagues...')
    const { data: updatedLeagues, error: verifyError } = await supabase
      .from('leagues')
      .select('*')

    if (verifyError) {
      console.error('❌ Error verifying leagues:', verifyError)
      throw verifyError
    }

    console.log('\n📊 Updated League Configuration:')
    console.table(updatedLeagues)

    console.log('\n✅ Battle enhancement updates applied!')
    console.log('\n📝 What This Script Did:')
    console.log('   - Updated Small Room Circuit with technical personality')
    console.log('   - Updated Main Stage Arena with aggressive personality')
    console.log('   - Set payouts, prestige levels, and audience preferences')

    console.log('\n⚠️  Manual Steps Still Required:')
    console.log('   1. Add columns to battle_rounds: writing_contribution, performance_contribution')
    console.log('   2. Add column to battle_segments: crowd_reaction')
    console.log('   3. See migration files in: ai-battlerap/supabase/migrations/')
    console.log('   4. Or open Supabase Dashboard → SQL Editor and run them there')

    console.log('\n🎯 After adding columns, test with:')
    console.log('   npx tsx lib/game/balanceTestRunner.ts\n')

  } catch (error) {
    console.error('\n❌ Failed to apply enhancements:', error)
    process.exit(1)
  }
}

applyBattleEnhancements()
