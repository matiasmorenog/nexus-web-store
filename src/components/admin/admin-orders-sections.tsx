import { AdminActiveFilterChips } from "@/components/admin/admin-active-filter-chips";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminOrdersList } from "@/components/admin/admin-orders-list";
import { AdminOrdersToolbar } from "@/components/admin/admin-orders-toolbar";
import { AdminEmptyState } from "@/components/admin/admin-surface";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrdersFiltersPanel } from "@/components/admin/orders-filters-panel";
import {
  ADMIN_ORDER_FILTER_PARAMS,
} from "@/lib/admin-order-filters";
import type { AdminFilterChip } from "@/lib/admin-product-filters";
import {
  adminFiltersAsideClass,
  adminListLayoutRowClass,
  adminOrdersMainColumnClass,
} from "@/lib/admin-list-layout";
import { buildAdminOrdersPageDescription } from "@/lib/admin-orders-shared";
import type { AdminOrdersFilterParams } from "@/lib/admin-orders-query";
import {
  adminOrdersFilterKey,
  getAdminOrdersPageData,
  type AdminOrdersUrlParams,
} from "@/lib/admin-orders-query";

type AdminOrdersPageContentProps = {
  storeId: string;
  filters: AdminOrdersFilterParams;
  params: AdminOrdersUrlParams;
  filterChips: AdminFilterChip[];
};

export async function AdminOrdersPageContent({
  storeId,
  filters,
  params,
  filterChips,
}: AdminOrdersPageContentProps) {
  const { summary, page } = await getAdminOrdersPageData(storeId, filters);
  const description = buildAdminOrdersPageDescription(
    params,
    summary,
    page.total,
  );

  const filtersPanel = (
    <OrdersFiltersPanel
      counts={summary.counts}
      totalOrders={summary.totalOrders}
      activeStatus={filters.estado ?? ""}
    />
  );

  let listContent;
  if (summary.storeTotalOrders === 0) {
    listContent = (
      <AdminCard>
        <AdminEmptyState>No hay pedidos aún</AdminEmptyState>
      </AdminCard>
    );
  } else if (page.total === 0) {
    listContent = (
      <AdminCard>
        <AdminEmptyState>
          Ningún pedido coincide con los filtros.
        </AdminEmptyState>
      </AdminCard>
    );
  } else {
    listContent = (
      <AdminOrdersList
        key={adminOrdersFilterKey(filters)}
        initialOrders={page.orders}
        total={page.total}
        hasMore={page.hasMore}
        filters={filters}
      />
    );
  }

  return (
    <>
      <AdminDashboardReveal index={0}>
        <AdminPageHeader title="Pedidos" description={description} />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1} className={adminListLayoutRowClass}>
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

          {listContent}
        </div>

        <aside className={adminFiltersAsideClass}>{filtersPanel}</aside>
      </AdminDashboardReveal>
    </>
  );
}
