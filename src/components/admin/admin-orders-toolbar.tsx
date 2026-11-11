"use client";

import { useState } from "react";
import { AdminSearchField } from "@/components/admin/admin-filters";
import { adminSurfaceClass } from "@/components/admin/admin-surface";
import { useAdminListNavigation } from "@/components/admin/use-admin-list-navigation";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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

  const applyFilters = () => {
    const params = readSearchParams();
    const trimmedQ = query.trim();
    if (trimmedQ) params.set("q", trimmedQ);
    else params.delete("q");

    let desde = draftDesde.trim();
    let hasta = draftHasta.trim();

    if (!desde && !hasta) {
      params.delete("desde");
      params.delete("hasta");
      params.set("todos", "1");
    } else {
      if (!desde) desde = hasta;
      if (!hasta) hasta = desde;
      if (hasta < desde) {
        [desde, hasta] = [hasta, desde];
      }
      params.set("desde", desde);
      params.set("hasta", hasta);
      params.delete("todos");
    }

    const qs = params.toString();
    navigateCatalog(qs ? `/admin/pedidos?${qs}` : "/admin/pedidos");
  };

  const clearSearch = () => {
    setQuery("");
    const params = readSearchParams();
    params.delete("q");
    const qs = params.toString();
    navigateCatalog(qs ? `/admin/pedidos?${qs}` : "/admin/pedidos");
  };

  return (
    <div
      className={cn(
        adminSurfaceClass,
        "p-4",
        className,
      )}
    >
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
      >
        <div className="min-w-0 flex-1">
          <Label
            htmlFor="admin-orders-search"
            className="mb-1.5 block text-sm text-neutral-600"
          >
            Buscar
          </Label>
          <AdminSearchField
            bare
            id="admin-orders-search"
            value={query}
            onChange={setQuery}
            onClear={clearSearch}
            placeholder="Cliente, email o nº de pedido..."
            ariaLabel="Buscar pedidos"
          />
        </div>

        <div className="min-w-0 sm:w-[16rem] sm:shrink-0">
          <Label
            htmlFor="admin-orders-date-range-toolbar"
            className="mb-1.5 block text-sm text-neutral-600"
          >
            Rango
          </Label>
          <DateRangePicker
            id="admin-orders-date-range-toolbar"
            from={draftDesde}
            to={draftHasta}
            onChange={(nextFrom, nextTo) => {
              setDraftDesde(nextFrom);
              setDraftHasta(nextTo);
            }}
            aria-label="Rango de fechas de pedidos"
          />
        </div>

        <Button
          type="submit"
          variant="secondary"
          className="h-10 shrink-0 rounded-md px-4"
        >
          Aplicar filtro
        </Button>
      </form>
    </div>
  );
}
