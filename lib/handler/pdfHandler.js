import { Poppler } from 'node-poppler';
import path from 'path';
import fs from 'fs/promises';
import { resizeThumbnail } from '../utils/imageUtils.js';

export async function handlePDF(pdfFilePath, options = {}, tempDir) {
  const poppler = new Poppler();
  const popplerOptions = {
    firstPageToConvert: 1,
    lastPageToConvert: 1,
    pngFile: true,
  };

  const baseName = path.basename(pdfFilePath, path.extname(pdfFilePath));
  const outputPrefix = tempDir ? path.join(tempDir, baseName) : baseName;
  const tempImagePath = path.join(tempDir || '', `${baseName}.png`);

  await poppler.pdfToCairo(pdfFilePath, outputPrefix, popplerOptions);

  const originalImagePaths = [
    path.join(`${outputPrefix}-01.png`),
    path.join(`${outputPrefix}-1.png`),
  ];

  const existingImagePath = await Promise.all(
    originalImagePaths.map((p) =>
      fs.stat(p).then(() => p).catch(() => null)
    )
  ).then((results) => results.find(Boolean));

  if (!existingImagePath) throw new Error('No image file found to rename');

  await fs.rename(existingImagePath, tempImagePath);
  return await resizeThumbnail(tempImagePath, baseName, options.returnBuffers);
}
