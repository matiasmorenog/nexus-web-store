"use client";

import {
  ORDER_STATUSES,
  getOrderStatusLabel,
} from "@/lib/order-status";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminClearFiltersButton,
  AdminFilterButton,
  AdminFilterSection,
} from "@/components/admin/admin-filters";
import { useAdminListNavigation } from "@/components/admin/use-admin-list-navigation";
import { adminFiltersPanelScrollClass } from "@/lib/admin-list-layout";
import { hasAdminOrderFacetFilters } from "@/lib/admin-order-filters";
import { cn } from "@/lib/utils";

type OrdersFiltersPanelProps = {
  counts: Record<(typeof ORDER_STATUSES)[number], number>;
  totalOrders: number;
  activeStatus?: string;
  className?: string;
};

export function OrdersFiltersPanel({
  counts,
  totalOrders,
  activeStatus = "",
  className,
}: OrdersFiltersPanelProps) {
  const navigateCatalog = useAdminListNavigation();

  const navigate = (updates: { estado?: string }) => {
    const params = new URLSearchParams(window.location.search);

    if (updates.estado !== undefined) {
      if (updates.estado) params.set("estado", updates.estado);
      else params.delete("estado");
    }

    const qs = params.toString();
    navigateCatalog(qs ? `/admin/pedidos?${qs}` : "/admin/pedidos");
  };

  const hasFacetFilters = hasAdminOrderFacetFilters({
    estado: activeStatus || undefined,
  });

  return (
    <div className={cn(adminFiltersPanelScrollClass, className)}>
      <AdminCard title="Filtros" description="Estado del pedido." padding={false}>
        <AdminFilterSection title="Por estado">
          <AdminFilterButton
            active={!activeStatus}
            label="Todos"
            count={totalOrders}
            onClick={() => navigate({ estado: "" })}
          />
          {ORDER_STATUSES.map((status) => (
            <AdminFilterButton
              key={status}
              active={activeStatus === status}
              label={getOrderStatusLabel(status)}
              count={counts[status]}
              onClick={() =>
                navigate({ estado: activeStatus === status ? "" : status })
              }
            />
          ))}
        </AdminFilterSection>

        {hasFacetFilters ? (
          <AdminClearFiltersButton onClick={() => navigate({ estado: "" })} />
        ) : null}
      </AdminCard>
    </div>
  );
}
