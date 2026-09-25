/**
 * Configuración del seed demo.
 * Runtime: tienda activa y owner se leen desde DB según DEFAULT_STORE_SLUG del deploy.
 *
 * Manoviva (app3) is a real store: owner password MUST come from env at seed time.
 * Never commit production passwords here.
 */

/** Tienda app1 (deploy 1). */
export const DEFAULT_STORE_SLUG = "demo-store";
export const SEED_STORE_NAME = "Goat Indumentaria";
export const STORE_OWNER_EMAIL = "matiasmorenog+goat-admin@gmail.com";

/** Tienda app2 (deploy 2). */
export const APP2_STORE_SLUG = "vape-demo";
export const APP2_STORE_NAME = "VAPORX";
export const APP2_STORE_OWNER_EMAIL = "matiasmorenog+vape-nexus@gmail.com";

/** Tienda app3 (deploy Italia) — real store; email is a non-secret identifier. */
export const APP3_STORE_SLUG = "manoviva-italia";
export const APP3_STORE_NAME = "Manoviva";
export const APP3_STORE_OWNER_EMAIL = "morenor127@gmail.com";

export const SEED_ADMIN_PASSWORD = "admin123";
export const SEED_ADMIN_NAME = "Admin";

/**
 * Manoviva owner password for `db:seed:app3` only.
 * Set `APP3_STORE_OWNER_PASSWORD` or `MANOVIVA_OWNER_PASSWORD` in the environment
 * (local `.env` / Vercel — never commit the value).
 * Without env: falls back to demo `SEED_ADMIN_PASSWORD` for local throwaway only.
 */
export function resolveApp3StoreOwnerPassword(): {
  password: string;
  fromEnv: boolean;
} {
  const fromEnv =
    process.env.APP3_STORE_OWNER_PASSWORD?.trim() ||
    process.env.MANOVIVA_OWNER_PASSWORD?.trim() ||
    "";
  if (fromEnv) {
    return { password: fromEnv, fromEnv: true };
  }
  return { password: SEED_ADMIN_PASSWORD, fromEnv: false };
}

/** Cuenta cliente demo (app1) — login en /cuenta/ingresar */
export const SEED_CUSTOMER_EMAIL = "matiasmorenog+goat-customer@gmail.com";
export const SEED_CUSTOMER_PASSWORD = "cliente123";
export const SEED_CUSTOMER_NAME = "Cliente Demo";

/** Cuentas cliente obsoletas; se eliminan en seed */
export const OBSOLETE_SEED_CUSTOMER_EMAILS = [
  "cliente.demo@demo.nexus-store.local",
  "lucia.fernandez@demo.nexus-store.local",
] as const;

export type SeedStoreConfig = {
  slug: string;
  name: string;
  adminEmail: string;
  adminPassword: string;
  adminDisplayName: string;
  primaryColor: string;
  secondaryColor?: string;
  allowPickup?: boolean;
};

function buildSeedStores(): SeedStoreConfig[] {
  const app3Password = resolveApp3StoreOwnerPassword();
  return [
    {
      slug: DEFAULT_STORE_SLUG,
      name: SEED_STORE_NAME,
      adminEmail: STORE_OWNER_EMAIL,
      adminPassword: SEED_ADMIN_PASSWORD,
      adminDisplayName: SEED_ADMIN_NAME,
      primaryColor: "#db2777",
    },
    {
      slug: APP2_STORE_SLUG,
      name: APP2_STORE_NAME,
      adminEmail: APP2_STORE_OWNER_EMAIL,
      adminPassword: SEED_ADMIN_PASSWORD,
      adminDisplayName: SEED_ADMIN_NAME,
      primaryColor: "#00e5ff",
    },
    {
      slug: APP3_STORE_SLUG,
      name: APP3_STORE_NAME,
      adminEmail: APP3_STORE_OWNER_EMAIL,
      adminPassword: app3Password.password,
      adminDisplayName: "Amministrazione Manoviva (provvisoria)",
      primaryColor: "#2351D1",
      secondaryColor: "#F2F0E9",
      allowPickup: true,
    },
  ];
}

/** Resolved at call time so app3 password can come from env. */
export function getSeedStores(): SeedStoreConfig[] {
  return buildSeedStores();
}

/** @deprecated Prefer `getSeedStores()` — password for app3 is env-resolved. */
export const SEED_STORES: SeedStoreConfig[] = buildSeedStores();

/** @deprecated Usar SEED_STORES[0]; se mantiene para imports legacy. */
export const seedDefaults = {
  storeSlug: DEFAULT_STORE_SLUG,
  storeName: SEED_STORE_NAME,
  adminEmail: STORE_OWNER_EMAIL,
  adminPassword: SEED_ADMIN_PASSWORD,
  adminDisplayName: SEED_ADMIN_NAME,
} as const;
