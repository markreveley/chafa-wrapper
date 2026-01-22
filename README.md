# chafa-wrapper

High-level terminal UI framework built on [Chafa](https://hpjansson.org/chafa/).

## Features

- **Visual Primitives**: Box, Text, Divider, Image components
- **Layout System**: Stack, Flex, and Grid layouts (CSS-inspired)
- **Theme System**: Design tokens, color palettes, and built-in themes
- **Terminal Detection**: Automatic capability detection and graceful degradation
- **TypeScript**: Full type safety with strict mode

## Installation

```bash
npm install chafa-wrapper
```

## Quick Start

```typescript
import { Box, Text, vstack, hstack, darkTheme, setTheme } from 'chafa-wrapper';

// Set theme
setTheme(darkTheme);

// Create a simple UI
const header = Box.create({
  width: 40,
  height: 3,
  border: 'rounded',
  title: 'My App',
  content: 'Welcome!',
  padding: 1,
});

const content = vstack([
  Text.create('Item 1', { width: 38 }),
  Text.create('Item 2', { width: 38 }),
  Text.create('Item 3', { width: 38 }),
], 1);

const layout = vstack([header, content]);
layout.print();
```

## Primitives

### Box

Bordered container with configurable edges:

```typescript
import { Box, box } from 'chafa-wrapper';

const myBox = box({
  width: 30,
  height: 10,
  border: 'double',  // 'single' | 'double' | 'rounded' | 'heavy' | 'dashed'
  title: 'Title',
  padding: 1,
  content: 'Hello, World!',
});

myBox.print();
```

### Text

Styled text with alignment and wrapping:

```typescript
import { Text, text } from 'chafa-wrapper';

const myText = text('Long text that will wrap automatically', {
  width: 20,
  align: 'center',
  wrap: 'word',  // 'none' | 'word' | 'char' | 'truncate'
});

myText.print();
```

### Divider

Horizontal or vertical separators:

```typescript
import { hr, vr } from 'chafa-wrapper';

const horizontal = hr(40, 'dashed');
const vertical = vr(10, 'double');
```

## Layouts

### Stack

Vertical or horizontal stacking:

```typescript
import { vstack, hstack, box } from 'chafa-wrapper';

const vertical = vstack([
  box({ width: 20, height: 3 }),
  box({ width: 20, height: 3 }),
], 1);  // gap of 1

const horizontal = hstack([
  box({ width: 10, height: 5 }),
  box({ width: 10, height: 5 }),
], 2);  // gap of 2
```

### Flex

Flexbox-inspired layout:

```typescript
import { Flex, flexRow, flexColumn, box } from 'chafa-wrapper';

const row = flexRow([
  box({ width: 10, height: 5 }),
  box({ width: 10, height: 5 }),
], {
  justify: 'space-between',
  align: 'center',
  gap: 1,
});
```

### Grid

CSS Grid-inspired layout:

```typescript
import { Grid, grid, box } from 'chafa-wrapper';

const myGrid = grid({
  columns: '1fr 2fr 1fr',
  rows: 'auto auto',
  gap: 1,
  children: [
    { element: box({ width: 10, height: 3 }), placement: { column: 1, row: 1 } },
    { element: box({ width: 20, height: 3 }), placement: { column: 2, row: 1 } },
  ],
});
```

## Themes

```typescript
import { setTheme, darkTheme, lightTheme, neonTheme, createTheme } from 'chafa-wrapper';

// Use built-in theme
setTheme(darkTheme);
setTheme(lightTheme);
setTheme(neonTheme);

// Create custom theme
const custom = createTheme('custom', {
  colors: {
    primary: '#ff0000',
    background: '#000000',
  },
});
setTheme(custom);
```

## Terminal Detection

```typescript
import { terminal, detectCapabilities } from 'chafa-wrapper';

// Get terminal capabilities
const caps = terminal.capabilities;
console.log(caps.truecolor);  // true/false
console.log(caps.sixel);      // true/false
console.log(caps.kitty);      // true/false

// Get best rendering mode
console.log(terminal.bestPixelMode);   // 'symbols' | 'sixels' | 'kitty' | 'iterm2'
console.log(terminal.bestCanvasMode);  // 'truecolor' | 'indexed-256' | etc.
```

## Canvas Configuration

```typescript
import { CanvasConfig, presets } from 'chafa-wrapper';

// Use presets
const fastConfig = presets.fast();
const qualityConfig = presets.quality();

// Custom configuration
const config = CanvasConfig.create()
  .size(80, 24)
  .truecolor()
  .symbols()
  .quality('balanced');
```

## API Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed API documentation and architecture overview.

## License

MIT
