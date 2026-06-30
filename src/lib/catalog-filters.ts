import {
  getAudienceLabel,
  getCategoryLabel,
} from "@/lib/categories";

import { getVerticalConfig } from "@/lib/store-verticals";
import type { VerticalFeatures } from "@/lib/store-verticals/types";

export type CatalogFilterChip = {
  param:
    | "genero"
    | "categoria"
    | "talle"
    | "nicotina"
    | "sabor"
    | "precioMax"
    | "q"
    | "promo"
    | "destacados";
  label: string;
};

function getPriceLabels() {
  const config = getVerticalConfig();
  const facet = config.catalogFacets.find((item) => item.type === "priceMax");
  return Object.fromEntries(
    (facet?.priceTiers ?? []).map((tier) => [tier.value, tier.label]),
  );
}

export function getActiveCatalogFilterChips(
  params: {
    genero?: string | null;
    categoria?: string | null;
    talle?: string | null;
    nicotina?: string | null;
    sabor?: string | null;
    precioMax?: string | null;
    q?: string | null;
    promo?: string | null;
    destacados?: string | null;
  },
  features?: Pick<VerticalFeatures, "promo2x1">,
): CatalogFilterChip[] {
  const chips: CatalogFilterChip[] = [];

  if (params.genero) {
    chips.push({
      param: "genero",
      label: getAudienceLabel(params.genero),
    });
  }

  if (params.categoria) {
    chips.push({
      param: "categoria",
      label: getCategoryLabel(params.categoria),
    });
  }

  if (params.talle) {
    chips.push({
      param: "talle",
      label: `Talle ${params.talle}`,
    });
  }

  if (params.nicotina) {
    chips.push({
      param: "nicotina",
      label: `Nicotina ${params.nicotina}`,
    });
  }

  if (params.sabor) {
    chips.push({
      param: "sabor",
      label: `Sabor ${params.sabor}`,
    });
  }

  if (params.precioMax) {
    const priceLabels = getPriceLabels();
    chips.push({
      param: "precioMax",
      label: priceLabels[params.precioMax] ?? `Hasta $${params.precioMax}`,
    });
  }

  if (features?.promo2x1 !== false && params.promo === "2x1") {
    chips.push({
      param: "promo",
      label: "2x1",
    });
  }

  if (params.destacados === "1") {
    chips.push({
      param: "destacados",
      label: "Destacados",
    });
  }

  const searchQuery = params.q?.trim();
  if (searchQuery) {
    chips.push({
      param: "q",
      label: `“${searchQuery}”`,
    });
  }

  return chips;
}

export const CATALOG_FILTER_PARAMS = [
  "genero",
  "categoria",
  "talle",
  "nicotina",
  "sabor",
  "precioMax",
  "q",
  "promo",
  "destacados",
] as const;
