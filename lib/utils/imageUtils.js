import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export async function resizeThumbnail(
  imagePath,
  baseName,
  returnBuffers = false
) {
  const sizes = {
    high: 1800,
    medium: 800,
    low: 200,
    very_low: 50,
  };

  const imageBuffer = await fs.readFile(imagePath);
  const results = {};

  if (returnBuffers) {
    await Promise.all(
      Object.entries(sizes).map(async ([key, size]) => {
        results[key] = await sharp(imageBuffer)
          .resize(size, null, { fit: 'inside', withoutEnlargement: true })
          .png()
          .toBuffer();
      })
    );
  } else {
    await Promise.all(
      Object.entries(sizes).map(async ([key, size]) => {
        const outputPath = path.join(`${baseName}_${key}.png`);
        await sharp(imageBuffer)
          .resize(size, null, { fit: 'inside', withoutEnlargement: true })
          .png()
          .toFile(outputPath);
        results[key] = outputPath;
      })
    );
  }

  await fs.unlink(imagePath);
  return results;
}
