/**
 * Symbol map configuration for character selection
 * Controls which Unicode characters are used for rendering
 */

import { SymbolTag } from "./types.js";

/** Symbol range definition */
export interface SymbolRange {
  /** Starting code point */
  start: number;
  /** Ending code point (inclusive) */
  end: number;
}

/** Predefined symbol ranges by tag */
const SYMBOL_RANGES: Record<SymbolTag, SymbolRange[]> = {
  [SymbolTag.NONE]: [],
  [SymbolTag.SPACE]: [{ start: 0x20, end: 0x20 }],
  [SymbolTag.SOLID]: [{ start: 0x2588, end: 0x2588 }],
  [SymbolTag.STIPPLE]: [
    { start: 0x2591, end: 0x2593 }, // Light, medium, dark shade
  ],
  [SymbolTag.BLOCK]: [
    { start: 0x2580, end: 0x259f }, // Block elements
  ],
  [SymbolTag.BORDER]: [
    { start: 0x2500, end: 0x257f }, // Box drawing
  ],
  [SymbolTag.DIAGONAL]: [
    { start: 0x2571, end: 0x2573 }, // Diagonal lines
  ],
  [SymbolTag.DOT]: [
    { start: 0x2022, end: 0x2022 }, // Bullet
    { start: 0x25cf, end: 0x25cf }, // Black circle
  ],
  [SymbolTag.QUAD]: [
    { start: 0x2596, end: 0x259f }, // Quadrant blocks
  ],
  [SymbolTag.SEXTANT]: [
    { start: 0x1fb00, end: 0x1fb3b }, // Sextant blocks
  ],
  [SymbolTag.OCTANT]: [
    { start: 0x1cd00, end: 0x1cde5 }, // Octant blocks (extended)
  ],
  [SymbolTag.HALF]: [
    { start: 0x2580, end: 0x2580 }, // Upper half
    { start: 0x2584, end: 0x2584 }, // Lower half
    { start: 0x258c, end: 0x258c }, // Left half
    { start: 0x2590, end: 0x2590 }, // Right half
  ],
  [SymbolTag.BRAILLE]: [
    { start: 0x2800, end: 0x28ff }, // Braille patterns
  ],
  [SymbolTag.TECHNICAL]: [
    { start: 0x2300, end: 0x23ff }, // Miscellaneous technical
  ],
  [SymbolTag.GEOMETRIC]: [
    { start: 0x25a0, end: 0x25ff }, // Geometric shapes
  ],
  [SymbolTag.WEDGE]: [
    { start: 0x1fb3c, end: 0x1fb6f }, // Wedge shapes
  ],
  [SymbolTag.WIDE]: [],
  [SymbolTag.NARROW]: [],
  [SymbolTag.ASCII]: [{ start: 0x20, end: 0x7e }],
  [SymbolTag.LEGACY]: [
    { start: 0x20, end: 0x7e }, // ASCII
    { start: 0x2580, end: 0x259f }, // Block elements
  ],
  [SymbolTag.ALL]: [
    { start: 0x20, end: 0x7e }, // ASCII
    { start: 0x2500, end: 0x257f }, // Box drawing
    { start: 0x2580, end: 0x259f }, // Block elements
    { start: 0x25a0, end: 0x25ff }, // Geometric shapes
    { start: 0x2800, end: 0x28ff }, // Braille
  ],
};

/**
 * Symbol map builder for configuring character selection
 */
export class SymbolMap {
  private tags: Set<SymbolTag>;
  private customRanges: SymbolRange[];
  private blockedRanges: SymbolRange[];

  constructor() {
    this.tags = new Set();
    this.customRanges = [];
    this.blockedRanges = [];
  }

  /** Create a new empty symbol map */
  static create(): SymbolMap {
    return new SymbolMap();
  }

  /** Create a symbol map from tags */
  static fromTags(...tags: SymbolTag[]): SymbolMap {
    const map = new SymbolMap();
    for (const tag of tags) {
      map.addTag(tag);
    }
    return map;
  }

  /** Clone this symbol map */
  clone(): SymbolMap {
    const map = new SymbolMap();
    map.tags = new Set(this.tags);
    map.customRanges = [...this.customRanges];
    map.blockedRanges = [...this.blockedRanges];
    return map;
  }

  /** Add a symbol tag */
  addTag(tag: SymbolTag): this {
    this.tags.add(tag);
    return this;
  }

  /** Add multiple symbol tags */
  addTags(...tags: SymbolTag[]): this {
    for (const tag of tags) {
      this.tags.add(tag);
    }
    return this;
  }

  /** Remove a symbol tag */
  removeTag(tag: SymbolTag): this {
    this.tags.delete(tag);
    return this;
  }

  /** Check if a tag is included */
  hasTag(tag: SymbolTag): boolean {
    return this.tags.has(tag);
  }

  /** Add a custom symbol range */
  addRange(start: number, end: number): this {
    this.customRanges.push({ start, end });
    return this;
  }

  /** Add a single character by code point */
  addCodePoint(codePoint: number): this {
    return this.addRange(codePoint, codePoint);
  }

  /** Add a single character */
  addChar(char: string): this {
    const codePoint = char.codePointAt(0);
    if (codePoint !== undefined) {
      this.addCodePoint(codePoint);
    }
    return this;
  }

  /** Block a symbol range from being used */
  blockRange(start: number, end: number): this {
    this.blockedRanges.push({ start, end });
    return this;
  }

  /** Block a single character */
  blockChar(char: string): this {
    const codePoint = char.codePointAt(0);
    if (codePoint !== undefined) {
      this.blockRange(codePoint, codePoint);
    }
    return this;
  }

  /** Get all included tags */
  getTags(): SymbolTag[] {
    return [...this.tags];
  }

  /** Get all symbol ranges (from tags and custom) */
  getRanges(): SymbolRange[] {
    const ranges: SymbolRange[] = [];

    // Add ranges from tags
    for (const tag of this.tags) {
      const tagRanges = SYMBOL_RANGES[tag];
      if (tagRanges) {
        ranges.push(...tagRanges);
      }
    }

    // Add custom ranges
    ranges.push(...this.customRanges);

    return ranges;
  }

  /** Get blocked ranges */
  getBlockedRanges(): SymbolRange[] {
    return [...this.blockedRanges];
  }

  /** Check if a code point is included (considering blocked ranges) */
  includesCodePoint(codePoint: number): boolean {
    // Check if blocked
    for (const range of this.blockedRanges) {
      if (codePoint >= range.start && codePoint <= range.end) {
        return false;
      }
    }

    // Check if included
    for (const range of this.getRanges()) {
      if (codePoint >= range.start && codePoint <= range.end) {
        return true;
      }
    }

    return false;
  }

  /** Convert to plain object */
  toJSON(): { tags: SymbolTag[]; customRanges: SymbolRange[]; blockedRanges: SymbolRange[] } {
    return {
      tags: this.getTags(),
      customRanges: [...this.customRanges],
      blockedRanges: [...this.blockedRanges],
    };
  }
}

/** Preset symbol maps for common use cases */
export const symbolPresets = {
  /** ASCII characters only - maximum compatibility */
  ascii: () => SymbolMap.fromTags(SymbolTag.ASCII),

  /** Block characters - good balance */
  blocks: () => SymbolMap.fromTags(SymbolTag.BLOCK, SymbolTag.HALF, SymbolTag.SPACE),

  /** Braille patterns - high detail */
  braille: () => SymbolMap.fromTags(SymbolTag.BRAILLE),

  /** Box drawing characters - for borders */
  borders: () => SymbolMap.fromTags(SymbolTag.BORDER),

  /** All available symbols */
  all: () => SymbolMap.fromTags(SymbolTag.ALL),

  /** Minimal set for fast rendering */
  minimal: () => SymbolMap.fromTags(SymbolTag.HALF, SymbolTag.SPACE),

  /** Geometric shapes */
  geometric: () => SymbolMap.fromTags(SymbolTag.GEOMETRIC, SymbolTag.BLOCK),
} as const;
