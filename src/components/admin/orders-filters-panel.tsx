"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { hasAdminOrderFacetFilters } from "@/lib/admin-order-filters";
import { cn } from "@/lib/utils";

type OrdersFiltersPanelProps = {
  counts: Record<(typeof ORDER_STATUSES)[number], number>;
  totalOrders: number;
  className?: string;
};

export function OrdersFiltersPanel({
  counts,
  totalOrders,
  className,
}: OrdersFiltersPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("estado") ?? "";

  const navigate = (updates: { estado?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.estado !== undefined) {
      if (updates.estado) params.set("estado", updates.estado);
      else params.delete("estado");
    }

    const qs = params.toString();
    router.push(qs ? `/admin/pedidos?${qs}` : "/admin/pedidos", {
      scroll: false,
    });
  };

  const hasFacetFilters = hasAdminOrderFacetFilters({
    estado: activeStatus || undefined,
  });

  return (
    <div className={cn(className)}>
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
