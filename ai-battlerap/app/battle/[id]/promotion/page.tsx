import { createServerSupabaseClient } from '@/lib/db/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PromotionClient from './PromotionClient';

export const metadata = {
  title: 'Promotion Phase | Algorithm Institute',
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PromotionPage({ params }: Props) {
  const { id: battleId } = await params;
  const supabase = await createServerSupabaseClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's battler
  const { data: battler } = await supabase
    .from('battlers')
    .select('id, stage_name')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!battler) {
    redirect('/onboarding');
  }

  // Get battle details
  const { data: battle } = await supabase
    .from('battles')
    .select(`
      id,
      scheduled_at,
      lock_prep_at,
      status,
      league_id,
      battler_player_id,
      battler_ai_id,
      league:leagues!league_id(name, round_length_minutes),
      opponent:battlers!battler_ai_id(
        id,
        stage_name,
        region,
        avatar_url
      )
    `)
    .eq('id', battleId)
    .single();

  if (!battle) {
    redirect('/dashboard');
  }

  // Verify this is the player's battle
  if (battle.battler_player_id !== battler.id) {
    redirect('/dashboard');
  }

  // Can't do promotion after battle is completed
  if (battle.status === 'completed' || battle.status === 'simulated') {
    redirect(`/battle/${battleId}`);
  }

  // Get player's attributes (needed for success probabilities)
  const { data: playerAttributes } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', battler.id)
    .single();

  // Get relationship with opponent (if exists)
  const { data: relationship } = await supabase
    .from('battler_relationships')
    .select('*')
    .or(`and(battler_a_id.eq.${battler.id},battler_b_id.eq.${battle.battler_ai_id}),and(battler_a_id.eq.${battle.battler_ai_id},battler_b_id.eq.${battler.id})`)
    .eq('status', 'active')
    .single();

  // Get promotion events for this battle
  const { data: promotionEvents } = await supabase
    .from('promotion_events')
    .select('*')
    .eq('battle_id', battleId)
    .order('occurred_at', { ascending: false });

  // Get opponent's known scandals (for exposure options)
  const { data: opponentScandals } = await supabase
    .from('scandals')
    .select('*')
    .eq('battler_id', battle.battler_ai_id)
    .gte('week_expires', new Date().getTime() / (1000 * 60 * 60 * 24 * 7)) // Active scandals
    .order('intensity', { ascending: false })
    .limit(5);

  return (
    <PromotionClient
      battle={battle}
      playerBattler={battler}
      playerAttributes={playerAttributes}
      relationship={relationship}
      promotionEvents={promotionEvents || []}
      opponentScandals={opponentScandals || []}
    />
  );
}
