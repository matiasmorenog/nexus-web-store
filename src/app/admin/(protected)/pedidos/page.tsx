import { Suspense } from "react";
import { auth } from "@/lib/auth";
import {
  adminOrdersFilterKey,
  getAdminOrdersPage,
  getAdminOrdersSummary,
} from "@/lib/admin-orders-query";
import {
  ADMIN_ORDER_FILTER_PARAMS,
  getActiveAdminOrderFilterChips,
} from "@/lib/admin-order-filters";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminOrdersList } from "@/components/admin/admin-orders-list";
import { AdminActiveFilterChips } from "@/components/admin/admin-active-filter-chips";
import { AdminOrdersToolbar } from "@/components/admin/admin-orders-toolbar";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminEmptyState } from "@/components/admin/admin-surface";
import { AdminSkeletonFiltersPanel } from "@/components/admin/admin-skeleton";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrdersFiltersPanel } from "@/components/admin/orders-filters-panel";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  estado?: string;
  q?: string;
  desde?: string;
  hasta?: string;
}>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) return <p>No autorizado</p>;

  const params = await searchParams;
  const filters = {
    estado: params.estado,
    q: params.q,
    desde: params.desde,
    hasta: params.hasta,
  };

  const [summary, page] = await Promise.all([
    getAdminOrdersSummary(storeId),
    getAdminOrdersPage(storeId, 1, filters),
  ]);

  const hasFilters = Boolean(
    params.estado || params.q?.trim() || params.desde,
  );

  const description = hasFilters
    ? `${page.total} de ${summary.totalOrders} pedido${summary.totalOrders !== 1 ? "s" : ""} con los filtros actuales · ${formatPrice(summary.paidRevenue)} ingresos pagados`
    : `${summary.totalOrders} pedido${summary.totalOrders !== 1 ? "s" : ""} en total · ${formatPrice(summary.paidRevenue)} ingresos pagados`;

  const filterChips = getActiveAdminOrderFilterChips(filters);

  const filtersPanel = (
    <OrdersFiltersPanel
      counts={summary.counts}
      totalOrders={summary.totalOrders}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader title="Pedidos" description={description} />
      </AdminDashboardReveal>

      <AdminDashboardReveal
        index={1}
        className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-8"
      >
        <div className="min-h-0 min-w-0 flex-1 space-y-4 pb-6 lg:overflow-y-auto lg:pr-1 lg:pb-0">
          <div className="lg:hidden">
            <Suspense fallback={<AdminSkeletonFiltersPanel className="mb-4" />}>
              {filtersPanel}
            </Suspense>
          </div>

          <Suspense fallback={null}>
            <AdminOrdersToolbar />
          </Suspense>

          <Suspense fallback={null}>
            <AdminActiveFilterChips
              basePath="/admin/pedidos"
              chips={filterChips}
              clearParams={ADMIN_ORDER_FILTER_PARAMS}
            />
          </Suspense>

          {summary.totalOrders === 0 ? (
            <AdminCard>
              <AdminEmptyState>No hay pedidos aún</AdminEmptyState>
            </AdminCard>
          ) : page.total === 0 ? (
            <AdminCard>
              <AdminEmptyState>
                Ningún pedido coincide con los filtros.
              </AdminEmptyState>
            </AdminCard>
          ) : (
            <AdminOrdersList
              key={adminOrdersFilterKey(filters)}
              initialOrders={page.orders}
              total={page.total}
              hasMore={page.hasMore}
              filters={filters}
            />
          )}
        </div>

        <aside className="hidden w-72 shrink-0 lg:block">
          <Suspense fallback={<AdminSkeletonFiltersPanel />}>
            {filtersPanel}
          </Suspense>
        </aside>
      </AdminDashboardReveal>
    </div>
  );
}
