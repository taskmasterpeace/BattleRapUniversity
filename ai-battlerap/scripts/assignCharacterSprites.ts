#!/usr/bin/env tsx
/**
 * Character Sprite Assignment Script
 *
 * Purpose: Assigns character sprites to all battlers in the database
 *
 * Process:
 * 1. Query all battlers from database (28 total)
 * 2. Inventory character sprites in public/sprites/characters/ (920 sprites in 23 folders)
 * 3. Distribute sprites evenly: 920 ÷ 28 ≈ 32-33 sprites per battler
 * 4. For each battler:
 *    - Assign first sprite in their group as avatar_url
 *    - Store all sprites in group as sprite_set JSONB array
 * 5. Update database with assignments
 *
 * Usage:
 *   npx tsx scripts/assignCharacterSprites.ts           # Dry run (preview only)
 *   npx tsx scripts/assignCharacterSprites.ts --execute # Execute updates
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase connection (service role for admin operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

interface Battler {
  id: string;
  stage_name: string;
  tier: string;
  is_ai: boolean;
}

interface SpriteFolder {
  folder: string;
  sprites: string[];
}

// Get all sprite folders and their contents
function getSpriteInventory(spritesDir: string): SpriteFolder[] {
  const characterSpritesPath = path.join(spritesDir, 'public', 'sprites', 'characters');

  if (!fs.existsSync(characterSpritesPath)) {
    throw new Error(`Character sprites directory not found: ${characterSpritesPath}`);
  }

  const folders = fs.readdirSync(characterSpritesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('image_'))
    .map(dirent => dirent.name)
    .sort(); // Sort to ensure consistent assignment

  const inventory: SpriteFolder[] = folders.map(folder => {
    const folderPath = path.join(characterSpritesPath, folder);
    const sprites = fs.readdirSync(folderPath)
      .filter(file => file.endsWith('.png'))
      .sort()
      .map(file => `/sprites/characters/${folder}/${file}`);

    return { folder, sprites };
  });

  return inventory;
}

// Distribute sprites evenly among battlers
function distributeSprites(battlers: Battler[], spriteInventory: SpriteFolder[]): Map<string, string[]> {
  const assignments = new Map<string, string[]>();

  // Flatten all sprites into single array
  const allSprites: string[] = spriteInventory.flatMap(folder => folder.sprites);

  const totalSprites = allSprites.length;
  const totalBattlers = battlers.length;
  const spritesPerBattler = Math.floor(totalSprites / totalBattlers);
  const remainder = totalSprites % totalBattlers;

  console.log(`\n📊 SPRITE DISTRIBUTION CALCULATION:`);
  console.log(`   Total sprites: ${totalSprites}`);
  console.log(`   Total battlers: ${totalBattlers}`);
  console.log(`   Sprites per battler: ${spritesPerBattler}`);
  console.log(`   Remainder: ${remainder} (first ${remainder} battlers get +1 sprite)\n`);

  let currentIndex = 0;

  battlers.forEach((battler, idx) => {
    // First battlers get extra sprite if there's a remainder
    const spritesForThisBattler = spritesPerBattler + (idx < remainder ? 1 : 0);
    const battlerSprites = allSprites.slice(currentIndex, currentIndex + spritesForThisBattler);

    assignments.set(battler.id, battlerSprites);
    currentIndex += spritesForThisBattler;
  });

  return assignments;
}

// Test assignment with first 3 battlers
async function testAssignment(battlers: Battler[], assignments: Map<string, string[]>) {
  console.log(`\n🧪 TEST MODE - Preview for first 3 battlers:\n`);

  const testBattlers = battlers.slice(0, 3);

  for (const battler of testBattlers) {
    const sprites = assignments.get(battler.id) || [];
    const avatarUrl = sprites[0] || null;

    console.log(`${battler.stage_name} (${battler.tier}):`);
    console.log(`  ID: ${battler.id}`);
    console.log(`  Avatar: ${avatarUrl}`);
    console.log(`  Sprite count: ${sprites.length}`);
    console.log(`  Sample sprites: ${sprites.slice(0, 3).join(', ')}...`);
    console.log('');
  }

  console.log(`✅ Test complete. Ready to execute updates for all ${battlers.length} battlers.`);
  console.log(`Run with --execute flag to apply changes.\n`);
}

// Execute full assignment
async function executeAssignment(battlers: Battler[], assignments: Map<string, string[]>) {
  console.log(`\n🚀 EXECUTING FULL ASSIGNMENT for ${battlers.length} battlers...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const battler of battlers) {
    const sprites = assignments.get(battler.id) || [];
    const avatarUrl = sprites[0] || null;

    try {
      const { error } = await supabase
        .from('battlers')
        .update({
          avatar_url: avatarUrl,
          sprite_set: sprites
        })
        .eq('id', battler.id);

      if (error) {
        console.error(`❌ Failed to update ${battler.stage_name}:`, error.message);
        failCount++;
      } else {
        console.log(`✅ ${battler.stage_name}: ${sprites.length} sprites assigned`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Error updating ${battler.stage_name}:`, err);
      failCount++;
    }
  }

  console.log(`\n📊 ASSIGNMENT COMPLETE:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   Total: ${battlers.length}\n`);

  if (successCount === battlers.length) {
    console.log(`🎉 All battlers assigned successfully!`);
  }
}

// Verify assignments in database
async function verifyAssignments() {
  console.log(`\n🔍 VERIFYING ASSIGNMENTS IN DATABASE...\n`);

  const { data: battlers, error } = await supabase
    .from('battlers')
    .select('id, stage_name, avatar_url, sprite_set')
    .order('stage_name');

  if (error) {
    console.error('❌ Failed to query battlers:', error.message);
    return;
  }

  if (!battlers) {
    console.error('❌ No battlers found in database');
    return;
  }

  let withAvatar = 0;
  let withSpriteSet = 0;
  let totalSprites = 0;

  console.log(`BATTLER SPRITE ASSIGNMENTS:\n`);

  for (const battler of battlers.slice(0, 5)) {
    const spriteCount = Array.isArray(battler.sprite_set) ? battler.sprite_set.length : 0;
    const hasAvatar = !!battler.avatar_url;

    if (hasAvatar) withAvatar++;
    if (spriteCount > 0) withSpriteSet++;
    totalSprites += spriteCount;

    console.log(`${battler.stage_name}:`);
    console.log(`  Avatar: ${hasAvatar ? '✅' : '❌'} ${battler.avatar_url || 'none'}`);
    console.log(`  Sprites: ${spriteCount}`);
    console.log('');
  }

  console.log(`... (showing first 5 of ${battlers.length})\n`);

  console.log(`📊 SUMMARY:`);
  console.log(`   Total battlers: ${battlers.length}`);
  console.log(`   With avatar_url: ${withAvatar} (${Math.round(withAvatar / battlers.length * 100)}%)`);
  console.log(`   With sprite_set: ${withSpriteSet} (${Math.round(withSpriteSet / battlers.length * 100)}%)`);
  console.log(`   Total sprites assigned: ${totalSprites}`);
  console.log(`   Average sprites per battler: ${Math.round(totalSprites / battlers.length)}\n`);
}

// Main execution
async function main() {
  console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║       CHARACTER SPRITE ASSIGNMENT SCRIPT                      ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

  const execute = process.argv.includes('--execute');
  const verify = process.argv.includes('--verify');

  if (verify) {
    await verifyAssignments();
    return;
  }

  // Step 1: Query all battlers
  console.log(`📥 Fetching battlers from database...`);
  const { data: battlers, error: battlersError } = await supabase
    .from('battlers')
    .select('id, stage_name, tier, is_ai')
    .order('stage_name');

  if (battlersError) {
    console.error('❌ Failed to fetch battlers:', battlersError.message);
    process.exit(1);
  }

  if (!battlers || battlers.length === 0) {
    console.error('❌ No battlers found in database');
    process.exit(1);
  }

  console.log(`✅ Found ${battlers.length} battlers\n`);

  // Step 2: Inventory sprites
  console.log(`📂 Inventorying character sprites...`);
  const projectRoot = path.resolve(__dirname, '..');
  const spriteInventory = getSpriteInventory(projectRoot);

  const totalSprites = spriteInventory.reduce((sum, folder) => sum + folder.sprites.length, 0);
  console.log(`✅ Found ${spriteInventory.length} sprite folders with ${totalSprites} total sprites\n`);

  // Step 3: Distribute sprites
  console.log(`🎲 Distributing sprites to battlers...`);
  const assignments = distributeSprites(battlers, spriteInventory);

  // Step 4: Execute or test
  if (execute) {
    await executeAssignment(battlers, assignments);
    await verifyAssignments();
  } else {
    await testAssignment(battlers, assignments);
  }
}

// Run script
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
