/**
 * OutputOrganizer - Handles output directory structure and file saving
 */

import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import sharp from 'sharp';
import { ProcessedSprite } from '../core/types.js';

export interface OutputOrganizerOptions {
  /** Base output directory */
  outputDir: string;
  /** Asset type for subfolder */
  assetType: string;
  /** Optional category subfolder */
  category?: string;
  /** Optional sheet name for per-sheet organization */
  sheetName?: string;
  /** Filename prefix */
  prefix: string;
  /** Starting index for filenames */
  startIndex: number;
}

export class OutputOrganizer {
  private outputDir: string;
  private assetType: string;
  private category?: string;
  private sheetName?: string;
  private prefix: string;
  private startIndex: number;
  private savedCount: number = 0;

  constructor(options: OutputOrganizerOptions) {
    this.outputDir = options.outputDir;
    this.assetType = options.assetType;
    this.category = options.category;
    this.sheetName = options.sheetName;
    this.prefix = options.prefix;
    this.startIndex = options.startIndex;
  }

  /**
   * Get the full output path for sprites
   */
  getOutputPath(): string {
    let path = join(this.outputDir, this.assetType);
    if (this.category) {
      path = join(path, this.category);
    }
    if (this.sheetName) {
      path = join(path, this.sheetName);
    }
    return path;
  }

  /**
   * Ensure the output directory exists
   */
  async ensureDirectory(): Promise<void> {
    const path = this.getOutputPath();
    await mkdir(path, { recursive: true });
  }

  /**
   * Generate a filename for a sprite
   */
  generateFilename(index: number): string {
    const num = (this.startIndex + index).toString().padStart(3, '0');
    return `${this.prefix}_${num}.png`;
  }

  /**
   * Get the full path for a sprite file
   */
  getSpritePath(index: number): string {
    return join(this.getOutputPath(), this.generateFilename(index));
  }

  /**
   * Save a processed sprite
   */
  async saveSprite(sprite: ProcessedSprite, spriteIndex: number): Promise<string> {
    const filename = this.generateFilename(spriteIndex);
    const filepath = join(this.getOutputPath(), filename);

    await sharp(sprite.buffer)
      .png({ compressionLevel: 9 })
      .toFile(filepath);

    this.savedCount++;
    return filename;
  }

  /**
   * Save multiple sprites
   */
  async saveSprites(sprites: ProcessedSprite[]): Promise<string[]> {
    await this.ensureDirectory();

    const filenames: string[] = [];
    let spriteIndex = 0;

    for (const sprite of sprites) {
      if (!sprite.isEmpty) {
        const filename = await this.saveSprite(sprite, spriteIndex);
        filenames.push(filename);
        spriteIndex++;
      }
    }

    return filenames;
  }

  /**
   * Save raw buffer as PNG
   */
  async saveBuffer(buffer: Buffer, filename: string): Promise<string> {
    const filepath = join(this.getOutputPath(), filename);
    await this.ensureDirectory();

    await sharp(buffer)
      .png({ compressionLevel: 9 })
      .toFile(filepath);

    return filepath;
  }

  /**
   * Save JSON data to file
   */
  async saveJson(data: object, filename: string): Promise<string> {
    const filepath = join(this.getOutputPath(), filename);
    await this.ensureDirectory();

    const json = JSON.stringify(data, null, 2);
    await writeFile(filepath, json, 'utf-8');

    return filepath;
  }

  /**
   * Get the number of sprites saved
   */
  getSavedCount(): number {
    return this.savedCount;
  }

  /**
   * Reset the saved count
   */
  resetCount(): void {
    this.savedCount = 0;
  }
}
