/**
 * Badge Sprite Mapping Script
 *
 * Maps badge_code values from the database to sprite file paths based on NAMING_GUIDE.md
 *
 * Badge sprites are organized in three sheets:
 * - Sheet 1 (badge_001-040): Content badges (image_1764193680087)
 * - Sheet 2 (badge_041-080): Positive badges (image_1764193677602)
 * - Sheet 3 (badge_081-120): Negative badges (image_1764193675435)
 */

import { createClient } from '@supabase/supabase-js';

// Badge sprite mappings from NAMING_GUIDE.md
const SPRITE_MAPPINGS: Record<string, { file: string; folder: string }> = {
  // Content badges (badge_001-040) - Sheet 3
  'angle_master': { file: 'badge_001.png', folder: 'image_1764193680087' }, // angles
  'personal_attack_specialist': { file: 'badge_002.png', folder: 'image_1764193680087' }, // personals
  'disrespectful': { file: 'badge_003.png', folder: 'image_1764193680087' }, // disrespect
  'comedian': { file: 'badge_004.png', folder: 'image_1764193680087' }, // comedy
  // badge_005: jokes - no direct match
  // badge_006: sarcasm - no direct match
  // badge_007: self_deprecating - no direct match
  // badge_008: dry_humor - no direct match
  // badge_009: slapstick - no direct match
  // badge_010: concept_battles - no direct match
  'gritty': { file: 'badge_011.png', folder: 'image_1764193680087' },
  // badge_012: street_talk - no direct match
  'braggadocious': { file: 'badge_013.png', folder: 'image_1764193680087' },
  // badge_014: og_bars - no direct match
  // badge_015: metaphors - use for metaphor_magician
  // badge_016: similes - no direct match
  'wordplay': { file: 'badge_017.png', folder: 'image_1764193680087' },
  // badge_018: witty_wordplay - no direct match
  // badge_019: schemes - use for scheme_king
  'shock_value': { file: 'badge_020.png', folder: 'image_1764193680087' }, // violent_imagery -> shock_value
  'multisyllabic_master': { file: 'badge_021.png', folder: 'image_1764193680087' }, // multisyllabic_rhymes
  // badge_022: intricate_schemes - no direct match
  // badge_023: sports_references - no direct match
  // badge_024: pop_culture_references - no direct match
  // badge_025: historical_references - no direct match
  // badge_026: locational_references - no direct match
  'political_commentary': { file: 'badge_027.png', folder: 'image_1764193680087' },
  // badge_028: social_commentary - no direct match
  'storyteller': { file: 'badge_029.png', folder: 'image_1764193680087' }, // storytelling
  'enhanced_storyteller': { file: 'badge_029.png', folder: 'image_1764193680087' }, // storytelling (reuse)
  // badge_030: motivational - no direct match
  'punchline_heavy': { file: 'badge_031.png', folder: 'image_1764193680087' }, // punchlines
  // badge_032: name_flips - use for name_flip_dependent
  // badge_033: slogan - no direct match
  'controversial': { file: 'badge_034.png', folder: 'image_1764193680087' },
  // badge_035: shock_value (duplicate)
  'freestyle': { file: 'badge_036.png', folder: 'image_1764193680087' }, // freestyles
  'off_the_top': { file: 'badge_036.png', folder: 'image_1764193680087' }, // freestyles (reuse)
  // badge_037: rebuttals - no direct match
  // badge_038: punchline_king - no direct match
  'scheme_king': { file: 'badge_039.png', folder: 'image_1764193680087' }, // scheme_specialist
  'metaphor_magician': { file: 'badge_040.png', folder: 'image_1764193680087' }, // metaphor_master

  // Positive badges (badge_041-080) - Sheet 2
  // badge_041: wordplay_wizard - use for wordplay (duplicate handling)
  'freestyle_genius': { file: 'badge_042.png', folder: 'image_1764193677602' }, // freestyle_genius
  // badge_043: creativity_beast - no direct match
  'consistent_performer': { file: 'badge_044.png', folder: 'image_1764193677602' }, // consistent_writer
  // badge_045: angle_master (duplicate)
  // badge_046: rebuttal_king - no direct match
  // badge_047: great_setups - no direct match
  // badge_048: double_entendre_expert - no direct match
  'unpredictable': { file: 'badge_049.png', folder: 'image_1764193677602' },
  'pen_game_elite': { file: 'badge_050.png', folder: 'image_1764193677602' },
  // badge_051: quotable_machine - no direct match
  // badge_052: hard_hitting_haymakers - no direct match
  // badge_053: multisyllabic_master (duplicate)
  // badge_054: well_researched - no direct match
  // badge_055: well_timed_humor - no direct match
  'aggressive': { file: 'badge_056.png', folder: 'image_1764193677602' },
  // badge_057: menacing - no direct match
  'speed_rapper': { file: 'badge_058.png', folder: 'image_1764193677602' }, // speed_rapping
  // badge_059: slow_flow - no direct match
  'smooth_flow': { file: 'badge_060.png', folder: 'image_1764193677602' },
  // badge_061: explosive - no direct match
  // badge_062: passionate - no direct match
  // badge_063: nonchalant - no direct match
  // badge_064: deadpan - no direct match
  // badge_065: rapid_fire - no direct match
  // badge_066: melodic - no direct match
  // badge_067: impassioned - no direct match
  // badge_068: cold - no direct match
  // badge_069: empathetic - no direct match
  'stage_presence': { file: 'badge_070.png', folder: 'image_1764193677602' }, // power_stance -> stage_presence
  'animated': { file: 'badge_071.png', folder: 'image_1764193677602' }, // fluid_movement -> animated
  'performance_beast': { file: 'badge_072.png', folder: 'image_1764193677602' }, // stage_domination
  'crowd_control': { file: 'badge_073.png', folder: 'image_1764193677602' }, // crowd_interaction
  // badge_074: dynamic_range - no direct match
  'believable_persona': { file: 'badge_075.png', folder: 'image_1764193677602' }, // charismatic
  'crowd_favorite': { file: 'badge_076.png', folder: 'image_1764193677602' },
  // badge_077: show_stealer - no direct match
  'main_stage_specialist': { file: 'badge_078.png', folder: 'image_1764193677602' }, // big_stage_performer
  'clutch_performer': { file: 'badge_079.png', folder: 'image_1764193677602' },
  'respected_veteran': { file: 'badge_080.png', folder: 'image_1764193677602' },

  // Negative badges (badge_081-120) - Sheet 1
  'recycler': { file: 'badge_081.png', folder: 'image_1764193675435' },
  'biter': { file: 'badge_082.png', folder: 'image_1764193675435' },
  'one_trick_pony': { file: 'badge_083.png', folder: 'image_1764193675435' },
  // badge_084: shock_value_abuser - no direct match
  'lazy_writer': { file: 'badge_085.png', folder: 'image_1764193675435' },
  'predictable': { file: 'badge_086.png', folder: 'image_1764193675435' },
  'reach_god': { file: 'badge_087.png', folder: 'image_1764193675435' },
  'filler_abuser': { file: 'badge_088.png', folder: 'image_1764193675435' },
  'outdated_referencer': { file: 'badge_089.png', folder: 'image_1764193675435' }, // outdated
  'redundant': { file: 'badge_090.png', folder: 'image_1764193675435' }, // repetitive
  // badge_091: weak_setups - no direct match
  // badge_092: gimmick_abuser - no direct match
  // badge_093: shallow_research - no direct match
  'choker': { file: 'badge_094.png', folder: 'image_1764193675435' },
  // badge_095: one_hit_wonder - no direct match
  // badge_096: overhyped - no direct match
  // badge_097: inconsistent - no direct match
  // badge_098: crowd_killer - no direct match
  // badge_099: time_waster - no direct match
  'mumbler': { file: 'badge_100.png', folder: 'image_1764193675435' },
  'monotone_deliverer': { file: 'badge_101.png', folder: 'image_1764193675435' }, // monotone
  'stiff_body_language': { file: 'badge_102.png', folder: 'image_1764193675435' }, // awkward_presence
  'energy_drainer': { file: 'badge_103.png', folder: 'image_1764193675435' },
  'poor_breath_control': { file: 'badge_104.png', folder: 'image_1764193675435' }, // off_beat
  // badge_105: sore_loser - no direct match
  // badge_106: canceller - no direct match
  'drama_starter': { file: 'badge_107.png', folder: 'image_1764193675435' },
  // badge_108: excuse_maker - no direct match
  'unreliable': { file: 'badge_109.png', folder: 'image_1764193675435' },
  // badge_110: ghost_writer - no direct match
  // badge_111: scammer - no direct match
  // badge_112: fake_tough_guy - no direct match
  'clout_chaser': { file: 'badge_113.png', folder: 'image_1764193675435' },
  'social_media_created': { file: 'badge_114.png', folder: 'image_1764193675435' }, // sellout
  // badge_115: ego_issues - no direct match
  // badge_116: known_choker - use same as choker
  'cliche_abuser': { file: 'badge_117.png', folder: 'image_1764193675435' }, // corny_punchlines
  // badge_118: inauthentic - no direct match
  // badge_119: trend_follower - no direct match
  // badge_120: poor_networking - no direct match

  // Additional mappings for badges not in NAMING_GUIDE (use best matches)
  'overprepared': { file: 'badge_044.png', folder: 'image_1764193677602' }, // consistent_writer
  'prepared_battler': { file: 'badge_044.png', folder: 'image_1764193677602' }, // consistent_writer
  'technical_writer': { file: 'badge_050.png', folder: 'image_1764193677602' }, // pen_game_elite
  'small_room_killer': { file: 'badge_078.png', folder: 'image_1764193677602' }, // opposite of big_stage_performer
  'consistent_grinder': { file: 'badge_044.png', folder: 'image_1764193677602' }, // consistent_writer
  'consummate_professional': { file: 'badge_080.png', folder: 'image_1764193677602' }, // respected_veteran
  'viral_sensation': { file: 'badge_076.png', folder: 'image_1764193677602' }, // crowd_favorite
  'battle_of_the_night_winner': { file: 'badge_079.png', folder: 'image_1764193677602' }, // clutch_performer
  'name_flip_dependent': { file: 'badge_032.png', folder: 'image_1764193680087' }, // name_flips
  'overcomplicated': { file: 'badge_022.png', folder: 'image_1764193680087' }, // intricate_schemes

  // Negative badges without direct matches (use fallbacks)
  'backstabber': { file: 'badge_107.png', folder: 'image_1764193675435' }, // drama_starter
  'bitter_veteran': { file: 'badge_105.png', folder: 'image_1764193675435' }, // sore_loser
  'career_plateaued': { file: 'badge_097.png', folder: 'image_1764193675435' }, // inconsistent
  'culture_vulture': { file: 'badge_113.png', folder: 'image_1764193675435' }, // clout_chaser
  'fallen_star': { file: 'badge_096.png', folder: 'image_1764193675435' }, // overhyped
  'financial_struggles': { file: 'badge_099.png', folder: 'image_1764193675435' }, // time_waster
  'glory_days_living': { file: 'badge_095.png', folder: 'image_1764193675435' }, // one_hit_wonder
  'health_issues': { file: 'badge_103.png', folder: 'image_1764193675435' }, // energy_drainer
  'jail_risk': { file: 'badge_107.png', folder: 'image_1764193675435' }, // drama_starter
  'known_stealer': { file: 'badge_082.png', folder: 'image_1764193675435' }, // biter
  'substance_issues': { file: 'badge_103.png', folder: 'image_1764193675435' }, // energy_drainer
  'washed': { file: 'badge_089.png', folder: 'image_1764193675435' }, // outdated
  'weak_chin': { file: 'badge_094.png', folder: 'image_1764193675435' }, // choker
};

interface Badge {
  badge_code: string;
  badge_name: string;
  tier: string;
  category: string;
  icon_url: string | null;
}

async function mapBadgeSprites() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('🔍 Fetching badges from database...\n');

  const { data: badges, error } = await supabase
    .from('badge_costs')
    .select('badge_code, badge_name, tier, category, icon_url')
    .order('category', { ascending: true })
    .order('badge_code', { ascending: true });

  if (error) {
    console.error('❌ Error fetching badges:', error);
    process.exit(1);
  }

  console.log(`✅ Found ${badges?.length || 0} badges\n`);

  const updates: { code: string; url: string }[] = [];
  const unmapped: string[] = [];
  const mapped: string[] = [];

  // Build update statements
  badges?.forEach((badge: Badge) => {
    const mapping = SPRITE_MAPPINGS[badge.badge_code];

    if (mapping) {
      const iconUrl = `/sprites/badges/${mapping.folder}/${mapping.file}`;
      updates.push({ code: badge.badge_code, url: iconUrl });
      mapped.push(badge.badge_code);
    } else {
      unmapped.push(badge.badge_code);
    }
  });

  console.log('📊 MAPPING SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Successfully mapped: ${mapped.length} badges`);
  console.log(`⚠️  Need manual mapping: ${unmapped.length} badges`);
  console.log(`📁 Total badges: ${badges?.length || 0}\n`);

  if (unmapped.length > 0) {
    console.log('⚠️  BADGES NEEDING MANUAL MAPPING:');
    console.log('───────────────────────────────────────');
    unmapped.forEach(code => {
      const badge = badges?.find((b: Badge) => b.badge_code === code);
      console.log(`  • ${code} (${badge?.badge_name})`);
    });
    console.log('');
  }

  // Execute updates
  if (updates.length > 0) {
    console.log('🔄 Updating database...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      const { error } = await supabase
        .from('badge_costs')
        .update({ icon_url: update.url })
        .eq('badge_code', update.code);

      if (error) {
        console.error(`❌ Failed to update ${update.code}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ ${update.code} → ${update.url}`);
        successCount++;
      }
    }

    console.log('\n' + '═══════════════════════════════════════');
    console.log(`✅ Successfully updated: ${successCount} badges`);
    if (errorCount > 0) {
      console.log(`❌ Failed updates: ${errorCount} badges`);
    }
  }

  // Verify all badges have icon_url
  console.log('\n🔍 VERIFICATION');
  console.log('═══════════════════════════════════════');

  const { data: verifyBadges } = await supabase
    .from('badge_costs')
    .select('badge_code, icon_url')
    .is('icon_url', null);

  if (verifyBadges && verifyBadges.length > 0) {
    console.log(`⚠️  ${verifyBadges.length} badges still missing icon_url:`);
    verifyBadges.forEach((badge: any) => {
      console.log(`  • ${badge.badge_code}`);
    });
  } else {
    console.log('✅ All badges have icon_url populated!');
  }

  console.log('\n✨ Script completed!\n');
}

// Run the script
mapBadgeSprites().catch(console.error);
