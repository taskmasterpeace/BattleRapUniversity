/**
 * Angle discovery — persona FACETS feed ANGLES (owner directive 2026-08-31:
 * "an opponent who does research prep can find them, bloggers can write
 * about them").
 *
 * A battler's identity.facets (Christian, Ex-Con, LGBTQ, Veteran, Sober…) are
 * the personal material the culture actually battles over. RESEARCH prep days
 * are discovery rolls against the opponent's facets: what you find becomes an
 * ANGLE — a writing edge and a shot at a haymaker moment — and a story the
 * blogs can pick up (rows land in battle_intelligence).
 */
import { SIMULATION_CONFIG as CONFIG } from './config';

export type AngleRoll = { facet: string; roll: number; success: boolean };

export type AngleDiscovery = {
  /** facets found — these become angles in the sim */
  found: string[];
  rolls: AngleRoll[];
  researchDays: number;
};

/** Read facets off a battlers row (identity jsonb), tolerating any shape. */
export function facetsOf(battler: { identity?: any } | null | undefined): string[] {
  const f = battler?.identity?.facets;
  return Array.isArray(f) ? f.filter((x: unknown) => typeof x === 'string') : [];
}

/**
 * Roll research days against the target's facets. Each research day is one
 * roll at ANGLE_DISCOVERY_CHANCE against the next undiscovered facet; finds
 * cap at ANGLE_FACETS_MAX so deep dossiers don't stack forever.
 */
export function discoverAngles(researchDays: number, targetFacets: string[]): AngleDiscovery {
  const rolls: AngleRoll[] = [];
  const found: string[] = [];
  if (researchDays <= 0 || targetFacets.length === 0) {
    return { found, rolls, researchDays };
  }
  // Shuffle-ish: rotate by a random offset so the same facet isn't always first.
  const offset = Math.floor(Math.random() * targetFacets.length);
  const queue = [...targetFacets.slice(offset), ...targetFacets.slice(0, offset)];

  for (let day = 0; day < researchDays; day++) {
    const target = queue.find((f) => !found.includes(f));
    if (!target || found.length >= CONFIG.ANGLE_FACETS_MAX) break;
    const roll = Math.random();
    const success = roll < CONFIG.ANGLE_DISCOVERY_CHANCE;
    rolls.push({ facet: target, roll: Math.round(roll * 100) / 100, success });
    if (success) found.push(target);
  }
  return { found, rolls, researchDays };
}

/**
 * Round-stable discovery for the interactive path: the dig happens ONCE per
 * battle. First round rolls + persists; later rounds read the same finds back
 * from battle_intelligence.
 */
export async function getOrDiscoverAngles(
  supabase: any,
  battleId: string,
  researcherId: string,
  targetId: string,
  researchDays: number,
  targetFacets: string[]
): Promise<string[]> {
  try {
    const { data: existing } = await supabase
      .from('battle_intelligence')
      .select('discovery_rolls')
      .eq('battle_id', battleId)
      .eq('researcher_battler_id', researcherId)
      .maybeSingle();
    if (existing) {
      const rolls: AngleRoll[] = Array.isArray(existing.discovery_rolls)
        ? existing.discovery_rolls
        : [];
      return rolls.filter((r) => r.success).map((r) => r.facet);
    }
  } catch {
    // fall through to a fresh roll
  }
  const discovery = discoverAngles(researchDays, targetFacets);
  await persistIntel(supabase, battleId, researcherId, targetId, discovery);
  return discovery.found;
}

/**
 * Persist one side's research into battle_intelligence — the paper trail the
 * newsroom reads ("who dug on who, and what they found").
 */
export async function persistIntel(
  supabase: any,
  battleId: string,
  researcherId: string,
  targetId: string,
  discovery: AngleDiscovery
): Promise<void> {
  if (discovery.researchDays <= 0) return;
  try {
    await supabase.from('battle_intelligence').insert({
      battle_id: battleId,
      researcher_battler_id: researcherId,
      target_battler_id: targetId,
      research_days: discovery.researchDays,
      research_quality:
        discovery.rolls.length > 0 ? discovery.found.length / discovery.rolls.length : 0,
      discovery_rolls: discovery.rolls,
    });
  } catch (e) {
    // Intel is narrative gravy — never fail a battle over it.
    console.error('persistIntel failed:', e);
  }
}
