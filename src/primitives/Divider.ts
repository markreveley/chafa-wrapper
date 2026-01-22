/**
 * Divider primitive - horizontal or vertical separator
 */

import { BaseProps, Bounds, Renderable } from "./types.js";

/** Divider direction */
export type DividerDirection = "horizontal" | "vertical";

/** Divider character presets */
export const DIVIDER_CHARS = {
  single: { h: "─", v: "│" },
  double: { h: "═", v: "║" },
  heavy: { h: "━", v: "┃" },
  dashed: { h: "┄", v: "┆" },
  dotted: { h: "┈", v: "┊" },
  space: { h: " ", v: " " },
} as const;

/** Divider style */
export type DividerStyle = keyof typeof DIVIDER_CHARS | { h: string; v: string };

/** Divider props */
export interface DividerProps extends BaseProps {
  /** Direction */
  direction?: DividerDirection;
  /** Line style */
  style?: DividerStyle;
  /** Length (width for horizontal, height for vertical) */
  length?: number;
}

/**
 * Divider component - a separator line
 */
export class Divider implements Renderable {
  private props: DividerProps & {
    direction: DividerDirection;
    style: DividerStyle;
    length: number;
  };

  constructor(props: DividerProps = {}) {
    this.props = {
      direction: "horizontal",
      style: "single",
      length: props.length ?? (props.direction === "vertical" ? 3 : 20),
      ...props,
    };
  }

  /** Create a new Divider */
  static create(props?: DividerProps): Divider {
    return new Divider(props);
  }

  /** Create a horizontal divider */
  static horizontal(length: number, style?: DividerStyle): Divider {
    const props: DividerProps = { direction: "horizontal", length };
    if (style !== undefined) props.style = style;
    return new Divider(props);
  }

  /** Create a vertical divider */
  static vertical(length: number, style?: DividerStyle): Divider {
    const props: DividerProps = { direction: "vertical", length };
    if (style !== undefined) props.style = style;
    return new Divider(props);
  }

  /** Get the divider character */
  private getChar(): string {
    const { direction, style } = this.props;
    const chars =
      typeof style === "string"
        ? DIVIDER_CHARS[style as keyof typeof DIVIDER_CHARS]
        : style;
    return direction === "horizontal" ? chars.h : chars.v;
  }

  /** Get computed bounds */
  getBounds(): Bounds {
    const { direction, length } = this.props;

    return {
      x: this.props.x ?? 0,
      y: this.props.y ?? 0,
      width: direction === "horizontal" ? length : 1,
      height: direction === "vertical" ? length : 1,
    };
  }

  /** Render the divider */
  render(): string[] {
    const { direction, length } = this.props;
    const char = this.getChar();

    if (direction === "horizontal") {
      return [char.repeat(length)];
    } else {
      return Array.from({ length }, () => char);
    }
  }

  /** Convert to string */
  toString(): string {
    return this.render().join("\n");
  }

  /** Print to stdout */
  print(): void {
    console.log(this.toString());
  }
}

/** Convenience function for horizontal divider */
export function hr(length: number, style?: DividerStyle): Divider {
  return Divider.horizontal(length, style);
}

/** Convenience function for vertical divider */
export function vr(length: number, style?: DividerStyle): Divider {
  return Divider.vertical(length, style);
}
