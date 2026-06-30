"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ActiveFilterChips } from "@/components/storefront/active-filter-chips";
import { CatalogGridSection } from "@/components/storefront/catalog-grid-section";
import { ProductFilters } from "@/components/storefront/product-filters";
import { ProductSortSelect } from "@/components/storefront/product-sort-select";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { getActiveCatalogFilterChips } from "@/lib/catalog-filters";
import type { CatalogPriceTier } from "@/lib/store-verticals/catalog-facets";
import {
  computeCatalogFilterCounts,
  filterCatalogProducts,
  paginateCatalogProducts,
  parseCatalogParams,
  type CatalogIndexData,
} from "@/lib/catalog-index";
import { categoriesForStoreFilter } from "@/lib/categories";

type CatalogPageClientProps = {
  index: CatalogIndexData;
  storeDisplayName: string;
  showAudienceFilter: boolean;
  showPromo2x1: boolean;
  showProductSearch: boolean;
  catalogVertical: "apparel" | "vape";
  variantSizeParam: "talle" | "nicotina";
  variantSizeLabel: string;
  variantColorLabel?: string;
  priceTiers: readonly CatalogPriceTier[];
};

function catalogDescription(
  params: ReturnType<typeof parseCatalogParams>,
  storeDisplayName: string,
) {
  const searchQuery = params.q?.trim();

  if (params.destacados === "1") {
    return "Selección destacada de la tienda.";
  }

  if (params.promo === "2x1") {
    return "Productos seleccionados con promoción 2x1: llevá dos y pagá uno.";
  }

  if (searchQuery) {
    return `Resultados para “${searchQuery}”`;
  }

  return `Explorá el catálogo completo de ${storeDisplayName}.`;
}

export function CatalogPageClient({
  index,
  storeDisplayName,
  showAudienceFilter,
  showPromo2x1,
  showProductSearch,
  catalogVertical,
  variantSizeParam,
  variantSizeLabel,
  variantColorLabel,
  priceTiers,
}: CatalogPageClientProps) {
  const searchParams = useSearchParams();
  const params = useMemo(
    () => parseCatalogParams(searchParams),
    [searchParams],
  );

  const categorySlugs = useMemo(
    () =>
      categoriesForStoreFilter(params.genero || undefined).map(
        (category) => category.slug,
      ),
    [params.genero],
  );

  const variantSizeOptions = useMemo(() => {
    const values = new Set<string>();
    for (const product of index.products) {
      for (const variant of product.variants) {
        if (variant.stock > 0) values.add(variant.size);
      }
    }
    return [...values].sort();
  }, [index.products]);

  const filterCounts = useMemo(
    () =>
      computeCatalogFilterCounts(
        index.products,
        params,
        categorySlugs,
        variantSizeOptions,
      ),
    [index.products, params, categorySlugs, variantSizeOptions],
  );

  const filteredProducts = useMemo(
    () => filterCatalogProducts(index, params),
    [index, params],
  );

  const page = useMemo(
    () => paginateCatalogProducts(filteredProducts, 1),
    [filteredProducts],
  );

  const activeFilterChips = useMemo(
    () => getActiveCatalogFilterChips(params, { promo2x1: showPromo2x1 }),
    [params, showPromo2x1],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <StorefrontPageHeader
        title="Productos"
        description={catalogDescription(params, storeDisplayName)}
      />

      <div className="grid items-start gap-8 lg:grid-cols-[260px_1fr]">
        <ProductFilters
          counts={filterCounts}
          showAudienceFilter={showAudienceFilter}
          showPromo2x1={showPromo2x1}
          showProductSearch={showProductSearch}
          catalogVertical={catalogVertical}
          variantSizeOptions={variantSizeOptions}
          variantSizeParam={variantSizeParam}
          variantSizeLabel={variantSizeLabel}
          variantColorLabel={variantColorLabel}
          priceTiers={priceTiers}
        />
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/80 pb-3">
            <p className="text-sm font-medium text-neutral-700">
              {page.total} producto{page.total !== 1 ? "s" : ""}
            </p>
            <ProductSortSelect />
          </div>
          <ActiveFilterChips chips={activeFilterChips} className="mb-4" />
          <CatalogGridSection
            key={[
              params.categoria ?? "",
              params.genero ?? "",
              params.talle ?? "",
              params.nicotina ?? "",
              params.sabor ?? "",
              params.precioMax ?? "",
              params.q?.trim() ?? "",
              params.orden ?? "",
              params.promo ?? "",
              params.destacados ?? "",
            ].join("|")}
            products={filteredProducts}
            initialPage={page}
          />
        </div>
      </div>
    </div>
  );
}
