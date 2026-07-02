import { cache } from "react";
import { getActiveStoreSlug } from "@/lib/store-env";
import {
  APPAREL_STORE_SLUG,
  isKnownStoreSlug,
  VAPE_STORE_SLUG,
} from "@/lib/store-slugs";
import { apparelConfig } from "@/lib/store-verticals/apparel/config";
import { vapeConfig } from "@/lib/store-verticals/vape/config";
import type { StoreVertical, VerticalConfig } from "@/lib/store-verticals/types";

const STOREFRONT_CONFIG_BY_SLUG: Record<string, VerticalConfig> = {
  [APPAREL_STORE_SLUG]: apparelConfig,
  [VAPE_STORE_SLUG]: vapeConfig,
};

const STOREFRONT_CONFIG_BY_KIND: Record<StoreVertical, VerticalConfig> = {
  apparel: apparelConfig,
  vape: vapeConfig,
};

function resolveStorefrontConfig(slug: string): VerticalConfig {
  if (isKnownStoreSlug(slug)) {
    return STOREFRONT_CONFIG_BY_SLUG[slug];
  }

  throw new Error(
    `No hay storefront config para slug "${slug}". Slugs conocidos: ${APPAREL_STORE_SLUG}, ${VAPE_STORE_SLUG}.`,
  );
}

/** Config de storefront según `DEFAULT_STORE_SLUG` del deploy. */
export const getStorefrontConfig = cache((): VerticalConfig => {
  return resolveStorefrontConfig(getActiveStoreSlug());
});

/** Plantilla interna (apparel | vape) derivada del slug activo. */
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
