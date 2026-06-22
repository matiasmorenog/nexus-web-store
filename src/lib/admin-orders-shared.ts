import type {
  AdminOrdersFilterParams,
  AdminOrdersUrlParams,
} from "@/lib/admin-orders-query";
import { formatPrice } from "@/lib/utils";

type OrdersSummary = {
  totalOrders: number;
  paidRevenue: number;
};

export function hasAdminOrdersUrlFilters(params: AdminOrdersUrlParams) {
  return Boolean(
    params.estado ||
      params.q?.trim() ||
      params.todos === "1" ||
      params.desde ||
      params.hasta,
  );
}

export function buildAdminOrdersPageDescription(
  params: AdminOrdersUrlParams,
  summary: OrdersSummary,
  pageTotal: number,
) {
  const hasFilters = hasAdminOrdersUrlFilters(params);

  if (params.todos === "1") {
    return `${pageTotal} pedido${pageTotal !== 1 ? "s" : ""} en total · ${formatPrice(summary.paidRevenue)} ingresos pagados`;
  }

  if (hasFilters) {
    return `${pageTotal} de ${summary.totalOrders} pedido${summary.totalOrders !== 1 ? "s" : ""} con los filtros actuales · ${formatPrice(summary.paidRevenue)} ingresos pagados`;
  }

  return `${summary.totalOrders} pedido${summary.totalOrders !== 1 ? "s" : ""} en total · ${formatPrice(summary.paidRevenue)} ingresos pagados`;
}

export type { AdminOrdersFilterParams };
