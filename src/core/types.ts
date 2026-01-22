/**
 * Core Chafa type definitions
 * These map to the underlying Chafa C library enums and structures
 */

/** Pixel rendering mode - determines output format */
export enum PixelMode {
  /** Render using Unicode/ANSI symbols */
  SYMBOLS = "symbols",
  /** Render using Sixel graphics protocol */
  SIXELS = "sixels",
  /** Render using Kitty graphics protocol */
  KITTY = "kitty",
  /** Render using iTerm2 inline images protocol */
  ITERM2 = "iterm2",
}

/** Canvas color mode - determines color depth */
export enum CanvasMode {
  /** 24-bit truecolor (16 million colors) */
  TRUECOLOR = "truecolor",
  /** 256-color indexed palette */
  INDEXED_256 = "indexed-256",
  /** 240-color indexed (256 minus system colors) */
  INDEXED_240 = "indexed-240",
  /** 16-color indexed palette */
  INDEXED_16 = "indexed-16",
  /** 8-color indexed palette */
  INDEXED_8 = "indexed-8",
  /** Foreground/background only (2 colors) */
  FGBG = "fgbg",
}

/** Color space for color calculations */
export enum ColorSpace {
  /** Standard RGB color space */
  RGB = "rgb",
  /** DIN99d perceptually uniform color space */
  DIN99D = "din99d",
}

/** Dithering algorithm for color reduction */
export enum DitherMode {
  /** No dithering */
  NONE = "none",
  /** Ordered (Bayer) dithering */
  ORDERED = "ordered",
  /** Error diffusion dithering */
  DIFFUSION = "diffusion",
  /** Random noise dithering */
  NOISE = "noise",
}

/** Color extraction method from image pixels */
export enum ColorExtractor {
  /** Use average color of pixel region */
  AVERAGE = "average",
  /** Use median color of pixel region */
  MEDIAN = "median",
}

/** Symbol tags for character selection */
export enum SymbolTag {
  /** No symbols */
  NONE = "none",
  /** Space character only */
  SPACE = "space",
  /** Solid/filled characters */
  SOLID = "solid",
  /** Stipple/shade patterns */
  STIPPLE = "stipple",
  /** Block elements (█ ▄ ▀) */
  BLOCK = "block",
  /** Box drawing characters (─ │ ┌ ┐) */
  BORDER = "border",
  /** Diagonal line characters */
  DIAGONAL = "diagonal",
  /** Dot patterns */
  DOT = "dot",
  /** Quadrant blocks */
  QUAD = "quad",
  /** Sextant blocks (2x3 subdivisions) */
  SEXTANT = "sextant",
  /** Octant blocks (2x4 subdivisions) */
  OCTANT = "octant",
  /** Half blocks (horizontal/vertical) */
  HALF = "half",
  /** Braille patterns (⠀ ⠁ ⠂) */
  BRAILLE = "braille",
  /** Technical symbols */
  TECHNICAL = "technical",
  /** Geometric shapes */
  GEOMETRIC = "geometric",
  /** Wedge/triangle shapes */
  WEDGE = "wedge",
  /** Wide characters */
  WIDE = "wide",
  /** Narrow characters */
  NARROW = "narrow",
  /** ASCII characters only */
  ASCII = "ascii",
  /** Legacy character set */
  LEGACY = "legacy",
  /** All available symbols */
  ALL = "all",
}

/** Optimization flags for output */
export enum Optimization {
  /** No optimizations */
  NONE = 0,
  /** Reuse color attributes when unchanged */
  REUSE_ATTRIBUTES = 1 << 0,
  /** Combine repeated cells */
  REPEAT_CELLS = 1 << 1,
  /** All optimizations enabled */
  ALL = REUSE_ATTRIBUTES | REPEAT_CELLS,
}

/** Terminal passthrough mode for nested terminals */
export enum Passthrough {
  /** No passthrough */
  NONE = "none",
  /** GNU Screen passthrough */
  SCREEN = "screen",
  /** tmux passthrough */
  TMUX = "tmux",
}

/** Geometry in character cells */
export interface CellGeometry {
  /** Width in character cells */
  width: number;
  /** Height in character cells */
  height: number;
}

/** Geometry in pixels */
export interface PixelGeometry {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

/** RGB color representation */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/** RGBA color representation */
export interface RgbaColor extends RgbColor {
  a: number;
}

/** Color type - hex string, RGB object, or named color */
export type Color = string | RgbColor | RgbaColor;

/** Canvas configuration options */
export interface CanvasConfigOptions {
  /** Canvas size in character cells */
  geometry?: CellGeometry;
  /** Cell size in pixels (for aspect ratio) */
  cellGeometry?: PixelGeometry;
  /** Pixel rendering mode */
  pixelMode?: PixelMode;
  /** Color mode/depth */
  canvasMode?: CanvasMode;
  /** Color space for calculations */
  colorSpace?: ColorSpace;
  /** Dithering algorithm */
  ditherMode?: DitherMode;
  /** Dither pattern size */
  ditherGrainSize?: PixelGeometry;
  /** Dither intensity (0.0 - 1.0) */
  ditherIntensity?: number;
  /** Color extraction method */
  colorExtractor?: ColorExtractor;
  /** Symbol tags to use */
  symbolTags?: SymbolTag[];
  /** Fill symbol tags */
  fillSymbolTags?: SymbolTag[];
  /** Work factor (1-9, quality vs speed) */
  workFactor?: number;
  /** Assumed foreground color */
  fgColor?: Color;
  /** Assumed background color */
  bgColor?: Color;
  /** Use foreground colors only */
  fgOnly?: boolean;
  /** Alpha transparency threshold (0.0 - 1.0) */
  transparencyThreshold?: number;
  /** Enable preprocessing (contrast/saturation) */
  preprocessing?: boolean;
  /** Output optimizations */
  optimizations?: Optimization;
  /** Terminal passthrough mode */
  passthrough?: Passthrough;
}

/** Render output result */
export interface RenderOutput {
  /** The rendered string output */
  content: string;
  /** Actual width in character cells */
  width: number;
  /** Actual height in character cells */
  height: number;
}
