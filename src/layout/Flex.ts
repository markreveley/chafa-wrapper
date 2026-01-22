/**
 * Flex layout - flexbox-inspired layout for terminal
 */

import {
  BaseProps,
  Bounds,
  Container,
  Renderable,
} from "../primitives/types.js";

/** Flex direction */
export type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";

/** Justify content options */
export type JustifyContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";

/** Align items options */
export type AlignItems = "flex-start" | "flex-end" | "center" | "stretch";

/** Flex props */
export interface FlexProps extends BaseProps {
  /** Flex direction */
  direction?: FlexDirection;
  /** Justify content along main axis */
  justify?: JustifyContent;
  /** Align items along cross axis */
  align?: AlignItems;
  /** Gap between items */
  gap?: number;
  /** Wrap items to next line */
  wrap?: boolean;
  /** Children elements */
  children?: Renderable[];
}

/**
 * Flex layout component
 * Provides flexbox-like layout for terminal UIs
 */
export class Flex implements Container {
  private props: FlexProps & {
    direction: FlexDirection;
    justify: JustifyContent;
    align: AlignItems;
    gap: number;
  };
  children: Renderable[];

  constructor(props: FlexProps = {}) {
    this.props = {
      direction: "row",
      justify: "flex-start",
      align: "flex-start",
      gap: 0,
      ...props,
    };
    this.children = props.children ?? [];
  }

  /** Create a new Flex container */
  static create(props?: FlexProps): Flex {
    return new Flex(props);
  }

  /** Create a row flex container */
  static row(children: Renderable[], props?: Omit<FlexProps, "direction" | "children">): Flex {
    return new Flex({ ...props, direction: "row", children });
  }

  /** Create a column flex container */
  static column(children: Renderable[], props?: Omit<FlexProps, "direction" | "children">): Flex {
    return new Flex({ ...props, direction: "column", children });
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

  /** Check if direction is horizontal */
  private isHorizontal(): boolean {
    return this.props.direction === "row" || this.props.direction === "row-reverse";
  }

  /** Check if direction is reversed */
  private isReversed(): boolean {
    return this.props.direction === "row-reverse" || this.props.direction === "column-reverse";
  }

  /** Get computed bounds */
  getBounds(): Bounds {
    if (this.children.length === 0) {
      return {
        x: this.props.x ?? 0,
        y: this.props.y ?? 0,
        width: this.props.width ?? 0,
        height: this.props.height ?? 0,
      };
    }

    const { gap } = this.props;
    const childBounds = this.children.map((c) => c.getBounds());
    const horizontal = this.isHorizontal();

    let width: number;
    let height: number;

    if (horizontal) {
      width =
        childBounds.reduce((sum, b) => sum + b.width, 0) +
        gap * (this.children.length - 1);
      height = Math.max(...childBounds.map((b) => b.height));
    } else {
      width = Math.max(...childBounds.map((b) => b.width));
      height =
        childBounds.reduce((sum, b) => sum + b.height, 0) +
        gap * (this.children.length - 1);
    }

    return {
      x: this.props.x ?? 0,
      y: this.props.y ?? 0,
      width: this.props.width ?? width,
      height: this.props.height ?? height,
    };
  }

  /** Render the flex container */
  render(): string[] {
    if (this.children.length === 0) {
      return [];
    }

    const bounds = this.getBounds();
    const { direction, justify, align, gap } = this.props;

    // Get ordered children (handle reverse)
    const orderedChildren = this.isReversed()
      ? [...this.children].reverse()
      : this.children;

    const renderedChildren = orderedChildren.map((child) => ({
      lines: child.render(),
      bounds: child.getBounds(),
    }));

    if (this.isHorizontal()) {
      return this.renderRow(renderedChildren, bounds, justify, align, gap);
    } else {
      return this.renderColumn(renderedChildren, bounds, justify, align, gap);
    }
  }

  /** Render as row */
  private renderRow(
    children: { lines: string[]; bounds: Bounds }[],
    containerBounds: Bounds,
    justify: JustifyContent,
    align: AlignItems,
    gap: number
  ): string[] {
    const totalWidth = containerBounds.width;
    const totalHeight = containerBounds.height;

    // Calculate content width
    const contentWidth = children.reduce((sum, c) => sum + c.bounds.width, 0);
    const totalGapWidth = gap * (children.length - 1);

    // Calculate spacing based on justify
    const spacing = this.calculateSpacing(
      justify,
      totalWidth,
      contentWidth + totalGapWidth,
      children.length
    );

    // Build each row
    const lines: string[] = [];
    for (let row = 0; row < totalHeight; row++) {
      let line = " ".repeat(spacing.start);

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child) continue;

        // Get aligned line for this child
        const childLine = this.getAlignedLine(
          child.lines,
          row,
          child.bounds.width,
          totalHeight,
          align
        );

        line += childLine;

        // Add gap or spacing
        if (i < children.length - 1) {
          line += " ".repeat(gap + spacing.between);
        }
      }

      line += " ".repeat(spacing.end);

      // Ensure line fits container width
      if (line.length < totalWidth) {
        line += " ".repeat(totalWidth - line.length);
      } else if (line.length > totalWidth) {
        line = line.slice(0, totalWidth);
      }

      lines.push(line);
    }

    return lines;
  }

  /** Render as column */
  private renderColumn(
    children: { lines: string[]; bounds: Bounds }[],
    containerBounds: Bounds,
    justify: JustifyContent,
    align: AlignItems,
    gap: number
  ): string[] {
    const totalWidth = containerBounds.width;
    const totalHeight = containerBounds.height;

    // Calculate content height
    const contentHeight = children.reduce((sum, c) => sum + c.bounds.height, 0);
    const totalGapHeight = gap * (children.length - 1);

    // Calculate spacing based on justify
    const spacing = this.calculateSpacing(
      justify,
      totalHeight,
      contentHeight + totalGapHeight,
      children.length
    );

    const lines: string[] = [];

    // Add start spacing
    for (let i = 0; i < spacing.start; i++) {
      lines.push(" ".repeat(totalWidth));
    }

    // Add children with gaps
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child) continue;

      // Align each line of the child
      for (const childLine of child.lines) {
        lines.push(this.alignLineHorizontally(childLine, totalWidth, child.bounds.width, align));
      }

      // Add gap
      if (i < children.length - 1) {
        for (let g = 0; g < gap + spacing.between; g++) {
          lines.push(" ".repeat(totalWidth));
        }
      }
    }

    // Add end spacing
    for (let i = 0; i < spacing.end; i++) {
      lines.push(" ".repeat(totalWidth));
    }

    return lines;
  }

  /** Calculate spacing for justify content */
  private calculateSpacing(
    justify: JustifyContent,
    total: number,
    content: number,
    itemCount: number
  ): { start: number; between: number; end: number } {
    const remaining = Math.max(0, total - content);

    switch (justify) {
      case "flex-end":
        return { start: remaining, between: 0, end: 0 };
      case "center":
        return { start: Math.floor(remaining / 2), between: 0, end: Math.ceil(remaining / 2) };
      case "space-between":
        if (itemCount <= 1) return { start: 0, between: 0, end: remaining };
        return { start: 0, between: Math.floor(remaining / (itemCount - 1)), end: 0 };
      case "space-around": {
        const space = remaining / itemCount;
        return { start: Math.floor(space / 2), between: Math.floor(space), end: Math.ceil(space / 2) };
      }
      case "space-evenly": {
        const space = Math.floor(remaining / (itemCount + 1));
        return { start: space, between: space, end: space };
      }
      case "flex-start":
      default:
        return { start: 0, between: 0, end: remaining };
    }
  }

  /** Get aligned line for row layout */
  private getAlignedLine(
    lines: string[],
    row: number,
    width: number,
    totalHeight: number,
    align: AlignItems
  ): string {
    let lineIndex: number;

    switch (align) {
      case "flex-end":
        lineIndex = row - (totalHeight - lines.length);
        break;
      case "center":
        lineIndex = row - Math.floor((totalHeight - lines.length) / 2);
        break;
      case "stretch":
      case "flex-start":
      default:
        lineIndex = row;
    }

    if (lineIndex >= 0 && lineIndex < lines.length) {
      return (lines[lineIndex] ?? "").padEnd(width);
    }
    return " ".repeat(width);
  }

  /** Align line horizontally for column layout */
  private alignLineHorizontally(
    line: string,
    totalWidth: number,
    contentWidth: number,
    align: AlignItems
  ): string {
    const padding = Math.max(0, totalWidth - line.length);

    switch (align) {
      case "flex-end":
        return " ".repeat(padding) + line;
      case "center": {
        const left = Math.floor(padding / 2);
        return " ".repeat(left) + line + " ".repeat(padding - left);
      }
      case "stretch":
        return line.padEnd(totalWidth);
      case "flex-start":
      default:
        return line + " ".repeat(padding);
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

/** Convenience function to create a flex row */
export function flexRow(
  children: Renderable[],
  props?: Omit<FlexProps, "direction" | "children">
): Flex {
  return Flex.row(children, props);
}

/** Convenience function to create a flex column */
export function flexColumn(
  children: Renderable[],
  props?: Omit<FlexProps, "direction" | "children">
): Flex {
  return Flex.column(children, props);
}
