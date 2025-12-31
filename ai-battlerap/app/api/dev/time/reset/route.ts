import { NextRequest, NextResponse } from 'next/server';
import { resetVirtualTime, getTimeStatus, isDevMode } from '@/lib/dev/timeManipulation';

/**
 * POST /api/dev/time/reset
 *
 * Reset virtual time to real time (zero offset)
 */
export async function POST(req: NextRequest) {
  // Security check
  if (!isDevMode()) {
    return NextResponse.json(
      { error: 'Dev tools only available in development mode with DEV_MODE=true' },
      { status: 403 }
    );
  }

  try {
    // Reset time
    const realTime = resetVirtualTime();

    // Get updated status
    const status = getTimeStatus();

    return NextResponse.json({
      success: true,
      message: 'Virtual time reset to real time',
      realTime: realTime.toISOString(),
      status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to reset time' },
      { status: 500 }
    );
  }
}
