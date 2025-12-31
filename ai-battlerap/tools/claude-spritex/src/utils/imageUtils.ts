/**
 * Image utility functions using Sharp
 */

import sharp from 'sharp';

export interface ImageMetadata {
  width: number;
  height: number;
  channels: number;
  format: string;
}

/**
 * Load an image and return its buffer and metadata
 */
export async function loadImage(path: string): Promise<{ buffer: Buffer; metadata: ImageMetadata }> {
  const image = sharp(path);
  const metadata = await image.metadata();
  const buffer = await image.raw().toBuffer();

  return {
    buffer,
    metadata: {
      width: metadata.width || 0,
      height: metadata.height || 0,
      channels: metadata.channels || 4,
      format: metadata.format || 'unknown',
    },
  };
}

/**
 * Get image metadata without loading full buffer
 */
export async function getImageMetadata(path: string): Promise<ImageMetadata> {
  const metadata = await sharp(path).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    channels: metadata.channels || 4,
    format: metadata.format || 'unknown',
  };
}

/**
 * Create a transparent canvas of the specified size
 */
export async function createTransparentCanvas(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer();
}

/**
 * Extract a region from an image
 */
export async function extractRegion(
  imagePath: string,
  left: number,
  top: number,
  width: number,
  height: number
): Promise<Buffer> {
  return sharp(imagePath)
    .extract({ left, top, width, height })
    .png()
    .toBuffer();
}

/**
 * Extract a region from a buffer
 */
export async function extractRegionFromBuffer(
  buffer: Buffer,
  sourceWidth: number,
  sourceHeight: number,
  left: number,
  top: number,
  width: number,
  height: number
): Promise<Buffer> {
  return sharp(buffer, {
    raw: {
      width: sourceWidth,
      height: sourceHeight,
      channels: 4,
    },
  })
    .extract({ left, top, width, height })
    .png()
    .toBuffer();
}

/**
 * Save a buffer as PNG to a file
 */
export async function saveAsPng(buffer: Buffer, outputPath: string): Promise<void> {
  await sharp(buffer).png({ compressionLevel: 9 }).toFile(outputPath);
}

/**
 * Composite an image onto a canvas at a specific position
 */
export async function compositeOnCanvas(
  spriteBuffer: Buffer,
  canvasWidth: number,
  canvasHeight: number,
  offsetX: number,
  offsetY: number
): Promise<Buffer> {
  // Create transparent canvas
  const canvas = await createTransparentCanvas(canvasWidth, canvasHeight);

  // Composite the sprite onto the canvas
  return sharp(canvas)
    .composite([
      {
        input: spriteBuffer,
        left: offsetX,
        top: offsetY,
      },
    ])
    .png()
    .toBuffer();
}

/**
 * Get raw pixel data from an image buffer
 */
export async function getRawPixels(imagePath: string): Promise<{
  data: Buffer;
  width: number;
  height: number;
  channels: number;
}> {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const channels = 4; // Always use RGBA

  const data = await image
    .ensureAlpha()
    .raw()
    .toBuffer();

  return { data, width, height, channels };
}

/**
 * Convert raw pixel data back to PNG buffer
 */
export async function rawToPng(
  data: Buffer,
  width: number,
  height: number,
  channels: 1 | 2 | 3 | 4 = 4
): Promise<Buffer> {
  return sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .png()
    .toBuffer();
}

/**
 * Parse hex color to RGB components
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Check if two colors are similar within tolerance
 */
export function colorsMatch(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number,
  tolerance: number
): boolean {
  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance
  );
}

/**
 * Resize image while maintaining aspect ratio
 */
export async function resizeToFit(
  buffer: Buffer,
  maxWidth: number,
  maxHeight: number
): Promise<Buffer> {
  return sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();
}

/**
 * Get image dimensions from a buffer
 */
export async function getBufferDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

/**
 * Trim transparent edges from an image
 */
export async function trimTransparent(buffer: Buffer): Promise<{
  buffer: Buffer;
  trimmed: { left: number; top: number; width: number; height: number };
}> {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .trim()
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    trimmed: {
      left: info.trimOffsetLeft || 0,
      top: info.trimOffsetTop || 0,
      width: info.width,
      height: info.height,
    },
  };
}
