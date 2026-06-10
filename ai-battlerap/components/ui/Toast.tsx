'use client';

import { useEffect, useState } from 'react';

type ToastType = 'error' | 'success' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

// Module-level dispatch so any client component can call toast() directly.
let dispatch: ((toast: ToastItem) => void) | null = null;
let nextId = 1;

export function toast(message: string, type: ToastType = 'info') {
  if (dispatch) {
    dispatch({ id: nextId++, message, type });
  }
}

const TYPE_STYLES: Record<ToastType, string> = {
  error: 'border-red-500/50 text-red-400',
  success: 'border-green-500/50 text-green-400',
  info: 'border-[#ff8c42]/50 text-[#ff8c42]',
};

const DISMISS_MS = 4000;

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    dispatch = (item) => {
      setToasts((prev) => [...prev, item]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id));
      }, DISMISS_MS);
    };
    return () => {
      dispatch = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-fade-in-up max-w-sm rounded-lg bg-[#18191c] border-2 px-4 py-3 shadow-lg text-sm font-bold uppercase tracking-wide whitespace-pre-line ${TYPE_STYLES[t.type]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
