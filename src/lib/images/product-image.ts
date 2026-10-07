import { PRODUCT_IMAGE } from "@/lib/images/product-image-spec";

export { PRODUCT_IMAGE };

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
export async function optimizeProductImage(buffer: Buffer): Promise<Buffer> {
  // Lazy: product server actions import this module but never need the native binary.
  const { default: sharp } = await import("sharp");

  const meta = await sharp(buffer).metadata();
  const alreadyFinal =
    meta.format === "webp" &&
    !!meta.width &&
    !!meta.height &&
    meta.width <= PRODUCT_IMAGE.maxWidth &&
    meta.height <= PRODUCT_IMAGE.maxHeight &&
    (meta.pages ?? 1) <= 1 &&
    (meta.orientation ?? 1) === 1 &&
    !meta.exif;
  if (alreadyFinal) return buffer;

  return sharp(buffer)
    .rotate()
    .resize(PRODUCT_IMAGE.maxWidth, PRODUCT_IMAGE.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: PRODUCT_IMAGE.webpQuality, effort: 4 })
    .toBuffer();
}
