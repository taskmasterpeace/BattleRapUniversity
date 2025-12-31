'use client';

import { useState, useEffect, useCallback } from 'react';

const SHOWN_BADGES_KEY = 'shown_badges';

export function useBadgeQueue(badges: string[], autoAdvance: boolean = true, advanceDelay: number = 5000) {
  const [queue, setQueue] = useState<string[]>([]);
  const [currentBadge, setCurrentBadge] = useState<string | null>(null);
  const [shownBadges, setShownBadges] = useState<Set<string>>(new Set());

  // Load shown badges from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SHOWN_BADGES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setShownBadges(new Set(parsed));
      }
    } catch (error) {
      console.error('Failed to load shown badges from localStorage:', error);
    }
  }, []);

  // Initialize queue with new badges
  useEffect(() => {
    if (badges && badges.length > 0) {
      // Filter out badges that have already been shown
      const newBadges = badges.filter(badge => !shownBadges.has(badge));

      if (newBadges.length > 0) {
        setQueue(newBadges);
        // Start showing the first badge if not already showing one
        if (!currentBadge && newBadges.length > 0) {
          setCurrentBadge(newBadges[0]);
        }
      }
    }
  }, [badges, shownBadges, currentBadge]);

  // Mark badge as shown and save to localStorage
  const markBadgeAsShown = useCallback((badge: string) => {
    setShownBadges(prev => {
      const updated = new Set(prev);
      updated.add(badge);

      // Save to localStorage
      try {
        localStorage.setItem(SHOWN_BADGES_KEY, JSON.stringify(Array.from(updated)));
      } catch (error) {
        console.error('Failed to save shown badges to localStorage:', error);
      }

      return updated;
    });
  }, []);

  // Dismiss current badge and advance to next
  const dismiss = useCallback(() => {
    if (currentBadge) {
      markBadgeAsShown(currentBadge);

      // Remove from queue
      const updatedQueue = queue.filter(b => b !== currentBadge);
      setQueue(updatedQueue);

      // Show next badge if available
      if (updatedQueue.length > 0) {
        setCurrentBadge(updatedQueue[0]);
      } else {
        setCurrentBadge(null);
      }
    }
  }, [currentBadge, queue, markBadgeAsShown]);

  // Clear all badges from queue and localStorage
  const clear = useCallback(() => {
    // Mark all current queue items as shown
    queue.forEach(badge => markBadgeAsShown(badge));

    setQueue([]);
    setCurrentBadge(null);
  }, [queue, markBadgeAsShown]);

  // Reset shown badges (for testing/debugging)
  const reset = useCallback(() => {
    setShownBadges(new Set());
    try {
      localStorage.removeItem(SHOWN_BADGES_KEY);
    } catch (error) {
      console.error('Failed to clear shown badges from localStorage:', error);
    }
  }, []);

  // Get count of remaining badges
  const remainingCount = queue.length;
  const hasMore = remainingCount > 0;

  return {
    currentBadge,
    hasMore,
    remainingCount,
    dismiss,
    clear,
    reset,
  };
}
