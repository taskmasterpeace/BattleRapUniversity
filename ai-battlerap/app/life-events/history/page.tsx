import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/db/server';
import LifeEventHistoryClient from '@/components/lifeEvents/LifeEventHistoryClient';

export default async function LifeEventHistoryPage() {
  const { user, battler } = await getPlayerBattler();

  if (!user) {
    redirect('/login');
  }

  if (!battler) {
    redirect('/onboarding');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch all resolved life events
  const { data: events, error } = await supabase
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
    .eq('battler_id', battler.id)
    .eq('status', 'resolved')
    .order('resolved_at', { ascending: false });

  if (error) {
    console.error('Error fetching life event history:', error);
  }

  return (
    <LifeEventHistoryClient
      events={events || []}
      battler={battler}
    />
  );
}
