/** Credenciales demo del admin (fuente: prisma/seed-env.ts). Solo servidor / login. */
import { SEED_ADMIN_PASSWORD, STORE_OWNER_EMAIL } from "../../prisma/seed-env";
import { APP3_STORE_SLUG } from "@/lib/store-slugs";
import { getPublicStoreSlug } from "@/lib/store-env";

export const SEED_ADMIN_EMAIL = STORE_OWNER_EMAIL;
export { SEED_ADMIN_PASSWORD };

/**
 * Prefill password for admin login.
 * Goat/Vape demos: `SEED_ADMIN_PASSWORD`.
 * Manoviva (real store): never prefill — password is not in the repo.
 */
export function seedAdminPasswordForCurrentStore(): string {
  if (getPublicStoreSlug() === APP3_STORE_SLUG) {
    return "";
  }
  return SEED_ADMIN_PASSWORD;
}
