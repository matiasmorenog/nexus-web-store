import { cache } from "react";
import { apparelConfig } from "@/lib/store-verticals/apparel/config";
import { vapeConfig } from "@/lib/store-verticals/vape/config";
import type { StoreVertical, VerticalConfig } from "@/lib/store-verticals/types";

const VERTICAL_REGISTRY: Record<StoreVertical, VerticalConfig> = {
  apparel: apparelConfig,
  vape: vapeConfig,
};

function parseStoreVertical(value: string | undefined): StoreVertical {
  if (value === "vape") return "vape";
  return "apparel";
}

export const getStoreVertical = cache((): StoreVertical => {
  return parseStoreVertical(process.env.STORE_VERTICAL);
});

export function getVerticalConfig(): VerticalConfig {
  return VERTICAL_REGISTRY[getStoreVertical()];
}

export function getVerticalConfigById(id: StoreVertical): VerticalConfig {
  return VERTICAL_REGISTRY[id];
}

export { VERTICAL_REGISTRY };
