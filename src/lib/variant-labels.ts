import { getClientStorefrontConfig } from "@/lib/store-slug-client";
import { getStorefrontConfig } from "@/lib/store-verticals";
import type { VariantLabels } from "@/lib/store-verticals/types";

export function getVariantLabels(): VariantLabels {
  return getStorefrontConfig().variantLabels;
}

export function getClientVariantLabels(): VariantLabels {
  return getClientStorefrontConfig().variantLabels;
}
