/**
 * Box primitive - bordered container component
 */

import { Color } from "../core/types.js";
import { BORDER_CHARS, BorderChars } from "../theme/tokens.js";
import { useTheme } from "../theme/context.js";
import {
  BaseProps,
  BorderStyle,
  Bounds,
  Renderable,
  Spacing,
  uniformSpacing,
} from "./types.js";

/** Box props */
export interface BoxProps extends BaseProps {
  /** Border style */
  border?: BorderStyle;
  /** Border color (ANSI escape code or theme key) */
  borderColor?: Color;
  /** Background character */
  background?: string;
  /** Content padding */
  padding?: Spacing | number;
  /** Box title (displayed in top border) */
  title?: string;
  /** Title alignment */
  titleAlign?: "left" | "center" | "right";
  /** Child content (string or Renderable) */
  content?: string | Renderable | string[];
}

/** Resolve border style to characters */
function resolveBorder(style: BorderStyle): BorderChars | null {
  if (style === "none") return null;
  if (typeof style === "object") return style;
  return BORDER_CHARS[style] ?? BORDER_CHARS.single;
}

/** Resolve padding to Spacing object */
function resolvePadding(padding: Spacing | number | undefined): Spacing {
  if (padding === undefined) return uniformSpacing(0);
  if (typeof padding === "number") return uniformSpacing(padding);
  return padding;
}

/**
 * Box component - a bordered container
 */
export class Box implements Renderable {
  private props: Required<
    Pick<BoxProps, "width" | "height" | "border" | "padding" | "visible">
  > &
    BoxProps;

  constructor(props: BoxProps = {}) {
    this.props = {
      border: "single",
      padding: 0,
      visible: true,
      width: props.width ?? 20,
      height: props.height ?? 5,
      ...props,
    };
  }

  /** Create a new Box */
  static create(props?: BoxProps): Box {
    return new Box(props);
  }

  /** Get computed bounds */
  getBounds(): Bounds {
    const padding = resolvePadding(this.props.padding);
    const border = resolveBorder(this.props.border);
    const borderSize = border ? 1 : 0;

    return {
      x: this.props.x ?? 0,
      y: this.props.y ?? 0,
      width: this.props.width,
      height: this.props.height,
    };
  }

  /** Get inner content area dimensions */
  getInnerBounds(): Bounds {
    const padding = resolvePadding(this.props.padding);
    const border = resolveBorder(this.props.border);
    const borderSize = border ? 1 : 0;

    const bounds = this.getBounds();
    return {
      x: bounds.x + borderSize + padding.left,
      y: bounds.y + borderSize + padding.top,
      width: Math.max(
        0,
        bounds.width - 2 * borderSize - padding.left - padding.right
      ),
      height: Math.max(
        0,
        bounds.height - 2 * borderSize - padding.top - padding.bottom
      ),
    };
  }

  /** Render the box to string lines */
  render(): string[] {
    if (!this.props.visible) return [];

    const { width, height, border, background, title, titleAlign, content } =
      this.props;
    const padding = resolvePadding(this.props.padding);
    const borderChars = resolveBorder(border);

    const lines: string[] = [];
    const bgChar = background ?? " ";

    if (borderChars) {
      // Top border with optional title
      let topLine =
        borderChars.topLeft +
        borderChars.top.repeat(Math.max(0, width - 2)) +
        borderChars.topRight;

      if (title && width > 4) {
        const maxTitleLen = width - 4;
        const truncatedTitle =
          title.length > maxTitleLen
            ? title.slice(0, maxTitleLen - 1) + "…"
            : title;
        const titleStr = ` ${truncatedTitle} `;

        let insertPos: number;
        switch (titleAlign) {
          case "center":
            insertPos = Math.floor((width - titleStr.length) / 2);
            break;
          case "right":
            insertPos = width - titleStr.length - 1;
            break;
          default:
            insertPos = 1;
        }

        topLine =
          topLine.slice(0, insertPos) +
          titleStr +
          topLine.slice(insertPos + titleStr.length);
      }
      lines.push(topLine);

      // Content rows
      const contentHeight = height - 2;
      const contentWidth = width - 2;
      const contentLines = this.renderContent(contentWidth, contentHeight);

      for (let i = 0; i < contentHeight; i++) {
        const contentLine = contentLines[i] ?? "";
        const paddedContent = contentLine.padEnd(contentWidth, bgChar);
        lines.push(borderChars.left + paddedContent + borderChars.right);
      }

      // Bottom border
      lines.push(
        borderChars.bottomLeft +
          borderChars.bottom.repeat(Math.max(0, width - 2)) +
          borderChars.bottomRight
      );
    } else {
      // No border
      const contentLines = this.renderContent(width, height);
      for (let i = 0; i < height; i++) {
        const contentLine = contentLines[i] ?? "";
        lines.push(contentLine.padEnd(width, bgChar));
      }
    }

    return lines;
  }

  /** Render content to lines */
  private renderContent(width: number, height: number): string[] {
    const { content, padding: rawPadding } = this.props;
    const padding = resolvePadding(rawPadding);

    const innerWidth = Math.max(0, width - padding.left - padding.right);
    const innerHeight = Math.max(0, height - padding.top - padding.bottom);

    let contentLines: string[] = [];

    if (content === undefined) {
      contentLines = [];
    } else if (typeof content === "string") {
      // Split string into lines and wrap
      contentLines = this.wrapText(content, innerWidth);
    } else if (Array.isArray(content)) {
      contentLines = content.flatMap((line) => this.wrapText(line, innerWidth));
    } else {
      // Renderable
      contentLines = content.render();
    }

    // Apply padding
    const result: string[] = [];

    // Top padding
    for (let i = 0; i < padding.top; i++) {
      result.push(" ".repeat(width));
    }

    // Content with left/right padding
    for (let i = 0; i < innerHeight; i++) {
      const line = contentLines[i] ?? "";
      const paddedLine =
        " ".repeat(padding.left) +
        line.slice(0, innerWidth).padEnd(innerWidth) +
        " ".repeat(padding.right);
      result.push(paddedLine);
    }

    // Bottom padding
    for (let i = 0; i < padding.bottom; i++) {
      result.push(" ".repeat(width));
    }

    return result;
  }

  /** Wrap text to fit width */
  private wrapText(text: string, width: number): string[] {
    if (width <= 0) return [];

    const lines: string[] = [];
    const words = text.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      if (currentLine.length === 0) {
        currentLine = word;
      } else if (currentLine.length + 1 + word.length <= width) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
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

/** Convenience function to create a Box */
export function box(props?: BoxProps): Box {
  return Box.create(props);
}
