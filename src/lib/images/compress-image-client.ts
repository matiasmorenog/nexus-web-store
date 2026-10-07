import { IMAGE_PRESETS, type ImagePreset } from "@/lib/images/presets";

/**
 * Encodes the final image in the browser (same preset as the server's
 * `optimizeProductImage`) so the body stays under Vercel's ~4.5 MB limit and
 * the server can store it without re-encoding.
 */

const WEBP_TYPE = "image/webp";
const FALLBACK_QUALITY_STEPS = [0.72, 0.62] as const;
const PASSTHROUGH_WEBP_MAX_BYTES = 600 * 1024;
const JPEG_LAST_RESORT_QUALITY = 0.92;

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
};

async function decodeImage(file: File): Promise<DecodedImage | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // Fall through to HTMLImageElement.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    return null;
  }
}

function encode(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality),
  );
}

function toFile(blob: Blob, original: File, ext: string) {
  const base = original.name.replace(/\.[^./\\]+$/, "") || "image";
  return new File([blob], `${base}.${ext}`, {
    type: blob.type,
    lastModified: original.lastModified,
  });
}

/**
 * No WebP encoder (older Safari): resize losslessly to PNG so the server still
 * does the only lossy encode. JPEG is a last resort when PNG exceeds the limit.
 */
async function resizeWithoutWebp(
  canvas: HTMLCanvasElement,
  original: File,
): Promise<File> {
  const png = await encode(canvas, "image/png");
  if (png && png.type === "image/png" && png.size <= MAX_UPLOAD_BYTES) {
    return toFile(png, original, "png");
  }

  const flat = document.createElement("canvas");
  flat.width = canvas.width;
  flat.height = canvas.height;
  const ctx = flat.getContext("2d");
  if (!ctx) return original;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, flat.width, flat.height);
  ctx.drawImage(canvas, 0, 0);
  const jpeg = await encode(flat, "image/jpeg", JPEG_LAST_RESORT_QUALITY);
  return jpeg && jpeg.type === "image/jpeg"
    ? toFile(jpeg, original, "jpg")
    : original;
}

function fitInside(width: number, height: number, preset: ImagePreset) {
  const scale = Math.min(
    1,
    preset.maxWidth / width,
    preset.maxHeight / height,
  );
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * Returns the final WebP (fit inside max size, EXIF orientation applied,
 * encoded once), or the original file when it is a GIF, an already-small
 * in-bounds WebP or undecodable (e.g. HEIC outside Safari) — in those cases the
 * server does the single encode.
 */
export async function compressImageForUpload(
  file: File,
  preset: ImagePreset = IMAGE_PRESETS.product,
): Promise<File> {
  if (typeof document === "undefined") return file;
  if (file.type === "image/gif") return file;

  const image = await decodeImage(file);
  if (!image) return file;

  try {
    if (!image.width || !image.height) return file;

    const withinBounds =
      image.width <= preset.maxWidth && image.height <= preset.maxHeight;
    if (
      file.type === WEBP_TYPE &&
      withinBounds &&
      file.size <= PASSTHROUGH_WEBP_MAX_BYTES
    ) {
      return file;
    }

    const { width, height } = fitInside(image.width, image.height, preset);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image.source, 0, 0, width, height);

    let blob = await encode(canvas, WEBP_TYPE, preset.quality / 100);
    if (!blob || blob.type !== WEBP_TYPE) {
      if (withinBounds && file.size <= MAX_UPLOAD_BYTES) return file;
      return resizeWithoutWebp(canvas, file);
    }

    for (const quality of FALLBACK_QUALITY_STEPS) {
      if (blob.size <= MAX_UPLOAD_BYTES) break;
      const smaller = await encode(canvas, WEBP_TYPE, quality);
      if (smaller && smaller.type === WEBP_TYPE && smaller.size < blob.size) {
        blob = smaller;
      }
    }

    return toFile(blob, file, "webp");
  } catch {
    return file;
  } finally {
    image.release();
  }
}
