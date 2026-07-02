/** Slugs de tienda conocidos (alineados con `prisma/seed-env.ts` → SEED_STORES). */
export const APPAREL_STORE_SLUG = "demo-store";
export const VAPE_STORE_SLUG = "vape-demo";

export const KNOWN_STORE_SLUGS = [APPAREL_STORE_SLUG, VAPE_STORE_SLUG] as const;

export type KnownStoreSlug = (typeof KNOWN_STORE_SLUGS)[number];

export function isKnownStoreSlug(slug: string): slug is KnownStoreSlug {
  return (KNOWN_STORE_SLUGS as readonly string[]).includes(slug);
}
