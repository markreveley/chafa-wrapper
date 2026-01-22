/**
 * Design tokens for consistent theming
 * Defines colors, borders, spacing, and rendering presets
 */

import { Color } from "../core/types.js";

/** Color palette definition */
export interface ColorPalette {
  primary: Color;
  secondary: Color;
  success: Color;
  warning: Color;
  error: Color;
  info: Color;
  background: Color;
  foreground: Color;
  muted: Color;
  border: Color;
}

/** Border character set */
export interface BorderChars {
  top: string;
  bottom: string;
  left: string;
  right: string;
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

/** Border style presets */
export interface BorderStyles {
  none: null;
  single: BorderChars;
  double: BorderChars;
  rounded: BorderChars;
  heavy: BorderChars;
  dashed: BorderChars;
  dotted: BorderChars;
}

/** Spacing scale */
export interface SpacingScale {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

/** Rendering quality preset */
export interface RenderingPreset {
  workFactor: number;
  symbolTags: string[];
}

/** Complete theme definition */
export interface Theme {
  name: string;
  colors: ColorPalette;
  borders: BorderStyles;
  spacing: SpacingScale;
  rendering: {
    fast: RenderingPreset;
    balanced: RenderingPreset;
    quality: RenderingPreset;
  };
}

/** Default border character sets */
export const BORDER_CHARS: BorderStyles = {
  none: null,
  single: {
    top: "─",
    bottom: "─",
    left: "│",
    right: "│",
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
  },
  double: {
    top: "═",
    bottom: "═",
    left: "║",
    right: "║",
    topLeft: "╔",
    topRight: "╗",
    bottomLeft: "╚",
    bottomRight: "╝",
  },
  rounded: {
    top: "─",
    bottom: "─",
    left: "│",
    right: "│",
    topLeft: "╭",
    topRight: "╮",
    bottomLeft: "╰",
    bottomRight: "╯",
  },
  heavy: {
    top: "━",
    bottom: "━",
    left: "┃",
    right: "┃",
    topLeft: "┏",
    topRight: "┓",
    bottomLeft: "┗",
    bottomRight: "┛",
  },
  dashed: {
    top: "┄",
    bottom: "┄",
    left: "┆",
    right: "┆",
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
  },
  dotted: {
    top: "┈",
    bottom: "┈",
    left: "┊",
    right: "┊",
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
  },
};

/** Default spacing scale (in character cells) */
export const DEFAULT_SPACING: SpacingScale = {
  none: 0,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  xxl: 16,
};

/** Default rendering presets */
export const DEFAULT_RENDERING = {
  fast: {
    workFactor: 1,
    symbolTags: ["half", "space"],
  },
  balanced: {
    workFactor: 5,
    symbolTags: ["block", "border", "space"],
  },
  quality: {
    workFactor: 9,
    symbolTags: ["all"],
  },
};

/** Dark theme colors */
export const DARK_COLORS: ColorPalette = {
  primary: "#3B82F6",
  secondary: "#6B7280",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#06B6D4",
  background: "#1F2937",
  foreground: "#F9FAFB",
  muted: "#9CA3AF",
  border: "#374151",
};

/** Light theme colors */
export const LIGHT_COLORS: ColorPalette = {
  primary: "#2563EB",
  secondary: "#4B5563",
  success: "#059669",
  warning: "#D97706",
  error: "#DC2626",
  info: "#0891B2",
  background: "#FFFFFF",
  foreground: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
};

/** High contrast theme colors */
export const HIGH_CONTRAST_COLORS: ColorPalette = {
  primary: "#FFFFFF",
  secondary: "#FFFFFF",
  success: "#00FF00",
  warning: "#FFFF00",
  error: "#FF0000",
  info: "#00FFFF",
  background: "#000000",
  foreground: "#FFFFFF",
  muted: "#AAAAAA",
  border: "#FFFFFF",
};

/** Create a theme from partial options */
export function createTheme(
  name: string,
  options: {
    colors?: Partial<ColorPalette>;
    borders?: Partial<BorderStyles>;
    spacing?: Partial<SpacingScale>;
  } = {}
): Theme {
  return {
    name,
    colors: { ...DARK_COLORS, ...options.colors },
    borders: { ...BORDER_CHARS, ...options.borders },
    spacing: { ...DEFAULT_SPACING, ...options.spacing },
    rendering: DEFAULT_RENDERING,
  };
}

/** Merge two themes */
export function mergeThemes(base: Theme, overrides: Partial<Theme>): Theme {
  return {
    name: overrides.name ?? base.name,
    colors: { ...base.colors, ...overrides.colors },
    borders: { ...base.borders, ...overrides.borders },
    spacing: { ...base.spacing, ...overrides.spacing },
    rendering: overrides.rendering ?? base.rendering,
  };
}
