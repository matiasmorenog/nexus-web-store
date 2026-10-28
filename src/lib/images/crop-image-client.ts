import type { Area } from "react-easy-crop";
import { IMAGE_PRESETS, type ImagePreset } from "@/lib/images/presets";

/**
 * Draws the selected pixel crop onto a canvas sized to fit the product
 * preset (no enlargement), then encodes WebP for the existing upload path.
 */

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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error("Could not load image for crop")),
    );
    image.src = src;
  });
}

function encode(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality),
  );
}

export async function cropImageToFile(
  imageSrc: string,
  pixelCrop: Area,
  originalName: string,
  preset: ImagePreset = IMAGE_PRESETS.product,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const { width, height } = fitInside(pixelCrop.width, pixelCrop.height, preset);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas for crop");
  }

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height,
  );

  const webp = await encode(canvas, "image/webp", preset.quality / 100);
  const blob =
    webp && webp.type === "image/webp"
      ? webp
      : await encode(canvas, "image/jpeg", 0.92);

  if (!blob) {
    throw new Error("Could not encode cropped image");
  }

  const base = originalName.replace(/\.[^./\\]+$/, "") || "producto";
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${base}.${ext}`, {
    type: blob.type,
    lastModified: Date.now(),
  });
}
