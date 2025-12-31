#!/usr/bin/env node

/**
 * CLI for claude-spritex sprite extraction tool
 */

import { Command } from 'commander';
import { glob } from 'glob';
import { resolve, basename } from 'path';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { SpriteExtractor, createDefaultOptions } from './core/SpriteExtractor.js';
import { MasterMetadataGenerator } from './output/MetadataGenerator.js';
import { Logger } from './utils/logger.js';
import { ExtractionOptions, SheetConfig, SheetAnalysis } from './core/types.js';
import { GridDetector } from './core/GridDetector.js';

const program = new Command();

program
  .name('spritex')
  .description('Extract sprites from sprite sheet images')
  .version('1.0.0');

program
  .command('extract')
  .description('Extract sprites from a sprite sheet')
  .argument('[input]', 'Input sprite sheet image or glob pattern (optional if using --config)')
  .requiredOption('-o, --output <dir>', 'Output directory')
  .option('--config <file>', 'Use configuration file for per-sheet grid settings')
  .option('-t, --type <type>', 'Asset type (characters|badges|venues|custom)', 'characters')
  .option('-c, --category <name>', 'Category subfolder (e.g., male, female)')
  .option('-r, --rows <number>', 'Number of rows in grid', parseInt)
  .option('--cols <number>', 'Number of columns in grid', parseInt)
  .option('--bg-color <hex>', 'Background color to remove', '#FFFFFF')
  .option('--chroma-green', 'Use chroma key green (#00FF00) as background')
  .option('--tolerance <number>', 'Color tolerance (0-255)', parseInt)
  .option('--trim-grid <px>', 'Trim grid lines from cell edges (pixels)', parseInt)
  .option('--remove-dark-lines', 'Remove dark grid lines from sprites')
  .option('--defringe', 'Remove green fringe from sprite edges (for chroma green)')
  .option('--offset-x <px>', 'X offset to shift grid starting position', (val) => parseInt(val, 10), 0)
  .option('--offset-y <px>', 'Y offset to shift grid starting position', (val) => parseInt(val, 10), 0)
  .option('--per-sheet', 'Organize output into folders by source sheet name')
  .option('--target-size <px>', 'Target canvas size', (val) => parseInt(val, 10), 512)
  .option('--padding <px>', 'Padding around sprite', (val) => parseInt(val, 10), 20)
  .option('--prefix <name>', 'Filename prefix', 'sprite')
  .option('--start-index <number>', 'Starting index for filenames', (val) => parseInt(val, 10), 1)
  .option('--no-metadata', 'Skip metadata.json generation')
  .option('--dry-run', 'Preview without saving files')
  .option('-v, --verbose', 'Verbose output')
  .action(async (input: string | undefined, options: Record<string, unknown>) => {
    const logger = new Logger({ verbose: options.verbose as boolean });

    try {
      let files: string[] = [];
      let sheetConfigMap: Map<string, SheetAnalysis> = new Map();

      // Load config if provided
      if (options.config) {
        const configPath = resolve(options.config as string);
        if (!existsSync(configPath)) {
          logger.error(`Config file not found: ${configPath}`);
          process.exit(1);
        }

        const config: SheetConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
        logger.info(`Loaded config with ${config.sheets.length} sheet(s)`);

        // Build map of filename to config
        for (const sheet of config.sheets) {
          sheetConfigMap.set(sheet.file, sheet);
        }

        // If input is provided with config, use it to filter/locate files
        if (input) {
          const inputPath = resolve(input);
          files = await glob(inputPath, { windowsPathsNoEscape: true });
        } else {
          // Find files matching config entries in current directory or common locations
          logger.warn('No input pattern provided, searching for files from config...');
          // Try to find each file from the config
          for (const sheet of config.sheets) {
            // Try common locations
            const possiblePaths = [
              resolve(sheet.file),
              resolve('raw images', sheet.file),
              resolve('..', 'raw images', sheet.file),
              resolve('C:\\git\\battlerapuniversity\\raw images', sheet.file),
            ];
            for (const p of possiblePaths) {
              if (existsSync(p)) {
                files.push(p);
                break;
              }
            }
          }
        }
      } else {
        // No config - require input
        if (!input) {
          logger.error('Either <input> or --config is required');
          process.exit(1);
        }
        const inputPath = resolve(input);
        files = await glob(inputPath, { windowsPathsNoEscape: true });

        if (files.length === 0) {
          // Try treating it as a direct file path
          files.push(inputPath);
        }
      }

      if (files.length === 0) {
        logger.error('No files found to process');
        process.exit(1);
      }

      logger.header('Claude Spritex');
      logger.info(`Found ${files.length} file(s) to process`);

      // Process each file
      const masterMeta = new MasterMetadataGenerator();
      let totalSprites = 0;
      let globalIndex = typeof options.startIndex === 'number' ? options.startIndex : 1;

      for (const file of files) {
        const filename = basename(file);
        logger.info(`Processing: ${filename}`);

        // Get per-sheet config if available
        const sheetConfig = sheetConfigMap.get(filename);
        const rows = sheetConfig?.rows || (options.rows as number | undefined);
        const cols = sheetConfig?.cols || (options.cols as number | undefined);

        if (sheetConfig) {
          logger.debug(`  Using config: ${cols}×${rows} (confidence: ${(sheetConfig.confidence * 100).toFixed(0)}%)`);
        }

        // Determine background color (chroma green takes precedence)
        const bgColor = options.chromaGreen ? '#00FF00' : ((options.bgColor as string) || '#FFFFFF');
        // Use higher tolerance for chroma green to handle color variations/dithering
        const tolerance = options.chromaGreen
          ? (typeof options.tolerance === 'number' ? options.tolerance : 80)
          : (typeof options.tolerance === 'number' ? options.tolerance : 15);

        const extractionOptions: ExtractionOptions = {
          input: file,
          output: resolve(options.output as string),
          assetType: (options.type as string) || 'characters',
          category: options.category as string | undefined,
          rows,
          columns: cols,
          backgroundColor: bgColor,
          tolerance,
          useFloodFill: !options.chromaGreen, // Disable flood fill for chroma green
          gridLineWidth: options.trimGrid as number | undefined,
          removeDarkLines: options.removeDarkLines as boolean || false,
          defringe: options.defringe as boolean || false,
          offsetX: typeof options.offsetX === 'number' ? options.offsetX : 0,
          offsetY: typeof options.offsetY === 'number' ? options.offsetY : 0,
          perSheet: options.perSheet as boolean || false,
          targetSize: typeof options.targetSize === 'number' ? options.targetSize : 512,
          padding: typeof options.padding === 'number' ? options.padding : 20,
          prefix: (options.prefix as string) || 'sprite',
          startIndex: globalIndex,
          generateMetadata: options.metadata !== false,
          dryRun: options.dryRun as boolean || false,
          verbose: options.verbose as boolean || false,
        } as ExtractionOptions;

        const extractor = new SpriteExtractor(extractionOptions);
        const result = await extractor.extract();

        if (result.success && result.metadata) {
          totalSprites += result.metadata.stats.successfulExtractions;
          globalIndex += result.metadata.stats.successfulExtractions;

          // Add to master metadata
          if (result.outputPath) {
            masterMeta.addEntry({
              sourceFile: filename,
              assetType: extractionOptions.assetType,
              category: extractionOptions.category,
              spriteCount: result.metadata.stats.successfulExtractions,
              outputPath: result.outputPath,
              extractedAt: result.metadata.extractedAt,
            });
          }
        } else if (!result.success) {
          logger.error(`Failed: ${result.error}`);
        }
      }

      // Save master metadata if multiple files processed
      if (files.length > 1 && !options.dryRun && options.metadata !== false) {
        const masterPath = await masterMeta.saveToFile(
          resolve(options.output as string),
          'master_metadata.json'
        );
        logger.success(`Master metadata: ${masterPath}`);
      }

      logger.header('Complete');
      logger.success(`Total sprites extracted: ${totalSprites}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(message);
      process.exit(1);
    }
  });

program
  .command('info')
  .description('Show information about a sprite sheet')
  .argument('<input>', 'Input sprite sheet image')
  .option('-r, --rows <number>', 'Number of rows in grid', parseInt)
  .option('--cols <number>', 'Number of columns in grid', parseInt)
  .option('--bg-color <hex>', 'Background color', '#FFFFFF')
  .option('--tolerance <number>', 'Color tolerance', (val) => parseInt(val, 10), 15)
  .action(async (input: string, options: Record<string, unknown>) => {
    const logger = new Logger({ verbose: true });
    const { GridDetector } = await import('./core/GridDetector.js');
    const sharp = (await import('sharp')).default;

    try {
      const inputPath = resolve(input);
      const metadata = await sharp(inputPath).metadata();

      logger.header('Sprite Sheet Info');
      logger.info(`File: ${basename(inputPath)}`);
      logger.info(`Dimensions: ${metadata.width}×${metadata.height}px`);
      logger.info(`Format: ${metadata.format}`);
      logger.info(`Channels: ${metadata.channels}`);

      // Detect grid
      const detector = new GridDetector({
        imagePath: inputPath,
        rows: options.rows as number | undefined,
        columns: options.cols as number | undefined,
        backgroundColor: options.bgColor as string,
        tolerance: options.tolerance as number,
      });

      const grid = await detector.detect();
      logger.header('Grid Detection');
      logger.gridInfo(grid);
      logger.info(`Total cells: ${grid.rows * grid.columns}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(message);
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze sprite sheets and generate configuration file')
  .argument('<input>', 'Input sprite sheets (glob pattern)')
  .option('-o, --output <file>', 'Output config file', 'sheet-config.json')
  .option('--cols <number>', 'Assumed columns (default: 8)', (val) => parseInt(val, 10), 8)
  .option('--rows <numbers>', 'Possible row counts (comma-separated)', '4,5')
  .action(async (input: string, options: Record<string, unknown>) => {
    const logger = new Logger({ verbose: true });

    try {
      // Resolve input path(s)
      const inputPath = resolve(input);
      const files = await glob(inputPath, { windowsPathsNoEscape: true });

      if (files.length === 0) {
        logger.error('No files found matching pattern');
        process.exit(1);
      }

      logger.header('Sheet Analysis');
      logger.info(`Analyzing ${files.length} sprite sheet(s)...`);

      // Parse possible rows
      const possibleRows = (options.rows as string).split(',').map((r: string) => parseInt(r.trim()));
      const assumedCols = options.cols as number;

      // Analyze each sheet
      const sheets: SheetAnalysis[] = [];

      for (const file of files) {
        const analysis = await GridDetector.analyzeSheet(file);

        // Re-detect with custom options
        const detection = GridDetector.detectFromDimensions(
          analysis.dimensions.width,
          analysis.dimensions.height,
          assumedCols,
          possibleRows
        );

        const sheetAnalysis: SheetAnalysis = {
          file: analysis.file,
          rows: detection.rows,
          cols: detection.cols,
          confidence: Math.round(detection.confidence * 100) / 100,
          dimensions: analysis.dimensions,
          cellSize: {
            width: detection.cellWidth,
            height: detection.cellHeight,
          },
        };

        sheets.push(sheetAnalysis);

        // Log result with confidence indicator
        const confidenceLabel =
          sheetAnalysis.confidence >= 0.9 ? '✓' :
          sheetAnalysis.confidence >= 0.7 ? '?' : '⚠';
        logger.info(
          `${confidenceLabel} ${sheetAnalysis.file}: ${sheetAnalysis.cols}×${sheetAnalysis.rows} ` +
          `(${sheetAnalysis.cellSize.width}×${sheetAnalysis.cellSize.height}px) ` +
          `[${(sheetAnalysis.confidence * 100).toFixed(0)}%]`
        );
      }

      // Create config
      const config: SheetConfig = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        sheets,
      };

      // Save config
      const outputPath = resolve(options.output as string);
      writeFileSync(outputPath, JSON.stringify(config, null, 2));

      // Summary
      logger.header('Summary');
      const highConfidence = sheets.filter(s => s.confidence >= 0.9).length;
      const medConfidence = sheets.filter(s => s.confidence >= 0.7 && s.confidence < 0.9).length;
      const lowConfidence = sheets.filter(s => s.confidence < 0.7).length;

      logger.info(`High confidence (≥90%): ${highConfidence}`);
      if (medConfidence > 0) logger.warn(`Medium confidence (70-90%): ${medConfidence}`);
      if (lowConfidence > 0) logger.error(`Low confidence (<70%): ${lowConfidence} - REVIEW REQUIRED`);

      logger.success(`Config saved: ${outputPath}`);
      logger.info('Review the config file, then run: spritex extract --config sheet-config.json ...');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(message);
      process.exit(1);
    }
  });

program
  .command('manual')
  .description('Manually extract sprites using custom crop regions')
  .argument('<input>', 'Input sprite sheet image')
  .requiredOption('-o, --output <dir>', 'Output directory')
  .option('--crops <file>', 'JSON file with crop regions [{x, y, width, height}, ...]')
  .option('--crop <region>', 'Single crop region as "x,y,width,height" (can be repeated)', (val, prev: string[]) => {
    prev = prev || [];
    prev.push(val);
    return prev;
  }, [])
  .option('--chroma-green', 'Use chroma key green (#00FF00) as background')
  .option('--tolerance <number>', 'Color tolerance (0-255)', (val) => parseInt(val, 10), 80)
  .option('--target-size <px>', 'Target canvas size', (val) => parseInt(val, 10), 512)
  .option('--prefix <name>', 'Filename prefix', 'sprite')
  .option('-v, --verbose', 'Verbose output')
  .action(async (input: string, options: Record<string, unknown>) => {
    const logger = new Logger({ verbose: options.verbose as boolean });
    const sharp = (await import('sharp')).default;
    const { BackgroundRemover } = await import('./processors/BackgroundRemover.js');
    const { ContentTrimmer } = await import('./processors/ContentTrimmer.js');
    const { CanvasNormalizer } = await import('./processors/CanvasNormalizer.js');
    const { mkdir } = await import('fs/promises');
    const { join } = await import('path');

    try {
      const inputPath = resolve(input);
      logger.header('Manual Sprite Extraction');
      logger.info(`Source: ${basename(inputPath)}`);

      // Parse crop regions
      interface CropRegion {
        x: number;
        y: number;
        width: number;
        height: number;
        name?: string;
      }

      let crops: CropRegion[] = [];

      // From JSON file
      if (options.crops) {
        const cropsFile = resolve(options.crops as string);
        if (existsSync(cropsFile)) {
          const data = JSON.parse(readFileSync(cropsFile, 'utf-8'));
          crops = Array.isArray(data) ? data : data.crops || [];
          logger.info(`Loaded ${crops.length} crop regions from ${basename(cropsFile)}`);
        } else {
          logger.error(`Crops file not found: ${cropsFile}`);
          process.exit(1);
        }
      }

      // From command line --crop arguments
      const cropArgs = options.crop as string[];
      if (cropArgs && cropArgs.length > 0) {
        for (const cropStr of cropArgs) {
          const parts = cropStr.split(',').map(s => parseInt(s.trim()));
          if (parts.length >= 4) {
            crops.push({ x: parts[0], y: parts[1], width: parts[2], height: parts[3] });
          }
        }
        logger.info(`Added ${cropArgs.length} crop regions from command line`);
      }

      if (crops.length === 0) {
        logger.error('No crop regions specified. Use --crops <file> or --crop "x,y,w,h"');
        process.exit(1);
      }

      // Setup processors
      const bgColor = options.chromaGreen ? '#00FF00' : '#FFFFFF';
      const tolerance = options.tolerance as number;
      const targetSize = options.targetSize as number;

      const backgroundRemover = new BackgroundRemover({
        backgroundColor: bgColor,
        tolerance,
        useFloodFill: !options.chromaGreen,
        removeDarkLines: true,
      });

      const contentTrimmer = new ContentTrimmer();
      const canvasNormalizer = new CanvasNormalizer({
        targetWidth: targetSize,
        targetHeight: targetSize,
        padding: 20,
      });

      // Ensure output directory
      const outputDir = resolve(options.output as string);
      await mkdir(outputDir, { recursive: true });

      // Process each crop
      const prefix = options.prefix as string;
      let savedCount = 0;

      for (let i = 0; i < crops.length; i++) {
        const crop = crops[i];
        const spriteName = crop.name || `${prefix}_${(i + 1).toString().padStart(3, '0')}`;

        try {
          // Extract region from source
          const cropped = await sharp(inputPath)
            .extract({ left: crop.x, top: crop.y, width: crop.width, height: crop.height })
            .png()
            .toBuffer();

          // Process through pipeline
          const withoutBg = await backgroundRemover.remove(cropped);
          const trimResult = await contentTrimmer.trim(withoutBg);

          if (trimResult.isEmpty) {
            logger.warn(`  ${spriteName}: Empty after processing, skipped`);
            continue;
          }

          const normalized = await canvasNormalizer.normalize(trimResult.buffer);

          // Save
          const outputPath = join(outputDir, `${spriteName}.png`);
          await sharp(normalized).png({ compressionLevel: 9 }).toFile(outputPath);

          savedCount++;
          if (options.verbose) {
            logger.info(`  ✓ ${spriteName}: ${crop.width}×${crop.height} @ (${crop.x},${crop.y})`);
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          logger.error(`  ✗ ${spriteName}: ${errMsg}`);
        }
      }

      logger.header('Complete');
      logger.success(`Extracted ${savedCount}/${crops.length} sprites to ${outputDir}`);

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
