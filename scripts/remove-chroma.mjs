/**
 * Remove green chroma key from crowd silhouette images
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceDir = 'C:/git/battlerapuniversity/raw images/crowdbackdrop';
const destDir = 'C:/git/battlerapuniversity/public/sprites/crowd/silhouettes';

// Create destination directory
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Files to process
const files = [
  { input: 'crowd.png', output: 'crowd_calm.png' },
  { input: 'huge crowd.png', output: 'crowd_hype.png' }
];

async function removeChromaKey(inputPath, outputPath) {
  console.log(`Processing: ${inputPath}`);

  try {
    // Read the image
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Get raw pixel data
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Create new buffer with alpha channel
    const pixels = new Uint8Array(info.width * info.height * 4);

    for (let i = 0; i < info.width * info.height; i++) {
      const srcIdx = i * info.channels;
      const dstIdx = i * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      // Check if this is a green pixel (chroma key) - very aggressive detection
      // Include edge pixels that have any green tint
      const greenDominance = g - Math.max(r, b);
      const isGreen = greenDominance > 20 && g > 80;

      // Also check for bright lime green #00FF00
      const isLimeGreen = r < 100 && g > 120 && b < 100;

      // Check for greenish edges (where green is highest channel by any margin)
      const isGreenEdge = g > r && g > b && greenDominance > 10;

      // Check for dark green tints (edge shadows with green)
      const isDarkGreen = g > r + 5 && g > b + 5 && g > 40;

      // Check if the pixel is mostly green relative to other channels
      const greenRatio = g / (r + g + b + 1);
      const hasGreenTint = greenRatio > 0.4 && g > 50;

      if (isGreen || isLimeGreen || isGreenEdge || isDarkGreen || hasGreenTint) {
        // Make transparent
        pixels[dstIdx] = 0;
        pixels[dstIdx + 1] = 0;
        pixels[dstIdx + 2] = 0;
        pixels[dstIdx + 3] = 0; // Alpha = 0
      } else {
        // Keep original colors
        pixels[dstIdx] = r;
        pixels[dstIdx + 1] = g;
        pixels[dstIdx + 2] = b;
        pixels[dstIdx + 3] = 255; // Alpha = 255 (opaque)
      }
    }

    // Write output with transparency
    await sharp(Buffer.from(pixels), {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
      .png()
      .toFile(outputPath);

    console.log(`  -> Saved: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`  -> Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Removing Chroma Key from Crowd Silhouettes ===\n');

  for (const file of files) {
    const inputPath = path.join(sourceDir, file.input);
    const outputPath = path.join(destDir, file.output);

    if (fs.existsSync(inputPath)) {
      await removeChromaKey(inputPath, outputPath);
    } else {
      console.log(`NOT FOUND: ${inputPath}`);
    }
  }

  console.log('\n=== Done! ===');
}

main();
