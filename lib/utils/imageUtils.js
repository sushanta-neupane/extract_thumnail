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

  try {
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
      const paths = {
        high: path.join(`${baseName}_high.png`),
        medium: path.join(`${baseName}_medium.png`),
        low: path.join(`${baseName}_low.png`),
        very_low: path.join(`${baseName}_verylow.png`),
      };

      await Promise.all(
        Object.values(paths).map((path) => fs.unlink(path).catch(() => {}))
      );

      await Promise.all(
        Object.entries(sizes).map(async ([key, size]) => {
          await sharp(imageBuffer)
            .resize(size, null, { fit: 'inside', withoutEnlargement: true })
            .png()
            .toFile(paths[key]);
          results[key] = paths[key];
        })
      );
    }

    await fs.unlink(imagePath);
    return results;
  } catch (error) {
    throw error;
  }
}
