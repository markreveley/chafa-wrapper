/**
 * Base types for visual primitives
 */

import { Color } from "../core/types.js";
import { BorderChars } from "../theme/tokens.js";

/** Position in character cells */
export interface Position {
  x: number;
  y: number;
}

/** Size in character cells */
export interface Size {
  width: number;
  height: number;
}

/** Bounding box */
export interface Bounds extends Position, Size {}

/** Padding/margin specification */
export interface Spacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Create uniform spacing */
export function uniformSpacing(value: number): Spacing {
  return { top: value, right: value, bottom: value, left: value };
}

/** Create spacing from shorthand (CSS-like) */
export function spacing(
  top: number,
  right?: number,
  bottom?: number,
  left?: number
): Spacing {
  if (right === undefined) {
    return uniformSpacing(top);
  }
  if (bottom === undefined) {
    return { top, right, bottom: top, left: right };
  }
  if (left === undefined) {
    return { top, right, bottom, left: right };
  }
  return { top, right, bottom, left };
}

/** Border style type */
export type BorderStyle =
  | "none"
  | "single"
  | "double"
  | "rounded"
  | "heavy"
  | "dashed"
  | "dotted"
  | BorderChars;

/** Text alignment */
export type TextAlign = "left" | "center" | "right";

/** Vertical alignment */
export type VerticalAlign = "top" | "middle" | "bottom";

/** Base props for all primitives */
export interface BaseProps {
  /** Unique identifier */
  id?: string;
  /** X position */
  x?: number;
  /** Y position */
  y?: number;
  /** Width (in cells) */
  width?: number;
  /** Height (in cells) */
  height?: number;
  /** Minimum width */
  minWidth?: number;
  /** Minimum height */
  minHeight?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Maximum height */
  maxHeight?: number;
  /** Whether element is visible */
  visible?: boolean;
}

/** Renderable element interface */
export interface Renderable {
  /** Render to string lines */
  render(): string[];
  /** Get computed bounds */
  getBounds(): Bounds;
}

/** Element with children */
export interface Container extends Renderable {
  /** Child elements */
  children: Renderable[];
  /** Add a child element */
  addChild(child: Renderable): void;
  /** Remove a child element */
  removeChild(child: Renderable): void;
}

/** Render context passed to primitives */
export interface RenderContext {
  /** Available width */
  width: number;
  /** Available height */
  height: number;
  /** Current theme colors */
  colors: {
    foreground: Color;
    background: Color;
    border: Color;
  };
}
