import { APP1_STORE_SLUG, APP2_STORE_SLUG } from "@/lib/store-slugs";
import { app1Config } from "@/lib/store-verticals/app1/config";
import { app2Config } from "@/lib/store-verticals/app2/config";
import type { VerticalConfig } from "@/lib/store-verticals/types";

/** Slug activo en el browser (debe coincidir con `DEFAULT_STORE_SLUG` del deploy). */
export function getClientStoreSlug(): string {
  return (
    process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG ??
    process.env.DEFAULT_STORE_SLUG ??
    APP1_STORE_SLUG
  );
}

export function isApp2StoreSlug(
  slug: string = getClientStoreSlug(),
): boolean {
  return slug === APP2_STORE_SLUG;
}

/** Config de storefront en componentes cliente, según slug público. */
export function getClientStorefrontConfig(): VerticalConfig {
  return isApp2StoreSlug() ? app2Config : app1Config;
}
