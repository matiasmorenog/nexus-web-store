import { Suspense } from "react";
import { auth } from "@/lib/auth";
import {
  adminOrdersFilterKey,
  getAdminOrdersPage,
  getAdminOrdersSummary,
} from "@/lib/admin-orders-query";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminOrdersList } from "@/components/admin/admin-orders-list";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminEmptyState } from "@/components/admin/admin-surface";
import { AdminSkeletonFiltersPanel } from "@/components/admin/admin-skeleton";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrdersFiltersPanel } from "@/components/admin/orders-filters-panel";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  estado?: string;
  q?: string;
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
  const filters = { estado: params.estado, q: params.q };

  const [summary, page] = await Promise.all([
    getAdminOrdersSummary(storeId),
    getAdminOrdersPage(storeId, 1, filters),
  ]);

  const hasFilters = Boolean(params.estado || params.q?.trim());
  const description = hasFilters
    ? `${page.total} pedido${page.total !== 1 ? "s" : ""} con los filtros actuales`
    : `${summary.totalOrders} pedido${summary.totalOrders !== 1 ? "s" : ""} en total`;

  const filtersPanel = (
    <OrdersFiltersPanel
      counts={summary.counts}
      totalOrders={summary.totalOrders}
      paidRevenue={summary.paidRevenue}
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
        <div className="min-h-0 min-w-0 flex-1 space-y-4 pb-6 lg:max-w-3xl lg:overflow-y-auto lg:pr-1 lg:pb-0">
          <div className="lg:hidden">
            <Suspense fallback={<AdminSkeletonFiltersPanel className="mb-4" />}>
              {filtersPanel}
            </Suspense>
          </div>

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
