import { APPAREL_STORE_SLUG } from "@/lib/store-slugs";

/** Slug de la tienda activa (una por deploy). Override con env en producción. */
export const DEFAULT_STORE_SLUG =
  process.env.DEFAULT_STORE_SLUG ?? APPAREL_STORE_SLUG;

export function getActiveStoreSlug(): string {
  return DEFAULT_STORE_SLUG;
}

/** Mismo slug expuesto al cliente (debe coincidir con `getActiveStoreSlug()`). */
export function getPublicStoreSlug(): string {
  return (
    process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG ??
    process.env.DEFAULT_STORE_SLUG ??
    APPAREL_STORE_SLUG
  );
}
