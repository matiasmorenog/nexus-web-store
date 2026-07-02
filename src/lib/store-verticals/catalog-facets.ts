import type { VerticalConfig } from "@/lib/store-verticals/types";

export type CatalogPriceTier = { value: string; label: string };

export function getCatalogPriceTiers(
  config: VerticalConfig,
): readonly CatalogPriceTier[] {
  const facet = config.catalogFacets.find((item) => item.type === "priceMax");
  return facet?.priceTiers ?? [];
}

export function getVariantSizeFacetParam(
  config: VerticalConfig,
): "talle" | "nicotina" {
  const facet = config.catalogFacets.find((item) => item.type === "variantSize");
  return facet?.param === "nicotina" ? "nicotina" : "talle";
}

export function getVariantColorFacetParam(config: VerticalConfig): "sabor" | null {
  const facet = config.catalogFacets.find((item) => item.type === "variantColor");
  if (!facet || facet.param !== "sabor") return null;
  return "sabor";
}
