/** Slugs de tienda conocidos (alineados con `prisma/seed-env.ts` → SEED_STORES). */
export const APP1_STORE_SLUG = "demo-store";
export const APP2_STORE_SLUG = "vape-demo";

export const KNOWN_STORE_SLUGS = [APP1_STORE_SLUG, APP2_STORE_SLUG] as const;

export type KnownStoreSlug = (typeof KNOWN_STORE_SLUGS)[number];

export function isKnownStoreSlug(slug: string): slug is KnownStoreSlug {
  return (KNOWN_STORE_SLUGS as readonly string[]).includes(slug);
}
