import {
  APP1_STORE_SLUG,
  APP2_STORE_SLUG,
  APP3_STORE_SLUG,
} from "@/lib/store-slugs";
import { app1Config } from "@/lib/store-verticals/app1/config";
import { app2Config } from "@/lib/store-verticals/app2/config";
import { app3Config } from "@/lib/store-verticals/app3/config";
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

export function isApp3StoreSlug(
  slug: string = getClientStoreSlug(),
): boolean {
  return slug === APP3_STORE_SLUG;
}

/** Config de storefront en componentes cliente, según slug público. */
export function getClientStorefrontConfig(): VerticalConfig {
  const slug = getClientStoreSlug();
  if (isApp3StoreSlug(slug)) return app3Config;
  if (isApp2StoreSlug(slug)) return app2Config;
  return app1Config;
}
