/**
 * Configuración del seed demo. Editá acá — no usa variables de .env.
 * Runtime: tienda activa y owner se leen desde DB según DEFAULT_STORE_SLUG del deploy.
 */

/** Tienda apparel (deploy 1). */
export const DEFAULT_STORE_SLUG = "demo-store";
export const SEED_STORE_NAME = "Goat";
export const STORE_OWNER_EMAIL = "matiasmorenog+nexus-web-store@gmail.com";

/** Tienda vape (deploy 2). */
export const VAPE_STORE_SLUG = "vape-demo";
export const VAPE_STORE_NAME = "VAPORX";
export const VAPE_STORE_OWNER_EMAIL = "matiasmorenog+vape-nexus@gmail.com";

export const SEED_ADMIN_PASSWORD = "admin123";
export const SEED_ADMIN_NAME = "Admin";

export type SeedStoreConfig = {
  slug: string;
  name: string;
  adminEmail: string;
  adminPassword: string;
  adminDisplayName: string;
  primaryColor: string;
  shippingFlatRate: number;
};

export const SEED_STORES: SeedStoreConfig[] = [
  {
    slug: DEFAULT_STORE_SLUG,
    name: SEED_STORE_NAME,
    adminEmail: STORE_OWNER_EMAIL,
    adminPassword: SEED_ADMIN_PASSWORD,
    adminDisplayName: SEED_ADMIN_NAME,
    primaryColor: "#db2777",
    shippingFlatRate: 2500,
  },
  {
    slug: VAPE_STORE_SLUG,
    name: VAPE_STORE_NAME,
    adminEmail: VAPE_STORE_OWNER_EMAIL,
    adminPassword: SEED_ADMIN_PASSWORD,
    adminDisplayName: SEED_ADMIN_NAME,
    primaryColor: "#00e5ff",
    shippingFlatRate: 2000,
  },
];

/** @deprecated Usar SEED_STORES[0]; se mantiene para imports legacy. */
export const seedDefaults = {
  storeSlug: DEFAULT_STORE_SLUG,
  storeName: SEED_STORE_NAME,
  adminEmail: STORE_OWNER_EMAIL,
  adminPassword: SEED_ADMIN_PASSWORD,
  adminDisplayName: SEED_ADMIN_NAME,
} as const;
