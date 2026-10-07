/** Shared by the browser encoder and the server; must stay free of `sharp`. */
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
