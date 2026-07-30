import { Poppler } from 'node-poppler';
import path from 'path';
import fs from 'fs/promises';
import { resizeThumbnail } from '../utils/imageUtils.js';

export async function handlePDF(pdfFilePath, options = {}) {
  const poppler = new Poppler();
  const popplerOptions = {
    firstPageToConvert: 1,
    lastPageToConvert: 1,
    pngFile: true,
  };

  const baseName = path.basename(pdfFilePath, path.extname(pdfFilePath));
  const tempImagePath = path.join(`${baseName}.png`);

  try {
    await poppler.pdfToCairo(pdfFilePath, path.join(baseName), popplerOptions);

    const originalImagePaths = [
      path.join(`${baseName}-01.png`),
      path.join(`${baseName}-1.png`),
    ];

    const existingImagePath = await Promise.all(
      originalImagePaths.map((p) =>
        fs
          .stat(p)
          .then(() => p)
          .catch(() => null)
      )
    ).then((results) => results.find(Boolean));

    if (!existingImagePath) throw new Error('No image file found to rename');

    await fs.rename(existingImagePath, tempImagePath);
    return await resizeThumbnail(
      tempImagePath,
      baseName,
      options.returnBuffers
    );
  } catch (error) {
    throw error;
  }
}
