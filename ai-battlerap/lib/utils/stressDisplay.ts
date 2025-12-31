/**
 * Stress Display Utilities
 * Converts hidden stress stat (0-100) into player-friendly states
 */

export type StressState = 'calm' | 'focused' | 'tense' | 'overwhelmed';

export interface StressDisplay {
  state: StressState;
  label: string;
  description: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
  shouldWarn: boolean;
  chokePenalty: string; // Human-readable choke chance impact
}

/**
 * Convert numeric stress (0-100) to display state
 */
export function getStressDisplay(stress: number): StressDisplay {
  if (stress <= 25) {
    return {
      state: 'calm',
      label: 'Calm',
      description: 'You\'re relaxed and ready to perform',
      color: 'green',
      shouldWarn: false,
      chokePenalty: 'No penalty'
    };
  }

  if (stress <= 50) {
    return {
      state: 'focused',
      label: 'Focused',
      description: 'Normal pressure, nothing you can\'t handle',
      color: 'yellow',
      shouldWarn: false,
      chokePenalty: '+3% choke chance'
    };
  }

  if (stress <= 75) {
    return {
      state: 'tense',
      label: 'Tense',
      description: 'The pressure is building. Consider resting.',
      color: 'orange',
      shouldWarn: true,
      chokePenalty: '+8% choke chance'
    };
  }

  return {
    state: 'overwhelmed',
    label: 'Overwhelmed',
    description: 'High risk of choking. You NEED rest.',
    color: 'red',
    shouldWarn: true,
    chokePenalty: '+15-25% choke chance'
  };
}

/**
 * Get stress change preview for prep decisions
 */
export function getStressChangePreview(
  currentStress: number,
  prepType: 'research' | 'writing' | 'performance' | 'rest' | 'life',
  consecutiveDays: number = 0
): { delta: number; newState: StressState; message: string } {
  let delta = 0;
  let message = '';

  if (prepType === 'rest') {
    delta = -5; // Rest always reduces stress
    message = 'Rest reduces stress';
  } else if (prepType === 'life') {
    delta = -2; // Life events slightly reduce stress
    message = 'Life activities help you relax';
  } else {
    // Writing/performance/research add stress if done consecutively
    if (consecutiveDays >= 3) {
      delta = Math.min(5, consecutiveDays - 2); // 1-5 stress based on consecutive days
      message = `High-intensity prep is wearing on you`;
    } else {
      delta = 0;
      message = 'No stress impact';
    }
  }

  const newStress = Math.max(0, Math.min(100, currentStress + delta));
  const newState = getStressDisplay(newStress).state;

  return {
    delta,
    newState,
    message
  };
}

/**
 * Get contextual stress warning message
 */
export function getStressWarning(
  stress: number,
  daysSinceRest: number,
  upcomingBattleDays: number | null
): string | null {
  if (stress < 50) {
    return null; // No warning needed
  }

  if (stress >= 75 && upcomingBattleDays && upcomingBattleDays <= 3) {
    return `⚠️ CRITICAL: You're overwhelmed with a battle in ${upcomingBattleDays} days. High choke risk!`;
  }

  if (stress >= 75) {
    return `⚠️ You're overwhelmed. Take rest days to avoid choking.`;
  }

  if (stress >= 50 && daysSinceRest >= 5) {
    return `⚠️ You haven't rested in ${daysSinceRest} days. Stress is building.`;
  }

  if (stress >= 50) {
    return `⚠️ Pressure is building. Consider taking a rest day soon.`;
  }

  return null;
}

/**
 * Calculate choke probability increase from stress
 * Matches simulation.ts logic
 */
export function getStressChokePenalty(stress: number): number {
  if (stress < 20) return 0;
  if (stress < 40) return 0.03;
  if (stress < 60) return 0.08;
  if (stress < 80) return 0.15;
  return 0.25;
}

/**
 * Get post-choke explanation
 */
export function getChokeExplanation(
  stress: number,
  resilience: number,
  prepDays: number
): string {
  const stressDisplay = getStressDisplay(stress);

  let factors: string[] = [];

  if (stress >= 60) {
    factors.push(`high stress (${stressDisplay.label})`);
  }

  if (resilience < 4) {
    factors.push(`low resilience (${resilience}/10)`);
  }

  if (prepDays < 3) {
    factors.push(`insufficient prep (${prepDays} days)`);
  }

  if (factors.length === 0) {
    return `You choked due to a combination of factors. Even great battlers have off nights.`;
  }

  return `You choked due to ${factors.join(' + ')}. ${
    stress >= 60 ? 'Taking rest days would have helped.' : ''
  }`;
}
