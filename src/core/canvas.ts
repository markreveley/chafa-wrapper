/**
 * ChafaCanvas wrapper - the main rendering surface
 * This module provides high-level canvas abstraction over Chafa
 */

import { CanvasConfig } from "./config.js";
import { SymbolMap } from "./symbols.js";
import { terminal } from "./terminal.js";
import {
  CanvasConfigOptions,
  CellGeometry,
  Color,
  PixelGeometry,
  RenderOutput,
} from "./types.js";

/** Image data input formats */
export type ImageInput =
  | Buffer
  | Uint8Array
  | { data: Uint8Array; width: number; height: number; channels: 3 | 4 }
  | string; // file path

/** Canvas render options */
export interface RenderOptions {
  /** X offset in cells */
  x?: number;
  /** Y offset in cells */
  y?: number;
  /** Width constraint in cells */
  width?: number;
  /** Height constraint in cells */
  height?: number;
  /** Preserve aspect ratio */
  preserveAspectRatio?: boolean;
}

/**
 * Canvas class - the primary rendering surface
 *
 * Note: This is currently a placeholder implementation.
 * Full implementation requires Chafa bindings (WASM or native).
 */
export class Canvas {
  private config: CanvasConfig;
  private symbolMap: SymbolMap | null;
  private content: string[][];

  constructor(config?: CanvasConfig | CanvasConfigOptions) {
    if (config instanceof CanvasConfig) {
      this.config = config;
    } else {
      this.config = CanvasConfig.from(config ?? {});
    }
    this.symbolMap = null;

    // Initialize content grid
    const { geometry } = this.config.resolve();
    this.content = this.createGrid(geometry.width, geometry.height);
  }

  /** Create a new canvas */
  static create(config?: CanvasConfig | CanvasConfigOptions): Canvas {
    return new Canvas(config);
  }

  /** Create canvas with auto-detected terminal settings */
  static auto(overrides?: Partial<CanvasConfigOptions>): Canvas {
    const caps = terminal.capabilities;
    const config = CanvasConfig.create()
      .size(caps.columns, caps.rows)
      .pixelMode(terminal.bestPixelMode)
      .canvasMode(terminal.bestCanvasMode);

    if (overrides) {
      Object.assign(config.getOptions(), overrides);
    }

    return new Canvas(config);
  }

  /** Create an empty grid */
  private createGrid(width: number, height: number): string[][] {
    return Array.from({ length: height }, () =>
      Array.from({ length: width }, () => " ")
    );
  }

  /** Get canvas configuration */
  getConfig(): CanvasConfig {
    return this.config.clone();
  }

  /** Get canvas dimensions */
  get size(): CellGeometry {
    return this.config.resolve().geometry;
  }

  /** Get canvas width */
  get width(): number {
    return this.size.width;
  }

  /** Get canvas height */
  get height(): number {
    return this.size.height;
  }

  /** Set symbol map */
  setSymbolMap(symbolMap: SymbolMap): this {
    this.symbolMap = symbolMap;
    return this;
  }

  /** Clear the canvas */
  clear(): this {
    const { width, height } = this.size;
    this.content = this.createGrid(width, height);
    return this;
  }

  /** Fill canvas with a character */
  fill(char: string): this {
    const fillChar = char[0] ?? " ";
    for (const row of this.content) {
      row.fill(fillChar);
    }
    return this;
  }

  /** Set a character at position */
  setCell(x: number, y: number, char: string): this {
    if (y >= 0 && y < this.content.length) {
      const row = this.content[y];
      if (row && x >= 0 && x < row.length) {
        row[x] = char[0] ?? " ";
      }
    }
    return this;
  }

  /** Get character at position */
  getCell(x: number, y: number): string {
    return this.content[y]?.[x] ?? " ";
  }

  /** Draw text at position */
  drawText(x: number, y: number, text: string): this {
    const row = this.content[y];
    if (row) {
      for (let i = 0; i < text.length && x + i < row.length; i++) {
        if (x + i >= 0) {
          row[x + i] = text[i] ?? " ";
        }
      }
    }
    return this;
  }

  /** Draw a horizontal line */
  drawHLine(x: number, y: number, length: number, char = "─"): this {
    for (let i = 0; i < length; i++) {
      this.setCell(x + i, y, char);
    }
    return this;
  }

  /** Draw a vertical line */
  drawVLine(x: number, y: number, length: number, char = "│"): this {
    for (let i = 0; i < length; i++) {
      this.setCell(x, y + i, char);
    }
    return this;
  }

  /** Draw a rectangle outline */
  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    chars = { h: "─", v: "│", tl: "┌", tr: "┐", bl: "└", br: "┘" }
  ): this {
    // Top and bottom
    this.drawHLine(x + 1, y, width - 2, chars.h);
    this.drawHLine(x + 1, y + height - 1, width - 2, chars.h);

    // Left and right
    this.drawVLine(x, y + 1, height - 2, chars.v);
    this.drawVLine(x + width - 1, y + 1, height - 2, chars.v);

    // Corners
    this.setCell(x, y, chars.tl);
    this.setCell(x + width - 1, y, chars.tr);
    this.setCell(x, y + height - 1, chars.bl);
    this.setCell(x + width - 1, y + height - 1, chars.br);

    return this;
  }

  /** Fill a rectangle */
  fillRect(x: number, y: number, width: number, height: number, char = "█"): this {
    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) {
        this.setCell(col, row, char);
      }
    }
    return this;
  }

  /**
   * Render an image to the canvas
   *
   * Note: This is a placeholder. Full implementation requires Chafa bindings.
   * Currently returns a placeholder pattern.
   */
  async renderImage(
    _input: ImageInput,
    options: RenderOptions = {}
  ): Promise<this> {
    const width = options.width ?? this.width;
    const height = options.height ?? this.height;
    const x = options.x ?? 0;
    const y = options.y ?? 0;

    // Placeholder: draw a pattern to indicate image area
    const pattern = ["░", "▒", "▓", "█"];
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const patternIdx = (row + col) % pattern.length;
        this.setCell(x + col, y + row, pattern[patternIdx] ?? "░");
      }
    }

    return this;
  }

  /**
   * Render raw pixel data
   *
   * Note: Placeholder implementation
   */
  renderPixels(
    _data: Uint8Array,
    _width: number,
    _height: number,
    _options: RenderOptions = {}
  ): this {
    // Placeholder - requires Chafa bindings
    return this;
  }

  /** Convert canvas to string output */
  toString(): string {
    return this.content.map((row) => row.join("")).join("\n");
  }

  /** Get render output with metadata */
  toOutput(): RenderOutput {
    return {
      content: this.toString(),
      width: this.width,
      height: this.height,
    };
  }

  /** Print canvas to stdout */
  print(): void {
    console.log(this.toString());
  }

  /** Copy a region from another canvas */
  blit(source: Canvas, srcX = 0, srcY = 0, dstX = 0, dstY = 0, width?: number, height?: number): this {
    const w = width ?? source.width;
    const h = height ?? source.height;

    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const char = source.getCell(srcX + col, srcY + row);
        this.setCell(dstX + col, dstY + row, char);
      }
    }

    return this;
  }

  /** Create a sub-canvas view */
  subCanvas(x: number, y: number, width: number, height: number): Canvas {
    const sub = Canvas.create(
      CanvasConfig.create().size(width, height)
    );

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        sub.setCell(col, row, this.getCell(x + col, y + row));
      }
    }

    return sub;
  }
}

/**
 * Quick render function for simple use cases
 */
export async function render(
  input: ImageInput,
  options?: CanvasConfigOptions & RenderOptions
): Promise<string> {
  const canvas = Canvas.auto(options);
  await canvas.renderImage(input, options);
  return canvas.toString();
}
