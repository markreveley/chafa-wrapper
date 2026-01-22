/**
 * ChafaCanvasConfig builder with fluent API
 * Provides sensible defaults and chainable configuration
 */

import {
  CanvasConfigOptions,
  CanvasMode,
  CellGeometry,
  Color,
  ColorExtractor,
  ColorSpace,
  DitherMode,
  Optimization,
  Passthrough,
  PixelGeometry,
  PixelMode,
  SymbolTag,
} from "./types.js";

/** Default configuration values */
const DEFAULTS: Required<CanvasConfigOptions> = {
  geometry: { width: 80, height: 24 },
  cellGeometry: { width: 8, height: 16 },
  pixelMode: PixelMode.SYMBOLS,
  canvasMode: CanvasMode.TRUECOLOR,
  colorSpace: ColorSpace.RGB,
  ditherMode: DitherMode.NONE,
  ditherGrainSize: { width: 4, height: 4 },
  ditherIntensity: 1.0,
  colorExtractor: ColorExtractor.AVERAGE,
  symbolTags: [SymbolTag.BLOCK, SymbolTag.BORDER, SymbolTag.SPACE],
  fillSymbolTags: [],
  workFactor: 5,
  fgColor: "#ffffff",
  bgColor: "#000000",
  fgOnly: false,
  transparencyThreshold: 0.5,
  preprocessing: true,
  optimizations: Optimization.ALL,
  passthrough: Passthrough.NONE,
};

/**
 * Canvas configuration builder
 * Provides a fluent API for configuring Chafa canvas rendering
 */
export class CanvasConfig {
  private options: CanvasConfigOptions;

  constructor(options: CanvasConfigOptions = {}) {
    this.options = { ...options };
  }

  /** Create a new config with default settings */
  static create(): CanvasConfig {
    return new CanvasConfig();
  }

  /** Create config from existing options */
  static from(options: CanvasConfigOptions): CanvasConfig {
    return new CanvasConfig(options);
  }

  /** Clone this configuration */
  clone(): CanvasConfig {
    return new CanvasConfig({ ...this.options });
  }

  /** Set canvas size in character cells */
  size(width: number, height: number): this {
    this.options.geometry = { width, height };
    return this;
  }

  /** Set canvas geometry */
  geometry(geometry: CellGeometry): this {
    this.options.geometry = geometry;
    return this;
  }

  /** Set cell size in pixels (for aspect ratio calculations) */
  cellSize(width: number, height: number): this {
    this.options.cellGeometry = { width, height };
    return this;
  }

  /** Set pixel rendering mode */
  pixelMode(mode: PixelMode): this {
    this.options.pixelMode = mode;
    return this;
  }

  /** Use Unicode symbols for rendering */
  symbols(): this {
    return this.pixelMode(PixelMode.SYMBOLS);
  }

  /** Use Sixel graphics protocol */
  sixels(): this {
    return this.pixelMode(PixelMode.SIXELS);
  }

  /** Use Kitty graphics protocol */
  kitty(): this {
    return this.pixelMode(PixelMode.KITTY);
  }

  /** Use iTerm2 inline images protocol */
  iterm2(): this {
    return this.pixelMode(PixelMode.ITERM2);
  }

  /** Set canvas color mode */
  canvasMode(mode: CanvasMode): this {
    this.options.canvasMode = mode;
    return this;
  }

  /** Use 24-bit truecolor */
  truecolor(): this {
    return this.canvasMode(CanvasMode.TRUECOLOR);
  }

  /** Use 256-color palette */
  colors256(): this {
    return this.canvasMode(CanvasMode.INDEXED_256);
  }

  /** Use 16-color palette */
  colors16(): this {
    return this.canvasMode(CanvasMode.INDEXED_16);
  }

  /** Use 8-color palette */
  colors8(): this {
    return this.canvasMode(CanvasMode.INDEXED_8);
  }

  /** Use foreground/background only (2 colors) */
  fgbg(): this {
    return this.canvasMode(CanvasMode.FGBG);
  }

  /** Set color space */
  colorSpace(space: ColorSpace): this {
    this.options.colorSpace = space;
    return this;
  }

  /** Use perceptual DIN99d color space */
  perceptual(): this {
    return this.colorSpace(ColorSpace.DIN99D);
  }

  /** Set dithering mode */
  dither(mode: DitherMode, intensity?: number): this {
    this.options.ditherMode = mode;
    if (intensity !== undefined) {
      this.options.ditherIntensity = intensity;
    }
    return this;
  }

  /** Set dither grain size */
  ditherGrain(width: number, height: number): this {
    this.options.ditherGrainSize = { width, height };
    return this;
  }

  /** Set color extractor method */
  colorExtractor(extractor: ColorExtractor): this {
    this.options.colorExtractor = extractor;
    return this;
  }

  /** Set symbol tags for rendering */
  symbolTags(...tags: SymbolTag[]): this {
    this.options.symbolTags = tags;
    return this;
  }

  /** Add symbol tags to current set */
  addSymbolTags(...tags: SymbolTag[]): this {
    const current = this.options.symbolTags ?? [];
    this.options.symbolTags = [...new Set([...current, ...tags])];
    return this;
  }

  /** Set fill symbol tags */
  fillSymbolTags(...tags: SymbolTag[]): this {
    this.options.fillSymbolTags = tags;
    return this;
  }

  /** Set work factor (1-9, quality vs speed tradeoff) */
  workFactor(factor: number): this {
    this.options.workFactor = Math.max(1, Math.min(9, factor));
    return this;
  }

  /** Alias for high quality settings */
  quality(level: "fast" | "balanced" | "quality"): this {
    switch (level) {
      case "fast":
        this.workFactor(1);
        this.symbolTags(SymbolTag.HALF);
        break;
      case "balanced":
        this.workFactor(5);
        this.symbolTags(SymbolTag.BLOCK, SymbolTag.BORDER);
        break;
      case "quality":
        this.workFactor(9);
        this.symbolTags(SymbolTag.ALL);
        break;
    }
    return this;
  }

  /** Set assumed foreground color */
  fgColor(color: Color): this {
    this.options.fgColor = color;
    return this;
  }

  /** Set assumed background color */
  bgColor(color: Color): this {
    this.options.bgColor = color;
    return this;
  }

  /** Set both foreground and background colors */
  colors(fg: Color, bg: Color): this {
    this.options.fgColor = fg;
    this.options.bgColor = bg;
    return this;
  }

  /** Enable foreground-only mode */
  fgOnly(enabled = true): this {
    this.options.fgOnly = enabled;
    return this;
  }

  /** Set transparency threshold */
  transparencyThreshold(threshold: number): this {
    this.options.transparencyThreshold = Math.max(0, Math.min(1, threshold));
    return this;
  }

  /** Enable/disable preprocessing */
  preprocessing(enabled: boolean): this {
    this.options.preprocessing = enabled;
    return this;
  }

  /** Set output optimizations */
  optimizations(opts: Optimization): this {
    this.options.optimizations = opts;
    return this;
  }

  /** Set terminal passthrough mode */
  passthrough(mode: Passthrough): this {
    this.options.passthrough = mode;
    return this;
  }

  /** Get the current options */
  getOptions(): CanvasConfigOptions {
    return { ...this.options };
  }

  /** Get resolved options with defaults applied */
  resolve(): Required<CanvasConfigOptions> {
    return {
      ...DEFAULTS,
      ...this.options,
    };
  }

  /** Convert to plain object for serialization */
  toJSON(): CanvasConfigOptions {
    return this.getOptions();
  }
}

/** Preset configurations for common use cases */
export const presets = {
  /** Fast rendering, lower quality */
  fast: (): CanvasConfig => CanvasConfig.create().quality("fast"),

  /** Balanced quality and speed */
  balanced: (): CanvasConfig => CanvasConfig.create().quality("balanced"),

  /** Highest quality rendering */
  quality: (): CanvasConfig => CanvasConfig.create().quality("quality"),

  /** Braille-only rendering (good for high detail) */
  braille: (): CanvasConfig =>
    CanvasConfig.create().symbolTags(SymbolTag.BRAILLE).workFactor(9),

  /** ASCII-only rendering */
  ascii: (): CanvasConfig =>
    CanvasConfig.create().symbolTags(SymbolTag.ASCII).workFactor(5),

  /** Block characters only */
  blocks: (): CanvasConfig =>
    CanvasConfig.create()
      .symbolTags(SymbolTag.BLOCK, SymbolTag.HALF, SymbolTag.QUAD)
      .workFactor(7),

  /** Sixel graphics (for supported terminals) */
  sixel: (): CanvasConfig => CanvasConfig.create().sixels().truecolor(),

  /** Kitty graphics protocol */
  kitty: (): CanvasConfig => CanvasConfig.create().kitty().truecolor(),

  /** iTerm2 inline images */
  iterm2: (): CanvasConfig => CanvasConfig.create().iterm2().truecolor(),

  /** Low-color terminal compatibility */
  lowColor: (): CanvasConfig =>
    CanvasConfig.create()
      .colors16()
      .symbolTags(SymbolTag.ASCII, SymbolTag.HALF)
      .dither(DitherMode.ORDERED),
} as const;
