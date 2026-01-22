/**
 * Text primitive - styled text with alignment and wrapping
 */

import { Color } from "../core/types.js";
import {
  BaseProps,
  Bounds,
  Renderable,
  TextAlign,
  VerticalAlign,
} from "./types.js";

/** Text wrap mode */
export type WrapMode = "none" | "word" | "char" | "truncate";

/** Text props */
export interface TextProps extends BaseProps {
  /** Text content */
  text: string;
  /** Text alignment */
  align?: TextAlign;
  /** Vertical alignment */
  verticalAlign?: VerticalAlign;
  /** Text color */
  color?: Color;
  /** Background color */
  background?: Color;
  /** Wrap mode */
  wrap?: WrapMode;
  /** Truncation indicator */
  ellipsis?: string;
  /** Bold text */
  bold?: boolean;
  /** Italic text */
  italic?: boolean;
  /** Underline text */
  underline?: boolean;
  /** Dim text */
  dim?: boolean;
}

/**
 * Text component - styled text display
 */
export class Text implements Renderable {
  private props: TextProps & { align: TextAlign; wrap: WrapMode };

  constructor(props: TextProps) {
    this.props = {
      align: "left",
      wrap: "word",
      ...props,
    };
  }

  /** Create a new Text */
  static create(text: string, props?: Omit<TextProps, "text">): Text {
    return new Text({ text, ...props });
  }

  /** Get computed bounds */
  getBounds(): Bounds {
    const lines = this.getLines();
    const maxWidth = Math.max(...lines.map((l) => l.length), 0);

    return {
      x: this.props.x ?? 0,
      y: this.props.y ?? 0,
      width: this.props.width ?? maxWidth,
      height: this.props.height ?? lines.length,
    };
  }

  /** Get text split into lines */
  private getLines(): string[] {
    const { text, width, wrap } = this.props;

    if (!text) return [""];

    // Split on explicit newlines first
    const paragraphs = text.split("\n");

    if (!width || wrap === "none") {
      return paragraphs;
    }

    const lines: string[] = [];

    for (const paragraph of paragraphs) {
      if (paragraph.length <= width) {
        lines.push(paragraph);
        continue;
      }

      switch (wrap) {
        case "truncate":
          lines.push(this.truncateLine(paragraph, width));
          break;
        case "char":
          lines.push(...this.wrapByChar(paragraph, width));
          break;
        case "word":
        default:
          lines.push(...this.wrapByWord(paragraph, width));
          break;
      }
    }

    return lines;
  }

  /** Truncate line with ellipsis */
  private truncateLine(text: string, width: number): string {
    const ellipsis = this.props.ellipsis ?? "…";
    if (text.length <= width) return text;
    return text.slice(0, width - ellipsis.length) + ellipsis;
  }

  /** Wrap by character */
  private wrapByChar(text: string, width: number): string[] {
    const lines: string[] = [];
    for (let i = 0; i < text.length; i += width) {
      lines.push(text.slice(i, i + width));
    }
    return lines;
  }

  /** Wrap by word */
  private wrapByWord(text: string, width: number): string[] {
    const words = text.split(/(\s+)/);
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      // Handle whitespace-only tokens
      if (/^\s+$/.test(word)) {
        if (currentLine.length + word.length <= width) {
          currentLine += word;
        }
        continue;
      }

      if (currentLine.length === 0) {
        // Word longer than width - force wrap
        if (word.length > width) {
          lines.push(...this.wrapByChar(word, width));
        } else {
          currentLine = word;
        }
      } else if (currentLine.length + word.length <= width) {
        currentLine += word;
      } else {
        lines.push(currentLine.trimEnd());
        if (word.length > width) {
          lines.push(...this.wrapByChar(word, width));
          currentLine = "";
        } else {
          currentLine = word;
        }
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine.trimEnd());
    }

    return lines;
  }

  /** Align a single line */
  private alignLine(line: string, width: number): string {
    const { align } = this.props;
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

  /** Apply vertical alignment */
  private verticalAlign(lines: string[], height: number, width: number): string[] {
    const { verticalAlign } = this.props;

    if (lines.length >= height) {
      return lines.slice(0, height);
    }

    const emptyLine = " ".repeat(width);
    const padding = height - lines.length;

    switch (verticalAlign) {
      case "middle": {
        const top = Math.floor(padding / 2);
        const bottom = padding - top;
        return [
          ...Array(top).fill(emptyLine),
          ...lines,
          ...Array(bottom).fill(emptyLine),
        ];
      }
      case "bottom":
        return [...Array(padding).fill(emptyLine), ...lines];
      case "top":
      default:
        return [...lines, ...Array(padding).fill(emptyLine)];
    }
  }

  /** Render the text to string lines */
  render(): string[] {
    const lines = this.getLines();
    const bounds = this.getBounds();
    const width = bounds.width;
    const height = bounds.height;

    // Align each line horizontally
    let alignedLines = lines.map((line) => this.alignLine(line, width));

    // Apply vertical alignment if height is specified
    if (this.props.height !== undefined) {
      alignedLines = this.verticalAlign(alignedLines, height, width);
    }

    return alignedLines;
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

/** Convenience function to create Text */
export function text(content: string, props?: Omit<TextProps, "text">): Text {
  return Text.create(content, props);
}
