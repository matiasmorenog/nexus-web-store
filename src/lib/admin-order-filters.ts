import type { AdminOrdersFilterParams } from "@/lib/admin-orders-query";
import { formatAdminOrdersDateFilterLabel } from "@/lib/admin-orders-query";
import { getOrderStatusLabel } from "@/lib/order-status";
import type { AdminFilterChip } from "@/lib/admin-product-filters";

export const ADMIN_ORDER_FILTER_PARAMS = [
  "q",
  "estado",
  "desde",
  "hasta",
] as const;

export function getActiveAdminOrderFilterChips(
  params: AdminOrdersFilterParams,
): AdminFilterChip[] {
  const chips: AdminFilterChip[] = [];

  const searchQuery = params.q?.trim();
  if (searchQuery) {
    chips.push({
      key: "q",
      label: `“${searchQuery}”`,
      removeParams: ["q"],
    });
  }

  if (params.estado) {
    chips.push({
      key: "estado",
      label: getOrderStatusLabel(
        params.estado as Parameters<typeof getOrderStatusLabel>[0],
      ),
      removeParams: ["estado"],
    });
  }

  const dateLabel = formatAdminOrdersDateFilterLabel(
    params.desde,
    params.hasta,
  );

  if (dateLabel) {
    chips.push({
      key: "fecha",
      label: dateLabel,
      removeParams: ["desde", "hasta"],
    });
  }

  return chips;
}

export function hasAdminOrderFacetFilters(params: AdminOrdersFilterParams) {
  return Boolean(params.estado);
}
