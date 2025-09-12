export interface CompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export async function compressImageToWebP(
  file: File, 
  options: CompressionOptions = {}
): Promise<File> {
  const { quality = 0.7, maxWidth = 1920, maxHeight = 1080 } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          const originalName = file.name.replace(/\.[^/.]+$/, '');
          const compressedFile = new File([blob], `${originalName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export async function compressMultipleImages(
  files: File[], 
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map(file => compressImageToWebP(file, options));
  return Promise.all(compressionPromises);
}