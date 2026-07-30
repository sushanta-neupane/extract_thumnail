# doc2thumb

Generate thumbnails from PDF, DOCX, and PPTX files. Extracts the first page/slide and produces multiple size variants.

## Installation

```bash
npm install doc2thumb
```

## Usage

```js
import { processFile } from 'doc2thumb';
import fs from 'fs';

// Example 1: From buffer
const buffer = fs.readFileSync('sample.pdf');
const result = await processFile(buffer, { returnBuffers: true });
console.log('Thumbnails:', result);

// Example 2: From local file
const result = await processFile('sample.docx', { returnBuffers: true });
console.log('Thumbnails:', result);

// Example 3: From URL
const result = await processFile('https://example.com/file.pptx', { returnBuffers: true });
console.log('Thumbnails:', result);
```

## Options

| Option | Type | Description |
|--------|------|-------------|
| `returnBuffers` | `boolean` | Return thumbnail buffers instead of file paths |

## Supported formats

- **PDF** — Renders first page to PNG via Poppler
- **DOCX / DOC** — Converts to PDF, then renders first page
- **PPTX / PPT** — Extracts embedded thumbnail or first slide image