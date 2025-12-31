/**
 * Human-readable badge descriptions and tooltips
 * Maps badge codes to player-friendly explanations
 */

export interface BadgeDescription {
  name: string;
  category: 'writing' | 'performance' | 'content' | 'delivery' | 'reputation_positive' | 'reputation_negative';
  description: string;
  effects: string[]; // Human-readable effect descriptions
  tier?: 'bronze' | 'silver' | 'gold';
}

export const BADGE_DESCRIPTIONS: Record<string, BadgeDescription> = {
  // ==========================================
  // WRITING BADGES
  // ==========================================

  'wordplay': {
    name: 'Wordplay Master',
    category: 'writing',
    description: 'Your double entendres and punchlines hit different',
    effects: [
      'Wordplay attribute +30%',
      'Writing prep 10% more effective'
    ],
    tier: 'bronze'
  },

  'pen_game_elite': {
    name: 'Pen Game Elite',
    category: 'writing',
    description: 'Your writing ability is elite tier, but complexity can lose crowds',
    effects: [
      'Lyricism +25% (reduced from +40% for balance)',
      'Writing prep 30% more effective',
      'Crowd Reaction -10% (technical bars go over heads)',
      'Synergy with Scheme King'
    ],
    tier: 'gold'
  },

  'scheme_king': {
    name: 'Scheme King',
    category: 'writing',
    description: 'Complex multi-bar schemes are your specialty',
    effects: [
      'Creativity +35%',
      'Writing prep 25% more effective',
      'Synergy with Pen Game Elite'
    ],
    tier: 'gold'
  },

  'multisyllabic_master': {
    name: 'Multisyllabic Master',
    category: 'writing',
    description: 'You flex with complex vocabulary',
    effects: [
      'Lyricism +25%',
      'Wordplay +20%'
    ],
    tier: 'silver'
  },

  'metaphor_magician': {
    name: 'Metaphor Magician',
    category: 'writing',
    description: 'Your extended metaphors paint vivid pictures',
    effects: [
      'Creativity +30%',
      'Crowd reaction +10 in Small Room'
    ],
    tier: 'silver'
  },

  // ==========================================
  // PERFORMANCE BADGES
  // ==========================================

  'stage_presence': {
    name: 'Commanding Presence',
    category: 'performance',
    description: 'You own the stage',
    effects: [
      'Stage Presence +30%',
      'Performance prep 10% more effective'
    ],
    tier: 'bronze'
  },

  'crowd_control': {
    name: 'Crowd Control Expert',
    category: 'performance',
    description: 'You know how to work the crowd',
    effects: [
      'Crowd Control +30%',
      'Base crowd reaction +8',
      'Performance prep 10% more effective'
    ],
    tier: 'bronze'
  },

  'performance_beast': {
    name: 'Performance Beast',
    category: 'performance',
    description: 'Your energy on stage is unmatched',
    effects: [
      'Stage Presence +40%',
      'Delivery +30%',
      'Performance prep 30% more effective',
      '+12% bonus on Main Stage'
    ],
    tier: 'gold'
  },

  'main_stage_specialist': {
    name: 'Main Stage Specialist',
    category: 'performance',
    description: 'You thrive in big-room settings',
    effects: [
      'Performance +20% on Main Stage',
      'Crowd reaction +15 on Main Stage',
      'Synergy with Performance Beast'
    ],
    tier: 'silver'
  },

  'small_room_killer': {
    name: 'Small Room Killer',
    category: 'performance',
    description: 'Intimate settings bring out your best',
    effects: [
      'Writing +15% in Small Room',
      'Crowd reaction +10 in Small Room',
      'Synergy with Technical Writer'
    ],
    tier: 'silver'
  },

  // ==========================================
  // CONTENT BADGES
  // ==========================================

  'personal_attack_specialist': {
    name: 'Personal Attack Specialist',
    category: 'content',
    description: 'You go for the jugular but polarize audiences (like Dizaster)',
    effects: [
      'Research prep 25% more effective (reduced from 30%)',
      '+15% bonus when using discovered secrets',
      'Crowd reaction +15% (controversial moments draw attention)',
      'Reputation -1 per battle (polarizing like Dizaster)',
      'Risk of "Drama Starter" badge'
    ],
    tier: 'silver'
  },

  'angle_master': {
    name: 'Angle Master',
    category: 'content',
    description: 'Your angles cut deep but can be overly analytical',
    effects: [
      'Research prep 35% more effective (reduced from 40%)',
      'Creativity +20% (reduced from 25%)',
      'Crowd entertainment -10% (technical/analytical style)',
      'Versatility -15% (pigeonholed as "the angle guy")',
      'Synergy with Personal Attack Specialist'
    ],
    tier: 'gold'
  },

  'punchline_heavy': {
    name: 'Punchline Heavy',
    category: 'content',
    description: 'Every bar is designed to land hard',
    effects: [
      'Peak segments +15%',
      'Wordplay +20%',
      'Segment variance +20% (high peaks, low valleys)'
    ],
    tier: 'silver'
  },

  'storyteller': {
    name: 'Master Storyteller',
    category: 'content',
    description: 'You craft compelling narratives in your rounds',
    effects: [
      'Creativity +30%',
      'Consistency +15%',
      'Crowd reaction +10'
    ],
    tier: 'silver'
  },

  // ==========================================
  // DELIVERY BADGES
  // ==========================================

  'aggressive': {
    name: 'Aggressive Battler',
    category: 'delivery',
    description: 'You bring intensity and aggression',
    effects: [
      'Delivery +25%',
      'Stage Presence +15%',
      'Crowd reaction +10 on Main Stage'
    ],
    tier: 'bronze'
  },

  'smooth_flow': {
    name: 'Smooth Flow',
    category: 'delivery',
    description: 'Your flow is butter',
    effects: [
      'Flow +30%',
      'Delivery +20%',
      'Consistency +10%'
    ],
    tier: 'silver'
  },

  'speed_rapper': {
    name: 'Speed Rapper',
    category: 'delivery',
    description: 'You can spit fast without losing clarity',
    effects: [
      'Delivery +25%',
      'Flow +20%',
      'Peak segments +10%'
    ],
    tier: 'bronze'
  },

  'animated': {
    name: 'Animated Performer',
    category: 'delivery',
    description: 'Your facial expressions and movements enhance your bars',
    effects: [
      'Stage Presence +20%',
      'Crowd reaction +12',
      'Performance prep 15% more effective'
    ],
    tier: 'bronze'
  },

  // ==========================================
  // FREESTYLE/IMPROVISATION
  // ==========================================

  'freestyle': {
    name: 'Freestyle Genius',
    category: 'delivery',
    description: 'You improvise brilliantly and can recover from any situation',
    effects: [
      'Creativity +30%',
      'Research prep +20% (you prep scenarios, not bars)',
      'Choke chance -25% (freestyle is your safety net)',
      'Rebuttal effectiveness +30%',
      'Segment variance +50% (unpredictable highs and lows)'
    ],
    tier: 'gold'
  },

  'off_the_top': {
    name: 'Off the Top',
    category: 'delivery',
    description: 'You can freestyle on the spot',
    effects: [
      'Creativity +20%',
      'Choke chance -2%',
      'Synergy with Freestyle Genius'
    ],
    tier: 'silver'
  },

  'unpredictable': {
    name: 'Unpredictable',
    category: 'delivery',
    description: 'No one knows what you\'ll say next, including you',
    effects: [
      'Segment variance +30%',
      'Peak segments +10%',
      'Consistency -10%'
    ],
    tier: 'bronze'
  },

  // ==========================================
  // TECHNICAL/PREPARATION
  // ==========================================

  'technical_writer': {
    name: 'Technical Writer',
    category: 'writing',
    description: 'You craft intricate, well-structured rounds through heavy preparation',
    effects: [
      'Writing prep 35% more effective (reduced from 45%)',
      'Lyricism +25% (reduced from 35%)',
      'Stage Presence -10% (prep-focused, not performance-focused)',
      '+12% bonus with 8+ prep days',
      'Synergy with Pen Game Elite, Scheme King'
    ],
    tier: 'gold'
  },

  'prepared_battler': {
    name: 'Prepared Battler',
    category: 'writing',
    description: 'You do your homework and it shows',
    effects: [
      'All prep types 15% more effective',
      'Choke chance -3%',
      'Consistency +15%'
    ],
    tier: 'silver'
  },

  'overprepared': {
    name: 'Overprepared',
    category: 'writing',
    description: 'Sometimes you prepare TOO much',
    effects: [
      'Writing prep 20% more effective',
      'Resilience -15% (anxiety from overpreparing)',
      'Choke chance +2% (ironically)'
    ],
    tier: 'bronze'
  },

  // ==========================================
  // POSITIVE REPUTATION BADGES
  // ==========================================

  'respected_veteran': {
    name: 'Respected Veteran',
    category: 'reputation_positive',
    description: 'You\'ve earned respect in the culture',
    effects: [
      'Reputation +2',
      'Crowd reaction +10',
      'Easier to unlock career opportunities'
    ],
    tier: 'gold'
  },

  'crowd_favorite': {
    name: 'Crowd Favorite',
    category: 'reputation_positive',
    description: 'The people love you',
    effects: [
      'Crowd reaction +15',
      'Public knowledge +10',
      'More viral moment events'
    ],
    tier: 'silver'
  },

  'viral_sensation': {
    name: 'Viral Sensation',
    category: 'reputation_positive',
    description: 'Your moments blow up on social media',
    effects: [
      'Public knowledge +20',
      'Peak segments more likely to go viral',
      'More media opportunities'
    ],
    tier: 'silver'
  },

  'consistent_performer': {
    name: 'Consistent Performer',
    category: 'reputation_positive',
    description: 'You show up and deliver every time',
    effects: [
      'Consistency +20%',
      'Choke chance -4%',
      'Resilience +1'
    ],
    tier: 'silver'
  },

  'clutch_performer': {
    name: 'Clutch Performer',
    category: 'reputation_positive',
    description: 'You perform best under pressure',
    effects: [
      'High stress (60+) gives +10% instead of penalty',
      'Choke chance -5%',
      'Peak segments +15% in close battles'
    ],
    tier: 'gold'
  },

  // ==========================================
  // NEGATIVE REPUTATION BADGES
  // ==========================================

  'choker': {
    name: 'Known Choker',
    category: 'reputation_negative',
    description: 'You have a reputation for forgetting your bars',
    effects: [
      'Choke chance +8%',
      'Reputation -2',
      'Can be removed with 5 clean battles'
    ],
    tier: 'bronze'
  },

  'unreliable': {
    name: 'Unreliable',
    category: 'reputation_negative',
    description: 'You\'ve cancelled battles or no-showed',
    effects: [
      'Reputation -2',
      'No-show risk +12% (reduced from 20% based on research)',
      'Battle offers -40% (leagues blacklist)',
      'Financial penalty on no-show (-2 Financial Stability)',
      'Opponents less likely to accept',
      'Can be removed with 5 consecutive completions'
    ],
    tier: 'bronze'
  },

  'controversial': {
    name: 'Controversial',
    category: 'reputation_negative',
    description: 'You attract drama but also attention (Daylyt validated)',
    effects: [
      'Creativity +20% (IF backed by skill)',
      'Crowd reaction +15%',
      'Reputation -1 (reduced from -1.5)',
      'Media attention +40%',
      'Battle viewership +30%',
      'More life events triggered'
    ],
    tier: 'bronze'
  },

  'drama_starter': {
    name: 'Drama Starter',
    category: 'reputation_negative',
    description: 'Beef follows you (Math Hoffa got 3-year ban)',
    effects: [
      'Reputation -2',
      'Battle offers -30% (leagues avoid booking)',
      'Beef events more frequent',
      'Stress accumulation +20%',
      'Public knowledge +10',
      'Can be removed with 5 drama-free battles'
    ],
    tier: 'bronze'
  },

  'social_media_created': {
    name: 'Social Media Created',
    category: 'reputation_negative',
    description: 'Real battlers think you\'re all hype',
    effects: [
      'Reputation -1',
      'Crowd reaction +10 (casual fans)',
      'Respect from veterans -15%'
    ],
    tier: 'bronze'
  },

  // ==========================================
  // NEGATIVE WRITING BADGES (NEW)
  // ==========================================

  'recycler': {
    name: 'Recycler',
    category: 'writing',
    description: 'You reuse old material instead of writing fresh content',
    effects: [
      'Creativity -30%',
      'Writing prep 20% less effective',
      'Crowd reaction -10',
      'Risk of being called out for recycled bars'
    ],
    tier: 'bronze'
  },

  'biter': {
    name: 'Biter',
    category: 'writing',
    description: 'You steal lines from other battlers',
    effects: [
      'Creativity -40%',
      'Reputation -2',
      'Crowd reaction -15 (if caught)',
      'Risk of public callouts and scandal',
      'Can be removed after original material streak'
    ],
    tier: 'bronze'
  },

  'reach_god': {
    name: 'Reach God',
    category: 'writing',
    description: 'Your forced wordplay and stretches don\'t land',
    effects: [
      'Wordplay -30%',
      'Crowd reaction -8',
      'Peak segments -10%',
      'Writing looks clever on paper but falls flat'
    ],
    tier: 'bronze'
  },

  'one_trick_pony': {
    name: 'One-Trick Pony',
    category: 'writing',
    description: 'Limited versatility in style and content',
    effects: [
      'Creativity -25%',
      'Consistency +10% (predictably same style)',
      'Opponents can prep specifically for your style',
      'Long-term career ceiling limited'
    ],
    tier: 'bronze'
  },

  'filler_abuser': {
    name: 'Filler Abuser',
    category: 'writing',
    description: 'Uses unnecessary content to pad time',
    effects: [
      'Lyricism -20%',
      'Average score -15%',
      'Crowd reaction -10',
      'Peak moments diluted by filler'
    ],
    tier: 'bronze'
  },

  'outdated_referencer': {
    name: 'Outdated Referencer',
    category: 'writing',
    description: 'Stuck in the past with old pop culture references',
    effects: [
      'Creativity -15%',
      'Crowd reaction -12 (younger audiences)',
      'Research prep 20% less effective',
      'Veteran audiences may appreciate it slightly'
    ],
    tier: 'bronze'
  },

  'lazy_writer': {
    name: 'Lazy Writer',
    category: 'writing',
    description: 'Doesn\'t put in the work, relies on half-baked material',
    effects: [
      'Writing prep 40% less effective',
      'Lyricism -20%',
      'Consistency -15%',
      'Choke chance +3% (underprepared)'
    ],
    tier: 'bronze'
  },

  'predictable': {
    name: 'Predictable',
    category: 'writing',
    description: 'Same style, same structures, opponents see it coming',
    effects: [
      'Creativity -25%',
      'Opponents get +10% prep advantage',
      'Consistency +10% (predictably same)',
      'Long-term career ceiling limited'
    ],
    tier: 'bronze'
  },

  'redundant': {
    name: 'Redundant',
    category: 'writing',
    description: 'Says the same thing five different ways to pad time',
    effects: [
      'Average score -20%',
      'Crowd reaction -10',
      'Peak moments diluted',
      'Writing effectiveness -15%'
    ],
    tier: 'bronze'
  },

  'overcomplicated': {
    name: 'Overcomplicated',
    category: 'writing',
    description: 'So complex nobody understands your bars',
    effects: [
      'Lyricism +10% (technically skilled)',
      'Crowd reaction -18 (goes over heads)',
      'Delivery -10% (hard to perform)',
      'Works better on paper than in battle'
    ],
    tier: 'silver'
  },

  'cliche_abuser': {
    name: 'Cliche Abuser',
    category: 'writing',
    description: 'Uses tired metaphors and overused comparisons',
    effects: [
      'Creativity -30%',
      'Wordplay -15%',
      'Crowd reaction -8',
      'Veteran audiences especially notice'
    ],
    tier: 'bronze'
  },

  'name_flip_dependent': {
    name: 'Name Flip Dependent',
    category: 'writing',
    description: 'Relies too heavily on opponent name flips',
    effects: [
      'Wordplay +10% (name flips technically count)',
      'Creativity -25%',
      'Crowd reaction -12 (gimmicky)',
      'Struggles against opponents with difficult names'
    ],
    tier: 'bronze'
  },

  // ==========================================
  // CONTENT STYLE BADGES (NEW)
  // ==========================================

  'comedian': {
    name: 'Comedian',
    category: 'content',
    description: 'Uses humor and wit to win crowds',
    effects: [
      'Crowd Control +30%',
      'Crowd reaction +10',
      'Creativity +20%',
      'Delivery +15% (timing is everything)',
      'May struggle to be taken seriously'
    ],
    tier: 'silver'
  },

  'braggadocious': {
    name: 'Braggadocious',
    category: 'content',
    description: 'Flexing and boasting is your default mode',
    effects: [
      'Stage Presence +20%',
      'Crowd Control +15%',
      'Delivery +10%',
      'Can feel repetitive without substance'
    ],
    tier: 'bronze'
  },

  'gritty': {
    name: 'Gritty',
    category: 'content',
    description: 'Raw, street-authentic style that keeps it real',
    effects: [
      'Delivery +20%',
      'Stage Presence +15%',
      '+8% bonus in Small Room',
      'Authenticity resonates with core audience'
    ],
    tier: 'silver'
  },

  'political_commentary': {
    name: 'Political Commentary',
    category: 'content',
    description: 'Uses topical angles and social commentary',
    effects: [
      'Creativity +25%',
      'Research prep +20% more effective',
      'Crowd reaction +15% (polarizing)',
      'Reputation +/-1 depending on audience',
      'Material dates quickly'
    ],
    tier: 'silver'
  },

  'shock_value': {
    name: 'Shock Value',
    category: 'content',
    description: 'Controversial content designed to provoke',
    effects: [
      'Crowd reaction +20%',
      'Peak segments +15%',
      'Reputation -1',
      'Media attention +50%',
      'Risk of crossing lines and backlash'
    ],
    tier: 'bronze'
  },

  'enhanced_storyteller': {
    name: 'Enhanced Storyteller',
    category: 'content',
    description: 'Masterful narrative arcs that captivate audiences',
    effects: [
      'Creativity +35%',
      'Lyricism +25%',
      'Consistency +20%',
      'Crowd reaction +15',
      '+10% bonus in Small Room',
      'Synergy with Technical Writer'
    ],
    tier: 'gold'
  },

  // ==========================================
  // NEGATIVE PERFORMANCE BADGES (NEW)
  // ==========================================

  'mumbler': {
    name: 'Mumbler',
    category: 'performance',
    description: 'Nobody can hear what you\'re saying',
    effects: [
      'Delivery -30%',
      'Crowd reaction -12',
      'Peak segments -15%',
      'Great bars go completely unheard'
    ],
    tier: 'bronze'
  },

  'monotone_deliverer': {
    name: 'Monotone Deliverer',
    category: 'performance',
    description: 'Lacks vocal variation and energy',
    effects: [
      'Delivery -25%',
      'Performance prep 20% less effective',
      'Crowd reaction -8',
      'Even good writing sounds flat'
    ],
    tier: 'bronze'
  },

  'poor_breath_control': {
    name: 'Poor Breath Control',
    category: 'performance',
    description: 'Stamina issues affect delivery quality',
    effects: [
      'Delivery -20%',
      'Performance prep 25% less effective',
      'Consistency -15%',
      'Gets worse in later rounds',
      'Long rounds are especially difficult'
    ],
    tier: 'bronze'
  },

  'energy_drainer': {
    name: 'Energy Drainer',
    category: 'performance',
    description: 'Your presence kills crowd energy',
    effects: [
      'Crowd Control -30%',
      'Crowd reaction -15',
      'Stage Presence -20%',
      'Hard to recover momentum'
    ],
    tier: 'bronze'
  },

  // ==========================================
  // SPECIALIZED REPUTATION BADGES (NEW)
  // ==========================================

  'consummate_professional': {
    name: 'Consummate Professional',
    category: 'reputation_positive',
    description: 'Always shows up prepared and ready',
    effects: [
      'All prep types +15% more effective',
      'Choke chance -4%',
      'Reputation +2',
      'Battle offers +25%',
      'Leagues trust you with big bookings'
    ],
    tier: 'gold'
  },

  'clout_chaser': {
    name: 'Clout Chaser',
    category: 'reputation_negative',
    description: 'In it for fame, not the culture',
    effects: [
      'Public knowledge +15',
      'Reputation -1',
      'Media attention +30%',
      'Veterans respect -20%',
      'Focus on viral moments over substance'
    ],
    tier: 'bronze'
  },

  'fallen_star': {
    name: 'Fallen Star',
    category: 'reputation_negative',
    description: 'Was once elite, now declining',
    effects: [
      'All attributes -10%',
      'Reputation -2',
      'Public knowledge still high (people remember your peak)',
      'Media focuses on your decline',
      'Can trigger comeback redemption arc'
    ],
    tier: 'silver'
  },

  'career_plateaued': {
    name: 'Career Plateaued',
    category: 'reputation_negative',
    description: 'Stuck at the same level for years',
    effects: [
      'Battle offers -20%',
      'Reputation gains 50% less effective',
      'Consistency +10% (predictable level)',
      'Media attention -30%',
      'Harder to get big bookings'
    ],
    tier: 'bronze'
  },

  'disrespectful': {
    name: 'Disrespectful',
    category: 'reputation_negative',
    description: 'Rude to the culture, opponents, and leagues',
    effects: [
      'Reputation -2',
      'Battle offers -30%',
      'Beef events +40%',
      'Veterans dislike you',
      'Can get blacklisted from leagues'
    ],
    tier: 'bronze'
  },

  'known_stealer': {
    name: 'Known Stealer',
    category: 'reputation_negative',
    description: 'Steals deposits and doesn\'t honor commitments (like Geechi)',
    effects: [
      'Reputation -3',
      'Financial Stability +2 (you keep the money)',
      'Leagues require full payment upfront',
      'Battle offers -50%',
      'Trust destroyed, hard to rebuild'
    ],
    tier: 'silver'
  },

  'health_issues': {
    name: 'Health Issues',
    category: 'reputation_negative',
    description: 'Known for getting sick during battles (like Chess)',
    effects: [
      'Choke chance +5%',
      'Consistency -20%',
      'Battle completion -15%',
      'Resilience -2',
      'Leagues hesitant to book you'
    ],
    tier: 'bronze'
  },

  'jail_risk': {
    name: 'Jail Risk',
    category: 'reputation_negative',
    description: 'Criminal record means you could disappear anytime (like Tsu Surf)',
    effects: [
      'Reputation -2',
      'Battle offers -25%',
      'Risk of career interruption (months to years)',
      'Stress +20%',
      'Can trigger jail time event'
    ],
    tier: 'silver'
  },

  'substance_issues': {
    name: 'Substance Issues',
    category: 'reputation_negative',
    description: 'Known struggles with drugs or alcohol',
    effects: [
      'Reputation -2',
      'Resilience -2',
      'Choke chance +6%',
      'Financial Stability -2',
      'Can trigger rehab/recovery events',
      'Redemption arc possible'
    ],
    tier: 'silver'
  },

  'financial_struggles': {
    name: 'Financial Struggles',
    category: 'reputation_negative',
    description: 'Always broke, desperate for payouts',
    effects: [
      'Financial Stability -3',
      'More likely to accept bad matchups',
      'Stress +15%',
      'Can\'t afford to turn down battles',
      'Motivation affected by money pressure'
    ],
    tier: 'bronze'
  },

  'bitter_veteran': {
    name: 'Bitter Veteran',
    category: 'reputation_negative',
    description: 'Resentful of new battlers and culture changes',
    effects: [
      'Reputation -1',
      'Media attention -20%',
      'Crowd reaction -10 (negativity shows)',
      'Beef events with younger battlers',
      'Veteran respect +10% (they relate)'
    ],
    tier: 'bronze'
  },

  'backstabber': {
    name: 'Backstabber',
    category: 'reputation_negative',
    description: 'Betrays allies, teams, and friends',
    effects: [
      'Reputation -3',
      'Beef events +50%',
      'No team battle opportunities',
      'Trust issues with all battlers',
      'Harder to form alliances'
    ],
    tier: 'silver'
  },

  'washed': {
    name: 'Washed',
    category: 'reputation_negative',
    description: 'Past your prime, everyone knows it',
    effects: [
      'All attributes -15%',
      'Reputation -2',
      'Battle offers -40%',
      'Media portrays you as past your prime',
      'Can only fight other washed battlers'
    ],
    tier: 'silver'
  },

  'weak_chin': {
    name: 'Weak Chin',
    category: 'reputation_negative',
    description: 'Can\'t handle getting hit with bars, visibly shook',
    effects: [
      'Resilience -2',
      'Momentum loss +25%',
      'Opponent confidence boost +15%',
      'Crowd reaction -8',
      'Choke chance +4% when losing'
    ],
    tier: 'bronze'
  },

  'culture_vulture': {
    name: 'Culture Vulture',
    category: 'reputation_negative',
    description: 'Outsider trying to profit from battle rap culture',
    effects: [
      'Reputation -2',
      'Veterans respect -30%',
      'Crowd reaction -12',
      'Media attention +20% (controversy)',
      'Authenticity questioned constantly'
    ],
    tier: 'bronze'
  },

  'glory_days_living': {
    name: 'Living in Glory Days',
    category: 'reputation_negative',
    description: 'Won\'t stop talking about past achievements',
    effects: [
      'Creativity -20% (relives old material)',
      'Crowd reaction -10 (heard it before)',
      'Reputation -1',
      'Public knowledge +10 (name recognition)',
      'Hard to evolve or adapt style'
    ],
    tier: 'bronze'
  },

  // ==========================================
  // TRU FOE BADGES (NEW)
  // ==========================================

  'stiff_body_language': {
    name: 'Stiff Body Language',
    category: 'performance',
    description: 'Lacks physical expression or movement',
    effects: [
      'Stage Presence -15%',
      'Delivery -10%',
      'Crowd reaction -5',
      'Performance looks stiff and unnatural'
    ],
    tier: 'bronze'
  },

  'consistent_grinder': {
    name: 'Consistent Grinder',
    category: 'reputation_positive',
    description: 'Constantly battles and stays sharp',
    effects: [
      'Consistency +15%',
      'Preparation +1',
      'All prep types +10% effective',
      'Never gets rusty'
    ],
    tier: 'silver'
  },

  'believable_persona': {
    name: 'Believable Persona',
    category: 'reputation_positive',
    description: 'Authentic in every aspect of delivery',
    effects: [
      'Crowd reaction +12',
      'Reputation +1',
      'Authenticity resonates with audience',
      'Personal angles land harder'
    ],
    tier: 'gold'
  },

  'battle_of_the_night_winner': {
    name: 'Battle of the Night Winner',
    category: 'reputation_positive',
    description: 'Consistently has the most memorable performance',
    effects: [
      'Peak segments +20%',
      'Public knowledge +15',
      'Reputation +2',
      'Media attention +40%'
    ],
    tier: 'gold'
  }
};

/**
 * Detect battler archetype based on badge collection
 */
export function detectArchetype(badges: string[]): {
  archetype: string;
  description: string;
  playstyle: string;
} {
  const badgeSet = new Set(badges);

  // Technical Writer: Pen-focused, high prep
  if (badgeSet.has('technical_writer') ||
      (badgeSet.has('pen_game_elite') && badgeSet.has('scheme_king'))) {
    return {
      archetype: 'Technical Writer',
      description: 'Crafts intricate, well-structured rounds through extensive preparation',
      playstyle: 'Maximize writing prep, 8+ days ideal. Excels in Small Room Circuit.'
    };
  }

  // Freestyler: Off the top, minimal prep
  if (badgeSet.has('freestyle') || badgeSet.has('off_the_top')) {
    return {
      archetype: 'Freestyler',
      description: 'Improvises brilliant moments with minimal preparation',
      playstyle: 'Keep prep low (≤3 days). Unpredictable but can have off nights.'
    };
  }

  // Performance Beast: Stage-focused, crowd work
  if (badgeSet.has('performance_beast') || badgeSet.has('main_stage_specialist')) {
    return {
      archetype: 'Performance Beast',
      description: 'Dominates through energy, presence, and crowd control',
      playstyle: 'Focus on performance prep. Thrives on Main Stage Arena.'
    };
  }

  // Angle Master: Research-heavy, personal attacks
  if (badgeSet.has('angle_master') || badgeSet.has('personal_attack_specialist')) {
    return {
      archetype: 'Angle Master',
      description: 'Uses research and personal angles to dismantle opponents',
      playstyle: 'Invest in research prep. Discovers and uses opponent secrets.'
    };
  }

  // Punchline Heavy: Peak moments, inconsistent
  if (badgeSet.has('punchline_heavy') || badgeSet.has('unpredictable')) {
    return {
      archetype: 'Haymaker Artist',
      description: 'Creates viral moments but lacks consistency',
      playstyle: 'Swings for the fences. High variance, can win or lose badly.'
    };
  }

  // Consistent Grinder: Reliable, prepared
  if (badgeSet.has('consistent_performer') || badgeSet.has('prepared_battler') || badgeSet.has('consistent_grinder')) {
    return {
      archetype: 'Consistent Grinder',
      description: 'Shows up and delivers solid performances every time',
      playstyle: 'Balanced prep. Rarely chokes, rarely has huge moments.'
    };
  }

  // Crowd Favorite: Viral, public presence
  if (badgeSet.has('crowd_favorite') || badgeSet.has('viral_sensation')) {
    return {
      archetype: 'Viral Star',
      description: 'Builds huge public following through viral moments',
      playstyle: 'High public knowledge. Popular but may lack veteran respect.'
    };
  }

  // Comedian: Humor-focused entertainer (NEW)
  if (badgeSet.has('comedian') || (badgeSet.has('comedy') && badgeSet.has('crowd_control'))) {
    return {
      archetype: 'Comedian',
      description: 'Uses humor and wit to win over crowds',
      playstyle: 'Focus on crowd control. Balance comedy with substance to be taken seriously.'
    };
  }

  // Storyteller: Narrative master (NEW)
  if (badgeSet.has('enhanced_storyteller') || badgeSet.has('storyteller')) {
    return {
      archetype: 'Storyteller',
      description: 'Crafts compelling narrative arcs that captivate audiences',
      playstyle: 'Maximize creativity and consistency. Excels in Small Room settings.'
    };
  }

  // Professional: Reliable veteran (NEW)
  if (badgeSet.has('consummate_professional') || badgeSet.has('respected_veteran')) {
    return {
      archetype: 'Consummate Professional',
      description: 'Reliable veteran who always shows up prepared',
      playstyle: 'Consistent prep across all types. Low choke risk, trusted by leagues.'
    };
  }

  // Controversial: Polarizing figure (NEW)
  if (badgeSet.has('shock_value') || badgeSet.has('controversial') || badgeSet.has('clout_chaser')) {
    return {
      archetype: 'Controversial Figure',
      description: 'Polarizing battler who draws attention through controversy',
      playstyle: 'High risk, high reward. Media attention but reputation suffers.'
    };
  }

  // Default: Balanced Battler
  return {
    archetype: 'Balanced Battler',
    description: 'Well-rounded with no specific specialization yet',
    playstyle: 'Experiment with different prep patterns to find your style.'
  };
}

/**
 * Get badge synergies for display
 */
export function getBadgeSynergies(badges: string[]): string[] {
  const synergies: string[] = [];
  const badgeSet = new Set(badges);

  const synergyGroups = [
    {
      badges: ['pen_game_elite', 'scheme_king'],
      name: 'Elite Writing Synergy',
      bonus: '+5% to all writing attributes'
    },
    {
      badges: ['technical_writer', 'pen_game_elite'],
      name: 'Technical Excellence',
      bonus: '+5% writing prep effectiveness'
    },
    {
      badges: ['freestyle', 'off_the_top'],
      name: 'Improvisation Master',
      bonus: '+5% creativity and low-prep bonus'
    },
    {
      badges: ['performance_beast', 'main_stage_specialist'],
      name: 'Stage Domination',
      bonus: '+5% on Main Stage performance'
    },
    {
      badges: ['angle_master', 'personal_attack_specialist'],
      name: 'Angle Warfare',
      bonus: '+5% research effectiveness'
    },
    {
      badges: ['punchline_heavy', 'unpredictable'],
      name: 'Haymaker Variance',
      bonus: '+5% to peak segments'
    },
    {
      badges: ['consistent_performer', 'prepared_battler'],
      name: 'Reliability Boost',
      bonus: '+5% consistency'
    },
    {
      badges: ['crowd_favorite', 'viral_sensation'],
      name: 'Social Media Power',
      bonus: '+5% crowd reaction'
    },
    {
      badges: ['comedian', 'crowd_control'],
      name: 'Comedy Master',
      bonus: '+5% crowd reaction and control'
    },
    {
      badges: ['enhanced_storyteller', 'technical_writer'],
      name: 'Narrative Excellence',
      bonus: '+5% creativity and consistency'
    },
    {
      badges: ['consummate_professional', 'prepared_battler'],
      name: 'Elite Preparation',
      bonus: '+5% all prep effectiveness'
    },
    {
      badges: ['gritty', 'aggressive'],
      name: 'Street Intensity',
      bonus: '+5% delivery and stage presence'
    },
    {
      badges: ['political_commentary', 'angle_master'],
      name: 'Angle Specialist',
      bonus: '+5% research effectiveness and creativity'
    },
    {
      badges: ['shock_value', 'controversial'],
      name: 'Maximum Controversy',
      bonus: '+10% crowd reaction, +5% media attention'
    }
  ];

  for (const group of synergyGroups) {
    if (group.badges.every(badge => badgeSet.has(badge))) {
      synergies.push(`${group.name}: ${group.bonus}`);
    }
  }

  return synergies;
}

/**
 * Get badge conflicts for display
 */
export function getBadgeConflicts(badges: string[]): string[] {
  const conflicts: string[] = [];
  const badgeSet = new Set(badges);

  const conflictGroups = [
    {
      badges: ['freestyle', 'technical_writer'],
      name: 'Preparation Philosophy Clash',
      penalty: '-8% to prep effectiveness (conflicting approaches)'
    },
    {
      badges: ['freestyle', 'overprepared'],
      name: 'Improvisation vs Over-Preparation',
      penalty: '-8% overall effectiveness'
    },
    {
      badges: ['consistent_performer', 'unpredictable'],
      name: 'Consistency vs Variance',
      penalty: '-8% to both consistency and variance'
    },
    {
      badges: ['small_room_killer', 'main_stage_specialist'],
      name: 'Venue Specialization Conflict',
      penalty: '-8% when in non-specialized venue'
    },
    {
      badges: ['clutch_performer', 'choker'],
      name: 'Performance Under Pressure Conflict',
      penalty: 'Mixed results under stress'
    },
    {
      badges: ['recycler', 'creativity_beast'],
      name: 'Recycled vs Fresh Material',
      penalty: '-10% creativity effectiveness'
    },
    {
      badges: ['biter', 'pen_game_elite'],
      name: 'Stolen vs Elite Writing',
      penalty: '-12% reputation and writing effectiveness'
    },
    {
      badges: ['reach_god', 'wordplay'],
      name: 'Forced vs Natural Wordplay',
      penalty: '-8% wordplay effectiveness'
    },
    {
      badges: ['mumbler', 'speed_rapper'],
      name: 'Poor Clarity at Speed',
      penalty: '-15% delivery effectiveness'
    },
    {
      badges: ['monotone_deliverer', 'comedian'],
      name: 'Flat Delivery vs Comedy',
      penalty: '-10% crowd reaction'
    },
    {
      badges: ['energy_drainer', 'crowd_favorite'],
      name: 'Energy Killer vs Crowd Pleaser',
      penalty: '-12% crowd control'
    },
    {
      badges: ['consummate_professional', 'unreliable'],
      name: 'Professional vs Unreliable',
      penalty: 'Conflicting reputation signals'
    },
    {
      badges: ['clout_chaser', 'respected_veteran'],
      name: 'Fame vs Respect',
      penalty: '-8% to veteran respect'
    },
    {
      badges: ['enhanced_storyteller', 'filler_abuser'],
      name: 'Quality vs Filler Content',
      penalty: '-10% narrative effectiveness'
    },
    {
      badges: ['gritty', 'theatrical'],
      name: 'Street vs Stage Performance',
      penalty: '-8% to both styles'
    }
  ];

  for (const group of conflictGroups) {
    if (group.badges.every(badge => badgeSet.has(badge))) {
      conflicts.push(`⚠️ ${group.name}: ${group.penalty}`);
    }
  }

  return conflicts;
}
