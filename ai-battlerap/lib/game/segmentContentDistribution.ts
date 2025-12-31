/**
 * Segment Content Distribution
 *
 * Distributes round-level content choices across individual segments.
 * Creates realistic battle flow where content types vary segment-by-segment.
 */

import type { ContentType, DeliveryType, PerformanceType } from './contentTypes';

export interface SegmentContentAssignment {
  segmentIndex: number;
  primaryContent: ContentType;
  secondaryContent: ContentType | null;
  delivery: DeliveryType;
  performance: PerformanceType;
  effectiveness: number;
}

export interface SegmentData {
  segmentIndex: number;
  score: number;
  eventFlags: string[]; // ['haymaker', 'stumble', 'choke']
}

export interface ContentDistributionInput {
  roundContentTypes: ContentType[];
  roundDeliveryTypes: DeliveryType[];
  roundPerformanceTypes: PerformanceType[];
  segments: SegmentData[];
  battlerBadges: string[];
}

/**
 * Distribute round-level content across segments
 *
 * Strategy:
 * 1. Identify high-performing segments (haymakers) - get battler's signature content
 * 2. Distribute all round content types to ensure variety
 * 3. Low-performing segments get weaker content or less effective types
 * 4. Vary delivery/performance to create realistic flow
 * 5. Create hybrid segments (2 content types) for higher-scoring moments
 */
export function distributeContentAcrossSegments(
  input: ContentDistributionInput
): SegmentContentAssignment[] {
  const {
    roundContentTypes,
    roundDeliveryTypes,
    roundPerformanceTypes,
    segments,
    battlerBadges,
  } = input;

  const assignments: SegmentContentAssignment[] = [];

  // Sort content types by battler badge alignment (strongest content first)
  const sortedContent = prioritizeContentByBadges(roundContentTypes, battlerBadges);

  // Identify segment tiers based on scores
  const avgScore = segments.reduce((sum, s) => sum + s.score, 0) / segments.length;
  const highScoringSegments = segments.filter((s) => s.score >= avgScore + 1.5);
  const midScoringSegments = segments.filter(
    (s) => s.score < avgScore + 1.5 && s.score > avgScore - 1.5
  );
  const lowScoringSegments = segments.filter((s) => s.score <= avgScore - 1.5);

  // Track which content types have been assigned
  const contentUsageCount = new Map<ContentType, number>();
  sortedContent.forEach((c) => contentUsageCount.set(c, 0));

  // Assign content to segments (prioritize high-scoring first)
  for (const segment of segments) {
    const isHaymaker = segment.eventFlags.includes('haymaker');
    const isStumble = segment.eventFlags.includes('stumble');
    const isChoke = segment.eventFlags.includes('choke');

    let primaryContent: ContentType;
    let secondaryContent: ContentType | null = null;

    if (isHaymaker || highScoringSegments.includes(segment)) {
      // Haymakers/high segments: Use battler's signature content (first in sorted list)
      // Potentially create hybrid segment (2 content types) for extra impact
      primaryContent = sortedContent[0];
      if (sortedContent.length > 1 && Math.random() > 0.4) {
        // 60% chance of hybrid content in haymakers
        secondaryContent = sortedContent[1];
        contentUsageCount.set(sortedContent[1], (contentUsageCount.get(sortedContent[1]) || 0) + 1);
      }
      contentUsageCount.set(primaryContent, (contentUsageCount.get(primaryContent) || 0) + 1);
    } else if (isStumble || isChoke || lowScoringSegments.includes(segment)) {
      // Low segments: Use least-aligned content (end of sorted list)
      primaryContent = sortedContent[sortedContent.length - 1];
      contentUsageCount.set(primaryContent, (contentUsageCount.get(primaryContent) || 0) + 1);
    } else {
      // Mid segments: Ensure variety - use least-used content type
      const leastUsed = getLeastUsedContent(contentUsageCount, sortedContent);
      primaryContent = leastUsed;
      contentUsageCount.set(primaryContent, (contentUsageCount.get(primaryContent) || 0) + 1);
    }

    // Assign delivery (vary between options)
    const delivery = roundDeliveryTypes[segment.segmentIndex % roundDeliveryTypes.length];

    // Assign performance (vary between options)
    const performance =
      roundPerformanceTypes[segment.segmentIndex % roundPerformanceTypes.length];

    // Effectiveness based on segment performance
    // High segments = 1.2-1.5x, mid = 0.9-1.1x, low = 0.6-0.9x
    let effectiveness = 1.0;
    if (isHaymaker) {
      effectiveness = 1.3 + Math.random() * 0.2; // 1.3-1.5x
    } else if (highScoringSegments.includes(segment)) {
      effectiveness = 1.1 + Math.random() * 0.2; // 1.1-1.3x
    } else if (lowScoringSegments.includes(segment) || isStumble) {
      effectiveness = 0.6 + Math.random() * 0.3; // 0.6-0.9x
    } else if (isChoke) {
      effectiveness = 0.4 + Math.random() * 0.2; // 0.4-0.6x (terrible)
    } else {
      effectiveness = 0.9 + Math.random() * 0.2; // 0.9-1.1x
    }

    assignments.push({
      segmentIndex: segment.segmentIndex,
      primaryContent,
      secondaryContent,
      delivery,
      performance,
      effectiveness,
    });
  }

  return assignments;
}

/**
 * Prioritize content types based on battler's badges
 * Content aligned with badges goes first (strongest)
 */
function prioritizeContentByBadges(
  contentTypes: ContentType[],
  battlerBadges: string[]
): ContentType[] {
  // Badge-to-content-type mapping
  const badgeContentAlignment: Record<string, ContentType[]> = {
    // Writing/Content badges
    'Wordplay Wizard': ['wordplay', 'schemes'],
    'Punchline King': ['punchlines', 'wordplay'],
    'Pen Game Elite': ['wordplay', 'schemes', 'storytelling'],
    'Scheme Specialist': ['schemes', 'wordplay'],
    'Enhanced Storyteller': ['storytelling', 'personals'],
    'Comedy': ['comedy', 'pop_culture_refs'],
    'Shock Value': ['shock_value', 'personals'],
    'Political Commentary': ['social_commentary', 'storytelling'],

    // Performance/Delivery badges
    'Aggressive': ['gun_bars', 'shock_value', 'personals'],
    'Crowd Favorite': ['comedy', 'pop_culture_refs', 'name_flips'],
    'Freestyle Genius': ['freestyles', 'rebuttals'],
    'Stage Domination': ['personals', 'punchlines'],

    // Reputation badges
    'Street Cred': ['gun_bars', 'street_talk'],
    'Underground Legend': ['street_talk', 'freestyles'],
    'Veteran': ['storytelling', 'personals'],
  };

  // Score each content type by badge alignment
  const contentScores = new Map<ContentType, number>();
  contentTypes.forEach((content) => contentScores.set(content, 0));

  for (const badge of battlerBadges) {
    const alignedContent = badgeContentAlignment[badge];
    if (alignedContent) {
      for (const content of alignedContent) {
        if (contentScores.has(content)) {
          // Increase score if badge aligns with this content
          contentScores.set(content, (contentScores.get(content) || 0) + 1);
        }
      }
    }
  }

  // Sort content types by score (highest first = most aligned with badges)
  return [...contentTypes].sort((a, b) => {
    const scoreA = contentScores.get(a) || 0;
    const scoreB = contentScores.get(b) || 0;
    return scoreB - scoreA; // Descending
  });
}

/**
 * Get the least-used content type to ensure variety
 */
function getLeastUsedContent(
  usageCount: Map<ContentType, number>,
  availableContent: ContentType[]
): ContentType {
  let leastUsed = availableContent[0];
  let minCount = usageCount.get(leastUsed) || 0;

  for (const content of availableContent) {
    const count = usageCount.get(content) || 0;
    if (count < minCount) {
      minCount = count;
      leastUsed = content;
    }
  }

  return leastUsed;
}

/**
 * Get a summary of content distribution for logging/debugging
 */
export function getContentDistributionSummary(
  assignments: SegmentContentAssignment[]
): string {
  const contentCounts: Record<string, number> = {};
  let haymakers = 0;

  for (const assignment of assignments) {
    // Count primary content
    contentCounts[assignment.primaryContent] =
      (contentCounts[assignment.primaryContent] || 0) + 1;

    // Count secondary content if present
    if (assignment.secondaryContent) {
      contentCounts[assignment.secondaryContent] =
        (contentCounts[assignment.secondaryContent] || 0) + 1;
    }

    // Count haymakers
    if (assignment.effectiveness >= 1.3) {
      haymakers++;
    }
  }

  const parts: string[] = [];
  for (const [content, count] of Object.entries(contentCounts)) {
    parts.push(`${content}×${count}`);
  }

  return `[${parts.join(', ')}] (${haymakers} haymakers)`;
}
