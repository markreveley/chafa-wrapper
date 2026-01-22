/**
 * Theme context for managing current theme
 * Provides global theme access and switching
 */

import { Theme } from "./tokens.js";
import { darkTheme, themes } from "./presets.js";

/** Theme change listener */
type ThemeListener = (theme: Theme) => void;

/**
 * Theme context - manages current theme state
 */
class ThemeContext {
  private currentTheme: Theme;
  private listeners: Set<ThemeListener>;

  constructor() {
    this.currentTheme = darkTheme;
    this.listeners = new Set();
  }

  /** Get current theme */
  get theme(): Theme {
    return this.currentTheme;
  }

  /** Set current theme */
  set theme(theme: Theme) {
    this.currentTheme = theme;
    this.notifyListeners();
  }

  /** Set theme by name */
  setTheme(name: keyof typeof themes): void {
    this.theme = themes[name];
  }

  /** Subscribe to theme changes */
  subscribe(listener: ThemeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Notify all listeners */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentTheme);
    }
  }

  /** Get color from current theme */
  color<K extends keyof Theme["colors"]>(key: K): Theme["colors"][K] {
    return this.currentTheme.colors[key];
  }

  /** Get border style from current theme */
  border<K extends keyof Theme["borders"]>(key: K): Theme["borders"][K] {
    return this.currentTheme.borders[key];
  }

  /** Get spacing value from current theme */
  spacing<K extends keyof Theme["spacing"]>(key: K): Theme["spacing"][K] {
    return this.currentTheme.spacing[key];
  }
}

/** Global theme context instance */
export const themeContext = new ThemeContext();

/** Convenience function to get current theme */
export function useTheme(): Theme {
  return themeContext.theme;
}

/** Convenience function to set theme */
export function setTheme(theme: Theme | keyof typeof themes): void {
  if (typeof theme === "string") {
    themeContext.setTheme(theme);
  } else {
    themeContext.theme = theme;
  }
}
