import { Suspense } from "react";
import { cookies } from "next/headers";
import {
  adminCanManage,
  requireAdminPermission,
} from "@/lib/admin-session";
import {
  adminProductsFilterKey,
  getAdminProductsPage,
  getAdminProductsSummary,
} from "@/lib/admin-products-query";
import {
  ADMIN_PRODUCT_FILTER_PARAMS,
  getActiveAdminProductFilterChips,
  hasAdminProductListQuery,
} from "@/lib/admin-product-filters";
import { AdminProductsSection } from "@/components/admin/admin-products-section";
import { AdminActiveFilterChips } from "@/components/admin/admin-active-filter-chips";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminProductsToolbar } from "@/components/admin/admin-products-toolbar";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminEmptyState } from "@/components/admin/admin-surface";
import { AdminSkeletonFiltersPanel } from "@/components/admin/admin-skeleton";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductsFiltersPanel } from "@/components/admin/products-filters-panel";
import {
  adminFiltersAsideClass,
  adminListLayoutRowClass,
  adminListMainColumnClass,
} from "@/lib/admin-list-layout";
import {
  ADMIN_LOCALE_COOKIE,
  getAdminProductsCopy,
  parseAdminLocale,
} from "@/lib/admin-locale";
import { storeHasModule } from "@/lib/modules";
import { getStoreCategories } from "@/lib/store-categories";
import { getStorefrontConfig } from "@/lib/store-verticals";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  categoria?: string;
  genero?: string;
  estado?: string;
  stock?: string;
  orden?: string;
}>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireAdminPermission("products:view");
  const storeId = session.user.storeId;
  const canManageProducts = adminCanManage(session, "products:manage");
  const cookieStore = await cookies();
  const locale = parseAdminLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);
  const copy = getAdminProductsCopy(locale);

  const params = await searchParams;
  const filters = {
    q: params.q,
    categoria: params.categoria,
    genero: params.genero,
    estado: params.estado,
    stock: params.stock,
    orden: params.orden,
  };

  const summary = await getAdminProductsSummary(storeId);
  const listQueryActive = hasAdminProductListQuery(filters);
  const page = await getAdminProductsPage(storeId, 1, filters);
  const categories = await getStoreCategories(storeId);
  const promo2x1Selectable =
    getStorefrontConfig().features.promo2x1 &&
    (await storeHasModule(storeId, "coupons"));

  const hasFilters = listQueryActive;

  const description = hasFilters
    ? copy.headerFiltered(page.total, summary.totalProducts)
    : copy.headerCatalog(summary.totalProducts);

  const filterChips = getActiveAdminProductFilterChips(filters, locale);

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
    <div>
      <AdminDashboardReveal index={0}>
        <AdminPageHeader title={copy.title} description={description} />
      </AdminDashboardReveal>

      <AdminDashboardReveal
        index={1}
        className={adminListLayoutRowClass}
      >
        <div className={adminListMainColumnClass}>
          <div className="lg:hidden">
            <Suspense fallback={<AdminSkeletonFiltersPanel variant="products" className="mb-4" />}>
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

          {summary.totalProducts === 0 ? (
            <AdminCard>
              <AdminEmptyState>
                {copy.catalogEmptyNoProducts}
              </AdminEmptyState>
            </AdminCard>
          ) : !listQueryActive ? (
            <AdminProductsSection
              awaitingFilters
              initialProducts={[]}
              total={0}
              hasMore={false}
              filters={filters}
              promo2x1Selectable={promo2x1Selectable}
              canManage={canManageProducts}
              categories={categories}
            />
          ) : page.total === 0 ? (
            <AdminCard>
              <AdminEmptyState>
                {copy.noMatchFilters}
              </AdminEmptyState>
            </AdminCard>
          ) : (
            <AdminProductsSection
              key={adminProductsFilterKey(filters)}
              initialProducts={page.products}
              total={page.total}
              hasMore={page.hasMore}
              filters={filters}
              promo2x1Selectable={promo2x1Selectable}
              canManage={canManageProducts}
              categories={categories}
            />
          )}
        </div>

        <aside className={adminFiltersAsideClass}>
          <Suspense fallback={<AdminSkeletonFiltersPanel variant="products" />}>
            {filtersPanel}
          </Suspense>
        </aside>
      </AdminDashboardReveal>
    </div>
  );
}
