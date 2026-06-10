'use client';

import { createClient } from '@/lib/db/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const routeAfterAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: battlers } = await supabase
      .from('battlers')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_ai', false)
      .limit(1);

    router.push(!battlers || battlers.length === 0 ? '/onboarding' : '/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        // If email confirmation is disabled, a session exists now; otherwise sign in directly.
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError('Account created — check your email to confirm, then sign in.');
          setMode('signin');
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(
            signInError.message === 'Invalid login credentials'
              ? 'Wrong email or password.'
              : signInError.message
          );
          return;
        }
      }
      await routeAfterAuth();
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/confirm` },
    });
    if (oauthError) setError(oauthError.message);
  };

  // Dev-only one-click login, never rendered in production builds.
  const handleDevLogin = async () => {
    setBusy(true);
    const supabase = createClient();
    const devEmail = 'dev@test.com';
    const devPassword = 'password123';
    let { error: err } = await supabase.auth.signInWithPassword({ email: devEmail, password: devPassword });
    if (err) {
      await supabase.auth.signUp({ email: devEmail, password: devPassword });
      await supabase.auth.signInWithPassword({ email: devEmail, password: devPassword });
    }
    await routeAfterAuth();
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="max-w-md w-full animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-zinc-100">
              BATTLE RAP <span className="text-[#ff8c42]">UNIVERSITY</span>
            </h1>
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mt-2">
            BUILD YOUR LEGACY · ONE BATTLE AT A TIME
          </p>
        </div>

        <div className="bg-[#18191c] border-2 border-[#3a3d44] p-8">
          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`py-3 font-display font-black uppercase tracking-wider text-sm transition-colors border-2 ${
                mode === 'signin'
                  ? 'bg-[#ff8c42] text-black border-[#ff8c42]'
                  : 'bg-transparent text-zinc-400 border-[#3a3d44] hover:border-zinc-600'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`py-3 font-display font-black uppercase tracking-wider text-sm transition-colors border-2 ${
                mode === 'signup'
                  ? 'bg-[#ff8c42] text-black border-[#ff8c42]'
                  : 'bg-transparent text-zinc-400 border-[#3a3d44] hover:border-zinc-600'
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-[#3a3d44] text-zinc-100 placeholder-zinc-600 focus:border-[#ff8c42] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-[#3a3d44] text-zinc-100 placeholder-zinc-600 focus:border-[#ff8c42] focus:outline-none"
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? 'ONE SEC…' : mode === 'signup' ? '🎤 ENTER THE CIRCUIT' : 'SIGN IN'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#3a3d44]" />
            <span className="text-xs uppercase tracking-widest text-zinc-600">or</span>
            <div className="flex-1 h-px bg-[#3a3d44]" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full py-3 bg-[#0a0a0a] hover:bg-[#1f2024] border-2 border-[#3a3d44] hover:border-zinc-600 text-zinc-200 font-bold uppercase tracking-wider text-sm transition flex items-center justify-center gap-3 disabled:opacity-40"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              onClick={handleDevLogin}
              disabled={busy}
              className="w-full mt-3 py-2 border-2 border-dashed border-zinc-700 text-zinc-500 text-xs font-bold uppercase tracking-wider hover:text-zinc-300 transition"
            >
              ⚡ Dev quick login
            </button>
          )}
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6 uppercase tracking-wide">
          Public beta — your battler, your bars, your legacy.
        </p>
      </div>
    </div>
  );
}
