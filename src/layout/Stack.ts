/**
 * Stack layout - vertical or horizontal stacking of elements
 */

import {
  BaseProps,
  Bounds,
  Container,
  Renderable,
  TextAlign,
  VerticalAlign,
} from "../primitives/types.js";

/** Stack direction */
export type StackDirection = "vertical" | "horizontal";

/** Stack props */
export interface StackProps extends BaseProps {
  /** Stack direction */
  direction?: StackDirection;
  /** Gap between items (in cells) */
  gap?: number;
  /** Horizontal alignment for vertical stacks */
  align?: TextAlign;
  /** Vertical alignment for horizontal stacks */
  verticalAlign?: VerticalAlign;
  /** Children elements */
  children?: Renderable[];
}

/**
 * Stack layout component
 * Arranges children vertically or horizontally
 */
export class Stack implements Container {
  private props: StackProps & { direction: StackDirection; gap: number };
  children: Renderable[];

  constructor(props: StackProps = {}) {
    this.props = {
      direction: "vertical",
      gap: 0,
      ...props,
    };
    this.children = props.children ?? [];
  }

  /** Create a new Stack */
  static create(props?: StackProps): Stack {
    return new Stack(props);
  }

  /** Create a vertical stack */
  static vertical(children: Renderable[], gap = 0): Stack {
    return new Stack({ direction: "vertical", gap, children });
  }

  /** Create a horizontal stack */
  static horizontal(children: Renderable[], gap = 0): Stack {
    return new Stack({ direction: "horizontal", gap, children });
  }

  /** Add a child element */
  addChild(child: Renderable): void {
    this.children.push(child);
  }

  /** Remove a child element */
  removeChild(child: Renderable): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  /** Get computed bounds */
  getBounds(): Bounds {
    const { direction, gap } = this.props;

    if (this.children.length === 0) {
      return {
        x: this.props.x ?? 0,
        y: this.props.y ?? 0,
        width: this.props.width ?? 0,
        height: this.props.height ?? 0,
      };
    }

    const childBounds = this.children.map((c) => c.getBounds());

    let width: number;
    let height: number;

    if (direction === "vertical") {
      width = Math.max(...childBounds.map((b) => b.width));
      height =
        childBounds.reduce((sum, b) => sum + b.height, 0) +
        gap * (this.children.length - 1);
    } else {
      width =
        childBounds.reduce((sum, b) => sum + b.width, 0) +
        gap * (this.children.length - 1);
      height = Math.max(...childBounds.map((b) => b.height));
    }

    return {
      x: this.props.x ?? 0,
      y: this.props.y ?? 0,
      width: this.props.width ?? width,
      height: this.props.height ?? height,
    };
  }

  /** Render the stack */
  render(): string[] {
    const { direction, gap, align, verticalAlign } = this.props;

    if (this.children.length === 0) {
      return [];
    }

    const bounds = this.getBounds();
    const renderedChildren = this.children.map((child) => ({
      lines: child.render(),
      bounds: child.getBounds(),
    }));

    if (direction === "vertical") {
      return this.renderVertical(renderedChildren, bounds, gap, align);
    } else {
      return this.renderHorizontal(renderedChildren, bounds, gap, verticalAlign);
    }
  }

  /** Render vertical stack */
  private renderVertical(
    children: { lines: string[]; bounds: Bounds }[],
    bounds: Bounds,
    gap: number,
    align?: TextAlign
  ): string[] {
    const lines: string[] = [];
    const totalWidth = bounds.width;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child) continue;

      // Add gap between items
      if (i > 0 && gap > 0) {
        for (let g = 0; g < gap; g++) {
          lines.push(" ".repeat(totalWidth));
        }
      }

      // Add child lines with alignment
      for (const line of child.lines) {
        lines.push(this.alignLine(line, totalWidth, align));
      }
    }

    return lines;
  }

  /** Render horizontal stack */
  private renderHorizontal(
    children: { lines: string[]; bounds: Bounds }[],
    bounds: Bounds,
    gap: number,
    verticalAlign?: VerticalAlign
  ): string[] {
    const totalHeight = bounds.height;
    const gapStr = " ".repeat(gap);

    // Normalize all children to same height
    const normalizedChildren = children.map((child) => ({
      lines: this.verticalAlignLines(child.lines, totalHeight, child.bounds.width, verticalAlign),
      width: child.bounds.width,
    }));

    // Combine lines horizontally
    const lines: string[] = [];
    for (let row = 0; row < totalHeight; row++) {
      const parts: string[] = [];
      for (let i = 0; i < normalizedChildren.length; i++) {
        const child = normalizedChildren[i];
        if (!child) continue;

        if (i > 0 && gap > 0) {
          parts.push(gapStr);
        }
        const line = child.lines[row] ?? " ".repeat(child.width);
        parts.push(line.padEnd(child.width));
      }
      lines.push(parts.join(""));
    }

    return lines;
  }

  /** Align a line horizontally */
  private alignLine(line: string, width: number, align?: TextAlign): string {
    const padding = Math.max(0, width - line.length);

    switch (align) {
      case "center": {
        const left = Math.floor(padding / 2);
        const right = padding - left;
        return " ".repeat(left) + line + " ".repeat(right);
      }
      case "right":
        return " ".repeat(padding) + line;
      case "left":
      default:
        return line + " ".repeat(padding);
    }
  }

  /** Align lines vertically */
  private verticalAlignLines(
    lines: string[],
    height: number,
    width: number,
    align?: VerticalAlign
  ): string[] {
    if (lines.length >= height) {
      return lines.slice(0, height);
    }

    const emptyLine = " ".repeat(width);
    const padding = height - lines.length;

    switch (align) {
      case "middle": {
        const top = Math.floor(padding / 2);
        const bottom = padding - top;
        return [
          ...Array<string>(top).fill(emptyLine),
          ...lines,
          ...Array<string>(bottom).fill(emptyLine),
        ];
      }
      case "bottom":
        return [...Array<string>(padding).fill(emptyLine), ...lines];
      case "top":
      default:
        return [...lines, ...Array<string>(padding).fill(emptyLine)];
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

/** Convenience function for vertical stack */
export function vstack(children: Renderable[], gap = 0): Stack {
  return Stack.vertical(children, gap);
}

/** Convenience function for horizontal stack */
export function hstack(children: Renderable[], gap = 0): Stack {
  return Stack.horizontal(children, gap);
}
