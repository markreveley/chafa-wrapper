/**
 * chafa-wrapper - High-level terminal UI framework built on Chafa
 *
 * @packageDocumentation
 */

// Core exports
export {
  // Types
  PixelMode,
  CanvasMode,
  ColorSpace,
  DitherMode,
  ColorExtractor,
  SymbolTag,
  Optimization,
  Passthrough,
  type CellGeometry,
  type PixelGeometry,
  type RgbColor,
  type RgbaColor,
  type Color,
  type CanvasConfigOptions,
  type RenderOutput,
} from "./core/types.js";

export {
  CanvasConfig,
  presets as configPresets,
} from "./core/config.js";

export {
  SymbolMap,
  symbolPresets,
  type SymbolRange,
} from "./core/symbols.js";

export {
  Canvas,
  render,
  type ImageInput,
  type RenderOptions,
} from "./core/canvas.js";

export {
  terminal,
  detectCapabilities,
  getBestPixelMode,
  getBestCanvasMode,
  type TerminalCapabilities,
} from "./core/terminal.js";

// Theme exports
export {
  type Theme,
  type ColorPalette,
  type BorderChars,
  type BorderStyles,
  type SpacingScale,
  type RenderingPreset,
  BORDER_CHARS,
  DEFAULT_SPACING,
  DARK_COLORS,
  LIGHT_COLORS,
  HIGH_CONTRAST_COLORS,
  createTheme,
  mergeThemes,
} from "./theme/tokens.js";

export {
  themes,
  darkTheme,
  lightTheme,
  highContrastTheme,
  minimalTheme,
  neonTheme,
  amberTheme,
  greenTheme,
  getTheme,
} from "./theme/presets.js";

export {
  themeContext,
  useTheme,
  setTheme,
} from "./theme/context.js";

// Primitive exports
export {
  type Position,
  type Size,
  type Bounds,
  type Spacing,
  type BaseProps,
  type Renderable,
  type Container,
  type RenderContext,
  type BorderStyle,
  type TextAlign,
  type VerticalAlign,
  uniformSpacing,
  spacing,
} from "./primitives/types.js";

export {
  Box,
  box,
  type BoxProps,
} from "./primitives/Box.js";

export {
  Text,
  text,
  type TextProps,
  type WrapMode,
} from "./primitives/Text.js";

export {
  Divider,
  hr,
  vr,
  DIVIDER_CHARS,
  type DividerProps,
  type DividerDirection,
  type DividerStyle,
} from "./primitives/Divider.js";

export {
  Image,
  image,
  img,
  type ImageProps,
  type ScaleMode,
} from "./primitives/Image.js";

// Layout exports
export {
  Stack,
  vstack,
  hstack,
  type StackProps,
  type StackDirection,
} from "./layout/Stack.js";

export {
  Flex,
  flexRow,
  flexColumn,
  type FlexProps,
  type FlexDirection,
  type JustifyContent,
  type AlignItems,
} from "./layout/Flex.js";

export {
  Grid,
  grid,
  type GridProps,
  type GridPlacement,
  type GridChild,
  type TrackSize,
} from "./layout/Grid.js";
