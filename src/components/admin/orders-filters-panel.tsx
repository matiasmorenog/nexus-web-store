"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ORDER_STATUSES,
  getOrderStatusLabel,
  type OrderStatus,
} from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminClearFiltersButton,
  AdminFilterButton,
  AdminFilterSection,
  AdminSearchField,
  AdminSummaryRow,
} from "@/components/admin/admin-filters";
import { cn } from "@/lib/utils";

type OrdersFiltersPanelProps = {
  counts: Record<OrderStatus, number>;
  totalOrders: number;
  paidRevenue: number;
  className?: string;
};

export function OrdersFiltersPanel({
  counts,
  totalOrders,
  paidRevenue,
  className,
}: OrdersFiltersPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  const activeStatus = searchParams.get("estado") ?? "";

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const navigate = (updates: { q?: string; estado?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.q !== undefined) {
      const trimmed = updates.q.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
    }

    if (updates.estado !== undefined) {
      if (updates.estado) params.set("estado", updates.estado);
      else params.delete("estado");
    }

    const qs = params.toString();
    router.push(qs ? `/admin/pedidos?${qs}` : "/admin/pedidos", { scroll: false });
  };

  const hasFilters = Boolean(activeStatus || searchParams.get("q"));

  return (
    <div className={cn("space-y-4", className)}>
      <AdminCard title="Buscar" description="Nombre, email, teléfono o nº de pedido.">
        <AdminSearchField
          value={query}
          onChange={setQuery}
          onClear={() => {
            setQuery("");
            navigate({ q: "" });
          }}
          onSubmit={() => navigate({ q: query })}
          placeholder="Buscar pedidos..."
          ariaLabel="Buscar pedidos"
        />
      </AdminCard>

      <AdminCard title="Resumen" padding={false}>
        <div className="space-y-1 p-4">
          <AdminSummaryRow label="Total pedidos" value={totalOrders} />
          <AdminSummaryRow
            label="Ingresos (pagados)"
            value={formatPrice(paidRevenue)}
          />
        </div>

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

        {hasFilters ? (
          <AdminClearFiltersButton
            onClick={() => {
              setQuery("");
              navigate({ q: "", estado: "" });
            }}
          />
        ) : null}
      </AdminCard>
    </div>
  );
}
