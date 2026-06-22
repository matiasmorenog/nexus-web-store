/**
 * Valores por defecto del seed demo. Override vía env al levantar otra tienda.
 * Runtime: tienda activa = única fila en Store; email del owner desde User en DB.
 */
export const seedDefaults = {
  storeSlug: process.env.DEFAULT_STORE_SLUG ?? "demo-store",
  storeName: process.env.SEED_STORE_NAME ?? "Demo",
  adminEmail: process.env.STORE_OWNER_EMAIL ?? "admin@example.com",
  adminPassword: process.env.SEED_ADMIN_PASSWORD ?? "admin123",
  adminDisplayName: process.env.SEED_ADMIN_NAME ?? "Admin",
} as const;
