// Image utilities - client-side resize/compression via canvas
// Used to keep cover images small enough for localStorage (base64 strings).

const DEFAULT_MAX_WIDTH = 600;
const DEFAULT_MAX_HEIGHT = 800;
const DEFAULT_QUALITY = 0.82;

/**
 * Load a File/Blob into an HTMLImageElement.
 */
const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not read image file'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

/**
 * Resize + compress an image file into a JPEG data URL, preserving aspect ratio.
 * Returns { dataUrl, width, height, originalSize, compressedSize }.
 */
export const compressImage = async (
  file,
  {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
    mimeType = 'image/jpeg',
  } = {}
) => {
  if (!file) throw new Error('No file provided');
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image');
  }

  const img = await loadImage(file);

  let { width, height } = img;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL(mimeType, quality);

  return {
    dataUrl,
    width,
    height,
    originalSize: file.size,
    compressedSize: Math.round((dataUrl.length * 3) / 4), // approx bytes from base64
  };
};

/**
 * Validate an image file before processing (type + max original size in MB).
 */
export const validateImageFile = (file, maxSizeMB = 10) => {
  if (!file) return 'No file selected';
  if (!file.type.startsWith('image/')) return 'File must be an image';
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `Image must be smaller than ${maxSizeMB}MB`;
  }
  return null;
};

export default { compressImage, validateImageFile };
