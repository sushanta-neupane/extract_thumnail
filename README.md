# File Thumbnail Generator

A Node.js package for generating thumbnails from DOCX, PPTX, and PDF files. It extracts the first page/slide and generates multiple size variants of the thumbnail.

## Installation

```bash
npm install Thumbify

import { processFile } from 'Thumbify';
import fs from 'fs';

// Example 1: Process PDF file
(async () => {
  const buffer = fs.readFileSync('sample.pdf');
  const options = { returnBuffers: true };
  const result = await processFile(buffer, options, '.pdf');
  console.log('Generated thumbnails:', result);
})();

// Example 2: Process DOCX file
(async () => {
  const buffer = fs.readFileSync('sample.docx');
  const options = { returnBuffers: true };
  const result = await processFile(buffer, options, '.docx');
  console.log('Generated thumbnails:', result);
})();

// Example 3: Process PPTX file
(async () => {
  const buffer = fs.readFileSync('sample.pptx');
  const options = { returnBuffers: true };
  const result = await processFile(buffer, options, '.pptx');
  console.log('Generated thumbnails:', result);
})();

```

## Options

    returnBuffers: Set this to true if you want the thumbnails returned as buffers instead of file paths.

## File Support

    .pdf: Generates a PNG thumbnail from the first page of the PDF.
    .docx: Converts DOCX to PDF and then generates a PNG thumbnail.
    .pptx: Extracts the thumbnail or first slide from the presentation.

This setup makes it easier to maintain and package for npm.
