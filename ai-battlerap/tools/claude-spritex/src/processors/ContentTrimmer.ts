/**
 * ContentTrimmer - Trims transparent edges from sprites
 */

import sharp from 'sharp';
import { TrimResult, ContentBounds } from '../core/types.js';

export interface ContentTrimmerOptions {
  /** Minimum alpha value to consider a pixel as content (0-255) */
  alphaThreshold?: number;
}

export class ContentTrimmer {
  private alphaThreshold: number;

  constructor(options: ContentTrimmerOptions = {}) {
    this.alphaThreshold = options.alphaThreshold ?? 10;
  }

  /**
   * Trim transparent edges from an image
   */
  async trim(inputBuffer: Buffer): Promise<TrimResult> {
    // Get metadata first
    const metadata = await sharp(inputBuffer).metadata();
    const width = metadata.width!;
    const height = metadata.height!;

    // Get raw pixel data
    const data = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer();

    const channels = 4;

    // Find content bounds
    const bounds = this.findContentBounds(data, width, height, channels);

    // Check if sprite is empty
    if (bounds.width === 0 || bounds.height === 0) {
      return {
        buffer: inputBuffer,
        originalWidth: width,
        originalHeight: height,
        contentBounds: { top: 0, left: 0, width: 0, height: 0 },
        isEmpty: true,
      };
    }

    // Extract the content region
    const trimmedBuffer = await sharp(inputBuffer)
      .extract({
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      })
      .png()
      .toBuffer();

    return {
      buffer: trimmedBuffer,
      originalWidth: width,
      originalHeight: height,
      contentBounds: bounds,
      isEmpty: false,
    };
  }

  /**
   * Find the bounding box of non-transparent content
   */
  private findContentBounds(
    data: Buffer,
    width: number,
    height: number,
    channels: number
  ): ContentBounds {
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const alpha = data[idx + 3];

        if (alpha > this.alphaThreshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // No content found
    if (maxX < 0 || maxY < 0) {
      return { top: 0, left: 0, width: 0, height: 0 };
    }

    return {
      top: minY,
      left: minX,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  }

  /**
   * Check if an image is essentially empty (all transparent)
   */
  async isEmpty(inputBuffer: Buffer): Promise<boolean> {
    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    const channels = 4;

    // Count non-transparent pixels
    let contentPixels = 0;
    const minContentPixels = Math.ceil(width * height * 0.01); // At least 1% content

    for (let i = 3; i < data.length; i += channels) {
      if (data[i] > this.alphaThreshold) {
        contentPixels++;
        if (contentPixels >= minContentPixels) {
          return false; // Has enough content
        }
      }
    }

    return contentPixels < minContentPixels;
  }

  /**
   * Get content statistics
   */
  async getContentStats(inputBuffer: Buffer): Promise<{
    totalPixels: number;
    contentPixels: number;
    contentPercentage: number;
    bounds: ContentBounds;
  }> {
    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    const channels = 4;
    const totalPixels = width * height;

    let contentPixels = 0;
    const bounds = this.findContentBounds(data, width, height, channels);

    for (let i = 3; i < data.length; i += channels) {
      if (data[i] > this.alphaThreshold) {
        contentPixels++;
      }
    }

    return {
      totalPixels,
      contentPixels,
      contentPercentage: (contentPixels / totalPixels) * 100,
      bounds,
    };
  }
}
