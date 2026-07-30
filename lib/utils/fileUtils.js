import fetch from 'node-fetch';
import JSZip from 'jszip';

export async function downloadFile(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function detectFileType(buffer, type) {
  const fileSignature = buffer.toString('hex', 0, 4).toUpperCase();

  if (fileSignature.startsWith('25504446')) return '.pdf';
  if (fileSignature.startsWith('D0CF11E0')) return '.doc';
  if (!fileSignature.startsWith('504B')) {
    if (type) return type.startsWith('.') ? type : `.${type}`;
    throw new Error('Not a valid ZIP file');
  }

  const zip = await JSZip.loadAsync(buffer);

  if (zip.files['word/document.xml']) return '.docx';
  if (zip.files['ppt/presentation.xml'] || zip.files['ppt/slides/slide1.xml']) return '.pptx';

  throw new Error('Unknown ZIP-based file format');
}
