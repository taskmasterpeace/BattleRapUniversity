import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/db/server';
import LifeEventResolutionClient from '@/components/battler/LifeEventResolutionClient';

export default async function LifeEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, battler } = await getPlayerBattler();

  if (!user) {
    redirect('/login');
  }

  if (!battler) {
    redirect('/onboarding');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch the life event with template details
  const { data: event, error } = await supabase
    .from('battler_life_events')
    .select(`
      *,
      template:life_event_templates!battler_life_events_template_code_fkey(*),
      battle:battles(
        id,
        scheduled_at,
        ai_battler:battler_ai_id(stage_name)
      )
    `)
    .eq('id', id)
    .eq('battler_id', battler.id)
    .eq('status', 'pending')
    .single();

  if (error || !event) {
    redirect('/dashboard');
  }

  return (
    <LifeEventResolutionClient
      event={event}
      battler={battler}
    />
  );
}
