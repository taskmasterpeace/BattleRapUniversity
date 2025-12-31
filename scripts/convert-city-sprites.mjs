/**
 * Convert city sprites to 512x512 square format
 *
 * This script:
 * 1. Reads all PNG files in public/sprites/cities/
 * 2. Center-crops to square (based on shorter dimension)
 * 3. Resizes to 512x512
 * 4. Saves back to the same file (destructive)
 *
 * Run with: node scripts/convert-city-sprites.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPRITES_DIR = path.join(__dirname, '..', 'public', 'sprites', 'cities');
const TARGET_SIZE = 512;

async function convertSprite(filePath) {
  const fileName = path.basename(filePath);

  try {
    // Read image metadata
    const metadata = await sharp(filePath).metadata();
    const { width, height } = metadata;

    console.log(`Processing ${fileName}: ${width}x${height}`);

    // Calculate center crop to square
    const size = Math.min(width, height);
    const left = Math.floor((width - size) / 2);
    const top = Math.floor((height - size) / 2);

    // Process: extract square region, resize to 512x512
    const buffer = await sharp(filePath)
      .extract({ left, top, width: size, height: size })
      .resize(TARGET_SIZE, TARGET_SIZE, {
        kernel: sharp.kernel.nearest, // Preserve pixel art
        fit: 'fill'
      })
      .png()
      .toBuffer();

    // Write back to file
    await fs.promises.writeFile(filePath, buffer);

    console.log(`  ✓ Converted to ${TARGET_SIZE}x${TARGET_SIZE}`);
    return { fileName, success: true, original: `${width}x${height}` };
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return { fileName, success: false, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('City Sprite Converter - Converting to 512x512');
  console.log('='.repeat(50));
  console.log(`Directory: ${SPRITES_DIR}\n`);

  // Check if directory exists
  if (!fs.existsSync(SPRITES_DIR)) {
    console.error('Error: Sprites directory not found!');
    process.exit(1);
  }

  // Get all PNG files
  const files = fs.readdirSync(SPRITES_DIR)
    .filter(f => f.endsWith('.png'))
    .map(f => path.join(SPRITES_DIR, f));

  if (files.length === 0) {
    console.log('No PNG files found.');
    return;
  }

  console.log(`Found ${files.length} sprite files\n`);

  // Convert each file
  const results = [];
  for (const file of files) {
    const result = await convertSprite(file);
    results.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Total: ${results.length}`);
  console.log(`Converted: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed files:');
    failed.forEach(r => console.log(`  - ${r.fileName}: ${r.error}`));
  }

  console.log('\nDone!');
}

main().catch(console.error);
