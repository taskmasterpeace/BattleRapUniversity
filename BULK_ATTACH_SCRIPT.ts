/**
 * Bulk Sprite Image Attachment Script
 * Purpose: Automatically scan sprite directories and attach URLs to database records
 * Usage: npx tsx BULK_ATTACH_SCRIPT.ts [category] [--dry-run] [--verbose]
 *
 * This script:
 * 1. Scans /public/sprites/ directories
 * 2. Parses sprite file names
 * 3. Matches files to database records
 * 4. Generates SQL UPDATE statements
 * 5. Optionally executes updates or outputs SQL for manual review
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SPRITES_ROOT = path.join(process.cwd(), "public", "sprites");

// Supabase client (service role for direct DB access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================================================
// TYPES
// ============================================================================

interface AttachmentResult {
  totalFiles: number;
  matchedRecords: number;
  unmatchedFiles: string[];
  orphanedRecords: string[];
  updates: DatabaseUpdate[];
}

interface DatabaseUpdate {
  table: string;
  column: string;
  matchValue: string;
  matchField: string;
  imageUrl: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize filename for matching
 * "Tru Foe" → "tru_foe"
 * "wordplay_wizard" → "wordplay_wizard"
 */
function normalizeForMatching(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_").replace(/[^\w_]/g, "");
}

/**
 * Recursively scan directory for PNG files
 */
function scanDirectory(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...scanDirectory(fullPath));
      } else if (entry.name.endsWith(".png")) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

  return files;
}

/**
 * Get relative path from /sprites root for database storage
 */
function getRelativeSpritePath(fullPath: string): string {
  const relative = path.relative(SPRITES_ROOT, fullPath);
  return `/sprites/${relative.replace(/\\/g, "/")}`;
}

// ============================================================================
// ATTACHMENT STRATEGIES BY CATEGORY
// ============================================================================

/**
 * BATTLERS: Scan /sprites/characters/ and match to battler stage_name
 */
async function attachBattlerAvatars(
  dryRun: boolean = true,
  verbose: boolean = false
): Promise<AttachmentResult> {
  console.log("\n=== BATTLER AVATAR ATTACHMENT ===");
  console.log("Scanning: /sprites/characters/");

  const charactersDir = path.join(SPRITES_ROOT, "characters");
  const spriteFiles = scanDirectory(charactersDir);

  if (verbose) {
    console.log(`Found ${spriteFiles.length} PNG files`);
  }

  // Extract normalized filenames
  const spriteMap = new Map<string, string>();
  for (const file of spriteFiles) {
    const filename = path.basename(file, ".png");
    const normalized = normalizeForMatching(filename);
    const relPath = getRelativeSpritePath(file);
    spriteMap.set(normalized, relPath);

    if (verbose) {
      console.log(`  ${filename} → ${normalized}`);
    }
  }

  // Fetch all battlers from database
  const { data: battlers, error: fetchError } = await supabase
    .from("battlers")
    .select("id, stage_name, avatar_url");

  if (fetchError) {
    throw new Error(`Failed to fetch battlers: ${fetchError.message}`);
  }

  // Match battlers to sprites
  const updates: DatabaseUpdate[] = [];
  const unmatchedFiles = new Set(spriteMap.keys());
  const orphanedRecords: string[] = [];

  for (const battler of battlers || []) {
    const normalized = normalizeForMatching(battler.stage_name);
    const spritePath = spriteMap.get(normalized);

    if (spritePath) {
      updates.push({
        table: "battlers",
        column: "avatar_url",
        matchField: "id",
        matchValue: battler.id,
        imageUrl: spritePath,
      });
      unmatchedFiles.delete(normalized);

      if (verbose) {
        console.log(`✅ Match: ${battler.stage_name} → ${spritePath}`);
      }
    } else {
      orphanedRecords.push(
        `${battler.stage_name} (id: ${battler.id}) - no sprite found`
      );
      if (verbose) {
        console.log(`❌ No sprite: ${battler.stage_name}`);
      }
    }
  }

  console.log(`\nResults:`);
  console.log(`  Total sprites: ${spriteFiles.length}`);
  console.log(`  Matched: ${updates.length}`);
  console.log(`  Unmatched files: ${unmatchedFiles.size}`);
  console.log(`  Orphaned records: ${orphanedRecords.length}`);

  if (!dryRun && updates.length > 0) {
    console.log("\nExecuting database updates...");
    await executeDatabaseUpdates(updates);
  }

  return {
    totalFiles: spriteFiles.length,
    matchedRecords: updates.length,
    unmatchedFiles: Array.from(unmatchedFiles),
    orphanedRecords,
    updates,
  };
}

/**
 * BADGES: Map badge_costs to badge sprite files
 * Mapping: badge_001-040 (content), badge_041-080 (positive), badge_081-120 (negative)
 */
async function attachBadgeIcons(
  dryRun: boolean = true,
  verbose: boolean = false
): Promise<AttachmentResult> {
  console.log("\n=== BADGE ICON ATTACHMENT ===");
  console.log("Scanning: /sprites/badges/");

  const badgesDir = path.join(SPRITES_ROOT, "badges");
  const spriteFiles = scanDirectory(badgesDir);

  if (verbose) {
    console.log(`Found ${spriteFiles.length} PNG files`);
  }

  // Map badge numbers to paths
  const badgeNumberMap = new Map<number, string>();
  for (const file of spriteFiles) {
    const filename = path.basename(file, ".png");
    const match = filename.match(/badge_(\d+)/);
    if (match) {
      const badgeNum = parseInt(match[1], 10);
      const relPath = getRelativeSpritePath(file);
      badgeNumberMap.set(badgeNum, relPath);

      if (verbose) {
        console.log(`  badge_${badgeNum} → ${relPath}`);
      }
    }
  }

  // Fetch all badges from database
  const { data: badges, error: fetchError } = await supabase
    .from("badge_costs")
    .select("id, badge_code, tier");

  if (fetchError) {
    throw new Error(`Failed to fetch badges: ${fetchError.message}`);
  }

  // Mapping table: badge_code → badge_number
  const badgeCodeToNumber: Record<string, number> = {
    // Content badges (001-040)
    angles: 1,
    personals: 2,
    disrespect: 3,
    comedy: 4,
    jokes: 5,
    sarcasm: 6,
    self_deprecating: 7,
    dry_humor: 8,
    slapstick: 9,
    concept_battles: 10,
    gritty: 11,
    street_talk: 12,
    braggadocious: 13,
    og_bars: 14,
    metaphors: 15,
    similes: 16,
    wordplay: 17,
    witty_wordplay: 18,
    schemes: 19,
    violent_imagery: 20,
    multisyllabic_rhymes: 21,
    intricate_schemes: 22,
    sports_references: 23,
    pop_culture_references: 24,
    historical_references: 25,
    locational_references: 26,
    political_commentary: 27,
    social_commentary: 28,
    storytelling: 29,
    motivational: 30,
    punchlines: 31,
    name_flips: 32,
    slogan: 33,
    controversial: 34,
    shock_value: 35,
    freestyles: 36,
    rebuttals: 37,
    punchline_king: 38,
    scheme_specialist: 39,
    metaphor_master: 40,
    // Positive badges (041-080)
    wordplay_wizard: 41,
    freestyle_genius: 42,
    creativity_beast: 43,
    consistent_writer: 44,
    angle_master: 45,
    rebuttal_king: 46,
    great_setups: 47,
    double_entendre_expert: 48,
    unpredictable: 49,
    pen_game_elite: 50,
    quotable_machine: 51,
    hard_hitting_haymakers: 52,
    multisyllabic_master: 53,
    well_researched: 54,
    well_timed_humor: 55,
    aggressive: 56,
    menacing: 57,
    speed_rapping: 58,
    slow_flow: 59,
    smooth_flow: 60,
    explosive: 61,
    passionate: 62,
    nonchalant: 63,
    deadpan: 64,
    rapid_fire: 65,
    melodic: 66,
    impassioned: 67,
    cold: 68,
    empathetic: 69,
    power_stance: 70,
    fluid_movement: 71,
    stage_domination: 72,
    crowd_interaction: 73,
    dynamic_range: 74,
    charismatic: 75,
    crowd_favorite: 76,
    show_stealer: 77,
    big_stage_performer: 78,
    clutch_performer: 79,
    respected_veteran: 80,
    // Negative badges (081-120)
    recycler: 81,
    biter: 82,
    one_trick_pony: 83,
    shock_value_abuser: 84,
    lazy_writer: 85,
    predictable: 86,
    reach_god: 87,
    filler_abuser: 88,
    outdated: 89,
    repetitive: 90,
    weak_setups: 91,
    gimmick_abuser: 92,
    shallow_research: 93,
    choker: 94,
    one_hit_wonder: 95,
    overhyped: 96,
    inconsistent: 97,
    crowd_killer: 98,
    time_waster: 99,
    mumbler: 100,
    monotone: 101,
    awkward_presence: 102,
    energy_drainer: 103,
    off_beat: 104,
    sore_loser: 105,
    canceller: 106,
    drama_starter: 107,
    excuse_maker: 108,
    unreliable: 109,
    ghost_writer: 110,
    scammer: 111,
    fake_tough_guy: 112,
    clout_chaser: 113,
    sellout: 114,
    ego_issues: 115,
    known_choker: 116,
    corny_punchlines: 117,
    inauthentic: 118,
    trend_follower: 119,
    poor_networking: 120,
  };

  // Match badges to sprites
  const updates: DatabaseUpdate[] = [];
  const unmatchedFiles = new Set(badgeNumberMap.keys());
  const orphanedRecords: string[] = [];

  for (const badge of badges || []) {
    const badgeNum = badgeCodeToNumber[badge.badge_code];
    const spritePath = badgeNum ? badgeNumberMap.get(badgeNum) : null;

    if (spritePath) {
      updates.push({
        table: "badge_costs",
        column: "icon_url",
        matchField: "id",
        matchValue: badge.id,
        imageUrl: spritePath,
      });
      unmatchedFiles.delete(badgeNum);

      if (verbose) {
        console.log(`✅ Match: ${badge.badge_code} → badge_${badgeNum}`);
      }
    } else {
      orphanedRecords.push(
        `${badge.badge_code} (id: ${badge.id}) - no sprite mapping`
      );
      if (verbose) {
        console.log(`❌ No mapping: ${badge.badge_code}`);
      }
    }
  }

  console.log(`\nResults:`);
  console.log(`  Total sprites: ${spriteFiles.length}`);
  console.log(`  Matched: ${updates.length}`);
  console.log(`  Unmatched files: ${unmatchedFiles.size}`);
  console.log(`  Orphaned records: ${orphanedRecords.length}`);

  if (!dryRun && updates.length > 0) {
    console.log("\nExecuting database updates...");
    await executeDatabaseUpdates(updates);
  }

  return {
    totalFiles: spriteFiles.length,
    matchedRecords: updates.length,
    unmatchedFiles: Array.from(unmatchedFiles).map(String),
    orphanedRecords,
    updates,
  };
}

/**
 * CITIES: Match city names to regional sprites
 */
async function attachCityBackgrounds(
  dryRun: boolean = true,
  verbose: boolean = false
): Promise<AttachmentResult> {
  console.log("\n=== CITY BACKGROUND ATTACHMENT ===");
  console.log("Scanning: /sprites/cities/");

  const citiesDir = path.join(SPRITES_ROOT, "cities");
  const spriteFiles = scanDirectory(citiesDir).filter((f) =>
    f.endsWith(".png")
  );

  if (verbose) {
    console.log(`Found ${spriteFiles.length} PNG files`);
  }

  // Fetch all cities from database
  const { data: cities, error: fetchError } = await supabase
    .from("cities")
    .select("id, name");

  if (fetchError) {
    throw new Error(`Failed to fetch cities: ${fetchError.message}`);
  }

  // Manual mapping: city name → sprite path
  // This requires manual inspection or regex matching on regional directories
  const cityToSprite: Record<string, string> = {
    "New York City": "/sprites/cities/east-coast/new_york_city.png",
    Philadelphia: "/sprites/cities/east-coast/philadelphia.png",
    Atlanta: "/sprites/cities/east-coast/atlanta.png",
    "Los Angeles": "/sprites/cities/west-coast/los_angeles.png",
    Oakland: "/sprites/cities/west-coast/oakland.png",
    Detroit: "/sprites/cities/midwest/detroit.png",
    Chicago: "/sprites/cities/midwest/chicago.png",
    Houston: "/sprites/cities/south/houston.png",
    Toronto: "/sprites/cities/canada/toronto.png",
    London: "/sprites/cities/canada/london.png",
  };

  // Match cities to sprites
  const updates: DatabaseUpdate[] = [];
  const orphanedRecords: string[] = [];

  for (const city of cities || []) {
    const spritePath = cityToSprite[city.name];

    if (spritePath) {
      updates.push({
        table: "cities",
        column: "background_url",
        matchField: "id",
        matchValue: city.id,
        imageUrl: spritePath,
      });

      if (verbose) {
        console.log(`✅ Match: ${city.name} → ${spritePath}`);
      }
    } else {
      orphanedRecords.push(`${city.name} (id: ${city.id}) - no sprite mapping`);
      if (verbose) {
        console.log(`❌ No mapping: ${city.name}`);
      }
    }
  }

  console.log(`\nResults:`);
  console.log(`  Total cities in DB: ${cities?.length || 0}`);
  console.log(`  Matched: ${updates.length}`);
  console.log(`  Unmapped: ${orphanedRecords.length}`);

  if (!dryRun && updates.length > 0) {
    console.log("\nExecuting database updates...");
    await executeDatabaseUpdates(updates);
  }

  return {
    totalFiles: spriteFiles.length,
    matchedRecords: updates.length,
    unmatchedFiles: [],
    orphanedRecords,
    updates,
  };
}

/**
 * CROWD: Categorize crowd sprites and seed into crowd_reactions table
 */
async function seedCrowdReactions(
  dryRun: boolean = true,
  verbose: boolean = false
): Promise<AttachmentResult> {
  console.log("\n=== CROWD REACTION SEEDING ===");
  console.log("Scanning: /sprites/crowd/");

  const crowdDir = path.join(SPRITES_ROOT, "crowd");
  const spriteFiles = scanDirectory(crowdDir);

  if (verbose) {
    console.log(`Found ${spriteFiles.length} PNG files`);
  }

  // Extract reaction categories from naming
  const reactions: DatabaseUpdate[] = [];

  for (const file of spriteFiles) {
    const filename = path.basename(file, ".png");
    const relPath = getRelativeSpritePath(file);

    // Try to parse crowd reaction naming
    // Format: crowd_[demographic]_[reaction]_[variant].png
    // OR: crowd_[number].png (legacy)

    const match = filename.match(
      /^crowd_([a-z]+)_([a-z_]+)_(\d+)$/
    );
    if (match) {
      const [, demographic, reactionType, variant] = match;

      // Determine polarity
      const positiveTypes = ["hype", "cheer", "laugh", "stunned"];
      const negativeTypes = [
        "boo",
        "cringe",
        "disappointed",
        "unimpressed",
        "bored",
        "leave",
      ];
      const emotionalPolarity = positiveTypes.includes(reactionType)
        ? "positive"
        : negativeTypes.includes(reactionType)
          ? "negative"
          : "neutral";

      if (verbose) {
        console.log(
          `✅ Parsed: ${filename} → ${demographic} ${reactionType} ${variant} [${emotionalPolarity}]`
        );
      }
    } else {
      if (verbose) {
        console.log(`⚠️  Could not parse: ${filename}`);
      }
    }
  }

  console.log(`\nResults:`);
  console.log(`  Total crowd sprites: ${spriteFiles.length}`);
  console.log(`  Categorized: ${reactions.length}`);
  console.log(
    `\nNote: Full categorization requires complete audit of all ${spriteFiles.length} sprites`
  );
  console.log(`See CROWD_CATEGORIZATION.md for partial audit results`);

  return {
    totalFiles: spriteFiles.length,
    matchedRecords: reactions.length,
    unmatchedFiles: [],
    orphanedRecords: [],
    updates: reactions,
  };
}

// ============================================================================
// DATABASE EXECUTION
// ============================================================================

/**
 * Execute database updates
 */
async function executeDatabaseUpdates(
  updates: DatabaseUpdate[]
): Promise<void> {
  let successCount = 0;
  let errorCount = 0;

  for (const update of updates) {
    try {
      const { error } = await supabase
        .from(update.table)
        .update({ [update.column]: update.imageUrl })
        .eq(update.matchField, update.matchValue);

      if (error) {
        console.error(`❌ Update failed: ${error.message}`);
        errorCount++;
      } else {
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Update error: ${error}`);
      errorCount++;
    }
  }

  console.log(`\nExecution Results:`);
  console.log(`  Successful: ${successCount}`);
  console.log(`  Failed: ${errorCount}`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const category = args[0] || "all";
  const dryRun = args.includes("--dry-run");
  const verbose = args.includes("--verbose");

  console.log("==========================================");
  console.log("BULK SPRITE ATTACHMENT SCRIPT");
  console.log("==========================================");
  console.log(`Mode: ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log(`Verbose: ${verbose ? "ON" : "OFF"}`);
  console.log(`Category: ${category}`);
  console.log("==========================================");

  try {
    if (category === "all" || category === "battlers") {
      await attachBattlerAvatars(dryRun, verbose);
    }

    if (category === "all" || category === "badges") {
      await attachBadgeIcons(dryRun, verbose);
    }

    if (category === "all" || category === "cities") {
      await attachCityBackgrounds(dryRun, verbose);
    }

    if (category === "all" || category === "crowd") {
      await seedCrowdReactions(dryRun, verbose);
    }

    console.log("\n✅ Script completed successfully");
  } catch (error) {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  }
}

main();

// Export for testing
export {
  attachBattlerAvatars,
  attachBadgeIcons,
  attachCityBackgrounds,
  seedCrowdReactions,
};
