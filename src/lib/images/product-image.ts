import sharp from "sharp";

export const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80";

export const PRODUCT_IMAGE = {
  maxInputBytes: 8 * 1024 * 1024,
  maxWidth: 1200,
  maxHeight: 1600,
  webpQuality: 82,
  allowedMimeTypes: new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]),
} as const;

export function normalizeProductImageUrl(raw: FormDataEntryValue | null): string {
  const url = String(raw ?? "").trim();
  if (!url) return DEFAULT_PRODUCT_IMAGE;
  if (!url.startsWith("https://")) {
    throw new Error("La imagen debe ser una URL https válida");
  }
  return url;
}

export async function optimizeProductImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(PRODUCT_IMAGE.maxWidth, PRODUCT_IMAGE.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: PRODUCT_IMAGE.webpQuality, effort: 4 })
    .toBuffer();
}
