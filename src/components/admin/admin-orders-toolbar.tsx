"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminSearchField } from "@/components/admin/admin-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AdminOrdersToolbar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [draftDesde, setDraftDesde] = useState(
    () => searchParams.get("desde") ?? "",
  );
  const [draftHasta, setDraftHasta] = useState(
    () => searchParams.get("hasta") ?? "",
  );

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setDraftDesde(searchParams.get("desde") ?? "");
    setDraftHasta(searchParams.get("hasta") ?? "");
  }, [searchParams]);

  const navigate = (updates: {
    q?: string;
    desde?: string;
    hasta?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.q !== undefined) {
      const trimmed = updates.q.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
    }

    if (updates.desde !== undefined) {
      if (updates.desde) params.set("desde", updates.desde);
      else params.delete("desde");
    }

    if (updates.hasta !== undefined) {
      if (updates.hasta) params.set("hasta", updates.hasta);
      else params.delete("hasta");
    }

    const qs = params.toString();
    router.push(qs ? `/admin/pedidos?${qs}` : "/admin/pedidos", {
      scroll: false,
    });
  };

  const applyDateFilter = () => {
    let desde = draftDesde.trim();
    let hasta = draftHasta.trim();

    if (!desde && !hasta) {
      navigate({ desde: "", hasta: "" });
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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="min-w-0 flex-1">
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
