import {
  IMAGE_PRESETS,
  PRODUCT_IMAGE,
  type ImagePreset,
} from "@/lib/images/presets";

export { IMAGE_PRESETS, PRODUCT_IMAGE };

export const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80";

export function parseProductImageUrl(
  raw: FormDataEntryValue | null,
): string | null {
  const url = String(raw ?? "").trim();
  if (!url) return null;
  if (!url.startsWith("https://")) {
    throw new Error("La imagen debe ser una URL https válida");
  }
  return url;
}

export function normalizeProductImageUrl(raw: FormDataEntryValue | null): string {
  return parseProductImageUrl(raw) ?? DEFAULT_PRODUCT_IMAGE;
}

/**
 * Uploads already matching the final spec (e.g. encoded in the browser) are
 * returned untouched so the image is never lossy-encoded twice.
 */
export async function optimizeProductImage(
  buffer: Buffer,
  preset: ImagePreset = IMAGE_PRESETS.product,
): Promise<Buffer> {
  // Lazy: product server actions import this module but never need the native binary.
  const { default: sharp } = await import("sharp");

  const meta = await sharp(buffer).metadata();
  const alreadyFinal =
    meta.format === "webp" &&
    !!meta.width &&
    !!meta.height &&
    meta.width <= preset.maxWidth &&
    meta.height <= preset.maxHeight &&
    (meta.pages ?? 1) <= 1 &&
    (meta.orientation ?? 1) === 1 &&
    !meta.exif;
  if (alreadyFinal) return buffer;

  return sharp(buffer)
    .rotate()
    .resize(preset.maxWidth, preset.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: preset.quality, effort: 4 })
    .toBuffer();
}
