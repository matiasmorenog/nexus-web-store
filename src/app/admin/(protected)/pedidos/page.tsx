import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ORDER_STATUSES,
  formatOrderId,
  type OrderStatus,
} from "@/lib/order-status";
import { AdminOrderCard } from "@/components/admin/admin-order-card";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrdersFiltersPanel } from "@/components/admin/orders-filters-panel";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  estado?: string;
  q?: string;
}>;

function filterOrders<
  T extends {
    id: string;
    status: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  },
>(orders: T[], estado?: string, q?: string) {
  let result = orders;

  if (estado && ORDER_STATUSES.includes(estado as OrderStatus)) {
    result = result.filter((o) => o.status === estado);
  }

  const query = q?.trim().toLowerCase();
  if (query) {
    result = result.filter(
      (o) =>
        o.customerName.toLowerCase().includes(query) ||
        o.customerEmail.toLowerCase().includes(query) ||
        o.customerPhone.toLowerCase().includes(query) ||
        o.id.toLowerCase().includes(query) ||
        formatOrderId(o.id).toLowerCase().includes(query),
    );
  }

  return result;
}

function buildStatusCounts(orders: { status: string }[]) {
  const counts = Object.fromEntries(
    ORDER_STATUSES.map((s) => [s, 0]),
  ) as Record<OrderStatus, number>;

  for (const order of orders) {
    if (order.status in counts) {
      counts[order.status as OrderStatus] += 1;
    }
  }

  return counts;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) return <p>No autorizado</p>;

  const params = await searchParams;

  const orders = await db.order.findMany({
    where: { storeId },
    include: {
      items: {
        include: {
          variant: { include: { product: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const filteredOrders = filterOrders(orders, params.estado, params.q);
  const statusCounts = buildStatusCounts(orders);
  const paidRevenue = orders
    .filter((o) => o.status === "PAID" || o.status === "SHIPPED")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const hasFilters = Boolean(params.estado || params.q?.trim());
  const description = hasFilters
    ? `${filteredOrders.length} de ${orders.length} pedido${orders.length !== 1 ? "s" : ""}`
    : `${orders.length} pedido${orders.length !== 1 ? "s" : ""} en total`;

  const filtersPanel = (
    <OrdersFiltersPanel
      counts={statusCounts}
      totalOrders={orders.length}
      paidRevenue={paidRevenue}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminPageHeader title="Pedidos" description={description} />

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-8">
        <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto lg:max-w-3xl lg:pr-1">
          <div className="lg:hidden">
            <Suspense
              fallback={
                <div className="mb-4 h-48 animate-pulse rounded-xl bg-neutral-100" />
              }
            >
              {filtersPanel}
            </Suspense>
          </div>

          {orders.length === 0 ? (
            <AdminCard>
              <p className="py-8 text-center text-neutral-500">No hay pedidos aún</p>
            </AdminCard>
          ) : filteredOrders.length === 0 ? (
            <AdminCard>
              <p className="py-8 text-center text-neutral-500">
                Ningún pedido coincide con los filtros.
              </p>
            </AdminCard>
          ) : (
            filteredOrders.map((order) => (
              <AdminOrderCard key={order.id} order={order} />
            ))
          )}
        </div>

        <aside className="hidden w-72 shrink-0 lg:block">
          <Suspense
            fallback={
              <div className="h-64 animate-pulse rounded-xl bg-neutral-100" />
            }
          >
            {filtersPanel}
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
