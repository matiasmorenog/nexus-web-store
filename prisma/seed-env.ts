/**
 * Configuración del seed demo. Editá acá — no usa variables de .env.
 * Runtime: tienda activa y owner se leen desde DB.
 */
export const DEFAULT_STORE_SLUG = "demo-store";
export const SEED_STORE_NAME = "Goat";
export const STORE_OWNER_EMAIL = "matiasmorenog+nexus-web-store@gmail.com";
export const SEED_ADMIN_PASSWORD = "admin123";
export const SEED_ADMIN_NAME = "Admin";

export const seedDefaults = {
  storeSlug: DEFAULT_STORE_SLUG,
  storeName: SEED_STORE_NAME,
  adminEmail: STORE_OWNER_EMAIL,
  adminPassword: SEED_ADMIN_PASSWORD,
  adminDisplayName: SEED_ADMIN_NAME,
} as const;
