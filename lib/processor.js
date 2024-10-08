import fs from 'fs/promises';
import path from 'path';
import { downloadFile, detectFileType } from './utils/fileUtils.js';
import { handlePDF, handleDOCX } from './handler/index.js';
import { PPTXThumbnailExtractor } from './extactors/pptxExtractors.js';

export async function processFile(input, options = {}, type) {
  let buffer;
  let fileExtension;
  let tempFilePath;

  try {
    // Handle different input types
    if (typeof input === 'string') {
      if (input.startsWith('http://') || input.startsWith('https://')) {
        buffer = await downloadFile(input);
        fileExtension = await detectFileType(buffer);
      } else {
        buffer = await fs.readFile(input);
        fileExtension = path.extname(input).toLowerCase();
      }
    } else if (Buffer.isBuffer(input)) {
      buffer = input;
      fileExtension = await detectFileType(buffer, type);
    } else {
      throw new Error(
        'Invalid input type. Expected URL, file path, or buffer.'
      );
    }

    // Create temporary file
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    tempFilePath = path.join(tempDir, `temp_${Date.now()}${fileExtension}`);
    await fs.writeFile(tempFilePath, buffer);

    // Process based on file type
    let result;
    const docxExtensions = ['.docx', '.doc'];
    const pptxExtensions = ['.pptx', '.ppt'];

    if (fileExtension === '.pdf') {
      result = await handlePDF(tempFilePath, options);
    } else if (docxExtensions.includes(fileExtension)) {
      result = await handleDOCX(tempFilePath, options);
    } else if (pptxExtensions.includes(fileExtension)) {
      const extractor = new PPTXThumbnailExtractor();
      result = await extractor.extractThumbnail(tempFilePath, options);
    } else {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    await fs.unlink(tempFilePath).catch(() => {});
    return result;
  } catch (error) {
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(() => {});
    }
    throw error;
  }
}
