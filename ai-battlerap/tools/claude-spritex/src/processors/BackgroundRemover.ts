/**
 * BackgroundRemover - Removes background color and makes it transparent
 */
import sharp from 'sharp';
import { hexToRgb, colorsMatch } from '../utils/imageUtils.js';

export interface BackgroundRemoverOptions {
  backgroundColor: string;
  tolerance: number;
  useFloodFill?: boolean;
  edgeCleanup?: boolean;
  removeDarkLines?: boolean;
  defringe?: boolean;
}

export class BackgroundRemover {
  private bgColor: { r: number; g: number; b: number };
  private tolerance: number;
  private useFloodFill: boolean;
  private edgeCleanup: boolean;
  private removeDarkLines: boolean;
  private applyDefringe: boolean;

  constructor(options: BackgroundRemoverOptions) {
    this.bgColor = hexToRgb(options.backgroundColor);
    this.tolerance = options.tolerance;
    this.useFloodFill = options.useFloodFill ?? true;
    this.edgeCleanup = options.edgeCleanup ?? true;
    this.removeDarkLines = options.removeDarkLines ?? false;
    this.applyDefringe = options.defringe ?? false;
  }

  async remove(inputBuffer: Buffer): Promise<Buffer> {
    let result = this.useFloodFill
      ? await this.removeWithFloodFill(inputBuffer)
      : await this.removeSimple(inputBuffer);
    if (this.applyDefringe) result = await BackgroundRemover.defringe(result);
    return result;
  }

  private async removeWithFloodFill(inputBuffer: Buffer): Promise<Buffer> {
    const pngBuffer = await sharp(inputBuffer).ensureAlpha().png().toBuffer();
    const metadata = await sharp(pngBuffer).metadata();
    const width = metadata.width!, height = metadata.height!;
    const rawData = await sharp(pngBuffer).raw().toBuffer();
    const outputData = Buffer.from(rawData);
    const visited = new Uint8Array(width * height);
    const getIdx = (x: number, y: number) => (y * width + x) * 4;

    const isBackground = (x: number, y: number) => {
      const idx = getIdx(x, y);
      return colorsMatch(rawData[idx], rawData[idx+1], rawData[idx+2],
        this.bgColor.r, this.bgColor.g, this.bgColor.b, this.tolerance);
    };

    const floodFill = (startX: number, startY: number) => {
      const queue: [number, number][] = [[startX, startY]];
      while (queue.length > 0) {
        const [x, y] = queue.shift()!;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        const visitIdx = y * width + x;
        if (visited[visitIdx] || !isBackground(x, y)) continue;
        visited[visitIdx] = 1;
        const idx = getIdx(x, y);
        outputData[idx] = outputData[idx+1] = outputData[idx+2] = outputData[idx+3] = 0;
        queue.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
      }
    };

    for (let x = 0; x < width; x++) { floodFill(x, 0); floodFill(x, height-1); }
    for (let y = 0; y < height; y++) { floodFill(0, y); floodFill(width-1, y); }
    if (this.edgeCleanup) this.cleanupEdges(outputData, width, height);
    return sharp(outputData, { raw: { width, height, channels: 4 } }).png().toBuffer();
  }

  private cleanupEdges(data: Buffer, width: number, height: number): void {
    const getIdx = (x: number, y: number) => (y * width + x) * 4;
    const isTransparent = (x: number, y: number) =>
      x < 0 || x >= width || y < 0 || y >= height || data[getIdx(x, y) + 3] === 0;
    const isNearBackground = (x: number, y: number) => {
      const idx = getIdx(x, y);
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (this.bgColor.g > 200 && this.bgColor.r < 50 && this.bgColor.b < 50) {
        return (g - Math.max(r, b)) > 30;
      }
      return Math.min(r,g,b) > 180 && (Math.max(r,g,b) - Math.min(r,g,b)) < 30;
    };

    for (let pass = 0; pass < 3; pass++) {
      const toClean: [number, number][] = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (data[getIdx(x, y) + 3] === 0) continue;
          let count = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++)
            if ((dx || dy) && isTransparent(x+dx, y+dy)) count++;
          if (count >= (pass === 0 ? 1 : 2) && isNearBackground(x, y)) toClean.push([x, y]);
        }
      }
      if (!toClean.length) break;
      for (const [x, y] of toClean) {
        const idx = getIdx(x, y);
        data[idx] = data[idx+1] = data[idx+2] = data[idx+3] = 0;
      }
    }
  }

  private async removeSimple(inputBuffer: Buffer): Promise<Buffer> {
    const pngBuffer = await sharp(inputBuffer).ensureAlpha().png().toBuffer();
    const metadata = await sharp(pngBuffer).metadata();
    const width = metadata.width!, height = metadata.height!;
    const rawData = await sharp(pngBuffer).raw().toBuffer();
    const outputData = Buffer.alloc(rawData.length);

    for (let i = 0; i < rawData.length; i += 4) {
      if (colorsMatch(rawData[i], rawData[i+1], rawData[i+2],
          this.bgColor.r, this.bgColor.g, this.bgColor.b, this.tolerance)) {
        outputData[i] = outputData[i+1] = outputData[i+2] = outputData[i+3] = 0;
      } else {
        outputData[i] = rawData[i]; outputData[i+1] = rawData[i+1];
        outputData[i+2] = rawData[i+2]; outputData[i+3] = rawData[i+3];
      }
    }
    if (this.edgeCleanup) this.cleanupEdges(outputData, width, height);
    if (this.removeDarkLines) this.removeDarkGridLines(outputData, width, height);
    return sharp(outputData, { raw: { width, height, channels: 4 } }).png().toBuffer();
  }

  private removeDarkGridLines(data: Buffer, width: number, height: number): void {
    const getIdx = (x: number, y: number) => (y * width + x) * 4;
    const isDark = (x: number, y: number) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return false;
      const idx = getIdx(x, y);
      return data[idx+3] !== 0 && Math.max(data[idx], data[idx+1], data[idx+2]) < 50;
    };

    const vertLines: number[] = [], horizLines: number[] = [];
    for (let x = 0; x < 30; x++) {
      let c = 0; for (let y = 0; y < height; y += 5) if (isDark(x, y)) c++;
      if (c >= (height/5)*0.6) vertLines.push(x);
    }
    for (let x = width-30; x < width; x++) {
      let c = 0; for (let y = 0; y < height; y += 5) if (isDark(x, y)) c++;
      if (c >= (height/5)*0.6) vertLines.push(x);
    }
    for (let y = 0; y < 30; y++) {
      let c = 0; for (let x = 0; x < width; x += 5) if (isDark(x, y)) c++;
      if (c >= (width/5)*0.6) horizLines.push(y);
    }
    for (let y = height-30; y < height; y++) {
      let c = 0; for (let x = 0; x < width; x += 5) if (isDark(x, y)) c++;
      if (c >= (width/5)*0.6) horizLines.push(y);
    }

    for (const x of vertLines) for (let y = 0; y < height; y++) if (isDark(x, y)) {
      const idx = getIdx(x, y); data[idx] = data[idx+1] = data[idx+2] = data[idx+3] = 0;
    }
    for (const y of horizLines) for (let x = 0; x < width; x++) if (isDark(x, y)) {
      const idx = getIdx(x, y); data[idx] = data[idx+1] = data[idx+2] = data[idx+3] = 0;
    }
  }

  async passthrough(inputBuffer: Buffer): Promise<Buffer> {
    return sharp(inputBuffer).ensureAlpha().png().toBuffer();
  }

  static async defringe(inputBuffer: Buffer): Promise<Buffer> {
    const { data, info } = await sharp(inputBuffer).ensureAlpha().raw()
      .toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const newData = Buffer.from(data);
    const getIdx = (x: number, y: number) => (y * width + x) * 4;
    const isTransparent = (x: number, y: number) =>
      x < 0 || x >= width || y < 0 || y >= height || newData[getIdx(x, y) + 3] === 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = getIdx(x, y);
        const r = newData[idx], g = newData[idx+1], b = newData[idx+2], a = newData[idx+3];
        if (a === 0) continue;

        let nearEdge = false;
        for (let dy = -1; dy <= 1 && !nearEdge; dy++)
          for (let dx = -1; dx <= 1 && !nearEdge; dx++)
            if ((dx || dy) && isTransparent(x+dx, y+dy)) nearEdge = true;

        const greenDom = g - Math.max(r, b);
        if (nearEdge) {
          if (greenDom > 20) newData[idx+3] = 0;
          else if (greenDom > 0) newData[idx+1] = Math.min(g, Math.max(r, b) + 10);
        } else if (greenDom > 60 && a < 250) newData[idx+3] = 0;
      }
    }
    return sharp(newData, { raw: { width, height, channels: 4 } }).png().toBuffer();
  }

  static async defringeBatch(
    filePaths: string[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<{ processed: number; errors: number }> {
    let processed = 0, errors = 0;
    for (const fp of filePaths) {
      try {
        const defringed = await BackgroundRemover.defringe(await sharp(fp).toBuffer());
        await sharp(defringed).png().toFile(fp);
        processed++;
        onProgress?.(processed, filePaths.length);
      } catch { errors++; }
    }
    return { processed, errors };
  }
}
