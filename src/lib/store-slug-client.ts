import { APPAREL_STORE_SLUG, VAPE_STORE_SLUG } from "@/lib/store-slugs";
import { apparelConfig } from "@/lib/store-verticals/apparel/config";
import { vapeConfig } from "@/lib/store-verticals/vape/config";
import type { VerticalConfig } from "@/lib/store-verticals/types";

/** Slug activo en el browser (debe coincidir con `DEFAULT_STORE_SLUG` del deploy). */
export function getClientStoreSlug(): string {
  return (
    process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG ??
    process.env.DEFAULT_STORE_SLUG ??
    APPAREL_STORE_SLUG
  );
}

export function isVapeStoreSlug(
  slug: string = getClientStoreSlug(),
): boolean {
  return slug === VAPE_STORE_SLUG;
}

/** Config de storefront en componentes cliente, según slug público. */
export function getClientStorefrontConfig(): VerticalConfig {
  return isVapeStoreSlug() ? vapeConfig : apparelConfig;
}
