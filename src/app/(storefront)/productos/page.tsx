import { Suspense } from "react";
import { ActiveFilterChips } from "@/components/storefront/active-filter-chips";
import { ProductFilters } from "@/components/storefront/product-filters";
import {
  ProductGrid,
  ProductGridCount,
  productGridQueryKey,
} from "@/components/storefront/product-grid";
import { ProductSortSelect } from "@/components/storefront/product-sort-select";
import {
  StorefrontSkeleton,
  StorefrontSkeletonProductGrid,
} from "@/components/storefront/storefront-skeleton";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { getActiveCatalogFilterChips } from "@/lib/catalog-filters";
import { categoriesForStoreFilter } from "@/lib/categories";
import { getCatalogFilterCounts } from "@/lib/catalog-query";
import { getStoreDisplayName, getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  categoria?: string;
  genero?: string;
  talle?: string;
  precioMax?: string;
  q?: string;
  orden?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const storeDisplayName = await getStoreDisplayName();
  const searchQuery = params.q?.trim();
  const storeId = await getStoreId();

  const categorySlugs = categoriesForStoreFilter(
    params.genero || undefined,
  ).map((category) => category.slug);

  const filterCounts = await getCatalogFilterCounts(
    { storeId, ...params },
    categorySlugs,
  );

  const activeFilterChips = getActiveCatalogFilterChips({
    genero: params.genero,
    categoria: params.categoria,
    talle: params.talle,
    precioMax: params.precioMax,
    q: params.q,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <StorefrontPageHeader
        title="Productos"
        description={
          searchQuery
            ? `Resultados para “${searchQuery}”`
            : `Explorá el catálogo completo de ${storeDisplayName}.`
        }
      />

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <ProductFilters counts={filterCounts} />
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/80 pb-3">
            <Suspense
              fallback={<StorefrontSkeleton className="h-4 w-28" />}
            >
              <ProductGridCount params={params} />
            </Suspense>
            <ProductSortSelect />
          </div>
          <ActiveFilterChips chips={activeFilterChips} className="mb-4" />
          <Suspense
            key={productGridQueryKey(params)}
            fallback={<StorefrontSkeletonProductGrid />}
          >
            <ProductGrid params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
