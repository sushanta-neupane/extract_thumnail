import JSZip from 'jszip';
import { DOMParser } from '@xmldom/xmldom';
import path from 'path';
import fsPromises from 'fs/promises';
import { resizeThumbnail } from '../utils/imageUtils.js';

export class PPTXThumbnailExtractor {
  constructor() {
    this.jszip = new JSZip();
  }

  async extractThumbnail(filePath, options = {}) {
    try {
      const fileData = await fsPromises.readFile(filePath);
      const zip = await this.jszip.loadAsync(fileData);

      const slideContent = await this.getFirstSlideContent(zip);
      if (slideContent) {
        const imageData = await this.getFirstSlideImage(zip, slideContent);
        if (imageData && imageData.data) {
          return await this.saveFileAndResize(imageData, options);
        }
      }

      const thumbnailPaths = [
        'docProps/thumbnail.jpeg',
        'docProps/thumbnail.jpg',
        'docProps/thumbnail.png',
      ];

      for (const thumbnailPath of thumbnailPaths) {
        if (zip.files[thumbnailPath]) {
          const thumbnailData = await zip.files[thumbnailPath].async(
            'nodebuffer'
          );
          return await this.saveFileAndResize(
            { data: thumbnailData, extension: path.extname(thumbnailPath) },
            options
          );
        }
      }

      throw new Error('No suitable thumbnail found in PPTX');
    } catch (error) {
      console.error('Error processing PPTX file:', error);
      throw error;
    }
  }

  async getFirstSlideContent(zip) {
    try {
      const presentationXml = await zip
        .file('ppt/presentation.xml')
        ?.async('text');

      if (!presentationXml) {
        return null;
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(presentationXml, 'text/xml');
      const slideElement = xmlDoc.getElementsByTagName('p:sldId')[0];

      if (!slideElement) {
        return null;
      }

      const slideId = slideElement.getAttribute('r:id');

      return slideId;
    } catch (error) {
      console.log('Error reading presentation content:', error);
      return null;
    }
  }

  async getFirstSlideImage(zip, slideId) {
    try {
      const slidePath = 'ppt/slides/slide1.xml';
      const slideFile = zip.file(slidePath);

      if (!slideFile) {
        console.log(`Slide file not found: ${slidePath}`);
        return null;
      }

      const slideXml = await slideFile.async('text');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(slideXml, 'text/xml');

      const possibleImageTags = ['a:blip', 'p:pic', 'p:oleObj'];
      let imageElement = null;

      for (const tag of possibleImageTags) {
        const elements = xmlDoc.getElementsByTagName(tag);
        if (elements.length > 0) {
          imageElement = elements[0];

          break;
        }
      }

      if (!imageElement) {
        return null;
      }

      const possibleAttrs = ['r:embed', 'r:href', 'r:id'];
      let embedAttr = null;

      for (const attr of possibleAttrs) {
        embedAttr = imageElement.getAttribute(attr);
        if (embedAttr) {
          console.log(`Found image reference using attribute: ${attr}`);
          break;
        }
      }

      if (!embedAttr) {
        return null;
      }

      const possiblePaths = [
        `ppt/media/image${embedAttr.replace('rId', '')}`,
        `ppt/media/${embedAttr}`,
        embedAttr.replace('rId', 'ppt/media/image'),
      ];

      let imageFile = null;
      let imagePath = null;

      for (const path of possiblePaths) {
        imageFile = zip.file(path);
        if (imageFile) {
          imagePath = path;
          console.log(`Found image file at: ${path}`);
          break;
        }
      }

      if (!imageFile) {
        return null;
      }

      const imageData = await imageFile.async('nodebuffer');
      const extension = path.extname(imagePath);

      return { data: imageData, extension };
    } catch (error) {
      console.log('Error extracting slide image:', error);
      return null;
    }
  }

  async saveFileAndResize(imageData, options = {}) {
    const baseName = 'pptx_thumbnail';
    const tempFilePath = path.join(`${baseName}.png`);
    await fsPromises.writeFile(tempFilePath, imageData.data);

    return await resizeThumbnail(tempFilePath, baseName, options.returnBuffers);
  }
}
