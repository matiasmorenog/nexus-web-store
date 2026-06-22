/**
 * Valores por defecto del seed demo. Override vía env al levantar otra tienda.
 * Los defaults genéricos son solo para seed local; runtime usa store-env.ts.
 */
export const seedDefaults = {
  storeSlug: process.env.DEFAULT_STORE_SLUG ?? "demo-store",
  storeName: process.env.SEED_STORE_NAME ?? "Demo",
  adminEmail: process.env.SEED_ADMIN_EMAIL ?? "admin@example.com",
  adminPassword: process.env.SEED_ADMIN_PASSWORD ?? "admin123",
  adminDisplayName: process.env.SEED_ADMIN_NAME ?? "Admin",
} as const;
