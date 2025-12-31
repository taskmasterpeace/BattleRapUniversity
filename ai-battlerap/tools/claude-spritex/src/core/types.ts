/**
 * Core types for the sprite extraction tool
 */

export interface ExtractionOptions {
  /** Path to input sprite sheet image */
  input: string;
  /** Output directory path */
  output: string;
  /** Asset type for organization */
  assetType: 'characters' | 'badges' | 'venues' | 'custom';
  /** Optional category subfolder */
  category?: string;
  /** Number of rows in the grid (auto-detect if not provided) */
  rows?: number;
  /** Number of columns in the grid (auto-detect if not provided) */
  columns?: number;
  /** Background color to remove (hex format) */
  backgroundColor: string;
  /** Color tolerance for background removal (0-255) */
  tolerance: number;
  /** Use flood fill for background removal (default: true, set false for chroma key) */
  useFloodFill?: boolean;
  /** Pixels to trim from each cell edge to remove grid lines (default: 0) */
  gridLineWidth?: number;
  /** Remove dark grid lines from sprites */
  removeDarkLines?: boolean;
  /** Apply defringe to remove green edge contamination */
  defringe?: boolean;
  /** X offset to shift grid starting position */
  offsetX?: number;
  /** Y offset to shift grid starting position */
  offsetY?: number;
  /** Organize output into folders by source sheet name */
  perSheet?: boolean;
  /** Target canvas size (e.g., 512 for 512x512) */
  targetSize: number;
  /** Padding around sprite content */
  padding: number;
  /** Filename prefix for output files */
  prefix: string;
  /** Starting index for filenames */
  startIndex: number;
  /** Whether to generate metadata JSON */
  generateMetadata: boolean;
  /** Dry run mode - don't save files */
  dryRun: boolean;
  /** Verbose output */
  verbose: boolean;
}

export interface GridConfig {
  /** Number of rows detected */
  rows: number;
  /** Number of columns detected */
  columns: number;
  /** Width of each cell in pixels */
  cellWidth: number;
  /** Height of each cell in pixels */
  cellHeight: number;
  /** Whether grid was auto-detected */
  detectedAutomatically: boolean;
}

export interface SlicedSprite {
  /** Image buffer data */
  buffer: Buffer;
  /** Row position in grid (0-indexed) */
  row: number;
  /** Column position in grid (0-indexed) */
  column: number;
  /** Sequential index */
  index: number;
  /** Original width before processing */
  originalWidth: number;
  /** Original height before processing */
  originalHeight: number;
}

export interface ContentBounds {
  /** Top edge of content */
  top: number;
  /** Left edge of content */
  left: number;
  /** Width of content area */
  width: number;
  /** Height of content area */
  height: number;
}

export interface TrimResult {
  /** Trimmed image buffer */
  buffer: Buffer;
  /** Original dimensions before trim */
  originalWidth: number;
  originalHeight: number;
  /** Content bounding box */
  contentBounds: ContentBounds;
  /** Whether the sprite is empty (all transparent) */
  isEmpty: boolean;
}

export interface ProcessedSprite {
  /** Final processed image buffer */
  buffer: Buffer;
  /** Original grid position */
  row: number;
  column: number;
  index: number;
  /** Content bounds from trimming */
  contentBounds: ContentBounds;
  /** Final dimensions */
  finalWidth: number;
  finalHeight: number;
  /** Whether this cell was empty */
  isEmpty: boolean;
}

export interface SpriteMetadata {
  /** Output filename */
  filename: string;
  /** Sequential index */
  index: number;
  /** Grid position */
  gridPosition: {
    row: number;
    column: number;
  };
  /** Original bounds before processing */
  originalBounds: {
    width: number;
    height: number;
  };
  /** Content bounds after trimming */
  contentBounds: ContentBounds;
  /** Final output size */
  finalSize: {
    width: number;
    height: number;
  };
}

export interface ExtractionMetadata {
  /** Tool version */
  version: string;
  /** Extraction timestamp */
  extractedAt: string;
  /** Source file info */
  source: {
    filename: string;
    dimensions: {
      width: number;
      height: number;
    };
    grid: GridConfig;
  };
  /** Extraction settings */
  settings: {
    backgroundColor: string;
    tolerance: number;
    targetSize: number;
    padding: number;
  };
  /** Individual sprite metadata */
  sprites: SpriteMetadata[];
  /** Summary statistics */
  stats: {
    totalCells: number;
    successfulExtractions: number;
    emptySlots: number;
    processingTimeMs: number;
  };
}

export interface ExtractionResult {
  /** Whether extraction succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Metadata about the extraction */
  metadata?: ExtractionMetadata;
  /** Output directory path */
  outputPath?: string;
}

/**
 * Sheet configuration for the analyze/config workflow
 */
export interface SheetAnalysis {
  /** Source filename */
  file: string;
  /** Detected or configured rows */
  rows: number;
  /** Detected or configured columns */
  cols: number;
  /** Detection confidence (0-1) */
  confidence: number;
  /** Image dimensions */
  dimensions: {
    width: number;
    height: number;
  };
  /** Cell dimensions based on grid */
  cellSize: {
    width: number;
    height: number;
  };
}

export interface SheetConfig {
  /** Config version */
  version: string;
  /** Generated timestamp */
  generatedAt: string;
  /** Individual sheet configurations */
  sheets: SheetAnalysis[];
}
