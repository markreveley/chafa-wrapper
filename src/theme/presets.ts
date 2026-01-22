/**
 * Built-in theme presets
 */

import {
  BORDER_CHARS,
  createTheme,
  DARK_COLORS,
  DEFAULT_RENDERING,
  DEFAULT_SPACING,
  HIGH_CONTRAST_COLORS,
  LIGHT_COLORS,
  Theme,
} from "./tokens.js";

/** Dark theme - default */
export const darkTheme: Theme = {
  name: "dark",
  colors: DARK_COLORS,
  borders: BORDER_CHARS,
  spacing: DEFAULT_SPACING,
  rendering: DEFAULT_RENDERING,
};

/** Light theme */
export const lightTheme: Theme = {
  name: "light",
  colors: LIGHT_COLORS,
  borders: BORDER_CHARS,
  spacing: DEFAULT_SPACING,
  rendering: DEFAULT_RENDERING,
};

/** High contrast theme for accessibility */
export const highContrastTheme: Theme = {
  name: "high-contrast",
  colors: HIGH_CONTRAST_COLORS,
  borders: BORDER_CHARS,
  spacing: DEFAULT_SPACING,
  rendering: DEFAULT_RENDERING,
};

/** Minimal theme with reduced visual noise */
export const minimalTheme: Theme = createTheme("minimal", {
  colors: {
    primary: "#808080",
    secondary: "#606060",
    border: "#404040",
  },
});

/** Cyberpunk/neon theme */
export const neonTheme: Theme = createTheme("neon", {
  colors: {
    primary: "#FF00FF",
    secondary: "#00FFFF",
    success: "#00FF00",
    warning: "#FFFF00",
    error: "#FF0000",
    info: "#00FFFF",
    background: "#0D0D0D",
    foreground: "#FFFFFF",
    muted: "#808080",
    border: "#FF00FF",
  },
});

/** Retro/amber terminal theme */
export const amberTheme: Theme = createTheme("amber", {
  colors: {
    primary: "#FFB000",
    secondary: "#CC8800",
    success: "#FFB000",
    warning: "#FFB000",
    error: "#FF6600",
    info: "#FFB000",
    background: "#1A1000",
    foreground: "#FFB000",
    muted: "#996600",
    border: "#FFB000",
  },
});

/** Green phosphor terminal theme */
export const greenTheme: Theme = createTheme("green", {
  colors: {
    primary: "#00FF00",
    secondary: "#00CC00",
    success: "#00FF00",
    warning: "#CCFF00",
    error: "#FF6600",
    info: "#00FFCC",
    background: "#001A00",
    foreground: "#00FF00",
    muted: "#009900",
    border: "#00FF00",
  },
});

/** All built-in themes */
export const themes = {
  dark: darkTheme,
  light: lightTheme,
  highContrast: highContrastTheme,
  minimal: minimalTheme,
  neon: neonTheme,
  amber: amberTheme,
  green: greenTheme,
} as const;

/** Get a theme by name */
export function getTheme(name: keyof typeof themes): Theme {
  return themes[name];
}
