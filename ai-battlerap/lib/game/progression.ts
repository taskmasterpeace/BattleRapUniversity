import type { BattlerAttributes, BattleRound } from '@/lib/models';
import { checkBadgeEarning, applyEarnedBadges } from './badgeEarning';

/**
 * Configuration for attribute progression
 * These values can be tuned in Phase 7
 */
const PROGRESSION_CONFIG = {
  HIGH_SCORE_THRESHOLD: 7.0, // Average score threshold for "good performance"
  HIGH_CROWD_THRESHOLD: 75, // Crowd reaction threshold for "good performance"
  HAYMAKER_THRESHOLD: 8.5, // Peak score threshold for haymaker bonus
  BASE_WRITING_GAIN: 0.05, // Base improvement for writing attributes
  BASE_PERFORMANCE_GAIN: 0.05, // Base improvement for performance attributes
  BASE_RESILIENCE_GAIN: 0.05, // Base improvement for resilience
  WINNER_BONUS: 0.02, // Bonus applied to all attributes for winning
  HAYMAKER_BONUS: 0.1, // Bonus for creativity/wordplay on haymaker
  LOSER_PENALTY: 0.5, // Multiplier for losing battles (50% of normal gains)
  ATTRIBUTE_CAP: 10.0, // Maximum attribute value
  MAX_TOTAL_GAIN: 0.3, // Maximum total gain per battle across all attributes
};

/**
 * Calculate attribute improvements based on battle performance
 */
export async function applyAttributeProgression(
  battleId: string,
  supabase: any,
  forBattlerId?: string
): Promise<void> {
  // 1. Load battle data
  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single();

  if (!battle || battle.status !== 'completed') {
    console.log(`Battle ${battleId} not completed, skipping progression`);
    return;
  }

  // 2. Load battle rounds for analysis
  const { data: rounds } = await supabase
    .from('battle_rounds')
    .select('*')
    .eq('battle_id', battleId);

  if (!rounds || rounds.length === 0) {
    console.log(`No rounds found for battle ${battleId}`);
    return;
  }

  // 3. Apply progression to the human battler. Defaults to the battle's
  //    battler_player_id; PvP battles pass each side explicitly so BOTH
  //    humans progress (AI battlers are skipped below either way).
  const playerBattlerId = forBattlerId ?? battle.battler_player_id;
  const { data: battler } = await supabase
    .from('battlers')
    .select('is_ai')
    .eq('id', playerBattlerId)
    .single();

  // Only apply progression to human players
  if (battler?.is_ai) {
    console.log(`Battler ${playerBattlerId} is AI, skipping progression`);
    return;
  }

  // 4. Calculate improvements
  const improvements = calculateImprovements(
    playerBattlerId,
    battle.winner_battler_id,
    rounds
  );

  // 5. Load current attributes
  const { data: currentAttributes } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', playerBattlerId)
    .single();

  if (!currentAttributes) {
    console.log(`No attributes found for battler ${playerBattlerId}`);
    return;
  }

  // 6. Apply improvements (with cap at 10.0)
  const newAttributes = applyImprovements(currentAttributes, improvements);

  // 7. Update database
  await supabase
    .from('battler_attributes')
    .update({
      writing: newAttributes.writing,
      performance: newAttributes.performance,
      resilience: newAttributes.resilience,
      updated_at: new Date().toISOString(),
    })
    .eq('battler_id', playerBattlerId);

  console.log(`Applied attribute progression for battler ${playerBattlerId}:`, improvements);

  // 8. Check for newly earned badges
  const badgeResult = await checkBadgeEarning(battleId, playerBattlerId, supabase);
  if (badgeResult.badgesEarned.length > 0) {
    await applyEarnedBadges(playerBattlerId, badgeResult.badgesEarned, supabase);
    console.log(`Earned ${badgeResult.badgesEarned.length} new badges:`, badgeResult.badgesEarned);
  }

  // 9. Check for level-up and award XP
  const { checkLevelUp } = await import('./xpLevels');
  const levelUpResult = await checkLevelUp(battleId, playerBattlerId, supabase);

  console.log(`XP awarded: ${levelUpResult.xpEarned} (Level ${levelUpResult.previousLevel} → ${levelUpResult.newLevel})`);
  if (levelUpResult.leveledUp) {
    console.log(`🎉 LEVEL UP! Earned ${levelUpResult.skillPointsEarned} skill points`);
  }

  // 10. Save progression snapshot for PostBattleSummary
  await saveProgressionSnapshot(
    battleId,
    playerBattlerId,
    currentAttributes,
    newAttributes,
    improvements,
    badgeResult.badgesEarned,
    levelUpResult,
    supabase
  );
}

/**
 * Calculate attribute improvements based on performance
 */
function calculateImprovements(
  playerBattlerId: string,
  winnerId: string,
  allRounds: BattleRound[]
): AttributeImprovements {
  const improvements: AttributeImprovements = {
    lyricism: 0,
    wordplay: 0,
    creativity: 0,
    stage_presence: 0,
    crowd_control: 0,
    delivery: 0,
    resilience: 0,
  };

  // Filter to get only player rounds
  const playerRounds = allRounds.filter((r) => r.battler_id === playerBattlerId);

  if (playerRounds.length === 0) {
    return improvements;
  }

  // Calculate averages across all rounds
  const avgScore =
    playerRounds.reduce((sum, r) => sum + r.average_score, 0) / playerRounds.length;
  const avgCrowd =
    playerRounds.reduce((sum, r) => sum + r.crowd_reaction, 0) / playerRounds.length;
  const maxPeak = Math.max(...playerRounds.map((r) => r.peak_score));
  const anyChoke = playerRounds.some((r) => r.choked);
  const playerWon = winnerId === playerBattlerId;

  // Writing performance bonus
  if (avgScore >= PROGRESSION_CONFIG.HIGH_SCORE_THRESHOLD) {
    improvements.lyricism += PROGRESSION_CONFIG.BASE_WRITING_GAIN;
    improvements.wordplay += PROGRESSION_CONFIG.BASE_WRITING_GAIN;
    improvements.creativity += PROGRESSION_CONFIG.BASE_WRITING_GAIN;
  }

  // Performance bonus (crowd reaction)
  if (avgCrowd >= PROGRESSION_CONFIG.HIGH_CROWD_THRESHOLD) {
    improvements.stage_presence += PROGRESSION_CONFIG.BASE_PERFORMANCE_GAIN;
    improvements.crowd_control += PROGRESSION_CONFIG.BASE_PERFORMANCE_GAIN;
    improvements.delivery += PROGRESSION_CONFIG.BASE_PERFORMANCE_GAIN;
  }

  // No choke resilience bonus
  if (!anyChoke) {
    improvements.resilience += PROGRESSION_CONFIG.BASE_RESILIENCE_GAIN;
  }

  // Haymaker bonus (creativity spike)
  if (maxPeak >= PROGRESSION_CONFIG.HAYMAKER_THRESHOLD) {
    improvements.creativity += PROGRESSION_CONFIG.HAYMAKER_BONUS;
    improvements.wordplay += PROGRESSION_CONFIG.HAYMAKER_BONUS * 0.5; // Smaller bonus to wordplay
  }

  // Winner bonus (small boost to everything)
  if (playerWon) {
    Object.keys(improvements).forEach((key) => {
      improvements[key as keyof AttributeImprovements] += PROGRESSION_CONFIG.WINNER_BONUS;
    });
  } else {
    // Loser penalty (reduced gains)
    Object.keys(improvements).forEach((key) => {
      improvements[key as keyof AttributeImprovements] *= PROGRESSION_CONFIG.LOSER_PENALTY;
    });
  }

  // Cap total improvements to prevent too much growth per battle
  const totalGain = Object.values(improvements).reduce((sum, val) => sum + val, 0);
  if (totalGain > PROGRESSION_CONFIG.MAX_TOTAL_GAIN) {
    const scaleFactor = PROGRESSION_CONFIG.MAX_TOTAL_GAIN / totalGain;
    Object.keys(improvements).forEach((key) => {
      improvements[key as keyof AttributeImprovements] *= scaleFactor;
    });
  }

  return improvements;
}

/**
 * Apply improvements to current attributes
 */
function applyImprovements(
  current: BattlerAttributes,
  improvements: AttributeImprovements
): BattlerAttributes {
  return {
    ...current,
    writing: {
      lyricism: capAttribute(current.writing.lyricism + improvements.lyricism),
      wordplay: capAttribute(current.writing.wordplay + improvements.wordplay),
      creativity: capAttribute(current.writing.creativity + improvements.creativity),
    },
    performance: {
      stage_presence: capAttribute(
        current.performance.stage_presence + improvements.stage_presence
      ),
      crowd_control: capAttribute(
        current.performance.crowd_control + improvements.crowd_control
      ),
      delivery: capAttribute(current.performance.delivery + improvements.delivery),
    },
    resilience: capAttribute(current.resilience + improvements.resilience),
  };
}

/**
 * Cap attribute value at maximum
 */
function capAttribute(value: number): number {
  // Handle invalid values (NaN, Infinity)
  if (!isFinite(value)) return 5; // Return default mid-tier value
  return Math.min(PROGRESSION_CONFIG.ATTRIBUTE_CAP, Math.max(1, value));
}

/**
 * Interface for attribute improvements
 */
interface AttributeImprovements {
  lyricism: number;
  wordplay: number;
  creativity: number;
  stage_presence: number;
  crowd_control: number;
  delivery: number;
  resilience: number;
}

/**
 * Save battle progression snapshot for PostBattleSummary display
 */
async function saveProgressionSnapshot(
  battleId: string,
  battlerId: string,
  oldAttributes: BattlerAttributes,
  newAttributes: BattlerAttributes,
  improvements: AttributeImprovements,
  badgesEarned: string[],
  levelUpResult: any, // LevelUpResult from xpLevels.ts
  supabase: any
): Promise<void> {
  // Get rating before/after
  const { data: ranking } = await supabase
    .from('rankings')
    .select('rating')
    .eq('battler_id', battlerId)
    .single();

  const ratingAfter = ranking?.rating || 1200;

  // Get battle to calculate rating change
  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single();

  // Calculate approximate rating change (will be updated when we implement proper ELO)
  const playerWon = battle?.winner_battler_id === battlerId;
  const ratingChange = playerWon ? 15 : -15; // Simplified for now
  const ratingBefore = ratingAfter - ratingChange;

  // Get fan data before/after
  const { data: fanData } = await supabase
    .from('battler_fans')
    .select('*')
    .eq('battler_id', battlerId)
    .single();

  // Calculate fan growth (simplified - will be enhanced when we implement fan system fully)
  const fansAfter = fanData?.total_fans || 0;
  const fansGained = playerWon ? Math.floor(fansAfter * 0.05) : Math.floor(fansAfter * 0.01); // 5% for win, 1% for loss
  const fansBefore = fansAfter - fansGained;

  // Get battle views
  const { data: battleViews } = await supabase
    .from('battle_views')
    .select('total_views, view_tier')
    .eq('battle_id', battleId)
    .single();

  // Build attribute changes object
  const attributeChanges = {
    lyricism: {
      before: oldAttributes.writing.lyricism,
      after: newAttributes.writing.lyricism,
      change: improvements.lyricism,
    },
    wordplay: {
      before: oldAttributes.writing.wordplay,
      after: newAttributes.writing.wordplay,
      change: improvements.wordplay,
    },
    creativity: {
      before: oldAttributes.writing.creativity,
      after: newAttributes.writing.creativity,
      change: improvements.creativity,
    },
    stage_presence: {
      before: oldAttributes.performance.stage_presence,
      after: newAttributes.performance.stage_presence,
      change: improvements.stage_presence,
    },
    crowd_control: {
      before: oldAttributes.performance.crowd_control,
      after: newAttributes.performance.crowd_control,
      change: improvements.crowd_control,
    },
    delivery: {
      before: oldAttributes.performance.delivery,
      after: newAttributes.performance.delivery,
      change: improvements.delivery,
    },
    resilience: {
      before: oldAttributes.resilience,
      after: newAttributes.resilience,
      change: improvements.resilience,
    },
  };

  // Get stress data (top-level column on battler_attributes)
  const stressBefore = oldAttributes.stress || 0;
  const stressAfter = newAttributes.stress || 0;
  const stressChange = stressAfter - stressBefore;

  // Save progression snapshot (including XP data)
  const { error: snapshotError } = await supabase.from('battle_progression').insert({
    battle_id: battleId,
    battler_id: battlerId,
    rating_before: ratingBefore,
    rating_after: ratingAfter,
    rating_change: ratingChange,
    attribute_changes: attributeChanges,
    badges_earned: badgesEarned,
    stress_before: stressBefore,
    stress_after: stressAfter,
    stress_change: stressChange,
    total_views: battleViews?.total_views || 0,
    view_tier: battleViews?.view_tier || 'low',
    fans_before: fansBefore,
    fans_after: fansAfter,
    fans_gained: fansGained,
    trending_before: fanData?.trending_score || 0,
    trending_after: fanData?.trending_score || 0,
    trending_change: 0, // Will be calculated when fan system is fully implemented
    xp_earned: levelUpResult.xpEarned,
    xp_breakdown: levelUpResult.xpBreakdown,
    level_before: levelUpResult.previousLevel,
    level_after: levelUpResult.newLevel,
    skill_points_earned: levelUpResult.skillPointsEarned,
  });

  if (snapshotError) {
    // Don't fail progression for a snapshot miss, but never swallow it silently
    console.error(
      `Failed to save progression snapshot for battle ${battleId}, battler ${battlerId}:`,
      snapshotError.message
    );
    return;
  }

  console.log(`Saved progression snapshot for battle ${battleId}, battler ${battlerId}`);
}
