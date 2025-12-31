import { redirect } from 'next/navigation';
import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import ProfileSettingsClient from '@/components/battler/ProfileSettingsClient';

export default async function ProfileSettingsPage() {
  const { user, battler } = await getPlayerBattler();

  if (!user) {
    redirect('/login');
  }

  if (!battler) {
    redirect('/onboarding');
  }

  return <ProfileSettingsClient battler={battler} />;
}
