import { notFound } from 'next/navigation';
import DevToolsClient from './DevToolsClient';

/**
 * Dev tools (time manipulation) — development builds only.
 * In production this route 404s; the backing /api/dev/time/* endpoints are
 * additionally gated by isDevMode() server-side.
 */
export default function DevToolsPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }
  return <DevToolsClient />;
}
