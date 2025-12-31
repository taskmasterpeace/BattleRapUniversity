const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function test() {
  const imagePath = 'C:\\git\\battlerapuniversity\\raw images\\image_1764114217715.png';

  console.log('Testing sprite extraction...');
  console.log('Input:', imagePath);

  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    console.error('File not found!');
    return;
  }

  // Get metadata
  const metadata = await sharp(imagePath).metadata();
  console.log('Image metadata:', metadata);

  // Extract first cell (396x336)
  console.log('\nExtracting first cell...');
  const cellBuffer = await sharp(imagePath)
    .extract({ left: 0, top: 0, width: 396, height: 336 })
    .ensureAlpha()
    .png()
    .toBuffer();

  console.log('Cell buffer length:', cellBuffer.length);

  // Check cell metadata
  const cellMeta = await sharp(cellBuffer).metadata();
  console.log('Cell metadata:', cellMeta);

  // Save to test
  await sharp(cellBuffer).toFile('test-cell.png');
  console.log('Saved test-cell.png');

  // Try background removal pipeline
  console.log('\nTrying raw conversion...');
  const rawData = await sharp(cellBuffer).raw().toBuffer();
  console.log('Raw data length:', rawData.length);
  console.log('Expected (396*336*4):', 396 * 336 * 4);

  // Try to recreate
  const recreated = await sharp(rawData, {
    raw: {
      width: 396,
      height: 336,
      channels: 4
    }
  }).png().toBuffer();

  console.log('Recreated buffer length:', recreated.length);
  await sharp(recreated).toFile('test-recreated.png');
  console.log('Saved test-recreated.png');

  console.log('\nDone!');
}

test().catch(console.error);
