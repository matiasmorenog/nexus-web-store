import { apparelConfig } from "@/lib/store-verticals/apparel/config";
import { vapeConfig } from "@/lib/store-verticals/vape/config";
import type { VariantLabels } from "@/lib/store-verticals/types";

export function getVariantLabels(): VariantLabels {
  const vertical = process.env.STORE_VERTICAL ?? "apparel";
  return vertical === "vape"
    ? vapeConfig.variantLabels
    : apparelConfig.variantLabels;
}

export function getClientVariantLabels(): VariantLabels {
  const vertical =
    process.env.NEXT_PUBLIC_STORE_VERTICAL ??
    process.env.STORE_VERTICAL ??
    "apparel";
  return vertical === "vape"
    ? vapeConfig.variantLabels
    : apparelConfig.variantLabels;
}
