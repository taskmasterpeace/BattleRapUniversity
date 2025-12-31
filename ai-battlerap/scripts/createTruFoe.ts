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

async function createTruFoe() {
  console.log('🎤 Creating Tru Foe as Licensed AI Battler...\n')

  try {
    // Check if Tru Foe already exists
    console.log('Checking if Tru Foe already exists...')
    const { data: existing, error: checkError } = await supabase
      .from('battlers')
      .select('id, stage_name')
      .eq('stage_name', 'Tru Foe')
      .maybeSingle()

    if (checkError) {
      console.error('❌ Error checking for existing battler:', checkError)
      throw checkError
    }

    if (existing) {
      console.log('⚠️  Tru Foe already exists with ID:', existing.id)
      console.log('Skipping creation. Delete the existing record first if you want to recreate.\n')
      return
    }

    // Get Main Stage Arena league ID (Tru Foe's crowd control is high)
    console.log('Fetching Main Stage Arena league...')
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('id')
      .eq('short_code', 'MAIN_STAGE')
      .single()

    if (leagueError || !league) {
      console.error('❌ Error fetching Main Stage Arena league:', leagueError)
      throw leagueError || new Error('Main Stage Arena not found')
    }

    console.log('✅ Main Stage Arena league ID:', league.id)

    // Create Tru Foe battler
    console.log('\nCreating Tru Foe battler record...')
    const { data: battler, error: battlerError } = await supabase
      .from('battlers')
      .insert({
        stage_name: 'Tru Foe',
        is_ai: true,
        primary_league_id: league.id,
        region: 'Battle Rap',
        tier: 'top',
        style_tags: [
          'aggressive',
          'stiff_body_language',
          'consistent_grinder',
          'believable_persona',
          'battle_of_the_night_winner'
        ]
      })
      .select()
      .single()

    if (battlerError || !battler) {
      console.error('❌ Error creating battler:', battlerError)
      throw battlerError || new Error('Failed to create battler')
    }

    console.log('✅ Tru Foe battler created with ID:', battler.id)

    // Create battler attributes
    console.log('\nCreating Tru Foe attributes...')
    const { data: attributes, error: attributesError } = await supabase
      .from('battler_attributes')
      .insert({
        battler_id: battler.id,
        writing: {
          lyricism: 8,      // From punchlines 8.35 + schemes 8.00
          wordplay: 8,      // Direct: 8.10
          creativity: 8,    // From angles 8.50 + schemes 8.00
          flow: 6           // Average performance, derived
        },
        performance: {
          stage_presence: 6,  // Direct: 6.10
          crowd_control: 8,   // Direct: 7.90
          delivery: 6         // Direct: 5.70
        },
        personal: {
          financial_stability: 5,  // Mid-tier, no data provided
          reputation: 8,           // He's well-known
          family_bond: 5,          // Mid-tier, no data provided
          preparation: 7           // Direct: 6.90
        },
        resilience: 8,        // From consistency 8.30
        public_knowledge: 70  // He's a known battler
      })
      .select()
      .single()

    if (attributesError || !attributes) {
      console.error('❌ Error creating attributes:', attributesError)
      throw attributesError || new Error('Failed to create attributes')
    }

    console.log('✅ Tru Foe attributes created')

    // Create ranking entry
    console.log('\nCreating Tru Foe ranking...')
    const { data: ranking, error: rankingError } = await supabase
      .from('rankings')
      .insert({
        battler_id: battler.id,
        rating: 1700,  // Top-tier battler, above average 1500
        wins: 0,
        losses: 0,
        streak: 0
      })
      .select()
      .single()

    if (rankingError || !ranking) {
      console.error('❌ Error creating ranking:', rankingError)
      throw rankingError || new Error('Failed to create ranking')
    }

    console.log('✅ Tru Foe ranking created with rating:', ranking.rating)

    // Display summary
    console.log('\n' + '='.repeat(60))
    console.log('🎉 TRU FOE SUCCESSFULLY CREATED!')
    console.log('='.repeat(60))
    console.log('\n📊 BATTLER PROFILE:')
    console.log(`   ID: ${battler.id}`)
    console.log(`   Stage Name: ${battler.stage_name}`)
    console.log(`   Region: ${battler.region}`)
    console.log(`   Tier: ${battler.tier}`)
    console.log(`   Primary League: Main Stage Arena`)
    console.log(`   Rating: ${ranking.rating}`)

    console.log('\n🎯 ATTRIBUTES:')
    console.log('   Writing:')
    console.log(`     - Lyricism: 8`)
    console.log(`     - Wordplay: 8`)
    console.log(`     - Creativity: 8`)
    console.log(`     - Flow: 6`)
    console.log('   Performance:')
    console.log(`     - Stage Presence: 6`)
    console.log(`     - Crowd Control: 8`)
    console.log(`     - Delivery: 6`)
    console.log('   Personal:')
    console.log(`     - Financial Stability: 5`)
    console.log(`     - Reputation: 8`)
    console.log(`     - Family Bond: 5`)
    console.log(`     - Preparation: 7`)
    console.log(`   Resilience: 8`)
    console.log(`   Public Knowledge: 70`)

    console.log('\n🏷️  BADGES:')
    console.log('   - aggressive')
    console.log('   - stiff_body_language (negative)')
    console.log('   - consistent_grinder')
    console.log('   - believable_persona')
    console.log('   - battle_of_the_night_winner')

    console.log('\n📝 BADGE EFFECTS:')
    console.log('   Stiff Body Language (negative):')
    console.log('     • Stage Presence -15%')
    console.log('     • Delivery -10%')
    console.log('     • Crowd reaction -5')
    console.log('   Consistent Grinder:')
    console.log('     • Consistency +15%')
    console.log('     • All prep types +10% effective')
    console.log('   Believable Persona:')
    console.log('     • Crowd reaction +12')
    console.log('     • Reputation +1')
    console.log('   Battle of the Night Winner:')
    console.log('     • Peak segments +20%')
    console.log('     • Public knowledge +15')
    console.log('     • Reputation +2')

    console.log('\n✅ Tru Foe is now ready to battle!\n')

  } catch (error) {
    console.error('\n❌ Failed to create Tru Foe:', error)
    process.exit(1)
  }
}

createTruFoe()
