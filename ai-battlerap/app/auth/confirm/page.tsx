'use client';

import { createClient } from '@/lib/db/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function AuthConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');

      if (!code) {
        setError('No authentication code provided');
        return;
      }

      const supabase = createClient();

      // Exchange code for session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Auth error:', exchangeError);
        setError(exchangeError.message);
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      // Check if user has a battler
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Authentication failed');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      const { data: battlers } = await supabase
        .from('battlers')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_ai', false)
        .limit(1);

      // Redirect based on battler existence
      if (!battlers || battlers.length === 0) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    };

    handleAuth();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18191c]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg">
        {error ? (
          <div>
            <h2 className="text-center text-xl font-bold text-red-500">
              Authentication Error
            </h2>
            <p className="mt-2 text-center text-sm text-zinc-400">
              {error}
            </p>
            <p className="mt-2 text-center text-xs text-zinc-500">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-center text-xl font-bold">
              Confirming authentication...
            </h2>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#18191c]">
        <div className="max-w-md w-full space-y-8 p-8 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg">
          <div>
            <h2 className="text-center text-xl font-bold">
              Loading...
            </h2>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthConfirmContent />
    </Suspense>
  );
}
