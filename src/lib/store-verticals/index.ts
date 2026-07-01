import { cache } from "react";
import { apparelConfig } from "@/lib/store-verticals/apparel/config";
import { vapeConfig, withVapeCatalogFull } from "@/lib/store-verticals/vape/config";
import type { StoreVertical, VerticalConfig } from "@/lib/store-verticals/types";

const VERTICAL_REGISTRY: Record<StoreVertical, VerticalConfig> = {
  apparel: apparelConfig,
  vape: vapeConfig,
};

function parseStoreVertical(value: string | undefined): StoreVertical {
  if (value === "vape") return "vape";
  return "apparel";
}

function resolveVerticalConfig(vertical: StoreVertical): VerticalConfig {
  const base = VERTICAL_REGISTRY[vertical];
  if (vertical === "vape" && process.env.VAPE_STOREFRONT_MODE === "full") {
    return withVapeCatalogFull(base);
  }
  return base;
}

export const getStoreVertical = cache((): StoreVertical => {
  const value =
    process.env.STORE_VERTICAL ?? process.env.NEXT_PUBLIC_STORE_VERTICAL;
  return parseStoreVertical(value);
});

export function getVerticalConfig(): VerticalConfig {
  return resolveVerticalConfig(getStoreVertical());
}

export function getVerticalConfigById(id: StoreVertical): VerticalConfig {
  return resolveVerticalConfig(id);
}

export { VERTICAL_REGISTRY };
