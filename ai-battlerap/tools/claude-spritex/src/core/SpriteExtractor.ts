/**
 * SpriteExtractor - Main orchestrator for sprite extraction
 */

import { basename } from 'path';
import sharp from 'sharp';
import {
  ExtractionOptions,
  ExtractionResult,
  ProcessedSprite,
  GridConfig,
} from './types.js';
import { GridDetector } from './GridDetector.js';
import { SpriteSlicer } from './SpriteSlicer.js';
import { BackgroundRemover } from '../processors/BackgroundRemover.js';
import { ContentTrimmer } from '../processors/ContentTrimmer.js';
import { CanvasNormalizer } from '../processors/CanvasNormalizer.js';
import { OutputOrganizer } from '../output/OutputOrganizer.js';
import { MetadataGenerator } from '../output/MetadataGenerator.js';
import { Logger } from '../utils/logger.js';

export class SpriteExtractor {
  private options: ExtractionOptions;
  private logger: Logger;

  constructor(options: ExtractionOptions) {
    this.options = options;
    this.logger = new Logger({ verbose: options.verbose });
  }

  /**
   * Run the full extraction pipeline
   */
  async extract(): Promise<ExtractionResult> {
    this.logger.startTimer();

    try {
      // Step 1: Get image metadata
      this.logger.header('Sprite Extraction');
      this.logger.info(`Input: ${basename(this.options.input)}`);

      const imageMetadata = await sharp(this.options.input).metadata();
      const imageWidth = imageMetadata.width || 0;
      const imageHeight = imageMetadata.height || 0;

      this.logger.debug(`Image size: ${imageWidth}×${imageHeight}px`);

      // Step 2: Detect grid
      this.logger.info('Detecting grid layout...');
      const gridDetector = new GridDetector({
        imagePath: this.options.input,
        rows: this.options.rows,
        columns: this.options.columns,
        backgroundColor: this.options.backgroundColor,
        tolerance: this.options.tolerance,
      });

      const grid = await gridDetector.detect();
      this.logger.gridInfo(grid);

      // Validate grid
      if (!GridDetector.validateGrid(grid)) {
        throw new Error(
          `Invalid grid detected: ${grid.columns}×${grid.rows} with cell size ${grid.cellWidth}×${grid.cellHeight}`
        );
      }

      // Step 3: Slice sprites
      this.logger.info('Slicing sprites...');
      const slicer = new SpriteSlicer({
        imagePath: this.options.input,
        grid,
        gridLineWidth: this.options.gridLineWidth,
        offsetX: this.options.offsetX,
        offsetY: this.options.offsetY,
      });

      const slicedSprites = await slicer.slice();
      this.logger.debug(`Sliced ${slicedSprites.length} cells`);

      // Step 4: Process each sprite
      this.logger.info('Processing sprites...');
      const processedSprites = await this.processSprites(slicedSprites, grid);

      // Count empty and valid sprites
      const validSprites = processedSprites.filter((s) => !s.isEmpty);
      const emptyCount = processedSprites.length - validSprites.length;

      this.logger.success(`Found ${validSprites.length} sprites (${emptyCount} empty cells)`);

      // Step 5: Save output (unless dry run)
      if (this.options.dryRun) {
        this.logger.warn('Dry run - no files saved');
        return {
          success: true,
          metadata: this.createMetadata(grid, processedSprites, imageWidth, imageHeight),
        };
      }

      // Save sprites
      this.logger.info('Saving sprites...');

      // Get sheet name for per-sheet organization
      const sheetName = this.options.perSheet
        ? basename(this.options.input).replace(/\.[^/.]+$/, '') // Remove extension
        : undefined;

      const outputOrganizer = new OutputOrganizer({
        outputDir: this.options.output,
        assetType: this.options.assetType,
        category: this.options.category,
        sheetName,
        prefix: this.options.prefix,
        startIndex: this.options.startIndex,
      });

      await outputOrganizer.ensureDirectory();

      // Create metadata generator
      const metadataGen = new MetadataGenerator({
        sourcePath: this.options.input,
        sourceDimensions: { width: imageWidth, height: imageHeight },
        grid,
        options: this.options,
      });

      // Save each valid sprite
      let savedIndex = 0;
      for (let i = 0; i < processedSprites.length; i++) {
        const sprite = processedSprites[i];
        if (!sprite.isEmpty) {
          const filename = await outputOrganizer.saveSprite(sprite, savedIndex);
          metadataGen.addSprite(filename, savedIndex, sprite);
          savedIndex++;

          // Progress update
          if (this.options.verbose || savedIndex % 10 === 0) {
            this.logger.progress(savedIndex, validSprites.length);
          }
        }
      }

      // Save metadata
      if (this.options.generateMetadata) {
        const metadataPath = await metadataGen.saveToFile(
          outputOrganizer.getOutputPath(),
          'metadata.json'
        );
        this.logger.debug(`Metadata saved: ${metadataPath}`);
      }

      // Summary
      const extractionMetadata = metadataGen.generate(emptyCount);
      this.logger.summary(extractionMetadata.stats);
      this.logger.success(`Output: ${outputOrganizer.getOutputPath()}`);

      return {
        success: true,
        metadata: extractionMetadata,
        outputPath: outputOrganizer.getOutputPath(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Extraction failed: ${message}`);
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Process all sliced sprites through the pipeline
   */
  private async processSprites(
    slicedSprites: Array<{
      buffer: Buffer;
      row: number;
      column: number;
      index: number;
      originalWidth: number;
      originalHeight: number;
    }>,
    grid: GridConfig
  ): Promise<ProcessedSprite[]> {
    const backgroundRemover = new BackgroundRemover({
      backgroundColor: this.options.backgroundColor,
      tolerance: this.options.tolerance,
      useFloodFill: this.options.useFloodFill ?? true,
      removeDarkLines: this.options.removeDarkLines ?? false,
      defringe: this.options.defringe ?? false,
    });

    const contentTrimmer = new ContentTrimmer();

    const canvasNormalizer = new CanvasNormalizer({
      targetWidth: this.options.targetSize,
      targetHeight: this.options.targetSize,
      padding: this.options.padding,
    });

    const processedSprites: ProcessedSprite[] = [];

    for (const sprite of slicedSprites) {
      try {
        // Remove background
        const withoutBg = await backgroundRemover.remove(sprite.buffer);

        // Trim transparent edges
        const trimResult = await contentTrimmer.trim(withoutBg);

        if (trimResult.isEmpty) {
          processedSprites.push({
            buffer: sprite.buffer,
            row: sprite.row,
            column: sprite.column,
            index: sprite.index,
            contentBounds: trimResult.contentBounds,
            finalWidth: 0,
            finalHeight: 0,
            isEmpty: true,
          });
          continue;
        }

        // Normalize to target canvas
        const normalized = await canvasNormalizer.normalize(trimResult.buffer);

        processedSprites.push({
          buffer: normalized,
          row: sprite.row,
          column: sprite.column,
          index: sprite.index,
          contentBounds: trimResult.contentBounds,
          finalWidth: this.options.targetSize,
          finalHeight: this.options.targetSize,
          isEmpty: false,
        });
      } catch (err) {
        // Log the error for debugging
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`  Error processing sprite ${sprite.index}: ${errMsg}`);

        // If processing fails, mark as empty
        processedSprites.push({
          buffer: sprite.buffer,
          row: sprite.row,
          column: sprite.column,
          index: sprite.index,
          contentBounds: { top: 0, left: 0, width: 0, height: 0 },
          finalWidth: 0,
          finalHeight: 0,
          isEmpty: true,
        });
      }
    }

    return processedSprites;
  }

  /**
   * Create metadata without saving
   */
  private createMetadata(
    grid: GridConfig,
    sprites: ProcessedSprite[],
    imageWidth: number,
    imageHeight: number
  ) {
    const metadataGen = new MetadataGenerator({
      sourcePath: this.options.input,
      sourceDimensions: { width: imageWidth, height: imageHeight },
      grid,
      options: this.options,
    });

    let index = 0;
    for (const sprite of sprites) {
      if (!sprite.isEmpty) {
        const filename = `${this.options.prefix}_${(this.options.startIndex + index).toString().padStart(3, '0')}.png`;
        metadataGen.addSprite(filename, index, sprite);
        index++;
      }
    }

    return metadataGen.generate(sprites.filter((s) => s.isEmpty).length);
  }
}

/**
 * Create default extraction options
 */
export function createDefaultOptions(
  input: string,
  output: string
): ExtractionOptions {
  return {
    input,
    output,
    assetType: 'characters',
    backgroundColor: '#FFFFFF',
    tolerance: 15,
    targetSize: 512,
    padding: 20,
    prefix: 'sprite',
    startIndex: 1,
    generateMetadata: true,
    dryRun: false,
    verbose: false,
  };
}
