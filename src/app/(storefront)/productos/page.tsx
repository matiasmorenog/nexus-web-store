import { Suspense } from "react";
import { CatalogPageClient } from "@/components/storefront/catalog-page-client";
import {
  StorefrontSkeleton,
  StorefrontSkeletonProductGrid,
} from "@/components/storefront/storefront-skeleton";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { getCatalogIndex } from "@/lib/catalog-index-query";
import { getStoreDisplayName, getStoreId } from "@/lib/store-context";

export const revalidate = 60;

function CatalogPageFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <StorefrontPageHeader
        title="Productos"
        description="Cargando catálogo..."
      />
      <div className="grid items-start gap-8 lg:grid-cols-[260px_1fr]">
        <StorefrontSkeleton className="h-[32rem] w-full rounded-xl" />
        <div className="min-w-0">
          <StorefrontSkeleton className="mb-4 h-4 w-28" />
          <StorefrontSkeletonProductGrid />
        </div>
      </div>
    </div>
  );
}

export default async function ProductsPage() {
  const storeId = await getStoreId();
  const [storeDisplayName, index] = await Promise.all([
    getStoreDisplayName(),
    getCatalogIndex(storeId),
  ]);

  return (
    <Suspense fallback={<CatalogPageFallback />}>
      <CatalogPageClient index={index} storeDisplayName={storeDisplayName} />
    </Suspense>
  );
}
