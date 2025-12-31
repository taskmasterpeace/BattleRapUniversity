/**
 * claude-spritex - Sprite extraction tool
 *
 * Extracts individual sprites from sprite sheet images with:
 * - Grid detection (auto or manual)
 * - Background removal
 * - Content trimming
 * - Canvas normalization
 * - Metadata generation
 */

// Core exports
export { SpriteExtractor, createDefaultOptions } from './core/SpriteExtractor.js';
export { GridDetector } from './core/GridDetector.js';
export { SpriteSlicer } from './core/SpriteSlicer.js';

// Processor exports
export { BackgroundRemover } from './processors/BackgroundRemover.js';
export { ContentTrimmer } from './processors/ContentTrimmer.js';
export { CanvasNormalizer } from './processors/CanvasNormalizer.js';

// Output exports
export { OutputOrganizer } from './output/OutputOrganizer.js';
export { MetadataGenerator, MasterMetadataGenerator } from './output/MetadataGenerator.js';

// Utility exports
export { Logger, createLogger } from './utils/logger.js';
export * from './utils/imageUtils.js';

// Type exports
export type {
  ExtractionOptions,
  ExtractionResult,
  ExtractionMetadata,
  GridConfig,
  SlicedSprite,
  ProcessedSprite,
  ContentBounds,
  TrimResult,
  SpriteMetadata,
} from './core/types.js';
