'use client';

// React Query provider — required so client pages using `useQuery` (e.g. the
// battler profile at app/battler/[id]/page.tsx) actually have a QueryClient in
// context. Without this, those pages crash with "No QueryClient set, use
// QueryClientProvider to set one".
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  // One client per browser tab — useState keeps it stable across re-renders
  // without re-creating it on every render.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Career/battler data doesn't change second-to-second; default to
            // a small stale window so tab-switching doesn't refetch constantly.
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
