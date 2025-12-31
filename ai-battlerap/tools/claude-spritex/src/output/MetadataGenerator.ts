/**
 * MetadataGenerator - Generates JSON metadata for extractions
 */

import { writeFile } from 'fs/promises';
import { join, basename } from 'path';
import {
  GridConfig,
  ProcessedSprite,
  SpriteMetadata,
  ExtractionMetadata,
  ExtractionOptions,
} from '../core/types.js';

const TOOL_VERSION = '1.0.0';

export interface MetadataGeneratorOptions {
  /** Source image path */
  sourcePath: string;
  /** Source image dimensions */
  sourceDimensions: { width: number; height: number };
  /** Grid configuration used */
  grid: GridConfig;
  /** Extraction options used */
  options: ExtractionOptions;
}

export class MetadataGenerator {
  private sourcePath: string;
  private sourceDimensions: { width: number; height: number };
  private grid: GridConfig;
  private options: ExtractionOptions;
  private startTime: number;
  private sprites: SpriteMetadata[] = [];

  constructor(config: MetadataGeneratorOptions) {
    this.sourcePath = config.sourcePath;
    this.sourceDimensions = config.sourceDimensions;
    this.grid = config.grid;
    this.options = config.options;
    this.startTime = Date.now();
  }

  /**
   * Add a sprite to the metadata
   */
  addSprite(
    filename: string,
    index: number,
    sprite: ProcessedSprite
  ): void {
    this.sprites.push({
      filename,
      index,
      gridPosition: {
        row: sprite.row,
        column: sprite.column,
      },
      originalBounds: {
        width: this.grid.cellWidth,
        height: this.grid.cellHeight,
      },
      contentBounds: sprite.contentBounds,
      finalSize: {
        width: sprite.finalWidth,
        height: sprite.finalHeight,
      },
    });
  }

  /**
   * Generate the complete metadata object
   */
  generate(emptySlots: number): ExtractionMetadata {
    const processingTimeMs = Date.now() - this.startTime;

    return {
      version: TOOL_VERSION,
      extractedAt: new Date().toISOString(),
      source: {
        filename: basename(this.sourcePath),
        dimensions: this.sourceDimensions,
        grid: this.grid,
      },
      settings: {
        backgroundColor: this.options.backgroundColor,
        tolerance: this.options.tolerance,
        targetSize: this.options.targetSize,
        padding: this.options.padding,
      },
      sprites: this.sprites,
      stats: {
        totalCells: this.grid.rows * this.grid.columns,
        successfulExtractions: this.sprites.length,
        emptySlots,
        processingTimeMs,
      },
    };
  }

  /**
   * Save metadata to a JSON file
   */
  async saveToFile(outputDir: string, filename: string = 'metadata.json'): Promise<string> {
    const filepath = join(outputDir, filename);
    const metadata = this.generate(
      this.grid.rows * this.grid.columns - this.sprites.length
    );

    await writeFile(filepath, JSON.stringify(metadata, null, 2), 'utf-8');
    return filepath;
  }

  /**
   * Get current sprite count
   */
  getSpriteCount(): number {
    return this.sprites.length;
  }

  /**
   * Get processing time so far
   */
  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Create a summary object for quick stats
   */
  getSummary(): {
    totalCells: number;
    extracted: number;
    empty: number;
    timeMs: number;
  } {
    const totalCells = this.grid.rows * this.grid.columns;
    return {
      totalCells,
      extracted: this.sprites.length,
      empty: totalCells - this.sprites.length,
      timeMs: this.getElapsedTime(),
    };
  }
}

/**
 * Generate master metadata for multiple extractions
 */
export interface MasterMetadataEntry {
  sourceFile: string;
  assetType: string;
  category?: string;
  spriteCount: number;
  outputPath: string;
  extractedAt: string;
}

export class MasterMetadataGenerator {
  private entries: MasterMetadataEntry[] = [];
  private version = TOOL_VERSION;

  /**
   * Add an extraction entry
   */
  addEntry(entry: MasterMetadataEntry): void {
    this.entries.push(entry);
  }

  /**
   * Generate master metadata
   */
  generate(): object {
    const collections: Record<string, { count: number; path: string }> = {};

    for (const entry of this.entries) {
      const key = entry.category
        ? `${entry.assetType}/${entry.category}`
        : entry.assetType;

      if (!collections[key]) {
        collections[key] = { count: 0, path: entry.outputPath };
      }
      collections[key].count += entry.spriteCount;
    }

    return {
      version: this.version,
      generatedAt: new Date().toISOString(),
      collections,
      totalAssets: this.entries.reduce((sum, e) => sum + e.spriteCount, 0),
      sources: this.entries.map((e) => ({
        file: e.sourceFile,
        sprites: e.spriteCount,
        type: e.assetType,
        category: e.category,
      })),
    };
  }

  /**
   * Save master metadata to file
   */
  async saveToFile(outputDir: string, filename: string = 'master_metadata.json'): Promise<string> {
    const filepath = join(outputDir, filename);
    await writeFile(filepath, JSON.stringify(this.generate(), null, 2), 'utf-8');
    return filepath;
  }
}
