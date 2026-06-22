import { auth } from "@/lib/auth";
import {
  adminOrdersFilterKey,
  getAdminOrdersPage,
  getAdminOrdersSummary,
  resolveAdminOrdersFilters,
} from "@/lib/admin-orders-query";
import {
  ADMIN_ORDER_FILTER_PARAMS,
  getActiveAdminOrderFilterChips,
} from "@/lib/admin-order-filters";
import { AdminOrdersList } from "@/components/admin/admin-orders-list";
import { AdminActiveFilterChips } from "@/components/admin/admin-active-filter-chips";
import { AdminOrdersToolbar } from "@/components/admin/admin-orders-toolbar";
import { AdminOrdersUrlDefaults } from "@/components/admin/admin-orders-url-defaults";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminEmptyState } from "@/components/admin/admin-surface";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrdersFiltersPanel } from "@/components/admin/orders-filters-panel";
import {
  adminFiltersAsideClass,
  adminListLayoutRowClass,
  adminOrdersMainColumnClass,
} from "@/lib/admin-list-layout";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  estado?: string;
  q?: string;
  desde?: string;
  hasta?: string;
  todos?: string;
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
  const filters = resolveAdminOrdersFilters(params);

  const [summary, page] = await Promise.all([
    getAdminOrdersSummary(storeId, filters),
    getAdminOrdersPage(storeId, 1, filters),
  ]);

  const hasFilters = Boolean(
    params.estado ||
      params.q?.trim() ||
      params.todos === "1" ||
      params.desde ||
      params.hasta,
  );

  const needsUrlDefaults =
    params.todos !== "1" && !params.desde && !params.hasta;

  const description = params.todos === "1"
    ? `${page.total} pedido${page.total !== 1 ? "s" : ""} en total · ${formatPrice(summary.paidRevenue)} ingresos pagados`
    : hasFilters
      ? `${page.total} de ${summary.totalOrders} pedido${summary.totalOrders !== 1 ? "s" : ""} con los filtros actuales · ${formatPrice(summary.paidRevenue)} ingresos pagados`
      : `${summary.totalOrders} pedido${summary.totalOrders !== 1 ? "s" : ""} en total · ${formatPrice(summary.paidRevenue)} ingresos pagados`;

  const filterChips = getActiveAdminOrderFilterChips(filters);

  return (
    <div>
      {needsUrlDefaults && filters.desde && filters.hasta ? (
        <AdminOrdersUrlDefaults
          desde={filters.desde}
          hasta={filters.hasta}
        />
      ) : null}

      <AdminPageHeader title="Pedidos" description={description} />

      <div className={adminListLayoutRowClass}>
        <div className={adminOrdersMainColumnClass}>
          <div className="lg:hidden">
            <OrdersFiltersPanel
              counts={summary.counts}
              totalOrders={summary.totalOrders}
              activeStatus={filters.estado ?? ""}
              className="mb-4"
            />
          </div>

          <AdminOrdersToolbar
            query={filters.q ?? ""}
            desde={filters.desde ?? ""}
            hasta={filters.hasta ?? ""}
          />

          <AdminActiveFilterChips
            basePath="/admin/pedidos"
            chips={filterChips}
            clearParams={ADMIN_ORDER_FILTER_PARAMS}
          />

          {summary.storeTotalOrders === 0 ? (
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

        <aside className={adminFiltersAsideClass}>
          <OrdersFiltersPanel
            counts={summary.counts}
            totalOrders={summary.totalOrders}
            activeStatus={filters.estado ?? ""}
          />
        </aside>
      </div>
    </div>
  );
}
