import { Suspense } from "react";
import { ProductFilters } from "@/components/storefront/product-filters";
import {
  ProductGrid,
  productGridQueryKey,
} from "@/components/storefront/product-grid";
import { StorefrontSkeletonProductGrid } from "@/components/storefront/storefront-skeleton";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
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
        <Suspense
          key={productGridQueryKey(params)}
          fallback={<StorefrontSkeletonProductGrid />}
        >
          <ProductGrid params={params} />
        </Suspense>
      </div>
    </div>
  );
}
