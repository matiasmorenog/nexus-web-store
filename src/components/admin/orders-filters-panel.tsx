"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  ORDER_STATUSES,
  getOrderStatusLabel,
  type OrderStatus,
} from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";
import { AdminCard } from "@/components/admin/admin-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    router.push(qs ? `/admin/pedidos?${qs}` : "/admin/pedidos");
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ q: query });
  };

  const hasFilters = Boolean(activeStatus || searchParams.get("q"));

  return (
    <div className={cn("space-y-4", className)}>
      <AdminCard title="Buscar" description="Nombre, email, teléfono o nº de pedido.">
        <form onSubmit={submitSearch} className="space-y-3" role="search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="search"
              placeholder="Buscar pedidos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-8"
              aria-label="Buscar pedidos"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  navigate({ q: "" });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-700"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Resumen" padding={false}>
        <div className="space-y-1 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Total pedidos</span>
            <span className="font-semibold text-neutral-900">{totalOrders}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Ingresos (pagados)</span>
            <span className="font-semibold text-neutral-900">
              {formatPrice(paidRevenue)}
            </span>
          </div>
        </div>

        <div className="border-t border-neutral-100 px-4 py-3">
          <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-400">
            Por estado
          </Label>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => navigate({ estado: "" })}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                !activeStatus
                  ? "bg-[var(--brand-primary-soft)] font-medium text-[var(--brand-primary)]"
                  : "text-neutral-700 hover:bg-neutral-50",
              )}
            >
              <span>Todos</span>
              <span>{totalOrders}</span>
            </button>
            {ORDER_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() =>
                  navigate({ estado: activeStatus === status ? "" : status })
                }
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  activeStatus === status
                    ? "bg-[var(--brand-primary-soft)] font-medium text-[var(--brand-primary)]"
                    : "text-neutral-700 hover:bg-neutral-50",
                )}
              >
                <span>{getOrderStatusLabel(status)}</span>
                <span>{counts[status]}</span>
              </button>
            ))}
          </div>
        </div>

        {hasFilters && (
          <div className="border-t border-neutral-100 px-4 py-3">
            <button
              type="button"
              onClick={() => {
                setQuery("");
                navigate({ q: "", estado: "" });
              }}
              className="text-sm text-neutral-500 transition-colors hover:text-[var(--brand-primary)]"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
