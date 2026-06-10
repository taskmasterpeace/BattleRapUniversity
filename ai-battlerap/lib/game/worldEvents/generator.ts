import type { SupabaseClient } from '@supabase/supabase-js';
import {
  WORLD_EVENT_TEMPLATES,
  BLOGGER_BYLINES,
  type WorldEventTemplate,
  type WorldEventCtx,
  type WorldBattler,
  type WorldLeague,
  type WorldCity,
} from './templates';

/**
 * World Events Generator
 *
 * Each tick picks 2-4 weighted templates from the world-event database,
 * fills their context slots from live DB state (battlers, leagues, cities,
 * rankings, relationships, head-to-head records), and inserts news_articles.
 *
 * Idempotency / repeat control: a template code is not reused within 7 days,
 * tracked via news_articles.meta_json->>'world_event_code'. Safe to run hourly.
 */

const REPEAT_WINDOW_DAYS = 7;
const MAX_CTX_ATTEMPTS = 25;
/** Bias: how often the primary battler is a real (is_real) battler. */
const REAL_BATTLER_BIAS = 0.2;

export interface WorldEventsTickResult {
  inserted: Array<{ code: string; category: string; type: string; title: string; slug: string }>;
  skipped: Array<{ code: string; reason: string }>;
  poolSizes: { battlers: number; leagues: number; cities: number; relationships: number; h2h: number };
}

interface Pools {
  battlers: WorldBattler[];
  realBattlers: WorldBattler[];
  leagues: WorldLeague[];
  cities: WorldCity[];
  /** battlerId -> partner battlerIds with an active relationship (+ origin story) */
  relationships: Map<string, Array<{ partnerId: string; story: string }>>;
  /** "idA|idB" (sorted) -> { aWins, bWins } keyed in sorted order */
  h2h: Map<string, { aWins: number; bWins: number }>;
  byCity: Map<string, WorldBattler[]>;
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const int = (min: number, max: number): number => min + Math.floor(Math.random() * (max - min + 1));

function isExcludedName(name: string): boolean {
  return /^test/i.test(name) || /^pvp challenger/i.test(name) || name.includes('_');
}

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function h2hKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
}

// ============================================================================
// Pool loading
// ============================================================================

async function loadPools(supabase: SupabaseClient): Promise<Pools> {
  const [battlerRes, leagueRes, cityRes, relRes, h2hRes] = await Promise.all([
    supabase
      .from('battlers')
      .select(
        'id, stage_name, tier, region, style_tags, is_ai, is_real, current_city_id, rankings(rating, wins, losses, streak)'
      )
      .or('is_ai.eq.true,is_real.eq.true'),
    supabase.from('leagues').select('id, name, short_code, city:cities(name)'),
    supabase.from('cities').select('id, name, state, scene_size, culture_style'),
    supabase
      .from('battler_relationships')
      .select('battler_a_id, battler_b_id, origin_story, status')
      .eq('status', 'active'),
    supabase
      .from('head_to_head_records')
      .select('battler_a_id, battler_b_id, battler_a_wins, battler_b_wins'),
  ]);

  const cities: WorldCity[] = (cityRes.data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    state: c.state ?? null,
    sceneSize: c.scene_size ?? 'medium',
    cultureStyle: c.culture_style ?? 'diverse',
  }));
  const cityById = new Map(cities.map((c) => [c.id, c]));

  const battlers: WorldBattler[] = (battlerRes.data ?? [])
    .filter((b: any) => b.stage_name && !isExcludedName(b.stage_name))
    .map((b: any) => {
      const ranking = asOne<any>(b.rankings);
      const city = b.current_city_id ? cityById.get(b.current_city_id) : null;
      return {
        id: b.id,
        name: b.stage_name,
        tier: (b.tier ?? 'low') as WorldBattler['tier'],
        region: b.region ?? null,
        styleTags: Array.isArray(b.style_tags) ? b.style_tags.filter((t: any) => typeof t === 'string') : [],
        rating: ranking?.rating ?? 1200,
        wins: ranking?.wins ?? 0,
        losses: ranking?.losses ?? 0,
        streak: ranking?.streak ?? 0,
        cityName: city?.name ?? null,
        isReal: !!b.is_real,
      } as WorldBattler;
    });

  const eligibleIds = new Set(battlers.map((b) => b.id));

  const leagues: WorldLeague[] = (leagueRes.data ?? []).map((l: any) => ({
    id: l.id,
    name: l.name,
    shortCode: l.short_code,
    cityName: asOne<any>(l.city)?.name ?? null,
  }));

  const relationships = new Map<string, Array<{ partnerId: string; story: string }>>();
  for (const r of relRes.data ?? []) {
    if (!eligibleIds.has(r.battler_a_id) || !eligibleIds.has(r.battler_b_id)) continue;
    const story = r.origin_story ?? 'a grudge that started in the rooms and never got squashed.';
    if (!relationships.has(r.battler_a_id)) relationships.set(r.battler_a_id, []);
    if (!relationships.has(r.battler_b_id)) relationships.set(r.battler_b_id, []);
    relationships.get(r.battler_a_id)!.push({ partnerId: r.battler_b_id, story });
    relationships.get(r.battler_b_id)!.push({ partnerId: r.battler_a_id, story });
  }

  const h2h = new Map<string, { aWins: number; bWins: number }>();
  for (const h of h2hRes.data ?? []) {
    if (!eligibleIds.has(h.battler_a_id) || !eligibleIds.has(h.battler_b_id)) continue;
    h2h.set(h2hKey(h.battler_a_id, h.battler_b_id), {
      aWins: h.battler_a_wins ?? 0,
      bWins: h.battler_b_wins ?? 0,
    });
  }

  const byCity = new Map<string, WorldBattler[]>();
  for (const b of battlers) {
    if (!b.cityName) continue;
    if (!byCity.has(b.cityName)) byCity.set(b.cityName, []);
    byCity.get(b.cityName)!.push(b);
  }

  return {
    battlers,
    realBattlers: battlers.filter((b) => b.isReal),
    leagues,
    cities,
    relationships,
    h2h,
    byCity,
  };
}

// ============================================================================
// Context building
// ============================================================================

function buildCtx(pools: Pools): WorldEventCtx | null {
  if (pools.battlers.length < 2 || pools.leagues.length < 2 || pools.cities.length < 2) {
    return null;
  }

  // Primary battler — bias toward real battlers so they stay in the conversation.
  const a =
    pools.realBattlers.length > 0 && Math.random() < REAL_BATTLER_BIAS
      ? pick(pools.realBattlers)
      : pick(pools.battlers);

  // Secondary battler: prefer real relationship partner, then H2H opponent,
  // then a same-city peer, then anyone.
  let b: WorldBattler | null = null;
  let hasRelationship = false;
  let relationshipStory: string | undefined;

  const relPartners = pools.relationships.get(a.id) ?? [];
  if (relPartners.length > 0 && Math.random() < 0.7) {
    const rel = pick(relPartners);
    const partner = pools.battlers.find((x) => x.id === rel.partnerId);
    if (partner) {
      b = partner;
      hasRelationship = true;
      relationshipStory = rel.story;
    }
  }

  if (!b) {
    const h2hPartnerIds = [...pools.h2h.keys()]
      .filter((k) => k.includes(a.id))
      .map((k) => k.split('|').find((id) => id !== a.id)!)
      .filter(Boolean);
    if (h2hPartnerIds.length > 0 && Math.random() < 0.4) {
      const partner = pools.battlers.find((x) => x.id === pick(h2hPartnerIds));
      if (partner) b = partner;
    }
  }

  if (!b && a.cityName && Math.random() < 0.6) {
    const peers = (pools.byCity.get(a.cityName) ?? []).filter((x) => x.id !== a.id);
    if (peers.length > 0) b = pick(peers);
  }

  if (!b) {
    const others = pools.battlers.filter((x) => x.id !== a.id);
    if (others.length === 0) return null;
    b = pick(others);
  }

  // Head-to-head ledger (oriented so aWins = ctx.a's wins).
  let h2h: WorldEventCtx['h2h'];
  const rawH2h = pools.h2h.get(h2hKey(a.id, b.id));
  if (rawH2h) {
    h2h = a.id < b.id ? { aWins: rawH2h.aWins, bWins: rawH2h.bWins } : { aWins: rawH2h.bWins, bWins: rawH2h.aWins };
  }

  const league = pick(pools.leagues);
  const otherLeagues = pools.leagues.filter((l) => l.id !== league.id);
  const league2 = otherLeagues.length > 0 ? pick(otherLeagues) : league;

  const city = pools.cities.find((c) => c.name === a.cityName) ?? pick(pools.cities);
  const otherCities = pools.cities.filter((c) => c.id !== city.id);
  const city2 = otherCities.length > 0 ? pick(otherCities) : city;

  return {
    a,
    b,
    league,
    league2,
    city,
    city2,
    hasRelationship,
    relationshipStory,
    h2h,
    monthsIdle: int(3, 14),
    pick,
    int,
  };
}

// ============================================================================
// Template selection
// ============================================================================

function weightedSample(templates: WorldEventTemplate[], count: number): WorldEventTemplate[] {
  const chosen: WorldEventTemplate[] = [];
  const remaining = [...templates];
  while (chosen.length < count && remaining.length > 0) {
    const total = remaining.reduce((sum, t) => sum + t.weight, 0);
    let roll = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < remaining.length; i++) {
      roll -= remaining[i].weight;
      if (roll <= 0) {
        idx = i;
        break;
      }
    }
    chosen.push(remaining[idx]);
    remaining.splice(idx, 1);
  }
  return chosen;
}

async function getRecentCodes(supabase: SupabaseClient): Promise<Set<string>> {
  const since = new Date(Date.now() - REPEAT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('news_articles')
    .select('meta_json')
    .gte('published_at', since)
    .not('meta_json->>world_event_code', 'is', null)
    .limit(500);

  const codes = new Set<string>();
  for (const row of data ?? []) {
    const code = (row as any).meta_json?.world_event_code;
    if (typeof code === 'string') codes.add(code);
  }
  return codes;
}

// ============================================================================
// Slug
// ============================================================================

function slugify(title: string): string {
  const kebab = title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
    .replace(/-$/, '');
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${kebab}-${suffix}`;
}

// ============================================================================
// Tick
// ============================================================================

export async function runWorldEventsTick(
  supabase: SupabaseClient,
  opts: { count?: number } = {}
): Promise<WorldEventsTickResult> {
  const result: WorldEventsTickResult = {
    inserted: [],
    skipped: [],
    poolSizes: { battlers: 0, leagues: 0, cities: 0, relationships: 0, h2h: 0 },
  };

  const pools = await loadPools(supabase);
  result.poolSizes = {
    battlers: pools.battlers.length,
    leagues: pools.leagues.length,
    cities: pools.cities.length,
    relationships: pools.relationships.size,
    h2h: pools.h2h.size,
  };

  if (pools.battlers.length < 2) {
    result.skipped.push({ code: '*', reason: 'Not enough eligible battlers in the world' });
    return result;
  }

  const recentCodes = await getRecentCodes(supabase);
  const available = WORLD_EVENT_TEMPLATES.filter((t) => !recentCodes.has(t.code));
  const targetCount = opts.count ?? int(2, 4);

  // Oversample so requirement-failures can fall through to backups.
  const candidates = weightedSample(available, Math.min(available.length, targetCount * 4));

  for (const template of candidates) {
    if (result.inserted.length >= targetCount) break;

    // Try to draw a context that satisfies the template's requirements.
    let ctx: WorldEventCtx | null = null;
    for (let attempt = 0; attempt < MAX_CTX_ATTEMPTS; attempt++) {
      const candidate = buildCtx(pools);
      if (!candidate) break;
      if (!template.requires || template.requires(candidate)) {
        ctx = candidate;
        break;
      }
    }

    if (!ctx) {
      result.skipped.push({ code: template.code, reason: 'requirements not met by world state' });
      continue;
    }

    const byline = BLOGGER_BYLINES[template.blogger];
    const title = template.headline(ctx);
    const body = `${template.body(ctx)}\n\n— **${byline.penName}**, *${byline.outlet}*`;
    const slug = slugify(title);

    const { error } = await supabase.from('news_articles').insert({
      slug,
      title,
      type: template.articleType,
      body_markdown: body,
      primary_battler_id: ctx.a.id,
      secondary_battler_id: template.linkSecondary ? ctx.b.id : null,
      league_id: template.linkLeague ? ctx.league.id : null,
      battle_id: null,
      meta_json: {
        world_event: true,
        world_event_code: template.code,
        category: template.category,
        blogger: template.blogger,
        blogger_pen_name: byline.penName,
      },
      published_at: new Date().toISOString(),
    });

    if (error) {
      result.skipped.push({ code: template.code, reason: `insert failed: ${error.message}` });
      continue;
    }

    result.inserted.push({
      code: template.code,
      category: template.category,
      type: template.articleType,
      title,
      slug,
    });
  }

  return result;
}
