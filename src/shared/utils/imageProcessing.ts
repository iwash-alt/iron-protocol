/**
 * Client-side image processing utilities.
 * Uses canvas for resize/crop and handles EXIF orientation from mobile cameras.
 */

/** Read EXIF orientation tag from a File (1-8, or 1 if not found). */
function readExifOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer);
      if (view.getUint16(0, false) !== 0xFFD8) { resolve(1); return; }
      let offset = 2;
      while (offset < view.byteLength) {
        if (view.getUint16(offset, false) === 0xFFE1) {
          const exifOffset = offset + 10;
          const little = view.getUint16(exifOffset, false) === 0x4949;
          const tags = view.getUint16(exifOffset + (little ? 8 : 8), little);
          for (let i = 0; i < tags; i++) {
            const tagOffset = exifOffset + 10 + i * 12;
            if (tagOffset + 12 > view.byteLength) break;
            if (view.getUint16(tagOffset, little) === 0x0112) {
              resolve(view.getUint16(tagOffset + 8, little));
              return;
            }
          }
          resolve(1);
          return;
        }
        offset += 2 + view.getUint16(offset + 2, false);
      }
      resolve(1);
    };
    reader.onerror = () => resolve(1);
    reader.readAsArrayBuffer(file.slice(0, 65536));
  });
}

/** Apply EXIF orientation to canvas context before drawing. */
function applyOrientation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  orientation: number,
): void {
  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
    case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
    case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
    case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
    case 7: ctx.transform(0, -1, -1, 0, height, width); break;
    case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
  }
}

/** Load a File into an HTMLImageElement. */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(img.src); resolve(img); };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Process a profile photo: resize to 256x256 square (center crop), JPEG 80%.
 * Returns base64 data URL string.
 */
export async function processProfilePhoto(file: File): Promise<string> {
  const orientation = await readExifOrientation(file);
  const img = await loadImage(file);

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Determine source dimensions considering orientation
  const swapped = orientation >= 5 && orientation <= 8;
  const srcW = swapped ? img.height : img.width;
  const srcH = swapped ? img.width : img.height;

  // Center crop to square
  const cropSize = Math.min(srcW, srcH);
  const sx = (srcW - cropSize) / 2;
  const sy = (srcH - cropSize) / 2;

  // Apply orientation, then draw cropped
  applyOrientation(ctx, size, size, orientation);

  // Scale factor from crop to output
  const scale = size / cropSize;
  ctx.drawImage(
    img,
    sx, sy, cropSize, cropSize,
    0, 0, size, size,
  );

  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Process a progress photo: resize to max 1080px wide (preserve aspect ratio), JPEG 85%.
 * Returns base64 data URL string.
 */
export async function processProgressPhoto(file: File): Promise<string> {
  const orientation = await readExifOrientation(file);
  const img = await loadImage(file);

  const maxWidth = 1080;

  // Determine actual dimensions considering orientation
  const swapped = orientation >= 5 && orientation <= 8;
  const srcW = swapped ? img.height : img.width;
  const srcH = swapped ? img.width : img.height;

  // Calculate output dimensions
  let outW = srcW;
  let outH = srcH;
  if (outW > maxWidth) {
    outH = Math.round(outH * (maxWidth / outW));
    outW = maxWidth;
  }

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;

  applyOrientation(ctx, outW, outH, orientation);
  ctx.drawImage(img, 0, 0, outW, outH);

  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Generate a small thumbnail from a base64 image (for grid display).
 * Resizes to 200px wide, JPEG 70%.
 */
export async function generateThumbnail(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 200;
      const scale = maxW / img.width;
      const w = maxW;
      const h = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = base64;
  });
}

/** Calculate the approximate byte size of a base64 data URL string. */
export function getBase64ByteSize(base64: string): number {
  // Remove the data:image/...;base64, prefix
  const idx = base64.indexOf(',');
  const raw = idx >= 0 ? base64.substring(idx + 1) : base64;
  return Math.round(raw.length * 0.75);
}

/** Format bytes into human-readable string. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
