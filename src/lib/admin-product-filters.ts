import {
  getAdminProductSortOptions,
  type AdminProductSort,
} from "@/lib/admin-product-sort";
import {
  getAudienceLabel,
  getCategoryLabel,
} from "@/lib/categories";
import type { AdminProductsFilterParams } from "@/lib/admin-products-query";
import {
  getAdminProductsCopy,
  type AdminLocale,
} from "@/lib/admin-locale";

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

function productEstadoLabels(locale: AdminLocale): Record<string, string> {
  const copy = getAdminProductsCopy(locale);
  return {
    destacado: copy.statusFeatured,
    "2x1": copy.statusPromo2x1,
    normal: copy.statusNormal,
  };
}

export function getActiveAdminProductFilterChips(
  params: AdminProductsFilterParams,
  locale: AdminLocale = "es",
): AdminFilterChip[] {
  const chips: AdminFilterChip[] = [];
  const copy = getAdminProductsCopy(locale);
  const estadoLabels = productEstadoLabels(locale);

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
    const audienceKey =
      params.genero === "hombre"
        ? "audienceHombre"
        : params.genero === "mujer"
          ? "audienceMujer"
          : params.genero === "unisex"
            ? "audienceUnisex"
            : null;
    chips.push({
      key: "genero",
      label: audienceKey ? copy[audienceKey] : getAudienceLabel(params.genero),
      removeParams: ["genero"],
    });
  }

  if (params.estado) {
    chips.push({
      key: "estado",
      label: estadoLabels[params.estado] ?? params.estado,
      removeParams: ["estado"],
    });
  }

  if (params.stock === "sin-stock") {
    chips.push({
      key: "stock",
      label: copy.stockPartial,
      removeParams: ["stock"],
    });
  } else if (params.stock === "agotado") {
    chips.push({
      key: "stock",
      label: copy.stockSoldOut,
      removeParams: ["stock"],
    });
  }

  if (params.orden && params.orden !== "recientes") {
    const sortLabel = getAdminProductSortOptions(locale).find(
      (option) => option.value === (params.orden as AdminProductSort),
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
