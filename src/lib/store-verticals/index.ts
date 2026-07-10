import { cache } from "react";
import { getActiveStoreSlug } from "@/lib/store-env";
import {
  APP1_STORE_SLUG,
  isKnownStoreSlug,
  APP2_STORE_SLUG,
} from "@/lib/store-slugs";
import { app1Config } from "@/lib/store-verticals/app1/config";
import { app2Config } from "@/lib/store-verticals/app2/config";
import type { StoreVertical, VerticalConfig } from "@/lib/store-verticals/types";

const STOREFRONT_CONFIG_BY_SLUG: Record<string, VerticalConfig> = {
  [APP1_STORE_SLUG]: app1Config,
  [APP2_STORE_SLUG]: app2Config,
};

const STOREFRONT_CONFIG_BY_KIND: Record<StoreVertical, VerticalConfig> = {
  app1: app1Config,
  app2: app2Config,
};

function resolveStorefrontConfig(slug: string): VerticalConfig {
  if (isKnownStoreSlug(slug)) {
    return STOREFRONT_CONFIG_BY_SLUG[slug];
  }

  throw new Error(
    `No hay storefront config para slug "${slug}". Slugs conocidos: ${APP1_STORE_SLUG}, ${APP2_STORE_SLUG}.`,
  );
}

/** Config de storefront según `DEFAULT_STORE_SLUG` del deploy. */
export const getStorefrontConfig = cache((): VerticalConfig => {
  return resolveStorefrontConfig(getActiveStoreSlug());
});

/** Plantilla interna (app1 | app2) derivada del slug activo. */
export function getStorefrontKind(): StoreVertical {
  return getStorefrontConfig().id;
}

export function getStorefrontConfigByKind(kind: StoreVertical): VerticalConfig {
  return STOREFRONT_CONFIG_BY_KIND[kind];
}

/** @deprecated Usar `getStorefrontConfig`. */
export const getVerticalConfig = getStorefrontConfig;

/** @deprecated Usar `getStorefrontKind`. */
export const getStoreVertical = getStorefrontKind;

/** @deprecated Usar `getStorefrontConfigByKind`. */
export const getVerticalConfigById = getStorefrontConfigByKind;

export { STOREFRONT_CONFIG_BY_SLUG, STOREFRONT_CONFIG_BY_KIND };
