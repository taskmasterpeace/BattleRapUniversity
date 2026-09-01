/**
 * Battler Templates
 *
 * Pre-configured battler builds for new players who want quick starts
 * or inspiration for their custom build.
 */

export type BattlerTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  tagline: string;
  attributes: {
    lyricism: number;
    wordplay: number;
    creativity: number;
    flow: number;
    stage_presence: number;
    crowd_control: number;
    delivery: number;
    resilience: number;
  } | null;
  personal: {
    financial_stability: number;
    reputation: number;
    family_bond: number;
  };
  suggestedStyles: string[];
  suggestedLeague: 'Small Room Circuit' | 'Main Stage Arena' | null;
  pros: string[];
  cons: string[];
};

export const BATTLER_TEMPLATES: Record<string, BattlerTemplate> = {
  lyrical_assassin: {
    id: 'lyrical_assassin',
    name: 'Lyrical Assassin',
    description: 'Technical writer focused on complex wordplay and metaphors. Perfect for those who value pen over performance.',
    icon: '✍️',
    tagline: 'The pen is mightier than the stage',
    attributes: {
      lyricism: 5,
      wordplay: 4,
      creativity: 3,
      flow: 3,
      stage_presence: 1,
      crowd_control: 1,
      delivery: 2,
      resilience: 2,
    },
    personal: {
      financial_stability: 1,
      reputation: 2,
      family_bond: 1,
    },
    suggestedStyles: ['wordplay', 'storytelling'],
    suggestedLeague: 'Small Room Circuit',
    pros: [
      'Dominant in writing-focused leagues',
      'Complex bars and schemes',
      'Strong technical foundation',
    ],
    cons: [
      'Weaker on big stages',
      'May struggle with crowd reaction',
      'Performance is a liability',
    ],
  },

  performance_beast: {
    id: 'performance_beast',
    name: 'Performance Beast',
    description: 'High-energy performer who commands the stage and owns the crowd. Built for the main stage spotlight.',
    icon: '🎤',
    tagline: 'Own the stage, own the moment',
    attributes: {
      lyricism: 1,
      wordplay: 1,
      creativity: 2,
      flow: 2,
      stage_presence: 5,
      crowd_control: 5,
      delivery: 4,
      resilience: 1,
    },
    personal: {
      financial_stability: 1,
      reputation: 2,
      family_bond: 1,
    },
    suggestedStyles: ['comedy', 'freestyle'],
    suggestedLeague: 'Main Stage Arena',
    pros: [
      'Excels in big moments',
      'Strong crowd control',
      'Natural stage presence',
    ],
    cons: [
      'Weaker technical writing',
      'May lose pen battles',
      'Needs the crowd to win',
    ],
  },

  versatile_warrior: {
    id: 'versatile_warrior',
    name: 'Versatile Warrior',
    description: 'Balanced battler good at everything, great at nothing. The safe choice for beginners.',
    icon: '⚡',
    tagline: 'Jack of all trades, master of none',
    attributes: {
      lyricism: 3,
      wordplay: 3,
      creativity: 3,
      flow: 2,
      stage_presence: 3,
      crowd_control: 2,
      delivery: 3,
      resilience: 2,
    },
    personal: {
      financial_stability: 1,
      reputation: 2,
      family_bond: 1,
    },
    suggestedStyles: ['angles', 'storytelling'],
    suggestedLeague: 'Small Room Circuit',
    pros: [
      'Adaptable to any situation',
      'No major weaknesses',
      'Room to grow anywhere',
    ],
    cons: [
      'No dominant strengths',
      'May struggle against specialists',
      'Needs time to find identity',
    ],
  },

  aggressive_puncher: {
    id: 'aggressive_puncher',
    name: 'Aggressive Puncher',
    description: 'Aggressive style with hard-hitting punchlines. In-your-face delivery that demands respect.',
    icon: '💥',
    tagline: 'Hit hard, hit first',
    attributes: {
      lyricism: 2,
      wordplay: 1,
      creativity: 4,
      flow: 2,
      stage_presence: 4,
      crowd_control: 2,
      delivery: 5,
      resilience: 1,
    },
    personal: {
      financial_stability: 1,
      reputation: 2,
      family_bond: 1,
    },
    suggestedStyles: ['gun_bars', 'angles'],
    suggestedLeague: 'Main Stage Arena',
    pros: [
      'Devastating delivery',
      'High peak moments',
      'Intimidating presence',
    ],
    cons: [
      'Can be one-dimensional',
      'May rely too much on aggression',
      'Inconsistent technical skills',
    ],
  },

  comedy_specialist: {
    id: 'comedy_specialist',
    name: 'Comedy Specialist',
    description: 'Roast master who wins through humor and wit. Make them laugh, then make them lose.',
    icon: '😂',
    tagline: 'They came to battle, I came to roast',
    attributes: {
      lyricism: 1,
      wordplay: 2,
      creativity: 5,
      flow: 2,
      stage_presence: 2,
      crowd_control: 4,
      delivery: 3,
      resilience: 1,
    },
    personal: {
      financial_stability: 1,
      reputation: 2,
      family_bond: 2,
    },
    suggestedStyles: ['comedy', 'angles'],
    suggestedLeague: 'Main Stage Arena',
    pros: [
      'Crowd favorite potential',
      'Unique style stands out',
      'Creative angles',
    ],
    cons: [
      'May not be taken seriously',
      'Weaker technical writing',
      'Can be too one-note',
    ],
  },

  storytelling_master: {
    id: 'storytelling_master',
    name: 'Storytelling Master',
    description: 'Narrative-driven battler who paints vivid pictures. Every round tells a story.',
    icon: '📖',
    tagline: 'Every battle is a story',
    attributes: {
      lyricism: 3,
      wordplay: 2,
      creativity: 5,
      flow: 4,
      stage_presence: 1,
      crowd_control: 1,
      delivery: 2,
      resilience: 2,
    },
    personal: {
      financial_stability: 1,
      reputation: 2,
      family_bond: 2,
    },
    suggestedStyles: ['storytelling', 'angles'],
    suggestedLeague: 'Small Room Circuit',
    pros: [
      'Memorable performances',
      'Strong narrative structure',
      'Creative angles',
    ],
    cons: [
      'May lose crowd in long setups',
      'Weaker stage presence',
      'Needs attentive audience',
    ],
  },

  custom: {
    id: 'custom',
    name: 'Custom Build',
    description: 'Create your own unique battler from scratch. Define your own path to greatness.',
    icon: '🎯',
    tagline: 'Forge your own legend',
    attributes: null,
    personal: {
      financial_stability: 1,
      reputation: 2,
      family_bond: 2,
    },
    suggestedStyles: [],
    suggestedLeague: null,
    pros: [
      'Complete creative freedom',
      'Build to your playstyle',
      'Unique identity',
    ],
    cons: [
      'Requires more planning',
      'May create weak builds',
      'No guidance',
    ],
  },
};

/**
 * Get template by ID
 */
export function getTemplate(id: string): BattlerTemplate | null {
  return BATTLER_TEMPLATES[id] || null;
}

/**
 * Get all templates except custom
 */
export function getAllPresetTemplates(): BattlerTemplate[] {
  return Object.values(BATTLER_TEMPLATES).filter((t) => t.id !== 'custom');
}

/**
 * Calculate total points for a template's attributes
 */
export function calculateTemplatePoints(template: BattlerTemplate): number {
  if (!template.attributes) return 0;

  return (
    template.attributes.lyricism +
    template.attributes.wordplay +
    template.attributes.creativity +
    template.attributes.flow +
    template.attributes.stage_presence +
    template.attributes.crowd_control +
    template.attributes.delivery +
    template.attributes.resilience
  );
}
