import Link from 'next/link';

// Global 404 — keeps lost players in the world instead of a bare error page.
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-7xl mb-6">🔇</div>
        <h1 className="text-5xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-3">
          404
        </h1>
        <h2 className="text-2xl font-display font-black uppercase tracking-tight text-zinc-100 mb-3">
          THIS STAGE DOESN&apos;T EXIST
        </h2>
        <p className="text-zinc-400 mb-8">
          Whatever you were looking for got bodied. Head back to the circuit.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition"
        >
          BACK TO DASHBOARD
        </Link>
      </div>
    </div>
  );
}
