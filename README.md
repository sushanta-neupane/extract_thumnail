# File Thumbnail Generator

A Node.js package for generating thumbnails from DOCX, PPTX, and PDF files. It extracts the first page/slide and generates multiple size variants of the thumbnail.

Support : ES6 module

## Installation

```bash
npm install thumbify

```

## Usages

```bash

import { processFile } from 'Thumbify';
import fs from 'fs';

// Example 1: Process with buffer
(async () => {
  const buffer = fs.readFileSync('sample.pdf/.docx/.pptx');
  const options = { returnBuffers: true };
  const result = await processFile(buffer, options, '.pdf | .docx | .pptx');
  console.log('Generated thumbnails:', result);
})();

// Example 2: Process with local files
(async () => {

  const options = { returnBuffers: true };
  const result = await processFile('sample.pdf/.docx/.pptx', options, '.pdf | .docx | .pptx');
  console.log('Generated thumbnails:', result);
})();


// Example 3: Process with online files
(async () => {
  const options = { returnBuffers: true };
  const result = await processFile('https://you-file-url-here.pdf/.docx/.pptx', options, '.pdf | .docx | .pptx');
  console.log('Generated thumbnails:', result);
})();


```

## Options

    returnBuffers: Set this to true if you want the thumbnails returned as buffers instead of file paths.

## File Support

    .pdf: Generates a PNG thumbnail from the first page of the PDF.
    .docx/.doc: Converts DOCX to PDF and then generates a PNG thumbnail.
    .pptx/.ppt: Extracts the thumbnail or first slide from the presentation.
