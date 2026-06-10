// /verified — a verified battler's self-view: their linked profile with
// editable bio/avatar. Non-verified users get a friendly explainer + /claim link.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/server';
import { createServiceClient, hasRole } from '@/lib/auth/roles';
import VerifiedProfileClient from '@/components/verified/VerifiedProfileClient';

export const dynamic = 'force-dynamic';

export default async function VerifiedPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const supabase = createServiceClient();
  const verified = await hasRole(supabase, user.id, 'verified_battler');

  const { data: battler } = verified
    ? await supabase
        .from('battlers')
        .select(
          'id, stage_name, real_name, bio, avatar_url, tier, region, likeness_status, style_tags'
        )
        .eq('verified_user_id', user.id)
        .eq('is_real', true)
        .maybeSingle()
    : { data: null };

  if (!verified || !battler) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center animate-fade-in-up">
          <div className="bg-[#18191c] border-2 border-[#3a3d44] p-10">
            <div className="text-5xl mb-6">🎤</div>
            <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-zinc-100 mb-3">
              NOT VERIFIED <span className="text-[#ff8c42]">YET</span>
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed mb-8">
              This page is for real battlers who&apos;ve claimed their licensed profile.
              If that&apos;s you and you have a claim code from BRU staff, redeem it and this
              becomes your home base — edit your bio, manage your likeness, rep your record.
            </p>
            <Link
              href="/claim"
              className="inline-block px-8 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition"
            >
              CLAIM YOUR LEGACY
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [{ data: ranking }, { data: accolades }] = await Promise.all([
    supabase.from('rankings').select('rating, wins, losses, streak').eq('battler_id', battler.id).maybeSingle(),
    supabase
      .from('battler_accolades')
      .select('id, rank, title, scope, region, year')
      .eq('battler_id', battler.id)
      .order('created_at', { ascending: true }),
  ]);

  return (
    <VerifiedProfileClient
      battler={battler}
      ranking={ranking}
      accolades={accolades ?? []}
    />
  );
}
