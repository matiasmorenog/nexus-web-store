import {
  getAudienceLabel,
  getCategoryLabel,
} from "@/lib/categories";

export type CatalogFilterChip = {
  param: "genero" | "categoria" | "talle" | "precioMax" | "q" | "promo" | "destacados";
  label: string;
};

const PRECIO_MAX_LABELS: Record<string, string> = {
  "20000": "Hasta $20.000",
  "35000": "Hasta $35.000",
  "50000": "Hasta $50.000",
};

export function getActiveCatalogFilterChips(params: {
  genero?: string | null;
  categoria?: string | null;
  talle?: string | null;
  precioMax?: string | null;
  q?: string | null;
  promo?: string | null;
  destacados?: string | null;
}): CatalogFilterChip[] {
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

  if (params.precioMax) {
    chips.push({
      param: "precioMax",
      label: PRECIO_MAX_LABELS[params.precioMax] ?? `Hasta $${params.precioMax}`,
    });
  }

  if (params.promo === "2x1") {
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
  "precioMax",
  "q",
  "promo",
  "destacados",
] as const;
