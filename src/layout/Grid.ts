/**
 * Grid layout - CSS Grid-inspired layout for terminal
 */

import {
  BaseProps,
  Bounds,
  Container,
  Renderable,
} from "../primitives/types.js";

/** Grid track size */
export type TrackSize = number | "auto" | `${number}fr`;

/** Grid item placement */
export interface GridPlacement {
  /** Column start (1-indexed) */
  column?: number;
  /** Column span */
  columnSpan?: number;
  /** Row start (1-indexed) */
  row?: number;
  /** Row span */
  rowSpan?: number;
  /** Named grid area */
  area?: string;
}

/** Grid child wrapper */
export interface GridChild {
  element: Renderable;
  placement: GridPlacement;
}

/** Grid props */
export interface GridProps extends BaseProps {
  /** Column track sizes */
  columns?: TrackSize[] | string;
  /** Row track sizes */
  rows?: TrackSize[] | string;
  /** Gap between cells */
  gap?: number | { row: number; column: number };
  /** Named grid areas template */
  areas?: string[];
  /** Children with placement */
  children?: GridChild[];
}

/** Parse track definition string */
function parseTracks(tracks: TrackSize[] | string | undefined): TrackSize[] {
  if (!tracks) return ["auto"];
  if (Array.isArray(tracks)) return tracks;

  // Parse string like "1fr 2fr auto 100"
  return tracks.split(/\s+/).map((t): TrackSize => {
    if (t === "auto") return "auto";
    if (t.endsWith("fr")) return t as `${number}fr`;
    const num = parseInt(t, 10);
    return isNaN(num) ? "auto" : num;
  });
}

/** Parse gap */
function parseGap(gap: number | { row: number; column: number } | undefined): {
  row: number;
  column: number;
} {
  if (gap === undefined) return { row: 0, column: 0 };
  if (typeof gap === "number") return { row: gap, column: gap };
  return gap;
}

/**
 * Grid layout component
 * Provides CSS Grid-like layout for terminal UIs
 */
export class Grid implements Container {
  private props: GridProps;
  private gridChildren: GridChild[];

  constructor(props: GridProps = {}) {
    this.props = props;
    this.gridChildren = props.children ?? [];
  }

  /** Create a new Grid */
  static create(props?: GridProps): Grid {
    return new Grid(props);
  }

  /** Get children as Renderable array */
  get children(): Renderable[] {
    return this.gridChildren.map((c) => c.element);
  }

  /** Add a child element */
  addChild(child: Renderable): void {
    this.gridChildren.push({ element: child, placement: {} });
  }

  /** Remove a child element */
  removeChild(child: Renderable): void {
    const index = this.gridChildren.findIndex((c) => c.element === child);
    if (index !== -1) {
      this.gridChildren.splice(index, 1);
    }
  }

  /** Add a child with placement */
  place(element: Renderable, placement: GridPlacement): this {
    this.gridChildren.push({ element, placement });
    return this;
  }

  /** Calculate track sizes in cells */
  private calculateTrackSizes(
    tracks: TrackSize[],
    available: number,
    childSizes: number[]
  ): number[] {
    const gap = parseGap(this.props.gap);

    // First pass: calculate fixed and auto sizes
    let usedSpace = 0;
    let frTotal = 0;
    const sizes: (number | null)[] = [];

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (typeof track === "number") {
        sizes.push(track);
        usedSpace += track;
      } else if (track === "auto") {
        const size = childSizes[i] ?? 10;
        sizes.push(size);
        usedSpace += size;
      } else if (typeof track === "string" && track.endsWith("fr")) {
        const fr = parseFloat(track);
        frTotal += fr;
        sizes.push(null); // Will calculate later
      } else {
        sizes.push(10); // Default
        usedSpace += 10;
      }
    }

    // Account for gaps
    const totalGaps = Math.max(0, tracks.length - 1);

    // Calculate remaining space for fr units
    const remainingSpace = Math.max(0, available - usedSpace - totalGaps);

    // Second pass: distribute fr units
    if (frTotal > 0) {
      for (let i = 0; i < sizes.length; i++) {
        if (sizes[i] === null) {
          const track = tracks[i];
          if (typeof track === "string" && track.endsWith("fr")) {
            const fr = parseFloat(track);
            sizes[i] = Math.floor((fr / frTotal) * remainingSpace);
          }
        }
      }
    }

    return sizes.map((s) => s ?? 10);
  }

  /** Get computed bounds */
  getBounds(): Bounds {
    const columns = parseTracks(this.props.columns);
    const rows = parseTracks(this.props.rows);
    const gap = parseGap(this.props.gap);

    // Get child sizes for auto calculation
    const childBounds = this.gridChildren.map((c) => c.element.getBounds());

    const colSizes = this.calculateTrackSizes(
      columns,
      this.props.width ?? 80,
      childBounds.map((b) => b.width)
    );
    const rowSizes = this.calculateTrackSizes(
      rows,
      this.props.height ?? 24,
      childBounds.map((b) => b.height)
    );

    const width =
      colSizes.reduce((sum, s) => sum + s, 0) + gap.column * (columns.length - 1);
    const height =
      rowSizes.reduce((sum, s) => sum + s, 0) + gap.row * (rows.length - 1);

    return {
      x: this.props.x ?? 0,
      y: this.props.y ?? 0,
      width: this.props.width ?? width,
      height: this.props.height ?? height,
    };
  }

  /** Render the grid */
  render(): string[] {
    if (this.gridChildren.length === 0) {
      return [];
    }

    const bounds = this.getBounds();
    const columns = parseTracks(this.props.columns);
    const rows = parseTracks(this.props.rows);
    const gap = parseGap(this.props.gap);

    // Calculate actual track sizes
    const childBounds = this.gridChildren.map((c) => c.element.getBounds());
    const colSizes = this.calculateTrackSizes(columns, bounds.width, childBounds.map((b) => b.width));
    const rowSizes = this.calculateTrackSizes(rows, bounds.height, childBounds.map((b) => b.height));

    // Create empty grid
    const totalHeight = rowSizes.reduce((sum, s) => sum + s, 0) + gap.row * (rows.length - 1);
    const totalWidth = colSizes.reduce((sum, s) => sum + s, 0) + gap.column * (columns.length - 1);

    const output: string[][] = Array.from({ length: totalHeight }, () =>
      Array.from({ length: totalWidth }, () => " ")
    );

    // Place each child
    for (let i = 0; i < this.gridChildren.length; i++) {
      const child = this.gridChildren[i];
      if (!child) continue;

      const { element, placement } = child;

      // Determine grid position (default to sequential placement)
      const col = (placement.column ?? (i % columns.length) + 1) - 1;
      const row = (placement.row ?? Math.floor(i / columns.length) + 1) - 1;
      const colSpan = placement.columnSpan ?? 1;
      const rowSpan = placement.rowSpan ?? 1;

      // Calculate pixel position
      let xPos = 0;
      for (let c = 0; c < col; c++) {
        xPos += (colSizes[c] ?? 0) + gap.column;
      }

      let yPos = 0;
      for (let r = 0; r < row; r++) {
        yPos += (rowSizes[r] ?? 0) + gap.row;
      }

      // Calculate available size
      let availWidth = 0;
      for (let c = col; c < col + colSpan && c < colSizes.length; c++) {
        availWidth += colSizes[c] ?? 0;
        if (c > col) availWidth += gap.column;
      }

      let availHeight = 0;
      for (let r = row; r < row + rowSpan && r < rowSizes.length; r++) {
        availHeight += rowSizes[r] ?? 0;
        if (r > row) availHeight += gap.row;
      }

      // Render child and place in grid
      const childLines = element.render();
      for (let ly = 0; ly < childLines.length && ly < availHeight; ly++) {
        const line = childLines[ly] ?? "";
        for (let lx = 0; lx < line.length && lx < availWidth; lx++) {
          const outputRow = output[yPos + ly];
          if (outputRow && xPos + lx < outputRow.length) {
            outputRow[xPos + lx] = line[lx] ?? " ";
          }
        }
      }
    }

    return output.map((row) => row.join(""));
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

/** Convenience function to create a Grid */
export function grid(props?: GridProps): Grid {
  return Grid.create(props);
}
