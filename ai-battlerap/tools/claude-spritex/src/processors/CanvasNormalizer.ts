/**
 * CanvasNormalizer - Normalizes sprites to a consistent canvas size
 */

import sharp from 'sharp';

export interface CanvasNormalizerOptions {
  /** Target canvas width */
  targetWidth: number;
  /** Target canvas height */
  targetHeight: number;
  /** Padding around the content */
  padding: number;
}

export class CanvasNormalizer {
  private targetWidth: number;
  private targetHeight: number;
  private padding: number;

  constructor(options: CanvasNormalizerOptions) {
    this.targetWidth = options.targetWidth;
    this.targetHeight = options.targetHeight;
    this.padding = options.padding;
  }

  /**
   * Normalize a sprite to the target canvas size
   * Centers the content and maintains aspect ratio
   */
  async normalize(inputBuffer: Buffer): Promise<Buffer> {
    // Get input dimensions
    const metadata = await sharp(inputBuffer).metadata();
    const inputWidth = metadata.width || 0;
    const inputHeight = metadata.height || 0;

    if (inputWidth === 0 || inputHeight === 0) {
      // Return empty transparent canvas
      return this.createEmptyCanvas();
    }

    // Calculate available space (canvas minus padding)
    const availableWidth = this.targetWidth - this.padding * 2;
    const availableHeight = this.targetHeight - this.padding * 2;

    // Calculate scale to fit content
    const scaleX = availableWidth / inputWidth;
    const scaleY = availableHeight / inputHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't upscale

    // Calculate new dimensions
    const newWidth = Math.round(inputWidth * scale);
    const newHeight = Math.round(inputHeight * scale);

    // Calculate centering offsets
    const offsetX = Math.round((this.targetWidth - newWidth) / 2);
    const offsetY = Math.round((this.targetHeight - newHeight) / 2);

    // Resize if needed
    let resizedBuffer = inputBuffer;
    if (scale < 1) {
      resizedBuffer = await sharp(inputBuffer)
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: false,
        })
        .png()
        .toBuffer();
    }

    // Create canvas and composite
    return sharp({
      create: {
        width: this.targetWidth,
        height: this.targetHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: resizedBuffer,
          left: offsetX,
          top: offsetY,
        },
      ])
      .png()
      .toBuffer();
  }

  /**
   * Normalize with bottom alignment (for character sprites)
   */
  async normalizeBottomAligned(inputBuffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(inputBuffer).metadata();
    const inputWidth = metadata.width || 0;
    const inputHeight = metadata.height || 0;

    if (inputWidth === 0 || inputHeight === 0) {
      return this.createEmptyCanvas();
    }

    // Calculate available space
    const availableWidth = this.targetWidth - this.padding * 2;
    const availableHeight = this.targetHeight - this.padding * 2;

    // Calculate scale
    const scaleX = availableWidth / inputWidth;
    const scaleY = availableHeight / inputHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    // Calculate new dimensions
    const newWidth = Math.round(inputWidth * scale);
    const newHeight = Math.round(inputHeight * scale);

    // Center horizontally, align to bottom
    const offsetX = Math.round((this.targetWidth - newWidth) / 2);
    const offsetY = this.targetHeight - newHeight - this.padding;

    // Resize if needed
    let resizedBuffer = inputBuffer;
    if (scale < 1) {
      resizedBuffer = await sharp(inputBuffer)
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: false,
        })
        .png()
        .toBuffer();
    }

    // Create canvas and composite
    return sharp({
      create: {
        width: this.targetWidth,
        height: this.targetHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: resizedBuffer,
          left: offsetX,
          top: offsetY,
        },
      ])
      .png()
      .toBuffer();
  }

  /**
   * Create an empty transparent canvas
   */
  private async createEmptyCanvas(): Promise<Buffer> {
    return sharp({
      create: {
        width: this.targetWidth,
        height: this.targetHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer();
  }

  /**
   * Get the target dimensions
   */
  getTargetSize(): { width: number; height: number } {
    return {
      width: this.targetWidth,
      height: this.targetHeight,
    };
  }
}
