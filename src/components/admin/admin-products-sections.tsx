import { Suspense } from "react";
import { AdminActiveFilterChips } from "@/components/admin/admin-active-filter-chips";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminProductsSection } from "@/components/admin/admin-products-section";
import { AdminProductsToolbar } from "@/components/admin/admin-products-toolbar";
import {
  AdminSkeletonFiltersPanel,
  AdminSkeletonProductsCatalogAwaiting,
} from "@/components/admin/admin-skeleton";
import { AdminProductsFilterDrawer } from "@/components/admin/admin-products-filter-drawer";
import { ProductsFiltersPanel } from "@/components/admin/products-filters-panel";
import {
  ADMIN_PRODUCT_FILTER_PARAMS,
  hasAdminProductListQuery,
  type AdminFilterChip,
} from "@/lib/admin-product-filters";
import {
  adminFiltersAsideClass,
  adminListLayoutRowClass,
  adminListMainColumnClass,
} from "@/lib/admin-list-layout";
import type { AdminLocale } from "@/lib/admin-locale";
import { getAdminProductsCopy } from "@/lib/admin-locale";
import {
  adminProductsFilterKey,
  getAdminProductsPage,
  getAdminProductsSummary,
  type AdminProductsFilterParams,
} from "@/lib/admin-products-query";
import { getStoreCategories } from "@/lib/store-categories";

type AdminProductsPageContentProps = {
  storeId: string;
  filters: AdminProductsFilterParams;
  filterChips: AdminFilterChip[];
  locale: AdminLocale;
  canManageProducts: boolean;
};

async function AdminProductsListBody({
  storeId,
  filters,
  hasFilters,
  canManageProducts,
  catalogTotal,
  locale,
}: {
  storeId: string;
  filters: AdminProductsFilterParams;
  hasFilters: boolean;
  canManageProducts: boolean;
  catalogTotal: number;
  locale: AdminLocale;
}) {
  const page = await getAdminProductsPage(storeId, 1, filters);
  const copy = getAdminProductsCopy(locale);

  return (
    <>
      {hasFilters ? (
        <p className="mb-3 text-sm text-neutral-500 lg:hidden">
          {copy.headerFiltered(page.total, catalogTotal)}
        </p>
      ) : null}
      <AdminProductsSection
        key={adminProductsFilterKey(filters)}
        initialProducts={page.products}
        total={page.total}
        hasMore={page.hasMore}
        filters={filters}
        hasFilters={hasFilters}
        canManage={canManageProducts}
      />
    </>
  );
}

/**
 * Shell: summary (cache) + categorías + módulo coupons — pinta filtros/header.
 * Listado en Suspense aparte (Neon connection_limit=1: no Promise.all).
 */
export async function AdminProductsPageContent({
  storeId,
  filters,
  filterChips,
  locale,
  canManageProducts,
}: AdminProductsPageContentProps) {
  const copy = getAdminProductsCopy(locale);
  const hasFilters = hasAdminProductListQuery(filters);

  // Serialize DB: summary often cache-hit; then categories for filter facets.
  const summary = await getAdminProductsSummary(storeId);
  const categories = await getStoreCategories(storeId);

  // Shell pinta total de catálogo (summary cache). Con filtros, el count exacto
  // llega con el listado (card + línea bajo header en mobile).
  const description = copy.headerCatalog(summary.totalProducts);

  const filtersPanel = (
    <ProductsFiltersPanel
      totalProducts={summary.totalProducts}
      categoryCounts={summary.categoryCounts}
      audienceCounts={summary.audienceCounts}
      estadoCounts={summary.estadoCounts}
      categories={categories}
    />
  );

  return (
    <>
      <AdminDashboardReveal index={0}>
        <AdminPageHeader title={copy.title} description={description} />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1} className={adminListLayoutRowClass}>
        <div className={adminListMainColumnClass}>
          <div className="flex flex-wrap items-end gap-3 lg:block">
            <div className="min-w-0 flex-1">
              <Suspense fallback={null}>
                <AdminProductsToolbar />
              </Suspense>
            </div>
            <Suspense fallback={null}>
              <AdminProductsFilterDrawer
                totalProducts={summary.totalProducts}
                categoryCounts={summary.categoryCounts}
                audienceCounts={summary.audienceCounts}
                estadoCounts={summary.estadoCounts}
                categories={categories}
                activeCount={filterChips.filter(
                  (chip) => !chip.removeParams.includes("q"),
                ).length}
              />
            </Suspense>
          </div>

          <Suspense fallback={null}>
            <AdminActiveFilterChips
              basePath="/admin/productos"
              chips={filterChips}
              clearParams={ADMIN_PRODUCT_FILTER_PARAMS}
              clearFiltersLabel={copy.clearFilters}
              removeFilterAria={copy.removeFilterAria}
            />
          </Suspense>

          <Suspense fallback={<AdminSkeletonProductsCatalogAwaiting />}>
            <AdminProductsListBody
              storeId={storeId}
              filters={filters}
              hasFilters={hasFilters}
              canManageProducts={canManageProducts}
              catalogTotal={summary.totalProducts}
              locale={locale}
            />
          </Suspense>
        </div>

        <aside className={adminFiltersAsideClass}>
          <Suspense fallback={<AdminSkeletonFiltersPanel variant="products" />}>
            {filtersPanel}
          </Suspense>
        </aside>
      </AdminDashboardReveal>
    </>
  );
}
