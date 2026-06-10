// Shared validation for the admin real-battler create/edit endpoints.

export type RealBattlerAttributes = {
  lyricism: number;
  wordplay: number;
  creativity: number;
  flow: number;
  stage_presence: number;
  crowd_control: number;
  delivery: number;
  resilience: number;
};

export type RealBattlerPayload = {
  stage_name: string;
  real_name: string | null;
  bio: string | null;
  hometown_city_id: string | null;
  tier: 'low' | 'mid' | 'top' | 'god';
  likeness_status: 'licensed' | 'pending' | 'unofficial';
  avatar_url: string | null;
  style_tags: string[];
  attributes: RealBattlerAttributes;
  rating: number;
};

const TIERS = ['low', 'mid', 'top', 'god'] as const;
const LIKENESS = ['licensed', 'pending', 'unofficial'] as const;
export const ATTRIBUTE_KEYS = [
  'lyricism',
  'wordplay',
  'creativity',
  'flow',
  'stage_presence',
  'crowd_control',
  'delivery',
  'resilience',
] as const;

function optionalString(v: unknown, max = 2000): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t.slice(0, max) : null;
}

export function parseRealBattlerPayload(
  body: unknown
): { payload: RealBattlerPayload } | { error: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const stage_name = typeof b.stage_name === 'string' ? b.stage_name.trim() : '';
  if (stage_name.length < 2 || stage_name.length > 50) {
    return { error: 'Stage name must be 2-50 characters' };
  }

  const tier = TIERS.includes(b.tier as (typeof TIERS)[number])
    ? (b.tier as RealBattlerPayload['tier'])
    : null;
  if (!tier) return { error: 'Tier must be low | mid | top | god' };

  const likeness_status = LIKENESS.includes(b.likeness_status as (typeof LIKENESS)[number])
    ? (b.likeness_status as RealBattlerPayload['likeness_status'])
    : null;
  if (!likeness_status) {
    return { error: 'Likeness status must be licensed | pending | unofficial' };
  }

  const rawAttrs = (b.attributes ?? {}) as Record<string, unknown>;
  const attributes = {} as RealBattlerAttributes;
  for (const key of ATTRIBUTE_KEYS) {
    const v = Number(rawAttrs[key]);
    if (!Number.isFinite(v) || v < 1 || v > 10) {
      return { error: `Attribute "${key}" must be a number between 1 and 10` };
    }
    attributes[key] = Math.round(v);
  }

  const rating = Number(b.rating);
  if (!Number.isFinite(rating) || rating < 400 || rating > 3000) {
    return { error: 'Starting rating must be between 400 and 3000' };
  }

  let style_tags: string[] = [];
  if (Array.isArray(b.style_tags)) {
    style_tags = b.style_tags
      .filter((t): t is string => typeof t === 'string')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 8);
  }

  return {
    payload: {
      stage_name,
      real_name: optionalString(b.real_name, 100),
      bio: optionalString(b.bio, 4000),
      hometown_city_id: optionalString(b.hometown_city_id, 64),
      tier,
      likeness_status,
      avatar_url: optionalString(b.avatar_url, 500),
      style_tags,
      attributes,
      rating: Math.round(rating),
    },
  };
}

/** Map flat attribute payload → battler_attributes row shape. */
export function buildAttributeRows(battlerId: string, a: RealBattlerAttributes) {
  return {
    battler_id: battlerId,
    writing: {
      lyricism: a.lyricism,
      wordplay: a.wordplay,
      creativity: a.creativity,
      flow: a.flow,
    },
    performance: {
      stage_presence: a.stage_presence,
      crowd_control: a.crowd_control,
      delivery: a.delivery,
    },
    personal: {
      financial_stability: 5,
      reputation: 7,
      family_bond: 5,
      preparation: 7,
    },
    resilience: a.resilience,
    public_knowledge: 25,
    xp: {},
  };
}
