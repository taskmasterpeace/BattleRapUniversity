import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';

/**
 * Get regional badge based on city name
 */
function getRegionalBadge(region: string | null): string | null {
  if (!region) return 'Underground Rep';

  const cityLower = region.toLowerCase().trim();

  // NYC area
  if (cityLower.includes('new york') || cityLower.includes('brooklyn') ||
      cityLower.includes('bronx') || cityLower.includes('queens') ||
      cityLower.includes('harlem') || cityLower.includes('manhattan') ||
      cityLower.includes('nyc')) {
    return 'NYC Native';
  }

  // Philly
  if (cityLower.includes('philadelphia') || cityLower.includes('philly')) {
    return 'Philly Rep';
  }

  // Detroit
  if (cityLower.includes('detroit')) {
    return 'Detroit Made';
  }

  // Chicago
  if (cityLower.includes('chicago')) {
    return 'Chicago Bred';
  }

  // LA area
  if (cityLower.includes('los angeles') || cityLower.includes('compton') ||
      cityLower.includes('long beach') || cityLower.includes('inglewood') ||
      cityLower.includes('la,') || cityLower === 'la') {
    return 'LA Native';
  }

  // Bay Area
  if (cityLower.includes('san francisco') || cityLower.includes('oakland') ||
      cityLower.includes('bay area') || cityLower.includes('san jose')) {
    return 'Bay Area Rep';
  }

  // Atlanta
  if (cityLower.includes('atlanta') || cityLower.includes('atl')) {
    return 'ATL Rep';
  }

  // Houston
  if (cityLower.includes('houston')) {
    return 'Houston Made';
  }

  // DMV
  if (cityLower.includes('washington') || cityLower.includes('baltimore') ||
      cityLower.includes('dc') || cityLower.includes('dmv') ||
      cityLower.includes('maryland') || cityLower.includes('virginia')) {
    return 'DMV Native';
  }

  // Miami
  if (cityLower.includes('miami') || cityLower.includes('305')) {
    return 'Miami Heat';
  }

  // Toronto
  if (cityLower.includes('toronto')) {
    return 'Toronto Rep';
  }

  // UK
  if (cityLower.includes('london') || cityLower.includes('uk') ||
      cityLower.includes('england') || cityLower.includes('britain') ||
      cityLower.includes('manchester') || cityLower.includes('birmingham')) {
    return 'UK Native';
  }

  // Default for smaller cities
  return 'Underground Rep';
}

type AllocatedAttributes = {
  writing: {
    lyricism: number;
    wordplay: number;
    creativity: number;
    flow: number;
  };
  performance: {
    stage_presence: number;
    crowd_control: number;
    delivery: number;
  };
  personal: {
    financial_stability: number;
    reputation: number;
    family_bond: number;
  };
  resilience: number;
};

const TOTAL_POINTS = 25;
const MIN_PER_ATTRIBUTE = 1;
const MAX_PER_ATTRIBUTE = 8;

function validateAllocatedAttributes(attrs: any): attrs is AllocatedAttributes {
  if (!attrs || typeof attrs !== 'object') return false;

  // Check structure
  if (!attrs.writing || !attrs.performance || !attrs.personal || typeof attrs.resilience !== 'number') {
    return false;
  }

  // Collect all attribute values
  const values = [
    attrs.writing.lyricism,
    attrs.writing.wordplay,
    attrs.writing.creativity,
    attrs.writing.flow,
    attrs.performance.stage_presence,
    attrs.performance.crowd_control,
    attrs.performance.delivery,
    attrs.personal.financial_stability,
    attrs.personal.reputation,
    attrs.personal.family_bond,
    attrs.resilience,
  ];

  // Check each value is a number and within bounds
  for (const value of values) {
    if (typeof value !== 'number' || value < MIN_PER_ATTRIBUTE || value > MAX_PER_ATTRIBUTE) {
      return false;
    }
  }

  // Check total points
  const total = values.reduce((sum, val) => sum + val, 0);
  if (total !== TOTAL_POINTS) {
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { stage_name, region, primary_league_id, style_tags, allocated_attributes } = body;

  // Validation
  if (!stage_name || typeof stage_name !== 'string') {
    return NextResponse.json({ error: 'Stage name is required' }, { status: 400 });
  }

  const trimmedName = stage_name.trim();
  if (trimmedName.length === 0) {
    return NextResponse.json({ error: 'Stage name cannot be empty' }, { status: 400 });
  }

  if (trimmedName.length < 2) {
    return NextResponse.json({ error: 'Stage name must be at least 2 characters' }, { status: 400 });
  }

  if (trimmedName.length > 50) {
    return NextResponse.json({ error: 'Stage name must be 50 characters or less' }, { status: 400 });
  }

  if (!Array.isArray(style_tags) || style_tags.length === 0 || style_tags.length > 3) {
    return NextResponse.json({ error: 'Must select 1-3 style tags' }, { status: 400 });
  }

  if (!primary_league_id) {
    return NextResponse.json({ error: 'League selection is required' }, { status: 400 });
  }

  // Validate allocated attributes
  if (!allocated_attributes) {
    return NextResponse.json({ error: 'Attribute allocation is required' }, { status: 400 });
  }

  if (!validateAllocatedAttributes(allocated_attributes)) {
    return NextResponse.json(
      { error: 'Invalid attribute allocation. Must total 25 points with each stat between 1-8.' },
      { status: 400 }
    );
  }

  // Use service role client to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Check if user already has a battler
  const { data: existingBattler } = await supabase
    .from('battlers')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .maybeSingle();

  if (existingBattler) {
    return NextResponse.json({ error: 'User already has a battler' }, { status: 400 });
  }

  // Verify league exists
  const { data: league } = await supabase
    .from('leagues')
    .select('id')
    .eq('id', primary_league_id)
    .single();

  if (!league) {
    return NextResponse.json({ error: 'Invalid league ID' }, { status: 400 });
  }

  // Get regional badge based on hometown
  const regionalBadge = getRegionalBadge(region);
  const allBadges = regionalBadge
    ? [...new Set([...style_tags, regionalBadge])]  // Add regional badge, avoid duplicates
    : style_tags;

  // Auto-assign a character sprite not already used by another battler, so new
  // players get a face instead of the generic mic icon.
  let avatarUrl: string | null = null;
  try {
    const sprites: string[] = (await import('@/lib/game/characterSprites.json')).default;
    const { data: usedRows } = await supabase
      .from('battlers')
      .select('avatar_url')
      .not('avatar_url', 'is', null);
    const used = new Set((usedRows || []).map((r: { avatar_url: string }) => r.avatar_url));
    const available = sprites.filter((s) => !used.has(s));
    const pool = available.length > 0 ? available : sprites;
    avatarUrl = pool[Math.floor(Math.random() * pool.length)];
  } catch (spriteError) {
    console.error('Avatar auto-assign failed (non-fatal):', spriteError);
  }

  // Create battler
  const { data: battler, error: battlerError } = await supabase
    .from('battlers')
    .insert({
      user_id: user.id,
      stage_name: trimmedName,
      region: region && typeof region === 'string' ? region.trim().slice(0, 100) : null,
      primary_league_id,
      style_tags: allBadges,
      tier: 'low',
      is_ai: false,
      avatar_url: avatarUrl,
    })
    .select()
    .single();

  if (battlerError) {
    console.error('Error creating battler:', battlerError);
    return NextResponse.json({ error: 'Failed to create battler' }, { status: 500 });
  }

  // Create attributes from allocation
  const battlerAttributes = {
    battler_id: battler.id,
    writing: allocated_attributes.writing,
    performance: allocated_attributes.performance,
    personal: {
      ...allocated_attributes.personal,
      preparation: 5, // Start with baseline preparation (not allocated)
    },
    resilience: allocated_attributes.resilience,
    public_knowledge: 10, // Start with baseline public knowledge
    xp: {},
  };

  const { data: attributes, error: attrError } = await supabase
    .from('battler_attributes')
    .insert(battlerAttributes)
    .select()
    .single();

  if (attrError) {
    console.error('Error creating attributes:', attrError);
    // Rollback battler creation
    await supabase.from('battlers').delete().eq('id', battler.id);
    return NextResponse.json({ error: 'Failed to create battler attributes' }, { status: 500 });
  }

  // Create ranking entry
  const { data: ranking, error: rankError } = await supabase
    .from('rankings')
    .insert({
      battler_id: battler.id,
      rating: 1200,
      wins: 0,
      losses: 0,
      streak: 0,
    })
    .select()
    .single();

  if (rankError) {
    console.error('Error creating ranking:', rankError);
    // Rollback
    await supabase.from('battler_attributes').delete().eq('battler_id', battler.id);
    await supabase.from('battlers').delete().eq('id', battler.id);
    return NextResponse.json({ error: 'Failed to create ranking' }, { status: 500 });
  }

  // First battle offers, ready before the player even reaches the dashboard —
  // a new battler should never stare at an empty inbox.
  try {
    const { generateOffersForPlayer } = await import('@/lib/services/battleOffers');
    await generateOffersForPlayer(supabase, battler.id, 2);
  } catch (offerError) {
    console.error('Initial offer generation failed (non-fatal):', offerError);
  }

  return NextResponse.json({
    battler,
    attributes,
    ranking,
  });
}
