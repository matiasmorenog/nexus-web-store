/**
 * Output presets shared by the browser encoder and the server optimizer
 * (fit inside, no enlargement, WebP). Must stay free of `sharp`.
 */
export type ImagePreset = {
  maxWidth: number;
  maxHeight: number;
  /** WebP quality, 0–100. */
  quality: number;
};

export const IMAGE_PRESETS = {
  /** PDP renders ~50vw on desktop (~1440 device px on retina). */
  product: { maxWidth: 1500, maxHeight: 2000, quality: 80 },
} as const satisfies Record<string, ImagePreset>;

export type ImagePresetId = keyof typeof IMAGE_PRESETS;

export const PRODUCT_IMAGE = {
  maxInputBytes: 8 * 1024 * 1024,
  maxWidth: IMAGE_PRESETS.product.maxWidth,
  maxHeight: IMAGE_PRESETS.product.maxHeight,
  webpQuality: IMAGE_PRESETS.product.quality,
  allowedMimeTypes: new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]),
} as const;
