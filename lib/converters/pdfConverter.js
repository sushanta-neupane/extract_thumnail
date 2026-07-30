import { JSDOM } from 'jsdom';
import mammoth from 'mammoth';
import htmlToPdfmake from 'html-to-pdfmake';

const { window } = new JSDOM('');

export const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

export async function ConvertToPdf(data, type, options = {}, tableLayout = {}) {
  let input;

  switch (type) {
    case 'path':
      input = { path: data };
      break;
    case 'buffer':
      input = { buffer: data };
      break;
    case 'arraybuffer':
      input = { arrayBuffer: data };
      break;
    default:
      throw new Error('Invalid input type');
  }

  try {
    const { value: html, messages } = await mammoth.convertToHtml(
      input,
      options
    );

    if (!html) throw new Error('No HTML content generated');

    const convertedContent = htmlToPdfmake(html, { window }).map((item) => {
      if (item.nodeName === 'PARAGRAPH' || item.nodeName === 'TEXT') {
        item.font = item.font || 'Helvetica';
      }
      return item;
    });

    return {
      content: convertedContent,
      defaultStyle: {
        font: 'Helvetica',
      },
    };
  } catch (error) {
    throw error;
  }
}
