import PdfPrinter from 'pdfmake';
import fs from 'fs';
import path from 'path';
import { ConvertToPdf, fonts } from '../converters/pdfConverter.js';
import { handlePDF } from './pdfHandler.js';

export async function handleDOCX(docxFilePath, options = {}) {
  const baseName = path.basename(docxFilePath, path.extname(docxFilePath));
  const outputPdfPath = path.join(`${baseName}.pdf`);

  try {
    const pdfDocDefinition = await ConvertToPdf(docxFilePath, 'path', {}, {});
    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(pdfDocDefinition);

    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(outputPdfPath);
      pdfDoc.pipe(writeStream);
      pdfDoc.end();
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const thumbnailPaths = await handlePDF(outputPdfPath, options);
    await fs.promises.unlink(outputPdfPath);

    return thumbnailPaths;
  } catch (error) {
    throw error;
  }
}
