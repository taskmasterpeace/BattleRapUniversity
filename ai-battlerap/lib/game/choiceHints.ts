/**
 * Choice Outcome Hints System
 * Provides archetype-based hints for life event choices
 */

import { detectArchetype } from './badgeDescriptions';

export type ChoiceQuality = 'excellent' | 'good' | 'neutral' | 'risky' | 'bad';

export interface ChoiceHint {
  quality: ChoiceQuality;
  archetypeMatch: boolean;
  message: string;
  probability: 'high' | 'medium' | 'low';
  color: 'green' | 'yellow' | 'orange' | 'red';
}

/**
 * Analyze a choice and provide hints based on battler's archetype
 */
export function getChoiceHint(
  eventCode: string,
  choiceOption: 'a' | 'b',
  badges: string[],
  currentAttributes: {
    stress?: number;
    reputation?: number;
    resilience?: number;
    financial_stability?: number;
  } = {}
): ChoiceHint {
  const archetype = detectArchetype(badges);
  const badgeSet = new Set(badges);

  // Event-specific archetype preferences
  const eventPreferences = getEventPreferences(eventCode);

  // Default neutral hint
  let hint: ChoiceHint = {
    quality: 'neutral',
    archetypeMatch: false,
    message: 'Standard choice for your build',
    probability: 'medium',
    color: 'yellow'
  };

  // Check archetype match
  if (eventPreferences) {
    const preference = choiceOption === 'a' ? eventPreferences.choiceA : eventPreferences.choiceB;

    if (preference.favoredArchetypes.includes(archetype.archetype)) {
      hint = {
        quality: 'excellent',
        archetypeMatch: true,
        message: `Perfect for ${archetype.archetype}s! High success rate.`,
        probability: 'high',
        color: 'green'
      };
    } else if (preference.riskyArchetypes?.includes(archetype.archetype)) {
      hint = {
        quality: 'risky',
        archetypeMatch: false,
        message: `Risky for ${archetype.archetype}s. Lower success rate.`,
        probability: 'low',
        color: 'red'
      };
    } else if (preference.neutralArchetypes?.includes(archetype.archetype)) {
      hint = {
        quality: 'good',
        archetypeMatch: true,
        message: `Decent option for ${archetype.archetype}s.`,
        probability: 'medium',
        color: 'yellow'
      };
    }
  }

  // Badge-specific modifiers
  hint = applyBadgeModifiers(hint, eventCode, choiceOption, badgeSet);

  // Attribute-based warnings
  hint = applyAttributeWarnings(hint, eventCode, choiceOption, currentAttributes);

  return hint;
}

/**
 * Event-specific archetype preferences
 */
function getEventPreferences(eventCode: string): {
  choiceA: {
    favoredArchetypes: string[];
    riskyArchetypes?: string[];
    neutralArchetypes?: string[];
  };
  choiceB: {
    favoredArchetypes: string[];
    riskyArchetypes?: string[];
    neutralArchetypes?: string[];
  };
} | null {
  const preferences: Record<string, any> = {
    // Viral moments
    'viral_haymaker': {
      choiceA: {
        favoredArchetypes: ['Viral Star', 'Performance Beast'],
        riskyArchetypes: ['Technical Writer'],
        neutralArchetypes: ['Balanced Battler']
      },
      choiceB: {
        favoredArchetypes: ['Technical Writer', 'Consistent Grinder'],
        riskyArchetypes: ['Viral Star'],
        neutralArchetypes: ['Balanced Battler']
      }
    },

    // Financial struggles
    'day_job_ultimatum': {
      choiceA: {
        favoredArchetypes: ['Freestyler', 'Performance Beast'],
        riskyArchetypes: ['Consistent Grinder'],
        neutralArchetypes: ['Viral Star']
      },
      choiceB: {
        favoredArchetypes: ['Technical Writer', 'Consistent Grinder'],
        riskyArchetypes: ['Freestyler'],
        neutralArchetypes: ['Balanced Battler']
      }
    },

    // Career opportunities
    'mainstream_shot': {
      choiceA: {
        favoredArchetypes: ['Viral Star', 'Crowd Favorite'],
        riskyArchetypes: ['Technical Writer', 'Angle Master'],
        neutralArchetypes: ['Performance Beast']
      },
      choiceB: {
        favoredArchetypes: ['Technical Writer', 'Angle Master'],
        riskyArchetypes: ['Viral Star'],
        neutralArchetypes: ['Balanced Battler']
      }
    },

    // Social media/beef
    'twitter_beef': {
      choiceA: {
        favoredArchetypes: ['Angle Master', 'Performance Beast'],
        riskyArchetypes: ['Consistent Grinder'],
        neutralArchetypes: ['Viral Star']
      },
      choiceB: {
        favoredArchetypes: ['Technical Writer', 'Consistent Grinder'],
        riskyArchetypes: ['Angle Master'],
        neutralArchetypes: ['Balanced Battler']
      }
    },

    // Performance pressure
    'choke_redemption': {
      choiceA: {
        favoredArchetypes: ['Freestyler', 'Performance Beast'],
        riskyArchetypes: ['Technical Writer'],
        neutralArchetypes: ['Balanced Battler']
      },
      choiceB: {
        favoredArchetypes: ['Technical Writer', 'Consistent Grinder'],
        riskyArchetypes: ['Freestyler'],
        neutralArchetypes: ['Balanced Battler']
      }
    },

    // After party scene
    'after_party_scene': {
      choiceA: {
        favoredArchetypes: ['Viral Star', 'Performance Beast'],
        riskyArchetypes: ['Technical Writer', 'Consistent Grinder'],
        neutralArchetypes: ['Balanced Battler']
      },
      choiceB: {
        favoredArchetypes: ['Technical Writer', 'Consistent Grinder'],
        riskyArchetypes: ['Viral Star'],
        neutralArchetypes: ['Balanced Battler']
      }
    }
  };

  return preferences[eventCode] || null;
}

/**
 * Apply badge-specific modifiers to hint
 */
function applyBadgeModifiers(
  hint: ChoiceHint,
  eventCode: string,
  choiceOption: 'a' | 'b',
  badges: Set<string>
): ChoiceHint {
  const modifiedHint = { ...hint };

  // Clutch Performer badge helps with pressure choices
  if (badges.has('clutch_performer') && eventCode.includes('choke')) {
    if (choiceOption === 'a') {
      modifiedHint.quality = 'excellent';
      modifiedHint.message += ' (Clutch Performer bonus)';
      modifiedHint.color = 'green';
    }
  }

  // Controversial badge affects social media choices
  if (badges.has('controversial') && eventCode.includes('twitter')) {
    if (choiceOption === 'a') {
      modifiedHint.quality = 'risky';
      modifiedHint.message = 'Your controversial reputation makes this riskier';
      modifiedHint.color = 'red';
    }
  }

  // Choker badge makes redemption harder
  if (badges.has('choker') && eventCode.includes('redemption')) {
    modifiedHint.probability = 'low';
    modifiedHint.message += ' (Choker stigma penalty)';
  }

  return modifiedHint;
}

/**
 * Apply attribute-based warnings
 */
function applyAttributeWarnings(
  hint: ChoiceHint,
  eventCode: string,
  choiceOption: 'a' | 'b',
  attributes: {
    stress?: number;
    reputation?: number;
    resilience?: number;
    financial_stability?: number;
  }
): ChoiceHint {
  const modifiedHint = { ...hint };

  // High stress warning
  if (attributes.stress && attributes.stress >= 60) {
    if (eventCode.includes('pressure') || eventCode.includes('party')) {
      if (choiceOption === 'a' && !eventCode.includes('rest')) {
        modifiedHint.message += ' ⚠ Warning: High stress increases risk';
        modifiedHint.quality = 'risky';
      }
    }
  }

  // Low resilience warning
  if (attributes.resilience && attributes.resilience <= 3) {
    if (eventCode.includes('choke') || eventCode.includes('pressure')) {
      modifiedHint.message += ' ⚠ Low resilience affects success rate';
    }
  }

  // Low reputation warning
  if (attributes.reputation && attributes.reputation <= 3) {
    if (eventCode.includes('mainstream') || eventCode.includes('league')) {
      if (choiceOption === 'a') {
        modifiedHint.message += ' ⚠ Low reputation may limit opportunities';
      }
    }
  }

  // Financial desperation
  if (attributes.financial_stability && attributes.financial_stability <= 2) {
    if (eventCode.includes('financial') || eventCode.includes('job')) {
      modifiedHint.message += ' 💰 Financial pressure affects this decision';
    }
  }

  return modifiedHint;
}

/**
 * Format hint for display
 */
export function formatChoiceHint(hint: ChoiceHint): {
  icon: string;
  text: string;
  className: string;
} {
  const icons = {
    excellent: '✓✓',
    good: '✓',
    neutral: '—',
    risky: '⚠',
    bad: '✗'
  };

  const classNames = {
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-400'
  };

  return {
    icon: icons[hint.quality],
    text: hint.message,
    className: classNames[hint.color]
  };
}

/**
 * Get probability indicator text
 */
export function getProbabilityText(probability: 'high' | 'medium' | 'low'): string {
  const texts = {
    high: 'High success rate (70-85%)',
    medium: 'Medium success rate (45-65%)',
    low: 'Low success rate (20-40%)'
  };

  return texts[probability];
}
