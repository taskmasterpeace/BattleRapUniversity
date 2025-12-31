/**
 * GridDetector - Detects grid layout in sprite sheets
 *
 * Can auto-detect grid dimensions by analyzing separator lines,
 * or use manually provided dimensions.
 */

import sharp from 'sharp';
import { GridConfig } from './types.js';
import { hexToRgb, colorsMatch } from '../utils/imageUtils.js';

export interface GridDetectorOptions {
  /** Path to the sprite sheet image */
  imagePath: string;
  /** Manual row count (optional) */
  rows?: number;
  /** Manual column count (optional) */
  columns?: number;
  /** Background color for detection (hex) */
  backgroundColor?: string;
  /** Color tolerance for detection */
  tolerance?: number;
}

export class GridDetector {
  private imagePath: string;
  private manualRows?: number;
  private manualColumns?: number;
  private backgroundColor: string;
  private tolerance: number;

  constructor(options: GridDetectorOptions) {
    this.imagePath = options.imagePath;
    this.manualRows = options.rows;
    this.manualColumns = options.columns;
    this.backgroundColor = options.backgroundColor || '#FFFFFF';
    this.tolerance = options.tolerance || 15;
  }

  /**
   * Detect the grid configuration
   */
  async detect(): Promise<GridConfig> {
    const metadata = await sharp(this.imagePath).metadata();
    const imageWidth = metadata.width || 0;
    const imageHeight = metadata.height || 0;

    // If manual dimensions provided, use them
    if (this.manualRows && this.manualColumns) {
      return {
        rows: this.manualRows,
        columns: this.manualColumns,
        cellWidth: Math.floor(imageWidth / this.manualColumns),
        cellHeight: Math.floor(imageHeight / this.manualRows),
        detectedAutomatically: false,
      };
    }

    // Auto-detect grid
    return this.autoDetect(imageWidth, imageHeight);
  }

  /**
   * Auto-detect grid by analyzing the image for separator lines
   */
  private async autoDetect(imageWidth: number, imageHeight: number): Promise<GridConfig> {
    // Get raw pixel data
    const { data } = await sharp(this.imagePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const bgColor = hexToRgb(this.backgroundColor);

    // Analyze vertical lines (for column detection)
    const columnSeparators = this.findVerticalSeparators(
      data,
      imageWidth,
      imageHeight,
      bgColor
    );

    // Analyze horizontal lines (for row detection)
    const rowSeparators = this.findHorizontalSeparators(
      data,
      imageWidth,
      imageHeight,
      bgColor
    );

    // Calculate grid dimensions
    const columns = this.calculateGridCount(columnSeparators, imageWidth);
    const rows = this.calculateGridCount(rowSeparators, imageHeight);

    // Fallback to common grid sizes if detection fails
    const finalColumns = columns > 0 ? columns : 8; // Default 8 columns
    const finalRows = rows > 0 ? rows : 4; // Default 4 rows

    return {
      rows: finalRows,
      columns: finalColumns,
      cellWidth: Math.floor(imageWidth / finalColumns),
      cellHeight: Math.floor(imageHeight / finalRows),
      detectedAutomatically: true,
    };
  }

  /**
   * Find vertical separator lines (columns of background color)
   */
  private findVerticalSeparators(
    data: Buffer,
    width: number,
    height: number,
    bgColor: { r: number; g: number; b: number }
  ): number[] {
    const separators: number[] = [];
    const minHeight = Math.floor(height * 0.8); // Column must be 80% background

    for (let x = 0; x < width; x++) {
      let backgroundCount = 0;

      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (colorsMatch(r, g, b, bgColor.r, bgColor.g, bgColor.b, this.tolerance)) {
          backgroundCount++;
        }
      }

      if (backgroundCount >= minHeight) {
        separators.push(x);
      }
    }

    return this.consolidateSeparators(separators);
  }

  /**
   * Find horizontal separator lines (rows of background color)
   */
  private findHorizontalSeparators(
    data: Buffer,
    width: number,
    height: number,
    bgColor: { r: number; g: number; b: number }
  ): number[] {
    const separators: number[] = [];
    const minWidth = Math.floor(width * 0.8); // Row must be 80% background

    for (let y = 0; y < height; y++) {
      let backgroundCount = 0;

      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (colorsMatch(r, g, b, bgColor.r, bgColor.g, bgColor.b, this.tolerance)) {
          backgroundCount++;
        }
      }

      if (backgroundCount >= minWidth) {
        separators.push(y);
      }
    }

    return this.consolidateSeparators(separators);
  }

  /**
   * Consolidate adjacent separator positions into single positions
   */
  private consolidateSeparators(positions: number[]): number[] {
    if (positions.length === 0) return [];

    const consolidated: number[] = [];
    let groupStart = positions[0];
    let groupEnd = positions[0];

    for (let i = 1; i < positions.length; i++) {
      if (positions[i] <= groupEnd + 3) {
        // Adjacent or very close, extend the group
        groupEnd = positions[i];
      } else {
        // Gap found, save the center of the current group
        consolidated.push(Math.floor((groupStart + groupEnd) / 2));
        groupStart = positions[i];
        groupEnd = positions[i];
      }
    }

    // Don't forget the last group
    consolidated.push(Math.floor((groupStart + groupEnd) / 2));

    return consolidated;
  }

  /**
   * Calculate grid count from separator positions
   */
  private calculateGridCount(separators: number[], dimension: number): number {
    if (separators.length < 2) return 0;

    // Calculate average spacing between separators
    const spacings: number[] = [];
    for (let i = 1; i < separators.length; i++) {
      spacings.push(separators[i] - separators[i - 1]);
    }

    if (spacings.length === 0) return 0;

    // Find the most common spacing (cell size)
    const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;

    // Estimate grid count
    return Math.round(dimension / avgSpacing);
  }

  /**
   * Validate that the detected grid makes sense
   */
  static validateGrid(grid: GridConfig, minCellSize: number = 16): boolean {
    return (
      grid.rows > 0 &&
      grid.columns > 0 &&
      grid.cellWidth >= minCellSize &&
      grid.cellHeight >= minCellSize &&
      grid.rows <= 20 && // Reasonable upper limits
      grid.columns <= 20
    );
  }

  /**
   * Detect grid from image dimensions using aspect ratio analysis.
   * This is a quick detection method that works for sheets with known column counts.
   *
   * @param width Image width in pixels
   * @param height Image height in pixels
   * @param assumedCols Assumed number of columns (default: 8)
   * @param possibleRows Array of possible row counts to test (default: [4, 5])
   * @returns Object with detected rows, cols, confidence, and cell dimensions
   */
  static detectFromDimensions(
    width: number,
    height: number,
    assumedCols: number = 8,
    possibleRows: number[] = [4, 5]
  ): {
    rows: number;
    cols: number;
    confidence: number;
    cellWidth: number;
    cellHeight: number;
  } {
    const cellWidth = Math.round(width / assumedCols);

    // Test each possible row count and find the best match
    let bestRows = possibleRows[0];
    let bestConfidence = 0;

    for (const rows of possibleRows) {
      const cellHeight = Math.round(height / rows);

      // Calculate aspect ratio (width/height)
      // For portrait sprites, we expect ratio < 1 (taller than wide)
      // For these sprite sheets, character cells are roughly square or slightly tall
      const aspectRatio = cellWidth / cellHeight;

      // Target aspect ratio for these sprites is around 1.0-1.2 (slightly wider than tall)
      // 8×4 sheets have taller cells (ratio ~1.18)
      // 8×5 sheets have shorter cells (ratio ~0.95)
      const targetRatio = 1.0;
      const deviation = Math.abs(aspectRatio - targetRatio);

      // Confidence is higher when aspect ratio is closer to target
      // Normalize: if deviation is 0, confidence is 1; if deviation is 0.5, confidence is 0.5
      const confidence = Math.max(0, 1 - deviation);

      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestRows = rows;
      }
    }

    const bestCellHeight = Math.round(height / bestRows);

    return {
      rows: bestRows,
      cols: assumedCols,
      confidence: bestConfidence,
      cellWidth,
      cellHeight: bestCellHeight,
    };
  }

  /**
   * Analyze a sprite sheet and return configuration with confidence
   */
  static async analyzeSheet(imagePath: string): Promise<{
    file: string;
    rows: number;
    cols: number;
    confidence: number;
    dimensions: { width: number; height: number };
    cellSize: { width: number; height: number };
  }> {
    const metadata = await sharp(imagePath).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Get filename from path
    const file = imagePath.split(/[/\\]/).pop() || imagePath;

    // Detect grid from dimensions
    const detection = GridDetector.detectFromDimensions(width, height);

    return {
      file,
      rows: detection.rows,
      cols: detection.cols,
      confidence: detection.confidence,
      dimensions: { width, height },
      cellSize: { width: detection.cellWidth, height: detection.cellHeight },
    };
  }
}
