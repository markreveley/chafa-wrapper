# CLAUDE.md - Chafa Wrapper Framework

This document provides guidance for AI assistants working on this codebase.

## Project Overview

**chafa-wrapper** is a framework for building terminal-based visual interfaces using [Chafa](https://hpjansson.org/chafa/) as the underlying graphics engine. The goal is to provide high-level visual primitives and a CSS-grid-like layout system for composing sophisticated terminal UIs.

### What is Chafa?

Chafa is a C library and command-line tool that converts images and animations into terminal-friendly formats:

- **Output Formats**: Unicode/ANSI characters, Sixels, Kitty graphics protocol, iTerm2 protocol
- **Color Modes**: Truecolor (24-bit), 256-color, 16-color, 8-color, and simple FG/BG
- **Color Spaces**: RGB and DIN99d (perceptual)
- **Symbol Systems**: Block characters, Braille, ASCII, geometric shapes, custom glyphs via FreeType
- **Image Formats**: JPEG, PNG, GIF (animated), AVIF, SVG, TIFF, WebP, JPEG XL, QOI, XWD

### Why a Wrapper Framework?

Existing Chafa bindings (Python, Go, JavaScript) provide thin wrappers over the C API. This project aims to create a **higher-level abstraction** with:

1. **Visual Primitives** - Reusable components like boxes, borders, panels, progress bars
2. **Layout System** - CSS-grid/flexbox-inspired positioning for terminal UIs
3. **Style Guide** - Consistent theming and design tokens for terminal graphics
4. **Composition** - Declarative API for combining images, text, and graphics

---

## Chafa Core Concepts

Understanding these Chafa primitives is essential for building the wrapper:

### ChafaCanvas

The primary rendering surface that converts pixel data to text output.

### ChafaCanvasConfig

Configuration object controlling rendering behavior:

| Category | Options |
|----------|---------|
| **Pixel Mode** | `SYMBOLS` (Unicode), `SIXELS`, `KITTY`, `ITERM2` |
| **Canvas Mode** | `TRUECOLOR`, `INDEXED_256`, `INDEXED_240`, `INDEXED_16`, `INDEXED_8`, `FGBG` |
| **Color Space** | `RGB`, `DIN99D` |
| **Dither Mode** | `NONE`, `ORDERED`, `DIFFUSION`, `NOISE` |
| **Color Extractor** | `AVERAGE`, `MEDIAN` |

### ChafaSymbolMap

Defines which Unicode characters are used for rendering. Symbol tags include:

- `block` - Block elements (█ ▄ ▀ etc.)
- `border` - Box drawing characters (─ │ ┌ ┐ etc.)
- `braille` - Braille patterns (⠀ ⠁ ⠂ etc.)
- `diagonal` - Diagonal lines
- `stipple` - Stipple/shade patterns
- `half` - Half blocks (horizontal/vertical)
- `quad` - Quadrant blocks
- `sextant` - Sextant blocks
- `octant` - Octant blocks
- `wedge` - Wedge/triangle shapes
- `ascii` - ASCII characters only
- `space`, `solid`, `dot`, `technical`, `geometric`

### ChafaImage & ChafaPlacement

Handle image loading and positioning on the canvas.

### ChafaTermInfo & ChafaTermDb

Terminal capability detection and database.

---

## Proposed Architecture

### Visual Primitives (Style Guide)

```
primitives/
├── Box          # Bordered container with configurable edges
├── Panel        # Box with header/title support
├── Image        # Chafa-rendered image component
├── Text         # Styled text with alignment
├── Progress     # Progress bar/spinner
├── Divider      # Horizontal/vertical separators
├── Grid         # CSS-grid-like layout container
├── Flex         # Flexbox-like layout container
└── Stack        # Vertical/horizontal stacking
```

### Layout System (CSS-Grid Reference)

The layout system should support:

```typescript
// Grid-based layout
Grid({
  columns: "1fr 2fr 1fr",    // Fractional units
  rows: "auto 1fr auto",     // Auto-sizing
  gap: 1,                    // Character gap
  children: [
    Box({ gridArea: "header", ... }),
    Image({ gridColumn: "2", gridRow: "2", ... }),
    Panel({ gridArea: "sidebar", ... })
  ]
})

// Flexbox-style layout
Flex({
  direction: "row",
  justify: "space-between",
  align: "center",
  wrap: true,
  children: [...]
})
```

### Style Tokens

Design tokens for consistent theming:

```typescript
const theme = {
  // Colors (terminal-safe)
  colors: {
    primary: "#3B82F6",
    secondary: "#6B7280",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    background: "#1F2937",
    foreground: "#F9FAFB"
  },

  // Border styles
  borders: {
    none: null,
    single: "─│┌┐└┘",
    double: "═║╔╗╚╝",
    rounded: "─│╭╮╰╯",
    heavy: "━┃┏┓┗┛",
    dashed: "┄┆┌┐└┘"
  },

  // Spacing (in character cells)
  spacing: {
    xs: 1,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 16
  },

  // Chafa rendering presets
  rendering: {
    quality: { workFactor: 9, symbolTags: ["all"] },
    balanced: { workFactor: 5, symbolTags: ["block", "border"] },
    fast: { workFactor: 1, symbolTags: ["half"] }
  }
}
```

---

## Development Guidelines

### Code Conventions

- **Language**: TypeScript (preferred) or JavaScript with JSDoc
- **Module System**: ES Modules
- **Style**: Functional composition over class inheritance
- **Naming**:
  - PascalCase for components/primitives
  - camelCase for functions and variables
  - SCREAMING_SNAKE_CASE for constants

### File Structure

```
src/
├── core/           # Chafa bindings and low-level API
│   ├── canvas.ts
│   ├── config.ts
│   ├── symbols.ts
│   └── terminal.ts
├── primitives/     # Visual components
│   ├── Box.ts
│   ├── Image.ts
│   ├── Text.ts
│   └── index.ts
├── layout/         # Layout system
│   ├── Grid.ts
│   ├── Flex.ts
│   ├── Stack.ts
│   └── utils.ts
├── theme/          # Theming and design tokens
│   ├── tokens.ts
│   ├── presets.ts
│   └── index.ts
└── index.ts        # Public API exports
```

### Build & Test

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Lint
npm run lint
```

### Key Dependencies

- **chafa.js** or native bindings - Chafa integration
- **@aspect-ratio/core** - Terminal cell aspect ratio handling
- **chalk** or **picocolors** - ANSI color utilities (fallback)

---

## Implementation Priorities

### Phase 1: Core Foundation
1. Establish Chafa bindings (WASM or native)
2. Implement ChafaCanvas wrapper with TypeScript types
3. Create configuration builder with sensible defaults
4. Terminal detection and capability negotiation

### Phase 2: Visual Primitives
1. Box primitive with border variants
2. Image primitive with aspect ratio handling
3. Text primitive with alignment and wrapping
4. Panel primitive combining Box + Text header

### Phase 3: Layout System
1. Stack layout (simplest)
2. Flex layout
3. Grid layout
4. Nested layout composition

### Phase 4: Theming & Polish
1. Design token system
2. Built-in themes (dark, light, high-contrast)
3. Custom theme creation
4. Documentation and examples

---

## API Design Principles

1. **Declarative over Imperative** - Describe what you want, not how to build it
2. **Sensible Defaults** - Work out of the box with zero config
3. **Progressive Disclosure** - Simple API surface, deep customization available
4. **Terminal Agnostic** - Graceful degradation across terminal capabilities
5. **Composable** - Small primitives that combine into complex UIs

---

## References

- [Chafa Official Site](https://hpjansson.org/chafa/)
- [Chafa GitHub](https://github.com/hpjansson/chafa)
- [Chafa API Reference](https://hpjansson.org/chafa/ref/)
- [chafa.py Python Bindings](https://github.com/GuardKenzie/chafa.py)
- [chafa-go Go Bindings](https://github.com/ploMP4/chafa-go)

---

## Notes for AI Assistants

When working on this codebase:

1. **Understand the target** - This is a terminal UI framework, not a web framework
2. **Character cells matter** - Layout is measured in character cells, not pixels
3. **Capability detection** - Always consider terminals with limited support
4. **Performance** - Symbol count affects rendering speed; provide quality presets
5. **Test visually** - Terminal rendering requires visual verification
6. **Preserve Chafa flexibility** - Don't hide advanced options, layer abstractions

### Common Tasks

- **Adding a primitive**: Create in `src/primitives/`, export from index, add tests
- **Extending layout**: Modify `src/layout/`, ensure Grid/Flex compatibility
- **Adding theme tokens**: Update `src/theme/tokens.ts`, document in presets
- **Chafa config changes**: Update `src/core/config.ts`, maintain type safety
