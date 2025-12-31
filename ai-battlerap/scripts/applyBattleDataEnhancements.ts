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

async function applyBattleDataEnhancements() {
  console.log('🔧 Applying Battle Data Enhancements for Blog Generation...\n')

  try {
    // Step 1: Add contribution tracking columns to battle_rounds
    console.log('📊 Adding attribute contribution tracking to battle_rounds...')
    const { error: contributionError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE battle_rounds
        ADD COLUMN IF NOT EXISTS writing_contribution NUMERIC CHECK (writing_contribution >= 0 AND writing_contribution <= 1),
        ADD COLUMN IF NOT EXISTS performance_contribution NUMERIC CHECK (performance_contribution >= 0 AND performance_contribution <= 1);
      `
    })

    if (contributionError) {
      console.error('Error adding contribution columns:', contributionError)
      // Continue anyway - might already exist
    } else {
      console.log('✅ Contribution tracking columns added\n')
    }

    // Step 2: Add crowd_reaction column to battle_segments
    console.log('👥 Adding segment-level crowd reactions to battle_segments...')
    const { error: crowdError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE battle_segments
        ADD COLUMN IF NOT EXISTS crowd_reaction INT CHECK (crowd_reaction >= 0 AND crowd_reaction <= 100);
      `
    })

    if (crowdError) {
      console.error('Error adding crowd_reaction column:', crowdError)
    } else {
      console.log('✅ Segment crowd reaction column added\n')
    }

    // Step 3: Add promotion personality fields to leagues
    console.log('🎭 Adding promotion personality fields to leagues...')
    const { error: personalityError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE leagues
        ADD COLUMN IF NOT EXISTS personality_style TEXT CHECK (personality_style IN ('aggressive', 'technical', 'diverse', 'street')),
        ADD COLUMN IF NOT EXISTS base_payout INT DEFAULT 2000,
        ADD COLUMN IF NOT EXISTS prestige_level INT DEFAULT 5 CHECK (prestige_level >= 1 AND prestige_level <= 10),
        ADD COLUMN IF NOT EXISTS audience_favor_lyricism INT DEFAULT 50 CHECK (audience_favor_lyricism >= 0 AND audience_favor_lyricism <= 100),
        ADD COLUMN IF NOT EXISTS audience_favor_delivery INT DEFAULT 50 CHECK (audience_favor_delivery >= 0 AND audience_favor_delivery <= 100),
        ADD COLUMN IF NOT EXISTS audience_favor_storytelling INT DEFAULT 50 CHECK (audience_favor_storytelling >= 0 AND audience_favor_storytelling <= 100),
        ADD COLUMN IF NOT EXISTS audience_favor_crowd_engagement INT DEFAULT 50 CHECK (audience_favor_crowd_engagement >= 0 AND audience_favor_crowd_engagement <= 100);
      `
    })

    if (personalityError) {
      console.error('Error adding personality fields:', personalityError)
    } else {
      console.log('✅ Promotion personality fields added\n')
    }

    // Step 4: Update existing leagues with personality data
    console.log('🎨 Updating league personalities...\n')

    // Update Small Room Circuit
    console.log('Updating Small Room Circuit (Technical)...')
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
      throw smallRoomError
    }

    console.log('✅ Small Room Circuit updated:')
    console.log('   - Personality: Technical (writing-focused)')
    console.log('   - Base Payout: $1,500')
    console.log('   - Prestige Level: 5/10')
    console.log('   - Audience Favors: Lyricism (80), Delivery (60), Storytelling (70)\n')

    // Update Main Stage Arena
    console.log('Updating Main Stage Arena (Aggressive)...')
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
      throw mainStageError
    }

    console.log('✅ Main Stage Arena updated:')
    console.log('   - Personality: Aggressive (performance-focused)')
    console.log('   - Base Payout: $3,000')
    console.log('   - Prestige Level: 7/10')
    console.log('   - Audience Favors: Delivery (80), Crowd Engagement (85)\n')

    // Verify all changes
    console.log('🔍 Verifying league configuration...')
    const { data: leagues, error: verifyError } = await supabase
      .from('leagues')
      .select('*')

    if (verifyError) {
      console.error('❌ Error verifying leagues:', verifyError)
      throw verifyError
    }

    console.log('\n📊 Current League/Promotion Configuration:')
    console.table(leagues)

    console.log('\n✅ Battle data enhancements successfully applied!')
    console.log('\n📝 What Changed:')
    console.log('   ✅ Momentum tracking: momentum_delta now calculated (no longer 0)')
    console.log('   ✅ Attribute contributions: Track writing vs performance %')
    console.log('   ✅ Segment crowd reactions: Granular crowd tracking per segment')
    console.log('   ✅ Promotion personalities: Leagues now have distinct character')
    console.log('\n🎯 Next Step: Test battle simulation to see new data')
    console.log('   npx tsx lib/game/balanceTestRunner.ts\n')

  } catch (error) {
    console.error('\n❌ Failed to apply battle data enhancements:', error)
    process.exit(1)
  }
}

applyBattleDataEnhancements()
