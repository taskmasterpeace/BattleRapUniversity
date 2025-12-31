/**
 * SpriteSlicer - Extracts individual sprite cells from a grid
 */

import sharp from 'sharp';
import { GridConfig, SlicedSprite } from './types.js';

export interface SlicerOptions {
  /** Path to the sprite sheet image */
  imagePath: string;
  /** Grid configuration */
  grid: GridConfig;
  /** Pixels to trim from each cell edge to remove grid lines (default: 0) */
  gridLineWidth?: number;
  /** Width of grid lines between cells for alignment correction (default: 0) */
  gridLineSpacing?: number;
  /** X offset to shift grid starting position (default: 0) */
  offsetX?: number;
  /** Y offset to shift grid starting position (default: 0) */
  offsetY?: number;
}

export class SpriteSlicer {
  private imagePath: string;
  private grid: GridConfig;
  private gridLineWidth: number;
  private gridLineSpacing: number;
  private offsetX: number;
  private offsetY: number;

  constructor(options: SlicerOptions) {
    this.imagePath = options.imagePath;
    this.grid = options.grid;
    this.gridLineWidth = options.gridLineWidth ?? 0;
    this.gridLineSpacing = options.gridLineSpacing ?? 0;
    this.offsetX = options.offsetX ?? 0;
    this.offsetY = options.offsetY ?? 0;
  }

  /**
   * Slice the sprite sheet into individual sprites
   */
  async slice(): Promise<SlicedSprite[]> {
    const sprites: SlicedSprite[] = [];
    let index = 0;

    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.columns; col++) {
        const sprite = await this.extractCell(row, col, index);
        sprites.push(sprite);
        index++;
      }
    }

    return sprites;
  }

  /**
   * Extract a single cell from the grid
   * Accounts for grid line spacing between cells if specified
   */
  private async extractCell(row: number, col: number, index: number): Promise<SlicedSprite> {
    const trim = this.gridLineWidth;
    const spacing = this.gridLineSpacing;

    // Calculate cell position accounting for grid lines between cells
    // Each cell starts at: (cellWidth + spacing) * col + spacing/2 (if spacing > 0)
    // This accounts for grid lines consuming space between cells
    let left: number;
    let top: number;

    if (spacing > 0) {
      // Adjusted calculation: grid lines take space between cells
      const effectiveCellWidth = this.grid.cellWidth - spacing;
      const effectiveCellHeight = this.grid.cellHeight - spacing;
      left = col * this.grid.cellWidth + Math.floor(spacing / 2) + trim + this.offsetX;
      top = row * this.grid.cellHeight + Math.floor(spacing / 2) + trim + this.offsetY;
    } else {
      left = col * this.grid.cellWidth + trim + this.offsetX;
      top = row * this.grid.cellHeight + trim + this.offsetY;
    }

    const width = this.grid.cellWidth - (trim * 2) - spacing;
    const height = this.grid.cellHeight - (trim * 2) - spacing;

    const buffer = await sharp(this.imagePath)
      .extract({
        left,
        top,
        width,
        height,
      })
      .ensureAlpha()
      .png()
      .toBuffer();

    return {
      buffer,
      row,
      column: col,
      index,
      originalWidth: width,
      originalHeight: height,
    };
  }

  /**
   * Slice only specific cells by their positions
   */
  async sliceSelected(positions: Array<{ row: number; col: number }>): Promise<SlicedSprite[]> {
    const sprites: SlicedSprite[] = [];

    for (let i = 0; i < positions.length; i++) {
      const { row, col } = positions[i];
      if (row >= 0 && row < this.grid.rows && col >= 0 && col < this.grid.columns) {
        const sprite = await this.extractCell(row, col, i);
        sprites.push(sprite);
      }
    }

    return sprites;
  }

  /**
   * Get the total number of cells in the grid
   */
  get totalCells(): number {
    return this.grid.rows * this.grid.columns;
  }

  /**
   * Get the grid configuration
   */
  getGrid(): GridConfig {
    return { ...this.grid };
  }
}
