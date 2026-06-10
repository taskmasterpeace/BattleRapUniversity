'use client';

// Copy-current-URL button for the public Power Rankings page.
import { useState } from 'react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard API unavailable (http / old browser) — fall back to a prompt-free select hack
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className={`px-4 py-2.5 text-xs sm:text-sm font-display font-black uppercase tracking-wider border-2 transition whitespace-nowrap ${
        copied
          ? 'border-green-500 text-green-500 bg-green-500/10'
          : 'border-[#3a3d44] text-zinc-300 bg-[#101114] hover:border-[#ff8c42] hover:text-[#ff8c42]'
      }`}
      aria-live="polite"
    >
      {copied ? '✓ LINK COPIED' : '🔗 SHARE'}
    </button>
  );
}
