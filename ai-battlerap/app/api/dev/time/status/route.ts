import { NextResponse } from 'next/server';
import { getTimeStatus, isDevMode } from '@/lib/dev/timeManipulation';

/**
 * GET /api/dev/time/status
 *
 * Get current virtual time status
 */
export async function GET() {
  if (!isDevMode()) {
    return NextResponse.json(
      { error: 'Dev tools only available in development mode' },
      { status: 403 }
    );
  }

  const status = getTimeStatus();

  return NextResponse.json({
    ...status,
    message: status.devModeEnabled
      ? 'Dev mode active - virtual time enabled'
      : 'Dev mode disabled - using real time',
  });
}
