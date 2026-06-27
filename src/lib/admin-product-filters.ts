import { ADMIN_PRODUCT_SORT_OPTIONS } from "@/lib/admin-product-sort";
import {
  getAudienceLabel,
  getCategoryLabel,
} from "@/lib/categories";
import type { AdminProductsFilterParams } from "@/lib/admin-products-query";

export type AdminFilterChip = {
  key: string;
  label: string;
  removeParams: string[];
  setOnRemove?: Record<string, string>;
};

export const ADMIN_PRODUCT_FILTER_PARAMS = [
  "q",
  "categoria",
  "genero",
  "estado",
  "stock",
  "orden",
] as const;

const PRODUCT_ESTADO_LABELS: Record<string, string> = {
  destacado: "Destacado",
  "2x1": "2x1",
  normal: "Normal",
};

export function getActiveAdminProductFilterChips(
  params: AdminProductsFilterParams,
): AdminFilterChip[] {
  const chips: AdminFilterChip[] = [];

  const searchQuery = params.q?.trim();
  if (searchQuery) {
    chips.push({
      key: "q",
      label: `“${searchQuery}”`,
      removeParams: ["q"],
    });
  }

  if (params.categoria) {
    chips.push({
      key: "categoria",
      label: getCategoryLabel(params.categoria),
      removeParams: ["categoria"],
    });
  }

  if (params.genero) {
    chips.push({
      key: "genero",
      label: getAudienceLabel(params.genero),
      removeParams: ["genero"],
    });
  }

  if (params.estado) {
    chips.push({
      key: "estado",
      label: PRODUCT_ESTADO_LABELS[params.estado] ?? params.estado,
      removeParams: ["estado"],
    });
  }

  if (params.stock === "sin-stock") {
    chips.push({
      key: "stock",
      label: "Con variantes sin stock",
      removeParams: ["stock"],
    });
  } else if (params.stock === "agotado") {
    chips.push({
      key: "stock",
      label: "Agotados",
      removeParams: ["stock"],
    });
  }

  if (params.orden && params.orden !== "recientes") {
    const sortLabel = ADMIN_PRODUCT_SORT_OPTIONS.find(
      (option) => option.value === params.orden,
    )?.label;

    chips.push({
      key: "orden",
      label: sortLabel ?? params.orden,
      removeParams: ["orden"],
    });
  }

  return chips;
}

export function hasAdminProductFacetFilters(
  params: AdminProductsFilterParams,
) {
  return Boolean(params.categoria || params.genero || params.estado || params.stock);
}

export { hasAdminProductListQuery } from "@/lib/admin-products-query";
