/**
 * Venue booking (2026-08-31, owner spec): a battle happens in a real ROOM.
 * Leagues book venues in their home city sized to their draw — a P2 league
 * runs basements and barbershops, a P10 league runs the grand theater. The
 * hottest matchups (or a premier league's marquee night) book the city's
 * biggest room and go out on NATIONAL TV.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type BookedVenue = {
  venueId: string | null;
  tvBroadcast: boolean;
};

/** League prestige → the venue-prestige band that league can book. */
export function bandFor(prestige: number): [number, number] {
  if (prestige <= 2) return [1, 3];
  if (prestige <= 4) return [2, 4];
  if (prestige <= 6) return [4, 7];
  return [7, 10];
}

export async function bookVenueForBattle(
  supabase: SupabaseClient,
  league: { id: string; city_id?: string | null; prestige_level?: number | null },
  battlerAId: string,
  battlerBId: string
): Promise<BookedVenue> {
  const prestige = league.prestige_level ?? 3;

  // Online leagues battle from the virtual rooms.
  if (!league.city_id) {
    const { data: virtualRooms } = await supabase
      .from('venues')
      .select('id, venue_type:venue_type_id!inner(tier)')
      .is('city_id', null)
      .eq('is_active', true);
    const pick = virtualRooms?.[Math.floor(Math.random() * (virtualRooms?.length ?? 0))];
    return { venueId: pick?.id ?? null, tvBroadcast: false };
  }

  const { data: rooms } = await supabase
    .from('venues')
    .select('id, name, prestige_level')
    .eq('city_id', league.city_id)
    .eq('is_active', true)
    .order('prestige_level');

  if (!rooms || rooms.length === 0) return { venueId: null, tvBroadcast: false };

  // SPECIAL EVENT — a white-hot grudge, or a premier league's marquee night,
  // books the city's biggest room and goes out on national TV.
  let special = false;
  try {
    const { data: rel } = await supabase
      .from('battler_relationships')
      .select('intensity')
      .or(
        `and(battler_a_id.eq.${battlerAId},battler_b_id.eq.${battlerBId}),and(battler_a_id.eq.${battlerBId},battler_b_id.eq.${battlerAId})`
      )
      .limit(1)
      .maybeSingle();
    if ((rel?.intensity ?? 0) >= 85) special = true;
  } catch {
    // no relationship system — never blocks booking
  }
  if (!special && prestige >= 8 && Math.random() < 0.15) special = true;

  if (special) {
    const biggest = rooms[rooms.length - 1];
    return { venueId: biggest.id, tvBroadcast: true };
  }

  const [lo, hi] = bandFor(prestige);
  let candidates = rooms.filter((r) => r.prestige_level >= lo && r.prestige_level <= hi);
  if (candidates.length === 0) candidates = rooms; // small city — take what exists
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return { venueId: pick.id, tvBroadcast: false };
}
