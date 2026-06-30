import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CatalogPageClient } from "@/components/storefront/catalog-page-client";
import {
  StorefrontSkeleton,
  StorefrontSkeletonProductGrid,
} from "@/components/storefront/storefront-skeleton";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { getCatalogIndex } from "@/lib/catalog-index-query";
import { getStoreDisplayName, getStoreId } from "@/lib/store-context";
import {
  getCatalogPriceTiers,
  getVariantColorFacetParam,
  getVariantSizeFacetParam,
} from "@/lib/store-verticals/catalog-facets";
import { getVerticalConfig } from "@/lib/store-verticals";

/** ISR storefront — mantener en sync con STOREFRONT_CATALOG_REVALIDATE_SECONDS en cache-ttl.ts */
export const revalidate = 600;

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
  const config = getVerticalConfig();

  if (!config.features.catalog) {
    redirect("/");
  }

  const storeId = await getStoreId();
  const storeDisplayName = await getStoreDisplayName();
  const index = await getCatalogIndex(storeId);
  const priceTiers = getCatalogPriceTiers(config);
  const variantSizeParam = getVariantSizeFacetParam(config);
  const variantColorParam = getVariantColorFacetParam(config);

  return (
    <Suspense fallback={<CatalogPageFallback />}>
      <CatalogPageClient
        index={index}
        storeDisplayName={storeDisplayName}
        showAudienceFilter={config.features.showAudienceFilter}
        showPromo2x1={config.features.promo2x1}
        showProductSearch={config.features.productSearch}
        catalogVertical={config.id}
        variantSizeParam={variantSizeParam}
        variantSizeLabel={config.variantLabels.secondary}
        variantColorLabel={
          variantColorParam ? config.variantLabels.primary : undefined
        }
        priceTiers={priceTiers}
      />
    </Suspense>
  );
}
