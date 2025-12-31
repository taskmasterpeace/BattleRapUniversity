'use client';

import { createClient } from '@/lib/db/client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const autoLogin = async () => {
      const supabase = createClient();

      // Auto sign up/in with dev account
      const devEmail = 'dev@test.com';
      const devPassword = 'password123';

      // Try to sign in first
      let { error } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: devPassword,
      });

      // If sign in fails, sign up
      if (error) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: devEmail,
          password: devPassword,
        });

        if (signUpError) {
          console.error('Auto signup failed:', signUpError);
          return;
        }

        // Sign in after signup
        await supabase.auth.signInWithPassword({
          email: devEmail,
          password: devPassword,
        });
      }

      // Check if user has a battler
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: battlers } = await supabase
          .from('battlers')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_ai', false)
          .limit(1);

        if (!battlers || battlers.length === 0) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }
    };

    autoLogin();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18191c]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg">
        <div>
          <h2 className="text-center text-3xl font-bold">
            Auto-logging in...
          </h2>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
