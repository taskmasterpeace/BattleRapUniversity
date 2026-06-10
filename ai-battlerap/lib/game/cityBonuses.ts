/**
 * City creation bonuses — where you're from determines what you start with.
 *
 * Each city's culture grants stat bonuses at battler creation, applied ON TOP
 * of the player's 25-point allocation (cap 10 per stat). Smaller scenes grant
 * one extra point: coming up where there's no industry means you had to be
 * undeniable before anybody noticed.
 *
 *   technical  → +1 lyricism, +1 wordplay        (pen-first cities)
 *   aggressive → +1 delivery, +1 stage_presence  (pressure cities)
 *   street     → +1 stage_presence, +1 resilience (prove-it-in-person cities)
 *   diverse    → +1 creativity, +1 crowd_control  (every-style-works cities)
 *
 *   scene_size small/medium → +1 resilience (the hungry bonus)
 */

export type CityBonus = {
  writing: Partial<{ lyricism: number; wordplay: number; creativity: number; flow: number }>;
  performance: Partial<{ stage_presence: number; crowd_control: number; delivery: number }>;
  resilience: number;
  /** Human-readable lines for the city card at creation */
  labels: string[];
};

const CULTURE_BONUSES: Record<string, Omit<CityBonus, 'labels'> & { labels: string[] }> = {
  technical: {
    writing: { lyricism: 1, wordplay: 1 },
    performance: {},
    resilience: 0,
    labels: ['+1 LYRICISM', '+1 WORDPLAY'],
  },
  aggressive: {
    writing: {},
    performance: { delivery: 1, stage_presence: 1 },
    resilience: 0,
    labels: ['+1 DELIVERY', '+1 STAGE PRESENCE'],
  },
  street: {
    writing: {},
    performance: { stage_presence: 1 },
    resilience: 1,
    labels: ['+1 STAGE PRESENCE', '+1 RESILIENCE'],
  },
  diverse: {
    writing: { creativity: 1 },
    performance: { crowd_control: 1 },
    resilience: 0,
    labels: ['+1 CREATIVITY', '+1 CROWD CONTROL'],
  },
};

const HUNGRY_SCENES = new Set(['small', 'medium']);

export function getCityBonus(cultureStyle: string | null, sceneSize: string | null): CityBonus {
  const base = CULTURE_BONUSES[cultureStyle ?? ''] ?? {
    writing: {},
    performance: {},
    resilience: 0,
    labels: [],
  };
  const hungry = HUNGRY_SCENES.has(sceneSize ?? '');
  return {
    writing: { ...base.writing },
    performance: { ...base.performance },
    resilience: base.resilience + (hungry ? 1 : 0),
    labels: hungry ? [...base.labels, '+1 RESILIENCE (HUNGRY SCENE)'] : [...base.labels],
  };
}

const cap = (n: number) => Math.min(10, n);

/** Apply a city bonus to an allocated attribute set (caps each stat at 10). */
export function applyCityBonus<
  T extends {
    writing: Record<string, number>;
    performance: Record<string, number>;
    resilience: number;
  }
>(attrs: T, bonus: CityBonus): T {
  const out = {
    ...attrs,
    writing: { ...attrs.writing },
    performance: { ...attrs.performance },
  };
  for (const [k, v] of Object.entries(bonus.writing)) {
    out.writing[k] = cap((out.writing[k] ?? 0) + (v ?? 0));
  }
  for (const [k, v] of Object.entries(bonus.performance)) {
    out.performance[k] = cap((out.performance[k] ?? 0) + (v ?? 0));
  }
  out.resilience = cap(attrs.resilience + bonus.resilience);
  return out;
}
