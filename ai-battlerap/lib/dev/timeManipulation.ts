/**
 * Virtual Time System for Development/Testing
 *
 * Allows fast-forwarding through time-based game mechanics
 * without waiting for real-world time to pass.
 *
 * Only active when DEV_MODE=true
 */

/**
 * In-memory storage for virtual time offset
 * Resets when server restarts (intentional for dev)
 */
let virtualTimeOffset: number = 0; // milliseconds

/**
 * Check if dev mode is enabled
 */
export function isDevMode(): boolean {
  return process.env.DEV_MODE === 'true' && process.env.NODE_ENV === 'development';
}

/**
 * Get current virtual time
 * If dev mode disabled, returns real time
 */
export function getVirtualNow(): Date {
  if (!isDevMode()) {
    return new Date();
  }
  return new Date(Date.now() + virtualTimeOffset);
}

/**
 * Get virtual time as ISO string (common format for Supabase)
 */
export function getVirtualNowISO(): string {
  return getVirtualNow().toISOString();
}

/**
 * Advance virtual time by specified number of days
 * @param days Number of days to advance (can be fractional)
 * @returns New virtual time
 */
export function advanceTime(days: number): Date {
  if (!isDevMode()) {
    throw new Error('Time manipulation only available in dev mode');
  }

  const milliseconds = days * 24 * 60 * 60 * 1000;
  virtualTimeOffset += milliseconds;

  return getVirtualNow();
}

/**
 * Set virtual time to specific date
 * @param targetDate Target date to set
 * @returns New virtual time
 */
export function setVirtualTime(targetDate: Date): Date {
  if (!isDevMode()) {
    throw new Error('Time manipulation only available in dev mode');
  }

  virtualTimeOffset = targetDate.getTime() - Date.now();

  return getVirtualNow();
}

/**
 * Reset virtual time to real time (zero offset)
 */
export function resetVirtualTime(): Date {
  if (!isDevMode()) {
    throw new Error('Time manipulation only available in dev mode');
  }

  virtualTimeOffset = 0;

  return getVirtualNow();
}

/**
 * Get current time offset status
 */
export function getTimeStatus(): {
  devModeEnabled: boolean;
  virtualDate: string;
  realDate: string;
  offsetDays: number;
  offsetMs: number;
} {
  const now = new Date();
  const virtual = getVirtualNow();

  return {
    devModeEnabled: isDevMode(),
    virtualDate: virtual.toISOString(),
    realDate: now.toISOString(),
    offsetDays: virtualTimeOffset / (24 * 60 * 60 * 1000),
    offsetMs: virtualTimeOffset,
  };
}

/**
 * Calculate date in the future (virtual-time aware)
 * @param days Number of days from now
 * @returns Future date
 */
export function getFutureDate(days: number): Date {
  const base = getVirtualNow();
  return new Date(base.getTime() + (days * 24 * 60 * 60 * 1000));
}

/**
 * Calculate date in the future as ISO string
 * @param days Number of days from now
 * @returns Future date as ISO string
 */
export function getFutureDateISO(days: number): string {
  return getFutureDate(days).toISOString();
}

/**
 * Check if a date is in the past (virtual-time aware)
 * @param date Date to check
 * @returns True if date is before virtual now
 */
export function isPast(date: Date | string): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return checkDate <= getVirtualNow();
}

/**
 * Check if a date is in the future (virtual-time aware)
 * @param date Date to check
 * @returns True if date is after virtual now
 */
export function isFuture(date: Date | string): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return checkDate > getVirtualNow();
}

/**
 * Get days between two dates (virtual-time aware for "now")
 * @param date1 First date (or "now" for virtual now)
 * @param date2 Second date
 * @returns Number of days between dates
 */
export function daysBetween(date1: Date | string | 'now', date2: Date | string): number {
  const d1 = date1 === 'now' ? getVirtualNow() : (typeof date1 === 'string' ? new Date(date1) : date1);
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  const diffMs = d2.getTime() - d1.getTime();
  return diffMs / (24 * 60 * 60 * 1000);
}
