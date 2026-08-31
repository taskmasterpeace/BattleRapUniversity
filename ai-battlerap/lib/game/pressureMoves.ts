/**
 * PRESSURE MOVES — the physical chess match inside a battle (owner directive
 * 2026-08-31: "talk down your opponent's rounds and try to throw him off, or
 * bump into him… if they bump into you, you decide: bump back or punch — and
 * if you punch, that should impact your battle").
 *
 * Culture truth: rooms remember the bumps (DNA/K-Shine), and a thrown punch
 * usually VOIDS the battle and torches the swinger's booking rep. So:
 *   TALK OVER  — jaw at them during their round; rattle roll vs resilience.
 *   BUMP       — walk through their space; bigger rattle, they get to respond.
 *   BUMP BACK  — meet the energy; both tense up, the room HEATS UP.
 *   SWING      — battle OVER. No contest, reputation cratered, the Wire erupts.
 *
 * Every move resolves server-side and logs to battle_decisions, so the round
 * results, recaps, and blogs can all tell the story.
 */
import { SIMULATION_CONFIG as CONFIG } from './config';

export type PressureMove = 'none' | 'talk_over' | 'bump';
export type BumpResponse = 'laugh_off' | 'bump_back' | 'swing';

export type PressureEffects = {
  /** stumble-probability delta applied to the TARGET this round */
  targetStumbleDelta: number;
  /** battle-night stress delta applied to the TARGET this round */
  targetStressDelta: number;
  /** stress the ACTOR takes back (escalations cut both ways) */
  actorStressDelta: number;
  /** crowd-reaction bonus applied to BOTH (the room loves tension) */
  roomHeat: number;
  /** crowd penalty on the actor when a move reads desperate */
  actorCrowdPenalty: number;
  /** true = battle ends immediately as a no-contest */
  fightBroke: boolean;
  narrative: string;
};

const ZERO: PressureEffects = {
  targetStumbleDelta: 0,
  targetStressDelta: 0,
  actorStressDelta: 0,
  roomHeat: 0,
  actorCrowdPenalty: 0,
  fightBroke: false,
  narrative: '',
};

function tagsOf(battler: { style_tags?: unknown } | null | undefined): string[] {
  return Array.isArray(battler?.style_tags) ? (battler!.style_tags as string[]) : [];
}
function codingOf(battler: { identity?: any } | null | undefined): string {
  return battler?.identity?.coding ?? 'crossover';
}

/**
 * AI pressure choice — personality-driven. Street-coded and aggressive
 * battlers press; craft battlers mostly let the pen talk. Being down after
 * round 1 raises the temperature.
 */
export function aiPressureChoice(
  aiBattler: { style_tags?: unknown; identity?: any },
  roundIndex: number,
  aiIsBehind: boolean
): PressureMove {
  const coding = codingOf(aiBattler);
  const aggressive = tagsOf(aiBattler).some((t) => /aggressive|street|grime|raw/i.test(t));
  let talkP = coding === 'street' ? 0.22 : coding === 'craft' ? 0.08 : 0.14;
  let bumpP = coding === 'street' ? 0.1 : coding === 'craft' ? 0.02 : 0.05;
  if (aggressive) {
    talkP += 0.08;
    bumpP += 0.06;
  }
  if (aiIsBehind && roundIndex >= 2) {
    talkP += 0.1;
    bumpP += 0.08;
  }
  const r = Math.random();
  if (r < bumpP) return 'bump';
  if (r < bumpP + talkP) return 'talk_over';
  return 'none';
}

/**
 * AI response when the PLAYER bumps. Swinging is vanishingly rare — it ends
 * careers — but a hot-headed street battler down bad might.
 */
export function aiBumpResponse(aiBattler: { style_tags?: unknown; identity?: any }): BumpResponse {
  const coding = codingOf(aiBattler);
  const aggressive = tagsOf(aiBattler).some((t) => /aggressive|street|grime|raw/i.test(t));
  const swingP = (coding === 'street' ? 0.02 : 0.005) + (aggressive ? 0.015 : 0);
  const bumpBackP = coding === 'street' ? 0.6 : coding === 'craft' ? 0.2 : 0.4;
  const r = Math.random();
  if (r < swingP) return 'swing';
  if (r < swingP + bumpBackP) return 'bump_back';
  return 'laugh_off';
}

/**
 * Resolve TALK OVER: a rattle roll vs the target's resilience. Success shakes
 * them (stumbles up, stress up); failure makes YOU look thirsty (crowd docks).
 */
export function resolveTalkOver(targetResilience: number): PressureEffects {
  const rattleChance = Math.max(
    0.15,
    CONFIG.PRESSURE_TALK_RATTLE_BASE - targetResilience * CONFIG.PRESSURE_TALK_RESILIENCE_FACTOR
  );
  if (Math.random() < rattleChance) {
    return {
      ...ZERO,
      targetStumbleDelta: CONFIG.PRESSURE_TALK_STUMBLE_DELTA,
      targetStressDelta: CONFIG.PRESSURE_TALK_STRESS_DELTA,
      narrative: 'rattled',
    };
  }
  return { ...ZERO, actorCrowdPenalty: CONFIG.PRESSURE_TALK_BACKFIRE_CROWD, narrative: 'ignored' };
}

/** Resolve a BUMP given the target's response. */
export function resolveBump(response: BumpResponse): PressureEffects {
  switch (response) {
    case 'laugh_off':
      // Composure reads well — the bumper looks pressed, the target looks unbothered.
      return {
        ...ZERO,
        actorCrowdPenalty: CONFIG.PRESSURE_BUMP_LAUGHED_OFF_CROWD,
        narrative: 'laughed_off',
      };
    case 'bump_back':
      // Both tense up; the ROOM eats it up.
      return {
        ...ZERO,
        targetStumbleDelta: CONFIG.PRESSURE_BUMP_STUMBLE_DELTA,
        targetStressDelta: CONFIG.PRESSURE_BUMP_STRESS_DELTA,
        actorStressDelta: CONFIG.PRESSURE_BUMP_STRESS_DELTA,
        roomHeat: CONFIG.PRESSURE_BUMPBACK_ROOM_HEAT,
        narrative: 'bumped_back',
      };
    case 'swing':
      return { ...ZERO, fightBroke: true, narrative: 'swung' };
  }
}

/** Log one pressure decision to the battle_decisions paper trail. */
export async function logPressureDecision(
  supabase: any,
  battleId: string,
  battlerId: string,
  roundIndex: number,
  label: string,
  effects: PressureEffects
): Promise<void> {
  try {
    await supabase.from('battle_decisions').insert({
      battle_id: battleId,
      battler_id: battlerId,
      round_number: roundIndex,
      segment_number: 0,
      decision_type: 'pressure_move',
      decision_label: label,
      success_roll: 0,
      success_threshold: 0,
      was_successful: !effects.actorCrowdPenalty,
      effects_applied: effects,
    });
  } catch (e) {
    console.error('logPressureDecision failed:', e);
  }
}
