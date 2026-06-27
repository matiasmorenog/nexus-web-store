import { Suspense } from "react";
import { requireAdminSession } from "@/lib/admin-session";
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
  const session = await requireAdminSession();
  const storeId = session.user.storeId;

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

  const hasFilters = listQueryActive;

  const description = hasFilters
    ? `${page.total} de ${summary.totalProducts} producto${summary.totalProducts !== 1 ? "s" : ""} con los filtros actuales`
    : `${summary.totalProducts} producto${summary.totalProducts !== 1 ? "s" : ""} en el catálogo — filtrá o buscá para ver el listado`;

  const filterChips = getActiveAdminProductFilterChips(filters);

  const filtersPanel = (
    <ProductsFiltersPanel
      totalProducts={summary.totalProducts}
      categoryCounts={summary.categoryCounts}
      audienceCounts={summary.audienceCounts}
      estadoCounts={summary.estadoCounts}
    />
  );

  return (
    <div>
      <AdminDashboardReveal index={0}>
        <AdminPageHeader title="Productos" description={description} />
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
            />
          </Suspense>

          {summary.totalProducts === 0 ? (
            <AdminCard>
              <AdminEmptyState>
                No hay productos en el catálogo. Creá el primero con «Nuevo
                producto».
              </AdminEmptyState>
            </AdminCard>
          ) : !listQueryActive ? (
            <AdminProductsSection
              awaitingFilters
              initialProducts={[]}
              total={0}
              hasMore={false}
              filters={filters}
            />
          ) : page.total === 0 ? (
            <AdminCard>
              <AdminEmptyState>
                Ningún producto coincide con los filtros.
              </AdminEmptyState>
            </AdminCard>
          ) : (
            <AdminProductsSection
              key={adminProductsFilterKey(filters)}
              initialProducts={page.products}
              total={page.total}
              hasMore={page.hasMore}
              filters={filters}
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
