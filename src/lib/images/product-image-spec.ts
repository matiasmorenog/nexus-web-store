/** Shared by the browser encoder and the server; must stay free of `sharp`. */
export const IMAGE_PRESETS = {
  /** PDP renders ~50vw on desktop (~1440 device px on retina). */
  product: {
    maxInputBytes: 8 * 1024 * 1024,
    maxWidth: 1500,
    maxHeight: 2000,
    webpQuality: 80,
    allowedMimeTypes: new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ]),
  },
} as const;

export const PRODUCT_IMAGE = IMAGE_PRESETS.product;
