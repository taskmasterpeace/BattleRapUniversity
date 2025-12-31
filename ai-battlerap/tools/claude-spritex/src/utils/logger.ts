/**
 * Logger utility for console output with colors
 */

import chalk from 'chalk';

export interface LoggerOptions {
  verbose: boolean;
}

export class Logger {
  private verbose: boolean;
  private startTime: number = 0;

  constructor(options: LoggerOptions = { verbose: false }) {
    this.verbose = options.verbose;
  }

  /** Log informational message */
  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  /** Log success message */
  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  /** Log warning message */
  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  /** Log error message */
  error(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  /** Log debug message (only if verbose) */
  debug(message: string): void {
    if (this.verbose) {
      console.log(chalk.gray('  →'), chalk.gray(message));
    }
  }

  /** Log a section header */
  header(title: string): void {
    console.log();
    console.log(chalk.bold.cyan(`━━━ ${title} ━━━`));
  }

  /** Log a step in progress */
  step(stepNum: number, total: number, message: string): void {
    const progress = `[${stepNum}/${total}]`;
    console.log(chalk.dim(progress), message);
  }

  /** Log progress for sprite processing */
  progress(current: number, total: number, message?: string): void {
    const percent = Math.round((current / total) * 100);
    const bar = this.createProgressBar(percent);
    const text = message ? ` ${message}` : '';
    process.stdout.write(`\r${bar} ${percent}%${text}  `);
    if (current === total) {
      process.stdout.write('\n');
    }
  }

  /** Create a visual progress bar */
  private createProgressBar(percent: number): string {
    const width = 20;
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  /** Start a timer */
  startTimer(): void {
    this.startTime = Date.now();
  }

  /** Get elapsed time since timer started */
  getElapsed(): number {
    return Date.now() - this.startTime;
  }

  /** Log elapsed time */
  logElapsed(prefix: string = 'Completed in'): void {
    const elapsed = this.getElapsed();
    const formatted = this.formatDuration(elapsed);
    this.info(`${prefix} ${chalk.bold(formatted)}`);
  }

  /** Format duration in human-readable format */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    const seconds = (ms / 1000).toFixed(2);
    return `${seconds}s`;
  }

  /** Log extraction summary */
  summary(stats: {
    totalCells: number;
    successfulExtractions: number;
    emptySlots: number;
    processingTimeMs: number;
  }): void {
    console.log();
    console.log(chalk.bold('━━━ Extraction Summary ━━━'));
    console.log(`  Total cells processed: ${chalk.bold(stats.totalCells)}`);
    console.log(`  Sprites extracted:     ${chalk.green.bold(stats.successfulExtractions)}`);
    console.log(`  Empty slots skipped:   ${chalk.yellow(stats.emptySlots)}`);
    console.log(`  Processing time:       ${chalk.cyan(this.formatDuration(stats.processingTimeMs))}`);
    console.log();
  }

  /** Log grid detection results */
  gridInfo(grid: { rows: number; columns: number; cellWidth: number; cellHeight: number; detectedAutomatically: boolean }): void {
    const method = grid.detectedAutomatically ? chalk.cyan('auto-detected') : chalk.green('manual');
    this.info(`Grid: ${grid.columns}×${grid.rows} (${method})`);
    this.debug(`Cell size: ${grid.cellWidth}×${grid.cellHeight}px`);
  }

  /** Log file operation */
  file(action: 'read' | 'write' | 'skip', path: string): void {
    const icons = {
      read: chalk.blue('←'),
      write: chalk.green('→'),
      skip: chalk.yellow('○'),
    };
    if (this.verbose || action !== 'skip') {
      console.log(icons[action], chalk.dim(path));
    }
  }
}

/** Default logger instance */
export const logger = new Logger();

/** Create a new logger with options */
export function createLogger(options: LoggerOptions): Logger {
  return new Logger(options);
}
