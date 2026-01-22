/**
 * Image primitive - Chafa-rendered image component
 *
 * Note: Full implementation requires Chafa bindings.
 * This provides the interface and placeholder rendering.
 */

import { Canvas, ImageInput, RenderOptions } from "../core/canvas.js";
import { CanvasConfig } from "../core/config.js";
import { CanvasConfigOptions, PixelMode, SymbolTag } from "../core/types.js";
import { BaseProps, Bounds, Renderable } from "./types.js";

/** Image scaling mode */
export type ScaleMode = "fit" | "fill" | "stretch" | "none";

/** Image props */
export interface ImageProps extends BaseProps {
  /** Image source (path, URL, or buffer) */
  src: ImageInput;
  /** Alternative text description */
  alt?: string;
  /** Scaling mode */
  scale?: ScaleMode;
  /** Preserve aspect ratio */
  preserveAspectRatio?: boolean;
  /** Chafa rendering options */
  renderOptions?: Partial<CanvasConfigOptions>;
  /** Symbol tags to use */
  symbolTags?: SymbolTag[];
  /** Pixel mode */
  pixelMode?: PixelMode;
  /** Work factor (1-9) */
  workFactor?: number;
}

/**
 * Image component - renders images using Chafa
 */
export class Image implements Renderable {
  private props: ImageProps;
  private renderedLines: string[] | null = null;

  constructor(props: ImageProps) {
    this.props = {
      scale: "fit",
      preserveAspectRatio: true,
      ...props,
    };
  }

  /** Create a new Image */
  static create(src: ImageInput, props?: Omit<ImageProps, "src">): Image {
    return new Image({ src, ...props });
  }

  /** Load and render the image */
  async load(): Promise<this> {
    const {
      src,
      width = 40,
      height = 20,
      renderOptions,
      symbolTags,
      pixelMode,
      workFactor,
    } = this.props;

    // Build config
    const config = CanvasConfig.create().size(width, height);

    if (pixelMode) config.pixelMode(pixelMode);
    if (workFactor) config.workFactor(workFactor);
    if (symbolTags) config.symbolTags(...symbolTags);

    // Create canvas and render
    const canvas = Canvas.create(config);
    const renderOpts: RenderOptions = { width, height };
    if (this.props.preserveAspectRatio !== undefined) {
      renderOpts.preserveAspectRatio = this.props.preserveAspectRatio;
    }
    await canvas.renderImage(src, renderOpts);

    this.renderedLines = canvas.toString().split("\n");
    return this;
  }

  /** Get computed bounds */
  getBounds(): Bounds {
    const width = this.props.width ?? 40;
    const height = this.props.height ?? 20;

    return {
      x: this.props.x ?? 0,
      y: this.props.y ?? 0,
      width,
      height,
    };
  }

  /** Render the image */
  render(): string[] {
    // If already rendered, return cached
    if (this.renderedLines) {
      return this.renderedLines;
    }

    // Return placeholder if not loaded
    const bounds = this.getBounds();
    const { alt } = this.props;

    const lines: string[] = [];
    const pattern = ["░", "▒"];

    for (let y = 0; y < bounds.height; y++) {
      let line = "";
      for (let x = 0; x < bounds.width; x++) {
        line += pattern[(x + y) % 2];
      }
      lines.push(line);
    }

    // Add alt text in center if provided
    if (alt && bounds.height > 2 && bounds.width > alt.length + 4) {
      const midY = Math.floor(bounds.height / 2);
      const midLine = lines[midY];
      if (midLine) {
        const padding = Math.floor((bounds.width - alt.length - 2) / 2);
        const text = `[${alt}]`;
        lines[midY] =
          midLine.slice(0, padding) +
          text +
          midLine.slice(padding + text.length);
      }
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

/** Convenience function to create and load an Image */
export async function image(
  src: ImageInput,
  props?: Omit<ImageProps, "src">
): Promise<Image> {
  const img = Image.create(src, props);
  await img.load();
  return img;
}

/** Convenience function to create an Image (without loading) */
export function img(src: ImageInput, props?: Omit<ImageProps, "src">): Image {
  return Image.create(src, props);
}
