import fs from 'fs/promises';
import path from 'path';
import { downloadFile, detectFileType } from './utils/fileUtils.js';
import { handlePDF, handleDOCX } from './handler/index.js';
import { PPTXThumbnailExtractor } from './extractors/pptxExtractors.js';

const TEMP_DIR = path.join(process.cwd(), 'temp');

async function ensureTempDir() {
  await fs.mkdir(TEMP_DIR, { recursive: true });
}

export async function processFile(input, options = {}, type) {
  let buffer;
  let fileExtension;
  let tempFilePath;

  try {
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
      throw new Error('Invalid input type. Expected URL, file path, or buffer.');
    }

    await ensureTempDir();
    tempFilePath = path.join(TEMP_DIR, `temp_${Date.now()}${fileExtension}`);
    await fs.writeFile(tempFilePath, buffer);

    let result;
    const docxExtensions = ['.docx', '.doc'];
    const pptxExtensions = ['.pptx', '.ppt'];

    if (fileExtension === '.pdf') {
      result = await handlePDF(tempFilePath, options, TEMP_DIR);
    } else if (docxExtensions.includes(fileExtension)) {
      result = await handleDOCX(tempFilePath, options, TEMP_DIR);
    } else if (pptxExtensions.includes(fileExtension)) {
      const extractor = new PPTXThumbnailExtractor();
      result = await extractor.extractThumbnail(tempFilePath, options, TEMP_DIR);
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
