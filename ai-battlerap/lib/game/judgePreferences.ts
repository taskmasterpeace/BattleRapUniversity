/**
 * Judge Preferences System
 *
 * Defines judge profiles for tournament scoring. Judges are bloggers acting as tournament judges.
 * Each judge has distinct preferences for badges, content types, delivery styles, and performance.
 *
 * TWO-LEVEL EVALUATION:
 * 1. Static Badge Bias: What badges you have coming into the tournament
 * 2. Dynamic Performance: What you actually did in this specific battle (segment-level content tracking)
 *
 * The 8 canonical bloggers/judges:
 * 1. Battle Eyez - Drama/Controversy Hunter
 * 2. Marijuana Piranha - Street Authenticity Voice
 * 3. Algorithm Institute - Historian/Archivist
 * 4. Small Room Report - Underground/Small Room Specialist
 * 5. The Main Stage Herald - Big Stage/PPV Specialist
 * 6. Underground Voice - Independent/Regional Scene Advocate
 * 7. Coast to Coast Coverage - Cynical Underdog Champion
 * 8. The Battle Breakdown - Technical Scorecard Analyst
 */

import type { ContentType, DeliveryType, PerformanceType } from './contentTypes';

// ============================================================================
// Judge Preference Interfaces
// ============================================================================

export interface JudgeProfile {
  judge_id: string;
  judge_name: string;
  outlet_name: string;
  objectivity: number; // 1-10 (higher = more objective, less biased)

  // Blogger assets (for UI display)
  logo_url?: string;           // Blogger outlet logo/icon
  profile_picture_url?: string; // Judge headshot
  banner_url?: string;          // Outlet banner image

  // Badge preferences (static evaluation)
  badge_biases: Record<string, number>; // +10 = loves, -10 = hates

  // Content type preferences (dynamic evaluation - what they want to see)
  content_preferences: Record<ContentType, number>; // +10 to -10

  // Delivery type preferences
  delivery_preferences: Record<DeliveryType, number>; // +10 to -10

  // Performance type preferences
  performance_preferences: Record<PerformanceType, number>; // +10 to -10

  // League characteristic preferences (NOT league names - based on style)
  league_characteristic_preferences: {
    prefers_writing_focused: number;      // -1.0 to +1.0 (high writing_weight leagues)
    prefers_performance_focused: number;  // -1.0 to +1.0 (high performance_weight leagues)
    prefers_longer_rounds: number;        // -1.0 to +1.0 (3-min vs 2-min)
    prefers_loud_crowds: number;          // -1.0 to +1.0 (high base_crowd_factor)
    prefers_intimate_venues: number;      // -1.0 to +1.0 (low attendance, small rooms)
  };

  // Scoring weight variations (how this judge weighs components)
  scoring_weights: {
    average_weight: number;    // Default: 0.40
    peak_weight: number;       // Default: 0.35
    crowd_weight: number;      // Default: 0.25
    writing_emphasis: number;  // +/-0.15 modifier to league's writing weight
    performance_emphasis: number; // +/-0.15 modifier to league's performance weight
  };

  // Personality traits
  favors_underdogs: boolean;
  favors_veterans: boolean;
  anti_mainstream: boolean;
  loves_drama: boolean;
}

// ============================================================================
// Judge Profiles
// ============================================================================

export const JUDGE_PROFILES: Record<string, JudgeProfile> = {

  // 1. BATTLE EYEZ - Drama/Controversy Hunter
  battle_eyez: {
    judge_id: 'battle_eyez',
    judge_name: 'Battle Eyez',
    outlet_name: 'Battle Eyez Media',
    objectivity: 4,

    // Blogger assets (placeholders)
    logo_url: '/assets/judges/battle_eyez_logo.png',
    profile_picture_url: '/assets/judges/battle_eyez_profile.jpg',
    banner_url: '/assets/judges/battle_eyez_banner.jpg',

    badge_biases: {
      // Loves drama and controversy
      'Drama Starter': 8,
      'Beef History': 10,
      'Controversial Figure': 10,
      'Villain': 9,
      'Trash Talker': 8,
      'Social Media Warrior': 6,

      // Dislikes boring/wholesome
      'Respectful Competitor': -7,
      'Good Sportsmanship': -8,
      'Humble': -6,
      'Mentor': -5,

      // Mixed on technical
      'Pen Game Elite': -2,
      'Technical Writer': -3,
    },

    content_preferences: {
      'personals': 10,          // LOVES personal attacks
      'shock_value': 9,         // LOVES shocking moments
      'gun_bars': 6,            // Likes aggression
      'freestyles': 7,          // Likes spontaneity
      'rebuttals': 8,           // Loves direct responses
      'wordplay': -2,           // Doesn't care about wordplay
      'schemes': -3,            // Doesn't care about schemes
      'punchlines': 5,          // Likes if they're brutal
      'comedy': 4,              // Likes if it's mean
      'storytelling': 2,        // Neutral
      'street_talk': 6,         // Likes authenticity
      'pop_culture_refs': 3,    // Neutral
      'name_flips': 4,          // Likes clever angles
      'social_commentary': 5,   // Likes if controversial
    },

    delivery_preferences: {
      'aggressive': 9,          // LOVES aggression
      'passionate': 7,          // Likes intensity
      'staccato': 4,            // Neutral
      'smooth_flow': -2,        // Doesn't care
      'speed_rapping': 2,       // Neutral
      'nonchalant': -4,         // Dislikes casual
      'conversational': -3,     // Wants intensity
    },

    performance_preferences: {
      'theatrical': 8,          // LOVES theatrics
      'crowd_interaction': 7,   // Loves engagement
      'stage_presence': 6,      // Likes big moments
      'charismatic': 5,         // Appreciates personality
      'dynamic_range': 4,       // Neutral
      'facial_expression': 6,   // Likes drama
      'strategic_pauses': 3,    // Neutral
      'minimalist': -6,         // Dislikes understated
    },

    league_characteristic_preferences: {
      prefers_writing_focused: -0.3,      // Doesn't care about pen
      prefers_performance_focused: +0.7,  // LOVES big stage drama
      prefers_longer_rounds: +0.4,        // More time for drama
      prefers_loud_crowds: +0.8,          // LOVES loud crowds
      prefers_intimate_venues: -0.5,      // Prefers big stages
    },

    scoring_weights: {
      average_weight: 0.35,     // Less weight on average (-0.05)
      peak_weight: 0.45,        // MORE weight on peaks (+0.10) - loves big moments
      crowd_weight: 0.20,       // Less weight on crowd (-0.05)
      writing_emphasis: -0.10,  // Less emphasis on writing
      performance_emphasis: +0.10, // More emphasis on performance/drama
    },

    favors_underdogs: false,
    favors_veterans: false,
    anti_mainstream: false,
    loves_drama: true,
  },

  // 2. MARIJUANA PIRANHA - Street Authenticity Voice
  marijuana_piranha: {
    judge_id: 'marijuana_piranha',
    judge_name: 'Marijuana Piranha',
    outlet_name: 'The Cipher',
    objectivity: 3,

    // Blogger assets (placeholders)
    logo_url: '/assets/judges/marijuana_piranha_logo.png',
    profile_picture_url: '/assets/judges/marijuana_piranha_profile.jpg',
    banner_url: '/assets/judges/marijuana_piranha_banner.jpg',

    badge_biases: {
      // Loves street credibility
      'Street': 10,
      'Gangster Persona': 10,
      'Aggressive': 9,
      'Hood Legend': 10,
      'Battle Tested': 8,
      'Gun Bars': 9,

      // HATES fake energy
      'Culture Vulture': -10,
      'Suburban Background': -9,
      'Bougie': -10,
      'Social Media Created': -10,
      'Crossover Appeal': -7,
      'Mainstream Darling': -8,

      // Doesn't care about technical
      'Pen Game Elite': -4,
      'Wordplay Wizard': -5,
      'Technical Writer': -6,
    },

    content_preferences: {
      'gun_bars': 10,           // LOVES gun bars
      'street_talk': 10,        // LOVES street content
      'personals': 9,           // Loves aggression
      'shock_value': 8,         // Likes bold moves
      'freestyles': 7,          // Respects spontaneity
      'rebuttals': 8,           // Likes direct confrontation
      'wordplay': -5,           // Doesn't value wordplay
      'schemes': -6,            // Doesn't care about complexity
      'punchlines': 6,          // Likes if they hit hard
      'comedy': -3,             // Not here for jokes
      'storytelling': 4,        // Neutral
      'pop_culture_refs': -4,   // Dislikes nerdy stuff
      'name_flips': 2,          // Neutral
      'social_commentary': 3,   // Neutral
    },

    delivery_preferences: {
      'aggressive': 10,         // LOVES aggression
      'passionate': 9,          // Loves intensity
      'staccato': 6,            // Likes impact
      'smooth_flow': -3,        // Doesn't care
      'speed_rapping': 3,       // Neutral
      'nonchalant': -7,         // HATES casual
      'conversational': -5,     // Wants energy
    },

    performance_preferences: {
      'crowd_interaction': 8,   // Loves room energy
      'charismatic': 7,         // Appreciates presence
      'stage_presence': 6,      // Likes dominance
      'dynamic_range': 4,       // Neutral
      'facial_expression': 5,   // Neutral
      'theatrical': -2,         // Doesn't care about theatrics
      'strategic_pauses': -3,   // Wants constant energy
      'minimalist': -8,         // HATES understated
    },

    league_characteristic_preferences: {
      prefers_writing_focused: -0.7,      // Doesn't care about writing
      prefers_performance_focused: +0.8,  // LOVES performance/energy
      prefers_longer_rounds: -0.2,        // Slightly prefers shorter
      prefers_loud_crowds: +0.7,          // Loves loud crowds
      prefers_intimate_venues: +0.6,      // Prefers intimate/street venues
    },

    scoring_weights: {
      average_weight: 0.40,     // Standard
      peak_weight: 0.35,        // Standard
      crowd_weight: 0.25,       // Standard - crowd matters
      writing_emphasis: -0.15,  // LESS emphasis on writing
      performance_emphasis: +0.15, // MORE emphasis on performance/energy
    },

    favors_underdogs: true,    // Champions street battlers
    favors_veterans: false,
    anti_mainstream: true,     // Very anti-mainstream
    loves_drama: true,
  },

  // 3. ALGORITHM INSTITUTE - Historian/Archivist
  algorithm_institute: {
    judge_id: 'algorithm_institute',
    judge_name: 'Algorithm Institute',
    outlet_name: 'Algorithm Institute of Battle Rap',
    objectivity: 8,

    // Blogger assets (placeholders)
    logo_url: '/assets/judges/algorithm_institute_logo.png',
    profile_picture_url: '/assets/judges/algorithm_institute_profile.jpg',
    banner_url: '/assets/judges/algorithm_institute_banner.jpg',

    badge_biases: {
      // Loves veterans and consistency
      'Respected Veteran': 10,
      'Legendary Status': 10,
      'Hall of Fame': 10,
      'Career Longevity': 9,
      'Consistent Performer': 8,
      'Battle Tested': 7,
      'Historical Significance': 10,

      // Dislikes flash-in-the-pan
      'Viral Sensation': -5,
      'Social Media Created': -7,
      'One-Hit Wonder': -6,
      'Hype Train': -4,

      // Appreciates all-around skill
      'Complete Battler': 8,
      'Pen Game Elite': 7,
    },

    content_preferences: {
      'wordplay': 7,            // Appreciates craft
      'schemes': 8,             // Appreciates complexity
      'storytelling': 9,        // LOVES narrative
      'punchlines': 6,          // Appreciates well-crafted
      'personals': 5,           // Neutral
      'rebuttals': 7,           // Likes intelligent responses
      'freestyles': 4,          // Less valued than prep
      'gun_bars': 2,            // Neutral
      'street_talk': 3,         // Neutral
      'pop_culture_refs': 6,    // Appreciates references
      'name_flips': 7,          // Likes clever angles
      'shock_value': -2,        // Slightly dislikes
      'comedy': 5,              // Neutral
      'social_commentary': 8,   // Appreciates depth
    },

    delivery_preferences: {
      'smooth_flow': 7,         // Appreciates polished delivery
      'conversational': 6,      // Likes natural flow
      'passionate': 5,          // Neutral
      'staccato': 4,            // Neutral
      'aggressive': 3,          // Neutral
      'speed_rapping': 5,       // Neutral
      'nonchalant': 2,          // Slightly negative
    },

    performance_preferences: {
      'stage_presence': 7,      // Appreciates command
      'charismatic': 6,         // Appreciates personality
      'dynamic_range': 7,       // Appreciates versatility
      'strategic_pauses': 6,    // Appreciates control
      'theatrical': 4,          // Neutral
      'crowd_interaction': 5,   // Neutral
      'facial_expression': 4,   // Neutral
      'minimalist': 3,          // Neutral
    },

    league_characteristic_preferences: {
      prefers_writing_focused: +0.4,      // Values writing/substance
      prefers_performance_focused: 0,     // Neutral
      prefers_longer_rounds: 0,           // Neutral
      prefers_loud_crowds: 0,             // Neutral
      prefers_intimate_venues: 0,         // Neutral
    },

    scoring_weights: {
      average_weight: 0.45,     // MORE weight on consistency (+0.05)
      peak_weight: 0.30,        // LESS weight on peaks (-0.05) - values consistency
      crowd_weight: 0.25,       // Standard
      writing_emphasis: +0.05,  // Slight writing emphasis
      performance_emphasis: -0.05, // Slight performance de-emphasis
    },

    favors_underdogs: false,
    favors_veterans: true,      // Strongly favors veterans
    anti_mainstream: false,
    loves_drama: false,
  },

  // 4. SMALL ROOM REPORT - Underground/Small Room Specialist
  small_room_report: {
    judge_id: 'small_room_report',
    judge_name: 'Small Room Report',
    outlet_name: 'Small Room Report',
    objectivity: 7,

    // Blogger assets (placeholders)
    logo_url: '/assets/judges/small_room_report_logo.png',
    profile_picture_url: '/assets/judges/small_room_report_profile.jpg',
    banner_url: '/assets/judges/small_room_report_banner.jpg',

    badge_biases: {
      // Loves pen game and preparation
      'Pen Game Elite': 10,
      'Wordplay Wizard': 10,
      'Technical Writer': 10,
      'Prepared Battler': 10,
      'Consistent Grinder': 9,
      'Small Room Killer': 10,
      'Underground Legend': 9,

      // HATES unprepared and gimmicks
      'Known Choker': -10,
      'Unprepared': -10,
      'Freestyle Dependent': -8,
      'Performance Over Substance': -9,
      'Gimmick': -10,
      'Main Stage Only': -6,
    },

    content_preferences: {
      'wordplay': 10,           // LOVES wordplay
      'schemes': 10,            // LOVES schemes
      'punchlines': 9,          // LOVES punchlines
      'storytelling': 8,        // Appreciates narrative
      'name_flips': 9,          // Loves clever writing
      'rebuttals': 7,           // Appreciates prepared responses
      'personals': 5,           // Neutral
      'social_commentary': 7,   // Appreciates depth
      'pop_culture_refs': 6,    // Appreciates cleverness
      'freestyles': -6,         // Dislikes winging it
      'gun_bars': 0,            // Neutral
      'street_talk': 2,         // Slightly positive
      'shock_value': -4,        // Dislikes gimmicks
      'comedy': 6,              // Likes well-written jokes
    },

    delivery_preferences: {
      'smooth_flow': 9,         // LOVES clean delivery
      'conversational': 7,      // Appreciates natural
      'staccato': 6,            // Likes impactful
      'passionate': 5,          // Neutral
      'speed_rapping': 4,       // Neutral
      'aggressive': 2,          // Slightly negative
      'nonchalant': -2,         // Slightly negative
    },

    performance_preferences: {
      'stage_presence': 6,      // Appreciates command
      'strategic_pauses': 8,    // LOVES control
      'dynamic_range': 6,       // Appreciates versatility
      'charismatic': 5,         // Neutral
      'minimalist': 4,          // Neutral - pen matters more
      'crowd_interaction': 3,   // Less important in small rooms
      'theatrical': -4,         // Dislikes over-the-top
      'facial_expression': 3,   // Neutral
    },

    league_characteristic_preferences: {
      prefers_writing_focused: +0.9,      // STRONG writing preference
      prefers_performance_focused: -0.7,  // Dislikes performance-focused
      prefers_longer_rounds: -0.5,        // Prefers shorter rounds (2-min)
      prefers_loud_crowds: -0.6,          // Prefers quieter crowds
      prefers_intimate_venues: +0.8,      // LOVES intimate venues
    },

    scoring_weights: {
      average_weight: 0.45,     // MORE weight on consistency (+0.05)
      peak_weight: 0.30,        // LESS weight on peaks (-0.05)
      crowd_weight: 0.25,       // Standard
      writing_emphasis: +0.15,  // STRONG writing emphasis
      performance_emphasis: -0.15, // LESS performance emphasis
    },

    favors_underdogs: false,
    favors_veterans: false,
    anti_mainstream: false,
    loves_drama: false,
  },

  // 5. THE MAIN STAGE HERALD - Big Stage/PPV Specialist
  the_main_stage_herald: {
    judge_id: 'the_main_stage_herald',
    judge_name: 'The Main Stage Herald',
    outlet_name: 'The Main Stage Herald',
    objectivity: 5,

    // Blogger assets (placeholders)
    logo_url: '/assets/judges/the_main_stage_herald_logo.png',
    profile_picture_url: '/assets/judges/the_main_stage_herald_profile.jpg',
    banner_url: '/assets/judges/the_main_stage_herald_banner.jpg',

    badge_biases: {
      // Loves main stage performers
      'Main Stage Beast': 10,
      'PPV Performer': 10,
      'Clutch Performer': 10,
      'Crowd Favorite': 9,
      'Star Power': 9,
      'Performance Beast': 10,
      'Big Moment Maker': 10,

      // Dislikes chokers and small room only
      'Known Choker': -10,
      'Camera Shy': -9,
      'Small Room Only': -8,
      'Underground Only': -6,
      'Stage Fright': -10,
    },

    content_preferences: {
      'punchlines': 9,          // LOVES punchlines
      'shock_value': 8,         // Loves big moments
      'personals': 7,           // Likes impact
      'freestyles': 6,          // Appreciates spontaneity
      'rebuttals': 7,           // Likes responsiveness
      'storytelling': 6,        // Neutral-positive
      'gun_bars': 5,            // Neutral
      'street_talk': 4,         // Neutral
      'pop_culture_refs': 6,    // Likes crowd appeal
      'comedy': 7,              // Likes crowd pleasers
      'wordplay': 4,            // Neutral
      'schemes': 3,             // Less important than impact
      'name_flips': 5,          // Neutral
      'social_commentary': 4,   // Neutral
    },

    delivery_preferences: {
      'aggressive': 8,          // LOVES aggression
      'passionate': 9,          // LOVES passion
      'staccato': 7,            // Likes impactful
      'smooth_flow': 5,         // Neutral
      'speed_rapping': 6,       // Neutral
      'conversational': 2,      // Wants intensity
      'nonchalant': -6,         // Dislikes casual
    },

    performance_preferences: {
      'stage_presence': 10,     // LOVES stage presence
      'crowd_interaction': 10,  // LOVES crowd work
      'charismatic': 9,         // LOVES charisma
      'theatrical': 8,          // Loves theatrics
      'dynamic_range': 8,       // Loves versatility
      'facial_expression': 7,   // Appreciates expression
      'strategic_pauses': 6,    // Appreciates timing
      'minimalist': -7,         // Dislikes understated
    },

    league_characteristic_preferences: {
      prefers_writing_focused: -0.6,      // Dislikes writing-focused
      prefers_performance_focused: +0.9,  // LOVES performance
      prefers_longer_rounds: +0.7,        // Prefers longer rounds (3-min)
      prefers_loud_crowds: +0.9,          // LOVES loud crowds
      prefers_intimate_venues: -0.8,      // Dislikes intimate venues
    },

    scoring_weights: {
      average_weight: 0.35,     // LESS weight on average (-0.05)
      peak_weight: 0.40,        // MORE weight on peaks (+0.05) - big moments matter
      crowd_weight: 0.25,       // Standard
      writing_emphasis: -0.10,  // LESS writing emphasis
      performance_emphasis: +0.10, // MORE performance emphasis
    },

    favors_underdogs: false,
    favors_veterans: false,
    anti_mainstream: false,
    loves_drama: true,
  },

  // 6. UNDERGROUND VOICE - Independent/Regional Scene Advocate
  underground_voice: {
    judge_id: 'underground_voice',
    judge_name: 'Underground Voice',
    outlet_name: 'Underground Voice',
    objectivity: 4,

    // Blogger assets (placeholders)
    logo_url: '/assets/judges/underground_voice_logo.png',
    profile_picture_url: '/assets/judges/underground_voice_profile.jpg',
    banner_url: '/assets/judges/underground_voice_banner.jpg',

    badge_biases: {
      // Loves underground grinders
      'Small Room Killer': 10,
      'Regional Talent': 10,
      'Consistent Grinder': 10,
      'Independent Hustle': 10,
      'Underground Legend': 10,
      'DIY Ethic': 9,
      'Battle Tested': 8,

      // HATES mainstream favoritism
      'Mainstream Favorite': -9,
      'Industry Plant': -10,
      'Sellout': -10,
      'Crossover Appeal': -7,
      'PPV Only': -8,
      'Social Media Created': -9,
    },

    content_preferences: {
      'personals': 8,           // Loves raw content
      'wordplay': 7,            // Appreciates craft
      'schemes': 6,             // Appreciates skill
      'punchlines': 7,          // Appreciates impact
      'street_talk': 8,         // Loves authenticity
      'freestyles': 6,          // Neutral
      'rebuttals': 7,           // Likes responsiveness
      'storytelling': 7,        // Appreciates narrative
      'gun_bars': 6,            // Neutral
      'shock_value': 4,         // Neutral
      'pop_culture_refs': 3,    // Neutral
      'name_flips': 6,          // Neutral
      'comedy': 5,              // Neutral
      'social_commentary': 8,   // Appreciates depth
    },

    delivery_preferences: {
      'aggressive': 7,          // Likes aggression
      'passionate': 8,          // Loves passion
      'smooth_flow': 6,         // Appreciates skill
      'conversational': 5,      // Neutral
      'staccato': 5,            // Neutral
      'speed_rapping': 4,       // Neutral
      'nonchalant': -3,         // Dislikes casual
    },

    performance_preferences: {
      'crowd_interaction': 7,   // Appreciates connection
      'stage_presence': 6,      // Appreciates command
      'charismatic': 6,         // Appreciates personality
      'dynamic_range': 5,       // Neutral
      'strategic_pauses': 4,    // Neutral
      'theatrical': 2,          // Neutral
      'facial_expression': 4,   // Neutral
      'minimalist': 3,          // Neutral
    },

    league_characteristic_preferences: {
      prefers_writing_focused: +0.5,      // Moderate writing preference
      prefers_performance_focused: +0.3,  // Moderate performance preference
      prefers_longer_rounds: 0,           // Neutral
      prefers_loud_crowds: -0.4,          // Prefers quieter crowds (anti-mainstream)
      prefers_intimate_venues: +0.7,      // Prefers intimate venues
    },

    scoring_weights: {
      average_weight: 0.40,     // Standard
      peak_weight: 0.35,        // Standard
      crowd_weight: 0.25,       // Standard
      writing_emphasis: +0.05,  // Slight writing emphasis
      performance_emphasis: -0.05, // Slight performance de-emphasis
    },

    favors_underdogs: true,    // Strongly favors underdogs
    favors_veterans: false,
    anti_mainstream: true,     // Very anti-mainstream
    loves_drama: false,
  },

  // 7. COAST TO COAST COVERAGE - Cynical Underdog Champion
  coast_to_coast_coverage: {
    judge_id: 'coast_to_coast_coverage',
    judge_name: 'Coast to Coast Coverage',
    outlet_name: 'Coast to Coast Coverage',
    objectivity: 5,

    // Blogger assets (placeholders)
    logo_url: '/assets/judges/coast_to_coast_coverage_logo.png',
    profile_picture_url: '/assets/judges/coast_to_coast_coverage_profile.jpg',
    banner_url: '/assets/judges/coast_to_coast_coverage_banner.jpg',

    badge_biases: {
      // Loves grinders and underdogs
      'Consistent Grinder': 10,
      'Underdog': 10,
      'Earned Respect': 10,
      'Battle Tested': 9,
      'Independent Hustle': 9,
      'Self-Made': 10,

      // HATES hype and clout
      'Viral Sensation': -10,
      'Social Media Created': -10,
      'Clout Chaser': -10,
      'Overhyped': -10,
      'Industry Favorite': -9,
      'Mainstream Darling': -9,
      'Name Value Only': -10,
    },

    content_preferences: {
      'personals': 8,           // Loves aggression
      'rebuttals': 9,           // LOVES call-outs
      'shock_value': 6,         // Likes bold moves
      'wordplay': 6,            // Neutral
      'schemes': 5,             // Neutral
      'punchlines': 7,          // Likes impact
      'street_talk': 7,         // Likes authenticity
      'freestyles': 5,          // Neutral
      'gun_bars': 5,            // Neutral
      'storytelling': 5,        // Neutral
      'pop_culture_refs': 2,    // Slightly negative
      'name_flips': 6,          // Neutral
      'comedy': 4,              // Neutral
      'social_commentary': 7,   // Likes calling out BS
    },

    delivery_preferences: {
      'aggressive': 9,          // LOVES aggression
      'passionate': 8,          // Loves intensity
      'staccato': 6,            // Likes impact
      'smooth_flow': 3,         // Neutral
      'conversational': 4,      // Neutral
      'speed_rapping': 4,       // Neutral
      'nonchalant': -5,         // Dislikes casual
    },

    performance_preferences: {
      'crowd_interaction': 6,   // Appreciates engagement
      'stage_presence': 7,      // Appreciates command
      'charismatic': 5,         // Neutral
      'dynamic_range': 5,       // Neutral
      'theatrical': 2,          // Neutral
      'strategic_pauses': 4,    // Neutral
      'facial_expression': 4,   // Neutral
      'minimalist': -2,         // Slightly negative
    },

    league_characteristic_preferences: {
      prefers_writing_focused: 0,         // Balanced writing/performance
      prefers_performance_focused: 0,     // Balanced
      prefers_longer_rounds: 0,           // Neutral
      prefers_loud_crowds: 0,             // Neutral
      prefers_intimate_venues: +0.3,      // Slight preference for intimate
    },

    scoring_weights: {
      average_weight: 0.40,     // Standard
      peak_weight: 0.35,        // Standard
      crowd_weight: 0.25,       // Standard
      writing_emphasis: 0,      // Balanced
      performance_emphasis: 0,  // Balanced
    },

    favors_underdogs: true,    // VERY strongly favors underdogs
    favors_veterans: false,
    anti_mainstream: true,     // VERY anti-mainstream
    loves_drama: true,
  },

  // 8. THE BATTLE BREAKDOWN - Technical Scorecard Analyst
  the_battle_breakdown: {
    judge_id: 'the_battle_breakdown',
    judge_name: 'The Battle Breakdown',
    outlet_name: 'The Battle Breakdown',
    objectivity: 9,

    // Blogger assets (placeholders)
    logo_url: '/assets/judges/the_battle_breakdown_logo.png',
    profile_picture_url: '/assets/judges/the_battle_breakdown_profile.jpg',
    banner_url: '/assets/judges/the_battle_breakdown_banner.jpg',

    badge_biases: {
      // Loves technical excellence
      'Technical Excellence': 9,
      'Consistent Performer': 9,
      'Complete Battler': 10,
      'All Tools': 9,
      'Pen Game Elite': 8,
      'Performance Beast': 8,
      'Clutch Performer': 7,

      // Dislikes one-dimensional and inconsistent
      'One-Dimensional': -8,
      'Inconsistent': -9,
      'Known Choker': -7,
      'Gimmick': -6,
    },

    content_preferences: {
      'wordplay': 8,            // Appreciates technical skill
      'schemes': 9,             // Appreciates complexity
      'punchlines': 8,          // Appreciates impact
      'storytelling': 7,        // Appreciates narrative
      'rebuttals': 8,           // Appreciates responsiveness
      'name_flips': 7,          // Appreciates cleverness
      'personals': 5,           // Neutral
      'freestyles': 4,          // Slightly negative - prep matters
      'gun_bars': 4,            // Neutral
      'street_talk': 4,         // Neutral
      'pop_culture_refs': 5,    // Neutral
      'shock_value': 2,         // Slightly negative
      'comedy': 6,              // Neutral-positive
      'social_commentary': 7,   // Appreciates depth
    },

    delivery_preferences: {
      'smooth_flow': 8,         // Appreciates clean delivery
      'conversational': 6,      // Appreciates natural
      'staccato': 6,            // Appreciates variety
      'passionate': 6,          // Neutral
      'aggressive': 5,          // Neutral
      'speed_rapping': 5,       // Neutral
      'nonchalant': 2,          // Slightly negative
    },

    performance_preferences: {
      'stage_presence': 8,      // Appreciates command
      'dynamic_range': 9,       // LOVES versatility
      'strategic_pauses': 8,    // Appreciates control
      'charismatic': 7,         // Appreciates personality
      'crowd_interaction': 6,   // Neutral
      'theatrical': 5,          // Neutral
      'facial_expression': 6,   // Neutral
      'minimalist': 4,          // Neutral
    },

    league_characteristic_preferences: {
      prefers_writing_focused: 0,         // Perfectly balanced
      prefers_performance_focused: 0,     // Perfectly balanced
      prefers_longer_rounds: 0,           // Neutral
      prefers_loud_crowds: 0,             // Neutral
      prefers_intimate_venues: 0,         // Neutral
    },

    scoring_weights: {
      average_weight: 0.40,     // Standard - most objective
      peak_weight: 0.35,        // Standard
      crowd_weight: 0.25,       // Standard
      writing_emphasis: 0,      // Perfectly balanced
      performance_emphasis: 0,  // Perfectly balanced
    },

    favors_underdogs: false,
    favors_veterans: false,
    anti_mainstream: false,
    loves_drama: false,
  },

};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all judge profiles as an array
 */
export function getAllJudges(): JudgeProfile[] {
  return Object.values(JUDGE_PROFILES);
}

/**
 * Get judge profile by ID
 */
export function getJudgeProfile(judgeId: string): JudgeProfile | null {
  return JUDGE_PROFILES[judgeId] || null;
}

/**
 * Get diverse panel of judges (for tournament assignment)
 * Ensures variety in objectivity, biases, and preferences
 */
export function selectDiverseJudgePanel(count: number = 3): JudgeProfile[] {
  const allJudges = getAllJudges();

  // Sort judges by objectivity to ensure variety
  const sortedByObjectivity = [...allJudges].sort((a, b) => a.objectivity - b.objectivity);

  const panel: JudgeProfile[] = [];

  // Strategy: Pick judges with different objectivity levels
  // Low objectivity (3-4), Mid objectivity (5-7), High objectivity (8-9)
  const lowObjectivity = sortedByObjectivity.filter(j => j.objectivity <= 4);
  const midObjectivity = sortedByObjectivity.filter(j => j.objectivity >= 5 && j.objectivity <= 7);
  const highObjectivity = sortedByObjectivity.filter(j => j.objectivity >= 8);

  // Pick one from each tier if possible
  if (count === 3) {
    if (lowObjectivity.length > 0) {
      panel.push(lowObjectivity[Math.floor(Math.random() * lowObjectivity.length)]);
    }
    if (midObjectivity.length > 0) {
      panel.push(midObjectivity[Math.floor(Math.random() * midObjectivity.length)]);
    }
    if (highObjectivity.length > 0) {
      panel.push(highObjectivity[Math.floor(Math.random() * highObjectivity.length)]);
    }
  } else {
    // Fallback: random selection
    const shuffled = allJudges.sort(() => Math.random() - 0.5);
    panel.push(...shuffled.slice(0, count));
  }

  return panel;
}

/**
 * Calculate badge bias score for a battler from a judge's perspective
 * Returns a score modifier (-1.0 to +1.0)
 */
export function calculateBadgeBiasScore(
  battlerBadges: string[],
  judge: JudgeProfile
): number {
  if (!battlerBadges || battlerBadges.length === 0) {
    return 0;
  }

  let totalBias = 0;
  let count = 0;

  for (const badge of battlerBadges) {
    if (judge.badge_biases[badge] !== undefined) {
      totalBias += judge.badge_biases[badge];
      count++;
    }
  }

  if (count === 0) {
    return 0;
  }

  // Average bias, normalized to -1.0 to +1.0
  const averageBias = totalBias / count;
  return Math.max(-1.0, Math.min(1.0, averageBias / 10));
}

/**
 * Calculate content preference score for segment content
 * Returns a score modifier (-1.0 to +1.0)
 */
export function calculateContentPreferenceScore(
  primaryContent: ContentType,
  secondaryContent: ContentType | null,
  delivery: DeliveryType,
  performance: PerformanceType,
  judge: JudgeProfile
): number {
  let score = 0;
  let count = 0;

  // Primary content (weighted double)
  if (judge.content_preferences[primaryContent] !== undefined) {
    score += judge.content_preferences[primaryContent] * 2;
    count += 2;
  }

  // Secondary content
  if (secondaryContent && judge.content_preferences[secondaryContent] !== undefined) {
    score += judge.content_preferences[secondaryContent];
    count++;
  }

  // Delivery
  if (judge.delivery_preferences[delivery] !== undefined) {
    score += judge.delivery_preferences[delivery];
    count++;
  }

  // Performance
  if (judge.performance_preferences[performance] !== undefined) {
    score += judge.performance_preferences[performance];
    count++;
  }

  if (count === 0) {
    return 0;
  }

  // Average preference, normalized to -1.0 to +1.0
  const averagePreference = score / count;
  return Math.max(-1.0, Math.min(1.0, averagePreference / 10));
}
