'use client';

// Global error boundary — players see this instead of a raw Next.js crash screen.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-7xl mb-6">🎤💥</div>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-zinc-100 mb-3">
          MIC CHECK FAILED
        </h1>
        <p className="text-zinc-400 mb-8">
          Something went wrong backstage. Give it another shot — if it keeps
          happening, the crew is on it.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition"
          >
            TRY AGAIN
          </button>
          <a
            href="/dashboard"
            className="px-6 py-3 border-2 border-[#3a3d44] text-zinc-300 hover:border-zinc-500 font-display font-black uppercase tracking-wider transition"
          >
            DASHBOARD
          </a>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-zinc-700 font-mono">ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
