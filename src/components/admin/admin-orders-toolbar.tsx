"use client";

import { useState } from "react";
import { AdminSearchField } from "@/components/admin/admin-filters";
import { useAdminListNavigation } from "@/components/admin/use-admin-list-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AdminOrdersToolbarProps = {
  className?: string;
  query?: string;
  desde?: string;
  hasta?: string;
};

function readSearchParams() {
  return new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
}

export function AdminOrdersToolbar({
  className,
  query: queryProp = "",
  desde: desdeProp = "",
  hasta: hastaProp = "",
}: AdminOrdersToolbarProps) {
  const navigateCatalog = useAdminListNavigation();
  const [query, setQuery] = useState(queryProp);
  const [draftDesde, setDraftDesde] = useState(desdeProp);
  const [draftHasta, setDraftHasta] = useState(hastaProp);
  const [prevFilters, setPrevFilters] = useState({
    queryProp,
    desdeProp,
    hastaProp,
  });

  if (
    queryProp !== prevFilters.queryProp ||
    desdeProp !== prevFilters.desdeProp ||
    hastaProp !== prevFilters.hastaProp
  ) {
    setPrevFilters({ queryProp, desdeProp, hastaProp });
    setQuery(queryProp);
    setDraftDesde(desdeProp);
    setDraftHasta(hastaProp);
  }

  const navigate = (updates: {
    q?: string;
    desde?: string;
    hasta?: string;
  }) => {
    const params = readSearchParams();

    if (updates.q !== undefined) {
      const trimmed = updates.q.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
    }

    if (updates.desde !== undefined) {
      if (updates.desde) {
        params.set("desde", updates.desde);
        params.delete("todos");
      } else {
        params.delete("desde");
      }
    }

    if (updates.hasta !== undefined) {
      if (updates.hasta) {
        params.set("hasta", updates.hasta);
        params.delete("todos");
      } else {
        params.delete("hasta");
      }
    }

    const qs = params.toString();
    navigateCatalog(qs ? `/admin/pedidos?${qs}` : "/admin/pedidos");
  };

  const applyDateFilter = () => {
    let desde = draftDesde.trim();
    let hasta = draftHasta.trim();

    if (!desde && !hasta) {
      const params = readSearchParams();
      params.delete("desde");
      params.delete("hasta");
      params.set("todos", "1");
      const qs = params.toString();
      navigateCatalog(qs ? `/admin/pedidos?${qs}` : "/admin/pedidos?todos=1");
      return;
    }

    if (!desde) desde = hasta;
    if (!hasta) hasta = desde;

    if (hasta < desde) {
      [desde, hasta] = [hasta, desde];
    }

    navigate({ desde, hasta });
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <AdminSearchField
            value={query}
            onChange={setQuery}
            onClear={() => {
              setQuery("");
              navigate({ q: "" });
            }}
            onSubmit={() => navigate({ q: query })}
            placeholder="Buscar por cliente, email o nº de pedido..."
            ariaLabel="Buscar pedidos"
          />
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            applyDateFilter();
          }}
        >
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="admin-orders-desde-toolbar"
                className="mb-1.5 block text-sm text-neutral-600"
              >
                Desde
              </Label>
              <Input
                id="admin-orders-desde-toolbar"
                type="date"
                value={draftDesde}
                onChange={(event) => setDraftDesde(event.target.value)}
              />
            </div>
            <div>
              <Label
                htmlFor="admin-orders-hasta-toolbar"
                className="mb-1.5 block text-sm text-neutral-600"
              >
                Hasta
              </Label>
              <Input
                id="admin-orders-hasta-toolbar"
                type="date"
                value={draftHasta}
                min={draftDesde || undefined}
                onChange={(event) => setDraftHasta(event.target.value)}
              />
            </div>
          </div>
          <Button type="submit" size="sm" variant="secondary" className="sm:mb-0.5">
            Aplicar fecha
          </Button>
        </form>
      </div>
    </div>
  );
}
