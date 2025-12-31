import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { redirect } from 'next/navigation';
import OnboardingWizard from '@/components/battler/OnboardingWizard';

export default async function OnboardingPage() {
  const { user, battler } = await getPlayerBattler();

  if (!user) {
    redirect('/login');
  }

  // If user already has a battler, redirect to dashboard
  if (battler) {
    redirect('/dashboard');
  }

  return <OnboardingWizard />;
}
