/**
 * Valores por defecto del seed demo. Override vía env al levantar otra tienda.
 * Los defaults de Alaska son solo para el seed local/demo, no para runtime.
 */
export const seedDefaults = {
  storeSlug: process.env.DEFAULT_STORE_SLUG ?? "alaska-indumentaria",
  storeName: process.env.SEED_STORE_NAME ?? "Alaska",
  adminEmail: process.env.SEED_ADMIN_EMAIL ?? "admin@alaskaindumentaria.com",
  adminPassword: process.env.SEED_ADMIN_PASSWORD ?? "admin123",
  adminDisplayName: process.env.SEED_ADMIN_NAME ?? "Admin",
} as const;
