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
import { storeHasModule } from "@/lib/modules";
import { getStoreCategories } from "@/lib/store-categories";
import { getStorefrontConfig } from "@/lib/store-verticals";

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
  promo2x1Selectable,
  canManageProducts,
  categories,
  catalogTotal,
  locale,
}: {
  storeId: string;
  filters: AdminProductsFilterParams;
  hasFilters: boolean;
  promo2x1Selectable: boolean;
  canManageProducts: boolean;
  categories: Awaited<ReturnType<typeof getStoreCategories>>;
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
        promo2x1Selectable={promo2x1Selectable}
        canManage={canManageProducts}
        categories={categories}
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

  // Serialize DB: summary often cache-hit; then categories; then module flag.
  const summary = await getAdminProductsSummary(storeId);
  const categories = await getStoreCategories(storeId);
  const couponsEnabled = await storeHasModule(storeId, "coupons");
  const promo2x1Selectable =
    getStorefrontConfig().features.promo2x1 && couponsEnabled;

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
          <div className="lg:hidden">
            <Suspense
              fallback={
                <AdminSkeletonFiltersPanel variant="products" className="mb-4" />
              }
            >
              {filtersPanel}
            </Suspense>
          </div>

          <Suspense fallback={null}>
            <AdminProductsToolbar />
          </Suspense>

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
              promo2x1Selectable={promo2x1Selectable}
              canManageProducts={canManageProducts}
              categories={categories}
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
