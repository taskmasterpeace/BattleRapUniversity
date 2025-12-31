import { NextRequest, NextResponse } from 'next/server';
import { advanceTime, getTimeStatus, isDevMode } from '@/lib/dev/timeManipulation';

/**
 * POST /api/dev/time/advance
 *
 * Advance virtual time by specified number of days
 *
 * Body: { days: number }
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
    const body = await req.json();
    const { days } = body;

    if (typeof days !== 'number' || days <= 0) {
      return NextResponse.json(
        { error: 'Invalid days parameter. Must be positive number.' },
        { status: 400 }
      );
    }

    // Advance time
    const newTime = advanceTime(days);

    // Get updated status
    const status = getTimeStatus();

    return NextResponse.json({
      success: true,
      message: `Advanced time by ${days} day(s)`,
      newVirtualTime: newTime.toISOString(),
      status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to advance time' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dev/time/advance (for testing)
 *
 * Returns current time status
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
    status,
    message: 'Use POST to advance time',
  });
}
