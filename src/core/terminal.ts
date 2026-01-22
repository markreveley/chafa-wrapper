/**
 * Terminal capability detection and information
 * Provides automatic detection of terminal features for graceful degradation
 */

import { CanvasMode, PixelMode } from "./types.js";

/** Terminal capability flags */
export interface TerminalCapabilities {
  /** Terminal name/type */
  name: string;
  /** Supports truecolor (24-bit) */
  truecolor: boolean;
  /** Supports 256 colors */
  colors256: boolean;
  /** Supports 16 colors */
  colors16: boolean;
  /** Supports Sixel graphics */
  sixel: boolean;
  /** Supports Kitty graphics protocol */
  kitty: boolean;
  /** Supports iTerm2 inline images */
  iterm2: boolean;
  /** Supports Unicode */
  unicode: boolean;
  /** Terminal width in columns */
  columns: number;
  /** Terminal height in rows */
  rows: number;
  /** Cell width in pixels (if known) */
  cellWidth?: number;
  /** Cell height in pixels (if known) */
  cellHeight?: number;
}

/** Known terminal types with their capabilities */
const KNOWN_TERMINALS: Record<string, Partial<TerminalCapabilities>> = {
  "kitty": {
    truecolor: true,
    colors256: true,
    kitty: true,
    unicode: true,
  },
  "iterm2": {
    truecolor: true,
    colors256: true,
    iterm2: true,
    unicode: true,
  },
  "iterm.app": {
    truecolor: true,
    colors256: true,
    iterm2: true,
    unicode: true,
  },
  "wezterm": {
    truecolor: true,
    colors256: true,
    kitty: true,
    sixel: true,
    unicode: true,
  },
  "vscode": {
    truecolor: true,
    colors256: true,
    unicode: true,
  },
  "xterm-256color": {
    truecolor: true,
    colors256: true,
    unicode: true,
  },
  "xterm-kitty": {
    truecolor: true,
    colors256: true,
    kitty: true,
    unicode: true,
  },
  "mlterm": {
    truecolor: true,
    colors256: true,
    sixel: true,
    unicode: true,
  },
  "mintty": {
    truecolor: true,
    colors256: true,
    sixel: true,
    unicode: true,
  },
  "foot": {
    truecolor: true,
    colors256: true,
    sixel: true,
    unicode: true,
  },
  "contour": {
    truecolor: true,
    colors256: true,
    sixel: true,
    kitty: true,
    unicode: true,
  },
  "alacritty": {
    truecolor: true,
    colors256: true,
    unicode: true,
  },
  "gnome-terminal": {
    truecolor: true,
    colors256: true,
    unicode: true,
  },
  "konsole": {
    truecolor: true,
    colors256: true,
    unicode: true,
  },
  "xterm": {
    colors256: true,
    colors16: true,
    unicode: true,
  },
  "linux": {
    colors16: true,
    unicode: false,
  },
  "dumb": {
    colors16: false,
    unicode: false,
  },
};

/**
 * Detect terminal capabilities from environment
 */
export function detectCapabilities(): TerminalCapabilities {
  const env = process.env;

  // Get terminal size
  const columns = process.stdout.columns ?? 80;
  const rows = process.stdout.rows ?? 24;

  // Determine terminal name
  const termProgram = env["TERM_PROGRAM"]?.toLowerCase() ?? "";
  const term = env["TERM"]?.toLowerCase() ?? "";
  const colorTerm = env["COLORTERM"]?.toLowerCase() ?? "";

  // Start with defaults
  const caps: TerminalCapabilities = {
    name: termProgram || term || "unknown",
    truecolor: false,
    colors256: false,
    colors16: true,
    sixel: false,
    kitty: false,
    iterm2: false,
    unicode: true,
    columns,
    rows,
  };

  // Check for known terminal
  const knownKey = Object.keys(KNOWN_TERMINALS).find(
    (key) => termProgram.includes(key) || term.includes(key)
  );
  if (knownKey) {
    Object.assign(caps, KNOWN_TERMINALS[knownKey]);
  }

  // Check COLORTERM for truecolor support
  if (colorTerm === "truecolor" || colorTerm === "24bit") {
    caps.truecolor = true;
    caps.colors256 = true;
  }

  // Check for 256 color support in TERM
  if (term.includes("256color") || term.includes("256-color")) {
    caps.colors256 = true;
  }

  // Check for Kitty
  if (env["KITTY_WINDOW_ID"] !== undefined) {
    caps.kitty = true;
    caps.truecolor = true;
  }

  // Check for iTerm2
  if (termProgram === "iterm.app" || env["ITERM_SESSION_ID"] !== undefined) {
    caps.iterm2 = true;
    caps.truecolor = true;
  }

  // Check for WezTerm
  if (env["WEZTERM_PANE"] !== undefined) {
    caps.kitty = true;
    caps.sixel = true;
    caps.truecolor = true;
  }

  // Check for VSCode integrated terminal
  if (termProgram === "vscode" || env["VSCODE_INJECTION"] !== undefined) {
    caps.truecolor = true;
    caps.colors256 = true;
  }

  // Explicit Sixel check via SIXEL env var (some terminals set this)
  if (env["SIXEL"] === "1") {
    caps.sixel = true;
  }

  // Check for dumb terminal
  if (term === "dumb" || !process.stdout.isTTY) {
    caps.truecolor = false;
    caps.colors256 = false;
    caps.colors16 = false;
    caps.unicode = false;
  }

  return caps;
}

/**
 * Get the best pixel mode for the current terminal
 */
export function getBestPixelMode(caps: TerminalCapabilities): PixelMode {
  if (caps.kitty) return PixelMode.KITTY;
  if (caps.iterm2) return PixelMode.ITERM2;
  if (caps.sixel) return PixelMode.SIXELS;
  return PixelMode.SYMBOLS;
}

/**
 * Get the best canvas mode for the current terminal
 */
export function getBestCanvasMode(caps: TerminalCapabilities): CanvasMode {
  if (caps.truecolor) return CanvasMode.TRUECOLOR;
  if (caps.colors256) return CanvasMode.INDEXED_256;
  if (caps.colors16) return CanvasMode.INDEXED_16;
  return CanvasMode.FGBG;
}

/**
 * Terminal information singleton
 */
class TerminalInfo {
  private cachedCaps: TerminalCapabilities | null = null;

  /** Get terminal capabilities (cached) */
  get capabilities(): TerminalCapabilities {
    if (!this.cachedCaps) {
      this.cachedCaps = detectCapabilities();
    }
    return this.cachedCaps;
  }

  /** Refresh capabilities (clear cache) */
  refresh(): TerminalCapabilities {
    this.cachedCaps = null;
    return this.capabilities;
  }

  /** Get terminal size */
  get size(): { columns: number; rows: number } {
    return {
      columns: process.stdout.columns ?? 80,
      rows: process.stdout.rows ?? 24,
    };
  }

  /** Check if running in a TTY */
  get isTTY(): boolean {
    return process.stdout.isTTY ?? false;
  }

  /** Get recommended pixel mode */
  get bestPixelMode(): PixelMode {
    return getBestPixelMode(this.capabilities);
  }

  /** Get recommended canvas mode */
  get bestCanvasMode(): CanvasMode {
    return getBestCanvasMode(this.capabilities);
  }

  /** Check if terminal supports graphics protocols */
  get supportsGraphics(): boolean {
    const caps = this.capabilities;
    return caps.kitty || caps.iterm2 || caps.sixel;
  }

  /** Check if terminal supports truecolor */
  get supportsTruecolor(): boolean {
    return this.capabilities.truecolor;
  }

  /** Check if terminal supports Unicode */
  get supportsUnicode(): boolean {
    return this.capabilities.unicode;
  }
}

/** Global terminal info instance */
export const terminal = new TerminalInfo();
