/** Slug de la tienda activa (una por deploy). Override con env en producción. */
export const DEFAULT_STORE_SLUG =
  process.env.DEFAULT_STORE_SLUG ?? "demo-store";
